// Follow the wheel (accumulated distance of virtual-scroll) with lerp, but each frame push the block by the distance still remaining, not the distance already followed —
// So even after the wheel stops, it glides 1/lerp times the remaining distance (about 6.7x at 0.15) before stopping. That is the feel of the original tile_column of the reference site.
// The first column (odd-numbered) flows down when the wheel goes down, the second flows up, and blocks that leave the screen attach to the block at the opposite end, looping endlessly.
(() => {
  kfFx.register("twin-column-loop", (el, { options, reduce }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')].map((col, i) => ({ col, dir: i % 2 ? -1 : 1, scroll: 0, blocks: [] }));
    if (!cols.length) return;
    const lerp = +(options.lerp ?? 0.15) || 0.15;
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    const mult = +(options.mult ?? (/win/i.test(platform) ? 0.08 : 0.03));
    const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const exitPx = () => {
      const v = String(options.exit ?? "0");
      return v.endsWith("rem") ? parseFloat(v) * rem() : +v || 0;
    };
    const watch = (options.watch && document.querySelector(options.watch)) || el;

    let target = 0, acc = 0, up = 0, live = false;

    const layout = (c) => {
      c.blocks = [...c.col.children].map((b) => ({ el: b, y: 0, h: 0 }));
      c.blocks.forEach((b, i) => {
        b.el.style.transform = "";
        b.h = b.el.getBoundingClientRect().height;
        if (i) b.y = c.blocks[i - 1].y + c.blocks[i - 1].h;
        b.el.style.transform = `translateY(${b.y}px)`;
      });
      // data-key="end" The stage’s bottom edge sits exactly at the screen bottom with one block’s lower edge — so no empty row shows when it is pushed in from above
      if (c.col.dataset.key !== "end") return;
      const H = c.col.getBoundingClientRect().height;
      const cross = c.blocks.find((b) => b.y + b.h >= H);
      if (!cross) return;
      const shift = H - cross.y - cross.h;
      c.blocks.forEach((b) => { b.y += shift; b.el.style.transform = `translateY(${b.y}px)`; });
    };
    const relayout = () => cols.forEach(layout);
    relayout();
    if (reduce) return () => cols.forEach((c) => c.blocks.forEach((b) => (b.el.style.transform = "")));

    const tick = () => {
      if (!live) return;
      for (const c of cols) {
        c.scroll += (target - c.scroll) * lerp;
        const r = Math.abs(c.scroll - target);
        if (Math.round(r) <= 0.1) continue;
        const n = c.blocks.length, H = c.col.getBoundingClientRect().height;
        c.blocks.forEach((b) => (b.y += r * c.dir));
        c.blocks.forEach((b, i) => {
          if (c.dir === -1 && b.y <= -b.h) {
            const prev = c.blocks[(i + n - 1) % n];
            b.y = prev.y + prev.h;
            if (i === n - 1) b.y -= r;
          }
          if (c.dir === 1 && b.y >= H) b.y = -b.h + c.blocks[(i + 1) % n].y;
          b.el.style.transform = `translateY(${b.y}px)`;
        });
      }
    };

    const onScroll = (e) => {
      acc += e.deltaY;
      target = Math.abs(acc);
      const limit = exitPx();
      if (limit && up >= limit) {
        up = 0;
        setLive(false);
        el.dispatchEvent(new CustomEvent("fx:twin-exit", { bubbles: true }));
        return;
      }
      // virtual-scroll gives a positive deltaY when the wheel scrolls up — scrolling up sends the first column up and the second column down
      if (e.deltaY > 0) { cols.forEach((c, i) => (c.dir = i % 2 ? 1 : -1)); up += Math.abs(e.deltaY); }
      else cols.forEach((c, i) => (c.dir = i % 2 ? -1 : 1));
    };

    // Use the same library (virtual-scroll 2) if present, otherwise a wheel listener with the same calculation
    let vs = null, wheel = null;
    if (window.virtualScroll) {
      vs = new window.virtualScroll({ el, mouseMultiplier: mult, touchMultiplier: 0.5, keyStep: 0.1, useKeyboard: false });
    } else {
      wheel = (ev) => onScroll({ deltaY: (ev.wheelDeltaY || -ev.deltaY) * mult });
    }
    const setLive = (on) => {
      if (on === live) return;
      live = on;
      if (on) { acc = 0; target = 0; vs ? vs.on(onScroll) : el.addEventListener("wheel", wheel, { passive: true }); }
      else { vs ? vs.off(onScroll) : el.removeEventListener("wheel", wheel); }
      el.dispatchEvent(new CustomEvent("fx:twin-live", { bubbles: true, detail: { live: on } }));
    };

    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.intersectionRatio >= 0.98) setLive(true);
        else setLive(false);
        if (en.intersectionRatio <= 0.1) { target = 0; acc = 0; cols.forEach((c) => (c.scroll = 0)); relayout(); }
      }
    }, { threshold: [0.1, 0.8, 0.98] });
    io.observe(watch);
    const ro = new ResizeObserver(() => { if (!live) relayout(); });
    cols.forEach((c) => ro.observe(c.col));

    const useTicker = !!(window.gsap && gsap.ticker);
    let raf = 0;
    const loop = () => { tick(); raf = requestAnimationFrame(loop); };
    useTicker ? gsap.ticker.add(tick) : (raf = requestAnimationFrame(loop));

    return () => {
      setLive(false);
      vs?.destroy();
      io.disconnect(); ro.disconnect();
      useTicker ? gsap.ticker.remove(tick) : cancelAnimationFrame(raf);
      cols.forEach((c) => c.blocks.forEach((b) => (b.el.style.transform = "")));
    };
  });
})();
