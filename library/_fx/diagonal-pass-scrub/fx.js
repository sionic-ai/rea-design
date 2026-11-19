// Diagonal pass: the element passes from off-screen top right → off-screen bottom left tied to scroll (scrub .6, straight curve),
// While rewinding upward, flips left and right to run backward — original jsCar
(() => {
  kfFx.register("diagonal-pass-scrub", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduce) { gsap.set(el, { x: 0, y: 0, scaleX: 1 }); return () => gsap.set(el, { clearProps: "transform" }); }
    const narrow = matchMedia(`(max-width: ${+options.narrow || 480}px)`);
    const yf = () => (narrow.matches ? +(options["y-narrow"] ?? 0.35) : +(options.y ?? 0.55));
    const xf = +(options.x ?? 0.55);
    const span = () => {
      const w = el.offsetWidth || el.getBoundingClientRect().width || 0;
      const h = el.offsetHeight || el.getBoundingClientRect().height || 0;
      return { fromX: xf * innerWidth + w + 16, fromY: -innerHeight * yf() - h - 16, toX: -xf * innerWidth - w - 16, toY: innerHeight * yf() + h + 16 };
    };
    gsap.set(el, { force3D: true, transformOrigin: "50% 50%" });
    const flip = options.flip === "false" ? null : gsap.quickSetter(el, "scaleX");
    let a = span();
    const tw = gsap.fromTo(el, { x: () => a.fromX, y: () => a.fromY, scaleX: 1 }, {
      x: () => ((a = span()), a.toX), y: () => a.toY, ease: "none", overwrite: true,
      scrollTrigger: {
        scroller, trigger: el.parentElement || el, start: options.start || "top 150%", end: options.end || "+=200%",
        scrub: +(options.scrub ?? 0.6), invalidateOnRefresh: true,
        onUpdate: (s) => flip && flip(s.direction === -1 ? -1 : 1),
      },
    });
    const re = () => ScrollTrigger.refresh();
    narrow.addEventListener("change", re);
    return () => { narrow.removeEventListener("change", re); tw.scrollTrigger?.kill(); tw.kill(); gsap.set(el, { clearProps: "transform,willChange" }); };
  });
})();
