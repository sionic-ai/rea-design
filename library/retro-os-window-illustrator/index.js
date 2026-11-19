// Home: hero image reveal (covering curtain .6s power4.out) · four lens windows (.8x→1 .12s, stagger .15s) · white 3D mascot physics · CRT work sorting screen · profile photo window pile.
// The CRT effect was rewritten in our own shader from the original effect list (RGB .002 offset · block noise · jitter · a band moving down every 5 seconds · tracking-line bending · particles · scanlines sin(y·800) · green tracking line · vignette).
(() => {
  const IC = window.IC;
  const T = window.THREE;

  // Artwork slot — our SVG silhouette of the same position and size (full-body figure with pigtails). A slot to swap in the real artwork image
  const FIGURE = `<svg viewBox="0 0 400 760" preserveAspectRatio="xMidYMid meet" fill="none" style="stroke:var(--kf-ink)" stroke-width="3" stroke-linejoin="round">
    <path d="M150 140c-60 40-90 160-70 300 10 70 0 140-30 200 40-20 70-90 75-170" style="fill:var(--kf-accent-soft)"/>
    <path d="M250 140c60 40 90 160 70 300-10 70 0 140 30 200-40-20-70-90-75-170" style="fill:var(--kf-accent-soft)"/>
    <circle cx="200" cy="140" r="78" style="fill:var(--kf-surface)"/>
    <path d="M122 130c10-60 50-90 78-90s70 25 80 90c-30-30-60-40-80-40s-55 10-78 40z" style="fill:var(--kf-accent-soft)"/>
    <circle cx="172" cy="150" r="12" style="fill:var(--site-holo-2)"/><circle cx="228" cy="150" r="12" style="fill:var(--site-holo-2)"/>
    <path d="M150 230h100l20 170H130z" style="fill:var(--site-figure)"/>
    <path d="M150 240 60 330l-10 60 60-20 50-80zM250 240l90 90 10 60-60-20-50-80z" style="fill:var(--site-figure)"/>
    <path d="M130 400h140l30 90H100z" style="fill:var(--site-figure)"/>
    <path d="M150 490v200l-20 40h50l5-240M250 490v200l20 40h-50l-5-240" style="fill:var(--site-holo-2)"/>
  </svg>`;
  IC.FIGURE = FIGURE;

  // CRT slot art: two per category. Text notes say what goes in each slot
  const artTexture = (cat, n) => {
    const c = document.createElement("canvas"); c.width = c.height = 768;
    const g = c.getContext("2d");
    const fam = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const col = (v) => `rgb(${IC.rgb(v).map((x) => Math.round(x * 255)).join(",")})`;
    g.fillStyle = col("--kf-contrast-bg"); g.fillRect(0, 0, 768, 768);
    const grad = g.createLinearGradient(0, 0, 768, 768);
    grad.addColorStop(0, col(n ? "--site-holo-2" : "--site-holo-1")); grad.addColorStop(1, col(n ? "--site-holo-3" : "--site-holo-2"));
    g.fillStyle = grad;
    g.beginPath(); g.arc(384 + (n ? 120 : -80), 360, 300 - cat * 30, 0, Math.PI * 2); g.fill();
    g.strokeStyle = col("--kf-contrast-ink"); g.lineWidth = 6;
    g.beginPath(); g.arc(384, 300, 110, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(240, 768); g.quadraticCurveTo(384, 380, 528, 768); g.stroke();
    g.fillStyle = col("--kf-contrast-ink"); g.font = `28px ${fam("--kf-font-mono")}`;
    g.fillText(`category_0${cat + 1} / image_0${n + 1}`, 40, 60);
    g.font = `24px ${fam("--kf-font-body-ko")}`;
    g.fillText(["Person close-up illustration · square", "Illustration scene for video · square", "Event booth and exhibition site photo · square"][cat], 40, 720);
    const t = new T.CanvasTexture(c); t.colorSpace = T.NoColorSpace; t.generateMipmaps = false; t.minFilter = T.LinearFilter; return t;
  };
  const blockTexture = () => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const img = g.createImageData(128, 128);
    for (let i = 0; i < 90; i++) {
      const x = (Math.random() * 128) | 0, y = (Math.random() * 128) | 0, w = (4 + Math.random() * 40) | 0, h = (1 + Math.random() * 6) | 0;
      const r = Math.random() * 255, gg = Math.random() * 255;
      for (let yy = y; yy < Math.min(128, y + h); yy++) for (let xx = x; xx < Math.min(128, x + w); xx++) { const k = (yy * 128 + xx) * 4; img.data[k] = r; img.data[k + 1] = gg; img.data[k + 2] = 0; img.data[k + 3] = 255; }
    }
    g.putImageData(img, 0, 0);
    const t = new T.CanvasTexture(c); t.magFilter = T.NearestFilter; t.minFilter = T.NearestFilter; t.colorSpace = T.NoColorSpace; return t;
  };
  const CRT_VS = "uniform vec2 uOffset; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy + uOffset, 0.0, 1.0); }";
  const CRT_FS = `
precision highp float;
uniform float uTime; uniform float uShake; uniform float uProg; uniform float uDpr; uniform float uAspect; uniform float uTexAspect;
uniform sampler2D uTex; uniform sampler2D uBlock; uniform vec3 uScan; uniform vec3 uBg;
varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0)), u.x), u.y); }
vec3 fit(vec2 uv){
  vec2 s = vec2(max(uAspect / uTexAspect, 1.0), max(uTexAspect / uAspect, 1.0));
  vec2 t = (uv - 0.5) * s + 0.5;
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return uBg;
  return texture2D(uTex, t).rgb;
}
void main(){
  vec2 r = vUv + vec2(0.002, 0.0), g = vUv - vec2(0.002, 0.0), b = vUv - vec2(0.002, 0.0);
  vec3 blk = texture2D(uBlock, vUv).rgb;
  float on = length(blk) * step(vn(vec2(uTime)), 0.5);
  vec2 bo = vec2((blk.r - 0.5) * 0.1, (blk.g - 0.5) * 0.002) * on;
  float sh = (vn(vec2(vUv.y) * sin(uTime * 400.0) * 100.0) - 0.5) * uShake;
  float by = mod(-uTime, 5.0) * 0.5;
  float band = step(by - 0.005, vUv.y) * step(vUv.y, by + 0.005);
  vec2 all = bo + vec2(sh - 0.01 * band, 0.0);
  float sl = smoothstep(uProg - 0.025, uProg, vUv.y) - smoothstep(uProg, uProg + 0.025, vUv.y);
  all.y -= sl * (vUv.y - uProg) * h21(vUv * sin(uTime)) * 3.0;
  vec3 col = vec3(fit(r + all).r, fit(g + all).g, fit(b + all).b);
  vec2 gu = vUv + vn(vUv * 400.0);
  float grain = vn(gu + uTime * h21(gu) * 20.0);
  col += grain * 0.2 * uDpr - 0.1 * uDpr;
  float ln = 0.85 + 0.15 * sin(vUv.y * 800.0);
  col = col * ln + ln * 0.15;
  float gl = smoothstep(uProg - 0.005, uProg, vUv.y) - smoothstep(uProg, uProg + 0.005, vUv.y);
  col += gl * uScan;
  col *= pow(vUv.x * (1.0 - vUv.x) * vUv.y * (1.0 - vUv.y), 0.3) * 2.5;
  gl_FragColor = vec4(col, 1.0);
}`;

  const crt = (scope) => {
    const wrap = scope.querySelector(".ic-service__gl");
    const display = scope.querySelector(".ic-service__display");
    const items = [...scope.querySelectorAll(".ic-service__item")];
    const ids = [...scope.querySelectorAll(".ic-service__id")];
    const steps = [...scope.querySelectorAll(".ic-service__step")];
    const icon = scope.querySelector(".ic-service__icon"), time = scope.querySelector(".ic-service__time");
    const gl = IC.glCanvas(wrap, { alpha: false });
    const scene = new T.Scene(), cam = new T.Camera();
    const block = blockTexture();
    const images = [0, 1, 2].map((c) => [artTexture(c, 0), artTexture(c, 1)]);
    const shown = [0, 0, 0];
    const world = IC.rabbitWorld({ size: gl.size, gravity: true, scale: 1.6, ratios: [...Array(20)].map(() => ({ x: Math.random() - 0.5, y: Math.random() + 0.5 })) });
    world.stop();
    const rt = new T.WebGLRenderTarget(gl.size.width, gl.size.height);
    const planes = [0, 1, 2, 3].map((i) => {
      const m = new T.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }, uShake: { value: 0.002 }, uProg: { value: 0 }, uDpr: { value: Math.min(devicePixelRatio, 2) },
          uAspect: { value: gl.size.width / gl.size.height }, uTexAspect: { value: i === 3 ? gl.size.width / gl.size.height : 1 },
          uTex: { value: i === 3 ? rt.texture : images[i][0] }, uBlock: { value: block }, uOffset: { value: new T.Vector2(0, -2 * i) },
          uScan: { value: new T.Vector3(...IC.rgb("--site-scan")) }, uBg: { value: new T.Vector3(...IC.rgb("--kf-contrast-bg")) },
        },
        vertexShader: CRT_VS, fragmentShader: CRT_FS, depthTest: false, depthWrite: false,
      });
      const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), m); scene.add(mesh); return m;
    });
    let active = false, playing = true, index = 0, cycle = 0;
    const offset = { value: 0 };
    const cycleImage = () => {
      if (!playing || index > 2) return;
      shown[index] = (shown[index] + 1) % images[index].length;
      planes[index].uniforms.uTex.value = images[index][shown[index]];
    };
    const show = (i, done) => {
      active = true; index = i;
      gsap.to(offset, { value: i, duration: 0.3, ease: "power3.inOut", overwrite: true, onUpdate() { const s = 1 - Math.abs(this.progress() - 0.5) * 2; planes.forEach((p) => (p.uniforms.uShake.value = 0.002 + s * 0.25)); }, onComplete: done });
      clearInterval(cycle); cycle = setInterval(cycleImage, 750);
      if (i === 3 && playing) world.start(); else world.stop();
    };
    const stop = () => { active = false; clearInterval(cycle); world.stop(); };
    // Play time — accumulates when paused and continues counting when pressed again
    let t0 = Date.now(), spent = 0;
    const fmt = (ms) => `${new Date(ms).toISOString().slice(11, 19).replace(/:/g, ".")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
    const tick = () => {
      if (playing) time.textContent = fmt(spent + (Date.now() - t0));
      if (!active || !gl.visible) return;
      const now = performance.now() * 0.001;
      planes.forEach((p, i) => { p.uniforms.uTime.value = now; p.uniforms.uOffset.value.y = 2 * (offset.value - i); });
      if (index === 3) { gl.renderer.setRenderTarget(rt); gl.renderer.render(world.scene, world.camera); gl.renderer.setRenderTarget(null); }
      gl.renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    const flash = gsap.timeline({ paused: true }).to(icon, { opacity: 1, duration: 0.1, ease: "power2.out" }).to(icon, { opacity: 0, duration: 1, ease: "power2.out" }, "<+=0.4");
    const toggle = () => {
      if (playing) { spent += Date.now() - t0; playing = false; world.stop(); display.setAttribute("data-status", "paused"); }
      else { t0 = Date.now(); playing = true; if (index === 3 && active) world.start(); display.setAttribute("data-status", "playing"); }
      flash.restart();
    };
    wrap.addEventListener("click", toggle);
    gl.onResize = (s) => { rt.setSize(s.width, s.height); planes.forEach((p, i) => { p.uniforms.uAspect.value = s.width / s.height; if (i === 3) p.uniforms.uTexAspect.value = s.width / s.height; }); world.resize(s); };
    const recolor = () => planes.forEach((p) => { p.uniforms.uScan.value.set(...IC.rgb("--site-scan")); p.uniforms.uBg.value.set(...IC.rgb("--kf-contrast-bg")); });
    addEventListener("ic:theme", recolor);
    const root = document.documentElement;
    const triggers = steps.map((step, V) => ScrollTrigger.create({
      trigger: step, start: "top bottom", end: "bottom bottom", scrub: true,
      onUpdate: ({ progress }) => (planes[V].uniforms.uProg.value = progress),
      onToggle: ({ isActive }) => {
        items.forEach((el, n) => el.setAttribute("data-visible", String(isActive && n <= V)));
        ids.forEach((el, n) => el.setAttribute("data-current", String(isActive && n === V)));
        show(V, () => { if (!isActive) stop(); });
      },
      onEnter: () => V === 0 && root.setAttribute("data-service", "true"),
      onEnterBack: () => V === steps.length - 1 && root.setAttribute("data-service", "true"),
      onLeave: () => V === steps.length - 1 && root.removeAttribute("data-service"),
      onLeaveBack: () => V === 0 && root.removeAttribute("data-service"),
    }));
    return () => {
      triggers.forEach((t) => t.kill()); gsap.ticker.remove(tick); clearInterval(cycle); wrap.removeEventListener("click", toggle);
      removeEventListener("ic:theme", recolor); world.dispose(); rt.dispose(); block.dispose(); images.flat().forEach((t) => t.dispose()); gl.dispose();
      root.removeAttribute("data-service");
    };
  };

  IC.page("index", ({ initial, scope }) => {
    const off = [];
    const kv = scope.querySelector(".ic-kv");
    const main = scope.querySelector(".ic-kv__main"), pc = scope.querySelector(".ic-kv__pc");
    main.insertAdjacentHTML("afterbegin", FIGURE);
    pc.innerHTML = FIGURE;
    const dialogs = [...scope.querySelectorAll(".ic-kv__dialog")];
    dialogs.forEach((d) => {
      const lens = d.querySelector("[data-lens]");
      lens.innerHTML = `<div class="ic-kv__lens-img" data-art>${FIGURE}</div><div class="ic-kv__lens-pc" data-art>${FIGURE}</div>`;
      const upd = IC.lens(d, lens);
      off.push(IC.drag(d, { handle: d.querySelector(".ic-win__head"), group: "kv", onUpdate: upd }));
    });

    // Three white 3D mascots — they float weightless, then get pushed outward on entrance. They shrink away once the hero shows below 90%
    const glWrap = scope.querySelector(".ic-kv__gl");
    let rabbits = null, glc = null, inView = true, appeared = false;
    if (T && window.CANNON) {
      IC.ready.count += 1;
      glc = IC.glCanvas(glWrap);
      rabbits = IC.rabbitWorld({ size: glc.size, ratios: [{ x: -0.2, y: 0.2 }, { x: 0, y: -0.2 }, { x: 0.2, y: 0.2 }] });
      rabbits.hideNow();
      IC.markReady();
      glc.onResize = (s) => rabbits.resize(s, () => { rabbits.hideNow(); if (appeared && inView) { rabbits.appear(); rabbits.push(); } });
      const draw = () => glc.renderer.render(rabbits.scene, rabbits.camera);
      gsap.ticker.add(draw);
      let first = false;
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        inView = e.isIntersecting;
        if (e.intersectionRatio < 0.9) rabbits.disappear();
        else { if (!first) { first = true; return; } rabbits.appear(); rabbits.push(); }
      }), { threshold: 0.9 });
      io.observe(kv);
      const recolor = () => rabbits.recolor();
      addEventListener("ic:theme", recolor);
      off.push(() => { gsap.ticker.remove(draw); io.disconnect(); removeEventListener("ic:theme", recolor); rabbits.dispose(); glc.dispose(); });
    }

    // Intro — a big plane lifts away upward and the image is revealed from below, then windows pop out in turn
    const wide = !matchMedia("(max-width: 1024px)").matches;
    const tl = gsap.timeline({ paused: true });
    if (wide && initial) {
      tl.from(pc, { "--_progress": 0, duration: 0.6, ease: "power4.out" }, ">-=0.2");
      tl.from(main, { "--_progress": 0, duration: 0.6, ease: "power4.out" }, "<+=0.2");
      tl.from(main, { y: 20, duration: 1, ease: "power4.out" }, "<");
    }
    if (!initial) tl.from(main, { y: 20, opacity: 0, duration: 1, ease: "power4.out" });
    const inners = dialogs.filter((d) => getComputedStyle(d).display !== "none").map((d) => d.querySelector(".ic-kv__dialog-inner"));
    tl.from(inners, { opacity: 0, scale: 0.8, duration: 0.12, stagger: 0.15, ease: "power4.out" }, !wide && initial ? "<" : "<+=0.4");
    tl.to({}, { duration: 0.001, onStart: () => { appeared = true; if (rabbits && inView) { rabbits.appear(); rabbits.push(); } } }, ">+=0.1");
    if (IC.reduced) tl.progress(1);
    else if (initial) IC.onOpenEnd(() => tl.play(0));
    else setTimeout(() => tl.play(0), 100);
    off.push(() => tl.kill());

    if (T) off.push(IC.whenNear(scope.querySelector(".ic-service"), () => crt(scope)));

    // Profile photo window stack — two sets of six, popping out in turn at .1s when visible
    const winHTML = (i) => `<div class="ic-profile__win" style="--index:${i}"><div class="ic-profile__win-inner"><div class="ic-win"><div class="ic-win__inner"><div class="ic-win__head"><h2 class="ic-win__title">photo_01.jpg</h2><button class="ic-win__close" type="button" aria-label="Close"><i></i></button></div><div class="ic-win__body"><div class="wf-img" data-label="Artist at work photo · original art on desk · square"></div></div></div></div></div></div>`;
    const stacks = [...scope.querySelectorAll(".ic-profile__stack")];
    stacks.forEach((s) => (s.innerHTML = [0, 1, 2, 3, 4, 5].map(winHTML).join("")));
    const wins = stacks.flatMap((s) => [...s.querySelectorAll(".ic-profile__win")]);
    wins.forEach((w) => {
      off.push(IC.drag(w, { handle: w.querySelector(".ic-win__head"), group: "profile" }));
      const x = w.querySelector(".ic-win__close"), win = w.querySelector(".ic-win");
      const f = () => { win.setAttribute("data-blink", "true"); setTimeout(() => win.removeAttribute("data-blink"), 500); };
      x.addEventListener("click", f);
    });
    const pop = gsap.from(wins.map((w) => w.querySelector(".ic-profile__win-inner")), { opacity: 0, scale: 0.8, duration: 0.12, stagger: 0.1, ease: "power4.out", paused: true });
    if (IC.reduced) pop.progress(1);
    const pio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { pop.play(); pio.unobserve(e.target); } }), { rootMargin: "-30% 0px", threshold: 0.5 });
    if (stacks[0]) pio.observe(stacks[0]);
    off.push(() => { pio.disconnect(); pop.kill(); });

    return () => off.forEach((f) => f());
  });
})();
