// Builds letters from circle, semicircle, triangle and square pieces and fills each piece with thin horizontal lines — line thickness changes from top to bottom of the piece to create shading.
// Lines are drawn on the full-line grid so line height stays continuous across different pieces. It’s a single canvas, so the element count doesn’t grow as characters increase.
(() => {
  // Cell units (one row height 10). r rectangle · e ellipse · rl/rr/rt/rb half circle (rounded side left/right/top/bottom) · tu/td/tl/tr triangle (apex up/down/left/right) · sl/bs diagonal band (/ \)
  // A sixth value of 1 means drawn again in a different ink (a piece like the crossbar of A that only reads when laid on top)
  const GLYPHS = {
    A: [8.6, [["tu", 0, 0, 8.6, 10], ["r", 2.7, 6.3, 3.2, 1.7, 1]]],
    B: [7.2, [["r", 0, 0, 2.6, 10], ["rr", 2.6, 0, 4.2, 4.9], ["rr", 2.6, 5.1, 4.6, 4.9]]],
    C: [8, [["rl", 0, 0, 4.6, 10], ["r", 4.6, 0, 3.4, 2.6], ["r", 4.6, 7.4, 3.4, 2.6]]],
    D: [7.6, [["r", 0, 0, 2.6, 10], ["rr", 2.6, 0, 5, 10]]],
    E: [6.8, [["r", 0, 0, 2.6, 10], ["r", 2.6, 0, 4.2, 2.6], ["r", 2.6, 3.9, 3.4, 2.3], ["r", 2.6, 7.4, 4.2, 2.6]]],
    F: [6.6, [["r", 0, 0, 2.6, 10], ["r", 2.6, 0, 4, 2.6], ["r", 2.6, 3.9, 3.2, 2.3]]],
    G: [8.6, [["rl", 0, 0, 4.6, 10], ["r", 4.6, 0, 3.8, 2.6], ["rb", 4.6, 4.6, 4, 5.4]]],
    H: [8.6, [["r", 0, 0, 2.6, 10], ["r", 6, 0, 2.6, 10], ["r", 2.6, 3.9, 3.4, 2.3]]],
    I: [3, [["e", 0, 0, 3, 2.6], ["r", 0, 3.4, 3, 6.6]]],
    J: [6.6, [["r", 4, 0, 2.6, 5], ["rb", 0, 5, 6.6, 5]]],
    K: [8, [["r", 0, 0, 2.6, 10], ["tl", 2.6, 0, 5.4, 10]]],
    L: [7, [["r", 0, 0, 2.6, 10], ["r", 2.6, 7.2, 4.4, 2.8]]],
    M: [10, [["r", 0, 0, 2.6, 10], ["td", 2.6, 0, 4.8, 6.6], ["r", 7.4, 0, 2.6, 10]]],
    N: [8.6, [["r", 0, 0, 2.6, 10], ["bs", 0, 0, 8.6, 10], ["r", 6, 0, 2.6, 10]]],
    O: [8.6, [["e", 0, 0, 8.6, 10]]],
    P: [7.4, [["r", 0, 0, 2.6, 10], ["rr", 2.6, 0, 4.8, 6.2]]],
    Q: [8.6, [["e", 0, 0, 8.6, 10], ["bs", 4.6, 6, 4, 4, 1]]],
    R: [7.4, [["r", 0, 0, 2.6, 10], ["rr", 2.6, 0, 4.8, 6.2], ["bs", 2.6, 5.4, 4.8, 4.6]]],
    S: [8, [["rl", 0, 0, 4.6, 5.3], ["r", 4.6, 0, 3.4, 2.5], ["rr", 3.4, 4.7, 4.6, 5.3], ["r", 0, 7.5, 3.4, 2.5]]],
    T: [8, [["r", 0, 0, 8, 2.8], ["r", 2.7, 2.8, 2.6, 7.2]]],
    U: [8.6, [["r", 0, 0, 2.6, 5], ["r", 6, 0, 2.6, 5], ["rb", 0, 3, 8.6, 7]]],
    V: [8.6, [["td", 0, 0, 8.6, 10]]],
    W: [12, [["td", 0, 0, 6, 10], ["td", 6, 0, 6, 10]]],
    X: [8.6, [["td", 0, 0, 8.6, 5], ["tu", 0, 5, 8.6, 5]]],
    Y: [8.6, [["td", 0, 0, 8.6, 5.4], ["r", 3, 5.4, 2.6, 4.6]]],
    Z: [8, [["r", 0, 0, 8, 2.6], ["sl", 0, 2.6, 8, 4.8], ["r", 0, 7.4, 8, 2.6]]],
    0: [6.6, [["e", 0, 0, 6.6, 10]]],
    1: [4.4, [["tl", 0, 0, 1.8, 3], ["r", 1.8, 0, 2.6, 10]]],
    "-": [4.4, [["r", 0, 3.9, 4.4, 2.3]]],
    ".": [2.8, [["e", 0, 7.2, 2.8, 2.8]]],
    " ": [3.2, []],
  };
  const SWAPS = ["r", "e", "rl", "rr", "rt", "rb", "tu", "td"];

  function shapePath(ctx, t, x, y, w, h) {
    ctx.beginPath();
    if (t === "r") ctx.rect(x, y, w, h);
    else if (t === "e") ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (t === "rl") ctx.ellipse(x + w, y + h / 2, w, h / 2, 0, Math.PI / 2, Math.PI * 1.5);
    else if (t === "rr") ctx.ellipse(x, y + h / 2, w, h / 2, 0, -Math.PI / 2, Math.PI / 2);
    else if (t === "rt") ctx.ellipse(x + w / 2, y + h, w / 2, h, 0, Math.PI, Math.PI * 2);
    else if (t === "rb") ctx.ellipse(x + w / 2, y, w / 2, h, 0, 0, Math.PI);
    else if (t === "tu") { ctx.moveTo(x, y + h); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + h); }
    else if (t === "td") { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w / 2, y + h); }
    else if (t === "tl") { ctx.moveTo(x + w, y); ctx.lineTo(x, y + h / 2); ctx.lineTo(x + w, y + h); }
    else if (t === "tr") { ctx.moveTo(x, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x, y + h); }
    else if (t === "sl") { ctx.moveTo(x + w * 0.62, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w * 0.38, y + h); ctx.lineTo(x, y + h); }
    else if (t === "bs") { ctx.moveTo(x, y); ctx.lineTo(x + w * 0.38, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w * 0.62, y + h); }
    ctx.closePath();
  }

  kfFx.register("stripe-glyphs", (el, { options, reduce, scroller }) => {
    const rows = String(options.text ?? el.getAttribute("aria-label") ?? "").toUpperCase().split("/").map((r) => r.trim()).filter(Boolean);
    if (!rows.length) return;
    const mode = options.mode || "scrub", lines = +options.lines || 34, gap = +(options.gap ?? 0.5), field = +(options.field ?? 0), rowGap = +(options.rowgap ?? 0.035);
    const from = +(options.from ?? 0.55);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    // Seed random — so the same shading direction appears even after a refresh
    let seed = +options.seed || 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const pieces = [];
    const unitW = [];
    rows.forEach((text, ri) => {
      let ux = 0;
      [...text].forEach((ch, ci) => {
        const [w, parts] = GLYPHS[ch] || [6, [["r", 0, 0, 6, 10]]];
        parts.forEach(([t, x, y, pw, ph, over], pi) => {
          const ink = over ? 1 - ((ci + pi) % 2) : (ci + pi) % 2;
          pieces.push({ ri, t, base: t, x: ux + x, y, w: pw, h: ph, ink, baseInk: ink, over: !!over, dir: rnd() > 0.45, next: null, p: 0, vis: mode === "loop" && !reduce ? 0 : 1 });
        });
        ux += w + gap;
      });
      unitW[ri] = ux - gap;
    });
    pieces.sort((a, b) => a.over - b.over);
    // Elements without a set height size by the text ratio
    const sized = el.clientHeight < 2;
    if (sized) el.style.aspectRatio = `${Math.max(...unitW)} / ${rows.length * 10 * (1 + rowGap)}`;

    let fill = mode === "scrub" && !reduce ? from : 1, W = 0, H = 0, inks = [];
    // Canvas can’t read variables, so apply the variable to the canvas text color and take the value the browser resolves
    const readInks = () => {
      canvas.style.color = "var(--fx-ink, var(--kf-ink))";
      const a = getComputedStyle(canvas).color;
      canvas.style.color = "var(--fx-ink-2, var(--kf-dim))";
      inks = [a, getComputedStyle(canvas).color];
    };
    const stripes = (t, ink, dir, [x, y, w, h], top, P, lo, hi, vis) => {
      ctx.save();
      shapePath(ctx, t, x, y, w, h);
      ctx.clip();
      ctx.fillStyle = inks[ink];
      const k0 = Math.floor((y - top) / P), k1 = Math.ceil((y + h - top) / P);
      for (let k = k0; k <= k1; k++) {
        const ly = top + k * P, rel = (ly + P / 2 - y) / h;
        if (rel < lo || rel >= hi) continue;
        const g = Math.min(1, Math.max(0, dir ? rel : 1 - rel));
        const th = (P * (0.24 + 0.68 * g) * (0.2 + 0.8 * fill) + 0.35) * vis;
        ctx.fillRect(x - 1, ly + (P - th) / 2, w + 2, th);
      }
      ctx.restore();
    };
    const draw = () => {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      const n = rows.length, gapPx = H * rowGap, rowH = (H - gapPx * (n - 1)) / n, P = rowH / lines;
      if (field) {
        ctx.fillStyle = inks[0];
        ctx.globalAlpha = field;
        for (let ri = 0; ri < n; ri++) for (let k = 0; k <= lines; k += 2) ctx.fillRect(0, ri * (rowH + gapPx) + k * P, W, 1);
        ctx.globalAlpha = 1;
      }
      for (const pc of pieces) {
        const sx = W / unitW[pc.ri], sy = rowH / 10, top = pc.ri * (rowH + gapPx);
        const box = [pc.x * sx, top + pc.y * sy, pc.w * sx, pc.h * sy];
        if (pc.next && pc.p > 0) {
          stripes(pc.next.t, pc.next.ink, pc.dir, box, top, P, 0, pc.p, pc.vis);
          stripes(pc.t, pc.ink, pc.dir, box, top, P, pc.p, 1, pc.vis);
        } else if (pc.vis > 0.01) stripes(pc.t, pc.ink, pc.dir, box, top, P, 0, 1, pc.vis);
      }
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readInks();
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let dirty = false;
    const tick = () => { if (dirty) { dirty = false; draw(); } };
    const fxCtx = gsap.context(() => {
      if (reduce) return;
      gsap.ticker.add(tick);
      if (mode === "scrub") {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top bottom", end: options.end || "bottom 40%", scrub: true, onUpdate: (st) => { fill = from + (1 - from) * st.progress; dirty = true; } });
      } else if (mode === "loop") {
        // Once at first: shuffled fragments enter an empty panel, thickening line by line, and turn into the real text (intro sec). After that, every every sec
        // After holding 1s, each line thins out and vanishes at .5s intervals (.4s power2.in), thickens into scrambled pieces (.4s), then returns to its own letters (.5s power2.out)
        const intro = +(options.intro ?? 3), every = +(options.every ?? 5), lag = 0.02;
        const byRow = rows.map((_, ri) => pieces.filter((p) => p.ri === ri).sort((a, b) => a.x - b.x));
        const pick = (pc) => {
          if (pc.over) return { t: pc.base, ink: pc.baseInk };
          const opts = SWAPS.filter((x) => x !== pc.base);
          return { t: opts[Math.floor(Math.random() * opts.length)], ink: Math.random() < 0.5 ? 1 - pc.baseInk : pc.baseInk };
        };
        const home = (tl, ps, at) => ps.forEach((pc, i) => {
          if (pc.over) return;
          const t0 = at + i * 0.025;
          tl.call(() => { pc.next = { t: pc.base, ink: pc.baseInk }; pc.p = 0; }, null, t0)
            .to(pc, { p: 1, duration: 0.5, ease: "power2.out" }, t0)
            .call(() => Object.assign(pc, { t: pc.base, ink: pc.baseInk, next: null, p: 0 }), null, t0 + 0.5);
        });
        const mark = () => (dirty = true);
        const loop = gsap.timeline({ paused: true, repeat: -1, onUpdate: mark });
        byRow.forEach((ps, k) => {
          const t0 = 1 + k * 0.5, t1 = t0 + 0.4;
          loop.to(ps, { vis: 0, duration: 0.4, ease: "power2.in", stagger: lag }, t0);
          ps.forEach((pc, i) => loop.call(() => Object.assign(pc, pick(pc)), null, t1 + i * lag));
          loop.to(ps, { vis: 1, duration: 0.4, ease: "power2.out", stagger: lag }, t1 + lag * ps.length);
          home(loop, ps, t1 + lag * ps.length + 0.6);
        });
        loop.set({}, {}, Math.max(every, loop.duration()));
        const first = gsap.timeline({ delay: +(options.delay ?? 0), onUpdate: mark, onComplete: () => loop.play(0) });
        byRow.forEach((ps, k) => {
          first.call(() => ps.forEach((pc) => Object.assign(pc, pick(pc))), null, 0);
          first.to(ps, { vis: 1, duration: 0.6, ease: "power2.out", stagger: lag }, 0.25 + k * 0.65);
          home(first, ps, Math.max(0.9, intro - 1) + k * 0.4);
        });
        first.set({}, {}, intro);
      }
    }, el);
    return () => { gsap.ticker.remove(tick); fxCtx.revert(); ro.disconnect(); canvas.remove(); if (sized) el.style.aspectRatio = ""; };
  });
})();
