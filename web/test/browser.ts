// Starts a private headless Chromium for tests and connects to it over the DevTools protocol.
//
// It must never touch another browser on the machine. So it uses its own throwaway profile, lets
// Chromium pick a free debugging port (port 0) and reads that port back from the profile, and
// stops only the process it started. Do not use fixed debugging ports or kill browsers by name.
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

export interface Browser {
  send(method: string, params?: any): Promise<any>;
  evaluate(expression: string): Promise<any>;
  onEvent(handler: (method: string, params: any) => void): void;
  close(): Promise<void>;
}

export async function launch(width = 1400, height = 1000): Promise<Browser> {
  const profile = await mkdtemp(path.join(tmpdir(), "deathbot-test-"));
  // HEADED=1 shows the window. KEEP_OPEN=1 leaves that window (and its throwaway profile) in place afterwards.
  const headed = process.env.HEADED === "1", keepOpen = headed && process.env.KEEP_OPEN === "1";
  const proc = Bun.spawn(["chromium", ...(headed ? [] : ["--headless=new", "--disable-gpu"]), "--no-sandbox", "--no-first-run",
    "--no-default-browser-check", "--remote-debugging-port=0",
    `--window-size=${width},${height}`, `--user-data-dir=${profile}`, "about:blank"], { stdout: "ignore", stderr: "ignore" });

  let port = "";
  for (let i = 0; i < 100 && !port; i++) {
    const f = Bun.file(path.join(profile, "DevToolsActivePort"));
    if (await f.exists()) port = (await f.text()).split("\n")[0].trim();
    else await Bun.sleep(100);
  }
  if (!port) { proc.kill(); throw new Error("chromium did not report a debugging port"); }
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = list.find((t: any) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let nextId = 1;
  const pending = new Map<number, (v: any) => void>();
  const handlers: ((method: string, params: any) => void)[] = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && pending.has(m.id)) { pending.get(m.id)!(m); pending.delete(m.id); }
    else if (m.method) for (const h of handlers) h(m.method, m.params);
  };
  const send = (method: string, params: any = {}) =>
    new Promise<any>((resolve) => { const id = nextId++; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
  return {
    send,
    evaluate: async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value,
    onEvent: (h) => { handlers.push(h); },
    async close() {
      ws.close();
      if (keepOpen) { proc.unref(); console.log(`left the test browser open (pid ${proc.pid}, profile ${profile})`); return; }
      proc.kill();
      await proc.exited;
      await rm(profile, { recursive: true, force: true });
    },
  };
}
