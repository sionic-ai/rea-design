(() => {
  // The layout formula of the original becane model row (WebGL) moved to a DOM panel — measuring panel height H as 1 (W = width/height).
  //   Single line   x = (i/(n−1) − .5)·.75·W, size = .75/n·W·16/9 (multiples of the panel height)
  //   Ring    angular if narrower than the ring = i/n·2π + π/2, radius .4·W, .8x vertical, size .1
  //   Carousel r = (i − focus)/3 (/2 for ring), size = cubicIn(1−|r|) gives .2→1 (ring .7), x = r·(.8 + .55·size)·W,
  //            Opaque = expoIn(1−|r|; −.2→1), blur = expoIn(1−|r|; .5→1 to 1→0)
  //   On press it expands over .8s quintInOut, and each person re-eases with quintInOut over [0, 1 − (.2/R)·(R − distance)] — the closer to the focus, the sooner it arrives.
  //   After unfolding, the wheel shifts focus at .0015/px, and after a 150ms pause snaps to the nearest cell in .8s quintOut. Clicking the center cell again fires fx:open, empty space · Esc folds it back.
  kfFx.register("line-zoom-carousel", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 2 || !window.gsap) return;
    const n = items.length, ratio = +(options.ratio || 9 / 16), dimTo = +(options.dim ?? 0.4), ringBelow = +(options.ring ?? 740), blurPx = +(options.blur ?? 8);
    const st = { zoomed: 0, focus: (n - 1) / 2, hot: -1, cur: Math.floor(n / 2) };
    const E = { qio: gsap.parseEase("power4.inOut"), cin: gsap.parseEase("power2.in"), ein: gsap.parseEase("expo.in") };
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const map = (v, a, b, c, d, e) => { const t = clamp((v - a) / (b - a), 0, 1); return c + (d - c) * (e ? e(t) : t); };
    let H = 1, W = 1, ring = false;
    const base = (i) => ring
      ? { x: Math.cos((i / n) * Math.PI * 2 + Math.PI / 2) * 0.4 * W, y: Math.sin((i / n) * Math.PI * 2 + Math.PI / 2) * 0.4 * W * 0.8, s: 0.1, o: 1, b: 0 }
      : { x: (i / (n - 1) - 0.5) * 0.75 * W, y: 0, s: (0.75 / n) * W * (16 / 9), o: 1, b: 0 };
    const spread = (i) => {
      const r = (i - st.focus) / (ring ? 2 : 3), k = 1 - Math.abs(r);
      const s = map(k, 0, 1, 0.2, ring ? 0.7 : 1, E.cin);
      return { x: r * (0.8 + 0.55 * s) * W, y: 0, s, o: map(k, -0.2, 1, 0, 1, E.ein), b: map(k, 0.5, 1, 1, 0, E.ein) };
    };
    const draw = () => {
      const R = Math.max(Math.abs(n - 1 - st.focus), Math.abs(st.focus)) || 1, d = 0.2 / R;
      items.forEach((it, i) => {
        const a = base(i), b = spread(i), k = map(st.zoomed, 0, 1 - d * (R - Math.abs(i - st.focus)), 0, 1, E.qio);
        const L = (p, q) => p + (q - p) * k;
        const s = L(a.s, b.s);
        it.style.transform = `translate(-50%, -50%) translate(${L(a.x, b.x) * H}px, ${-L(a.y, b.y) * H}px) scale(${s})`;
        it.style.setProperty("--fx-lzc-o", L(a.o, b.o).toFixed(3));
        it.style.filter = L(a.b, b.b) > 0.01 ? `blur(${(L(a.b, b.b) * blurPx).toFixed(2)}px)` : "";
        it.style.zIndex = Math.round(s * 100);
      });
    };
    const size = () => {
      H = el.clientHeight || 1; W = (el.clientWidth || 1) / H; ring = el.clientWidth < ringBelow && n > 5;
      items.forEach((it) => { it.style.height = `${H}px`; it.style.width = `${H * ratio}px`; });
      draw();
    };
    const roll = (slow) => items.forEach((it, i) => {
      const on = st.zoomed > 0 || i === (st.hot >= 0 ? st.hot : st.cur);
      gsap.killTweensOf(it, "--fx-lzc-r");
      if (on) gsap.to(it, { "--fx-lzc-r": 1, duration: reduce ? 0 : slow ? 0.8 : 0.1, ease: "none" });
      else it.style.setProperty("--fx-lzc-r", dimTo);
    });
    const zoom = (on, at) => {
      if (on) { st.focus = at; st.cur = at; }
      gsap.to(st, { zoomed: on ? 1 : 0, duration: reduce ? 0 : 0.8, ease: "power4.inOut", onUpdate: draw, onComplete: () => roll(!on) });
      if (on) roll(false);
    };
    const toFocus = (f) => gsap.to(st, { focus: f, duration: reduce ? 0 : 0.8, ease: "power4.out", overwrite: "auto", onUpdate: draw });
    const ac = new AbortController(), on = (t, ev, fn, o) => t.addEventListener(ev, fn, { signal: ac.signal, ...o });
    items.forEach((it, i) => {
      if (hover) {
        on(it, "pointerenter", () => { st.hot = i; st.cur = i; roll(false); });
        on(it, "pointerleave", () => { st.hot = -1; roll(false); });
      }
      on(it, "click", (e) => {
        e.stopPropagation();
        if (st.zoomed < 0.5) zoom(true, i);
        else if (i === Math.round(st.focus)) el.dispatchEvent(new CustomEvent("fx:open", { detail: { index: i, item: it }, bubbles: true }));
        else { st.cur = i; toFocus(i); }
      });
    });
    on(el, "click", () => { if (st.zoomed > 0.5) zoom(false); });
    on(window, "keydown", (e) => { if (e.key === "Escape" && st.zoomed > 0) zoom(false); });
    let snap = 0;
    on(el, "wheel", (e) => {
      if (st.zoomed < 0.99) return;
      e.preventDefault();
      gsap.killTweensOf(st, "focus");
      st.focus = clamp(st.focus + 0.0015 * (e.deltaY + e.deltaX), 0, n - 1);
      draw();
      clearTimeout(snap);
      snap = setTimeout(() => { st.cur = Math.round(st.focus); toFocus(st.cur); }, 150);
    }, { passive: false });
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size(); roll(false);
    return () => {
      ac.abort(); ro.disconnect(); clearTimeout(snap); gsap.killTweensOf(st);
      items.forEach((it) => { gsap.killTweensOf(it); ["transform", "filter", "z-index", "width", "height", "--fx-lzc-o", "--fx-lzc-r"].forEach((p) => it.style.removeProperty(p)); });
    };
  });
})();
