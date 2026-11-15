// A whole conversation with a simulated person: Deathbot runs through the app's own turn loop (same system
// prompt, tools and request shape), and the person is played by another model from a persona file.
// Run: bun run build.ts && bun test/simulate.ts PERSONA.md OUTDIR [--model M] [--patient M] [--turns N] [--state XX]
// Needs OPENROUTER_API_KEY (web/.env is read by bun). Pictures are not drawn: the image request gets a stand-in.
import path from "node:path";
import { mkdir } from "node:fs/promises";

const args = process.argv.slice(2);
const opt = (name: string, d: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : d; };
const [personaPath, outDir] = args;
const model = opt("model", "google/gemini-4-hydrogen");
const patientModel = opt("patient", "google/gemini-4-argon");
const maxTurns = Number(opt("turns", "18"));
const stateCode = opt("state", "");

(globalThis as any).localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
// The image endpoint gets a one-pixel stand-in, so a picture "is shown" without spending on image generation.
const realFetch = globalThis.fetch;
const PIXEL = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
globalThis.fetch = (async (url: any, init?: any) => {
  if (String(url).includes("/images")) return Response.json({ data: [{ b64_json: PIXEL, media_type: "image/png" }] });
  return realFetch(url, init);
}) as typeof fetch;
const { runTurn } = await import("../src/agent");

const apiKey = process.env.OPENROUTER_API_KEY!;
const persona = await Bun.file(personaPath).text();
await mkdir(outDir, { recursive: true });

type Said = { text: string; replies: string[]; shown: string[] };
function lastReply(added: any[]): Said {
  const out: Said = { text: "", replies: [], shown: [] };
  for (const m of added) {
    if (m.role !== "assistant") continue;
    if (m.content) out.text += (out.text ? "\n\n" : "") + m.content;
    for (const c of m.tool_calls ?? []) {
      if (c.function.name !== "reply") continue;
      const a = JSON.parse(c.function.arguments || "{}");
      out.text += (out.text ? "\n\n" : "") + (a.text ?? "");
      out.replies = a.replies ?? [];
      for (const k of ["card", "video", "document", "scenes", "health_records"]) if (a[k] !== undefined) out.shown.push(k === "document" ? `document: ${a.document?.title}` : k === "scenes" ? `pictures: ${(a.scenes?.pictures ?? []).map((p: any) => p.title).join("; ")}` : k);
    }
  }
  return out;
}

async function patientSays(history: { who: string; text: string }[]): Promise<string> {
  const transcript = history.map((h) => `${h.who}: ${h.text}`).join("\n\n");
  const res = await realFetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: patientModel, max_tokens: 4000, reasoning: { effort: "low" }, messages: [
      { role: "system", content: `${persona}\n\nYou are typing in a chat app on your phone. Deathbot's replies may end with buttons; you can tap one (write its exact text) or type your own words. Reply with only what you type, nothing else.` },
      { role: "user", content: `The conversation so far:\n\n${transcript}\n\nWrite your next message.` },
    ] }),
  });
  const j: any = await res.json();
  return String(j?.choices?.[0]?.message?.content ?? "").trim();
}

const messages: any[] = [];
const history: { who: string; text: string }[] = [];
const log: any[] = [];
const ui = { setNotes() {}, progressIds: () => [], setProgress() {}, showScenes() {}, getPhoto: () => null, getRecords: () => null, getFiles: () => [] };
const opener = await patientSays([{ who: "Deathbot (welcome screen)", text: "I'm an AI. I can explain what treatments like CPR and breathing machines are really like, help you work out what you'd want, and write it down for whoever would speak for you. What brought you here?" }]);
let said = opener;
for (let turn = 0; turn < maxTurns; turn++) {
  const notes = turn === 0 ? [`[Harness note: for the person it is now Sunday, November 15, 2026, 2:00 PM.]`, ...(stateCode ? [`[Harness note: the person chose their state on the first screen. Its forms and signing rules are in states/${stateCode}.md.]`] : [])] : [];
  messages.push({ role: "user", content: notes.length ? [...notes.map((t) => ({ type: "text", text: t })), { type: "text", text: said }] : said });
  history.push({ who: "Person", text: said });
  const before = messages.length;
  const t0 = Date.now();
  try {
    await runTurn({ apiKey, model, imageModel: "stand-in", webSearch: false }, messages, ui as any, { onAssistantStart() {}, onText() {}, onToolUse() {}, onStatus() {} });
  } catch (e) { log.push({ turn, error: String(e) }); break; }
  const r = lastReply(messages.slice(before));
  log.push({ turn, person: said, deathbot: r.text, replies: r.replies, shown: r.shown, ms: Date.now() - t0 });
  history.push({ who: "Deathbot", text: r.text + (r.shown.length ? `\n[shown: ${r.shown.join(", ")}]` : "") + (r.replies.length ? `\n[buttons: ${r.replies.join(" | ")}]` : "") });
  console.log(`--- ${turn}\nPERSON: ${said}\nDEATHBOT: ${r.text}${r.replies.length ? `\n[buttons: ${r.replies.join(" | ")}]` : ""}${r.shown.length ? `\n[shown: ${r.shown.join(", ")}]` : ""}\n`);
  said = await patientSays(history);
  if (!said || said.includes("[END]")) { if (said) log.push({ turn: turn + 1, person: said.replace("[END]", "").trim(), end: true }); break; }
}
await Bun.write(path.join(outDir, "conversation.json"), JSON.stringify({ model, patientModel, persona: personaPath, log, messages }, null, 1));
