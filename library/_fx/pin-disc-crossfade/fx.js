(() => {
  // Original timeline (in cell units): layer i→i+1 crosses at .5 + (i−1) cells for .5 cells, after the last crossing it rests hold cells, then the final layer turns on and the section and panel get tinted (.5 cells).
  // With three layers, they cross at .5 and 1.5 and end at 3 — the total 3.5 cells are spread out evenly while the sheet passes across the screen (top top → bottom bottom).
  kfFx.register("pin-disc-crossfade", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const disc = el.querySelector('[data-fx-part="disc"]');
    if (!disc) return;
    const layers = [...disc.querySelectorAll('[data-fx-part="layer"]')];
    const final = disc.querySelector('[data-fx-part="final"]');
    const all = [...layers, final].filter(Boolean);
    const clear = () => { gsap.set(all, { clearProps: "opacity" }); gsap.set(el, { clearProps: "--fx-k" }); };
    if (reduce) {
      gsap.set(layers, { opacity: 0 });
      if (final) gsap.set(final, { opacity: 1 }); else if (layers.length) gsap.set(layers[layers.length - 1], { opacity: 1 });
      gsap.set(el, { "--fx-k": 1 });
      return clear;
    }

    const dur = +(options.dur ?? 0.5), hold = +(options.hold ?? 1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const narrow = +(options.narrow ?? 767);
    gsap.set(layers.slice(1), { opacity: 0 });
    if (final) gsap.set(final, { opacity: 0 });

    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${narrow + 1}px)`, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: true, pin: disc, pinSpacing: false },
      });
      let at = 0.5;
      for (let i = 1; i < layers.length; i++) {
        tl.fromTo(layers[i - 1], { opacity: 1 }, { opacity: 0, duration: dur, ease }, at)
          .fromTo(layers[i], { opacity: 0 }, { opacity: 1, duration: dur, ease }, at);
        at += 1;
      }
      const end = Math.max(at - 1, 0) + dur + hold;
      tl.fromTo(el, { "--fx-k": 0 }, { "--fx-k": 1, duration: dur, ease }, end);
      if (final) {
        tl.fromTo(final, { opacity: 0 }, { opacity: 1, duration: dur, ease }, end);
        if (layers.length) tl.fromTo(layers[layers.length - 1], { opacity: 1 }, { opacity: 0, duration: dur, ease }, end);
      }
    });
    return () => { mm.revert(); clear(); };
  });
})();
