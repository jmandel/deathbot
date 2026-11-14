// Drives Deathbot in Chrome on the Android emulator for the demo recording.
// Needs: adb forward tcp:9471 localabstract:chrome_devtools_remote
//
//   bun drive.ts install-shim             register the dictation stand-in and reload the page (keep it running)
//   bun drive.ts state                    what is on screen: busy, last reply, reply buttons
//   bun drive.ts tap SELECTOR [N]         tap the Nth element matching SELECTOR (CSS) with a real touch
//   bun drive.ts taptext TEXT [SCOPE]     tap the visible button or link whose text contains TEXT
//   bun drive.ts type TEXT                tap the message box and type TEXT
//   bun drive.ts speak WAV                dictate: mic on, inject WAV into the emulator mic, mic off (voice mixed in by edit.py)
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
    case "speak": {
      // Frank speaks: the clip is injected into the emulator's microphone and Chrome's own speech
      // recognition transcribes it live into the message box. The soundtrack gets his voice in the edit:
      // the injection time is logged to marks.log ("voice START WAV") and edit.py mixes the clip in there.
      const wav = args[0];
      await tapRect(await rectOf(`document.getElementById("mic")`), "mic");
      await sleep(1200);
      await mark(`voice ${path.resolve(wav)}`);
      await $`${SAY} ${wav}`.quiet();
      await sleep(1500); // let the recognizer finish the last words
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
