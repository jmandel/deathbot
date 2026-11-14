// Agent loop over OpenRouter's Responses API (https://openrouter.ai/docs; the bookkeeping pass below uses Chat Completions),
// straight from the browser with the person's own key. One key covers chat, web search and images.
import { buildSystemPrompt, skillSection, areas } from "./skill";
import { clientTools, runTool, type Surface, type ProgressUpdate } from "./tools";

// Tests point this at a local stand-in by setting a localStorage entry. It is deliberately not
// settable from the URL, so a link can never redirect someone's key to another server.
const API = localStorage.getItem("deathbot-api-base") ?? "https://openrouter.ai/api/v1";

export interface ToolCall { id: string; type: "function"; function: { name: string; arguments: string } }
export interface Source { url: string; title?: string }
export type Part =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };
export type Msg =
  | { role: "user"; content: string | Part[] }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[]; reasoning_details?: unknown[]; _sources?: Source[]; _model?: string }
  | { role: "tool"; tool_call_id: string; content: string | Part[] };

export const CHAT_MODELS: { id: string; label: string }[] = [
  { id: "google/gemini-4-hydrogen", label: "Gemini 4 Hydrogen (recommended)" },
  { id: "anthropic/claude-opus-5.5", label: "Claude Opus 5.5" },
  { id: "anthropic/claude-sonnet-5.5", label: "Claude Sonnet 5.5 (faster, cheaper)" },
  { id: "anthropic/claude-fable-5.2", label: "Claude Fable 5.2 (most capable, slowest)" },
  { id: "openai/gpt-6-astra", label: "GPT-6 Astra" },
  { id: "google/gemini-3.8-flash", label: "Gemini 3.8 Flash (cheapest)" },
];
export const IMAGE_MODELS: { id: string; label: string }[] = [
  { id: "openai/gpt-image-2", label: "GPT Image 2" },
  { id: "google/gemini-nano-banana-2.1", label: "Gemini Nano Banana 2.1" },
  { id: "bytedance-seed/seedream-5-5", label: "Seedream 5.5" },
];
export const DEFAULT_MODEL = CHAT_MODELS[0].id;
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0].id;

export interface Settings { apiKey: string; model: string; imageModel: string; webSearch: boolean }

export class AgentError extends Error {
  constructor(message: string, readonly kind: "auth" | "credits" | "rate" | "overloaded" | "network" | "other") {
    super(message);
  }
}

function headers(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Title": "Deathbot" };
}

async function fail(res: Response): Promise<never> {
  let detail = "";
  try { detail = (await res.json())?.error?.message ?? ""; } catch { /* body was not JSON */ }
  if (res.status === 401 || res.status === 403) throw new AgentError("That key was not accepted.", "auth");
  if (res.status === 402) throw new AgentError("The key has run out of credit.", "credits");
  if (res.status === 429) throw new AgentError("The AI service is too busy right now.", "rate");
  if (res.status >= 500) throw new AgentError("The AI service is not answering right now.", "overloaded");
  throw new AgentError(detail || `Request failed (${res.status}).`, "other");
}

export interface TurnHandlers {
  onAssistantStart(): void;
  onText(delta: string): void;
  onToolUse(name: string, input: unknown): void;
  /** A slow tool (image generation) has started or finished. */
  onStatus(text: string | null): void;
}


interface StreamResult { message: Extract<Msg, { role: "assistant" }>; finish: string | null }

// Conversations are kept in the chat-completions shape (role, content, tool_calls, tool messages) that the
// page stores and draws; each request translates them to the Responses API's input items, which OpenRouter
// handles more reliably for some models (Gemini 4 Hydrogen failed on chat completions with web tools).
function inputPart(p: Part): unknown {
  if (p.type === "text") return { type: "input_text", text: p.text };
  if (p.type === "image_url") return { type: "input_image", image_url: p.image_url.url, detail: "auto" };
  return { type: "input_file", filename: p.file.filename, file_data: p.file.file_data };
}
function toInput(messages: Msg[], model: string): unknown[] {
  const out: unknown[] = [];
  messages.forEach((m, i) => {
    if (m.role === "user") {
      out.push({ type: "message", role: "user", content: typeof m.content === "string" ? [{ type: "input_text", text: m.content }] : m.content.map(inputPart) });
    } else if (m.role === "assistant") {
      // Reasoning items belong to the model that wrote them; another model may reject them.
      if (m._model === model) for (const r of m.reasoning_details ?? []) if ((r as any)?.type === "reasoning") out.push(r);
      if (m.content) out.push({ type: "message", role: "assistant", id: `msg_${i}`, status: "completed", content: [{ type: "output_text", text: m.content, annotations: [] }] });
      (m.tool_calls ?? []).forEach((c, j) => out.push({ type: "function_call", id: `fc_${i}_${j}`, call_id: c.id, name: c.function.name, arguments: c.function.arguments || "{}" }));
    } else {
      out.push({ type: "function_call_output", call_id: m.tool_call_id, output: typeof m.content === "string" ? m.content : m.content.map(inputPart) });
    }
  });
  return out;
}

async function streamOnce(s: Settings, messages: Msg[], h: TurnHandlers, signal: AbortSignal | undefined, system: string): Promise<StreamResult> {
  const claude = s.model.startsWith("anthropic/");
  const tools: unknown[] = clientTools.map((t) => ({ type: "function", name: t.function.name, description: t.function.description, parameters: t.function.parameters }));
  // Search returns excerpts; fetch lets the model open the page itself, which the skill's research rules require.
  if (s.webSearch) tools.push({ type: "openrouter:web_search", parameters: { max_results: 5 } }, { type: "openrouter:web_fetch", parameters: { max_uses: 6, max_content_tokens: 30000 } });
  const body = {
    model: s.model,
    stream: true,
    max_output_tokens: 16000,
    // The system prompt is byte-stable for a build, so it stays a cacheable prefix.
    instructions: system,
    input: toInput(messages, s.model),
    tools,
    reasoning: { effort: "medium" },
    // Claude also supports a moving cache breakpoint over the growing conversation.
    ...(claude ? { cache_control: { type: "ephemeral" } } : {}),
  };
  // The service has brief hiccups (502s, rate limits). Nothing has been shown yet at this point, so it
  // is safe to try again a few times, saying so on screen, before handing the choice to the person.
  const TRIES = 4;
  let res!: Response;
  for (let attempt = 1; ; attempt++) {
    let failed: string | null = null;
    try {
      res = await fetch(`${API}/responses`, { method: "POST", headers: headers(s.apiKey), body: JSON.stringify(body), signal });
      if (res.status >= 500 || res.status === 429) failed = res.status === 429 ? "The AI service is busy." : "The AI service had a problem.";
    } catch (e) {
      if (signal?.aborted) throw e;
      failed = "Could not reach the AI service.";
      if (attempt >= TRIES) throw new AgentError(`${failed} Check your connection.`, "network");
    }
    if (!failed || attempt >= TRIES) break;
    h.onStatus(`${failed} Trying again (${attempt + 1} of ${TRIES})`);
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, 1500 * attempt);
      signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
    });
    h.onStatus(null);
  }
  if (!res.ok || !res.body) await fail(res);

  let text = "", streamed = "", finish: string | null = null;
  const calls: ToolCall[] = [];
  const reasoning: any[] = [];
  const sources: Source[] = [];
  const addSource = (a: any) => {
    const url = a?.url ?? a?.url_citation?.url, title = a?.title ?? a?.url_citation?.title;
    if (a?.type === "url_citation" && url && !sources.some((x) => x.url === url)) sources.push({ url, title });
  };
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue; // event names, blank lines and keep-alives
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      let e: any;
      try { e = JSON.parse(data); } catch { continue; }
      if (e.type === "error" || e.type === "response.failed" || (e.error && !e.type)) {
        const msg = e.message ?? e.error?.message ?? e.response?.error?.message;
        throw new AgentError(msg ?? "The AI service returned an error.", "other");
      }
      if (e.type === "response.output_text.delta" && typeof e.delta === "string") { streamed += e.delta; h.onText(e.delta); }
      if (e.type === "response.output_item.done") {
        const item = e.item ?? {};
        if (item.type === "message") {
          for (const c of item.content ?? []) {
            if (c.type === "output_text") { text += c.text ?? ""; for (const a of c.annotations ?? []) addSource(a); }
          }
        } else if (item.type === "function_call") {
          calls.push({ id: item.call_id, type: "function", function: { name: item.name, arguments: item.arguments ?? "" } });
        } else if (item.type === "reasoning") {
          reasoning.push(item);
        }
      }
      if (e.type === "response.completed" || e.type === "response.incomplete") {
        const r = e.response ?? {};
        finish = r.status === "incomplete" && r.incomplete_details?.reason === "max_output_tokens" ? "length" : calls.length ? "tool_calls" : "stop";
      }
    }
  }
  if (!text && streamed) text = streamed; // a stream that ended without its completed message item
  const message: StreamResult["message"] = { role: "assistant", content: text || null };
  if (calls.length) message.tool_calls = calls;
  if (reasoning.length) { message.reasoning_details = reasoning; message._model = s.model; }
  if (sources.length) message._sources = sources;
  return { message, finish };
}

/**
 * Runs one user turn to completion, including tool round-trips.
 * Appends to `messages` in place so the caller can persist after every step.
 */
export async function runTurn(s: Settings, messages: Msg[], ui: Surface, h: TurnHandlers, signal?: AbortSignal): Promise<void> {
  const system = buildSystemPrompt({ webSearch: s.webSearch });
  for (let round = 0; round < 12; round++) {
    h.onAssistantStart();
    let result: StreamResult;
    try {
      result = await streamOnce(s, messages, h, signal, system);
    } catch (e) {
      // If replayed reasoning blocks are rejected mid tool loop, retry once without them.
      const last = messages[messages.length - 1];
      if (!(e instanceof AgentError) || e.kind !== "other" || last?.role !== "tool") throw e;
      const stripped = messages.map((m) => (m.role === "assistant" ? { ...m, reasoning_details: undefined } : m)) as Msg[];
      h.onAssistantStart();
      result = await streamOnce(s, stripped, h, signal, system);
    }
    const { message, finish } = result;
    const calls = message.tool_calls ?? [];
    if (finish === "length" && calls.length) {
      throw new AgentError("The reply was cut off. Try sending your message again.", "other");
    }
    messages.push(message);
    if (!calls.length) return;

    for (const call of calls) {
      let content: string | Part[];
      try {
        const input = JSON.parse(call.function.arguments || "{}");
        content = await runTool(call.function.name, input, ui, { settings: s, callId: call.id, knownProgressIds: ui.progressIds(), onStatus: h.onStatus, signal });
        h.onToolUse(call.function.name, input);
      } catch (e) {
        if (signal?.aborted) throw e;
        content = `Error: ${e instanceof Error ? e.message : String(e)}`;
      } finally {
        h.onStatus(null);
      }
      messages.push({ role: "tool", tool_call_id: call.id, content });
    }
  }
  throw new AgentError("The reply took too many steps. Try sending your message again.", "other");
}

// ---------- the scribe ----------
// The talking model is asked to keep the map and the notes current, and often does. When it does not,
// a second, quiet pass reads the latest exchange and brings them up to date, so what the person sees
// under Your file never depends on the talking model remembering its bookkeeping. The rules it works to
// are the skill's own, quoted from the conversation guide.

export interface ScribeResult { items: ProgressUpdate[]; next: string[]; notes?: string }

function plainText(m: Msg): string {
  if (m.role === "tool") return "";
  if (typeof m.content === "string" || m.content === null) return (m.content ?? "").replace(/<replies>[\s\S]*?(<\/replies>|$)/i, "").trim();
  return m.content.flatMap((p) => (p.type === "text" ? [p.text.slice(0, 1500)] : p.type === "file" ? [`[attached ${p.file.filename}]`] : ["[attached a picture]"])).join("\n");
}

export async function scribe(
  s: Settings, messages: Msg[], current: { progress: Record<string, { status: string; summary?: string; title?: string }>; next: string[]; notes: string },
  want: { map: boolean; notes: boolean }, signal?: AbortSignal,
): Promise<ScribeResult | null> {
  const recent = messages.filter((m) => m.role !== "tool").slice(-6).map((m) => `${m.role === "user" ? "PERSON" : "DEATHBOT"}: ${plainText(m)}`).filter((l) => l.length > 12).join("\n\n");
  const system = [
    "You keep the records for a conversation between a person and Deathbot, an AI that helps people think through end-of-life care. You do not talk to the person. You read the latest part of the conversation and bring the records up to date. Work to these rules from Deathbot's own guide:",
    skillSection("guide/conversation.md", "Keeping a map the person can see"),
    skillSection("guide/conversation.md", "Working notes"),
    `The standard areas of the map:\n${areas.map((a) => `- ${a.id}: ${a.title}${a.optional ? " (optional)" : ""}. ${a.covers ?? ""}`).join("\n")}`,
    `Reply with one JSON object and nothing else: {"items":[{"id":"...","status":"open|started|done|set_aside","summary":"one short line","title":"only for a new item of your own"}],"next":["up to two ids"]${want.notes ? ',"notes":"the full working notes as markdown"' : ""}}. In "items" include only what should change; an empty list is fine. Record only what the person said or what happened; never infer a preference they did not state.${want.notes ? "" : " Do not include notes."}`,
  ].join("\n\n");
  const user = `The map now:\n${JSON.stringify({ items: current.progress, next: current.next })}\n\n${want.notes ? `The working notes now:\n${current.notes || "(none yet)"}\n\n` : ""}The latest part of the conversation:\n\n${recent}`;
  const res = await fetch(`${API}/chat/completions`, {
    method: "POST", headers: headers(s.apiKey), signal,
    body: JSON.stringify({ model: s.model, max_tokens: 2000, reasoning: { effort: "low" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
  });
  if (!res.ok) return null;
  const text: string = (await res.json())?.choices?.[0]?.message?.content ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    const statuses = ["open", "started", "done", "set_aside"];
    const items: ProgressUpdate[] = (Array.isArray(j.items) ? j.items : [])
      .filter((it: any) => it && typeof it.id === "string" && statuses.includes(it.status))
      .filter((it: any) => areas.some((a) => a.id === it.id) || current.progress[it.id] || typeof it.title === "string")
      .map((it: any) => ({ id: it.id, status: it.status, summary: typeof it.summary === "string" ? it.summary : undefined, title: typeof it.title === "string" ? it.title : undefined }));
    return {
      items,
      next: (Array.isArray(j.next) ? j.next : current.next).filter((x: unknown): x is string => typeof x === "string").slice(0, 2),
      notes: want.notes && typeof j.notes === "string" && j.notes.trim() ? j.notes : undefined,
    };
  } catch { return null; }
}

// ---------- images ----------

export interface GeneratedImage { dataUrl: string }

/** One image from OpenRouter's Image API. `reference` is a data URL of the person's photo, if they gave one. */
export async function generateImage(s: Settings, prompt: string, reference: string | null, signal?: AbortSignal): Promise<GeneratedImage> {
  const body: Record<string, unknown> = { model: s.imageModel, prompt, aspect_ratio: "3:2" };
  if (reference) body.input_references = [{ type: "image_url", image_url: { url: reference } }];
  let res: Response;
  try {
    const limit = AbortSignal.timeout(120_000);
    res = await fetch(`${API}/images`, { method: "POST", headers: headers(s.apiKey), body: JSON.stringify(body), signal: signal ? AbortSignal.any([signal, limit]) : limit });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new AgentError("The image service did not answer in time.", "network");
  }
  if (!res.ok) await fail(res);
  const json = await res.json();
  const img = json?.data?.[0];
  if (!img?.b64_json) throw new AgentError("The image service returned no image.", "other");
  return { dataUrl: `data:${img.media_type ?? "image/png"};base64,${img.b64_json}` };
}

// ---------- sign in with OpenRouter (PKCE) ----------
// Lets someone without a key create one from their own OpenRouter account, with no server of ours involved.

const b64url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function beginSignIn(): Promise<void> {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  sessionStorage.setItem("deathbot-pkce", verifier);
  const callback = location.origin + location.pathname;
  location.href = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callback)}&code_challenge=${challenge}&code_challenge_method=S256&key_label=Deathbot`;
}

/** If we have just come back from OpenRouter with ?code=, exchange it for a key. */
export async function completeSignIn(): Promise<string | null> {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const verifier = sessionStorage.getItem("deathbot-pkce");
  if (!code || !verifier) return null;
  sessionStorage.removeItem("deathbot-pkce");
  history.replaceState(null, "", location.pathname + location.hash);
  const res = await fetch(`${API}/auth/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: "S256" }),
  });
  if (!res.ok) return null;
  return (await res.json())?.key ?? null;
}
