// Asks the model playing the patient how he fills in the first screen. Prints JSON {name, state, topics[], other}.
import path from "node:path";
const model = process.argv[2] || "openai/gpt-6.1-terra";
const env = await Bun.file(path.join(import.meta.dir, "..", "web", ".env")).text();
const apiKey = /OPENROUTER_API_KEY=(.+)/.exec(env)![1].trim();
const persona = await Bun.file(path.join(import.meta.dir, "..", "eval", "personas", "copd-frank.md")).text();
const topics = ["Understand what treatments like CPR, breathing machines and feeding tubes are really like", "Work out what I'd want if I couldn't speak for myself", "Choose or prepare the person who would speak for me", "Get help with a form (health care proxy, living will or POLST)", "Talk about living with a serious illness", "Help or make decisions for someone else", "Talk about someone who died", "Just see what this is"];
const prompt = `${persona}\n\nYou open the Deathbot app on your phone. Its first screen says: "I'm an AI. I can explain what treatments like CPR and breathing machines are really like, help you work out what you'd want, and write it down for whoever would speak for you." It has optional fields: "What should I call you?", "Which state do you live in?" (a list of US states), checkboxes for "What would you like to do today?":\n${topics.map((t, i) => `${i}. ${t}`).join("\n")}\nand "Anything else on your mind?" (optional).\n\nFill it in as you would. Reply with JSON only: {"name": "...", "state": "two-letter code or empty", "topics": [indexes], "other": "... or empty"}.`;
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "user", content: prompt }] }) });
const out = String((await res.json())?.choices?.[0]?.message?.content ?? "");
const j = JSON.parse(/\{[\s\S]*\}/.exec(out)![0]);
console.log(JSON.stringify({ ...j, topicLabels: (j.topics ?? []).map((i: number) => topics[i]) }));
