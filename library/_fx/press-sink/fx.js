// Decided only by the distance n by which the next panel’s top passes below the bottom of the screen (without ScrollTrigger) — the original also writes directly once per rAF on each scroll.
(() => {
  kfFx.register("press-sink", (el, { options, reduce, scroller }) => {
    const content = el.querySelector(":scope > [data-fx-part=content]");
    const next = el.nextElementSibling;
    if (!content || !next || reduce) return;
    const drop = +(options.drop ?? 150), min = +(options.min ?? 0.9), shade = +(options.shade ?? 0.5), offset = +(options.offset ?? 0.2), stop = +(options.stop ?? 1.4);
    const src = scroller || window;
    const viewH = () => (scroller ? scroller.clientHeight : innerHeight);
    const nextTop = () => next.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = viewH(), n = Math.max(0, vh - nextTop()), r = n / vh;
      if (n / Math.max(1, next.offsetHeight) > stop) return;
      if (n > 0) {
        content.style.transform = `translate3d(0, ${drop * r}px, 0) scale(${Math.max(min, 1 - (1 - min) * r)})`;
        el.style.setProperty("--fx-sink-shade", String(Math.max(0, r * shade - offset)));
      } else {
        content.style.transform = "";
        el.style.setProperty("--fx-sink-shade", "0");
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    const ro = new ResizeObserver(onScroll);
    ro.observe(next);
    update();
    return () => {
      cancelAnimationFrame(raf);
      src.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      ro.disconnect();
      content.style.transform = "";
      el.style.removeProperty("--fx-sink-shade");
    };
  });
})();
