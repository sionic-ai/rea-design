(() => {
  // Hand-drawn style border: replaces the element’s CSS border with an SVG ring of the same color · thickness (an evenodd path drawn with the outer and inner edges wobbling separately), and
  // Pre-draw 8 slightly different frames and cycle at 8 per second (paused off-screen). Stops on the first frame on phones and with reduced motion.
  const D = { width: 5, reference: 200, grow: 0.005, wobble: 1, fps: 8, frames: 8, feature: 36, thickness: 0.15, step: 6 };
  const rng = (seed) => { let s = seed | 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  // Smooth noise along the perimeter — set a random value every feature px and blend smoothly between them
  function noise1(len, feature, rand) {
    const n = Math.max(2, Math.ceil(len / feature) + 1), knots = Array.from({ length: n }, () => rand() * 2 - 1);
    return (d) => { const f = (d / len) * (n - 1), i = Math.floor(f) % (n - 1), t = f - Math.floor(f), s = t * t * (3 - 2 * t); return knots[i] * (1 - s) + knots[(i + 1) % (n - 1)] * s; };
  }
  function ring(w, h, bw, wobble, seed, o) {
    const rand = rng(seed), per = 2 * (w + h);
    const outer = noise1(per, o.feature, rand), inner = noise1(per, o.feature, rand), thick = noise1(per, o.feature * 2, rand);
    const pts = (inset, fn, amp) => {
      const out = [];
      const W = w - inset * 2, H = h - inset * 2, P = 2 * (W + H);
      for (let d = 0; d < P; d += o.step) {
        let x, y, nx, ny;
        if (d < W) { x = inset + d; y = inset; nx = 0; ny = -1; }
        else if (d < W + H) { x = inset + W; y = inset + d - W; nx = 1; ny = 0; }
        else if (d < 2 * W + H) { x = inset + W - (d - W - H); y = inset + H; nx = 0; ny = 1; }
        else { x = inset; y = inset + H - (d - 2 * W - H); nx = -1; ny = 0; }
        const k = fn((d / P) * per) * amp;
        out.push(`${(x + nx * k).toFixed(1)} ${(y + ny * k).toFixed(1)}`);
      }
      return `M${out.join("L")}Z`;
    };
    const t = bw * (1 + o.thickness * thick(per / 3));
    return pts(0, outer, wobble * 1.4) + pts(t, inner, wobble * 1.4);
  }
  const live = new Set();
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now() / 1000;
    live.forEach((b) => {
      if (!b.visible || b.still || !b.frames.length) return;
      const i = Math.floor(now * b.fps) % b.frames.length;
      if (i === b.shown) return;
      b.shown = i;
      b.path.setAttribute("d", (b.frames[i] ??= b.draw(i)));
    });
  };
  let seedN = 0;
  kfFx.register("sketch-border", (el, { options, reduce, hover }) => {
    const o = { ...D, feature: +(options.feature ?? D.feature), thickness: +(options.thickness ?? D.thickness), step: +(options.step || D.step) };
    const width = +(options.width ?? D.width), wobble = +(options.wobble ?? D.wobble);
    const fps = reduce || !hover ? 0 : +(options.fps ?? D.fps);
    const seed = +(options.seed ?? ++seedN);
    const cs = getComputedStyle(el);
    const side = ["top", "right", "bottom", "left"].find((p) => parseFloat(cs.getPropertyValue(`border-${p}-width`)) > 0);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("data-fx-part", "sketch-ring");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("fill-rule", "evenodd");
    svg.appendChild(path);
    const b = { path, frames: [], draw: () => "", fps, shown: -1, still: fps <= 0, visible: true };
    const build = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      svg.style.color = side ? getComputedStyle(el).getPropertyValue(`border-${side}-color`) : "";
      const bw = width + Math.max(0, Math.min(w, h) - D.reference) * D.grow;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      b.frames = Array(fps > 0 ? D.frames : 1);
      b.draw = (i) => ring(w, h, bw, wobble, seed * 7919 + i * 104729, o);
      b.shown = -1;
      path.setAttribute("d", (b.frames[0] = b.draw(0)));
    };
    el.appendChild(svg);
    el.setAttribute("data-sketch-ready", "");
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el, { box: "border-box" });
    const io = new IntersectionObserver(([e]) => (b.visible = e.isIntersecting));
    io.observe(el);
    live.add(b);
    if (!raf) raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect(); io.disconnect(); live.delete(b); svg.remove(); el.removeAttribute("data-sketch-ready");
      if (!live.size && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
  });
})();
