// Agent loop over OpenRouter's Responses API (https://openrouter.ai/docs),
// straight from the browser with the person's own key. One key covers chat, web search and images.
import { buildSystemPrompt } from "./skill";
import { clientTools, runTool, type Surface } from "./tools";

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
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[]; reasoning_details?: unknown[]; _sources?: Source[]; _model?: string;
      /** The order the model produced its output in: "r:N" reasoning item N, "t" the text, "c:N" tool call N. */
      _order?: string[] }
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
      // Reasoning items belong to the model that wrote them; another model may reject them. They are sent back
      // in the order the model produced them, between the text and calls they came with: a model that ties its
      // reasoning to particular output (Gemini does) is confused by a reordered history.
      const reasoning = (k: number) => { const r = m.reasoning_details?.[k] as any; if (m._model === model && r?.type === "reasoning") out.push(r); };
      const text = () => { if (m.content) out.push({ type: "message", role: "assistant", id: `msg_${i}`, status: "completed", content: [{ type: "output_text", text: m.content, annotations: [] }] }); };
      const call = (j: number) => { const c = m.tool_calls?.[j]; if (c) out.push({ type: "function_call", id: `fc_${i}_${j}`, call_id: c.id, name: c.function.name, arguments: c.function.arguments || "{}" }); };
      const order = m._order ?? [...(m.reasoning_details ?? []).map((_, k) => `r:${k}`), "t", ...(m.tool_calls ?? []).map((_, j) => `c:${j}`)];
      for (const o of order) { const [kind, n] = o.split(":"); if (kind === "r") reasoning(Number(n)); else if (kind === "t") text(); else call(Number(n)); }
    } else {
      out.push({ type: "function_call_output", call_id: m.tool_call_id, output: typeof m.content === "string" ? m.content : m.content.map(inputPart) });
    }
  });
  return out;
}

/** The "text" value of a reply's arguments so far, decoded, from JSON that may still be arriving. */
export function partialText(args: string): string {
  const m = /"text"\s*:\s*"/.exec(args);
  if (!m) return "";
  let out = "";
  for (let i = m.index + m[0].length; i < args.length; i++) {
    const c = args[i];
    if (c === '"') break;
    if (c !== "\\") { out += c; continue; }
    const n = args[i + 1];
    if (n === undefined) break;
    if (n === "u") { if (i + 5 >= args.length) break; out += String.fromCharCode(parseInt(args.slice(i + 2, i + 6), 16)); i += 5; continue; }
    out += ({ n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" } as Record<string, string>)[n] ?? n;
    i++;
  }
  return out;
}

/** Models whose provider rejected a required tool call; asked without it from then on. */
const NO_REQUIRED_TOOL = new Set<string>();

async function streamOnce(s: Settings, messages: Msg[], h: TurnHandlers, signal: AbortSignal | undefined, system: string, mustReply = false): Promise<StreamResult> {
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
    // Deathbot speaks only through reply, so every response must call a tool: it can neither go silent
    // nor say something outside a reply. Some models refuse this setting; for them it is left out.
    // After several rounds without a reply (for example, editing notes over and over), the reply is required.
    ...(NO_REQUIRED_TOOL.has(s.model) ? {} : { tool_choice: mustReply ? { type: "function", name: "reply" } : "required" }),
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
  if (res.status === 400 && !NO_REQUIRED_TOOL.has(s.model)) {
    const detail = await res.clone().text();
    if (/tool_choice/i.test(detail)) {
      NO_REQUIRED_TOOL.add(s.model);
      return streamOnce(s, messages, h, signal, system, mustReply);
    }
  }
  if (!res.ok || !res.body) await fail(res);

  let text = "", streamed = "", finish: string | null = null;
  const calls: ToolCall[] = [];
  const reasoning: any[] = [];
  const order: string[] = [];
  const replyArgs = new Map<unknown, string>();
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
      // A reply's text arrives inside its arguments; pass it on as it streams, so the person sees it being written.
      if (e.type === "response.output_item.added" && e.item?.type === "function_call" && e.item.name === "reply") replyArgs.set(e.item.id ?? e.output_index, "");
      if (e.type === "response.function_call_arguments.delta" && replyArgs.has(e.item_id ?? e.output_index)) {
        const key = e.item_id ?? e.output_index;
        const before = partialText(replyArgs.get(key)!);
        replyArgs.set(key, replyArgs.get(key)! + e.delta);
        const after = partialText(replyArgs.get(key)!);
        if (after.length > before.length) h.onText(after.slice(before.length));
      }
      if (e.type === "response.output_item.done") {
        const item = e.item ?? {};
        if (item.type === "message") {
          if (!order.includes("t")) order.push("t");
          for (const c of item.content ?? []) {
            if (c.type === "output_text") { text += c.text ?? ""; for (const a of c.annotations ?? []) addSource(a); }
          }
        } else if (item.type === "function_call") {
          order.push(`c:${calls.length}`);
          calls.push({ id: item.call_id, type: "function", function: { name: item.name, arguments: item.arguments ?? "" } });
        } else if (item.type === "reasoning") {
          order.push(`r:${reasoning.length}`);
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
  if (reasoning.length || calls.length) message._order = order.includes("t") || !text ? order : [...order, "t"];
  return { message, finish };
}

/**
 * Runs one user turn to completion, including tool round-trips.
 * Appends to `messages` in place so the caller can persist after every step.
 */
// Tools that only change what the person sees. Once Deathbot has said something to the person as plain text
// and called only these, the turn is over: calling the model again invites it to carry on as if the person
// had replied.
const DISPLAY_TOOLS = new Set(["notes", "update_notes", "update_progress"]);

export async function runTurn(s: Settings, messages: Msg[], ui: Surface, h: TurnHandlers, signal?: AbortSignal): Promise<void> {
  const system = buildSystemPrompt({ webSearch: s.webSearch });
  let empty = 0;
  for (let round = 0; round < 12; round++) {
    h.onAssistantStart();
    let result: StreamResult;
    try {
      result = await streamOnce(s, messages, h, signal, system, round >= 6);
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
    if (!calls.length) {
      // With a tool call required, an answer with nothing in it is a slip by the service or the model.
      // Try again rather than leave the person with nothing; a plain-text answer still counts as said.
      if (message.content?.trim()) return;
      messages.pop();
      if (++empty > 2) throw new AgentError("Deathbot did not answer. Try sending your message again.", "other");
      continue;
    }

    // State first, then the reply: the reply runs last, and only if every other call in the response worked.
    // A reply sent alongside a failed edit is held back, so the model fixes its notes and then replies again.
    const ordered = [...calls.filter((c) => c.function.name !== "reply"), ...calls.filter((c) => c.function.name === "reply")];
    let failed = false;
    for (const call of ordered) {
      let content: string | Part[];
      if (call.function.name === "reply" && failed) {
        messages.push({ role: "tool", tool_call_id: call.id, content: "Error: not shown, because another call in the same response failed. Fix that first, then reply again." });
        continue;
      }
      try {
        const input = JSON.parse(call.function.arguments || "{}");
        content = await runTool(call.function.name, input, ui, { settings: s, callId: call.id, knownProgressIds: ui.progressIds(), onStatus: h.onStatus, signal });
        h.onToolUse(call.function.name, input);
      } catch (e) {
        if (signal?.aborted) throw e;
        content = `Error: ${e instanceof Error ? e.message : String(e)}`;
        failed = true;
      } finally {
        h.onStatus(null);
      }
      messages.push({ role: "tool", tool_call_id: call.id, content });
    }
    // A reply that was shown ends the turn: the person answers next. Other calls in the same response have run.
    // A reply that failed (unreadable arguments, no text) showed nothing, so the model sees the error and goes on.
    const replied = calls.some((c) => c.function.name === "reply" && !String(messages.find((m) => m.role === "tool" && m.tool_call_id === c.id)?.content ?? "").startsWith("Error:"));
    if (replied) return;
    // Spoke to the person and only updated the screen: their turn now.
    if (message.content?.trim() && calls.every((c) => DISPLAY_TOOLS.has(c.function.name))) return;
  }
  throw new AgentError("The reply took too many steps. Try sending your message again.", "other");
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
