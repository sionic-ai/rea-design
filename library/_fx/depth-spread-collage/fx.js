(() => {
  // While a one-screen panel stays pinned inside a long section, photo panels clustered at the center spread out to outer positions, pass through depth (z) and fly toward the camera,
  // Fades out when leaving. Each panel has different start · end · reveal · spread ranges, so they pass by staggered one at a time. Follows scroll progress by .11 per frame, so it feels smooth.
  // Table values (x·y are shares of screen width·height, z is in px) are written in board order, and if there are more boards than rows, the extra boards are hidden.
  const L = (rows) => rows.map(([x, y, start, end, rs, re, se, z0, z1, s0, s1, lag, spread, rot]) => ({ x, y, start, end, rs, re, se, z0, z1, s0, s1, lag, spread, rot }));
  const DESK = L([
    [-0.38, -0.32, 0.13, 0.78, 0.015, 0.22, 0.34, -120, 900, 0.91, 1.08, 0.05, 0.18, -1.1],
    [-0.11, -0.43, 0.19, 0.91, 0.045, 0.3, 0.4, -240, 1160, 0.96, 1.16, 0.14, 0.12, 0.8],
    [0.23, -0.34, 0.16, 0.84, 0.025, 0.25, 0.36, -180, 1040, 0.9, 1.12, 0.02, 0.22, 0.6],
    [0.47, -0.19, 0.28, 0.94, 0.07, 0.35, 0.47, -80, 820, 0.94, 1.06, 0.18, 0.16, -0.8],
    [-0.48, 0.02, 0.22, 0.88, 0.055, 0.31, 0.43, -220, 1140, 0.92, 1.18, 0.09, 0.2, 0.9],
    [0.41, 0.07, 0.31, 0.97, 0.085, 0.39, 0.51, -100, 920, 0.95, 1.09, 0.22, 0.14, -0.5],
    [-0.39, 0.32, 0.18, 0.82, 0.018, 0.24, 0.37, -200, 1080, 0.9, 1.14, 0.04, 0.25, -0.7],
    [-0.1, 0.42, 0.34, 0.98, 0.095, 0.42, 0.53, -60, 840, 0.96, 1.07, 0.16, 0.13, 0.7],
    [0.2, 0.37, 0.24, 0.92, 0.06, 0.34, 0.46, -260, 1170, 0.92, 1.17, 0.11, 0.21, -0.6],
    [0.48, 0.31, 0.29, 0.95, 0.078, 0.37, 0.49, -140, 1000, 0.91, 1.11, 0.07, 0.17, 0.8],
  ]);
  const TAB = L([
    [-0.38, -0.32, 0.13, 0.8, 0.015, 0.22, 0.34, -110, 840, 0.92, 1.08, 0.05, 0.18, -1],
    [-0.08, -0.42, 0.2, 0.92, 0.045, 0.3, 0.4, -210, 1050, 0.96, 1.15, 0.14, 0.12, 0.7],
    [0.3, -0.34, 0.16, 0.86, 0.025, 0.25, 0.36, -160, 960, 0.9, 1.12, 0.02, 0.22, 0.5],
    [0.48, -0.05, 0.28, 0.95, 0.07, 0.35, 0.47, -70, 780, 0.94, 1.06, 0.18, 0.16, -0.7],
    [-0.48, 0.08, 0.22, 0.9, 0.055, 0.31, 0.43, -190, 1030, 0.92, 1.17, 0.09, 0.2, 0.8],
    [0.34, 0.18, 0.31, 0.97, 0.085, 0.39, 0.51, -90, 850, 0.95, 1.09, 0.22, 0.14, -0.5],
    [-0.32, 0.36, 0.18, 0.84, 0.018, 0.24, 0.37, -180, 990, 0.9, 1.14, 0.04, 0.25, -0.6],
    [0.12, 0.42, 0.34, 0.98, 0.095, 0.42, 0.53, -60, 800, 0.96, 1.07, 0.16, 0.13, 0.6],
  ]);
  const MOB = L([
    [-0.34, -0.35, 0.14, 0.78, 0.015, 0.24, 0.36, -90, 600, 0.92, 1.07, 0.05, 0.2, -0.8],
    [0.31, -0.38, 0.22, 0.9, 0.05, 0.33, 0.44, -180, 840, 0.96, 1.15, 0.14, 0.13, 0.7],
    [-0.52, 0.02, 0.18, 0.84, 0.028, 0.28, 0.4, -140, 750, 0.9, 1.12, 0.02, 0.24, 0.6],
    [0.52, 0.04, 0.29, 0.95, 0.075, 0.39, 0.51, -70, 580, 0.94, 1.06, 0.18, 0.16, -0.6],
    [-0.29, 0.36, 0.24, 0.89, 0.058, 0.35, 0.47, -170, 820, 0.91, 1.16, 0.09, 0.22, -0.7],
    [0.3, 0.37, 0.33, 0.97, 0.09, 0.42, 0.54, -90, 680, 0.95, 1.09, 0.16, 0.14, 0.6],
  ]);
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const range = (v, a, b) => (b <= a ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)));
  const outQuad = (v) => 1 - (1 - v) * (1 - v);
  const outCubic = (v) => 1 - (1 - v) ** 3;
  const smooth = (v) => v * v * (3 - 2 * v);
  const mix = (a, b, t) => a + (b - a) * t;

  kfFx.register("depth-spread-collage", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const planes = [...el.querySelectorAll('[data-fx-part="plane"]')];
    if (!stage || !planes.length) return;
    const lead = +(options.lead ?? 0.2), span = +(options.span ?? 0.9), fade = +(options.fade ?? 0.12);
    const follow = +(options.follow ?? 0.11), followM = +(options["follow-mobile"] ?? 0.15), blurPx = +(options.blur ?? 7);
    const twins = planes.map((p) => {
      const src = p.firstElementChild;
      if (!src) return null;
      const t = src.cloneNode(true);
      t.classList.add("fx-dsc-blur");
      t.setAttribute("aria-hidden", "true");
      t.style.filter = `blur(${blurPx}px)`;
      p.append(t);
      return t;
    });
    let meta = [], vw = 0, target = 0, cur = 0, on = false;
    const measure = () => {
      vw = innerWidth; const vh = innerHeight;
      const rows = vw < 768 ? MOB : vw < 1180 ? TAB : DESK;
      const xs = (vw < 768 ? vw : Math.min(vw, 1600)) * (vw < 768 ? 0.72 : 0.75);
      const ys = Math.min(vh, vw < 768 ? 900 : 960) * (vw < 768 ? 0.74 : 0.78);
      meta = planes.map((p, i) => { const r = rows[i]; p.style.display = r ? "" : "none"; return r ? { r, x: r.x * xs, y: r.y * ys } : null; });
    };
    const render = (prog) => {
      cur = clamp(prog);
      planes.forEach((p, i) => {
        const m = meta[i];
        if (!m) return;
        const r = m.r, travel = range(cur, r.start, r.end);
        const reveal = outQuad(range(cur, r.rs, r.re)), entry = smooth(range(cur, r.rs, r.rs + fade));
        const exit = outCubic(range(travel, 0.92, 1)), spread = outQuad(range(cur, r.rs, r.se)), k = mix(r.spread, 1, spread);
        gsap.set(p, {
          xPercent: -50, yPercent: -50, x: m.x * k, y: m.y * k, z: mix(r.z0, r.z1, travel),
          scale: mix(r.s0, r.s1, range(travel, r.lag, 1)), rotationZ: r.rot * (1 - travel * 0.55),
          visibility: cur >= r.rs ? "visible" : "hidden", opacity: entry * (1 - exit), force3D: true,
        });
        if (twins[i]) twins[i].style.opacity = (1 - reveal).toFixed(3);
      });
    };
    const still = () => {
      measure();
      planes.forEach((p, i) => {
        const m = meta[i];
        if (!m) return;
        gsap.set(p, { xPercent: -50, yPercent: -50, x: m.x, y: m.y, z: -120, scale: vw < 768 ? 0.66 : 0.72, rotationZ: m.r.rot, visibility: "visible", opacity: 0.4 });
        if (twins[i]) twins[i].style.opacity = 0;
      });
    };
    if (reduce) { el.classList.add("fx-dsc-still"); still(); addEventListener("resize", still); return () => { removeEventListener("resize", still); el.classList.remove("fx-dsc-still"); twins.forEach((t) => t?.remove()); gsap.set(planes, { clearProps: "all" }); }; }
    const tick = () => {
      const k = 1 - Math.pow(1 - (vw < 768 ? followM : follow), Math.min(3, gsap.ticker.deltaRatio(60)));
      if (Math.abs(target - cur) < 0.0001) { render(target); gsap.ticker.remove(tick); on = false; return; }
      render(cur + (target - cur) * k);
    };
    const wake = () => { if (!on) { on = true; gsap.ticker.add(tick); } };
    measure();
    render(0);
    const st = ScrollTrigger.create({
      trigger: el, scroller,
      start: () => `top ${Math.max(0,Math.round((el.offsetHeight - innerHeight) * lead))}px`,
      end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (s) => { target = range(s.progress, 0, span); wake(); },
      onRefresh: (s) => { measure(); target = cur = range(s.progress, 0, span); render(cur); },
      onLeave: () => { target = 1; render(1); },
      onLeaveBack: () => { target = 0; render(0); },
    });
    let lastH = el.offsetHeight;
    const ro = new ResizeObserver(() => { if (Math.abs(el.offsetHeight - lastH) > 1) { lastH = el.offsetHeight; ScrollTrigger.refresh(); } });
    ro.observe(el);
    return () => {
      st.kill(); ro.disconnect(); gsap.ticker.remove(tick);
      twins.forEach((t) => t?.remove());
      gsap.set(planes, { clearProps: "all" });
    };
  });
})();
