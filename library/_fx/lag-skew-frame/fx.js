(() => {
  // Instead of attaching a scroll event to each text panel, positions are set in a single ticker — the speed (bend) must use the same value on every panel so they bend together
  const frames = new Set();
  let lastY = 0, lastT = 0, vel = 0, on = false;
  const tick = () => {
    const now = performance.now(), y = scrollY, dt = Math.max(1, now - lastT);
    vel = ((y - lastY) / dt) * 1000; lastY = y; lastT = now;
    const vh = innerHeight;
    frames.forEach((f) => {
      const o = Math.round((100 * (f.p - y)) / f.lag) / 100;
      f.y(o);
      f.sk(Math.round(100 * Math.max(-f.max, Math.min(f.max, (vel / 1000) * f.gain))) / 100);
      const hid = o + f.h <= -4 || o >= vh + 4;
      if (hid !== f.hid) { f.hid = hid; f.frame.style.visibility = hid ? "hidden" : ""; }
    });
  };
  kfFx.register("lag-skew-frame", (el, { options, reduce }) => {
    const frame = el.querySelector(':scope > [data-fx-part="frame"]') || el.firstElementChild;
    if (!frame || reduce || matchMedia("(max-width: 768px)").matches) return;
    const f = {
      frame, lag: +options.lag || 3, max: +(options.skew ?? 4), gain: +(options.gain ?? 1.2), p: 0, h: 0, hid: null,
      y: gsap.quickSetter(frame, "y", "px"), sk: gsap.quickSetter(frame, "skewY", "deg"),
    };
    const measure = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      f.p = r.top + scrollY + Math.max(0, Math.min(vh, el.offsetHeight - vh));
      f.h = frame.offsetHeight || vh;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el); ro.observe(document.documentElement);
    addEventListener("resize", measure);
    frames.add(f);
    if (!on) { on = true; lastY = scrollY; lastT = performance.now(); gsap.ticker.add(tick); }
    tick();
    return () => {
      frames.delete(f); ro.disconnect(); removeEventListener("resize", measure);
      if (!frames.size && on) { on = false; gsap.ticker.remove(tick); }
      gsap.set(frame, { clearProps: "transform" }); frame.style.visibility = "";
    };
  });
})();
