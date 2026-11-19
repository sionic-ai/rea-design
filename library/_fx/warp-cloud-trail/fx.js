// A cloud of noise twisted twice by noise (five fbm layers) swirls slowly between the background color and the text color. Where the cursor has passed
// Written as velocity into a 40×40 flow grid that pushes the cloud coordinates. Where flow is strong it breaks into 5px chunks, then settles.
(() => {
  const N = 40;
  const VERT = `
    attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime; uniform sampler2D uGrid; uniform float uZoom; uniform vec2 uAspect; uniform vec2 uPlaneSize;
    uniform float uDisplace; uniform float uBlock; uniform float uPixelAmt; uniform float uSpeed;
    uniform vec3 uA; uniform vec3 uB;
    float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float n2(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n2(p); p *= 2.0; a *= 0.5; } return v; }
    void main() {
      vec2 f0 = (texture2D(uGrid, vUv).rg - 0.5) * 2.0;
      float amt = clamp(length(f0) * uPixelAmt, 0.0, 1.0);
      vec2 cells = uPlaneSize / uBlock;
      vec2 su = mix(vUv, (floor(vUv * cells) + 0.5) / cells, amt);
      vec2 p = (su - 0.5) * uAspect + (texture2D(uGrid, su).rg - 0.5) * 2.0 * uDisplace;
      float t = uTime * uSpeed;
      p *= uZoom;
      vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(p * 1.4 + 1.8 * q + vec2(1.7, 9.2) + t * 1.2), fbm(p * 1.4 + 1.8 * q + vec2(8.3, 2.8) - t));
      float v = smoothstep(0.12, 0.95, fbm(p * 1.4 + 2.0 * r));
      gl_FragColor = vec4(mix(uA, uB, v), 1.0);
    }`;
  const rgbOf = (el, name) => {
    const s = document.createElement("span");
    s.style.cssText = `position:absolute;color:var(${name})`;
    el.append(s);
    const m = getComputedStyle(s).color.match(/[\d.]+/g);
    s.remove();
    return m && m.length >= 3 ? [m[0] / 255, m[1] / 255, m[2] / 255] : [0, 0, 0];
  };

  kfFx.register("warp-cloud-trail", (el, { options, reduce, hover }) => {
    if (!window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;
    const decay = +(options.decay ?? 0.08), reach = +(options.radius ?? 3), gain = +(options.gain ?? 2600);
    const aVar = options.a || "--kf-bg", bVar = options.b || "--kf-ink";
    const renderer = new Renderer({ dpr: Math.min(devicePixelRatio || 1, 2), alpha: false });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.className = "fx-warp-cloud-trail__gl";
    el.append(canvas);
    const px = new Uint8Array(N * N * 4), vel = new Float32Array(N * N * 2).fill(128);
    for (let i = 0; i < N * N; i++) { px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = 128; px[i * 4 + 3] = 255; }
    const grid = new Texture(gl, { image: px, width: N, height: N, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, flipY: false });
    const program = new Program(gl, {
      vertex: VERT, fragment: FRAG,
      uniforms: {
        uTime: { value: +(options.time ?? 0) }, uGrid: { value: grid }, uZoom: { value: +options.zoom || 1 }, uAspect: { value: [1, 1] }, uPlaneSize: { value: [1, 1] },
        uDisplace: { value: +(options.displace ?? 0.25) }, uBlock: { value: +options.block || 5 }, uPixelAmt: { value: +(options.pixel ?? 15) },
        uSpeed: { value: +(options.speed ?? 0.06) }, uA: { value: rgbOf(el, aVar) }, uB: { value: rgbOf(el, bVar) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const mouse = [0.5, 0.5], prev = [0.5, 0.5];
    let moved = false;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width; mouse[1] = 1 - (e.clientY - r.top) / r.height;
      moved = true;
    };
    if (hover && !reduce && options.trail !== "off") el.addEventListener("pointermove", onMove, { passive: true });
    const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
    const step = () => {
      for (let i = 0; i < N * N; i++) {
        vel[i * 2] += (128 - vel[i * 2]) * decay; vel[i * 2 + 1] += (128 - vel[i * 2 + 1]) * decay;
        px[i * 4] = Math.round(vel[i * 2]); px[i * 4 + 1] = Math.round(vel[i * 2 + 1]);
      }
      if (moved) {
        const dx = mouse[0] - prev[0], dy = mouse[1] - prev[1];
        prev[0] = mouse[0]; prev[1] = mouse[1]; moved = false;
        const cx = Math.floor(N * mouse[0]), cy = Math.floor(N * mouse[1]), vx = clamp(128 + gain * dx), vy = clamp(128 + gain * dy), R = Math.ceil(reach);
        for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
          const gx = cx + x, gy = cy + y, d = Math.hypot(x, y);
          if (gx < 0 || gx >= N || gy < 0 || gy >= N || d > reach) continue;
          const k = 1 - d / reach, i = gy * N + gx;
          vel[i * 2] += (vx - vel[i * 2]) * k; vel[i * 2 + 1] += (vy - vel[i * 2 + 1]) * k;
          px[i * 4] = Math.round(vel[i * 2]); px[i * 4 + 1] = Math.round(vel[i * 2 + 1]);
        }
      }
      grid.needsUpdate = true;
    };

    let raf = 0, visible = false, shown = false, t0 = 0, lw = -1, lh = -1;
    const draw = () => {
      renderer.render({ scene: mesh });
      if (!shown) { shown = true; requestAnimationFrame(() => { canvas.style.opacity = "1"; }); }
    };
    const tick = (now) => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      if (!t0) t0 = now - program.uniforms.uTime.value * 1000;
      program.uniforms.uTime.value = (now - t0) / 1000;
      step();
      draw();
    };
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w < 1 || h < 1 || (w === lw && h === lh)) return;
      lw = w; lh = h;
      renderer.setSize(w, h);
      program.uniforms.uPlaneSize.value = [w, h];
      program.uniforms.uAspect.value = w > h ? [w / h, 1] : [1, h / w];
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible && !reduce && !raf) { t0 = 0; raf = requestAnimationFrame(tick); }
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    const mo = new MutationObserver(() => { program.uniforms.uA.value = rgbOf(el, aVar); program.uniforms.uB.value = rgbOf(el, bVar); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      el.removeEventListener("pointermove", onMove);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
