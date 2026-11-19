// A ribbon where many thin strands twist and untwist into one band — shifting only each strand’s phase slightly and drawing two layers of the same sine makes the band look twisted.
// Draws on a design panel (w×h) and stretches it to cover the element so it looks the same regardless of panel size. Pauses when off-screen
(() => {
  // So it changes along with the skin, colors are made as relative colors from --kf-accent — canvas can’t read relative color, so paint once and take the pixels
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const swatch = document.createElement("i");
  const rgbOf = (css, host) => {
    swatch.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    host.append(swatch);
    const c = getComputedStyle(swatch).color;
    swatch.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const hash = (a, b, seed) => {
    let h = Math.imul(a + 0x9e37, 0x85ebca6b) ^ Math.imul(b + 0x7f4a, 0xc2b2ae35) ^ Math.imul(seed, 0x27d4eb2f);
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
    h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
    return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
  };

  kfFx.register("ribbon-wave-canvas", (el, { options, reduce }) => {
    const o = (k, d) => (options[k] == null || options[k] === "" ? d : +options[k]);
    const S = {
      w: o("w", 1720), h: o("h", 1080), count: Math.max(1, o("count", 24) | 0), res: Math.max(3, o("res", 81) | 0),
      spacing: o("spacing", 4.9), amp: o("amp", 163), freq: o("freq", 0.75), phase: o("phase", 0.14),
      twist: o("twist", 0.41), bulge: o("bulge", 0.66), morph: o("morph", 0.5), speed: o("speed", 0.66),
      rotate: o("rotate", 0), edge: Math.min(0.5, Math.max(0, o("edge", 0.25))), stroke: o("stroke", 1),
      sparse: o("sparse", 0.32), pspeed: o("pspeed", 1.15), plen: o("plen", 88), psize: o("psize", 3),
      seed: o("seed", 2025), intro: o("intro", 1.5) * 1000, sway: o("sway", 0.7),
    };
    const particles = options.particles !== "off";
    const canvas = document.createElement("canvas");
    canvas.className = "fx-ribbon__canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");

    let lines = [], dust = [];
    const paint = () => {
      const a = rgbOf(options.from ? `var(${options.from})` : "var(--kf-accent)", el);
      const b = rgbOf(options.to ? `var(${options.to})` : "oklch(from var(--kf-accent) calc(l + .113) calc(c + .053) calc(h - 33.4))", el);
      lines = Array.from({ length: S.count }, (_, i) => {
        const t = S.count <= 1 ? 0 : i / (S.count - 1);
        const c = a.map((v, k) => Math.round(v + (b[k] - v) * t));
        return { full: `rgb(${c})`, clear: `rgba(${c},0)` };
      });
      // Four sparkling tails: purple, orange, sky and pink made by rotating from the accent color
      dust = [
        "oklch(from var(--kf-accent) calc(l - .071) calc(c + .023) calc(h + 154.3))",
        "oklch(from var(--kf-accent) calc(l - .01) calc(c - .013) calc(h - 90.8))",
        "oklch(from var(--kf-accent) calc(l - .081) calc(c - .025) calc(h + 84.8))",
        "oklch(from var(--kf-accent) calc(l + .014) calc(c - .054) calc(h - 173.1))",
      ].map((css) => rgbOf(css, el));
    };
    paint();

    const pts = Array.from({ length: S.count }, () => Array.from({ length: S.res }, () => ({ x: 0, y: 0 })));
    const rad = (S.rotate * Math.PI) / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const build = (i, t) => {
      const n = S.count, k = S.freq * Math.PI * 2, ph = S.phase * (i - (n - 1) / 2), spin = S.sway * t;
      const lane = ((n <= 1 ? 0.5 : i / (n - 1)) - 0.5) * n * S.spacing;
      const row = pts[i], cx = S.w / 2, cy = S.h / 2;
      for (let j = 0; j < S.res; j++) {
        const u = j / (S.res - 1);
        const swell = 1 + S.bulge * Math.sin(u * Math.PI);
        const main = Math.sin(k * u + ph);
        const turn = Math.sin(0.5 * k * u - 2 * ph + spin);
        const wob = S.morph ? S.morph * Math.sin(3.7 * u + 0.2 * i) * Math.cos(2.1 * u + 0.13 * i) : 0;
        const x = u * S.w, y = cy + lane + (main + S.twist * turn + wob) * 0.5 * swell * S.amp;
        const p = row[j];
        if (!rad) { p.x = x; p.y = y; continue; }
        p.x = cx + (x - cx) * cos - (y - cy) * sin;
        p.y = cy + (x - cx) * sin + (y - cy) * cos;
      }
      return row;
    };
    const lengthOf = (row) => { let s = 0; for (let j = 1; j < row.length; j++) s += Math.hypot(row[j].x - row[j - 1].x, row[j].y - row[j - 1].y); return s; };
    const pointAt = (row, f) => {
      const total = lengthOf(row), want = f * total;
      let walked = 0;
      for (let j = 1; j < row.length; j++) {
        const a = row[j - 1], b = row[j], d = Math.hypot(b.x - a.x, b.y - a.y);
        if (walked + d >= want) { const r = d ? (want - walked) / d : 0; return [a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r, b.x - a.x, b.y - a.y]; }
        walked += d;
      }
      const z = row[row.length - 1];
      return [z.x, z.y, 0, 0];
    };
    const ease3 = (x) => x * x * (3 - 2 * x);

    // For the first 1.5s each strand is drawn at a slightly different speed (.6~1x) — the tail flows after all are drawn
    const frame = (t, grow) => {
      const W = canvas.width, H = canvas.height, s = Math.max(W / S.w, H / S.h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.setTransform(s, 0, 0, s, (W - S.w * s) / 2, (H - S.h * s) / 2);
      ctx.lineJoin = ctx.lineCap = "round";
      ctx.lineWidth = S.stroke;
      for (let i = 0; i < S.count; i++) {
        const row = build(i, t), first = row[0], last = row[row.length - 1], c = lines[i];
        let shown = 1;
        if (grow < 1) {
          const r = Math.min(grow / (0.6 + 0.4 * hash(i, 53, S.seed)), 1);
          shown = ease3(r);
          if (shown <= 0) continue;
        }
        ctx.setLineDash(shown < 1 ? [lengthOf(row) * shown, lengthOf(row) + 1] : []);
        if (S.edge > 0) {
          const g = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
          g.addColorStop(0, c.clear); g.addColorStop(S.edge, c.full); g.addColorStop(1 - S.edge, c.full); g.addColorStop(1, c.clear);
          ctx.strokeStyle = g;
        } else ctx.strokeStyle = c.full;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        for (let j = 1; j < row.length - 1; j++) ctx.quadraticCurveTo(row[j].x, row[j].y, (row[j].x + row[j + 1].x) / 2, (row[j].y + row[j + 1].y) / 2);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      if (!particles || grow < 1) return;
      const run = Math.max(0.8, 3.4 / Math.max(0.15, Math.abs(S.pspeed))), cycle = run + 2.2;
      ctx.lineWidth = S.psize;
      for (let i = 0; i < S.count; i++) {
        if (hash(i, 7, S.seed) > S.sparse) continue;
        let s2 = (t + 0.18 * i - 1.8 * hash(i, 3, S.seed)) % cycle;
        if (s2 < 0) s2 += cycle;
        if (s2 > run) continue;
        const u = s2 / run, fade = u < 0.18 ? u / 0.18 : u > 0.68 ? (1 - u) / 0.32 : 1;
        const [x, y, dx, dy] = pointAt(pts[i], u), len = Math.hypot(dx, dy) || 1, half = S.plen / 2;
        const col = dust[Math.floor(hash(i, 11, S.seed) * dust.length) % dust.length];
        const x0 = x - (dx / len) * half, y0 = y - (dy / len) * half, x1 = x + (dx / len) * half, y1 = y + (dy / len) * half;
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},1)`);
        ctx.strokeStyle = g;
        ctx.globalAlpha = fade;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0, on = false, t0 = 0, g0 = 0, away = 0, done = false, last = 0;
    // If it has never been shown yet, leave it empty — it must be drawn from the moment it appears
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, +(options.dpr ?? 2) || 2), r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      if (reduce) frame(0, 1);
      else if (!on && done) frame(last, 1);
    };
    const tick = (now) => {
      if (!t0) t0 = now;
      if (!g0) g0 = now;
      let grow = 1;
      if (!done && (grow = Math.min((now - g0) / S.intro, 1)) >= 1) done = true;
      last = ((now - t0) / 1000) * S.speed;
      frame(last, grow);
      raf = requestAnimationFrame(tick);
    };
    const stop = () => { if (!on) return; on = false; cancelAnimationFrame(raf); away = performance.now(); };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    // Swapping skins re-fetches the colors
    const mo = new MutationObserver(() => { paint(); if (!on) size(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    let io = null;
    if (!reduce) {
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          if (on) return;
          on = true;
          if (away) { const gap = performance.now() - away; t0 += gap; if (g0) g0 += gap; }
          raf = requestAnimationFrame(tick);
        } else stop();
      }, { rootMargin: "10% 0px" });
      io.observe(canvas);
    }
    return () => { stop(); io?.disconnect(); ro.disconnect(); mo.disconnect(); canvas.remove(); };
  });
})();
