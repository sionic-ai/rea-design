// Cloth flag string: triangular flag cloths (7 wide × 9 tall grid) hang from a rope sagging between two points (48 Verlet points) and flutter in the wind,
// When the cursor comes within 140px, the flag cloth is pushed away. Lines and flag are WebGL2 triangles, light is painted by the dot product of the normal and a fixed light direction — header flag of the original site
(() => {
  const VS = `#version 300 es
in vec3 aPos; in vec3 aNor; in vec3 aCol;
uniform vec2 uHalf; uniform vec2 uScale; uniform vec2 uSkew;
out vec3 vCol; out vec3 vNor;
void main() {
  vec2 p = aPos.xy + aPos.z * uSkew;
  gl_Position = vec4((p - uHalf) * uScale, 0.0, 1.0);
  vCol = aCol; vNor = aNor;
}`;
  const FS = `#version 300 es
precision mediump float;
in vec3 vCol; in vec3 vNor; out vec4 o;
const vec3 L = normalize(vec3(-0.34, -0.44, 0.83));
void main() {
  float d = abs(dot(normalize(vNor), L));
  o = vec4(vCol * (0.8 + 0.28 * d), 1.0);
}`;
  const COLS = 7, ROWS = 9, ROPE = 48, STEP = 1 / 120;
  // Take the skin variable (including relative colors) as the color the browser resolved, paint it on 1px and read the RGB
  const rgb = (css) => {
    const probe = document.createElement("i"); probe.style.color = css; document.body.append(probe);
    const solved = getComputedStyle(probe).color; probe.remove();
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const x = c.getContext("2d"); x.fillStyle = solved; x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const pair = (s, d) => { const [a, b] = String(s ?? d).split(/[ ,]+/).map(Number); return { x: a, y: b }; };
  const noise = (t) => 0.5 * Math.sin(t) + 0.32 * Math.sin(2.31 * t + 1.7) + 0.18 * Math.sin(4.17 * t + 3.3);

  kfFx.register("cloth-bunting-gl", (el, { options, reduce, hover }) => {
    const canvas = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas"));
    if (canvas !== el) canvas.className = "fx-cb-canvas";
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return () => { if (canvas !== el) canvas.remove(); };
    const still = reduce;
    const A = pair(options.start, "100 0"), B = pair(options.end, "0 60");
    const count = Math.max(1, +(options.count ?? 8)), slack = +(options.slack ?? 0.045), shift = +(options.offset ?? 0);
    const wind = still ? 0 : +(options.wind ?? 1), delay = still ? 0 : +(options.delay ?? 0), entry = still ? 0 : +(options.entry ?? 0.9);
    const flagH = (+(options.flag ?? 3.772) / 100) * innerWidth, flagW = flagH * 0.83;
    const cs = getComputedStyle(el);
    const palette = [1, 2, 3, 4, 5].map((i) => cs.getPropertyValue(`--fx-flag-${i}`).trim()).filter(Boolean);
    const cols = (palette.length ? palette : ["var(--kf-accent)", "var(--kf-ink)", "var(--kf-success)", "var(--kf-warning)", "var(--kf-accent-soft)"]).map(rgb);
    const cord = rgb(cs.getPropertyValue("--fx-cord").trim() || "var(--kf-dim)");

    // Line
    const p0 = { x: (A.x / 100) * W, y: (A.y / 100) * H }, p1 = { x: (B.x / 100) * W, y: (B.y / 100) * H };
    const [L0, L1] = p0.x <= p1.x ? [p0, p1] : [p1, p0];
    const rope = { pos: new Float32Array(ROPE * 3), old: new Float32Array(ROPE * 3), arc: new Float32Array(ROPE), seg: (Math.hypot(L1.x - L0.x, L1.y - L0.y) * (1 + slack)) / (ROPE - 1), len: 0 };
    for (let i = 0; i < ROPE; i++) { const t = i / (ROPE - 1); rope.pos[i * 3] = L0.x + (L1.x - L0.x) * t; rope.pos[i * 3 + 1] = L0.y + (L1.y - L0.y) * t; }
    rope.old.set(rope.pos);
    const ropeAt = (s, out) => {
      s = Math.max(0, Math.min(rope.len, s));
      let i = 1; while (i < ROPE - 1 && rope.arc[i] < s) i++;
      const f = (s - rope.arc[i - 1]) / (rope.arc[i] - rope.arc[i - 1] || 1e-6), a = (i - 1) * 3, b = i * 3;
      for (let k = 0; k < 3; k++) out[k] = rope.pos[a + k] + (rope.pos[b + k] - rope.pos[a + k]) * f;
    };
    const measureRope = () => { let c = 0; rope.arc[0] = 0; for (let i = 1; i < ROPE; i++) { c += Math.hypot(rope.pos[i * 3] - rope.pos[i * 3 - 3], rope.pos[i * 3 + 1] - rope.pos[i * 3 - 2]); rope.arc[i] = c; } rope.len = c; };
    measureRope();

    // Flag — top row (COLS points) is attached to the rope
    const N = COLS * ROWS;
    const flags = [];
    for (let f = 0; f < count; f++) {
      const rest = new Float32Array(N * 2);
      for (let r = 0; r < ROWS; r++) {
        const t = (r / (ROWS - 1)) * 0.985;
        for (let c = 0; c < COLS; c++) {
          const u = c / (COLS - 1);
          rest[(r * COLS + c) * 2] = (u - 0.5) * flagW * (1 - t);
          rest[(r * COLS + c) * 2 + 1] = t * flagH;
        }
      }
      const links = [];
      const link = (a, b, k) => { const d = Math.hypot(rest[b * 2] - rest[a * 2], rest[b * 2 + 1] - rest[a * 2 + 1]); if (d > 1e-4) links.push(a, b, d, k); };
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        if (c + 1 < COLS) link(i, i + 1, 1);
        if (r + 1 < ROWS) link(i, i + COLS, 1);
        if (c + 1 < COLS && r + 1 < ROWS) { link(i, i + COLS + 1, 0.55); link(i + 1, i + COLS, 0.55); }
        if (c + 2 < COLS) link(i, i + 2, 0.3);
        if (r + 2 < ROWS) link(i, i + 2 * COLS, 0.3);
      }
      const span = flagW, free = Math.max(rope.len - span, 0);
      const centre = span / 2 + (count > 1 ? (free * f) / (count - 1) : free / 2);
      const pos = new Float32Array(N * 3), tmp = new Float32Array(3);
      for (let i = 0; i < N; i++) {
        const c = i % COLS;
        ropeAt(centre + (c / (COLS - 1) - 0.5) * span, tmp);
        pos[i * 3] = tmp[0] + (rest[i * 2] - rest[c * 2]);
        pos[i * 3 + 1] = tmp[1] + rest[i * 2 + 1];
        pos[i * 3 + 2] = 0;
      }
      flags.push({ pos, old: new Float32Array(pos), nor: new Float32Array(N * 3), links: new Float32Array(links), slot: f, colour: cols[(f + shift) % cols.length] });
    }
    const pinTop = (fl, out) => {
      const span = flagW, free = Math.max(rope.len - span, 0);
      const centre = span / 2 + (count > 1 ? (free * fl.slot) / (count - 1) : free / 2);
      for (let c = 0; c < COLS; c++) { ropeAt(centre + (c / (COLS - 1) - 0.5) * span, out); fl.pos[c * 3] = out[0]; fl.pos[c * 3 + 1] = out[1]; fl.pos[c * 3 + 2] = out[2]; }
    };

    let time = 0, drop = entry > 0 ? -(H + flagH + 24) : 0, clock = -delay, settling = true;
    const cursor = { x: 0, y: 0, on: false };
    const gust = (x, y, out) => {
      const n = 1.9 * time - 0.0075 * x;
      out[0] = 1250 * (0.55 + 0.45 * noise(n)) * wind;
      out[1] = 260 * noise(0.7 * n + 0.006 * y + 11.3) * wind;
      out[2] = 900 * noise(1.3 * n + 0.01 * y) * wind;
    };
    const g = new Float32Array(3), tmp = new Float32Array(3);
    const step = (dt) => {
      time += dt;
      if (!settling && entry > 0) { clock += dt; drop = -(H + flagH + 24) * (1 - (1 - Math.pow(1 - Math.min(1, Math.max(0, clock / entry)), 3))); }
      const G = 900 * dt * dt;
      // String: both ends fixed, Verlet + length fitting 24 times
      const P = rope.pos, O = rope.old, last = (ROPE - 1) * 3;
      P[0] = L0.x; P[1] = L0.y + drop; P[last] = L1.x; P[last + 1] = L1.y + drop;
      for (let i = 1; i < ROPE - 1; i++) {
        const k = i * 3; gust(P[k], P[k + 1], g);
        for (let a = 0; a < 3; a++) { const v = P[k + a], vel = (v - O[k + a]) * 0.988; P[k + a] = v + vel + 0.2 * g[a] * dt * dt + (a === 1 ? G : 0); O[k + a] = v; }
      }
      for (let it = 0; it < 24; it++) for (let i = 0; i < ROPE - 1; i++) {
        const a = i * 3, b = a + 3, dx = P[b] - P[a], dy = P[b + 1] - P[a + 1], dz = P[b + 2] - P[a + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-6, m = ((d - rope.seg) / d) * 0.5, wa = i === 0 ? 0 : i + 1 === ROPE - 1 ? 2 : 1, wb = i + 1 === ROPE - 1 ? 0 : i === 0 ? 2 : 1;
        P[a] += dx * m * wa; P[a + 1] += dy * m * wa; P[a + 2] += dz * m * wa; P[b] -= dx * m * wb; P[b + 1] -= dy * m * wb; P[b + 2] -= dz * m * wb;
      }
      measureRope();
      for (const fl of flags) {
        pinTop(fl, tmp);
        const Q = fl.pos, Z = fl.old, nor = fl.nor;
        for (let i = COLS; i < N; i++) {
          const k = i * 3; gust(Q[k], Q[k + 1], g);
          const gl2 = Math.hypot(g[0], g[1], g[2]) || 1, face = 0.25 + 0.75 * Math.abs((nor[k] * g[0] + nor[k + 1] * g[1] + nor[k + 2] * g[2]) / gl2);
          let px = 0, py = 0;
          if (cursor.on) { const dx = Q[k] - cursor.x, dy = Q[k + 1] - cursor.y, d = Math.hypot(dx, dy); if (d < 140) { const f = (1 - d / 140) * 5200; px = (dx / (d || 1)) * f; py = (dy / (d || 1)) * f; } }
          for (let a = 0; a < 3; a++) { const v = Q[k + a], vel = (v - Z[k + a]) * 0.982, push = g[a] * face + (a === 0 ? px : a === 1 ? py : 0); Q[k + a] = v + vel + push * dt * dt + (a === 1 ? G : 0); Z[k + a] = v; }
        }
        const Lk = fl.links;
        for (let it = 0; it < 5; it++) for (let j = 0; j < Lk.length; j += 4) {
          const ia = Lk[j], ib = Lk[j + 1], fa = ia < COLS, fb = ib < COLS;
          if (fa && fb) continue;
          const a = ia * 3, b = ib * 3, dx = Q[b] - Q[a], dy = Q[b + 1] - Q[a + 1], dz = Q[b + 2] - Q[a + 2];
          const d = Math.hypot(dx, dy, dz) || 1e-6, m = ((d - Lk[j + 2]) / d) * Lk[j + 3] * 0.5, wa = fa ? 0 : fb ? 2 : 1, wb = fb ? 0 : fa ? 2 : 1;
          Q[a] += dx * m * wa; Q[a + 1] += dy * m * wa; Q[a + 2] += dz * m * wa; Q[b] -= dx * m * wb; Q[b + 1] -= dy * m * wb; Q[b + 2] -= dz * m * wb;
        }
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c, l = r * COLS + Math.max(0, c - 1), rr = r * COLS + Math.min(COLS - 1, c + 1), u = Math.max(0, r - 1) * COLS + c, d = Math.min(ROWS - 1, r + 1) * COLS + c;
          const ax = Q[rr * 3] - Q[l * 3], ay = Q[rr * 3 + 1] - Q[l * 3 + 1], az = Q[rr * 3 + 2] - Q[l * 3 + 2];
          const bx = Q[d * 3] - Q[u * 3], by = Q[d * 3 + 1] - Q[u * 3 + 1], bz = Q[d * 3 + 2] - Q[u * 3 + 2];
          const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, nl = Math.hypot(nx, ny, nz) || 1;
          nor[i * 3] = nx / nl; nor[i * 3 + 1] = ny / nl; nor[i * 3 + 2] = nz / nl;
        }
      }
    };

    // Draw buffer: flag vertices → line strip vertices (two per point)
    const VERTS = count * N + ROPE * 2;
    const geo = new Float32Array(VERTS * 6), col = new Float32Array(VERTS * 3), idx = [];
    flags.forEach((fl, f) => {
      for (let i = 0; i < N; i++) col.set(fl.colour, (f * N + i) * 3);
      for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < COLS - 1; c++) { const a = f * N + r * COLS + c; idx.push(a, a + COLS, a + 1, a + 1, a + COLS, a + COLS + 1); }
    });
    const R0 = count * N;
    for (let i = 0; i < ROPE * 2; i++) col.set(cord, (R0 + i) * 3);
    for (let i = 0; i < ROPE - 1; i++) { const a = R0 + i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const fill = () => {
      flags.forEach((fl, f) => { for (let i = 0; i < N; i++) { const o = (f * N + i) * 6; geo[o] = fl.pos[i * 3]; geo[o + 1] = fl.pos[i * 3 + 1]; geo[o + 2] = fl.pos[i * 3 + 2]; geo[o + 3] = fl.nor[i * 3]; geo[o + 4] = fl.nor[i * 3 + 1]; geo[o + 5] = fl.nor[i * 3 + 2]; } });
      const P = rope.pos;
      for (let i = 0; i < ROPE; i++) {
        const a = Math.max(0, i - 1) * 3, b = Math.min(ROPE - 1, i + 1) * 3, dx = P[b] - P[a], dy = P[b + 1] - P[a + 1], l = Math.hypot(dx, dy) || 1;
        for (const s of [-1, 1]) { const o = (R0 + i * 2 + (s < 0 ? 0 : 1)) * 6; geo[o] = P[i * 3] - (2.6 * dy * s) / l; geo[o + 1] = P[i * 3 + 1] + (2.6 * dx * s) / l; geo[o + 2] = P[i * 3 + 2]; geo[o + 3] = 0; geo[o + 4] = 0; geo[o + 5] = 1; }
      }
    };
    const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => { if (canvas !== el) canvas.remove(); };
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, geo.byteLength, gl.DYNAMIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos"), aNor = gl.getAttribLocation(prog, "aNor"), aCol = gl.getAttribLocation(prog, "aCol");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aNor); gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 24, 12);
    const cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb); gl.bufferData(gl.ARRAY_BUFFER, col, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aCol); gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const uHalf = gl.getUniformLocation(prog, "uHalf"), uScale = gl.getUniformLocation(prog, "uScale"), uSkew = gl.getUniformLocation(prog, "uSkew");
    let zoom = 1;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth || W, h = canvas.clientHeight || H;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      zoom = Math.max(w / W, h / H);
      gl.useProgram(prog);
      gl.uniform2f(uHalf, W / 2, H / 2); gl.uniform2f(uScale, (2 * zoom) / w, (-2 * zoom) / h); gl.uniform2f(uSkew, 0.34, -0.12);
    };
    const draw = () => {
      fill();
      gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, geo);
      gl.useProgram(prog); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0); gl.bindVertexArray(null);
    };
    // Shown after pre-solving 240 steps into a sagging shape — the shader is already compiled by then so the first cursor doesn’t stall
    if (drop) { for (let i = 1; i < rope.pos.length; i += 3) { rope.pos[i] += drop; rope.old[i] += drop; } flags.forEach((fl) => { for (let i = 1; i < fl.pos.length; i += 3) { fl.pos[i] += drop; fl.old[i] += drop; } }); }
    for (let i = 0; i < 240; i++) step(STEP);
    settling = false;
    size(); draw();

    let raf = 0, prev = 0, acc = 0, seen = true, dead = false;
    const frame = (now) => {
      raf = 0;
      if (dead || !seen) return;
      const dt = Math.min((now - prev) / 1000, 0.05); prev = now; acc += Math.max(0, dt);
      let n = 0; while (acc >= STEP && n < 4) { step(STEP); acc -= STEP; n++; }
      if (n === 4) acc = 0;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const run = () => { if (raf || dead || still || !seen) return; prev = performance.now(); acc = 0; raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) run(); }, { rootMargin: "100px" });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { size(); if (still) draw(); });
    ro.observe(canvas);
    const move = (e) => { const r = canvas.getBoundingClientRect(); cursor.x = (e.clientX - r.left - r.width / 2) / zoom + W / 2; cursor.y = (e.clientY - r.top - r.height / 2) / zoom + H / 2; cursor.on = true; };
    const leave = () => { cursor.on = false; };
    if (!still) { canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave); }
    run();
    return () => {
      dead = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave);
      gl.deleteProgram(prog); gl.deleteBuffer(vb); gl.deleteBuffer(cb); gl.deleteBuffer(ib); gl.deleteVertexArray(vao);
      if (canvas !== el) canvas.remove();
    };
  });
})();
