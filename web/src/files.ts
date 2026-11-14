// Files the person gives us that are too long to send whole, and every JSON file that is not a health-skillz
// records file. They are kept in this browser as text and read by the model through list / search / read,
// so only what it looks up goes to the AI service. Shorter PDFs, text files and images go into the message
// itself instead, where a multimodal model sees PDF layout and pictures.

export interface StoredFile { id: string; name: string; kind: "pdf" | "text" | "json"; text: string; pages?: number; addedAt: number; /** The original PDF, for rendering pages as images. */ data?: Blob }

/** Files above this size (estimated tokens) are stored instead of sent whole with the message. */
export const INLINE_TOKEN_LIMIT = 50_000;
export const estimateTokens = (chars: number) => Math.ceil(chars / 4);

const PAGE = 40_000; // characters per read: about 10,000 tokens
const WHOLE_LIMIT = 400_000; // the most one "whole file" read returns: about 100,000 tokens

export function newId(files: StoredFile[]): string {
  let n = files.length + 1;
  while (files.some((f) => f.id === `file-${n}`)) n++;
  return `file-${n}`;
}

function describe(f: StoredFile): string {
  const size = `${f.text.length.toLocaleString("en-US")} characters, about ${estimateTokens(f.text.length).toLocaleString("en-US")} tokens`;
  return `${f.id}: ${f.name} (${f.kind === "pdf" ? `PDF, ${f.pages} pages` : f.kind}; ${size})`;
}

/** The note that goes into the person's message in place of the file. */
export function storedNote(f: StoredFile): string {
  const start = f.text.slice(0, 1500).trim();
  return `[Harness note: this file is too long to send whole, or is JSON, so it is kept in this browser as ${describe(f)}. ` +
    `${f.kind === "pdf" ? "Read its pages as text, or as images with read_pdf_pages and as_images when layout, a table or a figure matters. " : ""}` +
    `Use search_files and read_file with id "${f.id}" to read it. It begins:\n${start}${f.text.length > 1500 ? "\n…" : ""}]`;
}

export function listFiles(files: StoredFile[]): string {
  return files.length ? files.map(describe).join("\n") : "No files are stored in this browser.";
}

/** Passages containing every word of the query, with the offset to read from. */
export function searchFiles(files: StoredFile[], query: string): string {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return "Give one or more words to search for.";
  const hits: string[] = [];
  for (const f of files) {
    const lower = f.text.toLowerCase();
    let from = 0, count = 0;
    while (count < 8) {
      const i = lower.indexOf(words[0], from);
      if (i < 0) break;
      const window = lower.slice(Math.max(0, i - 400), i + 400);
      if (words.every((w) => window.includes(w))) {
        const start = Math.max(0, i - 200);
        hits.push(`${f.id} at offset ${start}: …${f.text.slice(start, i + 300).replace(/\s+/g, " ")}…`);
        count++;
      }
      from = i + words[0].length;
    }
  }
  return hits.length ? hits.join("\n\n") : `Nothing in the stored files contains all of: ${words.join(", ")}.`;
}

/** One page of a file from an offset, or the whole file (up to a limit) when whole is set. */
export function readFile(files: StoredFile[], id: string, offset = 0, whole = false): string {
  const f = files.find((x) => x.id === id);
  if (!f) return `No stored file with id "${id}". ${listFiles(files)}`;
  const size = whole ? WHOLE_LIMIT : PAGE;
  const chunk = f.text.slice(offset, offset + size);
  const end = offset + chunk.length;
  const more = end < f.text.length ? `\n\n(More follows: call again with offset ${end}. Total ${f.text.length} characters.)` : "";
  return `${f.name}, characters ${offset}-${end} of ${f.text.length}\n\n${chunk}${more}`;
}

/** The text of a PDF, page by page. pdf.js is loaded only when a large PDF arrives. */
async function openPdf(file: Blob) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", location.href).href;
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}

export async function pdfText(file: File): Promise<{ text: string; pages: number }> {
  const doc = await openPdf(file);
  const out: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const content = await (await doc.getPage(n)).getTextContent();
    const line = content.items.map((it: any) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : "")).join("");
    out.push(`--- page ${n} ---\n${line.trim()}`);
  }
  return { text: out.join("\n\n"), pages: doc.numPages };
}

/** Pages from..to (1-based, inclusive) of a stored PDF's text, at most 20 pages at a time. */
export function readPdfPages(files: StoredFile[], id: string, from: number, to: number): string {
  const f = files.find((x) => x.id === id);
  if (!f) return `No stored file with id "${id}". ${listFiles(files)}`;
  if (f.kind !== "pdf") return `${f.id} is not a PDF; use read_file.`;
  const total = f.pages ?? 0;
  const start = Math.max(1, Math.floor(from)), end = Math.min(total, Math.floor(to), start + 19);
  if (start > end) return `${f.name} has ${total} pages.`;
  const pages = f.text.split(/(?=--- page \d+ ---)/).slice(start - 1, end);
  const more = end < Math.min(total, Math.floor(to)) ? `\n\n(At most 20 pages per call: continue from page ${end + 1}.)` : "";
  return `${f.name}, pages ${start}-${end} of ${total} (text only)\n\n${pages.join("\n").trim()}${more}`;
}

/** Pages from..to of a stored PDF drawn as JPEG images (data URLs), at most 5 at a time, about 1100 pixels wide. */
export const MAX_IMAGE_PAGES = 5;
export async function renderPdfPages(f: StoredFile, from: number, to: number): Promise<{ first: number; last: number; images: string[] }> {
  if (!f.data) throw new Error(`${f.name} was stored without the original PDF, so its pages cannot be drawn; read its text with read_pdf_pages instead.`);
  const doc = await openPdf(f.data);
  const first = Math.max(1, Math.floor(from)), last = Math.min(doc.numPages, Math.floor(to), first + MAX_IMAGE_PAGES - 1);
  const images: string[] = [];
  for (let n = first; n <= last; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1100 / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
    await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.8));
  }
  return { first, last, images };
}
