(() => {
  // When switching a layered section (image · video · canvas) on a plate, the screen is split into vertical stripes (thin 260 columns + thick 26 columns) and each column stretches at a different time, as if melting, to reveal the next section (WebGL).
  // Progress is linear 950ms, cell order is random (new seed on each change), and while melting it wobbles sideways with wave noise and gets dust specks.
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 uv;
uniform sampler2D ta, tb;
uniform vec2 sa, sb;
uniform float prog, t, seed;
float h1(vec2 c) { return fract(sin(dot(c, vec2(91.7, 233.3))) * 31718.927); }
float sn(vec2 x) { vec2 c = floor(x), f = fract(x), w = f * f * (3. - 2. * f); return mix(mix(h1(c), h1(c + vec2(1, 0)), w.x), mix(h1(c + vec2(0, 1)), h1(c + 1.), w.x), w.y); }
float layered(vec2 x) { float s = 0., a = .5; for (int k = 0; k < 3; k++) { s += a * sn(x); x = x * 2.03 + vec2(4.9, 7.3); a *= .5; } return s; }
vec3 smearA(vec2 at, float len, float jit) { vec3 m = vec3(0.); for (int k = 0; k < 12; k++) { float o = (float(k) / 11. - .5 + jit) * len; m = max(m, texture2D(ta, clamp((at + vec2(0., o) - .5) * sa + .5, 0., 1.)).rgb); } return m; }
vec3 smearB(vec2 at, float len, float jit) { vec3 m = vec3(0.); for (int k = 0; k < 12; k++) { float o = (float(k) / 11. - .5 + jit) * len; m = max(m, texture2D(tb, clamp((at + vec2(0., o) - .5) * sb + .5, 0., 1.)).rgb); } return m; }
void main() {
  float p = clamp(prog, 0., 1.), bell = sin(p * 3.14159265);
  float w1 = layered(vec2(uv.x * 2.2 + seed, uv.y * 1.6 - t * .5)) - .5;
  float w2 = layered(vec2(uv.x * 3.1 + 7.7 + seed * 1.3, uv.y * 2.4 + t * .35)) - .5;
  float fx = uv.x + w1 * .08 * bell;
  float col = mix(h1(vec2(floor(fx * 260.), 3.7 + seed)), h1(vec2(floor(fx * 26.), 9.1 + seed * 1.7)), .55);
  float local = clamp((p - col * .4) / .6, 0., 1.), melt = sin(local * 3.14159265);
  vec2 at = vec2(uv.x + w1 * .05 * melt, uv.y + (col - .5) * .25 * melt + w2 * .06 * melt);
  float len = melt * (.08 + .3 * col), jit = (h1(gl_FragCoord.xy) - .5) / 11.;
  vec3 c = mix(smearA(at, len, jit), smearB(at, len, jit), smoothstep(.48, .52, local));
  float g = h1(gl_FragCoord.xy * .7 + floor(t * 24.) * 13.1 + seed);
  gl_FragColor = vec4(c * mix(1., .55 + .45 * step(.35, g), melt), 1.);
}`;
  // If it is not an image section (e.g. a text panel), bake one sheet in that panel’s background color
  const flat = (el) => { const c = document.createElement("canvas"); c.width = c.height = 4; const g = c.getContext("2d"); g.fillStyle = getComputedStyle(el).backgroundColor || "black"; g.fillRect(0, 0, 4, 4); return c; };
  const sourceOf = (el) => (el.matches("img, video, canvas") ? el : el.querySelector("img, video, canvas")) || flat(el);
  const aspectOf = (s) => (s.videoWidth || s.naturalWidth || s.width || 1) / (s.videoHeight || s.naturalHeight || s.height || 1);

  kfFx.register("streak-melt-swap", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    let cur = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));
    slides.forEach((s, i) => s.classList.toggle("is-active", i === cur));
    const ms = +(options.dur ?? 0.95) * 1000, every = +(options.every ?? 0);
    const cv = document.createElement("canvas");
    cv.setAttribute("data-fx-part", "canvas"); cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    const gl = !reduce && cv.getContext("webgl", { antialias: false, depth: false, stencil: false, alpha: false });
    let prog = null, U = {};
    if (gl) {
      const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
    }
    const tex = [];
    if (prog) {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["prog", "t", "seed", "sa", "sb"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
      gl.uniform1i(gl.getUniformLocation(prog, "ta"), 0); gl.uniform1i(gl.getUniformLocation(prog, "tb"), 1);
      for (let i = 0; i < 2; i++) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE)); tex.push(t); }
    }
    const fit = () => { const r = el.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.max(1, Math.round(r.width * k)); cv.height = Math.max(1, Math.round(r.height * k)); gl && gl.viewport(0, 0, cv.width, cv.height); };
    const ro = new ResizeObserver(fit); ro.observe(el); fit();
    // Cover ratio — an image wider than the board is cropped horizontally, a taller one vertically
    const cover = (src) => { const a = aspectOf(src), b = cv.width / cv.height; return a > b ? [b / a, 1] : [1, a / b]; };
    const upload = (unit, src) => { gl.activeTexture(unit ? gl.TEXTURE1 : gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[unit]); try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); } catch (e) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flat(el)); } gl.uniform2fv(unit ? U.sb : U.sa, cover(src)); };
    let busy = false, raf = 0, timer = 0;
    const goto = (n) => {
      n = ((n % slides.length) + slides.length) % slides.length;
      if (busy || n === cur) return;
      const from = cur;
      cur = n;
      el.dispatchEvent(new CustomEvent("fx:swap", { detail: { from, to: n }, bubbles: true }));
      if (!prog) { slides.forEach((s, i) => s.classList.toggle("is-active", i === n)); return; }
      busy = true;
      const a = sourceOf(slides[from]), b = sourceOf(slides[n]);
      upload(0, a); upload(1, b);
      gl.uniform1f(U.seed, Math.random() * 100);
      el.classList.add("is-melting");
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        if (a.tagName === "VIDEO" && a.readyState >= 2) upload(0, a);
        if (b.tagName === "VIDEO" && b.readyState >= 2) upload(1, b);
        gl.uniform1f(U.prog, p); gl.uniform1f(U.t, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (p < 1) { raf = requestAnimationFrame(step); return; }
        slides.forEach((s, i) => s.classList.toggle("is-active", i === n));
        el.classList.remove("is-melting");
        busy = false;
      };
      raf = requestAnimationFrame(step);
    };
    const onClick = (e) => { const b = e.target.closest('[data-fx-part="next"], [data-fx-part="prev"]'); if (b && el.contains(b)) goto(cur + (b.dataset.fxPart === "next" ? 1 : -1)); };
    const onGoto = (e) => goto(+(e.detail?.index ?? cur + 1));
    el.addEventListener("click", onClick);
    el.addEventListener("fx:goto", onGoto);
    if (every > 0 && !reduce) timer = setInterval(() => goto(cur + 1), every * 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(timer); ro.disconnect(); el.removeEventListener("click", onClick); el.removeEventListener("fx:goto", onGoto); cv.remove(); el.classList.remove("is-melting"); gl && gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
