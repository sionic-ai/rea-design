(() => {
  // An ink blot spreads from one point and covers the board (WebGL). Progress is tied to scroll, and scrolling back clears it in reverse.
  // Distance takes the farthest corner as 1, with only the edge roughened by domain-warp noise — from progress .4 to 1 that roughness is withdrawn so it ends fully solid with no holes.
  const FRAG = `precision highp float;
    uniform vec2 uRes, uO; uniform float uP, uT, uAmp, uScale; uniform vec3 uHi, uMid, uLo;
    float h2(vec2 q){ q = fract(q * vec2(127.13, 311.71)); q += dot(q, q + 19.19); return fract(q.x * q.y); }
    float vn(vec2 q){ vec2 c = floor(q), f = fract(q); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(c), h2(c + vec2(1.0, 0.0)), u.x), mix(h2(c + vec2(0.0, 1.0)), h2(c + vec2(1.0, 1.0)), u.x), u.y); }
    float fbm(vec2 q){ float s = 0.0, w = 0.5; for (int k = 0; k < 5; k++){ s += vn(q) * w; q = q * 2.03 + vec2(5.2, 1.3); w *= 0.5; } return s / 0.969; }
    void main(){
      vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
      float asp = uRes.x / uRes.y;
      float far = 0.0;
      for (int k = 0; k < 4; k++){ vec2 c = vec2(mod(float(k), 2.0), floor(float(k) / 2.0)); far = max(far, length((c - uO) * vec2(asp, 1.0))); }
      float r = length((uv - uO) * vec2(asp, 1.0)) / max(far, 0.001);
      vec2 w = vec2(fbm(uv * 2.2 + uT * 0.24), fbm(uv * 2.2 + 31.7 - uT * 0.2)) - 0.5;
      vec2 q = uv + w * 0.4;
      float s = uScale * 0.5;
      float n = fbm(q * s + uT * 0.14) * 0.6 + fbm(q * s * 2.3 - uT * 0.09) * 0.4;
      float field = (n - 0.5) * 1.4 + ((1.0 - abs(n * 2.0 - 1.0)) - 0.5) * 0.6 + (fbm(q * s * 0.3 + 7.0 + uT * 0.06) - 0.5) * 1.9;
      float reach = uP * 1.35 - 0.05;
      float cov = (reach - r) + field * uAmp * max(reach, 0.0) * (1.0 - smoothstep(0.4, 1.0, uP)) * clamp(r * 1.8, 0.0, 1.0);
      float a = smoothstep(-0.004, 0.004, cov);
      float g = clamp(length((uv - uO) * uRes) / (max(uRes.x, uRes.y) * 0.6), 0.0, 1.0);
      vec3 col = g < 0.5 ? mix(uHi, uMid, g * 2.0) : mix(uMid, uLo, (g - 0.5) * 2.0);
      col *= 1.0 - fbm(uv * 7.0 + 3.0) * 0.08 * step(0.0, cov);
      gl_FragColor = vec4(col * a, a);
    }`;
  const px = document.createElement("canvas"); px.width = px.height = 1;
  const pc = px.getContext("2d", { willReadFrequently: true });
  const rgb = (el, name) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    pc.clearRect(0, 0, 1, 1); pc.fillStyle = v || "gray"; pc.fillRect(0, 0, 1, 1);
    const d = pc.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  kfFx.register("ink-blot-scrub", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.dataset.fxPart = "ink-canvas";
    el.prepend(cv);
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { cv.remove(); return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    const vs = sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }"), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ["uRes", "uO", "uP", "uT", "uAmp", "uScale", "uHi", "uMid", "uLo"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    const amp = +(options.amp ?? 0.82), scale = +(options.scale ?? 3), ox = +(options.x ?? 0.5), oy = +(options.y ?? 0.5);
    let col = { hi: rgb(el, "--fx-ink-hi"), mid: rgb(el, "--fx-ink-mid"), lo: rgb(el, "--fx-ink-lo") };
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.max(1, Math.floor(cv.clientWidth * d)); cv.height = Math.max(1, Math.floor(cv.clientHeight * d)); };
    const ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(cv);
    let p = reduce ? 1 : 0, t = 0, last = 0, seen = false;
    const draw = () => {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform2f(U.uO, ox, oy);
      gl.uniform1f(U.uP, p); gl.uniform1f(U.uT, t); gl.uniform1f(U.uAmp, amp); gl.uniform1f(U.uScale, scale);
      gl.uniform3fv(U.uHi, col.hi); gl.uniform3fv(U.uMid, col.mid); gl.uniform3fv(U.uLo, col.lo);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    size(); draw();
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting)); io.observe(el);
    const tick = () => {
      const now = performance.now(), dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 0.016; last = now;
      if (!seen || p <= 0 || p >= 1) return;
      t += dt; draw();
    };
    gsap.ticker.add(tick);
    const sm = (x) => x * x * (3 - 2 * x);
    const st = reduce ? null : ScrollTrigger.create({
      trigger: el, scroller: scroller || undefined, start: options.start || "top 80%", end: options.end || "top top",
      onUpdate: (self) => { p = sm(self.progress); draw(); }, onRefresh: (self) => { p = sm(self.progress); draw(); },
    });
    const onTheme = () => { col = { hi: rgb(el, "--fx-ink-hi"), mid: rgb(el, "--fx-ink-mid"), lo: rgb(el, "--fx-ink-lo") }; draw(); };
    el.addEventListener("fx:theme", onTheme);
    return () => {
      st && st.kill(); io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); el.removeEventListener("fx:theme", onTheme);
      gl.deleteProgram(pr); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(buf);
      cv.remove();
    };
  });
})();
