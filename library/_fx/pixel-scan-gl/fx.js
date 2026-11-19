(() => {
  // The original site’s data-shader versions (bitmap, scan, footer, spiralTriggered) rewritten as one three fragment shader — four types:
  // crt (a static overlay on photos: 3px scanlines · 6px pixel grid · accent tint), scan (a light bar moving up and down every 4s over a dot-noise background),
  // tunnel (square tunnel lines flow inward on an accent-color panel and deepen with scroll), spiral (when visible, a square spiral spreads out from the center in .9s)
  const here = document.currentScript?.src || location.href;
  let loading = null;
  const loadThree = () => {
    if (window.THREE) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const had = "exports" in window, prev = window.exports;
      window.exports = {};
      const tag = document.createElement("script");
      tag.src = new URL("../../_vendor/three@0.174.0/build/three.cjs", here).href;
      tag.onload = () => { window.THREE = window.exports; if (had) window.exports = prev; else delete window.exports; resolve(); };
      tag.onerror = reject;
      document.head.append(tag);
    });
    return loading;
  };
  kfFx.register("pixel-scan-gl", (el, ctx) => {
    if (window.THREE) return build(el, ctx);
    let off = null, gone = false;
    loadThree().then(() => { if (!gone && el.isConnected) off = build(el, ctx); }, () => {});
    return () => { gone = true; off?.(); };
  });

  const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uRes; uniform float uTime, uMode, uReveal, uDepth, uPeriod, uCell;
    uniform vec3 uAccent, uInk, uBg, uWarn;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      vec2 px = vUv * uRes;
      vec4 col = vec4(0.0);
      if (uMode < 0.5) {
        float scan = step(1.5, mod(px.y, 3.0));
        vec2 cell = mod(px, uCell);
        float grid = step(uCell - 1.0, cell.x) + step(uCell - 1.0, cell.y);
        float flick = 0.0;
        float vig = smoothstep(0.95, 0.35, length(vUv - 0.5));
        col = vec4(mix(uBg, uAccent, 0.18), (1.0 - scan) * 0.22 + min(grid, 1.0) * 0.08 + flick + (1.0 - vig) * 0.45);
      } else if (uMode < 1.5) {
        vec2 c = floor(px / uCell);
        float n = hash(c + floor(uTime * 6.0));
        float dots = step(0.985, n) * 0.5;
        float y = fract(uTime / uPeriod);
        y = abs(y * 2.0 - 1.0);
        float bar = exp(-pow((vUv.y - (0.2 + 0.6 * y)) / 0.035, 2.0));
        float haze = exp(-pow((vUv.y - (0.2 + 0.6 * y)) / 0.16, 2.0)) * 0.35;
        vec3 tint = mix(uAccent, uWarn, uDepth);
        col = vec4(uBg + tint * (bar * 0.55 + haze * 0.3) + uInk * dots * 0.12, 1.0);
      } else if (uMode < 2.5) {
        vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
        float m = max(abs(p.x) / 0.62, abs(p.y) / 0.36);
        float z = 0.35 / max(m, 0.001);
        float rings = abs(fract(z * 2.0 + uTime * 0.08 + uDepth * 1.5) - 0.5);
        float ring = smoothstep(0.035 * z, 0.0, rings) * smoothstep(0.08, 0.2, m);
        float a = atan(p.y, p.x);
        float spokes = abs(fract(a / 6.2831853 * 16.0) - 0.5);
        float spoke = smoothstep(0.02, 0.0, spokes * m * 2.0) * smoothstep(0.25, 0.4, m);
        float line = max(ring, spoke) * uReveal;
        col = vec4(mix(uBg, uInk, line * 0.32), 1.0);
      } else {
        vec2 p = vUv - 0.5;
        float m = max(abs(p.x), abs(p.y));
        float a = atan(p.y, p.x) / 6.2831853 + 0.5;
        float s = fract(m * 14.0 - a - uTime * 0.2);
        float on = step(0.5, s) * step(m, uReveal * 0.75);
        float edge = smoothstep(uReveal * 0.75, uReveal * 0.75 - 0.08, m);
        col = vec4(uAccent, on * 0.22 * edge);
      }
      gl_FragColor = col;
    }`;

  function build(el, { options, reduce }) {
    const modes = { crt: 0, scan: 1, tunnel: 2, spiral: 3 };
    const look = options.look in modes ? options.look : "crt";
    const period = +(options.period ?? 4) || 4;
    const cell = +(options.cell ?? 6) || 6;
    const warn = +(options.warn ?? 0);
    // Even if a skin value is oklch, color-mix or a relative color, it stays readable — resolved into text color and the rgb painted on a 1px canvas is taken
    const pad = document.createElement("canvas");
    pad.width = pad.height = 1;
    const pg = pad.getContext("2d", { willReadFrequently: true });
    const css = (name, grey) => {
      const c = new THREE.Color(grey, grey, grey);
      if (!getComputedStyle(el).getPropertyValue(name).trim()) return c;
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
      el.append(probe);
      const v = getComputedStyle(probe).color;
      probe.remove();
      pg.clearRect(0, 0, 1, 1);
      pg.fillStyle = v;
      pg.fillRect(0, 0, 1, 1);
      const [r, g, b] = pg.getImageData(0, 0, 1, 1).data;
      return c.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    };
    const tone = look === "tunnel" ? { bg: css("--kf-accent", 0.6), ink: css("--kf-on-accent", 0.05) } : { bg: css("--kf-bg", 0.05), ink: css("--kf-ink", 1) };
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: false });
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uMode: { value: modes[look] }, uReveal: { value: look === "spiral" ? 0 : 1 },
      uDepth: { value: look === "scan" ? warn : 0 }, uPeriod: { value: period }, uCell: { value: cell },
      uAccent: { value: css("--kf-accent", 0.7) }, uInk: { value: tone.ink }, uBg: { value: tone.bg }, uWarn: { value: css("--fx-warn", 0.6) },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
    const geo = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geo, mat));
    const cam = new THREE.Camera();
    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1, dpr = Math.min(devicePixelRatio, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * dpr, h * dpr);
      if (look === "crt") renderer.render(scene, cam);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const progress = () => { const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height))); };
    let raf = 0, last = 0, t = 0, visible = false, shown = -1;
    const draw = (now) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(draw);
      const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 0.016;
      last = now;
      t += dt;
      uniforms.uTime.value = t;
      if (look === "tunnel") uniforms.uDepth.value = progress();
      if (look === "spiral") { if (shown < 0) shown = t; const k = Math.min(1, (t - shown) / 0.9); uniforms.uReveal.value = 1 - Math.pow(1 - k, 3); }
      renderer.render(scene, cam);
      if (look === "crt") { cancelAnimationFrame(raf); raf = 0; visible = false; }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(draw); } }, { rootMargin: "100px 0px" });
    if (reduce) { uniforms.uReveal.value = 1; renderer.render(scene, cam); } else io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); geo.dispose(); mat.dispose(); renderer.dispose(); canvas.remove(); };
  }
})();
