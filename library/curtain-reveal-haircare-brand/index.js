(() => {
  const { reduce, isSp } = window.AP;

  /* Retailer cells: just names in rows as in the original, two columns (phone), three, four (1280+) */
  document.getElementById("shop-list").innerHTML = Array.from({ length: 24 }, (_, i) => `<li>Retailer ${String(i + 1).padStart(2, "0")}</li>`).join("");

  /* Right half of the glyph: fourteen copies of the same photo overlap, and following the original order table, the later one arrives the shorter it folds as it settles down */
  const lag = [0, 0.4, 0.76, 1.08, 1.36, 1.6, 1.81, 2, 2.15, 2.3, 2.45, 2.61, 2.79, 3.01];
  const dur = [1.8, 1.5, 1.45, 1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.7, 0.8, 1, 1.5];
  document.querySelector(".h-change__after").insertAdjacentHTML("beforeend", lag
    .map((w, i) => `<div class="h-change__ph wf-img" style="z-index:${i};--w:${w}s;--d:${dur[i]}s" data-label="Right half of the same back-of-head photo · glossy texture"></div>`)
    .join(""));

  /* ---------- Hero: as in the original, PixiJS 8.19.0 draws the video over the screen, and when loading clears a ripple distortion filter is applied for 2.8s ----------
     Separate videos for desktop (landscape) and phone (under 768), drawn at 30fps. The filter formula was measured from the original and rewritten — coordinates shift by the noise gradient and the 4% edge stays fixed */
  const media = document.querySelector(".h-mv__media");
  const mount = document.querySelector(".js-mv-canvas");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const once = (name, flag, ms) => (window[flag] ? Promise.resolve() : new Promise((r) => { addEventListener(name, r, { once: true }); setTimeout(r, ms); }));
  const mvReady = () => { window.__apMvReady = true; dispatchEvent(new CustomEvent("home-mv:ready-for-loading-close")); };
  const kind = () => (isSp() ? "sp" : "pc");
  const makeVideo = (k) => Object.assign(document.createElement("video"), { muted: true, loop: true, preload: "auto", playsInline: true, src: mount.dataset[k] });
  const playable = (v, ms) => {
    v.play().catch(() => {});
    return v.readyState >= 2 ? Promise.resolve(true) : new Promise((r) => {
      const ok = (yes) => r(yes);
      v.addEventListener("loadeddata", () => ok(true), { once: true });
      v.addEventListener("canplay", () => ok(true), { once: true });
      v.addEventListener("error", () => ok(false), { once: true });
      setTimeout(() => ok(v.readyState >= 2), ms);
    });
  };
  const vertex = `in vec2 aPosition; out vec2 vTextureCoord;
    uniform vec4 uInputSize; uniform vec4 uOutputFrame; uniform vec4 uOutputTexture;
    void main(){ vec2 p = aPosition * uOutputFrame.zw + uOutputFrame.xy;
      p.x = p.x * (2.0 / uOutputTexture.x) - 1.0; p.y = p.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
      gl_Position = vec4(p, 0.0, 1.0); vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw); }`;
  const fragment = `in vec2 vTextureCoord; out vec4 finalColor; uniform sampler2D uTexture;
    uniform float uTime; uniform float uAmplitude; uniform float uEnvelope; uniform float uScale;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      float a = h(i), b = h(i + vec2(1.0, 0.0)), c = h(i + vec2(0.0, 1.0)), d = h(i + vec2(1.0, 1.0));
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y; }
    float fbm(vec2 p){ float r = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { r += a * n(p); p *= 2.02; a *= 0.5; } return r; }
    void main(){ vec2 uv = vTextureCoord; float amp = uAmplitude * uEnvelope;
      float e = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)); float m = smoothstep(0.0, 0.04, e); m *= m;
      if (amp > 0.0001) { vec2 p = uv * uScale + uTime * 0.3; float n0 = fbm(p);
        vec2 g = vec2(fbm(p + vec2(0.01, 0.0)) - n0, fbm(p + vec2(0.0, 0.01)) - n0) / 0.01; uv = mix(uv, uv + g * amp, m); }
      finalColor = texture(uTexture, clamp(uv, 0.0, 1.0)); }`;
  const look = () => (isSp() ? { amp: 0.008, scale: 1 } : { amp: 0.01, scale: 2.5 });
  // When opened via file://, the video counts as another origin and WebGL can’t read it — then just lay down the video alone
  const drawable = (v) => { try { const x = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d"); x.drawImage(v, 0, 0, 1, 1); x.getImageData(0, 0, 1, 1); return true; } catch (e) { return false; } };

  const startHero = async () => {
    if (!window.PIXI || !mount) return mvReady();
    const videos = { pc: makeVideo("pc"), sp: makeVideo("sp") };
    // Browsers that block silent autoplay replay it on the first touch
    const unlock = () => Object.values(videos).forEach((v) => v.play().catch(() => {}));
    ["pointerdown", "touchstart", "keydown"].forEach((t) => document.addEventListener(t, unlock, { once: true, passive: true }));
    // If it can’t be drawn, lay just the video in its place
    const plain = (k) => { const v = videos[k]; v.autoplay = true; mount.prepend(v); v.play().catch(() => {}); media.classList.add("is-mv-canvas-ready"); mvReady(); };
    let k = kind();
    const app = new PIXI.Application();
    let ok = false;
    try {
      const init = app.init({ backgroundAlpha: 0, antialias: false, autoDensity: true, resizeTo: mount, resolution: Math.min(devicePixelRatio || 1, 2) });
      await once("home-loading:video-ready", "__apLoadingVideoReady", 2000);
      ok = await playable(videos[k], 10000);
      await init;
      app.ticker.maxFPS = 30;
    } catch (e) { return plain(k); }
    if (!ok || !drawable(videos[k])) { app.destroy(true); return plain(k); }
    mount.appendChild(app.canvas);
    const tall = () => { app.canvas.style.height = `${app.screen.height + 10}px`; };
    tall();
    let video = videos[k];
    const sprite = new PIXI.Sprite(PIXI.Texture.from(video));
    sprite.anchor.set(0.5);
    app.stage.addChild(sprite);
    const L = look();
    const filter = new PIXI.Filter({
      glProgram: new PIXI.GlProgram({ vertex, fragment }),
      resources: { rippleUniforms: { uTime: { value: 0, type: "f32" }, uAmplitude: { value: L.amp, type: "f32" }, uEnvelope: { value: 0, type: "f32" }, uScale: { value: L.scale, type: "f32" } } },
    });
    const fit = () => {
      const r = Math.max(app.screen.width / (video.videoWidth || 1920), app.screen.height / (video.videoHeight || 1080));
      sprite.scale.set(r);
      sprite.position.set(app.screen.width / 2, app.screen.height / 2);
    };
    fit();
    media.classList.add("is-mv-canvas-ready");
    mvReady();
    await once("home-loading:closing", "__apLoadingClosing", 3500);
    if (!reduce) {
      const U = filter.resources.rippleUniforms.uniforms;
      const D = 2.8, t0 = performance.now();
      sprite.filters = [filter];
      const tick = (t) => {
        const p = Math.min((performance.now() - t0) / 1000 / D, 1);
        const c = Math.max(0, Math.min((p - 0.75) / 0.25, 1)), d = 1 - c * c;
        U.uEnvelope = Math.sin(p * Math.PI) * (0.35 + 0.65 * d);
        U.uTime += (t.deltaTime / 60) * (0.45 + 0.55 * d);
        if (p >= 1) { U.uEnvelope = 0; sprite.filters = null; app.ticker.remove(tick); }
      };
      app.ticker.add(tick);
    }
    // When the width crosses PC↔phone, swap in the video for that side
    let rt;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(async () => {
        const nk = kind();
        if (nk !== k) {
          k = nk; video = videos[k];
          const L2 = look(), U = filter.resources.rippleUniforms.uniforms;
          U.uAmplitude = L2.amp; U.uScale = L2.scale;
          await playable(video, 10000);
          sprite.texture = PIXI.Texture.from(video);
        }
        fit(); tall();
      }, 150);
    });
  };
  startHero();

  /* ---------- Loading: once the loading video is ready (2.5s at the latest) the text mask and focus start, and after waiting for both 2.2s and Hero readiness (10s at the latest) the curtain lifts from bottom to top ---------- */
  const loading = document.querySelector(".js-loading");
  const loadingVideo = loading.querySelector(".js-loading-video");
  let started = false;
  const hide = () => {
    loading.classList.add("is-hidden");
    loading.setAttribute("aria-hidden", "true");
    setTimeout(() => { loadingVideo.pause(); loadingVideo.removeAttribute("src"); loadingVideo.load(); }, 3000);
  };
  const begin = async () => {
    if (started) return;
    started = true;
    loading.classList.add("is-start");
    await Promise.all([wait(1200 + 1000), once("home-mv:ready-for-loading-close", "__apMvReady", 10000)]);
    loading.classList.add("is-closing");
    document.body.classList.add("is-loader-closing");
    window.__apLoadingClosing = true;
    dispatchEvent(new CustomEvent("home-loading:closing"));
    setTimeout(hide, 1250);
  };
  const videoReady = () => {
    if (!window.__apLoadingVideoReady) { window.__apLoadingVideoReady = true; dispatchEvent(new CustomEvent("home-loading:video-ready")); }
    begin();
  };
  if (reduce) {
    document.body.classList.add("is-loader-closing");
    window.__apLoadingVideoReady = window.__apLoadingClosing = true;
    hide();
  } else if (loadingVideo.readyState >= 2) videoReady();
  else {
    ["loadeddata", "canplay", "error"].forEach((t) => loadingVideo.addEventListener(t, videoReady, { once: true }));
    setTimeout(videoReady, 2500);
  }

  /* ---------- Video background section: when half in view, it fetches and plays the video (original is-video) ---------- */
  document.addEventListener("ap:st-on", (e) => {
    const v = e.target.classList.contains("is-video") && e.target.querySelector("video");
    if (!v) return;
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
    v.play().catch(() => {});
  });
})();
