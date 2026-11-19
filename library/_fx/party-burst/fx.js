(() => {
  // Original Brand BirthdayParty: when the panel is visible, confetti fires like cannons from both bottom screen edges (3% · 97%), 64 pieces each (38 below width 600) at 1100~2000px/s, and
  // Floats three balloons. While visible, a piece falls from the top every .07~.13s and a balloon rises every 1.4~2.4s (2.6~3.8s when pieces exceed 200), up to 7.
  // Pieces: gravity 900×.45 · drag e^(−2.1~2.8·dt) · 55px side sway while falling · flipping. Balloons: rise at 85~125px/s with −14/s² acceleration, 1.1 Hz sway.
  // When the mouse touches a balloon it pops and 28 pieces scatter at 220~620px/s (two in three share the balloon color). It won’t pop again within 1.4s.
  kfFx.register("party-burst", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const cv = document.createElement("canvas");
    cv.className = "fx-party-burst__canvas";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.appendChild(probe);
    const col = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
    const ink = col("--fx-party-1"), acc = col("--fx-party-2"), cy = col("--fx-party-3"), soft = col("--fx-party-4"), pk = col("--fx-party-5"), gd = col("--fx-party-6");
    const COL = [ink, ink, ink, acc, acc, acc, cy, cy, soft, pk, gd];
    const BAL = [[acc, cy], [soft, ink], [cy, ink], [pk, soft], [gd, soft]];
    const count = +(options.count || 64), maxBalloons = +(options.balloons ?? 7), gravity = +(options.gravity ?? 900), trickle = +(options.trickle ?? 1);
    const O = (a, b) => a + Math.random() * (b - a);
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const bits = [], balloons = [];
    let W = 0, H = 0, raf = 0, last = 0, clock = 0, nextBit = 0, nextBalloon = 0, first = true, active = false, lastBurst = -1e9;
    const size = () => { const r = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.max(1, W * r); cv.height = Math.max(1, H * r); ctx.setTransform(r, 0, 0, r, 0, 0); };
    size();
    addEventListener("resize", size);
    const bit = (x, y, vx, vy) => { if (bits.length >= 520) return; const i = Math.random(); bits.push({ x, y, vx, vy, rot: O(0, 6.28), vr: O(-7, 7), flip: O(0, 6.28), vflip: O(6, 14), w: i < 0.18 ? 5 : i < 0.32 ? O(3, 4) : O(7, 11), h: i < 0.18 ? 5 : i < 0.32 ? O(14, 20) : O(4, 6), dot: i < 0.18, color: pick(COL), drag: O(2.1, 2.8), wob: O(0, 6.28) }); };
    const balloon = (e = 0) => { if (balloons.length >= maxBalloons) return; const left = Math.random() < 0.5, r = O(20, 30), [body, shine] = pick(BAL); balloons.push({ x: W * (left ? O(0.05, 0.27) : O(0.73, 0.95)), y: H + r * 1.4 + e * 110, vy: -O(85, 125), r, body, shine, ph: O(0, 6.28), t: 0 }); };
    function burst() {
      const now = performance.now();
      if (now - lastBurst < 1400) return;
      lastBurst = now;
      const n = Math.round((W < 600 ? Math.round(count * 0.6) : count) * (first ? 1 : 0.4));
      const k = Math.max(0.6, Math.min(1.4, H / 720));
      for (const side of [-1, 1]) {
        const ox = side < 0 ? W * 0.03 : W * 0.97;
        for (let i = 0; i < n; i++) { const a = -Math.PI / 2 - side * O(0.18, 0.62), v = O(1100, 2000) * k; bit(ox, H + 8, Math.cos(a) * v, Math.sin(a) * v); }
      }
      balloon(0);
      if (first) { balloon(0.6); balloon(1.3); }
      first = false;
      nextBalloon = clock + 1.6;
    }
    function pop(i) {
      const b = balloons[i];
      balloons.splice(i, 1);
      for (let k = 0; k < 28; k++) { const a = O(0, 6.28), v = O(220, 620); bit(b.x + Math.cos(a) * b.r * 0.6, b.y + Math.sin(a) * b.r * 0.7, Math.cos(a) * v, Math.sin(a) * v - 120); if (k % 3 && bits.length) bits[bits.length - 1].color = b.body; }
    }
    const move = (e) => { if (!raf) return; for (let i = balloons.length - 1; i >= 0; i--) { const b = balloons[i], dx = (e.clientX - b.x) / b.r, dy = (e.clientY - b.y) / (b.r * 1.18); if (dx * dx + dy * dy <= 1) { pop(i); return; } } };
    if (hover) addEventListener("pointermove", move, { passive: true });
    function step(dt) {
      clock += dt;
      if (active && trickle) {
        if (clock >= nextBit) { nextBit = clock + O(0.07, 0.13); bit(O(0, W), -12, O(-30, 30), O(30, 90)); }
        if (clock >= nextBalloon) { nextBalloon = clock + (bits.length < 200 ? O(2.6, 3.8) : O(1.4, 2.4)); balloon(); }
      }
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i], k = Math.exp(-b.drag * dt);
        b.vx *= k; b.vy = b.vy * k + gravity * dt * 0.45;
        const sway = b.vy > 0 ? Math.sin(clock * 3.2 + b.wob) * 55 : 0;
        b.x += (b.vx + sway) * dt; b.y += b.vy * dt; b.rot += b.vr * dt; b.flip += b.vflip * dt;
        if (b.y > H + 40 || b.x < -80 || b.x > W + 80) bits.splice(i, 1);
      }
      for (let i = balloons.length - 1; i >= 0; i--) { const b = balloons[i]; b.t += dt; b.vy -= 14 * dt; b.y += b.vy * dt; b.x += Math.sin(b.t * 1.1 + b.ph) * 16 * dt; if (b.y + b.r * 5 < 0) balloons.splice(i, 1); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const b of balloons) {
        const rx = b.r, ry = b.r * 1.18, sw = Math.sin(b.t * 1.6 + b.ph) * rx * 0.5;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.sin(b.t * 1.1 + b.ph) * 0.09);
        ctx.beginPath(); ctx.moveTo(0, ry + 4); ctx.bezierCurveTo(sw, ry + rx * 1.2, -sw, ry + rx * 2.2, sw * 0.4, ry + rx * 3.4);
        ctx.globalAlpha = 0.35; ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(0, ry - 1); ctx.lineTo(-3.5, ry + 5); ctx.lineTo(3.5, ry + 5); ctx.closePath(); ctx.fillStyle = b.body; ctx.fill();
        const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, rx * 0.08, 0, 0, ry * 1.1);
        g.addColorStop(0, b.shine); g.addColorStop(0.45, b.body); g.addColorStop(1, b.body);
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.fillStyle = g; ctx.globalAlpha = 0.95; ctx.fill();
        ctx.beginPath(); ctx.ellipse(-rx * 0.38, -ry * 0.42, rx * 0.12, ry * 0.24, -0.5, 0, 6.283); ctx.fillStyle = ink; ctx.globalAlpha = 0.55; ctx.fill();
        ctx.restore();
      }
      for (const b of bits) {
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        const f = Math.cos(b.flip); ctx.scale(1, f); ctx.globalAlpha = 0.55 + 0.45 * Math.abs(f); ctx.fillStyle = b.color;
        if (b.dot) { ctx.beginPath(); ctx.arc(0, 0, b.w / 2, 0, 6.283); ctx.fill(); } else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
    }
    function frame(now) {
      if (!last) last = now;
      const dt = Math.min(0.033, Math.max(1, now - last) / 1000);
      last = now;
      step(dt); draw();
      if (active || bits.length || balloons.length) raf = requestAnimationFrame(frame);
      else { raf = 0; ctx.clearRect(0, 0, W, H); cv.style.display = "none"; }
    }
    const run = () => { if (raf) return; cv.style.display = "block"; last = 0; raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !active) { active = true; burst(); run(); }
      else if (!e.isIntersecting) active = false;
    }, { threshold: +(options.threshold ?? 0.25) });
    io.observe(el);
    const fire = () => { burst(); run(); };
    el.addEventListener("fx:burst", fire);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", size);
      removeEventListener("pointermove", move);
      el.removeEventListener("fx:burst", fire);
      cv.remove();
      probe.remove();
    };
  });
})();
