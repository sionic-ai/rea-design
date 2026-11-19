// Common to all pages: dot-grid background (WebGL) · convex image (WebGL) · four-corner gauges · menu curtain · loader · visit gauge · smooth scroll · page transition.
// Original values: Lenis 1.2s expo · grid 50/65 cells · mouse lerp .065, speed lerp .15, stretch 1+speed×26 (max 6) · bulge strength lerp .08×.25, cursor lerp .1
//           Menu curtain 1s power4.inOut, links .25s with .08 stagger delay .7, photos .75s stagger .1 delay 1 · loader minimum 3s, pause .5s at 100% → .85s → .65s → 1.05s.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const body = document.body;
  const page = body.dataset.page || "home";
  const chrome = body.dataset.chrome || "full";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth < 768;
  const SH = (window.SH = {
    reduced,
    isMobile,
    lenis: null,
    phases: { p1: 0, p2: 0, p3: 0 },
    fullX: 100, // how far the gold scene curtain has come onto the screen (xPercent). The corner gauge color clipping and whether to draw the background both read this value
    revealRects: { gold: null, white: null },
  });
  // Resolves skin variables (including oklch relative colors) into rgb text — GSAP can’t blend oklch, and canvas and WebGL can’t read var()
  const probe = document.createElement("i"), pg = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  SH.rgbOf = (v) => {
    probe.style.color = `var(${v})`;
    document.documentElement.append(probe);
    pg.clearRect(0, 0, 1, 1); pg.fillStyle = getComputedStyle(probe).color; pg.fillRect(0, 0, 1, 1);
    probe.remove();
    const [r, g, b] = pg.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  SH.vec3 = (v) => SH.rgbOf(v).match(/\d+/g).map((n) => n / 255);

  /* ---------------- WebGL common ---------------- */
  const VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  function makeGL(canvas, frag) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = new Proxy({}, { get: (c, k) => (k in c ? c[k] : (c[k] = gl.getUniformLocation(prog, k))) });
    return { gl, u, draw: () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) };
  }

  /* ---------------- Dot grid background ----------------
     The denser a cell in the density field (flowing noise), the larger the dot and the longer the X arms stretch, and denser still adds small dots at the four corners.
     The mouse spot is cleared out, and when the mouse passes quickly it clears elongated in that direction. */
  const DOT_FRAG = `precision highp float;
varying vec2 v;
uniform float uT, uAsp, uGrid, uScroll;
uniform vec2 uDrift, uMouse, uVel;
uniform vec3 uBg[4];
uniform vec3 uFg[4];
uniform vec3 uPh;
float rnd(vec2 q){ q = fract(q * vec2(127.13, 311.71)); q += dot(q, q.yx + 19.19); return fract(q.x * q.y * 1.7); }
float vn(vec2 q){ vec2 i = floor(q), f = fract(q); f = f * f * (3. - 2. * f);
  return mix(mix(rnd(i), rnd(i + vec2(1., 0.)), f.x), mix(rnd(i + vec2(0., 1.)), rnd(i + 1.), f.x), f.y); }
float fb(vec2 q){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vn(q); q = q * 2. + 11.3; a *= .5; } return s; }
float disc(vec2 q, float r){ return 1. - smoothstep(r, r + .008, length(q)); }
float bar(vec2 q, vec2 a, vec2 b, float w){ vec2 qa = q - a, ba = b - a; float k = clamp(dot(qa, ba) / dot(ba, ba), 0., 1.); return 1. - smoothstep(w, w + .008, length(qa - ba * k)); }
void main(){
  vec2 uv = vec2(v.x * uAsp, v.y);
  vec2 q = uv * 2. + uDrift;
  float sf = uScroll * .9;
  vec2 warp = vec2(fb(q + uT * .3 + sf), fb(q + vec2(5.2, 1.3) + uT * .25 + sf * .8));
  float d = smoothstep(.2, .8, fb(q + 2.5 * warp + sf * .15));
  vec2 m = uv - uMouse;
  float sp = length(uVel);
  vec2 dir = sp > .0008 ? uVel / sp : vec2(1., 0.);
  float stretch = min(1. + sp * 26., 6.);
  float edge = (fb(uv * 5. + uMouse * 3. + uT * .12) - .5) * .16 + (fb(uv * 9. - uMouse * 2. + uT * .22) - .5) * .08;
  float md = length(vec2(dot(m, dir) / stretch, dot(m, vec2(-dir.y, dir.x)))) + edge;
  d *= smoothstep(.02, .16, md);
  vec2 g = (fract(uv * uGrid) - .5) * 1.3;
  float glyph = disc(g, mix(.052, .065, smoothstep(0., .55, d)));
  float t = smoothstep(.22, .85, d);
  float L = mix(.03, .26, t), W = mix(.01, .03, t);
  glyph = max(glyph, max(bar(g, vec2(-L), vec2(L), W), bar(g * vec2(-1., 1.), vec2(-L), vec2(L), W)));
  float c = smoothstep(.64, .88, d);
  float sat = max(max(disc(g - vec2(0., .192), .048), disc(g + vec2(0., .192), .048)), max(disc(g - vec2(.192, 0.), .048), disc(g + vec2(.192, 0.), .048)));
  glyph = max(glyph, sat * c);
  vec3 bg = mix(mix(mix(uBg[0], uBg[1], uPh.x), uBg[2], uPh.y), uBg[3], uPh.z);
  vec3 fg = mix(mix(mix(uFg[0], uFg[1], uPh.x), uFg[2], uPh.y), uFg[3], uPh.z);
  gl_FragColor = vec4(mix(bg, fg, glyph), 1.);
}`;

  const pointer = { x: 0.9, y: 0.9, has: false };
  // With reduced motion, turn off the cursor clearing — keep the cursor off-screen like on a phone and draw only the flow
  if (!reduced) addEventListener("mousemove", (e) => { pointer.x = e.clientX / innerWidth; pointer.y = 1 - e.clientY / innerHeight; pointer.has = true; }, { passive: true });

  // colors: { bg: [Skin variable names x4], fg: [Skin variable names x4] } — Background and dot colors for scenes 0~3
  SH.dotField = (canvas, { grid = 50, colors, phases = () => [0, 0, 0], shouldRender = () => true }) => {
    const ctx = makeGL(canvas, DOT_FRAG);
    if (!ctx) return null;
    const { gl, u, draw } = ctx;
    const off = isMobile() ? -10 : 0.9;
    const m = { x: off, y: off }, prev = { x: off, y: off }, vel = { x: 0, y: 0 };
    let asp = 1, visible = true, first = true;
    const size = () => {
      const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      asp = w / h;
    };
    size();
    addEventListener("resize", size);
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
    gl.uniform1f(u.uGrid, grid);
    gl.uniform3fv(u.uBg, colors.bg.map(SH.vec3).flat());
    gl.uniform3fv(u.uFg, colors.fg.map(SH.vec3).flat());
    const t0 = performance.now();
    const frame = () => {
      if (document.hidden || !visible) return;
      if (!first && !shouldRender()) return;
      const t = (performance.now() - t0) / 1000;
      const tx = isMobile() || !pointer.has ? off : pointer.x, ty = isMobile() || !pointer.has ? off : pointer.y;
      m.x += (tx - m.x) * 0.065;
      m.y += (ty - m.y) * 0.065;
      const vx = (m.x - prev.x) * asp, vy = m.y - prev.y;
      prev.x = m.x; prev.y = m.y;
      vel.x += (vx - vel.x) * 0.15;
      vel.y += (vy - vel.y) * 0.15;
      const ph = phases();
      gl.uniform1f(u.uT, t);
      gl.uniform1f(u.uAsp, asp);
      gl.uniform1f(u.uScroll, scrollY / innerHeight);
      gl.uniform2f(u.uDrift, Math.sin(t * 0.09) * 0.85 + Math.sin(t * 0.13) * 0.35, Math.cos(t * 0.07) * 0.7 + Math.cos(t * 0.11) * 0.28);
      gl.uniform2f(u.uMouse, m.x * asp, m.y);
      gl.uniform2f(u.uVel, vel.x, vel.y);
      gl.uniform3f(u.uPh, ph[0], ph[1], ph[2]);
      draw();
      if (first) { first = false; canvas.classList.add("is-on"); }
    };
    gsap.ticker.add(frame);
    return { frame };
  };

  /* ---------------- Convex image ----------------
     Photo slots are baked into a texture (background color · diagonals · faint grid) that bulges where the cursor is. Put a real photo in data-src and it switches to that photo. */
  // Same formula as the original HoverBulge: the photo fits the cell with cover, and bulges around the cursor with damping 1/(1 + distance² × 8)
  const BULGE_VERT = `attribute vec2 uv;
attribute vec2 position;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
varying vec2 vUv;
vec2 cover(vec2 uv, vec2 size, vec2 res) {
  vec2 r = vec2(min((res.x / res.y) / (size.x / size.y), 1.), min((res.y / res.x) / (size.y / size.x), 1.));
  return vec2(uv.x * r.x + (1. - r.x) * .5, uv.y * r.y + (1. - r.y) * .5);
}
void main() { vUv = cover(uv, uTextureResolution, uResolution); gl_Position = vec4(position, 0., 1.); }`;
  const BULGE_FRAG = `precision highp float;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 dir = vUv - uMouse;
  float d = length(dir);
  gl_FragColor = texture2D(uTexture, vUv - dir * uStrength / (1. + d * d * 8.));
}`;
  function placeholderTexture(el, w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const cs = getComputedStyle(el);
    g.fillStyle = cs.backgroundColor && !/,\s*0\)$/.test(cs.backgroundColor) ? cs.backgroundColor : SH.rgbOf("--site-ph-bg");
    g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.06;
    g.strokeStyle = SH.rgbOf("--kf-ink");
    g.lineWidth = 1;
    for (let x = 24; x < w; x += 24) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, h); g.stroke(); }
    for (let y = 24; y < h; y += 24) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5); g.stroke(); }
    g.globalAlpha = 1;
    g.strokeStyle = SH.rgbOf("--site-ph-line");
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    return c;
  }
  // Like the original, OGL (Renderer·Triangle·Program) — the cursor position follows by .1 at a time, intensity sets a target of .06 on enter and .12 on leave, then eases once more by .08, ×.25
  SH.bulge = (el) => {
    if (!window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture, Vec2 } = OGL;
    const renderer = new Renderer({ alpha: true, dpr: Math.min(devicePixelRatio, 2) }), gl = renderer.gl;
    gl.canvas.style.cssText = "width:100%;height:100%;display:block";
    el.prepend(gl.canvas);
    const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
    const program = new Program(gl, {
      vertex: BULGE_VERT, fragment: BULGE_FRAG,
      uniforms: { uTexture: { value: texture }, uMouse: { value: new Vec2(0.5, 0.5) }, uResolution: { value: new Vec2(1, 1) }, uTextureResolution: { value: new Vec2(1, 1) }, uStrength: { value: 0 } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const use = (img) => { texture.image = img; program.uniforms.uTextureResolution.value.set(img.width, img.height); };
    const size = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(w, h);
      if (!el.dataset.src) use(placeholderTexture(el, w, h));
    };
    size();
    addEventListener("resize", size);
    if (el.dataset.src) { const img = new Image(); img.onload = () => use(img); img.src = el.dataset.src; }
    const m = new Vec2(0.9, 0.9), target = new Vec2(0.9, 0.9);
    let inside = false, aim = 0, str = 0, visible = true;
    if (!reduced) addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    }, { passive: true });
    // The menu photo only enters the screen once the curtain opens, so its first paint happens then — do it ahead of time while setting up the texture upload so the first cursor move doesn’t stall
    renderer.render({ scene: mesh });
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);
    gsap.ticker.add(() => {
      m.x += (target.x - m.x) * 0.1; m.y += (target.y - m.y) * 0.1;
      aim += ((inside ? 1 : 0) - aim) * (inside ? 0.06 : 0.12);
      str += (aim - str) * 0.08;
      if (!visible) return;
      program.uniforms.uMouse.value.set(m.x, m.y);
      program.uniforms.uStrength.value = str * 0.25;
      renderer.render({ scene: mesh });
    });
  };


  /* ---------------- Text splitting ---------------- */
  SH.split = (el) => new SplitText(el, { type: "words,chars", wordsClass: "word", charsClass: "char" });

  /* ---------------- Corner gauge ---------------- */
  const arrow = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 8 8 2M3.6 2H8v4.4"/></svg>';
  // Newly drawn placeholder symbol at the same size instead of the original footer symbol (a cube mark)
  const footMark = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 1.5 14 5v6l-6 3.5L2 11V5z"/><path d="M8 1.5v13M2 5l12 6M14 5 2 11"/></svg>';
  const triple = (cls, inner, extra = "") => `
    <div class="sh-ui ${cls}" ${extra}>
      <div class="sh-ui__base">${inner}</div>
      <div class="sh-ui__rev is-gold" aria-hidden="true">${inner}</div>
      <div class="sh-ui__rev is-white" aria-hidden="true">${inner}</div>
    </div>`;
  const toggle = (sign, word) => `<span>[</span><span>${sign}</span><span>${word}</span><span>]</span>`;

  if (chrome === "full") {
    const wrap = document.createElement("div");
    wrap.dataset.slot = "corner-ui";
    wrap.innerHTML = `
      <div class="sh-ui sh-menu-btn" role="button" tabindex="0" aria-label="Open Menu">
        <div class="sh-open">
          <div class="sh-ui__base sh-toggle">${toggle("+", "Menu")}</div>
          <div class="sh-ui__rev is-gold sh-toggle" aria-hidden="true">${toggle("+", "Menu")}</div>
          <div class="sh-ui__rev is-white sh-toggle" aria-hidden="true">${toggle("+", "Menu")}</div>
        </div>
        <div class="sh-close sh-toggle">${toggle("-", "Close")}</div>
      </div>
      <nav class="sh-menu" data-slot="menu-curtain" aria-label="Main menu">
        <canvas class="sh-menu__bg sh-dots"></canvas>
        <div class="sh-menu__img"><div class="sh-bulge wf-img sh-tint" style="--tint:var(--site-tint-9)" data-label="Portrait profile · pink lighting · square"></div></div>
        <div class="sh-menu__img"><div class="sh-bulge wf-img sh-tint" style="--tint:var(--site-tint-23)" data-label="Flower close-up · dark background · square"></div></div>
        <div class="sh-menu__img"><div class="sh-bulge wf-img sh-tint" style="--tint:var(--site-tint-24)" data-label="Paw close-up · purplish · square"></div></div>
        <div class="sh-menu__links">
          <a href="index.html" data-home>Menu 1</a>
          <a href="list.html">Menu 2</a>
          <a href="mailto:hello@example.com">Menu 3</a>
        </div>
      </nav>
      ${triple("sh-logo", '<a href="index.html" aria-label="Home">Logo</a>')}
      ${triple("sh-contact", '<a href="mailto:hello@example.com">Inquiry</a>')}
      ${triple("sh-footmark", `<a href="#" aria-label="Parent company">${footMark}</a>`)}
      ${triple("sh-lw", `<a href="works.html">Here <b>Recent Work</b> ${arrow}</a>`)}
      ${triple("sh-counter", "")}`;
    body.prepend(wrap);

    // On the first page the scroll scene shows the corner gauge. Other pages show it right away at .8s
    const corners = wrap.querySelectorAll(".sh-menu-btn, .sh-logo, .sh-contact");
    if (page === "home") gsap.set(corners, { autoAlpha: 0 });
    else gsap.fromTo(corners, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.inOut", stagger: 0.1 });

    /* Menu Curtain */
    const btn = wrap.querySelector(".sh-menu-btn");
    const menu = wrap.querySelector(".sh-menu");
    const links = menu.querySelectorAll(".sh-menu__links a");
    const pics = menu.querySelectorAll(".sh-bulge");
    let open = false;
    gsap.set(menu, { yPercent: -100, y: 0, transform: "" });
    const menuDots = SH.dotField(menu.querySelector(".sh-menu__bg"), {
      grid: 65,
      colors: { bg: Array(4).fill("--site-salmon"), fg: Array(4).fill("--site-dot-15") },
      shouldRender: () => open || gsap.isTweening(menu),
    });
    pics.forEach(SH.bulge);
    const setMenu = (next) => {
      open = next;
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      if (open) {
        gsap.to(pics, { opacity: 1, filter: "blur(0px)", duration: 0.75, stagger: 0.1, delay: 1, ease: "power3.inOut" });
        gsap.to(links, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, stagger: 0.08, delay: 0.7, onComplete: () => links.forEach((a) => (a.style.pointerEvents = "auto")) });
        gsap.to(menu, { yPercent: 0, duration: 1, ease: "power4.inOut" });
        SH.lenis?.stop();
      } else {
        gsap.to(pics, { opacity: 0, filter: "blur(10px)", duration: 0.25, stagger: { each: 0.08, from: "end" } });
        gsap.to(links, { opacity: 0, y: -50, filter: "blur(10px)", duration: 0.25, stagger: { each: 0.08, from: "end" }, onComplete: () => links.forEach((a) => (a.style.pointerEvents = "none")) });
        gsap.to(menu, { yPercent: -100, duration: 1, ease: "power4.inOut" });
        SH.lenis?.start();
      }
    };
    btn.addEventListener("click", () => setMenu(!open));
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenu(!open); } });
    menuDots && menuDots.frame();

    /* Visit signals — seconds on page counted every 1 second, scroll count every 250px, kept in the session */
    const counter = wrap.querySelector(".sh-counter");
    const parts = counter.querySelectorAll(".sh-ui__base, .sh-ui__rev");
    const store = (k) => Number(sessionStorage.getItem("sh-" + k)) || 0;
    let scrolls = store("scrolls");
    const started = Date.now() - store("seconds") * 1000;
    let lastY = scrollY, wheelSum = 0;
    const render = () => {
      const now = new Date();
      const secs = Math.floor((Date.now() - started) / 1000);
      sessionStorage.setItem("sh-seconds", secs);
      const txt = `const stats = {\n  location: "Your city here",\n  time: "${now.getHours()}h${String(now.getMinutes()).padStart(2, "0")}",\n  scrollCount: ${scrolls},\n  secondsElapsed: ${secs}};`;
      parts.forEach((p) => (p.textContent = txt));
    };
    const bump = () => { scrolls++; sessionStorage.setItem("sh-scrolls", scrolls); render(); };
    addEventListener("scroll", () => { if (Math.abs(scrollY - lastY) > 250) { lastY = scrollY; bump(); } }, { passive: true });
    // On pages with no scroll (the tunnel in the work list), count by wheel amount
    addEventListener("wheel", (e) => {
      if (document.documentElement.scrollHeight > innerHeight + 1) return;
      wheelSum += Math.abs(e.deltaY);
      if (wheelSum > 250) { wheelSum = 0; bump(); }
    }, { passive: true });
    render();
    setInterval(render, 1000);

    /* Gold and white layer cut — only while the scene’s gold rectangle (.background-image spot) and the last photo (.last-image spot) pass under the gauge */
    const uis = [...wrap.querySelectorAll(".sh-ui")].filter((el) => el.querySelector(".is-gold"));
    const NONE = "polygon(0 0, 0 0, 0 0, 0 0)";
    const clipFor = (src, d, lo, hi) => {
      if (!src) return null;
      const r = src.getBoundingClientRect();
      const l = Math.max(r.left, lo), rr = Math.min(r.right, hi);
      if (!(l < rr && l < d.right && rr > d.left)) return null;
      return { l: l - d.left, t: r.top - d.top, w: rr - l, h: r.height };
    };
    const poly = (c) => `polygon(${c.l}px ${c.t}px, ${c.l + c.w}px ${c.t}px, ${c.l + c.w}px ${c.t + c.h}px, ${c.l}px ${c.t + c.h}px)`;
    SH.updateReveal = () => {
      const { gold, white } = SH.revealRects;
      if (!gold && !white) return;
      const x = SH.fullX, W = innerWidth;
      const lo = (Math.max(x, 0) / 100) * W, hi = W - (Math.max(-x, 0) / 100) * W;
      uis.forEach((el) => {
        const base = el.querySelector(".sh-ui__base"), g = el.querySelector(".is-gold"), w = el.querySelector(".is-white");
        const d = el.getBoundingClientRect();
        const cg = clipFor(gold, d, lo, hi), cw = clipFor(white, d, lo, hi);
        g.style.clipPath = cg ? poly(cg) : NONE;
        w.style.clipPath = cw ? poly(cw) : NONE;
        if (cg || cw) {
          const a = cg || { l: 0, t: 0, w: 0, h: 0 }, b = cw || { l: 0, t: 0, w: 0, h: 0 };
          base.style.maskImage = base.style.webkitMaskImage = "linear-gradient(black, black), linear-gradient(black, black), linear-gradient(black, black)";
          base.style.maskSize = base.style.webkitMaskSize = `100% 100%, ${a.w}px ${a.h}px, ${b.w}px ${b.h}px`;
          base.style.maskPosition = base.style.webkitMaskPosition = `0 0, ${a.l}px ${a.t}px, ${b.l}px ${b.t}px`;
          base.style.maskComposite = "add, subtract, subtract";
          base.style.webkitMaskComposite = "source-over, destination-out, destination-out";
        } else base.style.maskImage = base.style.webkitMaskImage = "none";
      });
    };
    gsap.ticker.add(() => SH.updateReveal());
  }

  /* ---------------- Loader: loader.js at the very top of index.html runs from the first paint (once per session) ---------------- */
  SH.ready = window.SHLoader || Promise.resolve();
  if (!window.SHLoader) document.documentElement.classList.add("sh-loaded");

  /* ---------------- Smooth scroll ---------------- */
  if (!reduced && window.Lenis && body.dataset.lenis !== "off") {
    const lenis = (SH.lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (body.classList.contains("sh-loader-active")) { lenis.stop(); SH.ready.then(() => lenis.start()); }
  }

  /* The page transition switches immediately with no cover — the original Astro view transition sets .18s·.35s fade rules but in the same css
     ::view-transition-*(*) { animation: none !important } wins out over all those rules, so in practice it swaps right in */
})();
