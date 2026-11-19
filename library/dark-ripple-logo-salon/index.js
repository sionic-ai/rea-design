// The big logo mark on the hero — pushes the spot the mouse passed, leaves ripples and swirls, and adds chromatic aberration at the edges.
// Values (strength .35·radius .85·wave .2·energy half-life .75s·catch-up 1-.04^dt) match the original.
(() => {
  const area = document.querySelector(".sz-hero__area");
  if (!area || !window.SZ) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STRENGTH = 0.35;
  const RADIUS = 0.85;
  const WAVE = 0.2;
  const PAD = 0.25; // Margin around the mark — so pushed-out edges aren’t clipped
  const INK = SZ.color("--site-mark-ink");

  const drawMark = (w, h) => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const c = cv.getContext("2d");
    const mw = w / (1 + PAD);
    const mh = h / (1 + PAD);
    c.translate((w - mw) / 2, (h - mh) / 2);
    c.scale(mw / SZ.mark.w, mh / SZ.mark.h);
    c.fillStyle = INK;
    c.fill(new Path2D(SZ.mark.ring), "evenodd");
    c.fill(new Path2D(SZ.mark.neck));
    return cv;
  };

  const canvas = document.createElement("canvas");
  canvas.className = "sz-mark";
  canvas.setAttribute("aria-hidden", "true");
  area.append(canvas);

  const gl = !reduce && (canvas.getContext("webgl", { premultipliedAlpha: false, antialias: true, alpha: true }) || null);
  const fitCanvas = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    return r;
  };

  // Where WebGL is missing or motion is reduced, draw only the mark
  if (!gl) {
    const paint = () => {
      fitCanvas();
      const c = canvas.getContext("2d");
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.drawImage(drawMark(canvas.width, canvas.height), 0, 0);
    };
    paint();
    new ResizeObserver(paint).observe(canvas);
    canvas.classList.add("is-ready");
    return;
  }

  const VS = `
    attribute vec2 aPos;
    attribute vec2 aUv;
    varying vec2 vUv;
    void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const FS = `
    precision highp float;
    uniform sampler2D uTex;
    uniform vec2 uRes, uMouse, uPrev;
    uniform float uTime, uStrength, uRadius, uWave, uEnergy, uSpeed;
    varying vec2 vUv;
    float rnd(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float smoothNoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(rnd(i), rnd(i + vec2(1.0, 0.0)), f.x), mix(rnd(i + vec2(0.0, 1.0)), rnd(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    void main() {
      float aspect = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * aspect, vUv.y);
      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      float d = distance(p, m);
      float reach = pow(1.0 - smoothstep(0.0, uRadius, d), 1.8);

      // The original measures mouse y from bottom to top, so on vertical movement the image is pushed toward where the cursor goes
      vec2 move = vec2((uMouse.x - uPrev.x) * aspect, uPrev.y - uMouse.y);
      vec2 along = length(move) > 0.0001 ? normalize(move) : vec2(0.0);
      vec2 outward = length(p - m) > 0.0001 ? normalize(p - m) : vec2(0.0);
      vec2 around = vec2(-outward.y, outward.x);

      vec2 push = along * reach * uStrength * uSpeed * 0.012;
      vec2 ripple = outward * sin(d * uWave * 28.0 - uTime * 7.0) * exp(-d * 6.0) * uEnergy * reach * uStrength * 0.07;
      vec2 swirl = around * sin(d * 12.0 - uTime * 3.0) * exp(-d * 5.0) * uEnergy * 0.6 * reach * uStrength * 0.04;
      vec2 q = vUv * 3.5 + vec2(uTime * 0.25, uTime * 0.18);
      vec2 drift = vec2(smoothNoise(q), smoothNoise(q * 1.8 + 4.7)) * 2.0 - 1.0;
      vec2 uv = vUv + push + ripple + swirl + drift * uStrength * 0.006;

      vec4 col = texture2D(uTex, uv);
      col.rgb += reach * uEnergy * 0.1 * 0.2;
      float split = reach * uStrength * uEnergy * 0.001;
      col.r = texture2D(uTex, uv + along * split).r;
      col.b = texture2D(uTex, uv - along * split).b;
      gl_FragColor = col;
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VS);
  const fs = compile(gl.FRAGMENT_SHADER, FS);
  const prog = gl.createProgram();
  if (!vs || !fs) return canvas.remove();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return canvas.remove();
  gl.useProgram(prog);

  const attr = (data, name) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  };
  attr([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1], "aPos");
  attr([0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0], "aUv");
  const u = {};
  ["uRes", "uMouse", "uPrev", "uTime", "uStrength", "uRadius", "uWave", "uEnergy", "uSpeed"].forEach((k) => (u[k] = gl.getUniformLocation(prog, k)));

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);

  let box = { width: 1, height: 1 };
  const resize = () => {
    box = fitCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawMark(canvas.width, canvas.height));
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  canvas.classList.add("is-ready");

  // Mouse target, following point, previous point, energy (builds as it moves and decays by half-life)
  let tx = 0.5, ty = 0.5, mx = 0.5, my = 0.5, px = 0.5, py = 0.5, energy = 0, speed = 0;
  area.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const dist = Math.hypot((nx - tx) * r.width, (ny - ty) * r.height);
      energy = Math.min(energy + 0.6 * Math.min(dist / 30, 1), 1);
      tx = nx;
      ty = ny;
    },
    { passive: true }
  );

  let onScreen = true;
  new IntersectionObserver((en) => (onScreen = en[0].isIntersecting)).observe(canvas);
  const t0 = performance.now();
  let last = t0;
  const frame = () => {
    requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - last) / 800, 0.5);
    last = now;
    if (!onScreen) return;
    const follow = 1 - Math.pow(0.04, dt);
    px = mx;
    py = my;
    mx += (tx - mx) * follow;
    my += (ty - my) * follow;
    speed = Math.min(Math.hypot((mx - px) * box.width, (my - py) * box.height) / 15, 1);
    energy *= Math.pow(0.5, dt / 0.75);
    if (energy < 0.001) energy = 0;
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform2f(u.uMouse, mx, my);
    gl.uniform2f(u.uPrev, px, py);
    gl.uniform1f(u.uTime, (now - t0) / 1000);
    gl.uniform1f(u.uStrength, STRENGTH);
    gl.uniform1f(u.uRadius, RADIUS);
    gl.uniform1f(u.uWave, WAVE);
    gl.uniform1f(u.uEnergy, energy);
    gl.uniform1f(u.uSpeed, speed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  frame();
})();
