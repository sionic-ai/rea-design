// Round panels float without gravity, bumping into the panel walls and each other — restitution 0.9, friction 0.04, drag 0.025, rotational drag 0.18, fixed 1/120s step, 4 solver iterations.
// Starts from the four corners (12% inset) at short side × 0.36 speed, and if it slows down or hugs an axis too closely it revives over 2s at short side × 0.3 speed and 0.3 tilt.
// On collision it squashes toward the side hit (max 7%, frequency 18 · damping 0.34) and returns, and from that spot 4~9 ink drops splash (0.5~0.75s, drag 2.8, short side downward × 0.06)
(() => {
  const P = {
    diameterLimit: 0.36, inset: 0.12, jitter: 0.06, speed: 0.36, speedVar: 0.1, minSpeed: 0.3, speedRecover: 2, minDir: 0.3, dirRecover: 2,
    restitution: 0.9, friction: 0.04, drag: 0.025, spinDrag: 0.18, step: 1 / 120, maxFrame: 0.05, passes: 4,
    squashLimit: 0.07, squashImpulse: 1.9, squashFreq: 18, squashDamp: 0.34, impactRef: 220, impactExp: 1.35, spin: 12,
    burst: { max: 48, countMin: 4, countMax: 9, minStrength: 0.12, cooldown: 0.18, lifeMin: 0.5, lifeMax: 0.75, speed: 0.4, radius: 0.0156, radiusMin: 5.6, radiusMax: 12.3, radiusVar: [0.5, 0.85], speedVar: [0.65, 1.35], minSpeedFactor: 0.5, opacity: 0.75, shrink: 0.55, stretch: 1.65, fadeOut: 0.35, drag: 2.8, gravity: 0.06, pairSpread: 0.75, wallSpread: 1.25 },
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  kfFx.register("float-bounce", (el, { options, reduce }) => {
    const balls = [...el.querySelectorAll('[data-fx-part="ball"]')];
    if (!balls.length || reduce) return;
    const mult = +(options.speed ?? 1), bursts = options.burst !== "false";
    const canvas = document.createElement("canvas");
    canvas.className = "fx-float-bounce";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const sprites = new Map();
    // Blob color is per panel color (default --kf-accent) — the computed color is read back as one canvas pixel, and the outer 22% is baked into a soft circle
    const sprite = (ball) => {
      const css = getComputedStyle(ball).getPropertyValue("--fx-burst").trim() || getComputedStyle(el).getPropertyValue("--fx-burst").trim();
      if (sprites.has(css)) return sprites.get(css);
      const probe = document.createElement("i");
      probe.style.color = css;
      el.append(probe);
      const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
      c.width = c.height = 64;
      x.fillStyle = getComputedStyle(probe).color;
      probe.remove();
      x.fillRect(0, 0, 1, 1);
      const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
      x.clearRect(0, 0, 1, 1);
      const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, `rgb(${r} ${g} ${b})`);
      for (let i = 0; i <= 8; i++) { const n = i / 8; grad.addColorStop(0.78 + 0.22 * n, `rgb(${r} ${g} ${b} / ${1 - n * n * (3 - 2 * n)})`); }
      x.fillStyle = grad; x.fillRect(0, 0, 64, 64);
      sprites.set(css, c);
      return c;
    };
    let W = 1, H = 1, bodies = [], drops = [], acc = 0, clock = 0, raf = 0, last = 0, on = false;
    const cool = new Map();
    const reset = () => {
      const short = Math.min(W, H), corners = [[P.inset, P.inset], [1 - P.inset, P.inset], [P.inset, 1 - P.inset], [1 - P.inset, 1 - P.inset]].sort(() => Math.random() - 0.5);
      const minA = Math.asin(P.minDir);
      bodies = balls.map((ball, i) => {
        ball.style.removeProperty("width");
        const r = Math.min(ball.offsetWidth, short * P.diameterLimit) / 2, [cx, cy] = corners[i % 4], j = () => rand(-1, 1) * P.jitter;
        const a = minA + Math.random() * (Math.PI / 2 - 2 * minA), sx = Math.random() < 0.5 ? -1 : 1, sy = Math.random() < 0.5 ? -1 : 1;
        const v = short * P.speed * mult * (1 + rand(-1, 1) * P.speedVar);
        return { ball, face: ball.firstElementChild, r, x: r + (W - 2 * r) * (cx + j()), y: r + (H - 2 * r) * (cy + j()), vx: Math.cos(a) * sx * v, vy: Math.sin(a) * sy * v, tx: Math.cos(a) * sx, ty: Math.sin(a) * sy, angle: 0, spin: rand(-1, 1) * P.spin, hitX: 0, hitY: 0, impact: 0, squash: 0, squashV: 0 };
      });
      drops = []; cool.clear(); acc = 0; clock = 0;
    };
    const emit = (key, x, y, nx, ny, speed, wall, b) => {
      const B = P.burst, short = Math.min(W, H), m = Math.min(1, speed / P.impactRef);
      if (!bursts || m < B.minStrength || (cool.get(key) ?? -Infinity) > clock) return;
      cool.set(key, clock + B.cooldown);
      const n = Math.round(B.countMin + (B.countMax - B.countMin) * m), base = Math.max(B.radiusMin, Math.min(B.radiusMax, short * B.radius)), dir = Math.atan2(ny, nx);
      for (let i = 0; i < n && drops.length < B.max; i++) {
        const a = (wall ? dir + Math.PI : dir + Math.PI / 2 + (i % 2) * Math.PI) + rand(-1, 1) * (wall ? B.wallSpread : B.pairSpread);
        const v = short * B.speed * (B.minSpeedFactor + m * (1 - B.minSpeedFactor)) * rand(B.speedVar[0], B.speedVar[1]);
        drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: base * rand(B.radiusVar[0], B.radiusVar[1]), life: rand(B.lifeMin, B.lifeMax), age: 0, img: sprite(b.ball) });
      }
    };
    const hit = (b, nx, ny, speed) => { b.hitX = nx; b.hitY = ny; b.impact = Math.min(1, speed / P.impactRef) ** P.impactExp; b.squashV = Math.min(P.squashImpulse, b.squashV + b.impact * P.squashImpulse); };
    const rub = (a, b, nx, ny, speed) => {
      const tx = -ny, ty = nx, ia = 1 / (a.r * a.r), ib = b ? 1 / (b.r * b.r) : 0, deg = Math.PI / 180;
      const slip = (a.vx - (b?.vx || 0)) * tx + (a.vy - (b?.vy || 0)) * ty + (a.spin * a.r + (b ? b.spin * b.r : 0)) * deg;
      const cap = P.friction * (((1 + P.restitution) * speed) / (ia + ib)), j = Math.max(-cap, Math.min(cap, -slip / (3 * (ia + ib))));
      a.vx += j * ia * tx; a.vy += j * ia * ty; a.spin += (2 * j * ia) / a.r / deg;
      if (b) { b.vx -= j * ib * tx; b.vy -= j * ib * ty; b.spin += (2 * j * ib) / b.r / deg; }
    };
    const walls = (b, i) => {
      let nx = 0, ny = 0, sp = 0;
      if (b.x < b.r) { b.x = b.r; if (b.vx < 0) { sp = -b.vx; b.vx *= -P.restitution; nx = -1; } } else if (b.x > W - b.r) { b.x = W - b.r; if (b.vx > 0) { sp = b.vx; b.vx *= -P.restitution; nx = 1; } }
      if (b.y < b.r) { b.y = b.r; if (b.vy < 0) { sp = Math.max(sp, -b.vy); b.vy *= -P.restitution; ny = -1; } } else if (b.y > H - b.r) { b.y = H - b.r; if (b.vy > 0) { sp = Math.max(sp, b.vy); b.vy *= -P.restitution; ny = 1; } }
      if (!nx && !ny) return;
      const l = Math.hypot(nx, ny);
      rub(b, null, nx / l, ny / l, sp); hit(b, nx, ny, sp);
      emit(`${i}:${nx}:${ny}`, b.x + (nx / l) * b.r, b.y + (ny / l) * b.r, nx / l, ny / l, sp, true, b);
    };
    const step = (dt) => {
      const short = Math.min(W, H), minV = short * P.minSpeed * mult, ks = 1 - Math.exp(-dt / P.speedRecover), kd = 1 - Math.exp(-dt / P.dirRecover);
      for (const b of bodies) {
        const v = Math.hypot(b.vx, b.vy);
        let cx = v > 0.001 ? b.vx / v : b.tx, cy = v > 0.001 ? b.vy / v : b.ty;
        const flat = Math.min(Math.abs(cx), Math.abs(cy)) < P.minDir;
        if (flat) {
          const gx = (Math.sign(cx) || Math.sign(W / 2 - b.x) || 1) * Math.max(Math.abs(cx), P.minDir), gy = (Math.sign(cy) || Math.sign(H / 2 - b.y) || 1) * Math.max(Math.abs(cy), P.minDir), gl = Math.hypot(gx, gy);
          cx += (gx / gl - cx) * kd; cy += (gy / gl - cy) * kd;
          const l = Math.hypot(cx, cy); cx /= l; cy /= l;
        }
        b.tx = cx; b.ty = cy;
        if (v >= minV && !flat) continue;
        const nv = v + Math.max(0, minV - v) * ks;
        b.vx = cx * nv; b.vy = cy * nv;
      }
      const B = P.burst, kdrag = Math.exp(-B.drag * dt);
      clock += dt;
      drops = drops.filter((d) => (d.age += dt) < d.life && ((d.vx *= kdrag), (d.vy = d.vy * kdrag + short * B.gravity * dt), (d.x += d.vx * dt), (d.y += d.vy * dt), true));
      bodies.forEach((b, i) => {
        b.impact = Math.max(0, b.impact - dt * P.squashFreq);
        b.squashV += (-(P.squashFreq ** 2) * b.squash - 2 * P.squashDamp * P.squashFreq * b.squashV) * dt;
        b.squash += b.squashV * dt;
        b.vx *= Math.exp(-P.drag * dt); b.vy *= Math.exp(-P.drag * dt); b.spin *= Math.exp(-P.spinDrag * dt);
        b.x += b.vx * dt; b.y += b.vy * dt; b.angle = (b.angle + b.spin * dt) % 360;
        walls(b, i);
      });
      for (let pass = 0; pass < P.passes; pass++) {
        for (let i = 0; i < bodies.length; i++) for (let k = i + 1; k < bodies.length; k++) {
          const a = bodies[i], b = bodies[k], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), over = a.r + b.r - d;
          if (over <= 0) continue;
          const nx = d > 0.001 ? dx / d : 1, ny = d > 0.001 ? dy / d : 0, ia = 1 / (a.r * a.r), ib = 1 / (b.r * b.r), sum = ia + ib;
          a.x -= (nx * over * ia) / sum; a.y -= (ny * over * ia) / sum; b.x += (nx * over * ib) / sum; b.y += (ny * over * ib) / sum;
          const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rel <= 0) continue;
          const imp = ((1 + P.restitution) * rel) / sum;
          rub(a, b, nx, ny, rel); hit(a, nx, ny, rel); hit(b, -nx, -ny, rel);
          emit(`${i}:${k}`, a.x + nx * a.r, a.y + ny * a.r, nx, ny, rel, false, a);
          a.vx -= imp * ia * nx; a.vy -= imp * ia * ny; b.vx += imp * ib * nx; b.vy += imp * ib * ny;
        }
        bodies.forEach(walls);
      }
    };
    const render = () => {
      const B = P.burst;
      bodies.forEach((b) => {
        const a = (Math.atan2(b.hitY, b.hitX) * 180) / Math.PI, o = Math.max(-P.squashLimit, Math.min(P.squashLimit, b.squash));
        b.ball.style.width = b.r * 2 + "px";
        b.ball.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${a}deg) scale(${1 - o}, ${1 / (1 - o)}) rotate(${-a}deg)`;
        if (b.face) b.face.style.transform = `rotate(${b.angle}deg)`;
      });
      ctx.clearRect(0, 0, W, H);
      for (const d of drops) {
        const t = d.age / d.life, r = d.r * (1 - t * B.shrink), st = B.stretch - t * (B.stretch - 1);
        ctx.globalAlpha = B.opacity * Math.min(1, (1 - t) / B.fadeOut);
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(Math.atan2(d.vy, d.vx)); ctx.drawImage(d.img, -r * st, -r, r * st * 2, r * 2); ctx.restore();
      }
      ctx.globalAlpha = 1;
    };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      acc += last ? Math.min((now - last) / 1000, P.maxFrame) : 0;
      last = now;
      while (acc >= P.step) { step(P.step); acc -= P.step; }
      render();
    };
    const fit = () => {
      const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5), oldW = W, oldH = H;
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (!bodies.length) reset();
      else bodies.forEach((b) => { b.x *= W / oldW; b.y *= H / oldH; b.x = Math.max(b.r, Math.min(W - b.r, b.x)); b.y = Math.max(b.r, Math.min(H - b.r, b.y)); });
      render();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !raf) { last = 0; raf = requestAnimationFrame(tick); } else if (!on) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(el);
    const replay = () => { reset(); render(); };
    el.addEventListener("fx:play", replay);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener("fx:play", replay); canvas.remove();
      balls.forEach((b) => { b.style.removeProperty("width"); b.style.removeProperty("transform"); b.firstElementChild?.style.removeProperty("transform"); });
    };
  });
})();
