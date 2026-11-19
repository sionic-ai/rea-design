/* Shared by the whole site — loader (PreloadJS) · background three (r85) video · cursor magnet · menu brush stroke · sound button · Barba (1.0.0) transitions. 
   The original is a single-page app that loads once and then swaps only the body with Barba, so each section’s scripts (index·about·backstage·credits.js)
   Every page carries it and registers here in BB.pages. Values are exactly as read from the original bundle (TweenMax 1.20). */
(() => {
  const html = document.documentElement;
  const BB = (window.BB = window.BB || {});
  BB.pages = BB.pages || {};
  BB.objs = {};
  BB.vars = { pageName: null, currentIndex: null };
  BB.mouse = { x: innerWidth / 2, y: innerHeight / 2, range: 0 };
  BB.flags = { isLoaded: false, isTransition: false, isGlobalMenu: false, isArrowHovered: false, isGrabbing: false, isMouseAttractorDisable: false };
  BB.isDesktop = matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth > 1024;
  BB.isMobile = !BB.isDesktop;
  BB.reduce = false;
  html.classList.add(BB.isDesktop ? "is-desktop" : "is-mobile");
  if (matchMedia("(hover: hover)").matches) html.classList.add("is-hover");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => { BB.reduce = true; return () => { BB.reduce = false; }; });
  const D = (s) => (BB.reduce ? 0 : s);
  BB.D = D;
  BB.$ = (s, r = document) => r.querySelector(s);
  BB.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  BB.css = (name) => getComputedStyle(html).getPropertyValue(name).trim();
  BB.wait = (ms, fn) => gsap.delayedCall(ms / 1000, fn);
  gsap.registerPlugin(SplitText, MorphSVGPlugin, DrawSVGPlugin);
  if (window.CustomEase) gsap.registerPlugin(CustomEase);

  /* Brush mask sprite — 56 frames, and in each frame the brush stroke spreads from the left to cover everything to the right edge. Our own artwork in place of the original text-mask-in.png (56 frames 640×360) */
  function brushMask() {
    const F = 56, W = 160, H = 90, c = document.createElement("canvas");
    c.width = F * W; c.height = H;
    const g = c.getContext("2d");
    let s = 11;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const rows = 14, rh = H / rows;
    const lag = Array.from({ length: rows }, () => rnd() * 0.32);
    const wob = Array.from({ length: rows }, () => rnd() * 6);
    const drops = Array.from({ length: 50 }, () => ({ x: rnd(), y: rnd(), r: 1.5 + rnd() * 5, t: rnd() * 0.8 }));
    g.fillStyle = "#fff"; /* Not skin: mask alpha plate — only painted areas show */
    for (let f = 0; f < F; f++) {
      const p = f / (F - 1);
      g.save();
      g.beginPath(); g.rect(f * W, 0, W, H); g.clip();
      g.translate(f * W, 0);
      if (f === F - 1) g.fillRect(0, 0, W, H);
      else {
        for (let r = 0; r < rows; r++) {
          const e = (p * 1.5 - lag[r]) * W;
          if (e <= 0) continue;
          const y = r * rh - 1, h = rh + 2;
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(e - wob[r], y);
          g.quadraticCurveTo(e + rh * 0.8, y + h * 0.5, e - wob[r] * 0.5, y + h);
          g.lineTo(0, y + h);
          g.closePath();
          g.fill();
        }
        drops.forEach((d) => { if (p > d.t) { g.beginPath(); g.arc(d.x * W, d.y * H, d.r * Math.min(1, (p - d.t) * 4), 0, Math.PI * 2); g.fill(); } });
      }
      g.restore();
    }
    html.style.setProperty("--bb-mask", `url(${c.toDataURL("image/png")})`);
  }

  /* ---------- Text motion (common.animations) ---------- */
  const A = (BB.anim = {});
  A.split = (sel, type, root = document) => BB.$$(sel, root).map((el) => (el._split = el._split || new SplitText(el, { type, charsClass: "chars", wordsClass: "words" })));
  A.maskTextIn = (root, delay = 0) => {
    const mask = BB.$(".txt-mask", root);
    if (!mask) return;
    mask.classList.remove("is-mask-off");
    gsap.set(mask, { autoAlpha: 1 });
    gsap.fromTo(BB.$$(".chars", root), { x: BB.isDesktop ? 50 : 15, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: D(1.5), ease: "expo.out", delay, stagger: 0.018, clearProps: "transform" });
    if (BB.isDesktop && !BB.reduce) {
      gsap.fromTo(mask, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%" }, { maskPosition: "100% 100%", webkitMaskPosition: "100% 100%", duration: 1.3, ease: "steps(55)", delay, onComplete: () => mask.classList.add("is-mask-off") });
    } else mask.classList.add("is-mask-off");
  };
  A.maskTextOut = (root, delay = 0) => {
    const mask = BB.$(".txt-mask", root);
    if (!mask) return;
    const chars = BB.$$(".chars", root).reverse();
    if (BB.isDesktop) mask.classList.remove("is-mask-off");
    gsap.killTweensOf([chars, mask]);
    gsap.set(mask, { autoAlpha: 1 });
    gsap.fromTo(chars, { autoAlpha: 1 }, { autoAlpha: 0, duration: D(0.65), ease: "expo.out", delay, stagger: 0.012 });
    if (BB.isDesktop) gsap.fromTo(mask, { maskPosition: "100% 100%", webkitMaskPosition: "100% 100%" }, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%", duration: D(0.8), ease: "steps(55)", delay });
  };
  const rndDelay = (base) => +((base || 0) + (1 - 0.5 * Math.random()) - 0.5).toFixed(2);
  A.randomFadeIn = (root, sel, base) => BB.$$(sel, root).forEach((el) => gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(rndDelay(base)), ease: "power1.out" }));
  A.randomFadeOut = (root, sel, base) => BB.$$(sel, root).forEach((el) => gsap.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: D(0.5), delay: D(rndDelay(base)), ease: "power1.out" }));
  A.clipTitleIn = (sel, delay = 0, stagger = 0) => {
    gsap.set([sel, `${sel} .txt`], { autoAlpha: 1 });
    gsap.to(`${sel} .txt .shadow`, { autoAlpha: 1, duration: D(0.45), delay, ease: "none" });
    gsap.fromTo(`${sel} .txt .clip .outer`, { x: "-100%" }, { x: "0%", duration: D(0.8), ease: "quint.out", delay: D(0.5 + delay), stagger });
    gsap.fromTo(`${sel} .txt .clip .inner`, { x: "100%" }, { x: "0%", duration: D(0.8), ease: "quint.out", delay: D(0.5 + delay), stagger });
  };
  A.clipTitleOut = (sel, delay = 0) => {
    gsap.to(`${sel} .txt .clip .outer`, { x: "100%", duration: D(0.5), delay, ease: "quint.out" });
    gsap.to(`${sel} .txt .clip .inner`, { x: "-100%", duration: D(0.5), delay, ease: "quint.out" });
    gsap.to(`${sel} .txt`, { autoAlpha: 0, duration: D(0.65), delay, ease: "none" });
  };
  A.homeTitleIn = (d) => A.clipTitleIn(".home-ttl", d || 0, 0.1);
  A.homeTitleOut = (d) => A.clipTitleOut(".home-ttl", d || 0);
  A.detailsTitleIn = (d) => A.clipTitleIn(".detail-header-ttl", d || 0, 0);
  A.detailsTitleOut = (d) => A.clipTitleOut(".detail-header-ttl", d || 0);
  A.blurFadeOut = (targets, clear, delay = 0) => {
    const els = gsap.utils.toArray(targets).filter(Boolean);
    if (!els.length) return;
    const o = { amount: 0 };
    gsap.set(els, { clearProps: "filter" });
    gsap.to(els, { alpha: 0, duration: D(0.8), ease: "quint.out", delay });
    gsap.fromTo(o, { amount: 0 }, { amount: 10, duration: D(0.8), ease: "quint.out", delay, onUpdate: () => gsap.set(els, { filter: `blur(${o.amount}px)` }), onComplete: () => clear && gsap.set(els, { clearProps: "filter" }) });
  };
  A.hoverText = (root = document) => BB.$$(".js-txt-animation", root).forEach((el) => {
    if (el._hoverText) return;
    el._hoverText = true;
    el.addEventListener("mouseenter", () => {
      if (el._busy || BB.reduce) return;
      el._busy = true;
      const top = BB.$$(".txt .top span", el), bottom = BB.$$(".txt .bottom span", el);
      gsap.fromTo(top, { y: 0, autoAlpha: 1 }, { y: -15, autoAlpha: 0, duration: 0.8, ease: "quint.out", stagger: 0.03 });
      gsap.fromTo(bottom, { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "quint.out", stagger: 0.03, onComplete: () => { gsap.set([top, bottom], { clearProps: "all" }); el._busy = false; } });
    });
  });
  A.menuBtnIn = (d = 0) => {
    gsap.set("#js-menu-btn", { autoAlpha: 1 });
    [1, 2, 3].forEach((n, i) => {
      gsap.fromTo(BB.objs.menu.line(n, "left"), { scaleX: 0, transformOrigin: "100% 50%" }, { scaleX: 1, duration: D(0.65), ease: "quint.out", delay: d + i * 0.1 });
      gsap.fromTo(BB.objs.menu.line(n, "right"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: D(0.65), ease: "quint.out", delay: d + i * 0.1 });
    });
  };
  // Page number flip — digits separate up (next) and down (previous) with 1s quint.inOut, and the line shrinks in .65s then regrows from the opposite side.
  A.updatePagination = (pag, dir, n) => {
    const w = BB.$(".num-wrap", pag), cur = BB.$(".num-wrap span", pag), s = document.createElement("span"), next = dir === "next";
    s.textContent = n;
    s.className = next ? "is-next" : "is-prev";
    next ? w.appendChild(s) : w.insertBefore(s, cur);
    gsap.fromTo(BB.$$(".num-wrap span", pag), { y: "0%" }, { y: next ? "-100%" : "100%", duration: D(1), ease: "quint.inOut", onComplete: () => {
      const c = BB.$(".is-current", pag); c && c.remove();
      s.classList.remove("is-next", "is-prev"); s.classList.add("is-current"); gsap.set(s, { clearProps: "all" });
    } });
    const line = BB.$(".line", pag);
    gsap.fromTo(line, { scaleX: 1, transformOrigin: next ? "100% 50%" : "0% 50%" }, { scaleX: 0, duration: D(0.65), ease: "quint.in", onComplete: () => {
      gsap.fromTo(line, { scaleX: 0, transformOrigin: next ? "0% 50%" : "100% 50%" }, { scaleX: 1, duration: D(0.65), ease: "quint.out" });
    } });
  };
  A.disableAttractors = (root) => BB.$$("[data-mouse-disable]", root).forEach((e) => e.setAttribute("data-mouse-disable", "yes"));
  A.setAttractors = (state, root) => BB.$$("[data-mouse-disable]", root).forEach((e) => e.setAttribute("data-mouse-disable", state === "enable" ? "no" : "yes"));

  /* ---------- Cursor magnet (mouseAttractor) ---------- */
  // Shape paths are circles and rings we drew ourselves — dot r4.5 · middle ring r30 (thickness 4) · big ring r42 (thickness 4) · play triangle · drag ring r18 (thickness 2.4)
  const ring = (R, r) => `M50,${50 - R}A${R},${R} 0 1,1 49.99,${50 - R}Z M50,${50 - r}A${r},${r} 0 1,0 50.01,${50 - r}Z`;
  const SHAPE = {
    default: "M50,45.5A4.5,4.5 0 1,1 49.99,45.5Z M50,50A0.01,0.01 0 1,0 50.01,50Z",
    medium: ring(30, 26),
    large: ring(42, 38),
    chapter: "M43.2,41.5L60,50L43.2,58.5Z M50,50A0.01,0.01 0 1,0 50.01,50Z",
    drag: ring(18, 15.6),
  };
  BB.SHAPE = SHAPE;
  // Cursor face color — change fill to a color with alpha as in the original (made from the text color --kf-ink)
  const inkA = (a, name = "--kf-ink") => {
    const c = BB.css(name) || getComputedStyle(html).color;
    let r = 255, g = 255, b = 255;
    if (c[0] === "#") { const h = c.length === 4 ? c.slice(1).split("").map((x) => x + x).join("") : c.slice(1, 7); [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
    else { const m = c.match(/\d+(\.\d+)?/g); if (m) [r, g, b] = m.map(Number); }
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  class Cursor {
    constructor() {
      this.mouse = { duration: 0.35, ease: "expo.out", range: 100 };
      this.target = { duration: 0.5, ease: "expo.out", strength: 1.5, spring: 0.25 };
      this.el = BB.$("#js-dragger");
      this.path = BB.$(".dragger-cursor-path");
      this.arrow = BB.$(".dragger-arrow");
      this.targets = [];
    }
    init() {
      if (!BB.isDesktop || !this.el) return;
      // Events are gathered into one per frame and applied on the next frame — like the original (TweenLite), the cursor follows from the frame after the pointer moves
      this.move = (e) => {
        BB.mouse.x = e.clientX; BB.mouse.y = e.clientY;
        if (this.queued) return;
        this.queued = true;
        requestAnimationFrame(() => {
          this.queued = false;
          const x = BB.mouse.x, y = BB.mouse.y;
          gsap.to(this.el, { x, y, duration: this.mouse.duration, overwrite: "auto" });
          this.attract(x, y);
        });
      };
      this.leave = () => {
        gsap.killTweensOf([this.path]);
        this.shape = "default"; gsap.to(this.path, { fill: inkA(0), morphSVG: SHAPE.default, duration: this.mouse.duration / 2, overwrite: "auto" });
        gsap.to(this.targets, { x: 0, y: 0, duration: this.target.duration, ease: this.target.ease, clearProps: "transform" });
      };
      this.enter = () => gsap.to(this.path, { fill: inkA(1), duration: this.mouse.duration / 2 });
      addEventListener("pointermove", this.move, { passive: true });
      document.documentElement.addEventListener("mouseleave", this.leave);
      document.documentElement.addEventListener("mouseenter", this.enter);
      this.update();
    }
    update() {
      this.targets = BB.$$("[data-mouse-attractor]");
      // While over an arrow button (.js-arrow), the cursor sticks to the exact center of that arrow as a ring (original onArrowEnter)
      BB.$$(".js-arrow").forEach((a) => {
        if (a._arrowBound) return;
        a._arrowBound = true;
        a.addEventListener("mouseenter", () => { this.arrowEl = a; BB.flags.isArrowHovered = true; BB.flags.isMouseAttractorDisable = a.getAttribute("data-mouse-disable") === "yes"; });
        a.addEventListener("mouseleave", () => { this.arrowEl = null; BB.flags.isArrowHovered = false; BB.flags.isMouseAttractorDisable = false; });
      });
    }
    setShape(kind, fill, dur) {
      if (this.shape === kind) return;
      this.shape = kind;
      gsap.to(this.path, { fill: inkA(fill), morphSVG: SHAPE[kind], duration: dur, overwrite: "auto" });
    }
    // Original forceAttractor — pulls on and is pulled by the first target within the radius (movement without a curve, power1.out), and with no target returns to a dot, but over an arrow it becomes a ring at the arrow center
    attract(x, y) {
      if (!BB.flags.isLoaded) return;
      for (const s of this.targets) {
        const b = s.getBoundingClientRect();
        if (!b.width) continue;
        const range = +s.getAttribute("data-mouse-range") || this.mouse.range;
        const a = x - (b.left + b.width / 2), l = y - (b.top + b.height / 2);
        const h = Math.hypot(a, l);
        if (h >= range) continue;
        if (BB.flags.isGrabbing || s.getAttribute("data-mouse-disable") === "yes") return;
        const u = (h / range) * this.target.spring;
        const c = ((a * h) / (range * this.target.strength)) * (1 - u), d = ((l * h) / (range * this.target.strength)) * (1 - u);
        const kind = s.getAttribute("data-mouse-attractor") || "default";
        if (kind === "chapter") this.setShape("chapter", 1, this.mouse.duration);
        else this.setShape(SHAPE[kind] ? kind : "medium", 0.1, this.mouse.duration / 2);
        gsap.to(this.el, { x: x - c, y: y - d, duration: this.mouse.duration, overwrite: "auto" });
        if (kind !== "chapter") { gsap.to(s, { x: c, y: d, duration: this.target.duration, overwrite: "auto" }); s._pulled = true; }
        return;
      }
      if (BB.flags.isMouseAttractorDisable || BB.flags.isGrabbing) return;
      this.targets.forEach((s) => { if (s._pulled) { s._pulled = false; gsap.to(s, { x: 0, y: 0, duration: this.target.duration, ease: this.target.ease, clearProps: "transform", overwrite: "auto" }); } });
      if (BB.flags.isArrowHovered && this.arrowEl) {
        const m = this.arrowEl.querySelector("[data-mouse-attractor]") || this.arrowEl, r = m.getBoundingClientRect();
        this.setShape("medium", 0.1, this.mouse.duration / 2);
        gsap.to(this.el, { x: r.left + r.width / 2, y: r.top + r.height / 2, duration: this.mouse.duration, overwrite: "auto" });
      } else this.setShape("default", 1, this.mouse.duration / 2);
    }
    morphDefault(t = 0.5) {
      if (!this.el) return;
      gsap.killTweensOf([this.el, this.path]);
      gsap.to(this.el, { x: BB.mouse.x, y: BB.mouse.y, duration: t, overwrite: "auto" });
      this.shape = "default"; gsap.to(this.path, { fill: inkA(1), morphSVG: SHAPE.default, duration: t, ease: "expo.out", overwrite: "auto", onComplete: () => { BB.flags.isArrowHovered = false; } });
    }
    enableDragging() {
      if (BB.isMobile || BB.flags.isGrabbing || BB.flags.isArrowHovered) return;
      BB.flags.isGrabbing = true; BB.flags.isMouseAttractorDisable = true;
      html.classList.add("is-grabbing");
      gsap.killTweensOf(this.path);
      gsap.fromTo(".dragger-arrow-left", { x: 10 }, { x: 0, duration: this.mouse.duration });
      gsap.fromTo(".dragger-arrow-right", { x: -10 }, { x: 0, duration: this.mouse.duration });
      this.shape = "drag"; gsap.to(this.path, { fill: inkA(1), morphSVG: SHAPE.drag, duration: this.mouse.duration, overwrite: "auto" });
      gsap.to(this.arrow, { autoAlpha: 1, duration: this.mouse.duration });
    }
    disableDragging() {
      if (BB.isMobile || !BB.flags.isGrabbing || BB.flags.isArrowHovered) return;
      BB.flags.isGrabbing = false; BB.flags.isMouseAttractorDisable = false;
      html.classList.remove("is-grabbing");
      this.shape = "default"; gsap.to(this.path, { fill: inkA(1), morphSVG: SHAPE.default, duration: this.mouse.duration, overwrite: "auto" });
      gsap.to(this.arrow, { autoAlpha: 0, duration: this.mouse.duration / 2 });
    }
  }

  /* ---------- Background three — three video planes (revealed by a brightness threshold) + pixel dot cloud + film grain ---------- */
  const VERT_PLANE = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  // Pixels darker than the threshold are erased to the background color — lowering gray from 1 to 0.1 makes the video emerge from the brightest areas first
  const FRAG_PLANE = `precision highp float;
    uniform sampler2D uTex; uniform float uAlpha; uniform float uGray; uniform vec3 uBg; varying vec2 vUv;
    void main(){ vec3 c = texture2D(uTex, vUv).rgb; float l = dot(c, vec3(0.299, 0.587, 0.114));
      vec3 col = l < uGray ? uBg : vec3(l); gl_FragColor = vec4(col, uAlpha); }`;
  // One pixel is one dot — dots within the cursor radius rise toward the camera (convex) looking larger, and shimmer with value noise
  const VERT_POINTS = `precision highp float;
    uniform sampler2D uTex; uniform vec2 uSize; uniform vec2 uRes; uniform vec3 uMouse;
    uniform float uTime; uniform float uPointSize; uniform float uPointNoise; uniform float uRange;
    varying vec2 vUv;
    float h31(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
    float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      float a = mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y);
      float b = mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y);
      return mix(a, b, f.z) * 2.0 - 1.0; }
    void main(){
      vUv = position.xy / uSize;
      float zr = uSize.y < uRes.y ? uRes.y / uSize.y : uRes.x / uSize.x;
      vec3 pos = vec3(position.x * zr - uSize.x * zr * 0.5, position.y * zr - uSize.y * zr * 0.5, 0.0);
      float d = distance(uMouse.xy, pos.xy);
      if (d < uRange) { float r = d / uRange; pos.z += d * pow(1.0 - r, 2.0) * 2.0; }
      pos.x += vnoise(vec3(pos.xy * vec2(2.24, 1.02), uTime * 0.18)) * (uPointNoise - 0.5 + 0.086);
      pos.x += vnoise(vec3(pos.xy * vec2(4.69, 2.44), uTime * 0.36)) * (uPointNoise - 0.5 + 0.128);
      pos.y += vnoise(vec3(pos.xy * vec2(0.24, 0.52), uTime * 0.04)) * 4.516 * 0.5;
      pos.y += vnoise(vec3(pos.xy * vec2(1.69, 1.84), uTime * 0.16)) * 4.532 * 0.5;
      gl_PointSize = uPointSize;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`;
  const FRAG_POINTS = `precision highp float;
    uniform sampler2D uTex; uniform float uAlpha; varying vec2 vUv;
    void main(){ float l = dot(texture2D(uTex, vUv).rgb, vec3(0.299, 0.587, 0.114));
      vec3 col = l < 0.2 ? vec3(0.0) : vec3(l); gl_FragColor = vec4(col, uAlpha * 0.5); }`;
  // Film grain — turn the seed (noise) by .1 each frame and jitter brightness ±.03 per pixel
  const GRAIN = {
    uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uLevel: { value: new THREE.Vector4(0.03, 0.03, 0.03, 0) } },
    vertexShader: VERT_PLANE,
    fragmentShader: `precision highp float; uniform sampler2D tDiffuse; uniform float uSeed; uniform vec4 uLevel; varying vec2 vUv;
      float r2(vec2 p){ return fract(sin(dot(p, vec2(12.9898 + uSeed, 78.233 + uSeed))) * 43758.5453 + uSeed); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); float n = r2(vUv) * 2.0 - 1.0; gl_FragColor = c + uLevel * n; }`,
  };
  BB.GRAIN = GRAIN;

  class BackgroundCanvas {
    constructor(el, urls) {
      this.el = el;
      this.urls = urls;
      this.currentIndex = BB.vars.currentIndex || 1;
      this.videos = []; this.meshes = []; this.points = [];
      this.timer = 0; this.isStopped = true; this.loaded = 0;
    }
    init() {
      if (!this.el || !window.THREE) return;
      const w = (this.width = innerWidth), h = (this.height = innerHeight);
      this.scene = new THREE.Scene();
      this.fov = 70;
      this.camera = new THREE.PerspectiveCamera(this.fov, w / h, 0.1, 2000);
      this.camera.position.z = h / Math.tan((this.fov * Math.PI) / 360) / 2;
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, preserveDrawingBuffer: true });
      this.renderer.setClearColor(new THREE.Color(BB.css("--kf-surface")));
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      this.el.appendChild(this.renderer.domElement);
      this.composer = new THREE.EffectComposer(this.renderer);
      this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
      this.grain = new THREE.ShaderPass(GRAIN);
      this.composer.addPass(this.grain);
      const copy = new THREE.ShaderPass(THREE.CopyShader);
      copy.renderToScreen = true;
      this.composer.addPass(copy);
      this.mouseVec = new THREE.Vector3(0, 0, 1);
      this.res = new THREE.Vector2(w, h);
      this.bg = new THREE.Color(BB.css("--kf-surface"));
      this.urls.forEach((u, i) => this.createVideo(i, u));
      this.raf = this.animate.bind(this);
      this.resize = this.onResize.bind(this);
      addEventListener("resize", this.resize);
      this.start();
    }
    createVideo(i, src) {
      const v = document.createElement("video");
      v.src = src; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.setAttribute("playsinline", ""); v.crossOrigin = "anonymous";
      v.playbackRate = 4; v.defaultPlaybackRate = 4;
      this.videos[i] = v;
      v.addEventListener("loadedmetadata", () => {
        if (v._mesh) return;
        v._mesh = true;
        this.createMesh(i, v);
        this.loaded++;
      }, { once: true });
      v.load();
    }
    createMesh(i, v) {
      const tex = new THREE.VideoTexture(v);
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.format = THREE.RGBFormat;
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTex: { value: tex }, uAlpha: { value: 1 }, uGray: { value: 1 }, uBg: { value: new THREE.Vector3(this.bg.r, this.bg.g, this.bg.b) } },
        vertexShader: VERT_PLANE, fragmentShader: FRAG_PLANE, transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.meshes[i] = mesh;
      this.fit();
      const n = v.videoWidth, s = v.videoHeight, arr = new Float32Array(n * s * 3);
      for (let c = 0, d = 0; c < arr.length; c += 3, d++) { arr[c] = d % n; arr[c + 1] = Math.floor(d / n); }
      const geo = new THREE.BufferGeometry();
      geo.addAttribute("position", new THREE.BufferAttribute(arr, 3));
      if (BB.isDesktop) BB.mouse.range = 180;
      const pm = new THREE.ShaderMaterial({
        uniforms: { uTex: { value: tex }, uTime: { value: 0 }, uRes: { value: this.res }, uMouse: { value: new THREE.Vector3(0, 0, 1) }, uSize: { value: new THREE.Vector2(n, s) },
          uPointSize: { value: 1 }, uPointNoise: { value: 150 }, uRange: { value: BB.mouse.range }, uAlpha: { value: 0 } },
        vertexShader: VERT_POINTS, fragmentShader: FRAG_POINTS, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true,
      });
      const pts = new THREE.Points(geo, pm);
      pts.visible = false;
      this.scene.add(pts);
      this.points[i] = pts;
      // Precompile when setting up the shader — compiling for the first time on first reveal freezes the screen
      mesh.visible = true; pts.visible = true;
      this.renderer.compile(this.scene, this.camera);
      mesh.visible = this.pendingMesh === i; pts.visible = this.pendingPoints === i;
      if (this.pendingMesh === i) this.playIdx(i);
      if (this.pendingPoints === i) this.playIdx(i);
    }
    playIdx(i) { const v = this.videos[i]; if (v && v.paused) v.play().catch(() => {}); }
    fit() {
      this.meshes.forEach((m, i) => {
        if (!m) return;
        const v = this.videos[i];
        let w = this.width, h = v.videoHeight * (w / v.videoWidth);
        if (h < this.height) { h = this.height; w = v.videoWidth * (h / v.videoHeight); }
        m.scale.set(w, h, 1);
      });
    }
    animate() {
      if (!this.composer) return;
      this.grain.uniforms.uSeed.value = (this.grain.uniforms.uSeed.value + 0.1) % 1;
      const mx = BB.mouse.x - innerWidth / 2, my = -BB.mouse.y + innerHeight / 2;
      const i = this.currentIndex - 1, p = this.points[i];
      if (p && p.visible) {
        const u = p.material.uniforms;
        u.uTime.value = BB.reduce ? 0 : this.timer;
        u.uRange.value = BB.mouse.range;
        u.uMouse.value.set(mx, my, 1);
      }
      if (!BB.reduce) this.timer += 0.01;
      this.composer.render();
    }
    onResize() {
      this.width = innerWidth; this.height = innerHeight;
      this.res.set(this.width, this.height);
      this.fit();
      this.camera.aspect = this.width / this.height;
      this.camera.position.z = this.height / Math.tan((this.fov * Math.PI) / 360) / 2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.composer.setSize(this.width * this.renderer.getPixelRatio(), this.height * this.renderer.getPixelRatio());
    }
    start() { if (!this.isStopped) return; this.isStopped = false; gsap.ticker.add(this.raf); }
    stop() { this.isStopped = true; gsap.ticker.remove(this.raf); }
    rate(i, from, to, delay = 0) { const v = this.videos[i]; if (v && BB.isDesktop) gsap.fromTo(v, { playbackRate: from }, { playbackRate: to, duration: D(1), delay, ease: "power1.out" }); }
    fadeIn(reset, index, delay = 0) {
      BB.wait(1000 * delay, () => {
        this.pendingMesh = index - 1;
        this.meshes.forEach((m, r) => {
          const v = this.videos[r];
          if (index - 1 === r) {
            m.visible = true;
            if (reset && v) v.currentTime = 0;
            this.rate(r, 1, 4);
            this.playIdx(r);
            gsap.to(m.material.uniforms.uGray, { value: 0.1, duration: D(1.5), ease: "power1.out" });
            this.currentIndex = r + 1; BB.vars.currentIndex = r + 1;
          } else if (m) { m.visible = false; v && v.pause(); }
        });
        if (!this.meshes[index - 1]) { this.currentIndex = index; BB.vars.currentIndex = index; }
      });
    }
    fadeOut(pause, index, delay = 0) {
      BB.wait(1000 * delay, () => {
        const m = this.meshes[index - 1], v = this.videos[index - 1];
        if (!m) return;
        if (pause && v) v.pause();
        gsap.to(m.material.uniforms.uGray, { value: 1, duration: D(1.5), ease: "power1.out", onComplete: () => { if (index !== 3) m.visible = false; } });
      });
    }
    showPoints(pause, index, delay = 0) {
      BB.wait(1000 * delay, () => {
        this.pendingPoints = index - 1;
        this.meshes.forEach((m, r) => { if (m && index - 1 !== r) { m.visible = false; pause && this.videos[r].pause(); } });
        this.points.forEach((p, r) => {
          if (index - 1 === r) {
            p.visible = true;
            this.playIdx(r);
            if (BB.isDesktop) gsap.fromTo(this.videos[r], { playbackRate: 4 }, { playbackRate: 1, duration: D(1), delay: D(0.2), ease: "power1.out" });
            gsap.fromTo(p.material.uniforms.uPointNoise, { value: 150 }, { value: 6, duration: D(1), delay: D(0.2), ease: "power1.out" });
            gsap.fromTo(p.material.uniforms.uAlpha, { value: 0 }, { value: 1, duration: D(1), delay: D(0.2), ease: "power1.out" });
          } else if (p) { p.visible = false; pause && this.videos[r].pause(); }
        });
        this.currentIndex = index; BB.vars.currentIndex = index;
      });
    }
    hidePoints(pause, index, delay = 0) {
      BB.wait(1000 * delay, () => {
        this.pendingPoints = -1;
        this.points.forEach((p, r) => {
          if (!p) return;
          if (index - 1 === r) {
            if (pause) this.videos[r].pause();
            this.rate(r, 1, 4);
            gsap.to(p.material.uniforms.uPointNoise, { value: 150, duration: D(1), ease: "power1.out" });
            gsap.to(p.material.uniforms.uAlpha, { value: 0, duration: D(1), ease: "power1.out", onComplete: () => { if (this.pendingPoints !== r) p.visible = false; } });
          } else if (index !== 3) p.visible = false;
        });
      });
    }
    slowIn(index) { this.rate(index - 1, 4, 1); }
    slowOut(index) { this.rate(index - 1, 1, 4); }
  }

  // When opened via file://, WebGL can’t read video pixels (treated as another origin) — only then, grayscale <video> Lay it down right away and change only the opacity in the same order
  function fileBackground(el, urls) {
    const vids = urls.map((u) => {
      const v = document.createElement("video");
      v.src = u; v.muted = true; v.loop = true; v.playsInline = true;
      v.className = "bb-file-video";
      el.appendChild(v);
      return v;
    });
    const show = (i, on) => { const v = vids[i - 1]; if (!v) return; gsap.to(v, { opacity: on ? 0.6 : 0, duration: D(1.5) }); on ? v.play().catch(() => {}) : v.pause(); };
    const noop = () => {};
    return {
      isStopped: false, start: noop, stop: noop, slowIn: noop, slowOut: noop,
      fadeIn: (r, i) => { vids.forEach((v, k) => k !== i - 1 && show(k + 1, false)); show(i, true); BB.vars.currentIndex = i; },
      fadeOut: (p, i) => show(i, false),
      showPoints: (p, i) => { vids.forEach((v, k) => k !== i - 1 && show(k + 1, false)); show(i, true); BB.vars.currentIndex = i; },
      hidePoints: (p, i) => show(i, false),
    };
  }

  /* ---------- Menu — the four section names written in brush strokes ---------- */
  // The original drew each letter with drawSVG using a hand-drawn stroke path as a mask. We measure the letter box and build one vertical stroke and one diagonal stroke, drawing them in the same patterns (center outward to both ends, or from one end)
  class Menu {
    constructor() {
      this.menu = BB.$("#js-menu");
      this.btn = BB.$("#js-menu-btn");
      this.inner = BB.$(".menu-inner", this.menu);
      this.line_ = BB.$(".menu-line", this.menu);
      this.items = BB.$$(".menu-item", this.menu);
      this.isAnimating = false;
    }
    line(n, side) { return `#js-menu-btn .lines._${n} .line._${side}`; }
    init() {
      if (!this.menu) return;
      // If the menu is display:none the text box measures as 0 — measured on first open after fonts have fully loaded
      this.built = false;
      const toggle = () => (BB.flags.isGlobalMenu ? this.close() : this.open());
      this.btn.addEventListener("click", toggle);
      this.btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      this.items.forEach((it) => {
        const a = BB.$("a", it);
        a.addEventListener("mouseenter", () => this.over(it));
        a.addEventListener("mouseleave", () => this.leave(it));
      });
    }
    buildStrokes() {
      this.items.forEach((it, k) => {
        const svg = BB.$(".svg-txt-wrap svg", it), word = BB.$("text.word-measure", svg), g = BB.$("g.letters", svg), defs = BB.$("defs", svg);
        if (!word) return;
        g.innerHTML = ""; defs.innerHTML = "";
        const txt = word.textContent, ns = "http://www.w3.org/2000/svg";
        const strokes = [];
        for (let i = 0; i < txt.length; i++) {
          if (txt[i] === " ") continue;
          let box;
          try { box = word.getExtentOfChar(i); } catch (e) { continue; }
          const id = `bbm-${k}-${i}`, m = document.createElementNS(ns, "mask");
          m.setAttribute("id", id); m.setAttribute("maskUnits", "userSpaceOnUse");
          m.setAttribute("x", box.x - 20); m.setAttribute("y", box.y - 20); m.setAttribute("width", box.width + 40); m.setAttribute("height", box.height + 40);
          const cx = box.x + box.width / 2, w = box.width;
          const mk = (d, sw, from) => { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); p.setAttribute("class", "stroke"); p.setAttribute("stroke-width", sw); p._from = from; p._order = i; m.appendChild(p); strokes.push(p); };
          mk(`M${cx},${box.y - 2}L${cx},${box.y + box.height + 2}`, w * 0.66, i % 2 ? "50% 50%" : "0% 0%");
          mk(`M${box.x - 2},${box.y + box.height}L${box.x + w + 2},${box.y}`, w * 0.7, i % 3 ? "100% 100%" : "50% 50%");
          mk(`M${box.x - 2},${box.y + box.height * 0.62}L${box.x + w + 2},${box.y + box.height * 0.62}`, box.height * 0.3, i % 2 ? "0% 0%" : "100% 100%");
          defs.appendChild(m);
          const t = document.createElementNS(ns, "text");
          t.setAttribute("x", box.x); t.setAttribute("y", word.getAttribute("y")); t.setAttribute("class", "word"); t.setAttribute("mask", `url(#${id})`);
          t.textContent = txt[i];
          g.appendChild(t);
        }
        it._strokes = strokes;
      });
    }
    set(it) { (it._strokes || []).forEach((p) => gsap.set(p, { drawSVG: p._from })); }
    setAll() { this.items.forEach((it) => this.set(it)); }
    strokeIn(it, dur = 0.85, delay = 0, base = 0) {
      (it._strokes || []).forEach((p, j) => gsap.to(p, { drawSVG: "0% 100%", alpha: 1, duration: D(dur), ease: "quint.out", delay: delay + D(base + ((p._order * 0.07 + (j % 3) * 0.05) % (base ? 0.55 : 0.45))) }));
    }
    strokeOut(it, dur = 0.65, delay = 0) {
      const n = (it._strokes || []).length;
      (it._strokes || []).forEach((p, j) => gsap.to(p, { drawSVG: p._from, alpha: 0, duration: D(dur), ease: "quint.out", delay: delay + D((((n - j) * 0.05) % 0.2)) }));
    }
    allIn(delay) {
      gsap.fromTo(this.line_, { scaleX: 0, backgroundColor: inkA(1, "--kf-contrast-ink") }, { scaleX: 1, backgroundColor: inkA(0.15, "--kf-contrast-ink"), duration: D(1), ease: "quint.inOut", delay });
      this.items.forEach((it, k) => this.strokeIn(it, 0.8, delay, 0.03 + k * 0.03));
    }
    over(it) {
      if (this.isAnimating) return;
      this.items.forEach((o) => gsap.killTweensOf(o._strokes || []));
      this.items.forEach((o) => (o === it ? this.strokeIn(o, 0.85) : this.strokeOut(o, 0.65)));
    }
    leave(it) {
      if (BB.flags.isTransition) return;
      this.items.forEach((o) => gsap.killTweensOf(o._strokes || []));
      this.items.forEach((o) => this.strokeIn(o, o === it ? 0.45 : 0.85));
    }
    open() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      gsap.set(this.menu, { display: "block" });
      if (!this.built && (!document.fonts || document.fonts.status === "loaded")) { this.buildStrokes(); this.built = true; }
      else if (!this.built) this.buildStrokes();
      this.setAll();
      A.disableAttractors(BB.$("#js-wrapper"));
      BB.flags.isGlobalMenu = true;
      this.btn.setAttribute("aria-expanded", "true");
      [1, 2, 3].forEach((n, i) => {
        gsap.to(this.line(n, "left"), { scaleX: 0, transformOrigin: "0% 50%", duration: D(0.35), ease: "quint.inOut", delay: D(i * 0.1) });
        gsap.to(this.line(n, "right"), { scaleX: 0, transformOrigin: "100% 50%", duration: D(0.35), ease: "quint.inOut", delay: D(i * 0.1) });
      });
      gsap.fromTo(this.line(4, "left"), { scaleX: 0, transformOrigin: "100% 50%" }, { scaleX: 1, duration: D(0.65), ease: "quint.out", delay: D(0.95) });
      gsap.fromTo(this.line(4, "right"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: D(0.65), ease: "quint.out", delay: D(0.95) });
      gsap.fromTo(this.line(5, "left"), { scaleX: 0, transformOrigin: "100% 50%" }, { scaleX: 1, duration: D(0.3), ease: "quint.out", delay: D(0.75) });
      gsap.fromTo(this.line(5, "right"), { scaleX: 0, transformOrigin: "100% 50%" }, { scaleX: 1, duration: D(0.3), ease: "quint.in", delay: D(0.45) });
      gsap.fromTo(this.menu, { y: "-100%" }, { y: "0%", duration: D(1.35), ease: "expo.inOut" });
      gsap.fromTo(this.inner, { y: "100%" }, { y: "0%", duration: D(1.35), ease: "expo.inOut", onComplete: () => { this.isAnimating = false; } });
      this.allIn(D(1));
    }
    close() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      A.setAttractors("enable", BB.$("#js-wrapper"));
      this.btn.setAttribute("aria-expanded", "false");
      [4, 5].forEach((n) => {
        gsap.fromTo(this.line(n, "left"), { scaleX: 1, transformOrigin: "0% 50%" }, { scaleX: 0, duration: D(0.5), ease: "quint.inOut" });
        gsap.fromTo(this.line(n, "right"), { scaleX: 1, transformOrigin: "100% 50%" }, { scaleX: 0, duration: D(0.5), ease: "quint.inOut" });
      });
      [1, 2, 3].forEach((n, i) => {
        gsap.to(this.line(n, "left"), { scaleX: 1, transformOrigin: "100% 50%", duration: D(0.65), ease: "quint.out", delay: D(0.5 + i * 0.1) });
        gsap.to(this.line(n, "right"), { scaleX: 1, transformOrigin: "0% 50%", duration: D(0.65), ease: "quint.out", delay: D(0.5 + i * 0.1) });
      });
      gsap.to(this.menu, { y: "-100%", duration: D(1), ease: "quint.inOut" });
      gsap.to(this.inner, { y: "100%", duration: D(1), ease: "quint.inOut", onComplete: () => { BB.flags.isGlobalMenu = false; this.isAnimating = false; gsap.set(this.menu, { display: "none", clearProps: "transform" }); } });
    }
  }

  /* ---------- Sound button — five bars rise and fall at .8s (delays .6·.3·0·.3·.6) ---------- */
  class Sound {
    constructor() { this.btn = BB.$("#js-background-sound-toggle-btn"); this.on = false; }
    init() {
      if (!this.btn) return;
      this.audio = new Audio(this.btn.getAttribute("data-src"));
      this.audio.loop = true; this.audio.volume = 0;
      const lines = BB.$$(".line", this.btn);
      this.pulse = gsap.timeline({ paused: true });
      [0.6, 0.3, 0, 0.3, 0.6].forEach((d, i) => this.pulse.to(lines[i], { scaleY: 1, duration: 0.8, delay: d, repeat: -1, yoyo: true, ease: "none" }, 0));
      gsap.set(lines, { scaleY: 0.2 });
      this.btn.addEventListener("click", () => this.toggle());
    }
    toggle() {
      this.on = !this.on;
      this.btn.classList.toggle("off", !this.on);
      if (this.on) {
        this.audio.play().catch(() => {});
        gsap.to(this.audio, { volume: 1, duration: 0.65 });
        if (!BB.reduce) { this.pulse.seek(0); this.pulse.play(); }
      } else {
        gsap.to(this.audio, { volume: 0, duration: 0.35, onComplete: () => this.audio.pause() });
        this.pulse.pause();
        gsap.to(BB.$$(".line", this.btn), { scaleY: 0.2, duration: 0.5 });
      }
    }
  }

  /* ---------- Loader — receives five videos with PreloadJS and loads the progress onto a line ---------- */
  function loader(done) {
    const L = BB.$("#js-loading");
    if (!L) return done();
    const pct = BB.$(".loading-percent .num", L);
    let shown = 0;
    gsap.to("#js-progress", { scaleX: Math.min(0.2, (innerWidth / 100) * 0.05), duration: D(0.65), ease: "quint.out" });
    const finish = () => {
      const tl = gsap.timeline({ delay: D(1), onComplete: () => { L.remove(); done(); } });
      tl.to("#js-progress", { scaleX: 1, duration: D(1), ease: "quint.inOut", onComplete: () => { gsap.set("#js-progress", { backgroundColor: "transparent" }); gsap.set(".g-center-line", { alpha: 1 }); } }, 0);
      tl.to("#js-progress .bar._left", { scaleX: 0, opacity: 0.1, transformOrigin: "0% 50%", duration: D(1), ease: "quint.inOut" }, D(0.5));
      tl.to("#js-progress .bar._right", { scaleX: 0, opacity: 0.1, transformOrigin: "100% 50%", duration: D(1), ease: "quint.inOut" }, D(0.5));
      tl.to("#js-content-mask", { autoAlpha: 0, duration: D(1) }, 0);
      tl.to(".loading-percent .num-wrap", { y: "-100%", autoAlpha: 0, duration: D(0.75), ease: "quint.out" }, D(0.5));
      tl.to(".loading-percent .completed", { y: "0%", autoAlpha: 1, duration: D(0.75), ease: "quint.out" }, D(0.5));
      tl.to(".loading-percent .completed", { autoAlpha: 0, duration: D(0.25), ease: "none" }, D(1.25));
      tl.to(L, { backgroundColor: "transparent", duration: D(1) }, 0);
    };
    const progress = (p) => {
      gsap.to("#js-progress .bar", { scaleX: p, duration: D(0.5), delay: D(0.5) });
      const o = { c: shown };
      gsap.to(o, { c: 100 * p, duration: D(0.5), onUpdate: () => { const n = Math.round(o.c); if (n > shown) { shown = n; pct.textContent = n; } } });
    };
    const list = BB.$$("[data-preload]").map((e) => e.getAttribute("data-preload"));
    if (!window.createjs || !createjs.LoadQueue || !list.length || location.protocol === "file:") { progress(1); return finish(); }
    const q = new createjs.LoadQueue(true);
    q.on("progress", (e) => progress(e.progress));
    q.on("complete", finish);
    q.on("error", () => {});
    q.loadManifest(list.map((src, i) => ({ id: "m" + i, src, type: createjs.Types ? createjs.Types.BINARY : "binary" })));
  }

  /* ---------- Section registration · transition (transition library 1.0.0) ---------- */
  const page = () => BB.$("#js-wrapper").getAttribute("data-page");
  BB.before = (name) => {
    BB.vars.pageName = name;
    document.body.setAttribute("data-page", name);
    BB.pages[name] && BB.pages[name].before && BB.pages[name].before();
  };
  BB.init = (name) => {
    BB.pages[name] && BB.pages[name].init && BB.pages[name].init();
    A.hoverText(document);
    BB.objs.cursor && BB.objs.cursor.update();
    if (!BB.flags.isLoaded) {
      A.menuBtnIn();
      if (BB.isDesktop) gsap.to([".dragger-wrap", "#js-background-sound-toggle-btn"], { autoAlpha: 1, duration: D(1), ease: "none" });
      BB.flags.isLoaded = true;
    }
  };
  function router() {
    if (!window.Barba || location.protocol === "file:") return;
    Barba.Pjax.Dom.wrapperId = "js-container";
    Barba.Pjax.Dom.containerClass = "l-wrapper";
    Barba.Pjax.Dom.dataNamespace = "page";
    Barba.Pjax.ignoreClassLink = "no-ajax";
    Barba.Pjax.cacheEnabled = false;
    Barba.Utils.xhrTimeout = 5000;
    const T = Barba.BaseTransition.extend({
      start() { Promise.all([this.newContainerLoading, this.loading()]).then(this.loaded.bind(this)); },
      loading() {
        const dfd = Barba.Utils.deferred(), old = this.oldContainer, name = old.getAttribute("data-page");
        BB.flags.isTransition = true;
        gsap.set("#js-content-mask", { autoAlpha: 1 });
        if (BB.isDesktop) { A.disableAttractors(old); BB.objs.cursor.morphDefault(0.5); }
        const delay = BB.flags.isGlobalMenu ? 800 : 0;
        if (BB.flags.isGlobalMenu) BB.objs.menu.close();
        BB.wait(delay, () => { BB.pages[name] && BB.pages[name].out && BB.pages[name].out(old); dfd.resolve(); });
        return dfd.promise;
      },
      loaded() {
        const oldW = this.oldContainer.querySelector(".l-transition-wrapper"), newW = this.newContainer.querySelector(".l-transition-wrapper"), name = this.newContainer.getAttribute("data-page");
        const oldName = this.oldContainer.getAttribute("data-page");
        gsap.set(newW, { autoAlpha: 0 });
        gsap.to(oldW, { autoAlpha: 1, zIndex: 0, duration: D(1), ease: "none" });
        // A fromTo with length 0 calls the end immediately even with a delay — so just set the position and split into a call 1s later
        gsap.set(newW, { autoAlpha: 0, position: "fixed", zIndex: 1, inset: 0 });
        gsap.delayedCall(D(1), () => {
          gsap.set(newW, { clearProps: "position,inset" });
          // Remove the old section after the exit animation (1s) ends, just before the new section is set up
          BB.pages[oldName] && BB.pages[oldName].destroy && BB.pages[oldName].destroy();
          BB.before(name);
          if (name !== "backstage") gsap.fromTo(".g-center-line", { transformOrigin: "0% 50%", scaleX: 0 }, { scaleX: 1, duration: D(1.5), ease: "quint.inOut" });
          gsap.fromTo(newW, { autoAlpha: 0 }, { autoAlpha: 1, duration: D(0.5), ease: "none", onComplete: () => {
            gsap.set(newW, { clearProps: "transform,opacity,zIndex,visibility" });
            BB.init(name);
            gsap.to("#js-content-mask", { autoAlpha: 0, duration: D(0.1), delay: D(0.4), onComplete: () => { BB.flags.isTransition = false; } });
          } });
          this.done();
        });
      },
    });
    Barba.Pjax.getTransition = () => T;
    Barba.Pjax.start();
  }
  BB.go = (href) => { if (window.Barba && location.protocol !== "file:") Barba.Pjax.goTo(href); else location.href = href; };

  function boot() {
    brushMask();
    BB.objs.cursor = new Cursor();
    BB.objs.cursor.init();
    BB.objs.menu = new Menu();
    BB.objs.menu.init();
    BB.objs.sound = new Sound();
    BB.objs.sound.init();
    const bgEl = BB.$("#js-background-canvas"), urls = BB.$$("[data-bg-video]").map((e) => e.getAttribute("data-bg-video"));
    if (location.protocol === "file:") BB.objs.bg = fileBackground(bgEl, urls);
    else { BB.objs.bg = new BackgroundCanvas(bgEl, urls); BB.objs.bg.init(); }
    const name = page();
    BB.before(name);
    loader(() => { BB.init(name); router(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
