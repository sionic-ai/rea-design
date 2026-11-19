// Build one dash from the line length (user units) and walk it by scroll progress. Even if the panel grows the units stay the same, so there is no need to re-measure length,
// Only things whose document height changes late (fonts · photos · other parts’ pin-spacer) are reported to ScrollTrigger via ResizeObserver.
(() => {
  kfFx.register("scroll-path-draw", (el, { options, reduce, scroller }) => {
    const line = el.querySelector('[data-fx-part="line"]');
    if (!line || typeof line.getTotalLength !== "function") return;
    const glint = el.querySelector('[data-fx-part="glint"]');
    const L = line.getTotalLength();
    if (!L) return;
    const clear = () => { gsap.set([line, glint].filter(Boolean), { clearProps: "strokeDasharray,strokeDashoffset,opacity" }); };
    if (reduce) { line.style.strokeDasharray = "none"; return clear; }

    gsap.registerPlugin(ScrollTrigger);
    const page = (options.range || "page") === "page";
    const scrub = +(options.scrub ?? 1.5);
    const dur = +(options.dur ?? 3);
    const glen = Math.min(+(options.glint ?? 400), L);
    const gop = +(options.opacity ?? 0.7);
    const ease = kfFx.ease(options.ease || "0.89,0.42,0.54,1", "power3.in");
    const trigger = page ? (scroller ? scroller.firstElementChild || el : document.documentElement) : el;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(line, { strokeDasharray: L, strokeDashoffset: L });
      // A beam of light — 3s per loop: rests for the first 5% → flows to the end until 85% → hides, then relights in place at 91% (the original keyframe share)
      let glintTl = null, glintOn = false;
      if (glint) {
        gsap.set(glint, { strokeDasharray: `${glen} ${L}`, strokeDashoffset: glen, opacity: 0 });
        glintTl = gsap.timeline({ repeat: -1, paused: true })
          .set(glint, { opacity: gop, strokeDashoffset: glen })
          .to(glint, { strokeDashoffset: -L, duration: dur * 0.8, ease }, dur * 0.05)
          .set(glint, { opacity: 0 }, dur * 0.85)
          .set(glint, { strokeDashoffset: glen }, dur * 0.9)
          .set(glint, { opacity: gop }, dur * 0.91)
          .set({}, {}, dur);
      }
      const setGlint = (on) => {
        if (!glintTl || on === glintOn) return;
        glintOn = on;
        if (on) glintTl.delay(+(options.delay ?? 1)).restart(true);
        else { glintTl.pause(0); gsap.set(glint, { opacity: 0 }); }
      };
      const tween = gsap.to(line, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: {
          trigger, ...(scroller && { scroller }),
          start: page ? "top top" : options.start || "top bottom",
          end: page ? "bottom bottom" : options.end || "bottom top",
          scrub, invalidateOnRefresh: true,
          onUpdate: (st) => setGlint(st.progress < 0.01),
          onRefresh: (st) => setGlint(st.progress < 0.01),
        },
      });
      setGlint(tween.scrollTrigger.progress < 0.01);
      let t = 0;
      const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => tween.scrollTrigger?.refresh(), 120); });
      ro.observe(trigger);
      return () => { clearTimeout(t); ro.disconnect(); glintTl?.kill(); };
    });
    return () => { mm.revert(); clear(); };
  });
})();
