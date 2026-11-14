// Builds the static site into dist/: bundles the app and embeds the skill files.
import { Glob } from "bun";
import { mkdir, rm, cp } from "node:fs/promises";
import path from "node:path";

const here = import.meta.dir;
const skillDir = path.join(here, "..", "skill", "deathbot");
const dist = path.join(here, "dist");

const files: Record<string, string> = {};
for await (const f of new Glob("**/*.md").scan(skillDir)) {
  if (/\.(verify(-\d+)?|resolution)\.md$/.test(f) || f === "HARNESS.md") continue; // author- and developer-side files, not for the agent
  files[f] = await Bun.file(path.join(skillDir, f)).text();
}
const environment = await Bun.file(path.join(here, "environment.md")).text();
const map = await Bun.file(path.join(skillDir, "map.json")).json();

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
// Which release of the skill this build runs: the commit it was built from, and when.
const git = (args: string[]) => { const r = Bun.spawnSync(["git", ...args], { cwd: here }); return r.success ? r.stdout.toString().trim() : ""; };
const commit = (process.env.GITHUB_SHA || git(["rev-parse", "HEAD"])).slice(0, 7) || "unversioned";
const release = { commit, builtAt: new Date().toISOString().slice(0, 10), files: Object.keys(files).length };
await Bun.write(path.join(here, "src", "skill.generated.json"), JSON.stringify({ files, environment, map, release }));

const result = await Bun.build({
  entrypoints: [path.join(here, "src", "main.ts")],
  outdir: dist,
  target: "browser",
  minify: true,
  sourcemap: "linked",
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
await cp(path.join(here, "src", "index.html"), path.join(dist, "index.html"));
await cp(path.join(here, "src", "style.css"), path.join(dist, "style.css"));
// Typefaces are served from our own files so the page makes no third-party font requests.
const fonts: [string, string][] = [
  ["@fontsource/atkinson-hyperlegible/files", "atkinson-hyperlegible-latin-400-normal.woff2"],
  ["@fontsource/atkinson-hyperlegible/files", "atkinson-hyperlegible-latin-400-italic.woff2"],
  ["@fontsource/atkinson-hyperlegible/files", "atkinson-hyperlegible-latin-700-normal.woff2"],
  ["@fontsource-variable/bitter/files", "bitter-latin-wght-normal.woff2"],
  ["@fontsource-variable/bitter/files", "bitter-latin-wght-italic.woff2"],
];
await mkdir(path.join(dist, "fonts"), { recursive: true });
for (const [dir, file] of fonts) await cp(path.join(here, "node_modules", dir, file), path.join(dist, "fonts", file));
// A snapshot of exactly the skill this page runs, for anyone who wants to load it into another AI tool.
const zip = Bun.spawnSync(["zip", "-qr", path.join(dist, "SKILL.zip"), "deathbot", "-x", "*.verify.md", "*.verify-*.md", "*.resolution.md", "*.log"], { cwd: path.join(skillDir, "..") });
if (!zip.success) { console.error("could not build SKILL.zip:", zip.stderr.toString()); process.exit(1); }
await Bun.write(path.join(dist, "skill-release.json"), JSON.stringify(release, null, 1));
console.log(`built ${Object.keys(files).length} skill files into ${dist} (skill release ${release.commit}, ${release.builtAt})`);
