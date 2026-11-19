// Behind the panel, lay a 30px-cell dot grid with a single WebGL2 sheet. On opening, dots sprout like a diagonal wave from bottom left to top right,
// Only while the mouse moves, the surrounding dots get pushed away like a lens and grow slightly — when the cursor stops the speed cools and the dots return to place.
(() => {
  const VS = `#version 300 es
void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
  const FS = `#version 300 es
precision highp float;
uniform vec2 uSize;
uniform float uRatio;
uniform float uCell;
uniform vec4 uMouse;
uniform vec4 uDot;
uniform float uReveal;
uniform vec3 uColor;
out vec4 o;
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uSize;
  float hw = uSize.y / uSize.x;
  vec2 sq = vec2(uv.x, (uv.y - 0.5) * hw + 0.5);
  float cell = ceil(uCell * uRatio / max(1.0, hw));
  vec2 toFrag = sq - vec2(uMouse.x, (uMouse.y - 0.5) * hw + 0.5);
  float near = (1.0 - smoothstep(0.0, uDot.w, length(toFrag))) * 2.0;
  float speed = (abs(uMouse.z) + abs(uMouse.w)) * 0.075;
  near = mix(near * speed, near, clamp(speed, 0.0, 1.0));
  vec2 at = frag + vec2(0.5) * cell - mod(uSize * 0.5, cell) + toFrag * near * uDot.z;
  vec2 local = fract(at / cell);
  float diag = (uv.x + uv.y) * 0.5;
  float wave = smoothstep(diag, diag + 0.2, uReveal * 1.2);
  float rest = 1.0 - clamp(uReveal, 0.0, 1.0);
  float lo = (uDot.x * 0.5 + wave * 0.1 * (rest >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * rest)) * 0.3) * wave;
  float ring = min(near * 0.4 * uDot.y * 0.5, uDot.y * 0.5) * uDot.y * wave;
  float d = distance(local, vec2(0.5));
  float a = clamp(step(d, lo) + step(d, ring), 0.0, 1.0);
  o = vec4(uColor * a, a);
}`;

  const rgb = (css) => {
    const c = document.createElement("canvas").getContext("2d");
    if (css) c.fillStyle = css;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("dot-grid-bulge", (el, { options, reduce, hover }) => {
    const opt = {
      cell: +(options.cell || 30),
      min: +(options.min ?? 0.07),
      max: +(options.max ?? 0.4),
      push: +(options.push ?? -300),
      radius: +(options.radius ?? 0.2),
      follow: +(options.follow ?? 0.08),
      reveal: +(options.reveal ?? 1.7),
      wait: +(options.wait ?? 0.3),
    };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-dot-grid-bulge";
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
    const vao = gl.createVertexArray();

    let color = [0.7, 0.7, 0.7];
    const readColor = () => { color = rgb(getComputedStyle(el).getPropertyValue("--fx-dot-color").trim() || getComputedStyle(el).getPropertyValue("--kf-dim").trim()); };
    let W = 1, H = 1, dpr = 1;
    const size = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      readColor();
      wake();
    };

    // Cursor — position follows late with 1 − e^(−follow·.05·dt), and the per-frame moved distance (px) cooled by the same share is the speed
    const m = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, vx: 0, vy: 0, px: 0, py: 0, inited: false };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      m.tx = e.clientX - r.left; m.ty = e.clientY - r.top;
      if (!m.inited) { m.x = m.tx; m.y = m.ty; m.inited = true; }
      wake();
    };
    const damp = (a, b, dt) => { const v = a + (b - a) * (1 - Math.exp(-opt.follow * 0.05 * Math.max(dt, 0))); return Math.abs(b - v) < 0.001 ? b : v; };

    let reveal = reduce ? 1 : 0, revealAt = 0;
    let raf = 0, last = 0, alive = true;
    const wake = () => { if (alive && !raf) { last = 0; raf = requestAnimationFrame(tick); } };
    const tick = (now) => {
      raf = 0;
      const dt = last ? Math.min(Math.max(now - last, 1), 100) : 16.7;
      last = now;
      let busy = false;
      if (reveal < 1 && revealAt) {
        const t = Math.min(1, Math.max(0, (now - revealAt) / (opt.reveal * 1000)));
        reveal = 1 - Math.pow(1 - t, 4);
        if (t >= 1) reveal = 1;
        busy = true;
      }
      if (hover && m.inited) {
        const nx = damp(m.x, m.tx, dt), ny = damp(m.y, m.ty, dt);
        m.vx = damp(m.vx, nx - m.x, dt); m.vy = damp(m.vy, ny - m.y, dt);
        m.x = nx; m.y = ny;
        if (Math.abs(m.vx) + Math.abs(m.vy) > 0.002 || m.x !== m.tx || m.y !== m.ty) busy = true;
        else { m.vx = 0; m.vy = 0; }
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform2f(U.uSize, canvas.width, canvas.height);
      gl.uniform1f(U.uRatio, dpr);
      gl.uniform1f(U.uCell, opt.cell);
      gl.uniform4f(U.uMouse, m.x / W, 1 - m.y / H, hover ? m.vx : 0, hover ? m.vy : 0);
      gl.uniform4f(U.uDot, opt.min, opt.max, opt.push, opt.radius);
      gl.uniform1f(U.uReveal, reveal);
      gl.uniform3f(U.uColor, color[0], color[1], color[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (busy) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(size);
    ro.observe(el);
    if (hover) window.addEventListener("mousemove", onMove, { passive: true });
    size();
    const timer = reduce ? 0 : setTimeout(() => { revealAt = performance.now(); wake(); }, opt.wait * 1000);
    return () => {
      alive = false;
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      gl.deleteProgram(prog);
      gl.deleteVertexArray(vao);
      canvas.remove();
    };
  });
})();
