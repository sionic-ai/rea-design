(() => {
  // Horizontally pushable photo strip — the progress bar is pre-filled by start (px) from the beginning and the remaining length grows by the horizontal scroll ratio. Arrows push smoothly by step (px)
  kfFx.register("strip-progress-bar", (el, { options, reduce }) => {
    const strip = el.querySelector('[data-fx-part="strip"]');
    if (!strip) return;
    const bar = el.querySelector('[data-fx-part="bar"]');
    const track = bar?.parentElement;
    const start = +(options.start ?? 150), step = +(options.step ?? 290);
    const paint = () => {
      if (!bar || !track) return;
      const max = strip.scrollWidth - strip.clientWidth;
      const full = track.offsetWidth;
      const from = Math.min(start, full);
      const ratio = max > 0 ? strip.scrollLeft / max : 0;
      bar.style.width = `${from + (full - from) * ratio}px`;
    };
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const slide = (dir) => strip.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
    const onPrev = () => slide(-1), onNext = () => slide(1);
    strip.addEventListener("scroll", paint, { passive: true });
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    // Even when photos·fonts load late and the strip length changes, watch the strip·inner·bar background so the bar follows.
    const ro = new ResizeObserver(paint);
    [strip, strip.firstElementChild, track].forEach((n) => n && ro.observe(n));
    paint();
    return () => {
      ro.disconnect();
      strip.removeEventListener("scroll", paint);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      if (bar) bar.style.width = "";
    };
  });
})();
