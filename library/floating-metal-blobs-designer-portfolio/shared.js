// Common to all pages: header strip · work drawer · light switch · bottom strip · loader · metal blob (WebGL) · line-mask reveal · smooth scroll · page transition
// Original values: drawer pill .86→1, tail 0→1, outer y-6 scale .2→1, lines autoAlpha y12→0, divider 0→1 · loader numbers power1.inOut, then line scaleX→0 .55s power2.inOut,
//           number .4s fade-out, curtain fades out late .35s power2.out · line mask clip inset(0 0 120% 0)→(0 0 -5% 0) yPercent 100→0 power3.out stagger .1.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = () => innerWidth >= 1024;
  const SB = (window.SB = { reduced, desk, lenis: null });

  /* ---------------- Light / Dark ---------------- */
  const root = document.documentElement;
  if (localStorage.getItem("sb-mode") === "light") root.classList.add("sb-light");
  const themeListeners = [];
  SB.onTheme = (fn) => themeListeners.push(fn);

  /* ---------------- Header band ---------------- */
  const projects = ["Project Name 01", "Project Name 02", "Project Name 03", "Project Name 04", "Project Name 05", "Project Name 06"];
  const cur = (p) => (p === page ? " is-current" : "");
  const shape = '<svg viewBox="0 0 16 6" preserveAspectRatio="none"><path d="M0 0h16C11 0 10 6 8 6S5 0 0 0Z" fill="currentColor"/></svg>';
  const head = document.createElement("header");
  head.className = "sb-head";
  head.dataset.slot = "header";
  head.innerHTML = `
    <a class="sb-logo" href="index.html" aria-label="Home"><span class="sb-mark"><span class="sb-mark__gl" aria-hidden="true"><canvas></canvas></span><span class="sb-mark__glyph" aria-hidden="true"></span><span class="sb-mark__words" aria-hidden="true" data-label="Your person’s English name goes here, three words — the mark is the first letter of the middle word drawn in bold"><span>Firstname</span><span>Middle</span><span>Surname</span></span></span></a>
    <button class="sb-toggle" type="button" aria-label="Toggle light and dark"><span class="sb-toggle__label"></span><span class="sb-toggle__line"></span><span class="sb-toggle__dot"></span></button>
    <div class="sb-nav" data-slot="nav-projects">
      <div class="sb-nav__inner">
        <div class="sb-nav__pill"></div>
        <nav class="sb-nav__bar" aria-label="Main menu" data-label="Your menu English name here · for the work list, the work English name">
          <a class="sb-nav__link${cur("about")}" href="about.html">About</a>
          <span class="sb-nav__plus" aria-hidden="true">+</span>
          <div class="sb-nav__wrap" style="position:relative">
            <button class="sb-nav__btn" type="button" aria-expanded="false" aria-controls="sb-panel"><span class="sb-nav__btn-bg"></span><span>Projects</span><span class="sb-nav__shape">${shape}</span></button>
            <div class="sb-panel" id="sb-panel">
              <div class="sb-panel__bg"></div>
              <div class="sb-panel__list">
                ${projects.map((t, i) => `<a class="sb-plink${i === 0 && page === "works" ? " is-current" : ""}" href="works.html"><span class="sb-plink__main"><span class="sb-plink__n sb-it">(0${i + 1})</span><span class="sb-plink__t">${t}</span></span><span class="sb-plink__stars" aria-hidden="true">**</span></a>`).join("")}
              </div>
            </div>
          </div>
          <span class="sb-nav__plus is-x" aria-hidden="true">+</span>
          <a class="sb-nav__link${cur("contact")}" href="contact.html">Contact</a>
        </nav>
      </div>
    </div>`;
  body.prepend(head);
  if (desk()) head.querySelector(".sb-nav__pill").remove();

  const toggle = head.querySelector(".sb-toggle");
  const paintToggle = () => (toggle.querySelector(".sb-toggle__label").textContent = root.classList.contains("sb-light") ? "Dark" : "Light");
  paintToggle();
  toggle.addEventListener("click", () => {
    root.classList.toggle("sb-light");
    localStorage.setItem("sb-mode", root.classList.contains("sb-light") ? "light" : "dark");
    paintToggle();
    themeListeners.forEach((f) => f());
  });

  /* Work drawer */
  const btn = head.querySelector(".sb-nav__btn");
  const panel = head.querySelector(".sb-panel");
  const pBg = panel.querySelector(".sb-panel__bg");
  const pLinks = panel.querySelectorAll(".sb-plink");
  const pill = btn.querySelector(".sb-nav__btn-bg");
  const tail = btn.querySelector(".sb-nav__shape");
  const up = !desk();
  // Original values: default .6s power2.out · pill .86→1 .38s(0) · tail desktop scale 0→1 · y -6→0 / phone scaleY 0→1 · autoAlpha(.08) · panel surface autoAlpha .001s · panel .2→1 · y ∓6→0(.16) · text from .4s at .61s/.07 interval · divider .57s/.04 · closing rewinds at 1.5x.
  // Devices with a mouse open on hover and close right on leave, ignoring presses, only touch devices open and close by pressing
  gsap.set(pill, { scale: 0.86, autoAlpha: 0, transformOrigin: up ? "50% 0%" : "50% 100%" });
  gsap.set(tail, up ? { scaleY: 0, autoAlpha: 0, transformOrigin: "50% 100%" } : { scale: 0, y: -6, transformOrigin: "50% 0%" });
  gsap.set(panel, { autoAlpha: 0 });
  gsap.set(pBg, { y: up ? 6 : -6, scale: 0.2, autoAlpha: 0, transformOrigin: up ? "50% 100%" : "50% 0%" });
  gsap.set(pLinks, { autoAlpha: 0, y: 12, "--sep": 0 });
  const panelTl = gsap.timeline({ paused: true, defaults: { duration: 0.6, ease: "power2.out" } })
    .to(pill, { scale: 1, autoAlpha: 1, duration: 0.38 }, 0)
    .to(tail, up ? { scaleY: 1, autoAlpha: 1 } : { scale: 1, y: 0 }, 0.08)
    .to(panel, { autoAlpha: 1, duration: 0.001 }, 0.16)
    .to(pBg, { y: 0, scale: 1, autoAlpha: 1 }, 0.16)
    .to(pLinks, { autoAlpha: 1, y: 0, duration: 0.61, stagger: 0.07 }, 0.4)
    .to(pLinks, { "--sep": 1, duration: 0.57, stagger: 0.04 }, 0.4);
  let open = false;
  const setOpen = (v) => {
    if (v === open) return;
    open = v;
    btn.setAttribute("aria-expanded", v);
    panel.classList.toggle("is-open", v);
    v ? panelTl.timeScale(1).play() : panelTl.timeScale(1.5).reverse();
  };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  btn.addEventListener("click", (e) => { e.stopPropagation(); if (!fine) setOpen(!open); });
  if (fine) {
    const wrap = btn.parentElement;
    wrap.addEventListener("mouseenter", () => setOpen(true));
    wrap.addEventListener("mouseleave", () => setOpen(false));
  }
  document.addEventListener("click", (e) => { if (open && !panel.contains(e.target)) setOpen(false); });

  /* ---------------- Bottom bar (time updates every minute) ---------------- */
  SB.footer = (el) => {
    const time = el.querySelector(".sb-foot__time");
    const tick = () => { const d = new Date(); time.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} – City Name`; };
    tick();
    setInterval(tick, 30000);
  };
  document.querySelectorAll(".sb-foot").forEach(SB.footer);

  /* ---------------- Following pill: inside the area it follows the cursor (lerp .12), and when the cursor leaves it returns to its place ---------------- */
  SB.followPill = (area, pill) => {
    const p = { x: 0, y: 0, tx: 0, ty: 0 };
    area.addEventListener("mousemove", (e) => {
      const r = pill.getBoundingClientRect();
      p.tx = e.clientX - (r.left + r.width / 2 - p.x);
      p.ty = e.clientY - (r.top + r.height / 2 - p.y);
      pill.classList.add("is-active");
    });
    area.addEventListener("mouseleave", () => { p.tx = 0; p.ty = 0; pill.classList.remove("is-active"); });
    gsap.ticker.add(() => {
      if (Math.abs(p.tx - p.x) < 0.1 && Math.abs(p.ty - p.y) < 0.1) return;
      p.x += (p.tx - p.x) * 0.12; p.y += (p.ty - p.y) * 0.12;
      pill.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });
  };

  // Following panel (the original follower device): turns on when entering the trigger, starts the panel position at the trigger center, and follows the cursor within the cell at 1.25s power3.
  // When a cell turns on, fade appears over .55s power3.out, and when you leave the cell it disappears over .18s power2.in (re-measured original curve — same for the marquee and the next work card) — visibility is not touched. Calls onOn and onOff when switching on and off
  // when proximity is given it turns on while the cursor is within the bands above and below that element and off when it leaves (original activation: proximity, proximityY 0)
  SB.follow = (area, follower, { trigger = area, fade = true, duration = 1.25, proximity, onOn, onOff } = {}) => {
    if (!area || !follower || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const xTo = gsap.quickTo(follower, "x", { duration, ease: "power3" });
    const yTo = gsap.quickTo(follower, "y", { duration, ease: "power3" });
    let on = false;
    const at = (e) => {
      const r = area.getBoundingClientRect();
      return [e.clientX - r.left - follower.offsetWidth / 2, e.clientY - r.top - follower.offsetHeight / 2];
    };
    const activate = (e) => {
      if (on) return;
      on = true;
      if (trigger !== area) {
        const t = trigger.getBoundingClientRect(), r = area.getBoundingClientRect();
        gsap.set(follower, { x: t.left + t.width / 2 - r.left - follower.offsetWidth / 2, y: t.top + t.height / 2 - r.top - follower.offsetHeight / 2 });
      }
      if (fade) gsap.to(follower, { opacity: 1, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      onOn?.();
      const [x, y] = at(e); xTo(x); yTo(y);
    };
    const deactivate = () => {
      if (!on) return;
      on = false;
      if (fade) gsap.to(follower, { opacity: 0, duration: 0.18, ease: "power2.in", overwrite: "auto" });
      onOff?.();
    };
    const near = (e) => { const r = proximity.getBoundingClientRect(); return e.clientY >= r.top && e.clientY <= r.bottom; };
    if (!proximity) trigger.addEventListener("mouseenter", activate);
    area.addEventListener("mousemove", (e) => {
      if (proximity) { if (near(e)) activate(e); else deactivate(); }
      if (!on) return;
      const [x, y] = at(e); xTo(x); yTo(y);
    });
    area.addEventListener("mouseleave", deactivate);
  };

  /* ---------------- Line-mask reveal ---------------- */
  SB.lines = (el) => {
    const s = new SplitText(el, { type: "lines", linesClass: "line", mask: "lines" });
    return s.lines;
  };
  SB.clipLines = (tl, el, pos = 0, opts = {}) => {
    const lines = SB.lines(el);
    tl.fromTo(lines, { yPercent: 100, clipPath: "inset(0% 0px 120% 0px)" }, { yPercent: 0, clipPath: "inset(0% 0px -5% 0px)", duration: 1, ease: "power3.out", stagger: 0.1, ...opts }, pos);
    return lines;
  };

  /* ---------------- Bubble panel ----------------
     Rewritten in our own shader with the same formula as the original (three r182 HeroShaderPlane). Four blobs plus one cursor blob are joined with smin(.25),
     Waves (strength 4.2 · phon 2, speed 2.8) shake the edges. The accent blob is a gradient from center color → edge .58x, the soft blob is a single flat color.
     Physics: floating (sin·cos force 8e-5·6e-5) · damping .97 (toward .94 when strength is low) · wall bounce .2 · cursor push .1 · bubble-to-bubble push .05 · cursor follow .05.
     Entrance: bubbles emerge from the center at radius 0 and scatter at outward speed, growing over 1.6s sine.inOut, opacity 1.6s sine.out, physics strength .15→1 over 2.2s sine.out. */
  const BLOB_FRAG = `#include <common>
uniform vec2 u_resolution; uniform float u_time;
uniform vec2 u_blobs[5]; uniform vec3 u_colors[5]; uniform float u_radii[5];
uniform float u_wobble_amt; uniform float u_wobble_spd; uniform float u_blend;
uniform vec3 u_bg_color; uniform float u_blob_opacity; uniform float u_blobs_only; uniform float u_radius_scale; uniform float u_flat_blobs;
uniform float u_cursor_opacity;
varying vec2 vUv;
vec2 sminK(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return vec2(mix(b, a, h) - k * h * (1.0 - h), h); }
// Blob field: rgb is the blended color, a is distance — a field without the cursor blob (last cell) is also computed separately to blend in when the cursor is faded out
vec4 field(vec2 w, float aspect, float rs, float k, bool withCursor) {
  float d = 100.0; vec3 col = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    vec2 p = u_blobs[i]; p.x *= aspect;
    vec2 diff = w - p;
    float r = u_radii[i] * rs, dist = (i == 4 && !withCursor) ? 100.0 : length(diff) - r;
    float g = smoothstep(0.0, 1.0, length(diff) / max(r, 0.0001));
    vec3 c = u_colors[i];
    if (u_flat_blobs < 0.5) c = mix(c, c * 0.58, g);
    else {
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(mix(c, vec3(1.0), luma < 0.45 ? 0.015 : 0.16), c * (luma < 0.45 ? 0.96 : 0.78), g);
    }
    if (i == 0) { d = dist; col = c; } else { vec2 m = sminK(d, dist, k); d = m.x; col = mix(c, col, m.y); }
  }
  if (u_flat_blobs < 0.5) col *= 1.0 - smoothstep(-0.1, 0.02, d) * 0.03 * u_blob_opacity;
  return vec4(col, d);
}
void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  float rs = max(u_radius_scale, 0.0001), k = u_blend * rs, t = u_time * u_wobble_spd;
  vec2 w = uv;
  w.y += cos(uv.x * 3.0 + t * 0.5) * 0.005 * u_wobble_amt * rs;
  w.x += sin(uv.y * 3.0 + t * 0.6) * 0.005 * u_wobble_amt * rs;
  w.y += sin(uv.x * 8.0 - t * 0.3) * 0.002 * u_wobble_amt * rs;
  vec4 on = field(w, aspect, rs, k, true);
  vec4 off = u_cursor_opacity < 0.999 ? field(w, aspect, rs, k, false) : on;
  float edge = 0.001 * rs;
  float aOn = (1.0 - smoothstep(0.0, edge, on.a)) * u_blob_opacity, aOff = (1.0 - smoothstep(0.0, edge, off.a)) * u_blob_opacity;
  if (u_blobs_only > 0.5) {
    float a = mix(aOff, aOn, u_cursor_opacity);
    if (a < 0.001) discard;
    gl_FragColor = vec4(mix(off.rgb * aOff, on.rgb * aOn, u_cursor_opacity) / max(a, 0.0001), a);
  } else {
    vec3 cOn = on.a < edge ? mix(u_bg_color, on.rgb, aOn) : u_bg_color, cOff = off.a < edge ? mix(u_bg_color, off.rgb, aOff) : u_bg_color;
    gl_FragColor = vec4(mix(cOff, cOn, u_cursor_opacity), 1.0);
  }
  #include <colorspace_fragment>
}`;
  const BLOB_VERT = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
  // Canvas·shaders can’t read CSS variables — resolve skin variables to computed colors, paint them on 1px and read back as sRGB (color-mix·oklch expressions get resolved too)
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  SB.rgb = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    body.append(probe);
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = getComputedStyle(probe).color;
    swatch.fillRect(0, 0, 1, 1);
    probe.remove();
    return [...swatch.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const mouse = { x: 0, y: 0, has: false };
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; }, { passive: true });

  // opts: soft (one-color soft blobs) · only (blobs only, transparent background) · scale (blob size multiplier) · cursorPx (soft cursor diameter base in px) · invert (soft color of the opposite-background panel)
  //       colors([three skin variables — accent blob colors]) · center(cursor blob starts near the center) · auto(appears when it enters the screen, otherwise after SB.ready)
  //       bound (original data-hero-mesh-boundary — the plate runs from the top of the header to the vertical center of this element, and the cursor is received only inside it)
  SB.blobs = (canvas, o = {}) => {
    if (!canvas || !window.THREE) return null;
    const host = canvas.parentElement;
    const soft = !!o.soft, only = !!o.only, N = 5;
    const isMobile = () => innerWidth < 1024;
    let scaleFactor = isMobile() ? 0.6 : 1.1;
    const sizeScale = o.scale ?? (soft ? 0.38 : 0.7);
    const targetOpacity = soft ? (o.opacity ?? 0.4) : isMobile() ? 0.6 : 1;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
    camera.position.z = 1;
    const colorOf = (n) => new THREE.Color().setRGB(...SB.rgb(n).map((v) => v / 255), THREE.SRGBColorSpace);
    const paletteNames = soft ? [o.invert ? "--site-soft-bubbles-inv" : "--site-soft-bubbles"] : o.colors || ["--kf-accent", "--kf-accent-soft", "--site-accent3"];
    let palette = paletteNames.map(colorOf);
    const rect = () => (o.bound ? canvas : host).getBoundingClientRect();
    // Boundary elements are pushed in y on entrance, so measure by layout position (offsetTop) rather than screen position
    const boundMid = () => { let y = o.bound.offsetHeight / 2, n = o.bound; while (n && n !== host) { y += n.offsetTop; n = n.offsetParent; } return y; };
    const cursorBase = () => {
      if (soft || only) { const r = (o.cursorPx ?? 22) / innerHeight; return isMobile() ? -r : r; }
      return isMobile() ? -0.04 : 0.04 * scaleFactor;
    };
    const make = (isCursor) => {
      const b = { x: 0, y: 0, vx: 0, vy: 0, tx: 0.5, ty: 0.5, isCursor, active: false, phase: isCursor ? 0 : Math.random() * Math.PI * 2, radius: 0 };
      if (isCursor) {
        b.orig = 0.04; b.base = cursorBase(); b.ci = 0;
        if (o.center) { const a = Math.random() * Math.PI * 2, d = Math.random() * 0.06, asp = innerWidth / Math.max(innerHeight, 1); b.x = 0.5 + (Math.cos(a) * d) / Math.max(asp, 1e-4); b.y = 0.5 + Math.sin(a) * d; }
        else { b.x = 0.1 + Math.random() * 0.8; b.y = Math.abs(b.base) + Math.random() * Math.max(0.2, 1 - Math.abs(b.base) * 2); }
        b.tx = b.x; b.ty = b.y;
      } else {
        b.orig = (0.08 + Math.random() * 0.1) * sizeScale; b.base = b.orig * scaleFactor;
        b.x = 0.1 + Math.random() * 0.8; b.y = b.base + Math.random() * Math.max(0.2, 1 - b.base * 2);
        b.vx = (Math.random() - 0.5) * 0.01; b.vy = (Math.random() - 0.5) * 0.008;
      }
      b.rx = b.x; b.ry = b.y;
      return b;
    };
    const order = palette.map((_, i) => i).sort(() => Math.random() - 0.5);
    const blobs = Array.from({ length: N - 1 }, (_, i) => { const b = make(false); b.ci = palette.length === 1 ? 0 : i < palette.length ? order[i] : Math.floor(Math.random() * palette.length); return b; });
    const cursor = make(true);
    blobs.push(cursor);
    const u = {
      u_time: { value: 0 }, u_resolution: { value: new THREE.Vector2(1, 1) },
      u_blobs: { value: blobs.map((b) => new THREE.Vector2(b.x, b.y)) }, u_colors: { value: blobs.map((b) => palette[b.ci].clone()) },
      u_radii: { value: blobs.map(() => 0) }, u_bg_color: { value: colorOf("--kf-bg") }, u_blob_opacity: { value: 0 },
      u_blobs_only: { value: only ? 1 : 0 }, u_radius_scale: { value: 1 }, u_flat_blobs: { value: soft || only ? 1 : 0 },
      u_wobble_amt: { value: soft || only ? 4.2 : isMobile() ? 2 : 4.2 }, u_wobble_spd: { value: 2.8 }, u_blend: { value: 0.25 },
      u_cursor_opacity: { value: 1 },
    };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: BLOB_VERT, fragmentShader: BLOB_FRAG, uniforms: u, transparent: only, depthWrite: false }));
    scene.add(mesh);
    // Pre-bake shaders so panels set up offscreen do not stall on first appearance or first cursor move
    renderer.compile(scene, camera);
    SB.onTheme(() => {
      palette = paletteNames.map(colorOf);
      blobs.forEach((b, i) => u.u_colors.value[i].copy(palette[b.ci]));
      u.u_bg_color.value.copy(colorOf("--kf-bg"));
    });
    let W = 1, H = 1;
    const size = () => {
      if (o.bound) canvas.style.height = `${Math.round(boundMid())}px`;
      const r = rect();
      W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
      renderer.setSize(W, H, false);
      u.u_resolution.value.set(W, H);
      scaleFactor = isMobile() ? 0.8 : 1.1;
      blobs.forEach((b) => { b.base = b.isCursor ? cursorBase() : b.orig * scaleFactor; if (b.active) gsap.to(b, { radius: b.base, duration: 0.5, ease: "power2.out" }); });
    };
    size();
    new ResizeObserver(size).observe(host);
    // Original: soft bubbles (soft·only) are sized by screen height — if the board is longer than the screen, shrink by that much
    const radiusScale = () => (soft || only ? innerHeight / Math.max(H, innerHeight) : H > innerHeight ? innerHeight / H : 1);
    let intensity = 0, interactive = false, started = false, visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && o.auto && !started) entry(); }).observe(host);
    const entry = () => {
      if (started) return;
      started = true;
      const cursorOn = cursorBase() > 0;
      if (reduced) {
        blobs.forEach((b) => { b.radius = b.isCursor && !cursorOn ? -1 : b.base; b.x = b.rx; b.y = b.ry; b.active = !b.isCursor; });
        u.u_blob_opacity.value = targetOpacity;
        intensity = 0;
        return;
      }
      const tl = gsap.timeline({
        onStart: () => { gsap.fromTo({ v: 0.15 }, { v: 0.15 }, { v: 1, duration: 2.2, ease: "sine.out", onUpdate() { intensity = this.targets()[0].v; } }); blobs.forEach((b) => { if (!b.isCursor || cursorOn) b.active = true; }); },
        onComplete: () => { interactive = true; },
      });
      tl.fromTo(u.u_blob_opacity, { value: 0 }, { value: targetOpacity, duration: 1.6, ease: "sine.out" }, 0);
      blobs.forEach((b) => {
        if (b.isCursor && !cursorOn) { b.radius = -1; b.active = false; return; }
        b.x = 0.5; b.y = 0.5; b.active = false;
        if (b.isCursor) { b.vx = b.vy = 0; tl.fromTo(b, { radius: 0, x: 0.5, y: 0.5 }, { radius: b.base, x: b.rx, y: b.ry, duration: 1.6, ease: "sine.inOut" }, 0); }
        else { b.vx = (b.rx - 0.5) * 0.02; b.vy = (b.ry - 0.5) * 0.02; tl.fromTo(b, { radius: 0 }, { radius: b.base, duration: 1.6, ease: "sine.inOut" }, 0); }
      });
    };
    if (!o.auto) SB.ready.then(entry);
    const step = (aspect, time, f, cx, cy) => {
      blobs.forEach((b) => {
        if (b.isCursor || !b.active || f <= 0) return;
        b.vx += Math.sin(time * 0.4 + b.phase) * 8e-5 * f;
        b.vy += Math.cos(time * 0.35 + b.phase * 1.3) * 6e-5 * f;
        const damp = 0.97 + (0.94 - 0.97) * (1 - f);
        b.vx *= damp; b.vy *= damp;
        b.x += b.vx * cx; b.y += b.vy * cy;
        const bounce = 0.2 * f, slide = 0.8 + 0.15 * (1 - f), r = soft || only ? b.radius * radiusScale() : b.radius;
        if (b.y < r) { b.y = r; b.vy *= -bounce; b.vx *= slide; }
        if (b.y > 1 - r) { b.y = 1 - r; b.vy *= -bounce; b.vx *= slide; }
        const rx = r / Math.max(aspect, 1e-4);
        if (b.x < rx) { b.x = rx; b.vx *= -bounce; }
        if (b.x > 1 - rx) { b.x = 1 - rx; b.vx *= -bounce; }
      });
    };
    let last = performance.now();
    const frame = () => {
      const now = performance.now(), dt = Math.max(0, now - last) / 1000;
      last = now;
      if (!visible || document.hidden) return;
      // Original: for a highlight bubble on a plate lower than the screen, physics runs in screen ratio (only the shader uses plate ratio)
      const r = rect(), aspect = soft || only || H > innerHeight ? W / H : innerWidth / innerHeight, rs = radiusScale();
      u.u_time.value += dt;
      u.u_radius_scale.value = rs;
      if (interactive && mouse.has && mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom) {
        cursor.tx = (mouse.x - r.left) / r.width;
        cursor.ty = 1 - (mouse.y - r.top) / r.height;
      }
      if (interactive && cursor.active) {
        const nx = cursor.x + (cursor.tx - cursor.x) * 0.05, ny = cursor.y + (cursor.ty - cursor.y) * 0.05;
        const cr = Math.max(0, cursor.radius) * rs, crx = cr / Math.max(aspect, 1e-4);
        cursor.x = Math.max(crx, Math.min(1 - crx, nx));
        cursor.y = Math.max(cr, Math.min(1 - cr, ny));
      }
      const push = Math.max(0, cursor.radius) * u.u_cursor_opacity.value;
      for (let i = 0; i < N - 1; i++) {
        const a = blobs[i];
        if (!a.active) continue;
        if (interactive && push > 1e-4) {
          const dx = (cursor.x - a.x) * aspect, dy = cursor.y - a.y, dd = dx * dx + dy * dy, reach = (push + a.radius) * rs;
          if (dd < reach * reach) { const dist = Math.sqrt(dd), f = (reach - dist) * 0.1 * intensity; if (dist > 0.001) { a.vx -= (dx / dist) * f; a.vy -= (dy / dist) * f; } }
        }
        for (let j = i + 1; j < N - 1; j++) {
          const b = blobs[j];
          if (!b.active) continue;
          const dx = (b.x - a.x) * aspect, dy = b.y - a.y, dd = dx * dx + dy * dy, reach = (a.radius + b.radius) * rs;
          if (dd < reach * reach) {
            const dist = Math.sqrt(dd), f = (reach - dist) * 0.05 * intensity;
            if (dist > 0.001) { const sx = dx / dist, sy = dy / dist; a.vx -= (sx / aspect) * f; a.vy -= sy * f; b.vx += (sx / aspect) * f; b.vy += sy * f; }
          }
        }
      }
      const cx = soft || only ? innerWidth / Math.max(1, r.width) : 1, cy = soft || only ? innerHeight / Math.max(1, r.height) : 1;
      step(aspect, u.u_time.value, intensity, cx, cy);
      blobs.forEach((b, i) => { u.u_blobs.value[i].set(b.x, b.y); u.u_radii.value[i] = b.radius; });
      renderer.render(scene, camera);
    };
    gsap.ticker.add(frame);
    // Original hero-cursor-visibility: hides the cursor blob in .4s (the push weakens by as much) and restores it in .5s
    const cursorShow = (on) => gsap.to(u.u_cursor_opacity, { value: on ? 1 : 0, duration: on ? 0.5 : 0.4, ease: "power2.out", overwrite: true });
    return { frame, resize: size, entry, cursor: cursorShow };
  };

  /* ---------------- Photo panel ----------------
     Same formula as the original media shader: only around the cursor (radius .25) the photo is shaken with noise (8 cells · time x2) and horizontal waves (100 lines · .02), and red and blue are split apart by .005 each
     (strength .15, follow .05 — after a 300ms pause it slows by half and settles). Entrance (mitosis): six fixed blobs grow at .15 intervals over 2s power3.out to smin(.32)
     attaches and opens the photo — once, when the cell comes within 15% of the screen edge. With no photo, a placeholder (background·diagonal·label) is drawn and used as the canvas */
  const MEDIA_FRAG = `#include <common>
uniform sampler2D u_texture; uniform float u_meshAspect; uniform float u_time;
uniform vec2 u_mouse; uniform float u_radius; uniform float u_distortAmt; uniform float u_opacity;
uniform float u_mitosis_active; uniform float u_mitosis_count; uniform vec2 u_mitosis_blobs[12]; uniform float u_mitosis_radii[12];
uniform float u_mitosis_wobble_amt; uniform float u_mitosis_wobble_spd; uniform float u_mitosis_blend; uniform float u_mitosis_opacity;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float sminD(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float entrance(vec2 uv, float aspect) {
  vec2 a = vec2(uv.x * aspect, uv.y), w = a;
  float t = u_time * u_mitosis_wobble_spd;
  w.y += cos(a.x * 3.0 + t * 0.5) * 0.005 * u_mitosis_wobble_amt;
  w.x += sin(a.y * 3.0 + t * 0.6) * 0.005 * u_mitosis_wobble_amt;
  w.y += sin(a.x * 8.0 - t * 0.3) * 0.002 * u_mitosis_wobble_amt;
  float d = 100.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= u_mitosis_count) continue;
    vec2 p = u_mitosis_blobs[i]; p.x *= aspect;
    float di = length(w - p) - u_mitosis_radii[i];
    d = i == 0 ? di : sminD(d, di, u_mitosis_blend);
  }
  return 1.0 - smoothstep(0.0, 0.001, d);
}
void main() {
  vec2 a = vec2(vUv.x * u_meshAspect, vUv.y), m = vec2(u_mouse.x * u_meshAspect, u_mouse.y);
  float mask = 1.0 - smoothstep(0.0, 0.15, length(a - m) - u_radius);
  vec2 dis = vec2(noise(vUv * 8.0 + u_time * 2.0), noise(vUv * 8.0 + u_time * 2.0 + 43.0)) - 0.5;
  dis.x += sin(vUv.y * 100.0 + u_time * 10.0) * 0.02;
  vec2 uv = vUv + dis * mask * u_distortAmt;
  float shift = 0.005 * mask * u_distortAmt;
  vec3 col = vec3(texture2D(u_texture, uv + vec2(shift, 0.0)).r, texture2D(u_texture, uv).g, texture2D(u_texture, uv - vec2(shift, 0.0)).b);
  float alpha = u_opacity;
  if (u_mitosis_active > 0.5) alpha *= entrance(vUv, u_meshAspect) * u_mitosis_opacity;
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}`;
  const MITOSIS = [[0.48, 0.47, 0.36], [0.16, 0.8, 0.3], [0.86, 0.78, 0.28], [0.14, 0.16, 0.32], [0.88, 0.18, 0.3], [0.58, 0.9, 0.22]];
  // Placeholder image board: background, two diagonals, and a center label (the photo slot label as is) drawn in the Skin color
  const placeholder = (el, w, h) => {
    const c = document.createElement("canvas"), d = Math.min(devicePixelRatio || 1, 2);
    c.width = Math.max(2, Math.round(w * d)); c.height = Math.max(2, Math.round(h * d));
    // Slot colors (--wf-*) hang on .wf-img, so resolve them inside that element
    const g = c.getContext("2d"), cs = getComputedStyle(el);
    const css = (n) => {
      const probe = document.createElement("i");
      probe.style.cssText = `position:absolute;visibility:hidden;color:var(${n})`;
      el.append(probe);
      const v = getComputedStyle(probe).color;
      probe.remove();
      return v;
    };
    g.scale(d, d);
    g.fillStyle = css("--wf-fill"); g.fillRect(0, 0, w, h);
    g.strokeStyle = css("--wf-line"); g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = el.dataset.label || "";
    if (label) {
      g.font = `500 12px ${cs.getPropertyValue("--wf-mono").trim() || "monospace"}`;
      const tw = Math.min(w - 16, g.measureText(label).width + 16);
      g.fillStyle = css("--wf-fill"); g.fillRect((w - tw) / 2, h / 2 - 11, tw, 22);
      g.fillStyle = css("--wf-fill-ink"); g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(label, w / 2, h / 2, w - 24);
    }
    return c;
  };
  SB.media = (el, { mitosis = true } = {}) => {
    if (!el || !window.THREE) return null;
    const canvas = document.createElement("canvas");
    canvas.className = "sb-media";
    canvas.setAttribute("aria-hidden", "true");
    el.classList.add("has-gl");
    el.append(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
    camera.position.z = 1;
    const tex = new THREE.CanvasTexture(placeholder(el, 2, 2));
    tex.colorSpace = THREE.SRGBColorSpace;
    const u = {
      u_texture: { value: tex }, u_meshAspect: { value: 1 }, u_time: { value: 0 }, u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_radius: { value: 0 }, u_distortAmt: { value: 0 }, u_opacity: { value: 1 },
      u_mitosis_active: { value: mitosis && !reduced ? 1 : 0 }, u_mitosis_count: { value: MITOSIS.length },
      u_mitosis_blobs: { value: Array.from({ length: 12 }, (_, i) => new THREE.Vector2(MITOSIS[i]?.[0] ?? 0.5, MITOSIS[i]?.[1] ?? 0.5)) },
      u_mitosis_radii: { value: new Array(12).fill(0) }, u_mitosis_wobble_amt: { value: 2.4 }, u_mitosis_wobble_spd: { value: 4.05 },
      u_mitosis_blend: { value: 0.32 }, u_mitosis_opacity: { value: 0 },
    };
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: BLOB_VERT, fragmentShader: MEDIA_FRAG, uniforms: u, transparent: true, depthWrite: false })));
    renderer.compile(scene, camera);
    const size = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      u.u_meshAspect.value = r.width / r.height;
      tex.image = placeholder(el, r.width, r.height);
      tex.needsUpdate = true;
    };
    size();
    new ResizeObserver(size).observe(el);
    SB.onTheme(size);
    const radii = MITOSIS.map(() => ({ r: 0 }));
    let played = !u.u_mitosis_active.value;
    const play = () => {
      played = true;
      const tl = gsap.timeline({ onComplete: () => { u.u_mitosis_active.value = 0; } });
      tl.to(u.u_mitosis_opacity, { value: 1, duration: 2, ease: "power3.out" }, 0);
      radii.forEach((o, i) => tl.to(o, { r: MITOSIS[i][2], duration: 2, ease: "power3.out", onUpdate: () => (u.u_mitosis_radii.value[i] = o.r) }, i * 0.15));
    };
    const target = new THREE.Vector2(0.5, 0.5);
    let hovering = false, lastMove = 0, visible = true, last = performance.now();
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);
    // Original: (hover: none)·(pointer: coarse) devices don’t turn on cursor sway — so it doesn’t sway on the compatibility mousemove that follows a tap
    if (!matchMedia("(hover: none), (pointer: coarse)").matches) el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      // Original: the wobble center does not teleport but follows from its previous spot, and counts as movement only when it moves more than uv .001
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      hovering = true;
      if (Math.hypot(x - target.x, y - target.y) > 0.001) { target.set(x, y); lastMove = performance.now(); }
    });
    el.addEventListener("mouseleave", () => (hovering = false));
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.max(0, now - last) / 1000;
      last = now;
      if (!visible || document.hidden) return;
      u.u_time.value += dt;
      if (!played) {
        const r = el.getBoundingClientRect(), off = 0.15;
        if (r.bottom > innerHeight * off && r.top < innerHeight * (1 - off) && r.right > innerWidth * off && r.left < innerWidth * (1 - off)) play();
      }
      const live = hovering && now - lastMove <= 300 && !reduced;
      const k = live ? 0.05 : 0.025;
      u.u_mouse.value.lerp(target, k);
      u.u_radius.value += ((live ? 0.25 : 0) - u.u_radius.value) * k;
      u.u_distortAmt.value += ((live ? 0.15 : 0) - u.u_distortAmt.value) * k;
      renderer.render(scene, camera);
    });
    return { play };
  };

  /* ---------------- Symbol logo: melt the letter spacing to morph name ↔ symbol ----------------
     Rebuilt with our own shader using the same formula as the original (bundle viscosity logo, three r182). The symbol (first letter of the middle word in bold) and the first letter of the middle word
     Drawn on a canvas and baked into a distance field (edge .5, spread .1 of the height), then blended by smoothstepping the melt value t, wobbling with noise by sin(πt)×.025 in between (softness .025).
     For the symbol, noise with stickiness 1.14 · distortion .05 · recording .2 spreads along the diagonal (top left → bottom right) and then clears —
     Enter 6s · hold .1s · exit 6s · overlap -2s (one loop 10.1s, panel progress 0→.835), edge .14, front and back lines -.18 → 1.18 via smoothstep.
     The symbol plate height is .65 of the logo cell height, shrinking to .25 when it is a name, overlapping the first letter of the middle word (plate center = the middle of that line).
     Name ↔ symbol timeline 1.9s: melt out · gooey · warp · melt in → 0, and plate shrink · move 1.1s power1.out (rewind power1.inOut) · plate fades out over .7s starting at .9s (power1.out / rewind power1.in)
     · first·third rows from .6s x -30→0 1.1s at .2 intervals (power2.out / rewind power2.in) · middle row from .9s for .5s.
     Auto cycle: two sweeps → name (1.9s) → hold 2s → symbol (1.9s rewind) → sweep again from the start. Color is the text color, and when the skin changes .3s power3.out */
  const LOGO_FRAG = `precision highp float;
uniform float u_progress; uniform float u_wait; uniform vec3 u_timing;
uniform float u_visc; uniform float u_dist; uniform float u_fusion;
uniform float u_morph; uniform float u_soft; uniform float u_wobble;
uniform vec3 u_color; uniform sampler2D u_from; uniform sampler2D u_to;
varying vec2 vUv;
vec4 perm(vec4 x) { x = mod(x, 289.0); return mod(((x * 34.0) + 1.0) * x, 289.0); }
// 3D simplex noise (same grid and gradients as webgl-noise — result range about ±1)
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  vec3 i = floor(v + dot(v, C.yyy)), x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz), l = 1.0 - g, i1 = min(g, l.zxy), i2 = max(g, l.zxy);
  vec3 x1 = x0 - i1 + C.x, x2 = x0 - i2 + C.y, x3 = x0 - 0.5;
  i = mod(i, 289.0);
  vec4 p = perm(perm(perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  vec4 j = p - 49.0 * floor(p / 49.0), gx = floor(j / 7.0), gy = floor(j - 7.0 * gx);
  vec4 x = (gx * 2.0 + 0.5) / 7.0 - 1.0, y = (gy * 2.0 + 0.5) / 7.0 - 1.0, h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy), b1 = vec4(x.zw, y.zw), s0 = floor(b0) * 2.0 + 1.0, s1 = floor(b1) * 2.0 + 1.0, sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy, a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 g0 = vec3(a0.xy, h.x), g1 = vec3(a0.zw, h.y), g2 = vec3(a1.xy, h.z), g3 = vec3(a1.zw, h.w);
  vec4 n = inversesqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
  g0 *= n.x; g1 *= n.y; g2 *= n.z; g3 *= n.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m *= m;
  return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
}
// Diagonal sweep: shakes after the leading line passes and stops once the trailing line passes
float sweep(vec2 uv) {
  if (u_wait > 0.5) return 0.0;
  float d = (uv.x + 1.0 - uv.y) * 0.5, f = u_timing.z;
  float lead = mix(-0.18, 1.18, smoothstep(0.0, u_timing.x, u_progress));
  float trail = mix(-0.18, 1.18, smoothstep(u_timing.y, 1.0, u_progress));
  return (1.0 - smoothstep(lead - f, lead, d)) * smoothstep(trail, trail + f, d);
}
void main() {
  vec2 uv = vUv;
  float a = u_progress * 6.2831853;
  float n1 = snoise(vec3(uv * u_visc + 0.5 * vec2(cos(a), sin(a)), 0.5 * sin(a)));
  float n2 = snoise(vec3(uv * u_visc * 1.5 + 0.5 * vec2(cos(a + 2.0), sin(a + 2.0)), 0.5 * cos(a)));
  float m = sweep(uv);
  vec2 q = uv + vec2(n1, n2) * u_dist * m;
  q.y += abs(n1 * u_dist) * 0.8 * m;
  float t = u_morph * u_morph * (3.0 - 2.0 * u_morph);
  float sd = mix(texture2D(u_from, q).r, texture2D(u_to, q).r, t) * 2.0 - 1.0;
  sd += snoise(vec3(q * u_visc, a)) * u_wobble * sin(t * 3.14159265);
  float s1 = max(u_soft, fwidth(sd) * 1.5);
  float raw = smoothstep(-s1, s1, sd);
  float s2 = max(u_fusion, fwidth(raw) * 1.5);
  gl_FragColor = vec4(u_color, smoothstep(0.5 - s2, 0.5 + s2, raw));
  #include <colorspace_fragment>
}`;
  // Draw the letters on a canvas and bake them into a distance field — inside +, outside -, clamped to ±1 at the spread (px) so .5 is the edge, an 8-bit map (from the line below)
  const bakeSdf = (w, h, draw, spread) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.fillStyle = "#fff"; // Not skin: the mask that bakes the distance field — only alpha is read, nothing is painted on screen
    draw(g);
    const a = g.getImageData(0, 0, w, h).data, n = w * h, BIG = 1e20;
    const outer = new Float64Array(n), inner = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const v = a[i * 4 + 3] / 255;
      if (v >= 1) { outer[i] = 0; inner[i] = BIG; }
      else if (v <= 0) { outer[i] = BIG; inner[i] = 0; }
      else { const o = Math.max(0, 0.5 - v), k = Math.max(0, v - 0.5); outer[i] = o * o; inner[i] = k * k; }
    }
    const len = Math.max(w, h), f = new Float64Array(len), d = new Float64Array(len), z = new Float64Array(len + 1), vv = new Uint32Array(len);
    // One-line distance transform (shell under the parabola)
    const line = (grid, off, step, cnt) => {
      for (let q = 0; q < cnt; q++) f[q] = grid[off + q * step];
      let k = 0; vv[0] = 0; z[0] = -BIG; z[1] = BIG;
      for (let q = 1; q < cnt; q++) {
        let s;
        do { const r = vv[k]; s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2; } while (s <= z[k] && --k > -1);
        k++; vv[k] = q; z[k] = s; z[k + 1] = BIG;
      }
      for (let q = 0, j = 0; q < cnt; q++) { while (z[j + 1] < q) j++; const r = vv[j]; d[q] = (q - r) * (q - r) + f[r]; }
      for (let q = 0; q < cnt; q++) grid[off + q * step] = d[q];
    };
    [outer, inner].forEach((grid) => {
      for (let x = 0; x < w; x++) line(grid, x, w, h);
      for (let y = 0; y < h; y++) line(grid, y * w, 1, w);
    });
    const data = new Uint8Array(n * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, sd = (Math.sqrt(inner[i]) - Math.sqrt(outer[i])) / spread;
      const o = ((h - 1 - y) * w + x) * 4, v = Math.round((Math.max(-1, Math.min(1, sd)) * 0.5 + 0.5) * 255);
      data[o] = data[o + 1] = data[o + 2] = v; data[o + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  };
  SB.logo = (() => {
    const mark = head.querySelector(".sb-mark");
    const holder = mark.querySelector(".sb-mark__gl"), canvas = holder.querySelector("canvas");
    const glyphEl = mark.querySelector(".sb-mark__glyph");
    const words = [...mark.querySelectorAll(".sb-mark__words > span")], mid = words[1], sides = [words[0], words[2]];
    const letter = (mid.textContent.trim()[0] || "A").toUpperCase();
    glyphEl.textContent = letter;
    if (!window.THREE) { gsap.set(words, { opacity: 1 }); glyphEl.remove(); return null; }
    const SCALE0 = 0.65, SCALE_END = 0.25, TH = 384;
    const D = { visc: 1.14, dist: 0.05, fusion: 0.2 };
    const IN = 6, PAUSE = 0.1, OUT = 6, OVERLAP = -2, CYCLES = 2, HOLD = 2;
    const ACTIVE = IN + PAUSE + OUT, TOTAL = ACTIVE + OVERLAP;
    const P = { morph: 0, ...D };
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1));
    renderer.setClearColor(0, 0);
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const colorOf = () => new THREE.Color().setRGB(...SB.rgb("--kf-ink").map((v) => v / 255), THREE.SRGBColorSpace);
    const u = {
      u_progress: { value: 0 }, u_wait: { value: 0 }, u_timing: { value: new THREE.Vector3(IN / ACTIVE, (IN + PAUSE) / ACTIVE, 0.14) },
      u_visc: { value: D.visc }, u_dist: { value: D.dist }, u_fusion: { value: D.fusion },
      u_morph: { value: 0 }, u_soft: { value: 0.025 }, u_wobble: { value: 0.025 },
      u_color: { value: colorOf() }, u_from: { value: null }, u_to: { value: null },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}", fragmentShader: LOGO_FRAG, uniforms: u, transparent: true, depthWrite: false });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const push = () => { u.u_morph.value = P.morph; u.u_visc.value = P.visc; u.u_dist.value = P.dist; u.u_fusion.value = P.fusion; };

    // Baking: draw the symbol at .9 of the plate height, centered, and when the last letter is a name and the plate reaches .25x, give it the same size and baseline as the center word
    let baked = null, aspect = 1, penUv = 0.5;
    const bake = () => {
      const hc = mark.clientHeight, cs = getComputedStyle(mid), gs = getComputedStyle(glyphEl);
      const k = TH / (SCALE_END * hc), endSize = parseFloat(cs.fontSize) * k;
      const endFont = `${cs.fontStyle} ${cs.fontWeight} ${endSize}px ${cs.fontFamily}`;
      const g = document.createElement("canvas").getContext("2d");
      // The baseline is measured from the DOM — half line-height is rounded to an integer, so it differs by nearly 1px from the spot computed from font metrics
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const range = document.createRange();
      range.setStart(mid.firstChild, 0); range.setEnd(mid.firstChild, 1);
      const rr = range.getBoundingClientRect(), mr = mid.getBoundingClientRect();
      const base = Math.round((rr.top + g.measureText(letter).fontBoundingBoxAscent - (mr.top + mr.height / 2)) * 100) / 100;
      const key = `${endFont}|${base}|${gs.fontFamily}|${gs.fontWeight}|${letter}`;
      if (baked === key) return;
      baked = key;
      g.font = `${gs.fontStyle} ${gs.fontWeight} 100px ${gs.fontFamily}`;
      const ms = g.measureText(letter), startSize = (100 * 0.9 * TH) / (ms.actualBoundingBoxAscent + ms.actualBoundingBoxDescent);
      const startFont = `${gs.fontStyle} ${gs.fontWeight} ${startSize}px ${gs.fontFamily}`;
      g.font = startFont;
      const s = g.measureText(letter);
      g.font = endFont;
      const e = g.measureText(letter);
      const margin = 0.06 * TH, sw = s.actualBoundingBoxLeft + s.actualBoundingBoxRight, ew = e.actualBoundingBoxLeft + e.actualBoundingBoxRight;
      const tw = Math.round(Math.max(sw, ew) + margin * 2);
      aspect = tw / TH;
      const sx = tw / 2 - (s.actualBoundingBoxRight - s.actualBoundingBoxLeft) / 2;
      const sy = TH / 2 + (s.actualBoundingBoxAscent - s.actualBoundingBoxDescent) / 2;
      const ex = tw / 2 - (e.actualBoundingBoxRight - e.actualBoundingBoxLeft) / 2;
      const ey = TH / 2 + base * k;
      penUv = ex / tw;
      u.u_from.value?.dispose(); u.u_to.value?.dispose();
      u.u_from.value = bakeSdf(tw, TH, (c) => { c.font = startFont; c.fillText(letter, sx, sy); }, 0.1 * TH);
      u.u_to.value = bakeSdf(tw, TH, (c) => { c.font = endFont; c.fillText(letter, ex, ey); }, 0.1 * TH);
    };
    // Panel position: for a symbol it attaches to the left of the logo cell and the panel center sits at the center of the middle word row. The shrink size and travel distance for the name state are also computed here
    let endX = 0, endScale = SCALE_END / SCALE0;
    const layout = () => {
      bake();
      const hc = mark.clientHeight, m = mark.getBoundingClientRect(), r = mid.getBoundingClientRect();
      const ph = SCALE0 * hc, pw = ph * aspect, relLeft = r.left - m.left - (gsap.getProperty(mid, "x") || 0), relTop = r.top - m.top;
      holder.style.width = `${pw}px`; holder.style.height = `${ph}px`;
      holder.style.top = `${relTop + r.height / 2 - ph / 2}px`;
      renderer.setSize(pw, ph, false);
      endX = relLeft - pw / 2 - (penUv - 0.5) * pw * endScale;
    };

    let T = 0, state = "sweeping", done = 0, auto = false;
    const loopUniforms = () => {
      if (T >= ACTIVE) { u.u_wait.value = 1; u.u_progress.value = 0; return; }
      u.u_wait.value = 0; u.u_progress.value = T / ACTIVE;
    };
    let tl = null;
    // Like the original, rebuilt from the symbol position each time — start values must be read on the spot so rewinding returns to place
    const glyphState = () => {
      Object.assign(P, { morph: 0 }, D); push();
      gsap.set(holder, { x: 0, y: 0, scale: 1, opacity: 1 }); gsap.set(mid, { opacity: 0, x: 0 }); gsap.set(sides, { opacity: 0, x: 50 });
    };
    const build = (onDone, onBack) => {
      tl?.kill();
      glyphState();
      tl =gsap.timeline({ paused: true, onComplete: onDone, onReverseComplete: onBack })
        .to(P, { morph: 1, visc: 0, dist: 0, fusion: 0, duration: 1.1, ease: "power1.out", easeReverse: "power1.inOut", onUpdate: push }, 0)
        .to(holder, { scale: endScale, x: endX, duration: 1.1, ease: "power1.out", easeReverse: "power1.inOut" }, 0)
        .to(holder, { opacity: 0, duration: 0.7, ease: "power1.out", easeReverse: "power1.in" }, 0.9)
        .fromTo(sides, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1.1, stagger: 0.2, ease: "power2.out", easeReverse: "power2.in" }, 0.6)
        .fromTo(mid, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.9);
    };
    // Cycle order: sweep → name → hold → symbol → sweep
    const resume = () => { state = "sweeping"; T = 0; done = 0; Object.assign(P, D); push(); loopUniforms(); };
    const toWordmark = () => {
      state = "intro"; done = 0;
      layout();
      build(() => { if (state === "intro") { state = "wordmark"; gsap.delayedCall(HOLD, toGlyph); } });
      tl.timeScale(1).play(0);
    };
    const toGlyph = () => {
      if (state !== "wordmark") return;
      state = "reverse";
      layout();
      build(null, () => { if (state === "reverse") resume(); });
      tl.timeScale(1).progress(1, true).pause().reverse();
      push();
    };
    const tick = (dt) => {
      if (auto ? state !== "sweeping" : false) return;
      T += dt;
      if (T >= TOTAL) {
        const laps = Math.floor(T / TOTAL);
        T %= TOTAL;
        if (auto && state === "sweeping") { done = Math.min(done + laps, CYCLES); if (done >= CYCLES) { loopUniforms(); toWordmark(); return; } }
      }
      loopUniforms();
    };

    let last = performance.now(), ready = false;
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.1, Math.max(0, now - last) / 1000);
      last = now;
      if (!ready || document.hidden) return;
      if (!reduced) tick(dt);
      renderer.render(scene, camera);
    });
    SB.onTheme(() => { const c = colorOf(); gsap.to(u.u_color.value, { r: c.r, g: c.g, b: c.b, duration: 0.3, ease: "power3.out", overwrite: true }); });
    addEventListener("resize", () => { if (ready) layout(); });

    // Bake after all fonts have arrived — baking with a fallback font misaligns the final glyph from the name
    // Waits only for the two fonts, symbol and name — waiting for every Korean subset (document.fonts.ready) makes the loader start several seconds later than the original. Starts within 3 seconds at the latest
    const fontsIn = Promise.race([
      Promise.all([getComputedStyle(glyphEl), getComputedStyle(mid)].map((c) => document.fonts.load(`${c.fontStyle} ${c.fontWeight} 40px ${c.fontFamily}`, letter).catch(() => {}))),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
    const setup = fontsIn.then(() => {
      layout();
      renderer.compile(scene, camera);
      ready = true;
    });
    const api = {
      setup,
      // Page opened without a loader: stands as a symbol and cycles right away
      start: () => setup.then(() => { glyphState(); auto = !reduced; resume(); }),
      // Loader (original preloader mode): three name lines enter after .2s from x -30→0 over .8s (.18 gap, power2.out), stay .7s, then the 1.9s melt is rewound at 2.6s into the symbol.
      // Once it becomes a symbol, the cycle continues in place (the sweep clock has been running since the board was set up)
      intro: (delay = 0.2) => new Promise((resolve) => {
        gsap.set(words, { opacity: 0, x: -30 });
        gsap.set(holder, { opacity: 0 });
        setup.then(() => gsap.delayedCall(delay, () => {
          layout();
          build(null, () => { auto = !reduced; state = "sweeping"; done = 0; Object.assign(P, D); push(); loopUniforms(); resolve(); });
          tl.progress(1, true).pause();
          push();
          gsap.set(words, { opacity: 0, x: -30 });
          gsap.timeline()
            .to(words, { opacity: 1, x: 0, duration: 0.8, stagger: 0.18, ease: "power2.out" })
            .to({}, { duration: 0.7 })
            .add(() => {
              state = "reverse";
              gsap.set(words, { opacity: 1, x: 0 });
              tl.progress(1, true).pause();
              push();
              gsap.set(holder, { opacity: 0 });
              tl.timeScale(tl.duration() / 2.6).reverse();
            });
        }));
      }),
    };
    return api;
  })();

  /* ---------------- Loader: once per session ---------------- */
  SB.ready = new Promise((resolve) => {
    const logo = SB.logo;
    if (sessionStorage.getItem("sb-loaded") === "1" || reduced) { root.classList.remove("sb-loading"); logo?.start(); return resolve(); }
    const el = document.createElement("div");
    el.className = "sb-loader";
    el.dataset.slot = "loader";
    el.innerHTML = '<span class="sb-loader__line"></span><span class="sb-loader__num">0</span>';
    body.append(el);
    root.classList.remove("sb-loading");
    const line = el.querySelector(".sb-loader__line");
    const num = el.querySelector(".sb-loader__num");
    const prog = { v: 0 };
    const place = () => {
      const w = line.offsetWidth * (prog.v / 100);
      gsap.set(line, { scaleX: prog.v / 100 });
      num.style.left = `calc(${line.offsetLeft + w}px + 2rem)`;
      num.textContent = Math.round(prog.v);
    };
    place();
    // Original numbers: progress 5s power1.inOut · the head logo has just risen and sits at the vertical center of the screen, name → symbol (SB.logo.intro) ·
    // When done, the line folds to the right in .55s power2.inOut and the number fades out in .4s, the curtain lifts .35s later over .7s, and the logo settles down to the header spot in 2s power3.inOut (body appears at 1.2s)
    const wrap = head.querySelector(".sb-logo"), mark = wrap.querySelector(".sb-mark");
    wrap.classList.add("is-raised");
    const pin = () => { gsap.set(mark, { y: 0 }); const r = mark.getBoundingClientRect(); gsap.set(mark, { y: innerHeight / 2 - (r.top + r.height / 2) }); };
    pin();
    addEventListener("resize", pin);
    const finish = () => {
      removeEventListener("resize", pin);
      place();
      gsap.timeline({ onComplete: () => sessionStorage.setItem("sb-loaded", "1") })
        .set(el, { backgroundColor: "transparent" }, 0)
        .set(line, { transformOrigin: "right center" }, 0)
        .to(line, { scaleX: 0, duration: 0.55, ease: "power2.inOut" }, 0)
        .to(num, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0)
        .to(el, { opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => el.remove() }, 0.35)
        .to(mark, { y: 0, duration: 2, ease: "power3.inOut", onComplete: () => wrap.classList.remove("is-raised") }, 0)
        .add(resolve, 1.2);
    };
    let left = 2;
    const done = () => { if (--left === 0) finish(); };
    if (logo) logo.intro(0.2).then(done);
    else gsap.fromTo(mark.querySelectorAll(".sb-mark__words > span"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.18, delay: 0.2, ease: "power2.out", onComplete: done });
    // Like the original Preloader, progress starts 5s after the font arrives (the logo appears at the same time)
    (logo ? logo.setup : document.fonts.ready).then(() => gsap.to(prog, { v: 100, duration: 5, ease: "power1.inOut", onUpdate: place, onComplete: done }));
  });

  /* ---------------- Smooth scroll ---------------- */
  if (!reduced && window.Lenis) {
    const lenis = (SB.lenis = new Lenis({ lerp: 0.1, smoothWheel: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- Page transition: covers with a background-color curtain in .5s, then navigates ---------------- */
  const shade = document.createElement("div");
  shade.className = "sb-shade";
  body.append(shade);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault();
    root.classList.add("sb-leaving");
    setTimeout(() => (location.href = href), 500);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("sb-leaving"); });

  /* Shared page entrance: the header band settles in behind the loader */
  // Like the original, hide only with opacity (header-nav opacity-0) — it sits under the loader curtain so it can’t be clicked meanwhile
  gsap.set([".sb-toggle", ".sb-nav"], { opacity: 0 });
  SB.ready.then(() => gsap.to([".sb-toggle", ".sb-nav"], { opacity: 1, duration: 0.8, stagger: 0.08, ease: "power2.out" }));
})();
