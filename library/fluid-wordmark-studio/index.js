// Home page — white panel clearing like fluid, shrinking showreel, WORKS lettering sliding across, showroom video, pushed objects, scattering letters.
(() => {
  // three is used only on the first page — even when arriving from another page it loads once (running three.cjs twice makes global names collide)
  const needThree = () => window.ntNeedThree();

  // Preload the fluid panel as soon as the script loads so it can bake immediately on entering by navigation (the original has it in one bundle)
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) needThree().catch(() => {});

  // ── Fluid mask — makes a white plate (baked image of a wordmark) transparent by the mouse trail. Original values: velocity field 256², dye 512²,
  //    velocity dissipation .962, dye dissipation .988 (.97 toward the end of the scroll), 20 pressure iterations, splat radius 6e-5, force 5900, reveal 3.9 · edge .5~.51
  const SET = { sim: 256, dye: 512, velDiss: 0.962, dyeDiss: 0.988, pressureIt: 20, radius: 6e-5, force: 5900, reveal: 3.9, soft: 0.5, edge: 0.01 };
  const VERT = `varying vec2 vUv, vL, vR, vT, vB; uniform vec2 uTexel;
    void main(){ vUv = uv; vL = vUv - vec2(uTexel.x, 0.); vR = vUv + vec2(uTexel.x, 0.); vT = vUv + vec2(0., uTexel.y); vB = vUv - vec2(0., uTexel.y); gl_Position = vec4(position.xy, 0., 1.); }`;
  const FRAG = {
    splat: `uniform sampler2D uTarget; uniform float uAspect, uRadius; uniform vec3 uColor; uniform vec2 uPoint; varying vec2 vUv;
      void main(){ vec2 p = vUv - uPoint; p.x *= uAspect; vec3 s = exp(-dot(p, p) / uRadius) * uColor; gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.); }`,
    advect: `uniform sampler2D uVelocity, uSource; uniform vec2 uTexel; uniform float uDt, uDiss; varying vec2 vUv;
      void main(){ vec2 c = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel; gl_FragColor = vec4(uDiss * texture2D(uSource, c).xyz, 1.); }`,
    div: `uniform sampler2D uVelocity; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ vec2 C = texture2D(uVelocity, vUv).xy; float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
        if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x; if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
        gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.); }`,
    pressure: `uniform sampler2D uPressure, uDivergence; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * .25, 0., 0., 1.); }`,
    grad: `uniform sampler2D uPressure, uVelocity; varying vec2 vUv, vL, vR, vT, vB;
      void main(){ float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        vec2 v = texture2D(uVelocity, vUv).xy - .5 * vec2(R - L, T - B); gl_FragColor = vec4(v, 0., 1.); }`,
    mask: `uniform sampler2D uBase, uDye; uniform float uReveal, uSoft, uEdge; varying vec2 vUv;
      void main(){ vec4 base = texture2D(uBase, vUv); float m = clamp(smoothstep(uSoft, uSoft + uEdge, texture2D(uDye, vUv).r * uReveal), 0., 1.);
        gl_FragColor = mix(base, vec4(0.), m); }`,
  };

  class FluidMask {
    constructor(T, box, mark, home, reelFull) {
      Object.assign(this, { T, box, mark, home, reelFull });
      this.mouse = { x: 0.5, y: 0.5 }; this.prev = { x: 0.5, y: 0.5 }; this.moved = false; this.visible = true; this.cleaned = false;
      const c = (this.canvas = document.createElement("canvas"));
      c.className = "mask-canvas";
      box.insertBefore(c, home);
      const r = (this.renderer = new T.WebGLRenderer({ canvas: c, antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" }));
      r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      r.setClearColor(0x000000, 0);
      r.autoClear = false;
      this.scene = new T.Scene();
      this.cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const rt = (n, filter) => new T.WebGLRenderTarget(n, n, { minFilter: filter, magFilter: filter, format: T.RGBAFormat, type: T.HalfFloatType, depthBuffer: false, stencilBuffer: false });
      const dbl = (n, f) => ({ read: rt(n, f), write: rt(n, f), swap() { [this.read, this.write] = [this.write, this.read]; } });
      this.vel = dbl(SET.sim, T.LinearFilter);
      this.dye = dbl(SET.dye, T.LinearFilter);
      this.pre = dbl(SET.sim, T.NearestFilter);
      this.divRT = rt(SET.sim, T.NearestFilter);
      const simTexel = new T.Vector2(1 / SET.sim, 1 / SET.sim);
      this.dyeTexel = new T.Vector2(1 / SET.dye, 1 / SET.dye);
      this.simTexel = simTexel;
      const mat = (frag, u) => new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms: { uTexel: { value: simTexel }, ...u }, depthTest: false, depthWrite: false, blending: T.NoBlending });
      this.m = {
        splat: mat(FRAG.splat, { uTarget: { value: null }, uAspect: { value: 1 }, uRadius: { value: SET.radius }, uColor: { value: new T.Vector3() }, uPoint: { value: new T.Vector2() } }),
        advect: mat(FRAG.advect, { uVelocity: { value: null }, uSource: { value: null }, uDt: { value: 1 }, uDiss: { value: SET.velDiss } }),
        div: mat(FRAG.div, { uVelocity: { value: null } }),
        pressure: mat(FRAG.pressure, { uPressure: { value: null }, uDivergence: { value: null } }),
        grad: mat(FRAG.grad, { uPressure: { value: null }, uVelocity: { value: null } }),
        mask: mat(FRAG.mask, { uBase: { value: null }, uDye: { value: null }, uReveal: { value: SET.reveal }, uSoft: { value: SET.soft }, uEdge: { value: SET.edge } }),
      };
      this.quad = new T.Mesh(new T.PlaneGeometry(2, 2), this.m.splat);
      this.scene.add(this.quad);
      this.baseCanvas = document.createElement("canvas");
      this.baseTex = new T.CanvasTexture(this.baseCanvas);
      this.baseTex.colorSpace = T.SRGBColorSpace;
      this.m.mask.uniforms.uBase.value = this.baseTex;
      // Splats are only written when the cursor first moves, and compiling then would freeze the screen — so compile them all when the stage is built
      Object.values(this.m).forEach((mt) => { this.quad.material = mt; r.compile(this.scene, this.cam); });
      this.onMove = (e) => { const p = e.touches ? e.touches[0] : e; if (!p) return; const b = c.getBoundingClientRect(); this.mouse.x = (p.clientX - b.left) / b.width; this.mouse.y = 1 - (p.clientY - b.top) / b.height; this.moved = true; };
      addEventListener("mousemove", this.onMove, { passive: true });
      addEventListener("touchmove", this.onMove, { passive: true });
      let t;
      this.ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => this.resize(), 120); });
      this.ro.observe(box);
      this.io = new IntersectionObserver(([en]) => (this.visible = en.isIntersecting));
      this.io.observe(box);
      this.resize();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
    }
    // Bake the white board + wordmark into one image — text position, size and font are the on-screen text as is
    bake() {
      const b = this.box.getBoundingClientRect();
      const k = Math.min(devicePixelRatio || 1, 2, 4096 / b.height, 4096 / b.width);
      const cv = this.baseCanvas;
      cv.width = Math.round(b.width * k); cv.height = Math.round(b.height * k);
      const ctx = cv.getContext("2d");
      const css = getComputedStyle(document.documentElement);
      ctx.fillStyle = css.getPropertyValue("--kf-bg").trim();
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = getComputedStyle(this.mark).color;
      ctx.textBaseline = "alphabetic";
      [...this.mark.children].forEach((ch) => {
        const cs = getComputedStyle(ch);
        const probe = document.createElement("i");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        ch.append(probe);
        const base = probe.getBoundingClientRect().top;
        probe.remove();
        const r = ch.getBoundingClientRect();
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`;
        ctx.fillText(ch.textContent, (r.left - b.left) * k, (base - b.top) * k);
      });
      this.baseTex.needsUpdate = true;
      this.mark.classList.add("is-baked");
      this.home.classList.add("is-baked");
    }
    resize() {
      const b = this.box.getBoundingClientRect();
      this.size = { w: Math.max(1, b.width), h: Math.max(1, b.height) };
      this.renderer.setSize(this.size.w, this.size.h, false);
      this.mark.classList.remove("is-baked");
      this.bake();
    }
    pass(mat, target) { this.quad.material = mat; this.renderer.setRenderTarget(target); this.renderer.render(this.scene, this.cam); }
    clearFluid() { [this.dye.read, this.dye.write, this.vel.read, this.vel.write, this.pre.read, this.pre.write].forEach((t) => { this.renderer.setRenderTarget(t); this.renderer.clear(); }); this.renderer.setRenderTarget(null); }
    reelFullSize() { const w = this.reelFull?.style.width; if (!w) return true; const m = w.trim().match(/^([\d.]+)%$/); return m ? +m[1] >= 99 : true; }
    draw() { const u = this.m.mask.uniforms; u.uDye.value = this.dye.read.texture; this.renderer.setRenderTarget(null); this.renderer.clear(); this.pass(this.m.mask, null); }
    loop() {
      this.raf = requestAnimationFrame(this.loop);
      if (!this.visible) return;
      // When the showreel starts shrinking, erase the marks and draw only a clean panel
      if (!this.reelFullSize()) { if (!this.cleaned) { this.clearFluid(); this.draw(); this.cleaned = true; } return; }
      if (this.cleaned) { this.cleaned = false; this.prev.x = this.mouse.x; this.prev.y = this.mouse.y; this.moved = false; }
      this.step();
    }
    step() {
      const { m } = this;
      const aspect = this.size.w / this.size.h;
      const b = this.canvas.getBoundingClientRect();
      const n = Math.min(1, Math.max(0, -b.top / (b.height || 1)));
      const i = n * n, s = 1 - i;
      if (this.moved) {
        const dx = this.mouse.x - this.prev.x, dy = this.mouse.y - this.prev.y;
        if (Math.hypot(dx, dy) > 0 && s > 0.001) {
          const u = m.splat.uniforms;
          u.uTarget.value = this.vel.read.texture; u.uAspect.value = aspect; u.uPoint.value.set(this.mouse.x, this.mouse.y);
          u.uColor.value.set(dx * SET.force * s, dy * SET.force * s, 0);
          this.pass(m.splat, this.vel.write); this.vel.swap();
          u.uTarget.value = this.dye.read.texture; u.uColor.value.set(s, s, s);
          this.pass(m.splat, this.dye.write); this.dye.swap();
        }
        this.prev.x = this.mouse.x; this.prev.y = this.mouse.y;
      }
      const a = m.advect.uniforms;
      a.uVelocity.value = this.vel.read.texture; a.uSource.value = this.vel.read.texture; a.uTexel.value = this.simTexel; a.uDiss.value = SET.velDiss;
      this.pass(m.advect, this.vel.write); this.vel.swap();
      a.uVelocity.value = this.vel.read.texture; a.uSource.value = this.dye.read.texture; a.uTexel.value = this.dyeTexel; a.uDiss.value = SET.dyeDiss + (0.97 - SET.dyeDiss) * i;
      this.pass(m.advect, this.dye.write); this.dye.swap();
      m.div.uniforms.uVelocity.value = this.vel.read.texture;
      this.pass(m.div, this.divRT);
      this.renderer.setRenderTarget(this.pre.read); this.renderer.clear();
      m.pressure.uniforms.uDivergence.value = this.divRT.texture;
      for (let k = 0; k < SET.pressureIt; k++) { m.pressure.uniforms.uPressure.value = this.pre.read.texture; this.pass(m.pressure, this.pre.write); this.pre.swap(); }
      m.grad.uniforms.uPressure.value = this.pre.read.texture; m.grad.uniforms.uVelocity.value = this.vel.read.texture;
      this.pass(m.grad, this.vel.write); this.vel.swap();
      this.draw();
    }
    destroy() {
      cancelAnimationFrame(this.raf);
      removeEventListener("mousemove", this.onMove); removeEventListener("touchmove", this.onMove);
      this.ro.disconnect(); this.io.disconnect();
      [this.vel, this.dye, this.pre].forEach((d) => { d.read.dispose(); d.write.dispose(); });
      this.divRT.dispose(); Object.values(this.m).forEach((x) => x.dispose()); this.quad.geometry.dispose(); this.baseTex.dispose(); this.renderer.dispose();
      this.canvas.remove(); this.mark.classList.remove("is-baked"); this.home.classList.remove("is-baked");
    }
  }

  // Plays when on screen, pauses when off screen
  function autoVideos(view, life) {
    const vids = [...view.querySelectorAll(".hero-video video, .reel__full video")];
    vids.forEach((v) => { v.muted = true; v.playsInline = true; });
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play()?.catch(() => {}) : e.target.pause())), { threshold: 0 });
    vids.forEach((x) => io.observe(x));
    life.off(() => io.disconnect());
  }

  // WORKS letters — Flip from the left group to the right cells (1.4s, from the last letter at .2s steps), shrinking to .2 on the way and back, then back again (yoyo). scrub 3
  function worksWord(view, life) {
    const sec = view.querySelector(".works");
    const words = [...sec.querySelectorAll(".works__s1 .works__l")];
    const slots = [...sec.querySelectorAll(".works__s2")];
    if (!words.length || slots.length < words.length) return;
    let st = null, anim = null, home = [];
    const build = () => {
      home = words.map((w) => ({ w, parent: w.parentElement }));
      const state = Flip.getState(words);
      words.forEach((w, i) => slots[i].append(w));
      anim = Flip.from(state, { ease: "power4.inOut", duration: 1.4, stagger: { each: 0.2, from: "end" }, repeat: 1, yoyo: true, paused: true });
      words.forEach((w, i) => {
        const o = (words.length - 1 - i) * 0.1;
        anim.to(w, { scale: 0.2, duration: 0.8, ease: "power4.inOut" }, o);
        anim.to(w, { scale: 1, duration: 0.8, ease: "power4.inOut" }, o + 0.8);
      });
      st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: 3, animation: anim });
    };
    const undo = () => { st?.kill(); anim?.kill(); st = anim = null; home.forEach(({ w, parent }) => { gsap.set(w, { clearProps: "all" }); parent.append(w); }); };
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      build();
      let t;
      const onR = () => { clearTimeout(t); t = setTimeout(() => { undo(); build(); }, 200); };
      addEventListener("resize", onR);
      return () => { removeEventListener("resize", onR); clearTimeout(t); undo(); };
    });
    life.off(() => mm.revert());
  }

  // Showroom — during 100vh pinned to the screen, video 1.4→.35, photo 1.8→1 (scrub 1). Plays on reaching 85%, sound turns on in .35s and fades down over 1.6s
  function musee(view, life) {
    const w = view.querySelector("[data-musee]");
    if (!w) return;
    const box = w.querySelector(".musee__video"), bg = w.querySelector(".musee__bg");
    const vids = [...box.querySelectorAll("video")];
    const sound = w.querySelector("[data-sound]"), toggle = sound.querySelector(".musee__toggle"), tick = sound.querySelector(".musee__tick");
    let on = false, playing = false, fade = null, sync = 0;
    const travel = () => { const a = toggle.getBoundingClientRect(), b = tick.getBoundingClientRect(); return Math.max(0, (a.right - b.right) - (b.left - a.left)); };
    const vol = (up, delay = 0, dur = 1.6) => {
      const v = vids[1];
      fade?.kill();
      if (up) { v.muted = false; v.volume = 0; v.play()?.catch(() => {}); fade = gsap.to(v, { volume: 1, duration: dur, delay, ease: "power1.out" }); }
      else fade = gsap.to(v, { volume: 0, duration: dur, delay, ease: "power1.out", onComplete: () => { v.muted = true; v.volume = 1; } });
    };
    life.on(sound, "click", () => { on = !on; gsap.to(tick, { x: on ? travel() : 0, duration: 0.3, ease: "power2.out" }); vol(on, 0, 0.35); });
    vids.forEach((v) => { v.muted = true; v.pause(); });
    const keep = () => { const t = vids[1].currentTime; if (Math.abs(vids[0].currentTime - t) > 0.08) vids[0].currentTime = t; sync = requestAnimationFrame(keep); };
    const start = () => {
      if (!playing) { playing = true; vids.forEach((v) => v.play()?.catch(() => {})); sync = requestAnimationFrame(keep); gsap.to(sound, { opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power2.out" }); }
      if (on && vids[1].muted) vol(true);
    };
    const leave = () => { if (on) vol(false, 1.4, 1.6); };
    life.off(() => { cancelAnimationFrame(sync); vids.forEach((v) => v.pause()); });
    ScrollTrigger.create({ trigger: w, start: "top 85%", onEnter: start, onEnterBack: start });
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      if (NT.reduce) { gsap.set(box, { scale: 0.35 }); gsap.set(bg, { scale: 1 }); return; }
      gsap.fromTo(box, { scale: 1.4 }, { scale: 0.35, ease: "none", scrollTrigger: { trigger: w, start: "top top", end: "bottom top", pin: w, pinSpacing: true, scrub: 1, invalidateOnRefresh: true, refreshPriority: 1, onEnter: start, onEnterBack: start, onLeave: leave, onLeaveBack: leave } });
      gsap.fromTo(bg, { scale: 1.8 }, { scale: 1, ease: "none", scrollTrigger: { trigger: w, start: "top top", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });
    });
    mm.add("(max-width: 991px)", () => { ScrollTrigger.create({ trigger: w, start: "top top", end: "bottom top", onEnter: start, onEnterBack: start, onLeave: leave, onLeaveBack: leave }); });
    life.off(() => mm.revert());
  }

  // Object push — within radius 460 it pushes by (1−d/R)^1.6 × 380px, rotates 30° and scales up .2 (.45s power4.out), outside it returns with elastic.out(1,.35) in 1.2s
  function formes(view, life) {
    const box = view.querySelector("[data-formes]");
    if (!box) return;
    const map = { "is-papier": 1, "is-gum": 5, "is-candy": 4, "is-star": 2, "is-heart": 0 };
    box.querySelectorAll(".formes__o").forEach((o) => { const k = Object.keys(map).find((c) => o.classList.contains(c)); o.innerHTML = NT.OBJECTS[map[k]].svg; });
    if (NT.reduce) return;
    const objs = [...box.querySelectorAll(".formes__o, .formes__ch")];
    const baseRot = (el) => { if (el.dataset.baseRot === undefined) el.dataset.baseRot = String(parseFloat(getComputedStyle(el).rotate) || 0); return +el.dataset.baseRot; };
    const centre = (el) => { const x = +gsap.getProperty(el, "x") || 0, y = +gsap.getProperty(el, "y") || 0, r = el.getBoundingClientRect(); return { x: r.left + r.width / 2 - x, y: r.top + r.height / 2 - y }; };
    const opts = () => (NT.isMobile() && innerWidth <= 767 ? { R: 260, D: 110, rot: 12, sc: 0.1 } : { R: 460, D: 380, rot: 30, sc: 0.2 });
    objs.forEach((o) => gsap.set(o, { rotation: baseRot(o), rotate: 0 }));
    const push = (mx, my) => {
      const { R, D, rot, sc } = opts();
      objs.forEach((o) => {
        const c = centre(o), d = Math.hypot(mx - c.x, my - c.y), base = baseRot(o);
        if (d < R) {
          const ang = Math.atan2(my - c.y, mx - c.x), f = Math.pow((R - d) / R, 1.6), dist = f * D;
          gsap.to(o, { x: -Math.cos(ang) * dist, y: -Math.sin(ang) * dist, rotation: base - Math.cos(ang) * f * rot, scale: 1 + f * sc, duration: 0.45, ease: "power4.out", overwrite: "auto" });
        } else gsap.to(o, { x: 0, y: 0, rotation: base, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
      });
    };
    const rest = () => objs.forEach((o) => gsap.to(o, { x: 0, y: 0, rotation: baseRot(o), scale: 1, duration: 1.2, ease: "elastic.out(1, 0.35)", overwrite: "auto" }));
    let inside = false;
    const m = { x: innerWidth / 2, y: innerHeight / 2 };
    const at = () => (inside ? m : { x: innerWidth / 2, y: innerHeight / 2 });
    life.on(box, "mousemove", (e) => { inside = true; m.x = e.clientX; m.y = e.clientY; push(m.x, m.y); });
    life.on(box, "mouseleave", () => { inside = false; const p = at(); push(p.x, p.y); });
    ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onUpdate: () => { const p = at(); push(p.x, p.y); }, onLeave: rest, onLeaveBack: rest });
  }

  // Letter scatter — original values: shuffle 22 characters wide every 8 frames, follows at speed/3400 (max .45) and .14, and decays by .9 each step.
  //   Falling: top top → center 30% scrub 2, each character y 40~160 · x ±10 · rotation ±20 · .25~.7s power2.in, each chunk .06 later
  const GLYPHS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ0123456789#$()!?"§&<>@*+-';
  const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  function splitChars(el) {
    const out = [];
    const walk = (n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        for (const ch of n.textContent) {
          if (ch === " " || ch === " " || ch === "\n") f.append(document.createTextNode(ch));
          else { const s = document.createElement("span"); s.style.display = "inline-block"; s.textContent = ch; f.append(s); out.push({ s, o: ch }); }
        }
        n.replaceWith(f);
      } else if (n.nodeType === 1) [...n.childNodes].forEach(walk);
    };
    [...el.childNodes].forEach(walk);
    return out;
  }
  function glitch(view, life) {
    const sec = view.querySelector("[data-glitch]");
    if (!sec) return;
    const blocks = [...sec.querySelectorAll(".glitch__t")];
    const html = blocks.map((b) => b.innerHTML);
    const fin = sec.querySelector(".glitch__final"), finHTML = fin.innerHTML;
    life.off(() => { blocks.forEach((b, i) => (b.innerHTML = html[i])); fin.innerHTML = finHTML; });
    if (NT.reduce) return;
    const groups = blocks.map(splitChars), flat = groups.flat(), most = Math.max(...groups.map((g) => g.length), 1);
    const last = splitChars(fin);
    last.forEach(({ s }) => (s.style.opacity = "0"));
    let amt = 0, vel = 0, pos = 0, raf = 0, run = false, frame = 0, fall = null, prevP = -1;
    const scramble = (g, at, a) => { const n = g.length, i0 = ((Math.floor(at) % n) + n) % n; g.forEach(({ s, o }, k) => { let c = k - i0; if (c < 0) c += n; s.textContent = c < 22 && Math.random() < a * Math.pow(1 - c / 22, 0.6) ? rnd() : o; }); };
    const write = (p) => { const t = p * last.length; last.forEach(({ s, o }, k) => { if (k < t - 4) { s.style.opacity = "1"; s.textContent = o; } else if (k < t) { s.style.opacity = "1"; s.textContent = rnd(); } else { s.style.opacity = "0"; s.textContent = o; } }); };
    const tick = () => {
      if (!run) return;
      frame++; amt += (vel - amt) * 0.14; vel *= 0.9;
      if (frame % 8 === 0) {
        if (amt > 0.01) { pos = (pos + 1 + amt * 10) % most; groups.forEach((g) => scramble(g, pos, amt)); }
        else flat.forEach(({ s, o }) => (s.textContent = o));
        if (last.length && fall) {
          const p = fall.scrollTrigger?.progress ?? 0;
          if (Math.abs(p - prevP) > 2e-4) write(p);
          else { const t = p * last.length; last.forEach(({ s, o }, k) => { s.style.opacity = k < t ? "1" : "0"; s.textContent = o; }); }
          prevP = p;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const go = () => { if (run) return; run = true; frame = 0; raf = requestAnimationFrame(tick); };
    const stop = () => { run = false; vel = amt = 0; cancelAnimationFrame(raf); flat.forEach(({ s, o }) => (s.textContent = o)); last.forEach(({ s, o }) => { s.style.opacity = "0"; s.textContent = o; }); prevP = -1; };
    life.off(stop);
    ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onEnter: go, onLeave: stop, onEnterBack: go, onLeaveBack: stop, onUpdate: (s) => (vel = Math.min(Math.abs(s.getVelocity()) / 3400, 0.45)) });
    fall = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "center 30%", scrub: 2 } });
    groups.forEach((g, i) => g.forEach(({ s }) => fall.to(s, { y: gsap.utils.random(40, 160), x: gsap.utils.random(-10, 10), rotation: gsap.utils.random(-20, 20), opacity: 0, ease: "power2.in", duration: gsap.utils.random(0.25, 0.7) }, i * 0.06 + gsap.utils.random(0, 0.6))));
    gsap.to(sec.querySelector(".glitch__img"), { opacity: 0.3, ease: "none", immediateRender: false, scrollTrigger: { trigger: sec, start: "top top", end: "center center", scrub: 2 } });
    const [a, b] = sec.querySelectorAll(".glitch__pics > div");
    gsap.fromTo(a, { y: 100 }, { y: -300, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: 1.5 } });
    gsap.fromTo(b, { y: 100 }, { y: -800, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: 3 } });
    [[a, -8], [b, 10]].forEach(([box, yp]) => gsap.fromTo(box.firstElementChild, { yPercent: 0 }, { yPercent: yp, ease: "none", scrollTrigger: { trigger: sec, start: "20% top", end: "bottom top", scrub: 3 } }));
  }

  NT.page("home", (view, life) => {
    autoVideos(view, life);
    const reelSec = view.querySelector(".reel"), reelFull = view.querySelector(".reel__full");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(reelFull, { width: "100%", height: "100%" }, { width: "33.3%", height: "35%", ease: "power4.inOut", immediateRender: false, scrollTrigger: { trigger: reelSec, start: "top top", end: "bottom bottom", scrub: 3, invalidateOnRefresh: true } });
    });
    life.off(() => mm.revert());
    worksWord(view, life);
    musee(view, life);
    formes(view, life);
    glitch(view, life);
    // The white panel cover is baked after the text has fully risen (original loader:hero-revealed)
    let fluid = null, dead = false;
    const build = () => {
      if (fluid || dead || NT.reduce) return;
      const box = view.querySelector(".hero-w"), mark = view.querySelector("[data-hero-mark]"), home = view.querySelector(".hero-home");
      needThree().then((T) => NT.fontsReady.then(() => { if (!dead && !fluid) fluid = new FluidMask(T, box, mark, home, reelFull); })).catch(() => {});
    };
    life.on(window, "nt:hero-revealed", build);
    if (view.dataset.heroDone) build();
    life.off(() => { dead = true; fluid?.destroy(); fluid = null; });
  });
  window.addEventListener("nt:hero-revealed", () => document.querySelectorAll('[data-page="home"]').forEach((v) => (v.dataset.heroDone = "1")));
})();
