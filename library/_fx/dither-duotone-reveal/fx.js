// Carves the photo per cell (default 3px) with an 8×8 Bayer threshold and stamps it as two-color (background, text) dots. A noise field flows slowly so the dots shimmer,
// When a panel enters the 20–80% band of the screen it opens from the center square with 1.6s power2.out. Dots matching the page background are knocked out so the background shows through.
// look: on hover, stamped with 2px cells·four steps·threshold jitter .6, and on hover the original photo is revealed in Bayer order over .6s power2.out.
// Only one WebGL context is created and reused by every part — so pages with many photos do not hit the context limit (16).
(() => {
  const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uPlane, uImage;
uniform float uPixel, uLevels, uTime, uFps, uJitter, uReveal, uHover, uGamma, uKnock, uDrift, uDriftScale, uDriftSpeed;
uniform vec3 uDark, uLight;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// 8×8 Bayer — a threshold (0~1) built by interleaving cell coordinate bits. For each step b, (x^y bit)·2 + y bit goes at the 4^(2-b) place
float bayer8(vec2 c) {
  c = mod(floor(c), 8.0);
  float v = 0.0;
  for (int b = 0; b < 3; b++) {
    float k = pow(2.0, float(b));
    float xb = mod(floor(c.x / k), 2.0), yb = mod(floor(c.y / k), 2.0);
    v += (2.0 * mod(xb + yb, 2.0) + yb) * pow(4.0, 2.0 - float(b));
  }
  return (v + 0.5) / 64.0;
}
vec2 cover(vec2 uv) {
  float pa = uPlane.x / uPlane.y, ia = uImage.x / uImage.y;
  vec2 s = ia > pa ? vec2(pa / ia, 1.0) : vec2(1.0, ia / pa);
  return (uv - 0.5) * s + 0.5;
}
void main() {
  vec2 uvT = vec2(vUv.x, 1.0 - vUv.y);
  vec2 cells = uPlane / uPixel;
  vec2 cell = floor(uvT * cells);
  vec2 uv = clamp((cell + 0.5) / cells, 0.0, 1.0);
  vec2 fc = abs(uvT - 0.5) * 2.0;
  if (max(fc.x, fc.y) > uReveal) discard;
  vec4 col = texture2D(uTex, cover(uv));
  float luma = pow(max(dot(col.rgb, vec3(0.299, 0.587, 0.114)), 1e-5), uGamma);
  vec2 f = uv * vec2(uPlane.x / uPlane.y, 1.0) * uDriftScale;
  float t = uTime * uDriftSpeed;
  float field = noise(f + vec2(t, t * 0.7)) + noise(f * 2.0 - vec2(t * 0.6, t));
  luma = clamp(luma + (field - 1.0) * uDrift, 0.0, 1.0);
  float steps = uLevels - 1.0;
  float frame = floor(uTime * uFps + hash(cell));
  float th = fract(bayer8(cell) + hash(cell + frame) * uJitter) - 0.5;
  float d = clamp(floor(luma * steps + 0.5 + th) / steps, 0.0, 1.0);
  vec3 rgb = mix(uDark, uLight, d);
  if (uKnock >= 0.0 && abs(d - uKnock) < 0.5) discard;
  vec4 orig = texture2D(uTex, cover(uvT));
  float show = step(bayer8(cell) + 0.001, uHover);
  rgb = mix(rgb, orig.rgb, show);
  gl_FragColor = vec4(rgb, col.a);
}`;

  const R = { gl: null, cv: null, u: {}, items: new Set(), on: false };
  function boot() {
    if (R.gl !== null) return !!R.gl;
    R.cv = document.createElement("canvas");
    const gl = R.cv.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) { R.gl = false; return false; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { R.gl = false; return false; }
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { R.gl = false; return false; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    "uTex uPlane uImage uPixel uLevels uTime uFps uJitter uReveal uHover uGamma uKnock uDrift uDriftScale uDriftSpeed uDark uLight".split(" ").forEach((n) => (R.u[n] = gl.getUniformLocation(pr, n)));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    R.gl = gl;
    return true;
  }

  // Skin variable to real rgb — the color for dot painting, since canvas can’t read variables
  const rgbOf = (el, v) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:${v}`;
    el.append(i);
    const m = getComputedStyle(i).color.match(/[\d.]+/g) || [0, 0, 0];
    i.remove();
    return m.slice(0, 3).map((n) => +n / 255);
  };
  const lumOf = (css) => {
    const m = css.match(/[\d.]+/g);
    if (!m || (m.length > 3 && +m[3] === 0)) return null;
    return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255;
  };
  // Reflected background is the background of the first ancestor painted over the element — follows along on pages where each section changes background
  const behind = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const l = lumOf(getComputedStyle(n).backgroundColor);
      if (l !== null) return l;
    }
    return 0;
  };

  function frame(time, dt) {
    const gl = R.gl;
    for (const it of R.items) {
      if (!it.seen || !it.tex) continue;
      const r = it.el.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      if (it.cv.width !== w || it.cv.height !== h) { it.cv.width = w; it.cv.height = h; }
      if (!it.revealed && r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2) {
        it.revealed = true;
        gsap.to(it.s, { reveal: 1, duration: it.dur, ease: "power2.out" });
      }
      if (it.active) {
        const on = !!it.el.closest(it.active);
        if (on !== it.isActive) { it.isActive = on; gsap.to(it.s, { hover: on ? 1 : 0, duration: 0.6, ease: "power2.out", overwrite: true }); }
      }
      if (!it.reduce) it.s.time += dt;
      R.cv.width = w; R.cv.height = h;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, it.tex);
      const u = R.u, c = it.cfg;
      gl.uniform1i(u.uTex, 0);
      gl.uniform2f(u.uPlane, w, h);
      gl.uniform2f(u.uImage, it.iw, it.ih);
      gl.uniform1f(u.uPixel, c.pixel);
      gl.uniform1f(u.uLevels, c.levels);
      gl.uniform1f(u.uTime, it.s.time);
      gl.uniform1f(u.uFps, 0.5);
      gl.uniform1f(u.uJitter, c.jitter);
      gl.uniform1f(u.uReveal, it.s.reveal);
      gl.uniform1f(u.uHover, it.s.hover);
      gl.uniform1f(u.uGamma, c.gamma);
      gl.uniform1f(u.uKnock, c.knock === "auto" ? (behind(it.el) < 0.5 ? 0 : 1) : c.knock === "dark" ? 0 : c.knock === "light" ? 1 : -1);
      gl.uniform1f(u.uDrift, c.drift);
      gl.uniform1f(u.uDriftScale, 2.5);
      gl.uniform1f(u.uDriftSpeed, 0.08);
      gl.uniform3fv(u.uDark, it.dark);
      gl.uniform3fv(u.uLight, it.light);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      it.cx.clearRect(0, 0, w, h);
      it.cx.drawImage(R.cv, 0, 0);
    }
  }
  const tick = (time, deltaMs) => frame(time, Math.max(0, Math.min(0.1, deltaMs / 1000)));

  kfFx.register("dither-duotone-reveal", (el, { options, reduce, hover }) => {
    const src = el.querySelector('[data-fx-part="src"]');
    if (!src || !boot()) return;
    const look = options.look === "hover" ? "hover" : "base";
    const base = look === "hover"
      ? { pixel: 2, levels: 4, jitter: 0.6, gamma: 1, drift: 0, knock: "none" }
      : { pixel: 3, levels: 2, jitter: 0, gamma: 1.7, drift: 0.12, knock: "auto" };
    const cfg = {
      pixel: +options.pixel || base.pixel,
      levels: +options.levels || base.levels,
      jitter: +(options.jitter ?? base.jitter),
      gamma: +options.gamma || base.gamma,
      drift: +(options.drift ?? base.drift),
      knock: options.knock || base.knock,
    };
    const cs = getComputedStyle(el);
    const it = {
      el, cfg, reduce, seen: false, tex: null, iw: 1, ih: 1, isActive: false,
      active: options.active || "",
      dur: +(options.dur ?? 1.6),
      revealed: look === "hover" || !!options.active || options.reveal === "off" || reduce,
      s: { reveal: 0, hover: 0, time: 0 },
      dark: rgbOf(el, cs.getPropertyValue("--fx-dark").trim() || "var(--kf-bg)"),
      light: rgbOf(el, cs.getPropertyValue("--fx-light").trim() || "var(--kf-ink)"),
    };
    if (it.revealed) it.s.reveal = 1;
    it.cv = document.createElement("canvas");
    it.cv.className = "fx-ddr__canvas";
    it.cv.setAttribute("aria-hidden", "true");
    it.cx = it.cv.getContext("2d");
    el.append(it.cv);
    el.classList.add("fx-ddr-on");

    const load = () => {
      if (!src.complete || !src.naturalWidth || !el.isConnected) return;
      const gl = R.gl;
      it.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, it.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      it.iw = src.naturalWidth; it.ih = src.naturalHeight;
    };
    if (src.complete && src.naturalWidth) load(); else src.addEventListener("load", load, { once: true });

    const io = new IntersectionObserver(([e]) => (it.seen = e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    R.items.add(it);
    if (!R.on) { R.on = true; gsap.ticker.add(tick); }

    let enter, leave;
    if (look === "hover" && !it.active) {
      enter = () => gsap.to(it.s, { hover: 1, duration: 0.6, ease: "power2.out", overwrite: true });
      leave = () => gsap.to(it.s, { hover: 0, duration: 0.6, ease: "power2.out", overwrite: true });
      el.addEventListener(hover ? "mouseenter" : "pointerdown", enter);
      if (hover) el.addEventListener("mouseleave", leave);
    }
    return () => {
      io.disconnect();
      src.removeEventListener("load", load);
      if (enter) { el.removeEventListener("mouseenter", enter); el.removeEventListener("pointerdown", enter); el.removeEventListener("mouseleave", leave); }
      gsap.killTweensOf(it.s);
      if (it.tex) R.gl.deleteTexture(it.tex);
      R.items.delete(it);
      if (!R.items.size && R.on) { R.on = false; gsap.ticker.remove(tick); }
      it.cv.remove();
      el.classList.remove("fx-ddr-on");
    };
  });
})();
