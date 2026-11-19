// Showreel melt preview — a shader blends idle video A and video B (revealed on hover) by burning along a noise edge. At the midpoint of mixing, flow warp·pull toward the cursor·color split·hue rotation
// Strongest, and on press an explosion (strength ×amp · horizontal scanline tearing) passes through rising and falling. Plain WebGL (no three), draws only same-origin video and canvas
(() => {
  const VS = "attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FS = `precision highp float;
    uniform sampler2D ta; uniform sampler2D tb; uniform vec2 ca; uniform vec2 cb;
    uniform float time; uniform float mixv; uniform vec2 mouse; uniform float noise; uniform float disp; uniform float aber; uniform float hue;
    uniform float pulse; uniform float amp; uniform float scan; uniform vec3 rim; varying vec2 v;
    float rnd(vec2 q){ return fract(sin(dot(q, vec2(41.37, 289.11))) * 45758.5453); }
    float vn(vec2 q){ vec2 i = floor(q), f = fract(q), u = f * f * (3.0 - 2.0 * f);
      return mix(mix(rnd(i), rnd(i + vec2(1.0, 0.0)), u.x), mix(rnd(i + vec2(0.0, 1.0)), rnd(i + vec2(1.0, 1.0)), u.x), u.y); }
    float fb(vec2 q){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vn(q); q = q * 2.0 + vec2(3.1, 1.7); a *= 0.5; } return s; }
    vec3 spin(vec3 c, float a){
      vec3 y = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
      float h = atan(y.z, y.y) + a, k = length(y.yz);
      return mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * vec3(y.x, k * cos(h), k * sin(h));
    }
    vec3 pick(sampler2D t, vec2 c, vec2 q, vec2 o){ q = (q - 0.5) * c + 0.5; q.y = 1.0 - q.y; o.y = -o.y;
      return vec3(texture2D(t, q + o * c).r, texture2D(t, q).g, texture2D(t, q - o * c).b); }
    void main(){
      float m = clamp(mixv, 0.0, 1.0), swell = sin(m * 3.14159265), fx = max(swell, m * 0.22) + pulse * amp, t = time;
      vec2 q = v * noise;
      vec2 w1 = vec2(fb(q + vec2(0.15, 0.10) * t), fb(q + vec2(-0.12, 0.18) * t + 5.0));
      vec2 w2 = vec2(fb(q + 4.0 * w1 + vec2(0.2 * t, 0.0)), fb(q + 4.0 * w1 + vec2(0.0, 0.25 * t) + 8.0));
      vec2 flow = (w2 - 0.5) * disp * fx;
      vec2 d = v - mouse; float dl = length(d);
      vec2 pull = d / max(dl, 1e-4) * exp(-4.0 * dl) * fx * 0.12;
      vec2 tear = vec2(sin(v.y * 90.0 + t * 18.0) * pulse * scan, 0.0);
      vec2 ab = (v - 0.5) * aber * fx;
      vec3 a = spin(pick(ta, ca, v + flow + pull + tear, ab), fx * hue);
      vec3 b = spin(pick(tb, cb, v + flow * 0.6 - pull * 0.3 + tear * 0.6, ab * 0.7), -fx * hue * 0.6);
      float lo = max(w2.x - 0.18, 0.0), hi = min(w2.x + 0.18, 1.0), burn = smoothstep(lo, hi, m);
      vec3 col = mix(a, b, mix(m, burn, 0.7));
      col += swell * 0.18 * rim * smoothstep(0.4, 0.5, burn) * (1.0 - smoothstep(0.5, 0.6, burn));
      gl_FragColor = vec4(col, 1.0);
    }`;
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name, el) => {
    const s = document.createElement("span");
    s.style.color = `var(${name})`; s.style.display = "none"; el.append(s);
    const c = getComputedStyle(s).color; s.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  kfFx.register("reel-morph-preview", (el, { options, reduce, hover }) => {
    const A = el.querySelector('[data-fx-part="a"]'), B = el.querySelector('[data-fx-part="b"]');
    if (!A || !B || !window.gsap) return;
    const trigger = el.querySelector('[data-fx-part="trigger"]') || el;
    const o = {
      noise: +(options.noise ?? 3), disp: +(options.disp ?? 0.09), aber: +(options.aber ?? 0.018), hue: +(options.hue ?? 0.55),
      morph: +(options.morph ?? 0.65), amp: +(options.amp ?? 1.8), scan: +(options.scan ?? 0.05), rise: +(options.rise ?? 0.12), fall: +(options.fall ?? 0.55),
      to: +(options.to ?? 0.92), scale: +(options.scale ?? 1),
    };
    const cv = document.createElement("canvas");
    cv.className = "fx-reel-canvas";
    cv.setAttribute("aria-hidden", "true");
    el.appendChild(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) { cv.remove(); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const tex = (unit) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return t;
    };
    const texA = tex(0), texB = tex(1);
    gl.uniform1i(U("ta"), 0); gl.uniform1i(U("tb"), 1);
    gl.uniform1f(U("noise"), o.noise); gl.uniform1f(U("disp"), o.disp); gl.uniform1f(U("aber"), o.aber); gl.uniform1f(U("hue"), o.hue);
    gl.uniform1f(U("amp"), o.amp); gl.uniform1f(U("scan"), o.scan);
    gl.uniform3fv(U("rim"), rgb("--kf-accent-soft", el));
    const uMix = U("mixv"), uTime = U("time"), uMouse = U("mouse"), uPulse = U("pulse"), uCa = U("ca"), uCb = U("cb");
    const S = { mix: { v: 0 }, cur: 0, m: [0.5, 0.5], to: [0.5, 0.5], pulse: { v: 0 }, t: 0, seen: true, ok: [false, false] };
    const size = () => {
      const r = el.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      // Pixel count cap 1920×1080, pixel ratio 2
      const d = Math.min(devicePixelRatio || 1, 2, Math.sqrt(2073600 / (w * h)));
      cv.width = Math.max(1, Math.round(w * d)); cv.height = Math.max(1, Math.round(h * d));
      gl.viewport(0, 0, cv.width, cv.height);
      return r;
    };
    // Crop to fill the box completely (object-fit: cover)
    const cover = (m) => { const mw = m.videoWidth || m.width, mh = m.videoHeight || m.height, ea = cv.width / cv.height, ma = mw / mh; return ea > ma ? [1, ma / ea] : [ea / ma, 1]; };
    let tainted = false;
    const upload = (m, unit) => {
      if (!(m.videoWidth || m.width) || (m.readyState !== undefined && m.readyState < 2)) return false;
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, unit ? texB : texA);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, m); } catch (e) { tainted = true; return false; }
      return true;
    };
    // Cross-origin video can’t be read by WebGL — in that case drop the canvas and overlap A·B, giving only an opacity change at the same tempo
    const fallback = () => { gsap.ticker.remove(draw); cv.remove(); el.classList.remove("fx-reel-on"); el.classList.add("fx-reel-fallback"); };
    const draw = () => {
      if (!S.seen) return;
      S.ok[0] = upload(A, 0) || S.ok[0];
      if (S.cur > 0.002 || S.mix.v > 0) S.ok[1] = upload(B, 1) || S.ok[1];
      if (tainted) return fallback();
      if (!S.ok[0]) return;
      if (!S.ok[1]) S.ok[1] = upload(B, 1);
      S.cur += (S.mix.v - S.cur) * 0.18;
      S.m[0] += (S.to[0] - S.m[0]) * 0.12; S.m[1] += (S.to[1] - S.m[1]) * 0.12;
      if (!reduce) S.t += 0.012;
      gl.uniform2fv(uCa, cover(A)); gl.uniform2fv(uCb, S.ok[1] ? cover(B) : [1, 1]);
      gl.uniform1f(uMix, S.ok[1] ? S.cur : 0); gl.uniform1f(uTime, S.t); gl.uniform2f(uMouse, S.m[0], S.m[1]); gl.uniform1f(uPulse, S.pulse.v);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const play = (m) => m.play && m.paused && m.play().catch(() => {});
    const enter = () => { play(B); if (o.scale !== 1) gsap.to(el, { scale: o.scale, duration: 0.6, ease: "power3.out", overwrite: "auto" }); gsap.to(S.mix, { v: o.to, duration: reduce ? 0 : o.morph, ease: "power2.out", overwrite: true }); el.classList.add("fx-reel-in"); };
    const leave = () => { if (o.scale !== 1) gsap.to(el, { scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" }); gsap.to(S.mix, { v: 0, duration: reduce ? 0 : o.morph, ease: "power2.in", overwrite: true, onComplete: () => B.pause && B.pause() }); el.classList.remove("fx-reel-in"); };
    const move = (e) => { const r = el.getBoundingClientRect(); S.to = [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height))]; };
    const press = () => {
      if (reduce) return;
      play(B);
      gsap.killTweensOf(S.pulse); S.pulse.v = 0;
      gsap.timeline().to(S.pulse, { v: 1, duration: o.rise, ease: "power3.out" }).to(S.pulse, { v: 0, duration: o.fall, ease: "power3.in" });
    };
    const ac = new AbortController(), sig = { signal: ac.signal };
    if (hover) {
      trigger.addEventListener("pointerenter", enter, sig);
      trigger.addEventListener("pointerleave", leave, sig);
      trigger.addEventListener("pointermove", move, sig);
    } else trigger.addEventListener("click", () => (S.mix.v > 0.5 ? leave() : enter()), sig);
    trigger.addEventListener("pointerdown", press, sig);
    el.addEventListener("fx:play", enter, sig);
    el.addEventListener("fx:out", leave, sig);
    el.addEventListener("fx:pulse", press, sig);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const io = new IntersectionObserver(([e]) => { S.seen = e.isIntersecting; }, { rootMargin: "300px 0px" });
    io.observe(el);
    play(A);
    gsap.ticker.add(draw);
    el.classList.add("fx-reel-on");
    return () => {
      ac.abort(); ro.disconnect(); io.disconnect();
      gsap.ticker.remove(draw); gsap.killTweensOf([S.mix, S.pulse, el]);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose && lose.loseContext();
      cv.remove();
      el.classList.remove("fx-reel-on", "fx-reel-in", "fx-reel-fallback");
      gsap.set(el, { clearProps: "scale,transform" });
    };
  });
})();
