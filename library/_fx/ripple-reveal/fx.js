// PixiJS attaches asynchronously, so if it is detached before it finishes, clean up then
(() => {
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

  // If the image is from another origin (for example a video opened via file://) that WebGL cannot read, keep the original element without ripples
  const drawable = (m) => { try { const x = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d"); x.drawImage(m, 0, 0, 1, 1); x.getImageData(0, 0, 1, 1); return true; } catch (e) { return false; } };

  kfFx.register("ripple-reveal", (el, { options, reduce }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.PIXI || reduce) return;
    const sp = () => innerWidth < 768;
    const look = () => (sp() ? { amp: +(options.amp_sp ?? 0.008), scale: +(options.scale_sp ?? 1) } : { amp: +(options.amp ?? 0.01), scale: +(options.scale ?? 2.5) });
    const dur = +(options.dur ?? 2.8);
    const app = new PIXI.Application();
    let alive = true, inited = false, sprite, filter, tick, ro;
    const fit = () => {
      if (!sprite || !alive) return;
      const w = media.videoWidth || media.naturalWidth || media.width || 1920, h = media.videoHeight || media.naturalHeight || media.height || 1080;
      sprite.scale.set(Math.max(app.screen.width / w, app.screen.height / h));
      sprite.position.set(app.screen.width / 2, app.screen.height / 2);
      app.canvas.style.height = `${app.screen.height + 10}px`;
      if (filter) { const L = look(), U = filter.resources.rippleUniforms.uniforms; U.uAmplitude = L.amp; U.uScale = L.scale; }
    };
    const ripple = () => {
      if (!filter) return;
      const U = filter.resources.rippleUniforms.uniforms, t0 = performance.now();
      if (tick) app.ticker.remove(tick);
      sprite.filters = [filter];
      tick = (t) => {
        const p = Math.min((performance.now() - t0) / 1000 / dur, 1);
        const c = Math.max(0, Math.min((p - 0.75) / 0.25, 1)), d = 1 - c * c;
        U.uEnvelope = Math.sin(p * Math.PI) * (0.35 + 0.65 * d);
        U.uTime += (Math.max(0, t.deltaTime) / 60) * (0.45 + 0.55 * d);
        if (p >= 1) { U.uEnvelope = 0; sprite.filters = null; app.ticker.remove(tick); tick = null; }
      };
      app.ticker.add(tick);
    };
    const ready = () => media.tagName !== "VIDEO" ? (media.tagName !== "IMG" || media.complete ? Promise.resolve() : new Promise((r) => media.addEventListener("load", r, { once: true })))
      : media.readyState >= 2 ? Promise.resolve() : new Promise((r) => { media.addEventListener("loadeddata", r, { once: true }); setTimeout(r, 10000); });
    const onWait = () => ripple();
    (async () => {
      await app.init({ backgroundAlpha: 0, antialias: false, autoDensity: true, resizeTo: el, resolution: Math.min(devicePixelRatio || 1, 2) });
      inited = true;
      if (!alive) return app.destroy(true);
      app.ticker.maxFPS = +(options.fps || 30);
      if (media.tagName === "VIDEO") media.play?.().catch(() => {});
      await ready();
      if (!alive) return;
      if (!drawable(media)) { app.destroy(true); inited = false; return; }
      sprite = new PIXI.Sprite(PIXI.Texture.from(media));
      sprite.anchor.set(0.5);
      app.stage.addChild(sprite);
      const L = look();
      filter = new PIXI.Filter({
        glProgram: new PIXI.GlProgram({ vertex, fragment }),
        resources: { rippleUniforms: { uTime: { value: 0, type: "f32" }, uAmplitude: { value: L.amp, type: "f32" }, uEnvelope: { value: 0, type: "f32" }, uScale: { value: L.scale, type: "f32" } } },
      });
      el.append(app.canvas);
      el.classList.add("is-drawn");
      ro = new ResizeObserver(() => requestAnimationFrame(fit));
      ro.observe(el);
      fit();
      if (options.wait) document.addEventListener(options.wait, onWait);
      else ripple();
    })();
    return () => {
      alive = false;
      if (options.wait) document.removeEventListener(options.wait, onWait);
      ro?.disconnect();
      el.classList.remove("is-drawn");
      if (inited) { app.canvas.remove(); app.destroy(true); }
    };
  });
})();
