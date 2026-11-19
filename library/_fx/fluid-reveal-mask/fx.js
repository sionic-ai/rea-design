(() => {
  const VERT = `varying vec2 vUv, vL, vR, vT, vB; uniform vec2 uTexel;
    void main(){ vUv = uv; vL = vUv - vec2(uTexel.x, 0.); vR = vUv + vec2(uTexel.x, 0.); vT = vUv + vec2(0., uTexel.y); vB = vUv - vec2(0., uTexel.y); gl_Position = vec4(position.xy, 0., 1.); }`;
  const FRAG = {
    splat: `uniform sampler2D uTarget; uniform float uAspect, uRadius; uniform vec3 uColor; uniform vec2 uPoint; varying vec2 vUv;
      void main(){ vec2 p = vUv - uPoint; p.x *= uAspect; gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p, p) / uRadius) * uColor, 1.); }`,
    advect: `uniform sampler2D uVelocity, uSource; uniform vec2 uTexel; uniform float uDiss; varying vec2 vUv;
      void main(){ vec2 c = vUv - texture2D(uVelocity, vUv).xy * uTexel; gl_FragColor = vec4(uDiss * texture2D(uSource, c).xyz, 1.); }`,
    div: `uniform sampler2D uVelocity; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ vec2 C = texture2D(uVelocity, vUv).xy; float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
        if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x; if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y; gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.); }`,
    pressure: `uniform sampler2D uPressure, uDivergence; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ gl_FragColor = vec4((texture2D(uPressure, vL).x + texture2D(uPressure, vR).x + texture2D(uPressure, vB).x + texture2D(uPressure, vT).x - texture2D(uDivergence, vUv).x) * .25, 0., 0., 1.); }`,
    grad: `uniform sampler2D uPressure, uVelocity; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ vec2 v = texture2D(uVelocity, vUv).xy - vec2(texture2D(uPressure, vR).x - texture2D(uPressure, vL).x, texture2D(uPressure, vT).x - texture2D(uPressure, vB).x); gl_FragColor = vec4(v, 0., 1.); }`,
    mask: `uniform sampler2D uBase, uDye; uniform float uReveal; varying vec2 vUv;
      void main(){ float m = clamp(smoothstep(.5, .51, texture2D(uDye, vUv).r * uReveal), 0., 1.); gl_FragColor = mix(texture2D(uBase, vUv), vec4(0.), m); }`,
  };
  kfFx.register("fluid-reveal-mask", (el, { options, reduce }) => {
    const T = window.THREE;
    if (reduce || !T) return;
    const S = { radius: +(options.radius ?? 6e-5), force: +(options.force ?? 5900), reveal: +(options.reveal ?? 3.9), fade: +(options.fade ?? 0.988), flow: +(options.flow ?? 0.962) };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-fluid";
    el.prepend(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: false }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const rt = (n, f) => new T.WebGLRenderTarget(n, n, { minFilter: f, magFilter: f, format: T.RGBAFormat, type: T.HalfFloatType, depthBuffer: false, stencilBuffer: false });
    const dbl = (n, f) => ({ read: rt(n, f), write: rt(n, f), swap() { [this.read, this.write] = [this.write, this.read]; } });
    const vel = dbl(256, T.LinearFilter), dye = dbl(512, T.LinearFilter), pre = dbl(256, T.NearestFilter), divRT = rt(256, T.NearestFilter);
    const simTexel = new T.Vector2(1 / 256, 1 / 256), dyeTexel = new T.Vector2(1 / 512, 1 / 512);
    const mat = (frag, u) => new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms: { uTexel: { value: simTexel }, ...u }, depthTest: false, depthWrite: false, blending: T.NoBlending });
    const m = {
      splat: mat(FRAG.splat, { uTarget: { value: null }, uAspect: { value: 1 }, uRadius: { value: S.radius }, uColor: { value: new T.Vector3() }, uPoint: { value: new T.Vector2() } }),
      advect: mat(FRAG.advect, { uVelocity: { value: null }, uSource: { value: null }, uDiss: { value: S.flow } }),
      div: mat(FRAG.div, { uVelocity: { value: null } }),
      pressure: mat(FRAG.pressure, { uPressure: { value: null }, uDivergence: { value: null } }),
      grad: mat(FRAG.grad, { uPressure: { value: null }, uVelocity: { value: null } }),
      mask: mat(FRAG.mask, { uBase: { value: null }, uDye: { value: null }, uReveal: { value: S.reveal } }),
    };
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2), m.splat);
    scene.add(quad);
    const baseCv = document.createElement("canvas"), baseTex = new T.CanvasTexture(baseCv);
    baseTex.colorSpace = T.SRGBColorSpace;
    m.mask.uniforms.uBase.value = baseTex;
    const inks = [...el.querySelectorAll('[data-fx-part="ink"]')];
    let size = { w: 1, h: 1 };
    const bake = () => {
      el.classList.remove("fx-baked");
      const b = el.getBoundingClientRect();
      size = { w: Math.max(1, b.width), h: Math.max(1, b.height) };
      renderer.setSize(size.w, size.h, false);
      const k = Math.min(devicePixelRatio || 1, 2, 4096 / size.h, 4096 / size.w);
      baseCv.width = Math.round(size.w * k); baseCv.height = Math.round(size.h * k);
      const ctx = baseCv.getContext("2d"), cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      // If the panel has no background color (transparent), it is painted with the skin’s background color
      const clear = !bg || bg === "transparent" || /rgba\([^)]*,\s*0\)$/.test(bg);
      ctx.fillStyle = clear ? getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim() : bg;
      ctx.fillRect(0, 0, baseCv.width, baseCv.height);
      ctx.textBaseline = "alphabetic";
      inks.forEach((ink) => {
        const ics = getComputedStyle(ink), probe = document.createElement("i");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        ink.append(probe);
        const base = probe.getBoundingClientRect().top;
        probe.remove();
        const r = ink.getBoundingClientRect();
        ctx.fillStyle = ics.color;
        ctx.font = `${ics.fontStyle} ${ics.fontWeight} ${parseFloat(ics.fontSize) * k}px ${ics.fontFamily}`;
        if ("letterSpacing" in ctx) ctx.letterSpacing = (parseFloat(ics.letterSpacing) || 0) * k + "px";
        ctx.fillText(ink.textContent, (r.left - b.left) * k, (base - b.top) * k);
      });
      baseTex.needsUpdate = true;
      el.classList.add("fx-baked");
    };
    const mouse = { x: 0.5, y: 0.5 }, prev = { x: 0.5, y: 0.5 };
    let moved = false, visible = true, raf = 0;
    const onMove = (e) => { const p = e.touches ? e.touches[0] : e; if (!p) return; const b = canvas.getBoundingClientRect(); mouse.x = (p.clientX - b.left) / b.width; mouse.y = 1 - (p.clientY - b.top) / b.height; moved = true; };
    addEventListener("mousemove", onMove, { passive: true });
    addEventListener("touchmove", onMove, { passive: true });
    const pass = (mt, target) => { quad.material = mt; renderer.setRenderTarget(target); renderer.render(scene, cam); };
    const step = () => {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      const b = canvas.getBoundingClientRect(), n = Math.min(1, Math.max(0, -b.top / (b.height || 1))), i = n * n, s = 1 - i;
      if (moved) {
        const dx = mouse.x - prev.x, dy = mouse.y - prev.y;
        if (Math.hypot(dx, dy) > 0 && s > 0.001) {
          const u = m.splat.uniforms;
          u.uTarget.value = vel.read.texture; u.uAspect.value = size.w / size.h; u.uPoint.value.set(mouse.x, mouse.y); u.uColor.value.set(dx * S.force * s, dy * S.force * s, 0);
          pass(m.splat, vel.write); vel.swap();
          u.uTarget.value = dye.read.texture; u.uColor.value.set(s, s, s);
          pass(m.splat, dye.write); dye.swap();
        }
        prev.x = mouse.x; prev.y = mouse.y;
      }
      const a = m.advect.uniforms;
      a.uVelocity.value = vel.read.texture; a.uSource.value = vel.read.texture; a.uTexel.value = simTexel; a.uDiss.value = S.flow;
      pass(m.advect, vel.write); vel.swap();
      a.uVelocity.value = vel.read.texture; a.uSource.value = dye.read.texture; a.uTexel.value = dyeTexel; a.uDiss.value = S.fade + (0.97 - S.fade) * i;
      pass(m.advect, dye.write); dye.swap();
      m.div.uniforms.uVelocity.value = vel.read.texture; pass(m.div, divRT);
      renderer.setRenderTarget(pre.read); renderer.clear();
      m.pressure.uniforms.uDivergence.value = divRT.texture;
      for (let k = 0; k < 20; k++) { m.pressure.uniforms.uPressure.value = pre.read.texture; pass(m.pressure, pre.write); pre.swap(); }
      m.grad.uniforms.uPressure.value = pre.read.texture; m.grad.uniforms.uVelocity.value = vel.read.texture; pass(m.grad, vel.write); vel.swap();
      m.mask.uniforms.uDye.value = dye.read.texture;
      renderer.setRenderTarget(null); renderer.clear(); pass(m.mask, null);
    };
    let t = 0;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(bake, 120); });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    (document.fonts?.ready || Promise.resolve()).then(() => { if (!canvas.isConnected) return; bake(); ro.observe(el); io.observe(el); raf = requestAnimationFrame(step); });
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t); ro.disconnect(); io.disconnect();
      removeEventListener("mousemove", onMove); removeEventListener("touchmove", onMove);
      [vel, dye, pre].forEach((d) => { d.read.dispose(); d.write.dispose(); }); divRT.dispose();
      Object.values(m).forEach((x) => x.dispose()); quad.geometry.dispose(); baseTex.dispose(); renderer.dispose();
      canvas.remove(); el.classList.remove("fx-baked");
    };
  });
})();
