(() => {
  // Draws a soft aurora wave on a fixed canvas behind the screen — noise warps the coordinates twice (domain warp) to make waves, visible only inside the round window in the middle.
  // When the storm section fills the screen, the same image crosses over in a swirl (twist .41 → 3.6, rotation .04 → .22 rad/s) at 1.8/s speed, and
  // ”warm” — as the tail approaches, the color shifts through five different colors and brightens (1.1 → 1.8). Resolution is .55 times the screen.
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 uv;
uniform float t, aspect, blend, bright;
uniform vec4 lookA, lookB;   // x rotation, y twist, z swirl radius, w blur
uniform vec2 scaleFlow;      // x noise scale A/B average, y flow A
uniform float flowB;
uniform vec3 c0, c1, c2, c3, c4;
float h1(vec2 c) { return fract(sin(dot(c, vec2(91.7, 413.3))) * 24634.6345); }
float vn(vec2 x) {
  vec2 c = floor(x), f = x - c, s = f * f * f * (f * (f * 6. - 15.) + 10.);
  float a = h1(c), b = h1(c + vec2(1., 0.)), d = h1(c + vec2(0., 1.)), e = h1(c + 1.);
  return (mix(mix(a, b, s.x), mix(d, e, s.x), s.y) - .5) * 2.4;
}
float fbm(vec2 x) {
  float v = 0., w = .55;
  for (int k = 0; k < 3; k++) { v += w * vn(x); x = mat2(1.6, 1.2, -1.2, 1.6) * x; w *= .58; }
  return v;
}
float soft(vec2 x, float r) {
  return (fbm(x) * 1.4 + fbm(x + vec2(r, 0.)) + fbm(x + vec2(-.5, .866) * r) + fbm(x + vec2(-.5, -.866) * r)) / 4.4;
}
vec3 layer(vec2 p, vec4 look, float flow) {
  float d = length(p), a = atan(p.y, p.x);
  float fall = smoothstep(look.z, 0., d);
  a += fall * look.y;
  vec2 s = vec2(cos(a), sin(a)) * d;
  float cr = cos(look.x), sr = sin(look.x);
  vec2 q0 = mat2(cr, -sr, sr, cr) * (s * scaleFlow.x);
  float tt = t * flow;
  vec2 q = vec2(soft(q0 + tt * .5, look.w), soft(q0 + vec2(5.2, 1.3) - tt * .4, look.w));
  vec2 r = vec2(soft(q0 + q * 1.4 + vec2(1.7, 9.2) + tt * .3, look.w), soft(q0 + q * 1.4 + vec2(8.3, 2.8) - tt * .25, look.w));
  float f = soft(q0 + r * 1.6, look.w);
  vec3 c = mix(c0, c1, smoothstep(-.25, .3, f));
  c = mix(c, c2, smoothstep(0., .5, f));
  c = mix(c, c3, smoothstep(.22, .72, r.x));
  c = mix(c, c4, smoothstep(.5, .92, q.y) * fall);
  c *= bright;
  return mix(c0, c, smoothstep(.85, .22, d));
}
void main() {
  vec2 p = uv - .5;
  p.x *= aspect;
  vec3 col;
  if (blend < .001) col = layer(p, lookA, scaleFlow.y);
  else if (blend > .999) col = layer(p, lookB, flowB);
  else col = mix(layer(p, lookA, scaleFlow.y), layer(p, lookB, flowB), blend);
  gl_FragColor = vec4(col, 1.);
}`;
  // Paint the skin variable (color-mix and oklch also work) onto a canvas and read it back as rgb 0 to 1
  const rgbOf = (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const g = cv.getContext("2d", { willReadFrequently: true });
    return (v) => { g.clearRect(0, 0, 1, 1); g.fillStyle = v; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
  })();
  const NAMES = ["bg", "deep", "mid", "glow", "bright"];
  const smooth = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

  kfFx.register("vortex-aurora-gl", (el, { options, reduce }) => {
    const res = +(options.res ?? 0.55) || 0.55;
    const storm = options.storm ? document.querySelector(options.storm) : null;
    const warm = options.warm ? document.querySelector(options.warm) : null;
    const reach = +(options.reach ?? 0.28);
    const canvas = el.querySelector("canvas[data-fx-part=canvas]") || el.appendChild(Object.assign(document.createElement("canvas"), { ariaHidden: "true" }));
    canvas.style.cssText += ";position:absolute;inset:0;width:100%;height:100%;display:block";
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["t", "aspect", "blend", "bright", "lookA", "lookB", "scaleFlow", "flowB", "c0", "c1", "c2", "c3", "c4"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    let calm, hot;
    const readColors = () => {
      const cs = getComputedStyle(el);
      calm = NAMES.map((n) => rgbOf(cs.getPropertyValue(`--fx-aurora-${n}`).trim()));
      hot = NAMES.map((n) => rgbOf(cs.getPropertyValue(`--fx-aurora-warm-${n}`).trim() || cs.getPropertyValue(`--fx-aurora-${n}`).trim()));
    };
    readColors();
    const local = /local/.test(options.look || "");
    const size = () => {
      const bw = local ? el.clientWidth : innerWidth, bh = local ? el.clientHeight : innerHeight;
      const w = Math.max(1, Math.round(bw * res)), h = Math.max(1, Math.round(bh * res));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    size();
    addEventListener("resize", size);
    const ro = local ? new ResizeObserver(size) : null;
    ro?.observe(el);

    const S = { rotA: 0, rotB: 0, time: 0, blend: 0, warmth: 0 };
    const stormProgress = () => {
      if (!storm) return 0;
      const span = storm.offsetHeight - innerHeight;
      return span > 0 ? Math.max(0, Math.min(1, -storm.getBoundingClientRect().top / span)) : 0;
    };
    const stormOn = () => {
      if (!storm) return false;
      const top = storm.getBoundingClientRect().top;
      return top > innerHeight * 0.6 ? false : top > 0 ? true : stormProgress() < reach;
    };
    const warmTarget = () => (warm ? smooth(innerHeight * 0.9, innerHeight * 0.15, warm.getBoundingClientRect().top) : 0);
    // Radius · blur go from .6/.5 to .86/.66 as the storm section progresses from 0 to reach
    const stormLook = () => { const k = smooth(0, reach, Math.min(stormProgress(), reach)); return { radius: 0.6 + 0.26 * k, blur: 0.5 + 0.16 * k }; };

    let last = performance.now(), raf = 0, alive = true;
    const draw = (now) => {
      const dt = Math.min(Math.max(0, now - last) / 1000, 0.05);
      last = now;
      const want = stormOn() ? 1 : 0;
      S.blend = reduce ? want : want + (S.blend - want) * Math.exp(-1.8 * dt);
      const wt = warmTarget(), step = 0.5 * dt;
      S.warmth = reduce ? wt : S.warmth + Math.max(-step, Math.min(step, wt - S.warmth));
      const sl = stormLook(), slow = reduce ? dt * 0.3 : dt;
      S.time += slow; S.rotA += 0.04 * slow; S.rotB += 0.22 * slow;
      const twistA = 0.41 + (0.2 - 0.41) * S.warmth;
      const brightA = 1.1 + (1.8 - 1.1) * S.warmth;
      gl.uniform1f(U.t, S.time);
      gl.uniform1f(U.aspect, canvas.width / canvas.height);
      gl.uniform1f(U.blend, S.blend);
      gl.uniform1f(U.bright, brightA + (1.35 - brightA) * S.blend);
      gl.uniform4f(U.lookA, S.rotA, twistA, 0.74, 0.55);
      gl.uniform4f(U.lookB, S.rotB, 3.6, sl.radius, sl.blur);
      gl.uniform2f(U.scaleFlow, 0.3 + 0.02 * S.blend, 0.018);
      gl.uniform1f(U.flowB, 0.045);
      NAMES.forEach((_, i) => { const a = calm[i], b = hot[i], k = S.warmth; gl.uniform3f(U["c" + i], a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k); });
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (alive) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("resize", size); mo.disconnect(); ro?.disconnect(); if (!canvas.matches("[data-fx-part=canvas]")) canvas.remove(); };
  });
})();
