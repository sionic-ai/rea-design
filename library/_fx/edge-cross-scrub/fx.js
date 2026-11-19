// The picture at the section bottom is tied to scroll and crawls from the left end to the right end — with left p% · translateX(−p%) it stays inside the panel at both ends
(() => {
  kfFx.register("edge-cross-scrub", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const track = (options.track && el.closest(options.track)) || el.parentElement;
    if (!track) return;
    const back = options.dir === "left";
    const from = back ? { left: "100%", xPercent: -100 } : { left: "0%", xPercent: 0 };
    const to = back ? { left: "0%", xPercent: 0 } : { left: "100%", xPercent: -100 };
    if (reduce) { gsap.set(el, from); return () => gsap.set(el, { clearProps: "left,transform" }); }
    const tw = gsap.fromTo(el, from, {
      ...to, ease: "none",
      scrollTrigger: { trigger: track, ...(scroller && { scroller }), start: options.start || "top bottom", end: options.end || "bottom top", scrub: true, invalidateOnRefresh: true },
    });
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(el, { clearProps: "left,transform" }); };
  });
})();
