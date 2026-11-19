(() => {
  kfFx.register("blind-boundary", (el, { options, reduce, scroller }) => {
    const n = Math.round(+options.rows) || 4;
    let bands = [...el.querySelectorAll('[data-fx-part="band"]')];
    const made = [];
    // If there are no strips, create as many as rows — removed in teardown after all are made
    if (!bands.length) {
      for (let i = 0; i < n; i++) {
        const b = document.createElement("i");
        b.setAttribute("data-fx-part", "band");
        el.append(b);
        made.push(b);
      }
      bands = made;
    }
    const grow = options.mode === "grow";
    const state = (p) => el.setAttribute("data-state", p >= 0.5 ? "revealed" : "covered");
    const done = () => { made.forEach((b) => b.remove()); el.removeAttribute("data-state"); };
    if (reduce) {
      gsap.set(bands, { scaleY: grow ? 1 : 0 });
      state(1);
      return () => { gsap.set(bands, { clearProps: "transform" }); done(); };
    }
    state(0);
    const mm = gsap.matchMedia();
    const make = (start, end) => {
      let tw = null;
      tw = gsap.fromTo(bands, { scaleY: grow ? 0 : 1 }, {
        scaleY: grow ? 1 : 0, ease: "none", stagger: { each: +(options.each ?? 0.08), from: "end" },
        onUpdate: () => tw && state(tw.progress()),
        scrollTrigger: { trigger: el, scroller, start, end, scrub: +(options.scrub ?? 1), invalidateOnRefresh: true, onRefresh: (s) => state(s.progress) },
      });
    };
    const bp = +(options.bp || 768);
    mm.add(`(min-width: ${bp}px)`, () => make(options.start || "top 70%", options.end || "bottom 80%"));
    mm.add(`(max-width: ${bp - 0.02}px)`, () => make(options["m-start"] || "top bottom", options["m-end"] || "bottom 75%"));
    return () => { mm.revert(); gsap.set(bands, { clearProps: "transform" }); done(); };
  });
})();
