// Over a dark stage, three bundles of glowing sine lines (bottom, middle, top, N lines per bundle) flow via shader,
// Bends only the lines near the mouse toward the mouse height — bend = (mouse y − dot y) · e^(−distance² · radius) · bend · entry.
// Entrance (0↔1), mouse position and screen shift (parallax) follow by a follow fraction of the remaining distance every frame (60fps).
// A single line’s brightness is .0175 / (|distance to line| + .01) + .01 — a light streak whose center burns and whose surroundings bleed. Within a bundle the color crosses evenly between --fx-line-1…
(() => {
  const VS = "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FS = `precision highp float;
    uniform vec2 uRes, uPtr, uShift;
    uniform float uT, uPull, uGap, uRad, uBend;
    uniform int uCount, uInks;
    uniform vec3 uInk[8];
    uniform vec3 uLow, uMid, uTop;

    vec3 inkAt(float t) {
      if (uInks < 2) return uInk[0] * 0.5;
      float s = clamp(t, 0.0, 0.9999) * float(uInks - 1);
      int k = int(floor(s));
      vec3 a = uInk[0], b = uInk[0];
      for (int i = 0; i < 8; i++) { if (i == k) a = uInk[i]; if (i == k + 1) b = uInk[i]; }
      if (k + 1 >= uInks) b = a;
      return mix(a, b, fract(s)) * 0.5;
    }

    float glow(vec2 p, float phase, vec2 q) {
      float wobble = sin(phase + uT * 0.2) * 0.3;
      float y = sin(p.x + phase + uT * 0.1) * wobble;
      vec2 d = q - uPtr;
      y += (uPtr.y - q.y) * exp(-dot(d, d) * uRad) * uBend * uPull;
      return 0.0175 / max(abs(p.y - y) + 0.01, 0.001) + 0.01;
    }

    vec3 bundle(vec2 q, vec3 at, float phase0, float dphase, float flip, float weight) {
      float turn = at.z * log(length(q) + 1.0);
      vec2 p = q * mat2(cos(turn), sin(turn), -sin(turn), cos(turn));
      p.x *= flip;
      vec3 sum = vec3(0.0);
      float last = max(float(uCount - 1), 1.0);
      for (int i = 0; i < 12; i++) {
        if (i >= uCount) break;
        float f = float(i);
        sum += inkAt(f / last) * glow(p + vec2(uGap * f + at.x, at.y), phase0 + dphase * f, q) * weight;
      }
      return sum;
    }

    void main() {
      vec2 q = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;
      q.y = -q.y;
      q += uShift;
      vec3 col = bundle(q, uLow, 1.5, 0.2, 1.0, 0.2)
               + bundle(q, uMid, 2.0, 0.15, 1.0, 1.0)
               + bundle(q, uTop, 1.0, 0.2, -1.0, 0.1);
      gl_FragColor = vec4(col, 1.0);
    }`;

  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  // Skin variables are in oklch(from …) form, so the computed color string is painted on a canvas and read as sRGB — null if empty.
  // A missing variable applied to color is invalid and inherits the parent text color, so check the variable value first
  const rgbOf = (el, name) => {
    if (!getComputedStyle(el).getPropertyValue(name).trim()) return null;
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:transparent;color:var(${name})`;
    el.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    pg.clearRect(0, 0, 1, 1); pg.fillStyle = "transparent"; pg.fillStyle = c; pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return d[3] ? [d[0] / 255, d[1] / 255, d[2] / 255] : null;
  };
  const triple = (s, def) => {
    const v = String(s ?? "").split(/[\s,]+/).filter(Boolean).map(Number);
    return v.length === 3 && v.every(Number.isFinite) ? v : def;
  };

  kfFx.register("glow-lines-bend", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T) return;
    const layer = document.createElement("div");
    layer.className = "fx-glb";
    layer.setAttribute("data-fx-part", "glow-layer");
    layer.setAttribute("aria-hidden", "true");
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false }); } catch { return; }
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    layer.append(renderer.domElement);
    el.prepend(layer);

    const count = Math.min(12, Math.max(1, Math.round(+options.count || 6)));
    const follow = +(options.follow ?? 0.05);
    const parallax = +(options.parallax ?? 0.2);
    const speed = +(options.speed ?? 1);
    const uniforms = {
      uRes: { value: new T.Vector2(1, 1) }, uPtr: { value: new T.Vector2(-1000, -1000) }, uShift: { value: new T.Vector2() },
      uT: { value: 0 }, uPull: { value: 0 }, uGap: { value: +(options.gap ?? 0.515) },
      uRad: { value: +(options.radius ?? 6.5) }, uBend: { value: +(options.bend ?? 2) },
      uCount: { value: count }, uInks: { value: 1 },
      uInk: { value: Array.from({ length: 8 }, () => new T.Vector3(1, 1, 1)) },
      uLow: { value: new T.Vector3(...triple(options.low, [2, -0.7, -1])) },
      uMid: { value: new T.Vector3(...triple(options.mid, [5, 0, 0.2])) },
      uTop: { value: new T.Vector3(...triple(options.top, [10, 0.5, -0.4])) },
    };
    const inks = () => {
      const got = [];
      for (let i = 1; i <= 8; i++) { const c = rgbOf(el, `--fx-line-${i}`); if (c) got.push(c); }
      if (!got.length) got.push(rgbOf(el, "--kf-accent") || [1, 1, 1]);
      got.forEach((c, i) => uniforms.uInk.value[i].set(...c));
      uniforms.uInks.value = got.length;
    };
    inks();
    const scene = new T.Scene(), cam = new T.Camera();
    const geo = new T.PlaneGeometry(2, 2);
    const mat = new T.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false });
    scene.add(new T.Mesh(geo, mat));
    const size = () => {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, +(options.dpr ?? 1.5)));
      renderer.setSize(el.clientWidth || 1, el.clientHeight || 1, false);
      uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const ptr = new T.Vector2(-1000, -1000), shift = new T.Vector2();
    let inside = 0;
    const ac = new AbortController();
    if (hover && !reduce) {
      addEventListener("pointermove", (e) => {
        const r = renderer.domElement.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (x < 0 || y < 0 || x > r.width || y > r.height) { inside = 0; return; }
        const pr = renderer.getPixelRatio();
        ptr.set(x * pr, (r.height - y) * pr);
        inside = 1;
        // Mouse position is kept in pixels and converted to screen-ratio coordinates in the shader — so the warp radius stays round regardless of aspect ratio
        shift.set((x - r.width / 2) / r.width * parallax, -(y - r.height / 2) / r.height * parallax);
      }, { passive: true, signal: ac.signal });
      document.documentElement.addEventListener("pointerleave", () => { inside = 0; }, { signal: ac.signal });
    }

    let shown = true, ready = false, last = 0, raf = 0;
    const t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { shown = e.isIntersecting; });
    io.observe(el);
    const px = new T.Vector2(-1000, -1000);
    const draw = (now) => {
      const dt = last ? Math.max(1, now - last) : 16.667;
      last = now;
      const k = 1 - Math.pow(1 - follow, dt / 16.667);
      px.lerp(ptr, k);
      const res = uniforms.uRes.value;
      uniforms.uPtr.value.set((2 * px.x - res.x) / res.y, -((2 * px.y - res.y) / res.y));
      uniforms.uPull.value += (inside - uniforms.uPull.value) * k;
      uniforms.uShift.value.lerp(shift, k);
      uniforms.uT.value = reduce ? 4 : ((now - t0) / 1000) * speed;
      renderer.render(scene, cam);
      if (!ready) { ready = true; layer.classList.add("is-on"); }
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (shown && !document.hidden) draw(now);
    };
    // Like the original, run after the page has finished loading and gone idle (immediately if wait: none) — it starts later than the hero image and text so only the stage is set first
    let idle = 0, gone = false;
    const start = () => {
      if (gone) return;
      if (reduce) draw(performance.now());
      else raf = requestAnimationFrame(loop);
    };
    const soon = () => { idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 500); };
    if (options.wait === "none") start();
    else if (document.readyState === "complete") soon();
    else addEventListener("load", soon, { once: true, signal: ac.signal });

    return () => {
      gone = true;
      if (window.cancelIdleCallback) cancelIdleCallback(idle); clearTimeout(idle);
      ac.abort(); io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf);
      geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss?.();
      layer.remove();
    };
  });
})();
