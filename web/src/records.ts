// Health records from health-skillz (https://health-skillz.joshuamandel.com). The person connects their
// patient portal there, downloads a records file, and gives it to this page. The file is kept in the
// browser and exposed to the model through overview / search / list / read, so the whole file is never
// sent as text: only the overview and the parts the model looks up go to the AI service.

/** Where the person goes to get their records file. */
export const RECORDS_URL = "https://health-skillz.joshuamandel.com";

export interface Attachment { source?: { resourceType?: string; resourceId?: string }; bestEffortPlaintext?: string | null }
export interface Provider { name: string; fetchedAt?: string; fhir: Record<string, any[]>; attachments: Attachment[] }

/** Accepts a health-skillz session payload, a records download, or a single provider object. */
export function normalise(json: unknown): Provider[] | null {
  const list: any[] = Array.isArray(json) ? json : Array.isArray((json as any)?.providers) ? (json as any).providers : [json];
  const out: Provider[] = [];
  for (const p of list) {
    if (!p || typeof p !== "object" || !p.fhir || typeof p.fhir !== "object") continue;
    out.push({
      name: String(p.name ?? p.provider ?? "Health records"),
      fetchedAt: p.fetchedAt ?? p.connectedAt,
      fhir: p.fhir,
      attachments: Array.isArray(p.attachments) ? p.attachments : [],
    });
  }
  return out.length ? out : null;
}

// ---------- reading FHIR loosely: enough to describe a resource in a line ----------

const concept = (c: any): string => c?.text ?? c?.coding?.find((x: any) => x.display)?.display ?? c?.coding?.[0]?.code ?? "";
function when(r: any): string {
  const d = r.effectiveDateTime ?? r.effectivePeriod?.start ?? r.onsetDateTime ?? r.recordedDate ?? r.authoredOn ?? r.performedDateTime
    ?? r.performedPeriod?.start ?? r.period?.start ?? r.occurrenceDateTime ?? r.date ?? r.issued ?? r.created ?? r.meta?.lastUpdated ?? "";
  return String(d).slice(0, 10);
}
function value(r: any): string {
  if (r.valueQuantity) return `${r.valueQuantity.value} ${r.valueQuantity.unit ?? ""}`.trim();
  if (r.valueString) return r.valueString;
  if (r.valueCodeableConcept) return concept(r.valueCodeableConcept);
  if (Array.isArray(r.component)) return r.component.map((c: any) => `${concept(c.code)} ${c.valueQuantity?.value ?? ""} ${c.valueQuantity?.unit ?? ""}`.trim()).join("; ");
  return "";
}
function title(r: any): string {
  return concept(r.code) || concept(r.medicationCodeableConcept) || r.medicationReference?.display || concept(r.vaccineCode)
    || concept(r.type?.[0] ?? r.type) || concept(r.class) || r.description || r.title || r.name?.[0]?.text || r.resourceType || "";
}
const status = (r: any): string => concept(r.clinicalStatus) || (typeof r.status === "string" ? r.status : "");
function line(r: any): string {
  return [when(r), title(r), value(r), status(r)].filter(Boolean).join(" | ");
}
const newestFirst = (a: any, b: any) => when(b).localeCompare(when(a));

interface Note { id: string; provider: number; date: string; kind: string; text: string }
function notes(records: Provider[]): Note[] {
  const out: Note[] = [];
  records.forEach((p, pi) => {
    const docs = new Map<string, any>((p.fhir.DocumentReference ?? []).concat(p.fhir.DiagnosticReport ?? []).map((d: any) => [d.id, d]));
    p.attachments.forEach((a, ai) => {
      const text = a.bestEffortPlaintext?.trim();
      if (!text) return;
      const doc = docs.get(a.source?.resourceId ?? "");
      out.push({ id: `note-${pi}-${ai}`, provider: pi, date: doc ? when(doc) : "", kind: doc ? title(doc) : "Note", text });
    });
  });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

function ageFrom(birthDate?: string): string {
  if (!birthDate) return "";
  const years = Math.floor((Date.now() - Date.parse(birthDate)) / 31_557_600_000);
  return Number.isFinite(years) ? `${years} years old` : "";
}

/** A compact picture of what is in the records, for the model. */
export function overview(records: Provider[]): string {
  const out: string[] = [];
  records.forEach((p, pi) => {
    const pt = p.fhir.Patient?.[0];
    out.push(`## ${p.name} (source ${pi})${p.fetchedAt ? `, fetched ${String(p.fetchedAt).slice(0, 10)}` : ""}`);
    if (pt) out.push(`Patient: ${[pt.gender, ageFrom(pt.birthDate)].filter(Boolean).join(", ") || "details not given"}`);
    const counts = Object.entries(p.fhir).filter(([, v]) => Array.isArray(v) && v.length).map(([k, v]) => `${k} ${v.length}`);
    out.push(`Resource counts: ${counts.join(", ")}`);
    const section = (label: string, type: string, max: number, filter: (r: any) => boolean = () => true) => {
      const all = (p.fhir[type] ?? []).filter(filter).sort(newestFirst);
      if (!all.length) return;
      // The same problem is often recorded many times; show each once, newest first.
      const seen = new Set<string>();
      const lines = all.filter((r) => { const t = title(r).toLowerCase(); if (seen.has(t)) return false; seen.add(t); return true; }).slice(0, max).map((r) => `- ${line(r)}`);
      out.push(`${label}:`, ...lines);
      if (seen.size > max) out.push(`- (and ${seen.size - max} more; use list_health_records)`);
    };
    section("Conditions", "Condition", 40);
    section("Medicines (active)", "MedicationRequest", 30, (r) => !r.status || r.status === "active");
    section("Allergies", "AllergyIntolerance", 15);
    section("Procedures", "Procedure", 15);
    section("Recent encounters", "Encounter", 12);
  });
  const ns = notes(records);
  if (ns.length) {
    out.push(`## Clinical notes: ${ns.length} with readable text (newest first)`);
    out.push(...ns.slice(0, 40).map((n) => `- ${n.id} | ${n.date} | ${n.kind} | ${n.text.length} characters`));
    if (ns.length > 40) out.push(`- (and ${ns.length - 40} older; use search_health_records)`);
  }
  return out.join("\n");
}

/** A one-line description of what is loaded, for the person. */
export function summary(records: Provider[]): string {
  const n = notes(records).length;
  return records.map((p) => p.name).join(", ") + ` (${n} clinical note${n === 1 ? "" : "s"})`;
}

/** Keyword search over notes and structured entries. Every word must appear. */
export function search(records: Provider[], query: string): string {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return "Give one or more words to search for.";
  const hits: string[] = [];
  for (const n of notes(records)) {
    const low = n.text.toLowerCase();
    if (!words.every((w) => low.includes(w))) continue;
    const at = Math.max(0, low.indexOf(words[0]) - 160);
    hits.push(`- ${n.id} | ${n.date} | ${n.kind}\n  …${n.text.slice(at, at + 400).replace(/\s+/g, " ")}…`);
    if (hits.length >= 10) break;
  }
  const structured: string[] = [];
  records.forEach((p, pi) => {
    for (const [type, list] of Object.entries(p.fhir)) {
      if (!Array.isArray(list) || type === "DocumentReference") continue;
      for (const r of list) {
        const l = line(r);
        if (words.every((w) => l.toLowerCase().includes(w))) structured.push(`- ${type}/${r.id} (source ${pi}) | ${l}`);
        if (structured.length >= 25) return;
      }
    }
  });
  if (!hits.length && !structured.length) return `Nothing in the records matches "${query}". Try a different word, or a shorter one.`;
  return [hits.length ? `Notes mentioning it (read one with read_health_record):\n${hits.join("\n")}` : "", structured.length ? `Structured entries:\n${structured.join("\n")}` : ""].filter(Boolean).join("\n\n");
}

/** One line per entry of a resource type, newest first. */
export function list(records: Provider[], type: string, contains = ""): string {
  const want = contains.toLowerCase();
  const lines: string[] = [];
  let total = 0;
  records.forEach((p, pi) => {
    const key = Object.keys(p.fhir).find((k) => k.toLowerCase() === type.toLowerCase());
    for (const r of [...(key ? p.fhir[key] : [])].sort(newestFirst)) {
      const l = line(r);
      if (want && !l.toLowerCase().includes(want)) continue;
      total++;
      if (lines.length < 80) lines.push(`- ${key}/${r.id} (source ${pi}) | ${l}`);
    }
  });
  if (!total) {
    const types = [...new Set(records.flatMap((p) => Object.keys(p.fhir).filter((k) => p.fhir[k]?.length)))];
    return `No ${type} entries${contains ? ` containing "${contains}"` : ""}. Types present: ${types.join(", ")}.`;
  }
  return `${total} entr${total === 1 ? "y" : "ies"}${total > lines.length ? `, showing the newest ${lines.length}` : ""}:\n${lines.join("\n")}`;
}

/** The text of one note (in pages), or one structured entry as JSON. */
export function read(records: Provider[], id: string, offset = 0): string {
  const note = notes(records).find((n) => n.id === id);
  if (note) {
    const page = 12_000, chunk = note.text.slice(offset, offset + page);
    const more = offset + page < note.text.length ? `\n\n(More follows: call again with offset ${offset + page}. Total ${note.text.length} characters.)` : "";
    return `${note.kind}, ${note.date || "undated"}, from ${records[note.provider].name}\n\n${chunk}${more}`;
  }
  const m = id.match(/^(\w+)\/(.+)$/);
  if (m) {
    for (const p of records) {
      const r = (p.fhir[m[1]] ?? []).find((x: any) => x.id === m[2]);
      if (r) { const j = JSON.stringify(r, null, 1); return j.length > 8000 ? `${j.slice(0, 8000)}\n(Cut off at 8,000 of ${j.length} characters.)` : j; }
    }
  }
  return `No record with id "${id}". Use the ids given by the overview, search or list.`;
}
