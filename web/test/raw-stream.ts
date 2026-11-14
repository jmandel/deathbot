// Dumps what a streamed reply contains besides text: annotations, tool calls, usage and any other fields.
// Reads OPENROUTER_API_KEY from web/.env. Run: bun test/raw-stream.ts MODEL (QUESTION | FAILED_JSON) OUT_FILE
(globalThis as any).localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
const { buildSystemPrompt } = await import("../src/skill");
const { clientTools } = await import("../src/tools");
const [model, input, out] = process.argv.slice(2);
let body: any;
if (input.endsWith(".json")) {
  body = JSON.parse(JSON.parse(await Bun.file(input).text())[0].body);
  body.model = model;
} else {
  body = { model, stream: true, max_tokens: 8000, reasoning: { effort: "medium" },
    messages: [{ role: "system", content: buildSystemPrompt({ webSearch: true }) }, { role: "user", content: input }],
    tools: [...clientTools, { type: "openrouter:web_search", parameters: { max_results: 5 } }, { type: "openrouter:web_fetch", parameters: { max_uses: 6, max_content_tokens: 30000 } }] };
}
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
const raw = await res.text();
await Bun.write(out, raw);
console.log("HTTP", res.status, raw.length, "bytes");
const seen = new Map<string, number>();
for (const line of raw.split("\n")) {
  if (!line.startsWith("data:")) { if (line.trim() && !line.startsWith(":")) console.log("non-data:", line.slice(0, 200)); continue; }
  const d = line.slice(5).trim();
  if (d === "[DONE]") continue;
  let c: any; try { c = JSON.parse(d); } catch { continue; }
  if (c.error) console.log("ERROR:", JSON.stringify(c.error).slice(0, 300));
  if (c.usage) console.log("usage:", JSON.stringify(c.usage).slice(0, 500));
  const delta = c.choices?.[0]?.delta ?? {};
  for (const k of Object.keys(delta)) seen.set(k, (seen.get(k) ?? 0) + 1);
  for (const a of delta.annotations ?? []) console.log("annotation:", JSON.stringify(a).slice(0, 200));
  for (const t of delta.tool_calls ?? []) if (t.function?.name) console.log("tool call:", t.function.name);
  for (const k of Object.keys(c)) if (!["id", "object", "created", "model", "provider", "choices", "system_fingerprint", "usage", "error", "service_tier"].includes(k)) console.log("other top-level field:", k, JSON.stringify(c[k]).slice(0, 200));
}
console.log("delta fields seen:", JSON.stringify(Object.fromEntries(seen)));
