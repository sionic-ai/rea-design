(() => {
  const VERT = `#version 300 es
in vec2 pos; out vec2 uv;
void main(){ uv = pos; gl_Position = vec4(pos, 0., 1.); }`;
  // The outline wobbles by adding four harmonics to a rounded square (superellipse), so it returns to the same shape every cycle (phase 0→1).
  // Fill — two-stop accent color gradient + display of two overlapping paper sheets + sheen flowing with the ripple
  const FRAG = `#version 300 es
precision highp float;
in vec2 uv; out vec4 frag;
uniform float phase, live, contour, scale, unit, aspect;
uniform vec2 shift;
uniform vec3 colA, colB, colInk;
const float TAU = 6.2831853;
float rest(float a){ float c = pow(abs(cos(a)), 5.), s = pow(abs(sin(a)), 5.); return pow(c + s, -.2); }
float wob(float a){
  float w = .034 * sin(2. * a + TAU * phase + .7) + .022 * sin(3. * a - TAU * 2. * phase + 1.9)
          + .016 * sin(4. * a + TAU * phase + 3.1) + .011 * sin(5. * a - TAU * 3. * phase);
  return w * contour;
}
float box(vec2 p, vec2 b, float r){ vec2 d = abs(p) - b + r; return length(max(d, 0.)) + min(max(d.x, d.y), 0.) - r; }
void main(){
  vec2 q = vec2(uv.x * aspect, uv.y);
  vec2 p = (q - shift) / scale;
  float ang = atan(p.y, p.x);
  float rho = length(p) * unit;
  float edge = rest(ang) * (1. + wob(ang));
  float d = rho - edge;
  float aa = 1.8 * fwidth(d);
  float alpha = 1. - smoothstep(-aa, aa, d);
  if (alpha <= 0.) { frag = vec4(0.); return; }
  vec2 c = p * unit / max(edge / rest(ang), 1e-3);
  vec3 paint = mix(colA, colB, clamp(.5 - c.y * .45 + c.x * .08, 0., 1.));
  float sheen = sin(c.x * 2.4 + c.y * 1.6 - TAU * phase) * .5 + .5;
  paint += live * .09 * (sheen - .5);
  vec2 m = c - vec2(.06 * sin(TAU * phase) * live, .04 * cos(TAU * phase) * live);
  float back = box(m - vec2(.12, .1), vec2(.3, .37), .1);
  float front = box(m - vec2(-.08, -.06), vec2(.3, .37), .1);
  float ink = max(1. - smoothstep(-aa, aa, front), .55 * (1. - smoothstep(-aa, aa, back)));
  paint = mix(paint, colInk, ink);
  paint = clamp(paint, 0., 1.);
  frag = vec4(paint * alpha, alpha);
}`;

  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const tmp = document.createElement("span");
    tmp.style.color = `var(${name})`;
    el.append(tmp);
    const css = getComputedStyle(tmp).color;
    tmp.remove();
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = css;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  kfFx.register("jelly-icon-gl", (el, { options, reduce, hover }) => {
    const cv = document.createElement("canvas");
    cv.className = "fx-jelly-icon-gl__canvas";
    cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    el.append(cv);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["phase", "live", "contour", "scale", "unit", "aspect", "shift", "colA", "colB", "colInk"].map((n) => [n, gl.getUniformLocation(prog, n)]));

    const unit = +(options.unit ?? 1.6) || 1.6;
    const P = {
      rest: { live: 0.6, contour: 0.8, size: 1, cycle: +(options.cycle ?? 2.5) || 2.5 },
      excited: { live: 1, contour: 1, size: +(options.grow ?? 1.2), cycle: +(options["excited-cycle"] ?? 1.8) || 1.8 },
      sensor: +(options.sensor ?? 3), inertia: +(options.inertia ?? 0.3),
      pull: { strength: +(options.pull ?? 0.25), freq: +(options.freq ?? 1.6) || 1.6, damp: +(options.damp ?? 0.7) },
    };
    const S = { phase: 0, last: 0, morph: 0, cursor: [0, 0], inside: false, shift: [0, 0], vel: [0, 0], raf: 0, on: false };

    let cols;
    const readColors = () => { cols = [rgbOf(el, "--fx-jelly-a"), rgbOf(el, "--fx-jelly-b"), rgbOf(el, "--fx-jelly-ink")]; };
    readColors();

    const toLocal = (x, y) => {
      const r = cv.getBoundingClientRect();
      const a = r.width / Math.max(1, r.height);
      S.cursor = [((x - r.left) / r.width * 2 - 1) * a, 1 - (y - r.top) / r.height * 2];
      S.inside = true;
    };
    const onMove = (e) => toLocal(e.clientX, e.clientY);
    const onOut = (e) => { if (!e.relatedTarget) S.inside = false; };
    if (hover && !reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut);
    }

    function frame(now) {
      S.raf = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(cv.clientWidth * dpr)), h = Math.max(1, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      const dt = Math.max(0, Math.min(0.1, S.last ? (now - S.last) / 1000 : 0.016));
      S.last = now;
      // When the cursor is within the detection radius (3 in unit space) of the object center it gets excited — follows with .3s inertia
      const m = Math.hypot(S.cursor[0] - S.shift[0], S.cursor[1] - S.shift[1]) * unit;
      const ex = S.inside ? Math.max(0, Math.min(1, 1 - m / P.sensor)) : 0;
      S.morph += (ex - S.morph) * (P.inertia > 0 ? 1 - Math.exp(-dt / P.inertia) : 1);
      const k = S.morph;
      S.phase = (S.phase + dt * lerp(1 / P.rest.cycle, 1 / P.excited.cycle, k)) % 1;
      // Pull toward the cursor — a spring with 1.6Hz frequency and .7 damping, solved in fine 8ms steps
      const b = P.pull.strength * Math.min(m / 0.8, 1) * ex;
      const dir = m > 1e-4 ? [S.cursor[0] / (m / unit), S.cursor[1] / (m / unit)] : [0, 0];
      const om = 2 * Math.PI * P.pull.freq, n = Math.max(1, Math.ceil(dt / 0.008)), sdt = dt / n;
      for (let s = 0; s < n; s++) for (let i = 0; i < 2; i++) {
        const target = S.inside ? (dir[i] * b) / unit : 0;
        S.vel[i] += sdt * (om * om * (target - S.shift[i]) - 2 * P.pull.damp * om * S.vel[i]);
        S.shift[i] += sdt * S.vel[i];
      }
      if (!Number.isFinite(S.shift[0] + S.shift[1])) { S.shift = [0, 0]; S.vel = [0, 0]; }
      gl.uniform1f(U.phase, S.phase);
      gl.uniform1f(U.live, lerp(P.rest.live, P.excited.live, k));
      gl.uniform1f(U.contour, reduce ? 0 : lerp(P.rest.contour, P.excited.contour, k));
      gl.uniform1f(U.scale, lerp(P.rest.size, P.excited.size, k));
      gl.uniform1f(U.unit, unit);
      gl.uniform1f(U.aspect, w / h);
      gl.uniform2f(U.shift, S.shift[0], S.shift[1]);
      gl.uniform3fv(U.colA, cols[0]);
      gl.uniform3fv(U.colB, cols[1]);
      gl.uniform3fv(U.colInk, cols[2]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (S.on && !reduce) S.raf = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver(([e]) => {
      S.on = e.isIntersecting;
      S.last = 0;
      if (S.on && !S.raf) S.raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    // Draw once when building to harden the shader in advance — drawing for the first time on the first cursor move freezes the screen.
    frame(performance.now());
    const ro = new ResizeObserver(() => { readColors(); if (!S.raf) frame(performance.now()); });
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(S.raf);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
    };
  });
})();
