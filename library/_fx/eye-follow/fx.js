(() => {
  // The eyes on one page share one window listener — attaching pointermove per eye would measure that many times every frame when there are dozens
  const eyes = new Set();
  const look = (e) => eyes.forEach((f) => f(e));
  const rest = () => eyes.forEach((f) => f(null));
  // Spring type: the pupil layer moves by max times the cursor position in the panel (±.5) as a % of its own size — several eyes in the panel look together (Brand hero)
  const spring = (el, options, hover, scroller) => {
    const pupils = [...el.querySelectorAll('[data-fx-part="pupil"]')];
    if (!pupils.length) return;
    const max = +(options.max ?? 48), touch = +(options.touch ?? 100), k = +(options.spring ?? 0.03), damp = +(options.damping ?? 0.93), top = +(options.speed ?? 2.4);
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, seen = false;
    const clamp = (v, a) => Math.max(-a, Math.min(a, v));
    const step = () => {
      vx = clamp((vx + (tx - x) * k) * damp, top); vy = clamp((vy + (ty - y) * k) * damp, top);
      x += vx; y += vy;
      const done = Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05 && Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02;
      if (done) { x = tx; y = ty; vx = vy = 0; }
      pupils.forEach((p) => { p.style.transform = `translate3d(${x}%, ${y}%, 0)`; });
      raf = done ? 0 : requestAnimationFrame(step);
    };
    const aim = (nx, ny) => { tx = nx; ty = ny; if (!raf) raf = requestAnimationFrame(step); };
    const onMove = (e) => {
      if (!seen) return;
      const r = el.getBoundingClientRect();
      if (r.width) aim(clamp((e.clientX - r.left) / r.width - 0.5, 0.5) * max, clamp((e.clientY - r.top) / r.height - 0.5, 0.5) * max);
    };
    const onScroll = () => {
      if (!seen) return;
      const r = el.getBoundingClientRect(), vh = innerHeight || 1;
      aim(0, clamp(((vh - r.top) / (vh + r.height)) * 2 - 1, 1) * touch);
    };
    const target = scroller || window;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !hover) onScroll();
      if (!seen) { cancelAnimationFrame(raf); raf = 0; tx = ty = x = y = vx = vy = 0; pupils.forEach((p) => { p.style.transform = ""; }); }
    }, { rootMargin: "20% 0%" });
    io.observe(el);
    if (hover) addEventListener("mousemove", onMove, { passive: true });
    else target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      target.removeEventListener("scroll", onScroll);
      pupils.forEach((p) => { p.style.transform = ""; });
    };
  };
  // Gappy aim type: pupils inside the panel aim at the cursor in jumps every every ms and follow by follow per frame — twitchy like real eyes (Brand face)
  // If the pupil is inside an SVG, mx·my are in that drawing’s units, otherwise px. Devices without a pointer look in a random direction every .6~1.8 seconds
  const glance = (el, options, hover, reduce) => {
    const pupils = [...el.querySelectorAll('[data-fx-part="pupil"]')].map((g) => ({ g, x: 0, y: 0, tx: 0, ty: 0 }));
    if (!pupils.length) return;
    const mx = +(options.mx ?? 5), my = +(options.my ?? 3), every = Math.max(16, +(options.every ?? 140)), reach = +(options.reach ?? 300);
    const follow = reduce ? 1 : Math.min(1, +(options.follow ?? 0.45));
    const scaleOf = (g) => (g.ownerSVGElement && g.ownerSVGElement.getScreenCTM()?.a) || 1;
    let raf = 0, last = 0, cx = null, cy = null, timer = 0, loop = 0;
    // SVG pupils move with the transform attribute (drawing units) like the original, and HTML pupils with css transform
    const kept = pupils.map((p) => (p.g.ownerSVGElement ? p.g.getAttribute("transform") : null));
    const paint = () => pupils.forEach((p) => {
      if (p.g.ownerSVGElement) p.g.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
      else p.g.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px)`;
    });
    const tick = () => {
      let moving = false;
      pupils.forEach((p) => {
        p.x += (p.tx - p.x) * follow; p.y += (p.ty - p.y) * follow;
        if (Math.abs(p.tx - p.x) < 0.01 && Math.abs(p.ty - p.y) < 0.01) { p.x = p.tx; p.y = p.ty; } else moving = true;
      });
      paint();
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const aim = () => {
      if (cx == null) return;
      pupils.forEach((p) => {
        const r = p.g.getBoundingClientRect(), s = scaleOf(p.g);
        const ex = r.left + r.width / 2 - p.x * s, ey = r.top + r.height / 2 - p.y * s;
        const dx = cx - ex, dy = cy - ey, dist = Math.hypot(dx, dy) || 1, k = reach > 0 ? Math.min(1, dist / reach) : 1;
        p.tx = (dx / dist) * mx * k; p.ty = (dy / dist) * my * k;
      });
      run();
    };
    const move = (e) => {
      cx = e.clientX; cy = e.clientY;
      const now = performance.now();
      if (now - last > every) { last = now; aim(); }
    };
    if (hover) {
      addEventListener("pointermove", move, { passive: true });
      loop = setInterval(aim, every + 20);
    } else if (!reduce) {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
      let prev = 4;
      const look = () => {
        let i;
        do { i = Math.floor(Math.random() * dirs.length); } while (i === prev);
        prev = i;
        pupils.forEach((p) => { p.tx = dirs[i][0] * mx; p.ty = dirs[i][1] * my; });
        run();
        timer = setTimeout(look, 600 + Math.random() * 1200);
      };
      look();
    }
    return () => {
      removeEventListener("pointermove", move);
      clearInterval(loop); clearTimeout(timer); cancelAnimationFrame(raf);
      pupils.forEach((p, i) => {
        if (!p.g.ownerSVGElement) p.g.style.transform = "";
        else if (kept[i] == null) p.g.removeAttribute("transform");
        else p.g.setAttribute("transform", kept[i]);
      });
    };
  };
  kfFx.register("eye-follow", (el, { options, reduce, hover, scroller }) => {
    if (options.mode === "spring") return reduce ? undefined : spring(el, options, hover, scroller);
    if (options.mode === "glance") return glance(el, options, hover, reduce);
    const pupil = el.querySelector('[data-fx-part="pupil"]');
    if (!pupil || reduce || !hover) return;
    const margin = +(options.margin ?? 12), reach = +(options.reach ?? 120), dur = +(options.dur ?? 0.25), back = +(options.back ?? 0.35);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const f = (e) => {
      if (!e) return gsap.to(pupil, { x: 0, y: 0, duration: back, ease, overwrite: true });
      const r = el.getBoundingClientRect(), q = pupil.getBoundingClientRect();
      if (!r.width) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), a = Math.atan2(dy, dx);
      const k = reach > 0 ? Math.min(1, Math.hypot(dx, dy) / reach) : 1;
      const rx = Math.max(0, r.width / 2 - q.width / 2 - margin), ry = Math.max(0, r.height / 2 - q.height / 2 - margin);
      gsap.to(pupil, { x: Math.cos(a) * rx * k, y: Math.sin(a) * ry * k, duration: dur, ease, overwrite: true });
    };
    if (!eyes.size) { addEventListener("mousemove", look, { passive: true }); document.documentElement.addEventListener("mouseleave", rest); }
    eyes.add(f);
    return () => {
      eyes.delete(f);
      if (!eyes.size) { removeEventListener("mousemove", look); document.documentElement.removeEventListener("mouseleave", rest); }
      gsap.killTweensOf(pupil);
      gsap.set(pupil, { clearProps: "transform" });
    };
  });
})();
