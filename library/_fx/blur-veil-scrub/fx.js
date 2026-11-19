// Tied to scroll: it fades out with blur (out) or sharpens from blur as it appears (in). in-out sharpens on entering and blurs again when passing.
// autoAlpha also turns off visibility, so fully faded text and buttons cannot be clicked. Curve is GSAP default power1.out (the original gave no curve)
(() => {
  kfFx.register("blur-veil-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mode = options.mode || "out";
    // trigger — the element to measure against (selector). Used when the hero copy · scroll line fade out together based on the central block
    const trigger = (options.trigger && document.querySelector(options.trigger)) || el;
    const ease = options.ease || "power1.out";
    const scrub = options.scrub == null || options.scrub === "true" ? true : +options.scrub;
    const blur = +(options.blur ?? (mode === "out" ? 5 : 10));
    const outBlur = +(options["out-blur"] ?? 5);
    const st = (start, end) => ({ trigger, ...(scroller && { scroller }), start, end, scrub });
    const tws = [];
    if (mode === "in" || mode === "in-out") {
      tws.push(gsap.fromTo(el, { autoAlpha: 0, filter: `blur(${blur}px)` }, { autoAlpha: 1, filter: "blur(0px)", ease,
        scrollTrigger: st(options["in-start"] || options.start || "top bottom", options["in-end"] || options.end || "top 20%") }));
    }
    if (mode === "out" || mode === "in-out") {
      const b = mode === "out" ? blur : outBlur;
      tws.push(gsap.fromTo(el, { autoAlpha: 1, filter: "blur(0px)" }, { autoAlpha: 0, filter: `blur(${b}px)`, ease, immediateRender: mode === "out",
        scrollTrigger: st(options["out-start"] || options.start || "top top", options["out-end"] || options.end || "bottom top") }));
    }
    return () => { tws.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); gsap.set(el, { clearProps: "opacity,visibility,filter" }); };
  });
})();
