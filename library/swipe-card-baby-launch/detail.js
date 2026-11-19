// Product detail — three splide 4 sliders (photos: loop·autoplay·600ms cubic-bezier(.33,1,.68,1) / where to buy·recommended: autoWidth·gap 2rem), purchase tabs, wave menu (three.js with our shader)
(() => {
  const { lenis, sp, reduce, scrollToY } = window.bsSite || {};
  const EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
  const pad = (n) => String(n).padStart(2, "0");

  // Prev/next capsules — fade out when they reach the end
  const wire = (root, splide, loop = false) => {
    const prev = root.querySelector(".bd-ctrl .prev"), next = root.querySelector(".bd-ctrl .next");
    if (!prev || !next) return;
    prev.addEventListener("click", () => splide.go("<"));
    next.addEventListener("click", () => splide.go(">"));
    if (loop) return;
    const sync = () => {
      const end = splide.Components.Controller.getEnd();
      prev.disabled = splide.index <= 0;
      next.disabled = splide.index >= end;
    };
    splide.on("mounted move refresh", sync);
    sync();
  };

  const gallery = document.querySelector(".bd-fv__gallery");
  if (gallery && window.Splide) {
    const s = new Splide(gallery, { type: "loop", arrows: false, pagination: false, perMove: 1, perPage: 1, clones: 2, autoplay: !reduce, pauseOnFocus: false, pauseOnHover: false, easing: EASE, speed: 600 });
    const cur = gallery.querySelector(".current"), bar = gallery.querySelector(".progress");
    gallery.querySelector(".total").textContent = pad(gallery.querySelectorAll(".splide__list > .splide__slide").length);
    s.on("move", () => { cur.textContent = pad(s.index + 1); });
    s.on("autoplay:playing", (rate) => bar.style.setProperty("--progress", rate));
    s.mount();
    wire(gallery, s, true);
  }
  const shop = document.querySelector(".bd-shopping__slider");
  if (shop && window.Splide) {
    const s = new Splide(shop, { type: "slide", arrows: false, pagination: false, autoWidth: true, gap: "2rem", easing: EASE, speed: 600, trimSpace: false, perPage: sp?.matches ? 1 : 2, perMove: 1 }).mount();
    wire(shop, s);
  }
  const rec = document.querySelector(".bd-rec__slider");
  if (rec && window.Splide) {
    const s = new Splide(rec, { type: "slide", arrows: false, pagination: false, autoWidth: true, gap: "2rem", easing: EASE, speed: 600, trimSpace: false, perPage: sp?.matches ? 1 : 4, perMove: 1 }).mount();
    wire(rec, s);
  }
  const menuRec = document.querySelector(".bd-menu__rec");
  let menuSplide = null;
  if (menuRec && window.Splide) {
    menuSplide = new Splide(menuRec, { type: "slide", arrows: false, pagination: false, autoWidth: true, gap: "2rem", easing: EASE, speed: 600, trimSpace: false, perPage: sp?.matches ? 3 : 5, perMove: 1 }).mount();
    wire(menuRec, menuSplide);
  }

  // Buy tab — appears after scrolling past the buy strip, and jumps back to it on click
  const nav = document.querySelector(".bd-shopnav");
  if (nav) {
    nav.querySelector("button").addEventListener("click", () => scrollToY ? scrollToY("#shopping", document.querySelector(".bd-header header").offsetHeight) : null);
    // The original is start top top · end bottom bottom, but the purchase strip is shorter than the screen so the end is pulled to the start — same as appearing once the start is passed
    ScrollTrigger.create({ trigger: ".bd-shopping", start: "top top", onEnter: () => nav.classList.remove("is-hidden"), onLeaveBack: () => nav.classList.add("is-hidden") });
  }
  document.querySelector(".bd-footer__bottom .to-top")?.addEventListener("click", () => scrollToY?.(0));

  // Menu — a background photo (a placeholder drawn on a canvas) fills the screen panel, and only the inside of ring ripples spreading from three corners is visible.
  // The ripple ring wraps height sin(distance·33·(1−progress))·.01 in distance windows (−.5~−.2, 0~−.1) and refracts the photo by its slope, and the edge is shaken with noise
  const menu = document.querySelector(".bd-menu");
  const btn = document.querySelector(".bd-menu-btn");
  const header = document.querySelector(".bd-header");
  const canvas = menu?.querySelector(".bd-menu__gl");
  let gl = null;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const makeTexture = () => {
    const c = document.createElement("canvas");
    c.width = 1600; c.height = 1000;
    const g = c.getContext("2d");
    const bg = g.createLinearGradient(0, 0, 1600, 1000);
    bg.addColorStop(0, css("--kf-accent-text")); bg.addColorStop(1, css("--kf-contrast-bg"));
    g.fillStyle = bg; g.fillRect(0, 0, 1600, 1000);
    const bowl = g.createRadialGradient(520, 520, 40, 520, 520, 480);
    bowl.addColorStop(0, css("--kf-accent-soft")); bowl.addColorStop(.7, css("--kf-accent")); bowl.addColorStop(1, css("--kf-accent-text"));
    g.fillStyle = bowl; g.beginPath(); g.arc(520, 520, 470, 0, Math.PI * 2); g.fill();
    g.fillStyle = css("--kf-surface"); g.globalAlpha = .18;
    for (let i = 0; i < 14; i++) { const a = i * 0.9, r = 120 + (i % 4) * 80; g.beginPath(); g.ellipse(520 + Math.cos(a) * r, 520 + Math.sin(a) * r, 90, 26, a, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = css("--kf-surface");
    g.font = `28px ${css("--kf-font-mono")}`;
    g.fillText(canvas.dataset.label || "", 80, 960);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const initGL = () => {
    if (gl || !window.THREE || !canvas) return gl;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const centers = sp?.matches ? [[0.5, -1.2], [1, 1], [-1.2, 0.7]] : [[-1, 1], [1, 1], [-0.5, -1.2]];
    const uniforms = {
      map: { value: makeTexture() }, cover: { value: new THREE.Vector2(1, 1) }, aspect: { value: 1 }, time: { value: 0 },
      speed: { value: sp?.matches ? 3.2 : 4 }, centers: { value: centers.map((c) => new THREE.Vector2(c[0], c[1])) }, progress: { value: [0, 0, 0] },
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        uniform sampler2D map; uniform vec2 cover; uniform float aspect, time, speed; uniform vec2 centers[3]; uniform float progress[3];
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
        float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
        vec2 field(vec2 p){
          float h = 0.0, t = 0.0;
          for (int i = 0; i < 3; i++) {
            float d = length((p - centers[i]) * vec2(aspect, 1.0)) - progress[i] * speed;
            h += sin(d * 33.0 * (1.0 - progress[i])) * 0.01 * smoothstep(-0.5, -0.2, d) * smoothstep(0.0, -0.1, d);
            t += smoothstep(0.0, -0.1, d - (vnoise(p * 4.0) - 0.5) * 0.12);
          }
          return vec2(h, min(t, 1.0));
        }
        void main(){
          vec2 p = vUv * 2.0 - 1.0; float e = 0.004;
          vec2 f = field(p);
          float hx = field(p + vec2(e, 0.0)).x - f.x, hy = field(p + vec2(0.0, e)).x - f.x;
          vec3 n = normalize(vec3(-hx / e, -hy / e, 1.0));
          vec2 uv = (vUv - 0.5) * cover + 0.5 + n.xy * 0.05;
          vec4 c = texture2D(map, uv);
          float shimmer = smoothstep(0.55, 0.95, vnoise(vec2(atan(p.y - 1.0, p.x + 1.3) * 6.0 - time * 0.4, time * 0.2)));
          c.rgb = mix(c.rgb, c.rgb * 1.6, shimmer * 0.25 * smoothstep(0.9, 0.2, length(p - vec2(-0.4, 0.0))));
          gl_FragColor = vec4(c.rgb * n.z, f.y);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    const resize = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      uniforms.aspect.value = w / h;
      const ta = 1.6, va = w / h;
      uniforms.cover.value.set(va < ta ? va / ta : 1, va < ta ? 1 : ta / va);
    };
    resize();
    addEventListener("resize", resize);
    const clock = new THREE.Clock(false);
    const tick = () => { uniforms.time.value += clock.getDelta(); renderer.render(scene, camera); };
    gl = {
      uniforms,
      start() { clock.start(); renderer.setAnimationLoop(tick); },
      stop() { clock.stop(); renderer.setAnimationLoop(null); },
    };
    return gl;
  };

  let openTl = null;
  const open = () => {
    // Button and header colors apply on press — building the WebGL panel for the first time comes after
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    header.classList.add("is-light");
    if (!gl) { requestAnimationFrame(() => requestAnimationFrame(reveal)); return; }
    reveal();
  };
  const reveal = () => {
    const g = initGL();
    menu.classList.remove("is-hidden");
    lenis?.stop();
    menuSplide?.refresh();
    openTl?.kill();
    openTl = gsap.timeline();
    openTl.set(menu, { opacity: 1 });
    if (g) {
      g.start();
      const prog = { a: 0, b: 0, c: 0 };
      const keys = ["a", "b", "c"];
      const apply = () => { g.uniforms.progress.value = keys.map((k) => prog[k]); };
      if (reduce) { keys.forEach((k) => { prog[k] = 1; }); apply(); }
      else keys.forEach((k, i) => openTl.fromTo(prog, { [k]: 0 }, { [k]: 1, duration: sp?.matches ? 2 : 1.8, ease: "power1.out", onUpdate: apply }, i * (sp?.matches ? 0.23 : 0.2)));
    }
    // The original inserts three waves (length + 2 sequences) as one chunk and turns on the list at 20% of it
    openTl.fromTo(menu.querySelector(".bd-menu__contents"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, reduce ? 0 : (sp?.matches ? 2 + 2 * 0.23 : 1.8 + 2 * 0.2) * 0.2);
  };
  const close = () => {
    lenis?.start();
    openTl?.kill();
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    header.classList.remove("is-light");
    gsap.to(menu, { opacity: 0, duration: 0.3, ease: "power1.out", onComplete: () => { menu.classList.add("is-hidden"); gl?.stop(); } });
  };
  btn?.addEventListener("click", () => (btn.classList.contains("is-open") ? close() : open()));
  // WebGL plates and background pictures are prebuilt at idle — building on press would delay the button response
  addEventListener("load", () => (window.requestIdleCallback || setTimeout)(() => initGL()), { once: true });

  // Page transition — the original uses barba to cover with a white overlay at .3s power1.out and then navigates. Ours goes to a different html, so it navigates after covering
  const cover = document.querySelector(".bd-cover");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !cover || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || a.getAttribute("href").startsWith("#")) return;
    e.preventDefault();
    if (reduce) { location.href = url.href; return; }
    gsap.set(cover, { visibility: "visible" });
    gsap.fromTo(cover, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out", onComplete: () => { location.href = url.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted && cover) gsap.set(cover, { opacity: 0, visibility: "hidden" }); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && btn?.classList.contains("is-open")) close(); });
})();
