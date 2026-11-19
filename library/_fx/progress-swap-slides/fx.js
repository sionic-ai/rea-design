(() => {
  kfFx.register("progress-swap-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length <= 1) return;
    const hold = +(options.hold ?? 2), dur = +(options.dur ?? 0.8), shift = +(options.shift ?? 30), overlap = +(options.overlap ?? 60);
    const barBox = el.querySelector('[data-fx-part="bars"]');
    const bars = barBox ? slides.map(() => barBox.appendChild(document.createElement("i"))) : [];
    if (reduce) {
      gsap.set(slides, { opacity: 0 });
      gsap.set(slides[0], { opacity: 1 });
      return () => { bars.forEach((b) => b.remove()); gsap.set(slides, { clearProps: "opacity,transform" }); };
    }
    gsap.set(slides, { opacity: 0 });
    const tl = gsap.timeline({ defaults: { ease: "power2.out" }, repeat: -1, paused: true });
    slides.forEach((s, i) => {
      if (bars[i]) tl.fromTo(bars[i], { "--fx-progress": "0%" }, { "--fx-progress": "100%", duration: hold, ease: "none" });
      else tl.to({}, { duration: hold });
      tl.fromTo(s, { xPercent: 0, opacity: 1 }, { xPercent: -shift, opacity: 0, duration: dur });
      tl.fromTo(slides[(i + 1) % slides.length], { xPercent: shift, opacity: 0 }, { xPercent: 0, opacity: 1, duration: dur }, `<${overlap}%`);
    });
    // As in the original, it waits stopped at a spot pre-rotated one full turn (how the first panel stands)
    tl.seek((hold + dur * (1 + overlap / 100)) * slides.length).pause(0);
    gsap.set(slides[0], { opacity: 1 });
    const st = ScrollTrigger.create({ trigger: el, start: options.start || "top center", once: true, onEnter: () => tl.restart() });
    return () => { st.kill(); tl.kill(); bars.forEach((b) => b.remove()); gsap.set(slides, { clearProps: "opacity,transform" }); };
  });
})();
