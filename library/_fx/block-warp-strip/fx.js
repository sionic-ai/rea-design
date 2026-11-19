// A giant strip of text filling the panel flows endlessly, and rolling the wheel speeds it up then cools it down. Moving the mouse splits the panel into 5×5 cells and, for each cell,
// The bands shift separately and misalign like blocks, then slowly return in place — one three plane + our shader. Cell shifts accumulate 5×5 values on the CPU and are read as the nearest cell value.
(() => {
  const VERT = "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FRAG = `
    uniform sampler2D uMask;
    uniform sampler2D uGrid;
    uniform vec3 uColor;
    uniform vec2 uResolution;
    uniform float uScroll, uTexAspect, uViewAspect, uZoom, uPush, uHorizontal;
    varying vec2 vUv;
    void main() {
      vec2 push = texture2D(uGrid, gl_FragCoord.xy / uResolution).rg * uPush;
      vec2 st = uHorizontal > 0.5
        ? vec2((vUv.x - 0.5) * uViewAspect / (uTexAspect * uZoom) + uScroll, (vUv.y - 0.5) / uZoom + 0.5)
        : vec2((vUv.x - 0.5) / uZoom + 0.5, (vUv.y - 0.5) * uTexAspect / (uViewAspect * uZoom) + uScroll);
      st -= push;
      float across = uHorizontal > 0.5 ? st.y : st.x;
      float a = texture2D(uMask, st).a * step(0.0, across) * step(across, 1.0);
      gl_FragColor = vec4(uColor, a);
    }`;

  // Alpha strip made by measuring letters one by one and joining them — the vertical strip lays letters at -90° so they read from bottom to top. Between letters = Average character length × gap
  function buildMask(text, vertical, base, gap, font) {
    const m = document.createElement("canvas").getContext("2d");
    m.font = `900 200px ${font}`;
    const glyphs = [...text].filter((ch) => ch.trim()).map((ch) => {
      const t = m.measureText(ch);
      const k = base / Math.max(1, t.actualBoundingBoxAscent + Math.max(0, t.actualBoundingBoxDescent));
      return { ch, k, t, len: Math.max(1, Math.ceil((t.actualBoundingBoxLeft + t.actualBoundingBoxRight) * k)) };
    });
    if (!glyphs.length) return null;
    const avg = glyphs.reduce((s, g) => s + g.len, 0) / glyphs.length;
    const space = Math.round(avg * gap);
    const len = glyphs.reduce((s, g) => s + g.len + space, 0);
    const c = document.createElement("canvas");
    c.width = vertical ? base : len;
    c.height = vertical ? len : base;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; // Not skin: alpha plate — the shader applies color from skin variables
    let at = space / 2;
    for (const g of glyphs) {
      ctx.save();
      if (vertical) { ctx.translate(0, len - at); ctx.rotate(-Math.PI / 2); } else ctx.translate(at, 0);
      ctx.translate(0, base - Math.max(0, g.t.actualBoundingBoxDescent) * g.k);
      ctx.scale(g.k, g.k);
      ctx.font = `900 200px ${font}`;
      ctx.fillText(g.ch, g.t.actualBoundingBoxLeft, 0);
      ctx.restore();
      at += g.len + space;
    }
    return c;
  }

  // Paint one dot with the skin variable (incl. color-mix) and read it back as 0~1 rgb
  function readColor(el, name) {
    const probe = document.createElement("i");
    probe.style.cssText = `display:none;color:var(${name})`;
    el.append(probe);
    const css = getComputedStyle(probe).color;
    probe.remove();
    const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.LinearSRGBColorSpace);
  }

  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const smooth = (x) => { const t = Math.min(1, Math.max(0, x / 0.22)); return t * t * (3 - 2 * t); };

  kfFx.register("block-warp-strip", (el, { options, reduce, hover }) => {
    if (!window.THREE || !window.gsap) return;
    const text = options.text || el.getAttribute("aria-label") || "";
    if (!text.trim()) return;
    const vertical = (options.dir || "vertical") !== "horizontal";
    const speed = +(options.speed ?? 0.02), zoom = +(options.zoom ?? 0.9), gap = +(options.gap ?? 0.025);
    const wheelOn = options.wheel !== "0", pushOn = options.hover !== "0" && hover && !reduce;
    const colorName = options.color || "--kf-ink";
    const font = getComputedStyle(el).getPropertyValue("--kf-font-display").trim() || "sans-serif";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.fxPart = "canvas";
    el.prepend(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { canvas.remove(); return; }
    renderer.setClearColor(0, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
    const grid = new Float32Array(100);
    const gridTex = new THREE.DataTexture(grid, 5, 5, THREE.RGBAFormat, THREE.FloatType);
    gridTex.magFilter = gridTex.minFilter = THREE.NearestFilter;
    gridTex.needsUpdate = true;
    const u = {
      uMask: { value: null }, uGrid: { value: gridTex }, uColor: { value: readColor(el, colorName) }, uResolution: { value: new THREE.Vector2(1, 1) },
      uScroll: { value: 0 }, uTexAspect: { value: 1 }, uViewAspect: { value: 1 }, uZoom: { value: zoom }, uPush: { value: pushOn ? 0.03 : 0 },
      uHorizontal: { value: vertical ? 0 : 1 },
    };
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthWrite: false, depthTest: false });
    scene.add(new THREE.Mesh(geo, mat));
    let tex = null, W = 0, H = 0;

    const size = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      if (r.width === W && r.height === H && tex) return true;
      W = r.width; H = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
      renderer.getDrawingBufferSize(u.uResolution.value);
      u.uViewAspect.value = W / H;
      const base = Math.min(2048, Math.max(256, Math.round(((vertical ? W : H) * dpr * zoom) / 64) * 64));
      const mask = buildMask(text, vertical, base, gap, font);
      if (!mask) return false;
      tex?.dispose();
      tex = new THREE.CanvasTexture(mask);
      if (vertical) tex.wrapT = THREE.RepeatWrapping; else tex.wrapS = THREE.RepeatWrapping;
      tex.generateMipmaps = false;
      tex.minFilter = tex.magFilter = THREE.LinearFilter;
      u.uMask.value = tex;
      u.uTexAspect.value = mask.width / mask.height;
      return true;
    };
    const draw = () => { if (tex) renderer.render(scene, camera); };

    // Wheel: deltaY accumulated in one frame × 5e-5 ÷ frame length is the target speed (±2), followed with damping 12. Mouse: panel uv movement × 10 is added to cells within radius .22 and cooled by .965
    let offset = 0, vel = 0, accum = 0, mouse = null, dm = [0, 0], last = 0, visible = true, ly = null;
    const onWheel = (e) => { if (visible) accum += e.deltaY; };
    const onTouchStart = (e) => { ly = e.touches[0].clientY; };
    const onTouchMove = (e) => { const y = e.touches[0].clientY; if (ly != null && visible) accum += (ly - y) * 2; ly = y; };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const uv = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
      if (mouse) dm = [(uv[0] - mouse[0]) * 10, (uv[1] - mouse[1]) * 10];
      mouse = uv;
    };
    const tick = () => {
      if (!visible) return;
      const now = performance.now();
      const dt = last ? Math.max(1, Math.min(now - last, 50)) / 1000 : 1 / 60;
      last = now;
      let v = speed;
      if (wheelOn) {
        vel = damp(vel, Math.max(-2, Math.min(2, (5e-5 * accum) / dt)), 12, dt);
        accum = 0;
        v += vel;
      }
      offset = (((offset + v * dt) % 1) + 1) % 1;
      u.uScroll.value = offset;
      if (mouse) {
        dm[0] *= 0.965; dm[1] *= 0.965;
        for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
          const k = (j * 5 + i) * 4, d = 1 - smooth(Math.hypot((i + 0.5) / 5 - mouse[0], (j + 0.5) / 5 - mouse[1]));
          grid[k] = (grid[k] + dm[0] * d) * 0.965;
          grid[k + 1] = (grid[k + 1] + dm[1] * d) * 0.965;
        }
        gridTex.needsUpdate = true;
      }
      draw();
    };

    const ro = new ResizeObserver(() => { if (size()) draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; last = 0; });
    io.observe(el);
    if (size()) draw();
    if (!reduce) {
      gsap.ticker.add(tick);
      if (wheelOn) {
        addEventListener("wheel", onWheel, { passive: true });
        addEventListener("touchstart", onTouchStart, { passive: true });
        addEventListener("touchmove", onTouchMove, { passive: true });
      }
      if (pushOn) addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      tex?.dispose(); gridTex.dispose(); geo.dispose(); mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  });
})();
