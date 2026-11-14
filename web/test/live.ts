// Drives the built web app against the real OpenRouter service in headless Chromium.
// The key comes from the OPENROUTER_API_KEY environment variable and is never written to disk here.
// Run: OPENROUTER_API_KEY=... bun test/live.ts OUT_DIR "first message" "second message" ...
//   optional env: SITE (a published URL to test instead of the local build), MODEL, IMAGE_MODEL, WEB_SEARCH=on (off by default), PHOTO=/path/to/photo.jpg, ATTACH=/path/to/file.pdf (sent with the first message),
//   HEADED=1 to watch it, KEEP_OPEN=1 to leave the window open afterwards
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { launch } from "./browser";

const key = process.env.OPENROUTER_API_KEY;
if (!key) { console.error("set OPENROUTER_API_KEY"); process.exit(2); }
const [outDir, ...turns] = process.argv.slice(2);
if (!outDir || !turns.length) { console.error("usage: live.ts OUT_DIR message..."); process.exit(2); }
await mkdir(outDir, { recursive: true });

const dist = path.join(import.meta.dir, "..", "dist");
const PORT = 4176;
// SITE=https://… drives a published copy instead of the local build.
const SITE = process.env.SITE ?? `http://127.0.0.1:${PORT}/index.html`;
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const file = Bun.file(path.join(dist, url.pathname === "/" ? "index.html" : url.pathname));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});
const browser = await launch();
const { send, evaluate } = browser;
browser.onEvent((method, params) => {
  if (method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(params.type)) {
    console.log("[console]", params.args.map((a: any) => a.value ?? a.description).join(" ").slice(0, 400));
  }
  if (method === "Network.responseReceived" && params.response.url.includes("openrouter.ai") && params.response.status >= 400) {
    console.log("[http]", params.response.status, params.response.url);
  }
});
const shot = async (name: string) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  await Bun.write(path.join(outDir, name), Buffer.from(r.result.data, "base64"));
};

let code = 0;
try {
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  if (process.env.MOBILE === "1") await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 870, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: SITE });
  await Bun.sleep(800);
  const settings: Record<string, string> = { "deathbot-key": key };
  if (process.env.MODEL) settings["deathbot-model"] = process.env.MODEL;
  if (process.env.IMAGE_MODEL) settings["deathbot-image-model"] = process.env.IMAGE_MODEL;
  if (process.env.WEB_SEARCH === "on") settings["deathbot-web-search"] = "on";
  if (process.env.STYLE) settings["deathbot-style"] = process.env.STYLE;
  await evaluate(`(()=>{const s=${JSON.stringify(settings)};for(const k in s)localStorage.setItem(k,s[k]);})()`);
  await send("Page.navigate", { url: SITE });
  await Bun.sleep(1200);
  if (process.env.PHOTO) {
    const b64 = Buffer.from(await Bun.file(process.env.PHOTO).arrayBuffer()).toString("base64");
    const type = process.env.PHOTO.endsWith(".png") ? "image/png" : "image/jpeg";
    await evaluate(`(()=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob("${b64}"),c=>c.charCodeAt(0))],"me",{type:"${type}"}));const i=document.getElementById("photo");i.files=dt.files;i.dispatchEvent(new Event("change"));})()`);
    await Bun.sleep(500);
  }

  if (process.env.ATTACH) {
    const b64 = Buffer.from(await Bun.file(process.env.ATTACH).arrayBuffer()).toString("base64");
    const name = path.basename(process.env.ATTACH), type = name.endsWith(".pdf") ? "application/pdf" : name.endsWith(".json") ? "application/json" : /\.jpe?g$/.test(name) ? "image/jpeg" : name.endsWith(".png") ? "image/png" : "text/plain";
    await evaluate(`(()=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob("${b64}"),c=>c.charCodeAt(0))],${JSON.stringify(name)},{type:"${type}"}));const i=document.getElementById("file-input");i.files=dt.files;i.dispatchEvent(new Event("change"));})()`);
    await Bun.sleep(800);
  }

  // Keep the body of every model request that fails, at the HTTP level or with an error inside the stream, so it can be replayed exactly (test/probe-model.ts FAILED=...).
  await evaluate(`(()=>{window.__failed=[];const f=window.fetch;window.fetch=async(u,o)=>{const r=await f(u,o);if(String(u).includes("/responses")){r.clone().text().then(t=>{const e=t.match(/"error":\\{[^}]*\\}/);if(!r.ok||e)window.__failed.push({status:r.status,error:(e?e[0]:t).slice(0,300),streamed:t.length,body:o&&o.body})})}return r}})()`);

  for (let i = 0; i < turns.length; i++) {
    const before = await evaluate(`document.querySelectorAll("#log .turn").length`);
    const t0 = Date.now();
    await evaluate(`(()=>{const i=document.getElementById("input");i.value=${JSON.stringify(turns[i])};document.getElementById("composer").requestSubmit();})()`);
    await Bun.sleep(1500);
    for (;;) {
      if (await evaluate(`document.getElementById("stop").hidden`)) break;
      if (Date.now() - t0 > 420_000) throw new Error("turn timed out");
      await Bun.sleep(1000);
    }
    const err = await evaluate(`document.getElementById("error").hidden ? "" : document.getElementById("error").textContent`);
    const added = await evaluate(`[...document.querySelectorAll("#log .turn")].slice(${before}).flatMap(t=>[...t.children]).map(e=>(e.classList.contains("user")?"PATIENT: ":e.classList.contains("bot")?"DEATHBOT: ":"  [shown] ")+e.innerText).join("\\n\\n")`);
    console.log(`\n===== turn ${i + 1} (${Math.round((Date.now() - t0) / 1000)}s) =====\n${added}`);
    if (err) { console.log("ERROR SHOWN:", err); code = 1; }
    await shot(`turn-${i + 1}.png`);
  }

  // Save what ended up in the side panel.
  await Bun.sleep(15000); // let the background bookkeeping pass land
  await Bun.write(path.join(outDir, "your-file.txt"), await evaluate(`document.getElementById("file-body").innerText`));
  const imgs: string[] = JSON.parse(await evaluate(`JSON.stringify([...document.querySelectorAll("#log .scene img")].map(i=>i.src))`));
  for (let i = 0; i < imgs.length; i++) {
    const m = imgs[i].match(/^data:image\/(\w+);base64,(.*)$/);
    if (m) await Bun.write(path.join(outDir, `scene-${i + 1}.${m[1] === "jpeg" ? "jpg" : m[1]}`), Buffer.from(m[2], "base64"));
  }
  // The conversation as the app stores it, for replaying exact requests (see test/probe-model.ts).
  const saved = await evaluate(`new Promise((res)=>{const r=indexedDB.open("keyval-store");r.onsuccess=()=>{const g=r.result.transaction("keyval").objectStore("keyval").get("deathbot-conversation-v3");g.onsuccess=()=>res(JSON.stringify(g.result?.messages ?? []))}})`);
  await Bun.write(path.join(outDir, "messages.json"), saved);
  const failed = await evaluate(`JSON.stringify(window.__failed ?? [])`);
  await Bun.write(path.join(outDir, "failed-requests.json"), failed);
  console.log(`\nsaved ${imgs.length} picture(s), your-file.txt and messages.json to ${outDir}`);
} catch (e) {
  console.log("FAILED:", e instanceof Error ? e.message : e);
  code = 1;
} finally {
  await browser.close();
  if (process.env.KEEP_OPEN !== "1") server.stop(true);
}
if (process.env.KEEP_OPEN === "1") { console.log(`still serving the app on http://127.0.0.1:${PORT} for the open window; stop this process when done`); await new Promise(() => {}); }
process.exit(code);
