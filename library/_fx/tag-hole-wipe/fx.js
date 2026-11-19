(() => {
  // Original Brand loader · page turn: a hole shaped like the logo (a tag pointed on the right, 409.9×204.81, five points) grows from the screen center.
  // mode: loader — punch a hole in the element (the curtain), grow it from the logo size (--fx-tag-start, default 22em) past the screen (×1.02) in .75s expoInOut(.87,0 / .13,1), then lift the curtain (fx:done).
  // mode: reveal — the element itself is cut into a tag shape and opens from 0 until it covers the screen over 1.2s cubic-bezier(.625,.05,0,1) (the new-page side on transitions). Opens again with fx:play.
  const TAG = { w: 409.9, h: 204.81, pts: [[393.01, 204.81], [0, 204.81], [0, 0], [388.49, 0], [409.9, 102.41]] };
  const cover = (w, h) => {
    const n = w / 2, r = h / 2, i = TAG.w / 2, o = TAG.h / 2;
    let s = Math.max(w / TAG.w, h / TAG.h);
    const [a, l] = TAG.pts[4], c = a - i, u = l - o;
    for (const [x, y] of [TAG.pts[3], TAG.pts[0]]) s = Math.max(s, (n + r * ((c - (x - i)) / Math.abs(y - o - u))) / c);
    return s;
  };
  const shape = (s, w, h) => TAG.pts.map(([x, y]) => [w / 2 + (x - TAG.w / 2) * s, h / 2 + (y - TAG.h / 2) * s]);
  const fmt = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(", ")})`;
  const hole = (s, w, h) => { const p = [2, 1, 0, 4, 3].map((k) => shape(s, w, h)[k]), seam = [0, p[0][1]]; return fmt([[0, 0], [w, 0], [w, h], [0, h], seam, ...p, p[0], seam]); };

  kfFx.register("tag-hole-wipe", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const mode = options.mode || "loader";
    const dur = +(options.dur ?? (mode === "loader" ? 0.75 : 1.2)), delay = +(options.delay ?? (mode === "loader" ? 0.7 : 0));
    const ease = kfFx.ease(options.ease || (mode === "loader" ? "0.87,0,0.13,1" : "0.625,0.05,0,1"), mode === "loader" ? "expo.inOut" : "power4.inOut");
    const st = { t: 0 };
    let s0 = 0, tw = null;
    const measure = () => { const p = document.createElement("i"); p.style.cssText = "position:absolute;visibility:hidden;height:0;width:var(--fx-tag-start, 22em)"; el.appendChild(p); s0 = p.getBoundingClientRect().width / TAG.w; p.remove(); };
    const paint = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      if (mode === "loader") el.style.clipPath = hole(s0 + (cover(w, h) * 1.02 - s0) * st.t, w, h);
      else el.style.clipPath = st.t >= 1 ? "" : fmt(shape(cover(w, h) * st.t, w, h));
    };
    const play = () => {
      tw?.kill();
      st.t = 0;
      measure();
      paint();
      if (reduce) { st.t = 1; paint(); finish(); return; }
      tw = gsap.to(st, { t: 1, duration: dur, delay, ease, onUpdate: paint, onComplete: finish });
    };
    const finish = () => { if (mode === "loader") el.style.visibility = "hidden"; el.dispatchEvent(new CustomEvent("fx:done")); };
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    el.addEventListener("fx:play", play);
    play();
    return () => { tw?.kill(); ro.disconnect(); el.removeEventListener("fx:play", play); el.style.clipPath = ""; el.style.visibility = ""; };
  });
})();
