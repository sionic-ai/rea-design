(() => {
  // Draws a grid across the screen center with a shader. The ripple is a concentric push spreading from the center plus a slight twist, and its strength rises and falls with sin(πt)
  const VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;
  const FRAG = `
    precision highp float;
    uniform vec2 uSize;
    uniform float uCell;
    uniform float uLine;
    uniform float uAlpha;
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uAmp;
    uniform float uFreq;
    uniform float uSpeed;
    uniform float uRadius;
    uniform float uStrength;
    uniform vec2 uEnvFreq;
    uniform vec2 uEnvSpeed;
    uniform float uEnvBase;
    uniform float uEnvRange;
    varying vec2 vUv;

    vec2 ripple(vec2 p) {
      float r = length(p);
      if (uAmp < 0.0001 || r < 0.0001) return p;
      float reach = smoothstep(0.0, uRadius * 0.15, r) * (1.0 - smoothstep(0.0, uRadius, r));
      float wobble = (0.5 + 0.5 * sin(p.x * uEnvFreq.x + uTime * uEnvSpeed.x + 0.8)) * (0.5 + 0.5 * cos(p.y * uEnvFreq.y + uTime * uEnvSpeed.y + 1.4));
      reach *= uEnvBase + uEnvRange * wobble;
      float phase = uTime * uSpeed;
      float ang = atan(p.y, p.x);
      float push = sin(r * uFreq - phase) * reach * uAmp * uStrength;
      float twist = 0.08 * sin(r * uFreq * 1.15 + ang * 3.0 - phase * 0.78) * reach * uAmp;
      return vec2(cos(ang + twist), sin(ang + twist)) * (r + push);
    }

    void main() {
      vec2 p = ripple((vUv - 0.5) * uSize);
      vec2 d = abs(mod(p + uCell * 0.5, uCell) - uCell * 0.5);
      vec2 on = 1.0 - smoothstep(uLine * 0.5 - 0.5, uLine * 0.5 + 0.5, d);
      gl_FragColor = vec4(uColor, max(on.x, on.y) * uAlpha);
    }
  `;
  const STORE = "fx-grid-ripple-bg:";
  const quartOut = (t) => 1 - (1 - t) ** 4;

  // Paint on a 1-cell canvas so computed values that aren’t rgb(), like color-mix or oklab, can still be read
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (css) => {
    // If a variable’s value is an expression like color-mix, paint it onto an element and read the color the browser computed
    const s = document.createElement("span");
    s.style.color = css;
    document.body.append(s);
    css = getComputedStyle(s).color;
    s.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "transparent";
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };

  kfFx.register("grid-ripple-bg", (el, { options: o, reduce }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const num = (k, d) => +(o[k] ?? d);
    const cfg = {
      cols: +o.cols || 8, colsNarrow: +o["cols-narrow"] || 4, narrow: +o.narrow || 1024,
      edge: num("edge", 16 / 1440), edgeNarrow: num("edge-narrow", 8 / 400),
      line: num("line", 0.6), alpha: num("alpha", 0.1), boost: num("boost", 0.2),
      amp: num("amp", 0.1), dur: num("dur", 0.8), intro: num("intro", 1), zoomDur: num("zoom-dur", 2),
      freq: num("freq", 0.01), speed: num("speed", 8), radius: num("radius", 2100), strength: num("strength", 100),
      envFreq: num("env-freq", 0.001), envSpeed: num("env-speed", 0.01), envBase: num("env-base", 1), envRange: num("env-range", 1),
      letters: o.letters === "none" ? "" : o.letters || "LOGOTYPEGRIDLINES", step: +o.step || 1,
      front: o.front || "", zoom: +o.zoom || 1, remember: o.remember || "",
    };

    const state = { cell: 0, amp: 0, boost: 0, zoom: cfg.zoom, dirty: true };
    const cellFor = (zoom) => {
      const W = el.clientWidth || innerWidth;
      const narrow = innerWidth < cfg.narrow;
      const edge = (narrow ? cfg.edgeNarrow : cfg.edge) * W;
      return Math.max(1, W - edge * 2) / ((narrow ? cfg.colsNarrow : cfg.cols) / zoom);
    };

    const layer = (host) => {
      const canvas = document.createElement("canvas");
      host.append(canvas);
      const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, depth: false, premultipliedAlpha: true });
      renderer.setClearColor(0x000000, 0);
      const uniforms = {
        uSize: { value: new T.Vector2(1, 1) }, uCell: { value: 100 }, uLine: { value: cfg.line }, uAlpha: { value: cfg.alpha },
        uColor: { value: new T.Color(0, 0, 0) }, uTime: { value: 0 }, uAmp: { value: 0 },
        uFreq: { value: cfg.freq }, uSpeed: { value: cfg.speed }, uRadius: { value: cfg.radius }, uStrength: { value: cfg.strength },
        uEnvFreq: { value: new T.Vector2(cfg.envFreq, cfg.envFreq) }, uEnvSpeed: { value: new T.Vector2(cfg.envSpeed, cfg.envSpeed) },
        uEnvBase: { value: cfg.envBase }, uEnvRange: { value: cfg.envRange },
      };
      const mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false, depthWrite: false });
      const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
      mesh.frustumCulled = false;
      const scene = new T.Scene();
      scene.add(mesh);
      return { host, canvas, renderer, uniforms, mat, mesh, scene, camera: new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), color: "" };
    };

    const letterBox = (host) => {
      if (!cfg.letters) return null;
      const box = document.createElement("div");
      box.className = "fx-grid-ripple-letters";
      box.setAttribute("aria-hidden", "true");
      host.append(box);
      return box;
    };

    const back = layer(el);
    const boxes = [letterBox(el)];
    let front = null;
    let frontWrap = null;
    if (cfg.front) {
      frontWrap = document.createElement("div");
      frontWrap.className = "fx-grid-ripple-front";
      frontWrap.setAttribute("aria-hidden", "true");
      frontWrap.style.visibility = "hidden";
      frontWrap.style.zIndex = o["front-z"] || 2;
      document.body.append(frontWrap);
      front = layer(frontWrap);
      boxes.push(letterBox(frontWrap));
    }
    const layers = front ? [back, front] : [back];

    // Tiny letters at every grid intersection — every 1 second each cell flips one letter, at a different spot per cell
    let grid = { cols: 0, rows: 0 };
    const buildLetters = () => {
      if (!cfg.letters) return;
      const cell = cellFor(1);
      const cols = Math.ceil((el.clientWidth || innerWidth) / cell) + 2;
      const rows = Math.ceil((el.clientHeight || innerHeight) / cell) + 2;
      if (cols === grid.cols && rows === grid.rows) return;
      grid = { cols, rows };
      for (const box of boxes) {
        if (!box) continue;
        box.textContent = "";
        for (let i = 0; i < cols * rows; i++) {
          const s = document.createElement("span");
          s.style.setProperty("--c", (i % cols) - Math.floor(cols / 2));
          s.style.setProperty("--r", Math.floor(i / cols) - Math.floor(rows / 2));
          box.append(s);
        }
      }
      cycleLetters();
    };
    let stepN = 0;
    const cycleLetters = () => {
      const L = cfg.letters.length;
      if (!L) return;
      for (const box of boxes) {
        if (!box) continue;
        [...box.children].forEach((s, i) => {
          const c = i % grid.cols, r = (i / grid.cols) | 0;
          s.textContent = cfg.letters[(stepN + c * 7 + r * 13) % L];
        });
      }
    };
    const letterTimer = cfg.letters && !reduce ? setInterval(() => { stepN++; cycleLetters(); }, cfg.step * 1000) : 0;

    const size = () => {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      for (const l of layers) {
        l.renderer.setPixelRatio(dpr);
        l.renderer.setSize(W, H, false);
        l.uniforms.uSize.value.set(W, H);
      }
      if (!zoomTween) state.cell = cellFor(state.zoom);
      buildLetters();
      state.dirty = true;
    };

    const render = () => {
      const t = performance.now() / 1000;
      el.style.setProperty("--fx-cell", `${state.cell}px`);
      frontWrap?.style.setProperty("--fx-cell", `${state.cell}px`);
      for (const l of layers) {
        const u = l.uniforms;
        u.uTime.value = t;
        u.uCell.value = state.cell;
        u.uAmp.value = state.amp;
        u.uAlpha.value = cfg.alpha + (cfg.boost - cfg.alpha) * state.boost;
        l.renderer.render(l.scene, l.camera);
      }
      state.dirty = false;
    };

    // The front layer shows only as much as the target’s shape (the clip-path polygon if any, otherwise its box)
    const fronts = cfg.front ? () => [...document.querySelectorAll(cfg.front)] : () => [];
    const clipFront = () => {
      if (!frontWrap) return;
      const vw = innerWidth, vh = innerHeight;
      const target = fronts().find((n) => { const r = n.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.width > 0 && +getComputedStyle(n).opacity > 0.01; });
      if (!target) { frontWrap.style.visibility = "hidden"; return; }
      const r = target.getBoundingClientRect();
      const cp = getComputedStyle(target).clipPath;
      let clip = `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px)`;
      if (cp.startsWith("polygon(")) {
        const pts = cp.slice(8, -1).split(",").map((pair) => pair.trim().split(/\s+/).map(parseFloat));
        if (pts.every((p) => p.length === 2 && p.every(Number.isFinite))) clip = `polygon(${pts.map(([x, y]) => `${(x + r.left).toFixed(1)}px ${(y + r.top).toFixed(1)}px`).join(",")})`;
      }
      frontWrap.style.clipPath = clip;
      frontWrap.style.visibility = "visible";
    };

    let pulseTween = null, zoomTween = null;
    const pulse = (dur = cfg.dur, amp = cfg.amp) => {
      if (reduce || !(dur > 0)) return;
      pulseTween?.kill();
      const p = { t: 0 };
      boxes.forEach((b) => b?.classList.add("is-hidden"));
      pulseTween = gsap.to(p, {
        t: 1, duration: dur, ease: "none",
        onUpdate: () => { state.amp = Math.sin(p.t * Math.PI) * amp; state.boost = amp > 1e-6 ? Math.min(1, Math.abs(state.amp) / amp) : 0; },
        onComplete: () => { state.amp = 0; state.boost = 0; state.dirty = true; pulseTween = null; boxes.forEach((b) => b?.classList.remove("is-hidden")); },
      });
    };
    const zoomTo = (level, dur = cfg.zoomDur) => {
      state.zoom = level;
      if (cfg.remember) try { sessionStorage.setItem(STORE + cfg.remember, String(level)); } catch {}
      zoomTween?.kill();
      const from = state.cell, to = cellFor(level);
      if (reduce || !(dur > 0)) { state.cell = to; state.dirty = true; zoomTween = null; return; }
      const p = { t: 0 };
      zoomTween = gsap.to(p, { t: 1, duration: dur, ease: quartOut, onUpdate: () => (state.cell = from + (to - from) * p.t), onComplete: () => { state.cell = to; zoomTween = null; } });
    };

    // Redraws also while the line color changes (transition) as the background darkens
    const syncColor = () => {
      const cs = getComputedStyle(el);
      for (const l of layers) {
        const css = (l === back ? cs.color : cs.getPropertyValue("--fx-front-color")).trim() || "currentcolor";
        if (css === l.color) continue;
        l.color = css;
        l.uniforms.uColor.value.setRGB(...rgbOf(css), T.SRGBColorSpace);
        state.dirty = true;
      }
    };
    const tick = () => {
      syncColor();
      clipFront();
      if (state.dirty || pulseTween || zoomTween) render();
    };
    const onEvent = (e) => {
      const d = e.detail || {};
      if (d.zoom != null) zoomTo(+d.zoom || 1, d.zoomDur != null ? +d.zoomDur : cfg.zoomDur);
      if (d.pulse) pulse(d.pulse === true ? cfg.dur : +d.pulse, d.amp != null ? +d.amp : cfg.amp);
    };

    // Ease from the incoming page’s zoom stage to this page’s stage over 2s
    let startZoom = cfg.zoom;
    if (cfg.remember) try { const s = +sessionStorage.getItem(STORE + cfg.remember); if (s > 0) startZoom = s; } catch {}
    state.zoom = startZoom;
    size();
    state.cell = cellFor(startZoom);
    if (startZoom !== cfg.zoom) zoomTo(cfg.zoom);
    else if (cfg.remember) try { sessionStorage.setItem(STORE + cfg.remember, String(cfg.zoom)); } catch {}
    syncColor();
    render();
    pulse(cfg.intro);

    const ro = new ResizeObserver(size);
    ro.observe(el);
    addEventListener("resize", size);
    el.addEventListener("fx:grid-ripple-bg", onEvent);
    if (el.isConnected) document.addEventListener("fx:grid-ripple-bg", onEvent);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      pulseTween?.kill();
      zoomTween?.kill();
      clearInterval(letterTimer);
      ro.disconnect();
      removeEventListener("resize", size);
      el.removeEventListener("fx:grid-ripple-bg", onEvent);
      document.removeEventListener("fx:grid-ripple-bg", onEvent);
      for (const l of layers) { l.mesh.geometry.dispose(); l.mat.dispose(); l.renderer.dispose(); l.canvas.remove(); }
      boxes.forEach((b) => b?.remove());
      frontWrap?.remove();
      el.style.removeProperty("--fx-cell");
    };
  });
})();
