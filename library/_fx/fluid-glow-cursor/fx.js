// Full-screen WebGL fluid — faint light trails spread where the mouse has passed, and over a marked wordmark (svg) only that letter shape shows up strongly — Brand cursor
(() => {
  const VERT = `varying vec2 vUv, vL, vR, vT, vB; uniform vec2 uTexel;
    void main(){ vUv = position.xy * .5 + .5; vL = vUv - vec2(uTexel.x, 0.); vR = vUv + vec2(uTexel.x, 0.); vT = vUv + vec2(0., uTexel.y); vB = vUv - vec2(0., uTexel.y); gl_Position = vec4(position.xy, 0., 1.); }`;
  const FRAG = {
    splat: `uniform sampler2D uTarget; uniform float uAspect, uRadius; uniform vec3 uColor; uniform vec2 uPoint; varying vec2 vUv;
      void main(){ vec2 p = vUv - uPoint; p.x *= uAspect; gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / uRadius) * uColor, 1.); }`,
    advect: `uniform sampler2D uVelocity, uSource; uniform vec2 uTexel; uniform float uDt, uDiss; varying vec2 vUv;
      void main(){ vec2 c = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel; gl_FragColor = vec4(uDiss * texture2D(uSource, c).xyz, 1.); }`,
    div: `uniform sampler2D uVelocity; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y; gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.); }`,
    scale: `uniform sampler2D uTexture; uniform float uValue; varying vec2 vUv;
      void main(){ gl_FragColor = uValue * texture2D(uTexture, vUv); }`,
    pressure: `uniform sampler2D uPressure, uDivergence; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ gl_FragColor = vec4((texture2D(uPressure, vL).x + texture2D(uPressure, vR).x + texture2D(uPressure, vB).x + texture2D(uPressure, vT).x - texture2D(uDivergence, vUv).x) * .25, 0., 0., 1.); }`,
    grad: `uniform sampler2D uPressure, uVelocity; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(texture2D(uPressure, vR).x - texture2D(uPressure, vL).x, texture2D(uPressure, vT).x - texture2D(uPressure, vB).x), 0., 1.); }`,
    show: `uniform sampler2D uDensity, uMask; uniform vec3 uColor; uniform vec4 uRect; uniform float uIntensity, uMaskIntensity, uMaskOn; varying vec2 vUv;
      void main(){ float d = texture2D(uDensity, vUv).b; vec2 m = (vUv - uRect.xy) / uRect.zw;
        float inside = step(0., m.x) * step(m.x, 1.) * step(0., m.y) * step(m.y, 1.);
        float logo = texture2D(uMask, vec2(m.x, 1. - m.y)).a * inside * uMaskOn * clamp(d * uMaskIntensity, 0., 1.);
        float a = max(clamp(d * uIntensity, 0., 1.), logo); gl_FragColor = vec4(uColor * a, a); }`,
  };
  kfFx.register("fluid-glow-cursor", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (reduce || !hover || !T) return;
    const S = {
      sim: +options.sim || 128, dye: +options.dye || 512, iter: +options.iter || 3,
      flow: +(options.flow ?? 1), fade: +(options.fade ?? 0.98), radius: +(options.radius ?? 0.005), force: +(options.force ?? 5),
      glow: +(options.glow ?? 0.03), logo: +(options.logo ?? 3), idle: +options.idle || 300,
    };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-fgc";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true }); } catch { canvas.remove(); return; }
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    const cam = new T.Camera(), geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const quad = new T.Mesh(geo), scene = new T.Scene();
    quad.frustumCulled = false;
    scene.add(quad);
    const rt = (n, fmt) => new T.WebGLRenderTarget(n, n, { type: T.HalfFloatType, format: fmt, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
    const pair = (n, fmt) => ({ read: rt(n, fmt), write: rt(n, fmt), swap() { [this.read, this.write] = [this.write, this.read]; } });
    const dye = pair(S.dye, T.RGBAFormat), vel = pair(S.sim, T.RGFormat), prs = pair(S.sim, T.RedFormat), dv = rt(S.sim, T.RedFormat);
    const texel = new T.Vector2(1 / S.sim, 1 / S.sim);
    const mat = (frag, u) => new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms: { uTexel: { value: texel }, ...u }, depthTest: false, depthWrite: false, blending: T.NoBlending });
    const ink = () => { const c = new T.Color(getComputedStyle(el).color); return new T.Vector3(c.r, c.g, c.b); };
    const m = {
      splat: mat(FRAG.splat, { uTarget: { value: null }, uAspect: { value: innerWidth / innerHeight }, uColor: { value: new T.Vector3() }, uPoint: { value: new T.Vector2() }, uRadius: { value: S.radius } }),
      advect: mat(FRAG.advect, { uVelocity: { value: null }, uSource: { value: null }, uDt: { value: 0.016 }, uDiss: { value: 1 } }),
      div: mat(FRAG.div, { uVelocity: { value: null } }),
      scale: mat(FRAG.scale, { uTexture: { value: null }, uValue: { value: 0.5 } }),
      pressure: mat(FRAG.pressure, { uPressure: { value: null }, uDivergence: { value: dv.texture } }),
      grad: mat(FRAG.grad, { uPressure: { value: null }, uVelocity: { value: null } }),
      show: mat(FRAG.show, { uDensity: { value: null }, uMask: { value: null }, uColor: { value: ink() }, uRect: { value: new T.Vector4(-2, -2, 1, 1) }, uIntensity: { value: S.glow }, uMaskIntensity: { value: S.logo }, uMaskOn: { value: 0 } }),
    };
    m.show.transparent = true;
    m.show.blending = T.NormalBlending;
    const pass = (mt, target) => { quad.material = mt; renderer.setRenderTarget(target); renderer.render(scene, cam); };

    let maskEl = null, maskTex = null, maskKey = "", frame = 0;
    const bakeMask = (svg) => {
      const r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const w = Math.min(2048, Math.round(r.width * 2));
      const copy = svg.cloneNode(true);
      copy.removeAttribute("style");
      copy.setAttribute("width", w);
      copy.setAttribute("height", Math.round((w * r.height) / r.width));
      const MASK = "#fff"; /* Not skin: white that bakes the mask alpha — not painted on screen */
      copy.querySelectorAll("[fill]").forEach((n) => n.getAttribute("fill") !== "none" && n.setAttribute("fill", MASK));
      copy.querySelectorAll("[stroke]").forEach((n) => n.getAttribute("stroke") !== "none" && n.setAttribute("stroke", MASK));
      if (!copy.getAttribute("fill")) copy.setAttribute("fill", MASK);
      const img = new Image();
      img.onload = () => { if (maskEl !== svg) return; maskTex?.dispose(); maskTex = new T.Texture(img); maskTex.needsUpdate = true; m.show.uniforms.uMask.value = maskTex; };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(copy));
    };
    const findMask = () => {
      const part = el.querySelector('[data-fx-part="mask"]');
      const svg = part ? (part.tagName.toLowerCase() === "svg" ? part : part.querySelector("svg")) : null;
      if (svg !== maskEl) { maskEl = svg; maskKey = ""; m.show.uniforms.uMask.value = null; }
      if (!maskEl) return;
      const r = maskEl.getBoundingClientRect(), key = `${Math.round(r.width)}x${Math.round(r.height)}`;
      if (key !== maskKey) { maskKey = key; bakeMask(maskEl); }
    };
    const placeMask = () => {
      const u = m.show.uniforms;
      if (!maskEl || !maskEl.isConnected || !u.uMask.value || getComputedStyle(maskEl).display === "none") { u.uMaskOn.value = 0; return; }
      const r = maskEl.getBoundingClientRect();
      u.uRect.value.set(r.left / innerWidth, 1 - r.bottom / innerHeight, r.width / innerWidth, r.height / innerHeight);
      u.uMaskOn.value = 1;
    };

    const queue = [];
    let idle = Infinity, px = null, py = null;
    const move = (e) => {
      if (e.pointerType === "touch") return;
      const x = e.clientX, y = e.clientY;
      if (px !== null && (x !== px || y !== py)) { queue.push({ x: x / innerWidth, y: 1 - y / innerHeight, dx: (x - px) * S.force, dy: (py - y) * S.force }); idle = 0; }
      px = x; py = y;
    };
    const step = () => {
      if (idle++ > S.idle) return;
      if (frame++ % 30 === 0) findMask();
      queue.splice(0).forEach(({ x, y, dx, dy }) => {
        const u = m.splat.uniforms;
        u.uPoint.value.set(x, y); u.uColor.value.set(dx, dy, 1);
        u.uTarget.value = vel.read.texture; pass(m.splat, vel.write); vel.swap();
        u.uTarget.value = dye.read.texture; pass(m.splat, dye.write); dye.swap();
      });
      m.div.uniforms.uVelocity.value = vel.read.texture; pass(m.div, dv);
      m.scale.uniforms.uTexture.value = prs.read.texture; pass(m.scale, prs.write); prs.swap();
      for (let i = 0; i < S.iter; i++) { m.pressure.uniforms.uPressure.value = prs.read.texture; pass(m.pressure, prs.write); prs.swap(); }
      m.grad.uniforms.uPressure.value = prs.read.texture; m.grad.uniforms.uVelocity.value = vel.read.texture; pass(m.grad, vel.write); vel.swap();
      const a = m.advect.uniforms;
      a.uVelocity.value = vel.read.texture; a.uSource.value = vel.read.texture; a.uDiss.value = S.flow; pass(m.advect, vel.write); vel.swap();
      a.uVelocity.value = vel.read.texture; a.uSource.value = dye.read.texture; a.uDiss.value = S.fade; pass(m.advect, dye.write); dye.swap();
      placeMask();
      m.show.uniforms.uDensity.value = dye.read.texture;
      renderer.setRenderTarget(null); renderer.clear(); pass(m.show, null);
    };
    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      m.splat.uniforms.uAspect.value = innerWidth / innerHeight;
      maskKey = ""; findMask();
    };
    const recolor = new MutationObserver(() => { m.show.uniforms.uColor.value = ink(); });
    recolor.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    addEventListener("pointermove", move);
    addEventListener("resize", resize);
    findMask();
    gsap.ticker.add(step);
    return () => {
      gsap.ticker.remove(step);
      removeEventListener("pointermove", move);
      removeEventListener("resize", resize);
      recolor.disconnect();
      [dye.read, dye.write, vel.read, vel.write, prs.read, prs.write, dv].forEach((t) => t.dispose());
      Object.values(m).forEach((x) => x.dispose());
      maskTex?.dispose(); geo.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
