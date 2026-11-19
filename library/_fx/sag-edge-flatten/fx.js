// Flatten the sagging top edge: clip the element’s clip-path as a ”quadratic curve whose center sags by height × depth%”, and
// While the element top travels from the screen bottom → the screen top, the sag is reduced to 0 (straight curve, scrub). Narrow screens use depth-narrow % — Brand jsArch
(() => {
  kfFx.register("sag-edge-flatten", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const clamp = (v) => Math.max(0, Math.min(80, v));
    const wide = clamp(+(options.depth ?? 3));
    const thin = clamp(+(options["depth-narrow"] ?? 1));
    const narrow = matchMedia(`(max-width: ${+options.narrow || 400}px)`);
    const pct = () => (narrow.matches ? thin : wide);
    const state = { q: 0 };
    const draw = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      el.style.clipPath = `path('M 0 0 Q ${w / 2} ${h * (pct() / 100) * (1 - state.q)} ${w} 0 L ${w} ${h} 0 ${h} Z')`;
    };
    if (reduce) return () => { el.style.clipPath = ""; };
    draw();
    const scrub = options.scrub == null || options.scrub === "" || options.scrub === "true" ? true : +options.scrub;
    const tw = gsap.to(state, {
      q: 1, ease: "none", onUpdate: draw,
      scrollTrigger: { scroller, trigger: el, start: options.start || "top bottom", end: options.end || "top top", scrub },
    });
    // If height changes late from fonts, photos or other parts, re-measure the sag to match progress
    const fit = () => draw();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    narrow.addEventListener("change", fit);
    ScrollTrigger.addEventListener("refresh", fit);
    return () => {
      ro.disconnect();
      narrow.removeEventListener("change", fit);
      ScrollTrigger.removeEventListener("refresh", fit);
      tw.scrollTrigger?.kill();
      tw.kill();
      el.style.clipPath = "";
    };
  });
})();
