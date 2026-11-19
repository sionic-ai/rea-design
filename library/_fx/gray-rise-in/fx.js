(() => {
  // Once the top edge of the group rises above the ratio line (default .6) from the top of the screen, it plays once — each cell rises from grayscale and blur into color, staggered .1s apart.
  kfFx.register("gray-rise-in", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const each = +(options.each ?? 0.1);
    items.forEach((it, i) => it.style.setProperty("--fx-d", (i * each).toFixed(3) + "s"));
    if (options.y != null) el.style.setProperty("--fx-y", +options.y + "px");
    const clean = () => { items.forEach((it) => it.style.removeProperty("--fx-d")); el.style.removeProperty("--fx-y"); el.classList.remove("is-in"); };
    if (reduce) { el.classList.add("is-in"); return clean; }
    const ratio = +(options.ratio ?? 0.6);
    const box = scroller || window;
    const check = () => {
      const r = el.getBoundingClientRect(), top = scroller ? scroller.getBoundingClientRect().top : 0, vh = scroller ? scroller.clientHeight : innerHeight;
      if (r.top - top < vh * ratio && r.bottom - top > 0) { el.classList.add("is-in"); off(); }
    };
    const off = () => { box.removeEventListener("scroll", check); removeEventListener("resize", check); };
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    requestAnimationFrame(check);
    return () => { off(); clean(); };
  });
})();
