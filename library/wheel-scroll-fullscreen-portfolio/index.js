// One-screen stage — a single WebGL canvas draws the loader tiles, distortion-transition slider, horizontal film strip and work opening (ripple · wipe), while orbit view is left to stage3d.js (three.js).
// Original values: wheel 0.8 · snap 0.1s · lerp 0.1, distortion strength 0.4 · size 0.28, cover background color 40%, loader 5s, view switch 1.8s (cubic .87,0,.13,1)
(() => {
  const { gsap } = window;
  const H = window.H;
  const { EASE } = H;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const iLerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
  const D = (d) => (H.reduce ? 0 : d);
  const root = document.documentElement;

  const SCROLL = { wheel: 0.8, touch: 4, snapDelay: 0.1, lerp: 0.1 };
  const WARP = { strength: 0.4, scale: 0.28 };
  const OVERLAY = 0.4;
  const CARD = { w: 348, h: 226, gap: 12, camZ: 600 };
  const GALLERY = { ease: 0.07, wheel: 0.0252, wheelScale: 0.556, wheelEnd: 0.15, snap: 0.155, curve: 152, latency: 0.12, latencyMax: 3, latencyEase: 0.07 };
  const MORPH = { long: 2.4, zoom: 1.8 };
  const OPEN = { move: { duration: 1.7, ease: "power2.inOut" }, back: { duration: 1.35, ease: "power1.inOut" }, fade: { duration: 0.3, ease: "power1" },
    zoom: { duration: 1.95, delay: 0.2, ease: "power1.inOut" }, wipe: { duration: 1.95, delay: 0.36, ease: "power1.inOut" }, wave: { duration: 4.25, ease: "power2.out" }, lift: { duration: 0.5, ease: "power1.inOut" } };
  const INTRO = { from: 140, duration: 1.5, ease: "expo.out" };
  const LOADER = { duration: 5, count: 1.4 };
  const TILE_ORDER = [20, 19, 2, 12, 8, 18, 3, 9, 14, 13, 5, 16, 10, 1, 6, 11, 4, 17, 15, 7];
  const easeTiles = H.bezier(0.8, 0, 0.1, 1);
  const easeTilesZoom = H.bezier(0.72, 0, 0.11, 1);
  const CURSOR = { offset: 16, duration: 0.35, ease: "power3" };

  // ---------- Data ----------
  const readItem = (el) => ({
    tone: el.dataset.tone || el.closest("li")?.dataset.tone || H.cssColor("--kf-raised"),
    label: (el.matches("[data-label]") ? el : el.querySelector("[data-label]"))?.dataset.label || "",
    media: el.querySelector("img, video"),
  });
  const works = [...document.querySelectorAll("[data-works] > li")].map((li) => ({
    ...readItem(li),
    title: li.dataset.title.split("|"),
    meta: li.dataset.meta,
    zoom: Number(li.dataset.zoom) || 1,
  }));
  const tiles = [...document.querySelectorAll("[data-tiles] > li")].map(readItem);
  // Video playback (original Transition): in the slider only the current work’s video plays from the start while the rest pause and rewind, and in the film strip and orbit all of them play.
  // The list is a hidden panel so the browser defers autoplay, so we play it manually
  const videoOf = (w) => (w.media?.tagName === "VIDEO" ? w.media : null);
  const playVideo = (m) => m.paused && m.play().catch(() => {});
  const playOnly = (i) => works.forEach((w, k) => { const m = videoOf(w); if (!m) return; if (k === i) { if (m.paused) { try { m.currentTime = 0; } catch {} } playVideo(m); } else { m.pause(); try { m.currentTime = 0; } catch {} } });
  const playAll = () => works.forEach((w) => { const m = videoOf(w); m && playVideo(m); });
  playOnly(0);
  // Cover photo of the opened work (in the original, the first of the work’s photo set) — on open, the stage video is wiped to this
  const covers = works.map((w) => ({ tone: w.tone, label: `Cover Photo · ${w.label.split(" · ").slice(1, 3).join(" · ")} · Landscape 2799:2016` }));
  const COUNT = works.length;
  const mod = (n) => ((n % COUNT) + COUNT) % COUNT;

  // ---------- Placeholder photo: pool of background-color light + diagonal X + label of what the photo is ----------
  const rgb = (hex) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const shade = (c, k) => `rgb(${c.map((v) => clamp(Math.round(v * k), 0, 255)).join(",")})`;
  function paintPlaceholder({ tone, label }, w = 1600, h = 1000) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    const base = rgb(tone);
    const g = x.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.55, w * 0.8);
    g.addColorStop(0, shade(base, 1.3));
    g.addColorStop(0.55, shade(base, 0.9));
    g.addColorStop(1, shade(base, 0.42));
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    const light = (base[0] + base[1] + base[2]) / 3 > 140;
    x.strokeStyle = light ? H.cssColor("--kf-bg", 0.14) : H.cssColor("--kf-ink", 0.1);
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(w, h);
    x.moveTo(w, 0); x.lineTo(0, h);
    x.stroke();
    if (label) {
      const fs = Math.round(h * 0.017);
      x.font = `500 ${fs}px ${getComputedStyle(root).getPropertyValue("--kf-font-mono")}`;
      const words = label.split(" ");
      const lines = [""];
      words.forEach((wd) => {
        const next = (lines[lines.length - 1] + " " + wd).trim();
        // In phone portrait only the middle 30% is visible, so labels are folded narrower
        if (x.measureText(next).width > w * 0.26 && lines[lines.length - 1]) lines.push(wd);
        else lines[lines.length - 1] = next;
      });
      const lh = fs * 1.35;
      const bw = Math.max(...lines.map((l) => x.measureText(l).width)) + fs * 1.4;
      const bh = lines.length * lh + fs * 0.9;
      const by = h * 0.74;
      x.fillStyle = light ? H.cssColor("--kf-ink", 0.55) : H.cssColor("--kf-bg", 0.55);
      x.fillRect(w / 2 - bw / 2, by - bh / 2, bw, bh);
      x.fillStyle = light ? H.cssColor("--kf-bg", 0.75) : H.cssColor("--kf-ink", 0.78);
      x.textAlign = "center";
      x.textBaseline = "middle";
      lines.forEach((l, i) => x.fillText(l, w / 2, by - ((lines.length - 1) * lh) / 2 + i * lh));
    }
    return c;
  }

  // ---------- WebGL ----------
  const canvas = document.querySelector("[data-gl]");
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false, premultipliedAlpha: false });
  if (!gl) {
    root.classList.add("no-gl");
    return;
  }

  const SLIDE_VS = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  // Push and pull between two photos with a displacement map — it bulges most (scale) and twists (strength) at the middle (0.5)
  const SLIDE_FS = `precision highp float;
    uniform sampler2D uA; uniform sampler2D uB; uniform sampler2D uDisp;
    uniform vec2 uRes; uniform vec2 uSizeA; uniform vec2 uSizeB;
    uniform float uZoomA; uniform float uZoomB; uniform float uP; uniform float uStrength; uniform float uScale; uniform float uOverlay; uniform float uExtra; uniform vec3 uBg;
    varying vec2 vUv;
    vec2 cover(vec2 uv, vec2 box, vec2 tex, float z){
      float b = box.x / box.y; float t = tex.x / tex.y;
      vec2 s = b < t ? vec2(b / t, 1.0) : vec2(1.0, t / b);
      return (uv - 0.5) * s / z + 0.5;
    }
    void main(){
      vec3 c;
      if (uP < 0.001) {
        c = texture2D(uA, cover(vUv, uRes, uSizeA, uZoomA * (1.0 + uExtra))).rgb;
      } else {
        float d = texture2D(uDisp, vUv).r;
        d = mix(d, d * (sin(vUv.y * 10.0 + uP * 6.2832) * 0.5 + 0.5), 0.3);
        float k = 1.0 + uP * (1.0 - uP) * uScale;
        vec2 a = (cover(vUv, uRes, uSizeA, uZoomA) - 0.5) / k + 0.5 + uP * d * uStrength * vec2(1.0, 0.5);
        vec2 b = (cover(vUv, uRes, uSizeB, uZoomB) - 0.5) * k + 0.5 - (1.0 - uP) * d * uStrength * vec2(1.0, 0.5);
        c = mix(texture2D(uA, fract(a)).rgb, texture2D(uB, fract(b)).rgb, smoothstep(0.0, 1.0, uP));
      }
      gl_FragColor = vec4(mix(c, uBg, uOverlay), 1.0);
    }`;
  // Finely subdivided board — the film strip bends in z by x position (uCurve), and orbit cards wrap around a cylinder (uArc)
  const CARD_VS = `attribute vec2 aPos;
    uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
    uniform vec2 uSize; uniform float uArc; uniform float uCurve; uniform float uFlat; uniform float uLift; uniform float uWave;
    varying vec2 vUv; varying vec2 vScreen;
    float j(float t){ float p = 2.0 * t * t; return t < 0.5 ? p : -p + 4.0 * t - 1.0; }
    void main(){
      vUv = vec2(aPos.x, 1.0 - aPos.y);
      vec3 p = vec3((aPos.x - 0.5) * uSize.x, (0.5 - aPos.y) * uSize.y, 0.0);
      if (uArc > 0.0) { float a = p.x / uArc; p.x = sin(a) * uArc; p.z = (cos(a) - 1.0) * uArc; }
      // Work-opening wave: a diagonal crest passes from the right edge to the left, lifting each line up toward the screen by up to 210px
      if (uLift > 0.0) { float d = (1.0 - aPos.x) + aPos.y * 0.35 - uWave + 0.4; p.z += 210.0 * uLift * exp(-d * d * 6.0); }
      vec4 w = uModel * vec4(p, 1.0);
      vScreen = w.xy;
      if (uFlat > 0.0) w.z += j(clamp(abs((abs(w.x) - uFlat) / uFlat), 0.0, 1.0)) * uCurve;
      gl_Position = uProj * uView * w;
    }`;
  const CARD_FS = `precision highp float;
    uniform sampler2D uTex; uniform vec2 uSize; uniform vec2 uTexSize; uniform float uZoom; uniform float uOverlay; uniform float uAlpha; uniform vec3 uBg;
    uniform sampler2D uNext; uniform vec2 uNextSize; uniform float uWipe; uniform float uNextZoom;
    uniform vec2 uMouse; uniform vec2 uScreen; uniform float uHover; uniform float uClock;
    varying vec2 vUv; varying vec2 vScreen;
    vec2 fit(vec2 uv, vec2 tex) { float b = uSize.x / uSize.y; float t = tex.x / tex.y; return (uv - 0.5) * (b < t ? vec2(b / t, 1.0) : vec2(1.0, t / b)) + 0.5; }
    float hs(vec2 p) { return fract(sin(dot(p, vec2(41.31, 289.17))) * 15731.743); }
    float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hs(i), hs(i + vec2(1.0, 0.0)), f.x), mix(hs(i + vec2(0.0, 1.0)), hs(i + vec2(1.0, 1.0)), f.x), f.y); }
    float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * vn(p); p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03 + 3.1; a *= 0.5; } return v; }
    void main(){
      vec2 uv = (fit(vUv, uTexSize) - 0.5) / uZoom + 0.5;
      if (!gl_FrontFacing) uv.x = 1.0 - uv.x;
      vec4 c = texture2D(uTex, uv);
      vec3 col = c.rgb;
      // Film-strip cursor smudge: if the distance, measured as a ratio of screen width and height, is within the smudge radius, only inside a noise threshold that grows with distance does the image shake with grain and brighten by .09
      if (uHover > 0.0) {
        float d = length((vScreen - uMouse) / uScreen), r = 0.4346 * uHover;
        if (d < r) {
          vec2 q = uv * 20.0;
          float k = fbm(q + fbm(q + vec2(1.7, 9.2) + uClock * 0.278)) * (4.0 * d / r);
          if (k * k * k + 0.6 * k * k + 0.5 * k < 0.5) col = texture2D(uTex, uv + (vn(uv * 20.0 - uClock * 0.667) - 0.5) / 70.0).rgb + 0.09;
        }
      }
      col = mix(col, uBg, uOverlay);
      // Work-open wipe: a cover photo covers diagonally from bottom right to top left, and the cover approaches from .8x to 1x
      if (uWipe > 0.0) {
        float edge = uWipe * 1.45 - ((1.0 - vUv.x) * 0.7 + vUv.y * 0.3);
        vec2 nv = (fit(vUv, uNextSize) - 0.5) * (0.8 + 0.2 * uNextZoom) + 0.5;
        col = mix(col, texture2D(uNext, nv).rgb, smoothstep(0.0, 0.25, edge));
      }
      gl_FragColor = vec4(col, c.a * uAlpha);
    }`;

  function program(vs, fs) {
    const make = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    const u = {};
    for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
      const { name } = gl.getActiveUniform(p, i);
      u[name] = gl.getUniformLocation(p, name);
    }
    return { p, u, aPos: gl.getAttribLocation(p, "aPos") };
  }
  const slideProg = program(SLIDE_VS, SLIDE_FS);
  const cardProg = program(CARD_VS, CARD_FS);
  // Cover color is the clothing’s base color
  const BG = (() => { const h = H.cssColor("--kf-bg"); return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); })();
  [slideProg, cardProg].forEach((pr) => { gl.useProgram(pr.p); gl.uniform3f(pr.u.uBg, ...BG); });

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

  function grid(n) {
    const v = [];
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const a = [i / n, j / n], b = [(i + 1) / n, j / n], c = [i / n, (j + 1) / n], d = [(i + 1) / n, (j + 1) / n];
        v.push(...a, ...b, ...c, ...c, ...b, ...d);
      }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    return { buf, count: v.length / 2 };
  }
  const mesh = grid(24);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // The panel’s triangles wind clockwise on screen, so the front face is CW — only cards behind the orbit are flipped left-right to read correctly
  gl.frontFace(gl.CW);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(11 / 255, 11 / 255, 11 / 255, 1);

  function texture(source) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return t;
  }
  function upload(item) {
    const m = item.media;
    let ready = m && (m.tagName === "VIDEO" ? m.readyState >= 2 : m.complete && m.naturalWidth);
    let src = ready ? m : paintPlaceholder(item);
    // Opened via file:// the video and image are cross-origin so WebGL can’t read them — in that case it stays as a placeholder image (served over http the video plays)
    try { item.tex = texture(src); } catch { ready = false; src = paintPlaceholder(item); item.tex = texture(src); }
    item.source = src;
    item.w = ready ? m.videoWidth || m.naturalWidth : src.width;
    item.h = ready ? m.videoHeight || m.naturalHeight : src.height;
    item.isVideo = ready && m.tagName === "VIDEO";
    if (m && !ready) m.addEventListener(m.tagName === "VIDEO" ? "loadeddata" : "load", () => upload(item), { once: true });
  }
  // Displacement pattern: a few layers of smooth value noise
  function dispTexture() {
    const n = 256, c = document.createElement("canvas");
    c.width = c.height = n;
    const x = c.getContext("2d");
    const img = x.createImageData(n, n);
    const r = (i, j) => {
      const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const noise = (u, v) => {
      const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
      const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
      return lerp(lerp(r(i, j), r(i + 1, j), su), lerp(r(i, j + 1), r(i + 1, j + 1), su), sv);
    };
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        let v = 0, a = 0.5, f = 4;
        for (let o = 0; o < 4; o++, a *= 0.5, f *= 2) v += a * noise((i / n) * f, (j / n) * f);
        const k = (j * n + i) * 4;
        img.data[k] = img.data[k + 1] = img.data[k + 2] = v * 255;
        img.data[k + 3] = 255;
      }
    x.putImageData(img, 0, 0);
    return texture(c);
  }

  // ---------- Matrix ----------
  const M = {
    persp(fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
    },
    look(e, t, up = [0, 1, 0]) {
      let z = [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
      const zl = Math.hypot(...z);
      z = z.map((v) => v / zl);
      let x = [up[1] * z[2] - up[2] * z[1], up[2] * z[0] - up[0] * z[2], up[0] * z[1] - up[1] * z[0]];
      const xl = Math.hypot(...x);
      x = x.map((v) => v / xl);
      const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
    },
    model(tx, ty, tz, ry = 0, s = 1) {
      const c = Math.cos(ry) * s, n = Math.sin(ry) * s;
      return new Float32Array([c, 0, -n, 0, 0, s, 0, 0, n, 0, c, 0, tx, ty, tz, 1]);
    },
  };

  // ---------- Size ----------
  let W = innerWidth, Hh = innerHeight, dpr = 1;
  function resize() {
    W = innerWidth;
    Hh = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(Hh * dpr);
    if (tilesReady) loaderLayout();
  }

  // Perspective camera using screen px as is (z=0 panel is 1:1 with the screen) — for the film strip, loader and opening a work
  function pxCamera() {
    const fov = 2 * Math.atan(Hh / 2 / CARD.camZ);
    return { proj: M.persp(fov, W / Hh, 1, 6000), view: M.look([0, 0, CARD.camZ], [0, 0, 0]) };
  }
  function useCard(cam) {
    gl.useProgram(cardProg.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
    gl.enableVertexAttribArray(cardProg.aPos);
    gl.vertexAttribPointer(cardProg.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(cardProg.u.uProj, false, cam.proj);
    gl.uniformMatrix4fv(cardProg.u.uView, false, cam.view);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(cardProg.u.uTex, 0);
    gl.uniform2f(cardProg.u.uMouse, hover.x - W / 2, Hh / 2 - hover.y);
    gl.uniform2f(cardProg.u.uScreen, W, Hh);
    gl.uniform1f(cardProg.u.uClock, performance.now() / 1000);
  }
  function drawCard(item, model, w, h, o = {}) {
    gl.bindTexture(gl.TEXTURE_2D, item.tex);
    gl.uniformMatrix4fv(cardProg.u.uModel, false, model);
    gl.uniform2f(cardProg.u.uSize, w, h);
    gl.uniform2f(cardProg.u.uTexSize, item.w, item.h);
    gl.uniform1f(cardProg.u.uZoom, o.zoom || 1);
    gl.uniform1f(cardProg.u.uOverlay, o.overlay || 0);
    gl.uniform1f(cardProg.u.uAlpha, o.alpha ?? 1);
    gl.uniform1f(cardProg.u.uArc, o.arc || 0);
    gl.uniform1f(cardProg.u.uCurve, o.curve || 0);
    gl.uniform1f(cardProg.u.uFlat, o.flat || 0);
    gl.uniform1f(cardProg.u.uLift, o.lift || 0);
    gl.uniform1f(cardProg.u.uWave, o.wave || 0);
    gl.uniform1f(cardProg.u.uWipe, o.wipe || 0);
    gl.uniform1f(cardProg.u.uHover, o.hover || 0);
    if (o.next) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, o.next.tex);
      gl.uniform1i(cardProg.u.uNext, 1);
      gl.uniform2f(cardProg.u.uNextSize, o.next.w, o.next.h);
      gl.uniform1f(cardProg.u.uNextZoom, o.nextZoom || 0);
      gl.activeTexture(gl.TEXTURE0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }
  // Drawn as a screen rectangle based on the top left
  const drawRect = (item, x, y, w, h, o) => drawCard(item, M.model(x + w / 2 - W / 2, Hh / 2 - (y + h / 2), 0), w, h, o);

  // ---------- State ----------
  const state = { mode: "slider", g: 0, orbitIn: 0, extra: 0, busy: true, open: null, started: false };
  const slider = { target: 0, current: 0, timer: 0, touchY: null };
  const gal = { target: 0, current: 0, prev: 0, latency: 0, timer: 0, touchX: null, snap: null };
  const orbit = { logoTurn: -Math.PI };
  const black = { w: 1, h: 1 };
  // Film strip cursor smudge (original hover): the smudge center follows the mouse at .07, and each card’s smudge intensity follows 1 on hover and 0 on leave at .05 (60fps frame-count decay).
  // Off on phones (touch layout) and with reduced motion
  const HOVER = { mouse: 0.07, area: 0.05, on: !H.reduce };
  const hover = { pointer: null, x: -1e4, y: -1e4, areas: new Map() };

  // ---------- Title · category text ----------
  const textsRoot = document.querySelector("[data-texts]");
  function line(cls) {
    const outer = document.createElement("span");
    outer.className = `line ${cls}`;
    const mid = document.createElement("span");
    mid.className = "line-mid";
    outer.appendChild(mid);
    return { outer, mid };
  }
  const texts = works.map((w) => {
    const t = { titleMids: [], lineMids: [], chars: [], lines: [], lastU: null };
    const two = w.title.length > 1;
    const title = document.createElement("h2");
    title.className = "slide-title";
    title.style.setProperty("--y", two ? -85 : -40.2);
    w.title.forEach((value) => {
      const { outer, mid } = line("title-line");
      [...value].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = ch === " " ? " " : ch;
        mid.appendChild(s);
        t.chars.push(s);
      });
      title.appendChild(outer);
      t.titleMids.push(mid);
    });
    const meta = document.createElement("p");
    meta.className = "slide-meta";
    meta.style.setProperty("--y", two ? 133 : 88.2);
    const { outer, mid } = line("");
    const inner = document.createElement("span");
    inner.className = "line-inner";
    inner.textContent = w.meta;
    mid.appendChild(inner);
    meta.appendChild(outer);
    t.lines.push(inner);
    t.lineMids.push(mid);
    textsRoot.append(title, meta);
    return t;
  });
  // Pushes text by wheel position: when half a cell away from the current work, the title goes out past ±110% and the category past ±200%
  function scrubTexts(position) {
    texts.forEach((t, i) => {
      let u = (((position - i) % COUNT) + COUNT) % COUNT;
      if (u >= COUNT / 2) u -= COUNT;
      const hidden = Math.abs(u) >= 0.5;
      if (hidden && t.lastU !== null && Math.abs(t.lastU) >= 0.5 && Math.sign(u) === Math.sign(t.lastU)) return;
      t.lastU = u;
      const ly = clamp(-u * 200, -200, 200);
      t.lines.forEach((el) => (el.style.transform = `translate3d(0,${ly}%,0)`));
      const ty = u >= 0 ? -110 * clamp(u / 0.5, 0, 1) : 110 * (1 - clamp((u + 0.5) / 0.5, 0, 1));
      t.chars.forEach((el) => (el.style.transform = `translate3d(0,${ty}%,0)`));
    });
  }
  // On view switch or opening a work, hide only the current work’s line — other works’ text is already pushed out, so pushing lines too would cancel out and show through
  const mids = (t) => [...t.lineMids, ...t.titleMids];
  const currentText = () => texts[mod(Math.round(slider.current))];
  let hiddenText = null;
  function hideTexts() {
    const t = (hiddenText = currentText());
    // Like the original, after hiding everything, make the current work’s title · meta plate fully transparent and return the lines to place
    const blocks = [...new Set(mids(t).map((m) => m.closest("[data-texts] > *")))];
    gsap.to(mids(t), { yPercent: -110, duration: D(0.7), ease: EASE.hide, overwrite: true, onComplete: () => { gsap.set(blocks, { autoAlpha: 0 }); gsap.set(mids(t), { yPercent: 0 }); } });
  }
  function showTexts(delay = 0.8) {
    if (hiddenText) gsap.set(mids(hiddenText), { yPercent: 0 });
    gsap.set([...textsRoot.children], { autoAlpha: 1 });
    const t = (hiddenText = currentText());
    gsap.fromTo(t.lineMids, { yPercent: 110 }, { yPercent: 0, duration: D(1.4), ease: EASE.show, stagger: 0.05, delay: D(delay), overwrite: true });
    gsap.fromTo(t.titleMids, { yPercent: 110 }, { yPercent: 0, duration: D(1.4), ease: EASE.show, stagger: 0.04, delay: D(delay), overwrite: true });
  }

  // ---------- Bottom center: progress squares (slider) · ruler (film strip) ----------
  const stepperEl = document.querySelector("[data-stepper]");
  const stepper = (() => {
    const SQ = 12, LINE = 1, GAP = 4;
    const pad = (n) => String(n).padStart(3, "0");
    const cur = stepperEl.querySelector("[data-stepper-current]");
    stepperEl.querySelector("[data-stepper-count]").textContent = pad(COUNT);
    const box = stepperEl.querySelector("[data-stepper-steps]");
    const lines = works.map(() => {
      const el = document.createElement("span");
      el.className = "stepper-line";
      box.appendChild(el);
      return { el, x: 0 };
    });
    const sq = document.createElement("span");
    sq.className = "stepper-square";
    box.appendChild(sq);
    const edges = { left: 0, right: SQ };
    const xOf = (i, a) => i * (LINE + GAP) + (i > a ? SQ - LINE : 0);
    const draw = () => {
      sq.style.setProperty("--left", edges.left);
      sq.style.setProperty("--width", edges.right - edges.left);
      lines.forEach((l) => l.el.style.setProperty("--x", l.x));
    };
    let index = -1;
    // Front corner 0.6s, back corner 0.8s starting 0.08s later — the rectangle stretches and shrinks as it moves
    return (i) => {
      if (i === index) return;
      const from = index;
      index = i;
      cur.textContent = pad(i + 1);
      const left = xOf(i, i), right = left + SQ;
      if (from < 0 || H.reduce) {
        Object.assign(edges, { left, right });
        lines.forEach((l, k) => (l.x = xOf(k, i)));
        return draw();
      }
      const fwd = i > from;
      const lead = { duration: 0.6, ease: "expo.out", overwrite: "auto", onUpdate: draw };
      const trail = { duration: 0.8, ease: "expo.out", delay: 0.08, overwrite: "auto", onUpdate: draw };
      gsap.to(edges, { ...(fwd ? lead : trail), right });
      gsap.to(edges, { ...(fwd ? trail : lead), left });
      lines.forEach((l, k) => gsap.to(l, { x: xOf(k, i), duration: 0.7, ease: "expo.out", overwrite: "auto", onUpdate: draw }));
    };
  })();

  const rulerEl = document.querySelector("[data-ruler]");
  const ruler = (() => {
    const PITCH = 60, SMALL = [12, 24, 36, 48], REACH = 3;
    const track = rulerEl.querySelector("[data-ruler-track]");
    const items = new Map();
    let current = null;
    const fade = (d) => clamp(d <= 0 ? 1 + d * 0.4 : 1 - d * 0.6, 0, 1);
    const item = (i) => {
      if (items.has(i)) return items.get(i);
      const el = document.createElement("div");
      el.className = "ruler-item";
      el.innerHTML = `<span class="mono ruler-number">${String(mod(i) + 1).padStart(2, "0")}</span><span class="ruler-tick ruler-tick--work"></span>` + SMALL.map((x) => `<span class="ruler-tick" style="--x:${x}"></span>`).join("");
      track.appendChild(el);
      const it = { el, num: el.firstChild };
      items.set(i, it);
      return it;
    };
    return (pos) => {
      const base = Math.floor(pos), keep = new Set();
      for (let i = base - REACH; i <= base + REACH + 1; i++) {
        keep.add(i);
        const it = item(i);
        it.el.style.setProperty("--pos", (i - pos) * PITCH);
        it.num.style.opacity = fade(i - pos);
      }
      items.forEach((it, i) => !keep.has(i) && (it.el.remove(), items.delete(i)));
      const c = Math.round(pos);
      if (c !== current) {
        items.get(current)?.el.classList.remove("is-current");
        items.get(c).el.classList.add("is-current");
        current = c;
      }
    };
  })();

  const bottomInner = (el) => H.wrapInner(el);
  function hideBottom(el) {
    gsap.to(bottomInner(el), { yPercent: -110, duration: D(0.7), ease: EASE.hide, overwrite: true });
  }
  function showBottom(el, delay = 0.8) {
    // When opening a work, anything that went transparent and hid behind it becomes visible again
    gsap.set(el, { autoAlpha: 1 });
    gsap.fromTo(bottomInner(el), { yPercent: 110 }, { yPercent: 0, duration: D(1.4), ease: EASE.show, delay: D(delay), overwrite: true });
  }

  // ---------- Film strip labels · baseline ----------
  const galUI = document.querySelector("[data-gallery-ui]");
  const divider = galUI.querySelector("[data-divider]");
  const labelsRoot = galUI.querySelector("[data-gallery-labels]");
  const labels = new Map();
  function galleryLabel(i) {
    if (labels.has(i)) return labels.get(i);
    const w = works[mod(i)];
    const el = document.createElement("div");
    el.className = "gallery-label";
    el.innerHTML = `<span class="line"><span class="line-inner h3">${w.title.join(" ")}</span></span><span class="line"><span class="line-inner mono">${w.meta}</span></span>`;
    labelsRoot.appendChild(el);
    gsap.set(el.querySelectorAll(".line-inner"), { yPercent: 100 });
    labels.set(i, el);
    return el;
  }
  // The name tag shows only on the card with a hand on it — each line rises from below in 1s expo.out (1/15s stagger), and on leaving drops back in 1s power4.out (original values)
  let hoveredLabel = null;
  const showLabel = (i, on) => { const el = labels.get(i); el && gsap.to(el.querySelectorAll(".line-inner"), { yPercent: on ? 0 : 100, duration: D(1), ease: on ? "expo.out" : "power4.out", stagger: 1 / 15, overwrite: true }); };
  function hoverLabel(i) {
    if (i === hoveredLabel) return;
    if (hoveredLabel !== null) showLabel(hoveredLabel, false);
    hoveredLabel = i;
    if (i !== null) showLabel(i, true);
  }

  // ---------- Cursor ----------
  const cursorEl = document.querySelector("[data-cursor]");
  const cursor = (() => {
    const qx = gsap.quickTo(cursorEl, "x", { duration: CURSOR.duration, ease: CURSOR.ease });
    const qy = gsap.quickTo(cursorEl, "y", { duration: CURSOR.duration, ease: CURSOR.ease });
    const sx = gsap.quickTo(cursorEl, "scaleX", { duration: 0.4, ease: "power3" });
    const sy = gsap.quickTo(cursorEl, "scaleY", { duration: 0.4, ease: "power3" });
    gsap.set(cursorEl, { scale: 0 });
    let placed = false;
    const c = { x: W / 2, y: Hh / 2, on: false, overUi: false };
    c.scale = (v) => (sx(v), sy(v));
    addEventListener("mousemove", (e) => {
      c.x = e.clientX;
      c.y = e.clientY;
      const px = e.clientX + CURSOR.offset, py = e.clientY + CURSOR.offset;
      if (placed) qx(px), qy(py);
      else (placed = true), gsap.set(cursorEl, { x: px, y: py });
      c.overUi = Boolean(e.target.closest("[data-ui], .case"));
      c.refresh();
    });
    root.addEventListener("mouseleave", () => c.scale(0));
    c.refresh = () => {
      const want = c.on && !c.overUi && state.started && !state.open && !state.busy;
      c.scale(want ? 1 : 0);
    };
    return c;
  })();

  // ---------- Texture setup ----------
  let tilesReady = false;
  let disp;
  const cells = Array.from({ length: 25 }, (_, t) => ({ t, item: null }));
  function loaderLayout() {
    let s = (30 * W) / 1600;
    const tw = (W - 4 * s) / 4, th = (tw * Hh) / W;
    const rowStep = th + s, colStep = tw + s, half = 0.5 * rowStep;
    const far = Hh + 0.5 * (5 * th + 4 * s - Hh), travel = 12 * th;
    const fw = W + 2, fh = Hh + 2;
    s = (s * fw) / tw;
    const bigRow = fh + s, bigCol = fw + s;
    cells.forEach((cell) => {
      const raw = Math.floor(cell.t / 5), odd = raw % 2 === 1, col = raw - 2, R = Math.abs(col);
      const row = cell.t % 5, r = row - 2;
      // Odd columns flow in from above, even columns from below — outer columns from farther away
      cell.drift = odd ? -(far - half + (4 - row) * travel + R * th + 20) : far + row * travel + R * th + 20;
      cell.end = { x: 0.5 * (W - fw) + col * bigCol, y: 0.5 * (Hh - fh) + r * bigRow - (odd ? 0.5 * bigRow : 0) };
      cell.from = {
        x: 0.5 * (W - tw) + col * colStep - cell.end.x,
        y: 0.5 * (Hh - th) + r * rowStep - (odd ? half : 0) - cell.end.y,
        w: tw - fw,
        h: th - fh,
        scale: cell.t === 12 ? 0.5 : 0,
      };
      cell.full = { w: fw, h: fh };
    });
  }
  function prepare() {
    works.forEach(upload);
    covers.forEach(upload);
    tiles.forEach(upload);
    disp = dispTexture();
    const c = document.createElement("canvas");
    c.width = c.height = 2;
    const cx = c.getContext("2d");
    cx.fillStyle = H.cssColor("--kf-bg");
    cx.fillRect(0, 0, 2, 2);
    black.tex = texture(c);
    const placed = { 12: 0, 1: 1, 15: 2, 23: 3, 22: 4 };
    let k = 0;
    cells.forEach((cell) => {
      if (cell.t in placed) cell.item = works[placed[cell.t] % COUNT];
      else cell.item = tiles.length ? tiles[(TILE_ORDER[k++ % TILE_ORDER.length] - 1) % tiles.length] : works[cell.t % COUNT];
    });
    tilesReady = true;
    loaderLayout();
    buildOrbit();
  }

  // ---------- Orbit ----------
  // Orbit view is drawn by a separate three.js stage (stage3d.js) like the original — this canvas only lays a black plate behind it
  const orbitCanvas = document.querySelector("[data-orbit]");
  let orbit3d = null;
  function buildOrbit() {
    if (window.Stage3D) orbit3d = new Stage3D.Orbit(orbitCanvas, works, tiles.length ? tiles : works);
  }
  const orbitFront = () => (orbit3d ? orbit3d.front() : 0);
  function drawOrbit(alpha) {
    if (!orbit3d) return;
    orbitCanvas.style.visibility = "visible";
    orbit3d.render(alpha, orbit.logoTurn, performance.now(), state.mode === "orbit" && !state.busy && !state.open);
  }

  // ---------- Drawing ----------
  function drawSlider() {
    const pos = slider.current;
    const base = Math.floor(pos);
    const p = pos - base;
    const a = works[mod(base)], b = works[mod(base + 1)];
    gl.useProgram(slideProg.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(slideProg.aPos);
    gl.vertexAttribPointer(slideProg.aPos, 2, gl.FLOAT, false, 0, 0);
    const u = slideProg.u;
    [a.tex, b.tex, disp].forEach((t, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
    });
    gl.uniform1i(u.uA, 0);
    gl.uniform1i(u.uB, 1);
    gl.uniform1i(u.uDisp, 2);
    gl.uniform2f(u.uRes, W, Hh);
    gl.uniform2f(u.uSizeA, a.w, a.h);
    gl.uniform2f(u.uSizeB, b.w, b.h);
    gl.uniform1f(u.uZoomA, a.zoom);
    gl.uniform1f(u.uZoomB, b.zoom);
    gl.uniform1f(u.uP, p);
    gl.uniform1f(u.uStrength, WARP.strength);
    gl.uniform1f(u.uScale, WARP.scale);
    gl.uniform1f(u.uOverlay, OVERLAY);
    gl.uniform1f(u.uExtra, state.extra);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  const galleryCard = () => {
    const px = H.px();
    // Phone: one tall card (4/7.46 of screen height, 96 design px on each side) with the neighboring cards slightly visible
    if (H.isMobile()) {
      const world = 2 * Math.tan((25 * Math.PI) / 180) * 8;
      return { w: W - 96 * px, h: (Hh * 4) / world, slot: W - 96 * px + (Hh * 0.1) / world };
    }
    return { w: CARD.w * px, h: CARD.h * px, slot: (CARD.w + CARD.gap) * px };
  };
  function drawGallery() {
    const { w, h, slot } = galleryCard();
    const g = state.g;
    const pos = gal.current;
    const centre = Math.round(pos);
    useCard(pxCamera());
    const curve = GALLERY.curve * (Hh / 1080) * gal.latency;
    for (let i = Math.floor(pos) - 6; i <= Math.floor(pos) + 7; i++) {
      const d = i - pos;
      const active = i === centre;
      // During transition the center card shrinks from full screen to card size, and side cards slide in from off-screen
      const cw = active ? lerp(W, w, g) : w;
      const ch = active ? lerp(Hh, h, g) : h;
      const push = active ? 0 : Math.sign(d) * (1 - g) * (W / 2 + w);
      const x = d * slot * (active ? g : 1) + push;
      if (Math.abs(x) - cw / 2 > W / 2 + 10) continue;
      drawCard(works[mod(i)], M.model(x, 0, 0), cw, ch, { overlay: active ? OVERLAY * (1 - g) : 0, zoom: active ? lerp(works[mod(i)].zoom, 1, g) : 1, curve: curve * g, flat: 0.4 * W, hover: Math.round((hover.areas.get(i) || 0) * 100) / 100 });
    }
  }
  function drawLoader(t) {
    useCard(pxCamera());
    const e = easeTiles(iLerp(0, 0.65, t));
    const z = easeTilesZoom(iLerp(0.4, 1, t));
    cells.forEach((cell) => {
      const x = cell.end.x + cell.from.x * (1 - z);
      const y = cell.end.y + cell.from.y * (1 - z) + cell.drift * (1 - e);
      const w = cell.full.w + cell.from.w * (1 - z);
      const h = cell.full.h + cell.from.h * (1 - z);
      if (x > W || x + w < 0 || y > Hh || y + h < 0 || w <= 0 || h <= 0) return;
      const centre = cell.t === 12;
      drawRect(cell.item, x, y, w, h, { zoom: (1 + cell.from.scale * (1 - z)) * (centre ? lerp(1, cell.item.zoom, z) : 1), overlay: centre ? OVERLAY * z : 0 });
    });
  }
  function drawOpen(o) {
    useCard(pxCamera());
    const r = o.rect;
    drawRect(works[o.index], r.x, r.y, r.w, r.h, { overlay: r.overlay, zoom: r.zoom, lift: o.fx.lift, wave: o.fx.wave, wipe: o.fx.wipe, next: covers[o.index], nextZoom: o.fx.zoom });
  }

  // ---------- Input ----------
  const sliderStep = () => (Hh * COUNT) / Math.max(1, COUNT - 1);
  function snapLater(obj, fn, delay) {
    clearTimeout(obj.timer);
    obj.timer = setTimeout(fn, delay * 1000);
  }
  addEventListener("wheel", (e) => {
    e.preventDefault();
    if (state.busy || state.open || !state.started) return;
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 30;
    if (state.mode === "slider") {
      slider.target += (dy * SCROLL.wheel) / sliderStep();
      snapLater(slider, () => (slider.target = Math.round(slider.target)), SCROLL.snapDelay);
    } else if (state.mode === "gallery") {
      // Original film strip: wheel value of the larger axis × .556 × .0252 / 10 cells, pulled to the nearest cell .15s after stopping
      const wx = e.wheelDeltaX || -e.deltaX, wy = e.wheelDeltaY || -e.deltaY;
      gal.snap = null;
      gal.target -= (GALLERY.wheel * (Math.abs(wx) >= Math.abs(wy) ? wx : wy) * GALLERY.wheelScale) / 10;
      snapLater(gal, () => (gal.snap = Math.round(gal.target)), GALLERY.wheelEnd);
    } else {
      orbit3d && orbit3d.wheel(dy);
    }
  }, { passive: false });

  let touch = null;
  addEventListener("touchstart", (e) => {
    if (e.target.closest("[data-ui], .case")) return;
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, x0: e.touches[0].clientX, y0: e.touches[0].clientY };
  }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (!touch || state.busy || state.open) return;
    const x = e.touches[0].clientX, y = e.touches[0].clientY;
    if (state.mode === "slider") slider.target -= ((y - touch.y) * SCROLL.touch) / sliderStep();
    else if (state.mode === "gallery") gal.target -= (x - touch.x) / galleryCard().slot;
    else if (orbit3d) orbit3d.touch(-(y - touch.y));
    touch.x = x;
    touch.y = y;
  }, { passive: true });
  addEventListener("touchend", () => {
    if (!touch) return;
    touch = null;
    snapLater(slider, () => (slider.target = Math.round(slider.target)), SCROLL.snapDelay);
    snapLater(gal, () => (gal.snap = Math.round(gal.target)), GALLERY.wheelEnd);
  });

  addEventListener("mousemove", (e) => {
    if (HOVER.on && !H.isMobile()) hover.pointer = { x: e.clientX, y: e.clientY };
    if (state.mode === "gallery") {
      const { w, h, slot } = galleryCard();
      const i = Math.round((e.clientX - W / 2) / slot + gal.current);
      const over = !state.busy && Math.abs(e.clientY - Hh / 2) < h / 2 && Math.abs(e.clientX - (W / 2 + (i - gal.current) * slot)) < w / 2;
      hoverLabel(over ? i : null);
    }
  });

  // Pressing the stage opens the work. In the film strip only the center card opens, and side cards move into that spot
  document.addEventListener("click", (e) => {
    if (!state.started || state.busy || state.open) return;
    if (e.target.closest("[data-ui], a, button, .case")) return;
    if (state.mode === "gallery") {
      const { w, h, slot } = galleryCard();
      if (Math.abs(e.clientY - Hh / 2) > h / 2) return;
      const d = Math.round((e.clientX - W / 2) / slot + (gal.current - Math.round(gal.current)));
      if (d !== 0) {
        gal.snap = Math.round(gal.current) + d;
        return;
      }
      if (Math.abs(e.clientX - W / 2) > w / 2) return;
    }
    if (state.mode === "orbit") {
      const hit = orbit3d ? orbit3d.hoveredWork() : -1;
      if (hit < 0) return;
      return openCase(hit);
    }
    openCase();
  });

  // ---------- View switch ----------
  const switchEls = [...document.querySelectorAll("[data-view]")];
  function markSwitch(mode) {
    switchEls.forEach((el) => {
      const on = el.dataset.view === mode;
      el.classList.toggle("is-active", on);
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  }
  switchEls.forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    setView(el.dataset.view);
  }));

  function showGalleryUI(on) {
    if (on) {
      gsap.set(galUI, { visibility: "visible" });
      gsap.fromTo(divider, { scaleY: 0 }, { scaleY: 1, duration: D(1.4), ease: EASE.show, delay: D(0.6), overwrite: true });
    } else {
      hoverLabel(null);
      gsap.to(divider, { scaleY: 0, duration: D(0.7), ease: EASE.hide, overwrite: true, onComplete: () => gsap.set(galUI, { visibility: "hidden" }) });
    }
  }

  function setView(mode) {
    if (mode === state.mode || state.busy || state.open) return;
    const from = state.mode;
    state.busy = true;
    state.mode = mode;
    markSwitch(mode);
    // Original: cursor off over the film strip·orbit, and only on the orbit it floats as a pill while an interaction is over a card
    cursor.on = mode === "slider";
    cursorEl.classList.toggle("cursor--pill", mode !== "slider");
    cursor.refresh();
    const done = () => {
      state.busy = false;
      cursor.refresh();
    };

    if (from === "slider") hideTexts(), hideBottom(stepperEl);
    if (from === "gallery") hideBottom(rulerEl), showGalleryUI(false);
    if (mode !== "slider") playAll();

    if (mode === "orbit") {
      const index = from === "slider" ? mod(Math.round(slider.current)) : mod(Math.round(gal.current));
      orbit3d && orbit3d.face(index);
      gsap.fromTo(orbit, { logoTurn: -Math.PI }, { logoTurn: Math.PI / 2, duration: D(MORPH.long), ease: EASE.zoom });
      gsap.fromTo(state, { orbitIn: 0 }, { orbitIn: 1, duration: D(MORPH.long), ease: EASE.zoom, onComplete: done });
      return;
    }
    if (from === "orbit") {
      const index = orbitFront();
      if (mode === "slider") (slider.current = slider.target = index), (state.g = 0);
      else (gal.current = gal.target = index), (state.g = 1);
      gsap.to(orbit, { logoTurn: -Math.PI, duration: D(MORPH.zoom), ease: EASE.zoom });
      gsap.to(state, { orbitIn: 0, duration: D(MORPH.zoom), ease: EASE.zoom, onComplete: done });
    } else if (mode === "gallery") {
      gal.current = gal.target = gal.prev = Math.round(slider.current);
      gsap.fromTo(state, { g: 0 }, { g: 1, duration: D(MORPH.zoom), ease: EASE.zoom, onComplete: done });
    } else {
      slider.current = slider.target = Math.round(gal.current);
      gsap.fromTo(state, { g: 1 }, { g: 0, duration: D(MORPH.zoom), ease: EASE.zoom, onComplete: done });
    }
    if (mode === "slider") {
      playOnly(mod(Math.round(slider.current)));
      scrubTexts(slider.current);
      showTexts(0.8);
      showBottom(stepperEl);
    } else {
      showBottom(rulerEl);
      showGalleryUI(true);
    }
  }

  // ---------- Open work ----------
  const caseEl = document.querySelector("[data-case]");
  const casePage = caseEl.querySelector("[data-case-page]");
  const caseContent = caseEl.querySelector("[data-case-content]");
  const caseSide = caseEl.querySelector("[data-case-side]");
  const caseTitle = caseEl.querySelector("[data-case-title]");
  const caseCover = caseEl.querySelector("[data-case-cover]");
  const casePct = caseEl.querySelector("[data-case-pct]");
  const caseFill = caseEl.querySelector("[data-case-fill]");
  const caseCursor = caseEl.querySelector("[data-case-cursor]");
  const caseReveal = [...caseEl.querySelectorAll(".case-reveal")];
  const caseRules = [...caseEl.querySelectorAll(".case-rule > span")];
  const caseScroll = { target: 0, current: 0, max: 0 };
  const uiForCase = () => [document.querySelector(".view-switch"), stepperEl, rulerEl].filter((el) => getComputedStyle(el).visibility !== "hidden");

  function coverRect() {
    const r = caseCover.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  function startRect(index) {
    if (state.mode === "gallery") {
      const { w, h } = galleryCard();
      return { x: W / 2 - w / 2, y: Hh / 2 - h / 2, w, h, overlay: 0, zoom: 1 };
    }
    if (state.mode === "orbit") return { ...(orbit3d?.rectOf(index) || { x: W * 0.3, y: Hh * 0.32, w: W * 0.4, h: Hh * 0.36 }), overlay: 0, zoom: 1 };
    return { x: 0, y: 0, w: W, h: Hh, overlay: OVERLAY, zoom: works[index].zoom };
  }

  function openCase(pick) {
    const index = pick ?? (state.mode === "slider" ? mod(Math.round(slider.current)) : state.mode === "gallery" ? mod(Math.round(gal.current)) : orbitFront());
    const w = works[index];
    state.busy = true;
    H.sound.play();
    cursor.refresh();
    caseTitle.innerHTML = w.title.map((t) => `<span class="line"><span class="line-inner">${t}</span></span>`).join("");
    caseCover.querySelector(".wf-img")?.setAttribute("data-label", w.label);
    caseEl.style.setProperty("--tone", w.tone);
    caseScroll.target = caseScroll.current = 0;
    caseContent.style.transform = "";
    casePage.scrollTop = 0;
    caseEl.classList.add("is-open");
    caseEl.setAttribute("aria-hidden", "false");
    gsap.set(casePage, { opacity: 0 });
    gsap.set(caseReveal, { yPercent: 102 });
    gsap.set(caseRules, { scaleX: 0 });
    gsap.set(caseTitle.querySelectorAll(".line-inner"), { yPercent: 120 });
    layoutSide();

    const from = startRect(index);
    const to = { ...coverRect(), overlay: 0, zoom: 1 };
    state.open = { index, rect: { ...from }, from: state.mode, fx: { lift: 0, wave: 0, wipe: 0, zoom: 0 } };
    gsap.to(uiForCase(), { autoAlpha: 0, duration: D(0.4), overwrite: true });
    if (state.mode === "slider") hideTexts();
    else if (state.mode === "gallery") showGalleryUI(false);
    const tl = gsap.timeline({ onComplete: () => ((state.busy = false), (state.open.settled = true)) });
    tl.to(state, { orbitIn: 0, duration: D(0.8), ease: "power1.inOut" }, 0);
    tl.to(state.open.rect, { ...to, duration: D(OPEN.move.duration), ease: OPEN.move.ease }, 0);
    const fx = state.open.fx;
    tl.to(fx, { lift: 1, duration: D(OPEN.lift.duration), ease: OPEN.lift.ease }, 0);
    tl.to(fx, { wave: 2.4, duration: D(OPEN.wave.duration), ease: OPEN.wave.ease }, 0);
    tl.to(fx, { lift: 0, duration: D(OPEN.lift.duration), ease: OPEN.lift.ease }, D(OPEN.wave.duration - OPEN.lift.duration));
    tl.to(fx, { zoom: 1, duration: D(OPEN.zoom.duration), ease: OPEN.zoom.ease }, D(OPEN.zoom.delay));
    tl.to(fx, { wipe: 1, duration: D(OPEN.wipe.duration), ease: OPEN.wipe.ease }, D(OPEN.wipe.delay));
    tl.to(casePage, { opacity: 1, duration: D(OPEN.fade.duration), ease: OPEN.fade.ease }, D(OPEN.wipe.delay + OPEN.wipe.duration));
    tl.to(caseTitle.querySelectorAll(".line-inner"), { yPercent: 0, duration: D(1.2), ease: "expo.out", stagger: 0.04 }, "-=0.2");
    tl.to(caseRules, { scaleX: 1, duration: D(1.4), ease: EASE.show, stagger: 0.1 }, "<");
    tl.to(caseReveal, { yPercent: 0, duration: D(1.4), ease: EASE.show, stagger: 0.1 }, "<");
  }

  function closeCase() {
    const o = state.open;
    if (!o || state.busy) return;
    state.busy = true;
    o.settled = false;
    o.rect = { ...coverRect(), overlay: 0, zoom: 1 };
    caseCursor.style.transform = "scale(0)";
    const back = startRect(o.index);
    const tl = gsap.timeline({
      onComplete: () => {
        caseEl.classList.remove("is-open");
        caseEl.setAttribute("aria-hidden", "true");
        state.open = null;
        state.busy = false;
        cursor.refresh();
      },
    });
    tl.to(caseReveal, { yPercent: -110, duration: D(0.7), ease: EASE.hide }, 0);
    tl.to(caseTitle.querySelectorAll(".line-inner"), { yPercent: -110, duration: D(0.7), ease: EASE.hide }, 0);
    tl.to(casePage, { opacity: 0, duration: D(OPEN.fade.duration), ease: OPEN.fade.ease }, D(0.4));
    tl.to(o.rect, { ...back, duration: D(OPEN.back.duration), ease: OPEN.back.ease }, D(0.4));
    // On closing, the wipe and cover zoom rewind twice as fast (original 2.31s / 2)
    tl.to(o.fx, { wipe: 0, zoom: 0, lift: 0, wave: 0, duration: D((OPEN.wipe.delay + OPEN.wipe.duration) / 2), ease: "power1.inOut" }, D(0.4));
    if (o.from === "orbit") tl.to(state, { orbitIn: 1, duration: D(1.2), ease: "power1.inOut" }, D(0.9));
    tl.add(() => {
      gsap.to(uiForCaseBack(o.from), { autoAlpha: 1, duration: D(1.2), ease: "expo.out", stagger: 0.05 });
      if (o.from === "slider") showTexts(0);
      if (o.from === "gallery") showGalleryUI(true);
    }, D(1.2));
  }
  const uiForCaseBack = (mode) => [document.querySelector(".view-switch"), mode === "slider" ? stepperEl : mode === "gallery" ? rulerEl : null].filter(Boolean);
  caseEl.querySelector("[data-case-close]").addEventListener("click", (e) => {
    e.preventDefault();
    closeCase();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && closeCase());
  caseEl.querySelectorAll("a.case-cell").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  // The right outline sticks 42px from the top and follows while scrolling
  function layoutSide() {
    caseScroll.max = Math.max(0, caseContent.offsetHeight - Hh);
  }
  caseEl.addEventListener("wheel", (e) => {
    if (!state.open || H.isMobile()) return;
    caseScroll.target = clamp(caseScroll.target + e.deltaY, 0, caseScroll.max);
  }, { passive: true });
  const caseCursorQ = { x: gsap.quickTo(caseCursor, "x", { duration: CURSOR.duration, ease: CURSOR.ease }), y: gsap.quickTo(caseCursor, "y", { duration: CURSOR.duration, ease: CURSOR.ease }) };
  gsap.set(caseCursor, { scale: 0 });
  caseEl.addEventListener("mousemove", (e) => {
    caseCursorQ.x(e.clientX + CURSOR.offset);
    caseCursorQ.y(e.clientY + CURSOR.offset);
    gsap.to(caseCursor, { scale: e.target.closest(".case-item") && state.open?.settled ? 1 : 0, duration: 0.4, ease: "power3", overwrite: "auto" });
  });
  function updateCase() {
    if (!state.open || H.isMobile()) return;
    caseScroll.current += (caseScroll.target - caseScroll.current) * 0.1;
    const s = caseScroll.current;
    const px = H.px();
    caseContent.style.transform = `translate3d(0,${-s}px,0)`;
    const top = 400 * px, stick = 42 * px;
    const maxY = caseContent.offsetHeight - caseSide.offsetHeight - 16 * px;
    caseSide.style.transform = `translate3d(0,${Math.min(top + Math.max(0, s - (top - stick)), maxY)}px,0)`;
    const p = caseScroll.max ? s / caseScroll.max : 0;
    casePct.textContent = `${Math.round(p * 100)}%`;
    caseFill.style.transform = `scaleX(${p})`;
  }

  // ---------- Every frame ----------
  const loader = { active: false, t: 0 };
  let lastIndex = -1;
  function frame() {
    if (canvas.width !== Math.round(innerWidth * Math.min(devicePixelRatio || 1, 2)) || canvas.height !== Math.round(innerHeight * Math.min(devicePixelRatio || 1, 2))) resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    slider.current = lerp(slider.current, slider.target, SCROLL.lerp);
    if (Math.abs(slider.target - slider.current) < 1e-4) slider.current = slider.target;
    // Film strip (original formula, damping tuned to 60fps frame counts): drag .155 · follow .07 · lag = |.12 × late cell × 10| (max 3) as .07
    const now = performance.now(), frames = Math.min((now - (gal.at ?? now - 1000 / 60)) / (1000 / 60), 4);
    gal.at = now;
    const damp = (a, b, t) => a + (b - a) * (1 - Math.pow(1 - t, frames));
    if (gal.snap !== null) {
      gal.target = damp(gal.target, gal.snap, GALLERY.snap);
      if (Math.abs(gal.snap - gal.target) < 1e-4) (gal.target = gal.snap), (gal.snap = null);
    }
    gal.prev = gal.current;
    gal.current = damp(gal.current, gal.target, GALLERY.ease);
    gal.latency = damp(gal.latency, Math.min(Math.abs(GALLERY.latency * (gal.target - gal.current) * 10), GALLERY.latencyMax), GALLERY.latencyEase);
    const hp = hover.pointer;
    if (hp) {
      if (hover.x < -1e3) (hover.x = hp.x), (hover.y = hp.y);
      hover.x = damp(hover.x, hp.x, HOVER.mouse);
      hover.y = damp(hover.y, hp.y, HOVER.mouse);
      const live = state.mode === "gallery" && !state.busy && !state.open && !H.isMobile();
      const card = galleryCard();
      for (let i = Math.floor(gal.current) - 6; i <= Math.floor(gal.current) + 7; i++) if (!hover.areas.has(i)) hover.areas.set(i, 0);
      hover.areas.forEach((a, i) => {
        const inside = live && Math.abs(hp.x - (W / 2 + (i - gal.current) * card.slot)) <= card.w / 2 && Math.abs(hp.y - Hh / 2) <= card.h / 2;
        const v = damp(a, inside ? 1 : 0, HOVER.area);
        if (v < 0.005 && Math.abs(i - gal.current) > 8) hover.areas.delete(i);
        else hover.areas.set(i, v);
      });
    }
    if (state.orbitIn <= 0 && orbit3d && orbitCanvas.style.visibility !== "hidden") orbitCanvas.style.visibility = "hidden";

    if (loader.active) drawLoader(loader.t);
    else if (state.open && !state.open.settled) {
      if (state.orbitIn > 0) {
        useCard(pxCamera());
        drawRect(black, -2, -2, W + 4, Hh + 4, { alpha: 1 });
        drawOrbit(state.orbitIn);
      }
      drawOpen(state.open);
    } else if (!state.open) {
      if (state.orbitIn < 1) {
        if (state.g <= 0.0001) drawSlider();
        else drawGallery();
      }
      if (state.orbitIn > 0) {
        useCard(pxCamera());
        drawRect(black, -2, -2, W + 4, Hh + 4, { alpha: Math.min(1, state.orbitIn * 1.4) });
        drawOrbit(state.orbitIn);
      }
    }
    if (state.mode === "orbit" && orbit3d && Boolean(orbit3d.hovered) !== cursor.on) {
      cursor.on = Boolean(orbit3d.hovered);
      cursor.refresh();
    }

    works.forEach((w) => {
      if (!w.isVideo || w.media.paused) return;
      gl.bindTexture(gl.TEXTURE_2D, w.tex);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, w.media); } catch { w.isVideo = false; }
    });

    if (state.mode === "slider" && !state.busy) scrubTexts(slider.current);
    const index = mod(Math.round(state.mode === "gallery" ? gal.current : slider.current));
    if (index !== lastIndex) (lastIndex = index), stepper(index), state.started && H.sound.play(), state.mode === "slider" && playOnly(index);
    if (state.mode === "gallery" || state.g > 0) {
      ruler(gal.current);
      const { w, h, slot } = galleryCard();
      const keep = new Set();
      for (let i = Math.floor(gal.current) - 3; i <= Math.floor(gal.current) + 4; i++) {
        keep.add(i);
        const el = galleryLabel(i);
        el.style.width = `${w}px`;
        el.style.transform = `translate3d(${W / 2 + (i - gal.current) * slot - w / 2}px,${Hh / 2 + h / 2 + 12 * H.px()}px,0)`;
      }
      labels.forEach((el, i) => !keep.has(i) && (el.remove(), labels.delete(i)));
    }
    updateCase();
    requestAnimationFrame(frame);
  }

  // ---------- Start: percent → 5×5 cells → first work ----------
  const loadRoot = document.querySelector("[data-load]");
  const loadNo = loadRoot.querySelector("[data-load-no]");
  const skipLoader = H.reduce || H.arrivingByVeil || sessionStorage.getItem("hera-seen") === "1" && performance.getEntriesByType("navigation")[0]?.type === "back_forward";
  const uiEls = [...document.querySelectorAll("[data-ui], [data-stepper]")];

  function start() {
    state.started = true;
    state.busy = false;
    cursor.on = true;
    cursor.refresh();
    try { sessionStorage.setItem("hera-seen", "1"); } catch {}
  }

  async function boot() {
    await document.fonts.ready;
    resize();
    prepare();
    gsap.set(stepperEl, { visibility: "visible" });
    gsap.set(rulerEl, { visibility: "hidden" });
    scrubTexts(0);
    requestAnimationFrame(frame);

    if (skipLoader) {
      loadRoot.remove();
      H.enter();
      if (H.reduce) return start();
      state.extra = 0.15;
      gsap.set(mids(currentText()), { yPercent: INTRO.from });
      gsap.to(state, { extra: 0, duration: 1.3, ease: "expo.out" });
      gsap.to(currentText().lineMids, { yPercent: 0, duration: INTRO.duration, ease: INTRO.ease, stagger: 0.05 });
      gsap.to(currentText().titleMids, { yPercent: 0, duration: INTRO.duration, ease: INTRO.ease, stagger: 0.04, delay: 0.1 });
      return start();
    }

    const inners = H.maskUI(uiEls);
    gsap.set(mids(currentText()), { yPercent: INTRO.from });
    const count = { v: 0 };
    gsap.fromTo(loadNo, { yPercent: 300 }, { yPercent: 0, duration: 1, ease: "expo.out" });
    gsap.to(count, {
      v: 100,
      duration: LOADER.count,
      ease: "power1.inOut",
      delay: 0.3,
      onUpdate: () => (loadNo.textContent = `${Math.round(count.v)}%`),
      onComplete: () => {
        gsap.to(loadNo, { autoAlpha: 0, duration: 1, ease: "power2" });
        gsap.set(loadRoot.querySelector("[data-load-bg]"), { opacity: 0 });
        loadRoot.style.pointerEvents = "none";
        loader.active = true;
        gsap.to(loader, {
          t: 1,
          duration: LOADER.duration,
          ease: "none",
          onComplete: () => {
            loader.active = false;
            loadRoot.remove();
          },
        });
        H.revealUI(inners, LOADER.duration * 0.72);
        gsap.delayedCall(LOADER.duration * 0.8, () => {
          const t = currentText();
          gsap.to(t.lineMids, { yPercent: 0, duration: INTRO.duration, ease: INTRO.ease, stagger: 0.05 });
          gsap.to(t.titleMids, { yPercent: 0, duration: INTRO.duration, ease: INTRO.ease, stagger: 0.04, delay: 0.1 });
        });
        gsap.delayedCall(LOADER.duration, start);
      },
    });
  }
  boot();
})();
