(() => {
  // While the next section rises, the full panel is cropped into a rounded window leaving only the bottom strip — inset(0 0 0 round 0) → inset(top side 0 round r), inner panel 1 → zoom
  kfFx.register("inset-strip-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const track = el.closest('[data-fx-part="track"]');
    const next = (options.next && document.querySelector(options.next)) || track?.nextElementSibling || el.nextElementSibling || el;
    const mm = gsap.matchMedia();
    mm.add({ narrow: "(max-width: 767px)", wide: "(min-width: 768px)" }, (ctx) => {
      const n = ctx.conditions.narrow;
      const top = n ? options["sp-top"] || "90%" : options.top || "77%";
      const side = n ? options["sp-side"] || "16%" : options.side || "31.25%";
      const round = options.round || "10px";
      const zoom = +(options.zoom ?? 1.5);
      gsap.fromTo(el, { "clip-path": "inset(0 0 0 round 0)", "--fx-scale": 1 }, {
        ease: "none",
        "clip-path": `inset(${top} ${side} 0 round ${round})`,
        "--fx-scale": zoom,
        scrollTrigger: {
          trigger: next,
          ...(scroller && { scroller }),
          start: n ? options["sp-start"] || "top+=300 bottom" : options.start || "top-=5% top",
          end: n ? options["sp-end"] || "top+=100 top" : options.end || "top-=50% top",
          scrub: +(options.scrub ?? 1),
          fastScrollEnd: false,
        },
      });
    });
    return () => { mm.revert(); el.style.removeProperty("clip-path"); el.style.removeProperty("--fx-scale"); };
  });
})();
