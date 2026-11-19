(() => {
  // Draw the grid that fills the element with WebGL — cells are about 40px (element width divided by the rounded cell count), and the noise drifts slowly at .05× time
  // Pushes the grid diagonally by up to .075 (ratio of element size). Bends harder from the edges toward the center, and with outline the outer border stays straight. Line color is the element’s color
  const VS = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes; uniform vec2 uCount; uniform float uTime; uniform float uSeed; uniform float uAmp; uniform float uPx; uniform vec3 uInk; uniform float uOutline;
varying vec2 vUv;
vec2 grad(vec2 p){ p = vec2(dot(p, vec2(41.3, 289.1)), dot(p, vec2(171.7, 83.9))); return fract(sin(p) * 15731.743) * 2.0 - 1.0; }
float wave(vec2 p){
  vec2 c = floor(p), f = fract(p), s = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad(c), f), b = dot(grad(c + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float d = dot(grad(c + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), e = dot(grad(c + vec2(1.0)), f - vec2(1.0));
  return mix(mix(a, b, s.x), mix(d, e, s.x), s.y) * 1.6;
}
float softMin(float a, float b){ return -log(exp(-20.0 * a) + exp(-20.0 * b)) / 20.0; }
void main(){
  vec2 uv = vUv; float aspect = uRes.x / uRes.y;
  float k = clamp(softMin(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)) / 0.5, 0.0, 1.0);
  if (uOutline > 0.5) k *= smoothstep(0.02, 0.12, softMin(min(uv.x * aspect, aspect - uv.x * aspect), min(uv.y, 1.0 - uv.y)));
  uv += wave(uv * 2.0 + uTime * 0.05 + uSeed) * uAmp * k;
  float trim = uOutline; vec2 g = uv * uCount - trim; vec2 live = uCount - 2.0 * trim;
  vec2 aa = fwidth(g) * uPx;
  if (uOutline > 0.5 && (g.x < -aa.x || g.x > live.x + aa.x || g.y < -aa.y || g.y > live.y + aa.y)) { gl_FragColor = vec4(0.0); return; }
  vec2 d = abs(fract(g - 0.5) - 0.5);
  float lx = 1.0 - smoothstep(0.0, aa.x, d.x), ly = 1.0 - smoothstep(0.0, aa.y, d.y);
  if (uOutline > 0.5) { if (g.y < 0.0 || g.y > live.y) lx = 0.0; if (g.x < 0.0 || g.x > live.x) ly = 0.0; }
  else { if (vUv.x < 0.01 || vUv.x > 0.99) lx = 0.0; if (vUv.y < 0.01 || vUv.y > 0.99) ly = 0.0; }
  float line = max(lx, ly);
  gl_FragColor = vec4(uInk * line, line);
}`;
  const ink = (el) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(el).color; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  kfFx.register("noise-warp-grid", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return;
    gl.getExtension("OES_standard_derivatives");
    el.append(canvas);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const cell = +options.cell || 40, amp = +(options.amp ?? 0.075), speed = +(options.speed ?? 1);
    const outline = options.outline === "true" ? 1 : 0;
    gl.uniform1f(U("uSeed"), Math.random() * 30); gl.uniform1f(U("uAmp"), amp); gl.uniform1f(U("uOutline"), outline);
    gl.uniform1f(U("uPx"), 0.75);
    let w = 0, h = 0, visible = true;
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U("uRes"), w, h);
      gl.uniform2f(U("uCount"), Math.max(1, Math.round(w / cell)), Math.max(1, Math.round(h / cell)));
      gl.uniform3f(U("uInk"), ...ink(el));
      draw(performance.now());
    };
    const draw = (now) => {
      gl.uniform1f(U("uTime"), reduce ? 0 : (now / 1000) * speed);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const ro = new ResizeObserver(size); ro.observe(el);
    const io = new IntersectionObserver((es) => es.forEach((e) => (visible = e.isIntersecting))); io.observe(el);
    const mo = new MutationObserver(() => gl.uniform3f(U("uInk"), ...ink(el)));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    const tick = () => { if (visible && !reduce) draw(performance.now()); };
    gsap.ticker.add(tick);
    size();
    return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); mo.disconnect(); gl.getExtension("WEBGL_lose_context")?.loseContext(); canvas.remove(); };
  });
})();
