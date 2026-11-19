(() => {
  const NS = "http://www.w3.org/2000/svg";
  const LAYERS = [
    { wave: 400, opacity: 0.6, speed: 0.5, blur: 1.2, seed: 11 },
    { wave: 300, opacity: 0.75, speed: 0.6, blur: 1, seed: 29 },
    { wave: 150, amp: 80, opacity: 1, speed: 0.7, blur: 0.8, seed: 53 },
  ];
  // Phase set by a seed — uses a linear congruential random so the same wave appears every time it opens
  const rng = (seed) => { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
  let uid = 0;

  kfFx.register("blur-wave-glow", (el, { options, reduce }) => {
    const W = 1440, pad = W * 0.18, TAU = Math.PI * 2;
    const steps = Math.max(2, +options.points || 8), speedMul = +(options.speed ?? 1);
    const blur = +(options.blur ?? 16), fill = +(options.fill ?? 0.5);
    const xs = Array.from({ length: steps + 1 }, (_, i) => -pad + (i * (W + 2 * pad)) / steps);
    const layers = LAYERS.map((cfg) => {
      const r = rng(cfg.seed);
      const pts = xs.map(() => ({ p1: r() * TAU, p2: r() * TAU, f1: 0.8 + r() * 0.4, f2: 0.8 + r() * 0.4 }));
      const id = `fx-bwg-${++uid}`;
      const box = document.createElement("div");
      box.setAttribute("data-fx-part", "layer");
      box.style.opacity = cfg.opacity;
      box.style.filter = `blur(${blur * cfg.blur}px)`;
      box.innerHTML = `<svg preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0"><stop offset="0" stop-color="currentColor" stop-opacity="${fill}"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path fill="url(#${id})"/></svg>`;
      el.appendChild(box);
      return { cfg, pts, box, svg: box.querySelector("svg"), grad: box.querySelector("linearGradient"), path: box.querySelector("path"), h: 0, mid: 0, amp: 0 };
    });

    const size = () => {
      const base = innerWidth <= 600 ? +(options["base-sm"] ?? 250) : +(options.base ?? 200);
      for (const L of layers) {
        L.h = base + L.cfg.wave;
        L.mid = L.cfg.wave / 2;
        L.amp = L.cfg.amp ?? L.cfg.wave * 0.45;
        L.box.style.height = L.h + "px";
        L.svg.setAttribute("viewBox", `0 0 ${W} ${L.h}`);
        L.grad.setAttribute("y2", L.h);
      }
    };
    // Smooth curve through the points — convert Catmull-Rom tangents into cubic Bezier handles
    const curve = (ys, h) => {
      let d = `M${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
      for (let i = 0; i < xs.length - 1; i++) {
        const xa = xs[i - 1] ?? xs[i], ya = ys[i - 1] ?? ys[i], xb = xs[i + 2] ?? xs[i + 1], yb = ys[i + 2] ?? ys[i + 1];
        d += ` C${(xs[i] + (xs[i + 1] - xa) / 6).toFixed(1)} ${(ys[i] + (ys[i + 1] - ya) / 6).toFixed(1)} ${(xs[i + 1] - (xb - xs[i]) / 6).toFixed(1)} ${(ys[i + 1] - (yb - ys[i]) / 6).toFixed(1)} ${xs[i + 1].toFixed(1)} ${ys[i + 1].toFixed(1)}`;
      }
      return d + ` L${xs[xs.length - 1].toFixed(1)} ${h} L${xs[0].toFixed(1)} ${h}Z`;
    };
    const draw = (t) => {
      for (const L of layers) {
        const sp = L.cfg.speed * speedMul;
        const ys = L.pts.map((p) => L.mid + L.amp * (0.62 * Math.sin(t * sp * p.f1 + p.p1) + 0.38 * Math.sin(t * sp * 1.62 * p.f2 + p.p2)));
        L.path.setAttribute("d", curve(ys, L.h));
      }
    };

    size();
    addEventListener("resize", size);
    draw(0);
    const cleanup = () => { removeEventListener("resize", size); layers.forEach((L) => L.box.remove()); };
    if (reduce) return cleanup;

    let raf = 0, seen = false;
    const loop = (now) => { draw(now / 1000); raf = requestAnimationFrame(loop); };
    const run = () => { if (!raf && seen && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : stop(); });
    io.observe(el);
    const vis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", vis); cleanup(); };
  });
})();
