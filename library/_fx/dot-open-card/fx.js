// Spread the panel from a 10em point to its own css size — measure the end size when attaching, and re-measure when font or window size changes
(() => {
  kfFx.register("dot-open-card", (el, { options, reduce, scroller }) => {
    const clip = el.querySelector('[data-fx-part="clip"]');
    if (!clip) return;
    const media = el.querySelector('[data-fx-part="media"]');
    const label = el.querySelector('[data-fx-part="label"]');
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const dot = options.dot || "10em";
    const dur = +(options.dur ?? 0.8);
    const ease = kfFx.ease(options.ease || "", "power1.out");
    const shift = options.shift ?? "6.25em";
    let size = { w: clip.offsetWidth, h: clip.offsetHeight };
    let ctx;
    const build = () => {
      ctx?.revert();
      gsap.set(clip, { clearProps: "width,height" });
      size = { w: clip.offsetWidth, h: clip.offsetHeight };
      if (!size.w || !size.h) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: el, start: options.start || "top 80%" } });
        tl.fromTo(clip, { width: dot, height: dot }, { width: size.w, height: size.h, duration: dur, ease }, 0);
        if (media) tl.fromTo(media, { scale: 1.1 }, { scale: 1, duration: dur * 0.75 }, dur * 0.25);
        if (label) tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: dur * 0.375, ease: "sine.out" }, dur * 0.75);
        if (media && shift !== "0") {
          gsap.fromTo(media, { y: `-${shift}` }, { y: shift, ease: "none", immediateRender: false, scrollTrigger: { scroller, trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
        }
      }, el);
    };
    build();
    let last = size.w;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      if (Math.abs(w - last) < 2) return;
      last = w;
      build();
    });
    ro.observe(el);
    return () => { ro.disconnect(); ctx?.revert(); };
  });
})();
