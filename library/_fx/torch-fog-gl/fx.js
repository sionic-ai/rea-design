(() => {
  // Over a nearly black board, lays a noise fog (domain warp layered twice, flowing slowly at .05 per second) and puts a warm torch light at the cursor position.
  // The light follows the cursor at 3x per second (not 1−e exponential, min(1, dt×3) each frame) and settles within 1 second after stopping. Edges are 45% darker.
  const FRAG = `precision highp float;
    uniform vec2 uRes, uM; uniform float uT; uniform vec3 uBase, uGold, uCool, uTorch;
    float h2(vec2 q){ q = fract(q * vec2(127.13, 311.71)); q += dot(q, q + 19.19); return fract(q.x * q.y); }
    float vn(vec2 q){ vec2 c = floor(q), f = fract(q); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(c), h2(c + vec2(1.0, 0.0)), u.x), mix(h2(c + vec2(0.0, 1.0)), h2(c + vec2(1.0, 1.0)), u.x), u.y); }
    float fbm(vec2 q){ float s = 0.0, w = 0.5; for (int k = 0; k < 4; k++){ s += vn(q) * w; q = q * 2.03 + vec2(7.1); w *= 0.5; } return s; }
    void main(){
      float asp = uRes.x / uRes.y;
      vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
      vec2 p = vec2(uv.x * asp, uv.y);
      float t = uT * 0.05;
      vec2 q = vec2(fbm(p * 1.7 + vec2(0.0, t)), fbm(p * 1.7 + vec2(4.6, -t)));
      vec2 r = vec2(fbm(p * 1.7 + 2.2 * q + vec2(1.7, 9.2)), fbm(p * 1.7 + 2.2 * q + vec2(8.3, 2.8)));
      float n = smoothstep(0.35, 1.0, fbm(p * 1.7 + 2.6 * r));
      vec2 m = vec2(uM.x * asp, uM.y);
      float glow = exp(-dot(p - m, p - m) * 2.4);
      float field = n * (1.0 - 0.45 * length(uv - 0.5));
      gl_FragColor = vec4(uBase + uGold * field + uCool * field * (1.0 - glow) + uTorch * glow * (0.35 + 0.7 * field), 1.0);
    }`;
  const px = document.createElement("canvas"); px.width = px.height = 1;
  const pc = px.getContext("2d", { willReadFrequently: true });
  const rgb = (el, name, k = 1) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    pc.clearRect(0, 0, 1, 1); pc.fillStyle = v || "gray"; pc.fillRect(0, 0, 1, 1);
    const d = pc.getImageData(0, 0, 1, 1).data; return [(d[0] / 255) * k, (d[1] / 255) * k, (d[2] / 255) * k];
  };
  kfFx.register("torch-fog-gl", (el, { options, reduce, hover }) => {
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.dataset.fxPart = "fog-canvas";
    el.prepend(cv);
    const gl = cv.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) { cv.remove(); return; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    const vs = sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }"), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ["uRes", "uM", "uT", "uBase", "uGold", "uCool", "uTorch"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    const follow = +(options.follow ?? 3), speed = +(options.speed ?? 1);
    const read = () => ({ base: rgb(el, "--fx-fog-base"), gold: rgb(el, "--fx-fog-gold", 0.16), cool: rgb(el, "--fx-fog-cool", 0.08), torch: rgb(el, "--fx-fog-torch", 0.3) });
    let col = read();
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.max(1, Math.floor(cv.clientWidth * d)); cv.height = Math.max(1, Math.floor(cv.clientHeight * d)); };
    const target = { x: 0.5, y: 0.45 }, m = { x: 0.5, y: 0.45 };
    let t = 0, last = 0, seen = false;
    const draw = () => {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform2f(U.uM, m.x, m.y); gl.uniform1f(U.uT, t);
      gl.uniform3fv(U.uBase, col.base); gl.uniform3fv(U.uGold, col.gold); gl.uniform3fv(U.uCool, col.cool); gl.uniform3fv(U.uTorch, col.torch);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(cv);
    size(); draw();
    const move = (e) => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return; target.x = (e.clientX - r.left) / r.width; target.y = (e.clientY - r.top) / r.height; };
    if (hover) addEventListener("pointermove", move);
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting)); io.observe(el);
    const tick = () => {
      const now = performance.now(), dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 0.016; last = now;
      if (!seen) return;
      if (!reduce) t += dt * speed;
      const k = Math.min(1, dt * follow); m.x += (target.x - m.x) * k; m.y += (target.y - m.y) * k;
      draw();
    };
    gsap.ticker.add(tick);
    const onTheme = () => { col = read(); draw(); };
    el.addEventListener("fx:theme", onTheme);
    return () => {
      removeEventListener("pointermove", move); io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); el.removeEventListener("fx:theme", onTheme);
      gl.deleteProgram(pr); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(buf);
      cv.remove();
    };
  });
})();
