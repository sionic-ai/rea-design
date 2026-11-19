// A large blurry glow blob follows the cursor by a lerp of the remaining distance per frame (original wandy .1). Cursor position is read from the whole window
// Put the blob center at the cursor position in screen coordinates — it follows wherever the cursor moves on screen, even with no cursor over the panel. Rests when the panel is off screen
(() => {
  let mx = innerWidth / 2, my = innerHeight / 2, listening = false;
  const track = (e) => { mx = e.clientX; my = e.clientY; };
  kfFx.register("cursor-glow-blob", (el, { options, reduce, hover }) => {
    const blob = el.querySelector('[data-fx-part="blob"]');
    if (!blob) return;
    if (options.size) el.style.setProperty("--fx-size", options.size);
    if (options.blur) el.style.setProperty("--fx-blur", options.blur);
    const place = (x, y) => { blob.style.transform = `translate(${x}px, ${y}px)`; };
    const lerp = +(options.lerp ?? 0.1);
    let x = mx - blob.offsetWidth / 2, y = my - blob.offsetHeight / 2;
    place(x, y);
    if (reduce || !hover) return () => { blob.style.transform = ""; el.style.removeProperty("--fx-size"); el.style.removeProperty("--fx-blur"); };
    if (!listening) { addEventListener("pointermove", track, { passive: true }); listening = true; }
    let on = true, last = 0;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(el);
    const tick = (time) => {
      if (!on) return;
      const now = time * 1000, dt = last ? Math.max(1, now - last) : 16.667;
      last = now;
      // The original uses .1 per frame — tuned to a 60fps basis so the speed is the same regardless of frame length
      const k = 1 - Math.pow(1 - lerp, dt / 16.667);
      x += (mx - blob.offsetWidth / 2 - x) * k;
      y += (my - blob.offsetHeight / 2 - y) * k;
      place(x, y);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); blob.style.transform = ""; el.style.removeProperty("--fx-size"); el.style.removeProperty("--fx-blur"); };
  });
})();
