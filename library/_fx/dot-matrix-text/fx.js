(() => {
  // Scroll-bound dot-letter quote — each line is sampled into a dot grid, and at first a cluster of dots enlarged 14x covers the screen
  // On scroll it shrinks to 1x by 1 − (1−p)², and dots light up from the right. When p passes .74, the real text is wiped in line by line with an 18% slanted edge and the dots turn off.
  // Child: data-fx-part="text"(the chunk to be resized), the data-fx-part inside it="line"(one row each), data-fx-part if present="desc"(Fades up to .85 at the end)
  const ease2 = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - (1 - t) * (1 - t));
  kfFx.register("dot-matrix-text", (el, { options, reduce, scroller }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    const lines = text ? [...text.querySelectorAll('[data-fx-part="line"]')] : [];
    if (!text || !lines.length) return;
    const desc = el.querySelector('[data-fx-part="desc"]');
    const num = (k, d) => (options[k] != null && options[k] !== "" ? +options[k] : d);
    const o = {
      from: num("from", 14), power: num("power", 2), dot: num("dot", 0.2), dotEnd: num("dot-end", 0.74), wipe: num("wipe", 0.74),
      jitter: num("jitter", 0.1), step: num("step", innerWidth < 768 ? 6.4 : 3.8), scrub: num("scrub", 0.3),
      start: options.start || "top top", end: options.end || "bottom bottom",
    };
    const trigger = (options.trigger && document.querySelector(options.trigger)) || el;
    const setFinal = () => {
      text.style.transform = "none"; text.style.visibility = "";
      lines.forEach((l) => (l.style.clipPath = "none"));
      if (desc) desc.style.opacity = "0.85";
    };
    if (reduce) { setFinal(); return () => { text.style.transform = ""; if (desc) desc.style.opacity = ""; }; }

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1";
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    let dpr = 1, W = 0, H = 0, dots = [], color = "";
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = el.clientWidth; H = el.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    };
    // Draw each line in the same font on a 200px tall board and keep only cells with alpha over 110 as dots
    const sample = () => {
      const keep = text.style.transform;
      text.style.transform = "none";
      const rects = lines.map((l) => l.getBoundingClientRect());
      const ok = rects.filter((r) => r.width > 2 && r.height > 2);
      if (!ok.length) { text.style.transform = keep; return; }
      const left = Math.min(...ok.map((r) => r.left)), span = Math.max(1, Math.max(...ok.map((r) => r.right)) - left);
      const off = document.createElement("canvas"), c = off.getContext("2d", { willReadFrequently: true });
      dots = [];
      lines.forEach((line, li) => {
        const r = rects[li];
        if (r.width < 2 || r.height < 2) return;
        const cs = getComputedStyle(line);
        color = cs.color;
        const k = 200 / r.height, w = Math.max(2, Math.round(r.width * k)), pad = 56, h = 200 + 2 * pad;
        off.width = w; off.height = h;
        c.clearRect(0, 0, w, h);
        c.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`;
        c.textBaseline = "middle";
        c.fillStyle = cs.color;
        const str = cs.textTransform === "uppercase" ? line.textContent.toUpperCase() : line.textContent;
        const mw = c.measureText(str.trim()).width || w;
        c.save(); c.translate(0, pad + 100); c.scale(w / mw, 1); c.fillText(str.trim(), 0, 0); c.restore();
        const data = c.getImageData(0, 0, w, h).data, s = o.step, l0 = (r.left - left) / span, rw = r.width / span;
        for (let y = s / 2; y < h; y += s)
          for (let x = s / 2; x < w; x += s)
            if ((data[(Math.round(y) * w + Math.round(x)) * 4 + 3] || 0) > 110) {
              const nx = x / w;
              dots.push({ line: li, nx, ny: (y - pad) / 200, base: 1 - (l0 + nx * rw), rnd: ((Math.sin(12.9898 * x + 78.233 * y + 37 * li) * 43758.5453) % 1 + 1) % 1 });
            }
      });
      text.style.transform = keep;
    };
    let p = 0;
    const render = () => {
      const P = o.from - (o.from - 1) * (1 - Math.pow(1 - p, o.power));
      const showText = p > o.wipe;
      text.style.transformOrigin = "center center";
      text.style.transform = `scale(${P})`;
      text.style.visibility = showText ? "" : "hidden";
      const per = Math.max(1e-4, 0.92 - o.wipe) / lines.length, wipes = lines.map((_, i) => Math.max(0, Math.min(1, (p - (o.wipe + i * per)) / per)));
      lines.forEach((l, i) => (l.style.clipPath = wipes[i] >= 1 ? "none" : `polygon(0 -15%, ${118 * wipes[i]}% -15%, ${118 * wipes[i] - 18}% 115%, 0 115%)`));
      if (desc) desc.style.opacity = String(0.85 * Math.max(0, Math.min(1, (p - o.wipe) / Math.max(0.001, 1 - o.wipe))));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (p <= 0 || wipes.every((w) => w >= 1)) return;
      const box = el.getBoundingClientRect(), rects = lines.map((l) => l.getBoundingClientRect());
      const M = Math.min(1, p / Math.max(0.001, o.dotEnd)), buckets = new Array(15).fill(null);
      for (const d of dots) {
        const r = rects[d.line];
        if (!r || r.width < 1) continue;
        const n = ease2((M - (d.base * (1 - o.jitter) + d.rnd * o.jitter) * 0.91) / 0.09);
        if (n <= 0) continue;
        const a = Math.round(n * (1 - Math.max(0, Math.min(1, (wipes[d.line] - d.nx) / 0.05))) * 14);
        if (a <= 0) continue;
        const x = r.left - box.left + d.nx * r.width, y = r.top - box.top + d.ny * r.height, rad = (r.height / 200) * o.step * o.dot * n;
        if (x + rad < 0 || x - rad > W || y + rad < 0 || y - rad > H) continue;
        const path = buckets[a] || (buckets[a] = new Path2D());
        path.moveTo(x + rad, y);
        path.arc(x, y, rad, 0, Math.PI * 2);
      }
      ctx.fillStyle = color;
      for (let a = 1; a <= 14; a++) if (buckets[a]) { ctx.globalAlpha = a / 14; ctx.fill(buckets[a]); }
      ctx.globalAlpha = 1;
    };
    const mm = gsap.matchMedia();
    let st = null;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      size(); sample(); render();
      st = ScrollTrigger.create({ trigger, scroller, start: o.start, end: o.end, scrub: o.scrub, onUpdate: (s) => { p = s.progress; render(); }, onRefresh: (s) => { size(); sample(); p = s.progress; render(); } });
      return () => st?.kill();
    });
    const ro = new ResizeObserver(() => { size(); sample(); render(); });
    ro.observe(el);
    document.fonts?.ready.then(() => { sample(); render(); });
    return () => {
      mm.revert(); ro.disconnect(); canvas.remove();
      text.style.transform = ""; text.style.visibility = ""; text.style.transformOrigin = "";
      lines.forEach((l) => (l.style.clipPath = ""));
      if (desc) desc.style.opacity = "";
    };
  });
})();
