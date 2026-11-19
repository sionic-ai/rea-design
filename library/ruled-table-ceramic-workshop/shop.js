// Order page: title words spread out one by one from the center into place, and the text block and title are centered on screen. Sound plays when a piece lands on the shelf
(() => {
  const otl = document.querySelector(".otl"), low = document.querySelector(".low"), words = [...otl.querySelectorAll(".hw")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const U = () => document.documentElement.clientWidth / 1400;
  function place() {
    // Centers the combined height of the title (three rule cells + 38u) and the text block on screen — the text sits at the bottom, so only the title is moved
    const u = U(), block = 222 * u + 38 * u + low.offsetHeight;
    otl.style.top = Math.max(60 * u, (innerHeight - block) / 2) + "px";
    // Keep the word’s capital letter centered in the cell
    const fs = parseFloat(getComputedStyle(words[0]).fontSize), ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${fs}px ${getComputedStyle(words[0]).fontFamily}`;
    const m = ctx.measureText("H"), cap = m.actualBoundingBoxAscent || fs * .7, asc = m.fontBoundingBoxAscent || fs * .9, desc = m.fontBoundingBoxDescent || fs * .25;
    const lh = 66 * u, base = (lh - (asc + desc)) / 2 + asc;
    otl.style.setProperty("--hy", ((74 * u - cap) / 2 - (base - cap)).toFixed(1) + "px");
  }
  function open() {
    if (reduce) { otl.classList.remove("closed"); return; }
    const mid = innerWidth / 2;
    words.forEach((w) => { const r = w.getBoundingClientRect(); w.style.translate = `${(mid - (r.left + r.width / 2)).toFixed(1)}px 0`; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      otl.classList.remove("closed");
      words.forEach((w, i) => { w.style.transitionDelay = (.15 + .12 * i).toFixed(2) + "s"; w.style.translate = "0 0"; });
    }));
  }
  // Text lines: group word chunks into lines and delay each line (200ms from page open + line number × 60ms)
  const t0 = performance.now(), flow = document.querySelector(".flow");
  function lines() {
    const ws = [...flow.querySelectorAll(".fx-tsd-word")];
    if (!ws.length) { flow.classList.add("lined"); return; }
    let row = -1, top = null;
    ws.forEach((w) => { const t = w.offsetTop; if (t !== top) { row++; top = t; } w.style.setProperty("--d", Math.max(0, 60 * row + 200 - (performance.now() - t0)) / 1000 + "s"); });
    flow.classList.add("lined");
  }
  place();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { place(); lines(); open(); });
  addEventListener("resize", place);
  document.body.addEventListener("fx:land", () => window.dhSound?.tap(.9));
})();
