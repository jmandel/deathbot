import { skillFiles, knownUrls, normaliseUrl, listCards, cardTitle, areas } from "./skill";
import { generateImage, type Settings, type Part } from "./agent";
import { overview, search, list, read, type Provider } from "./records";
import { listFiles, searchFiles, readFile, readPdfPages, renderPdfPages, MAX_IMAGE_PAGES, type StoredFile } from "./files";
import { editNotes } from "./notes";

export interface DocumentItem { kind: string; title: string; markdown: string; savedAt: number }
export interface VideoItem { url: string; title: string; note: string }
export type ProgressStatus = "open" | "started" | "done" | "set_aside";
export interface ProgressUpdate { id: string; status: ProgressStatus; summary?: string; title?: string }
export interface SceneItem { title: string; caption: string; dataUrl: string; personalised: boolean }

/**
 * What the UI must provide. Cards, videos and documents are drawn in the conversation straight
 * from the tool call's arguments, so only notes and generated pictures need storing.
 */
export interface Surface {
  setNotes(markdown: string): void;
  /** The working notes file, which the notes tool reads and edits. */
  getNotesFile(): string;
  setNotesFile(doc: string): void;
  /** Ids of items already on the progress map, including ones the model added. */
  progressIds(): string[];
  /** Applies changes to the progress map and replaces the suggested next steps. */
  setProgress(items: ProgressUpdate[], next: string[]): void;
  showScenes(callId: string, items: SceneItem[]): void;
  /** Data URL of the photo the person has chosen to share for images, if any. */
  getPhoto(): string | null;
  /** Health records loaded in this browser, if any. */
  getRecords(): Provider[] | null;
  /** Long files and JSON the person shared, kept in this browser as text. */
  getFiles(): StoredFile[];
}
export interface ToolContext { settings: Settings; callId: string; knownProgressIds: string[]; onStatus(text: string | null): void; signal?: AbortSignal }

/** Resolves a card path the model gave to a real card file, or null. */
export function cardFile(p: unknown): string | null {
  if (typeof p !== "string") return null;
  const clean = p.replace(/^\.?\/+/, "").replace(/^skill\/deathbot\//, "");
  return clean.startsWith("cards/") && clean in skillFiles ? clean : null;
}

const str = { type: "string" } as const;
const fn = (name: string, description: string, properties: Record<string, unknown>, required: string[]) =>
  ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });

/** Tools the browser runs. Web search is added separately as an OpenRouter server tool. */
export const clientTools = [
  fn("read_skill_file", "Returns the text of a file from the Deathbot skill (a fact card, a template or a guide). The person does not see it.",
    { path: { ...str, description: "Path relative to the skill, e.g. cards/cpr.md" } }, ["path"]),
  fn("notes", "Your working notes: one markdown file the person can see under Your file, and the map of the conversation in its \"Where we are\" list. view shows it with line numbers; str_replace replaces old_str, which must match exactly one place, with new_str; insert puts new_str after line insert_line (0 for the top). The current file comes with the person's message whenever it has changed.",
    {
      command: { type: "string", enum: ["view", "str_replace", "insert"] },
      old_str: { ...str, description: "For str_replace: the exact text to replace, copied from the file" },
      new_str: { ...str, description: "For str_replace and insert: the new text" },
      insert_line: { type: "integer", description: "For insert: the line to insert after" },
    }, ["command"]),
  fn("reply", "Says something to the person, with anything you want to show them alongside it. This ends your turn: the page shows the reply and waits for the person. Tool calls in the same response still run, but you see their results only on your next turn, so read what you need before replying.",
    {
      text: { ...str, description: "Your message to the person. Follow guide/voice.md; long formatted text belongs in a document." },
      replies: { type: "array", maxItems: 5, items: str, description: "Ready-made answers to what your message asks, each written as the person would say it. Shown as buttons under your message; tapping one sends it as their next message. See guide/conversation.md for when they help." },
      card: { ...str, description: "Optional: a fact card to show as a block the person can open and read, with its sources, e.g. cards/cpr.md" },
      video: { type: "object", description: "Optional: a video to embed. Only links that appear in a fact card are accepted.",
        properties: { url: str, title: str, note: { ...str, description: "One or two sentences shown above the video, saying what the person will see." } }, required: ["url", "title", "note"] },
      document: { type: "object", description: "Optional: a document shown with buttons to read, print, copy and download, and kept under Your file. Sending the same kind again replaces the earlier one there, except kind \"other\".",
        properties: { kind: { type: "string", enum: ["summary", "other"], description: "summary for \"What matters to me\"; other for anything else" }, title: str, markdown: str }, required: ["kind", "title", "markdown"] },
      scenes: { type: "object", description: "Optional: one to three pictures, drawn after your message is shown and shown together under it. Usually under a minute; gives up after two. Governed by guide/images.md in the skill.",
        properties: {
          pictures: { type: "array", minItems: 1, maxItems: 3, items: { type: "object", properties: {
            title: { ...str, description: "Short label, e.g. 'In intensive care on a breathing machine'" },
            prompt: { ...str, description: "The full prompt given to the image model" },
            caption: { ...str, description: "Text shown under the picture" },
          }, required: ["title", "prompt", "caption"] } },
          use_photo: { type: "boolean", description: "Base the pictures on the photo the person added. Ignored if they have not added one." },
        }, required: ["pictures", "use_photo"] },
      health_records: { type: "boolean", description: "Optional: show the two-step block for bringing in health records: a link to health-skillz, and a button to choose the downloaded records file. The records arrive later with one of the person's messages." },
    }, ["text"]),
  fn("search_health_records", "Searches the loaded health records (clinical notes and structured entries) for words. Returns matching notes with snippets, and matching entries.",
    { query: { ...str, description: "One or more words that must all appear, e.g. 'ejection fraction' or 'palliative'" } }, ["query"]),
  fn("list_health_records", "Lists entries of one kind from the loaded health records, newest first, one line each.",
    { type: { ...str, description: "A FHIR resource type, e.g. Condition, MedicationRequest, Observation, Encounter, Procedure, AllergyIntolerance, Immunization" },
      contains: { ...str, description: "Optional: only entries whose line contains this text, e.g. 'creatinine'" } }, ["type"]),
  fn("list_files", "Lists the files the person shared that are kept in this browser as text (too long to send whole, or JSON), with ids and sizes.", {}, []),
  fn("search_files", "Searches the stored files for passages containing all the given words. Returns snippets with the file id and the offset to read from.",
    { query: { ...str, description: "One or more words that must all appear near each other" } }, ["query"]),
  fn("read_file", "Reads a stored file: 40,000 characters (about 10,000 tokens) from an offset, or with whole set, the entire file up to 400,000 characters.",
    { id: { ...str, description: "File id, e.g. file-1" }, offset: { type: "integer", description: "Character offset to start from; default 0" }, whole: { type: "boolean", description: "Return the entire file in one go" } }, ["id"]),
  fn("read_pdf_pages", "Reads pages of a stored PDF by page number: as text (up to 20 pages per call), or with as_images, as pictures of the pages showing layout, tables and figures (up to 5 pages per call).",
    { id: { ...str, description: "File id, e.g. file-1" }, from: { type: "integer", description: "First page, counting from 1" }, to: { type: "integer", description: "Last page, inclusive" },
      as_images: { type: "boolean", description: "Return the pages as images instead of text" } }, ["id", "from", "to"]),
  fn("read_health_record", "Returns one item from the loaded health records: a clinical note by its id (e.g. note-0-12), in pages of 12,000 characters, or a structured entry (e.g. Observation/abc), cut off at 8,000 characters.",
    { id: str, offset: { type: "integer", description: "For long notes: character offset to continue from" } }, ["id"]),
];

const NO_RECORDS = "No health records are loaded in this browser. Use offer_health_records to show the person how to get their records file from health-skillz and give it to you.";

/** Image models return multi-megabyte PNGs. Re-encode as a modest JPEG so browser storage is not exhausted. */
export async function shrink(dataUrl: string, maxWidth = 1280): Promise<string> {
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = dataUrl; });
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = canvas.toDataURL("image/jpeg", 0.85);
    return out.length < dataUrl.length ? out : dataUrl;
  } catch {
    return dataUrl;
  }
}

/**
 * Whether an optional part of a reply was really given. Some models fill every optional field with an empty
 * placeholder (an empty string, an object of empty strings); a part counts only if what defines it is filled in.
 */
export function given(part: string, v: any): boolean {
  const filled = (x: unknown) => typeof x === "string" && x.trim().length > 0;
  switch (part) {
    case "card": return filled(v);
    case "video": return filled(v?.url);
    case "document": return filled(v?.markdown);
    case "scenes": return Array.isArray(v?.pictures) && v.pictures.some((p: any) => filled(p?.prompt));
    default: return false;
  }
}

function need(input: unknown, ...keys: string[]): Record<string, string> {
  if (!input || typeof input !== "object") throw new Error("input must be an object");
  const o = input as Record<string, unknown>;
  for (const k of keys) if (typeof o[k] !== "string" || !o[k]) throw new Error(`missing or invalid "${k}"`);
  return o as Record<string, string>;
}

function resolveSkillPath(p: string): string {
  const clean = p.replace(/^\.?\/+/, "").replace(/^skill\/deathbot\//, "");
  if (!(clean in skillFiles)) {
    throw new Error(`no such skill file: ${p}. Available cards: ${listCards().join(", ") || "none"}`);
  }
  return clean;
}

/** Runs one tool call. Returns the text for the tool result; throws on bad input. */
export async function runTool(name: string, input: unknown, ui: Surface, ctx: ToolContext): Promise<string | Part[]> {
  switch (name) {
    case "read_skill_file": {
      const file = resolveSkillPath(need(input, "path").path);
      if (file.startsWith("cards/")) ctx.onStatus(`Reading up on ${cardTitle(file).replace(/\s*\(.*\)$/, "")}`);
      return skillFiles[file];
    }
    case "notes": {
      const { doc, result } = editNotes(ui.getNotesFile(), input);
      if (doc !== ui.getNotesFile()) ui.setNotesFile(doc);
      return result;
    }
    case "reply": {
      // Each part is shown if it can be; the result tells the model, on its next turn, what was not.
      const o = input as { text?: unknown; card?: unknown; video?: unknown; document?: unknown; scenes?: { pictures?: unknown; use_photo?: unknown }; health_records?: unknown };
      if (typeof o?.text !== "string" || !o.text.trim()) throw new Error("reply needs text");
      const notes: string[] = ["Shown to the person."];
      const part = async (label: string, run: () => Promise<string | Part[]>) => {
        try { const r = await run(); if (typeof r === "string" && label === "pictures") notes.push(r); }
        catch (e) { notes.push(`The ${label} was not shown: ${e instanceof Error ? e.message : String(e)}`); }
      };
      if (given("card", o.card)) await part("card", () => runTool("show_card", { path: o.card }, ui, ctx));
      if (given("video", o.video)) await part("video", () => runTool("show_video", o.video, ui, ctx));
      if (given("document", o.document)) await part("document", () => runTool("show_document", o.document, ui, ctx));
      if (o.health_records === true) notes.push(ui.getRecords() ? `Health records are already loaded in this browser.\n\n${overview(ui.getRecords()!)}` : "The block for bringing in health records was shown. When the person gives you the file you will receive an overview, and the lookup tools will work.");
      if (given("scenes", o.scenes)) await part("pictures", () => runTool("show_scenes", { scenes: o.scenes?.pictures, use_photo: o.scenes?.use_photo }, ui, ctx));
      return notes.join(" ");
    }
    case "show_card": {
      const file = resolveSkillPath(need(input, "path").path);
      if (!file.startsWith("cards/")) throw new Error("show_card only shows files under cards/");
      return `Shown to the person: ${cardTitle(file)}`;
    }
    case "show_video": {
      const { url, title, note } = need(input, "url", "title", "note");
      if (!knownUrls.has(normaliseUrl(url))) {
        throw new Error("That link is not in a fact card, so it has not been checked and cannot be embedded. Use a link from a card, or give the link in your reply as ordinary text.");
      }
      void title; void note;
      return "Shown to the person.";
    }
    case "update_progress": {
      const o = input as { items?: unknown; next?: unknown };
      if (!Array.isArray(o?.items)) throw new Error("items must be a list");
      const items = o.items.map((it): ProgressUpdate => {
        const { id, status } = need(it, "id", "status");
        if (!["open", "started", "done", "set_aside"].includes(status)) throw new Error(`unknown status "${status}"`);
        const extra = it as { summary?: unknown; title?: unknown };
        if (!areas.some((a) => a.id === id) && typeof extra.title !== "string" && !ctx.knownProgressIds.includes(id)) throw new Error(`"${id}" is not a standard area, so it needs a title`);
        return { id, status: status as ProgressStatus, summary: typeof extra.summary === "string" ? extra.summary : undefined, title: typeof extra.title === "string" ? extra.title : undefined };
      });
      ui.setProgress(items, Array.isArray(o.next) ? o.next.filter((x): x is string => typeof x === "string").slice(0, 2) : []);
      return "Map updated.";
    }
    case "update_notes":
      ui.setNotes(need(input, "markdown").markdown);
      return "Notes updated. The person can see them under Your file.";
    case "show_document": {
      need(input, "kind", "title", "markdown");
      return "Shown to the person in the conversation, with buttons to print, copy and download. It is also kept under Your file.";
    }
    case "show_scenes": {
      const o = input as { scenes?: unknown; use_photo?: unknown };
      if (!Array.isArray(o?.scenes) || o.scenes.length < 1) throw new Error("show_scenes needs at least one scene");
      const scenes = o.scenes.slice(0, 3).map((s) => need(s, "title", "prompt", "caption"));
      const photo = o.use_photo === true ? ui.getPhoto() : null;
      ctx.onStatus(`Drawing ${scenes.length} pictures. This can take a minute…`);
      const results = await Promise.allSettled(scenes.map(async (s) => {
        const made = await generateImage(ctx.settings, s.prompt, photo, ctx.signal);
        return { dataUrl: await shrink(made.dataUrl) };
      }));
      const shown: SceneItem[] = [];
      const failed: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") shown.push({ title: scenes[i].title, caption: scenes[i].caption, dataUrl: r.value.dataUrl, personalised: !!photo });
        else failed.push(`${scenes[i].title}: ${r.reason instanceof Error ? r.reason.message : r.reason}`);
      });
      if (!shown.length) throw new Error(`Could not make the pictures (${failed.join("; ") || "unknown error"}). Nothing was shown.`);
      ui.showScenes(ctx.callId, shown);
      const photoNote = o.use_photo === true && !photo ? " The person has not added a photo, so a generic person was drawn." : "";
      return `Shown in the conversation: ${shown.map((s) => s.title).join("; ")}.${failed.length ? ` Failed: ${failed.join("; ")}.` : ""}${photoNote} You cannot see the pictures.`;
    }
    case "offer_health_records":
      return ui.getRecords()
        ? `Health records are already loaded in this browser.\n\n${overview(ui.getRecords()!)}`
        : "Shown: a link to health-skillz and a button to choose the downloaded records file. Tell the person in a sentence or two what to do, then wait. When they give you the file you will receive an overview, and the lookup tools will work.";
    case "search_health_records": {
      const records = ui.getRecords();
      return records ? search(records, need(input, "query").query) : NO_RECORDS;
    }
    case "list_health_records": {
      const records = ui.getRecords();
      const o = input as { contains?: unknown };
      return records ? list(records, need(input, "type").type, typeof o.contains === "string" ? o.contains : "") : NO_RECORDS;
    }
    case "read_health_record": {
      const records = ui.getRecords();
      const o = input as { offset?: unknown };
      return records ? read(records, need(input, "id").id, typeof o.offset === "number" ? o.offset : 0) : NO_RECORDS;
    }
    case "list_files":
      return listFiles(ui.getFiles());
    case "search_files":
      return searchFiles(ui.getFiles(), need(input, "query").query);
    case "read_file": {
      const o = input as { offset?: unknown; whole?: unknown };
      return readFile(ui.getFiles(), need(input, "id").id, typeof o.offset === "number" ? o.offset : 0, o.whole === true);
    }
    case "read_pdf_pages": {
      const o = input as { from?: unknown; to?: unknown };
      if (typeof o.from !== "number" || typeof o.to !== "number") throw new Error("from and to must be page numbers");
      const id = need(input, "id").id;
      if ((input as { as_images?: unknown }).as_images !== true) return readPdfPages(ui.getFiles(), id, o.from, o.to);
      const f = ui.getFiles().find((x) => x.id === id);
      if (!f || f.kind !== "pdf") throw new Error(`no stored PDF with id "${id}"`);
      const { first, last, images } = await renderPdfPages(f, o.from, o.to);
      const more = last < Math.min(f.pages ?? last, o.to) ? ` At most ${MAX_IMAGE_PAGES} pages per call: continue from page ${last + 1}.` : "";
      return [{ type: "text", text: `${f.name}, pages ${first}-${last} of ${f.pages}, as images.${more}` }, ...images.map((url): Part => ({ type: "image_url", image_url: { url } }))];
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}
