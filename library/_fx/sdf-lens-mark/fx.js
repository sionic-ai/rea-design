// Draws the logo path on canvas and measures inside/outside distance (two squared-distance transforms), then passes a 0–255 distance-field image to the shader.
// The shader cuts the distance field smoothly by the edge width to draw lines, and enlarges that width and intensity only around the cursor.
(() => {
  const edt = (grid, w, h) => {
    const n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    const pass = (len) => {
      let k = 0;
      v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
      for (let q = 1; q < len; q++) {
        let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const dq = q - v[k]; d[q] = dq * dq + f[v[k]]; }
    };
    for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = grid[y * w + x]; pass(h); for (let y = 0; y < h; y++) grid[y * w + x] = d[y]; }
    for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = grid[y * w + x]; pass(w); for (let x = 0; x < w; x++) grid[y * w + x] = d[x]; }
  };
  const inkOf = (el) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(el).color;
    c.fillRect(0, 0, 1, 1);
    const p = c.getImageData(0, 0, 1, 1).data;
    return [p[0] / 255, p[1] / 255, p[2] / 255];
  };

  kfFx.register("sdf-lens-mark", (el, { options, reduce, hover }) => {
    const svg = el.querySelector("[data-fx-part=mark]");
    const T = window.THREE;
    if (!svg || reduce || !T) return;
    const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    if (vb.length !== 4 || !vb[2] || !vb[3]) return;
    const paths = [...svg.querySelectorAll("path")];
    if (!paths.length) return;
    const R = +(options.range ?? 40), MW = vb[2], MH = vb[3], W = Math.round(MW + R * 2), H = Math.round(MH + R * 2);
    const src = document.createElement("canvas");
    src.width = W; src.height = H;
    const g = src.getContext("2d", { willReadFrequently: true });
    g.translate(R - vb[0], R - vb[1]);
    g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = g.strokeStyle = "#fff"; /* Not skin: white brush for distance field calculation */
    for (const p of paths) {
      const path = new Path2D(p.getAttribute("d") || "");
      const sw = options.stroke ?? p.getAttribute("stroke-width");
      if (sw && p.getAttribute("stroke") !== "none") { g.lineWidth = +sw; g.stroke(path); } else g.fill(path);
    }
    const a = g.getImageData(0, 0, W, H).data, N = W * H, out = new Float64Array(N), inn = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const v = a[i * 4 + 3] / 255;
      out[i] = v === 1 ? 0 : v === 0 ? 1e20 : Math.max(0, 0.5 - v) ** 2;
      inn[i] = v === 1 ? 1e20 : v === 0 ? 0 : Math.max(0, v - 0.5) ** 2;
    }
    edt(out, W, H); edt(inn, W, H);
    const tex = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const s = (H - 1 - y) * W + x;
      tex[y * W + x] = Math.max(0, Math.min(255, Math.round(255 * (0.5 + (Math.sqrt(out[s]) - Math.sqrt(inn[s])) / (2 * R)))));
    }
    let renderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    const cv = renderer.domElement;
    cv.setAttribute("aria-hidden", "true");
    Object.assign(cv.style, { left: `${(-R / MW) * 100}%`, top: `${(-R / MH) * 100}%`, width: `${(W / MW) * 100}%`, height: `${(H / MH) * 100}%` });
    el.append(cv);
    el.classList.add("is-live");
    const field = new T.DataTexture(tex, W, H, T.RedFormat, T.UnsignedByteType);
    field.minFilter = field.magFilter = T.LinearFilter; field.generateMipmaps = false; field.unpackAlignment = 1; field.needsUpdate = true;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 10);
    cam.position.z = 1;
    const mat = new T.ShaderMaterial({
      transparent: true,
      uniforms: {
        uField: { value: field }, uPointer: { value: new T.Vector2(-9999, -9999) }, uSize: { value: new T.Vector2(W, H) },
        uRange: { value: R }, uInk: { value: new T.Vector3(...inkOf(el)) },
        uRadius: { value: +(options.radius ?? 64) }, uSoft: { value: +(options.soft ?? 140) }, uBlur: { value: +(options.blur ?? 28) }, uGain: { value: +(options.gain ?? 4.5) },
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `precision highp float;
        varying vec2 vUv;
        uniform sampler2D uField; uniform vec2 uPointer, uSize; uniform vec3 uInk;
        uniform float uRange, uRadius, uSoft, uBlur, uGain;
        float band(float x, float r, float s){ return 1.0 - smoothstep(r - s, r + s, x); }
        void main(){
          float dist = (texture2D(uField, vUv).r - 0.5) * 2.0 * uRange;
          float near = band(distance(vUv * uSize, uPointer), uRadius, uSoft);
          float a = clamp(band(dist, 0.0, mix(0.75, uBlur, near)) * mix(1.0, uGain, near), 0.0, 1.0);
          gl_FragColor = vec4(uInk, a);
        }`,
    });
    const quad = new T.Mesh(new T.PlaneGeometry(W, H), mat);
    scene.add(quad);
    renderer.compile(scene, cam);
    renderer.render(scene, cam);
    const damp = +(options.damp ?? 8);
    const target = new T.Vector2(-9999, -9999), cur = new T.Vector2(-9999, -9999);
    let seen = false, raf = 0, last = 0;
    const move = (e) => {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      target.set(((e.clientX - r.left) * W) / r.width, ((r.height - (e.clientY - r.top)) * H) / r.height);
      if (!seen) { seen = true; cur.copy(target); }
    };
    if (hover) addEventListener("pointermove", move, { passive: true });
    const tick = (now) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - (last || now)) / 1000));
      last = now;
      const k = 1 - Math.exp(-damp * dt);
      cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k;
      mat.uniforms.uPointer.value.copy(cur);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hover) { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
      else { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(cv);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      removeEventListener("pointermove", move);
      quad.geometry.dispose(); mat.dispose(); field.dispose(); renderer.dispose();
      cv.remove(); el.classList.remove("is-live");
    };
  });
})();
