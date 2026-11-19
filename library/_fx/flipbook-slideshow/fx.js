// Flipbook: only one of the stacked cells is visible, and it switches straight to the next cell every ms (no transition). Click goes to the next, drag and release moves one cell in the drag direction — standard-brand (Lay carousel autoplay 200)
(() => {
  kfFx.register("flipbook-slideshow", (el, { options, reduce }) => {
    const slides = [...el.children].filter((c) => c.matches('[data-fx-part="slide"]'));
    if (slides.length < 2) return;
    const every = Math.max(16, +options.every || 200), delay = Math.max(0, +(options.delay ?? 0));
    let i = 0, timer = 0, visible = true, startAt = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.style.visibility = k === i ? "visible" : "hidden"; });
    };
    show(0);
    const stop = () => { clearTimeout(timer); timer = 0; };
    const run = () => {
      stop();
      if (reduce || !visible || document.hidden) return;
      timer = setTimeout(function tick() { show(i + 1); timer = setTimeout(tick, every); }, startAt ? every : delay || every);
      startAt = 1;
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); });
    io.observe(el);
    const onVis = () => run();
    document.addEventListener("visibilitychange", onVis);
    // tap: 0 — like a background slideshow, it advances only by itself and not by tap or drag (so pressing text or links above does not change the section)
    const tap = String(options.tap ?? "1") !== "0";
    let downX = null;
    const onDown = (e) => { if (tap) downX = e.clientX; };
    const onUp = (e) => {
      if (downX == null) return;
      const dx = e.clientX - downX;
      downX = null;
      if (Math.abs(dx) > 30) show(i + (dx < 0 ? 1 : -1));
      else show(i + 1);
      run();
    };
    const onCancel = () => { downX = null; };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    el.addEventListener("pointerleave", onCancel);
    return () => {
      stop(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      el.removeEventListener("pointerleave", onCancel);
      slides.forEach((s) => { s.style.visibility = ""; });
    };
  });
})();
