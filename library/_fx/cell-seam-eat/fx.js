(() => {
  // Make section boundaries ‹eat in› along a cellular foam edge. Put a zero-height element between two sections and it reads the old (previous) and new (next) section background colors.
  // Canvases straddle above and below the boundary line, and with scroll the edge rises while one color eats the other. The edge boils in steps 24 times per second.
  const VERT = "attribute vec2 position; varying vec2 vUv; void main(){ vUv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }";
  const FRAG = `precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uVh, uSeam, uLift, uBulge, uBoil, uSeed, uEdge, uCells, uGrain, uDots, uPeaks, uMound;
uniform vec3 uNew, uOld; uniform vec2 uBleed;
float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p + uSeed) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h2(i).x, h2(i + vec2(1., 0.)).x, f.x), mix(h2(i + vec2(0., 1.)).x, h2(i + vec2(1.)).x, f.x), f.y); }
float worley(vec2 p){ vec2 i = floor(p), f = fract(p); float m = 1.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)); m = min(m, length(g + h2(i + g) - f)); }
  return m; }
float peaks(float x){ float v = 0.;
  for (int o = 0; o < 2; o++) { float s = o == 0 ? 2.6 : 1., a = o == 0 ? .65 : .35, off = float(o) * 50.;
    float f = x / (.18 * s), i = floor(f), t = fract(f); t = t * t * (3. - 2. * t);
    v += a * (mix(h1(i + off), h1(i + off + 1.), t) * 2. - 1.); }
  return v; }
float dome(vec2 d){ float t = clamp((.68 - length(d)) / .498, 0., 1.); t = t * t * (3. - 2. * t); return t * t * t; }
void main(){
  vec2 px = vUv * uRes;
  vec2 p = vec2(px.x - .5 * uRes.x, px.y - uSeam) / uVh;
  float lead = (px.x / uRes.x - .5) / .22;
  float h = p.y + uLift - uPeaks * peaks(p.x + uBoil * .013) - uBulge * exp(-lead * lead);
  float gone = 1.;
  if (h >= -.16) {
    vec2 dr = vec2(uBoil * .021, -uBoil * .017);
    float cells = worley(p * 5.2 + dr) * worley(p * 9.4 - dr * 1.3);
    float grain = vnoise(p * 46. + uBoil * 3.1) - .5;
    float ahead = smoothstep(0., .28, h);
    float fill = 1. - smoothstep(-uEdge, uEdge, h) + uMound * dome(vec2(p.x, h)) * (1. - ahead) + uCells * (1. - cells * 2.2) * (1. - ahead) - uGrain * grain * .35 - uDots * ahead;
    gone = step(.5, fill);
  }
  float d = px.y - uSeam;
  if (gone > .5) gl_FragColor = vec4(uNew, 1.) * step(-uBleed.x, d);
  else if (d > uBleed.y) gl_FragColor = vec4(0.);
  else gl_FragColor = vec4(uOld, 1.);
}`;
  const LOOKS = {
    jagged: { edge: 0.048, cells: 0.36, grain: 0.31, dots: 0.42, peaks: 0.1, mound: 0.226 },
    dissolve: { edge: 0.079, cells: 0.62, grain: 0.34, dots: 0.3, peaks: 0, mound: 0.513 },
  };
  const pc = document.createElement("canvas");
  pc.width = pc.height = 1;
  const px = pc.getContext("2d", { willReadFrequently: true });
  const clear = (c) => c === "transparent" || /,\s*0\)$/.test(c);
  const bgOf = (el) => {
    let c = "";
    for (let e = el; e; e = e.firstElementChild) { const b = getComputedStyle(e).backgroundColor; if (!clear(b)) { c = b; break; } }
    if (!c) c = getComputedStyle(document.body).backgroundColor;
    px.clearRect(0, 0, 1, 1); px.fillStyle = c; px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("cell-seam-eat", (el, { options, reduce, scroller }) => {
    const prev = el.previousElementSibling, next = el.nextElementSibling;
    if (!prev || !next || !window.ScrollTrigger) return;
    const o = {
      dir: options.direction === "out" ? "out" : "in", look: LOOKS[options.look] ? options.look : "jagged",
      reach: +(options.reach ?? 1), travel: +(options.travel ?? 1.65), overlap: +(options.overlap ?? 0.35), fps: +(options.fps || 24),
      catchUp: +(options.catch ?? 0.08), bulge: +(options.bulge ?? 0.2), bulgeMax: 0.3, bleed: 2,
    };
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { canvas.remove(); return; }
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    "uRes uVh uSeam uLift uBulge uBoil uSeed uEdge uCells uGrain uDots uPeaks uMound uNew uOld uBleed".split(" ").forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    const look = LOOKS[o.look];
    gl.uniform1f(U.uEdge, look.edge); gl.uniform1f(U.uCells, look.cells); gl.uniform1f(U.uGrain, look.grain);
    gl.uniform1f(U.uDots, look.dots); gl.uniform1f(U.uPeaks, look.peaks); gl.uniform1f(U.uMound, look.mound);
    gl.uniform1f(U.uSeed, Math.random() * 100);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const st = { progress: 0, s: 0, bulge: 0, frame: -1, drawn: -1, vh: innerHeight, w: 0, above: 0, below: 0, last: 0, near: false, y: 0, vel: 0 };
    let colNew = bgOf(next), colOld = bgOf(prev);
    const measure = () => {
      st.vh = innerHeight; st.w = el.clientWidth;
      const u = o.dir === "out" ? prev : next;
      const span = Math.min(u.offsetHeight, st.vh * o.reach), lap = st.vh * o.overlap;
      st.above = o.dir === "out" ? span : lap;
      st.below = o.dir === "out" ? lap : span;
      canvas.style.top = `${-st.above}px`;
      canvas.style.height = `${st.above + st.below}px`;
      colNew = bgOf(next); colOld = bgOf(prev);
      st.frame = -1;
    };
    const lift = (s) => (o.dir === "out" ? -o.travel * s * s : Math.min(st.below / st.vh - 0.16, o.travel * (1 - s) * (1 - s)));
    const draw = (now) => {
      const f = reduce ? 0 : Math.floor((now / 1000) * o.fps);
      if (f === st.frame && st.s === st.drawn) return;
      st.frame = f; st.drawn = st.s;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const W = Math.max(1, Math.round(st.w * dpr)), H = Math.max(1, Math.round((st.above + st.below) * dpr));
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      gl.viewport(0, 0, W, H);
      gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uVh, st.vh * dpr); gl.uniform1f(U.uSeam, st.below * dpr);
      gl.uniform1f(U.uLift, lift(st.s)); gl.uniform1f(U.uBulge, st.bulge); gl.uniform1f(U.uBoil, f * 0.5);
      gl.uniform3fv(U.uNew, colNew); gl.uniform3fv(U.uOld, colOld); gl.uniform2f(U.uBleed, o.bleed * dpr, o.bleed * dpr);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const scrollY = () => (scroller ? scroller.scrollTop : window.scrollY);
    const tick = () => {
      if (!st.near) return;
      const now = performance.now(), dt = st.last ? Math.min(now - st.last, 100) : 16.7;
      st.last = now;
      const k = 1 - Math.pow(1 - o.catchUp, (dt * 60) / 1000);
      st.s += (st.progress - st.s) * k;
      if (Math.abs(st.progress - st.s) < 0.0005) st.s = st.progress;
      const y = scrollY(); st.vel = (y - st.y) / st.vh; st.y = y;
      st.bulge += (gsap.utils.clamp(-o.bulgeMax, o.bulgeMax, st.vel * o.bulge) - st.bulge) * k;
      if (Math.abs(st.bulge) < 0.0005) st.bulge = 0;
      draw(now);
    };
    const trig = ScrollTrigger.create({
      trigger: el, scroller, start: "clamp(top bottom)", end: "clamp(top top)",
      onUpdate: (t) => { st.progress = reduce ? 1 : t.progress; },
      onRefresh: (t) => { measure(); st.progress = reduce ? 1 : t.progress; st.s = st.progress; draw(performance.now()); },
    });
    const io = new IntersectionObserver(([en]) => { st.near = en.isIntersecting; if (st.near) draw(performance.now()); }, { rootMargin: "150% 0px" });
    io.observe(el);
    gsap.ticker.add(tick);
    measure();
    draw(performance.now());
    return () => { trig.kill(); io.disconnect(); gsap.ticker.remove(tick); canvas.remove(); };
  });
})();
