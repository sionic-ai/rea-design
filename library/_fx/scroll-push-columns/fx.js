(() => {
  // A photo column flows endlessly by base px per tick (60fps), and scrolling down pushes it by that distance × gain (up to max at once), speeding up and then settling by a factor of decay per frame. Scrolling up sheds the accumulated speed.
  kfFx.register("scroll-push-columns", (el, { options, reduce, scroller }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    if (!cols.length) return;
    const axis = options.axis === "x" ? "x" : "y";
    const base = +(options.base ?? 0.8), gain = +(options.gain ?? 0.05), max = +(options.max ?? 2), decay = +(options.decay ?? 0.94);
    // Append one more copy of each column’s inner set (first child) so it wraps without a seam
    const clones = cols.map((c) => {
      const set = c.firstElementChild;
      if (!set) return null;
      const cl = set.cloneNode(true);
      cl.setAttribute("aria-hidden", "true");
      cl.setAttribute("data-fx-part", "clone");
      c.append(cl);
      return cl;
    });
    const gapOf = (c) => parseFloat(getComputedStyle(c).gap) || 0;
    // dir: per pillar, ‹up/down› (left/right when horizontal) separated by commas, default all up (left for horizontal)
    const dirs = String(options.dir || "").split(",").map((s) => s.trim());
    const state = cols.map((c, i) => {
      const d = dirs[i] || dirs[0] || "up";
      return { c, back: d === "down" || d === "right", loop: 0, pos: 0 };
    });
    const measure = () => state.forEach((s) => {
      const set = s.c.firstElementChild;
      if (!set) return;
      s.loop = (axis === "y" ? set.offsetHeight : set.offsetWidth) + gapOf(s.c);
      s.pos = s.back ? -s.loop : 0;
    });
    const ro = new ResizeObserver(measure);
    cols.forEach((c) => c.firstElementChild && ro.observe(c.firstElementChild));
    measure();
    const off = () => { ro.disconnect(); clones.forEach((cl) => cl && cl.remove()); cols.forEach((c) => (c.style.transform = "")); };
    if (reduce) return off;
    const src = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : window.scrollY);
    let lastY = pos(), boost = 0;
    const onScroll = () => {
      const y = pos(), d = y - lastY;
      lastY = y;
      if (d > 0) boost += Math.min(max, d * gain);
      else if (d < 0) boost = Math.max(0, boost + d * gain);
    };
    src.addEventListener("scroll", onScroll, { passive: true });
    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { rootMargin: "300px" });
    io.observe(el);
    const tick = () => {
      const v = (base + boost) * gsap.ticker.deltaRatio(60);
      boost *= decay;
      if (boost < 0.01) boost = 0;
      if (!visible) return;
      state.forEach((s) => {
        if (s.loop <= 0) return;
        if (s.back) { s.pos += v; if (s.pos >= 0) s.pos -= s.loop; }
        else { s.pos -= v; if (s.pos <= -s.loop) s.pos += s.loop; }
        s.c.style.transform = axis === "y" ? `translate3d(0, ${s.pos}px, 0)` : `translate3d(${s.pos}px, 0, 0)`;
      });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); src.removeEventListener("scroll", onScroll); io.disconnect(); off(); };
  });
})();
