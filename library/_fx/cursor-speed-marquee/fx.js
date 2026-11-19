(() => {
  // Original (Brand scene gallery) per Frame d += (u − d)/10, h += Pushes the band by d — the step unit is rem, so it grows along with the screen width
  kfFx.register("cursor-speed-marquee", (el, { options, reduce, hover }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const set = track && track.querySelector('[data-fx-part="set"]');
    if (!track || !set) return;
    const base = +(options.base ?? 0.075), gain = +(options.gain ?? 0.5), lerp = +(options.lerp ?? 0.1);
    const dragK = +(options.drag ?? 0.1), fling = +(options.fling || 8.5);
    const clones = [set.cloneNode(true), set.cloneNode(true)];
    clones.forEach((c) => { c.setAttribute("aria-hidden", "true"); track.append(c); });
    const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let wrap = 0;
    const measure = () => { wrap = (set.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)) / rem(); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(set);
    let u = base, d = base, h = 0, dir = true, raf = 0, last = 0, seen = true, dragging = false;
    const place = (x) => { track.style.transform = `translateX(${-x}rem)`; };
    const wrapAt = (x) => { if (wrap > 0) { while (x >= wrap) x -= wrap; while (x <= -wrap) x += wrap; } return x; };
    const tick = (now) => {
      const k = last ? Math.max(1, now - last) / (1000 / 60) : 1;
      last = now;
      d += (u - d) * (1 - Math.pow(1 - lerp, k));
      h = wrapAt(h + d * k);
      place(h);
      raf = requestAnimationFrame(tick);
    };
    const run = () => { if (!raf && seen && !dragging && !reduce) { last = 0; raf = requestAnimationFrame(tick); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : stop(); });
    io.observe(el);
    const offs = [];
    const on = (t, type, fn, opt) => { t.addEventListener(type, fn, opt); offs.push(() => t.removeEventListener(type, fn, opt)); };
    if (hover) {
      on(el, "mousemove", (e) => {
        const r = el.getBoundingClientRect(), w = r.width;
        const x = (Math.max(0, Math.min(w, e.clientX - r.left)) - w / 2) / (w / 2);
        dir = x > 0;
        u = gain * x * Math.abs(x * x);
      });
      on(el, "mouseleave", () => { u = dir ? base : -base; });
    } else if (!reduce) {
      // Finger: dragging horizontally follows along and keeps flowing at the release pace — vertical swipes are passed to the page by touch-action
      let x0 = 0, xPrev = 0, xLast = 0, h0 = 0, id = null;
      on(el, "pointerdown", (e) => {
        if (e.pointerType === "mouse") return;
        id = e.pointerId; x0 = xPrev = xLast = e.clientX; h0 = h; dragging = true; stop();
      });
      on(el, "pointermove", (e) => {
        if (e.pointerId !== id) return;
        xPrev = xLast; xLast = e.clientX;
        h = wrapAt(h0 - (xLast - x0) * dragK);
        place(h);
      });
      const end = (e) => {
        if (e.pointerId !== id) return;
        id = null; dragging = false;
        d = (xPrev - xLast) / fling;
        run();
      };
      on(el, "pointerup", end);
      on(el, "pointercancel", end);
    }
    if (reduce) place(0);
    return () => {
      stop(); io.disconnect(); ro.disconnect(); offs.forEach((f) => f());
      clones.forEach((c) => c.remove());
      track.style.removeProperty("transform");
    };
  });
})();
