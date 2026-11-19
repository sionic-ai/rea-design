// Accent-colored elliptical glows bloom over a dark background, shimmering with noise, and a faint glow follows the interaction spot.
// Fill (reveal) · full (exit) · background (alpha) read the element’s inline --fx-reveal · --fx-exit · --fx-alpha every frame — the writer ties them to the scroll
(() => {
  const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uReveal; uniform float uExit; uniform float uAlpha; uniform float uTop;
uniform vec3 uBase; uniform vec3 uA; uniform vec3 uB; uniform vec2 uM; uniform float uMk;
float hs(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hs(i), hs(i + vec2(1., 0.)), u.x), mix(hs(i + vec2(0., 1.)), hs(i + vec2(1.)), u.x), u.y); }
float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= .5; } return s; }
float th(float x){ float e = exp(2. * clamp(x, -10., 10.)); return (e - 1.) / (e + 1.); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; if (uTop > .5) uv.y = 1. - uv.y;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - vec2(.5, 0.)) * vec2(asp, 1.);
  vec2 w = vec2(fb(p * 1.4 + vec2(uT * .06, 0.)), fb(p * 1.4 + vec2(3.7, -uT * .05))) - .5;
  p += w * .35;
  float ex = clamp(uExit * 1.12, 0., 1.); ex = ex * (.5 + .5 * ex);
  float rv = clamp(uReveal, 0., 1.);
  vec2 c = vec2(sin(uT * .18) * .05 * asp, -.45 + .37 * rv + sin(uT * .26 + 2.1) * .03);
  c = mix(c, vec2(0., .5), ex);
  vec2 r = vec2(.5 * asp, .42) * (.05 + 1.6 * rv);
  r = mix(r, vec2(2.4 * asp, 2.6), ex);
  vec2 q = (p - c) / r; float d = (dot(q, q) - 1.) * min(r.x, r.y) * .5;
  float sg = .16 + .22 * rv + .3 * ex;
  float a = .5 - .5 * th(.85 * d / sg);
  vec2 mm = (uv - uM) * vec2(asp, 1.);
  a = clamp(a + uMk * exp(-dot(mm, mm) * 40.) * (1. - a), 0., 1.);
  vec3 g = mix(uA, uB, clamp(uv.y * .9 + a * .3 + ex * .4, 0., 1.));
  vec3 col = mix(uBase, g, a);
  float al = max(a, clamp(uAlpha, 0., 1.));
  gl_FragColor = vec4(col * al, al);
}`;
  const rgb = (probe, prop) => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    c.fillStyle = getComputedStyle(probe)[prop]; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  kfFx.register("glow-field", (el, { options, reduce, hover }) => {
    const cv = document.createElement("canvas");
    cv.className = "fx-glow-canvas"; cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) { cv.remove(); return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ["uRes", "uT", "uReveal", "uExit", "uAlpha", "uTop", "uBase", "uA", "uB", "uM", "uMk"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    const paint = () => { gl.uniform3f(U.uBase, ...rgb(cv, "outlineColor")); gl.uniform3f(U.uA, ...rgb(cv, "color")); gl.uniform3f(U.uB, ...rgb(cv, "borderTopColor")); };
    paint();
    gl.uniform1f(U.uTop, options.from === "top" ? 1 : 0);
    const num = (name, d) => { const v = el.style.getPropertyValue(name); return v === "" ? d : +v; };
    const base = { reveal: +(options.reveal ?? 0.45), exit: +(options.exit ?? 0), alpha: +(options.alpha ?? 1) };
    const trail = hover ? +(options.trail ?? 0.18) : 0;
    const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, k: 0, tk: 0 };
    const k = Math.min(devicePixelRatio, 1.5) * +(options.res ?? 0.6);
    const size = () => {
      const w = Math.max(2, Math.round(el.clientWidth * k)), h = Math.max(2, Math.round(el.clientHeight * k));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    const move = (e) => { const r = el.getBoundingClientRect(); m.tx = (e.clientX - r.left) / Math.max(1, r.width); m.ty = 1 - (e.clientY - r.top) / Math.max(1, r.height); if (options.from === "top") m.ty = 1 - m.ty; m.tk = trail; };
    const leave = () => { m.tk = 0; };
    if (trail) { addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerleave", leave); }
    const t0 = performance.now();
    let raf = 0, on = false;
    const draw = (now) => {
      m.x += (m.tx - m.x) * 0.08; m.y += (m.ty - m.y) * 0.08; m.k += (m.tk - m.k) * 0.06;
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, reduce ? 0 : (now - t0) / 1000);
      gl.uniform1f(U.uReveal, num("--fx-reveal", base.reveal));
      gl.uniform1f(U.uExit, num("--fx-exit", base.exit));
      gl.uniform1f(U.uAlpha, num("--fx-alpha", base.alpha));
      gl.uniform2f(U.uM, m.x, m.y); gl.uniform1f(U.uMk, m.k);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tick = (now) => { raf = requestAnimationFrame(tick); draw(now); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; reduce ? draw(performance.now()) : (raf = requestAnimationFrame(tick)); }
      else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
    }, { rootMargin: "80px 0px" });
    io.observe(el);
    // Under reduced motion it draws only one frame, but still follows values changed by scroll
    const still = reduce ? new MutationObserver(() => on && draw(performance.now())) : null;
    still?.observe(el, { attributes: true, attributeFilter: ["style"] });
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); still?.disconnect();
      removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave);
      gl.getExtension("WEBGL_lose_context")?.loseContext(); cv.remove();
    };
  });
})();
