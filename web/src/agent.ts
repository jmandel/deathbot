// Agent loop over OpenRouter's Chat Completions API (https://openrouter.ai/docs), called
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
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[]; reasoning_details?: unknown[]; _sources?: Source[] }
  | { role: "tool"; tool_call_id: string; content: string };

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

// Reasoning blocks arrive in pieces while streaming and must be sent back whole on the next
// request of a tool loop, or models that think between tool calls lose (or reject) the thread.
function mergeReasoning(acc: any[], chunks: any[]) {
  for (const c of chunks) {
    const prev = acc.find((a) => a.index === c.index && a.type === c.type);
    if (!prev) { acc.push({ ...c }); continue; }
    for (const [k, v] of Object.entries(c)) {
      if ((k === "text" || k === "summary" || k === "data") && typeof v === "string") {
        prev[k] = (prev[k] ?? "") + v;
      } else if (v !== null && v !== undefined) {
        prev[k] = v;
      }
    }
  }
}

interface StreamResult { message: Extract<Msg, { role: "assistant" }>; finish: string | null }

async function streamOnce(s: Settings, messages: Msg[], h: TurnHandlers, signal: AbortSignal | undefined, system: string): Promise<StreamResult> {
  const claude = s.model.startsWith("anthropic/");
  const tools: unknown[] = [...clientTools];
  // Search returns excerpts; fetch lets the model open the page itself, which the skill's research rules require.
  if (s.webSearch) tools.push({ type: "openrouter:web_search", parameters: { max_results: 5 } }, { type: "openrouter:web_fetch", parameters: { max_uses: 6, max_content_tokens: 30000 } });
  const body = {
    model: s.model,
    stream: true,
    max_tokens: 16000,
    messages: [
      // The system prompt is byte-stable for a build, so mark it as a cacheable prefix.
      { role: "system", content: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }] },
      ...messages.map(({ _sources, ...m }: any) => m),
    ],
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
      res = await fetch(`${API}/chat/completions`, { method: "POST", headers: headers(s.apiKey), body: JSON.stringify(body), signal });
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

  let text = "", finish: string | null = null;
  const calls: ToolCall[] = [];
  const reasoning: any[] = [];
  const sources: Source[] = [];
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
      if (!line.startsWith("data:")) continue; // blank lines and ": OPENROUTER PROCESSING" keep-alives
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      let chunk: any;
      try { chunk = JSON.parse(data); } catch { continue; }
      if (chunk.error) throw new AgentError(chunk.error.message ?? "The AI service returned an error.", "other");
      const choice = chunk.choices?.[0];
      if (!choice) continue;
      const d = choice.delta ?? {};
      if (typeof d.content === "string" && d.content) { text += d.content; h.onText(d.content); }
      for (const tc of d.tool_calls ?? []) {
        const i = tc.index ?? 0;
        calls[i] ??= { id: "", type: "function", function: { name: "", arguments: "" } };
        if (tc.id) calls[i].id = tc.id;
        if (tc.function?.name) calls[i].function.name += tc.function.name;
        if (tc.function?.arguments) calls[i].function.arguments += tc.function.arguments;
      }
      if (Array.isArray(d.reasoning_details)) mergeReasoning(reasoning, d.reasoning_details);
      for (const a of d.annotations ?? []) {
        const u = a?.url_citation?.url;
        if (a?.type === "url_citation" && u && !sources.some((x) => x.url === u)) sources.push({ url: u, title: a.url_citation.title });
      }
      if (choice.finish_reason) finish = choice.finish_reason;
    }
  }
  const message: StreamResult["message"] = { role: "assistant", content: text || null };
  const real = calls.filter((c) => c && c.function.name);
  if (real.length) message.tool_calls = real;
  if (reasoning.length) message.reasoning_details = reasoning;
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
      let content: string;
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
