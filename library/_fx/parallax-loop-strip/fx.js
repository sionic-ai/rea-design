(() => {
  // Cells are tripled and rewound after flowing one set’s width — with two sets the end goes empty on wide screens (the original also has three).
  // The picture inside each cell gets +range when the cell hits the strip’s right edge and −range when it leaves the left edge, so depth is staggered cell by cell.
  // Pause when the strip is off-screen (the original always runs — flow is time-based so the speed is the same after resuming).
  kfFx.register("parallax-loop-strip", (el, { options, reduce, scroller }) => {
    const marked = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    const items = marked.length ? marked : [...el.children];
    if (!items.length) return;
    const dur = +options.dur || 30;
    const range = +(options.range ?? 80);
    const zoom = +(options.zoom ?? 1.4);
    const mediaOf = (it) => it.querySelector('[data-fx-part="media"]') || it.firstElementChild;

    const track = document.createElement("div");
    track.className = "fx-pls__track";
    items.forEach((it) => track.append(it));
    el.append(track);
    for (let k = 0; k < 2; k++)
      items.forEach((it) => {
        const c = it.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.classList.add("fx-pls__clone");
        c.querySelectorAll("a, button, input, [tabindex]").forEach((f) => (f.tabIndex = -1));
        track.append(c);
      });
    const all = [...track.children];
    const media = all.map(mediaOf);
    media.forEach((m) => m && (m.style.scale = String(zoom)));

    let setW = 0, viewW = 0, offsets = [], widths = [];
    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setW = items.reduce((w, it) => w + it.offsetWidth + gap, 0);
      offsets = all.map((it) => it.offsetLeft);
      widths = all.map((it) => it.offsetWidth);
      viewW = el.offsetWidth;
    };
    measure();
    // Even if cell width changes from late photos or fonts, re-measure one set’s width
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    items.forEach((it) => ro.observe(it));

    let x = 0, last = 0, raf = 0;
    const place = () => {
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      for (let i = 0; i < all.length; i++) {
        if (!media[i]) continue;
        const p = Math.max(0, Math.min(1, (viewW - (x + offsets[i])) / (viewW + widths[i])));
        media[i].style.translate = `${range - p * range * 2}px 0`;
      }
    };
    const tick = (now) => {
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      x -= (setW / dur) * dt;
      if (setW && x <= -setW) x += setW;
      place();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf) return;
      raf = requestAnimationFrame((now) => {
        last = now;
        raf = requestAnimationFrame(tick);
      });
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    place();
    const io = reduce ? null : new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { root: scroller || null });
    io?.observe(el);

    return () => {
      stop();
      io?.disconnect();
      ro.disconnect();
      track.querySelectorAll(":scope > .fx-pls__clone").forEach((c) => c.remove());
      items.forEach((it) => {
        const m = mediaOf(it);
        if (m) {
          m.style.removeProperty("scale");
          m.style.removeProperty("translate");
        }
        el.append(it);
      });
      track.remove();
    };
  });
})();
