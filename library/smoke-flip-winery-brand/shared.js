// Shared by all pages: draws in nav·menu, and sets up Lenis·smoke shader (ogl + flow map)·hover smoke card·text splitting·page transition (swup).
// Original values: Lenis 1.3.3 lerp .3 (phone .6) · wheel ×.5 · touch ×1.4 · nav 1s power2.inOut after 3s · menu cells 1s, .2s apart
// · smoke fbm 7 layers (amplitude .5 · frequency 1 · gain .45) · smoothstep .1 · flow map decay .99 · radius .3 · push ×.05 · scroll smoke time ×.01/s, hover ×.05/s
// · hover smoke progresses to .9 in 1.6s power2.out / to 0 in 1.6s power1.out · page transition swup 4.8.2 transition-fade .3s.
// Page-specific items live under MW.page.<Name>(container) attaches it, and the returned function, MW.on, MW.tick and ScrollTrigger are released on page change.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  // Original window.isMobile is decided by device, not width (phone or tablet UA, or a Mac with touch) — in that case the title is not split, and,
  // Turn off hover shaders, mouse flow, detail-window parallax and the photo contrast filter. A narrowed desktop window stays desktop
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  root.classList.add(isMobile ? "is-mobile" : "is-desktop");
  const MW = (window.MW = { reduced, touch, isMobile, lenis: null, page: {} });

  // ---------- Things removed on transition ----------
  let pageOff = [];
  MW.on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    pageOff.push(() => target.removeEventListener(type, fn, opts));
  };
  MW.tick = (fn) => {
    gsap.ticker.add(fn);
    pageOff.push(() => gsap.ticker.remove(fn));
  };
  // The original flow map (point cloud · smoke) is drawn and dispersed only in a loop (onRAF) locked to 30fps — because the decay .8·.99 is multiplied each frame
  // At 60fps it vanishes twice as fast. The screen draws every tick and only the flow-map steps follow the original tempo
  MW.flowClock = () => {
    const step = 1000 / 30;
    let last = performance.now();
    return () => {
      const now = performance.now(), d = now - last;
      if (d < step) return false;
      last = now - (d % step);
      return true;
    };
  };

  // ---------- Reading skin colors: variable name → [r,g,b] (color-mix · oklch are painted and read back too) ----------
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  MW.rgb = (v) => {
    if (!v || v === "transparent") return null;
    const el = document.createElement("i");
    el.style.color = v.startsWith("--") ? `var(${v})` : v;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const cssVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const css = (rgb) => `rgb(${rgb.map((x) => Math.round(x * 255)).join(",")})`;
  // Photo slots the shader blends — like .wf-img in wire.css, it draws the surface, two diagonals and a center label on a canvas. Real photos are supplied via data-*-image
  MW.placeholder = (label, { light = false, w = 1280, h = 800 } = {}) => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d");
    const fill = MW.rgb(light ? "--site-paper-e6" : "--site-grey-1b");
    const line = MW.rgb(light ? "--site-paper-c8" : "--site-grey-33");
    const ink = MW.rgb(light ? "--site-paper-6f" : "--site-grey-8a");
    g.fillStyle = css(fill);
    g.fillRect(0, 0, w, h);
    g.strokeStyle = css(line);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(w, h);
    g.moveTo(w, 0);
    g.lineTo(0, h);
    g.stroke();
    g.fillStyle = css(ink);
    g.textAlign = "center";
    g.textBaseline = "middle";
    // On a portrait phone screen only about the middle 1/4 of a landscape image is visible (cover), so wrap the label into a narrow strip in the center.
    const size = Math.round(h * 0.026);
    g.font = `400 ${size}px ${cssVar("--kf-font-sans") || "sans-serif"}`;
    const lines = [];
    let row = "";
    for (const word of (label || "").split(" ")) {
      const next = row ? row + " " + word : word;
      if (row && g.measureText(next).width > w * 0.24) (lines.push(row), (row = word));
      else row = next;
    }
    row && lines.push(row);
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.4));
    return cv;
  };

  // ---------- Nav·menu ----------
  // A placeholder mark newly drawn with three diagonal strokes instead of the original logo
  const logo = '<svg viewBox="0 0 32 26" aria-hidden="true"><path d="M1 25 11 1l10 24M8 25 18 1l10 24M15 25 25 1l6 14"/></svg>';
  const arrow = '<svg viewBox="0 0 20 8" aria-hidden="true"><path d="M0 4h19M15.5.5 19 4l-3.5 3.5"/></svg>';
  const pages = [
    { href: "index.html", label: "Your label 1 here", a: "Headline", b: "& Subtitle", id: "home" },
    { href: "list.html", label: "Your label 2 here", a: "Collection", b: "& Subtitle", id: "list" },
    { href: "#", label: "Your label 3 here", a: "Third Page", b: "& Subtitle", id: "more" },
  ];
  MW.pages = pages;

  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.classList.add("mw-nav");
    nav.innerHTML = `
      <a class="mw-nav__logo" href="index.html" aria-label="Home">${logo}</a>
      <button class="mw-nav__menu" type="button">Menu</button>
      <button class="mw-nav__burger" type="button" aria-label="Open Menu"><span></span></button>`;
  }
  const menu = document.querySelector('[data-slot="menu"]');
  if (menu) {
    menu.classList.add("mw-menu");
    menu.innerHTML = `
      <div class="mw-menu__bg"><div class="wf-img mw-img" data-label="Menu background · black-and-white vineyard hill · blurred 40px · landscape 16:9"></div></div>
      <div class="mw-container">
        <div class="mw-menu__grid">
          <div class="mw-menu__col mw-menu__intro">
            <div class="mw-menu__intro-top">
              <p class="mw-p-500">Your two lines of contact info here.</p>
              <a class="mw-button" href="#">Send<span class="mw-button__arrows">${arrow}${arrow}</span></a>
            </div>
            <div>
              <nav class="mw-menu__sub mw-p-500"><a href="#">Menu 1</a><a href="#">Menu 2</a><a href="#">Menu 3</a></nav>
              <div class="mw-menu__lang mw-p-500"><a class="is-off" href="#">EN</a><a class="is-on" href="#">KO</a></div>
            </div>
          </div>
          <div class="mw-menu__main">
            ${pages
              .map(
                (p) => `<a class="mw-menu__col mw-card" data-hover-smoke href="${p.href}">
                  <p class="mw-p-500">${p.label}</p>
                  <h2 class="mw-menu__title" data-label="Your page name in English here — the first word, then an italic word after the &"><span>${p.a}</span><i>${p.b}</i></h2>
                </a>`
              )
              .join("")}
          </div>
        </div>
      </div>`;
  }
  const setMenu = (open) => {
    root.classList.toggle("has-menu-open", open);
    if (MW.lenis) open ? MW.lenis.stop() : MW.lenis.start();
  };
  MW.closeMenu = () => setMenu(false);
  document.querySelectorAll(".mw-nav__menu, .mw-nav__burger").forEach((b) =>
    b.addEventListener("click", () => setMenu(!root.classList.contains("has-menu-open")))
  );
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  // Each time a card is entered, reshuffle the delay of the title letter chunks among .1/.2/.3s
  const shuffle = (card) => {
    const d = ["0.1s", "0.2s", "0.3s"].sort(() => Math.random() - 0.5);
    card.querySelectorAll(".mw-menu__title span, .mw-menu__title i").forEach((el, i) => el.style.setProperty("--delay", d[i]));
  };
  document.querySelectorAll(".mw-menu .mw-card").forEach((c) => {
    shuffle(c);
    c.addEventListener("mouseenter", () => !isMobile && shuffle(c));
  });

  // ---------- Smoke shader (ogl) ----------
  const { Renderer, Program, Mesh, Triangle, Flowmap, Vec2, Texture } = OGL;
  const VERT = /* glsl */ `attribute vec2 uv;attribute vec2 position;varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`;
  const FRAG = /* glsl */ `precision highp float;
varying vec2 vUv;
uniform sampler2D t_flow, t_start, t_end;
uniform vec2 u_res, u_start_size, u_end_size;
uniform float u_time, u_progress, u_alpha, u_seed, u_amp, u_freq, u_smooth, u_scale_image;
uniform float u_has_start, u_has_end, u_contain, u_start_clear, u_hover;
uniform vec3 u_start_color, u_end_color, u_light;

// 2D simplex noise — adds the gradients of the three corners of a triangular grid with a falloff radius of .5
vec2 grad(vec2 p){
  float h = fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453) * 6.2831853;
  return vec2(cos(h), sin(h));
}
float snoise(vec2 p){
  const float F = .366025404, G = .211324865;
  vec2 i = floor(p + (p.x + p.y) * F);
  vec2 a = p - i + (i.x + i.y) * G;
  vec2 o = a.x > a.y ? vec2(1., 0.) : vec2(0., 1.);
  vec2 b = a - o + G, c = a - 1. + 2. * G;
  vec3 w = max(.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.);
  w = w * w; w = w * w;
  return 70. * dot(w, vec3(dot(a, grad(i)), dot(b, grad(i + o)), dot(c, grad(i + 1.))));
}
// 7 layers · frequency ×2 · amplitude ×.45, divided by the layer count to fit the range
float fbm(vec2 p){
  float v = 0., amp = u_amp, f = u_freq;
  for (int k = 0; k < 7; k++) { v += amp * snoise(p * f); f *= 2.; amp *= .45; }
  return v / max((1. - pow(.45, 7.)) / .55, .5);
}
vec2 cover(vec2 uv, vec2 size, float contain){
  float sa = u_res.x / u_res.y, ia = size.x / size.y;
  uv -= .5;
  if (contain > .5) { if (sa > ia) uv.x /= ia / sa; else uv.y /= sa / ia; uv /= u_scale_image; }
  else { if (sa > ia) uv.y /= sa / ia; else uv.x /= ia / sa; }
  return uv + .5;
}
void main(){
  vec3 flow = texture2D(t_flow, vUv).rgb;
  float asp = u_res.x / u_res.y;
  vec2 c = vUv - .5;
  if (asp > 1.) c.x *= asp; else c.y /= asp;
  vec2 uv = (c + .5) * .5 + flow.xy * .05;
  float t = u_time;
  vec2 nd = vec2(snoise(vec2(u_seed, u_seed * .1)), snoise(vec2(u_seed, 123.456 + u_seed * .1)));
  vec2 dir = normalize(mix(vec2(.707), nd / max(length(nd), .2), .7));
  vec2 drift = dir * t * .5;
  vec2 o1 = drift + vec2(cos(t * .7 + u_seed), sin(t * .9 + u_seed)) * .3;
  vec2 o2 = -drift * .8 + vec2(sin(t * .5 + u_seed), cos(t * .3 + u_seed)) * .2;
  float n1 = fbm(uv + o1 + u_seed * .1);
  float n2 = fbm(uv + vec2(43.235, 21.123) + u_seed * .1 + o2);
  float n = fbm(uv + vec2(n1, n2) * 2. + u_seed * .05);
  n = pow(max(n * .5 + .5, 0.), 1.5) * 2. - 1.;

  float m;
  if (u_progress <= 1.) {
    float cut = mix(1., -1., u_progress);
    m = smoothstep(cut - u_smooth, cut + u_smooth, (1. - vUv.y) + n);
    if (u_progress <= .001) m = 0.;
  } else {
    float cut = mix(-1., 1., u_progress - 1.);
    m = smoothstep(cut - u_smooth, cut + u_smooth, vUv.y + n);
  }

  vec3 sc = u_start_color, ec = u_end_color;
  if (u_has_start > .5) sc = mix(u_start_color, texture2D(t_start, cover(vUv + flow.xy * .05, u_start_size, 0.)).rgb, 1. - m);
  if (u_has_end > .5) {
    vec2 e = cover(vUv + flow.xy * .05, u_end_size, u_contain);
    vec3 img = texture2D(t_end, e).rgb;
    if (u_contain > .5 && (e.x < 0. || e.x > 1. || e.y < 0. || e.y > 1.)) img = u_end_color;
    ec = mix(u_end_color, img, m);
  }
  vec3 col; float base;
  if (u_start_clear > .5) { col = ec; base = m; } else { col = mix(sc, ec, m); base = 1.; }
  // Brightness beyond progress (1~3): light overflows and washes out to white
  if (u_alpha > 1.) {
    float over = u_alpha - 1.;
    col = clamp(mix(col * (1. + over * 1.5), u_light, over * .5), 0., 1.);
  }
  // Opacity spreads out from the same noise — 0 is all empty, 1 is all full
  float ac = mix(2., -2., min(u_alpha, 1.));
  float a = smoothstep(ac - .5, ac + .5, n * 2.) * base;
  gl_FragColor = vec4(col, a);
}`;

  const smokes = new Set();
  let pageSmokes = null;
  const mouse = { x: 0, y: 0, has: false };
  // Original c-shader: touch devices listen only to touchstart and touchmove, otherwise only mousemove
  if (!("ontouchstart" in window)) addEventListener("mousemove", (e) => ((mouse.x = e.clientX), (mouse.y = e.clientY), (mouse.has = true)), { passive: true });
  else if (!isMobile) {
    const t = (e) => e.changedTouches[0] && ((mouse.x = e.changedTouches[0].clientX), (mouse.y = e.changedTouches[0].clientY), (mouse.has = true));
    addEventListener("touchstart", t, { passive: true });
    addEventListener("touchmove", t, { passive: true });
  }
  let scrollVelocity = 0;

  class Smoke {
    // host: element to hold the canvas · start/end: skin variable names ("--kf-bg") or "transparent"
    // hover: original c-hover-shader (time ×5 faster, mouse relative to the element) · images: { start, end, startLabel, endLabel, light }
    constructor(canvas, o = {}) {
      this.canvas = canvas;
      this.o = { start: "transparent", end: "--kf-ink", alpha: 1, progress: 0, amp: 0.5, ...o };
      this.hover = !!o.hover;
      this.always = !!o.always;
      this.velocityInfluence = !!o.velocityInfluence;
      this.multiplier = 1;
      this.t0 = performance.now();
      this.mouse = new Vec2(0, 0);
      this.vel = new Vec2(-1, -1);
      this.last = null;
      const renderer = (this.renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 1), antialias: true, alpha: true }));
      const gl = (this.gl = renderer.gl);
      this.flowmap = new Flowmap(gl, { dissipation: 0.99, alpha: 1, falloff: 0.3 });
      this.flowDue = MW.flowClock();
      const tex = (src, label) => {
        if (!src && !label) return null;
        const t = new Texture(gl, { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });
        if (src) {
          const img = new Image();
          img.onload = () => ((t.image = img), (t.size = [img.width, img.height]), this.syncImages());
          img.src = src;
        } else {
          const cv = MW.placeholder(label, { light: o.images.light });
          t.image = cv;
          t.size = [cv.width, cv.height];
        }
        return t;
      };
      const im = o.images || {};
      this.startTex = tex(im.start, im.startLabel);
      this.endTex = tex(im.end, im.endLabel);
      const empty = new Texture(gl);
      const rgb = (v) => MW.rgb(v) || [0, 0, 0];
      this.program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms: {
          t_flow: this.flowmap.uniform,
          t_start: { value: this.startTex || empty },
          t_end: { value: this.endTex || empty },
          u_res: { value: [1, 1] },
          u_start_size: { value: (this.startTex && this.startTex.size) || [1, 1] },
          u_end_size: { value: (this.endTex && this.endTex.size) || [1, 1] },
          u_time: { value: 0 },
          u_progress: { value: 0 },
          u_alpha: { value: 1 },
          u_seed: { value: Math.random() * 1000 },
          u_amp: { value: 0.5 },
          u_freq: { value: 1 },
          u_smooth: { value: 0.1 },
          u_scale_image: { value: o.scaleImage || 1 },
          u_has_start: { value: this.startTex ? 1 : 0 },
          u_has_end: { value: this.endTex ? 1 : 0 },
          u_contain: { value: o.contain ? 1 : 0 },
          u_start_clear: { value: this.o.start === "transparent" ? 1 : 0 },
          u_start_color: { value: rgb(this.o.start) },
          u_end_color: { value: rgb(this.o.end) },
          u_light: { value: rgb("--site-paper") },
        },
      });
      this.mesh = new Mesh(gl, { geometry: new Triangle(gl), program: this.program });
      this.resize();
      this.io = new IntersectionObserver(([en]) => (this.visible = en.isIntersecting));
      this.io.observe(canvas);
      smokes.add(this);
      if (pageSmokes) pageSmokes.add(this);
    }
    syncImages() {
      const u = this.program.uniforms;
      if (this.startTex) u.u_start_size.value = this.startTex.size || [1, 1];
      if (this.endTex) u.u_end_size.value = this.endTex.size || [1, 1];
    }
    resize() {
      // ogl Renderer fixes the canvas style in pixels, so release it before measuring
      this.canvas.style.width = this.canvas.style.height = "";
      const r = (this.bcr = this.canvas.getBoundingClientRect());
      if (!r.width || !r.height) return;
      const asp = r.width / r.height;
      // As in the original, caps the long side at 1800
      let w = r.width, h = r.height;
      if (w > 1800) (w = 1800), (h = 1800 / asp);
      if (h > 1800) (h = 1800), (w = 1800 * asp);
      this.renderer.setSize(w, h);
      // Like original resize, stretches the drawn board (≤1800) to screen-size px
      this.canvas.style.width = `${r.width}px`;
      this.canvas.style.height = `${r.height}px`;
      this.flowmap.aspect = asp;
      this.program.uniforms.u_res.value = [w, h];
    }
    // Original updateMouse: position relative to the element (0~1, top is 1), and velocity = -distance/time (min 10.4ms)
    follow() {
      if (!mouse.has || isMobile) return;
      const r = this.canvas.getBoundingClientRect();
      const x = mouse.x - (this.hover ? r.left : 0), y = mouse.y - r.top;
      if (this.last && this.last.x === x && this.last.y === y) return;
      this.mouse.set(x / (this.bcr.width || 1), 1 - y / (this.bcr.height || 1));
      const now = performance.now();
      if (!this.last) this.last = { x, y, t: now };
      const dt = Math.max(10.4, now - this.last.t);
      this.vel.set(-(x - this.last.x) / dt, -(y - this.last.y) / dt);
      this.last = { x, y, t: now };
    }
    render() {
      const u = this.program.uniforms, o = this.o;
      const sec = (performance.now() - this.t0) / 1000;
      u.u_time.value = reduced ? 0 : sec * (this.hover ? 0.05 : 0.01);
      u.u_progress.value = o.progress;
      u.u_alpha.value = Math.max(0, o.alpha);
      if (this.velocityInfluence && !isMobile) {
        const want = 1 + Math.abs(scrollVelocity) * 0.05 * o.progress * 2;
        this.multiplier += (want - this.multiplier) * 0.05;
        u.u_amp.value = Math.min(1.5, o.amp * this.multiplier);
      }
      // With reduced motion the flow map is never captured, so the smear stays at 0
      if (!reduced) {
        this.follow();
        if (this.flowDue()) {
          this.flowmap.mouse.copy(this.mouse);
          this.flowmap.velocity.lerp(this.vel, this.vel.len() ? 0.15 : 0.1);
          this.flowmap.update();
        }
      }
      this.renderer.render({ scene: this.mesh });
    }
    destroy() {
      smokes.delete(this);
      this.io.disconnect();
      const lose = this.gl.getExtension("WEBGL_lose_context");
      lose && lose.loseContext();
    }
  }
  MW.Smoke = Smoke;
  gsap.ticker.add(() => {
    for (const s of smokes) {
      if (!s.visible) continue;
      // A hover delay at progress 0 is cleared once, then rests
      if (s.hover && !s.always && s.o.progress <= 0) {
        if (!s.cleared) (s.render(), (s.cleared = true));
        continue;
      }
      s.cleared = false;
      s.render();
    }
  });
  let rsT;
  addEventListener("resize", () => {
    clearTimeout(rsT);
    rsT = setTimeout(() => smokes.forEach((s) => s.resize()), 150);
  });

  // One set of scroll shaders: sticky canvas + progress range + opacity range (original scroll · scrollAlpha · scrollAlphaReverse · scrollAlphaBright)
  MW.scrollShader = (wrap) => {
    const cv = wrap.querySelector("canvas");
    const d = wrap.dataset;
    const s = new Smoke(cv, {
      start: d.start || "--kf-bg",
      end: d.end || "--kf-ink",
      alpha: d.alpha != null ? +d.alpha : 0,
      velocityInfluence: "velocity" in d,
      images: d.startLabel || d.endLabel || d.startImage || d.endImage
        ? { start: d.startImage, end: d.endImage, startLabel: d.startLabel, endLabel: d.endLabel, light: "light" in d }
        : null,
      always: true,
    });
    const to = d.to ? +d.to : 1;
    const prog = wrap.querySelector(".mw-shader-target.-progress");
    // Original scroll module items: c-shader_wrap repeats (is-inview added on entry, removed on exit), c-shader runs once the first time it enters the progress cell
    // Original Shader.trigger(enter): on first entry, measure and fit the board (resize)
    let sized = false;
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", toggleClass: "is-inview", onToggle: (st) => st.isActive && !sized && ((sized = true), s.resize()) });
    const sticky = wrap.querySelector(".mw-shader");
    if (prog)
      ScrollTrigger.create({
        trigger: prog,
        start: d.progressStart || "top top",
        end: "bottom bottom",
        onEnter: () => sticky && sticky.classList.add("is-inview"),
        onUpdate: (st) => (s.o.progress = st.progress * to),
      });
    wrap.querySelectorAll("[data-alpha-mode]").forEach((t) => {
      const mode = t.dataset.alphaMode;
      ScrollTrigger.create({
        trigger: t,
        // Original scroll module defaults (start top bottom · end bottom top) — if the end is set to bottom bottom, a 100vh cell becomes a zero-length range and the opacity stalls at 0.
        start: t.dataset.alphaStart || "top bottom",
        end: t.dataset.alphaEnd || "bottom top",
        onUpdate: (st) => {
          if (mode === "in") s.o.alpha = st.progress;
          else if (mode === "out") s.o.alpha = 1 - st.progress;
          else if (mode === "bright") s.o.alpha = 1 + st.progress * 2;
        },
      });
    });
    return s;
  };

  // Hover haze on menu cards and next-page cells (original c-hover-shader): fills up to progress .9 — the original color differs per cell (menu black, next cell white and black)
  MW.hoverSmoke = (card) => {
    if (isMobile || card._smoke) return;
    const cv = document.createElement("canvas");
    cv.className = "mw-card__smoke";
    card.prepend(cv);
    const s = (card._smoke = new Smoke(cv, { start: "transparent", end: card.dataset.smoke || "--kf-bg", progress: 0, hover: true }));
    // Original c-hover-shader attaches mouseenter/leave to its own panel — on menu cards the text covers the panel, so it retreats while over the text (css)
    const hit = card.closest(".mw-menu") ? cv : card;
    hit.addEventListener("mouseenter", () => {
      gsap.to(s.o, { progress: 0.9, duration: reduced ? 0 : 1.6, ease: "power2.out", overwrite: true });
    });
    hit.addEventListener("mouseleave", () => {
      gsap.to(s.o, { progress: 0, duration: reduced ? 0 : 1.6, ease: "power1.out", overwrite: true });
    });
  };
  document.querySelectorAll(".mw-menu [data-hover-smoke]").forEach(MW.hoverSmoke);

  // ---------- Splitting text (original SplitTitle) ----------
  // Exactly the original SplitText Type: chars → .char>span · words,chars → .word>.char>span · lines,words → .line>.word>span · lines → .line>span.
  // Drawn values are css variables (--opacity·--y·--spacing·--translate) and GSAP only animates the variables — original habit (word hiding is done by the inner span
  // …is the same, down to the part that is invisible because it uses its own --opacity)
  const piece = (cls, text) => {
    const outer = document.createElement("span");
    outer.className = cls;
    outer.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.textContent = text;
    outer.append(inner);
    return [outer, inner];
  };
  MW.split = (el, type = "chars") => {
    if (el._split) return el._split;
    const kinds = type.split(",");
    const items = [], parents = [], words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) return frag.append(document.createTextNode(t));
          if (kinds.includes("words")) {
            if (kinds.includes("chars")) {
              const w = document.createElement("span");
              w.className = "word";
              [...t].forEach((c) => {
                const [o, i] = piece("char", c);
                w.append(o), parents.push(o), items.push(i);
              });
              frag.append(w);
            } else {
              const [o, i] = piece("word", t);
              frag.append(o), parents.push(o), items.push(i), words.push(o);
            }
          } else if (kinds.includes("lines")) {
            const w = document.createElement("span");
            w.className = "word";
            w.textContent = t;
            frag.append(w), words.push(w);
          } else
            [...t].forEach((c) => {
              const [o, i] = piece("char", c);
              frag.append(o), parents.push(o), items.push(i);
            });
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
    // Lines: group words by their drawn height (like the original SplitText after fonts load — the page waits for fonts before attaching)
    if (kinds.includes("lines") && words.length) {
      const rows = [];
      words.forEach((w) => {
        const top = Math.round(w.offsetTop);
        const row = rows[rows.length - 1];
        row && Math.abs(row.top - top) < 3 ? row.words.push(w) : rows.push({ top, words: [w] });
      });
      el.textContent = "";
      rows.forEach((r) => {
        const line = document.createElement("span");
        line.className = "line";
        if (kinds.includes("words"))
          r.words.forEach((w, k) => (k && line.append(document.createTextNode(" ")), line.append(w)));
        else {
          const inner = document.createElement("span");
          inner.textContent = r.words.map((w) => w.textContent).join(" ");
          line.append(inner), items.push(inner);
        }
        el.append(line);
        if (!kinds.includes("words")) parents.push(line);
      });
    }
    el.classList.add("is-split");
    return (el._split = { items, parents });
  };
  // Original SplitTitle: inner span --opacity 0→1 (.075 interval, with randomDuration the length is a random .4~1.8x) + letter spacing and offset go to 0 over the same length.
  // Hide: --opacity 1→0 over .8s on the outer layer (.char · .word · .line), and for the Type without words --y 0→-150% over 1.2s (power2.in, after hideDelay)
  MW.splitIn = (el, o = {}) => {
    // Original isMobile: no splitting. Opacity over .6s turns on for the whole title via is-inview added by the scroll module, and repeating items have it removed on leaving and switch off (css).
    // There is no scroll-driven hide (hideProgress)
    if (isMobile && !reduced) {
      const show = () => el.classList.add("is-inview");
      const tl = { play: show, restart: show, progress: () => (el.classList.contains("is-inview") ? 1 : 0) };
      return { tl, hide: { pause() {}, restart: () => el.classList.remove("is-inview"), progress() {} }, items: [] };
    }
    const type = el.dataset.type || o.type || "chars";
    const { items, parents } = MW.split(el, type);
    const dur = +(el.dataset.duration || o.duration || 0.8);
    const delay = reduced ? 0 : +(el.dataset.delay || o.delay || 0);
    const each = +(el.dataset.stagger || o.stagger || 0.075);
    const ease = "power2.out";
    const tl = gsap.timeline({ paused: true });
    if (el.dataset.random != null)
      items.forEach((it) => tl.fromTo(it, { "--opacity": 0 }, { "--opacity": 1, duration: reduced ? 0 : gsap.utils.random(dur * 0.4, dur * 1.8), delay, ease }, 0));
    else tl.fromTo(items, { "--opacity": 0 }, { "--opacity": 1, duration: reduced ? 0 : dur, delay, ease, stagger: { each: reduced ? 0 : each, from: el.dataset.from || "random" } }, 0);
    if (!/words|lines/.test(type)) tl.fromTo(el, { "--spacing": el.dataset.spacing || "0.3em" }, { "--spacing": "0em", duration: reduced ? 0 : dur, delay, ease }, 0);
    if (el.dataset.translate != null) tl.fromTo(el, { "--translate": `${parseFloat(el.dataset.translate)}%` }, { "--translate": "0%", duration: reduced ? 0 : dur, delay, ease }, 0);
    tl.progress(1).progress(0);
    const hd = +(el.dataset.hideDelay || 0);
    const hide = gsap.timeline({ paused: true });
    hide.fromTo(parents, { "--opacity": 1 }, { "--opacity": 0, duration: 0.8, ease: "power2.in", delay: hd }, 0);
    if (!type.includes("words")) hide.fromTo(parents, { "--y": "0%" }, { "--y": "-150%", duration: 1.2, ease: "power2.in", delay: hd }, 0);
    hide.progress(1).progress(0);
    if (reduced) tl.progress(1);
    // Original trigger(enter): reset the outside values, wind up the hiding, then start from the beginning. The is-inview class added by the scroll module is removed when a repeating item leaves
    const enter = () => (el.classList.add("is-inview"), gsap.set(parents, { "--opacity": 1, "--y": "0%" }), hide.pause(0), tl.restart(true));
    const hideApi = { pause: (t) => hide.pause(t), progress: (p) => hide.progress(p), restart: (d) => (el.classList.remove("is-inview"), hide.restart(d)) };
    return { el, tl, hide: hideApi, items, parents, enter };
  };
  // Original scroll module item: default range is its own element top bottom ~ bottom top. With repeat, it appears each time it enters and hides when it leaves,
  // Otherwise appears just once on first entry
  MW.splitOnScroll = (el, o = {}) => {
    const a = MW.splitIn(el, o);
    if (reduced) return a;
    const play = a.enter || (() => a.tl.restart(true));
    ScrollTrigger.create({
      trigger: o.trigger || el,
      start: o.start || "top bottom",
      end: o.end || "bottom top",
      once: !o.repeat,
      onEnter: play,
      onEnterBack: play,
      onLeave: () => o.repeat && a.hide.restart(),
      onLeaveBack: () => o.repeat && a.hide.restart(),
    });
    return a;
  };
  // Original FancyTitle: per-letter opacity 0→1, 1.6s power2.inOut, random order at .1 intervals
  MW.fancy = (el) => {
    const letters = el.querySelectorAll("[data-letter]");
    if (reduced) return;
    gsap.set(letters, { opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(letters, { opacity: 1, duration: 1.6, ease: "power2.inOut", stagger: { each: 0.1, from: "random" } }),
    });
  };
  // Original data-scroll-parallax-from/to: while passing through the target range, y goes from→to.
  MW.parallax = (el) => {
    const d = el.dataset;
    // Original data-scroll-progress-context: desktop is turned off on phone and tablet devices, mobile is turned off on desktop
    if ((d.context === "desktop" && isMobile) || (d.context === "mobile" && !isMobile)) return;
    gsap.fromTo(
      el,
      { y: d.from },
      { y: d.to, ease: "none", scrollTrigger: { trigger: d.target ? document.querySelector(d.target) : el, start: d.start || "top bottom", end: d.end || "bottom top", scrub: true } }
    );
  };
  // Original data-scroll-progress-css: passes section progress as --progress
  MW.progressCss = (el, o = {}) => {
    const d = el.dataset;
    ScrollTrigger.create({
      trigger: d.target ? document.querySelector(d.target) : el,
      start: d.start || o.start || "top bottom",
      end: d.end || o.end || "bottom top",
      onUpdate: (st) => el.style.setProperty("--progress", st.progress.toFixed(4)),
    });
  };

  // Hero title: once fonts are ready the label and two lines appear in turn, and fade as you leave the Hero
  MW.heroTitle = (c) => {
    const anims = [...c.querySelectorAll(".mw-hero__title-wrap .mw-split")].map((el) => MW.splitIn(el));
    // Original calls the title on has-dom-ready (after .4s), after the font is ready too
    const ready = new Promise((r) => gsap.delayedCall(reduced ? 0 : 0.4, r));
    Promise.all([document.fonts ? document.fonts.ready : null, ready]).then(() => anims.forEach((a) => (a.el && a.el.classList.add("is-inview"), a.tl.play())));
    if (reduced) return;
    // Original hideProgress: the #heroTarget top top ~ bottom center progress is wired straight into the hide timeline
    ScrollTrigger.create({
      trigger: c.querySelector("#heroTarget"),
      start: "top top",
      end: "bottom center",
      onUpdate: (st) => anims.forEach((a) => a.hide.progress(st.progress)),
    });
  };

  // ---------- Smooth scroll (original Lenis 1.3.3 values) ----------
  if (!reduced && window.Lenis) {
    const lenis = (MW.lenis = new Lenis({ smoothWheel: true, syncTouch: false, lerp: isMobile ? 0.6 : 0.3, wheelMultiplier: 0.5, touchMultiplier: 1.4, touchInertiaMultiplier: 5 }));
    lenis.on("scroll", ScrollTrigger.update);
    // Original window.scrollVelocity — read every frame so it returns to 0 when scrolling stops
    gsap.ticker.add((t) => (lenis.raf(t * 1000), (scrollVelocity = lenis.velocity)));
    gsap.ticker.lagSmoothing(0);
  }
  // ---------- Attaching·detaching pages ----------
  const container = () => document.querySelector("[data-swup-container]");
  let unmountPage = () => {};
  const mountPage = (c) => {
    pageOff = [];
    pageSmokes = new Set();
    const owned = pageSmokes;
    let off;
    const ctx = gsap.context(() => {
      c.querySelectorAll("[data-hover-smoke]").forEach(MW.hoverSmoke);
      const fn = MW.page[c.dataset.page];
      off = fn ? fn(c) : null;
    });
    pageSmokes = null;
    const offs = pageOff;
    unmountPage = () => {
      typeof off === "function" && off();
      offs.forEach((f) => f());
      owned.forEach((s) => s.destroy());
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
    document.readyState === "complete" ? ScrollTrigger.refresh() : addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  };

  // Only on a first visit does the nav come in after 3 seconds as in the original, pages reached from within the site come in immediately
  const visited = sessionStorage.getItem("mw-visited") === "1";
  root.style.setProperty("--nav-delay", reduced ? "0s" : visited ? "0.3s" : "3s");
  sessionStorage.setItem("mw-visited", "1");
  // Original App: .4s after attach, adds is-init (nav, once) and has-dom-ready (Hero reveal, per page) together, and has-dom-ready-callback after 1s
  gsap.delayedCall(reduced ? 0 : 0.4, () => {
    root.classList.add("is-init", "is-ready");
    gsap.delayedCall(reduced ? 0 : 1, () => root.classList.add("has-dom-ready-callback"));
  });
  MW.firstVisit = !visited;

  // Attach after the page scripts (index.js·list.js) are all loaded into MW.page
  // Line splitting divides by drawn lines, so attach it after the font loads (1.5s at most)
  const boot = () => {
    const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    fonts.then(() => {
      mountPage(container());
      const http = /^https?:$/.test(location.protocol);
      if (http && window.Swup) bootSwup();
      else bootFallback();
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : setTimeout(boot);

  // Original Transitions: swup 4.8.2 + prefetch + scroll plugin, transition-fade .3s, menu closes .3s after the exit
  function bootSwup() {
    const plugins = [];
    window.SwupPreloadPlugin && plugins.push(new SwupPreloadPlugin());
    window.SwupScrollPlugin &&
      plugins.push(new SwupScrollPlugin({ doScrollingRightAway: true, animateScroll: { betweenPages: true, samePageWithHash: true, samePage: true }, shouldResetScrollPosition: () => false }));
    // Swap in a different css per page (index.css, list.css) — the original has the bundle split and ship component css.
    window.SwupHeadPlugin && plugins.push(new SwupHeadPlugin({ persistAssets: false, awaitAssets: true }));
    const swup = (MW.swup = new Swup({
      containers: ["[data-swup-container]"],
      animateHistoryBrowsing: true,
      ignoreVisit: (url, { el } = {}) => !!el && (el.getAttribute("href") === "#" || el.closest("[data-no-swup]")),
      plugins,
    }));
    // Original leaves the smooth scroll empty — new pages start at the top
    swup.scrollTo = (y, animate = true) => {
      if (animate) return;
      MW.lenis ? MW.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
    };
    swup.hooks.on("link:click", () => root.classList.add("is-loading"), { priority: -100 });
    swup.hooks.on("link:self", () => gsap.delayedCall(0.01, () => (MW.closeMenu(), root.classList.remove("is-loading"))));
    swup.hooks.on("visit:start", () => root.classList.add("is-loading", "has-transition", "is-leaving"));
    swup.hooks.on("animation:out:start", () => gsap.delayedCall(0.3, MW.closeMenu));
    swup.hooks.on("animation:out:end", () => root.classList.remove("is-leaving", "is-ready", "has-dom-ready-callback"));
    swup.hooks.before("content:replace", () => unmountPage());
    swup.hooks.on("content:replace", () => {
      MW.lenis ? MW.lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
      mountPage(container());
    });
    swup.hooks.on("animation:in:start", () => {
      root.classList.remove("is-loading");
      gsap.delayedCall(0.4, () => (root.classList.add("is-ready"), gsap.delayedCall(1, () => (root.classList.add("has-dom-ready-callback"), root.classList.remove("has-transition")))));
    });
    swup.hooks.on("animation:in:end", () => ScrollTrigger.refresh());
  }
  // Opened via file://, swup can’t fetch the page — it blurs for the same .3s, then opens the real page
  function bootFallback() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
      const href = a.getAttribute("href");
      if (!/\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      root.classList.add("is-changing", "is-animating", "is-leaving");
      setTimeout(() => (location.href = href), reduced ? 0 : 300);
    });
    addEventListener("pageshow", (e) => e.persisted && root.classList.remove("is-changing", "is-animating", "is-leaving"));
  }
})();
