// Jam jar carousel — the original HomeHero formula carried over as is.
// Wheel value (x1.15) and drag (x1.5, inertia x190 on release) are set as targets, and it follows with exponential damping (2.3, 11 while dragging). No document scroll.
// Bottle spacing = Screen width/4 × .92, Width = Screen width/4 × .5358 × 1.15 (phone /3 ×1.15·.73), .55→1.35 times larger and brightness .7→1.1 toward the center, blurrier the farther away (max 4px).
// Wave rotation sin(position/3 spacing)×18°, letters around the disc follow wheel value × −.012° (phone −.03°). Bottles near the cursor are pulled in by Gaussian weight and tilt (spring 70 · damping 9).
(() => {
  const AG = window.AG;
  const root = document.querySelector("[data-jar]");
  const wrap = root.querySelector("[data-jar-wrap]");
  const track = root.querySelector("[data-jar-track]");

  track.innerHTML = AG.PRODUCTS.map((p, i) =>
    `<a class="jar__item" href="detail.html" data-jar-item data-i="${i}" data-label="Product cutout · glass bottle front view, with cap · transparent background 630:1013" aria-label="${p.name}">${AG.jarLiveHTML(p)}</a>`
  ).join("");
  const els = [...track.querySelectorAll("[data-jar-item]")];
  const D = els.length;

  const WAVE = 18, RATIO = 1013 / 630, OFFS = [-0.053, 0.043, -0.024, 0.057, -0.048, 0.029, -0.038, 0.053];
  const SPIN = 2, DWELL = 260, FAST = 6, CENTER_TOL = 1.4;
  const S_MIN = 0.55, S_MAX = 1.35, S_EDGE = 0.1, B_MIN = 0.7, B_MAX = 1.1;
  const BLUR_D = 4, BLUR_M = 2, INTRO = 1150, INTRO_Y = 56, INTRO_S = 0.9;
  const K_WHEEL = 1.15, K_DRAG = 1.5, FLING = 190, FLING_MAX = 3.5, V_MAX = 2400;
  const LEAN_V = 6, BLUR_V_D = 3.2, BLUR_V_M = 1.6, SHRINK_V = 0.05, SPREAD = 0.55, SPREAD_W = 0.16;
  const STIFF = 70, DAMP = 9, STIFF_VAR = 0.3, TURN_V = 38, TURN_P = 30, P_FLOOR = 0.3, LEAN_P = 5, LIFT_P = 0.05, PULL_R = 1.6, PULL = 16, PARA = 26;
  const ease3 = (t) => 1 - (1 - t) ** 3;
  const quint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
  const spring = (s, target, k, dt) => {
    s.v += ((target - s.value) * k - s.v * DAMP) * dt;
    s.value += s.v * dt;
    if (Math.abs(s.v) < 0.001 && Math.abs(target - s.value) < 0.001) { s.value = target; s.v = 0; }
  };
  const fine = AG.fine;

  let Z, N, u, R, F, Y, J, T0, Y0, cos, sin;
  const layout = () => {
    const w = innerWidth, h = innerHeight, m = w <= 480, t = !m && w <= 1024;
    Z = w / (m || t ? 3 : 4);
    N = Z * (m ? 1.15 : t ? 1.265 : 0.92);
    u = Z * (m ? 0.73 : t ? 0.7875 : 0.5358) * 1.15;
    R = u * RATIO;
    if (R > h * 0.72) { R = h * 0.72; u = R / RATIO; }
    F = D * N; Y = 3 * N; J = u * 2;
    root.style.setProperty("--jar-item-w", `${u}px`);
    root.style.setProperty("--jar-item-h", `${R}px`);
    root.style.setProperty("--jar-marquee-h", `${Math.min(R * 1.35, h * 0.95)}px`);
    const a = (parseFloat(getComputedStyle(root).getPropertyValue("--jar-marquee-angle")) || 0) * Math.PI / 180;
    cos = Math.cos(a); sin = Math.sin(a);
    const r0 = root.getBoundingClientRect(), r1 = track.getBoundingClientRect();
    T0 = r1.left + r1.width / 2 - r0.left; Y0 = r1.top + r1.height / 2 - r0.top;
  };
  layout();

  const st = () => ({ value: 0, v: 0 });
  const jars = els.map((el, i) => {
    const j = { el, label: AG.jarLabel(el, AG.PRODUCTS[i]), offset: AG.JAR_FRONT, i, over: false, queued: false, enter: -1, dwell: -1, spinAt: -1, delay: 0, turnShown: NaN,
      turn: st(), lean: st(), lift: st(), px: st(), py: st() };
    el.style.opacity = "0";
    el.addEventListener("pointerenter", () => { if (!fine()) return; j.over = true; j.queued = true; j.enter = performance.now(); });
    el.addEventListener("pointerleave", () => { j.over = false; j.queued = false; });
    return j;
  });
  const posOf = (i, H) => { let x = (i * N + u / 2 + H + J) % F; if (x < 0) x += F; return x - J; };

  let target = 0, H = 0, vel = 0, last = performance.now(), fastAt = -1, introAt = -1;
  let dragging = false, moved = false, pid = -1, lastX = 0, downX = 0, dv = 0, lastT = 0;
  let hover = false, mx = 0, my = 0, pxS = 0, pyS = 0, P = 0, alive = true;
  const born = performance.now();

  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    target -= (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * K_WHEEL;
  }, { passive: false });
  wrap.addEventListener("pointerdown", (e) => { dragging = true; pid = e.pointerId; moved = false; lastX = downX = e.clientX; dv = 0; lastT = e.timeStamp; });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pid) return;
    if (!moved) {
      if (Math.abs(e.clientX - downX) <= 6) return;
      try { wrap.setPointerCapture(e.pointerId); } catch { return; }
      moved = true; lastX = e.clientX; lastT = e.timeStamp; return;
    }
    const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT);
    dv = dv * 0.72 + (dx / dt) * 0.28; lastX = e.clientX; lastT = e.timeStamp;
    target += dx * K_DRAG;
  });
  const up = (e) => {
    if (pid !== -1 && e.pointerId !== pid) return;
    if (moved) {
      try { wrap.releasePointerCapture(e.pointerId); } catch {}
      target += Math.max(-FLING_MAX, Math.min(FLING_MAX, dv)) * K_DRAG * FLING;
      wrap.dataset.dragged = "1";
      setTimeout(() => delete wrap.dataset.dragged, 0);
    }
    dragging = false; moved = false; pid = -1; dv = 0;
  };
  wrap.addEventListener("pointerup", up);
  wrap.addEventListener("pointercancel", up);
  root.addEventListener("pointermove", (e) => { if (e.pointerType !== "touch") { hover = true; mx = e.clientX; my = e.clientY; } }, { passive: true });
  root.addEventListener("pointerleave", () => (hover = false));
  addEventListener("resize", layout);

  // Bottles enter in order starting from those on screen (original gap 0 — they enter together)
  AG.onIntro(() => {
    introAt = performance.now();
    root.dataset.ready = "true";
  });

  const frame = (now) => {
    if (!alive) return;
    const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000)); last = now;
    const motion = !AG.reduced, pointerOn = motion && hover && fine();
    let lx = 0, ly = 0;
    if (pointerOn || P > 0) {
      const r = root.getBoundingClientRect();
      lx = mx - r.left; ly = my - r.top;
      if (pointerOn) {
        const k = 1 - Math.exp(-4 * dt);
        pxS += (Math.max(-1, Math.min(1, (lx / r.width) * 2 - 1)) - pxS) * k;
        pyS += (Math.max(-1, Math.min(1, (ly / r.height) * 2 - 1)) - pyS) * k;
      }
    }
    P += ((pointerOn ? 1 : 0) - P) * (1 - Math.exp(-3 * dt));
    if (!pointerOn && P < 0.001) P = 0;
    const gx = pxS * P, gy = pyS * P;
    root.style.setProperty("--jar-parallax-x", gx.toFixed(4));
    root.style.setProperty("--jar-parallax-y", gy.toFixed(4));

    const prev = H;
    H += (target - H) * (1 - Math.exp(-(moved ? 11 : 2.3) * dt));
    if (Math.abs(target - H) < 0.05) H = target;
    vel = dt > 0 ? (H - prev) / dt : 0;
    const G = innerWidth, mob = G <= 480;
    root.style.setProperty("--jar-circle-rotation", `${H * (mob ? -0.03 : -0.012)}deg`);

    const sp = Math.abs(vel);
    if (moved || sp > FAST) fastAt = now;
    const calm = !moved && sp <= N * CENTER_TOL;
    const re = Math.min(1, sp / V_MAX), re2 = re * re;
    const leanV = -Math.sign(vel) * re * LEAN_V, shrink = 1 - re2 * SHRINK_V, blurV = re2 * (mob ? BLUR_V_M : BLUR_V_D);

    const iS = ease3(Math.min(1, Math.max(0, now - born) / INTRO));
    root.style.setProperty("--jar-shape-intro-opacity", `${iS}`);
    root.style.setProperty("--jar-shape-intro-y", `${(1 - iS) * INTRO_Y * 0.42}px`);
    root.style.setProperty("--jar-badge-intro-opacity", `${iS}`);
    root.style.setProperty("--jar-badge-intro-y", `${(1 - iS) * INTRO_Y * 0.22}px`);
    root.style.setProperty("--jar-badge-intro-rotation", `${(1 - iS) * -18}deg`);

    jars.forEach((j, i) => {
      const x = posOf(i, H), q = x / G;
      const xs = (q + SPREAD * SPREAD_W * Math.tanh((q - 0.5) / SPREAD_W)) * G;
      const mid = q >= 0 && q <= 1 ? Math.sin(q * Math.PI) : 0;
      const far = Math.abs(q - 0.5) / (N / G);
      const scale = (S_MIN + mid * (S_MAX - S_MIN)) * (1 - S_EDGE * Math.min(1, far));
      const bright = B_MIN + mid * (B_MAX - B_MIN);
      const ip = introAt < 0 ? 0 : ease3(Math.min(1, Math.max(0, now - introAt - j.delay) / INTRO));
      const iy = (1 - ip) * INTRO_Y, is = INTRO_S + ip * (1 - INTRO_S);
      const rot = Math.sin(((i * N + H) / Y) * Math.PI * 2) * WAVE;
      const oy = OFFS[i % OFFS.length] * R;
      const ex = xs - G / 2, ey = oy + iy;
      const cx = T0 + ex * cos - ey * sin, cy = Y0 + ex * sin + ey * cos;
      let tTurn = motion ? -Math.max(-1, Math.min(1, vel / V_MAX)) * TURN_V : 0, tLean = leanV, tLift = 0, tPx = 0, tPy = 0;
      if (P > 0) {
        const dx = lx - cx, dy = ly - cy;
        const ax = dx * cos + dy * sin, ay = -dx * sin + dy * cos;
        const W = u * PULL_R, g = Math.exp(-((ax * ax + ay * ay) / (W * W))), th = Math.tanh(ax / W);
        const k = scale / S_MAX;
        tTurn += th * TURN_P * P * (P_FLOOR + (1 - P_FLOOR) * g);
        tLean += th * LEAN_P * g * P;
        tLift = LIFT_P * g * P;
        tPx = th * PULL * g * P + (gx * cos + gy * sin) * PARA * k;
        tPy = Math.tanh(ay / (R * 0.8)) * PULL * g * P + (-gx * sin + gy * cos) * PARA * k;
      }
      const kk = STIFF * (1 - STIFF_VAR / 2 + STIFF_VAR * ((i * 0.618034) % 1));
      spring(j.turn, tTurn, kk, dt); spring(j.lean, tLean, kk, dt); spring(j.lift, tLift, kk, dt); spring(j.px, tPx, kk, dt); spring(j.py, tPy, kk, dt);
      const s = scale * is * shrink * (1 + j.lift.value);
      j.el.style.transform = `translate(${(xs - u / 2 + j.px.value).toFixed(2)}px, ${(oy + iy + j.py.value).toFixed(2)}px) rotate(${(rot + j.lean.value).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      j.el.style.opacity = `${ip}`;
      const blur = Math.min(mob ? BLUR_M : BLUR_D, far * far) + blurV;
      j.el.style.filter = `brightness(${bright.toFixed(3)}) blur(${blur.toFixed(2)}px)`;
      j.el.classList.toggle("is-center", far < 0.5);

      // Pausing briefly near the center makes the label spin once (2s easeInOutQuint)
      let spin = 0;
      if (!calm || !j.over) j.dwell = -1; else if (j.dwell < 0) j.dwell = now;
      if (fine() && j.over && j.queued && j.spinAt < 0 && j.dwell >= 0 && (j.enter > fastAt || now - j.dwell >= DWELL)) { j.spinAt = now; j.queued = false; }
      if (j.spinAt >= 0) {
        const e = (now - j.spinAt) / 1000;
        if (e >= SPIN) j.spinAt = -1; else spin = quint(e / SPIN);
      }
      j.spin = spin;
      // Label slot (wheel) = Front 182° − one full spin − one spin on entering − tilt drag (cut off at 1/2000 turn). Only bottles on screen are redrawn
      j.offset = AG.JAR_FRONT - spin - ip - Math.round(j.turn.value / 360 / 0.0005) * 0.0005;
      if (xs + u > 0 && xs - u < G) j.label.render(j.offset);
    });
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // Cursor pill only over the center bottle
  els.forEach((el) => {
    el.addEventListener("pointerenter", () => { if (el.classList.contains("is-center")) AG.cursor.show("Go to products"); });
    el.addEventListener("pointermove", () => { if (el.classList.contains("is-center")) AG.cursor.show("Go to products"); else AG.cursor.hide(); });
    el.addEventListener("pointerleave", () => AG.cursor.hide());
  });

  // On press: the rest vanish in .42s, and the chosen bottle stands upright and flies in 2s to the bottle spot on the product page (center bottom, 1.25x)
  track.addEventListener("click", (e) => {
    const a = e.target.closest("[data-jar-item]");
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    if (wrap.dataset.dragged || root.classList.contains("is-flying-out")) return;
    const j = jars[+a.dataset.i];
    sessionStorage.setItem("ag-jar", a.dataset.i);
    if (AG.reduced) { AG.go("detail.html", "jar"); return; }
    AG.cursor.hide();
    const r = a.getBoundingClientRect();
    let m = new DOMMatrixReadOnly(), n = a;
    while (n) { const t = getComputedStyle(n).transform; if (t && t !== "none") m = new DOMMatrixReadOnly(t).multiply(m); n = n.parentElement; }
    const from = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, rot: Math.atan2(m.b, m.a) * 180 / Math.PI, s: Math.hypot(m.a, m.b) || 1, h: a.offsetHeight };
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:50%;bottom:var(--ph-jar-bottom);width:var(--ph-jar-w);aspect-ratio:630/1013;transform:translateX(-50%) scale(var(--ph-jar-scale-from));visibility:hidden;pointer-events:none";
    document.body.append(probe);
    const pr = probe.getBoundingClientRect();
    const to = { cx: pr.left + pr.width / 2, cy: pr.top + pr.height / 2, w: probe.offsetWidth, h: probe.offsetHeight, s: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ph-jar-scale-from")) || 1.25 };
    probe.remove();
    const fly = document.createElement("div");
    fly.className = "jar-flight";
    fly.style.cssText = `left:${from.cx - to.w / 2}px;top:${from.cy - to.h / 2}px;width:${to.w}px;height:${to.h}px`;
    fly.innerHTML = AG.jarLiveHTML(AG.PRODUCTS[j.i]);
    document.body.append(fly);
    const flyLabel = AG.jarLabel(fly, AG.PRODUCTS[j.i]), from0 = j.offset;
    a.style.visibility = "hidden";
    root.classList.add("is-flying-out");
    const st0 = { cx: from.cx, cy: from.cy, s: (from.h * from.s) / to.h, rot: from.rot, k: 0 };
    gsap.to(st0, {
      cx: to.cx, cy: to.cy, s: to.s, rot: 0, k: 1, duration: 2, ease: "soft",
      onUpdate() {
        fly.style.transform = `translate3d(${st0.cx - from.cx}px, ${st0.cy - from.cy}px, 0) rotate(${st0.rot}deg) scale(${st0.s})`;
        flyLabel.render(from0 - quint(st0.k));
      },
      onComplete() { alive = false; AG.go("detail.html", "jar"); },
    });
  });
  track.addEventListener("dragstart", (e) => e.preventDefault());
})();
