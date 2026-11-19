// Home only. Original values:
// First copy — words y8 and transparent → .75s power2.out (word stagger min(.03, .9/n)), fades out after 1.3s with .45s power2.in (stagger total .25), after three comes the closing two lines, title transparent .6
// Clouds — fbm 6 layers (rotation matrix 1.6,1.2,−1.2,1.6 · halved), time .03, two layers (2.6·5.5x), coverage smoothstep(0,.55, cloud + progress×1.9 − 1), fully covered once progress passes .72
//  Bathroom — five cells every 72° around a cylinder, one step .75s power2.out, the field of view widens and returns in between, text swap .32s
//  Wrap-up — photo yPercent −20→0 (top bottom→top top), the two-word section at 30% moves ∓15% from 80% of screen in .8s power2.out
(() => {
  const { reduced } = window.FL;
  const T = window.THREE;

  /* Hero phrase cycle */
  const title = document.querySelector(".fl-intro__title");
  const wrapWords = (el) => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" "); return [...el.querySelectorAll(".w")]; };
  const stat = wrapWords(title.querySelector(".fl-intro__static"));
  const phrases = [...title.querySelectorAll(".fl-intro__phrase")];
  const pw = phrases.map(wrapWords);
  const final = title.querySelector(".fl-intro__final"), fw = [...final.children];
  const group = title.querySelector(".fl-intro__group");
  if (reduced) { group.style.opacity = "0"; final.style.opacity = "1"; }
  else {
    const IN = { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" };
    gsap.set([...stat, ...pw.flat(), ...fw], { opacity: 0, y: 8 });
    const show = (i) => {
      const words = i === 0 ? [...stat, ...pw[i]] : pw[i], last = i === phrases.length - 1;
      gsap.set(phrases[i], { opacity: 1 });
      const tl = gsap.timeline();
      tl.to(words, { ...IN, stagger: Math.min(0.03, 0.9 / words.length) }, 0);
      tl.to(last ? [...stat, ...pw[i]] : pw[i], { opacity: 0, y: 8, duration: 0.45, stagger: { amount: 0.25 }, ease: "power2.in" }, 1.3)
        .call(() => {
          gsap.set(phrases[i], { opacity: 0 });
          if (!last) return show(i + 1);
          gsap.set(group, { opacity: 0 }); gsap.set(final, { opacity: 1 });
          gsap.to(fw, { ...IN, stagger: Math.min(0.03, 0.9 / fw.length) });
        });
    };
    gsap.delayedCall(0.25, () => show(0));
  }

  /* Clouds — our fbm shader */
  const cloud = document.querySelector(".fl-cloud");
  let setCloud = () => {};
  const gl = !reduced && cloud.getContext("webgl", { premultipliedAlpha: true, alpha: true });
  if (gl) {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a; varying vec2 v; void main(){ v = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision highp float; varying vec2 v; uniform float uT, uP; uniform vec2 uR; uniform vec3 uLo, uHi;
      float h(vec2 p){ p = fract(p * vec2(97.13, 371.77)); p += dot(p, p + 31.7); return fract(p.x * p.y); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6. - 15.) + 10.); return mix(mix(h(i), h(i + vec2(1., 0.)), u.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), u.x), u.y); }
      float fbm(vec2 p){ float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++) { s += a * n(p); p = m * p; a *= .5; } return s; }
      void main(){ vec2 p = vec2((v.x - .5) * uR.x / max(uR.y, 1.), v.y - .5); p *= mix(1.35, .92, uP); float t = uT * .03;
        float c = (fbm(p * 2.6 + vec2(t, t * .4)) + .35 * fbm(p * 5.5 - vec2(t * 1.3, t * .7))) / 1.35;
        float d = max(smoothstep(0., .55, c + uP * 1.9 - 1.), smoothstep(.72, 1., uP));
        gl_FragColor = vec4(mix(uLo, uHi, d) * d, d); }`));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(pr, k);
    const rgb = (v) => { const i = document.createElement("i"); i.style.color = `var(${v})`; document.body.append(i); const c = document.createElement("canvas").getContext("2d"); c.fillStyle = getComputedStyle(i).color; c.fillRect(0, 0, 1, 1); i.remove(); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3).map((x) => x / 255); };
    gl.uniform3fv(U("uLo"), rgb("--kf-accent-soft")); gl.uniform3fv(U("uHi"), rgb("--kf-contrast-bg"));
    let p = 0, raf = 0;
    const size = () => { const d = Math.min(devicePixelRatio, 1); cloud.width = innerWidth * d; cloud.height = innerHeight * d; gl.viewport(0, 0, cloud.width, cloud.height); gl.uniform2f(U("uR"), cloud.width, cloud.height); };
    size(); addEventListener("resize", size);
    const draw = (now) => { raf = 0; gl.uniform1f(U("uT"), now / 1000); gl.uniform1f(U("uP"), p); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); if (p > 0.001) raf = requestAnimationFrame(draw); };
    setCloud = (v) => { p = v; cloud.style.visibility = v > 0.001 ? "visible" : "hidden"; if (v > 0.001 && !raf) raf = requestAnimationFrame(draw); if (v <= 0.001) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } };
    setCloud(0);
  }
  // Clouds fill in over 45~85% of the back of the hero and clear in the first 12% of the bathroom section. The hero is hidden while fully covered
  const pin = document.querySelector(".fl-intro__pin");
  if (!reduced) {
    let up = 0, down = 0;
    const apply = () => { const v = Math.max(0, up - down); setCloud(v); pin.style.visibility = down > 0.5 ? "hidden" : "visible"; };
    ScrollTrigger.create({ trigger: ".fl-intro", start: "top top", end: "bottom top", onUpdate: (s) => { up = gsap.utils.clamp(0, 1, (s.progress - 0.45) / 0.4); apply(); } });
    ScrollTrigger.create({ trigger: ".fl-rooms", start: "top top", end: "12% top", onUpdate: (s) => { down = s.progress; apply(); } });
  }

  /* Bathroom cylinder */
  const ROOMS = [1, 2, 3, 4, 5].map((n) => ({ name: ["The One", "The Two", "The Three", "The Four", "The Five"][n - 1], color: `--site-room-${n}` }));
  const nameEl = document.querySelector("[data-room-name]"), tagsEl = document.querySelector("[data-room-tags]"), descEl = document.querySelector("[data-room-desc]");
  const dots = [...document.querySelectorAll(".fl-rooms__dots li")];
  const canvas = document.querySelector(".fl-rooms__gl");
  const view = { angle: 0, fov: 34 };
  let render = () => {};
  if (T) {
    const r = new T.WebGLRenderer({ canvas, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    r.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(34, 1, 0.1, 60);
    const probe = document.createElement("i"); document.body.append(probe);
    const pc = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const col = (v) => { probe.style.color = `var(${v})`; pc.fillStyle = getComputedStyle(probe).color; pc.fillRect(0, 0, 1, 1); const d = pc.getImageData(0, 0, 1, 1).data; return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255); };
    scene.background = col("--kf-bg");
    scene.add(new T.HemisphereLight(col("--kf-ink"), col("--kf-surface"), 0.9));
    const key = new T.PointLight(col("--kf-accent-soft"), 40, 20); key.position.set(0, 3.2, -3); scene.add(key);
    cam.position.set(0, 1.3, 0); cam.lookAt(0, 1.2, -7);
    const ring = new T.Group(); scene.add(ring);
    const R = 7, SWEEP = (Math.PI * 2) / ROOMS.length;
    const stone = new T.MeshStandardMaterial({ color: col("--site-stone"), roughness: 0.95, side: T.BackSide });
    ROOMS.forEach((room, i) => {
      const g = new T.Group(); g.rotation.y = -i * SWEEP; ring.add(g);
      const inner = new T.Group(); inner.position.z = -R; g.add(inner);
      const c = col(room.color);
      const shell = new T.Mesh(new T.BoxGeometry(9, 5.4, 4.2), stone.clone()); shell.material.color.lerp(c, 0.25); shell.position.set(0, 1.8, -1.2); inner.add(shell);
      // Sky beyond the arch window — our shader (lower room color → upper bright light)
      const sky = new T.Mesh(new T.PlaneGeometry(5.2, 3), new T.ShaderMaterial({ uniforms: { uC: { value: c }, uT: { value: 0 } }, vertexShader: "varying vec2 v; void main(){ v = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }", fragmentShader: "uniform vec3 uC; uniform float uT; varying vec2 v; void main(){ float a = smoothstep(.0,.9,v.y); vec3 c = mix(uC * 1.25, mix(uC, vec3(1.), .55), a); float sun = smoothstep(.22,.0,length(v - vec2(.62,.32))); c += sun * .35; float arch = step(length(vec2((v.x-.5)*1.7, max(v.y-.55,0.)*1.6)), .85); gl_FragColor = vec4(c * arch + (1.-arch) * uC * .3, 1.); }" }));
      sky.position.set(0, 2.2, -3.25); inner.add(sky);
      const strip = new T.Mesh(new T.BoxGeometry(5.6, 0.05, 0.05), new T.MeshBasicMaterial({ color: c.clone().lerp(new T.Color(1, 1, 1), 0.6) })); strip.position.set(0, 3.8, -3.1); inner.add(strip);
      const floor = new T.Mesh(new T.CircleGeometry(3.6, 40), new T.MeshStandardMaterial({ color: c.clone().multiplyScalar(0.35), roughness: 0.3, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.3, -1); inner.add(floor);
      const tub = new T.Mesh(new T.CylinderGeometry(0.75, 0.6, 0.8, 32, 1, false, 0, Math.PI), new T.MeshStandardMaterial({ color: col("--kf-surface"), roughness: 0.4, side: T.DoubleSide })); tub.rotation.set(0, Math.PI / 2, 0); tub.position.set(2.2, 0.1, -1.8); inner.add(tub);
      const leaf = new T.MeshStandardMaterial({ color: col("--site-room-2"), roughness: 0.8 });
      for (let k = 0; k < 7; k++) { const l = new T.Mesh(new T.ConeGeometry(0.06, 1.3, 4), leaf); l.position.set(-2.4 + Math.sin(k) * 0.1, 0.6, -2.2); l.rotation.set(Math.cos(k * 1.7) * 0.6, 0, Math.sin(k * 1.3) * 0.7); inner.add(l); }
      const pot = new T.Mesh(new T.CylinderGeometry(0.28, 0.22, 0.5, 20), new T.MeshStandardMaterial({ color: col("--site-stone"), roughness: 0.9 })); pot.position.set(-2.4, -0.05, -2.2); inner.add(pot);
    });
    // Bottle — flat round body + black cap, the label’s top band takes the current room color
    const bottle = new T.Group(); bottle.position.set(0, 0.75, -6.4); scene.add(bottle);
    const labelMat = new T.ShaderMaterial({ uniforms: { uC: { value: col(ROOMS[0].color) }, uW: { value: col("--kf-contrast-bg") } }, vertexShader: "varying vec2 v; varying vec3 n; void main(){ v = uv; n = normalMatrix * normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }", fragmentShader: "uniform vec3 uC, uW; varying vec2 v; varying vec3 n; void main(){ vec3 c = mix(uW, uC, smoothstep(.55,.85,v.y)); float l = .55 + .45 * max(dot(normalize(n), normalize(vec3(-.4,.6,.8))), 0.); gl_FragColor = vec4(c * l, 1.); }" });
    const body = new T.Mesh(new T.CapsuleGeometry(0.34, 1.0, 8, 24), labelMat); body.scale.set(1.25, 1, 0.55); bottle.add(body);
    const cap = new T.Mesh(new T.CylinderGeometry(0.16, 0.18, 0.28, 24), new T.MeshStandardMaterial({ color: col("--kf-bg"), roughness: 0.3 })); cap.position.y = 0.95; bottle.add(cap);
    const fit = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(fit).observe(canvas); fit();
    r.compile(scene, cam);
    let seen = false;
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(canvas);
    let t = 0, last = performance.now();
    render = () => { ring.rotation.y = view.angle; cam.fov = view.fov; cam.updateProjectionMatrix(); r.render(scene, cam); };
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(Math.max(1, now - last) / 1000, 0.05); last = now;
      if (!seen) return;
      t += dt; bottle.rotation.y = Math.sin(t * 0.6) * 0.25 + view.spin; bottle.position.y = 0.75 + Math.sin(t * 1.1) * 0.03;
      render();
    });
    view.spin = 0;
    view.label = (i) => gsap.to(labelMat.uniforms.uC.value, { ...(() => { const c = col(ROOMS[i].color); return { r: c.r, g: c.g, b: c.b }; })(), duration: 0.75, ease: "power2.out" });
  }
  let step = 0;
  const swap = (i) => {
    const parts = [nameEl, tagsEl, descEl];
    parts.forEach((p) => p.classList.add("is-swap"));
    setTimeout(() => { nameEl.textContent = ROOMS[i].name; parts.forEach((p) => p.classList.remove("is-swap")); }, reduced ? 0 : 320);
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
  };
  const go = (i) => {
    if (i === step) return;
    const dir = Math.sign(i - step);
    step = i;
    const target = i * ((Math.PI * 2) / ROOMS.length);
    if (reduced) { view.angle = target; render(); } else {
      gsap.to(view, { angle: target, duration: 0.75, ease: "power2.out", overwrite: "auto" });
      gsap.timeline().to(view, { fov: 40, duration: 0.3, ease: "power2.out" }).to(view, { fov: 34, duration: 0.45, ease: "power2.inOut" });
      gsap.fromTo(view, { spin: 0 }, { spin: dir * Math.PI * 2, duration: 0.75, ease: "power2.out", onComplete: () => (view.spin = 0) });
    }
    view.label?.(i);
    swap(i);
  };
  ScrollTrigger.create({ trigger: ".fl-rooms", start: "top top", end: "bottom bottom", onUpdate: (s) => go(Math.min(ROOMS.length - 1, Math.floor(s.progress * ROOMS.length))) });

  /* Closing Section */
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".fl-embrace__img", { yPercent: -20 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".fl-embrace", start: "top bottom", end: "top top", scrub: true } });
    const [a, b] = document.querySelectorAll(".fl-embrace__w");
    gsap.timeline({ scrollTrigger: { trigger: ".fl-embrace", start: "30% 80%", once: true } }).to(a, { xPercent: -15, duration: 0.8, ease: "power2.out" }, 0).to(b, { xPercent: 15, duration: 0.8, ease: "power2.out" }, 0);
  });
  // The two closing words are fixed to the screen, so they are hidden outside the closing section
  const capE = document.querySelector(".fl-embrace__cap");
  ScrollTrigger.create({ trigger: ".fl-embrace", start: "top bottom", end: "bottom top", onToggle: (s) => (capE.style.visibility = s.isActive ? "visible" : "hidden") });
  capE.style.visibility = "hidden";
})();
