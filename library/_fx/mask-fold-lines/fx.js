(() => {
  // Each vertical-writing title line is covered with a background-color mask, and when the section top touches the 20% line from the top of the screen the mask folds on its bottom edge in .75s power4.out,
  // Lines reveal one after another from the top every .5s (once only). The cover is made by the part, one per line.
  kfFx.register("mask-fold-lines", (el, { options, reduce, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length || !window.gsap) return;
    const masks = lines.map((ln) => {
      const m = document.createElement("span");
      m.dataset.fxPart = "mask";
      m.setAttribute("aria-hidden", "true");
      ln.append(m);
      return m;
    });
    const off = () => masks.forEach((m) => m.remove());
    if (reduce || !window.ScrollTrigger) { gsap.set(masks, { scaleY: 0 }); return off; }
    gsap.registerPlugin(ScrollTrigger);
    const dur = +(options.dur ?? 0.75), each = +(options.each ?? 0.5), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    const tw = gsap.to(masks, {
      scaleY: 0, duration: dur, ease, stagger: each, delay,
      scrollTrigger: { trigger: el, start: options.start || "top 20%", scroller },
    });
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); off(); };
  });
})();
