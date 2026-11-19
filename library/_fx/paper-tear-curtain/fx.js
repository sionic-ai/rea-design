(() => {
  // Torn paper curtain — the leading edge of the panel covering the screen is jagged like torn paper, with a paper-grain strip attached in front that follows along.
  // The middle bows ahead (bow) by the sin of progress p (0→1), tearing and ripples grow, then straighten out once everything is covered. Menu open and page turn use the same curtain.
  const VERT = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const FRAG = `
    precision highp float;
    uniform float uP;
    uniform float uAspect;
    uniform float uHorizontal;
    uniform float uInvert;
    uniform float uBow;
    uniform float uRipFreq;
    uniform float uRipAmp;
    uniform float uWaveFreq;
    uniform float uWaveAmp;
    uniform float uBand;
    uniform float uSeed;
    uniform float uPlaceholder;
    uniform vec3 uCover;
    uniform vec3 uPaper;
    uniform vec3 uBg;
    uniform float uBgA;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    // Grid tilt noise — value noise flattens contours into steps so no torn texture appears
    vec2 grad(vec2 i) {
      float a = hash(i) * 6.2831853;
      return vec2(cos(a), sin(a));
    }
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
      float a = dot(grad(i), f);
      float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
      float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
      float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 1.25;
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.02 + vec2(11.3, 7.1);
        a *= 0.62;
      }
      return v;
    }

    void main() {
      vec2 uv = uInvert > 0.5 ? 1.0 - vUv : vUv;
      float along = uHorizontal > 0.5 ? 1.0 - uv.x : uv.y;
      float across = uHorizontal > 0.5 ? uv.y : uv.x;
      float span = uHorizontal > 0.5 ? 1.0 : uAspect;
      float amp = sin(uP * 3.14159265);

      // Bend is hooked to the travel-direction position so the middle stretch passes quickly, while tear and wave are 2D noise so the edges look ragged like islands
      vec2 q = vec2(across * span, along);
      float bow = amp * uBow * sin(along * 3.14159265);
      float wave = amp * uWaveAmp * vnoise((q - 0.5) * uWaveFreq + uSeed);
      float tear1 = amp * uRipAmp * fbm(q * uRipFreq + uSeed);
      float tear2 = amp * uRipAmp * fbm((q + 1.0) * uRipFreq + uSeed);
      float half_ = 0.5 * uBand * amp;

      float coverEdge = 1.0 - (uP + bow - tear1 - wave - half_);
      float paperEdge = 1.0 - (uP + bow - tear2 - wave + half_);

      vec4 col = vec4(uBg, uBgA);
      if (along > coverEdge) {
        col = vec4(uCover, 1.0);
        if (uPlaceholder > 0.5) {
          vec2 q = vec2(uv.x * uAspect, uv.y);
          float d1 = abs(uv.y - uv.x) * min(uAspect, 1.0);
          float d2 = abs(uv.y - (1.0 - uv.x)) * min(uAspect, 1.0);
          float line = 1.0 - smoothstep(0.0, 0.0016, min(d1, d2));
          col.rgb = mix(col.rgb, mix(col.rgb, uPaper, 0.5), line);
          col.rgb *= 0.97 + 0.03 * vnoise(q * 3.0);
        }
      } else if (along > paperEdge) {
        // The torn paper inside is brighter than the outside and shows grain — lift the skin’s paper color 35% toward white and lay fiber grain over it
        vec2 g = vec2(uv.x * uAspect, uv.y);
        float grain = fbm(g * 90.0) * 0.5 + fbm(g * vec2(14.0, 140.0)) * 0.35;
        col = vec4(mix(uPaper, vec3(1.0), 0.35) * (0.93 + 0.09 * grain), 1.0);
      }
      gl_FragColor = col;
    }
  `;

  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  // Skin variables may be color-mix or oklch, so paint the computed color on a 1px canvas and read it.
  // Re-reading on every press forces a style recalculation and delays the curtain start, so the value is read once per panel and stored
  const seen = new WeakMap();
  const rgbOf = (host, value, fallback) => {
    if (!value) return fallback;
    let memo = seen.get(host);
    if (!memo) seen.set(host, (memo = new Map()));
    if (!memo.has(value)) memo.set(value, readRgb(host, value));
    return memo.get(value);
  };
  const readRgb = (host, value) => {
    const v = value.startsWith("--") ? `var(${value})` : value;
    const prev = host.style.color;
    host.style.color = v;
    const css = getComputedStyle(host).color;
    host.style.color = prev;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("paper-tear-curtain", (el, { options, reduce }) => {
    if (!window.OGL || !window.gsap) return;
    const o = {
      dur: +(options.dur ?? 2),
      ease: kfFx.ease(options.ease || "power3.inOut", "power3.inOut"),
      bow: +(options.bow ?? 0.25),
      rip: +(options.rip ?? 3.5),
      ripAmp: +(options["rip-amp"] ?? 0.05),
      wave: +(options.wave ?? 1),
      waveAmp: +(options["wave-amp"] ?? 0.1),
      band: +(options.band ?? 0.07),
      horizontal: options.horizontal === "1",
      invert: options.invert === "1",
      cover: options.cover || "--fx-curtain",
      paper: options.paper || "--fx-curtain-paper",
      bg: options.bg || "--fx-curtain-bg",
      bgAlpha: +(options["bg-alpha"] ?? 0),
      start: options.start || "",
    };
    let canvas = el.querySelector("canvas");
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); el.append(canvas); }
    let renderer;
    try {
      renderer = new OGL.Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, antialias: true, premultipliedAlpha: false });
    } catch (e) {
      return () => { if (made) canvas.remove(); };
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const u = {
      uP: { value: 0 },
      uAspect: { value: 1 },
      uHorizontal: { value: o.horizontal ? 1 : 0 },
      uInvert: { value: 0 },
      uBow: { value: o.bow },
      uRipFreq: { value: o.rip },
      uRipAmp: { value: o.ripAmp },
      uWaveFreq: { value: o.wave },
      uWaveAmp: { value: o.waveAmp },
      uBand: { value: o.band },
      uSeed: { value: Math.random() * 40 },
      uPlaceholder: { value: 0 },
      uCover: { value: [0, 0, 0] },
      uPaper: { value: [1, 1, 1] },
      uBg: { value: [0, 0, 0] },
      uBgA: { value: o.bgAlpha },
    };
    const program = new OGL.Program(gl, { vertex: VERT, fragment: FRAG, uniforms: u, transparent: true });
    const mesh = new OGL.Mesh(gl, { geometry: new OGL.Triangle(gl), program });
    const paint = (spec = {}) => {
      u.uCover.value = rgbOf(el, spec.cover || o.cover, [0.11, 0.11, 0.1]);
      u.uPaper.value = rgbOf(el, spec.paper || o.paper, [0.92, 0.9, 0.86]);
      u.uBg.value = rgbOf(el, spec.bg || o.bg, [0, 0, 0]);
      u.uBgA.value = spec.bgAlpha != null ? +spec.bgAlpha : o.bgAlpha;
      u.uInvert.value = (spec.invert ?? o.invert) ? 1 : 0;
      u.uPlaceholder.value = spec.placeholder ? 1 : 0;
      if (spec.horizontal != null) u.uHorizontal.value = spec.horizontal ? 1 : 0;
    };
    const draw = () => renderer.render({ scene: mesh });
    // Measure by layout size — if an ancestor is rotated or shrunk (loader) when attached, getBoundingClientRect returns the shrunk size, and ResizeObserver is not called again after the transform is released.
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      u.uAspect.value = w / h;
      draw();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    paint();
    size();

    let tween;
    const run = (to, spec = {}) => {
      paint(spec);
      tween?.kill();
      const dur = spec.dur != null ? +spec.dur : o.dur;
      el.dataset.fxState = to ? "in" : "out";
      if (reduce || dur === 0) {
        u.uP.value = to;
        draw();
        el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true, detail: { to } }));
        return;
      }
      tween = gsap.to(u.uP, {
        value: to,
        duration: dur,
        ease: spec.ease ? kfFx.ease(spec.ease, "power3.inOut") : o.ease,
        onUpdate: draw,
        onComplete: () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true, detail: { to } })),
      });
    };
    const onIn = (e) => run(1, e.detail || {});
    const onOut = (e) => run(0, e.detail || {});
    const onSet = (e) => { paint(e.detail || {}); u.uP.value = +(e.detail?.p ?? u.uP.value); draw(); };
    el.addEventListener("fx:in", onIn);
    el.addEventListener("fx:out", onOut);
    el.addEventListener("fx:set", onSet);
    if (o.start === "in") requestAnimationFrame(() => run(1));

    return () => {
      tween?.kill();
      ro.disconnect();
      el.removeEventListener("fx:in", onIn);
      el.removeEventListener("fx:out", onOut);
      el.removeEventListener("fx:set", onSet);
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (made) canvas.remove();
      delete el.dataset.fxState;
    };
  });
})();
