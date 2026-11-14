// Reads a page the way a browser sees it, for sources that return nothing to curl or a fetch tool:
// script-rendered sites (the Texas statutes site) and sites that refuse non-browser clients.
// Uses an isolated headless Chromium over the DevTools protocol; see web/test/browser.ts.
// Usage: bun tools/read-page.ts URL ['regex to print' ...]      OUT=file saves the full page text.
import { launch } from "../web/test/browser";
const [url, ...patterns] = process.argv.slice(2);
const b = await launch(1300, 1000);
try {
  await b.send("Page.enable");
  await b.send("Network.setUserAgentOverride", { userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" });
  await b.send("Page.navigate", { url });
  let text = "", last = -1;
  for (let i = 0; i < 40; i++) {            // wait for the text to stop growing
    await Bun.sleep(1500);
    text = (await b.evaluate(`document.body ? document.body.innerText : ""`)) ?? "";
    if (text.length > 3000 && text.length === last) break;
    last = text.length;
  }
  console.log(`URL now: ${await b.evaluate("location.href")}\nTitle: ${await b.evaluate("document.title")}\nText length: ${text.length}`);
  await Bun.write(process.env.OUT ?? "/dev/null", text);
  for (const p of patterns) {
    const m = text.match(new RegExp(p, "s"));
    console.log(`\n===== /${p.slice(0, 60)}/\n${m ? m[0].slice(0, 3200) : "(no match)"}`);
  }
  if (!patterns.length) console.log(text.slice(0, 1500));
} finally { await b.close(); }
