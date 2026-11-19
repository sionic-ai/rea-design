// Home page: ∞ orbit loader → full-screen video, play button following the cursor, news drag row (Embla dragFree), project photo parallax (.9),
// 3D spiky star (OGL), person photo GL stack (1500ms dissolve that changes from the closest colors first).
(() => {
  const { reduced, mm } = window.CS;
  const nav = document.querySelector(".cs-nav");
  const lang = document.querySelector(".cs-lang");

  // Loader — original (anime.js) values: the last 20% of the 2000ms orbit with 2000ms out(2) (= runs on power1.out),
  // At the last section the video goes from a 200rem rectangle with 20rem corners → full screen with 0 corners over 2000ms inOutExpo, and the photo group shrinks to 0 in the same 2000ms while the orbit rewinds to 80%.
  // Head and title run from 750ms for 1000ms outExpo, play button 1300ms for 500ms, News pills 1500~3500ms.
  const hero = document.querySelector(".hero");
  const sqs = [...hero.querySelectorAll(".hero__sq")];
  const wrap = hero.querySelector(".hero__squares");
  const inners = hero.querySelectorAll(".hero__sqin");
  const player = hero.querySelector(".hero__player");
  const media = hero.querySelector(".hero__media");
  const title = hero.querySelector(".hero__title");
  const play = hero.querySelector(".hero__play");
  const cta = hero.querySelector(".hero__cta");
  const ctaBg = cta.querySelector(".hero__cta-bg"), ctaMedia = cta.querySelector(".hero__cta-media"), ctaText = cta.querySelector(".hero__cta-text");

  const intro = () => {
    const W = innerWidth, Hh = hero.offsetHeight, rem = innerWidth <= 768 ? W / 375 : W / 1512;
    const cx = W / 2, cy = Hh / 2, S = W / 2.5, C = S * 1.2, T = 1 / sqs.length;
    const A = innerWidth <= 768 ? 50 * rem : 200 * rem, R0 = innerWidth <= 768 ? 5 : 20 * rem;
    const orbit = { p: 0, e: 0 };
    const place = () => sqs.forEach((el, n) => {
      const a = (orbit.p * Math.PI * 2 + (n / sqs.length) * Math.PI * 2 + Math.PI / 2) * orbit.e;
      const s = Math.sin(a), k = 1 + s * s;
      el.style.transform = `translate(${cx + (S * Math.cos(a)) / k}px, ${cy + (C * Math.cos(a) * s) / k}px)`;
    });
    const ring = gsap.timeline({ paused: true, onUpdate: place })
      .to(orbit, { p: 1 + T, duration: 2, ease: "none" }, 0)
      .to(orbit, { e: 1, duration: 2, ease: "power1.out" }, 0);
    const box = { w: A, h: A, r: R0 };
    const cover = (w, h) => Math.max(w / 16, (h * 1.2) / 9);
    const clip = () => {
      player.style.clipPath = `inset(${(Hh - box.h) / 2}px ${(W - box.w) / 2}px round ${box.r}px)`;
      media.style.transform = `scale(${cover(box.w, box.h) / cover(W, Hh)})`;
    };
    clip();
    gsap.set(play, { scale: 0, opacity: 0 });
    gsap.set(title, { yPercent: 100, opacity: 0 });
    gsap.set(ctaBg, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(ctaMedia, { scale: 0, opacity: 0 });
    gsap.set(ctaText, { y: 50, opacity: 0, clipPath: "inset(0 100% 0 0)" });
    gsap.set([nav, lang], { y: -100 });
    gsap.set(inners, { opacity: 0 });
    gsap.set(player, { opacity: 0 });
    gsap.set(hero.querySelector(".hero__stage"), { opacity: 0 });
    ring.progress(0.8);

    const tl = gsap.timeline({ delay: 0.25 });
    tl.to(hero.querySelector(".hero__stage"), { opacity: 1, duration: 0.25, ease: "power1.out" }, 0)
      .fromTo(inners, { scale: 0.5 }, { scale: 1, duration: 0.25, stagger: 0.05, ease: "power1.out" }, 0)
      .to(inners, { opacity: 1, duration: 0.1, stagger: 0.05, ease: "power1.out" }, 0)
      .fromTo(ring, { progress: 0.8 }, { progress: 1, duration: 2, ease: "power1.out" }, 0)
      .add(() => {
        gsap.set(sqs[sqs.length - 1], { opacity: 0 });
        gsap.set(player, { opacity: 1 });
        const out = gsap.timeline();
        out.to(box, { w: W, h: Hh, r: 0, duration: 2, ease: "expo.inOut", onUpdate: clip, onComplete: () => { player.style.clipPath = ""; media.style.transform = ""; ScrollTrigger.refresh(); } }, 0)
          .to(wrap, { scale: 0, duration: 2, ease: "expo.inOut" }, 0)
          .to(ring, { progress: 0.8, duration: 2, ease: "expo.inOut" }, 0)
          .to([nav, lang], { y: 0, duration: 1, ease: "expo.out" }, 0.75)
          .to(title, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out" }, 0.75)
          .to(play, { scale: 1, opacity: 1, duration: 0.5, ease: "power1.out", clearProps: "opacity" }, 1.3)
          .to(ctaMedia, { scale: 1, opacity: 1, duration: 1, ease: "expo.inOut" }, 1.5)
          .to(ctaBg, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "expo.out" }, 2.5)
          .to(ctaText, { y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 1, ease: "expo.out" }, 2.5)
          .add(() => wrap.parentElement.querySelector(".hero__squares").style.setProperty("visibility", "hidden"), 2);
      }, 2);
  };
  if (reduced) { gsap.set(wrap, { autoAlpha: 0 }); gsap.set(hero.querySelector(".hero__stage"), { opacity: 1 }); }
  else intro();

  // Play button — inside the hero it follows the mouse with 1000ms outExpo and returns to center when the mouse leaves
  if (!reduced && matchMedia("(hover: hover)").matches) {
    const qx = gsap.quickTo(play, "x", { duration: 1, ease: "expo.out" }), qy = gsap.quickTo(play, "y", { duration: 1, ease: "expo.out" });
    player.addEventListener("mousemove", (e) => { const r = player.getBoundingClientRect(); qx(e.clientX - r.left - r.width / 2); qy(e.clientY - r.top - r.height / 2); });
    player.addEventListener("mouseleave", () => { qx(0); qy(0); });
  }
  play.addEventListener("click", () => {
    const on = play.textContent === "Play";
    play.textContent = on ? "Pause" : "Play";
    gsap.to(hero.querySelector(".hero__bar"), { opacity: on ? 1 : 0, duration: 0.15 });
    gsap.to(hero.querySelector(".hero__track i"), { width: on ? "100%" : "0%", duration: on ? 48 : 0.3, ease: "none" });
  });

  // News row — Embla drag (dragFree, original default duration 25)
  if (window.EmblaCarousel) EmblaCarousel(document.querySelector(".news__viewport"), { dragFree: true, align: "start", containScroll: "trimSnaps" });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The hero video is set at 120% height and raised 20%, and moves down 20% on exit, project photos start 10% higher and move down 10% while passing
    gsap.set(media, { height: "120%", marginTop: "-20%" });
    gsap.to(media, { yPercent: 20 / 1.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    document.querySelectorAll(".proj__par").forEach((el) => {
      gsap.set(el, { height: "110%", marginTop: "-10%" });
      gsap.fromTo(el, { yPercent: 0 }, { yPercent: 10 / 1.1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  // 3D spiky star — OGL. Instead of the original model, our own shape with the same silhouette (center ball + 20 spikes all around)
  const glStar = (canvas) => {
    if (!window.OGL) return;
    const { Renderer, Camera, Transform, Mesh, Program, Geometry, Vec3 } = OGL;
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const camera = new Camera(gl, { fov: 50 });
    camera.position.set(0, 0, 10);
    const scene = new Transform();
    const pos = [], dir = [], tip = [], nor = [], idx = [];
    const gold = Math.PI * (3 - Math.sqrt(5)), N = 20, seg = 10;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = gold * i;
      const d = new Vec3(Math.cos(th) * rr, y, Math.sin(th) * rr).normalize();
      const up = Math.abs(d.y) > 0.9 ? new Vec3(1, 0, 0) : new Vec3(0, 1, 0);
      const u = new Vec3().cross(up, d).normalize(), v = new Vec3().cross(d, u).normalize();
      const base = pos.length / 3, len = i % 3 === 0 ? 2.6 : i % 3 === 1 ? 2.1 : 1.7;
      for (let j = 0; j < seg; j++) {
        const a = (j / seg) * Math.PI * 2, o = new Vec3().copy(u).scale(Math.cos(a)).add(new Vec3().copy(v).scale(Math.sin(a)));
        pos.push(d.x * 0.5 + o.x * 0.32, d.y * 0.5 + o.y * 0.32, d.z * 0.5 + o.z * 0.32); dir.push(d.x, d.y, d.z); tip.push(0);
        const n = new Vec3().copy(o).add(new Vec3().copy(d).scale(0.15)).normalize(); nor.push(n.x, n.y, n.z);
      }
      pos.push(d.x * len, d.y * len, d.z * len); dir.push(d.x, d.y, d.z); tip.push(1); nor.push(d.x, d.y, d.z);
      for (let j = 0; j < seg; j++) idx.push(base + j, base + ((j + 1) % seg), base + seg);
    }
    const sb = pos.length / 3, lat = 16, lon = 24;
    for (let a = 0; a <= lat; a++) for (let b = 0; b <= lon; b++) {
      const t = (a / lat) * Math.PI, p = (b / lon) * Math.PI * 2, x = Math.sin(t) * Math.cos(p), y = Math.cos(t), z = Math.sin(t) * Math.sin(p);
      pos.push(x * 0.62, y * 0.62, z * 0.62); dir.push(0, 0, 0); tip.push(0); nor.push(x, y, z);
    }
    for (let a = 0; a < lat; a++) for (let b = 0; b < lon; b++) { const i = sb + a * (lon + 1) + b, j = i + lon + 1; idx.push(i, j, i + 1, j, j + 1, i + 1); }
    const geometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array(pos) }, aDir: { size: 3, data: new Float32Array(dir) }, aTip: { size: 1, data: new Float32Array(tip) },
      normal: { size: 3, data: new Float32Array(nor) }, index: { data: new Uint16Array(idx) },
    });
    const program = new Program(gl, {
      vertex: `attribute vec3 position; attribute vec3 aDir; attribute float aTip; attribute vec3 normal;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix; uniform float uGrow;
        varying vec3 vN; varying vec3 vV;
        void main(){ vec3 p = position + aDir * aTip * uGrow; vec4 mv = modelViewMatrix * vec4(p, 1.);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragment: `precision highp float; varying vec3 vN; varying vec3 vV; uniform vec3 uDark; uniform vec3 uLight;
        void main(){ vec3 n = normalize(vN); vec3 r = reflect(-vV, n);
          float sky = smoothstep(-.1, .5, r.y) * .75 + .25 * sin(r.x * 6.) * .5 + .12;
          float spec = pow(max(dot(r, normalize(vec3(.4, .8, .5))), 0.), 30.);
          float rim = pow(1. - max(dot(n, vV), 0.), 3.);
          gl_FragColor = vec4(mix(uDark, uLight, clamp(sky + spec + rim * .4, 0., 1.)), 1.); }`,
      uniforms: { uGrow: { value: 0 }, uDark: { value: window.CS.rgb("--kf-ink") }, uLight: { value: window.CS.rgb("--kf-bg") } },
    });
    const outer = new Transform(); outer.setParent(scene); outer.rotation.y = Math.PI / 2;
    const inner = new Transform(); inner.setParent(outer);
    const mesh = new Mesh(gl, { geometry, program }); mesh.setParent(inner); mesh.scale.set(1.25);
    const tilt = { z: 0, y: 0 };
    const qz = gsap.quickTo(tilt, "z", { duration: 1, ease: "expo.out" }), qy = gsap.quickTo(tilt, "y", { duration: 1, ease: "expo.out" });
    addEventListener("pointermove", (e) => { if (reduced || innerWidth <= 768) return; qz((e.clientY / innerHeight - 0.5) * Math.PI * 0.045 * 10 * -1); qy((e.clientX / innerWidth - 0.5) * Math.PI * 0.028 * 10 * -1); });
    // On hover the spikes extend and twist (800ms outExpo), and on release they return (800ms inExpo) — the slot of the original model animation ”1”
    const clip = { t: 0 };
    canvas.addEventListener("pointerenter", () => !reduced && gsap.to(clip, { t: 1, duration: 0.8, ease: "expo.out", overwrite: true }));
    canvas.addEventListener("pointerleave", () => gsap.to(clip, { t: 0, duration: 0.8, ease: "expo.in", overwrite: true }));
    let scrollTurn = 0;
    if (!reduced) ScrollTrigger.create({ trigger: canvas, start: "top bottom", end: "bottom top", onUpdate: (s) => (scrollTurn = (s.progress - 0.5) * Math.PI) });
    const resize = () => { const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.perspective({ aspect: w / h }); };
    new ResizeObserver(resize).observe(canvas.parentElement); resize();
    let vis = false; new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(canvas);
    gsap.ticker.add(() => {
      if (!vis) return;
      outer.rotation.z = tilt.z; outer.rotation.y = Math.PI / 2 + tilt.y;
      inner.rotation.x = scrollTurn * 0.6 + clip.t * 0.5; inner.rotation.y = scrollTurn + clip.t * 1.2;
      program.uniforms.uGrow.value = clip.t * 0.9;
      renderer.render({ scene, camera });
    });
  };
  glStar(document.querySelector(".cran__gl canvas"));

  // People photo GL stack — next image every 1500ms. Progress is linear, bent by expoOut in the shader so places where the two images’ colors are close change first, and covered with pow 5 at the end
  const glStack = (box) => {
    if (!window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;
    const items = [...box.querySelectorAll(".wf-img")];
    const canvas = document.createElement("canvas");
    box.append(canvas);
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true });
    const gl = renderer.gl;
    const { rgb, css: col } = window.CS;
    const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono");
    const ink = rgb("--kf-ink"), surf = rgb("--kf-surface"), dim = rgb("--kf-dim");
    const mix = (a, b, t) => a.map((v, k) => v * t + b[k] * (1 - t));
    // Placeholder section: draws a blurred person silhouette (head, shoulders) at a different position and brightness per section — so the dissolve is visible
    const texOf = (i, el) => {
      const c = document.createElement("canvas"); c.width = c.height = 512;
      const x = c.getContext("2d");
      x.fillStyle = col(mix(dim, surf, 0.2 + (i % 6) * 0.09)); x.fillRect(0, 0, 512, 512);
      x.filter = "blur(18px)";
      x.fillStyle = col(mix(ink, surf, 0.35 + (i % 3) * 0.15));
      const ox = 256 + ((i * 47) % 90) - 45;
      x.beginPath(); x.ellipse(ox, 200, 70, 88, 0, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(ox, 470, 190, 150, 0, 0, Math.PI * 2); x.fill();
      x.filter = "none";
      x.fillStyle = col(dim);
      x.font = `500 18px ${font}`;
      x.textAlign = "center"; x.fillText((el.dataset.label || "").split(" · ")[0], 256, 40);
      return new Texture(gl, { image: c });
    };
    const texs = items.map((el, i) => texOf(i, el));
    items.forEach((el) => (el.style.visibility = "hidden"));
    const program = new Program(gl, {
      vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
      fragment: `precision highp float; varying vec2 vUv; uniform sampler2D uA; uniform sampler2D uB; uniform float uP;
        float eo(float t){ return t >= 1. ? 1. : 1. - exp2(-10. * t); }
        void main(){ float e = eo(uP); vec4 a = texture2D(uA, vUv); vec4 b = texture2D(uB, vUv);
          float near = step(length(a - b), e); vec4 c = mix(a, b, near); gl_FragColor = mix(c, b, pow(e, 5.)); }`,
      uniforms: { uA: { value: texs[0] }, uB: { value: texs[0] }, uP: { value: 1 } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const draw = () => renderer.render({ scene: mesh });
    const resize = () => { renderer.setSize(box.clientWidth, box.clientHeight); draw(); };
    new ResizeObserver(resize).observe(box); resize();
    let i = 0, timer = 0;
    const step = () => {
      const j = (i + 1) % texs.length;
      program.uniforms.uA.value = texs[i]; program.uniforms.uB.value = texs[j]; i = j;
      gsap.fromTo(program.uniforms.uP, { value: 0 }, { value: 1, duration: 1.5, ease: "none", onUpdate: draw });
    };
    const playS = () => { if (reduced) return; clearInterval(timer); timer = setInterval(step, 1500); };
    const stop = () => clearInterval(timer);
    ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? playS() : stop()) });
    box.addEventListener("mouseenter", stop);
    box.addEventListener("mouseleave", () => ScrollTrigger.isInViewport(box) && playS());
  };
  document.querySelectorAll("[data-gl-stack]").forEach(glStack);
})();
