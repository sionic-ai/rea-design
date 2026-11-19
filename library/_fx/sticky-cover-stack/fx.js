// If the panel is taller than the screen, it must stick when its end reaches the screen bottom so it can be read to the end — so top is measured as a negative per panel
(() => {
  kfFx.register("sticky-cover-stack", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    (() => {
      const panels = [...el.children];
      const H = () => (scroller ? scroller.clientHeight : innerHeight);
      let ranges = [], raf = 0;
      // The plate position is measured from the top edge of the bundle — so it doesn’t go stale when upper content (images, pin-spacer) grows late, the on-screen position is read each time it covers.
      const layout = () => {
        let y = 0;
        ranges = panels.map((p, i) => {
          p.style.zIndex = i + 1;
          p.style.setProperty("--sticky-top", `${Math.min(0, H() - p.offsetHeight)}px`);
          const r = { p, start: y }; y += p.offsetHeight; return r;
        });
      };
      const cover = () => {
        raf = 0;
        if (reduce) return;
        const top = el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
        ranges.forEach((r, i) => {
          const next = ranges[i + 1], p = next ? 1 - (top + next.start) / H() : 0;
          const off = i === 0 ? 0.42 : 0, span = i === 0 ? 0.42 : 0.5, e = Math.min(1, Math.max(0, (p - off) / span));
          r.p.style.setProperty("--cover", (e * e).toFixed(3));
        });
      };
      layout(); cover();
      (scroller || window).addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(cover); }, { signal, passive: true });
      // Panel height changes even after being attached by fonts, images and inner parts — looking only at window size leaves --sticky-top stale
      const ro = new ResizeObserver(() => { layout(); cover(); });
      [el, ...panels].forEach((p) => ro.observe(p));
      signal.addEventListener("abort", () => { ro.disconnect(); panels.forEach((p) => { p.style.removeProperty("--sticky-top"); p.style.removeProperty("--cover"); p.style.removeProperty("z-index"); }); });
      addEventListener("resize", () => { layout(); cover(); }, { signal });
    })();
    return () => ac.abort();
  });
})();
