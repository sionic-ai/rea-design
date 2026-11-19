// First page: six scenes switched in 4-second steps, and the flow and blur of big titles pinned per section.
// Values carried over from the original — scene 4000ms, strip photo flip 0.8 seconds every 1.5 seconds, symbol field swaps every 1.5 seconds, spiral one turn per 20 seconds, face repulsion 0.9.
(() => {
  const mm = gsap.matchMedia();
  const mv = document.querySelector(".home-mv");
  const scenes = [...mv.querySelectorAll(".mv-scene")];
  const indicator = mv.querySelector(".mv-indicator");
  const ring = indicator.querySelector("circle");
  const unit = () => innerWidth / (innerWidth < 768 ? 26 : 50);
  const rand = (a, b) => a + Math.random() * (b - a);
  const INKS = Array.from({ length: 12 }, (_, i) => `var(--site-ink-${i + 1})`);

  // Band and title: duplicate one group and join two copies so -50% loops seamlessly
  const doubleGroups = (sel) => document.querySelectorAll(sel).forEach((track) => {
    const g = track.firstElementChild;
    const copy = g.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.append(copy);
  });
  doubleGroups(".mq__track");
  doubleGroups(".title-ticker__track");
  const setMarqueeSpeed = () => document.querySelectorAll(".mq__track").forEach((t) => {
    const perSecond = unit() * (innerWidth < 768 ? 3 : 2);
    t.style.setProperty("--mq-dur", (t.scrollWidth / 2 / perSecond).toFixed(2) + "s");
  });

  // ── Symbol field: five rows × columns, each cell has a symbol and a circled symbol ──
  const lf = mv.querySelector(".lf");
  for (let r = 0; r < 5; r++) {
    const lane = document.createElement("div");
    lane.className = "lf__lane" + (r % 2 ? " is-reverse" : "");
    const group = () => {
      const g = document.createElement("div");
      g.className = "lf__group";
      for (let i = 0; i < 10; i++) {
        const c = INKS[Math.floor(rand(0, INKS.length))];
        g.insertAdjacentHTML("beforeend", `<span class="lf__item" style="--c:${c}"><i class="lf__mark lf__mark--plain is-primary"></i><i class="lf__mark lf__mark--circle"></i></span>`);
      }
      return g;
    };
    const track = document.createElement("div");
    track.className = "lf__track";
    track.append(group(), group());
    track.lastElementChild.setAttribute("aria-hidden", "true");
    lane.append(track);
    lf.append(lane);
  }
  let lfTimer = 0;
  const lfSwitch = () => {
    lf.classList.add("is-switching");
    lf.querySelectorAll(".lf__item").forEach((it) => it.querySelectorAll(".lf__mark").forEach((m) => m.classList.toggle("is-primary")));
  };

  // ── Work strip photo flip: every 1.5 seconds one full turn over 0.8 seconds (overshoot 1.4), first on the horizontal axis then the vertical axis, even cells 1.5 seconds late ──
  const FLIP = { interval: 1500, dur: 800, samples: 32, overshoot: 1.4 };
  const flipAngle = (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return Math.PI * 2;
    const n = x - 1;
    return (1 + (FLIP.overshoot + 1) * n ** 3 + FLIP.overshoot * n ** 2) * Math.PI * 2;
  };
  const flipFrames = (persp) => {
    const total = FLIP.interval * 4, frames = [];
    for (let axis = 0; axis < 2; axis++) {
      const from = axis * FLIP.interval * 2;
      for (let k = 0; k <= FLIP.samples; k++) {
        const a = flipAngle(k / FLIP.samples);
        frames.push({ offset: (from + (k / FLIP.samples) * FLIP.dur) / total, transform: `perspective(${persp}px) rotateY(${axis ? a : 0}rad) rotateX(${axis ? Math.PI * 2 : a}rad)` });
      }
      frames.push({ offset: (axis + 1) / 2, transform: `perspective(${persp}px) rotateY(${axis ? Math.PI * 2 : 0}rad) rotateX(${Math.PI * 2}rad)` });
    }
    return frames;
  };
  const flips = [];
  const buildFlips = () => {
    flips.forEach((f) => f.anim.cancel());
    flips.length = 0;
    mv.querySelectorAll(".mq__group").forEach((g) => g.querySelectorAll(".mq__cell .wf-img").forEach((img, i) => {
      const persp = Math.max(1, img.offsetHeight * 3, img.offsetWidth * 0.75);
      const anim = img.animate(flipFrames(persp), { duration: FLIP.interval * 4, delay: (i % 2) * FLIP.interval, iterations: Infinity, fill: "both", easing: "linear" });
      anim.pause();
      flips.push({ anim, img, delay: (i % 2) * FLIP.interval, persp, scene: img.closest(".mv-scene") });
    }));
  };
  const syncFlips = (scene) => flips.forEach((f) => {
    if (f.scene === scene) { f.anim.currentTime = 0; f.anim.play(); } else f.anim.pause();
  });

  // ── Spiral: 16 works and 16 color marks come out from the center outward along a two-arm spiral (20s per turn, 1.6 turns, shrink 2.8) ──
  const SP = { cycleMs: 20000, turns: 1.6, contraction: 2.8, count: 32, mobileCount: 24, maxEdge: 380, sizeContraction: 1.8, logoScale: 0.5, shrinkEnd: 0.45, growStart: 0.55, overshoot: 3.2 };
  const spWrap = mv.querySelector(".sp");
  const sources = [...mv.querySelectorAll('[data-scene="marquee-diagonal"] .mq__group:not([aria-hidden]) .wf-img')];
  const spItems = Array.from({ length: SP.count }, (_, i) => {
    const el = document.createElement("span");
    el.className = "sp__item";
    if (i % 2) {
      el.classList.add("sp__item--logo");
      el.style.setProperty("--c", INKS[Math.floor(rand(0, INKS.length))]);
      el.innerHTML = '<i class="amp"></i>';
      el.dataset.ratio = 730 / 900;
    } else {
      const src = sources[(i / 2) % sources.length];
      const [w, h] = (src.style.aspectRatio || "1").split("/").map(Number);
      el.dataset.ratio = h ? w / h : 1;
      el.innerHTML = `<span class="wf-img" data-label="${src.dataset.label}"></span>`;
    }
    spWrap.append(el);
    return el;
  });
  const smooth = (a, b, v) => { const r = Math.max(0, Math.min(1, (v - a) / (b - a))); return r * r * (3 - 2 * r); };
  const turnEase = (x) => ((1 - Math.cos(Math.PI * x)) / 2) * Math.PI * 2;
  // The angle the symbol rotates through — 0.8 seconds split into 32 steps, joined by straight lines only between steps (same form as the table the original pre-baked)
  const turnAt = (e) => {
    if (e < 0) return 0;
    const n = Math.min(1, (e % (FLIP.interval * 2)) / FLIP.dur) * FLIP.samples, k = Math.floor(n);
    if (k >= FLIP.samples) return Math.PI * 2;
    return turnEase(k / FLIP.samples) + (turnEase((k + 1) / FLIP.samples) - turnEase(k / FLIP.samples)) * (n - k);
  };
  const logoTurn = (e) => {
    const r = e < 0 ? 1 : Math.min(1, (e % (FLIP.interval * 2)) / FLIP.dur);
    let scale = e < 0 ? 1 : 1 - smooth(0, SP.shrinkEnd, r), rot = (turnAt(e) * 180) / Math.PI;
    if (e >= 0 && r > SP.growStart) {
      const x = (r - SP.growStart) / (1 - SP.growStart) - 1, o = SP.overshoot;
      const k = 1 + (o + 1) * x ** 3 + o * x ** 2, base = (turnAt(SP.growStart * FLIP.dur) * 180) / Math.PI;
      scale = k; rot = base + (360 - base) * k;
    }
    return { rot, scale };
  };
  const spiralAt = (phase, arm, now, W, H, ratio) => {
    const o = 1 - ((((now / SP.cycleMs + phase) % 1) + 1) % 1);
    const rad = Math.hypot(W, H) * 0.64 * Math.exp(-SP.contraction * o);
    const ang = o * Math.PI * 2 * SP.turns + arm * Math.PI - Math.PI / 2;
    const edge = Math.min(SP.maxEdge, W * 0.38, H * 0.55) * Math.exp(-SP.sizeContraction * o);
    return {
      x: W / 2 + Math.cos(ang) * rad, y: H / 2 + Math.sin(ang) * rad,
      w: edge * Math.min(1, ratio), h: edge / Math.max(1, ratio),
      rot: Math.sin(ang) * 16, opacity: smooth(0, 0.07, o) * (1 - smooth(0.74, 0.98, o)), depth: Math.round((1 - o) * 1000),
    };
  };
  let spTime = 0, spTurn = 0;
  const drawSpiral = (dtMs) => {
    spTime += dtMs; spTurn += dtMs;
    const W = spWrap.clientWidth, H = spWrap.clientHeight;
    const n = innerWidth < 768 ? SP.mobileCount : SP.count, pairs = n / 2;
    spItems.forEach((el, i) => {
      if (i >= n) { el.style.display = "none"; return; }
      el.style.display = "";
      const pair = Math.floor(i / 2), arm = pair % 2, next = pair + 2 < pairs ? pair + 2 : arm;
      const gap = next > pair ? (next - pair) / pairs : 1 + (next - pair) / pairs;
      const f = spiralAt(pair / pairs + (i % 2 ? gap / 2 : 0), arm, spTime, W, H, +el.dataset.ratio);
      if (i % 2) {
        f.rot = 0; f.w *= SP.logoScale; f.h *= SP.logoScale;
        const t = logoTurn(spTurn - (Math.floor(i / 2) % 2) * FLIP.interval);
        f.rot = t.rot; f.w *= t.scale; f.h *= t.scale;
        if (t.scale === 0) f.opacity = 0;
      }
      el.style.width = f.w + "px";
      el.style.height = f.h + "px";
      el.style.transform = `translate3d(${f.x - f.w / 2}px, ${f.y - f.h / 2}px, 0) rotate(${f.rot}deg)`;
      el.dataset.rot = f.rot;
      el.style.opacity = f.opacity;
      el.style.zIndex = f.depth;
    });
  };

  // ── Bouncing faces: three faces float without gravity, colliding with walls and each other (restitution 0.9). On collision they squash and 4~9 ink drops splatter ──
  const PH = {
    diameterLimit: 0.36, inset: 0.12, jitter: 0.06, speed: 0.36, speedVar: 0.1, minSpeed: 0.3, speedRecover: 2, minDir: 0.3, dirRecover: 2,
    restitution: 0.9, friction: 0.04, drag: 0.025, spinDrag: 0.18, step: 1 / 120, maxFrame: 0.05, passes: 4,
    squashLimit: 0.07, squashImpulse: 1.9, squashFreq: 18, squashDamp: 0.34, impactRef: 220, impactExp: 1.35, spin: 12,
    burst: { max: 48, countMin: 4, countMax: 9, minStrength: 0.12, cooldown: 0.18, lifeMin: 0.5, lifeMax: 0.75, speed: 0.4, radius: 0.0156, radiusMin: 5.6, radiusMax: 12.3, radiusVar: [0.5, 0.85], speedVar: [0.65, 1.35], minSpeedFactor: 0.5, opacity: 0.75, shrink: 0.55, stretch: 1.65, fadeOut: 0.35, drag: 2.8, gravity: 0.06, pairSpread: 0.75, wallSpread: 1.25 },
  };
  const phScene = mv.querySelector('[data-scene="physics"]');
  const phItems = [...phScene.querySelectorAll(".ph__item")];
  const phCanvas = phScene.querySelector(".ph__burst");
  const phCtx = phCanvas.getContext("2d");
  let bodies = [], drops = [], phAcc = 0, phClock = 0;
  const cooldowns = new Map();
  const resetPhysics = () => {
    const W = phScene.clientWidth, H = phScene.clientHeight, short = Math.min(W, H);
    const corners = [[PH.inset, PH.inset], [1 - PH.inset, PH.inset], [PH.inset, 1 - PH.inset], [1 - PH.inset, 1 - PH.inset]].sort(() => Math.random() - 0.5);
    const r = Math.min(phItems[0].offsetWidth, short * PH.diameterLimit) / 2;
    const minA = Math.asin(PH.minDir);
    bodies = phItems.map((el, i) => {
      const [cx, cy] = corners[i % 4], j = () => rand(-1, 1) * PH.jitter;
      const a = minA + Math.random() * (Math.PI / 2 - 2 * minA), sx = Math.random() < 0.5 ? -1 : 1, sy = Math.random() < 0.5 ? -1 : 1;
      const v = short * PH.speed * (1 + rand(-1, 1) * PH.speedVar);
      return { el, img: el.firstElementChild, r, x: r + (W - 2 * r) * (cx + j()), y: r + (H - 2 * r) * (cy + j()), vx: Math.cos(a) * sx * v, vy: Math.sin(a) * sy * v, tx: Math.cos(a) * sx, ty: Math.sin(a) * sy, angle: 0, spin: rand(-1, 1) * PH.spin, hitX: 0, hitY: 0, impact: 0, squash: 0, squashV: 0 };
    });
    drops = []; cooldowns.clear(); phAcc = 0; phClock = 0;
  };
  const emit = (key, x, y, nx, ny, speed, wall) => {
    const B = PH.burst, short = Math.min(phScene.clientWidth, phScene.clientHeight), m = Math.min(1, speed / PH.impactRef);
    if (m < B.minStrength || (cooldowns.get(key) ?? -Infinity) > phClock) return;
    cooldowns.set(key, phClock + B.cooldown);
    const count = Math.round(B.countMin + (B.countMax - B.countMin) * m), base = Math.max(B.radiusMin, Math.min(B.radiusMax, short * B.radius)), dir = Math.atan2(ny, nx);
    for (let i = 0; i < count && drops.length < B.max; i++) {
      const a = (wall ? dir + Math.PI : dir + Math.PI / 2 + (i % 2) * Math.PI) + rand(-1, 1) * (wall ? B.wallSpread : B.pairSpread);
      const v = short * B.speed * (B.minSpeedFactor + m * (1 - B.minSpeedFactor)) * rand(B.speedVar[0], B.speedVar[1]);
      drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: base * rand(B.radiusVar[0], B.radiusVar[1]), life: rand(B.lifeMin, B.lifeMax), age: 0, c: INKS[Math.floor(rand(0, INKS.length))] });
    }
  };
  const hit = (b, nx, ny, speed) => {
    b.hitX = nx; b.hitY = ny;
    b.impact = Math.min(1, speed / PH.impactRef) ** PH.impactExp;
    b.squashV = Math.min(PH.squashImpulse, b.squashV + b.impact * PH.squashImpulse);
  };
  // Spin picks up as much as it slides along the surface it hit — friction 0.04
  const rub = (a, b, nx, ny, speed) => {
    const tx = -ny, ty = nx, ia = 1 / (a.r * a.r), ib = b ? 1 / (b.r * b.r) : 0, deg = Math.PI / 180;
    const slip = (a.vx - (b?.vx || 0)) * tx + (a.vy - (b?.vy || 0)) * ty + (a.spin * a.r + (b ? b.spin * b.r : 0)) * deg;
    const cap = PH.friction * (((1 + PH.restitution) * speed) / (ia + ib));
    const j = Math.max(-cap, Math.min(cap, -slip / (3 * (ia + ib))));
    a.vx += j * ia * tx; a.vy += j * ia * ty; a.spin += (2 * j * ia) / a.r / deg;
    if (b) { b.vx -= j * ib * tx; b.vy -= j * ib * ty; b.spin += (2 * j * ib) / b.r / deg; }
  };
  const walls = (b, W, H) => {
    let nx = 0, ny = 0, sp = 0;
    if (b.x < b.r) { b.x = b.r; if (b.vx < 0) { sp = -b.vx; b.vx *= -PH.restitution; nx = -1; } }
    else if (b.x > W - b.r) { b.x = W - b.r; if (b.vx > 0) { sp = b.vx; b.vx *= -PH.restitution; nx = 1; } }
    if (b.y < b.r) { b.y = b.r; if (b.vy < 0) { sp = Math.max(sp, -b.vy); b.vy *= -PH.restitution; ny = -1; } }
    else if (b.y > H - b.r) { b.y = H - b.r; if (b.vy > 0) { sp = Math.max(sp, b.vy); b.vy *= -PH.restitution; ny = 1; } }
    if (!nx && !ny) return;
    const l = Math.hypot(nx, ny);
    rub(b, null, nx / l, ny / l, sp);
    hit(b, nx, ny, sp);
    emit(`${bodies.indexOf(b)}:wall:${nx}:${ny}`, b.x + (nx / l) * b.r, b.y + (ny / l) * b.r, nx / l, ny / l, sp, true);
  };
  const stepBodies = (dt, W, H) => {
    const short = Math.min(W, H), minV = short * PH.minSpeed, ks = 1 - Math.exp(-dt / PH.speedRecover), kd = 1 - Math.exp(-dt / PH.dirRecover);
    for (const b of bodies) {
      const v = Math.hypot(b.vx, b.vy);
      let cx = v > 0.001 ? b.vx / v : b.tx, cy = v > 0.001 ? b.vy / v : b.ty;
      const flat = Math.min(Math.abs(cx), Math.abs(cy)) < PH.minDir;
      if (flat) {
        const sx = Math.sign(cx) || Math.sign(W / 2 - b.x) || 1, sy = Math.sign(cy) || Math.sign(H / 2 - b.y) || 1;
        const gx = sx * Math.max(Math.abs(cx), PH.minDir), gy = sy * Math.max(Math.abs(cy), PH.minDir), gl = Math.hypot(gx, gy);
        cx += (gx / gl - cx) * kd; cy += (gy / gl - cy) * kd;
        const l = Math.hypot(cx, cy); cx /= l; cy /= l;
      }
      b.tx = cx; b.ty = cy;
      if (v >= minV && !flat) continue;
      const nv = v + Math.max(0, minV - v) * ks;
      b.vx = cx * nv; b.vy = cy * nv;
    }
    const B = PH.burst, kdrag = Math.exp(-B.drag * dt);
    phClock += dt;
    drops = drops.filter((d) => (d.age += dt) < d.life && ((d.vx *= kdrag), (d.vy = d.vy * kdrag + short * B.gravity * dt), (d.x += d.vx * dt), (d.y += d.vy * dt), true));
    for (const b of bodies) {
      b.impact = Math.max(0, b.impact - dt * PH.squashFreq);
      b.squashV += (-(PH.squashFreq ** 2) * b.squash - 2 * PH.squashDamp * PH.squashFreq * b.squashV) * dt;
      b.squash += b.squashV * dt;
      b.vx *= Math.exp(-PH.drag * dt); b.vy *= Math.exp(-PH.drag * dt); b.spin *= Math.exp(-PH.spinDrag * dt);
      b.x += b.vx * dt; b.y += b.vy * dt; b.angle = (b.angle + b.spin * dt) % 360;
      walls(b, W, H);
    }
    for (let pass = 0; pass < PH.passes; pass++) {
      for (let i = 0; i < bodies.length; i++) for (let k = i + 1; k < bodies.length; k++) {
        const a = bodies[i], b = bodies[k], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), over = a.r + b.r - d;
        if (over <= 0) continue;
        const nx = d > 0.001 ? dx / d : 1, ny = d > 0.001 ? dy / d : 0, ia = 1 / (a.r * a.r), ib = 1 / (b.r * b.r), sum = ia + ib;
        a.x -= (nx * over * ia) / sum; a.y -= (ny * over * ia) / sum; b.x += (nx * over * ib) / sum; b.y += (ny * over * ib) / sum;
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (rel <= 0) continue;
        const imp = ((1 + PH.restitution) * rel) / sum;
        rub(a, b, nx, ny, rel); hit(a, nx, ny, rel); hit(b, -nx, -ny, rel);
        emit(`${i}:${k}`, a.x + nx * a.r, a.y + ny * a.r, nx, ny, rel, false);
        a.vx -= imp * ia * nx; a.vy -= imp * ia * ny; b.vx += imp * ib * nx; b.vy += imp * ib * ny;
      }
      bodies.forEach((b) => walls(b, W, H));
    }
  };
  const fitCanvas = (c) => { const d = Math.min(devicePixelRatio, 1.5); c.width = c.clientWidth * d; c.height = c.clientHeight * d; c.getContext("2d").setTransform(d, 0, 0, d, 0, 0); };
  // Blob drawing — a circle solid at the center and softly fading out at 22% from the edge. Variable colors are painted on the element and read back as computed rgb
  const sprites = new Map();
  const sprite = (color) => {
    if (sprites.has(color)) return sprites.get(color);
    const probe = document.createElement("i");
    probe.style.color = color;
    phScene.append(probe);
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
    sprites.set(color, c);
    return c;
  };
  const stepPhysics = (dt) => {
    const W = phScene.clientWidth, H = phScene.clientHeight, B = PH.burst;
    phAcc += Math.min(dt, PH.maxFrame);
    while (phAcc >= PH.step) { stepBodies(PH.step, W, H); phAcc -= PH.step; }
    bodies.forEach((b) => {
      const a = (Math.atan2(b.hitY, b.hitX) * 180) / Math.PI, o = Math.max(-PH.squashLimit, Math.min(PH.squashLimit, b.squash));
      b.el.style.width = b.r * 2 + "px";
      b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${a}deg) scale(${1 - o}, ${1 / (1 - o)}) rotate(${-a}deg)`;
      b.img.style.transform = `rotate(${b.angle}deg)`;
    });
    phCtx.clearRect(0, 0, W, H);
    for (const d of drops) {
      const t = d.age / d.life, r = d.r * (1 - t * B.shrink), st = B.stretch - t * (B.stretch - 1);
      phCtx.globalAlpha = B.opacity * Math.min(1, (1 - t) / B.fadeOut);
      phCtx.save(); phCtx.translate(d.x, d.y); phCtx.rotate(Math.atan2(d.vy, d.vx));
      phCtx.drawImage(sprite(d.c), -r * st, -r, r * st * 2, r * 2);
      phCtx.restore();
    }
    phCtx.globalAlpha = 1;
  };

  // ── Photo layer: as in the original, photo spots are redrawn as texture rectangles. Flips of the strip photos, including x/y axis rotation and perspective (height × 3), come from the vertices ──
  const photoLayer = (() => {
    const canvas = mv.querySelector(".mv-gl");
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return null;
    const compile = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, "attribute vec3 a_position; attribute vec2 a_uv; varying vec2 v_uv; void main(){ gl_Position = vec4(a_position.xy, 0.0, a_position.z); v_uv = a_uv; }"));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, "precision mediump float; uniform sampler2D u_image; uniform float u_shape; uniform float u_alpha; varying vec2 v_uv; void main(){ if (u_shape > 0.5) { vec2 c = v_uv - 0.5; if (dot(c, c) > 0.25) discard; } gl_FragColor = texture2D(u_image, v_uv) * u_alpha; }"));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer(), data = new Float32Array(30);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.STREAM_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position"), aUv = gl.getAttribLocation(prog, "a_uv");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 20, 12);
    const uShape = gl.getUniformLocation(prog, "u_shape"), uAlpha = gl.getUniformLocation(prog, "u_alpha");
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const textures = new Map();
    const AMP = new Path2D("M620 800L300 420C200 300 220 130 360 130C480 130 510 270 420 350L230 500C120 590 140 790 320 790C450 790 540 700 610 560");
    // Draws the placeholder graphic as is — background · two diagonals · border · center label (photo slot), or a single colored ampersand stroke (spiral symbol)
    const paint = (el) => {
      const cs = getComputedStyle(el), w = Math.max(2, Math.round(el.offsetWidth)), h = Math.max(2, Math.round(el.offsetHeight));
      const k = Math.min(2, 512 / Math.max(w, h)), c = document.createElement("canvas"), x = c.getContext("2d");
      c.width = Math.max(2, Math.round(w * k)); c.height = Math.max(2, Math.round(h * k));
      x.scale(c.width / w, c.height / h);
      if (el.classList.contains("amp")) {
        x.scale(w / 730, h / 900);
        x.strokeStyle = cs.color; x.lineWidth = 140; x.lineCap = "round"; x.lineJoin = "round";
        x.stroke(AMP);
      } else {
        const fill = cs.getPropertyValue("--wf-fill").trim(), line = cs.getPropertyValue("--wf-line").trim();
        x.fillStyle = cs.backgroundColor || fill; x.fillRect(0, 0, w, h);
        x.strokeStyle = line; x.lineWidth = 1;
        x.beginPath(); x.moveTo(0, h); x.lineTo(w, 0); x.moveTo(0, 0); x.lineTo(w, h); x.stroke();
        x.strokeRect(0.5, 0.5, w - 1, h - 1);
        const label = el.dataset.label, after = getComputedStyle(el, "::after");
        if (label && after.content !== "none") {
          x.font = `${after.fontWeight} ${after.fontSize} ${after.fontFamily}`;
          const tw = x.measureText(label).width, fs = parseFloat(after.fontSize), pw = tw + fs * 1.4, ph = fs * 1.9;
          x.fillStyle = after.backgroundColor; x.fillRect((w - pw) / 2, (h - ph) / 2, pw, ph);
          x.fillStyle = after.color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, w / 2, h / 2);
        }
      }
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      textures.set(el, { t, w, h });
      return textures.get(el);
    };
    const CORNERS = [[0, 0], [0, 1], [1, 0], [1, 0], [0, 1], [1, 1]];
    let box, vw = 1, vh = 1;
    const quad = (cx, cy, w, h, rot, rx, ry, persp) => {
      const cr = Math.cos(rot), sr = Math.sin(rot), cx1 = Math.cos(rx), sx1 = Math.sin(rx), cy1 = Math.cos(ry), sy1 = Math.sin(ry);
      CORNERS.forEach(([a, o], i) => {
        const px = (a - 0.5) * w, py = (o - 0.5) * h;
        const X = px * cy1 + py * sx1 * sy1, Y = py * cx1, C = 1 - (-px * sy1 + py * sx1 * cy1) / persp;
        const qx = X * cr - Y * sr, qy = X * sr + Y * cr, k = i * 5;
        data[k] = ((cx / vw) * 2 - 1) * C + (qx / vw) * 2; data[k + 1] = (1 - (cy / vh) * 2) * C - (qy / vh) * 2; data[k + 2] = C;
        data[k + 3] = a; data[k + 4] = o;
      });
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const fit = () => {
      box = mv.getBoundingClientRect(); vw = box.width; vh = box.height;
      const d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(vw * d)); canvas.height = Math.max(1, Math.round(vh * d));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    // Current pose of the strip photo — computed directly from the flip animation time (doesn’t re-read the DOM’s 3D transform)
    const flipPose = (img) => {
      const f = flips.find((q) => q.img === img);
      if (!f) return { rx: 0, ry: 0, persp: 1e9 };
      const e = Number(f.anim.currentTime || 0) - f.delay;
      if (e < 0) return { rx: 0, ry: 0, persp: f.persp };
      const axis = Math.floor(e / (FLIP.interval * 2)) % 2, n = Math.min(1, (e % (FLIP.interval * 2)) / FLIP.dur) * FLIP.samples, k = Math.floor(n);
      const a = k >= FLIP.samples ? Math.PI * 2 : flipAngle(k / FLIP.samples) + (flipAngle((k + 1) / FLIP.samples) - flipAngle(k / FLIP.samples)) * (n - k);
      return axis ? { rx: Math.PI * 2, ry: a, persp: f.persp } : { rx: a, ry: 0, persp: f.persp };
    };
    const draw = (scene) => {
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const type = scene.dataset.scene;
      if (type === "logo" || type === "logo-field") return;
      const rot = ((+scene.dataset.glRot || 0) * Math.PI) / 180;
      // Size is the pre-transform box, center is the on-screen position — flipping strip photos are measured in a cell that has no transform
      const item = (el, shape, alpha, extra = 0, pose = null) => {
        const r = (pose ? el.parentElement : el).getBoundingClientRect();
        if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom || alpha <= 0.001) return;
        const tex = textures.get(el) || paint(el), p = pose || { rx: 0, ry: 0, persp: 1e9 };
        gl.bindTexture(gl.TEXTURE_2D, tex.t);
        gl.uniform1f(uShape, shape); gl.uniform1f(uAlpha, alpha);
        quad(r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, el.offsetWidth, el.offsetHeight, rot + extra, p.rx, p.ry, p.persp);
      };
      if (type === "spiral") {
        spItems.filter((el) => el.style.display !== "none").sort((a, b) => a.style.zIndex - b.style.zIndex)
          .forEach((el) => item(el.firstElementChild, 0, Number(el.style.opacity), (Number(el.dataset.rot) * Math.PI) / 180));
      } else if (type === "physics") {
        bodies.forEach((b) => item(b.img, 1, 1, ((b.angle || 0) * Math.PI) / 180));
      } else scene.querySelectorAll(".mq__cell .wf-img").forEach((img) => item(img, 0, 1, 0, flipPose(img)));
    };
    return { draw, fit: () => { fit(); mv.classList.add("is-gl"); }, off: () => mv.classList.remove("is-gl"), forget: () => { textures.forEach(({ t }) => gl.deleteTexture(t)); textures.clear(); } };
  })();

  // ── Ink logo: redraws with a different color scheme each time the scene returns (the first time it draws CMY / RGB when the part loads) ──
  const logoScene = mv.querySelector('[data-scene="logo"]');
  let logoRounds = 0;

  // ── Scene Switching ──
  const DURATION = 4000;
  let index = 0, started = 0, timer = 0, raf = 0, last = 0;
  const activate = (i) => {
    scenes[index].classList.remove("is-active");
    scenes[index].setAttribute("aria-hidden", "true");
    index = (i + scenes.length) % scenes.length;
    const s = scenes[index];
    s.classList.add("is-active");
    s.removeAttribute("aria-hidden");
    indicator.setAttribute("aria-label", `Next scene (now ${index + 1}/${scenes.length})`);
    clearInterval(lfTimer);
    lf.classList.remove("is-switching");
    const type = s.dataset.scene;
    if (type === "logo" && logoRounds++) logoScene.dispatchEvent(new CustomEvent("fx:play", { detail: { recolor: true } }));
    if (type === "logo-field") lfTimer = setInterval(lfSwitch, 1500);
    if (type === "physics") resetPhysics();
    if (type === "spiral") spTurn = 0;
    syncFlips(s);
    started = performance.now();
    clearTimeout(timer);
    timer = setTimeout(() => activate(index + 1), DURATION);
  };
  const loop = (now) => {
    const dt = last ? Math.min(50, now - last) : 0;
    last = now;
    const type = scenes[index].dataset.scene;
    ring.style.strokeDashoffset = (1 - Math.min(1, (now - started) / DURATION)).toFixed(4);
    if (type === "spiral") drawSpiral(dt);
    if (type === "physics") stepPhysics(dt / 1000);
    photoLayer?.draw(scenes[index]);
    raf = requestAnimationFrame(loop);
  };

  // ── Pinned big title: goes from 1 → minimum (black 10%, white 5%) as the blur marker (.title-fade) rises from the bottom of the screen ──
  const stages = [...document.querySelectorAll(".home-brand, .home-feed")].map((sec) => ({
    ticker: sec.querySelector(".title-ticker"),
    marker: sec.querySelector("[data-fade-marker]"),
    min: sec.classList.contains("home-brand") ? 0.1 : 0.05,
  }));
  const fadeTitles = () => {
    const vh = innerHeight;
    stages.forEach(({ ticker, marker, min }) => {
      const r = marker.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh - r.top) / Math.max(1, r.height)));
      ticker.style.setProperty("--title-o", (1 - p * (1 - min)).toFixed(4));
    });
  };

  // On phone, center the wordmark in the hero frame (730:900 widened 1.5 times horizontally)
  const setHomeCenter = () => document.documentElement.style.setProperty("--home-center", Math.min(innerHeight / 2, mv.clientHeight / 2) + "px");

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    setHomeCenter();
    if (ctx.conditions.still) return;
    fitCanvas(phCanvas);
    setMarqueeSpeed();
    buildFlips();
    photoLayer?.fit();
    logoRounds = 0;
    activate(0);
    raf = requestAnimationFrame(loop);
    // When the Hero is off screen, pause scene switching, drawing and the strip. On return, resume from the remaining time (the original pauses too)
    let left = 0;
    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf); raf = 0; last = 0;
      clearTimeout(timer); left = Math.max(0, DURATION - (performance.now() - started));
      flips.forEach((f) => f.anim.pause());
      mv.classList.add("is-motion-paused");
    };
    const resume = () => {
      if (raf) return;
      started = performance.now() - (DURATION - left);
      timer = setTimeout(() => activate(index + 1), left);
      flips.forEach((f) => f.scene === scenes[index] && f.anim.play());
      mv.classList.remove("is-motion-paused");
      raf = requestAnimationFrame(loop);
    };
    const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? resume() : pause()));
    seen.observe(mv);
    indicator.addEventListener("click", () => activate(index + 1));
    addEventListener("scroll", fadeTitles, { passive: true });
    const onResize = () => { fitCanvas(phCanvas); setMarqueeSpeed(); buildFlips(); syncFlips(scenes[index]); photoLayer?.forget(); photoLayer?.fit(); setHomeCenter(); fadeTitles(); };
    addEventListener("resize", onResize);
    fadeTitles();
    return () => {
      seen.disconnect(); clearTimeout(timer); clearInterval(lfTimer); cancelAnimationFrame(raf); raf = 0; flips.forEach((f) => f.anim.cancel()); photoLayer?.off();
      removeEventListener("scroll", fadeTitles); removeEventListener("resize", onResize);
    };
  });
})();
