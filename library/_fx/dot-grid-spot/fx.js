// Behind a dark panel, grid-corner dots (faint .14) are laid down with WebGL2, and cells within the radius around the mouse light up (hold .4s, fade out by .8s) then vanish.
// On press, a wave ring spreads from that spot at 600px per second sweeping the cells. Because it uses difference blending, dots look black over the white text placed above (Brand footer).
(() => {
  const VS = `#version 300 es
  void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
  const FS = `#version 300 es
  precision highp float;
  uniform sampler2D uState; uniform ivec2 uCells; uniform vec2 uRes, uOff, uMouse; uniform vec3 uColor;
  uniform float uCell, uDot, uBase, uMax, uFill, uSpot, uRadius, uPresence, uEdge;
  out vec4 o;
  float lv(vec2 c) {
    if (c.x < 0.0 || c.y < 0.0 || c.x >= float(uCells.x) || c.y >= float(uCells.y)) return 0.0;
    float v = texelFetch(uState, ivec2(c), 0).r;
    return v * v * (3.0 - 2.0 * v);
  }
  void main() {
    vec2 pos = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec2 g = (pos - uOff) / uCell, cell = floor(g), f = g - cell;
    vec2 corner = floor(g + 0.5);
    float d = length((g - corner) * uCell);
    float mark = clamp(uDot + 0.5 - d, 0.0, 1.0);
    float near = max(max(lv(corner), lv(corner - vec2(1.0, 0.0))), max(lv(corner - vec2(0.0, 1.0)), lv(corner - vec2(1.0))));
    vec2 tm = pos - uMouse;
    float spot = exp(-dot(tm, tm) / max(uRadius * uRadius, 1.0) * 1.6) * uSpot * uPresence;
    float a = mark * (uBase + (uMax - uBase) * max(near, spot)) + lv(cell) * uFill;
    if (uEdge > 0.0) {
      vec2 e = min(pos, uRes - pos) / (uRes * uEdge);
      a *= clamp(min(e.x, e.y), 0.0, 1.0);
    }
    o = vec4(uColor * a, a);
  }`;

  kfFx.register("dot-grid-spot", (el, { options, reduce }) => {
    const opt = {
      cell: +(options.cell ?? 56) || 56,
      radius: +(options.radius ?? 150),
      hold: +(options.hold ?? 400),
      fade: +(options.fade ?? 800) || 800,
      base: +(options.base ?? 0.14),
      max: +(options.max ?? 0.9),
      fill: +(options.fill ?? 0.06),
      spot: +(options.spot ?? 0.6),
      pulse: +(options.pulse ?? 600) || 600,
      edge: +(options.edge ?? 0.12),
    };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-dot-grid";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return () => canvas.remove();
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => canvas.remove();
    const U = {};
    for (let i = 0, n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i < n; i++) { const u = gl.getActiveUniform(prog, i); U[u.name] = gl.getUniformLocation(prog, u.name); }
    const vao = gl.createVertexArray(), tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const color = () => {
      const probe = getComputedStyle(el).getPropertyValue("--kf-contrast-ink").trim() || getComputedStyle(el).color;
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = probe; c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    let rgb = color();
    const view = { w: 1, h: 1, r: 1 }, grid = { cols: 0, rows: 0, ox: 0, oy: 0 };
    let M = new Float32Array(0), T = M, S = M, R = M, A = new Uint8Array(0), dirty = true;
    const size = () => {
      view.w = Math.max(1, el.clientWidth); view.h = Math.max(1, el.clientHeight); view.r = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(view.w * view.r); canvas.height = Math.round(view.h * view.r);
      const cols = Math.ceil(view.w / opt.cell) + 1, rows = Math.ceil(view.h / opt.cell) + 1;
      grid.ox = (view.w - cols * opt.cell) / 2; grid.oy = (view.h - rows * opt.cell) / 2;
      if (cols !== grid.cols || rows !== grid.rows) {
        grid.cols = cols; grid.rows = rows;
        const n = cols * rows;
        M = new Float32Array(n); T = new Float32Array(n); S = new Float32Array(n); R = new Float32Array(n).fill(-1e9); A = new Uint8Array(n);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, A);
      }
      dirty = true;
    };
    const mouse = { x: 0, y: 0, in: false }, eased = { x: 0, y: 0 }, pulses = [];
    let presence = 0, clock = 0, last = 0, raf = 0, alive = true;
    const draw = () => {
      const r = view.r;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog); gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      if (dirty) {
        for (let i = 0; i < M.length; i++) A[i] = Math.round(255 * Math.min(1, Math.max(M[i], S[i])));
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, grid.cols, grid.rows, gl.RED, gl.UNSIGNED_BYTE, A);
        dirty = false;
      }
      gl.uniform1i(U.uState, 0);
      gl.uniform2i(U.uCells, grid.cols, grid.rows);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform2f(U.uOff, grid.ox * r, grid.oy * r);
      gl.uniform2f(U.uMouse, eased.x * r, eased.y * r);
      gl.uniform3fv(U.uColor, rgb);
      gl.uniform1f(U.uCell, opt.cell * r);
      gl.uniform1f(U.uDot, 1.25 * r);
      gl.uniform1f(U.uBase, opt.base); gl.uniform1f(U.uMax, opt.max); gl.uniform1f(U.uFill, opt.fill);
      gl.uniform1f(U.uSpot, opt.spot); gl.uniform1f(U.uRadius, opt.radius * r); gl.uniform1f(U.uPresence, presence);
      gl.uniform1f(U.uEdge, opt.edge);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const touch = (x, y) => {
      const c = opt.cell, rad = opt.radius;
      const c0 = Math.max(0, Math.floor((x - rad - grid.ox) / c)), c1 = Math.min(grid.cols - 1, Math.floor((x + rad - grid.ox) / c));
      const r0 = Math.max(0, Math.floor((y - rad - grid.oy) / c)), r1 = Math.min(grid.rows - 1, Math.floor((y + rad - grid.oy) / c));
      for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++) {
        const d = Math.hypot(grid.ox + i * c + c / 2 - x, grid.oy + j * c + c / 2 - y) / rad;
        if (d >= 1) continue;
        const v = 1 - d * d * (3 - 2 * d), k = j * grid.cols + i;
        if (v > T[k]) T[k] = v;
        R[k] = clock;
      }
    };
    const step = (now) => {
      raf = 0;
      if (!alive || document.hidden) return;
      const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
      last = now; clock += dt;
      const k = 1 - Math.exp(-dt / 0.07);
      eased.x += (mouse.x - eased.x) * k; eased.y += (mouse.y - eased.y) * k;
      presence += ((mouse.in ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.25));
      if (mouse.in) touch(eased.x, eased.y);
      let busy = Math.abs(presence - (mouse.in ? 1 : 0)) > 0.002 || Math.abs(eased.x - mouse.x) + Math.abs(eased.y - mouse.y) > 0.05;
      if (pulses.length) {
        S.fill(0);
        const c = opt.cell, inner = 0.6 * c, outer = 1.4 * c, far = Math.hypot(view.w, view.h);
        for (let p = pulses.length - 1; p >= 0; p--) {
          const P = pulses[p], rr = (clock - P.t) * opt.pulse;
          if (rr - 2 * outer > far) { pulses.splice(p, 1); continue; }
          const str = Math.pow(Math.max(0, 1 - rr / (far + outer)), 0.6);
          for (let j = 0; j < grid.rows; j++) for (let i = 0; i < grid.cols; i++) {
            const d = Math.hypot(grid.ox + i * c + c / 2 - P.x, grid.oy + j * c + c / 2 - P.y) - rr;
            if (d > 2 * inner || d < -2 * outer) continue;
            const h = d > 0 ? d / inner : d / outer, v = str * Math.exp(-h * h), q = j * grid.cols + i;
            if (v > S[q]) S[q] = v;
          }
        }
        dirty = busy = true;
        if (!pulses.length) S.fill(0);
      }
      const hold = opt.hold / 1000, fall = dt / (opt.fade / 1000), up = 1 - Math.exp(-dt / 0.045);
      for (let i = 0; i < M.length; i++) {
        let t = T[i];
        if (t <= 0 && M[i] <= 0) continue;
        if (clock - R[i] > hold) t = Math.max(0, t - fall);
        T[i] = t;
        const prev = M[i], next = t > prev ? prev + (t - prev) * up : t;
        M[i] = next < 0.002 ? 0 : next;
        if (M[i] !== prev) dirty = true;
        if (M[i] > 0 || T[i] > 0) busy = true;
      }
      draw();
      if (busy) raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!raf && alive && !reduce) { last = 0; raf = requestAnimationFrame(step); } };
    const move = (e) => {
      const b = el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      const inside = x >= 0 && y >= 0 && x <= b.width && y <= b.height && el.contains(e.target);
      if (inside && !mouse.in) { eased.x = x; eased.y = y; }
      mouse.x = x; mouse.y = y; mouse.in = inside;
      if (inside || presence > 0.002) kick();
    };
    const down = (e) => {
      const b = el.getBoundingClientRect();
      pulses.push({ x: e.clientX - b.left, y: e.clientY - b.top, t: clock });
      kick();
    };
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(el);
    const mo = new MutationObserver(() => { rgb = color(); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    size(); draw();
    if (!reduce) { addEventListener("pointermove", move, { passive: true }); el.addEventListener("pointerdown", down); }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect(); mo.disconnect();
      removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      gl.deleteTexture(tex); gl.deleteProgram(prog); gl.deleteVertexArray(vao);
      canvas.remove();
    };
  });
})();
