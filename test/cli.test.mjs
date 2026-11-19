// Offline checks for the rea CLI: catalog loads, search and routing pick sensible things.
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const rea = (...a) => { const r = spawnSync(process.execPath, ["plugin/bin/rea", ...a], { encoding: "utf8", env: { ...process.env, REA_BASE: "https://example.invalid" } }); assert.equal(r.status, 0, r.stderr); return r.stdout; };
const route = (q) => JSON.parse(rea("route", q, "--json"));

const help = rea();
assert.match(help, /\d,?\d{3} sites/);
assert.match(help, /\d,?\d{3} motion parts/);

const cases = [
  ["build a landing page for a small neighborhood cafe", "rea-web"],
  ["redesign our company homepage", "rea-web"],
  ["portfolio site for a 3D designer", "rea-web"],
  ["careers page for a startup", "rea-web"],
  ["add a magnetic hover effect to the buttons in my React dashboard", "rea-interactions"],
  ["make the cards tilt when the cursor moves over them", "rea-interactions"],
  ["a preloader animation for my app", "rea-interactions"],
  ["parallax scroll effect on the hero image", "rea-interactions"],
  ["make a 30 second launch video for our app", "rea-video"],
  ["explainer video in hyperframes", "rea-video"],
  ["pick a color palette and fonts for my blog", "rea-theme-mobile"],
  ["the page overflows on mobile", "rea-theme-mobile"],
];
let ok = 0;
for (const [q, want] of cases) {
  const r = route(q);
  if (r.skill === want) ok++; else console.log(`route miss: "${q}" -> ${r.skill} (want ${want})`);
}
console.log(`routing ${ok}/${cases.length}`);
assert.ok(ok >= cases.length - 1, "routing regressed");

assert.match(rea("sites", "-k", "shop", "-n", "3"), /shop/);
assert.match(rea("sections", "hero", "-n", "2", "--seed", "1"), /hero sections/);
assert.match(rea("fx", "-t", "hover", "-n", "2"), /motion parts match/);
assert.match(rea("theme"), /worlds/);
assert.match(rea("theme", "blueprint"), /--kf-bg/);
console.log("ok");
