import { marked } from "marked";
import DOMPurify from "dompurify";
import { get, set, del } from "idb-keyval";
import {
  runTurn, scribe, AgentError, beginSignIn, completeSignIn,
  CHAT_MODELS, IMAGE_MODELS, DEFAULT_MODEL, DEFAULT_IMAGE_MODEL,
  type Msg, type Part, type Settings, type ToolCall,
} from "./agent";
import { cardForPerson, cardTitle, areas, release } from "./skill";
import { shrink, cardFile, type Surface, type SceneItem, type ProgressStatus } from "./tools";
import { normalise, overview, summary, RECORDS_URL, type Provider } from "./records";

// ---------- state ----------
// The stored messages are the single source of truth. Cards, videos and documents are drawn from
// the tool calls inside them; only notes, generated pictures and the person's photo are kept apart.

interface Saved {
  messages: Msg[];
  notes: string;
  scenes: Record<string, SceneItem[]>; // by tool call id
  /** The style settings last passed on to the model, so they are sent again only when they change. */
  styleSent?: string;
  /** The map of the conversation: status and one-line summary per area, plus items Deathbot added. */
  progress: Record<string, { status: ProgressStatus; summary?: string; title?: string }>;
  next: string[];
  photo: string | null;
  lastActive: number;
}
const STATE_KEY = "deathbot-conversation-v3";
const empty = (): Saved => ({ messages: [], notes: "", scenes: {}, progress: {}, next: [], photo: null, lastActive: 0 });
let state: Saved = empty();
let busy = false;
let abort: AbortController | null = null;
let pendingFiles: { name: string; part: Part }[] = [];

const save = () => set(STATE_KEY, state).catch((e) => console.warn("Could not save conversation.", e));

// Health records are kept apart from the conversation: they can be large, and only what Deathbot looks up leaves the browser.
const RECORDS_KEY = "deathbot-records-v1";
let records: Provider[] | null = null;
function setRecords(r: Provider[] | null) {
  records = r;
  (r ? set(RECORDS_KEY, r) : del(RECORDS_KEY)).catch((e) => console.warn("Could not save health records.", e));
  renderFile();
}

// ---------- settings ----------
// A shared link carries the key in the URL fragment (#k=…&m=…). The fragment is never sent to
// the server hosting this page. We move it into storage and strip it from the address bar.

const ls = (k: string) => localStorage.getItem("deathbot-" + k);
const lsSet = (k: string, v: string | null) => (v === null ? localStorage.removeItem("deathbot-" + k) : localStorage.setItem("deathbot-" + k, v));

function readFragment() {
  const p = new URLSearchParams(location.hash.slice(1));
  const k = p.get("k");
  if (!k) return;
  lsSet("key", k);
  const m = p.get("m");
  if (m) lsSet("model", m);
  history.replaceState(null, "", location.pathname + location.search);
}
function getSettings(): Settings {
  return {
    apiKey: ls("key") ?? "",
    model: ls("model") ?? DEFAULT_MODEL,
    imageModel: ls("image-model") ?? DEFAULT_IMAGE_MODEL,
    webSearch: ls("web-search") !== "off",
  };
}
// How the person wants to be spoken to. What each choice means is defined by the skill's voice guide;
// the page only records the choices, in the person's words, and passes them on.
interface Style { short: boolean; plain: boolean; data: boolean; gentle: boolean; other: string; language: string }
const STANDARD: Style = { short: false, plain: false, data: false, gentle: false, other: "", language: "English" };
function getStyle(): Style {
  try { return { ...STANDARD, ...JSON.parse(ls("style") ?? "{}") }; } catch { return { ...STANDARD }; }
}
const STYLE_ASKS: [keyof Style, string][] = [
  ["short", "keep it short"], ["plain", "use plain, everyday words"], ["data", "give me the numbers and the studies"], ["gentle", "go gently with hard news"],
];
function describeStyle(s: Style): string {
  const asks = STYLE_ASKS.filter(([k]) => s[k]).map(([, words]) => words);
  const other = s.other.trim().slice(0, 400);
  return [
    asks.length ? `They asked you to: ${asks.join("; ")}.` : "No particular requests about length, wording or tone.",
    other ? `In their own words: "${other}"` : "",
    `Language: ${s.language}.`,
  ].filter(Boolean).join(" ");
}
/** Speech-to-text should listen in the language the person chose to talk in. */
const SPEECH_LANG: Record<string, string> = { Spanish: "es-US", "Chinese (Simplified)": "zh-CN", "Chinese (Traditional)": "zh-TW", Vietnamese: "vi-VN", Tagalog: "fil-PH", Korean: "ko-KR", Russian: "ru-RU", Arabic: "ar", "Haitian Creole": "ht-HT", Portuguese: "pt-BR", French: "fr-FR" };

function applyTextSize() {
  document.documentElement.dataset.size = ls("size") ?? "m";
}

// ---------- dom helpers ----------

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const log = $("log"), scroller = $("scroll"), input = $<HTMLTextAreaElement>("input"), errorBox = $("error");
const md = (text: string) => DOMPurify.sanitize(marked.parse(text, { async: false }) as string);

function h(tag: string, cls = "", text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function htmlEl(tag: string, cls: string, html: string): HTMLElement {
  const e = h(tag, cls);
  e.innerHTML = html;
  for (const a of e.querySelectorAll("a")) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  return e;
}
function button(label: string, cls: string, onClick: () => void): HTMLButtonElement {
  const b = h("button", cls, label) as HTMLButtonElement;
  b.type = "button";
  b.onclick = onClick;
  return b;
}
function externalLink(url: string, text: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = text;
  return a;
}
function download(name: string, text: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function printHtml(html: string) {
  const root = htmlEl("div", "print-root prose", html);
  document.body.append(root);
  window.print();
  root.remove();
}
function fitInput() { input.style.height = "auto"; input.style.height = input.scrollHeight + 2 + "px"; }

// ---------- reader: cards and documents open here to be read properly ----------

const reader = $<HTMLDialogElement>("reader");
function openReader(html: string, actions: HTMLElement[] = []) {
  $("reader-body").innerHTML = "";
  $("reader-body").append(htmlEl("div", "", html));
  $("reader-actions").replaceChildren(...actions);
  reader.showModal();
  reader.scrollTop = 0;
}
const openCard = (file: string) => openReader(md(cardForPerson(file)));
function docActions(title: string, markdown: string): HTMLElement[] {
  return [
    button("Print", "quiet", () => printHtml(md(markdown))),
    button("Copy", "quiet", () => navigator.clipboard.writeText(markdown)),
    button("Download", "quiet", () => download(`${title.replace(/[^\w]+/g, "-").toLowerCase()}.md`, markdown, "text/markdown")),
  ];
}
const openDoc = (title: string, markdown: string) => openReader(md(markdown), docActions(title, markdown));

// ---------- things Deathbot shows, drawn from its tool calls ----------

interface Shown { call: ToolCall; args: any }
/** Tool calls that succeeded, in order. A refused or failed call showed the person nothing. */
function shownCalls(messages: Msg[]): Shown[] {
  const failed = new Set<string>(), done = new Set<string>();
  for (const m of messages) if (m.role === "tool") (m.content.startsWith("Error:") ? failed : done).add(m.tool_call_id);
  const out: Shown[] = [];
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    for (const call of m.tool_calls ?? []) {
      if (failed.has(call.id) || !done.has(call.id)) continue;
      try { out.push({ call, args: JSON.parse(call.function.arguments || "{}") }); } catch { /* unreadable call: skip */ }
    }
  }
  return out;
}
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function sceneGrid(items: SceneItem[]): HTMLElement {
  const box = h("div", "scene-set");
  const grid = h("div", "scenes");
  for (const s of items) {
    const fig = h("div", "scene");
    const img = document.createElement("img"); img.src = s.dataUrl; img.alt = s.title; img.loading = "lazy";
    fig.append(img, h("h3", "", s.title), h("p", "", s.caption));
    grid.append(fig);
  }
  box.append(grid);
  return box;
}
/** The block that appears in the conversation for one successful tool call, or null if it shows nothing there. */
function shownBlock({ call, args }: Shown): HTMLElement | null {
  const box = h("div", "shown");
  switch (call.function.name) {
    case "show_card": {
      const file = cardFile(args.path);
      if (!file) return null;
      const b = button("", "open-card", () => openCard(file));
      b.append(h("span", "title", cardTitle(file)), h("span", "fine", "Background, with the studies behind it. Tap to read."));
      box.append(b);
      return box;
    }
    case "show_video": {
      box.append(h("h3", "", String(args.title ?? "Video")), h("p", "fine", String(args.note ?? "")));
      const id = youtubeId(String(args.url));
      if (id) {
        const f = document.createElement("iframe");
        f.src = `https://www.youtube-nocookie.com/embed/${id}`;
        f.allow = "encrypted-media; picture-in-picture; fullscreen";
        f.referrerPolicy = "no-referrer"; f.loading = "lazy"; f.title = String(args.title ?? "Video");
        box.append(f);
      }
      box.append(externalLink(String(args.url), id ? "Open on YouTube" : "Open this link"));
      return box;
    }
    case "show_document": {
      const title = String(args.title ?? "Document"), markdown = String(args.markdown ?? "");
      box.append(htmlEl("div", "doc-preview prose", md(markdown)));
      const actions = h("div", "actions");
      actions.append(button("Read it all", "quiet", () => openDoc(title, markdown)), ...docActions(title, markdown));
      box.append(actions);
      return box;
    }
    case "offer_health_records": {
      if (records) box.append(h("h3", "", "Health records loaded"), h("p", "fine", `${summary(records)}. They are kept in this browser; see Your file.`));
      else box.append(h("h3", "", "Bring in your health records"), ...recordsSteps());
      return box;
    }
    case "show_scenes": {
      const items = state.scenes[call.id];
      if (!items?.length) return null;
      box.append(sceneGrid(items));
      return box;
    }
    default:
      return null; // notes and private reads change nothing in the conversation
  }
}

// ---------- ready-made replies ----------
// The model may end a message with <replies>one per line</replies>. That block is never shown as text;
// under the latest message its lines become buttons that send the reply.

function splitReplies(text: string): { body: string; replies: string[] } {
  const m = text.match(/<replies>([\s\S]*?)(?:<\/replies>|$)/i);
  if (!m) return { body: text.replace(/<\/?[a-z]*$/i, ""), replies: [] }; // hide a tag that is still arriving
  const replies = m[1].split("\n").map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean).slice(0, 5);
  return { body: (text.slice(0, m.index) + text.slice(m.index! + m[0].length)).trim(), replies };
}
function replyButtons(replies: string[]): HTMLElement {
  const list = h("ul", "starter-list replies");
  for (const r of replies) {
    const li = h("li");
    li.append(button(r, "starter", () => send(r)));
    list.append(li);
  }
  return list;
}

// ---------- the conversation ----------

const ATTACHED = "[Attached file: ";
const isHarnessNote = (t: string) => t.startsWith("[Harness note:");

function userBubble(m: Extract<Msg, { role: "user" }>): HTMLElement | null {
  const parts: Part[] = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
  const text = parts.flatMap((p) => (p.type === "text" && !isHarnessNote(p.text) && !p.text.startsWith(ATTACHED) ? [p.text] : [])).join("\n");
  const files = parts.flatMap((p) => {
    if (p.type === "file") return [p.file.filename];
    if (p.type === "image_url") return ["a picture"];
    if (p.text.startsWith(ATTACHED)) return [p.text.slice(ATTACHED.length, p.text.indexOf("]"))];
    return [];
  });
  if (!text && !files.length) return null;
  const b = h("div", "msg user", text === "(see attached)" ? "" : text);
  for (const f of files) b.append(h("div", "file-note", `Attached: ${f}`));
  return b;
}

/** Rebuild the conversation from the stored messages, one block per turn. */
function renderThread() {
  const shown = new Map(shownCalls(state.messages).map((s) => [s.call.id, s]));
  log.replaceChildren();
  let turn: HTMLElement | null = null;
  const current = () => turn ?? (turn = log.appendChild(h("div", "turn")));
  for (const m of state.messages) {
    if (m.role === "user") {
      const b = userBubble(m);
      if (!b) continue;
      turn = log.appendChild(h("div", "turn"));
      turn.append(b);
    } else if (m.role === "assistant") {
      const { body } = splitReplies(m.content ?? "");
      if (body.trim()) current().append(htmlEl("div", "msg bot", md(body)));
      if (m._sources?.length) {
        const s = h("p", "sources", "Looked this up: ");
        m._sources.slice(0, 6).forEach((src, i) => {
          let host = src.url;
          try { host = new URL(src.url).hostname.replace(/^www\./, ""); } catch { /* keep the raw string */ }
          if (i) s.append(", ");
          s.append(externalLink(src.url, src.title || host));
        });
        current().append(s);
      }
      for (const call of m.tool_calls ?? []) {
        const s = shown.get(call.id);
        const block = s && shownBlock(s);
        if (block) current().append(block);
      }
    }
  }
  // Ready-made replies belong only to the latest message, and only while it is the person's move.
  const lastMsg = state.messages[state.messages.length - 1];
  if (!busy && lastMsg?.role === "assistant") {
    const { replies } = splitReplies(lastMsg.content ?? "");
    if (replies.length) current().append(replyButtons(replies));
  }
  renderWelcome();
  renderFile();
}

/** Makes the last turn at least as tall as the window, so a new message can sit at the top while the reply arrives beneath it. */
function pinLastTurn(scrollToIt = true) {
  const last = log.lastElementChild as HTMLElement | null;
  if (!last) return;
  last.style.minHeight = scroller.clientHeight - 20 + "px";
  if (scrollToIt) scroller.scrollTop = last.offsetTop - 12;
}

function renderWelcome() {
  const connected = !!getSettings().apiKey, fresh = state.messages.length === 0;
  $("welcome").hidden = !fresh;
  $("connect").hidden = connected;
  $("starters").hidden = !connected;
  $("composer").hidden = !connected;
}

// ---------- Your file ----------

function renderFile() {
  const body = $("file-body");
  body.replaceChildren();
  const calls = shownCalls(state.messages);
  const section = (title: string, blurb: string) => {
    const s = h("section");
    s.append(h("h3", "", title), h("p", "fine", blurb));
    body.append(s);
    return s;
  };

  body.append(progressMap());

  const notes = section("What Deathbot has noted about you", "These are its working notes. If something is wrong, tell it.");
  notes.append(state.notes ? htmlEl("div", "prose", md(state.notes)) : h("p", "", "Nothing yet. Notes appear here as you talk."));

  // Latest version of each kind of document.
  const docs = new Map<string, { title: string; markdown: string }>();
  for (const { call, args } of calls) {
    if (call.function.name !== "show_document") continue;
    docs.set(args.kind === "other" ? call.id : String(args.kind), { title: String(args.title ?? "Document"), markdown: String(args.markdown ?? "") });
  }
  if (docs.size) {
    const s = section("Your documents", "Written with you, in your words. Print or copy them to share.");
    for (const d of docs.values()) {
      const item = h("div", "item");
      const actions = h("div", "actions");
      actions.append(button("Read", "quiet", () => openDoc(d.title, d.markdown)), ...docActions(d.title, d.markdown));
      item.append(h("p", "", d.title), actions);
      s.append(item);
    }
  }

  const cards = [...new Set(calls.flatMap(({ call, args }) => (call.function.name === "show_card" ? [cardFile(args.path)] : [])).filter(Boolean) as string[])];
  if (cards.length) {
    const s = section("Background you've been shown", "The detail behind what Deathbot told you, with the studies it comes from.");
    for (const file of cards) {
      const item = h("div", "item");
      item.append(button(cardTitle(file), "link", () => openCard(file)));
      s.append(item);
    }
  }

  const rec = section("Your health records", records
    ? `${summary(records)}. Kept in this browser. Only the parts Deathbot looks up are sent to the AI service.`
    : "Deathbot can work from your actual records instead of your memory of them. They stay in this browser, and only the parts it looks up are sent to the AI service.");
  if (records) {
    rec.append(button("Remove my records", "quiet", () => { if (confirm("Remove your health records from this browser?")) setRecords(null); }));
  } else {
    rec.append(...recordsSteps());
  }

  const pics = section("Pictures", "");
  pics.querySelector(".fine")!.remove();
  const sets = calls.flatMap(({ call }) => (call.function.name === "show_scenes" && state.scenes[call.id] ? [state.scenes[call.id]] : []));
  for (const items of sets.reverse()) pics.append(sceneGrid(items));
  const photo = h("div", "item");
  photo.append(h("p", "fine", state.photo
    ? "Your photo is saved in this browser. It is sent to the picture service only when a picture is made."
    : "If you want pictures drawn to look like you, add a photo of yourself. It stays in this browser and is sent to the picture service only when a picture is made."));
  if (state.photo) {
    photo.append(button("Remove my photo", "quiet", () => { state.photo = null; save(); renderFile(); }));
  } else {
    const label = h("label", "quiet as-button", "Add my photo");
    const inp = document.createElement("input");
    inp.type = "file"; inp.id = "photo"; inp.accept = "image/png,image/jpeg,image/webp"; inp.hidden = true;
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      state.photo = await shrink(await readDataUrl(f), 1024);
      save(); renderFile();
    };
    label.append(inp);
    photo.append(label);
  }
  pics.append(photo);
}

// ---------- the map: where the conversation has been and where it could go ----------

interface MapItem { id: string; title: string; start: string; optional: boolean; status: ProgressStatus; summary?: string }
function mapItems(): MapItem[] {
  const out: MapItem[] = areas.map((a) => ({ id: a.id, title: a.title, start: a.start, optional: !!a.optional, status: state.progress[a.id]?.status ?? "open", summary: state.progress[a.id]?.summary }));
  for (const [id, p] of Object.entries(state.progress)) {
    if (areas.some((a) => a.id === id)) continue;
    const title = p.title ?? id;
    out.push({ id, title, start: `Let's talk about ${title.charAt(0).toLowerCase()}${title.slice(1)}.`, optional: false, status: p.status, summary: p.summary });
  }
  return out;
}
/** Tapping an item says, in the person's voice, where they want to go. */
function entryPhrase(it: MapItem): string {
  if (it.status === "started") return `Let's pick up "${it.title}" where we left off.`;
  if (it.status === "done") return `I'd like to go back over "${it.title}".`;
  return it.start;
}
function progressMap(): HTMLElement {
  const s = h("section", "map");
  s.append(h("h3", "", "Where we are"), h("p", "fine", "Tap a topic to talk about it."));
  const items = mapItems();
  const next = state.next.map((id) => items.find((i) => i.id === id)).filter((i): i is MapItem => !!i && i.status !== "done");
  const group = (label: string, list: MapItem[], cls = "") => {
    if (!list.length) return;
    const g = h("div", `map-group ${cls}`);
    g.append(h("h4", "", label));
    for (const it of list) {
      const b = button("", "map-item", () => { setFileOpen(false); send(entryPhrase(it)); });
      b.dataset.id = it.id;
      b.append(h("span", "title", it.title));
      if (it.summary) b.append(h("span", "fine", it.summary));
      g.append(b);
    }
    s.append(g);
  };
  const rest = items.filter((i) => !next.includes(i));
  group("Where you might go next", next, "next");
  group("Under way", rest.filter((i) => i.status === "started"));
  group("Talked through", rest.filter((i) => i.status === "done"), "done");
  group("Not yet", rest.filter((i) => i.status === "open" && !i.optional));
  group("Also possible", rest.filter((i) => i.status === "open" && i.optional));
  group("Set aside", rest.filter((i) => i.status === "set_aside"));
  return s;
}

const filePanel = $("file"), fileBtn = $("btn-file");
function setFileOpen(open: boolean) {
  filePanel.classList.toggle("open", open);
  fileBtn.setAttribute("aria-expanded", String(open));
  if (open) fileBtn.classList.remove("fresh");
}
/** On a phone the file is a separate screen, so mark the button when something new has landed there. */
function flagFile() {
  if (!filePanel.classList.contains("open")) fileBtn.classList.add("fresh");
}

/** Opens a file picker for the records file and sends it straight away, so the person has one thing to do. */
function chooseRecordsFile() {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = ".json,application/json";
  inp.onchange = async () => {
    if (!inp.files?.length) return;
    const before = records;
    await attach(inp.files);
    if (records && records !== before) { setFileOpen(false); send("Here are my health records."); }
    else showError("That did not look like a health records file. It should be the file you downloaded from health-skillz, usually called health-records.json.");
  };
  inp.click();
}
/** The steps for getting records in, used in the conversation and in Your file. */
function recordsSteps(): HTMLElement[] {
  const steps = h("ol", "steps");
  const first = h("li");
  first.append("Open ", externalLink(RECORDS_URL, "health-skillz"), ", sign in to your patient portal there, and download your records. You'll get a file called health-records.json.");
  const second = h("li", "", "Come back here and choose that file.");
  steps.append(first, second);
  return [steps, button("Choose my records file", "quiet", chooseRecordsFile)];
}

function lastAttachedPicture(): string | null {
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const m = state.messages[i];
    if (m.role !== "user" || typeof m.content === "string") continue;
    for (let j = m.content.length - 1; j >= 0; j--) {
      const p = m.content[j];
      if (p.type === "image_url") return p.image_url.url;
    }
  }
  return null;
}

const surface: Surface = {
  getRecords: () => records,
  setNotes(markdown) { state.notes = markdown; flagFile(); renderFile(); },
  progressIds: () => Object.keys(state.progress),
  setProgress(items, next) {
    for (const it of items) {
      const prev = state.progress[it.id];
      state.progress[it.id] = { status: it.status, summary: it.summary ?? prev?.summary, title: it.title ?? prev?.title };
    }
    state.next = next;
    flagFile(); renderFile();
  },
  showScenes(callId, items) { state.scenes[callId] = items; },
  // The photo added under Your file, or failing that the most recent picture the person attached in the conversation.
  getPhoto: () => state.photo ?? lastAttachedPicture(),
};

// ---------- sending ----------

/** Shows a problem above the message box, with a button for the obvious next step when there is one. */
function showError(text: string | null, action?: string, run?: () => void) {
  errorBox.hidden = !text;
  errorBox.replaceChildren();
  if (!text) return;
  errorBox.append(h("span", "", text));
  if (action && run) errorBox.append(button(action, "quiet", () => { showError(null); run(); }));
}
function setBusy(on: boolean) {
  busy = on;
  $("send").hidden = on;
  $("stop").hidden = !on;
}
function describeGap(ms: number): string | null {
  const hours = ms / 3_600_000;
  if (hours < 6) return null;
  if (hours < 48) return `about ${Math.round(hours)} hours`;
  return `about ${Math.round(hours / 24)} days`;
}

/**
 * After a turn, if Deathbot did not update the map or the notes itself, a quiet second pass does it
 * from the conversation. It runs in the background; the person can carry on typing.
 */
function tidyRecords(settings: Settings, turnStart: number) {
  const called = new Set(state.messages.slice(turnStart).flatMap((m) => (m.role === "assistant" ? (m.tool_calls ?? []).map((c) => c.function.name) : [])));
  const want = { map: !called.has("update_progress"), notes: !called.has("update_notes") };
  if (!want.map && !want.notes) return;
  const before = state;
  scribe(settings, state.messages, { progress: state.progress, next: state.next, notes: state.notes }, want)
    .then((r) => {
      if (!r || state !== before) return; // erased or replaced meanwhile
      if (want.map) surface.setProgress(r.items, r.next);
      if (want.notes && r.notes) surface.setNotes(r.notes);
      save();
    })
    .catch((e) => console.warn("Could not tidy the map and notes.", e));
}

async function send(text: string) {
  if (dictating) stopDictation();
  if (busy || (!text.trim() && !pendingFiles.length)) return;
  const settings = getSettings();
  if (!settings.apiKey) return;
  showError(null);

  const typed = text.trim() || "(see attached)";
  const parts: Part[] = pendingFiles.map((f) => f.part);
  const gap = state.lastActive && state.messages.length ? describeGap(Date.now() - state.lastActive) : null;
  // Harness notes are bracketed so they are not shown as something the person typed.
  if (gap) parts.push({ type: "text", text: `[Harness note: the person has returned after ${gap} away.]` });
  const style = describeStyle(getStyle());
  const styleChanged = style !== (state.styleSent ?? describeStyle(STANDARD));
  if (styleChanged) parts.push({ type: "text", text: `[Harness note: how the person wants you to talk, as of now. ${style}]` });
  parts.push({ type: "text", text: typed });
  pendingFiles = []; renderAttachments();
  input.value = ""; fitInput();

  state.messages.push({ role: "user", content: parts.length === 1 ? typed : parts });
  if (styleChanged) state.styleSent = style;
  state.lastActive = Date.now();
  renderThread();
  pinLastTurn();
  await answer();
}

/**
 * Gets Deathbot's reply to the conversation as it stands, which ends with the person's message.
 * Used for a new message and again when the person presses "Try again" after a failure: their
 * message stays in the conversation either way, so nothing has to be retyped.
 */
async function answer() {
  if (busy) return;
  const settings = getSettings();
  showError(null);
  // The turn starts at the person's last message; anything after it is an unfinished attempt.
  let turnStart = state.messages.length - 1;
  while (turnStart > 0 && state.messages[turnStart].role !== "user") turnStart--;
  state.messages.length = turnStart + 1;

  // While the reply is in flight: a status line, then the text as it streams, in the current turn.
  const turn = () => log.lastElementChild as HTMLElement;
  const thinking = h("p", "thinking", "Thinking");
  let bubble: HTMLElement | null = null, buffer = "";
  const status = (t: string | null) => { thinking.textContent = t ?? "Thinking"; if (!bubble) turn().append(thinking); };
  setBusy(true);
  abort = new AbortController();
  try {
    await runTurn(settings, state.messages, surface, {
      // Each round starts by redrawing, so anything the last round showed (a card, pictures) appears
      // straight away without moving what the person is reading.
      onAssistantStart() { const at = scroller.scrollTop; renderThread(); pinLastTurn(false); scroller.scrollTop = at; bubble = null; buffer = ""; status(null); },
      onText(delta) {
        if (!bubble) { thinking.remove(); bubble = turn().appendChild(h("div", "msg bot")); }
        buffer += delta;
        bubble.innerHTML = md(splitReplies(buffer).body);
      },
      onToolUse() { /* drawn when the round is re-rendered below */ },
      onStatus(t) { bubble = null; status(t); },
    }, abort.signal);
    tidyRecords(settings, turnStart);
    busy = false; // so the redraw includes any ready-made replies
    const at = scroller.scrollTop;
    renderThread();
    pinLastTurn(false);
    scroller.scrollTop = at;
    $("announce").textContent = "Deathbot replied. " + ((log.lastElementChild as HTMLElement)?.querySelector(".msg.bot:last-of-type")?.textContent ?? "").slice(0, 600);
  } catch (e) {
    // Keep the person's message; drop only the unfinished reply, so trying again starts clean.
    state.messages.length = turnStart + 1;
    busy = false;
    renderThread();
    pinLastTurn(false);
    if (abort.signal.aborted) {
      showError("Stopped. Your message is still there.", "Get a reply", answer);
    } else if (e instanceof AgentError && e.kind === "auth") {
      showError("That key was not accepted.", "Open Settings", openSettings);
    } else if (e instanceof AgentError && e.kind === "credits") {
      showError("The key has run out of credit. If someone shared this link with you, let them know.", "Try again", answer);
    } else {
      if (!(e instanceof AgentError)) console.error(e);
      showError(e instanceof AgentError ? e.message : "Something went wrong before Deathbot could reply.", "Try again", answer);
    }
  } finally {
    setBusy(false);
    state.lastActive = Date.now();
    await save();
  }
}

// ---------- dictation ----------
// Speaking is easier than typing for many people, and not everyone knows their keyboard has a microphone.
// Where the browser can turn speech into text itself, the composer gets a microphone button. The words
// land in the message box to be read over and sent; nothing is sent by voice alone.

const SpeechRec: any = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
let dictating = false;
let recognizer: any = null;

function stopDictation() {
  dictating = false;
  try { recognizer?.stop(); } catch { /* already stopped */ }
  $("mic").setAttribute("aria-pressed", "false");
  $("mic-label").textContent = "Speak instead of typing";
  $("listening").hidden = true;
  input.placeholder = "Type or tap the microphone";
}
function startDictation() {
  showError(null);
  dictating = true;
  $("mic").setAttribute("aria-pressed", "true");
  $("mic-label").textContent = "Stop listening";
  const note = $("listening");
  note.hidden = false;
  // Said once: most browsers send the audio to their maker's speech service to be transcribed.
  note.textContent = ls("mic-told") ? "Listening. Tap the microphone when you're done."
    : "Listening. Your browser's own speech service turns this into text. Tap the microphone when you're done.";
  lsSet("mic-told", "1");
  listenOnce();
}
/** One utterance at a time, restarted while dictation is on: the most dependable way across phones. */
function listenOnce() {
  const committed = input.value.trim();
  const join = (said: string) => {
    said = said.trim();
    if (!said) return committed;
    if (!committed) return said.charAt(0).toUpperCase() + said.slice(1);
    return `${committed}${/[.?!,;:]$/.test(committed) ? " " : ". "}${said.charAt(0).toUpperCase()}${said.slice(1)}`;
  };
  const rec = new SpeechRec();
  recognizer = rec;
  rec.lang = SPEECH_LANG[getStyle().language] ?? navigator.language ?? "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (e: any) => {
    let said = "";
    for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript;
    input.value = join(said);
    fitInput();
  };
  rec.onerror = (e: any) => {
    if (e.error === "no-speech" || e.error === "aborted") return; // silence is fine; keep listening
    stopDictation();
    showError(e.error === "not-allowed" || e.error === "service-not-allowed"
      ? "The browser did not allow the microphone. Allow it for this page in your browser's settings, or type instead."
      : "Speech-to-text stopped working just now. You can try again or type instead.");
  };
  rec.onend = () => { if (dictating && recognizer === rec) listenOnce(); };
  try { rec.start(); } catch { stopDictation(); }
}
function wireDictation() {
  if (!SpeechRec) return; // this browser cannot do it; the person can still use their keyboard's microphone
  $("mic").hidden = false;
  input.placeholder = "Type or tap the microphone";
  $("mic").onclick = () => (dictating ? stopDictation() : startDictation());
}

// ---------- attachments ----------

function renderAttachments() {
  const box = $("attachments");
  box.replaceChildren();
  pendingFiles.forEach((f, i) => {
    const s = h("span", "", f.name);
    const x = button("×", "", () => { pendingFiles.splice(i, 1); renderAttachments(); });
    x.setAttribute("aria-label", `Remove ${f.name}`);
    s.append(x); box.append(s);
  });
}
const readDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result));
  r.onerror = () => reject(r.error);
  r.readAsDataURL(file);
});
async function attach(files: FileList) {
  for (const f of files) {
    if (f.size > 20 * 1024 * 1024) { showError(`${f.name} is too large. The limit is 20 MB.`); continue; }
    if (f.type === "application/pdf") {
      pendingFiles.push({ name: f.name, part: { type: "file", file: { filename: f.name, file_data: await readDataUrl(f) } } });
    } else if (/^image\/(png|jpeg|gif|webp)$/.test(f.type)) {
      pendingFiles.push({ name: f.name, part: { type: "image_url", image_url: { url: await shrink(await readDataUrl(f), 1600) } } });
    } else {
      const text = await f.text();
      // A records file from health-skillz goes into the records store, not into the message: it can be far too large to send whole.
      let loaded: Provider[] | null = null;
      if (f.name.endsWith(".json") || f.type === "application/json") {
        try { loaded = normalise(JSON.parse(text)); } catch { /* not JSON after all: send as text */ }
      }
      if (loaded) {
        setRecords(loaded);
        flagFile();
        renderThread();
        pendingFiles.push({ name: f.name, part: { type: "text", text: `${ATTACHED}${f.name}]\n[Harness note: this was a health records file. It is now loaded in this browser for search_health_records, list_health_records and read_health_record; its contents are not in this message. Overview:\n${overview(loaded)}]` } });
      } else {
        pendingFiles.push({ name: f.name, part: { type: "text", text: `${ATTACHED}${f.name}]\n${text}` } });
      }
    }
  }
  renderAttachments();
}

// ---------- settings ----------

const dialog = $<HTMLDialogElement>("settings");
function setSelect(sel: HTMLSelectElement, value: string) {
  if (![...sel.options].some((o) => o.value === value)) sel.add(new Option(value, value));
  sel.value = value;
}
function markSize() {
  const size = ls("size") ?? "m";
  for (const b of document.querySelectorAll<HTMLElement>(".sizes button")) b.setAttribute("aria-checked", String(b.dataset.size === size));
}
function markStyle() {
  const st = getStyle();
  for (const box of document.querySelectorAll<HTMLInputElement>("#style input[type=checkbox]")) box.checked = !!st[box.dataset.pref as keyof Style];
  $<HTMLTextAreaElement>("style-other").value = st.other;
  $<HTMLSelectElement>("language").value = st.language;
}
function saveStyle() {
  const st: Style = { ...STANDARD, other: $<HTMLTextAreaElement>("style-other").value.trim(), language: $<HTMLSelectElement>("language").value };
  for (const box of document.querySelectorAll<HTMLInputElement>("#style input[type=checkbox]")) (st as any)[box.dataset.pref!] = box.checked;
  lsSet("style", JSON.stringify(st));
}
function openSettings() {
  const s = getSettings();
  $<HTMLInputElement>("key").value = s.apiKey;
  $("conn-status").textContent = s.apiKey ? `Connected with a key ending in ${s.apiKey.slice(-4)}.` : "Not connected yet.";
  setSelect($<HTMLSelectElement>("model"), s.model);
  setSelect($<HTMLSelectElement>("image-model"), s.imageModel);
  $<HTMLInputElement>("web-search").checked = s.webSearch;
  markSize();
  dialog.showModal();
}
function wireSettings() {
  const model = $<HTMLSelectElement>("model"), imageModel = $<HTMLSelectElement>("image-model");
  for (const m of CHAT_MODELS) model.add(new Option(m.label, m.id));
  for (const m of IMAGE_MODELS) imageModel.add(new Option(m.label, m.id));
  $("btn-settings").onclick = openSettings;
  $("release").textContent = `(release ${release.commit}, ${release.builtAt})`;
  $("btn-style").onclick = () => { markStyle(); $<HTMLDialogElement>("style-dialog").showModal(); };
  $("btn-signin").onclick = () => beginSignIn();
  $("btn-signin-2").onclick = () => beginSignIn();
  // Saved as the person changes anything, so nothing depends on how the dialog is closed.
  $("style").addEventListener("change", saveStyle);
  $("style").addEventListener("input", saveStyle);
  for (const b of document.querySelectorAll<HTMLElement>(".sizes button")) {
    b.onclick = () => { lsSet("size", b.dataset.size!); applyTextSize(); markSize(); };
  }
  dialog.addEventListener("close", () => {
    lsSet("key", $<HTMLInputElement>("key").value.trim() || null);
    lsSet("model", model.value);
    lsSet("image-model", imageModel.value);
    lsSet("web-search", $<HTMLInputElement>("web-search").checked ? "on" : "off");
    renderWelcome();
  });
  $("key-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const k = $<HTMLInputElement>("key-first").value.trim();
    if (!k) return;
    lsSet("key", k);
    renderWelcome();
    input.focus();
  });
  $("btn-share").onclick = async () => {
    const k = $<HTMLInputElement>("key").value.trim();
    if (!k) { $("share-status").textContent = "Enter a key first."; return; }
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}#k=${encodeURIComponent(k)}&m=${encodeURIComponent(model.value)}`);
    $("share-status").textContent = "Copied. Anyone with this link can spend on your key.";
  };
  $("btn-export").onclick = () => download("deathbot-conversation.json", JSON.stringify(state, null, 1), "application/json");
  $("btn-erase").onclick = async () => {
    if (!confirm("Erase the conversation, notes, documents, pictures, photo and health records from this browser? This cannot be undone.")) return;
    state = empty();
    await del(STATE_KEY);
    setRecords(null);
    renderThread();
    dialog.close();
  };
}

// ---------- start ----------

async function start() {
  readFragment();
  applyTextSize();
  wireSettings();
  renderThread(); // show the opening at once; storage can be slow or unavailable

  $("composer").addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  // On a keyboard, Enter sends. On a touch screen Enter makes a new line and the Send button sends.
  const touch = matchMedia("(pointer: coarse)").matches;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !touch) { e.preventDefault(); send(input.value); }
  });
  input.addEventListener("input", fitInput);
  wireDictation();
  $("stop").onclick = () => abort?.abort();
  $<HTMLInputElement>("file-input").addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.files) attach(t.files);
    t.value = "";
  });
  for (const c of document.querySelectorAll<HTMLButtonElement>(".starter")) c.onclick = () => send(c.textContent ?? "");
  fileBtn.onclick = () => setFileOpen(!filePanel.classList.contains("open"));
  $("btn-file-close").onclick = () => setFileOpen(false);
  $("reader-close").onclick = () => reader.close();

  // Returning from "Sign in with OpenRouter"?
  try {
    const key = await completeSignIn();
    if (key) { lsSet("key", key); renderWelcome(); }
  } catch (e) {
    console.warn("Sign-in could not be completed.", e);
  }

  try {
    records = (await get<Provider[]>(RECORDS_KEY)) ?? null;
  } catch (e) {
    console.warn("Could not read saved health records.", e);
  }
  try {
    const saved = await get<Saved>(STATE_KEY);
    if (saved && !state.messages.length) {
      state = { ...empty(), ...saved };
      renderThread();
      scroller.scrollTop = scroller.scrollHeight;
      // A message left unanswered (the page was closed, or the service was down) can be picked up from here.
      if (state.messages[state.messages.length - 1]?.role === "user" && getSettings().apiKey) showError("Your last message has no reply yet.", "Get a reply", answer);
    } else {
      renderFile();
    }
  } catch (e) {
    console.warn("Could not read saved conversation; continuing without it.", e);
  }
}
start();
