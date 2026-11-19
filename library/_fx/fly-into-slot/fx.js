// While the plate (element) passes through the screen, the pieces to fly off (data-fx-part="flyer") steps aside (pushed sideways or up and tilted) and settles back into place, shrinking.
// Progress starts when the panel’s top edge is at start (default 10%) of the panel height and ends after rising a further span (default 60%) of the panel height, eased with inOutQuad (original Carousel).
(() => {
  const inOutQuad = (e) => (e < 0.5 ? 2 * e * e : -1 + (4 - 2 * e) * e);
  kfFx.register("fly-into-slot", (el, { options, reduce, scroller }) => {
    const flyer = el.querySelector('[data-fx-part="flyer"]');
    if (!flyer) return;
    const x0 = +(options.x ?? 17), y0 = +(options.y ?? -210), r0 = +(options.rotate ?? 7), s1 = +(options.scale ?? 0.61);
    const start = +(options.start ?? 0.1), span = +(options.span || 0.6);
    const place = (p) => { flyer.style.transform = `translate(${x0 - p * x0}%, ${y0 - p * y0}%) rotate(${r0 - p * r0}deg) scale(${1 - p * (1 - s1)})`; };
    if (reduce) { place(1); return () => { flyer.style.transform = ""; }; }
    const target = scroller || window;
    let on = false;
    const update = () => {
      const { top, height } = el.getBoundingClientRect();
      const t = top - (scroller ? scroller.getBoundingClientRect().top : 0);
      place(inOutQuad(Math.max(0, Math.min(1, (height * start - t) / (height * span)))));
    };
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      on = e.isIntersecting;
      if (on) {
        flyer.style.willChange = "transform";
        target.addEventListener("scroll", update, { passive: true });
        addEventListener("resize", update);
        update();
      } else {
        flyer.style.removeProperty("will-change");
        target.removeEventListener("scroll", update);
        removeEventListener("resize", update);
      }
    }));
    io.observe(el);
    update();
    return () => {
      io.disconnect();
      target.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      flyer.style.transform = "";
      flyer.style.removeProperty("will-change");
    };
  });
})();
