// The working notes: one markdown file that Deathbot keeps with the notes tool, the way a model edits any text
// file (view, replace an exact passage, insert lines). The page shows it under Your file and reads the map of
// the conversation from its "Where we are" list. Used by the page and by the simulator, so both behave alike.
import { areas } from "./skill";
import type { ProgressStatus } from "./tools";

const MAP_HEADING = "## Where we are";
const STATUSES: Record<string, ProgressStatus> = { open: "open", started: "started", done: "done", "set aside": "set_aside", set_aside: "set_aside" };

/** A new file: the sections worth keeping, empty, and every area of the map not yet started. */
export function noteTemplate(): string {
  return [
    "# Working notes",
    "",
    "## Who is taking part",
    "",
    "## About them",
    "",
    "## Health, as they understand it",
    "",
    "## What matters most",
    "",
    "## Treatments",
    "",
    "## Who would speak for them",
    "",
    "## Open threads",
    "",
    MAP_HEADING,
    ...areas.map((a) => `- ${a.id}: open`),
    "Suggested next:",
    "",
  ].join("\n");
}

/** Builds a file from notes and a map kept the earlier way, so older conversations carry on. */
export function fromLegacy(notes: string, progress: Record<string, { status: string; summary?: string; title?: string }>, next: string[]): string {
  const ids = [...areas.map((a) => a.id), ...Object.keys(progress).filter((id) => !areas.some((a) => a.id === id))];
  const line = (id: string) => {
    const p = progress[id];
    const custom = !areas.some((a) => a.id === id);
    return `- ${id}${custom ? ` (${p?.title ?? id})` : ""}: ${(p?.status ?? "open").replace("_", " ")}${p?.summary ? ` — ${p.summary}` : ""}`;
  };
  return ["# Working notes", "", notes.trim() || "(nothing yet)", "", MAP_HEADING, ...ids.map(line), `Suggested next: ${next.join(", ")}`, ""].join("\n");
}

export interface ParsedNotes { notes: string; progress: Record<string, { status: ProgressStatus; summary?: string; title?: string }>; next: string[] }

/** Splits the file into the notes the person reads and the map the page draws. */
export function parseNotes(doc: string): ParsedNotes {
  const at = doc.indexOf(MAP_HEADING);
  const notes = (at < 0 ? doc : doc.slice(0, at)).trim();
  const progress: ParsedNotes["progress"] = {};
  let next: string[] = [];
  if (at >= 0) {
    const rest = doc.slice(at + MAP_HEADING.length);
    const end = rest.search(/\n#{1,2} /);
    for (const raw of (end < 0 ? rest : rest.slice(0, end)).split("\n")) {
      const l = raw.trim();
      const n = /^suggested next:\s*(.*)$/i.exec(l);
      if (n) { next = n[1].split(/[,;]/).map((x) => x.trim()).filter(Boolean).slice(0, 2); continue; }
      const m = /^[-*]\s*([\w-]+)\s*(?:\(([^)]*)\))?\s*:\s*(open|started|done|set aside|set_aside)\b\s*(?:[—–-]\s*(.*))?$/i.exec(l);
      if (!m) continue;
      progress[m[1]] = { status: STATUSES[m[3].toLowerCase()], ...(m[4] ? { summary: m[4].trim() } : {}), ...(m[2] ? { title: m[2].trim() } : {}) };
    }
  }
  return { notes, progress, next };
}

/** Applies one notes-tool call. Returns the new file and the result for the model; an edit that cannot apply throws. */
export function editNotes(doc: string, input: any): { doc: string; result: string } {
  const command = input?.command;
  if (command === "view") return { doc, result: doc.split("\n").map((l, i) => `${String(i + 1).padStart(4)}  ${l}`).join("\n") };
  if (command === "str_replace") {
    const oldStr = String(input.old_str ?? ""), newStr = String(input.new_str ?? "");
    if (!oldStr) throw new Error("str_replace needs old_str: the exact text to replace, copied from the file.");
    const count = doc.split(oldStr).length - 1;
    if (count === 0) throw new Error("old_str was not found in the notes. Copy it exactly from the current file (use view to see it).");
    if (count > 1) throw new Error(`old_str matches ${count} places in the notes. Include more of the surrounding text so it matches once.`);
    return { doc: doc.replace(oldStr, () => newStr), result: "Edited." };
  }
  if (command === "insert") {
    const lines = doc.split("\n");
    const after = Number(input.insert_line);
    if (!Number.isInteger(after) || after < 0 || after > lines.length) throw new Error(`insert_line must be a line number from 0 to ${lines.length} (0 inserts at the top).`);
    lines.splice(after, 0, String(input.new_str ?? ""));
    return { doc: lines.join("\n"), result: "Inserted." };
  }
  throw new Error('command must be "view", "str_replace" or "insert".');
}

/** The harness note that gives the model the current file. */
export const notesNote = (doc: string) => `[Harness note: your working notes, as of now. Keep them with the notes tool.\n${doc}]`;
