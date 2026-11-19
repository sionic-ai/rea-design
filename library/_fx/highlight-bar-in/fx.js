(() => {
  kfFx.register("highlight-bar-in", (el, { options, reduce, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length) return;
    if (reduce) { gsap.set(lines, { "--fx-bar": "101%", opacity: 1 }); return () => gsap.set(lines, { clearProps: "--fx-bar,opacity" }); }
    gsap.registerPlugin(ScrollTrigger);
    // Per line separately — when it hits 90% of the screen, the band fills to 101% (slightly past the end of the text) and the line turns on
    const dur = +(options.dur ?? 1.5), ease = kfFx.ease(options.ease || "power3.out", "power3.out"), delay = +(options.delay ?? 0);
    const tweens = lines.map((line) => gsap.fromTo(line, { "--fx-bar": "0%", opacity: 0 }, {
      "--fx-bar": "101%", opacity: 1, duration: dur, delay, ease,
      scrollTrigger: { trigger: line, scroller: scroller || window, start: options.start || "top 90%" },
    }));
    return () => { tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); gsap.set(lines, { clearProps: "--fx-bar,opacity" }); };
  });
})();
