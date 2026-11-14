// Sends the app's real request shape to one model several times, with one ingredient removed per
// variant, to find what makes a provider fail. Reads OPENROUTER_API_KEY from web/.env.
// Run: bun test/probe-model.ts [MODEL] [TRIES]
// agent.ts (imported by tools.ts) reads localStorage at load; give it an empty one.
(globalThis as any).localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
const { buildSystemPrompt } = await import("../src/skill");
const { clientTools } = await import("../src/tools");

const key = process.env.OPENROUTER_API_KEY;
if (!key) { console.error("set OPENROUTER_API_KEY (web/.env)"); process.exit(2); }
const model = process.argv[2] ?? "google/gemini-4-hydrogen";
const tries = Number(process.argv[3] ?? 4);

const history = [
  { role: "user", content: "Hi there. My daughter Lisa keeps telling me I ought to get my affairs in order. I've got COPD, I'm on oxygen, and I was in the hospital twice this year." },
  { role: "assistant", content: "I'm Deathbot, an AI. I help people work out what they'd want if they got too sick to speak for themselves. When Lisa says \"get your affairs in order,\" what is she mostly worried about?" },
  { role: "user", content: "A good day is when I get out to the garage and tinker, my own house, my own chair, I don't want to get parked in a home. My wife Marie had a stroke 4 years ago and spent 3 weeks in the ICU before she died, tubes everywhere. I don't want that." },
];
const bland = [{ role: "user", content: "I like tinkering in my garage. What should I build this weekend?" }];
const webTools = [{ type: "openrouter:web_search", parameters: { max_results: 5 } }, { type: "openrouter:web_fetch", parameters: { max_uses: 6, max_content_tokens: 30000 } }];
const system = buildSystemPrompt({ webSearch: true });

const variants: Record<string, any> = {
  "app request": { system, messages: history, tools: [...clientTools, ...webTools], reasoning: { effort: "medium" } },
  "no web tools": { system, messages: history, tools: clientTools, reasoning: { effort: "medium" } },
  "no tools": { system, messages: history, reasoning: { effort: "medium" } },
  "no reasoning setting": { system, messages: history, tools: [...clientTools, ...webTools] },
  "short system prompt": { system: "You are a helpful assistant.", messages: history, tools: [...clientTools, ...webTools], reasoning: { effort: "medium" } },
  "bland message": { system, messages: bland, tools: [...clientTools, ...webTools], reasoning: { effort: "medium" } },
};

async function once(v: any): Promise<string> {
  const body: any = { model, stream: true, max_tokens: 4000, messages: [{ role: "system", content: [{ type: "text", text: v.system, cache_control: { type: "ephemeral" } }] }, ...v.messages] };
  if (v.tools) body.tools = v.tools;
  if (v.reasoning) body.reasoning = v.reasoning;
  const t0 = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) return `${res.status} ${(await res.text()).slice(0, 90)}`;
  const text = await res.text(); // the whole stream
  const err = text.match(/"error":\{"message":"([^"]+)/);
  if (err) return `stream error: ${err[1].slice(0, 80)}`;
  return `ok ${Math.round((Date.now() - t0) / 1000)}s`;
}

if (!process.env.REPLAY && !process.env.MIDLOOP && !process.env.FAILED) for (const [name, v] of Object.entries(variants)) {
  const results: string[] = [];
  for (let i = 0; i < tries; i++) results.push(await once(v));
  const ok = results.filter((r) => r.startsWith("ok")).length;
  console.log(`${name.padEnd(22)} ${ok}/${tries} ok   ${[...new Set(results.filter((r) => !r.startsWith("ok")))].join(" | ")}`);
}

// REPLAY=messages.json (saved by test/live.ts): send that history plus one more user turn, stripping one thing per variant.
if (process.env.REPLAY) {
  const saved: any[] = JSON.parse(await Bun.file(process.env.REPLAY).text()).map(({ _sources, ...m }: any) => m);
  const next = { role: "user", content: "Yeah. That's about right. Lisa doesn't know she's on the hook yet, though. I'm doing okay today." };
  const noReasoning = saved.map((m) => (m.role === "assistant" ? { ...m, reasoning_details: undefined } : m));
  const noToolTurns = saved.filter((m) => m.role !== "tool" && !(m.role === "assistant" && m.tool_calls)).map((m) => (m.role === "assistant" ? { ...m, reasoning_details: undefined } : m));
  const noFile = saved.map((m) => (Array.isArray(m.content) ? { ...m, content: m.content.map((p: any) => p.type === "text" ? p.text : "").join("\n") } : m));
  const replays: Record<string, any[]> = { "replay as sent": saved, "replay, no reasoning blocks": noReasoning, "replay, no tool turns": noToolTurns, "replay, file as plain text": noFile };
  console.log("--- replay of", process.env.REPLAY);
  for (const [name, msgs] of Object.entries(replays)) {
    const results: string[] = [];
    for (let i = 0; i < tries; i++) results.push(await once({ system, messages: [...msgs, next], tools: [...clientTools, ...webTools], reasoning: { effort: "medium" } }));
    const ok = results.filter((r) => r.startsWith("ok")).length;
    console.log(`${name.padEnd(30)} ${ok}/${tries} ok   ${[...new Set(results.filter((r) => !r.startsWith("ok")))].join(" | ")}`);
  }
}

// MIDLOOP=messages.json: replay the request the app sends right after the model's first tool calls
// (user turn, assistant tool_calls with their reasoning block, tool results), as sent and without the reasoning.
if (process.env.MIDLOOP) {
  const saved: any[] = JSON.parse(await Bun.file(process.env.MIDLOOP).text()).map(({ _sources, ...m }: any) => m);
  const cut = saved.findIndex((m, i) => i > 0 && m.role === "assistant" && !m.tool_calls);
  const loop = saved.slice(0, cut);
  const variants2: Record<string, any[]> = { "mid-loop as sent": loop, "mid-loop, no reasoning": loop.map((m) => (m.role === "assistant" ? { ...m, reasoning_details: undefined } : m)) };
  console.log("--- mid tool loop of", process.env.MIDLOOP, `(${loop.map((m) => m.role).join(", ")})`);
  for (const [name, msgs] of Object.entries(variants2)) {
    const results: string[] = [];
    for (let i = 0; i < tries; i++) results.push(await once({ system, messages: msgs, tools: [...clientTools, ...webTools], reasoning: { effort: "medium" } }));
    const ok = results.filter((r) => r.startsWith("ok")).length;
    console.log(`${name.padEnd(30)} ${ok}/${tries} ok   ${[...new Set(results.filter((r) => !r.startsWith("ok")))].join(" | ")}`);
  }
}

// FAILED=failed-requests.json (saved by test/live.ts): resend the first failed body exactly, then variants of it.
if (process.env.FAILED) {
  const f = JSON.parse(await Bun.file(process.env.FAILED).text());
  const body = JSON.parse(f[Number(process.env.INDEX ?? 0)].body);
  const send = async (b: any) => {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(b) });
    if (!res.ok) return `${res.status}`;
    const t = await res.text();
    return /"error":\{/.test(t) ? "stream error" : "ok";
  };
  const strip = (b: any, test: (m: any, i: number) => boolean) => ({ ...b, messages: b.messages.map((m: any, i: number) => (m.role === "assistant" && test(m, i) ? { ...m, reasoning_details: undefined } : m)) });
  const firstAssistant = body.messages.findIndex((m: any) => m.role === "assistant");
  const lastAssistant = body.messages.map((m: any) => m.role).lastIndexOf("assistant");
  const variants3: Record<string, any> = {
    "exact failed body": body,
    "no reasoning blocks at all": strip(body, () => true),
    "keep only last reasoning": strip(body, (_m, i) => i !== lastAssistant),
    "keep only first reasoning": strip(body, (_m, i) => i !== firstAssistant),
    "max_tokens 4000": { ...body, max_tokens: 4000 },
    "max_tokens 8000": { ...body, max_tokens: 8000 },
    "no web tools": { ...body, tools: body.tools.filter((t: any) => t.type === "function") },
    "no tool turns in history": { ...body, messages: body.messages.filter((m: any) => m.role !== "tool" && !(m.role === "assistant" && m.tool_calls)) },
    "web_search only": { ...body, tools: body.tools.filter((t: any) => t.type !== "openrouter:web_fetch") },
    "web_fetch only": { ...body, tools: body.tools.filter((t: any) => t.type !== "openrouter:web_search") },
    "reasoning effort low": { ...body, reasoning: { effort: "low" } },
  };
  for (const [name, b] of Object.entries(variants3)) {
    const r: string[] = [];
    for (let i = 0; i < tries; i++) r.push(await send(b));
    console.log(`${name.padEnd(28)} ${r.filter((x) => x === "ok").length}/${tries} ok   ${r.join(" ")}`);
  }
}
