// Drives Deathbot in Chrome on the Android emulator for the demo recording.
// Needs: adb forward tcp:9471 localabstract:chrome_devtools_remote
//
//   bun drive.ts state                    what is on screen: busy, last reply, reply buttons
//   bun drive.ts tap SELECTOR [N]         tap the Nth element matching SELECTOR (CSS) with a real touch
//   bun drive.ts taptext TEXT [SCOPE]     tap the visible button or link whose text contains TEXT
//   bun drive.ts choose SELECTOR VALUE    set a dropdown, as if picked from the list
//   bun drive.ts type TEXT                tap the message box and type TEXT
//   bun drive.ts install-shim             register the dictation stand-in and reload the page (keep it running)
//   bun drive.ts speak WAV                dictate: mic on, the stand-in types WAV's line as it is spoken, mic off (voice mixed in by edit.py)
//   bun drive.ts send                     tap Send
//   bun drive.ts wait [MIN]               wait for the reply, then read all of it at reading pace (at least MIN seconds)
//   bun drive.ts cut start|end            mark a stretch to remove from the recording
//   bun drive.ts eval JS                  evaluate in the page
//   bun drive.ts scroll SELECTOR DY       scroll an element by DY CSS pixels
import { $ } from "bun";
import path from "node:path";

const PORT = process.env.CDP_PORT ?? "9471";
const OUT = process.env.DEMO_OUT ?? path.join(process.env.HOME!, "hobby/.agent-scratch/deathbot-demo");
const MARKS = path.join(OUT, "marks.log");
// Injects audio into the emulator's microphone over its gRPC interface (48 kHz, real time).
const SAY = process.env.SAY ?? path.join(process.env.HOME!, "hobby/.agent-scratch/mic-debug/tools/say.sh");
// Where the page's top-left sits on the phone screen, in device pixels (status bar + Chrome toolbar).
const TOP = Number(process.env.VIEW_TOP ?? 0);

const targets: any[] = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find((t) => t.type === "page" && t.url.includes("deathbot"));
if (!page) { console.error("no deathbot page open"); process.exit(2); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nextId = 0;
const pending = new Map<number, (v: any) => void>();
ws.onmessage = (e) => { const m = JSON.parse(String(e.data)); if (m.id && pending.has(m.id)) { pending.get(m.id)!(m); pending.delete(m.id); } };
const send = (method: string, params: any = {}) => new Promise<any>((r) => { const i = ++nextId; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

async function evaluate(expression: string): Promise<any> {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? JSON.stringify(r.result.exceptionDetails));
  return r.result?.result?.value;
}
const sleep = (ms: number) => Bun.sleep(ms);
const mark = async (what: string) => { await Bun.write(MARKS, (await Bun.file(MARKS).exists() ? await Bun.file(MARKS).text() : "") + `${Date.now()} ${what}\n`); };

async function viewTop(): Promise<number> {
  // Measured on the Pixel 8 emulator: status bar plus Chrome's toolbar. The page itself does not scroll,
  // so the toolbar stays put; the keyboard shrinks the page from below and does not move its top.
  return TOP || 278;
}
async function tapRect(rect: { x: number; y: number; w: number; h: number } | null, label: string) {
  if (!rect) throw new Error(`nothing to tap: ${label}`);
  const dpr = await evaluate("devicePixelRatio");
  const top = await viewTop();
  const x = Math.round((rect.x + rect.w / 2) * dpr), y = Math.round((rect.y + rect.h / 2) * dpr) + top;
  await $`adb shell input tap ${x} ${y}`;
}
const rectOf = (expr: string) => evaluate(`(()=>{const el=${expr}; if(!el) return null; el.scrollIntoView({block:"nearest"}); const r=el.getBoundingClientRect(); const v=visualViewport; return {x:r.x-v.offsetLeft,y:r.y-v.offsetTop,w:r.width,h:r.height};})()`);

/**
 * When each word of a clip's line is said. The line is split into phrases at punctuation, and each phrase
 * boundary is put at one of the clip's pauses, choosing the pauses that make every phrase's speaking time best
 * match its length. Within a phrase, words are spread by length, and each appears as it ends.
 */
async function wordTimes(wav: string): Promise<[number, string][]> {
  const text = (await Bun.file(wav.replace(/\.wav$/, ".txt")).text()).trim();
  const words = text.split(/\s+/);
  const probe = await $`ffmpeg -hide_banner -i ${wav} -af silencedetect=noise=-35dB:d=0.25 -f null -`.quiet().nothrow();
  const log = probe.stderr.toString();
  const dur = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(log)!.slice(1).reduce((a, x, i) => a + Number(x) * [3600, 60, 1][i], 0));
  const gaps: [number, number][] = [];
  for (const m of log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)) {
    const g: [number, number] = [Number(m[1]), Number(m[2])];
    if (gaps.length && g[0] - gaps[gaps.length - 1][1] < 0.25) gaps[gaps.length - 1][1] = g[1]; else gaps.push(g);
  }
  const lead = gaps.length && gaps[0][0] < 0.05 ? gaps.shift()![1] : 0;
  const tail = gaps.length && gaps[gaps.length - 1][1] > dur - 0.05 ? gaps.pop()![0] : dur;
  let phrases: string[][] = [[]];
  for (const w of words) { phrases[phrases.length - 1].push(w); if (/[.,;:?!]["”’)]?$/.test(w)) phrases.push([]); }
  if (!phrases[phrases.length - 1].length) phrases.pop();
  const len = (ws: string[]) => ws.reduce((a, w) => a + w.length + 1, 0);
  // More phrases than pauses: join the shortest neighbours until each boundary can have a pause.
  while (phrases.length - 1 > gaps.length) {
    let k = 0;
    for (let i = 1; i < phrases.length - 1; i++) if (len(phrases[i]) + len(phrases[i + 1]) < len(phrases[k]) + len(phrases[k + 1])) k = i;
    phrases.splice(k, 2, [...phrases[k], ...phrases[k + 1]]);
  }
  const n = phrases.length, G = gaps.length;
  const speechIn = (a: number, b: number) => (b - a) - gaps.reduce((s, [x, y]) => s + Math.max(0, Math.min(b, y) - Math.max(a, x)), 0);
  const rate = speechIn(lead, tail) / len(words);
  const startAfter = (i: number) => (i < 0 ? lead : gaps[i][1]);
  const endAt = (i: number) => (i >= G ? tail : gaps[i][0]);
  const cost = (j: number, from: number, to: number) => { const d = speechIn(startAfter(from), endAt(to)) - rate * len(phrases[j]); return d * d; };
  // best[j][i]: least cost with phrase j ending at pause i (i = G means the end of the clip).
  const best = Array.from({ length: n }, () => new Array(G + 1).fill(Infinity));
  const from = Array.from({ length: n }, () => new Array(G + 1).fill(-1));
  for (let i = 0; i <= G; i++) if (n === 1 ? i === G : i < G) best[0][i] = cost(0, -1, i);
  for (let j = 1; j < n; j++)
    for (let i = j; i <= G; i++) {
      if (j < n - 1 && i === G) continue;
      if (j === n - 1 && i !== G) continue;
      for (let p = j - 1; p < i; p++) {
        const c = best[j - 1][p] + cost(j, p, i);
        if (c < best[j][i]) { best[j][i] = c; from[j][i] = p; }
      }
    }
  const ends: number[] = new Array(n);
  ends[n - 1] = G;
  for (let j = n - 1; j > 0; j--) ends[j - 1] = from[j][ends[j]];
  const out: [number, string][] = [];
  phrases.forEach((ph, j) => {
    const a = startAfter(j ? ends[j - 1] : -1), b = endAt(ends[j]);
    let acc = 0;
    for (const w of ph) { acc += w.length + 1; out.push([Math.round((a + (acc / len(ph)) * (b - a)) * 1000), w]); }
  });
  return out;
}
const busy = () => evaluate(`!document.getElementById("stop").hidden`);

const [cmd, ...args] = process.argv.slice(2);
try {
  switch (cmd) {
    case "install-shim": {
      const src = await Bun.file(path.join(import.meta.dir, "dictation-shim.js")).text();
      await send("Page.enable");
      await send("Page.addScriptToEvaluateOnNewDocument", { source: src });
      await send("Page.reload", {});
      await sleep(3000);
      console.log(await evaluate(`String(window.webkitSpeechRecognition).slice(0,40)`));
      // The registration lasts only while this session is open, so stay connected (run it in the background).
      await new Promise(() => {});
      break;
    }
    case "state":
      console.log(JSON.stringify(await evaluate(`(()=>{
        const log=document.getElementById("log");
        const turns=[...log.children];
        const last=turns[turns.length-1];
        return {
          busy: !document.getElementById("stop").hidden,
          status: document.querySelector(".status, .thinking")?.textContent ?? null,
          error: document.getElementById("error").hidden ? null : document.getElementById("error").textContent,
          lastTurn: last ? last.innerText.slice(-2500) : null,
          replies: [...document.querySelectorAll("#log button")].filter(b=>b.closest(".replies")).map(b=>b.textContent),
          input: document.getElementById("input").value,
        };})()`), null, 1));
      break;
    case "tap":
      await tapRect(await rectOf(`document.querySelectorAll(${JSON.stringify(args[0])})[${Number(args[1] ?? 0)}]`), args[0]);
      break;
    case "choose":
      // choose SELECTOR VALUE sets a dropdown the way picking from it would (Android's native picker is not in the page).
      await evaluate(`(()=>{const s=document.querySelector(${JSON.stringify(args[0])});s.scrollIntoView({block:"center",behavior:"smooth"});s.value=${JSON.stringify(args[1])};s.dispatchEvent(new Event("input",{bubbles:true}));s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
      await sleep(800);
      break;
    case "tapjs":
      await tapRect(await rectOf(args.join(" ")), args.join(" "));
      break;
    case "taptext": {
      const scope = args[1] ?? "body";
      await tapRect(await rectOf(`[...document.querySelector(${JSON.stringify(scope)}).querySelectorAll("button,a,label,summary,li,[role=button]")].filter(e=>e.offsetParent!==null && e.textContent.includes(${JSON.stringify(args[0])})).pop()`), args[0]);
      break;
    }
    case "type":
    case "typein": {
      // typein SELECTOR TEXT types into another field, e.g. the style dialog's free-text box.
      const target = cmd === "typein" ? args.shift()! : "#input";
      await tapRect(await rectOf(`document.querySelector(${JSON.stringify(target)})`), target);
      await sleep(600);
      const text = args[0]?.startsWith("@") ? (await Bun.file(args[0].slice(1)).text()).trim() : args.join(" ");
      // Typed a few characters at a time so it reads as typing on screen.
      for (let i = 0; i < text.length; i += 3) {
        await send("Input.insertText", { text: text.slice(i, i + 3) });
        await sleep(45 + Math.random() * 40);
      }
      break;
    }
    case "install-shim": {
      // Registers the dictation stand-in (dictation-shim.js) and reloads. The registration lasts only while this
      // DevTools session is open, so run it in the background and keep it running.
      const src = await Bun.file(path.join(import.meta.dir, "dictation-shim.js")).text();
      await send("Page.enable");
      await send("Page.addScriptToEvaluateOnNewDocument", { source: src });
      await send("Page.reload", {});
      await sleep(3000);
      console.log(await evaluate(`String(window.webkitSpeechRecognition).slice(0,40)`));
      await new Promise(() => {});
      break;
    }
    case "speak": {
      // Frank speaks: the mic button is tapped, and the stand-in recognizer types his line (WAV's .txt) into the
      // message box word by word at the moments he says each word in the clip. The time is logged to marks.log
      // ("voice WAV") and edit.py mixes the clip into the soundtrack there.
      const wav = args[0];
      const words = await wordTimes(wav);
      await tapRect(await rectOf(`document.getElementById("mic")`), "mic");
      await sleep(900);
      if (!(await evaluate(`!!window.__demoRec`))) throw new Error("the dictation stand-in is not installed (run install-shim)");
      await mark(`voice ${path.resolve(wav)}`);
      await evaluate(`window.__demoRec.say(${JSON.stringify(words)})`);
      await sleep(900);
      console.log(`heard: ${await evaluate(`document.getElementById("input").value`)}`);
      await tapRect(await rectOf(`document.getElementById("mic")`), "mic");
      break;
    }
    case "play": {
      const b64 = Buffer.from(await Bun.file(args[0]).arrayBuffer()).toString("base64");
      console.log(await evaluate(`new Promise((res)=>{const a=new Audio("data:audio/wav;base64,${b64}");a.onended=()=>res("ended");a.onerror=()=>res("error");a.play().catch(e=>res("blocked "+e))})`));
      break;
    }
    case "send":
      await tapRect(await rectOf(`document.getElementById("send")`), "send");
      break;
    case "wait": {
      // Waits for the reply, then lingers on it, scrolling through at reading pace (DWELL seconds, default 5).
      const t0 = Date.now();
      await sleep(1500);
      while (await busy()) {
        if (Date.now() - t0 > 240_000) throw new Error("reply took over 4 minutes");
        await sleep(700);
      }
      console.log(`replied in ${Math.round((Date.now() - t0) / 1000)}s`);
      await sleep(800);
      // Read the whole reply as a person would: scroll a screen at a time, pausing for the text each step
      // reveals (about 220 words a minute), until the end of the reply and its buttons are in view.
      const minimum = Number(args[0] ?? 3) * 1000;
      const started = Date.now();
      for (let step = 0; step < 40; step++) {
        const view = await evaluate(`(()=>{const s=document.getElementById("scroll");return {left:s.scrollHeight-s.clientHeight-s.scrollTop,h:s.clientHeight,words:(document.getElementById("log").lastElementChild?.innerText||"").split(/\\s+/).length,total:s.scrollHeight}})()`);
        const screenWords = Math.max(20, Math.round(view.words * Math.min(1, view.h / Math.max(view.total, 1))));
        await sleep(Math.min(9000, Math.max(1800, screenWords / 220 * 60_000)));
        if (view.left < 8) break;
        await evaluate(`document.getElementById("scroll").scrollBy({top:Math.min(${view.left}, ${Math.round(view.h * 0.7)}),behavior:"smooth"})`);
        await sleep(600);
      }
      if (Date.now() - started < minimum) await sleep(minimum - (Date.now() - started));
      break;
    }
    case "xy":
      await $`adb shell input tap ${args[0]} ${args[1]}`;
      break;
    case "key":
      await $`adb shell input keyevent ${args[0]}`;
      break;
    case "clearcache":
      await send("Network.clearBrowserCache");
      break;
    case "pause":
      await sleep(Number(args[0]) * 1000);
      break;
    case "cut":
      await mark(`cut-${args[0]}`);
      break;
    case "scroll":
      await evaluate(`document.querySelector(${JSON.stringify(args[0])}).scrollBy({top:${Number(args[1])},behavior:"smooth"})`);
      break;
    case "eval":
      console.log(JSON.stringify(await evaluate(args.join(" "))));
      break;
    default:
      console.error("unknown command"); process.exit(2);
  }
} finally {
  ws.close();
}
