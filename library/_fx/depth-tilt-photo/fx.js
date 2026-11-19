(() => {
  // A 3D plate made by pushing a photo forward from a 128×128 plane by its depth map — it slowly turns following the mouse (.17 rad horizontal · .09 rad vertical, catching up 3% per frame at 60fps),
  // Sways as if breathing even when idle, and when a hand is raised, the upper-left light turns on to match the normal built from a depth tilt.
  // Child: data-fx-part="image"(img·canvas), data-fx-part="depth"(img·canvas, if absent, built by blurring the photo’s alpha·brightness)
  // Lens (video reflected in sunglasses): data-fx-part="lens"(Lens-shaped mask, same aspect ratio as the photo), data-fx-part="reflection"(video·canvas — re-read every frame),
  //   data-fx-part="sheen"(bundled light over the lens, blended with overlay)·data-fx-part="logo"(lens corner marks, blended with multiply) — only on when a lens mask is present
  // The --fx-reveal (0 to 1) on the element style can make it melt in from bottom to top (the slot that receives the intro progress value)
  const VERT = `
    uniform sampler2D tDepth; uniform float uDisp; uniform float uGamma;
    varying vec2 vUv; varying float vDepth;
    void main(){
      vUv = uv;
      float d = pow(texture2D(tDepth, uv).r, uGamma);
      vDepth = d;
      vec3 p = position + vec3(0.0, 0.0, d * uDisp);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `
    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform float uLight; uniform vec3 uLightDir; uniform float uReveal; uniform vec2 uTexel; uniform float uLit;
    #ifdef LENS
    uniform sampler2D tLens; uniform sampler2D tRefl; uniform vec2 uReflOffset; uniform vec2 uSplit; uniform vec4 uLensUv; uniform float uFish;
    uniform vec3 uReflHSB; uniform float uReflGain; uniform float uCrt; uniform vec2 uCrtCell;
    #endif
    #ifdef SHEEN
    uniform sampler2D tSheen; uniform vec3 uSheenHSB; uniform float uSheenOpacity;
    #endif
    #ifdef LOGO
    uniform sampler2D tLogo; uniform float uLogoOpacity;
    #endif
    varying vec2 vUv; varying float vDepth;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    #ifdef LENS
    vec3 rgb2hsv(vec3 c){
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x);
    }
    vec3 hsv2rgb(vec3 c){
      vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
      return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
    }
    vec3 hsb(vec3 rgb, vec3 d){
      vec3 h = rgb2hsv(rgb);
      return hsv2rgb(vec3(fract(h.x + d.x), clamp(h.y * d.y, 0.0, 1.0), clamp(h.z * d.z, 0.0, 1.0)));
    }
    vec2 fisheye(vec2 uv, float k){
      vec2 c = uv - 0.5;
      float r = length(c);
      return c * (1.0 + k * r * r) + 0.5;
    }
    #endif
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      c.rgb *= uLit;
      if (uLight > 0.001) {
        float dx = texture2D(tDepth, vUv + vec2(uTexel.x, 0.0)).r - texture2D(tDepth, vUv - vec2(uTexel.x, 0.0)).r;
        float dy = texture2D(tDepth, vUv + vec2(0.0, uTexel.y)).r - texture2D(tDepth, vUv - vec2(0.0, uTexel.y)).r;
        vec3 n = normalize(vec3(-dx * 6.0, -dy * 6.0, 1.0));
        float k = max(dot(n, normalize(uLightDir)), 0.0);
        c.rgb += c.rgb * uLight * (0.35 * k + 0.12 * vDepth);
      }
      #ifdef LENS
      // Only the lens area shows the video — the plate UV is scaled, vertically squashed and offset, then bent like a fisheye and read from the video, and R and B are split apart by the cursor speed
      float m = texture2D(tLens, vUv).r;
      if (m > 0.001) {
        vec2 l = (vUv - 0.5) * uLensUv.x + 0.5;
        l.y = (l.y - 0.5) / uLensUv.y + 0.5;
        l += uReflOffset + uLensUv.zw;
        l = fisheye(l, uFish);
        vec3 rc = vec3(texture2D(tRefl, clamp(l + uSplit, 0.0, 1.0)).r, texture2D(tRefl, clamp(l, 0.0, 1.0)).g, texture2D(tRefl, clamp(l - uSplit, 0.0, 1.0)).b);
        vec3 g = hsb(rc, uReflHSB) * uReflGain;
        // CRT texture — vertical RGB grid and horizontal scanlines, re-brightened by the darkened average
        float gx = l.x / uCrtCell.x * 6.2831853;
        vec3 grille = 0.5 + 0.5 * vec3(sin(gx), sin(gx + 2.0944), sin(gx + 4.1888));
        g *= mix(vec3(1.0), 0.62 + 0.76 * grille, uCrt * 0.5);
        g *= 1.0 - uCrt * 0.38 * (0.5 + 0.5 * sin(l.y / uCrtCell.y * 6.2831853));
        g *= 1.0 + uCrt * 0.22;
        #ifdef SHEEN
        vec4 sh = texture2D(tSheen, vUv);
        vec3 t = hsb(sh.rgb, uSheenHSB);
        vec3 ov = mix(2.0 * g * t, 1.0 - 2.0 * (1.0 - g) * (1.0 - t), step(0.5, g));
        g = mix(g, ov, sh.a * uSheenOpacity);
        #endif
        #ifdef LOGO
        vec4 lg = texture2D(tLogo, vUv);
        g = mix(g, g * lg.rgb, lg.a * uLogoOpacity);
        #endif
        c.rgb = mix(c.rgb, g, m);
      }
      #endif
      // Reveal that melts up from below, with grain boundaries blurring across an 8% width
      float edge = uReveal * 1.16 - 0.08;
      float mk = smoothstep(edge - 0.08, edge, 1.0 - vUv.y + (hash(floor(vUv * 180.0)) - 0.5) * 0.06);
      c.a *= 1.0 - mk;
      if (c.a < 0.004) discard;
      gl_FragColor = c;
    }`;

  const toCanvas = (src, w, h) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(src, 0, 0, w, h);
    return c;
  };
  // Without depth, mix alpha (cutout) and brightness and blur heavily — a plate low at the edges and swollen in the middle
  const fakeDepth = (src) => {
    const w = 256, h = Math.max(1, Math.round(256 * (src.height || 1) / (src.width || 1)));
    const a = toCanvas(src, w, h), x = a.getContext("2d"), img = x.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const lum = (img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11) / 255;
      const v = Math.round(255 * (img.data[i + 3] / 255) * (0.75 + 0.25 * lum));
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const b = document.createElement("canvas");
    b.width = w; b.height = h;
    const y = b.getContext("2d");
    y.filter = "blur(10px)";
    y.drawImage(a, 0, 0);
    return b;
  };
  // Follow by k per frame at 60fps, independent of frame length
  const follow = (k, dt) => 1 - Math.pow(1 - k, 60 * dt);

  kfFx.register("depth-tilt-photo", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const image = el.querySelector('[data-fx-part="image"]');
    if (!T || !image) return;
    const num = (k, d) => (options[k] != null && options[k] !== "" ? +options[k] : d);
    const pair = (k, d) => (options[k] ? options[k].split(",").map(Number) : d);
    const o = {
      fov: num("fov", 19), z: num("z", 2.65), disp: num("disp", 0.18), gamma: num("gamma", 1),
      ix: num("intensity", 0.17), iy: num("intensity-v", 0.09), ease: num("ease", 0.03),
      breath: num("breath", 0.5), bx: num("breath-x", 0.014), by: num("breath-y", 0.02),
      over: num("overscan", 1.12), light: options.light !== "off",
      lit: options.lit === "on", amb: num("ambient", 3), dir: num("direct", 4), rim: num("rim", 1.25), lp: pair("light-pos", [-3.3, -4.2, 4]),
      lensScale: num("lens-scale", 2.35), lensScaleY: num("lens-scale-y", 0.54), lensX: num("lens-x", 0), lensY: num("lens-y", -0.67), fish: num("fisheye", 3.45),
      gain: num("lens-gain", 1.3), hsb: pair("lens-hsb", [0, 0.75, 0.6]), pan: pair("lens-pan", [-0.03, 0.02]),
      crt: num("crt", 0.5), cell: pair("crt-cell", [6, 5]), split: pair("split", [0.012, 0.006]), decay: num("split-decay", 0.94), splitEase: num("split-ease", 0.12),
      sheenHsb: pair("sheen-hsb", [0, 2.8, 1]), sheenOpacity: num("sheen-opacity", 1), logoOpacity: num("logo-opacity", 0.2),
    };
    let canvas = el.querySelector("canvas[data-fx-part='stage']");
    const made = !canvas;
    if (made) {
      canvas = document.createElement("canvas");
      canvas.dataset.fxPart = "stage";
      el.append(canvas);
    }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false }); } catch { return () => made && canvas.remove(); }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(o.fov, 1, 0.1, 100);
    cam.position.z = o.z;
    const tex = (src) => {
      const t = new T.CanvasTexture(src.tagName === "CANVAS" ? src : toCanvas(src, src.naturalWidth || src.width || 512, src.naturalHeight || src.height || 512));
      t.colorSpace = T.SRGBColorSpace; t.minFilter = t.magFilter = T.LinearFilter; t.generateMipmaps = false;
      return t;
    };
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const depthEl = part("depth"), lensEl = part("lens"), reflEl = part("reflection"), sheenEl = part("sheen"), logoEl = part("logo");
    const lensOn = !!(lensEl && reflEl);
    const ready = () => image.tagName !== "IMG" || (image.complete && image.naturalWidth);
    let mesh = null, mat = null, geo = null, tD = null, tZ = null, tL = null, tR = null, tS = null, tG = null, aspect = 1;
    const build = () => {
      aspect = (image.naturalWidth || image.width) / (image.naturalHeight || image.height) || 1;
      tD = tex(image);
      tZ = new T.CanvasTexture(depthEl ? (depthEl.tagName === "CANVAS" ? depthEl : toCanvas(depthEl, 256, 256)) : fakeDepth(image));
      tZ.minFilter = tZ.magFilter = T.LinearFilter;
      geo = new T.PlaneGeometry(aspect, 1, 128, 128);
      const uniforms = { tDiffuse: { value: tD }, tDepth: { value: tZ }, uDisp: { value: o.disp }, uGamma: { value: o.gamma }, uLight: { value: 0 }, uLightDir: { value: new T.Vector3(-0.15, 0.2, 0.75).normalize() }, uReveal: { value: 1 }, uTexel: { value: new T.Vector2(1 / 256, 1 / 256) }, uLit: { value: 1 } };
      const defines = {};
      if (lensOn) {
        defines.LENS = "";
        tL = tex(lensEl); tL.colorSpace = T.NoColorSpace;
        tR = reflEl.tagName === "VIDEO" ? new T.VideoTexture(reflEl) : tex(reflEl);
        tR.colorSpace = T.SRGBColorSpace; tR.minFilter = tR.magFilter = T.LinearFilter;
        Object.assign(uniforms, {
          tLens: { value: tL }, tRefl: { value: tR }, uReflOffset: { value: new T.Vector2() }, uSplit: { value: new T.Vector2() },
          uLensUv: { value: new T.Vector4(o.lensScale, o.lensScaleY, o.lensX, o.lensY) }, uFish: { value: o.fish },
          uReflHSB: { value: new T.Vector3(...o.hsb) }, uReflGain: { value: o.gain }, uCrt: { value: o.crt }, uCrtCell: { value: new T.Vector2(o.cell[0] / innerWidth, o.cell[1] / innerHeight) },
        });
        if (sheenEl) { defines.SHEEN = ""; tS = tex(sheenEl); Object.assign(uniforms, { tSheen: { value: tS }, uSheenHSB: { value: new T.Vector3(...o.sheenHsb) }, uSheenOpacity: { value: o.sheenOpacity } }); }
        if (logoEl) { defines.LOGO = ""; tG = tex(logoEl); Object.assign(uniforms, { tLogo: { value: tG }, uLogoOpacity: { value: o.logoOpacity } }); }
      }
      mat = new T.ShaderMaterial({ transparent: true, vertexShader: VERT, fragmentShader: FRAG, defines, uniforms });
      mesh = new T.Mesh(geo, mat);
      scene.add(mesh);
      fit();
      // Weaving the shader in on the first cursor move freezes the screen, so weave it in ahead of time during setup
      renderer.compile(scene, cam);
    };
    // Fit to the camera height so the plate fully covers the element (overscan 1.12)
    const fit = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      if (mat?.uniforms.uCrtCell) mat.uniforms.uCrtCell.value.set(o.cell[0] / innerWidth, o.cell[1] / innerHeight);
      if (!mesh) return;
      const vh = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z, vw = vh * cam.aspect;
      const s = Math.min(vw / aspect, vh) * o.over;
      mesh.scale.set(s, s, s);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    // Cursor speed: accumulate movement/60 (max 1), decay it every frame, and split R and B along that direction
    const flick = { has: false, lx: 0, ly: 0, dx: 1, dy: 0, imp: 0, sx: 0, sy: 0 };
    let over = false, light = 0;
    const move = (e) => {
      target.x = (e.clientX / innerWidth) * 2 - 1; target.y = (e.clientY / innerHeight) * 2 - 1;
      if (flick.has) {
        const dx = e.clientX - flick.lx, dy = e.clientY - flick.ly, r = Math.hypot(dx, dy);
        if (r > 0.5) { flick.dx = dx / r; flick.dy = dy / r; flick.imp = Math.min(1, flick.imp + r / 60); }
      }
      flick.lx = e.clientX; flick.ly = e.clientY; flick.has = true;
    };
    const enter = () => (over = true), leave = () => (over = false);
    if (!reduce && hover) addEventListener("mousemove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    const lightDir = new T.Vector3(...o.lp).normalize(), rimDir = new T.Vector3(0, -1, -2).normalize(), nrm = new T.Vector3();
    const irradiance = (n) => o.amb + o.dir * Math.max(0, n.dot(lightDir)) + o.rim * Math.max(0, n.dot(rimDir));
    const rest = irradiance(new T.Vector3(0, 0, 1));
    let raf = 0, t0 = performance.now(), last = 0, visible = true, built = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(tick); } });
    io.observe(el);
    function tick(now) {
      raf = 0;
      if (!built && ready()) { build(); built = true; canvas.style.opacity = "1"; }
      if (mesh) {
        const t = (now - t0) / 1000, dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
        last = now;
        const k = follow(o.ease, dt);
        cur.x += (target.x - cur.x) * k;
        cur.y += (target.y - cur.y) * k;
        const rv = parseFloat(el.style.getPropertyValue("--fx-reveal")), reveal = Number.isFinite(rv) ? rv : 1;
        // Starts following the cursor only once the intro is nearly done (85%→100%)
        const s = Math.max(0, Math.min(1, (reveal - 0.85) / 0.15)), settle = s * s * (3 - 2 * s);
        const bx = reduce ? 0 : Math.sin(t * o.breath) * o.bx, by = reduce ? 0 : Math.cos(t * o.breath * 0.8) * o.by;
        mesh.rotation.y = cur.x * o.ix * settle + bx;
        mesh.rotation.x = cur.y * o.iy * settle + by;
        light += ((o.light && over && hover ? 1 : 0) - light) * follow(0.08, dt);
        mat.uniforms.uLight.value = light;
        mat.uniforms.uLightDir.value.set(0.75 * cur.x - 0.15, -0.75 * cur.y + 0.2, 0.7).normalize();
        // When the panel turns, the normal turns toward or away from the light and the whole panel brightness changes (ambient 3 · front 4 · back light 1.25).
        mat.uniforms.uLit.value = o.lit ? irradiance(nrm.set(0, 0, 1).applyEuler(mesh.rotation)) / rest : 1;
        mat.uniforms.uReveal.value = reveal;
        if (lensOn) {
          mat.uniforms.uReflOffset.value.set(o.pan[0] * cur.x * settle, o.pan[1] * cur.y * settle);
          flick.imp *= Math.pow(o.decay, 60 * dt);
          if (flick.imp < 0.004) flick.imp = 0;
          const ks = follow(o.splitEase, dt);
          flick.sx += (flick.dx * flick.imp * o.split[0] - flick.sx) * ks;
          flick.sy += (flick.dy * flick.imp * o.split[1] - flick.sy) * ks;
          mat.uniforms.uSplit.value.set(flick.sx, flick.sy);
          if (reflEl.tagName !== "VIDEO") tR.needsUpdate = true;
        }
        renderer.render(scene, cam);
      }
      if (visible && !reduce) raf = requestAnimationFrame(tick);
      else if (!mesh) raf = requestAnimationFrame(tick);
    }
    canvas.style.transition = "opacity .6s ease";
    canvas.style.opacity = "0";
    raf = requestAnimationFrame(tick);
    const redraw = () => { if (reduce && mesh) { if (tR && reflEl.tagName !== "VIDEO") tR.needsUpdate = true; renderer.render(scene, cam); } };
    ro.observe(document.documentElement);
    addEventListener("fx:depth-redraw", redraw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      removeEventListener("mousemove", move);
      removeEventListener("fx:depth-redraw", redraw);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      [tD, tZ, tL, tR, tS, tG].forEach((x) => x?.dispose());
      geo?.dispose(); mat?.dispose(); renderer.dispose();
      if (made) canvas.remove();
    };
  });
})();
