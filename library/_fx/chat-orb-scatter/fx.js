(() => {
  // Pinned to the screen and tied to scroll: the circle grows 0→1, and each time a speech bubble turns on, the chat line lifts that bubble to the circle center.
  // When all are lit, the dialogue disappears and a photo pile appears spinning, then while the circle grows to cover the screen, the photos scatter to their spots and the final plate turns on.
  kfFx.register("chat-orb-scatter", (el, { options, scroller }) => {
    const orb = el.querySelector('[data-fx-part="orb"]');
    const feed = el.querySelector('[data-fx-part="feed"]');
    const bubbles = [...el.querySelectorAll('[data-fx-part="bubble"]')];
    if (!orb || !feed || !bubbles.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const sides = [...el.querySelectorAll('[data-fx-part="side"]')];
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const end = el.querySelector('[data-fx-part="end"]');
    const length = +(options.length ?? 12000), scrub = +(options.scrub ?? 1), cover = +(options.cover ?? 6);
    const show = +(options.show ?? 0.8), move = +(options.move ?? 1), pause = +(options.pause ?? 0.4);
    const spread = +(options.spread ?? 4), each = +(options.each ?? 0.08);
    const narrow = options.narrow || "(max-width: 1023px)";
    const coverEase = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    // Scatter position per photo — on narrow screens check data-sp-* first
    const spot = (p, k) => (matchMedia(narrow).matches && p.dataset["sp" + k] != null ? p.dataset["sp" + k] : p.dataset[k.toLowerCase()]) ?? 0;
    const centerOf = (b) => orb.offsetHeight / 2 - (b.offsetTop + b.offsetHeight / 2);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(orb, { xPercent: -50, yPercent: -50, scale: 0 });
      if (sides.length) gsap.set(sides, { opacity: 0 });
      if (photos.length) gsap.set(photos, { xPercent: -50, yPercent: -50, x: 0, y: 0, opacity: 0, scale: 0.8, rotation: 0 });
      if (end) gsap.set(end, { opacity: 0, pointerEvents: "none" });
      gsap.set(bubbles, { opacity: 0 });
      gsap.set(feed, { y: () => centerOf(bubbles[0]) });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: "+=" + length, pin: true, scrub, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to(orb, { scale: 1, duration: 2 });
      if (sides.length) tl.to(sides, { opacity: 1, duration: 1 }, "<1.5");
      bubbles.forEach((b, i) => {
        tl.to(b, { opacity: 1, duration: show, ease: "power2.out" });
        if (i > 0) tl.to(feed, { y: () => centerOf(b), duration: move, ease: "power2.inOut" }, "<");
        tl.to({}, { duration: pause });
      });
      tl.to([feed, ...sides], { opacity: 0, duration: 1 });
      if (photos.length) {
        tl.to(photos, { opacity: 1, scale: 1, duration: 2, ease: "power2.out" })
          .to(photos, { rotation: (i, p) => +(p.dataset.r ?? 0), duration: 1.5, stagger: 0.1, ease: "power2.out" }, "<");
      }
      tl.to(orb, { scale: cover, borderRadius: "0%", duration: 3, ease: coverEase }, ">");
      if (photos.length) tl.to(photos, { x: (i, p) => spot(p, "X"), y: (i, p) => spot(p, "Y"), duration: spread, stagger: each, ease: "expo.out", pointerEvents: "auto" }, "<0.5");
      if (end) tl.to(end, { opacity: 1, duration: 2, ease: "power3.out", pointerEvents: "auto" }, ">");
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(orb, { xPercent: -50, yPercent: -50 });
      if (end) gsap.set(end, { opacity: 1 });
    });
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); };
  });
})();
