(() => {
  // Photos are born on a round plate deep behind the panel (radius 670px · depth 6000px±150) and fly toward the panel edge (depth 500px) while rolling — perspective with a 45° field of view.
  // Opacity rises straight up to life .1 and then fades by (1−life)^.2. When it reaches the edge it is born again at the back. Stops when off-screen
  kfFx.register("photo-warp-tunnel", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!items.length) return;
    if (reduce) return;
    const depth = +(options.depth ?? 6000), exit = +(options.exit ?? 500), radius = +(options.radius ?? 670);
    const speed = +(options.speed ?? 869), jitter = +(options.jitter ?? 0.36), mid = Math.min(0.9999, Math.max(1e-4, +(options.middle ?? 0.1)));
    const aIn = Math.max(1e-4, +(options["alpha-in"] ?? 1)), aOut = Math.max(1e-4, +(options["alpha-out"] ?? 0.2)), rollSpeed = +(options.roll ?? 2);
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const life2a = (l) => (l <= 0 || l >= 1 ? 0 : l <= mid ? Math.pow(l / mid, aIn) : Math.pow((1 - l) / (1 - mid), aOut));
    let W = 0, H = 0;
    const size = () => {
      W = el.clientWidth; H = el.clientHeight;
      el.style.setProperty("--fx-persp", `${((H / 2) / Math.tan((22.5 * Math.PI) / 180)).toFixed(1)}px`);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const edge = (x, y) => {
      const hw = W / 2, hh = H / 2;
      const ang = Math.random() < 0.5 ? (x >= 0 ? 0 : Math.PI) : (y >= 0 ? Math.PI / 2 : -Math.PI / 2);
      const c = Math.cos(ang), s = Math.sin(ang);
      const k = Math.min(Math.abs(c) > 1e-6 ? hw / Math.abs(c) : Infinity, Math.abs(s) > 1e-6 ? hh / Math.abs(s) : Infinity);
      return [c * k, s * k];
    };
    const st = items.map((node, id) => ({ node, id, p: [0, 0, 0], d: [0, 0, 1], v: 0, z0: 0, z1: 0, life: 0, roll: 0, rot: 0 }));
    const spawn = (o, first) => {
      const z0 = -depth + rand(-150, 150), z1 = -exit;
      const t = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * radius;
      const fx = Math.cos(t) * r, fy = Math.sin(t) * r, [tx, ty] = edge(fx, fy);
      const k = first ? o.id / st.length : 0;
      o.p = [fx + (tx - fx) * k, fy + (ty - fy) * k, z0 + (z1 - z0) * k];
      const dx = tx - fx, dy = ty - fy, dz = z1 - z0, n = Math.hypot(dx, dy, dz) || 1;
      o.d = [dx / n, dy / n, dz / n];
      o.v = Math.max(1, speed * (1 + rand(-jitter, jitter)));
      o.roll = (Math.random() < 0.5 ? -1 : 1) * rollSpeed * Math.random() * 0.01;
      o.z0 = z0; o.z1 = z1;
      o.life = clamp(k);
    };
    st.forEach((o) => spawn(o, true));
    const draw = (o) => {
      // Face the flight direction (original lookAt), then roll on all three axes together
      const yaw = Math.atan2(o.d[0], o.d[2]), pitch = -Math.asin(Math.max(-1, Math.min(1, o.d[1])));
      o.node.style.transform = `translate(-50%, -50%) translate3d(${o.p[0].toFixed(1)}px, ${o.p[1].toFixed(1)}px, ${o.p[2].toFixed(1)}px) rotateY(${yaw}rad) rotateX(${pitch}rad) rotateY(${o.rot}rad) rotateX(${o.rot}rad) rotateZ(${o.rot}rad)`;
      o.node.style.opacity = life2a(o.life).toFixed(3);
    };
    let last = 0, raf = 0, on = false;
    const tick = (now) => {
      if (!on) return;
      const dt = last ? Math.min(Math.max(1, now - last), 1000 / 30) / 1000 : 0;
      last = now;
      for (const o of st) {
        o.p[0] += o.d[0] * o.v * dt; o.p[1] += o.d[1] * o.v * dt; o.p[2] += o.d[2] * o.v * dt;
        o.life = clamp((o.p[2] - o.z0) / (o.z1 - o.z0 || 1e-6));
        o.rot += o.roll * rollSpeed * dt;
        if (o.p[2] >= o.z1 || o.life >= 1) spawn(o);
        draw(o);
      }
      raf = requestAnimationFrame(tick);
    };
    st.forEach(draw);
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      if (on) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf);
    });
    io.observe(el);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.style.removeProperty("--fx-persp");
      items.forEach((n) => { n.style.transform = ""; n.style.opacity = ""; });
    };
  });
})();
