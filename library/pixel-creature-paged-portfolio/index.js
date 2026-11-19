// First page stage: on each panel a different creature in the same visual language (art stamped from letter and dot cells) reacts to the cursor
(() => {
  const AC = window.AC;
  const { reduce, clamp } = AC;
  const RAMP = ["·", ":", "/", "+", "×", "#", "■"];
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // The canvas may not be able to read --site-* values made with color-mix·oklch, so it receives the sRGB the screen resolved — it changes along when the skin is swapped
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (name) => {
    const el = document.createElement("i");
    el.style.color = `var(${name})`;
    document.body.append(el);
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = getComputedStyle(el).color; probe.fillRect(0, 0, 1, 1);
    el.remove();
    return Array.from(probe.getImageData(0, 0, 1, 1).data.slice(0, 3)).join(", ");
  };
  const paintOf = (name) => `rgb(${rgbOf(name)})`;
  // Not skin: brightness (0–255) of the placeholder image to be dotted — drawn on an off-screen plate and only brightness is read, and on screen it is stamped as skin-colored letters
  const gray = (v, a = 1) => `rgb(${v} ${v} ${v} / ${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const wrapAngle = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
  const panelIndexOf = (el) => AC.snap.panels.findIndex((p) => p.contains(el));
  const visible = (el) => AC.snap.index === panelIndexOf(el);

  // Fit the canvas to CSS size × device pixel ratio
  const fit = (cv, dprMax) => {
    const w = cv.clientWidth, h = cv.clientHeight, d = Math.min(devicePixelRatio || 1, dprMax);
    cv.width = Math.max(1, Math.round(w * d));
    cv.height = Math.max(1, Math.round(h * d));
    const x = cv.getContext("2d");
    x.setTransform(d, 0, 0, d, 0, 0);
    return { x, w, h };
  };
  // If photos or video are provided use them, otherwise use a procedurally drawn placeholder
  const sourceOf = (wrap) => {
    const s = wrap.querySelector(".ac-src");
    if (!s) return null;
    if (s.tagName === "VIDEO") return s.readyState >= 2 ? s : null;
    return s.getAttribute("src") && s.complete && s.naturalWidth ? s : null;
  };

  /* ───────── 1. Dot crocodile being fed ───────── */
  function caiman(cv) {
    const C = {
      CELL: 12, CELL_SM: 6, FIT: 5.6, FIT_SM: 2.9, NARROW: 400, WIDE: 900, DPR: 2, DPR_SM: 3,
      LEN: 5, SPACING: 0.055, GROUND: -0.44, PITCH: -1.32, K2: 6, SQUASH: 0.92,
      MAX_SPEED: 1.85, TURN: 2.5, SLOW: 1.5, STOP: 0.3, MIN_R: 0.95, STRIDE: 1.1, SWING: 0.42,
      FOLLOW: 1.1, BUILD: 2.4, BAND: 0.16,
      IDLE: 2, MARGIN: 0.78, WANDER_MIN: 2.2, REACH: 1.35, PAUSE_P: 0.22, PAUSE: [0.25, 0.9], TIMEOUT: 7,
      CRUMBS: 5, EAT_R: 0.5, TTL: 14, BURST: 0.45,
    };
    const INK = paintOf("--kf-accent"), DIM = paintOf("--site-accent-dim"), FAINT = paintOf("--site-accent-faint"), CRUMB = paintOf("--site-accent-glow");
    const L = (() => { const v = [0.3, 0.85, -0.5], m = Math.hypot(...v); return v.map((x) => x / m); })();
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, cell = C.CELL, fitK = C.FIT, cols = 0, rows = 0, k = 1;

    // Body thickness: thin snout, one bulge at the head and one at the body, thinning toward the tail (s=0 nose tip, 1 tail tip)
    const girth = (s) => {
      let w = 0.03 + 0.22 * Math.exp(-(((s - 0.11) / 0.075) ** 2)) + 0.36 * Math.exp(-(((s - 0.38) / 0.17) ** 2));
      if (s > 0.58) { const t = (s - 0.58) / 0.42; w += 0.12 * (1 - t); w *= 1 - t * 0.75; }
      return w;
    };
    const rise = (s) => (s < 0.18 ? 0.12 * ((0.18 - s) / 0.18) : 0) - (s > 0.6 ? 0.08 * ((s - 0.6) / 0.4) : 0);

    const head = { x: 1.6, z: 0.4 };
    const goal = { x: -1.5, z: 0.2 };   // The point actually chased (follows 1.1s late)
    const want = { x: -1.5, z: 0.2 };   // Point set by mouse, food and wandering
    let heading = Math.PI, speed = 0, turn = 0, yaw = 0, gait = 0, carry = 0;
    let trail = [];
    const TRAIL_MAX = Math.ceil(C.LEN / C.SPACING) + 10;
    let followX = null, followZ = null;
    const build = { p: 0 };

    const seedTrail = () => {
      trail = [];
      const fx = Math.cos(heading), fz = Math.sin(heading);
      for (let i = TRAIL_MAX - 1; i >= 1; i--) trail.push({ x: head.x - fx * i * C.SPACING, z: head.z - fz * i * C.SPACING });
      carry = 0;
    };
    const along = (d) => {
      if (d <= carry || !trail.length) {
        const last = trail[trail.length - 1] || head, t = carry > 1e-6 ? d / carry : 0;
        return { x: lerp(head.x, last.x, t), z: lerp(head.z, last.z, t) };
      }
      const r = (d - carry) / C.SPACING, i = Math.floor(r), f = r - i;
      const a = trail[Math.max(0, trail.length - 1 - i)], b = trail[Math.max(0, trail.length - 2 - i)];
      return { x: lerp(a.x, b.x, f), z: lerp(a.z, b.z, f) };
    };
    const tangent = (d) => {
      const a = along(Math.max(0, d - 0.12)), b = along(d + 0.12);
      return Math.hypot(a.x - b.x, a.z - b.z) < 1e-5 ? heading : Math.atan2(a.z - b.z, a.x - b.x);
    };
    // Coordinates of a point on the spine: forward (f) · side (q), the nearer the tail the bigger the S-shaped sway
    const spine = (s, sp) => {
      const p = along(s * C.LEN);
      let ang = tangent(s * C.LEN), push = 0;
      if (s < 0.2) { const f = 1 - s / 0.2; ang += yaw * f * 0.8; push = yaw * f * f * 0.3; }
      const fx = Math.cos(ang), fz = Math.sin(ang), qx = -fz, qz = fx;
      const sway = (0.025 + 0.1 * sp) * Math.sin(gait - s * 4.2) * (0.1 + 0.9 * Math.pow(s, 1.4)) + push;
      return { cx: p.x + qx * sway, cz: p.z + qz * sway, fx, fz, qx, qz, ang };
    };

    // Point cloud: x,y,z, normal, spine position s
    const MAXP = 12000, pts = new Float32Array(MAXP * 7);
    let np = 0;
    const put = (x, y, z, nx, ny, nz, s) => {
      if (np >= MAXP) return;
      const m = Math.hypot(nx, ny, nz) || 1, i = np * 7;
      pts[i] = x; pts[i + 1] = y; pts[i + 2] = z; pts[i + 3] = nx / m; pts[i + 4] = ny / m; pts[i + 5] = nz / m; pts[i + 6] = s;
      np++;
    };

    const legs = [
      { s: 0.235, side: 1, front: true, off: 0.07 },
      { s: 0.52, side: -1, front: false, off: 0 },
      { s: 0.235, side: -1, front: true, off: 0.57 },
      { s: 0.52, side: 1, front: false, off: 0.5 },
    ].map((l) => ({ ...l, foot: { x: 0, z: 0 }, from: { x: 0, z: 0 }, to: { x: 0, z: 0 }, swing: -1, timed: false }));
    const restOf = (l, sp) => {
      const f = spine(l.s, sp), out = l.front ? 0.62 : 0.72, fwd = l.front ? 0.16 : -0.18;
      return { x: f.cx + f.qx * l.side * out + f.fx * fwd, z: f.cz + f.qz * l.side * out + f.fz * fwd, f };
    };
    const plantLegs = () => legs.forEach((l) => {
      const r = restOf(l, 0);
      l.foot = { x: r.x, z: r.z }; l.from = { ...l.foot }; l.to = { ...l.foot }; l.swing = -1; l.timed = false;
    });
    // When walking, diagonal pairs of legs lift to the stride rhythm. When standing still, only a leg spread too wide takes one step in .18s
    const stepLegs = (dt, sp) => {
      const reach = C.STRIDE * (1 - C.SWING) * 0.5, cyc = (gait / (Math.PI * 2)) % 1, walking = speed > 0.08;
      for (const l of legs) {
        const ph = (cyc - l.off + 1) % 1, inWin = ph < C.SWING;
        if (l.swing < 0) {
          if (walking && inWin && ph < C.SWING * 0.35) { l.from = { ...l.foot }; l.swing = ph / C.SWING; l.timed = false; }
          else {
            const r = restOf(l, sp);
            if (Math.hypot(r.x - l.foot.x, r.z - l.foot.z) > (walking ? 0.62 : 0.5)) {
              l.from = { ...l.foot };
              l.to = { x: r.x + r.f.fx * reach * 0.5, z: r.z + r.f.fz * reach * 0.5 };
              l.swing = 0; l.timed = true;
            }
          }
        }
        if (l.swing >= 0) {
          if (l.timed) l.swing += dt / 0.18;
          else if (walking && inWin) { l.swing = ph / C.SWING; const r = restOf(l, sp); l.to = { x: r.x + r.f.fx * reach, z: r.z + r.f.fz * reach }; }
          else if (walking) l.swing = 1;
          else l.swing += dt / 0.18;
          if (l.swing >= 1) { l.foot = { ...l.to }; l.swing = -1; l.timed = false; }
        }
      }
    };

    const shape = (sp) => {
      np = 0;
      for (let i = 0; i <= 200; i++) {
        const s = i / 200, f = spine(s, sp), y0 = rise(s), g = girth(s);
        for (let j = 0; j < 20; j++) {
          const a = (j / 20) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          put(f.cx + f.qx * g * 1.15 * sa, y0 + g * 0.82 * ca, f.cz + f.qz * g * 1.15 * sa, f.qx * sa, ca, f.qz * sa, s);
        }
      }
      // Back scale spikes
      for (let s = 0.08; s < 0.8; s += 0.024) {
        const f = spine(s, sp), y0 = rise(s), g = girth(s), h = g * 0.95 * (s > 0.58 ? 0.7 : 1);
        for (let j = 0; j <= 6; j++) { const t = j / 6; put(f.cx - f.fx * t * 0.05, y0 + g * 0.82 + t * h, f.cz - f.fz * t * 0.05, 0, 1, 0, s); }
      }
      // Lower jaw
      for (let s = 0.1; s < 0.2; s += 0.014) {
        const f = spine(s, sp), y0 = rise(s), g = girth(s), drop = 0.24 * Math.sin(((s - 0.1) / 0.1) * Math.PI);
        for (let j = 0; j <= 5; j++) put(f.cx, y0 - g * 0.82 - (j / 5) * drop, f.cz, 0, -1, 0.2, s);
      }
      for (const l of legs) legShape(l, sp);
    };
    const legShape = (l, sp) => {
      const f = spine(l.s, sp), g = girth(l.s);
      const hx = f.cx + f.qx * l.side * g * 0.95, hy = rise(l.s) - g * 0.15, hz = f.cz + f.qz * l.side * g * 0.95;
      let fx, fy, fz;
      if (l.swing >= 0) {
        const t = smooth(l.swing);
        fx = lerp(l.from.x, l.to.x, t); fz = lerp(l.from.z, l.to.z, t);
        fy = C.GROUND + Math.sin(l.swing * Math.PI) * (0.1 + 0.1 * sp);
      } else { fx = l.foot.x; fz = l.foot.z; fy = C.GROUND; }
      const kx = (hx + fx) / 2 + f.qx * l.side * 0.22, ky = (hy + fy) / 2 + 0.14, kz = (hz + fz) / 2 + f.qz * l.side * 0.22;
      for (let i = 0; i <= 20; i++) {
        const t = i / 20, u = 1 - t;
        const x = u * u * hx + 2 * u * t * kx + t * t * fx, y = u * u * hy + 2 * u * t * ky + t * t * fy, z = u * u * hz + 2 * u * t * kz + t * t * fz;
        const r = 0.088 * (1 - t * 0.45);
        for (let j = 0; j < 9; j++) {
          const a = (j / 9) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          put(x + f.qx * r * sa, y + r * ca, z + f.qz * r * sa, f.qx * sa, ca, f.qz * sa, l.s + t * 0.05);
        }
      }
      const fan = f.ang + l.side * 0.6;
      for (let i = -2; i <= 2; i++) {
        const a = fan + i * 0.22 * l.side, ca = Math.cos(a), sa = Math.sin(a);
        for (let j = 1; j <= 4; j++) put(fx + ca * j * 0.035, fy, fz + sa * j * 0.035, 0, 1, 0, l.s + 0.055);
      }
    };

    // Follow: turn toward the target while keeping the minimum turning radius, slow down when close, and turn wide when it is beside
    const swim = (dt) => {
      const dx = goal.x - head.x, dz = goal.z - head.z, dist = Math.hypot(dx, dz);
      let turnTo = 0, v = 0, yawTo = 0;
      if (dist > C.STOP) {
        const off = wrapAngle(Math.atan2(dz, dx) - heading);
        const cap = Math.min(C.TURN, Math.max(speed, 0.25) / C.MIN_R);
        turnTo = clamp(off * 2.6, -cap, cap);
        yawTo = clamp(off * 0.5, -0.45, 0.45);
        const ramp = smooth((dist - C.STOP) / (C.SLOW - C.STOP)), align = Math.pow(Math.max(0, Math.cos(off)), 1.5);
        v = C.MAX_SPEED * ramp * (0.2 + 0.8 * align);
        if (Math.abs(off) > 0.55) v = Math.max(v, C.MAX_SPEED * 0.5);
        if (dist < C.MIN_R * 2 && Math.abs(off) > 1.7) turnTo *= 0.2;
      }
      turn += (turnTo - turn) * Math.min(1, dt * 5);
      const cap = Math.min(C.TURN, Math.max(speed, 0.25) / C.MIN_R);
      turn = clamp(turn, -cap, cap);
      heading += turn * dt;
      yaw += (yawTo - yaw) * Math.min(1, dt * 4);
      speed += (v - speed) * Math.min(1, dt * (v > speed ? 2 : 3.5));
      const d = speed * dt;
      head.x += Math.cos(heading) * d;
      head.z += Math.sin(heading) * d;
      carry += d;
      while (carry >= C.SPACING) {
        const back = carry - C.SPACING;
        trail.push({ x: head.x - Math.cos(heading) * back, z: head.z - Math.sin(heading) * back });
        if (trail.length > TRAIL_MAX) trail.shift();
        carry = back;
      }
      const sp = Math.min(1, speed / (C.MAX_SPEED * 0.8));
      gait += d * ((Math.PI * 2) / C.STRIDE);
      stepLegs(dt, sp);
      shape(sp);
    };

    // Screen ↔ floor: as in the original, tilt by PITCH then project with perspective 1/(K2+depth). The original also solves mouse → floor without perspective
    const SP = Math.sin(C.PITCH), CP = Math.cos(C.PITCH);
    const bounds = () => ({ x: cols / 2 / k - 1, z: rows / 2 / (k * C.SQUASH * Math.abs(SP)) - 0.8 });
    const near = (y, z) => 1 / (C.K2 + y * SP + z * CP);
    const toCell = (x, y, z) => { const p = k * C.K2 * near(y, z); return [Math.floor(cols / 2 + p * x), Math.floor(rows / 2 - p * (y * CP - z * SP) * C.SQUASH)]; };
    const toWorld = (px, py) => {
      const c = (px - (W - cols * cell) / 2) / cell, r = (py - (H - rows * cell) / 2) / cell;
      return { x: (c - cols / 2) / k, z: (r - rows / 2) / (k * C.SQUASH * SP) };
    };
    const aim = (x, z) => {
      want.x = x; want.z = z;
      if (followX) { followX(x); followZ(z); } else { goal.x = x; goal.z = z; }
    };

    let depth = null, shade = null, along_s = null;
    const draw = () => {
      if (!cols) return;
      const n = cols * rows;
      if (!depth || depth.length !== n) { depth = new Float32Array(n); shade = new Float32Array(n); along_s = new Float32Array(n); }
      depth.fill(-1e9); shade.fill(-2);
      const building = build.p < 1, front = building ? build.p * (1 + C.BAND) : 2;
      for (let i = 0; i < np; i++) {
        const o = i * 7, s = pts[o + 6];
        if (building && s > front) continue;
        const x = pts[o], y = pts[o + 1], z = pts[o + 2];
        const [c, r] = toCell(x, y, z);
        if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
        const d = near(y, z), at = r * cols + c;
        if (d > depth[at]) {
          const ny = pts[o + 4], nz = pts[o + 5];
          depth[at] = d; along_s[at] = s;
          shade[at] = pts[o + 3] * L[0] + (ny * CP - nz * SP) * L[1] + (ny * SP + nz * CP) * L[2];
        }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 ${Math.round(cell * 0.94)}px ${css("--kf-font-glyph") || css("--kf-font-display")}`;
      const ox = (W - cols * cell) / 2 + cell / 2, oy = (H - rows * cell) / 2 + cell / 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const at = r * cols + c, v = shade[at];
        if (v === -2) continue;
        const l = clamp((v + 1) / 2, 0, 0.999);
        if (building && along_s[at] > front - C.BAND) {
          ctx.fillStyle = Math.random() < 0.45 ? DIM : FAINT;
          ctx.fillText(RAMP[(Math.random() * RAMP.length) | 0], ox + c * cell, oy + r * cell);
        } else {
          ctx.fillStyle = l > 0.62 ? INK : l > 0.3 ? DIM : FAINT;
          ctx.fillText(RAMP[Math.floor(l * RAMP.length)], ox + c * cell, oy + r * cell);
        }
      }
      if (crumbs.length || bursts.length) {
        const pulse = 0.5 + 0.5 * Math.sin((performance.now() / 1000) * 7);
        ctx.fillStyle = CRUMB;
        const glyph = (c, r, g, a) => { ctx.globalAlpha = clamp(a, 0, 1); ctx.fillText(g, ox + c * cell, oy + r * cell); };
        for (const m of crumbs) {
          const [c, r] = toCell(m.x, C.GROUND, m.z), life = clamp((C.TTL - m.age) / 2, 0, 1), a = 0.25 + 0.4 * pulse;
          glyph(c, r, "■", (0.75 + 0.25 * pulse) * life);
          glyph(c - 1, r, "+", a * life); glyph(c + 1, r, "+", a * life); glyph(c, r - 1, "+", a * life); glyph(c, r + 1, "+", a * life);
        }
        for (const b of bursts) {
          const t = b.t / C.BURST, [c, r] = toCell(b.x, C.GROUND, b.z), rad = 1 + t * 2.6;
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            glyph(Math.round(c + Math.cos(a) * rad), Math.round(r + Math.sin(a) * rad * 0.7), "×", 1 - t);
          }
        }
        ctx.globalAlpha = 1;
      }
    };

    // Food: drops where pressed (max 5, 14 seconds), the crocodile chases the nearest one first and an × bursts when it eats
    const crumbs = [], bursts = [];
    let chasing = null, idleFor = 0, wandering = false, waitFor = 0, resting = false, lastPX = -1, lastPY = -1;
    const feed = (dt) => {
      for (let i = bursts.length - 1; i >= 0; i--) { bursts[i].t += dt; if (bursts[i].t >= C.BURST) bursts.splice(i, 1); }
      for (let i = crumbs.length - 1; i >= 0; i--) {
        const m = crumbs[i];
        m.age += dt;
        const eaten = Math.hypot(m.x - head.x, m.z - head.z) < C.EAT_R;
        if (eaten) bursts.push({ x: m.x, z: m.z, t: 0 });
        if (eaten || m.age > C.TTL) { crumbs.splice(i, 1); if (chasing === m) chasing = null; }
      }
      if (!crumbs.length) { chasing = null; return false; }
      let best = crumbs[0], bd = Infinity;
      for (const m of crumbs) { const d = Math.hypot(m.x - head.x, m.z - head.z); if (d < bd) { bd = d; best = m; } }
      if (best !== chasing) { chasing = best; aim(best.x, best.z); }
      idleFor = 0; wandering = false; resting = false;
      return true;
    };
    // If the mouse stays still for 2 seconds it wanders around the screen on its own (sometimes rests .25–.9s, and picks a new destination if it can’t arrive within 7 seconds)
    const wanderTo = () => {
      const b = bounds(), mx = Math.max(0.6, b.x * C.MARGIN), mz = Math.max(0.6, b.z * C.MARGIN);
      let tx = 0, tz = 0, far = -1;
      for (let i = 0; i < 8; i++) {
        const x = (Math.random() * 2 - 1) * mx, z = (Math.random() * 2 - 1) * mz, d = Math.hypot(x - head.x, z - head.z);
        if (d > far) { far = d; tx = x; tz = z; }
        if (d >= C.WANDER_MIN) break;
      }
      aim(tx, tz);
      resting = false;
      waitFor = C.TIMEOUT;
    };
    const wander = (dt) => {
      if (!wandering) {
        const arrived = Math.hypot(want.x - head.x, want.z - head.z) < C.STOP * 1.6 && speed < 0.15;
        if (!arrived) { idleFor = 0; return; }
        idleFor += dt;
        if (idleFor < C.IDLE) return;
        wandering = true;
        wanderTo();
        return;
      }
      waitFor -= dt;
      if (resting) { if (waitFor <= 0) wanderTo(); return; }
      if (Math.hypot(want.x - head.x, want.z - head.z) < C.REACH || waitFor <= 0) {
        if (Math.random() < C.PAUSE_P) { resting = true; waitFor = lerp(C.PAUSE[0], C.PAUSE[1], Math.random()); }
        else wanderTo();
      }
    };

    const measure = () => {
      W = cv.clientWidth; H = cv.clientHeight;
      const t = clamp((W - C.NARROW) / (C.WIDE - C.NARROW), 0, 1);
      cell = lerp(C.CELL_SM, C.CELL, t);
      fitK = lerp(C.FIT_SM, C.FIT, t);
      const d = Math.min(devicePixelRatio || 1, lerp(C.DPR_SM, C.DPR, t));
      cv.width = W * d; cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      cols = Math.floor(W / cell); rows = Math.floor(H / cell);
      k = Math.min((cols * 0.34) / fitK, (rows * 0.8) / 3.4);
    };
    const pose = () => {
      if (H > W) {
        heading = Math.PI / 4;
        const s = C.LEN * 0.5 * Math.SQRT1_2;
        head.x = s; head.z = s;
        const b = bounds();
        aim(Math.min(head.x + 2.4, b.x * 0.8), Math.min(head.z + 2.4, b.z * 0.55));
      } else {
        heading = Math.PI; head.x = 1.6; head.z = 0.4;
        aim(-1.5, 0.2);
      }
    };

    addEventListener("pointermove", (e) => {
      if (crumbs.length || (e.clientX === lastPX && e.clientY === lastPY)) return;
      lastPX = e.clientX; lastPY = e.clientY;
      idleFor = 0; wandering = false; resting = false;
      const r = cv.getBoundingClientRect(), p = toWorld(e.clientX - r.left, e.clientY - r.top), b = bounds();
      aim(clamp(p.x, -b.x, b.x), clamp(p.z, -b.z, b.z));
    });
    addEventListener("click", (e) => {
      if (reduce || build.p < 1 || !document.body.classList.contains("at-hero") || document.documentElement.classList.contains("menu-open")) return;
      if (e.target.closest?.("a, button, input, textarea, select, label, header, .ac-herobar, #ac-menu, .wf-ui")) return;
      const r = cv.getBoundingClientRect(), p = toWorld(e.clientX - r.left, e.clientY - r.top), b = bounds();
      if (crumbs.length >= C.CRUMBS && crumbs.shift() === chasing) chasing = null;
      crumbs.push({ x: clamp(p.x, -b.x, b.x), z: clamp(p.z, -b.z, b.z), age: 0 });
      document.body.classList.add("has-fed");
      document.documentElement.classList.add("has-fed");
    });
    let resizeTimer = 0;
    addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { measure(); if (reduce) { seedTrail(); plantLegs(); shape(0); draw(); } }, 150);
    });

    const start = () => {
      measure(); pose(); seedTrail(); plantLegs();
      const ready = () => document.documentElement.classList.add("fauna-ready");
      if (reduce) { build.p = 1; shape(0); draw(); ready(); return; }
      followX = gsap.quickTo(goal, "x", { duration: C.FOLLOW, ease: "power2.out" });
      followZ = gsap.quickTo(goal, "z", { duration: C.FOLLOW, ease: "power2.out" });
      gsap.to(build, { p: 1, duration: C.BUILD, delay: 0.25, ease: "power1.inOut", onStart: ready });
      gsap.ticker.add((t, ms) => {
        if (!visible(cv)) return;
        const dt = Math.min(ms, 50) / 1000;
        if (build.p < 1) { shape(0); draw(); return; }
        if (!feed(dt)) wander(dt);
        swim(dt);
        draw();
      });
    };
    document.fonts?.ready ? document.fonts.ready.then(start) : start();
  }

  /* ───────── 2. One-line list + screen band ───────── */
  function carousel(root) {
    const list = root.querySelector("[data-car-list]"), track = root.querySelector("[data-car-track]"), ghost = root.querySelector("[data-car-ghost]");
    const pwin = root.querySelector("[data-car-pwindow]"), ptrack = root.querySelector("[data-car-ptrack]");
    const rows = [...track.children], frames = [...ptrack.children], n = rows.length;
    const small = matchMedia("(max-width: 860px)");
    let rowH = 0, pad = 0, pstep = 0, base = 0, active = -1, paintRaf = 0, target = null, glide = 0, acc = 0, lastStep = -1e9, movedThisGesture = false, here = false;

    const measure = () => {
      rowH = rows[0].offsetHeight;
      pad = Math.max(0, (list.clientHeight - rowH) / 2);
      [track, ghost].forEach((t) => { t.style.paddingTop = t.style.paddingBottom = pad + "px"; });
      const f0 = frames[0], f1 = frames[1];
      if (small.matches) {
        pstep = f1 ? f1.offsetLeft - f0.offsetLeft : f0.offsetWidth;
        base = pwin.clientWidth / 2 - (f0.offsetLeft + f0.offsetWidth / 2);
      } else {
        pstep = f1 ? f1.offsetTop - f0.offsetTop : f0.offsetHeight;
        base = pwin.clientHeight / 2 - (f0.offsetTop + f0.offsetHeight / 2);
      }
      paint();
    };
    // The farther from the center, the fainter the line (−.4/line, min .16) and the smaller (−.06/line, min .86), and screen bands shrink even more (−.5·−.38)
    const paint = () => {
      paintRaf = 0;
      if (!rowH) return;
      const st = list.scrollTop, o = st / rowH;
      ghost.style.transform = `translateY(${-(st + pad)}px)`;
      rows.forEach((r, i) => {
        const d = Math.abs(i - o);
        r.style.opacity = clamp(1 - d * 0.4, 0.16, 1);
        r.style.transform = `scale(${clamp(1 - d * 0.06, 0.86, 1)})`;
      });
      ptrack.style.transform = small.matches ? `translateX(${base - o * pstep}px)` : `translateY(${base - o * pstep}px)`;
      frames.forEach((f, i) => {
        const d = Math.abs(i - o);
        f.style.opacity = clamp(1 - d * 0.5, 0.22, 1);
        f.style.transform = `scale(${clamp(1 - d * 0.38, 0.58, 1)})`;
      });
      const a = clamp(Math.round(o), 0, n - 1);
      if (a !== active) { active = a; frames.forEach((f, i) => f.classList.toggle("is-active", i === a)); }
    };
    const glideStep = () => {
      glide = 0;
      if (target === null) return;
      const to = target * rowH, now = list.scrollTop, next = now + (to - now) * 0.24;
      if (Math.abs(to - next) < 0.4) { list.scrollTop = to; target = null; return; }
      list.scrollTop = next;
      glide = requestAnimationFrame(glideStep);
    };
    const glideTo = (i) => { target = i; if (!glide) glide = requestAnimationFrame(glideStep); };
    const neighbor = (dir) => { const i = (target ?? Math.round(list.scrollTop / rowH)) + dir; return i < 0 || i > n - 1 ? null : i; };

    // Wheel: a new gesture moves one line immediately, a long push moves one line per 120 accumulated (130ms interval), and pushing further at the end goes to the side panel
    root.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (!rowH) return;
      const d = AC.delta(e), dir = Math.sign(d);
      if (!dir) return;
      if (AC.wheel.fresh) { acc = 0; movedThisGesture = false; }
      if (AC.wheel.spent) return;
      const next = neighbor(dir);
      if (next === null) {
        if (!movedThisGesture && AC.wheel.dist >= 20) { AC.wheel.spent = true; AC.snap.step(dir, false); }
        return;
      }
      const now = performance.now();
      acc += Math.min(Math.abs(d), 120);
      if (AC.wheel.fresh || (acc >= 120 && now - lastStep >= 130)) { acc = 0; lastStep = now; movedThisGesture = true; glideTo(next); }
    }, { passive: false });
    addEventListener("keydown", (e) => {
      if (!here || document.documentElement.classList.contains("menu-open")) return;
      const dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!dir || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      const i = neighbor(dir);
      if (i === null) return;
      e.preventDefault();
      e.stopPropagation();
      glideTo(i);
    }, true);

    // Finger: the list scrolls normally (snaps per row on phone), dragging the screen strip · title makes the list follow, and pushing further at the end goes to the side panel
    const edges = () => { const max = list.scrollHeight - list.clientHeight; return { top: list.scrollTop <= 1, end: list.scrollTop >= max - 1 }; };
    const flick = (d, e0) => {
      const dir = d > 0 ? 1 : -1;
      if (Math.abs(d) < 56 || (dir === 1 ? !e0.end : !e0.top)) return false;
      AC.snap.step(dir, false);
      return true;
    };
    let sy = 0, sTop = 0, sEdges = null, done = false, dragging = false;
    root.querySelectorAll("[data-touch-capture]").forEach((el) => {
      const drags = el !== list;
      el.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) return;
        sy = e.touches[0].clientY; sTop = list.scrollTop; sEdges = edges(); done = false; dragging = drags;
        if (drags) list.style.scrollSnapType = "none";
      }, { passive: true });
      el.addEventListener("touchmove", (e) => {
        if (e.touches.length !== 1 || !sEdges) return;
        const d = sy - e.touches[0].clientY;
        if (dragging) { if (e.cancelable) e.preventDefault(); list.scrollTop = sTop + d; }
        if (!done) done = flick(d, sEdges);
      }, { passive: !drags });
      const end = () => { if (dragging) list.style.scrollSnapType = ""; dragging = false; sEdges = null; };
      el.addEventListener("touchend", end, { passive: true });
      el.addEventListener("touchcancel", end, { passive: true });
    });

    list.addEventListener("scroll", () => { if (!paintRaf) paintRaf = requestAnimationFrame(paint); }, { passive: true });
    addEventListener("resize", measure);
    small.addEventListener("change", measure);
    addEventListener("snap:section", (e) => {
      here = !!e.detail?.panel?.contains(root);
      if (!here) return;
      target = null;
      if (glide) { cancelAnimationFrame(glide); glide = 0; }
      list.scrollTop = (e.detail.dir === -1 ? n - 1 : 0) * rowH;
      active = -1;
      paint();
    });
    measure();
    document.fonts?.ready.then(measure);
  }

  /* ───────── 3. Dot portrait that sharpens as you get closer ───────── */
  // Placeholder portrait: dark background, a profile facing right with a brimmed hat, light coming from the left
  function paintPortrait(x, w, h) {
    x.fillStyle = gray(0); x.fillRect(0, 0, w, h);
    const light = x.createLinearGradient(w * 0.18, 0, w * 0.78, 0);
    light.addColorStop(0, gray(180)); light.addColorStop(0.5, gray(138)); light.addColorStop(1, gray(60));
    // Shoulders · torso
    const torso = x.createLinearGradient(0, h * 0.8, 0, h);
    torso.addColorStop(0, gray(90)); torso.addColorStop(1, gray(38));
    x.fillStyle = torso;
    x.beginPath(); x.ellipse(w * 0.44, h * 1.02, w * 0.62, h * 0.22, 0, 0, Math.PI * 2); x.fill();
    // Side face as one lump running back of head → crown → forehead → nose → lips → chin → neck
    x.beginPath();
    x.moveTo(w * 0.3, h * 0.52);
    x.bezierCurveTo(w * 0.25, h * 0.38, w * 0.33, h * 0.27, w * 0.48, h * 0.27);
    x.bezierCurveTo(w * 0.6, h * 0.27, w * 0.66, h * 0.33, w * 0.66, h * 0.4);
    x.lineTo(w * 0.72, h * 0.48); x.lineTo(w * 0.67, h * 0.505); x.lineTo(w * 0.685, h * 0.535);
    x.lineTo(w * 0.665, h * 0.565);
    x.bezierCurveTo(w * 0.665, h * 0.62, w * 0.6, h * 0.65, w * 0.54, h * 0.645);
    x.lineTo(w * 0.53, h * 0.72); x.lineTo(w * 0.6, h * 0.86); x.lineTo(w * 0.28, h * 0.86); x.lineTo(w * 0.35, h * 0.66);
    x.closePath();
    x.fillStyle = light; x.fill();
    // Cheekbone highlight, neck shadow, ears, eyes
    const cheek = x.createRadialGradient(w * 0.5, h * 0.47, 0, w * 0.5, h * 0.47, w * 0.16);
    cheek.addColorStop(0, gray(255, 0.28)); cheek.addColorStop(1, gray(255, 0));
    x.fillStyle = cheek; x.fillRect(0, 0, w, h);
    const jaw = x.createLinearGradient(0, h * 0.6, 0, h * 0.74);
    jaw.addColorStop(0, gray(0, 0)); jaw.addColorStop(1, gray(0, 0.55));
    x.fillStyle = jaw; x.fillRect(w * 0.28, h * 0.6, w * 0.34, h * 0.14);
    x.fillStyle = gray(166); x.beginPath(); x.ellipse(w * 0.39, h * 0.47, w * 0.03, h * 0.045, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = gray(42); x.beginPath(); x.ellipse(w * 0.6, h * 0.43, w * 0.035, h * 0.012, 0, 0, Math.PI * 2); x.fill();
    // Brimmed hat
    const cap = x.createLinearGradient(w * 0.25, 0, w * 0.75, 0);
    cap.addColorStop(0, gray(110)); cap.addColorStop(1, gray(46));
    x.fillStyle = cap;
    x.beginPath(); x.ellipse(w * 0.46, h * 0.32, w * 0.22, h * 0.11, 0, Math.PI, 0); x.fill();
    x.beginPath(); x.moveTo(w * 0.25, h * 0.32); x.lineTo(w * 0.72, h * 0.32); x.quadraticCurveTo(w * 0.82, h * 0.335, w * 0.76, h * 0.35); x.lineTo(w * 0.27, h * 0.345); x.closePath();
    x.fillStyle = gray(74); x.fill();
  }
  function portrait(frame) {
    const C = {
      FAR: 7, NEAR: 3.5, SMOOTH: 0.12, RANGE: 420, PULL: 2, DOT: 0.5, VIG_DEPTH: 0.1, VIG_RADIUS: 1.05, EDGE: 0.14,
      CONTRAST: 2.2, PIVOT_FAR: 0.52, PIVOT_NEAR: 0.34, FADE_FAR: 0.68, FADE_NEAR: 0.9, CTA_AT: 8, CTA_PAD: 6,
    };
    // 8×8 Bayer threshold: from cell brightness, carve in this order to turn dots on and off (the closer you get, the smaller the cells, so the same picture gets denser)
    const bayer = (x, y) => { let v = 0; for (let b = 0; b < 3; b++) v |= ((((x ^ y) >> b) & 1) << (5 - 2 * b)) | (((y >> b) & 1) << (4 - 2 * b)); return v; };
    const cv = frame.querySelector(".ac-pt__canvas"), cta = frame.querySelector(".ac-pt__cta");
    const INK = paintOf("--kf-accent"), EDGE = paintOf("--site-accent-dim");
    const off = document.createElement("canvas"), ox = off.getContext("2d", { willReadFrequently: true });
    const touch = matchMedia("(hover: none)").matches;
    let g = null, size = C.FAR, want = C.FAR, drawn = -1, here = false;
    const draw = () => {
      if (!g || !g.w) return;
      const cols = Math.max(1, Math.floor(g.w / size)), rows = Math.max(1, Math.floor(g.h / size));
      off.width = cols; off.height = rows;
      ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = "high";
      const src = sourceOf(frame);
      if (src) ox.drawImage(src, 0, 0, cols, rows);
      else paintPortrait(ox, cols, rows);
      drawn = size;
      const d = ox.getImageData(0, 0, cols, rows).data;
      const near = clamp((C.FAR - size) / (C.FAR - C.NEAR), 0, 1), pivot = lerp(C.PIVOT_FAR, C.PIVOT_NEAR, near), fade = lerp(C.FADE_FAR, C.FADE_NEAR, near);
      const vig = (1 - near) * C.VIG_DEPTH, vr = 1 / (C.VIG_RADIUS * C.VIG_RADIUS), dot = size * C.DOT, pad = (size - dot) / 2;
      const dim = new Path2D(), full = new Path2D();
      for (let r = 0; r < rows; r++) {
        const rowFade = fade + (1 - fade) * (r / (rows - 1 || 1)), vy = (r * 2) / (rows - 1 || 1) - 1;
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4, l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
          const vx = (c * 2) / (cols - 1 || 1) - 1, k = 1 - (vx * vx + vy * vy) * vr;
          const v = clamp((l - pivot) * C.CONTRAST + pivot, 0, 1) * rowFade * (k > 0 ? 1 - vig * k : 1) - (bayer(c % 8, r % 8) + 0.5) / 64;
          if (v > 0) (v > C.EDGE ? full : dim).rect(c * size + pad, r * size + pad, dot, dot);
        }
      }
      g.x.clearRect(0, 0, g.w, g.h);
      g.x.fillStyle = EDGE; g.x.fill(dim);
      g.x.fillStyle = INK; g.x.fill(full);
    };
    // Cell size is set by distance between cursor and frame (0 inside), and drawing approaches by .12 per frame
    addEventListener("pointermove", (e) => {
      if (!here || touch) return;
      const r = frame.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right), dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      want = lerp(C.FAR, C.NEAR, Math.pow(1 - clamp(Math.hypot(dx, dy) / C.RANGE, 0, 1), C.PULL));
      if (reduce) { size = want; draw(); }
    });
    document.documentElement.addEventListener("pointerleave", () => { if (!touch) want = C.FAR; });
    addEventListener("snap:section", (e) => {
      const on = !!e.detail?.panel?.contains(frame);
      if (on === here) return;
      here = on;
      if (here && touch) { want = C.NEAR; if (reduce) size = want; }
      if (!here) size = want = C.FAR;
      draw();
    });
    // The button trails 8px inside the cursor and flips to the opposite side on reaching the frame edge (6px) — the scale origin also changes when it flips
    if (cta) {
      gsap.set(cta, { scale: 0.96, transformOrigin: "0% 0%" });
      const qx = gsap.quickTo(cta, "x", { duration: 0.35, ease: "power3.out" }), qy = gsap.quickTo(cta, "y", { duration: 0.35, ease: "power3.out" });
      let flipX = false, flipY = false;
      const place = (e, now) => {
        const r = frame.getBoundingClientRect(), w = cta.offsetWidth, h = cta.offsetHeight, mx = e.clientX - r.left, my = e.clientY - r.top;
        const fx = mx - C.CTA_AT + w > r.width - C.CTA_PAD, fy = my - C.CTA_AT + h > r.height - C.CTA_PAD;
        const x = clamp(fx ? mx + C.CTA_AT - w : mx - C.CTA_AT, C.CTA_PAD, Math.max(C.CTA_PAD, r.width - w - C.CTA_PAD));
        const y = clamp(fy ? my + C.CTA_AT - h : my - C.CTA_AT, C.CTA_PAD, Math.max(C.CTA_PAD, r.height - h - C.CTA_PAD));
        if (fx !== flipX || fy !== flipY) { flipX = fx; flipY = fy; gsap.set(cta, { transformOrigin: `${fx ? 100 : 0}% ${fy ? 100 : 0}%` }); }
        if (now) gsap.set(cta, { x, y }); else { qx(x); qy(y); }
      };
      frame.addEventListener("pointerenter", (e) => { place(e, true); gsap.to(cta, { scale: 1, duration: 0.35, ease: "power3.out" }); });
      frame.addEventListener("pointermove", (e) => place(e));
      frame.addEventListener("pointerleave", () => gsap.to(cta, { scale: 0.96, duration: 0.2, ease: "power2.out" }));
    }
    const measure = () => { g = fit(cv, 2); draw(); };
    let t = 0;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(measure, 150); });
    frame.querySelector(".ac-src")?.addEventListener("loadeddata", measure);
    measure();
    if (reduce) return;
    gsap.ticker.add(() => {
      if (!here) return;
      const gap = want - size;
      size = Math.abs(gap) < 0.01 ? want : size + gap * C.SMOOTH;
      const src = sourceOf(frame);
      if (size !== drawn || (src && src.tagName === "VIDEO" && !src.paused)) draw();
    });
  }

  /* ───────── 3-1. City dot field behind the portrait ───────── */
  // Pixel clusters of 3–6 cells switch on and off like waves, those near the cursor lift and brighten, and a point cloud trails the cursor with a delay
  function city(cv) {
    const C = {
      CELL: 14, CELL_SM: 10, SM_W: 700, GAP: 3, SEED: 20261010, LIVE: 10, LIVE_SM: 7, SLOTS: 36, JITTER: 0.8, FAMILY: 1.37,
      MIN: 3, MAX: 6, SIDE: 3, LIFE: [1.9, 3.8], WAVE_TIME: 0.38, WAVE_WIDTH: 0.5, WAVE_NOISE: 0.34, EDGE_SOFT: 0.2, EDGE_RING: 1,
      SHADOW_STEPS: 2, SHADOW_DX: 1, SHADOW_DY: 1, SHADOW: 0.13, REACH: 0.16, LIFT: 0.55, LIFT_STEPS: 6, CURSOR_EASE: 0.12, GRIP_EASE: 0.05,
      CLOUD_R: 95, CLOUD_A: 0.5, CLOUD_SMOOTH: 0.38, STRETCH_MAX: 0.6, STRETCH_SPEED: 900, STRETCH_SMOOTH: 0.14, TAIL: 2, TIERS: 4,
      MIN_SIDE: 1, HAZE: 0.12, WOBBLE: 0.22, WOBBLE_SPEED: 0.18, TRAIL: 1.2, GRAIN: 0.55, SUMMON_REACH: 1.35, SUMMON_IN: 3.2, SUMMON_OUT: 0.9,
      TRACK_THRESH: 0.45, TRACK_SMOOTH: 0.22, LOCK_IN: 3.5, LOCK_OUT: 2.5, LOCK_SPAN: 22, LOCK_LINKS: 3, TRACK_GAIN: 1.4,
      ALPHA: [0.22, 0.4, 0.66, 0.92, 0.09], WINDOW_RATE: 0.1, GLOW_SCALE: 2, BRACKET: 7, BOX_PAD: 5, BOX_A: 0.3, CROSS: 4, CROSS_A: 0.42,
      LABEL_A: 0.38, NEIGHBORS: 2, LINK_A: 0.16, LINK_LABEL_A: 0.22, LINK_LIFT: 2.2, LINK_FADE: 0.12, LINK_MIN: 14,
    };
    const OFF = 0, IN = 1, ON = 2, OUT = 3;
    const ink = rgbOf("--kf-accent"), mono = css("--kf-font-mono");
    const tint = (a) => `rgba(${ink}, ${Math.min(1, a).toFixed(4)})`;
    const x = cv.getContext("2d");
    // Integer hash that always gives the same value per cell position, so the same city stands on every reopen
    const hash3 = (i, j, k) => {
      let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1274126177);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const seeded = (i, j, k) => hash3(i, j, k + C.SEED);
    // Springs that follow without wobbling (value, velocity) — cloud · tracking box · distance number
    const damp = (v, to, vel, time, dt) => {
      const w = 2 / Math.max(1e-4, time), k = w * dt, e = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), d = v - to, t = (vel + w * d) * dt;
      return [to + (d + t) * e, (vel - w * t) * e];
    };
    // Cluster shapes: of 1–3 cells wide and tall, 3–6 cell ones, more cells are picked more often
    const SHAPES = [];
    let shapeSum = 0;
    for (let w = 1; w <= C.SIDE; w++) for (let h = 1; h <= C.SIDE; h++) { const a = w * h; if (a >= C.MIN && a <= C.MAX) { SHAPES.push({ w, h, a }); shapeSum += a; } }
    const shapeOf = (u) => { let r = u * shapeSum; for (const s of SHAPES) if ((r -= s.a) <= 0) return s; return SHAPES[SHAPES.length - 1]; };
    // The interval [t0, t1] where segment a→b lies inside the box — draw the connecting line only outside the box
    const clip = (ax, ay, bx, by, x0, y0, x1, y1) => {
      let t0 = 0, t1 = 1;
      for (const [d, lo, hi] of [[bx - ax, x0 - ax, x1 - ax], [by - ay, y0 - ay, y1 - ay]]) {
        if (d === 0) { if (lo > 0 || hi < 0) return null; continue; }
        let a = lo / d, b = hi / d;
        if (a > b) [a, b] = [b, a];
        t0 = Math.max(t0, a); t1 = Math.min(t1, b);
        if (t0 > t1) return null;
      }
      return [t0, t1];
    };
    const front = (s) => smooth(s) * (1 + C.WAVE_WIDTH) - C.WAVE_WIDTH;
    const reached = (p, phi) => smooth((p - phi) / C.WAVE_WIDTH + 1);
    const linkFade = (g, u) => {
      const a = g.waveU, b = g.onU - g.waveU;
      if (u <= a || u >= b) return 0;
      const f = Math.max(1e-6, C.LINK_FADE / g.period);
      return Math.min(1, (u - a) / f, (b - u) / f);
    };
    const GAUSS = (s) => (Math.exp(-4 * s * s) - Math.exp(-4)) / (1 - Math.exp(-4));

    let W = 0, H = 0, cell = C.CELL, here = false, clock = 0, lastDt = 0, grip = 0, nextId = 1;
    let groups = [];
    const pointer = { x: -1e5, y: -1e5 }, lag = { x: -1e5, y: -1e5 };
    const cloud = { x: -1e5, y: -1e5, vx: 0, vy: 0, sx: 0, sy: 0, svx: 0, svy: 0 };
    const track = { x0: 0, y0: 0, x1: 0, y1: 0, sx: 0, sy: 0, w: 0 };
    const lock = { x0: 0, y0: 0, x1: 0, y1: 0, tx: 0, ty: 0, v: 0, id: 0 }, lockVel = new Float64Array(6), lockLinks = new Map();

    // The screen is split into roughly 36 cells, one cluster per cell — two families (lifespan 1.37x) share turns evenly within each family so about 10 (7 on phone) are always on
    const layout = () => {
      const small = W < C.SM_W;
      cell = small ? C.CELL_SM : C.CELL;
      const live = small ? C.LIVE_SM : C.LIVE;
      const nx = Math.max(2, Math.round(Math.sqrt((C.SLOTS * W) / H))), ny = Math.max(2, Math.round(C.SLOTS / nx)), sw = W / nx, sh = H / ny, n = nx * ny;
      const life = new Float64Array(n), period = new Float64Array(n), phase = new Float64Array(n), families = [[], []];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const fam = seeded(i, j, 631) < 0.5 ? 0 : 1;
        life[j * nx + i] = (C.LIFE[0] + seeded(i, j, 181) * (C.LIFE[1] - C.LIFE[0])) * (fam ? C.FAMILY : 1);
        families[fam].push(j * nx + i);
      }
      for (const fam of families) {
        if (!fam.length) continue;
        fam.sort((a, b) => seeded(a % nx, (a / nx) | 0, 409) - seeded(b % nx, (b / nx) | 0, 409));
        const per = Math.max(0.5, (fam.reduce((s, k) => s + life[k], 0) * n) / (live * fam.length));
        fam.forEach((k, order) => {
          period[k] = per;
          phase[k] = ((((order + (seeded(k % nx, (k / nx) | 0, 457) - 0.5) * C.JITTER) / fam.length) % 1) + 1) % 1;
        });
      }
      const side = cell - C.GAP, windowCut = 1 - C.WINDOW_RATE;
      groups = [];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const { w, h } = shapeOf(seeded(i, j, 37));
        const freeX = Math.max(w + 1, Math.round(sw / cell)) - w, freeY = Math.max(h + 1, Math.round(sh / cell)) - h;
        const offX = Math.min(freeX, Math.floor(seeded(i, j, 103) * (freeX + 1))), offY = Math.min(freeY, Math.floor(seeded(i, j, 139) * (freeY + 1)));
        const padX = Math.ceil((C.BOX_PAD + 2) / cell), padY = Math.ceil((C.BOX_PAD + 13) / cell);
        const i0 = clamp(Math.round((i * sw) / cell) + offX, padX, Math.max(padX, Math.floor(W / cell) - w - padX));
        const j0 = clamp(Math.round((j * sh) / cell) + offY, padY, Math.max(padY, Math.floor(H / cell) - h - padX));
        const count = w * h, phi = new Float32Array(count), bucket = new Uint8Array(count), soft = new Float32Array(count);
        // Cells light up in sequence in a different direction per group (wave) — cells are projected onto the direction axis, stretched to 0–1 and mixed with jitter
        const ang = seeded(i, j, 311) * Math.PI * 2, ca = Math.cos(ang), sa = Math.sin(ang);
        const lo = Math.min(0, (w - 1) * ca) + Math.min(0, (h - 1) * sa), span = Math.max(1e-6, Math.max(0, (w - 1) * ca) + Math.max(0, (h - 1) * sa) - lo);
        for (let r = 0, k = 0; r < h; r++) for (let c = 0; c < w; c++, k++) {
          const gi = i0 + c, gj = j0 + r, u = hash3(gi, gj, 9173), ring = Math.min(c, w - 1 - c, r, h - 1 - r);
          phi[k] = clamp((c * ca + r * sa - lo) / span + (hash3(gi, gj, 5501) - 0.5) * C.WAVE_NOISE, 0, 1);
          bucket[k] = u >= windowCut ? 3 : u > 0.66 ? 2 : u > 0.33 ? 1 : 0;
          soft[k] = ring >= C.EDGE_RING ? 1 : 1 - C.EDGE_SOFT * (1 - ring / C.EDGE_RING) * hash3(gi, gj, 7717);
        }
        const k = j * nx + i, onU = Math.min(0.92, life[k] / period[k]);
        groups.push({
          i0, j0, w, h, cx: (i0 + (w - 1) / 2) * cell + side / 2, cy: (j0 + (h - 1) / 2) * cell + side / 2,
          period: period[k], phase: phase[k], onU, waveU: Math.min(C.WAVE_TIME / period[k], onU * 0.34),
          phi, bucket, soft, amp: new Float32Array(count), mode: OFF, seen: false, lift: 0, summon: 0, net: 0, id: 0, x0: 0, y0: 0, x1: 0, y1: 0, tx: 0, ty: 0, ni: -1,
        });
      }
    };
    const measure = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      x.setTransform(d, 0, 0, d, 0, 0);
      layout();
    };

    // Each group: on (fills in a wave) → staying on → off (drains in a wave) → rest. When the cursor cloud comes near, resting groups are called out too
    const update = (dt) => {
      const reach = C.REACH * Math.sqrt(W * H), side = cell - C.GAP, gripping = !reduce && grip > 0.5 && cloud.x > -1e4, summonR = C.CLOUD_R * C.SUMMON_REACH;
      for (const g of groups) {
        const u = (clock / g.period + g.phase) % 1, full = g.onU - g.waveU;
        let mode = OFF, p = 0;
        if (u < g.waveU) { mode = IN; p = front(u / g.waveU); } else if (u < full) { mode = ON; p = 1; } else if (u < g.onU) { mode = OUT; p = front((u - full) / g.waveU); }
        if (reduce) { mode = mode === OFF ? OFF : ON; p = 1; }
        const call = gripping && Math.hypot(g.cx - cloud.x, g.cy - cloud.y) < summonR ? 1 : 0;
        g.summon += (call - g.summon) * (1 - Math.exp(-(call > g.summon ? C.SUMMON_IN : C.SUMMON_OUT) * dt));
        if (g.summon < 0.002 && !call) g.summon = 0;
        const sp = g.summon > 0 ? front(Math.min(1, g.summon)) : 0, own = mode;
        if (g.summon > 0) mode = g.summon > 0.995 ? ON : mode === OFF ? IN : mode;
        g.mode = mode;
        g.net = Math.max(own === ON ? (reduce ? 1 : linkFade(g, u)) : 0, clamp((g.summon - 0.9) / 0.1, 0, 1));
        if (mode === OFF) { g.id = 0; g.lift = 0; g.seen = false; continue; }
        if (!g.id) g.id = nextId++;
        let c0 = g.w, c1 = -1, r0 = g.h, r1 = -1, sx = 0, sy = 0, n = 0;
        for (let r = 0, k = 0; r < g.h; r++) for (let c = 0; c < g.w; c++, k++) {
          const a = own === OFF ? 0 : own === ON ? 1 : own === IN ? reached(p, g.phi[k]) : 1 - reached(p, g.phi[k]);
          const v = mode === ON && g.summon > 0.995 ? 1 : Math.max(a, g.summon > 0 ? reached(sp, g.phi[k]) : 0);
          g.amp[k] = v;
          if (v > 0.5) { c0 = Math.min(c0, c); c1 = Math.max(c1, c); r0 = Math.min(r0, r); r1 = Math.max(r1, r); sx += c; sy += r; n++; }
        }
        g.seen = n > 0;
        if (g.seen) {
          g.x0 = (g.i0 + c0) * cell - C.BOX_PAD; g.y0 = (g.j0 + r0) * cell - C.BOX_PAD;
          g.x1 = (g.i0 + c1) * cell + side + C.BOX_PAD; g.y1 = (g.j0 + r1) * cell + side + C.BOX_PAD;
          g.tx = (g.i0 + sx / n) * cell + side / 2; g.ty = (g.j0 + sy / n) * cell + side / 2;
        }
        const px = cloud.x > -1e4 ? cloud.x : lag.x, py = cloud.x > -1e4 ? cloud.y : lag.y;
        g.lift = grip * smooth(1 - Math.hypot(g.cx - px, g.cy - py) / reach);
      }
    };
    // Connects the two closest items of the active group and writes the distance (px)
    const edges = [];
    const link = () => {
      edges.length = 0;
      const nodes = groups.filter((g) => g.net > 0.001 && g.seen);
      nodes.forEach((g, i) => (g.ni = i));
      if (nodes.length < 2) return;
      const done = new Set();
      for (const a of nodes) {
        const near = [];
        for (const b of nodes) {
          if (b === a) continue;
          const d2 = (b.cx - a.cx) ** 2 + (b.cy - a.cy) ** 2;
          let at = near.length;
          while (at > 0 && d2 < near[at - 1][1]) at--;
          if (at < C.NEIGHBORS) { near.splice(at, 0, [b.ni, d2]); if (near.length > C.NEIGHBORS) near.pop(); }
        }
        for (const [j, d2] of near) {
          const key = Math.min(a.ni, j) * 4096 + Math.max(a.ni, j);
          if (!done.has(key)) { done.add(key); edges.push({ a, b: nodes[j], d: Math.sqrt(d2) }); }
        }
      }
    };
    const drawLinks = () => {
      x.lineWidth = 1; x.font = `8px ${mono}`; x.textAlign = "center"; x.textBaseline = "middle";
      for (const { a, b, d } of edges) {
        const ta = clip(a.cx, a.cy, b.cx, b.cy, a.x0, a.y0, a.x1, a.y1), tb = clip(a.cx, a.cy, b.cx, b.cy, b.x0, b.y0, b.x1, b.y1);
        const s0 = ta ? ta[1] : 0, s1 = tb ? tb[0] : 1;
        if (s1 <= s0 || (s1 - s0) * d < C.LINK_MIN) continue;
        const dx = b.cx - a.cx, dy = b.cy - a.cy, x0 = a.cx + dx * s0, y0 = a.cy + dy * s0, x1 = a.cx + dx * s1, y1 = a.cy + dy * s1;
        const k = Math.min(a.net, b.net) * (1 + Math.max(a.lift, b.lift) * C.LINK_LIFT);
        x.strokeStyle = tint(C.LINK_A * k); x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
        x.fillStyle = tint(C.LINK_LABEL_A * k); x.fillText(String(Math.round(d)), (x0 + x1) / 2, (y0 + y1) / 2);
      }
      x.textAlign = "left"; x.textBaseline = "alphabetic";
    };
    // Four cell brightness levels (dark·mid·bright·window) and the glow around windows — each cell’s edge is slightly smaller
    const drawCells = (list, gain) => {
      const side = cell - C.GAP;
      for (let tier = 4; tier >= 0; tier--) {
        const want = tier === 4 ? 3 : tier;
        x.beginPath();
        let any = false;
        for (const g of list) for (let r = 0, k = 0; r < g.h; r++) for (let c = 0; c < g.w; c++, k++) {
          if (g.bucket[k] !== want || g.amp[k] <= 0.02) continue;
          const s = side * g.soft[k] * g.amp[k] * (tier === 4 ? C.GLOW_SCALE : 1), o = (side - s) / 2;
          x.rect((g.i0 + c) * cell + o, (g.j0 + r) * cell + o, s, s);
          any = true;
        }
        if (any) { x.fillStyle = tint(C.ALPHA[tier] * gain); x.fill(); }
      }
    };
    const drawShadows = (list) => {
      x.beginPath();
      let any = false;
      for (const g of list) for (let r = 0, k = 0; r < g.h; r++) for (let c = 0; c < g.w; c++, k++) {
        const a = g.amp[k];
        if (a <= 0.02) continue;
        const s = cell * a, o = (cell - s) / 2;
        for (let st = 0; st <= C.SHADOW_STEPS; st++) x.rect((g.i0 + c + st * C.SHADOW_DX) * cell + o, (g.j0 + r + st * C.SHADOW_DY) * cell + o, s, s);
        any = true;
      }
      if (any) { x.fillStyle = tint(C.SHADOW); x.fill(); }
    };
    const corners = (x0, y0, x1, y1, len) => {
      const bw = Math.min(len, (x1 - x0) / 2), bh = Math.min(len, (y1 - y0) / 2);
      x.moveTo(x0, y0 + bh); x.lineTo(x0, y0); x.lineTo(x0 + bw, y0);
      x.moveTo(x1 - bw, y0); x.lineTo(x1, y0); x.lineTo(x1, y0 + bh);
      x.moveTo(x1, y1 - bh); x.lineTo(x1, y1); x.lineTo(x1 - bw, y1);
      x.moveTo(x0 + bw, y1); x.lineTo(x0, y1); x.lineTo(x0, y1 - bh);
    };
    const cross = (cx, cy, len) => { x.moveTo(cx - len, cy); x.lineTo(cx + len, cy); x.moveTo(cx, cy - len); x.lineTo(cx, cy + len); };
    const tag = (pre, id) => `${pre}${String(id).padStart(2, "0")}`;
    const drawBoxes = (list, gain) => {
      if (!list.length) return;
      x.lineWidth = 1;
      x.strokeStyle = tint(C.BOX_A * gain); x.beginPath();
      for (const g of list) corners(g.x0, g.y0, g.x1, g.y1, C.BRACKET);
      x.stroke();
      x.strokeStyle = tint(C.CROSS_A * gain); x.beginPath();
      for (const g of list) cross(g.tx, g.ty, C.CROSS);
      x.stroke();
      x.font = `9px ${mono}`; x.textBaseline = "alphabetic"; x.fillStyle = tint(C.LABEL_A * gain);
      for (const g of list) x.fillText(tag("B", g.id), Math.max(g.x0, 2), Math.max(g.y0 - 4, 9));
    };
    // Cursor cloud: a Gaussian blob stamped per cell stretches a tail opposite to the movement and its edges ripple
    const tiers = Array.from({ length: C.TIERS }, () => []);
    const drawCloud = () => {
      track.w = 0;
      const alpha = C.CLOUD_A * grip;
      if (alpha < 0.004 || cloud.x < -1e4) return;
      const R = C.CLOUD_R, stretch = C.STRETCH_MAX * (1 - Math.exp(-Math.hypot(cloud.sx, cloud.sy) / C.STRETCH_SPEED)), ang = Math.atan2(cloud.sy, cloud.sx);
      const sr = stretch / C.STRETCH_MAX, wob = C.WOBBLE + C.WOBBLE_SPEED * sr, ahead = R * (1 + stretch * 0.15), behind = R * (1 + stretch * C.TAIL), across = R / (1 + stretch * 0.45);
      const far = Math.max(ahead, behind) * (1 + wob), haze = alpha * C.HAZE;
      if (haze > 0.002) {
        const back = R * stretch * C.TAIL * 0.5, hx = cloud.x - Math.cos(ang) * back, hy = cloud.y - Math.sin(ang) * back, hr = R * (1 + stretch * C.TAIL * 0.4);
        const glow = x.createRadialGradient(hx, hy, 0, hx, hy, hr);
        for (let s = 0; s <= 10; s++) glow.addColorStop(s / 10, tint(haze * GAUSS(s / 10)));
        x.fillStyle = glow; x.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
      }
      const ca = Math.cos(ang), sa = Math.sin(ang), side = cell - C.GAP, top = C.TIERS - 1;
      tiers.forEach((t) => (t.length = 0));
      const wobble = (theta, along, gx, gy) => {
        const ring = 0.5 * Math.sin(2 * theta + clock * 0.9) + 0.3 * Math.sin(3 * theta - clock * 1.37 + 1.3) + 0.2 * Math.sin(5 * theta + clock * 2.11 + 4.1);
        const field = Math.sin(gx * 0.019 + clock * 0.73) * Math.sin(gy * 0.023 - clock * 0.51) + 0.5 * Math.sin((gx - gy) * 0.031 + clock * 1.13);
        return (0.62 * ring + 0.38 * (field / 1.5)) * (1 + C.TRAIL * sr * clamp(-along, 0, 1));
      };
      Object.assign(track, { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9, sx: 0, sy: 0, w: 0 });
      const i0 = Math.max(0, Math.floor((cloud.x - far) / cell)), i1 = Math.min(Math.floor(W / cell), Math.ceil((cloud.x + far) / cell));
      const j0 = Math.max(0, Math.floor((cloud.y - far) / cell)), j1 = Math.min(Math.floor(H / cell), Math.ceil((cloud.y + far) / cell));
      for (let j = j0; j <= j1; j++) {
        const gy = j * cell + side / 2;
        for (let i = i0; i <= i1; i++) {
          const gx = i * cell + side / 2, dx = gx - cloud.x, dy = gy - cloud.y, a = dx * ca + dy * sa, b = -dx * sa + dy * ca;
          const ua = a / (a >= 0 ? ahead : behind), ub = b / across, shape = 1 + wob * wobble(Math.atan2(dy, dx), ua, gx, gy);
          const d = Math.sqrt(ua * ua + ub * ub) / Math.max(0.35, shape);
          if (d >= 1) continue;
          let v = GAUSS(d);
          v = clamp(v + (hash3(i, j, 4049) - 0.5) * C.GRAIN * (1 - v), 0, 1);
          if (v > C.TRACK_THRESH) {
            track.x0 = Math.min(track.x0, i * cell); track.y0 = Math.min(track.y0, j * cell);
            track.x1 = Math.max(track.x1, i * cell + side); track.y1 = Math.max(track.y1, j * cell + side);
            track.sx += gx * v; track.sy += gy * v; track.w += v;
          }
          const s = side * Math.sqrt(v);
          if (s < C.MIN_SIDE) continue;
          tiers[Math.min(top, Math.floor(v * C.TIERS))].push(i * cell + (side - s) / 2, j * cell + (side - s) / 2, s);
        }
      }
      tiers.forEach((t, k) => {
        if (!t.length) return;
        x.beginPath();
        for (let n = 0; n < t.length; n += 3) x.rect(t[n], t[n + 1], t[n + 2], t[n + 2]);
        x.fillStyle = tint(alpha * (0.45 + (0.55 * (k + 1)) / C.TIERS)); x.fill();
      });
    };
    const springCloud = (dt) => {
      if (dt <= 0 || cloud.x < -1e4) return;
      if (pointer.x > -1e4) {
        [cloud.x, cloud.vx] = damp(cloud.x, pointer.x, cloud.vx, C.CLOUD_SMOOTH, dt);
        [cloud.y, cloud.vy] = damp(cloud.y, pointer.y, cloud.vy, C.CLOUD_SMOOTH, dt);
      } else cloud.vx = cloud.vy = 0;
      [cloud.sx, cloud.svx] = damp(cloud.sx, cloud.vx, cloud.svx, C.STRETCH_SMOOTH, dt);
      [cloud.sy, cloud.svy] = damp(cloud.sy, cloud.vy, cloud.svy, C.STRETCH_SMOOTH, dt);
    };
    // Holds the area covered by the cloud with a big bracket (N00) and extends lines to up to three nearby groups to measure distance
    const drawTrack = () => {
      const dt = lastDt, has = track.w > 0 && grip > 0.02;
      if (has) {
        const tx = track.sx / track.w, ty = track.sy / track.w;
        if (lock.v < 0.01) { Object.assign(lock, { x0: track.x0, y0: track.y0, x1: track.x1, y1: track.y1, tx, ty, id: nextId++ }); lockVel.fill(0); }
        else if (dt > 0) {
          ["x0", "y0", "x1", "y1"].forEach((key, n) => ([lock[key], lockVel[n]] = damp(lock[key], track[key], lockVel[n], C.TRACK_SMOOTH, dt)));
          [lock.tx, lockVel[4]] = damp(lock.tx, tx, lockVel[4], C.TRACK_SMOOTH * 0.6, dt);
          [lock.ty, lockVel[5]] = damp(lock.ty, ty, lockVel[5], C.TRACK_SMOOTH * 0.6, dt);
        }
      }
      lock.v += ((has ? 1 : 0) - lock.v) * (1 - Math.exp(-(has ? C.LOCK_IN : C.LOCK_OUT) * dt));
      if (!has && lock.v < 0.01) { lock.v = 0; lockLinks.clear(); return; }
      const k = lock.v * grip;
      if (k < 0.01) return;
      const pad = C.BOX_PAD + C.LOCK_SPAN * (1 - smooth(lock.v)), bx0 = lock.x0 - pad, by0 = lock.y0 - pad, bx1 = lock.x1 + pad, by1 = lock.y1 + pad;
      const picks = [];
      for (const g of groups) {
        if (!g.seen || g.net < 0.05) continue;
        let d = Math.hypot(g.cx - lock.tx, g.cy - lock.ty);
        if (lockLinks.get(g)?.w > 0.5) d *= 0.85;
        let at = picks.length;
        while (at > 0 && d < picks[at - 1][1]) at--;
        if (at < C.LOCK_LINKS) { picks.splice(at, 0, [g, d]); if (picks.length > C.LOCK_LINKS) picks.pop(); }
      }
      const chosen = new Set(picks.map(([g]) => g));
      for (const g of chosen) if (!lockLinks.has(g)) lockLinks.set(g, { w: 0, d: Math.hypot(g.cx - lock.tx, g.cy - lock.ty), dv: 0 });
      const ease = 1 - Math.exp(-4 * dt);
      x.lineWidth = 1; x.font = `8px ${mono}`; x.textAlign = "center"; x.textBaseline = "middle";
      for (const [g, L] of lockLinks) {
        const want = chosen.has(g) && g.seen ? 1 : 0;
        L.w += (want - L.w) * ease;
        if (L.w < 0.01 && !want) { lockLinks.delete(g); continue; }
        if (!g.seen) continue;
        const dist = Math.hypot(g.cx - lock.tx, g.cy - lock.ty);
        if (dt > 0) [L.d, L.dv] = damp(L.d, dist, L.dv, 0.25, dt);
        const ta = clip(lock.tx, lock.ty, g.cx, g.cy, bx0, by0, bx1, by1), tb = clip(lock.tx, lock.ty, g.cx, g.cy, g.x0, g.y0, g.x1, g.y1);
        const s0 = ta ? ta[1] : 0, s1 = tb ? tb[0] : 1;
        if (s1 <= s0 || (s1 - s0) * dist < C.LINK_MIN) continue;
        const dx = g.cx - lock.tx, dy = g.cy - lock.ty, x0 = lock.tx + dx * s0, y0 = lock.ty + dy * s0, x1 = lock.tx + dx * s1, y1 = lock.ty + dy * s1;
        const grow = smooth(L.w), strength = k * g.net * grow;
        x.strokeStyle = tint(C.LINK_A * C.TRACK_GAIN * strength); x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + (x1 - x0) * grow, y0 + (y1 - y0) * grow); x.stroke();
        if (grow > 0.9) { x.fillStyle = tint(C.LINK_LABEL_A * C.TRACK_GAIN * strength * (grow - 0.9) * 10); x.fillText(String(Math.round(L.d)), (x0 + x1) / 2, (y0 + y1) / 2); }
      }
      x.textAlign = "left"; x.textBaseline = "alphabetic";
      x.strokeStyle = tint(C.BOX_A * C.TRACK_GAIN * k); x.beginPath(); corners(bx0, by0, bx1, by1, C.BRACKET * 1.5); x.stroke();
      x.strokeStyle = tint(C.CROSS_A * C.TRACK_GAIN * k); x.beginPath(); cross(lock.tx, lock.ty, C.CROSS * 1.5); x.stroke();
      x.font = `9px ${mono}`; x.fillStyle = tint(C.LABEL_A * C.TRACK_GAIN * k);
      x.fillText(tag("N", lock.id), Math.max(bx0, 2), Math.max(by0 - 4, 9));
    };
    const lifted = Array.from({ length: C.LIFT_STEPS }, () => []);
    const frame = (dt = 0) => {
      if (dt > 0) clock += dt;
      lastDt = dt;
      update(dt);
      link();
      x.clearRect(0, 0, W, H);
      lifted.forEach((l) => (l.length = 0));
      const shown = groups.filter((g) => g.mode !== OFF && g.seen);
      for (const g of shown) lifted[Math.round(g.lift * (C.LIFT_STEPS - 1))].push(g);
      drawCloud();
      drawShadows(shown);
      drawLinks();
      lifted.forEach((list, e) => { const gain = 1 + (e / (C.LIFT_STEPS - 1)) * C.LIFT; drawCells(list, gain); drawBoxes(list, gain); });
      drawTrack();
    };

    addEventListener("pointermove", (e) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
      if (lag.x < -1e4) { lag.x = pointer.x; lag.y = pointer.y; }
      if (cloud.x < -1e4) { cloud.x = pointer.x; cloud.y = pointer.y; }
    });
    document.documentElement.addEventListener("pointerleave", () => { pointer.x = pointer.y = -1e5; });
    addEventListener("snap:section", (e) => {
      const on = !!e.detail?.panel?.contains(cv);
      if (on !== here) { here = on; if (here) frame(); }
    });
    let t = 0;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { measure(); frame(); }, 150); });
    measure();
    frame();
    if (reduce) return;
    gsap.ticker.add((time, delta) => {
      if (!here) return;
      const has = pointer.x > -1e4;
      if (has) { lag.x += (pointer.x - lag.x) * C.CURSOR_EASE; lag.y += (pointer.y - lag.y) * C.CURSOR_EASE; }
      grip += ((has ? 1 : 0) - grip) * C.GRIP_EASE;
      const dt = Math.min(delta, 50) / 1000;
      springCloud(dt);
      frame(dt);
    });
  }

  /* ───────── Text-dot art (shared by eye and horse) ───────── */
  // For each cell the image is read as 2×2 dots to get average brightness and a dark-dot share, then brightness is stamped as a letter ramp and a three-step color (original technique)
  function glyphStage(wrap, cv, opt) {
    const SS = 2, tiers = [opt.ink, opt.dim, opt.faint];
    const off = document.createElement("canvas"), ox = off.getContext("2d", { willReadFrequently: true });
    const st = { g: null, cell: opt.cell, cols: 0, rows: 0, vals: null, reveal: reduce ? 1 : 0, here: false };
    st.measure = () => {
      st.g = fit(cv, 2);
      st.cell = st.g.h < opt.smH ? opt.cellSm : opt.cell;
      st.cols = Math.floor(st.g.w / st.cell); st.rows = Math.floor(st.g.h / st.cell);
      off.width = Math.max(1, st.cols * SS); off.height = Math.max(1, st.rows * SS);
      st.vals = new Float32Array(st.cols * st.rows);
    };
    // Draw the picture box (in cells) at SS times, then to cell values — transparent places are 0
    st.sample = (box, sx, sy, frame) => {
      const { cols, rows, vals } = st, w = cols * SS;
      ox.clearRect(0, 0, off.width, off.height);
      ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = "high";
      opt.paint(ox, (box.dx + sx) * SS, (box.dy + sy) * SS, box.dw * SS, box.dh * SS, frame);
      const d = ox.getImageData(0, 0, off.width, off.height).data;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        let sum = 0, hit = 0;
        for (let v = 0; v < SS; v++) for (let u = 0; u < SS; u++) {
          const p = ((r * SS + v) * w + c * SS + u) * 4, lum = (d[p] + d[p + 1] + d[p + 2]) / 765;
          const k = (opt.dark ? 1 - lum : lum) * (d[p + 3] / 255);
          sum += k; if (k > 0.55) hit++;
        }
        vals[r * cols + c] = opt.tone(sum / (SS * SS), hit / (SS * SS), c, r);
      }
    };
    st.glyph = (c, r, tier, i, dx = 0, dy = 0) => {
      st.g.x.fillStyle = tiers[tier];
      st.g.x.fillText(RAMP[i], (st.g.w - st.cols * st.cell) / 2 + (c + 0.5) * st.cell + dx, (st.g.h - st.rows * st.cell) / 2 + (r + 0.5) * st.cell + dy);
    };
    st.draw = (disturb) => {
      const { g, cols, rows, vals } = st;
      g.x.clearRect(0, 0, g.w, g.h);
      g.x.textAlign = "center"; g.x.textBaseline = "middle";
      g.x.font = `400 ${Math.round(st.cell * 1.15)}px ${css("--kf-font-glyph") || css("--kf-font-display")}`;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (st.reveal < 1 && hash(c, r) > st.reveal) continue;
        const m = disturb ? disturb(c, r) : null, v = m ? m.v : vals[r * cols + c];
        if (v < opt.minLum) continue;
        const q = clamp(v, 0, 0.999), tier = m && m.tier >= 0 ? m.tier : q > 0.55 ? 0 : q > 0.22 ? 1 : 2;
        st.glyph(c, r, tier, clamp(Math.floor(q * RAMP.length) + (m ? m.shift : 0), 0, RAMP.length - 1), m ? m.x : 0, m ? m.y : 0);
      }
    };
    // On entering the panel, after .15s cells light up in random order over 1.1s power2.out. On leaving, it stops after .9s
    let leave = 0;
    addEventListener("snap:section", (e) => {
      clearTimeout(leave);
      if (e.detail?.panel?.contains(wrap)) {
        if (!st.cols) st.measure();
        st.here = true;
        if (reduce) { st.reveal = 1; opt.enter?.(); return; }
        gsap.killTweensOf(st);
        st.reveal = 0;
        opt.enter?.();
        gsap.to(st, { reveal: 1, duration: 1.1, delay: 0.15, ease: "power2.out" });
      } else if (st.here) leave = setTimeout(() => (st.here = false), 900);
    });
    let t = 0;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { st.measure(); opt.resize?.(); }, 150); });
    return st;
  }
  // A box (in cell units) fitted to the aspect ratio of the photo to be dotted — fills the height to fit, and if wide, fits the width to limit
  const glyphBox = (st, ratio, fitH, limit) => {
    let dh = st.rows * fitH, dw = dh * ratio;
    if (dw > st.cols * limit) { dw = st.cols * limit; dh = dw / ratio; }
    return { dw, dh, dx: (st.cols - dw) / 2, dy: (st.rows - dh) / 2 };
  };

  /* ───────── 4. Dot eyes watching the cursor ───────── */
  // Placeholder eye: grainy skin, brows, almond-shaped sclera, iris, the edges are a staircase cut from the photo in big pixels
  function paintEye(x, bx, by, bw, bh) {
      // Skin: gray plate with visible grain
      const skin = x.createLinearGradient(0, by, 0, by + bh);
      skin.addColorStop(0, gray(92)); skin.addColorStop(0.5, gray(140)); skin.addColorStop(1, gray(74));
      x.fillStyle = skin; x.fillRect(bx, by, bw, bh);
      x.strokeStyle = gray(20, 0.35); x.lineWidth = 1;
      for (let i = 0; i < 9; i++) {
        const yy = by + bh * (0.12 + i * 0.1);
        x.beginPath(); x.moveTo(bx, yy); x.quadraticCurveTo(bx + bw * 0.5, yy + bh * 0.04 * Math.sin(i), bx + bw, yy - bh * 0.02); x.stroke();
      }
      // Eyebrow
      x.fillStyle = gray(30);
      x.beginPath(); x.ellipse(bx + bw * 0.45, by + bh * 0.2, bw * 0.38, bh * 0.05, -0.08, 0, Math.PI * 2); x.fill();
      // Almond-shaped eye whites wrapped by the eyelids
      const ex = bx + bw * 0.43, ey = by + bh * 0.44, rx = bw * 0.3, ry = bh * 0.14;
      x.save();
      x.beginPath();
      x.moveTo(ex - rx, ey);
      x.quadraticCurveTo(ex, ey - ry * 2.1, ex + rx, ey - ry * 0.1);
      x.quadraticCurveTo(ex, ey + ry * 1.7, ex - rx, ey);
      x.closePath();
      x.fillStyle = gray(214); x.fill();
      x.clip();
      // Iris and pupil (like the original photo, they don’t move inside the image — the gaze comes from parallax of the whole image and reflected-light letters)
      const ix = bx + bw * 0.425, iy = ey, ir = bh * 0.12;
      const iris = x.createRadialGradient(ix, iy, ir * 0.2, ix, iy, ir);
      iris.addColorStop(0, gray(90)); iris.addColorStop(0.55, gray(154)); iris.addColorStop(0.85, gray(74)); iris.addColorStop(1, gray(26));
      x.fillStyle = iris; x.beginPath(); x.arc(ix, iy, ir, 0, Math.PI * 2); x.fill();
      x.fillStyle = gray(0); x.beginPath(); x.arc(ix, iy, ir * 0.42, 0, Math.PI * 2); x.fill();
      x.fillStyle = gray(255); x.beginPath(); x.arc(ix - ir * 0.3, iy - ir * 0.35, ir * 0.16, 0, Math.PI * 2); x.fill();
      // Upper eyelid shadow
      x.fillStyle = gray(0, 0.45);
      x.beginPath(); x.ellipse(ex, ey - ry * 1.05, rx * 1.1, ry * 0.55, 0, 0, Math.PI * 2); x.fill();
      x.restore();
      // Eyelash line
      x.strokeStyle = gray(14); x.lineWidth = 2;
      x.beginPath(); x.moveTo(ex - rx, ey); x.quadraticCurveTo(ex, ey - ry * 2.1, ex + rx, ey - ry * 0.1); x.stroke();
    const img = x.getImageData(0, 0, x.canvas.width, x.canvas.height), W = x.canvas.width, step = Math.max(1, bw / 110); // One stair step ≈ one dot cell (the box is a bit over 110 cells wide)
    for (let r = Math.max(0, Math.floor(by)); r < Math.min(x.canvas.height, by + bh); r++) for (let c = Math.max(0, Math.floor(bx)); c < Math.min(W, bx + bw); c++) {
      const lc = (c - bx) / step, lr = (r - by) / step, edge = Math.min(lc, lr, bw / step - 1 - lc, bh / step - 1 - lr);
      if (edge < 8 && hash(Math.floor(lc / 4), Math.floor(lr / 4)) < 0.35 * (1 - edge / 8) + 0.08) img.data[(r * W + c) * 4 + 3] = 0;
    }
    x.putImageData(img, 0, 0);
  }
  function eye(wrap) {
    const cv = wrap.querySelector("canvas");
    const C = {
      FIT: 0.94, MIN_LUM: 0.03, KNEE: 0.35, KNEE_GAMMA: 0.6, EYE_X: 0.43, EYE_Y: 0.44, EYE_RX: 0.3, EYE_RY: 0.14, GAIN: 1.9, PIVOT: 0.2,
      GAMMA: 0.85, PARALLAX: 1.6, IRIS_X: 0.425, IRIS_Y: 0.44, GLINT: 1.4, FOLLOW: 0.5, RATIO: 0.8,
    };
    const look = { x: 0, y: 0 }, art = document.createElement("canvas");
    let box = null, sx = 0, sy = 0, cached = null;
    const ratio = () => { const s = sourceOf(wrap); return s ? (s.videoWidth || s.naturalWidth) / (s.videoHeight || s.naturalHeight) : C.RATIO; };
    const st = glyphStage(wrap, cv, {
      cell: 6, cellSm: 4, smH: 420, minLum: C.MIN_LUM,
      ink: paintOf("--kf-ink"), dim: paintOf("--site-glyph-dim"), faint: paintOf("--site-glyph-faint"),
      // Placeholder artwork reuses a once-drawn panel shifted by the parallax offset when the box size is the same (stair-step clipping is per pixel so it is heavy)
      paint(x, X, Y, W, H) {
        const s = sourceOf(wrap);
        if (s) { x.drawImage(s, X, Y, W, H); return; }
        const aw = Math.ceil(W), ah = Math.ceil(H);
        if (art.width !== aw || art.height !== ah) { art.width = aw; art.height = ah; paintEye(art.getContext("2d", { willReadFrequently: true }), 0, 0, W, H); }
        x.drawImage(art, X, Y);
      },
      // Lift dark areas from below the knee (.35), revive the cells a thin line passed through, and raise contrast around the eyes 1.9x
      tone(mean, fill, c, r) {
        let m = mean < C.KNEE ? Math.pow(mean / C.KNEE, C.KNEE_GAMMA) * C.KNEE : mean;
        if (mean < 0.3 && fill >= 0.4) m = Math.max(m, Math.min(0.85, fill * 1.6));
        const u = (c + 0.5 - sx - box.dx) / box.dw, v = (r + 0.5 - sy - box.dy) / box.dh;
        const k = clamp((1.2 - Math.hypot((u - C.EYE_X) / C.EYE_RX, (v - C.EYE_Y) / C.EYE_RY)) / 0.4, 0, 1);
        if (k > 0) m = clamp(C.PIVOT + (m - C.PIVOT) * (1 + (C.GAIN - 1) * k), 0, 1);
        return Math.pow(m, C.GAMMA);
      },
      resize: () => { cached = null; render(); },
    });
    // The whole image shifts opposite the cursor by cell-unit parallax, and the two reflected-light letters move 1.4 cells further toward the cursor
    const render = () => {
      if (!st.cols) return;
      box = glyphBox(st, ratio(), C.FIT, 0.98);
      const nx = -look.x * C.PARALLAX * 0.6, ny = -look.y * C.PARALLAX * 0.4;
      if (!cached || Math.abs(nx - cached[0]) >= 0.01 || Math.abs(ny - cached[1]) >= 0.01) { sx = nx; sy = ny; st.sample(box, sx, sy); cached = [nx, ny]; }
      st.draw();
      if (st.reveal > 0.6) {
        const gx = Math.round(box.dx + sx + C.IRIS_X * box.dw + look.x * C.GLINT), gy = Math.round(box.dy + sy + C.IRIS_Y * box.dh + look.y * C.GLINT * 0.8);
        if (gx >= 0 && gx < st.cols - 1 && gy >= 0 && gy < st.rows) { st.glyph(gx, gy, 0, RAMP.length - 1); st.glyph(gx + 1, gy, 1, 3); }
      }
    };
    const start = () => {
      st.measure();
      render();
      if (reduce) return;
      const qx = gsap.quickTo(look, "x", { duration: C.FOLLOW, ease: "power3.out" }), qy = gsap.quickTo(look, "y", { duration: C.FOLLOW, ease: "power3.out" });
      addEventListener("pointermove", (e) => {
        const r = cv.getBoundingClientRect();
        if (!r.width) return;
        qx(clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1));
        qy(clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1));
      });
      let lx = 9, ly = 9, lr = -1;
      gsap.ticker.add(() => {
        if (!st.here || (Math.abs(look.x - lx) <= 0.002 && Math.abs(look.y - ly) <= 0.002 && st.reveal === lr)) return;
        lx = look.x; ly = look.y; lr = st.reveal;
        render();
      });
    };
    wrap.querySelector(".ac-src")?.addEventListener("load", () => { cached = null; render(); });
    document.fonts?.ready ? document.fonts.ready.then(start) : start();
  }

  /* ───────── 5. Running dot text ───────── */
  // Placeholder horse: a side-view gallop with a jockey, cycling 15 frames at 16fps (if a photo strip is added, it uses those cells in order)
  function paintHorse(x, w, h, t) {
    const a = t * Math.PI * 2, bob = Math.sin(a * 2) * 0.012;
    const P = (u, v) => [w * u, h * (v + bob)];
    const line = (pts, width, color) => {
      x.strokeStyle = color; x.lineWidth = width * h; x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath(); x.moveTo(...P(...pts[0])); for (const p of pts.slice(1)) x.lineTo(...P(...p)); x.stroke();
    };
    // Legs: two segments from hip to knee and hoof, front and back fold and extend alternately
    const leg = (hu, hv, off, back, color) => {
      const ph = a + off * Math.PI * 2, swing = Math.sin(ph) * 0.55, bend = Math.max(0, Math.cos(ph)) * (back ? -1.1 : 1.1);
      const k = [hu + Math.sin(swing) * 0.11, hv + Math.cos(swing) * 0.13];
      const f = [k[0] + Math.sin(swing + bend) * 0.11, k[1] + Math.cos(swing + bend) * 0.13];
      line([[hu, hv], k, f], 0.035, color);
    };
    x.fillStyle = gray(255); x.fillRect(0, 0, w, h);
    leg(0.36, 0.5, 0.55, true, gray(138)); leg(0.64, 0.5, 0.05, false, gray(138));
    // Body · neck · head
    const body = x.createLinearGradient(w * 0.3, 0, w * 0.7, 0);
    body.addColorStop(0, gray(154)); body.addColorStop(0.5, gray(74)); body.addColorStop(1, gray(122));
    x.fillStyle = body;
    x.beginPath(); x.ellipse(...P(0.5, 0.44), w * 0.19, h * 0.11, 0, 0, Math.PI * 2); x.fill();
    line([[0.64, 0.4], [0.72, 0.26], [0.75, 0.22]], 0.09, gray(85));
    line([[0.74, 0.21], [0.83, 0.3]], 0.06, gray(68));
    line([[0.72, 0.22], [0.71, 0.16]], 0.02, gray(102));
    // Mane and tail
    line([[0.31, 0.4], [0.24, 0.42 + Math.sin(a) * 0.04], [0.19, 0.5 + Math.sin(a) * 0.05]], 0.035, gray(106));
    leg(0.38, 0.5, 0.45, true, gray(58)); leg(0.62, 0.5, 0.95, false, gray(58));
    // Cohort
    line([[0.5, 0.33], [0.49, 0.2]], 0.07, gray(42));
    x.fillStyle = gray(34); x.beginPath(); x.arc(...P(0.5, 0.14), h * 0.045, 0, Math.PI * 2); x.fill();
    line([[0.5, 0.24], [0.6, 0.27], [0.68, 0.26]], 0.025, gray(51));
    line([[0.49, 0.33], [0.55, 0.42], [0.52, 0.5]], 0.035, gray(46));
  }
  function horse(wrap) {
    const cv = wrap.querySelector("canvas");
    const C = {
      FRAMES: 15, FPS: 16, FIT: 0.68, THRESH: 0.4, GAMMA: 0.5, MIN_LUM: 0.06, STROKE_MEAN: 0.5, STROKE_FILL: 0.4, STROKE_LIFT: 1.6,
      R: 30, AMP: 7, TURB: 4, EXPAND: 0.7, JITTER: 0.6, DECAY: 0.22, FOLLOW: 0.3, RATIO: 1.6,
    };
    // Noise smoothly joined between grid values — hover marks spread as blotches instead of being ragged cell by cell
    const noise = (u, v) => {
      const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, a = smooth(fu), b = smooth(fv);
      const p = hash(i, j), q = hash(i + 1, j), r = hash(i, j + 1), s = hash(i + 1, j + 1);
      return p + (q - p) * a + (r - p) * b + (p - q - r + s) * a * b;
    };
    const hover = { x: -1e4, y: -1e4, a: 0 };
    let inside = false, clock = 0, play = 0, shown = -1, sampled = -1;
    const strip = () => { const s = sourceOf(wrap); return s && { s, fw: (s.naturalWidth || s.videoWidth) / C.FRAMES, fh: s.naturalHeight || s.videoHeight }; };
    const st = glyphStage(wrap, cv, {
      cell: 6, cellSm: 4, smH: 420, minLum: C.MIN_LUM, dark: true,
      ink: paintOf("--site-paper-ink"), dim: paintOf("--site-glyph-dim"), faint: paintOf("--site-paper-faint"),
      paint(x, X, Y, W, H, frame) {
        const t = strip();
        if (t) { x.drawImage(t.s, t.fw * frame, 0, t.fw, t.fh, X, Y, W, H); return; }
        x.save(); x.translate(X + W / 2, Y + H / 2); x.scale(1.25, 1.25); x.translate(-W / 2, -H / 2);
        paintHorse(x, W, H, frame / C.FRAMES);
        x.restore();
      },
      // Only the dark share of the white background: below threshold .4 is emptied, above it gets gamma .5, and cells that thin strokes passed over are kept
      tone(mean, fill) {
        const c = mean < C.STROKE_MEAN && fill >= C.STROKE_FILL ? Math.max(mean, Math.min(0.9, fill * C.STROKE_LIFT)) : mean;
        return c <= C.THRESH ? 0 : Math.pow((c - C.THRESH) / (1 - C.THRESH), C.GAMMA);
      },
      enter: () => { play = 0; shown = -1; },
      resize: () => { sampled = -1; render(Math.floor(play) % C.FRAMES); },
    });
    // Cells within a 30-cell cursor radius are pushed outward by a noise blotch to read another cell’s value, some are erased and some shake their letter and color
    const disturb = (c, r) => {
      if (hover.a <= 0.02) return null;
      const dx = c - hover.x, dy = r - hover.y, dist = Math.hypot(dx, dy);
      if (dist >= C.R) return null;
      const w = (1 - dist / C.R) * (noise(c * 0.16 + clock * 0.5, r * 0.16 - clock * 0.3) * 1.6 - 0.2);
      if (w <= 0.01) return null;
      const k = Math.min(1, w) * hover.a, z = Math.floor(clock * 9), q = k * k * C.AMP * (0.8 + 0.3 * Math.sin(clock * 7 - dist * 1.5));
      const nx = dist > 0.001 ? dx / dist : 0, ny = dist > 0.001 ? dy / dist : 0;
      const ang = hash(c * 7 + 1, r * 13 + z) * Math.PI * 2, tr = hash(c * 3 + 5, r * 11 + z * 3) * C.TURB * k, tx = Math.cos(ang) * tr, ty = Math.sin(ang) * tr;
      const sc = Math.round(c - nx * q + tx), sr = Math.round(r - ny * q + ty);
      let v = sc >= 0 && sc < st.cols && sr >= 0 && sr < st.rows ? st.vals[sr * st.cols + sc] : 0;
      if (hash(c * 5 + 11, r * 7 + z) < k * C.DECAY) v = 0;
      const j = hash(c + 37, r * 3 + z), shaken = j < k * C.JITTER;
      return { v, shift: shaken ? (Math.floor(j * 997) % 7) - 3 : 0, tier: shaken ? Math.floor(j * 331) % 3 : -1, x: (nx * q * C.EXPAND + tx * 0.5) * st.cell, y: (ny * q * C.EXPAND + ty * 0.5) * st.cell };
    };
    const render = (frame) => {
      if (!st.cols) return;
      if (sampled !== frame) {
        const t = strip();
        st.sample(glyphBox(st, t ? t.fw / t.fh : C.RATIO, C.FIT, 0.94), 0, 0, frame);
        sampled = frame;
      }
      st.draw(hover.a > 0.02 ? disturb : null);
      shown = frame;
    };
    const start = () => {
      st.measure();
      render(0);
      if (reduce) return;
      const qx = gsap.quickTo(hover, "x", { duration: C.FOLLOW, ease: "power2.out" }), qy = gsap.quickTo(hover, "y", { duration: C.FOLLOW, ease: "power2.out" });
      addEventListener("pointermove", (e) => {
        if (!st.cols) return;
        const r = cv.getBoundingClientRect(), c = (e.clientX - r.left - (r.width - st.cols * st.cell) / 2) / st.cell, w = (e.clientY - r.top - (r.height - st.rows * st.cell) / 2) / st.cell;
        inside = e.clientY >= r.top && e.clientY <= r.bottom && c >= 0 && c < st.cols && w >= 0 && w < st.rows;
        if (hover.x < -9000) { hover.x = c; hover.y = w; }
        qx(c); qy(w);
      });
      gsap.ticker.add((time, delta) => {
        if (!st.here) return;
        const dt = Math.min(delta, 50) / 1000;
        play = (play + dt * C.FPS) % C.FRAMES;
        clock += dt;
        hover.a += ((inside ? 1 : 0) - hover.a) * Math.min(1, dt * 5);
        if (!inside && hover.a < 0.02) hover.a = 0;
        const frame = Math.floor(play) % C.FRAMES;
        if (frame !== shown || st.reveal < 1 || hover.a > 0.02) render(frame);
      });
    };
    wrap.querySelector(".ac-src")?.addEventListener("load", () => { sampled = -1; render(Math.floor(play) % C.FRAMES); });
    document.fonts?.ready ? document.fonts.ready.then(start) : start();
  }

  /* ───────── 4-1. Contact tab · calendar · form ───────── */
  function contact(root) {
    const tabs = [...root.querySelectorAll("[data-ct-tab]")], panes = [...root.querySelectorAll("[data-ct-panel]")];
    const select = (name, focus) => {
      tabs.forEach((t) => {
        const on = t.dataset.ctTab === name;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panes.forEach((p) => { p.hidden = p.dataset.ctPanel !== name; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t.dataset.ctTab));
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select(tabs[(i + d + tabs.length) % tabs.length].dataset.ctTab, true);
      });
    });

    // Booking calendar shape: the 1st is a Thursday, only dates from today (the 22nd) onward are selectable
    const cal = root.querySelector("[data-cal]");
    if (cal) {
      const dows = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"], first = 4, days = 31, today = 22;
      let html = `<div class="ac-cal__box"><div class="ac-cal__head"><p class="ac-cal__month">Month 00 <span>0000</span></p><div class="ac-cal__nav"><button type="button" aria-label="Previous month">‹</button><button type="button" aria-label="Next month">›</button></div></div><div class="ac-cal__grid">`;
      html += dows.map((d) => `<span class="ac-cal__dow">${d}</span>`).join("");
      for (let i = 0; i < first; i++) html += `<span class="ac-cal__day is-blank"></span>`;
      for (let d = 1; d <= days; d++) {
        const open = d > today, cls = ["ac-cal__day", open && "is-open", d === today && "is-today", d === today + 1 && "is-picked"].filter(Boolean).join(" ");
        html += open ? `<button type="button" class="${cls}">${d}</button>` : `<span class="${cls}">${d}</span>`;
      }
      html += `<span class="ac-cal__next">Month 00</span>`;
      for (let d = 1; d <= 7; d++) html += `<button type="button" class="ac-cal__day is-open">${d}</button>`;
      cal.innerHTML = html + "</div></div>";
      cal.addEventListener("click", (e) => {
        const b = e.target.closest(".ac-cal__day.is-open");
        if (!b) return;
        cal.querySelectorAll(".is-picked").forEach((x) => x.classList.remove("is-picked"));
        b.classList.add("is-picked");
      });
    }

    const form = root.querySelector("[data-contact]");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = form.querySelector("[data-cf-note]");
      note.dataset.state = "sent";
      note.textContent = "It’s a sample, so nothing is actually sent — a confirmation message follows after submitting here";
    });
  }

  // Split the ”Feeding” text letter by letter and attach a wave delay (--r)
  document.querySelectorAll("[data-wave]").forEach((el) => {
    let r = 0;
    el.innerHTML = [...el.textContent].map((ch) => ch === " "
      ? `<b class="ac-ch ac-ch--sp" style="--r:-1">&nbsp;</b>`
      : `<b class="ac-ch" style="--r:${r++}">${ch}</b>`).join("");
  });

  const $ = (s) => document.querySelector(s);
  if ($("#ac-caiman")) caiman($("#ac-caiman"));
  if ($(".ac-car")) carousel($(".ac-car"));
  if ($("[data-portrait]")) portrait($("[data-portrait]"));
  if ($("#ac-city")) city($("#ac-city"));
  if ($(".ac-sim--eye")) eye($(".ac-sim--eye"));
  if ($(".ac-sim--horse")) horse($(".ac-sim--horse"));
  if ($("[data-ct]")) contact($("[data-ct]"));
})();
