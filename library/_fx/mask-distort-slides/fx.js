(() => {
  // Swaps photo plates with a shader — a capsule shape grows from the center enough to cover the screen as it opens, and the next photo comes in overlapping, bent like a lens and pulled small, then relaxes.
  // While dwelling it approaches slowly (timer zoom), and approaches further with scroll
  const VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;
  const FRAG = `
    precision highp float;
    uniform sampler2D uMap;
    uniform vec2 uSize;
    uniform float uImgAspect;
    uniform float uOpacity;
    uniform float uScroll;
    uniform float uScrollZoom;
    uniform float uTimer;
    uniform float uTimerZoom;
    uniform float uFx;
    uniform float uWarp;
    uniform float uWarpPower;
    uniform float uPull;
    uniform float uPullAmount;
    uniform float uMaskOn;
    uniform float uMask;
    uniform vec2 uMaskHalf;
    uniform float uRound;
    varying vec2 vUv;

    vec2 fill(vec2 uv, float img, float view) {
      vec2 c = uv - 0.5;
      if (view > img) c.y *= img / view; else c.x *= view / img;
      return c + 0.5;
    }
    vec2 scaleAt(vec2 uv, float s) { return (uv - 0.5) / s + 0.5; }

    float capsule() {
      if (uMaskOn < 0.5) return 1.0;
      if (uMask <= 0.0) return 0.0;
      vec2 p = abs((vUv - 0.5) * uSize) / (uMaskHalf * uMask);
      float f = pow(p.x, uRound) + pow(p.y, uRound);
      float w = fwidth(f);
      return 1.0 - smoothstep(1.0 - w, 1.0 + w, f);
    }

    void main() {
      vec2 uv = fill(vUv, uImgAspect, uSize.x / uSize.y);
      uv = scaleAt(uv, 1.0 + uScroll * uScrollZoom * 0.01);
      uv = scaleAt(uv, 1.0 + uTimer * uTimerZoom * 0.01);
      if (uFx > 0.5) {
        uv = scaleAt(uv, mix(1.0 - uPullAmount, 1.0, uPull));
        vec2 d = uv - 0.5;
        uv = 0.5 + d * (1.0 - uWarpPower * (1.0 - uWarp) * dot(d, d));
      }
      vec4 c = texture2D(uMap, uv);
      gl_FragColor = vec4(c.rgb, c.a * uOpacity * capsule());
    }
  `;
  const curve = {
    sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    quintOut: (t) => 1 - (1 - t) ** 5,
    quartOut: (t) => 1 - (1 - t) ** 4,
    cubicOut: (t) => 1 - (1 - t) ** 3,
    expoInOut: (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
  };
  const ROUND = 2.4;
  // Superellipse multiplier covering to the screen corners
  const coverK = (W, H, w0, h0) => ((W / w0) ** ROUND + (H / h0) ** ROUND) ** (1 / ROUND);

  // Where there is no photo, a placeholder panel (background, diagonal, label) is drawn on a canvas — the color is that slot’s computed color
  // Turn variable values (expressions like color-mix) into browser-computed colors and pass them to the canvas
  const resolve = (host, css) => {
    if (!css) return "transparent";
    const s = document.createElement("span");
    s.style.color = css;
    host.append(s);
    const out = getComputedStyle(s).color;
    s.remove();
    return out;
  };
  const placeholder = (slide) => {
    const c = document.createElement("canvas");
    c.width = 1600; c.height = 1000;
    const g = c.getContext("2d");
    const ref = slide.querySelector(".wf-img") || slide;
    const cs = getComputedStyle(ref);
    g.fillStyle = resolve(ref, cs.getPropertyValue("--wf-fill").trim()) || cs.backgroundColor;
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = resolve(ref, cs.getPropertyValue("--wf-line").trim());
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    const label = ref.dataset.label || slide.dataset.label || "";
    if (label) {
      g.fillStyle = resolve(ref, cs.getPropertyValue("--wf-fill-ink").trim()) || cs.color;
      g.font = `600 30px ${getComputedStyle(document.body).fontFamily}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, c.width / 2, c.height * 0.3, c.width * 0.9);
    }
    return c;
  };

  kfFx.register("mask-distort-slides", (el, { options: o, reduce }) => {
    const T = window.THREE;
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!T || !window.gsap || !slides.length) return;
    const num = (k, d) => +(o[k] ?? d);
    const cfg = {
      show: num("show", 4), fade: num("fade", 1.2), warp: num("warp", 1.6), warpPower: num("warp-power", 6),
      pull: num("pull", 1.5), pullAmount: num("pull-amount", 0.5), timerZoom: num("timer-zoom", 20), timerZoomNarrow: num("timer-zoom-narrow", 4),
      narrow: +o.narrow || 1024, scrollZoom: num("scroll-zoom", 40), scroll: o.scroll || "",
      mask: o.mask !== "none", maskDur: num("mask-dur", 1), maskWarpAt: num("mask-warp-at", 0.25), maskPull: num("mask-pull", 1.5),
      maskW: +o["mask-w"] || 463, maskH: +o["mask-h"] || 320, wait: num("wait", 0.5),
    };

    const canvas = document.createElement("canvas");
    canvas.className = "fx-mask-distort-canvas";
    el.prepend(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, depth: false });
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new T.PlaneGeometry(2, 2);
    const shared = { scroll: 0, mask: cfg.mask ? 0 : 1 };

    const layers = slides.map((slide, i) => {
      const img = slide.querySelector("img");
      const tex = new T.Texture();
      tex.colorSpace = T.SRGBColorSpace;
      tex.minFilter = T.LinearFilter;
      tex.generateMipmaps = false;
      const uniforms = {
        uMap: { value: tex }, uSize: { value: new T.Vector2(1, 1) }, uImgAspect: { value: 1.6 }, uOpacity: { value: i === 0 ? 1 : 0 },
        uScroll: { value: 0 }, uScrollZoom: { value: cfg.scrollZoom }, uTimer: { value: 0 }, uTimerZoom: { value: cfg.timerZoom },
        uFx: { value: 0 }, uWarp: { value: 1 }, uWarpPower: { value: cfg.warpPower }, uPull: { value: 1 }, uPullAmount: { value: cfg.pullAmount },
        uMaskOn: { value: cfg.mask ? 1 : 0 }, uMask: { value: shared.mask }, uMaskHalf: { value: new T.Vector2(1, 1) }, uRound: { value: ROUND },
      };
      const setSource = (src, aspect) => { tex.image = src; tex.needsUpdate = true; uniforms.uImgAspect.value = aspect; };
      if (img && img.complete && img.naturalWidth) setSource(img, img.naturalWidth / img.naturalHeight);
      else if (img) img.addEventListener("load", () => setSource(img, img.naturalWidth / img.naturalHeight), { once: true });
      else { const c = placeholder(slide); setSource(c, c.width / c.height); }
      const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
      const mesh = new T.Mesh(geo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = i === 0 ? 1 : 0;
      scene.add(mesh);
      return { slide, tex, mat, mesh, u: uniforms, timer: 0, born: 0 };
    });
    el.classList.add("fx-gl-on");

    const size = () => {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      const k = coverK(W, H, cfg.maskW, cfg.maskH) * 1.02;
      for (const l of layers) {
        l.u.uSize.value.set(W, H);
        l.u.uMaskHalf.value.set((cfg.maskW / 2) * k, (cfg.maskH / 2) * k);
        l.u.uTimerZoom.value = innerWidth < cfg.narrow ? cfg.timerZoomNarrow : cfg.timerZoom;
      }
    };
    size();

    let index = 0, running = false, shownFor = 0, last = 0;
    const tweens = new Set();
    const run = (dur, ease, fn, delay = 0) => {
      const p = { t: 0 };
      const tw = gsap.to(p, { t: 1, duration: dur, delay, ease: "none", onUpdate: () => fn(ease(p.t)), onComplete: () => tweens.delete(tw) });
      tweens.add(tw);
      return tw;
    };
    // Incoming board: bend 1.6s quint.out · pull 1.5s cubic.out · overlap 1.2s sine.inOut
    const enter = (l, { warpDur = cfg.warp, pullDur = cfg.pull, pullEase = curve.cubicOut, warpDelay = 0, fadeDur = cfg.fade } = {}) => {
      l.u.uFx.value = 1;
      l.u.uWarp.value = 0;
      l.u.uPull.value = 0;
      run(warpDur, curve.quintOut, (v) => (l.u.uWarp.value = v), warpDelay);
      run(pullDur, pullEase, (v) => (l.u.uPull.value = v), warpDelay);
      if (fadeDur > 0) run(fadeDur, curve.sineInOut, (v) => (l.u.uOpacity.value = v));
    };
    const next = () => {
      const from = layers[index];
      index = (index + 1) % layers.length;
      const to = layers[index];
      layers.forEach((l) => (l.mesh.renderOrder = l === to ? 2 : l === from ? 1 : 0));
      to.timer = 0;
      to.u.uOpacity.value = 0;
      enter(to);
      gsap.delayedCall(Math.max(cfg.fade, cfg.warp, cfg.pull), () => { if (layers[index] === to) { from.u.uOpacity.value = 0; from.u.uFx.value = 0; } });
      el.dispatchEvent(new CustomEvent("fx:mask-distort-slides", { detail: { index } }));
    };

    // Start: wait, then the capsule grows with 1s expo.inOut, and from its 1/4 point the first panel bends and relaxes.
    const intro = () => {
      running = true;
      if (!cfg.mask) return;
      run(cfg.maskDur, curve.expoInOut, (v) => (shared.mask = v));
      enter(layers[0], { warpDelay: cfg.maskDur * cfg.maskWarpAt, pullDur: cfg.maskPull, pullEase: curve.quartOut, fadeDur: 0 });
    };
    const startCall = reduce ? null : gsap.delayedCall(cfg.wait, intro);
    if (reduce) { shared.mask = 1; layers[0].u.uOpacity.value = 1; }

    let st = null;
    if (cfg.scroll && window.ScrollTrigger) {
      const trg = document.querySelector(cfg.scroll);
      if (trg) st = ScrollTrigger.create({ trigger: trg, start: "top top", end: "bottom top", onUpdate: (s) => (shared.scroll = s.progress) });
    }

    const visible = () => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && +getComputedStyle(el).opacity > 0.01; };
    const tick = (time) => {
      const dt = last ? Math.max(0, time - last) : 0;
      last = time;
      if (running && !reduce) {
        // While dwelling (including the transition overlap) it slowly approaches — counted separately per panel
        const zoomSpan = cfg.show + cfg.fade;
        for (const l of layers) if (l.u.uOpacity.value > 0) l.timer = Math.min(1, l.timer + dt / zoomSpan);
        shownFor += dt;
        if (shownFor >= cfg.show) { shownFor = 0; next(); }
      }
      if (!visible() && !tweens.size) return;
      for (const l of layers) {
        l.u.uScroll.value = shared.scroll;
        l.u.uMask.value = shared.mask;
        l.u.uTimer.value = reduce ? 0 : l.timer;
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(size);
    ro.observe(el);

    return () => {
      gsap.ticker.remove(tick);
      startCall?.kill();
      tweens.forEach((t) => t.kill());
      st?.kill();
      ro.disconnect();
      layers.forEach((l) => { l.tex.dispose(); l.mat.dispose(); });
      geo.dispose();
      renderer.dispose();
      canvas.remove();
      el.classList.remove("fx-gl-on");
    };
  });
})();
