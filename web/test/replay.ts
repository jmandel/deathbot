// Replays a saved conversation's last turn many times against a model, through the app's own turn loop
// (same system prompt, tools and request shape), and saves every raw response.
// Run: bun run build.ts && bun test/replay.ts STATE.json UPTO MODEL N OUTDIR
//   STATE.json  the conversation as saved by the app; messages[0..UPTO] are sent (UPTO is the person's message)
// Needs OPENROUTER_API_KEY (web/.env is read by bun).
import path from "node:path";
import { mkdir } from "node:fs/promises";

const [statePath, upto, model, nStr, outDir] = process.argv.slice(2);
(globalThis as any).localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { runTurn } = await import("../src/agent");

const state = await Bun.file(statePath).json();
const base = state.messages.slice(0, Number(upto) + 1);
const apiKey = process.env.OPENROUTER_API_KEY!;
const N = Number(nStr);
await mkdir(outDir, { recursive: true });

async function one(i: number) {
  const messages = structuredClone(base);
  const rounds: { text: string; tools: string[] }[] = [];
  // The notes file as it stood: the latest one sent to the model in the conversation so far.
  let doc = "";
  for (const m of base) if (m.role === "user" && Array.isArray(m.content)) for (const p of m.content) if (p.type === "text" && p.text.startsWith("[Harness note: your working notes")) doc = p.text.slice(p.text.indexOf("\n") + 1).replace(/\]$/, "");
  const ui = {
    getNotesFile: () => doc, setNotesFile(d: string) { doc = d; },
    setNotes() {}, progressIds: () => Object.keys(state.progress ?? {}), setProgress() {},
    showScenes() {}, getPhoto: () => null, getRecords: () => null, getFiles: () => [],
  };
  const t0 = Date.now();
  let error: string | null = null;
  try {
    await runTurn({ apiKey, model, imageModel: "none", webSearch: false }, messages, ui as any, {
      onAssistantStart() { rounds.push({ text: "", tools: [] }); },
      onText(d) { rounds[rounds.length - 1].text += d; },
      onToolUse(name) { rounds[rounds.length - 1].tools.push(name); },
      onStatus() {},
    });
  } catch (e) { error = String(e); }
  const added = messages.slice(base.length);
  await Bun.write(path.join(outDir, `${String(i).padStart(2, "0")}.json`), JSON.stringify({ model, ms: Date.now() - t0, error, rounds, added }, null, 1));
  const text = rounds.map((r) => r.text).filter(Boolean).join("\n\n[next round]\n\n");
  console.log(`--- ${i} (${Math.round((Date.now() - t0) / 1000)}s)${error ? " ERROR " + error : ""} tools: ${rounds.map((r) => r.tools.join("+") || "-").join(" | ")}\n${text}\n`);
}

const queue = Array.from({ length: N }, (_, i) => i);
await Promise.all(Array.from({ length: 5 }, async () => { while (queue.length) await one(queue.shift()!); }));
