(() => {
  // Original values (Brand): lines are drawn one by one at 200px per second, and once all are drawn they hold for 2.2s, then cross-fade over 1.8s power2.out into the next sheet (endlessly)
  kfFx.register("draw-cross-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll(':scope > [data-fx-part="slide"]')];
    if (!slides.length) return;
    const speed = +options.speed || 200;
    const hold = +(options.hold ?? 2.2);
    const fade = +(options.fade ?? 1.8);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const lines = (s) => [...s.querySelectorAll('[data-fx-part="line"]')].filter((p) => p.getTotalLength);
    // Each time the section returns, the line is erased and drawn again from the start
    const prep = (s) => lines(s).map((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      return [p, len];
    });
    if (reduce) {
      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[0], { autoAlpha: 1 });
      return () => gsap.set(slides, { clearProps: "opacity,visibility" });
    }
    let tl = null;
    const start = () => {
      if (tl) return;
      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[0], { autoAlpha: 1 });
      slides.forEach(prep);
      tl = gsap.timeline({ repeat: -1 });
      slides.forEach((s, i) => {
        const next = slides[(i + 1) % slides.length];
        tl.add(() => { gsap.set(s, { autoAlpha: 1 }); prep(s); if (next !== s) prep(next); });
        const ls = lines(s);
        if (ls.length) ls.forEach((p) => tl.to(p, { strokeDashoffset: 0, duration: p.getTotalLength() / speed, ease: "none" }));
        else tl.to({}, { duration: fade });
        tl.to({}, { duration: hold });
        if (next === s) return;
        tl.to(s, { autoAlpha: 0, duration: fade, ease });
        tl.to(next, { autoAlpha: 1, duration: fade, ease }, "<");
      });
    };
    // on: manual — starts when the consumer sends fx:play, like after the loader ends (Brand starts after the first-visit intro lifts)
    el.addEventListener("fx:play", start);
    if (options.on !== "manual") start();
    return () => {
      el.removeEventListener("fx:play", start);
      tl?.kill();
      gsap.set(slides, { clearProps: "opacity,visibility" });
      slides.forEach((s) => lines(s).forEach((p) => gsap.set(p, { clearProps: "strokeDasharray,strokeDashoffset" })));
    };
  });
})();
