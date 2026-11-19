// As the page scrolls down, the inner padding of the Hero photo panel grows from 0 to to, so the photo shrinks inside its border — tied linearly to scroll 0 to end (px), no curve.
// The original (Brand) batches scroll events into a single requestAnimationFrame to update --image-padding. Here the same spot uses --fx-inset
(() => {
  kfFx.register("scroll-inset", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const end = +options.end || 400;
    const parse = (v) => {
      const m = String(v).trim().match(/^(-?[\d.]+)([a-z%]*)$/);
      return m ? [+m[1], m[2] || "px"] : [40, "px"];
    };
    const wide = parse(options.to ?? "40px"), narrow = options["to-narrow"] != null ? parse(options["to-narrow"]) : null;
    const small = matchMedia("(max-width: 1023px)");
    const src = scroller || window;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = scroller ? scroller.scrollTop : scrollY;
      const p = Math.min(Math.max(y / end, 0), 1);
      const [n, u] = narrow && small.matches ? narrow : wide;
      el.style.setProperty("--fx-inset", `${n * p}${u}`);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    src.addEventListener("scroll", onScroll, { passive: true });
    small.addEventListener("change", update);
    update();
    return () => {
      src.removeEventListener("scroll", onScroll);
      small.removeEventListener("change", update);
      el.style.removeProperty("--fx-inset");
    };
  });
})();
