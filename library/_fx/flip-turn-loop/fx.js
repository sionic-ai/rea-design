// Photo cells flip a full turn in place at set intervals — 360° over 0.8s (overshooting by 1.4 at the end, then returning), the first on the horizontal axis and the next on the vertical.
// Even-numbered cells turn one interval later, so they stagger in pairs. Perspective is cell height × 3 (not smaller than width × 0.75). Stops offscreen
(() => {
  const angle = (x, over) => {
    if (x <= 0) return 0;
    if (x >= 1) return Math.PI * 2;
    const n = x - 1;
    return (1 + (over + 1) * n ** 3 + over * n ** 2) * Math.PI * 2;
  };
  kfFx.register("flip-turn-loop", (el, { options, reduce }) => {
    if (reduce || !el.animate) return;
    const every = +(options.every ?? 1.5) * 1000, dur = Math.min(every, +(options.dur ?? 0.8) * 1000), over = +(options.overshoot ?? 1.4), samples = 32;
    const axes = options.axis === "x" ? ["x"] : options.axis === "y" ? ["y"] : ["x", "y"];
    let anims = [];
    const build = () => {
      anims.forEach((a) => a.cancel());
      const parts = [...el.querySelectorAll('[data-fx-part="tile"]')];
      const tiles = parts.length ? parts : [...el.children];
      anims = tiles.map((t, i) => {
        const persp = Math.max(1, t.offsetHeight * 3, t.offsetWidth * 0.75), total = every * 2 * axes.length, frames = [];
        axes.forEach((ax, k) => {
          const from = k * every * 2;
          const pose = (a) => `perspective(${persp}px) rotateY(${ax === "y" ? a : 0}rad) rotateX(${ax === "x" ? a : 0}rad)`;
          for (let s = 0; s <= samples; s++) frames.push({ offset: (from + (s / samples) * dur) / total, transform: pose(angle(s / samples, over)) });
          frames.push({ offset: (k + 1) / axes.length, transform: pose(Math.PI * 2) });
        });
        return t.animate(frames, { duration: total, delay: (i % 2) * every, iterations: Infinity, fill: "both", easing: "linear" });
      });
    };
    build();
    const io = new IntersectionObserver(([e]) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause())));
    io.observe(el);
    const ro = new ResizeObserver(() => { const t = anims[0]?.currentTime || 0; build(); anims.forEach((a) => (a.currentTime = t)); });
    ro.observe(el);
    const replay = () => anims.forEach((a) => { a.currentTime = 0; a.play(); });
    el.addEventListener("fx:play", replay);
    return () => { io.disconnect(); ro.disconnect(); el.removeEventListener("fx:play", replay); anims.forEach((a) => a.cancel()); };
  });
})();
