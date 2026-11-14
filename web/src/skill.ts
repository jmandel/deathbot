import bundle from "./skill.generated.json";

export const skillFiles: Record<string, string> = bundle.files;
export const environment: string = bundle.environment;
export const release: { commit: string; builtAt: string } = bundle.release;

/** One area of the conversation, from the skill's map.json. */
export interface Area { id: string; title: string; start: string; covers?: string; optional?: boolean }
export const areas: Area[] = bundle.map.areas;

/** Guides loaded into the system prompt up front; everything else is read on demand. */
const PRELOADED = [
  "guide/voice.md",
  "guide/conversation.md",
  "guide/safety.md",
  "guide/information.md",
  "guide/failure-cases.md",
  "cards/INDEX.md",
];

function stripFrontmatter(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n/, "");
}

export function cardTitle(file: string): string {
  const m = (skillFiles[file] ?? "").match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : file;
}

/**
 * A fact card as shown to a person. Cards are written for the model: two sections and the "Layer" labels
 * are guidance for it, not reading for the patient, so they are left out here.
 */
export function cardForPerson(file: string): string {
  const out: string[] = [];
  let skipping = false;
  for (const line of (skillFiles[file] ?? "").split("\n")) {
    if (/^##\s/.test(line)) skipping = /^##\s+(Applying this to one person|Not verified|Left for other cards)/i.test(line);
    if (skipping || /^\*?\(?Layer \d[^\n]*\*?$/i.test(line.trim())) continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

/** The text of one section of a skill file, from its heading to the next heading of the same or higher level. */
export function skillSection(file: string, heading: string): string {
  const lines = (skillFiles[file] ?? "").split("\n");
  const start = lines.findIndex((l) => /^#+\s/.test(l) && l.replace(/^#+\s+/, "").trim() === heading);
  if (start < 0) return "";
  const level = lines[start].match(/^#+/)![0].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= level) { end = i; break; }
  }
  return lines.slice(start, end).join("\n").trim();
}

export function listCards(): string[] {
  return Object.keys(skillFiles)
    .filter((f) => f.startsWith("cards/") && !f.endsWith("INDEX.md"))
    .sort();
}

/** Every URL that appears in a fact card. show_video only accepts these. */
export const knownUrls: Set<string> = new Set(
  Object.entries(skillFiles).filter(([f]) => f.startsWith("cards/"))
    .flatMap(([, t]) => t.match(/https?:\/\/[^\s)>\]"']+/g) ?? []).map(normaliseUrl),
);

export function normaliseUrl(u: string): string {
  return u.replace(/[.,;]+$/, "").replace(/\/$/, "");
}

/** The system prompt is byte-stable for a given build and settings, so it caches across turns. */
export function buildSystemPrompt(opts: { webSearch: boolean }): string {
  // Each conditional block sits on its own lines; drop the markers (and the block, if it does not apply) without leaving gaps.
  const env = environment.replace(/<!--WEB:(on|off)-->\n([\s\S]*?)<!--\/WEB-->\n/g, (_m, which, body) =>
    (which === "on") === opts.webSearch ? body : "")
    .replace("<!--MAP-->", areas.map((a) => `| \`${a.id}\` | ${a.title}${a.optional ? " (optional)" : ""} |`).join("\n"));
  const onDemand = Object.keys(skillFiles)
    .filter((f) => f !== "SKILL.md" && !PRELOADED.includes(f) && !(f.startsWith("states/") && f !== "states/INDEX.md"))
    .sort()
    .map((f) => `- \`${f}\`${f.startsWith("cards/") ? ` (${cardTitle(f)})` : ""}`)
    .join("\n")
    + (Object.keys(skillFiles).some((f) => /^states\/[a-z]{2}\.md$/.test(f)) ? "\n- `states/<code>.md`, one per state and DC, by two-letter code (for example `states/ny.md`)" : "");
  const preloaded = PRELOADED.filter((f) => skillFiles[f])
    .map((f) => `<skill_file path="${f}">\n${skillFiles[f]}\n</skill_file>`)
    .join("\n\n");
  return [
    "You are running the Deathbot skill. Three things follow: the skill, which says what to do and why; a description of your environment, which says how things work here and what is true here; and the skill's core guides, already loaded for you.",
    `<skill>\n${stripFrontmatter(skillFiles["SKILL.md"] ?? "")}\n</skill>`,
    `<environment>\n${env}\n</environment>`,
    `The following skill files are already loaded; you do not need to read them again.\n\n${preloaded}`,
    `These skill files are available through the read_skill_file tool. Read a card before giving figures on its topic.\n\n${onDemand}`,
  ].join("\n\n");
}
