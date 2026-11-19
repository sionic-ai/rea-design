(() => {
  // Photo cell (photo) is stuck to the screen by css sticky, and when the panel’s top edge touches the screen center the inner photo (media) slides sideways by shift.
  // Lays the photo wider than its cell by shift and turns --fx-move from 1 to -1 — use vw so nothing needs re-measuring when the window width changes
  kfFx.register("pin-photo-shift", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media) return;
    const panel = el.querySelector('[data-fx-part="panel"]') || el;
    const shift = +(options.shift ?? 40), side = options.side === "right" ? -1 : 1;
    el.style.setProperty("--fx-shift", `${shift}vw`);
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    // On phones (767px or below) the original does not attach photos and stacks them on the board instead, so no motion is applied below that width.
    mm.add(`(min-width: ${+(options.min ?? 768)}px)`, () => {
      gsap.set(media, { "--fx-move": side });
      gsap.to(media, {
        "--fx-move": -side,
        duration: reduce ? 0 : +(options.dur ?? 1),
        ease: kfFx.ease(options.ease || "power1.inOut", "power1.inOut"),
        scrollTrigger: { trigger: panel, ...(scroller && { scroller }), start: options.start || "top center", toggleActions: "play none none reverse" },
      });
      return () => gsap.set(media, { clearProps: "--fx-move" });
    });
    return () => { mm.revert(); el.style.removeProperty("--fx-shift"); };
  });
})();
