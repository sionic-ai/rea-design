(() => {
  kfFx.register("scroll-blur-veil", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const max = +(options.max ?? 8), span = +(options.span ?? 1), fade = +(options.fade ?? 0);
    const tint = el.querySelector('[data-fx-part="tint"]'), during = el.querySelector('[data-fx-part="during"]');
    const set = (p) => {
      const v = `blur(${(p * max).toFixed(2)}px)`;
      el.style.backdropFilter = v; el.style.webkitBackdropFilter = v;
      if (fade) el.style.opacity = (p * fade).toFixed(3);
      if (tint) tint.style.opacity = p.toFixed(3);
      if (during) during.classList.toggle("is-on", p > 0 && p < 1);
    };
    // trigger — when the curtain stays attached to the screen and the fade range is set by another section (text panel) (Brand concept: from when the first text line rises 100px above the screen bottom → until the text panel’s bottom edge touches the screen bottom)
    const pick = (sel) => (sel ? document.querySelector(sel) : null);
    const trig = pick(options.trigger);
    // until: parent — fully fades when the bottom edge of the section holding the curtain (parent) touches the top of the screen (recruit page Hero → lead text)
    const range = trig
      ? { trigger: trig, start: options.start || "top bottom", endTrigger: pick(options["end-trigger"]) || trig, end: options.end || "bottom bottom" }
      : options.until === "parent" && el.parentElement
      ? { endTrigger: el.parentElement, end: "bottom top" }
      : { end: () => (scroller ? scroller.clientHeight : innerHeight) * span };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        scroller: scroller || window,
        start: 0,
        ...range,
        invalidateOnRefresh: true,
        onUpdate: (s) => set(s.progress),
        onRefresh: (s) => set(s.progress),
      });
      return () => st.kill();
    });
    return () => {
      mm.revert(); el.style.backdropFilter = ""; el.style.webkitBackdropFilter = ""; el.style.opacity = "";
      if (tint) tint.style.opacity = "";
      if (during) during.classList.remove("is-on");
    };
  });
})();
