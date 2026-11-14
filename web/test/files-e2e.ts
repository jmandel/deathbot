// Checks how attachments are handled, without calling any AI service: short files go into the message,
// long ones and JSON are stored in the browser and readable through the file tools.
// Run: bun run build.ts && bun test/files-e2e.ts DIR   (DIR holds big.pdf, small.pdf, big.txt, labs.json)
import path from "node:path";
import { launch } from "./browser";
import { readPdfPages, readFile, searchFiles, type StoredFile } from "../src/files";

const dir = process.argv[2];
const dist = path.join(import.meta.dir, "..", "dist");
const PORT = 4177;
// A stand-in for OpenRouter: first it asks for pages 5-6 of the stored PDF as images, then it answers.
function sse(items: any[]): Response {
  const ev = [...items.map((item) => ({ type: "response.output_item.done", item })), { type: "response.completed", response: { status: "completed" } }];
  return new Response(ev.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "Content-Type": "text/event-stream" } });
}
let pdfId = "file-1";
const requests: any[] = [];
const server = Bun.serve({ port: PORT, async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname === "/api/v1/chat/completions") return Response.json({ choices: [{ message: { content: '{"items":[],"next":[]}' } }] }); // bookkeeping pass
  if (u.pathname === "/api/v1/responses") {
    requests.push(await req.json());
    if (requests.length === 1) return sse([{ type: "function_call", call_id: "c1", name: "read_pdf_pages", arguments: JSON.stringify({ id: pdfId, from: 5, to: 6, as_images: true }) }]);
    return sse([{ type: "message", role: "assistant", content: [{ type: "output_text", text: "Read them.", annotations: [] }] }]);
  }
  const f = Bun.file(path.join(dist, u.pathname === "/" ? "index.html" : u.pathname));
  return (await f.exists()) ? new Response(f) : new Response("not found", { status: 404 });
} });
const browser = await launch();
const { send, evaluate } = browser;
let failed = 0;
const check = (ok: boolean, what: string) => { console.log(`${ok ? "ok  " : "FAIL"} ${what}`); if (!ok) failed++; };
try {
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
  await Bun.sleep(800);
  await evaluate(`localStorage.setItem("deathbot-key","sk-or-test");localStorage.setItem("deathbot-api-base", location.origin + "/api/v1")`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
  await Bun.sleep(1200);
  const types: Record<string, string> = { pdf: "application/pdf", txt: "text/plain", json: "application/json" };
  const files = ["big.pdf", "small.pdf", "big.txt", "labs.json"];
  const payload = await Promise.all(files.map(async (n) => ({ n, t: types[n.split(".").pop()!], b: Buffer.from(await Bun.file(path.join(dir, n)).arrayBuffer()).toString("base64") })));
  await evaluate(`(()=>{const dt=new DataTransfer();for(const f of ${JSON.stringify(payload)}) dt.items.add(new File([Uint8Array.from(atob(f.b),c=>c.charCodeAt(0))],f.n,{type:f.t}));const i=document.getElementById("file-input");i.files=dt.files;i.dispatchEvent(new Event("change"));})()`);
  await Bun.sleep(6000); // pdf.js reads 120 pages
  const chips = await evaluate(`document.getElementById("attachments").innerText`);
  check(files.every((n) => chips.includes(n)), `all four files show as attached (${chips.replace(/\s+/g, " ")})`);
  const stored: StoredFile[] = JSON.parse(await evaluate(`new Promise((res)=>{const r=indexedDB.open("keyval-store");r.onsuccess=()=>{const g=r.result.transaction("keyval").objectStore("keyval").get("deathbot-files-v1");g.onsuccess=()=>res(JSON.stringify(g.result ?? []))}})`));
  const names = stored.map((f) => f.name).sort();
  check(JSON.stringify(names) === JSON.stringify(["big.pdf", "big.txt", "labs.json"]), `the long PDF, long text and JSON are stored; the short PDF is not (stored: ${names.join(", ")})`);
  const pdf = stored.find((f) => f.name === "big.pdf")!;
  check(pdf?.kind === "pdf" && pdf.pages === 120, `the long PDF is stored as text with its 120 pages (${pdf?.pages})`);
  const pages = readPdfPages(stored, pdf.id, 5, 6);
  check(pages.includes("--- page 5 ---") && pages.includes("--- page 6 ---") && !pages.includes("--- page 7 ---"), "read_pdf_pages returns exactly pages 5-6");
  check(readPdfPages(stored, pdf.id, 1, 120).includes("continue from page 21"), "read_pdf_pages stops at 20 pages and says where to continue");
  const txt = stored.find((f) => f.name === "big.txt")!;
  check(readFile(stored, txt.id).includes("More follows: call again with offset 40000"), "read_file pages a long file");
  check(!readFile(stored, txt.id, 0, true).includes("More follows"), "read_file with whole returns the entire file");
  check(searchFiles(stored, "creatinine").includes(stored.find((f) => f.name === "labs.json")!.id), "search_files finds text in the JSON file");
  check(await evaluate(`new Promise((res)=>{const r=indexedDB.open("keyval-store");r.onsuccess=()=>{const g=r.result.transaction("keyval").objectStore("keyval").get("deathbot-files-v1");g.onsuccess=()=>res(g.result.find(f=>f.kind==="pdf").data instanceof Blob)}})`), "the stored PDF keeps its original file for drawing pages");
  await evaluate(`document.getElementById("btn-file").click()`);
  await Bun.sleep(400);
  check((await evaluate(`document.getElementById("file-body").innerText`)).includes("Files you've shared"), "Your file lists the stored files");
  await evaluate(`document.getElementById("btn-file-close").click()`);

  // Send the message; the stand-in asks for pages as images, and the app's next request should carry them.
  pdfId = pdf.id;
  await evaluate(`(()=>{const i=document.getElementById("input");i.value="Here are my files.";document.getElementById("composer").requestSubmit();})()`);
  for (let t = 0; t < 60 && requests.length < 2; t++) await Bun.sleep(500);
  const sent = requests[0]?.input?.find((m: any) => m.type === "message" && m.role === "user");
  const sentText = JSON.stringify(sent ?? {});
  check(sentText.includes("small.pdf") && sentText.includes('"type":"input_file"'), "the short PDF goes into the message whole");
  check(sentText.includes("Use search_files and read_file") && !sentText.includes("Progress note line 40 on page 90"), "the long files go in as notes, not whole");
  const toolMsg = requests[1]?.input?.find((m: any) => m.type === "function_call_output");
  const imgs = Array.isArray(toolMsg?.output) ? toolMsg.output.filter((p: any) => p.type === "input_image") : [];
  check(imgs.length === 2 && imgs.every((p: any) => p.image_url.startsWith("data:image/jpeg;base64,") && p.image_url.length > 20000), `read_pdf_pages with as_images returns 2 page images in the tool result (${imgs.length})`);
  if (imgs[0]) await Bun.write(path.join(dir, "rendered-page-5.jpg"), Buffer.from(imgs[0].image_url.split(",")[1], "base64"));
} catch (e) {
  console.log("FAIL", e instanceof Error ? e.message : e); failed++;
} finally {
  await browser.close(); server.stop(true);
}
console.log(failed ? `${failed} failed` : "all checks passed");
process.exit(failed ? 1 : 0);
