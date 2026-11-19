(() => {
  // Per-letter rise ratio (original METER) — letters must be uneven even at the same speed to look like a meter
  kfFx.register("vu-meter-text", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      if (reduce || !el.textContent.trim()) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      const METER = [0.62, 0.9, 0.48, 1, 0.7, 0.55, 0.95, 0.66, 0.8, 0.42];
      const beat = 60 / (+options.bpm || 142), release = kfFx.ease("0.1,0.6,0.3,0.9", "power2.out");
      const chars = SplitText.create(el, { type: "chars" }).chars;
      const lift = (i) => METER[i % METER.length];
      gsap.set(chars, { transformOrigin: "50% 100%" });
      let ready = false;
      gsap.timeline({ delay: 0.15, onComplete: () => (ready = true) })
        .to(chars, { scaleY: (i) => 1 + 0.2 * lift(i), duration: beat * 0.25, stagger: beat / 8, ease: "power1.out" }, 0)
        .to(chars, { scaleY: 1, duration: beat * 2, stagger: beat / 8, ease: release }, beat * 0.25);
      const set = chars.map((c) => gsap.quickTo(c, "scaleY", { duration: beat, ease: release }));
      const now = chars.map(() => 1);
      let vel = 0, px = null, centers = [], cw = 1;
      const tick = () => {
        if (!ready) return;
        vel *= 0.9;
        const level = Math.min(1, Math.abs(vel) / 3000);
        chars.forEach((c, i) => {
          let s = 1 + level * lift(i) * 0.2;
          if (px !== null) { const d = (centers[i] - px) / cw; s = Math.max(s, 1 + 0.14 * Math.exp(-d * d * 0.6)); }
          if (Math.abs(s - now[i]) > 0.003) { now[i] = s; set[i](s); }
        });
      };
      ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onUpdate: (s) => (vel = s.getVelocity()),
        onToggle: (s) => (s.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)) });
      gsap.ticker.add(tick);
      signal.addEventListener("abort", () => gsap.ticker.remove(tick));
      if (!hover) return;
      el.addEventListener("pointerenter", () => {
        centers = chars.map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; });
        cw = Math.max(1, el.getBoundingClientRect().width / chars.length);
      }, { signal });
      el.addEventListener("pointermove", (e) => (px = e.clientX), { signal });
      el.addEventListener("pointerleave", () => (px = null), { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
