// Appearing while stepping back from the front: the picture inside the perspective panel floats transparent at the screen’s front (z 400px), and when the panel enters the screen
// Steps back to its place (z 0) and sharpens over 1s cubic-bezier(.36,.01,.29,.99). Once it passes above the plate it comes forward again — on-the-trip guide photo
(() => {
  kfFx.register("z-recede-in", (el, { options, reduce, scroller }) => {
    const target = el.querySelector('[data-fx-part="image"]') || el.firstElementChild;
    if (!target) return;
    const z = +(options.z ?? 400), dur = +(options.dur ?? 1), back = options.back !== "off";
    const persp = +options.perspective || 1000;
    el.style.perspective = persp + "px";
    target.style.transition = `transform ${dur}s cubic-bezier(0.36, 0.01, 0.29, 0.99), opacity ${dur}s cubic-bezier(0.36, 0.01, 0.29, 0.99)`;
    const show = (on) => {
      target.style.transform = on ? "translate3d(0,0,0)" : `translate3d(0,0,${z}px)`;
      target.style.opacity = on ? "1" : "0";
    };
    if (reduce) { show(true); target.style.transition = "none"; return () => { target.style.transform = target.style.opacity = target.style.transition = ""; el.style.perspective = ""; }; }
    show(false);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) show(true);
      else if (back && e.boundingClientRect.top > 0) show(false);
    }, { root: scroller || null, threshold: +(options.amount ?? 0.2) });
    io.observe(el);
    return () => { io.disconnect(); target.style.transform = target.style.opacity = target.style.transition = ""; el.style.perspective = ""; };
  });
})();
