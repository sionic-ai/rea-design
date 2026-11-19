(() => {
  // Two photo rows drift slowly in opposite directions, and when the page is scrolled they speed up by the amount scrolled and slowly settle back to the original speed.
  // Line ([data-fx-part=per row]) inner band ([data-fx-part=track]) is moved, and the strip loops endlessly by joining two copies of the same cell.
  // Speed is px per 60fps frame and scaled by the time between frames — same pace on a 120Hz screen
  kfFx.register("scroll-boost-rows", (el, { options, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')].map((r) => r.querySelector('[data-fx-part="track"]')).filter(Boolean);
    if (!rows.length || reduce) return;
    const max = +(options.max ?? 4), gain = +(options.gain ?? 0.3), settle = +(options.settle ?? 1.5);
    // Given cycle, the normal speed is measured as one set width ÷ cycle seconds (brand 120)
    const cycle = +(options.cycle ?? 0);
    let base = +(options.speed ?? 0.3);
    // With settle 0, there is no settling tween, each frame adds the scrolled amount (signed) directly — scrolling up slows it, then it flows backward.
    // With smooth scroll (Lenis), its deceleration is the settling
    const direct = settle === 0;
    const ease = kfFx.ease(options.ease || "0.165,0.84,0.44,1", "power3.out");
    const speed = { v: base };
    const pos = rows.map(() => 0);
    let loop = 0, lastY = scrollY, tw = null, raf = 0, inView = false, last = 0;
    const measure = () => {
      const t = rows[0];
      const half = t.children.length / 2 | 0;
      loop = half && t.children[half] ? t.children[half].offsetLeft - t.children[0].offsetLeft : t.scrollWidth / 2;
      if (cycle > 0 && loop > 0) speed.v = base = loop / (cycle * 60);
      rows.forEach((r, i) => { if (i % 2) pos[i] = -loop; });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rows[0]);
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
    io.observe(el);
    const onScroll = () => {
      if (direct) return;
      const d = Math.abs(scrollY - lastY);
      lastY = scrollY;
      if (!d) return;
      tw?.kill();
      speed.v = Math.min(base + d * gain, max);
      tw = gsap.to(speed, { v: base, duration: settle, ease, overwrite: true });
    };
    addEventListener("scroll", onScroll, { passive: true });
    const tick = (now) => {
      const f = last ? Math.max(1, now - last) / (1000 / 60) : 1;
      last = now;
      let v = speed.v;
      if (direct) {
        const d = scrollY - lastY;
        lastY = scrollY;
        v = base + Math.max(-max, Math.min(max, d * gain));
      }
      if (inView && loop > 0) rows.forEach((r, i) => {
        const step = v * f;
        if (i % 2) pos[i] = ((pos[i] + step) % loop - loop) % loop;
        else pos[i] = -(((-pos[i] + step) % loop + loop) % loop);
        r.style.transform = `translateX(${pos[i]}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); ro.disconnect(); io.disconnect(); tw?.kill(); rows.forEach((r) => (r.style.transform = "")); };
  });
})();
