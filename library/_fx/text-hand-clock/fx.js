(() => {
  // Original (a template, “Analog orbit clock”): instead of hands, text like “n seconds” sits at the hand tip on a circle of radius .36 and rotates with the hand angle, reading along the radius.
  // Angles add −90° so that 12 o’clock is 0. The seconds hand ticks once per second (with smooth it updates every frame down to milliseconds). Stops when more than 200px offscreen
  kfFx.register("text-hand-clock", (el, { options, reduce, scroller }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const hands = { sec: part("sec"), min: part("min"), hour: part("hour") };
    if (!hands.sec && !hands.min && !hands.hour) return;
    const offset = options.offset != null ? +options.offset : -new Date().getTimezoneOffset() / 60;
    const radius = +(options.radius ?? 0.36), gap = +(options.gap ?? 0);
    const words = (options.words || "Seconds, minutes, hours").split(",").map((w) => w.trim());
    const smooth = options.smooth === "on" && !reduce;
    const dir = options.dir === "ccw" ? -1 : 1;
    const ticks = part("ticks");
    if (ticks && !ticks.childElementCount) for (let i = 0; i < 12; i++) { const t = document.createElement("i"); t.style.setProperty("--fx-i", i); ticks.append(t); }
    let side = 0;
    const measure = () => { side = Math.min(el.clientWidth, el.clientHeight); el.style.setProperty("--fx-side", `${el.clientHeight}px`); };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    const put = (node, deg, r, text) => {
      if (!node) return;
      const a = (deg * Math.PI) / 180;
      node.textContent = text;
      node.style.left = `${50 + (Math.cos(a) * r * 100) / Math.max(1, el.clientWidth)}%`;
      node.style.top = `${50 + (Math.sin(a) * r * 100) / Math.max(1, el.clientHeight)}%`;
      node.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
    };
    const draw = () => {
      const d = new Date();
      const sec = d.getUTCSeconds() + (smooth ? d.getUTCMilliseconds() / 1000 : 0);
      const min = d.getUTCMinutes(), h24 = (((d.getUTCHours() + offset) % 24) + 24) % 24;
      const r = side * Math.max(0, Math.min(0.49, radius)), g = side * gap;
      put(hands.sec, (dir * sec * 360) / 60 - 90, r + g, `${Math.floor(sec)} ${words[0] ?? ""}`.trim());
      put(hands.min, (dir * min * 360) / 60 - 90, r, `${min} ${words[1] ?? ""}`.trim());
      put(hands.hour, (dir * (h24 % 12) * 360) / 12 - 90, r - g, `${h24} ${words[2] ?? ""}`.trim());
    };
    let raf = 0, iv = 0, on = false;
    const start = () => { if (on) return; on = true; draw(); if (smooth) { const f = () => { draw(); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); } else iv = setInterval(draw, 1000); };
    const stop = () => { on = false; cancelAnimationFrame(raf); clearInterval(iv); };
    const io = new IntersectionObserver((e) => (e.some((x) => x.isIntersecting) ? start() : stop()), { root: scroller || null, rootMargin: "200px 0px 200px 0px", threshold: 0.1 });
    io.observe(el);
    draw();
    return () => { stop(); io.disconnect(); ro.disconnect(); el.style.removeProperty("--fx-side"); };
  });
})();
