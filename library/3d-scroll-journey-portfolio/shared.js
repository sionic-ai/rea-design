/* Common to all pages: entrance door loader · menu bar · page transition curtain · Lenis · scroll ranges → 3D scene and on-screen text. 
   The original is one long scroll and each URL starts at a different point within it. Here each page holds only its own section
   <body data-start="Segment"> Starts here. Add #enter to the end of the address to skip the entry door (for captures). */
(() => {
  const html = document.documentElement;
  const body = document.body;
  const page = body.dataset.page;
  // If settings ask for reduced motion, put the loader, transition and letter roll straight into the final state
  let reduce = false;
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => { reduce = true; return () => (reduce = false); });
  const portrait = () => matchMedia("(orientation: portrait)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const span = (p, a, b) => clamp((p - a) / (b - a));

  const LOGO = `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 14V9.5a4 4 0 0 1 4-4h13a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H17"/><path d="M5.5 20v2.5a4 4 0 0 0 4 4H11"/><path d="M12 12h8.5v8.5"/></svg>`;
  const ARROW_DIAG = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 2l8 8M10 3.5V10H3.5"/></svg>`;
  const CHEVRON = `<svg viewBox="0 0 6 11" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 1l4 4.5L1 10"/></svg>`;
  const roll = (text) => [...text].map((c) => `<span class="ae-roll"><span>${c}</span><span>${c}</span></span>`).join("");

  /* ---------- Set up shared pieces ---------- */
  const fill = (sel, markup) => { const el = document.querySelector(sel); if (el) el.outerHTML = markup; };
  const bars = Array.from({ length: 34 }, (_, i) => { const w = [1, 2, 1, 3, 1, 1, 2][(i * 5) % 7]; return w; });
  let bx = 0;
  const barcode = bars.map((w, i) => { const r = i % 2 ? "" : `<rect x="${bx}" y="0" width="${w}" height="40" fill="currentColor"/>`; bx += w + 0.6; return r; }).join("");
  fill('[data-slot="loader-gate"]', `
  <div class="ae-loader" data-slot="loader-gate" aria-busy="true">
    <span class="ae-loader__grid" aria-hidden="true"></span>
    <div aria-hidden="true"><span class="ae-loader__line is-l"></span><span class="ae-loader__line is-r"></span><span class="ae-loader__line is-t"></span><span class="ae-loader__line is-b"></span></div>
    <div class="ae-loader__corner" aria-hidden="true"><div class="wf-img" data-label="Plant leaf black and white · side light · 4:5"></div></div>
    <header class="ae-loader__head"><span class="ae-loader__name" data-label="Your creator or studio English name here (one uppercase word)">STUDIO</span><span class="ae-loader__role">What you do here</span></header>
    <span class="ae-loader__logo">${LOGO}</span>
    <button class="ae-loader__lite is-on" type="button"><span class="ae-arrowbox">${ARROW_DIAG}${ARROW_DIAG}</span><span class="ae-loader__litelabel">Light version</span></button>
    <span class="ae-loader__pct" style="--load-p:0"><span>0</span></span>
    <aside class="ae-ticket" aria-hidden="true">
      <div class="ae-ticket__art"></div>
      <svg class="ae-ticket__arch" viewBox="0 0 100 150" fill="none" stroke="currentColor" stroke-width=".8">
        <path d="M14 148V62a36 36 0 0 1 72 0v86M30 148V64a20 20 0 0 1 40 0v84"/>
        <path d="M14 76h16M14 92h16M14 108h16M14 124h16M14 140h16M70 76h16M70 92h16M70 108h16M70 124h16M70 140h16M18 40l14 10M32 22l8 14M50 16v16M68 22l-8 14M82 40l-14 10M86 58H70M14 58h16"/>
      </svg>
      <span class="ae-ticket__variant"><svg viewBox="0 0 11 8" fill="none" stroke="currentColor"><path d="M1 1l3 3-3 3M6 1l3 3-3 3"/></svg>VARIANT <span class="ae-ticket__accent">01</span></span>
      <span class="ae-ticket__archlabel">ARCH //</span>
      <svg class="ae-ticket__spark" viewBox="0 0 22 60" fill="currentColor"><path d="M11 0l1.6 26L22 30l-9.4 4L11 60l-1.6-26L0 30l9.4-4z"/></svg>
      <svg class="ae-ticket__planet" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width=".8"><circle cx="9" cy="9" r="5"/><ellipse cx="9" cy="9" rx="8.4" ry="2.6" transform="rotate(-25 9 9)"/></svg>
      <svg class="ae-ticket__dots" viewBox="0 0 18 18" fill="currentColor"><circle cx="3" cy="3" r="1"/><circle cx="9" cy="3" r="1"/><circle cx="15" cy="3" r="1"/><circle cx="3" cy="9" r="1"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>
      <span class="ae-ticket__sep"></span>
      <svg class="ae-ticket__layers" viewBox="0 0 60 50" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M30 6l26 12-26 12L4 18z"/><path d="M4 26l26 12 26-12M4 34l26 12 26-12"/></svg>
      <svg class="ae-ticket__rings" viewBox="0 0 25 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8.5" cy="8" r="6.5"/><circle cx="16.5" cy="8" r="6.5"/></svg>
      <span class="ae-ticket__pill">online</span>
      <span class="ae-ticket__num">000</span>
      <span class="ae-ticket__word">${[..."PORTFOLIO"].map((c) => `<span>${c}</span>`).join("")}</span>
      <span class="ae-ticket__made">MADE IN<br><span class="ae-ticket__accent">EARTH</span></span>
      <span class="ae-ticket__plus">${"++++ +×++ ++++".replace(/ /g, "").split("").map((c) => `<span>${c}</span>`).join("")}</span>
      <span class="ae-ticket__barcode"><svg viewBox="0 0 ${bx} 40" preserveAspectRatio="none">${barcode}</svg></span>
      <span class="ae-ticket__barlabel">site.name</span>
      <span class="ae-ticket__logo">${LOGO}</span>
      <span class="ae-ticket__copy">© 2026</span>
    </aside>
    <div class="ae-loader__zone">
      <span class="ae-loader__status">Loading work</span>
      <button class="ae-loader__cta" type="button" aria-label="Step inside the website" data-label="Your entrance button English text here (four uppercase words, about 23 characters — the character count sets the length of the staggered roll)"><span class="ae-loader__ctalabel">${roll("STEP INSIDE THE WEBSITE")}</span></button>
      <div class="ae-loader__track"><div class="ae-loader__fill"></div></div>
    </div>
  </div>`);

  const LINKS = [["Home", "index.html", "home"], ["Work", "works.html", "works"], ["About", "about.html", "about"], ["Contact", "contact.html", "contact"], ["Light edition", "#", ""], ["Laboratory", "#", ""]];
  fill('[data-slot="nav"]', `
  <nav class="ae-nav" data-slot="nav">
    <a class="ae-nav__logo" href="index.html" aria-label="Home">${LOGO}</a>
    <button class="ae-icon ae-nav__sound" type="button" aria-label="Sound Off"><svg viewBox="0 0 20 16" fill="currentColor">${[3, 7, 11, 15, 9, 5].map((h, i) => `<rect style="--i:${i}" x="${1.5 + i * 3.2}" y="${8 - h / 2}" width="1.3" height="${h}" rx=".6"/>`).join("")}</svg></button>
    <div class="ae-nav__avail-wrap">
      <button class="ae-nav__avail" type="button" aria-label="Copy email address"><span class="ae-nav__dot"></span><span class="ae-nav__strong">Taking on work</span></button>
      <span class="ae-nav__copied" data-show="false"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2.5 6.5l2.2 2.2L9.5 3.5"/></svg>Email address copied</span>
    </div>
    <button class="ae-icon ae-nav__menu" type="button" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 20 4" fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="10" cy="2" r="1.5"/><circle cx="18" cy="2" r="1.5"/></svg></button>
    <div class="ae-menu" aria-hidden="true">
      <span class="ae-menu__line"></span>
      <ul class="ae-menu__links">${LINKS.map(([t, h, p]) => `<li class="ae-menu__item"><a class="ae-menu__link" href="${h}"${p && p === page ? ' aria-current="page"' : ""}><span class="ae-menu__label">${t}</span><svg class="ae-menu__hoverdot" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg></a></li>`).join("")}</ul>
    </div>
  </nav>`);
  fill('[data-slot="veil"]', `<canvas class="ae-veil" data-slot="veil" aria-hidden="true"></canvas>`);

  /* ---------- Lenis ---------- */
  const lenis = window.Lenis && !reduce ? new Lenis({ lerp: 0.125, smoothWheel: true }) : null;
  if (lenis) gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  const jump = (y) => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));

  /* ---------- Scroll range ---------- */
  const sections = [...document.querySelectorAll(".ae-track > [data-scene]")];
  let geo = [];
  const measure = () => { geo = sections.map((el) => ({ el, name: el.dataset.scene, top: el.offsetTop, h: Math.max(1, el.offsetHeight) })); };
  addEventListener("resize", measure); measure();
  const startY = () => {
    const s = geo.find((g) => g.name === body.dataset.start);
    return s ? Math.round(s.top + s.h * Number(body.dataset.startAt || 0)) : 0;
  };

  /* ---------- On-screen text ---------- */
  const $ = (s) => document.querySelector(s);
  const vis = (el, on) => el && el.setAttribute("data-visible", on ? "true" : "false");
  const scrollHint = $(".ae-scrollhint"), discover = $(".ae-discover"), count = $(".ae-count"), drag = $(".ae-drag");
  const subs = [...document.querySelectorAll(".ae-subs__line")].map((line) => {
    line.innerHTML = [...line.textContent].map((c) => `<i>${c}</i>`).join("");
    return { line, chars: [...line.children] };
  });
  const about = $(".ae-about"), hudmap = $(".ae-hudmap"), contact = $(".ae-contact");
  const aboutParts = about ? [".ae-about__title", ".ae-about__sub", ".ae-about__lead"].map((s) => about.querySelector(s)) : [];
  const plate = about && about.querySelector(".ae-about__plate");
  const swapBase = $(".ae-swap__base"), swapNoise = $(".ae-swap__noise");
  let entered = false, dragged = false;

  const subtitles = (p, on) => subs.forEach((s, i) => {
    const n = subs.length, local = p * n - i;
    const a = on ? span(local, 0.04, 0.12) * (1 - span(local, 0.86, 0.97)) : 0;
    s.line.style.opacity = a;
    const shown = span(local, 0.04, 0.4) * s.chars.length;
    s.chars.forEach((c, k) => (c.style.opacity = clamp(shown - k)));
  });
  const aboutView = (p, on) => {
    if (!about) return;
    about.style.opacity = on ? 1 - span(p, 0.9, 0.97) : 0;
    [[0.08, 0.2], [0.12, 0.24], [0.16, 0.3]].forEach(([a, b], i) => aboutParts[i] && (aboutParts[i].style.clipPath = `inset(-.4em ${(1 - span(p, a, b)) * 100}% -.4em 0)`));
    if (plate) plate.style.opacity = span(p, 0.24, 0.32);
    const rv = on ? span(p, 0.55, 0.62) : 0;
    if (swapNoise) swapNoise.style.clipPath = `inset(-.4em ${(1 - rv) * 100}% -.4em 0)`;
    if (swapBase) swapBase.style.clipPath = `inset(-.4em 0 -.4em ${rv * 100}%)`;
    about.classList.toggle("is-reveal", rv > 0.5);
    if (hudmap) { hudmap.style.opacity = on ? span(p, 0.18, 0.3) * (1 - span(p, 0.88, 0.95)) : 0; hudmap.classList.toggle("is-reveal", rv > 0.5); }
    return rv;
  };

  /* Segment name → scene to draw · black curtain strength · text state */
  const route = (name, p) => {
    const st = window.AeStage;
    const view = (...a) => st && st.view(...a);
    const worksOn = (name === "works" && p < 0.6) || (name === "arch" && p > 0.992);
    vis(scrollHint, entered && name === "arch" && p < 0.015);
    vis(discover, entered && worksOn); vis(count, entered && worksOn); vis(drag, entered && worksOn && !dragged);
    subtitles(name === "streams" ? p : 0, name === "streams");
    const rv = aboutView(name === "survey" ? p : 0, name === "survey");
    // When hidden, also drop visibility so the link can’t be clicked
    if (contact) { const o = name === "reveal" ? span(p, 0.2, 0.4) : 0; contact.style.opacity = o; contact.style.visibility = o > 0.02 ? "visible" : "hidden"; }
    switch (name) {
      case "arch": return p < 0.985 ? view("arch", p, {}, span(p, 0.93, 0.985)) : view("crystal", 0, {}, 1 - span(p, 0.985, 1));
      case "works": return view("crystal", p, {}, span(p, 0.7, 0.97));
      case "streams": return view("streams", 0, {}, 1 - span(p, 0, 0.06));
      case "travel": return view("streams", p, {}, span(p, 0.9, 1));
      case "survey": return view("flower", p, { reveal: rv }, Math.max(1 - span(p, 0, 0.05), span(p, 0.93, 1)));
      case "handoff": return view("hand", 0, { handoff: p }, 1 - span(p, 0, 0.08));
      case "reveal": return view("hand", p, {}, 0);
      case "interior": return view("interior", 0, {}, 0);
      default: return view(geo.length > 1 ? "hand" : "interior", 1, {}, 0);
    }
  };
  gsap.ticker.add(() => {
    const y = scrollY;
    let g = geo[0];
    for (const s of geo) if (y >= s.top - 1) g = s;
    if (g) route(g.name, clamp((y - g.top) / g.h));
  });

  /* ---------- Transition curtain ----------
     Source values: curtain progress 0→1 covers (2.45s × .45 = 1.1025s sine.out), 1→2 is walking (× .55 = 1.3475s sine.inOut).
     Covers from where progress passes a threshold mixing the screen diagonal (top-left 0 → bottom-right 1) and 3-layer noise (scale 7.3, drifting diagonally by progress × .4) at .21,
     Edge width .13 · edge brightness +35% · previous screen darkened 9%. During progress 0~1.6, text and buttons on screen hide in .2s (data-veil-cover).
     The original refracts the scene image at the edges (.12), but beneath the overlay is DOM so it is skipped */
  function makeVeil(cv) {
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    const st = { p: 0 };
    let draw = () => {};
    if (gl) {
      const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `precision highp float;
uniform vec2 uRes; uniform float uP; uniform vec3 uColor;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1. - uv.y;
  float s = uRes.x / uRes.y; vec2 u = (uv - .5) * vec2(s, 1.);
  float m = clamp((u.x + s * .5 + u.y + .5) / (s + 1.), 0., 1.);
  float n = .13, c = uP * .4 * .70710678;
  vec2 d = u * 7.3 - vec2(c);
  float f = (noise(d) * .5 + noise(d * 2.03 + vec2(17.3, 9.1)) * .25 + noise(d * 4.11 + vec2(31.7, 27.9)) * .125) / .875;
  float p = clamp(mix(m, f, .21), 0., 1.) * (1. - n);
  float h = clamp((uP - p) / n, 0., 1.), g = clamp((uP - 1. - p) / n, 0., 1.);
  float v = smoothstep(0., 1., h) * (1. - smoothstep(0., 1., g));
  float on = step(1e-4, uP);
  float x = smoothstep(.12, .7, v) * on, y = smoothstep(0., .45, v) * .09 * on;
  gl_FragColor = vec4(uColor * (1. + (1. - v) * .35) * x, x + (1. - x) * y);
}`));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uRes = gl.getUniformLocation(prog, "uRes"), uP = gl.getUniformLocation(prog, "uP"), uColor = gl.getUniformLocation(prog, "uColor");
      // Membrane color comes from the skin — read by resolving to a single canvas point
      const g2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      g2.fillStyle = getComputedStyle(cv).color;
      g2.fillRect(0, 0, 1, 1);
      const [r, gg, b] = g2.getImageData(0, 0, 1, 1).data;
      const size = () => {
        const k = Math.min(devicePixelRatio, 1.5);
        cv.width = Math.round(innerWidth * k); cv.height = Math.round(innerHeight * k);
        gl.viewport(0, 0, cv.width, cv.height);
      };
      size();
      addEventListener("resize", () => (size(), draw()));
      draw = () => {
        gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uP, st.p);
        gl.uniform3f(uColor, r / 255, gg / 255, b / 255);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        if (st.p > 0 && st.p < 2) gl.drawArrays(gl.TRIANGLES, 0, 3);
        const covering = st.p > 0 && st.p < 1.6;
        if (covering !== html.hasAttribute("data-veil-cover")) html.toggleAttribute("data-veil-cover", covering);
        cv.classList.toggle("is-on", st.p > 0 && st.p < 1);
      };
    }
    const T = 2.45;
    return {
      cover(done) {
        if (reduce || !gl) return done();
        gsap.killTweensOf(st);
        gsap.fromTo(st, { p: 0 }, { p: 1, duration: 0.45 * T, ease: "sine.out", onUpdate: draw, onComplete: done });
      },
      reveal() {
        if (reduce || !gl) return;
        gsap.fromTo(st, { p: 1 }, { p: 2, duration: 0.55 * T, ease: "sine.inOut", onUpdate: draw, onComplete: () => ((st.p = 0), draw()) });
        draw();
      },
    };
  }

  /* ---------- Loader → Enter ---------- */
  const loader = $(".ae-loader"), nav = $(".ae-nav");
  const veil = makeVeil($(".ae-veil"));
  const sound = $(".ae-nav__sound");
  const enter = (how) => {
    entered = true;
    html.classList.remove("is-gated");
    loader.setAttribute("aria-busy", "false");
    measure(); jump(startY());
    if (lenis) lenis.start();
    sessionStorage.setItem("ae-entered", "1");
    // Original values: with exiting (fades at .9s after .1s) attached, the loader is removed after 1020ms (LOADER_EXIT_TO_REVEAL_MS)
    if (how === "gate") {
      loader.classList.add("is-exiting");
      // Entering from the first scene (arch) runs the scene waking-up sequence as in the original and shows the menu bar at 2.3s — entering from another segment is the moment the loader has been removed
      gsap.delayedCall(1.02, () => loader.remove());
      const showNav = () => nav.classList.add("is-visible");
      if (geo[0] && scrollY <= geo[0].top + 4 && geo[0].name === "arch" && window.AeStage?.landingEntry) window.AeStage.landingEntry(showNav);
      else gsap.delayedCall(1.02, showNav);
      sound.classList.add("is-on");
    }
    else { loader.classList.add("is-skipped"); nav.classList.add("is-visible"); sound.classList.toggle("is-on", sessionStorage.getItem("ae-sound") !== "0"); }
  };
  const skip = location.hash === "#enter";
  const fromInside = sessionStorage.getItem("ae-entered") === "1";
  if (skip || fromInside) {
    enter("skip");
    if (fromInside && !skip) veil.reveal();
  } else {
    html.classList.add("is-gated");
    if (lenis) lenis.stop();
    const pct = loader.querySelector(".ae-loader__pct"), pctN = pct.firstElementChild, num = loader.querySelector(".ae-ticket__num");
    const fillEl = loader.querySelector(".ae-loader__fill"), status = loader.querySelector(".ae-loader__status");
    const st = { v: 0 };
    let first = "Loading work", tl;
    const paint = () => {
      const v = Math.round(st.v);
      pct.style.setProperty("--load-p", (v / 100).toFixed(3)); pctN.textContent = v; num.textContent = String(v).padStart(3, "0"); fillEl.style.width = v + "%";
      status.innerHTML = v < 30 ? first : v < 100 ? `Loading scene <span style="text-transform:lowercase;color:var(--site-dim-2);font-weight:400">scene-0${1 + (v % 4)}.glb</span>` : "Ready";
    };
    const gate = () => { loader.classList.add("is-gate"); };
    const load = () => {
      if (tl) tl.kill();
      loader.classList.remove("is-gate"); st.v = 0; paint();
      if (reduce) { st.v = 100; paint(); gate(); return; }
      tl = gsap.timeline({ onComplete: () => gsap.delayedCall(0.4, gate) })
        .to(st, { v: 30, duration: 0.6, ease: "power2.out", onUpdate: paint })
        .to(st, { v: 93, duration: 0.9, ease: "power2.inOut", onUpdate: paint }, "+=0.2")
        .to(st, { v: 100, duration: 0.5, ease: "power2.out", onUpdate: paint });
    };
    load();
    // Plate swap: the text changes to another plate name and the loader restarts from ”Baking shaders”
    const lite = loader.querySelector(".ae-loader__lite"), liteLabel = lite.querySelector(".ae-loader__litelabel");
    lite.addEventListener("click", (e) => {
      e.preventDefault();
      const toLite = liteLabel.textContent.startsWith("Light");
      liteLabel.textContent = toLite ? "Full version" : "Light version";
      first = "Baking shaders"; load();
    });
    const cta = loader.querySelector(".ae-loader__cta");
    const fronts = [...cta.querySelectorAll(".ae-roll > span:first-child")], unders = [...cta.querySelectorAll(".ae-roll > span + span")];
    gsap.set(unders, { y: 0, yPercent: 110 });
    // Original numbers: the visible set exits upward at −110% while another set rises in from 110% below (.47s · .0187s per letter · power4.out).
    // Even after release it always rolls upward, and while rolling the next roll runs after it ends — it does not rewind like the original
    const sets = { front: fronts, under: unders };
    let showing = "front", want = "front", rolling = false;
    const roll = () => {
      if (rolling || showing === want) return;
      if (reduce) { gsap.set(sets[showing], { yPercent: 110 }); gsap.set(sets[want], { yPercent: 0 }); showing = want; return; }
      rolling = true;
      gsap.timeline({ onComplete: () => { rolling = false; showing = showing === "front" ? "under" : "front"; roll(); } })
        .to(sets[showing], { yPercent: -110, duration: 0.47, stagger: 0.0187, ease: "power4.out" }, 0)
        .fromTo(sets[want], { yPercent: 110 }, { yPercent: 0, duration: 0.47, stagger: 0.0187, ease: "power4.out" }, 0);
    };
    cta.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && ((want = "under"), roll()));
    cta.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && !cta.disabled && ((want = "front"), roll()));
    // The original locks the button on press — can’t press again and the text fades to 30%
    cta.addEventListener("click", () => { cta.disabled = true; enter("gate"); });
  }

  /* ---------- Menu ---------- */
  const menuBtn = $(".ae-nav__menu"), panel = $(".ae-menu");
  const items = [...panel.querySelectorAll(".ae-menu__item")], line = panel.querySelector(".ae-menu__line");
  let open = false;
  const setMenu = (on) => {
    open = on; menuBtn.setAttribute("aria-expanded", on); panel.setAttribute("aria-hidden", !on);
    if (portrait()) {
      gsap.to(panel, { clipPath: on ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", duration: reduce ? 0 : 0.5, ease: "power3.out", overwrite: true });
      return;
    }
    gsap.to(line, { width: on ? "100%" : "0%", duration: reduce ? 0 : 0.45, ease: on ? "power3.out" : "power3.in", delay: on ? 0 : 0.15, overwrite: true });
    gsap.to(items, { clipPath: on ? "inset(0 0 0 0%)" : "inset(0 0 0 100%)", duration: reduce ? 0 : 0.5, ease: on ? "power3.out" : "power3.in", stagger: on ? 0.05 : 0.03, delay: on ? 0.15 : 0, overwrite: true });
  };
  menuBtn.addEventListener("click", () => setMenu(!open));
  addEventListener("keydown", (e) => e.key === "Escape" && open && setMenu(false));
  addEventListener("click", (e) => open && !e.target.closest(".ae-nav") && setMenu(false));

  sound.addEventListener("click", () => {
    const on = sound.classList.toggle("is-on");
    sound.setAttribute("aria-label", on ? "Sound Off" : "Sound On"); sessionStorage.setItem("ae-sound", on ? "1" : "0");
  });
  const copied = $(".ae-nav__copied");
  $(".ae-nav__avail").addEventListener("click", () => {
    navigator.clipboard?.writeText("your@email.address").catch(() => {});
    copied.dataset.show = "true"; clearTimeout(copied._t); copied._t = setTimeout(() => (copied.dataset.show = "false"), 1600);
  });

  /* ---------- Page transition: a noisy-edged curtain sweeps from top left to bottom right to cover, then clears the same way on the next page ---------- */
  const go = (href) => {
    sessionStorage.setItem("ae-entered", "1");
    veil.cover(() => (location.href = href));
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) { if (href === "#") e.preventDefault(); return; }
    e.preventDefault(); if (open) setMenu(false); go(href);
  });
  window.AeSite = { go, scrollToScene: (name) => { const s = geo.find((g) => g.name === name); if (s) (lenis ? lenis.scrollTo(s.top + 2, { duration: 2.2 }) : window.scrollTo(0, s.top + 2)); } };

  // Original values: to the 38.88% point of the first scene (arch), the door face, in remaining distance ÷ 74.2358vh seconds (1.2~7s), on a fifth-order curve (6t⁵ − 15t⁴ + 10t³)
  scrollHint && scrollHint.querySelector("button").addEventListener("click", () => {
    const s = geo.find((g) => g.name === "arch");
    if (!s) return;
    const to = s.top + s.h * 0.3888, dur = Math.min(7, Math.max(1.2, (to - scrollY) / (innerHeight * 0.742358)));
    if (lenis) lenis.scrollTo(to, { duration: dur, easing: (t) => ((6 * t - 15) * t + 10) * t * t * t, lock: true, force: true });
    else window.scrollTo(0, to);
  });

  /* ---------- Work edit front: Next and drag flip through six works ---------- */
  const list = [...document.querySelectorAll(".ae-projects > li")];
  if (discover && count && list.length) {
    const front = discover.querySelector(".ae-discover__title > .is-front"), under = discover.querySelector(".ae-discover__title > .is-under");
    const cells = [...count.querySelectorAll(".ae-count__cur .ae-roll")];
    count.querySelector(".ae-count__total").textContent = "/ " + String(list.length).padStart(2, "0");
    let idx = 0, busy = false;
    const crystal = () => window.AeStage && window.AeStage.crystal;
    const show = (dir) => {
      if (busy) return; busy = true; dragged = true;
      idx = (idx + dir + list.length) % list.length;
      const name = list[idx].textContent.trim();
      under.textContent = name;
      const d = reduce ? 0 : 0.8;
      gsap.fromTo(under, { clipPath: "inset(-32px 100% -32px 0%)" }, { clipPath: "inset(-32px 0% -32px 0%)", duration: d, ease: "power3.inOut" });
      gsap.fromTo(front, { clipPath: "inset(-32px 0% -32px 0%)" }, { clipPath: "inset(-32px 0% -32px 100%)", duration: d, ease: "power3.inOut", onComplete: () => {
        front.textContent = name; gsap.set(front, { clipPath: "none" }); gsap.set(under, { clipPath: "inset(-32px 100% -32px 0%)" }); busy = false;
      } });
      String(idx + 1).padStart(2, "0").split("").forEach((digit, k) => {
        const [f, u] = cells[k].children; if (f.textContent === digit) return;
        u.textContent = digit;
        gsap.fromTo(f, { yPercent: 0 }, { yPercent: dir > 0 ? -110 : 110, duration: reduce ? 0 : 0.6, ease: "power3.out" });
        gsap.fromTo(u, { yPercent: dir > 0 ? 110 : -110 }, { yPercent: 0, duration: reduce ? 0 : 0.6, ease: "power3.out", onComplete: () => { f.textContent = digit; gsap.set(f, { yPercent: 0 }); gsap.set(u, { yPercent: 110 }); } });
      });
      const c = crystal(); if (c) { c.target += (dir * Math.PI) / 3; c.hueT = 0.57 + Number(list[idx].dataset.hue || 0); }
    };
    gsap.set(cells.map((c) => c.children[1]), { y: 0, yPercent: 110 });
    count.querySelector(".ae-count__next").addEventListener("click", () => show(1));
    let x0 = null;
    addEventListener("pointerdown", (e) => { if (discover.dataset.visible === "true" && !e.target.closest("a,button")) x0 = e.clientX; });
    addEventListener("pointermove", (e) => { if (x0 == null) return; const c = crystal(); if (c) c.drag = (e.clientX - x0) * 0.004; });
    addEventListener("pointerup", (e) => {
      if (x0 == null) return; const dx = e.clientX - x0; x0 = null; const c = crystal(); if (c) c.drag = 0;
      if (Math.abs(dx) > 80) show(dx < 0 ? 1 : -1);
    });
    discover.querySelector(".ae-discover__btn").addEventListener("click", () => {
      const c = crystal();
      if (c && !reduce) gsap.to(c, { morph: 1, duration: 0.9, ease: "power2.in", onComplete: () => go("detail.html") }); else go("detail.html");
    });
  }

  const clock = $(".ae-hudmap__time");
  if (clock) { const tick = () => (clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false })); tick(); setInterval(tick, 1000); }

  /* Photo flip in the detail view: next slide every 4 seconds, the bar below fills in step */
  const car = $(".ae-carousel");
  if (car) {
    const slides = [...car.querySelectorAll(".ae-carousel__slide")], bar = $(".ae-carousel__bar > i");
    let k = 0;
    const next = () => {
      slides.forEach((s, i) => s.classList.toggle("is-on", i === k));
      if (!reduce) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 4, ease: "none", onComplete: () => { k = (k + 1) % slides.length; next(); } });
      else gsap.set(bar, { scaleX: 1 });
    };
    next();
  }
})();
