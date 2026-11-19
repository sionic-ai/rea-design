(() => {
  // The band flows left on its own (screen width × speed clamped to min~max px/s). On mouse hover it slows by slow times, easing by each Frame’s remaining difference for a smooth slowdown.
  kfFx.register("hover-slow-marquee", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || reduce) return;
    const originals = [...track.children];
    if (!originals.length) return;
    const k = +(options.speed ?? 0.4), lo = +(options.min ?? 20), hi = +(options.max ?? 40);
    const slow = +(options.slow ?? 0.3), follow = +(options.ease ?? 0.08);
    const clones = [];
    let setW = 0, pos = 0, cur = 0, target = 0, last = 0;
    const speed = () => Math.min(Math.max(k * innerWidth, lo), hi);
    const fill = () => {
      setW = originals.reduce((a, c) => a + c.offsetWidth, 0) + (parseFloat(getComputedStyle(track).columnGap) || 0) * originals.length;
      if (!setW) return;
      const need = Math.ceil(innerWidth / setW) + 2;
      while (clones.length < need * originals.length) originals.forEach((o) => { const c = o.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); clones.push(c); });
    };
    fill();
    cur = target = speed();
    const on = () => (target = speed() * slow), out = () => (target = speed());
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", out);
    const ro = new ResizeObserver(() => { fill(); target = el.matches(":hover") ? speed() * slow : speed(); });
    ro.observe(el);
    const tick = (t) => {
      if (!last) { last = t; return; }
      const dt = Math.min(0.1, Math.max(0.001, t - last));
      last = t;
      if (!setW) return;
      cur += (target - cur) * follow;
      pos -= cur * dt;
      if (pos <= -setW) pos += setW;
      track.style.transform = `translate3d(${pos}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", out); clones.forEach((c) => c.remove()); track.style.transform = ""; };
  });
})();
