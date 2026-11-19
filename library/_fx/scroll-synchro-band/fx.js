(() => {
  // The photo strip drifts by itself at speed×10 px per second, then turns to follow the scroll direction (follows flow direction by .25 each step), and gains speed by the amount scrolled before settling with .9 friction
  kfFx.register("scroll-synchro-band", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const set = track && track.querySelector(':scope > [data-fx-part="set"]');
    if (!track || !set) return;
    // Chain two more copies of the set so wrapping around back and forth has no seam
    const clones = [0, 1].map(() => {
      const c = set.cloneNode(true);
      c.setAttribute("data-fx-part", "clone");
      c.setAttribute("aria-hidden", "true");
      track.append(c);
      return c;
    });
    const speed = +(options.speed ?? 4), friction = +(options.friction ?? 0.9), maxV = +options.max || 50, interp = +(options.lerp ?? 0.2), dirLerp = +(options.turn ?? 0.25);
    const strength = +(options.strength ?? 1);
    // dir: right starts to the right at first (original default), left starts to the left. Scrolling down turns it the other way (invert)
    const startDir = options.dir === "left" ? -1 : 1;
    const invert = options.invert !== "false";
    const s = { moveX: 0, targetX: 0, v: 0, tv: 0, dir: startDir, dirSmooth: startDir, width: 0 };
    const lerp = (a, b, t) => a * (1 - t) + b * t;
    const wrap = (x) => { const w = s.width; if (!w) return x; let r = (x + w) % (2 * w); if (r < 0) r += 2 * w; return r - w; };
    const measure = () => { s.width = set.getBoundingClientRect().width; track.style.marginLeft = -s.width + "px"; };
    const ro = new ResizeObserver(measure);
    ro.observe(set);
    measure();
    const off = () => { ro.disconnect(); clones.forEach((c) => c.remove()); track.style.marginLeft = ""; track.style.transform = ""; };
    if (reduce) return off;
    const src = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : window.scrollY);
    let lastY = pos();
    const onScroll = () => {
      const y = pos(), d = y - lastY;
      lastY = y;
      if (!d) return;
      const e = d > 0 ? 1 : -1;
      s.dir = invert ? -e : e;
      s.tv = Math.max(-maxV, Math.min((invert ? -d : d) * strength, maxV));
    };
    src.addEventListener("scroll", onScroll, { passive: true });
    let last = 0, visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(el);
    const tick = (t) => {
      const now = t * 1000;
      if (!last) last = now;
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      if (!visible) return;
      const e = 10 * Math.min(dt, 0.06);
      s.tv *= friction;
      if (Math.abs(s.tv) < 0.01) s.tv = 0;
      s.v = s.tv;
      s.dirSmooth = lerp(s.dirSmooth, s.dir, dirLerp);
      s.targetX += (speed * s.dirSmooth + s.v) * e;
      s.moveX = lerp(s.moveX, s.targetX, interp);
      track.style.transform = `translate3d(${wrap(s.moveX)}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); src.removeEventListener("scroll", onScroll); io.disconnect(); off(); };
  });
})();
