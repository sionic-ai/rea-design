// Two-word title stands at both ends with a thick line joining them — when visible the line spreads from the center to both sides and the words rise from below
(() => {
  kfFx.register("line-bridge-title", (el, { options, reduce, scroller }) => {
    const line = el.querySelector('[data-fx-part="line"]');
    const words = el.querySelectorAll('[data-fx-part="word"]');
    if (reduce || (!line && !words.length) || !window.gsap || !window.ScrollTrigger) return;
    const ease = kfFx.ease(options.ease || "0.4,0,0,1", "expo.out");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, scroller, start: options.start || "top 85%", toggleActions: options.once === "true" ? "play none none none" : "play none none reverse" },
    });
    if (line) tl.from(line, { scaleX: 0, duration: +(options.dur ?? 1.5), ease }, 0);
    if (words.length) tl.from(words, { yPercent: 100, opacity: 0, duration: +(options.words ?? 1), ease, stagger: +(options.stagger ?? 0.1) }, +(options.delay ?? 0.1));
    return () => { tl.scrollTrigger?.kill(); tl.revert(); };
  });
})();
