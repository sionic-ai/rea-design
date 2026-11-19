(() => {
  // Original (Framer Slideshow part): lays out four copies of a row showing a few cells, and loops endlessly by wrapping the row position by one copy’s length.
  // On each turn, the row rides a spring to current cell × (cell width + gap) (stiffness 200 · damping 40 · mass 1, settling in about .9s with no overshoot), inheriting the previous speed.
  // For each cell: 1 while fully inside the board, pivoting on the right edge while leaving one cell past the board’s left, and on the left edge while entering from past the right
  // Size (default .9) and opacity (default 0) change linearly by position in the row. Advances on its own every interval (default 5s), and pressing a button recounts from that spot. Rests when off screen
  kfFx.register("spring-edge-slideshow", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const own = [...track.children];
    const n = own.length;
    if (n < 2) return;
    const wide = +(options.items || 2), gap = +(options.gap ?? 24), interval = +(options.interval ?? 5);
    // Narrow screens get their own card count — the original phone version (under 810px) shows one at a time
    const narrowMq = matchMedia(`(max-width: ${+(options.narrow || 809.98)}px)`), narrowItems = +(options["items-narrow"] || wide);
    const k = +(options.k || 200), c = +(options.c || 40), m = +(options.m || 1);
    const sMin = +(options.scale ?? 0.9), oMin = +(options.opacity ?? 0), auto = options.auto !== "off" && !reduce;
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    el.style.setProperty("--fx-gap", `${gap}px`);
    // Add three more copies so no gap shows when paging back and forth — clones are excluded from reading and tab order
    const clones = [];
    for (let r = 1; r < 4; r++) for (const it of own) {
      const cl = it.cloneNode(true);
      cl.setAttribute("aria-hidden", "true");
      cl.querySelectorAll("a,button,[tabindex]").forEach((a) => a.setAttribute("tabindex", "-1"));
      track.append(cl);
      clones.push(cl);
    }
    const all = [...track.children];
    let unit = 0, item = 0, span = 0, parent = 0;
    let at = n, x = 0, v = 0, goal = 0, raf = 0, last = 0, timer = 0, seen = true;
    const lerp = (val, xs, ys) => {
      if (val <= xs[0]) return ys[0];
      for (let i = 1; i < xs.length; i++) if (val <= xs[i]) { const t = xs[i] === xs[i - 1] ? 1 : (val - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[i - 1] + (ys[i] - ys[i - 1]) * t; }
      return ys[ys.length - 1];
    };
    // Original wrap(-one set, -two sets, x) — result lies within (−two sets, −one set]
    const wrap = (val) => { const r = -span; return ((((val + span) % r) + r) % r) - span; };
    const paint = () => {
      if (!span) return;
      const y = wrap(x);
      track.style.transform = `translate3d(${y}px,0,0)`;
      all.forEach((it, u) => {
        const off = unit * u;
        const w = [-item - off, -off, parent - item + gap - off, parent - off];
        it.style.opacity = lerp(y, w, [oMin, 1, 1, oMin]);
        it.style.transform = `scale(${lerp(y, w, [sMin, 1, 1, sMin])})`;
        it.style.transformOrigin = `${lerp(y, w, [1, 1, 0, 0]) * 100}% 50%`;
      });
    };
    const size = () => {
      el.style.setProperty("--fx-items", narrowMq.matches ? narrowItems : wide);
      parent = track.offsetWidth;
      item = own[0].offsetWidth;
      unit = item + gap;
      span = (own[n - 1].offsetLeft + own[n - 1].offsetWidth) - own[0].offsetLeft + gap;
      x = goal = -at * unit; v = 0;
      paint();
    };
    const run = (now) => {
      const dt = Math.min(0.064, Math.max(0.001, (now - (last || now)) / 1000 || 0.016));
      last = now;
      for (let t = 0; t < dt; t += 0.001) { const a = (-k * (x - goal) - c * v) / m; v += a * 0.001; x += v * 0.001; }
      if (Math.abs(v) < 2 && Math.abs(x - goal) < 0.3) { x = goal; v = 0; paint(); raf = 0; return; }
      paint();
      raf = requestAnimationFrame(run);
    };
    const arm = () => {
      clearTimeout(timer);
      if (auto && seen) timer = setTimeout(() => go(at + 1), interval * 1000);
    };
    const go = (j) => {
      at = j; goal = -at * unit;
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: ((at % n) + n) % n } }));
      if (reduce) { x = goal; v = 0; paint(); }
      else if (!raf) { last = 0; raf = requestAnimationFrame(run); }
      arm();
    };
    const onPrev = (e) => { e.preventDefault(); go(at - 1); };
    const onNext = (e) => { e.preventDefault(); go(at + 1); };
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    const ro = new ResizeObserver(size);
    ro.observe(track);
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen) arm(); else clearTimeout(timer); });
    io.observe(el);
    size();
    arm();
    return () => {
      clearTimeout(timer); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      clones.forEach((cl) => cl.remove());
      own.forEach((it) => { it.style.opacity = ""; it.style.transform = ""; it.style.transformOrigin = ""; });
      track.style.transform = "";
      el.style.removeProperty("--fx-items");
      el.style.removeProperty("--fx-gap");
    };
  });
})();
