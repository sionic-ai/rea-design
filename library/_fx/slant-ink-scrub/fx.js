// Paints the text block with a tilted gradient using background-clip: text, and pushes the dark-side boundary along with scroll.
// 0 when the group’s top edge reaches the viewport start (85%), 1 when its bottom edge reaches end (50%). Whatever has been painted is never undone (it stays dark when scrolling back up).
// Groups already on screen at first open reset their position to 0, so they don’t appear half painted right on open.
// The soft width of the boundary is the soft share of the width the text actually occupies (end of the last letter) — so a group of short lines doesn’t blur into a stretched band.
(() => {
  kfFx.register("slant-ink-scrub", (el, { options, reduce }) => {
    const start = +(options.start ?? 0.85), end = +(options.end ?? 0.5);
    const angle = +(options.angle ?? 140), soft = +(options.soft ?? 0.12);
    const parts = [...el.querySelectorAll('[data-fx-part="group"]')];
    const groups = (parts.length ? parts : [el]).map((node) => ({ node, w: 0, tw: 0, h: 0, base: 0, p: 0 }));
    el.classList.add("fx-slant-ink-scrub");

    const measure = () => {
      groups.forEach((g) => {
        const r = g.node.getBoundingClientRect();
        const walk = document.createTreeWalker(g.node, NodeFilter.SHOW_TEXT), range = document.createRange();
        let right = 0;
        while (walk.nextNode()) {
          range.selectNodeContents(walk.currentNode);
          for (const b of range.getClientRects()) right = Math.max(right, b.right - r.left);
        }
        g.w = r.width; g.tw = right || r.width; g.h = r.height;
        g.node.style.setProperty("--fx-angle", `${angle}deg`);
        g.node.style.setProperty("--fx-soft", `${g.tw * soft}px`);
      });
    };
    const progressOf = (g) => {
      const r = g.node.getBoundingClientRect(), vh = innerHeight;
      const a = start * vh, span = a - (end * vh - r.height);
      return span <= 0 ? 1 : Math.min(Math.max((a - r.top) / span, 0), 1);
    };
    // Distance the tilted band travels from the text box’s top-left corner to its bottom-right corner
    const sweep = (g) => {
      const rad = (angle * Math.PI) / 180, s = Math.sin(rad), c = -Math.cos(rad);
      const o = (Math.abs(g.w * s) + Math.abs(g.h * c)) / 2 - (g.w / 2) * s - (g.h / 2) * c;
      const v = [o, o + g.tw * s, o + g.h * c, o + g.tw * s + g.h * c];
      return [Math.min(...v), Math.max(...v)];
    };
    const update = () => {
      groups.forEach((g) => {
        const raw = reduce ? 1 : progressOf(g);
        const p = g.base > 0 ? Math.min(Math.max((raw - g.base) / (1 - g.base), 0), 1) : raw;
        g.p = Math.max(g.p, p);
        const sf = g.tw * soft, [lo, hi] = sweep(g);
        g.node.style.setProperty("--fx-x", `${lo - sf + g.p * (hi - lo + sf * 2)}px`);
      });
    };

    measure();
    groups.forEach((g) => { const p = progressOf(g); g.base = p < 1 ? p : 0; });
    update();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      update();
      if (e.isIntersecting) addEventListener("scroll", onScroll, { passive: true });
      else removeEventListener("scroll", onScroll);
    }), { threshold: 0 });
    io.observe(el);
    const ro = new ResizeObserver(() => { measure(); update(); });
    ro.observe(el);
    const fonts = () => { measure(); update(); };
    document.fonts?.addEventListener("loadingdone", fonts);

    return () => {
      io.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      document.fonts?.removeEventListener("loadingdone", fonts);
      el.classList.remove("fx-slant-ink-scrub");
      groups.forEach((g) => ["--fx-x", "--fx-angle", "--fx-soft"].forEach((k) => g.node.style.removeProperty(k)));
    };
  });
})();
