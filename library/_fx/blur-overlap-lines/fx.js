(() => {
  // Instead of tweening each line, one progress value is divided with overlap by the line count — as the front line is half cleared, the next rises out of the blur.
  // Fades in from the top line on entering, from the last line on leaving (leaving takes less time)
  kfFx.register("blur-overlap-lines", (el, { options, reduce, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length) return;
    const blur = +(options.blur ?? 14), tin = +(options.in ?? 1.2), tout = +(options.out ?? 0.7), spread = +(options.spread ?? 0.55);
    const n = lines.length, step = n > 1 ? spread / (n - 1) : 0, width = 1 - spread;
    const quart = (t) => 1 - Math.pow(1 - t, 4);
    const clamp = (v) => Math.min(1, Math.max(0, v));
    let on = false, p = 0, leaving = false;
    const paint = () => {
      const P = quart(p);
      lines.forEach((l, i) => {
        const vis = leaving ? 1 - clamp((1 - P - (n - 1 - i) * step) / width) : clamp((P - i * step) / width);
        l.style.opacity = String(vis);
        l.style.filter = vis < 0.999 ? `blur(${((1 - vis) * blur).toFixed(2)}px)` : "none";
      });
    };
    const tick = (_, dt) => {
      const s = Math.min(0.05, dt / 1000);
      const next = on ? Math.min(1, p + (tin > 0 ? s / tin : 1)) : Math.max(0, p - (tout > 0 ? s / tout : 1));
      if (next === p) return;
      p = next; paint();
    };
    const set = (v) => {
      if (v === on) return;
      on = v; leaving = !v;
      if (reduce) { p = v ? 1 : 0; leaving = false; paint(); }
    };
    paint();
    if (!reduce) gsap.ticker.add(tick);
    // By default turns on when threshold of it is on screen and off when it leaves. With look: state the user adds the class="is-in" Add and remove it (when tied to another tempo, like a scroll frame)
    let io = null, mo = null;
    if (/state/.test(options.look || "")) {
      mo = new MutationObserver(() => set(el.classList.contains("is-in")));
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
      set(el.classList.contains("is-in"));
    } else {
      io = new IntersectionObserver((es) => es.forEach((e) => set(e.isIntersecting)), { root: scroller || null, threshold: +(options.threshold ?? 0.3) });
      io.observe(el);
    }
    return () => {
      io?.disconnect(); mo?.disconnect();
      gsap.ticker.remove(tick);
      lines.forEach((l) => { l.style.removeProperty("opacity"); l.style.removeProperty("filter"); });
    };
  });
})();
