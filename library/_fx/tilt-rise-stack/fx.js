(() => {
  kfFx.register("tilt-rise-stack", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const rot = +(options.rot ?? 45), rise = +(options.rise ?? 130), big = +(options.scale ?? 1.1);
    const back = +(options.back ?? 2.6665), shrink = +(options.shrink ?? 0.0258), lerp = +(options.lerp ?? 0.1);
    if (reduce) return;
    const n = cards.length;
    const st = cards.map(() => ({ y: rise, r: rot, s: big, ty: rise, tr: rot, ts: big }));
    // Progress = Distance traveled after the board top touches the screen bottom ÷ board height (original visibleP)
    const seen = (t) => (t.scroll() - t.start) / el.offsetHeight;
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const update = (p) => {
      // Once the last card is fully in place it stops there (original done) — scrolling further doesn’t push the earlier cards more
      if ((p - (n - 1) / n) * n >= 1) return;
      cards.forEach((c, i) => {
        // Each card rises into place in the front half of its share (1/n), and in the back half is pushed slightly under the next card and shrinks
        const m = (p - i / n) * n, a = clamp(m / 0.5), w = Math.max(0, (m - 0.5) / 0.5), k = w <= 1 ? w * w * w : w;
        const s = st[i];
        if (m <= 0.5) { s.ty = rise - a * rise; s.tr = rot - a * rot; s.ts = big + a * (1 - big); }
        else if (i < n - 1) { s.ty = -back * k; s.tr = 0; s.ts = 1 - k * shrink; }
        else { s.ty = 0; s.tr = 0; s.ts = 1; }
      });
    };
    const trig = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top", onUpdate: (t) => update(seen(t)), onRefresh: (t) => update(seen(t)) });
    update(seen(trig));
    // The original approaches the target by 10% of the remaining distance each frame — even after scrolling stops the cards glide a bit further before settling
    const tick = () => cards.forEach((c, i) => {
      const s = st[i];
      s.y += (s.ty - s.y) * lerp; s.r += (s.tr - s.r) * lerp; s.s += (s.ts - s.s) * lerp;
      c.style.transform = `translate3d(0,${s.y}%,0) rotateZ(${s.r}deg) scale(${s.s})`;
    });
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); trig.kill(); cards.forEach((c) => { c.style.transform = ""; }); };
  });
})();
