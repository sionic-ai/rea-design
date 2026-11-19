// Shared by all pages: Lenis (original build and values), hiding header, menu drawer, gradient stage behind the window (three shader), bar-step blink, LET'S APPLY orbit · entrance.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  // Original: duration .28 · wheelMultiplier .95 · easing 1.01 − 85^−t, ScrollTrigger.update on every scroll
  if (!reduce && window.Lenis) {
    const lenis = (window.lenis = new Lenis({
      duration: 0.28,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      syncTouch: false,
      touchMultiplier: 1,
      easing: (t) => Math.min(1, 1.01 - Math.pow(85, -1 * t)),
    }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // The hero loader runs once per session — even if a non-first page is opened first, leave the mark so that moving to the first page skips the loader and stands right away (same as the original)
  if (!document.querySelector(".ec-kv")) { try { sessionStorage.setItem("ec:loading-played", "1"); } catch {} }

  // Header: hides 80px upward when scrolling down and returns when scrolling up (.4s cubic-bezier(.43,.05,.17,1)) — only when the direction changes
  let lastDir = 0;
  ScrollTrigger.create({
    onUpdate(self) {
      if (self.direction === lastDir) return;
      document.body.classList.toggle("navi-up", self.direction === 1 && self.scroll() > 10);
      lastDir = self.direction;
    },
  });
  const menu = document.querySelector(".ec-menu");
  const popup = document.querySelector(".ec-popup");
  menu?.addEventListener("click", (e) => {
    e.preventDefault();
    const on = !menu.classList.contains("is-on");
    menu.classList.toggle("is-on", on);
    popup?.classList.toggle("is-on", on);
    menu.setAttribute("aria-expanded", String(on));
    if (on) window.lenis?.stop(); else window.lenis?.start();
  });

  // Bar stairs: when they reach 80% of the screen, some cells blink for .4s and vanish. Sub headings open .5s after
  document.querySelectorAll(".ec-bars").forEach((bars) => {
    if (bars.classList.contains("ec-mainv__foot")) {
      setTimeout(() => bars.classList.add("is-anim"), 500);
      return;
    }
    ScrollTrigger.create({ trigger: bars, start: "top 80%", once: true, onEnter: () => bars.classList.add("is-anim") });
  });

  // ---------- Gradient stage: 6×4 cell colors blend smoothly, flow (.18) · wobble rotation (.12) · wave (.02) · grain (.035) ----------
  const readColors = (prefix, n) => {
    const probe = document.createElement("i");
    probe.style.display = "none";
    document.body.append(probe);
    const cv = document.createElement("canvas");
    cv.width = n;
    cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    for (let i = 0; i < n; i++) {
      probe.style.color = `var(${prefix}${i + 1})`;
      ctx.fillStyle = getComputedStyle(probe).color;
      ctx.fillRect(i, 0, 1, 1);
    }
    probe.remove();
    return ctx.getImageData(0, 0, n, 1).data;
  };
  window.ecGradTexture = () => {
    const px = readColors("--site-grad-", 24);
    const tex = new THREE.DataTexture(new Uint8Array(px), 6, 4, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };
  const GRAD_FRAG = `
    uniform sampler2D uGrid;
    uniform float uTime;
    uniform vec2 uRes;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    vec3 grid(vec2 uv) {
      vec2 g = clamp(vec2(uv.x, 1.0 - uv.y), 0.0, 1.0) * vec2(5.0, 3.0);
      vec2 i = floor(min(g, vec2(4.999, 2.999)));
      vec2 f = g - i;
      f = f * f * (3.0 - 2.0 * f);
      return texture2D(uGrid, (i + f + 0.5) / vec2(6.0, 4.0)).rgb;
    }
    void main() {
      vec2 uv = vUv;
      float aspect = uRes.x / max(uRes.y, 1.0);
      // Original animation.speed .06 — flow, rotation and ripples all run slowly at this scale
      float t = uTime * 0.06;
      uv += vec2(sin(t * 0.18), cos(t * 0.18 * 1.3 + 1.3)) * vec2(0.08, 0.06);
      float ang = sin(t * 0.12 + 1.3) * 0.18;
      vec2 c = (uv - 0.5) * vec2(aspect, 1.0);
      c = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * c;
      uv = c / vec2(aspect, 1.0) + 0.5;
      float w = t;
      uv += (vec2(noise(uv * 1.6 + w), noise(uv * 1.6 - w + 7.3)) - 0.5) * 0.02 * 2.0;
      vec3 col = grid(uv);
      col += (hash(gl_FragCoord.xy + fract(t) * 91.7) - 0.5) * 0.035;
      col = pow(max(col, 0.0), vec3(0.98));
      gl_FragColor = vec4(col, 1.0);
    }`;
  const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const gradCanvas = document.querySelector("canvas.ec-grad");
  if (gradCanvas && window.THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas: gradCanvas, antialias: false, alpha: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const cam = new THREE.Camera();
    const uniforms = { uGrid: { value: window.ecGradTexture() }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: GRAD_FRAG })));
    const size = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      uniforms.uRes.value.set(innerWidth, innerHeight);
    };
    size();
    addEventListener("resize", size);
    const t0 = performance.now();
    const draw = () => {
      uniforms.uTime.value = reduce ? 4 : (performance.now() - t0) / 1000;
      renderer.render(scene, cam);
    };
    draw();
    if (!reduce) gsap.ticker.add(() => { if (!document.hidden) draw(); });
  }

  // ---------- LET'S APPLY ----------
  const apply = document.querySelector(".ec-apply");
  if (apply) {
    const svg = apply.querySelector(".ec-apply__lines svg");
    const paths = [...svg.querySelectorAll("path")];
    const lens = paths.map((p) => p.getTotalLength());
    const orbit = apply.querySelector(".ec-apply__orbit");
    // Orbit photos: original speed .023 — every photo travels 2.3% of its orbit per second. The lower (front) the larger (.88 → 1.08) and the higher (back) the blurrier (from the back 25%, up to 5.8px)
    const items = [...apply.querySelectorAll(".ec-apply__item")].map((el, i) => ({
      el,
      path: +el.dataset.path,
      start: (+el.dataset.angle || 0) / 360,
      speed: +(el.dataset.speed || 0.023),
      order: i,
    }));
    let box = null, ranges = [];
    const measure = () => {
      const o = orbit.getBoundingClientRect(), s = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      box = { w: o.width, h: o.height, sx: s.width / vb.width, sy: s.height / vb.height, ox: s.left - o.left, oy: s.top - o.top };
      ranges = paths.map((p, k) => {
        let min = Infinity, max = -Infinity;
        for (let j = 0; j <= 120; j++) {
          const y = box.oy + p.getPointAtLength((lens[k] * j) / 120).y * box.sy;
          min = Math.min(min, y);
          max = Math.max(max, y);
        }
        return { min, range: Math.max(1, max - min) };
      });
    };
    const t0 = performance.now();
    const place = (now) => {
      if (!box) measure();
      const t = (now - t0) / 1000;
      items.forEach((it) => {
        const k = it.path, p = paths[k];
        if (!p) return;
        const prog = (((it.start + t * it.speed) % 1) + 1) % 1;
        const pt = p.getPointAtLength(lens[k] * prog);
        const x = box.ox + pt.x * box.sx, y = box.oy + pt.y * box.sy;
        const front = gsap.utils.clamp(0, 1, (y - ranges[k].min) / ranges[k].range);
        const blur = gsap.utils.clamp(0, 1, (1 - front - 0.25) / 0.75) * 5.8;
        it.el.style.setProperty("--ox", `${(x - box.w / 2).toFixed(2)}px`);
        it.el.style.setProperty("--oy", `${(y - box.h / 2).toFixed(2)}px`);
        it.el.style.setProperty("--ob", `${blur.toFixed(2)}px`);
        it.el.style.setProperty("--os", (0.88 + front * 0.2).toFixed(3));
        it.el.style.zIndex = `${Math.round(front * 1000) * 10 + it.order}`;
      });
    };
    addEventListener("resize", () => { box = null; });
    place(reduce ? t0 + 3000 : t0);
    if (!reduce) gsap.ticker.add(() => place(performance.now()));

    // Card: opens up and down from the center horizontal line (.6s power3.inOut), the underline is drawn (.35s), title letters glitch in from the left, and the half panels shift ±3% (.6s power4.inOut)
    const link = apply.querySelector(".ec-apply__link");
    const bgT = apply.querySelector(".ec-apply__bg-t"), bgB = apply.querySelector(".ec-apply__bg-b");
    const unders = [...apply.querySelectorAll(".ec-apply__under")];
    const texts = [...apply.querySelectorAll(".ec-apply__quote p")];
    const chars = [...apply.querySelectorAll(".ec-apply__title .ch")];
    if (reduce) {
      gsap.set([bgT], { xPercent: 3 });
      gsap.set([bgB], { xPercent: -3 });
    } else {
      gsap.set(link, { clipPath: "inset(50% 0% 50% 0%)" });
      gsap.set(texts, { autoAlpha: 0, y: 12 });
      gsap.set(unders, { width: 0 });
      gsap.set(chars, { xPercent: -100, autoAlpha: 0 });
      const tl = gsap.timeline({ paused: true });
      tl.to(link, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.inOut" })
        .to(link, { clipPath: "none" })
        .to(unders, { autoAlpha: 1, duration: 0.4, ease: "power3.out" }, "-=0.5")
        .to(unders, { width: "100%", duration: 0.35, ease: "power3.out", stagger: { each: 0.05, from: "start" } })
        .addLabel("chars", "-=0.5")
        .to(chars, {
          keyframes: [{ autoAlpha: 0.55, duration: 0.12 }, { autoAlpha: 1, duration: 0.2 }],
          xPercent: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: { each: 0.05, from: "start" },
        }, "chars")
        .to(bgT, { xPercent: 3, duration: 0.6, ease: "power4.inOut" }, "-=1.5")
        .to(bgB, { xPercent: -3, duration: 0.6, ease: "power4.inOut" }, "<")
        .to(texts, { autoAlpha: 1, y: 0, duration: 1.6, ease: "power4.inOut", stagger: 0.15 }, "-=0.5");
      ScrollTrigger.create({ trigger: apply, start: "top bottom", end: "50% 10%", onEnter: () => tl.play(0), onLeaveBack: () => tl.reverse() });
    }
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
