(() => {
  const SIM = `precision highp float;
uniform sampler2D uState; uniform vec2 uMouse, uPrev, uRes; uniform float uMoving, uDamp, uSpring, uInk, uBrush, uPush, uAspect;
varying vec2 vUv;
void main() {
  vec4 s = texture2D(uState, vUv);
  vec2 d = (vUv - uMouse) * vec2(uAspect, 1.0);
  float b = exp(-dot(d, d) / (uBrush * uBrush * 0.01)) * uMoving;
  vec2 vel = (uMouse - uPrev) * vec2(uAspect, 1.0);
  vec2 off = s.xy * uDamp - s.xy * uSpring + vel * b * uPush;
  float ink = clamp(s.z * uInk + b, 0.0, 1.0);
  gl_FragColor = vec4(off, ink, 1.0);
}`;
  const DRAW = `precision highp float;
uniform sampler2D uState, uA, uB; uniform vec2 uRes; uniform float uDist, uRefr, uPix, uDither, uGrid, uEdges[8], uProg[8]; uniform int uCount;
varying vec2 vUv;
float bayer(vec2 p) {
  vec2 c = floor(mod(p / uGrid, 4.0)); float i = c.y * 4.0 + c.x;
  return mod(i * 7.0, 16.0) / 16.0 + 0.03125;
}
void main() {
  vec2 uv = vUv;
  if (uPix > 0.0) uv = (floor(uv * vec2(uPix * uRes.x / uRes.y, uPix)) + 0.5) / vec2(uPix * uRes.x / uRes.y, uPix);
  vec4 s = texture2D(uState, uv);
  vec2 duv = uv + s.xy * uDist * 0.01 + s.xy * uRefr;
  float p = 1.0;
  for (int i = 0; i < 8; i++) { if (i >= uCount) break; if (duv.x <= uEdges[i]) { p = uProg[i]; break; } }
  duv.y -= (1.0 - p);
  vec4 a = texture2D(uA, duv), b = texture2D(uB, duv);
  float ink = s.z;
  if (uDither > 0.0) ink = step(bayer(gl_FragCoord.xy), ink);
  vec4 c = mix(a, b, ink);
  if (duv.y < 0.0 || duv.y > 1.0) c = vec4(0.0);
  gl_FragColor = c;
}`;
  const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

  kfFx.register("ink-reveal-wordmark", (el, { options, reduce, hover }) => {
    const word = el.querySelector('[data-fx-part="word"]');
    const T = window.THREE;
    if (!word || !T) return;
    const text = word.textContent.trim();
    if (!text) return;
    const o = (k, d) => +(options[k] ?? d);
    const cfg = { damp: o("damping", 0.93), spring: o("spring", 0.005), ink: o("ink", 0.92559), smooth: o("smoothing", 0.08056), brush: o("brush", 0.63964), push: o("push", 2.18), dist: o("distortion", 9.18), refr: o("refraction", 0.072), pix: o("pixels", 150), dither: o("dither", 1), grid: o("grid", 20) };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-irw-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    word.classList.add("fx-irw-hidden");

    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false }); } catch (e) { canvas.remove(); word.classList.remove("fx-irw-hidden"); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new T.PlaneGeometry(2, 2);
    const mk = () => new T.WebGLRenderTarget(256, 64, { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
    let rtA = mk(), rtB = mk();
    const sim = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: SIM, uniforms: { uState: { value: null }, uMouse: { value: new T.Vector2(-1, -1) }, uPrev: { value: new T.Vector2(-1, -1) }, uRes: { value: new T.Vector2(1, 1) }, uMoving: { value: 0 }, uDamp: { value: cfg.damp }, uSpring: { value: cfg.spring }, uInk: { value: cfg.ink }, uBrush: { value: cfg.brush }, uPush: { value: cfg.push }, uAspect: { value: 4 } } });
    const n = Math.min(8, [...text].length);
    const draw = new T.ShaderMaterial({ transparent: true, vertexShader: VERT, fragmentShader: DRAW, uniforms: { uState: { value: null }, uA: { value: null }, uB: { value: null }, uRes: { value: new T.Vector2(1, 1) }, uDist: { value: cfg.dist }, uRefr: { value: cfg.refr }, uPix: { value: cfg.pix }, uDither: { value: cfg.dither }, uGrid: { value: cfg.grid }, uEdges: { value: new Array(8).fill(1) }, uProg: { value: new Array(8).fill(reduce ? 1 : 0) }, uCount: { value: n } } });
    const simScene = new T.Scene(), drawScene = new T.Scene();
    simScene.add(new T.Mesh(quad, sim));
    drawScene.add(new T.Mesh(quad, draw));

    // Wordmark on two canvases — A is full letters in text color (normal), B is letters in accent color. B shows only where the ink has passed
    let texA, texB;
    const paint = () => {
      const r = el.getBoundingClientRect(), w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
      renderer.setSize(w, h, false);
      draw.uniforms.uRes.value.set(w, h); sim.uniforms.uAspect.value = w / h;
      const cs = getComputedStyle(word), root = getComputedStyle(document.documentElement);
      const ink = cs.color, lit = root.getPropertyValue("--kf-accent").trim() || ink;
      const make = (fill) => {
        const c = document.createElement("canvas"); c.width = w * 2; c.height = h * 2;
        const g = c.getContext("2d"); g.scale(2, 2);
        let size = h * 0.95;
        g.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
        const mw = g.measureText(text).width;
        if (mw > w) { size *= w / mw; g.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`; }
        g.textBaseline = "alphabetic"; g.textAlign = "left";
        const y = h * 0.86;
        g.fillStyle = fill; g.fillText(text, 0, y);
        let x = 0; const edges = [...text].slice(0, n).map((ch, i) => (x += g.measureText(ch).width + (i === n - 1 ? w : 0)) / w);
        const t = new T.CanvasTexture(c); t.colorSpace = T.NoColorSpace; t.minFilter = T.LinearFilter;
        return { t, edges };
      };
      texA?.dispose(); texB?.dispose();
      const a = make(ink), b = make(lit);
      texA = a.t; texB = b.t;
      draw.uniforms.uA.value = texA; draw.uniforms.uB.value = texB;
      draw.uniforms.uEdges.value = b.edges.concat(new Array(8 - b.edges.length).fill(1));
    };
    const ready = document.fonts?.ready || Promise.resolve();
    ready.then(paint);
    paint();

    const target = new T.Vector2(-1, -1), cur = new T.Vector2(-1, -1), prev = new T.Vector2(-1, -1);
    let moving = false, raf = 0, seen = false, last = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      if (!moving) cur.copy(target);
      moving = target.x > -0.3 && target.x < 1.3 && target.y > -0.3 && target.y < 1.3;
      last = performance.now();
    };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!seen) return;
      prev.copy(cur); cur.lerp(target, cfg.smooth);
      sim.uniforms.uMouse.value.copy(cur); sim.uniforms.uPrev.value.copy(prev);
      sim.uniforms.uMoving.value = moving && now - last < 120 ? 1 : 0;
      sim.uniforms.uState.value = rtA.texture;
      renderer.setRenderTarget(rtB); renderer.render(simScene, cam);
      [rtA, rtB] = [rtB, rtA];
      draw.uniforms.uState.value = rtA.texture;
      renderer.setRenderTarget(null); renderer.render(drawScene, cam);
    };
    // Shaders are precompiled when attached — compiling on the first cursor move freezes the screen
    renderer.compile(simScene, cam); renderer.compile(drawScene, cam);
    renderer.setRenderTarget(rtA); renderer.clear(); renderer.setRenderTarget(rtB); renderer.clear(); renderer.setRenderTarget(null);

    let played = reduce;
    const prog = Array.from({ length: n }, () => ({ v: reduce ? 1 : 0 }));
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !played && window.gsap) {
        played = true;
        const dur = o("dur", 1.7), each = o("each", 0.15);
        prog.forEach((p, i) => gsap.to(p, { v: 1, duration: dur, delay: each * i, ease: "expo.inOut", onUpdate: () => { draw.uniforms.uProg.value = prog.map((q) => q.v).concat(new Array(8 - n).fill(1)); } }));
      } else if (seen && !played) { played = true; draw.uniforms.uProg.value = new Array(8).fill(1); }
    }, { threshold: +(options.threshold ?? 0.2) });
    io.observe(el);
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    if (hover) addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); removeEventListener("pointermove", move);
      prog.forEach((p) => window.gsap?.killTweensOf(p));
      rtA.dispose(); rtB.dispose(); texA?.dispose(); texB?.dispose(); sim.dispose(); draw.dispose(); quad.dispose(); renderer.dispose();
      canvas.remove(); word.classList.remove("fx-irw-hidden");
    };
  });
})();
