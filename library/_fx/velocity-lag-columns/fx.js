// Each grid column follows the scroll late by a different share — per frame (scroll delta px per 60fps frame) × gain, clamped to ±most rem
// Keep a value V that approaches with exponential damping (settle seconds), and push cards down by column share (lags) × V rem. When it stops V returns to 0 and the wall realigns
(() => {
  kfFx.register("velocity-lag-columns", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const lags = (options.lags || ".5, 1, .25, .75").split(",").map(Number);
    const gain = +(options.gain ?? 0.25), most = +(options.most ?? 4), settle = +(options.settle ?? 0.15);
    const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    let items = [], cols = 1, v = 0, lastY = pos(), lastT = 0, seen = false;
    const shown = new Map();
    const measure = () => {
      items = [...el.querySelectorAll('[data-fx-part="item"]')].filter((n) => n.getClientRects().length);
      cols = +(options.cols || 0) || getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    };
    measure();
    const tick = (time, deltaMs) => {
      const ms = Math.max(1, Math.min(deltaMs || 16, 100));
      const y = pos();
      const perFrame = ((y - lastY) * (1000 / 60)) / ms;
      lastY = y;
      v += (gsap.utils.clamp(-most, most, perFrame * gain) - v) * (1 - Math.exp(-ms / 1000 / settle));
      if (Math.abs(v) < 0.01) v = 0;
      if (!seen) return;
      items.forEach((it, i) => {
        const d = Math.round((lags[i % cols] || 0) * v * 100) / 100;
        if (shown.get(it) === d) return;
        shown.set(it, d);
        it.style.translate = d ? `0 ${d}rem` : "";
      });
    };
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { rootMargin: "25% 0px" });
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true });
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      items.forEach((it) => (it.style.translate = ""));
    };
  });
})();
