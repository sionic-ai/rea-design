// The black-and-white veil (backdrop grayscale) over the photo lifts with scroll and the color returns — the veil is made by the part and covers the top of the photo cell
(() => {
  kfFx.register("gray-veil-lift", (el, { options, reduce, scroller }) => {
    const veil = document.createElement("i");
    veil.className = "fx-gray-veil";
    veil.setAttribute("aria-hidden", "true");
    el.append(veil);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (reduce) { gsap.set(veil, { opacity: 0 }); return; }
      // With toggle, instead of scrub it plays for dur seconds when passing the start spot, and plays in reverse when scrolling back up (Brand original toggleActions)
      const toggle = options.toggle === "true";
      const tw = gsap.fromTo(veil, { opacity: 1 }, {
        opacity: 0, ease: kfFx.ease(options.ease || (toggle ? "power1.out" : "power2.out"), toggle ? "power1.out" : "power2.out"),
        ...(toggle ? { duration: +(options.dur ?? 1) } : {}),
        scrollTrigger: toggle
          ? { trigger: el, scroller, start: options.start || "50% bottom", toggleActions: options.once === "true" ? "play none none none" : "play reverse play reverse" }
          : { trigger: el, scroller, start: options.start || "top 35%", end: options.end || "top 5%", scrub: +(options.scrub ?? 0.8) },
      });
      return () => tw.scrollTrigger?.kill();
    });
    mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(veil, { opacity: 0 }));
    return () => { mm.revert(); veil.remove(); };
  });
})();
