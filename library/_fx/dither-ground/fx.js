// Dot-dither ground: draws a ridge-shaped ground built from noise at the bottom of the panel as square dots per cell (default 5px), and overlapping masses are laid as filled areas.
// Two noises drift slowly in different directions so the terrain shape keeps changing — the same terrain lies under the black room, white board and red board, the original’s ”ASCII terrain”
(() => {
  const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uT, uPitch, uHeight, uDots, uFill;
uniform vec4 uDot, uFillC;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * vnoise(p); p *= 2.03; a *= .5; } return v / .97; }
void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 cell = floor(px / uPitch);
  vec2 uv = (cell + .5) * uPitch / uRes;
  vec2 q = vec2(uv.x * uRes.x / uRes.y, uv.y);
  float ridge = uHeight * (.62 + 1.1 * (fbm(vec2(q.x * 1.25 + uT * .35, 3.1)) - .5));
  float under = smoothstep(.0, .12, ridge - uv.y);
  float n = fbm(q * vec2(2.1, 3.0) + vec2(uT * .6, uT * .12));
  float m = fbm(q * vec2(1.6, 2.4) + vec2(9.7 - uT * .45, 4.3 + uT * .08));
  vec2 f = fract(px / uPitch);
  float sq = step(abs(f.x - .5), .26) * step(abs(f.y - .5), .26);
  float dots = step(1. - uDots, n * under + (1. - under) * .0) * sq;
  float fill = step(1. - uFill, m * under);
  vec4 c = uFillC * fill;
  c = mix(c, uDot, dots * uDot.a);
  gl_FragColor = vec4(c.rgb, max(c.a, dots * uDot.a));
}`;
  kfFx.register("dither-ground", (el, { options, reduce }) => {
    const pitch = Math.max(2, +(options.pitch ?? 5)), height = +(options.height ?? 0.45), speed = +(options.speed ?? 0.05);
    const dotsK = +(options.dots ?? 0.55), fillK = +(options.fill ?? 0.38);
    const cv = document.createElement("canvas");
    cv.className = "fx-ground";
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: false, alpha: true, antialias: false });
    if (!gl) return () => cv.remove();
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    gl.uniform1f(U("uPitch"), pitch);
    gl.uniform1f(U("uHeight"), height);
    gl.uniform1f(U("uDots"), dotsK);
    gl.uniform1f(U("uFill"), fillK);
    const g2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgba = (css) => { g2.clearRect(0, 0, 1, 1); g2.fillStyle = css; g2.fillRect(0, 0, 1, 1); const d = g2.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255]; };
    // Dot and surface colors come from Skin variables — when the section changes and the variables change, re-read them with fx:paint
    const paint = () => { const cs = getComputedStyle(cv); gl.uniform4f(U("uDot"), ...rgba(cs.color)); gl.uniform4f(U("uFillC"), ...rgba(cs.columnRuleColor)); };
    paint();
    const uRes = U("uRes"), uT = U("uT");
    let t = 0, last = 0, raf = 0, alive = true;
    const size = () => { cv.width = Math.max(1, el.clientWidth); cv.height = Math.max(1, el.clientHeight); gl.viewport(0, 0, cv.width, cv.height); };
    const frame = (now) => {
      if (!alive) return;
      if (!last) last = now;
      t += (Math.max(1, now - last) / 1000) * speed;
      last = now;
      gl.uniform2f(uRes, cv.width, cv.height);
      gl.uniform1f(uT, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && speed) raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(() => { size(); if (reduce || !speed) frame(performance.now()); });
    ro.observe(el);
    size();
    el.addEventListener("fx:paint", paint);
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); el.removeEventListener("fx:paint", paint); gl.getExtension("WEBGL_lose_context")?.loseContext(); cv.remove(); };
  });
})();
