(() => {
  kfFx.register("scrub-highlight", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const parts = [...el.children], mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("fx-scrub");
      const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", end: options.end || "bottom 40%", scrub: true, onUpdate: (s) => parts.forEach((p, i) => p.classList.toggle("on", i / parts.length < s.progress)) });
      return () => { st.kill(); el.classList.remove("fx-scrub"); parts.forEach((p) => p.classList.remove("on")); };
    });
    return () => mm.revert();
  });
})();
