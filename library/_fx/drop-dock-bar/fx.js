// When the watching row (watch), like a header filter, leaves the top of the screen, a bar holding the same buttons descends from the top and sticks — original Brand news list.
// The band comes down from above its own height (−100%) at .5 opacity over .4s cubic-bezier(.24,1,.35,.98), and the inner line (inner) unfolds with it from −10% at .99×.
// When the watched line is visible again it climbs back up, and once the transform ends the band is removed (display: none)
(() => {
  kfFx.register("drop-dock-bar", (el, { options, reduce, scroller }) => {
    const bar = el.querySelector('[data-fx-part="bar"]');
    if (!bar) return;
    const watch = el.querySelector('[data-fx-part="watch"]') || el;
    const dur = reduce ? 0 : +(options.dur ?? 0.4);
    const offset = +(options.offset ?? 0);
    bar.style.setProperty("--fx-dur", `${dur}s`);
    if (options.scale != null) bar.style.setProperty("--fx-scale", options.scale);
    let docked = false, raf = 0;
    bar.dataset.state = "off";
    const open = () => {
      cancelAnimationFrame(raf);
      if (bar.dataset.state === "off") {
        bar.dataset.state = "closing";
        bar.getBoundingClientRect();
      }
      raf = requestAnimationFrame(() => { bar.dataset.state = "open"; });
      el.classList.add("is-docked");
    };
    const close = () => {
      cancelAnimationFrame(raf);
      el.classList.remove("is-docked");
      if (bar.dataset.state === "off") return;
      bar.dataset.state = dur ? "closing" : "off";
    };
    const end = (e) => { if (e.target === bar && e.propertyName === "transform" && bar.dataset.state === "closing") bar.dataset.state = "off"; };
    bar.addEventListener("transitionend", end);
    const io = new IntersectionObserver(([en]) => {
      const top = en.rootBounds ? en.rootBounds.top : 0;
      const v = !en.isIntersecting && en.boundingClientRect.bottom <= top + 1;
      if (v === docked) return;
      docked = v;
      v ? open() : close();
    }, { root: scroller || null, rootMargin: `${-offset}px 0px 0px 0px` });
    io.observe(watch);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      bar.removeEventListener("transitionend", end);
      delete bar.dataset.state;
      bar.style.removeProperty("--fx-dur");
      bar.style.removeProperty("--fx-scale");
      el.classList.remove("is-docked");
    };
  });
})();
