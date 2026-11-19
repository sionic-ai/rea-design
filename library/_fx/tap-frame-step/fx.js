(() => {
  // Original (Framer Image Sequence Player): only one of several cuts is visible, and each press shows the next cut (back to the first at the end).
  // With auto-spin on, it advances every interval for cycles rounds then stops on the first cut, slowing by a factor of (1 + slow × p²), the square of progress p, as it stops
  kfFx.register("tap-frame-step", (el, { options, reduce }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    if (frames.length < 2) return;
    const n = frames.length;
    const loop = options.loop !== "off";
    const mode = options.rapid || "queue";
    const throttle = Math.max(16, +(options.throttle ?? 120));
    let i = Math.max(0, Math.min(n - 1, +(options.start ?? 0))), last = 0, busy = false, timer = 0, playing = false;
    const show = () => frames.forEach((f, k) => f.classList.toggle("is-fx-on", k === i));
    const step = () => { i = loop ? (i + 1) % n : Math.min(n - 1, i + 1); show(); el.dispatchEvent(new CustomEvent("fx:frame", { detail: { index: i } })); };
    el.classList.add("is-fx-ready");
    show();
    const tap = () => {
      if (playing || options.click === "off") return;
      if (mode === "throttle") { const now = performance.now(); if (now - last < throttle) return; last = now; step(); }
      else if (mode === "frame") { if (busy) return; busy = true; step(); requestAnimationFrame(() => (busy = false)); }
      else step();
    };
    if (options.click !== "off") el.addEventListener("click", tap);
    if (options.autoplay === "on" && !reduce) {
      const every = Math.max(16, Math.round(+(options.interval ?? 100))), cycles = Math.max(1, Math.round(+(options.cycles ?? 3)));
      const slow = Math.min(3, Math.max(0, +(options.slow ?? 0.65)));
      const reset = options.reset !== "off";
      const total = reset ? n * cycles : n * cycles - 1;
      let done = 0;
      playing = true;
      const tick = () => {
        done += 1; step();
        if (done >= total) { if (reset) { i = 0; show(); } playing = false; el.dispatchEvent(new Event("fx:end")); return; }
        const p = done / total;
        timer = setTimeout(tick, Math.round(every * (1 + slow * p * p)));
      };
      timer = setTimeout(tick, every);
    }
    return () => { clearTimeout(timer); el.removeEventListener("click", tap); el.classList.remove("is-fx-ready"); frames.forEach((f) => f.classList.remove("is-fx-on")); };
  });
})();
