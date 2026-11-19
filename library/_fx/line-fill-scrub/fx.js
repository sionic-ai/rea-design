(() => {
  kfFx.register("line-fill-scrub", (el, { options, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const from = +(options.from ?? 0.15), to = +(options.to ?? 0.6), n = lines.length;
    // ease — a curve that fills within one line (default straight). The original uses GSAP’s default power1.out per line
    const ez = options.ease ? gsap.parseEase(options.ease) : (t) => t;
    // end — if given, uses the ScrollTrigger end as is instead of from·to (as in the original site "bottom top": from when the section touches the bottom of the screen until it exits the top)
    const end = options.end;
    const once = options.once === "1" || options.once === "true";
    const paint = (top) => {
      const p = end ? top : (top - from) / Math.max(0.001, to - from);
      lines.forEach((l, i) => { l.style.backgroundPosition = `${ez(Math.min(1, Math.max(0, (p - i / n) * n))) * -100}%`; });
    };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("fx-line-fill-on");
      // Progress = Ratio of the element’s top edge going from the bottom of the screen (0) to the top (1). If to exceeds 1, the end is extended until after it passes above
      const span = end ? 1 : Math.max(1, to);
      // once — when full, remove the trigger and leave it filled (it doesn’t drain when scrolling back up)
      let done = false;
      const upd = (s) => {
        if (done) return;
        paint(s.progress * span);
        if (once && s.progress >= 1) { done = true; paint(span); s.kill(); }
      };
      const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: "top bottom", end: end || `top ${(1 - span) * 100}%`, onUpdate: upd, onRefresh: upd });
      if (!done) upd(st);
      return () => { st.kill(); el.classList.remove("fx-line-fill-on"); lines.forEach((l) => { l.style.backgroundPosition = ""; }); };
    });
    return () => mm.revert();
  });
})();
