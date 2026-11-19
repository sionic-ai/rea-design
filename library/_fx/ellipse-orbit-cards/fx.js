// Photo cards circle an ellipse in the middle of the panel — instead of perspective, the lower (front) ones are bigger and darker, the upper (back) ones smaller and lighter (size .76~1 · opacity .55~1).
// Spaces them evenly by the visible length, the perimeter divided by the size at that spot, so small back cards sit tight and large front cards get more room (reference hero).
(() => {
  const TAU = Math.PI * 2;
  const depth = (a) => (Math.sin(a) + 1) / 2;
  const size = (a) => 0.76 + 0.24 * depth(a);
  const mix = (a, b, t) => a + (b - a) * t;

  // Fit ellipse and card width to the board size and the center space to clear (clear) — narrow the width over 8 corrections like the original
  function fit(W, H, n, clear, opts) {
    const narrow = W < 768;
    const nn = narrow ? W : Math.min(W, 2.1 * H);
    const oo = narrow ? H : Math.min(H, nn / 1.25);
    const ss = narrow ? Math.max(nn, oo) : nn;
    const f = narrow ? opts.widthNarrow : opts.width;
    const lim = 0.78 * (oo / 2 - 20 - 28 - clear.h / 2);
    const side = narrow ? Infinity : ss / 2 - 20 - 28 - clear.w / 2;
    let d = Math.min(nn * f, 0.15 * oo);
    let shape = null;
    for (let k = 0; k <= 8; k++) {
      const A = ss / 2 - 20 - d / 2, B = oo / 2 - 20 - d / opts.ratio / 2;
      const table = new Float64Array(2049);
      let per = 0, px = A, py = 0;
      for (let i = 1; i <= 2048; i++) {
        const t = (i / 2048) * TAU, x = A * Math.cos(t), y = B * Math.sin(t), seg = Math.hypot(x - px, y - py);
        table[i] = table[i - 1] + seg / size(t);
        per += seg; px = x; py = y;
      }
      const wper = table[2048];
      const crowd = (1.22 * n * d) / wper;
      const clearY = (28 + clear.h / 2 + d / opts.ratio / 2) / B;
      const clearX = narrow ? 0 : (28 + clear.w / 2 + d / 2) / A;
      const j = Math.min(1, Math.max(narrow ? opts.spread : opts.spreadWide, clearY, clearX, crowd));
      if (k === 8) { if (crowd > 1) d = wper / (1.22 * n); }
      else d = (d + Math.max(44, Math.min(wper / (1.22 * n), nn * f * 1.8, 0.26 * oo, lim, side))) / 2;
      shape = {
        a: A * j, b: B * j, width: d, perimeter: per * j,
        angleAt(u) {
          const target = (((u % 1) + 1) % 1) * wper;
          let lo = 1, hi = 2048;
          while (lo < hi) { const m = (lo + hi) >> 1; table[m] < target ? (lo = m + 1) : (hi = m); }
          const span = table[lo] - table[lo - 1];
          return ((lo - 1 + (span > 0 ? (target - table[lo - 1]) / span : 0)) / 2048) * TAU;
        },
      };
    }
    return shape;
  }

  kfFx.register("ellipse-orbit-cards", (el, { options, reduce, hover }) => {
    const track = el.querySelector('[data-fx-part="track"]') || el;
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const n = cards.length;
    if (!n) return;
    const clearEl = el.querySelector('[data-fx-part="clear"]');
    const opts = {
      period: +(options.period ?? 90) || 90,
      ratio: +(options.ratio ?? 0.78) || 0.78,
      width: +(options.width ?? 0.085) || 0.085,
      widthNarrow: +(options["width-narrow"] ?? 0.22) || 0.22,
      spreadWide: +(options.spread ?? 0.7),
      spread: +(options["spread-narrow"] ?? 0.97),
      tiltX: +(options["tilt-x"] ?? 28),
      tiltY: +(options["tilt-y"] ?? 18),
      stop: options.hold !== "none",
      intro: options.intro === "burst",
    };
    const P = 1 / opts.period;
    const ease = kfFx.ease("0.5,1,0.89,1", "power2.out");
    let shape, base = 160, scale = 1, centerY = 0, below = 0;
    const measure = () => {
      const cs = getComputedStyle(el);
      const pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
      const W = el.clientWidth, H = el.clientHeight - pt - pb;
      shape = fit(W, H, n, { w: clearEl?.offsetWidth ?? 0, h: clearEl?.offsetHeight ?? 0 }, opts);
      base = Math.min(W < 768 ? 0.56 * W : 0.21 * W, 340);
      scale = shape.width / base;
      centerY = (pt - pb) / 2;
      below = el.clientHeight / 2 + (base / opts.ratio) * 0.432;
      el.style.setProperty("--fx-card-w", `${base}px`);
      el.style.setProperty("--fx-card-h", `${base / opts.ratio}px`);
      el.style.setProperty("--fx-center-y", `${centerY}px`);
    };
    measure();

    // Entering state — p is stacked position (0) → ring position (1), v is visibility, k is the share by which the first section rises from below
    const state = { offset: 0, velocity: 0, speed: 1, scroll: 0, dragging: false, visible: true };
    const prog = cards.map(() => ({ p: 1, v: 1 }));
    const rise = { k: 0 };
    const z = new Array(n).fill(-1);
    const place = () => {
      for (let i = 0; i < n; i++) {
        const ang = shape.angleAt(state.offset + i / n), dv = depth(ang);
        let x = shape.a * Math.cos(ang), y = shape.b * Math.sin(ang), s = scale * size(ang), r = 0, o = 0.55 + 0.45 * dv, zi = Math.round(20 * dv);
        const { p, v } = prog[i];
        if (p < 1) {
          const first = i === 0;
          x = mix(0, x, p);
          y = mix(-centerY + (first ? rise.k * below : 0), y, p);
          s = mix(0.72 * (first ? 1 : 0.96), s, p);
          r = mix(first ? 8 * rise.k : 0, 0, p);
          o = mix(1, o, p);
          if (first) zi = 40;
        }
        const c = cards[i];
        c.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
        c.style.opacity = (v * o).toFixed(3);
        if (zi !== z[i]) { c.style.zIndex = String(zi); z[i] = zi; }
      }
    };

    el.classList.add("fx-orbit-on");
    const tweens = [];
    if (reduce) { place(); return () => { el.classList.remove("fx-orbit-on"); cards.forEach((c) => c.removeAttribute("style")); }; }

    if (opts.intro) {
      state.speed = 0;
      prog.forEach((q) => { q.p = 0; q.v = 0; });
      rise.k = 1;
    } else {
      // Lit in shuffled order, each 40ms later, at 1.4s, with a slight push and spin the first time
      state.velocity = 0.1;
      gsap.utils.shuffle(cards.map((_, i) => i)).forEach((ci, k) => {
        const face = cards[ci].querySelector('[data-fx-part="face"]') || cards[ci];
        tweens.push(gsap.fromTo(face, { opacity: 0 }, { opacity: 1, duration: 1.4, delay: 0.04 * k, ease, clearProps: "opacity" }));
      });
    }
    place();

    const onCard = () => {
      prog[0].v = 1;
      tweens.push(gsap.to(rise, { k: 0, duration: 1.2, ease: "expo.out" }));
    };
    const onBurst = () => {
      prog.forEach((q) => (q.v = 1));
      tweens.push(gsap.to(prog.slice(1), { p: 1, duration: 1.6, ease: "expo.inOut", stagger: { each: 0.012, from: "random" } }));
      tweens.push(gsap.to(prog[0], { p: 1, duration: 1.6, ease: "expo.inOut", delay: 0.25 }));
      tweens.push(gsap.to(state, { speed: 1, duration: 2, ease: "sine.inOut", delay: 0.6 }));
      wake();
    };
    el.addEventListener("fx:card", onCard);
    el.addEventListener("fx:burst", onBurst);

    // Interaction — stops in .6s over a card and spins again in 1.2s when it leaves. Dragging rotates by the circumference length and releasing makes it glide.
    const par = { x: 0, y: 0, tx: 0, ty: 0 };
    const near = (a, b, t, eps) => { const v = a + (b - a) * t; return Math.abs(b - v) < eps ? b : v; };
    let running = false, lastY = scrollY;
    const frame = (_, dms) => {
      if (!state.visible) return sleep();
      const dt = Math.min(dms, 50) / 1000, k = (x) => 1 - Math.pow(1 - x, 60 * dt);
      const sy = scrollY, sv = dt > 0 ? (sy - lastY) / (dt * 60) : 0;
      lastY = sy;
      let target = 0.3 * Math.max(-1, Math.min(1, sv / 30));
      if (Math.abs(target) < 1e-4) target = 0;
      state.scroll = near(state.scroll, target, k(0.08), 1e-5);
      const ox = par.x, oy = par.y;
      par.x = near(par.x, par.tx, k(0.05), 0.01);
      par.y = near(par.y, par.ty, k(0.05), 0.01);
      if ((par.x !== ox || par.y !== oy) && track !== el) track.style.transform = `translate3d(${(0.9 * par.x).toFixed(2)}px, ${(0.9 * par.y).toFixed(2)}px, 0)`;
      if (!state.dragging) { state.velocity *= Math.pow(0.08, dt); if (Math.abs(state.velocity) < 1e-5) state.velocity = 0; }
      const rate = state.dragging ? 0 : state.speed + (state.velocity + state.scroll) / P;
      state.offset += rate * P * dt;
      place();
    };
    const sleep = () => { gsap.ticker.remove(frame); running = false; };
    const wake = () => { if (!running && state.visible) { running = true; lastY = scrollY; gsap.ticker.add(frame); } };
    wake();

    const speedTo = (s, d, e) => { if (!el.closest(".is-intro")) { gsap.to(state, { speed: s, duration: d, ease: e, overwrite: true }); wake(); } };
    const pause = () => opts.stop && speedTo(0, 0.6, "power2.out");
    const resume = () => opts.stop && speedTo(1, 1.2, "power2.inOut");
    cards.forEach((c) => { c.addEventListener("pointerenter", pause); c.addEventListener("pointerleave", resume); });
    let gx = 0, gt = 0, moved = 0;
    const down = (e) => { if (el.closest(".is-intro")) return; wake(); state.dragging = true; state.velocity = 0; gx = e.clientX; gt = performance.now(); moved = 0; };
    const move = (e) => {
      if (e.pointerType === "mouse" && hover) {
        const b = el.getBoundingClientRect();
        par.tx = ((e.clientX - b.left) / b.width - 0.5) * opts.tiltX;
        par.ty = ((e.clientY - b.top) / b.height - 0.5) * opts.tiltY;
        wake();
      }
      if (!state.dragging) return;
      const now = performance.now(), dx = e.clientX - gx, du = dx / shape.perimeter;
      state.offset += du;
      state.velocity = (du / Math.max(now - gt, 1)) * 500;
      moved += Math.abs(dx); gx = e.clientX; gt = now;
    };
    const up = () => (state.dragging = false);
    const click = (e) => { if (moved > 6 || el.closest(".is-intro")) { e.preventDefault(); e.stopPropagation(); } };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    el.addEventListener("click", click, true);
    const io = new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; state.visible ? wake() : sleep(); });
    io.observe(el);
    const ro = new ResizeObserver(() => { measure(); place(); });
    ro.observe(el);
    if (clearEl) ro.observe(clearEl);

    return () => {
      sleep();
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(state);
      io.disconnect(); ro.disconnect();
      el.removeEventListener("fx:card", onCard);
      el.removeEventListener("fx:burst", onBurst);
      cards.forEach((c) => { c.removeEventListener("pointerenter", pause); c.removeEventListener("pointerleave", resume); c.removeAttribute("style"); });
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      el.removeEventListener("click", click, true);
      if (track !== el) track.style.transform = "";
      el.classList.remove("fx-orbit-on");
    };
  });
})();
