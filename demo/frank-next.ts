// Asks a model playing the patient for his next message, from the conversation on the phone.
// Run: bun frank-next.ts [MODEL] [NOTE]   (prints JSON: {"tap": "button text"} or {"say": "text"})
// NOTE is an optional stage direction for this turn (e.g. that he has attached his portal summary).
// Needs OPENROUTER_API_KEY (from ../web/.env) and the page on the emulator (adb forward tcp:9471 ...).
import { $ } from "bun";
import path from "node:path";

const model = process.argv[2] || "openai/gpt-6.1-terra";
const note = process.argv[3] ?? "";
const env = await Bun.file(path.join(import.meta.dir, "..", "web", ".env")).text();
const apiKey = /OPENROUTER_API_KEY=(.+)/.exec(env)![1].trim();
const persona = await Bun.file(path.join(import.meta.dir, "..", "eval", "personas", "copd-frank.md")).text();
const facts = `Also true for you: your patient portal summary lists Dr. Rajiv Menon (pulmonology) with an appointment on November 20, and your primary care NP is Dana Whitcomb. You are using the Deathbot app on your phone.`;

// The conversation as saved by the app: each person message, and each reply's text and buttons.
const raw = await $`bun ${path.join(import.meta.dir, "drive.ts")} eval ${`(async()=>{const r=indexedDB.open("keyval-store");const db=await new Promise(res=>r.onsuccess=()=>res(r.result));const s=await new Promise(res=>{const q=db.transaction("keyval").objectStore("keyval").get("deathbot-conversation-v3");q.onsuccess=()=>res(q.result)});db.close();return JSON.stringify(s?.messages??[])})()`}`.text();
const messages: any[] = JSON.parse(JSON.parse(raw));
const lines: string[] = [];
let buttons: string[] = [];
for (const m of messages) {
  if (m.role === "user") {
    const parts = typeof m.content === "string" ? [m.content] : m.content.filter((p: any) => p.type === "text").map((p: any) => p.text);
    const said = parts.filter((t: string) => !t.startsWith("[Harness note") && !t.startsWith("[Attached file")).join("\n").trim();
    lines.push(`You: ${said}`);
    buttons = [];
  } else if (m.role === "assistant") {
    for (const c of m.tool_calls ?? []) {
      if (c.function.name !== "reply") continue;
      try {
        const a = JSON.parse(c.function.arguments);
        lines.push(`Deathbot: ${a.text}${a.document?.markdown ? `\n[It also shows a document: ${a.document.title}]` : ""}${a.scenes?.pictures?.some((p: any) => p.prompt) ? `\n[It also shows a picture]` : ""}${a.card ? `\n[It also shows a background write-up you can tap to read]` : ""}`);
        buttons = (a.replies ?? []).filter((x: string) => x && x.trim());
      } catch { /* unreadable reply: skip */ }
    }
  }
}
const prompt = `${persona}\n\n${facts}\n\nThe conversation so far:\n\n${lines.join("\n\n")}\n\n${buttons.length ? `Under Deathbot's last message are buttons you can tap: ${buttons.map((b) => `"${b}"`).join(", ")}.\n` : ""}${note ? `${note}\n` : ""}Write your next move as JSON and nothing else: {"tap": "<exact button text>"} to tap a button, or {"say": "<what you type or say>"}.`;
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
});
const out = String((await res.json())?.choices?.[0]?.message?.content ?? "");
const j = JSON.parse(/\{[\s\S]*\}/.exec(out)![0]);
if (j.tap && !buttons.includes(j.tap)) { j.say = j.tap; delete j.tap; }
console.log(JSON.stringify(j));
