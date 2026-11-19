(() => {
  // Original common.js: ScrollTrigger start "top bottom-=25%" Add .on to it — CSS grows it from .1x and transparent over .4s cubic-bezier(.17,.9,.3,1.3) (overshoots, then settles), with opacity over .25s
  kfFx.register("tiny-pop-in", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scroller || undefined,
      start: options.start || "top bottom-=25%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
    return () => { st.kill(); el.classList.remove("is-in"); };
  });
})();
