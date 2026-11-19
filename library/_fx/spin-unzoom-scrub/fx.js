(() => {
  // A picture tilted and pulled in large is bound to scroll, straightens and recedes to 1x — no curve (ease none), it only trails behind via scrub
  kfFx.register("spin-unzoom-scrub", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const zoom = el.querySelector('[data-fx-part="zoom"]') || stage?.firstElementChild || el.firstElementChild;
    if (!zoom) return;
    const turn = el.querySelector('[data-fx-part="turn"]') || zoom;
    if (options.origin) turn.style.transformOrigin = options.origin;
    const undo = () => turn.style.removeProperty("transform-origin");
    if (reduce) return undo;
    const deg = +(options.turn ?? 299.12), scale = +(options.scale ?? 4.5), x = +(options.x ?? 66), y = +(options.y ?? 0.5);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom top", scrub: +(options.scrub ?? 0.3) },
      });
      tl.fromTo(zoom, { scale, xPercent: x, yPercent: y }, { scale: 1, xPercent: 0, yPercent: 0, ease: "none" }, 0);
      if (turn === zoom) tl.fromTo(zoom, { rotation: deg }, { rotation: 0, ease: "none" }, 0);
      else tl.fromTo(turn, { rotation: deg }, { rotation: 0, ease: "none" }, 0);
    });
    return () => { mm.revert(); undo(); };
  });
})();
