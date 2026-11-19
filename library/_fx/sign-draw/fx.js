// Like a video playhead, time t (0~dur) is scrubbed back and forth, and each stroke draws a straight line in its own time slot with no curves
(() => {
  // Turns a css name (ease · ease-in · ease-out · ease-in-out · linear) or ‹x1,y1,x2,y2› into a 0–1 → 0–1 function — each stroke uses the css transition curve as is
  const NAMED = { ease: "0.25,0.1,0.25,1", "ease-in": "0.42,0,1,1", "ease-out": "0,0,0.58,1", "ease-in-out": "0.42,0,0.58,1" };
  const bezier = (spec) => {
    const n = String(NAMED[spec] || spec || "").split(",").map(Number);
    if (n.length !== 4 || !n.every(Number.isFinite)) return (k) => k;
    const [x1, y1, x2, y2] = n;
    const at = (p1, p2, s) => 3 * p1 * s * (1 - s) ** 2 + 3 * p2 * s * s * (1 - s) + s ** 3;
    return (k) => {
      if (k <= 0 || k >= 1) return k;
      let lo = 0, hi = 1, s = k;
      for (let i = 0; i < 24; i++) { s = (lo + hi) / 2; if (at(x1, x2, s) < k) lo = s; else hi = s; }
      return at(y1, y2, s);
    };
  };
  kfFx.register("sign-draw", (el, { options, reduce }) => {
    const strokes = [...el.querySelectorAll('[data-fx-part="stroke"]')];
    if (!strokes.length) return;
    const dur = +(options.dur || 2), speed = +(options.speed || 1);
    const on = options.on || "load";
    const span = (dur * 0.925) / strokes.length;
    const slots = strokes.map((p, i) => {
      const at = String(p.dataset.at || "").trim().split(/\s+/).map(Number);
      return at.length === 2 && at.every(Number.isFinite) ? at : [i * span, (i + 1) * span];
    });
    // Curve per stroke (data-ease) — if none, options.ease, and if none of that either, no curve (original behavior)
    const eases = strokes.map((p) => bezier(p.dataset.ease || options.ease));
    let t = 0, raf = 0;
    const render = () => strokes.forEach((p, i) => {
      const [a, b] = slots[i];
      p.style.strokeDashoffset = String(1 - eases[i](Math.min(1, Math.max(0, (t - a) / Math.max(0.001, b - a)))));
    });
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const run = (dir, k, loop) => {
      let last = null;
      const step = (now) => {
        if (last === null) last = now;
        t += (dir * k * Math.max(0, now - last)) / 1000;
        last = now;
        if (loop && t >= dur) t %= dur;
        t = Math.min(dur, Math.max(0, t));
        render();
        raf = loop || (dir > 0 ? t < dur : t > 0) ? requestAnimationFrame(step) : 0;
      };
      raf = requestAnimationFrame(step);
    };
    const play = () => { stop(); t = reduce ? dur : 0; render(); if (!reduce) run(1, 1, options.loop === "1"); };
    const back = () => { stop(); t = reduce ? 0 : dur; render(); if (!reduce) run(-1, speed, false); };
    render();

    let atBottom = false;
    const bottomCheck = () => {
      const now = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      if (now === atBottom) return;
      atBottom = now;
      if (on === "bottom") (now ? play : back)();
      else if (options["reverse-at-bottom"] === "1") (now ? back : play)();
    };
    const usesBottom = on === "bottom" || options["reverse-at-bottom"] === "1";
    if (usesBottom) { addEventListener("scroll", bottomCheck, { passive: true }); addEventListener("resize", bottomCheck); }
    let io = null;
    if (on === "visible") {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } });
      io.observe(el);
    } else if (on === "load") play();
    if (on === "bottom") { atBottom = false; bottomCheck(); }
    const onPlay = () => play(), onBack = () => back();
    el.addEventListener("fx:play", onPlay);
    el.addEventListener("fx:reverse", onBack);
    return () => {
      stop();
      if (io) io.disconnect();
      if (usesBottom) { removeEventListener("scroll", bottomCheck); removeEventListener("resize", bottomCheck); }
      el.removeEventListener("fx:play", onPlay);
      el.removeEventListener("fx:reverse", onBack);
      strokes.forEach((p) => { p.style.strokeDashoffset = ""; });
    };
  });
})();
