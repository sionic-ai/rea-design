(() => {
  // The small wedge (svg shape) in the hero grows and tilts as you scroll down until it covers the whole screen in one color.
  // Scrubs while scrolling down by the pinned stage (element) height × ratio, and within the first until share it grows fully along a curve (power2.inOut).
  // A fully grown wedge: the tilted border box width is cover px, the top edge is top px, and the center is shift px to the side of stage center.
  // With the same progress value, stage pieces flip at each threshold — out disappears and in appears (crossing backwards undoes it).
  kfFx.register("wedge-flood-scroll", (el, { options, reduce, scroller }) => {
    const svg = el.querySelector('[data-fx-part="wedge"]');
    const shape = svg?.querySelector("path, polygon, g");
    if (!svg || !shape) return;
    const cover = +(options.cover ?? 7365), top = +(options.top ?? -1140), shift = +(options.shift ?? -100);
    const turn = +(options.turn ?? 8), until = +(options.until ?? 0.25) || 0.25, ratio = +(options.ratio ?? 0.3) || 0.3;
    const ease = gsap.parseEase(options.ease || "power2.inOut");
    const steps = [...el.querySelectorAll('[data-fx-part="out"], [data-fx-part="in"]')];
    const groups = new Map();
    for (const s of steps) {
      const at = +(s.dataset.at ?? 0.1), key = `${s.dataset.fxPart}:${at}`;
      if (!groups.has(key)) groups.set(key, { at, mode: s.dataset.fxPart, els: [], played: false });
      groups.get(key).els.push(s);
    }
    const list = [...groups.values()];
    if (reduce) {
      list.forEach((g) => gsap.set(g.els, { opacity: g.mode === "in" ? 1 : 0 }));
      return () => gsap.set(steps, { clearProps: "opacity,transform" });
    }
    list.filter((g) => g.mode === "in").forEach((g) => gsap.set(g.els, { opacity: 0 }));
    const box = svg.viewBox.baseVal;
    let goal = { s: 1, x: 0, y: 0 };
    const measure = () => {
      const r = svg.getBoundingClientRect(), host = el.getBoundingClientRect();
      const k = r.width / (box.width || r.width);
      const rad = (turn * Math.PI) / 180, c = Math.abs(Math.cos(rad)), sn = Math.abs(Math.sin(rad));
      const s = cover / (r.width * c + r.height * sn);
      const bh = (r.width * sn + r.height * c) * s;
      const cx = host.width / 2 + shift, cy = top + bh / 2;
      const ox = r.left - host.left + r.width / 2, oy = r.top - host.top + r.height / 2;
      goal = { s, x: (cx - ox) / k, y: (cy - oy) / k };
    };
    gsap.set(shape, { svgOrigin: `${box.x + box.width / 2} ${box.y + box.height / 2}` });
    const drive = (p) => {
      for (const g of list) {
        const on = p >= g.at;
        if (on === g.played) continue;
        g.played = on;
        gsap.killTweensOf(g.els);
        const show = (g.mode === "in") === on;
        const y = +(g.els[0].dataset.y ?? 0), x = +(g.els[0].dataset.x ?? 0), sc = +(g.els[0].dataset.scale ?? 1);
        if (show && g.mode === "in") {
          gsap.fromTo(g.els, { opacity: 0, y, x, scale: sc }, { opacity: 1, y: 0, x: 0, scale: 1, duration: +(g.els[0].dataset.dur ?? 0.5), ease: g.els[0].dataset.ease || "power4.out", stagger: +(g.els[0].dataset.stagger ?? 0.04) });
        } else if (show) {
          gsap.to(g.els, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.2, ease: "power4.in" });
        } else {
          gsap.to(g.els, { opacity: 0, y: g.mode === "in" ? y : 0, scale: g.mode === "in" ? sc : 1, duration: g.mode === "in" ? 0.3 : 0.4, ease: g.mode === "in" ? "power4.out" : "power2.out" });
        }
      }
      el.dispatchEvent(new CustomEvent("fx:progress", { detail: p }));
    };
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: "top top", end: () => `+=${el.offsetHeight * ratio}`, scrub: true, invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate: (self) => {
        const h = Math.min(1, Math.max(0, ease(self.progress) / until));
        gsap.set(shape, { scale: 1 + (goal.s - 1) * h, rotation: turn * h, x: goal.x * h, y: goal.y * h });
        drive(self.progress);
      },
    });
    measure();
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); st.kill(); gsap.killTweensOf(steps); gsap.set(shape, { clearProps: "transform" }); gsap.set(steps, { clearProps: "opacity,transform" }); };
  });
})();
