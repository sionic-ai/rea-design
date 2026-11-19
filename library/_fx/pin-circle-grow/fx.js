(() => {
  kfFx.register("pin-circle-grow", (el, { options, reduce, scroller }) => {
    const circle = el.querySelector(":scope > [data-fx-part=circle]");
    if (reduce || !circle) return;
    const lag = +(options.scrub ?? 0.5), scrub = lag > 0 ? lag : true;
    const end = options.end || "bottom center";
    // The original gives no curve, so the GSAP default (power1.out) also applies to scrub progress
    const ease = options.ease || "power1.out";
    const bp = +(options.bp || 751);
    const grow = (size, to, open, close) => () =>
      gsap.fromTo(circle, { width: size, height: size, "--fx-circle": open }, { width: to, height: to, "--fx-circle": close, ease, scrollTrigger: { scroller, trigger: el, start: "top top", end, scrub, pin: el } });
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add(`(max-width: ${bp}px) and (prefers-reduced-motion: no-preference)`, grow(options["sp-size"] || "66vw", options["sp-grow"] || "140vw", options["sp-from"] || "50%", options["sp-open"] || "120%"));
      mm.add(`(min-width: ${bp + 1}px) and (prefers-reduced-motion: no-preference)`, grow(options.size || "46.2vh", options.grow || "130vh", options.from || "50%", options.open || "100%"));
    }, el);
    return () => fxCtx.revert();
  });
})();
