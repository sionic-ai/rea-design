(() => {
  // Original (Brand recruit site timeline .js-progress-line): line height = Screen bottom − line top − 20% of screen, stops 5px before the last dot’s top edge.
  // A dot turns on (is-active) when the screen bottom passes dot top + 30% of the screen. Tied straight to scroll, no curve
  kfFx.register("scroll-grow-line", (el, { options, reduce, scroller }) => {
    const bar = el.querySelector('[data-fx-part="bar"]');
    if (!bar) return;
    const lead = +(options.lead ?? 0.2), on = +(options.on ?? 0.3), stop = +(options.stop ?? 5);
    const host = scroller || window;
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    const update = () => {
      const vh = view(), dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
      const top = bar.getBoundingClientRect().top, bottom = scroller ? scroller.getBoundingClientRect().bottom : vh;
      const last = dots[dots.length - 1];
      const max = last ? Math.max(0, last.getBoundingClientRect().top - top - stop) : el.offsetHeight;
      bar.style.height = (reduce ? max : Math.max(0, Math.min(bottom - top - lead * vh, max))) + "px";
      dots.forEach((d) => d.classList.toggle("is-active", reduce || bottom > d.getBoundingClientRect().top + on * vh));
    };
    let raf = 0;
    const ask = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    host.addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    const ro = new ResizeObserver(ask);
    ro.observe(el);
    update();
    return () => { cancelAnimationFrame(raf); host.removeEventListener("scroll", ask); removeEventListener("resize", ask); ro.disconnect(); bar.style.height = ""; el.querySelectorAll('[data-fx-part="dot"]').forEach((d) => d.classList.remove("is-active")); };
  });
})();
