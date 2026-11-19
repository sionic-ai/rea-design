// Lays a WebGL contour terrain behind the panel — heights built from layered value noise, drawn with thin lines every 18 cells and thick lines every 5 cells, flowing slowly.
// A wide hill (Gaussian, strength .55) rises under the cursor so the lines spread, and only the hill is tinted with the accent color — cursor position follows at .08 per frame, and the rise at .04.
// The flow runs only for the first 4 seconds and 1.5s after the cursor moves, then stops over 1 second (nothing is repainted when idle). Left (title side) and bottom are kept faint.
// A shader rebuilt from the measured values of the original reference hero terrain — color reads --kf-ink and --kf-accent.
(() => {
  const VERT = "#version 300 es\nin vec2 aPos;\nvoid main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 uSize;
uniform float uClock;
uniform vec2 uPointer;
uniform float uLift;
uniform float uLines;
uniform float uHill;
uniform float uFade;
uniform vec3 uInk;
uniform vec3 uTint;
out vec4 frag;

float rnd(vec2 c) { c = fract(c * vec2(233.34, 851.73)); c += dot(c, c + 23.45); return fract(c.x * c.y); }
float vnoise(vec2 c) {
  vec2 cell = floor(c), t = fract(c);
  vec2 s = t * t * (3.0 - 2.0 * t);
  float a = rnd(cell), b = rnd(cell + vec2(1.0, 0.0)), d = rnd(cell + vec2(0.0, 1.0)), e = rnd(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, s.x), mix(d, e, s.x), s.y);
}
float layers(vec2 c) {
  float sum = 0.0, amp = 0.5;
  for (int o = 0; o < 5; o++) { sum += amp * vnoise(c); c = c * 2.03 + vec2(11.7); amp *= 0.5; }
  return sum;
}
float isoline(float level, float thick) {
  float dist = abs(fract(level + 0.5) - 0.5);
  return 1.0 - smoothstep(0.0, fwidth(level) * thick, dist);
}
void main() {
  vec2 p = gl_FragCoord.xy / uSize.y;
  vec2 q = uPointer / uSize.y;
  float r = distance(p, q);
  float hill = exp(-r * r * 5.0) * uLift;
  float height = layers(p * 1.35 + vec2(uClock * 0.018, uClock * 0.011)) + hill * uHill;
  float level = height * uLines;
  float thin = isoline(level, 1.2);
  float thick = isoline(level / 5.0, 2.0);
  float band = step(0.5, fract(level / 2.0));
  float side = mix(1.0, smoothstep(0.25, 0.85, gl_FragCoord.x / uSize.x) * 0.85 + 0.15, uFade);
  float floorFade = smoothstep(0.0, 0.3, gl_FragCoord.y / uSize.y);
  float alpha = (thin * 0.34 + thick * 0.62 + hill * thin * 0.5 + band * hill * 0.1) * side * floorFade;
  vec3 col = mix(uInk, uTint, clamp(hill * 1.8, 0.0, 1.0));
  frag = vec4(col * alpha, alpha);
}`;
  const rgbOf = (value) => {
    const probe = document.createElement("span");
    probe.style.color = value;
    document.body.append(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g) || ["0", "0", "0"];
    probe.remove();
    return m.slice(0, 3).map((n) => +n / 255);
  };

  kfFx.register("contour-terrain-gl", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-ctg";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    el.prepend(canvas);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const uSize = U("uSize"), uClock = U("uClock"), uPointer = U("uPointer"), uLift = U("uLift"), uInk = U("uInk"), uTint = U("uTint");
    gl.uniform1f(U("uLines"), +(options.lines || 18));
    gl.uniform1f(U("uHill"), +(options.hill ?? 0.55));
    gl.uniform1f(U("uFade"), options.fade === "none" ? 0 : 1);
    const paint = () => {
      const cs = getComputedStyle(document.documentElement);
      gl.uniform3fv(uInk, rgbOf(cs.getPropertyValue("--kf-ink").trim() || "currentColor"));
      gl.uniform3fv(uTint, rgbOf(cs.getPropertyValue("--kf-accent").trim() || "currentColor"));
    };
    paint();
    const themeWatch = new MutationObserver(() => { paint(); wake(); });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent", "class", "style"] });
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const fit = () => {
      const r = el.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uSize, canvas.width, canvas.height);
    };
    fit();
    const ro = new ResizeObserver(() => { fit(); wake(); });
    ro.observe(el);

    const follow = +(options.follow ?? 0.08), rise = +(options.rise ?? 0.04);
    const s = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, lift: 0, target: 0 };
    let clock = 0, last = performance.now(), awakeUntil = last + +(options.intro ?? 4) * 1000, raf = 0, visible = true;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      s.tx = (e.clientX - r.left) * dpr;
      s.ty = (r.bottom - e.clientY) * dpr;
      if (s.x < -1000) { s.x = s.tx; s.y = s.ty; }
      s.target = 1;
      awakeUntil = Math.max(awakeUntil, performance.now() + 1500);
      wake();
    };
    const onLeave = () => { s.target = 0; wake(); };
    if (hover) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); });
    io.observe(el);
    const frame = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(Math.max(now - last, 0), 50) / 1000;
      last = now;
      const flow = Math.min(1, Math.max(0, (awakeUntil + 1000 - now) / 1000)) ** 2;
      clock += dt * flow;
      s.x += (s.tx - s.x) * follow;
      s.y += (s.ty - s.y) * follow;
      s.lift += (s.target - s.lift) * rise;
      gl.uniform1f(uClock, clock);
      gl.uniform2f(uPointer, s.x, s.y);
      gl.uniform1f(uLift, s.lift);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const settled = flow === 0 && Math.abs(s.target - s.lift) < 0.002 && Math.abs(s.tx - s.x) < 0.5 && Math.abs(s.ty - s.y) < 0.5;
      if (!settled) wake();
    };
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const onVis = () => wake();
    document.addEventListener("visibilitychange", onVis);
    wake();
    requestAnimationFrame(() => { canvas.classList.add("is-on"); el.classList.add("has-terrain"); });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      el.classList.remove("has-terrain");
    };
  });
})();
