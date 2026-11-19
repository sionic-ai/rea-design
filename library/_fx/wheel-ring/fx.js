// Without document scroll, take wheel·drag values as the ring position, so items lined up horizontally spin endlessly, growing and brightening toward the center (blurrier the farther away)
// Position follows its target with exponential decay (inertia on release), lined-up items tilt in a sin wave, and items around the cursor are pulled in by Gaussian weight and tilt on a spring
(() => {
  kfFx.register("wheel-ring", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const D = items.length;
    if (!D) return;
    const o = (k, d) => +(options[k] ?? d);
    const PER = +options.per || 4, PER_M = +options["per-phone"] || 3, GAP = o("gap", 0.92), SIZE = o("size", 0.616), SIZE_M = o("size-phone", 0.8395), RATIO = +options.ratio || 1013 / 630;
    const K_WHEEL = o("wheel", 1.15), K_DRAG = o("drag", 1.5), FLING = o("fling", 190), DAMP = o("damp", 2.3), DAMP_DRAG = o("damp-drag", 11);
    const WAVE = o("wave", 18), S_MIN = o("min", 0.55), S_MAX = o("max", 1.35), B_MIN = o("dim", 0.7), B_MAX = o("bright", 1.1), BLUR = o("blur", 4);
    const INTRO = o("intro", 1.15) * 1000, PULL = options.pull !== "off";
    const OFFS = [-0.053, 0.043, -0.024, 0.057, -0.048, 0.029, -0.038, 0.053];
    const ease3 = (t) => 1 - (1 - t) ** 3;
    const st = () => ({ v: 0, x: 0 });
    const spring = (s, to, k, dt) => { s.v += ((to - s.x) * k - s.v * 9) * dt; s.x += s.v * dt; if (Math.abs(s.v) < 0.001 && Math.abs(to - s.x) < 0.001) { s.x = to; s.v = 0; } };
    const J = items.map((it, i) => ({ it, i, lean: st(), px: st(), py: st(), lift: st() }));

    let G = 0, N = 0, u = 0, R = 0, F = 0;
    const layout = () => {
      G = el.clientWidth;
      const per = G <= 480 ? PER_M : PER, Z = G / per;
      N = Z * GAP * (per === PER ? 1 : 1.25);
      u = Z * (per === PER ? SIZE : SIZE_M);
      R = u * RATIO;
      if (R > el.clientHeight * 0.72) { R = el.clientHeight * 0.72; u = R / RATIO; }
      F = D * N;
      el.style.setProperty("--fx-ring-w", `${u}px`);
      el.style.setProperty("--fx-ring-h", `${R}px`);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);

    let target = 0, H = 0, dragging = false, moved = false, pid = -1, lastX = 0, downX = 0, dv = 0, lastT = 0;
    let mx = 0, my = 0, inside = false, P = 0, raf = 0, last = performance.now();
    const born = performance.now();
    const onWheel = (e) => { e.preventDefault(); target -= (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * K_WHEEL; };
    const onDown = (e) => { dragging = true; pid = e.pointerId; moved = false; lastX = downX = e.clientX; dv = 0; lastT = e.timeStamp; };
    const onMove = (e) => {
      if (e.pointerType !== "touch") { inside = true; mx = e.clientX; my = e.clientY; }
      if (!dragging || e.pointerId !== pid) return;
      if (!moved) {
        if (Math.abs(e.clientX - downX) <= 6) return;
        try { el.setPointerCapture(e.pointerId); } catch { return; }
        moved = true; lastX = e.clientX; lastT = e.timeStamp; return;
      }
      const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT);
      dv = dv * 0.72 + (dx / dt) * 0.28; lastX = e.clientX; lastT = e.timeStamp;
      target += dx * K_DRAG;
    };
    const onUp = (e) => {
      if (pid !== -1 && e.pointerId !== pid) return;
      if (moved) { try { el.releasePointerCapture(e.pointerId); } catch {} target += Math.max(-3.5, Math.min(3.5, dv)) * K_DRAG * FLING; }
      dragging = false; moved = false; pid = -1; dv = 0;
    };
    // A press that comes after a drag is blocked from following the link
    let suppress = false;
    const onClick = (e) => { if (suppress) { e.preventDefault(); e.stopPropagation(); } };
    const onUpCapture = () => { suppress = moved; setTimeout(() => (suppress = false), 0); };
    const onLeave = () => (inside = false);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUpCapture, true);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick, true);

    const frame = (now) => {
      const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
      last = now;
      const prev = H;
      H += (target - H) * (1 - Math.exp(-(moved ? DAMP_DRAG : DAMP) * dt));
      if (Math.abs(target - H) < 0.05) H = target;
      const vel = dt > 0 ? (H - prev) / dt : 0, re = Math.min(1, Math.abs(vel) / 2400);
      const on = PULL && hover && inside && !reduce;
      P += ((on ? 1 : 0) - P) * (1 - Math.exp(-3 * dt));
      if (!on && P < 0.001) P = 0;
      const box = el.getBoundingClientRect(), lx = mx - box.left, ly = my - box.top;
      const ip = reduce ? 1 : ease3(Math.min(1, (now - born) / INTRO));
      J.forEach((j) => {
        let x = (j.i * N + u / 2 + H + u * 2) % F;
        if (x < 0) x += F;
        x -= u * 2;
        const q = G ? x / G : 0;
        const xs = (q + 0.55 * 0.16 * Math.tanh((q - 0.5) / 0.16)) * G;
        const mid = q >= 0 && q <= 1 ? Math.sin(q * Math.PI) : 0, far = N ? Math.abs(q - 0.5) / (N / G) : 0;
        const scale = (S_MIN + mid * (S_MAX - S_MIN)) * (1 - 0.1 * Math.min(1, far));
        const rot = reduce ? 0 : Math.sin(((j.i * N + H) / (3 * N)) * Math.PI * 2) * WAVE;
        const oy = OFFS[j.i % OFFS.length] * R + (1 - ip) * 56;
        let tLean = -Math.sign(vel) * re * 6, tPx = 0, tPy = 0, tLift = 0;
        if (P > 0) {
          const dx = lx - xs, dy = ly - (box.height / 2 + oy), W = u * 1.6, g = Math.exp(-((dx * dx + dy * dy) / (W * W))), th = Math.tanh(dx / W);
          tLean += th * 5 * g * P; tLift = 0.05 * g * P; tPx = th * 16 * g * P; tPy = Math.tanh(dy / (R * 0.8)) * 16 * g * P;
        }
        const k = 70 * (1 - 0.15 + 0.3 * ((j.i * 0.618034) % 1));
        spring(j.lean, tLean, k, dt); spring(j.px, tPx, k, dt); spring(j.py, tPy, k, dt); spring(j.lift, tLift, k, dt);
        const s = scale * (0.9 + ip * 0.1) * (1 - re * re * 0.05) * (1 + j.lift.x);
        j.it.style.transform = `translate(${(xs - u / 2 + j.px.x).toFixed(2)}px, ${(oy + j.py.x).toFixed(2)}px) rotate(${(rot + j.lean.x).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        j.it.style.opacity = `${ip}`;
        j.it.style.filter = `brightness(${(B_MIN + mid * (B_MAX - B_MIN)).toFixed(3)}) blur(${(Math.min(G <= 480 ? BLUR / 2 : BLUR, far * far) + re * re * 3.2).toFixed(2)}px)`;
        j.it.classList.toggle("is-center", far < 0.5);
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUpCapture, true);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick, true);
      items.forEach((it) => { it.style.transform = it.style.opacity = it.style.filter = ""; it.classList.remove("is-center"); });
    };
  });
})();
