(() => {
  // Layer color candidates — the first layer leans toward the accent color, the second toward the paler one. They are derived by rotating from the accent, so they change along with the skin
  const SETS = [
    ["var(--kf-accent)", "oklch(from var(--kf-accent) calc(l + 0.173) calc(c - 0.089) calc(h + 116))", "oklch(from var(--kf-accent) calc(l - 0.106) calc(c - 0.157) calc(h - 45))"],
    ["oklch(from var(--kf-accent) calc(l + 0.29) calc(c - 0.167) calc(h - 43))", "oklch(from var(--kf-accent) calc(l + 0.4) calc(c - 0.1) calc(h - 174))", "var(--kf-accent-soft)"],
  ];
  kfFx.register("echo-lag-layers", (el, { options, reduce }) => {
    let layers = [...el.children].filter((c) => c.getAttribute("data-fx-part") === "layer");
    const made = [];
    if (!layers.length) {
      for (let i = 0; i < 2; i++) {
        const s = document.createElement("span");
        s.setAttribute("data-fx-part", "layer");
        s.setAttribute("aria-hidden", "true");
        el.prepend(s);
        made.push(s);
      }
      layers = made.slice().reverse();
    }
    if ((options.colors || "on") !== "off") layers.forEach((l, i) => {
      const set = SETS[i % SETS.length];
      l.style.setProperty("--fx-echo-color", set[Math.floor(Math.random() * set.length)]);
    });
    const look = options.look || "trailing";
    const off = () => {
      layers.forEach((l) => { l.style.transform = ""; l.style.removeProperty("--fx-echo-color"); });
      made.forEach((n) => n.remove());
    };
    if (reduce) return off;
    const min = +(options.min ?? (look === "velocity" ? 768 : 1000));
    const mq = matchMedia(`(min-width: ${min}px)`);

    if (look === "velocity") {
      let lastY = scrollY, lastT = performance.now();
      const onScroll = () => {
        if (!mq.matches) return;
        const now = performance.now(), dt = Math.max(1, now - lastT);
        const v = Math.abs(((scrollY - lastY) / dt) * 1000) / 8000;
        lastY = scrollY; lastT = now;
        layers.forEach((l, i) => {
          const s = gsap.utils.clamp(1, 1 + 0.15 + 0.05 * i, 1 + v * 0.5 * (i + 1));
          gsap.to(l, { scale: s, duration: 0.1, overwrite: true, ease: "none" });
          gsap.to(l, { scale: 1, duration: 0.3 + 0.1 * i, overwrite: "auto", ease: "power1.out", delay: 0.1 });
        });
      };
      addEventListener("scroll", onScroll, { passive: true });
      return () => { removeEventListener("scroll", onScroll); gsap.killTweensOf(layers); gsap.set(layers, { clearProps: "transform" }); off(); };
    }

    const dir = look === "leading" ? 1 : -1, lag = +(options.lag ?? 100);
    let y = scrollY, on = false;
    const run = layers.map((l, i) => ({ l, cur: scrollY, lerp: Math.max(0.02, 0.14 - 0.06 * i), max: lag * ((i + 1) / layers.length) }));
    const tick = () => {
      let still = true;
      run.forEach((r) => {
        r.cur += (y - r.cur) * r.lerp;
        r.cur = Math.max(y - r.max, Math.min(y + r.max, r.cur));
        const d = Math.round(10 * (r.cur - y)) / 10;
        if (Math.abs(d) > 0.5) still = false;
        r.l.style.transform = `translate3d(0, ${d * dir}px, 0)`;
      });
      if (still) { gsap.ticker.remove(tick); on = false; }
    };
    const onScroll = () => {
      y = scrollY;
      if (!mq.matches) return;
      if (!on) { on = true; gsap.ticker.add(tick); }
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); gsap.ticker.remove(tick); off(); };
  });
})();
