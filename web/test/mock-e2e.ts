// End-to-end check of the web app against a local stand-in for OpenRouter.
// Serves dist/, fakes /api/v1/responses (streamed, with tool calls), /api/v1/chat/completions (the
// bookkeeping pass) and /api/v1/images,
// drives headless Chromium over the DevTools protocol, and asserts on what ends up on the page.
// Run: bun run build && bun test/mock-e2e.ts [screenshot.png]
import path from "node:path";
import { launch } from "./browser";

const dist = path.join(import.meta.dir, "..", "dist");
const PORT = 4175;
const requests: any[] = [];
const scribeRequests: any[] = [];
let failedOnce = false;
let outage = 4;
// 1x1 PNG
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// The scripted replies below are written as chat-completions chunks, which are easy to read; sse() turns them
// into the Responses API events the app now consumes. fromResponses() turns the app's Responses request back
// into the chat shape, so the checks can read it the same way.
function sse(chunks: any[]): Response {
  const ev: any[] = [{ type: "response.created", response: { status: "in_progress" } }];
  let text = "";
  const calls: { id: string; name: string; args: string }[] = [];
  const thought: string[] = [];
  let signature = "";
  const annotations: any[] = [];
  for (const c of chunks) {
    const d = c.choices?.[0]?.delta ?? {};
    if (d.content) { text += d.content; ev.push({ type: "response.output_text.delta", delta: d.content }); }
    for (const tc of d.tool_calls ?? []) {
      calls[tc.index] ??= { id: "", name: "", args: "" };
      if (tc.id) calls[tc.index].id = tc.id;
      if (tc.function?.name) calls[tc.index].name += tc.function.name;
      if (tc.function?.arguments) calls[tc.index].args += tc.function.arguments;
    }
    for (const rd of d.reasoning_details ?? []) { thought.push(rd.text ?? ""); if (rd.signature) signature = rd.signature; }
    for (const a of d.annotations ?? []) annotations.push({ type: "url_citation", url: a.url_citation.url, title: a.url_citation.title });
  }
  if (thought.length) ev.push({ type: "response.output_item.done", item: { type: "reasoning", id: "rs_1", summary: [], encrypted_content: `${thought.join("")}|${signature}` } });
  if (text) ev.push({ type: "response.output_item.done", item: { type: "message", role: "assistant", content: [{ type: "output_text", text, annotations }] } });
  for (const c of calls) if (c) ev.push({ type: "response.output_item.done", item: { type: "function_call", call_id: c.id, name: c.name, arguments: c.args } });
  ev.push({ type: "response.completed", response: { status: "completed" } });
  const body = ": OPENROUTER PROCESSING\n\n" + ev.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n";
  return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
}
function fromResponses(b: any): any {
  const part = (x: any) => x.type === "input_text" ? { type: "text", text: x.text } : x.type === "input_image" ? { type: "image_url", image_url: { url: x.image_url } } : { type: "file", file: { filename: x.filename, file_data: x.file_data } };
  const messages: any[] = [{ role: "system", content: [{ type: "text", text: b.instructions }] }];
  let assistant: any = null;
  for (const it of b.input) {
    if (it.type === "reasoning" || (it.type === "message" && it.role === "assistant") || it.type === "function_call") {
      if (!assistant) { assistant = { role: "assistant", content: null }; messages.push(assistant); }
      if (it.type === "reasoning") (assistant.reasoning_details ??= []).push(it);
      else if (it.type === "message") assistant.content = it.content.map((c: any) => c.text).join("");
      else (assistant.tool_calls ??= []).push({ id: it.call_id, type: "function", function: { name: it.name, arguments: it.arguments } });
      continue;
    }
    assistant = null;
    if (it.type === "message") messages.push({ role: "user", content: it.content.length === 1 && it.content[0].type === "input_text" ? it.content[0].text : it.content.map(part) });
    else if (it.type === "function_call_output") messages.push({ role: "tool", tool_call_id: it.call_id, content: typeof it.output === "string" ? it.output : it.output.map(part) });
  }
  return { ...b, stream: true, messages, tools: (b.tools ?? []).map((t: any) => t.type === "function" ? { type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } } : t) };
}
const delta = (d: any, finish: string | null = null) => ({ choices: [{ delta: d, finish_reason: finish }] });
const call = (index: number, id: string, name: string, args: object) => {
  const a = JSON.stringify(args), mid = Math.floor(a.length / 2);
  // split the arguments across chunks, as real streams do
  return [
    delta({ tool_calls: [{ index, id, type: "function", function: { name, arguments: a.slice(0, mid) } }] }),
    delta({ tool_calls: [{ index, function: { arguments: a.slice(mid) } }] }),
  ];
};

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/v1/chat/completions" || url.pathname === "/api/v1/responses") {
      const raw = await req.json();
      const body = url.pathname.endsWith("/responses") ? fromResponses(raw) : raw;
      // The scribe's quiet bookkeeping pass is not streamed; answer it separately so it does not disturb the counts below.
      if (!body.stream) {
        scribeRequests.push(body);
        const convo = body.messages[1].content as string;
        const out = convo.includes("lung clinic note")
          ? { items: [{ id: "records", status: "done", summary: "Lakeshore Health records loaded" }], next: ["tradeoffs"], notes: "## Notes\n- Asked what this is\n- Brought in health records" }
          : { items: [], next: [] };
        return Response.json({ choices: [{ message: { role: "assistant", content: "```json\n" + JSON.stringify(out) + "\n```" } }] });
      }
      // The very first chat request fails once with a 502, as the real service sometimes does.
      if (!failedOnce) { failedOnce = true; return new Response("bad gateway", { status: 502 }); }
      // Later, a message meets a service that stays down through every automatic attempt.
      if (JSON.stringify(body.messages[body.messages.length - 1].content ?? "").includes("Coffee shop and friends") && outage > 0) { outage--; return new Response("bad gateway", { status: 502 }); }
      requests.push(body);
      const toolMsgs = body.messages.filter((m: any) => m.role === "tool").length;
      const last = body.messages[body.messages.length - 1];
      const lastText = JSON.stringify(last.content ?? "");
      // Second conversation turn: the person hands over a records file.
      if (last.role === "user" && lastText.includes("Here are my health records")) {
        return sse([
          delta({ content: "Got them." }),
          ...call(0, "r1", "search_health_records", { query: "ejection fraction" }),
          ...call(1, "r2", "list_health_records", { type: "Condition" }),
          ...call(2, "r3", "read_health_record", { id: "note-0-0" }),
          ...call(3, "r4", "offer_health_records", {}),
          delta({}, "tool_calls"),
        ]);
      }
      if (last.role === "tool" && last.tool_call_id === "r4") {
        return sse([delta({ content: "I have read your lung clinic note. Want to go through it?\n\n<rep" }), delta({ content: "lies>\nYes, go through it\n- Not right now\nI'm not sure\n</replies>" }), delta({}, "stop")]);
      }
      if (last.role === "user" && lastText.includes("what matters most to me")) {
        return sse([delta({ content: "Good. What makes a day a good day for you?" }), delta({}, "stop")]);
      }
      if (last.role === "user" && lastText.includes("Coffee shop and friends")) {
        return sse([delta({ content: "Coffee and friends. Who are they?" }), delta({}, "stop")]);
      }
      if (last.role === "user" && lastText.includes("Not right now")) {
        return sse([delta({ content: "That's fine. We can leave it." }), delta({}, "stop")]);
      }
      if (toolMsgs === 0) {
        return sse([
          delta({ reasoning_details: [{ type: "reasoning.text", text: "think ", index: 0, signature: null }] }),
          delta({ reasoning_details: [{ type: "reasoning.text", text: "more", index: 0, signature: "sig" }] }),
          delta({ content: "I'm Deathbot. " }),
          delta({ content: "Here's the short version on **CPR**." }),
          delta({ content: "\n\nCPR is rougher than it looks on television. Someone pushes hard on your chest, hard enough that ribs often break, and you would usually end up on a breathing machine afterwards. Sometimes it works well. How well depends a lot on age and health.\n\nDo you want the numbers?" }),
          ...call(0, "c1", "read_skill_file", { path: "cards/cpr.md" }),
          ...call(1, "c2", "show_card", { path: "cards/cpr.md" }),
          ...call(2, "c3", "update_notes", { markdown: "## Notes\n- Asked what this is" }),
          ...call(4, "c3b", "update_progress", { items: [
            { id: "speaker", status: "done", summary: "Lisa, my daughter. Haven't asked her yet." },
            { id: "realities", status: "started" },
            { id: "pictures", status: "set_aside" },
            { id: "talk-to-mike", status: "open", title: "Telling Mike" } ], next: ["matters", "talk-to-mike"] }),
          ...call(3, "c4", "show_video", { url: "https://evil.example/not-in-cards", title: "x", note: "y" }),
          delta({}, "tool_calls"),
        ]);
      }
      if (toolMsgs === 5) {
        return sse([
          ...call(0, "c5", "show_scenes", { use_photo: true, scenes: [
            { title: "In intensive care", prompt: "p1", caption: "cap one" },
            { title: "Home afterwards", prompt: "p2", caption: "cap two" } ] }),
          ...call(1, "c6", "show_document", { kind: "summary", title: "What matters to me", markdown: "# What matters to me\nHome." }),
          delta({}, "tool_calls"),
        ]);
      }
      return sse([
        delta({ content: "All shown. What do you notice?", annotations: [{ type: "url_citation", url_citation: { url: "https://medlineplus.gov/x", title: "MedlinePlus" } }] }),
        delta({}, "stop"),
      ]);
    }
    if (url.pathname === "/api/v1/images") {
      requests.push({ image: await req.json() });
      return Response.json({ data: [{ b64_json: PNG, media_type: "image/png" }] });
    }
    if (url.pathname === "/setup.html") {
      return new Response(`<script type="module">
        localStorage.clear();
        await new Promise((r) => { const d = indexedDB.deleteDatabase("keyval-store"); d.onsuccess = d.onerror = d.onblocked = r; });
        if (!location.search.includes("nokey")) localStorage.setItem("deathbot-key","sk-or-test");
        localStorage.setItem("deathbot-api-base", location.origin + "/api/v1");
        localStorage.setItem("deathbot-web-search", "on"); // off by default; this test covers search
        location.href = "/index.html";</script>`, { headers: { "Content-Type": "text/html" } });
    }
    const file = Bun.file(path.join(dist, url.pathname === "/" ? "index.html" : url.pathname));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});

const browser = await launch(1400, 900);
const { send, evaluate } = browser;
const waitFor = async (expression: string, what: string) => {
  for (let i = 0; i < 60; i++) { if (await evaluate(expression)) return; await Bun.sleep(250); }
  throw new Error("timed out waiting for " + what);
};

// SHOTS=dir saves screenshots along the way; MOBILE=1 and DARK=1 emulate a phone and dark mode.
const shots = process.env.SHOTS;
const shot = async (name: string) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  await Bun.write(path.join(shots!, name), Buffer.from(r.result.data, "base64"));
};
let failures = 0;
const check = (ok: unknown, label: string) => { console.log(`${ok ? "ok  " : "FAIL"} ${label}`); if (!ok) failures++; };

try {
  await send("Page.enable");
  if (process.env.MOBILE === "1") await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 870, deviceScaleFactor: 2, mobile: true });
  if (process.env.DARK === "1") await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  const text = (sel: string) => evaluate(`document.querySelector(${JSON.stringify(sel)})?.textContent ?? ""`);
  const visible = (sel: string) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0})()`);

  // First visit with no key: a plain invitation to connect, not a settings dialog.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/setup.html?nokey` });
  await waitFor(`document.getElementById("welcome") && !document.getElementById("welcome").hidden`, "welcome");
  check(await visible("#btn-signin"), "with no key, the opening offers sign-in");
  check(!(await visible("#composer")) && !(await visible("#btn-start")), "with no key, there is no message box or start button yet");
  check(!(await evaluate(`document.getElementById("settings").open`)), "no settings dialog is forced open");
  if (shots) await shot("0-first-visit.png");
  await evaluate(`(()=>{document.getElementById("have-key").open=true;document.getElementById("key-first").value="sk-or-test";document.getElementById("key-use").click();})()`);
  check(await visible("#intake") && await visible("#btn-start") && !(await visible("#composer")), "pasting a key reveals the start button; the message box waits for the conversation to start");

  // A stand-in for the browser's speech-to-text, so dictation can be tested without a microphone.
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__spoken = [];
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { getVoices: () => [], cancel() { window.__cancelled = (window.__cancelled || 0) + 1; }, speak(u) { window.__spoken.push(u.text); window.__lastU = u; } } });
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    window.SpeechRecognition = window.webkitSpeechRecognition = class {
      start() { window.__rec = this; }
      stop() { setTimeout(() => this.onend && this.onend(), 0); }
      say(text, final) { this.onresult({ results: [Object.assign([{ transcript: text }], { isFinal: final })] }); if (final) this.stop(); }
    };` });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/setup.html` });
  await waitFor(`document.getElementById("btn-start") && !document.getElementById("btn-start").hidden`, "start button");

  // give the app a photo (the control lives in Your file), then start a conversation
  // The photo arrives the easy way: attached to a message with the paperclip, not added under Your file.
  await evaluate(`(async()=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob("${PNG}"),c=>c.charCodeAt(0))],"me.png",{type:"image/png"}));const i=document.getElementById("file-input");i.files=dt.files;i.dispatchEvent(new Event("change"));})()`);
  await waitFor(`document.getElementById("attachments").textContent.includes("me.png")`, "photo attached");
  if (shots) await shot("1-opening.png");
  // The first screen: name, state and a choice become the first message, with a note naming the state's file.
  check((await evaluate(`document.getElementById("intake-state").options.length`)) === 54, "the state list has the 50 states, DC, outside the US and rather not say");
  await evaluate(`(()=>{document.getElementById("intake-name").value="Frank";const s=document.getElementById("intake-state");s.value="NY";s.dispatchEvent(new Event("change",{bubbles:true}));document.querySelectorAll("#intake-topics input")[0].click();document.getElementById("intake-other").value="What is this, exactly?";document.getElementById("intake").requestSubmit();})()`);
  await waitFor(`[...document.querySelectorAll(".msg.bot")].some(m=>m.textContent.includes("What do you notice"))`, "final reply");
  await waitFor(`document.getElementById("stop").hidden`, "turn finished");

  check((await text("#log")).includes("I'm Deathbot. Here's the short version on CPR."), "streamed text is assembled and rendered as markdown");
  check((await text(".msg.user")).startsWith("I'm Frank. I live in New York. Today I'd like to understand what treatments like CPR, breathing machines and feeding tubes are really like. What is this, exactly?"), `the first screen's answers arrive as the person's first message (got: ${await text(".msg.user")})`);
  check(JSON.stringify(requests[0]).includes("states/ny.md"), "the chosen state's file is named in a note to the model");
  check(await visible("#composer") && !(await visible("#welcome")), "once the conversation starts, the message box replaces the first screen");
  // Reading aloud: a button under the reply reads it with the device's voice; typing stops it.
  check(await evaluate(`!!document.querySelector(".turn .read-aloud")`) && (await evaluate(`window.__spoken.length`)) === 0, "each reply offers Read aloud, and nothing is read unasked");
  await evaluate(`document.querySelector(".turn .read-aloud").click()`);
  const spoken = await evaluate(`window.__spoken.join(" ")`);
  check(spoken.includes("short version on CPR") && !spoken.includes("**") && !spoken.includes("<"), `the reply is read as plain words (got: ${spoken.slice(0, 80)})`);
  check((await text(".turn .read-aloud")) === "Stop reading", "the button turns into Stop reading");
  await evaluate(`(()=>{const i=document.getElementById("input");i.value="x";i.dispatchEvent(new Event("input"));i.value="";})()`);
  check((await text(".turn .read-aloud")) === "Read aloud", "typing in the message box stops the reading");
  // Dictation: the microphone fills the message box, a phrase at a time, and nothing is sent until the person sends it.
  check(await visible("#mic"), "a microphone button is offered when the browser can turn speech into text");
  await evaluate(`document.getElementById("mic").click()`);
  check((await evaluate(`document.getElementById("mic").getAttribute("aria-pressed")`)) === "true" && (await text("#listening")).includes("Listening"), "tapping it starts listening and says so");
  await evaluate(`window.__rec.say("my daughter lisa would", false)`);
  await evaluate(`window.__rec.say("my daughter lisa would speak for me", true)`);
  await Bun.sleep(100);
  await evaluate(`window.__rec.say("i have not asked her yet", true)`);
  await Bun.sleep(100);
  const dictated = await evaluate(`document.getElementById("input").value`);
  check(dictated === "My daughter lisa would speak for me. I have not asked her yet", `spoken phrases are joined into the message box as sentences (got: ${dictated})`);
  check((await evaluate(`document.querySelectorAll(".msg.user").length`)) === 1, "dictation does not send anything by itself");
  await evaluate(`document.getElementById("mic").click()`);
  check((await evaluate(`document.getElementById("mic").getAttribute("aria-pressed")`)) === "false" && !(await visible("#listening")), "tapping again stops listening");
  await evaluate(`(()=>{const i=document.getElementById("input");i.value="";i.dispatchEvent(new Event("input"));})()`);
  check(await evaluate(`(()=>{const r=document.getElementById("composer").getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>0})()`), "the message box is on screen");
  check(await evaluate(`document.querySelector(".top").getBoundingClientRect().height < 70`), "the header is a single row");
  check(await evaluate(`(()=>{const r=[...document.querySelectorAll(".composer-controls > :not([hidden]):not(.grow)")].map(e=>e.getBoundingClientRect());return r.every(x=>Math.abs(x.height-r[0].height)<1&&Math.abs(x.top-r[0].top)<1)})()`), "the controls under the message box are one row of equal height");
  check(await evaluate(`getComputedStyle(document.getElementById("stop")).display === "none"`), "the Stop button is hidden when nothing is running");
  check(await evaluate(`(()=>{const u=document.querySelector(".msg.user").getBoundingClientRect();const s=document.getElementById("scroll").getBoundingClientRect();return u.top>=s.top-2&&u.top<s.top+120})()`), "the person's message stays at the top while the reply sits below it");
  check((await text("#log .open-card")).includes("CPR (cardiopulmonary resuscitation)"), "the fact card appears in the conversation");
  check(!(await text("#log")).includes("evil.example") && !(await evaluate(`document.querySelector("#log iframe")`)), "a link that is not in the cards is not shown");
  check((await evaluate(`document.querySelectorAll("#log .scene img").length`)) === 2, "two pictures are shown together in the conversation");
  check((await text("#log .doc-preview")).includes("What matters to me"), "the document appears in the conversation");
  check((await text("#log .sources")).includes("MedlinePlus"), "web-search sources are listed under the reply");
  check(!(await text("#log")).includes("Updated its notes"), "no tool chatter in the conversation");
  check((await text("#file-body")).includes("Asked what this is"), "notes are in Your file");
  const groupOf = (id: string) => evaluate(`document.querySelector('.map-item[data-id="${id}"]')?.closest(".map-group")?.querySelector("h4")?.textContent ?? ""`);
  check((await groupOf("speaker")) === "Talked through" && (await text('.map-item[data-id="speaker"]')).includes("Haven't asked her yet"), "the map shows what has been talked through, with its summary");
  check((await groupOf("realities")) === "Under way" && (await groupOf("pictures")) === "Set aside", "the map shows what is under way and what was set aside");
  check((await groupOf("matters")) === "Where you might go next" && (await groupOf("talk-to-mike")) === "Where you might go next" && (await text('.map-item[data-id="talk-to-mike"]')).includes("Telling Mike"), "suggested next steps include an item Deathbot added");
  check((await groupOf("tradeoffs")) === "Not yet" && (await groupOf("official")) === "Also possible", "untouched areas stay available, optional ones apart");
  check((await text("#file-body")).includes("What matters to me") && (await text("#file-body")).includes("CPR (cardiopulmonary"), "Your file lists the document and the card");
  check(!/\bcards?\b/i.test((await text("#log")) + (await text("#file-body"))), "nothing on the person's screen calls anything a card");
  check((await evaluate(`document.getElementById("error").hidden`)), "no error shown, although the service failed once and was retried");
  if (shots) await shot("2-conversation.png");

  await evaluate(`document.querySelector("#log .open-card").click()`);
  check((await evaluate(`document.getElementById("reader").open`)) && (await text("#reader-body")).includes("In one breath"), "opening the card shows it in the reader");
  check(!(await text("#reader-body")).includes("Applying this to one person") && !(await text("#reader-body")).includes("Layer 1") && !(await text("#reader-body")).includes("Not verified"), "the card is shown without the sections written for the model");
  check((await text("#reader-body")).includes("How it tends to go") && (await text("#reader-body")).includes("Sources"), "the card still shows the evidence and the sources");
  if (shots) { await Bun.sleep(200); await shot("3-reading-a-card.png"); }
  await evaluate(`document.getElementById("reader-close").click()`);

  const chat = requests.filter((r) => r.messages);
  const imgs = requests.filter((r) => r.image);
  check(chat.length === 3, `three chat requests made (got ${chat.length})`);

  // Health records: the file goes into the browser's store; the model gets an overview and looks things up.
  const recordsJson = await Bun.file(path.join(import.meta.dir, "fixtures", "health-records.json")).text();
  check(!(await text("#file-body")).includes("Remove my records") && (await text("#file-body")).includes("health-skillz"), "Your file explains how to bring records in");
  await evaluate(`(()=>{const dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(recordsJson)}],"health-records.json",{type:"application/json"}));const i=document.getElementById("file-input");i.files=dt.files;i.dispatchEvent(new Event("change"));})()`);
  await waitFor(`document.getElementById("attachments").textContent.includes("health-records.json")`, "records file attached");
  await evaluate(`(()=>{document.getElementById("input").value="Here are my health records.";document.getElementById("composer").requestSubmit();})()`);
  await waitFor(`[...document.querySelectorAll(".msg.bot")].some(m=>m.textContent.includes("lung clinic note"))`, "records reply");
  await waitFor(`document.getElementById("stop").hidden`, "records turn finished");
  const rec = requests.filter((r) => r.messages).slice(3);
  const sent = JSON.stringify(rec[0].messages[rec[0].messages.length - 1]);
  check(sent.includes("Overview") && sent.includes("Chronic obstructive pulmonary disease") && sent.includes("note-0-0"), "the model receives an overview of the records");
  check(!sent.includes("ZEBRA-MARKER-IN-NOTE") && sent.length < 6000, `the records file itself is not sent (message was ${sent.length} characters for a ${recordsJson.length}-character file)`);
  const recTools = rec[1].messages.filter((m: any) => m.role === "tool").slice(-4).map((m: any) => m.content);
  check(recTools[0].includes("note-0-1") && recTools[0].includes("ejection fraction 55%"), "search finds the note that mentions the words");
  check(recTools[1].includes("3 entries") && recTools[1].includes("Hypertension"), "list returns the conditions");
  check(recTools[2].includes("ZEBRA-MARKER-IN-NOTE") && recTools[2].includes("Pulmonary clinic note"), "read returns the full note");
  check(recTools[3].includes("already loaded"), "offering records again reports they are loaded");
  check((await text("#file-body")).includes("Remove my records") && (await text("#file-body")).includes("Lakeshore Health"), "Your file shows the loaded records with a way to remove them");
  check((await text("#log")).includes("Health records loaded"), "the conversation shows the records are loaded");
  // Ready-made replies: shown as buttons under the latest message, never as raw text, and tapping one sends it.
  check((await evaluate(`[...document.querySelectorAll(".replies .starter")].map(b=>b.textContent).join("|")`)) === "Yes, go through it|Not right now|I'm not sure", "ready-made replies appear as buttons");
  check(!(await text("#log")).includes("replies>") && !(await text("#log")).includes("<rep"), "the reply markup is never shown as text");
  // Deathbot made no map or notes update in that turn, so the page's own bookkeeping pass does it.
  await waitFor(`document.querySelector('.map-item[data-id="records"]')?.closest(".map-group")?.querySelector("h4")?.textContent === "Talked through"`, "scribe update");
  check((await text('.map-item[data-id="records"]')).includes("Lakeshore Health records loaded"), "when Deathbot does not update the map, the bookkeeping pass does");
  check((await text("#file-body")).includes("Brought in health records"), "the bookkeeping pass also brings the notes up to date");
  check(scribeRequests.length >= 1 && scribeRequests[0].messages[0].content.includes("Keeping a map the person can see") && scribeRequests[0].messages[0].content.includes("It is not a checklist"), "the bookkeeping pass works to the skill's own rules");
  check(!JSON.stringify(scribeRequests[0]).includes("ZEBRA-MARKER-IN-NOTE"), "the bookkeeping pass is not sent tool results such as record contents");
  if (shots) await shot("2b-records.png");
  await evaluate(`document.querySelectorAll(".replies .starter")[1].click()`);
  await waitFor(`[...document.querySelectorAll(".msg.bot")].some(m=>m.textContent.includes("We can leave it"))`, "reply to a tapped choice");
  await waitFor(`document.getElementById("stop").hidden`, "choice turn finished");
  check((await text("#log .turn:last-child .msg.user")) === "Not right now", "tapping a reply sends it as the person's message");
  check((await evaluate(`document.querySelectorAll(".replies").length`)) === 0, "old replies disappear once answered");
  check(typeof chat[0].instructions === "string" && chat[0].instructions.includes("You are running the Deathbot skill"), "system prompt sent as the request's instructions");
  check(chat[0].messages[0].content[0].text.includes("Web search is on.") && !chat[0].messages[0].content[0].text.includes("web search turned off") && !chat[0].messages[0].content[0].text.includes("WEB:"), "environment text reflects web search being on");
  check(chat[0].tools.some((t: any) => t.type === "openrouter:web_search"), "web search server tool requested");
  const assistant1 = chat[1].messages.find((m: any) => m.role === "assistant");
  check(assistant1?.tool_calls?.length === 5 && assistant1.tool_calls[1].function.arguments === '{"path":"cards/cpr.md"}', "split tool-call arguments were reassembled");
  check(assistant1?.reasoning_details?.[0]?.type === "reasoning" && assistant1.reasoning_details[0].encrypted_content === "think more|sig", "the reasoning item is sent back with the next request");
  const toolResults = chat[1].messages.filter((m: any) => m.role === "tool");
  check(toolResults[0].content.includes("Layer 1") && toolResults[0].content.includes("Applying this to one person"), "read_skill_file returns the whole card to the model");
  const sys = chat[0].messages[0].content[0].text;
  check(sys.includes("<skill>") && sys.includes("<environment>") && sys.indexOf("<skill>") < sys.indexOf("<environment>"), "the prompt carries the skill and the environment as separate parts");
  check(!sys.includes("For people building a harness"), "the developer guide is not sent to the model");
  check(toolResults[3].content.startsWith("Error:"), "the rejected video came back to the model as an error");
  check(!JSON.stringify(chat[2]).includes("_sources"), "private fields are not sent to the API");
  check(imgs.length === 2 && imgs.every((r) => r.image.input_references?.[0]?.image_url?.url.startsWith("data:image/")), "a photo attached in the conversation is used for the pictures without a separate step");

  // Tapping an item on the map starts that part of the conversation.
  await evaluate(`document.querySelector('.map-item[data-id="matters"]').click()`);
  await waitFor(`[...document.querySelectorAll(".msg.bot")].some(m=>m.textContent.includes("good day for you"))`, "reply to a tapped map item");
  await waitFor(`document.getElementById("stop").hidden`, "map turn finished");
  check((await text("#log .turn:last-child .msg.user")) === "Let's talk about what matters most to me.", "tapping a map item sends its opening line");

  // Style choices: made in Settings, passed to the model once when they change, and not repeated after that.
  check(!JSON.stringify(requests.filter((r) => r.messages)).includes("how the person wants you to talk"), "nothing about style is sent until the person asks for something");
  await evaluate(`document.getElementById("btn-style").click()`);
  await evaluate(`(()=>{document.querySelector('#style [data-pref="short"]').click();document.querySelector('#style [data-pref="data"]').click();const o=document.getElementById("style-other");o.value="Call me Frank.";o.dispatchEvent(new Event("input",{bubbles:true}));const l=document.getElementById("language");l.value="Spanish";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  check((await evaluate(`document.querySelector('#style [data-pref="short"]').checked`)) === true, "a ticked choice stays ticked");
  if (shots) { await Bun.sleep(200); await shot("5a-style.png"); }
  await evaluate(`document.getElementById("style-dialog").close()`);
  const sendAndWait = async (msg: string) => {
    const n = requests.filter((r) => r.messages).length;
    await evaluate(`(()=>{document.getElementById("input").value=${JSON.stringify(msg)};document.getElementById("composer").requestSubmit();})()`);
    for (let i = 0; i < 60 && requests.filter((r) => r.messages).length === n; i++) await Bun.sleep(100);
    await waitFor(`document.getElementById("stop").hidden`, "turn finished");
    const all = requests.filter((r) => r.messages);
    return JSON.stringify(all[all.length - 1].messages[all[all.length - 1].messages.length - 1]);
  };
  const first = await sendAndWait("Not right now");
  check(first.includes("Harness note: how the person wants you to talk, as of now. They asked you to: keep it short; give me the numbers and the studies.") && first.includes("Call me Frank.") && first.includes("Language: Spanish."), "style choices, including the person's own words, reach the model with the next message");
  const second = await sendAndWait("Not right now");
  check(!second.includes("how the person wants you to talk"), "unchanged style choices are not sent again");

  // When the service stays down: retries are shown as they happen, then the person gets a button, and their message is kept.
  await evaluate(`(()=>{document.getElementById("input").value="Coffee shop and friends";document.getElementById("composer").requestSubmit();})()`);
  await waitFor(`document.querySelector(".thinking")?.textContent.includes("Trying again (2 of 4)")`, "retry notice");
  check(true, "automatic retries are shown while they happen");
  await waitFor(`!document.getElementById("error").hidden`, "error after retries");
  check((await text("#error button")) === "Try again", "after the automatic retries fail, a Try again button is offered");
  check((await text("#log .turn:last-child .msg.user")) === "Coffee shop and friends" && (await evaluate(`document.getElementById("input").value`)) === "", "the person's message stays in the conversation");
  if (shots) await shot("6-try-again.png");
  await evaluate(`document.querySelector("#error button").click()`);
  await waitFor(`[...document.querySelectorAll(".msg.bot")].some(m=>m.textContent.includes("Who are they"))`, "reply after Try again");
  await waitFor(`document.getElementById("stop").hidden`, "retry turn finished");
  check((await evaluate(`document.getElementById("error").hidden`)) && (await evaluate(`document.querySelectorAll("#log .msg.user").length`)) === (await evaluate(`[...document.querySelectorAll("#log .msg.user")].filter(m=>m.textContent==="Coffee shop and friends").length`)) + (await evaluate(`[...document.querySelectorAll("#log .msg.user")].filter(m=>m.textContent!=="Coffee shop and friends").length`)) && (await evaluate(`[...document.querySelectorAll("#log .msg.user")].filter(m=>m.textContent==="Coffee shop and friends").length`)) === 1, "Try again gets the reply without sending the message twice");

  // reload: everything should come back from browser storage
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
  await waitFor(`[...document.querySelectorAll(".msg.bot")].some(m=>m.textContent.includes("What do you notice"))`, "conversation restored after reload");
  check((await evaluate(`document.querySelectorAll("#log .scene img").length`)) === 2, "pictures restored after reload");
  check((await text("#file-body")).includes("Asked what this is"), "notes restored after reload");
  check((await text('.map-item[data-id="speaker"]')).includes("Haven't asked her yet"), "the map is restored after reload");
  check((await text("#file-body")).includes("Lakeshore Health"), "health records restored after reload");

  if (shots) {
    if (await visible("#btn-file")) await evaluate(`document.getElementById("btn-file").click()`);
    await Bun.sleep(200); await shot("4-your-file.png");
    if (await visible("#btn-file-close")) await evaluate(`document.getElementById("btn-file-close").click()`);
    await evaluate(`document.getElementById("btn-settings").click()`);
    await Bun.sleep(200); await shot("5-settings.png");
  }
} catch (e) {
  console.log("FAIL", e instanceof Error ? e.message : e);
  console.log(await evaluate(`document.getElementById("error").textContent + " | " + document.getElementById("log").textContent.slice(0,400)`));
  failures++;
} finally {
  await browser.close(); server.stop(true);
}
console.log(failures ? `${failures} check(s) failed` : "all checks passed");
process.exit(failures ? 1 : 0);
