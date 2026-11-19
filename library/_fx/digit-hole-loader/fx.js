// Number hole loader — bricks covering the screen (5~6 columns × 1~3 rows, random order) drop out as progress advances, and then the page shows through only as a giant number punched in a black curtain.
// At 100 the number grows larger than the screen over 1.1s power3.in around the hollow inside the last 0, and the hole becomes the whole screen
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const p3in = (t) => t * t * t;
  kfFx.register("digit-hole-loader", (el, { options, reduce }) => {
    const dur = Math.max(0, +(options.dur ?? 3.2)), zoomDur = +(options.zoom ?? 1.1), fade = +(options.fade ?? 0.8);
    const pctEl = el.querySelector('[data-fx-part="pct"]'), barEl = el.querySelector('[data-fx-part="bar"]'), skipEl = el.querySelector('[data-fx-part="skip"]');
    const blocksBox = document.createElement("div");
    blocksBox.className = "fx-dhl__blocks";
    el.prepend(blocksBox);
    const holder = document.createElement("div");
    holder.className = "fx-dhl__num";
    holder.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS(NS, "svg");
    const bg = document.createElementNS(NS, "rect");
    bg.setAttribute("class", "fx-dhl__mask");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    const g = document.createElementNS(NS, "g");
    const digits = [0, 1, 2].map((i) => { const t = document.createElementNS(NS, "text"); t.setAttribute("class", "fx-dhl__digit"); t.setAttribute("text-anchor", "middle"); t.dataset.i = i; g.appendChild(t); return t; });
    svg.append(bg, g);
    holder.appendChild(svg);
    el.before(holder);
    el.classList.add("fx-dhl--live");

    const blocks = [];
    let hidden = 0;
    const cols = Array.from({ length: 5 + Math.floor(Math.random() * 2) }, () => 0.6 + Math.random()), cs = cols.reduce((a, b) => a + b, 0);
    let x = 0;
    cols.forEach((c) => {
      const w = (c / cs) * 100, rows = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => 0.7 + Math.random()), rs = rows.reduce((a, b) => a + b, 0);
      let y = 0;
      rows.forEach((r) => { const h = (r / rs) * 100, b = document.createElement("div"); b.className = "fx-dhl__block"; b.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%`; blocksBox.appendChild(b); blocks.push({ b, cx: x + w / 2, cy: y + h / 2 }); y += h; });
      x += w;
    });
    for (let i = blocks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [blocks[i], blocks[j]] = [blocks[j], blocks[i]]; }
    const first = blocks.findIndex((b) => b.cx < 32 && b.cy > 60);
    if (first > 0) blocks.unshift(blocks.splice(first, 1)[0]);
    const hideTo = (p) => { let n = Math.floor(Math.pow(Math.min(1, p / 86), 1.5) * blocks.length); if (p >= 4) n = Math.max(1, n); if (p >= 100) n = blocks.length; while (hidden < n) blocks[hidden++].b.style.visibility = "hidden"; };

    let m = null, lay = {}, shown = "", val = 0, zooming = false, done = false, raf = 0;
    function metrics() {
      const fam = getComputedStyle(digits[0]).fontFamily, wt = getComputedStyle(digits[0]).fontWeight, S = 200;
      const c = document.createElement("canvas"); c.width = c.height = S * 2;
      const k = c.getContext("2d", { willReadFrequently: true });
      k.font = `${wt} ${S}px ${fam}`;
      let adv = 0;
      for (let d = 0; d < 10; d++) adv = Math.max(adv, k.measureText(String(d)).width);
      const z = k.measureText("0"), asc = z.actualBoundingBoxAscent, desc = z.actualBoundingBoxDescent, base = S * 1.5;
      k.fillStyle = getComputedStyle(el).color;
      k.fillText("0", 0, base);
      const row = k.getImageData(0, Math.round(base - (asc - desc) / 2), c.width, 1).data;
      let a = -1, b = -1;
      for (let i = 0; i < c.width; i++) { const on = row[i * 4 + 3] > 128; if (on && a < 0) a = i; if (!on && a >= 0) { b = i; break; } }
      m = { S, adv, adv0: z.width, asc, desc, sx: (a + b) / 2, sw: Math.max(1, b - a) };
    }
    function layout(three) {
      const W = innerWidth, H = innerHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const slot = (m.adv / m.S) * 1.04, F = Math.min(H * (H > W ? 0.42 : 0.7), (W * 0.94) / (3 * slot)) * 1.15, k = F / m.S, sw = slot * F;
      const base = H / 2 + ((m.asc - m.desc) * k) / 2, x0 = W / 2 - ((three ? 3 : 2) * sw) / 2;
      lay = { k, sw, base, x0, W, H, three };
      digits.forEach((t) => { const i = +t.dataset.i - (three ? 0 : 1); t.setAttribute("x", x0 + (i + 0.5) * sw); t.setAttribute("y", base); t.setAttribute("font-size", F); });
      shown = "";
    }
    const text = (n) => { const s = n >= 100 ? "100" : " " + String(n).padStart(2, "0"); if (s !== shown) { shown = s; digits.forEach((t) => { t.textContent = s[+t.dataset.i].trim(); }); } };
    const scaleAt = (cx, cy, s) => g.setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
    function render(p) {
      val = p;
      const n = Math.max(0, Math.min(100, Math.round(p)));
      if (pctEl) pctEl.textContent = n + "%";
      if (barEl) barEl.style.setProperty("--fx-p", n / 100);
      hideTo(p);
      if (!m || zooming || done) return;
      text(Math.min(99, Math.floor(p)));
      scaleAt(lay.W / 2, lay.H / 2, 1 + 0.06 * Math.min(1, p / 100));
    }
    const step = (fn, total) => new Promise((res) => { const t0 = performance.now(); const tick = (now) => { const k = total > 0 ? Math.min(1, (now - t0) / (total * 1000)) : 1; fn(k); if (k < 1) raf = requestAnimationFrame(tick); else res(); }; raf = requestAnimationFrame(tick); });
    function finish() {
      if (zooming || done) return;
      render(100);
      zooming = true;
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      const out = step((k) => { el.style.opacity = String(1 - (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)); }, reduce ? 0 : fade).then(() => { el.style.visibility = "hidden"; });
      let zoom = Promise.resolve();
      if (m && !reduce) {
        layout(true); text(100);
        const { k, sw, x0, base, W } = lay, cx = x0 + 2.5 * sw - (m.adv0 * k) / 2 + m.sx * k, cy = base - ((m.asc - m.desc) * k) / 2;
        const to = ((2 * Math.max(cx, W - cx)) / (m.sw * k)) * 1.2;
        zoom = step((t) => { scaleAt(cx, cy, 1.06 + (to - 1.06) * p3in(t)); holder.style.opacity = String(t > (zoomDur - 0.12) / zoomDur ? Math.max(0, 1 - (t * zoomDur - (zoomDur - 0.12)) / 0.2) : 1); }, zoomDur);
      }
      Promise.all([out, zoom]).then(() => { done = true; holder.style.visibility = "hidden"; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); });
    }
    const onProgress = (e) => { const p = +e.detail; if (Number.isFinite(p)) { render(p); if (p >= 100) finish(); } };
    const onSkip = () => { for (let i = hidden, d = 0; i < blocks.length; i++, d += 28) { const b = blocks[i].b; setTimeout(() => { b.style.visibility = "hidden"; }, d); } hidden = blocks.length; finish(); };
    el.addEventListener("fx:progress", onProgress);
    skipEl?.addEventListener("click", onSkip);
    const skipT = skipEl ? setTimeout(() => skipEl.classList.add("is-on"), 1200) : 0;
    const fontReady = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (!done && holder.isConnected) { metrics(); layout(false); render(val); } });
    const onResize = () => { if (m && !zooming) { layout(lay.three); render(val); } };
    addEventListener("resize", onResize);
    if (reduce) { fontReady.then(finish); }
    else if (options.drive !== "event") {
      fontReady.then(() => { if (!zooming) step((k) => { if (!zooming) render(100 * (1 - Math.pow(1 - k, 1.6))); }, dur).then(finish); });
    }
    return () => {
      cancelAnimationFrame(raf); clearTimeout(skipT);
      el.removeEventListener("fx:progress", onProgress);
      skipEl?.removeEventListener("click", onSkip);
      removeEventListener("resize", onResize);
      blocksBox.remove(); holder.remove();
      el.classList.remove("fx-dhl--live");
      el.style.opacity = ""; el.style.visibility = "";
    };
  });
})();
