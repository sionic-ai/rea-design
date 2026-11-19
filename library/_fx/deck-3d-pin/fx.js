// Like the original, the timeline is paused and driven by ScrollTrigger progress (scrub .3) — falling·vanishing·pulling each take 1 step per section
(() => {
  kfFx.register("deck-3d-pin", (el, { options, reduce, hover, scroller }) => {
    if (reduce) return;
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (cards.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const deck = el.querySelector('[data-fx-part="deck"]') || el, badge = el.querySelector('[data-fx-part="badge"]');
    const depth = +(options.depth ?? 120), offset = +(options.offset ?? 40), per = +(options.per || 1.2);
    const tiltX = +(options.tiltX ?? 6), tiltY = +(options.tiltY ?? 10), spin = +(options.spin ?? 180);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      cards.forEach((c, i) => gsap.set(c, { z: -i * depth, y: -i * offset, zIndex: cards.length - i, autoAlpha: 1, transformOrigin: "center center" }));
      const tl = gsap.timeline({ paused: true });
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        tl.to(c, { y: "+=" + innerHeight * 0.9, ease: "power2.in", duration: 1 }, i)
          .to(c, { autoAlpha: 0, ease: "none", duration: 0.25 }, i + 0.7);
        cards.slice(i + 1).forEach((n, j) => tl.to(n, { z: -j * depth, y: -j * offset, ease: "none", duration: 1 }, i));
      });
      if (badge) tl.fromTo(badge, { rotation: 0 }, { rotation: spin, ease: "none", duration: cards.length - 1 }, 0);
      tl.totalDuration(cards.length - 1);
      ScrollTrigger.create({
        trigger: el, scroller, start: "top top", end: () => `+=${innerHeight * per * (cards.length - 1)}`,
        pin: el, pinSpacing: true, scrub: 0.3, invalidateOnRefresh: true, onUpdate: (st) => tl.progress(st.progress),
      });
      if (!hover) return;
      const rx = gsap.quickTo(deck, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(deck, "rotationY", { duration: 0.6, ease: "power3" });
      const move = (e) => { const r = el.getBoundingClientRect(); rx(-((e.clientY - r.top) / r.height - 0.5) * tiltX); ry(((e.clientX - r.left) / r.width - 0.5) * tiltY); };
      const out = () => (rx(0), ry(0));
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", out);
      return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", out); };
    });
    return () => mm.revert();
  });
})();
