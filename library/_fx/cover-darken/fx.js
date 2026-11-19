// Cover darkening: during the one screen while the pinned hero is covered, brightness goes 1 → 1 − amount — standard-brand (Lay cover darken, 80%)
(() => {
  kfFx.register("cover-darken", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const amount = Math.min(1, Math.max(0, +(options.amount ?? 0.8)));
    const distance = +options.distance || 1;
    const src = scroller || window;
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    const span = () => (scroller ? scroller.clientHeight : window.innerHeight) * distance;
    let raf = 0;
    const draw = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, read() / Math.max(1, span())));
      el.style.filter = `brightness(${1 - amount * p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      src.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      el.style.filter = "";
    };
  });
})();
