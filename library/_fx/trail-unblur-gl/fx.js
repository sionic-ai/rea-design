// Full-screen blurred video — only where the cursor passes is wiped sharp for 1 second and then fades, and when the video is swapped, a wavy circular band spreads from the center with color bleed as it changes.
// After the change, a sharp ring sweeps outward once (focus pull). Image = Background-color veil over a Gaussian blur (σ, .4 resolution).
// Source is fx:source on the pasted panel { el } Hand over to — <video>·<canvas>·<img> Anything. three (global THREE) and gsap must be loaded first.
(() => {
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  // Ripple circle: with progress e the radius grows from center to screen edge, and the leading edge undulates in 6 lobes (sin(πe) from center)
  const WAVE = `
    uniform float uTime;
    vec4 wave(float e, vec2 asp, vec2 uv){
      vec2 p = (uv - 0.5) * asp; float dist = length(p); float th = atan(p.y, p.x);
      float l = e * (length(asp * 0.5) + 0.2) - 0.1;
      float wob = sin(th * 6.0 + uTime * 3.0) * 0.04 * sin(3.14159 * e);
      float d = l + wob * smoothstep(0.0, 0.2, l);
      float mask = 1.0 - smoothstep(d - 0.06, d + 0.06, dist);
      return vec4(mask, d, dist, sin(3.14159 * e));
    }
    vec4 ripple(vec4 w, vec2 asp, vec2 uv, float k){
      vec2 p = (uv - 0.5) * asp; float dist = w.z, d = w.y;
      float near = 1.0 - smoothstep(0.0, 0.36, abs(dist - d));
      float a = sin(dist * 40.0 - uTime * 8.0) * near * 0.06 * k;
      float b = sin(dist * 8.0 - uTime * 2.0) * 0.012 * k;
      vec2 f = p / max(dist, 1e-4) / asp * (w.w * smoothstep(0.0, 0.15, dist));
      return vec4(f * (a + b), f * near * 0.006);
    }`;
  const COVER = "vec2 cover(vec2 uv, float src, float dst){ vec2 s = vec2(min(dst / src, 1.0), min(src / dst, 1.0)); return (uv - 0.5) * s + 0.5; }";

  kfFx.register("trail-unblur-gl", (el, { options, reduce, hover }) => {
    if (!window.THREE || !window.gsap) return;
    const T = window.THREE;
    const sigma = +(options.blur ?? 6), veil = +(options.veil ?? 0.6), aberr = +(options.aberration ?? 3), dur = +(options.dur ?? 0.85);
    const trailOn = hover && !reduce && (options.trail ?? "1") !== "0";
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) { return; }
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, +(options.dpr ?? 2)));
    // The shader handles sRGB values as-is with no color space conversion — the background color is also converted back to sRGB and passed in
    const bgColor = () => new T.Color(getComputedStyle(el).getPropertyValue("--kf-bg").trim() || 0x171717).convertLinearToSRGB();
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2));
    const scene = new T.Scene();
    scene.add(quad);
    const rt = (w, h) => new T.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), { depthBuffer: false, type: T.HalfFloatType });
    let W = 1, H = 1, sharpRT = rt(1, 1), blurA = rt(1, 1), blurB = rt(1, 1), trailA = rt(1, 1), trailB = rt(1, 1);
    const blank = new T.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;
    const slot = () => ({ tex: blank, el: null, ratio: 1 });
    let from = slot(), to = slot();
    const U = {
      uTime: { value: 0 }, uAsp: { value: new T.Vector2(1, 1) }, uDst: { value: 1 },
      uA: { value: blank }, uB: { value: blank }, uRA: { value: 1 }, uRB: { value: 1 }, uMix: { value: 1 }, uAberr: { value: aberr },
      uTrail: { value: blank }, uSharp: { value: blank }, uBlur: { value: blank }, uBg: { value: bgColor() }, uVeil: { value: veil },
      uUnblur: { value: 0 }, uReblur: { value: 0 }, uHasTrail: { value: trailOn ? 1 : 0 },
    };
    // 1) Blend two sources in a wavy circle (color bleeding at the edge) and load the brush stroke into alpha
    const compose = new T.ShaderMaterial({
      uniforms: U, vertexShader: VERT,
      fragmentShader: `varying vec2 vUv; uniform vec2 uAsp; uniform float uDst, uRA, uRB, uMix, uAberr, uHasTrail; uniform sampler2D uA, uB, uTrail; ${WAVE} ${COVER}
        vec3 pick(vec2 uv, bool toB){ return toB ? texture2D(uB, cover(uv, uRB, uDst)).rgb : texture2D(uA, cover(uv, uRA, uDst)).rgb; }
        vec3 aberr(vec2 uv, vec2 s, bool toB){ return vec3(pick(uv + s, toB).r, pick(uv, toB).g, pick(uv - s, toB).b); }
        void main(){
          vec3 c;
          if (uMix >= 1.0) c = pick(vUv, true);
          else {
            vec4 w = wave(uMix, uAsp, vUv); vec4 r = ripple(w, uAsp, vUv, 1.0); vec2 s = r.zw * uAberr;
            c = mix(aberr(vUv - r.xy, s, false), aberr(vUv + r.xy, s, true), w.x);
          }
          float m = uHasTrail > 0.5 ? smoothstep(0.0, 0.8, texture2D(uTrail, vUv).r) : 0.0;
          gl_FragColor = vec4(c, m);
        }`,
    });
    // 2) Two Gaussian blurs (horizontal · vertical) — taps 3+2σ, standard deviation = Tab/3
    const taps = Math.max(1, Math.round(3 + 2 * sigma));
    const weights = (() => { const n = taps / 3; const w = [1]; let s = 1; for (let i = 1; i < taps; i++) { const v = Math.exp((-0.5 * i * i) / (n * n)); w.push(v); s += 2 * v; } return w.map((v) => v / s); })();
    const blurMat = (dir) => new T.ShaderMaterial({
      uniforms: { uSrc: { value: blank }, uInv: { value: new T.Vector2(1, 1) }, uDir: { value: new T.Vector2(...dir) } }, vertexShader: VERT,
      fragmentShader: `varying vec2 vUv; uniform sampler2D uSrc; uniform vec2 uInv, uDir; const int N = ${taps}; uniform float uW[${taps}];
        void main(){ vec4 c = texture2D(uSrc, vUv) * uW[0]; for (int i = 1; i < N; i++){ vec2 o = uDir * uInv * float(i); c += (texture2D(uSrc, vUv + o) + texture2D(uSrc, vUv - o)) * uW[i]; } gl_FragColor = c; }`,
    });
    const blurH = blurMat([1, 0]), blurV = blurMat([0, 1]);
    blurH.uniforms.uW = { value: weights }; blurV.uniforms.uW = { value: weights };
    // 3) Brush stroke — subtract dt/1 from the previous panel, and paint the segment previous cursor → current cursor at width w (inner 40% solid)
    const T_ = { uPrev: { value: blank }, uFrom: { value: new T.Vector2(0.5, 0.5) }, uTo: { value: new T.Vector2(0.5, 0.5) }, uW: { value: 1e-4 }, uS: { value: 0 }, uFade: { value: 0 }, uAspect: { value: 1 } };
    const paint = new T.ShaderMaterial({
      uniforms: T_, vertexShader: VERT,
      fragmentShader: `varying vec2 vUv; uniform sampler2D uPrev; uniform vec2 uFrom, uTo; uniform float uW, uS, uFade, uAspect;
        void main(){ vec2 e = vec2(uAspect, 1.0); vec2 t = (vUv - uFrom) * e, n = (uTo - uFrom) * e;
          float r = clamp(dot(t, n) / max(dot(n, n), 1e-6), 0.0, 1.0); float d = length(t - n * r);
          float a = (1.0 - smoothstep(uW * 0.4, uW, d)) * uS;
          gl_FragColor = vec4(max(texture2D(uPrev, vUv).r - uFade, a), 0.0, 0.0, 1.0); }`,
    });
    // 4) Over the blurred panel, a sharp panel is laid on by the brush stroke and focus ring, with the stroke edges slightly refracted, then the background color curtain is covered over it
    const final = new T.ShaderMaterial({
      uniforms: U, vertexShader: VERT,
      fragmentShader: `varying vec2 vUv; uniform vec2 uAsp; uniform sampler2D uSharp, uBlur; uniform vec3 uBg; uniform float uVeil, uUnblur, uReblur; ${WAVE}
        void main(){
          vec4 wu = wave(uUnblur, uAsp, vUv), wr = wave(uReblur, uAsp, vUv);
          vec2 off = ripple(wr, uAsp, vUv, 1.0).xy - ripple(wu, uAsp, vUv, 1.0).xy;
          vec3 blurred = texture2D(uBlur, vUv + off).rgb;
          float a = texture2D(uSharp, vUv).a; vec2 px = vec2(0.01, 0.0) / uAsp, py = vec2(0.0, 0.01);
          vec2 g = vec2(texture2D(uSharp, vUv + px).a - texture2D(uSharp, vUv - px).a, texture2D(uSharp, vUv + py).a - texture2D(uSharp, vUv - py).a);
          vec2 n = g / max(length(g), 0.05) / uAsp; float edge = pow(1.0 - a, 2.0) * smoothstep(0.0, 0.05, a) * 0.03 + a * (1.0 - a) * 4.0 * 0.015;
          vec3 sharp = texture2D(uSharp, vUv - off + n * edge).rgb;
          float ring = max(1.0 - wu.x, wr.x);
          float s = max(a, 1.0 - ring);
          vec3 c = mix(blurred, sharp, s);
          gl_FragColor = vec4(mix(c, uBg, uVeil), 1.0);
        }`,
    });

    const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(scene, cam); };
    const size = () => {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      renderer.setSize(W, H, false);
      const pr = renderer.getPixelRatio();
      sharpRT.setSize(W * pr, H * pr);
      blurA.setSize(Math.max(1, Math.round(W * 0.4)), Math.max(1, Math.round(H * 0.4)));
      blurB.setSize(Math.max(1, Math.round(W * 0.4)), Math.max(1, Math.round(H * 0.4)));
      trailA.setSize(Math.max(1, Math.round(W * 0.5)), Math.max(1, Math.round(H * 0.5)));
      trailB.setSize(Math.max(1, Math.round(W * 0.5)), Math.max(1, Math.round(H * 0.5)));
      U.uAsp.value.set(W / H, 1); U.uDst.value = W / H; T_.uAspect.value = W / H;
      blurH.uniforms.uInv.value.set(1 / blurA.width, 1 / blurA.height); blurV.uniforms.uInv.value.copy(blurH.uniforms.uInv.value);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    // Source swap
    const texOf = (src) => {
      if (!src) return blank;
      const t = src.tagName === "VIDEO" ? new T.VideoTexture(src) : src.tagName === "CANVAS" ? new T.CanvasTexture(src) : new T.Texture(src);
      t.minFilter = T.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
      return t;
    };
    const ratioOf = (s) => (s ? (s.videoWidth || s.naturalWidth || s.width || 16) / (s.videoHeight || s.naturalHeight || s.height || 9) : 1);
    let swap = null, focus = null;
    const setSource = (src, instant) => {
      if (src === to.el) return;
      if (from.tex !== blank && from.tex !== to.tex) from.tex.dispose();
      from = to;
      to = { el: src, tex: texOf(src), ratio: ratioOf(src) };
      U.uA.value = from.tex; U.uRA.value = from.ratio; U.uB.value = to.tex; U.uRB.value = to.ratio;
      swap && swap.kill(); focus && focus.kill();
      if (instant || reduce || from.el == null) { U.uMix.value = 1; return; }
      U.uMix.value = 0;
      swap = gsap.to(U.uMix, { value: 1, duration: dur, ease: "power1.inOut" });
      U.uReblur.value = 0;
      focus = gsap.timeline({ onComplete: () => { U.uUnblur.value = 0; U.uReblur.value = 0; } })
        .fromTo(U.uUnblur, { value: 0 }, { value: 1, duration: dur - 0.05, ease: "power1.inOut" })
        .fromTo(U.uReblur, { value: 0 }, { value: 1, duration: dur, ease: "power1.inOut" }, 0.05);
    };
    const onSource = (e) => setSource(e.detail && e.detail.el, e.detail && e.detail.instant);
    el.addEventListener("fx:source", onSource);
    if (options.source) setSource(document.querySelector(options.source), true);

    // Cursor: a dot follows with .4s power3, the brush thins to .6x at high speed, and it appears and disappears over .5s when stopped and over 1s when moving
    const mouse = { x: 0.5, y: 0.5 }, vel = new T.Vector2(), delta = new T.Vector2();
    const qx = gsap.quickTo(mouse, "x", { duration: 0.4, ease: "power3" }), qy = gsap.quickTo(mouse, "y", { duration: 0.4, ease: "power3" });
    let tracking = false, brush = 0.2, presence = 0;
    const move = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight;
      if (tracking) { qx(x); qy(y); } else { qx(x, x); qy(y, y); T_.uTo.value.set(x, y); tracking = true; }
    };
    const leave = () => { tracking = false; };
    if (trailOn) { addEventListener("pointermove", move); document.documentElement.addEventListener("pointerleave", leave); }

    let last = performance.now(), raf = 0, visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(el);
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.max(0.001, Math.min(0.1, (now - last) / 1000));
      last = now;
      if (!visible) return;
      U.uTime.value = now / 1000;
      [from, to].forEach((s) => { if (s.el && s.el.tagName === "CANVAS") s.tex.needsUpdate = true; });
      if (trailOn) {
        delta.set(mouse.x - T_.uTo.value.x, mouse.y - T_.uTo.value.y).divideScalar(dt).clampLength(0, 0.65);
        vel.lerp(delta, 1 - Math.exp(-dt * 8));
        const k = Math.min(vel.length() / 0.65, 1);
        brush += (0.2 * (1 + (0.6 - 1) * k) - brush) * (1 - Math.exp(-dt * 4));
        const moving = tracking && delta.length() > 0.02;
        presence += ((moving ? 1 : 0) - presence) * (1 - Math.exp(-dt * (moving ? 3 / 0.5 : 3 / 1)));
        T_.uFrom.value.copy(T_.uTo.value); T_.uTo.value.set(mouse.x, mouse.y);
        T_.uW.value = Math.max(brush * presence, 1e-4); T_.uS.value = moving ? 1 : 0; T_.uFade.value = dt / 1;
        T_.uPrev.value = trailA.texture;
        pass(paint, trailB);
        [trailA, trailB] = [trailB, trailA];
        U.uTrail.value = trailA.texture;
      }
      pass(compose, sharpRT);
      blurH.uniforms.uSrc.value = sharpRT.texture; pass(blurH, blurA);
      blurV.uniforms.uSrc.value = blurA.texture; pass(blurV, blurB);
      U.uSharp.value = sharpRT.texture; U.uBlur.value = blurB.texture;
      pass(final, null);
    };
    // Shaders are all baked before the first frame — baking on the first cursor move would freeze the screen
    [compose, blurH, blurV, paint, final].forEach((m) => { quad.material = m; renderer.compile(scene, cam); });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("fx:source", onSource);
      removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave);
      swap && swap.kill(); focus && focus.kill(); gsap.killTweensOf(mouse);
      [sharpRT, blurA, blurB, trailA, trailB].forEach((r) => r.dispose());
      [compose, blurH, blurV, paint, final].forEach((m) => m.dispose());
      [from, to].forEach((s) => s.tex !== blank && s.tex.dispose());
      renderer.dispose(); canvas.remove();
    };
  });
})();
