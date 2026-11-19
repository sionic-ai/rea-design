// Shared by all four pages: header (sentence logo, two-line button, hides on scroll down and switches text color to follow the base color below) · menu (four color panels drop in at 90° pivoting on the top right corner)
// · first-visit loader (sentence logo drawn in a gold line) · transition curtain (card-deal-page) · footer (title letters rising, seat cards, a table picture revealed in gold only where passed).
// Curves keep the original names: deal(0.16,1,0.3,1) and sweep(0.76,0,0.24,1). Smooth scroll is Lenis 1.3.26.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  CustomEase.create("deal", "0.16, 1, 0.3, 1");
  CustomEase.create("sweep", "0.76, 0, 0.24, 1");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TT = (window.TT = { reduced, lenis: null });
  const html = document.documentElement;
  html.classList.add("tt-js");
  const page = document.body.dataset.page || "home";

  // Emblem logo: a round shield with two letter slots plus surrounding ornament — drawn with lines for use in the loader
  const CREST = `<svg viewBox="0 0 50 57" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M25 3c6 4 13 5 19 4 1 14-2 32-19 46C8 39 5 21 6 7c6 1 13 0 19-4Z"/><path d="M25 9c5 3 10 4 14 3 0 11-3 25-14 35C14 37 11 23 11 12c4 1 9 0 14-3Z"/><path d="M17 22h16M25 22v18M20 30h10"/><circle cx="25" cy="16" r="1.6"/><path d="M3 30c3 2 4 6 3 9M47 30c-3 2-4 6-3 9"/></svg>`;
  const LINKS = [["index.html", "Home"], ["collection.html", "Collection"], ["plays.html", "Records"], ["about.html", "About"]];
  const roll = (t) => `<span class="tt-roll" data-fx-part="text">${t}</span>`;
  const ROLL = 'data-fx="char-roll" data-fx-char-roll="stagger: .022; dur: .8; ease: 0.25,1,0.5,1; out: .65; gap: .2em"';

  const head = document.querySelector("[data-slot=nav]");
  if (head) {
    head.outerHTML = `
<header class="tt-nav" data-slot="nav" data-tone="dark">
  <a class="tt-nav__logo" href="index.html" aria-label="To the first page">${CREST}</a>
  <button class="tt-nav__burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="tt-menu" data-menu-toggle><span></span><span></span></button>
</header>
<div class="tt-menu" id="tt-menu" data-slot="menu" aria-hidden="true">
  <div class="tt-menu__bg"></div><div class="tt-menu__bg"></div><div class="tt-menu__bg"></div><div class="tt-menu__bg"></div>
  <div class="tt-menu__items">
    <div class="tt-menu__col">
      <div class="tt-menu__socials">${["Social 1", "Social 2", "Social 3"].map((s) => `<a href="#" ${ROLL}><span class="tt-mask"><span data-menu-line>${roll(s)}</span></span></a>`).join("")}</div>
      <div><p class="tt-muted">Where it’s made</p><a href="#" ${ROLL} data-label="Your studio English name here"><span class="tt-mask"><span data-menu-line>${roll("Studio Name")}</span></span></a></div>
    </div>
    <nav class="tt-menu__primary" aria-label="Main menu" data-label="English menu section name here">${LINKS.map(([h, t]) => `<a href="${h}" ${ROLL}${h.startsWith(page) ? ' aria-current="page"' : ""}><span class="tt-mask"><span data-menu-line>${roll(t)}</span></span></a>`).join("")}</nav>
  </div>
</div>
<div class="tt-deal" data-fx="card-deal-page" aria-hidden="true"><i data-fx-part="layer"></i><i data-fx-part="layer"></i><i data-fx-part="layer"></i><i data-fx-part="layer"><span data-fx-part="mark">${CREST}</span></i></div>`;
  }

  // ── Footer: a sentence + one big line (letters rise) + one gold line, three location cards, mail address and socials, tabletop illustration (only the passed area turns gold)
  const foot = document.querySelector("footer[data-slot=footer]");
  if (foot) {
    const PLACES = [["collection.html", "Collection", "See all the games on the shelf"], ["plays.html", "Records", "Wrote down every night spent at the table"], ["about.html", "About", "Tells who makes it and why"]];
    foot.outerHTML = `
<footer class="tt-foot" data-slot="footer" data-tone="dark">
  <div class="tt-foot__art" data-foot-art aria-hidden="true">
    <svg viewBox="0 0 1600 900" fill="none" stroke-linecap="round" stroke-linejoin="round" data-art="dim" stroke="var(--site-teal)" stroke-width="3">${tableArt()}</svg>
    <canvas data-foot-ink></canvas>
  </div>
  <div class="tt-foot__intro">
    <span class="tt-foot__crest" data-foot-reveal>${CREST}</span>
    <p class="tt-foot__title" data-foot-title data-label="A line inviting you to take a seat here">A short invite</p>
    <p class="tt-foot__tag" data-foot-reveal>A golden line here — the next story begins with one move.</p>
  </div>
  <nav class="tt-foot__places" aria-label="Bottom Menu" data-label="Placeholder card name is the English section name">${PLACES.map(([h, l, n]) => `<a class="tt-place" href="${h}" data-foot-place><span class="tt-place__paint"></span><span class="tt-place__paint"></span><span class="tt-diamond"></span><span class="tt-place__label">${l}</span><span class="tt-place__note">${n}</span></a>`).join("")}</nav>
  <div class="tt-foot__contact" data-foot-reveal>
    <div><p class="tt-label tt-muted">Write a Letter</p><a class="tt-foot__email" href="#" ${ROLL}>${roll("hello@example.com")}</a></div>
    <ul class="tt-foot__socials">${["Social 1", "Social 2", "Social 3"].map((s) => `<li><a href="#" ${ROLL}>${roll(s)}</a></li>`).join("")}</ul>
  </div>
  <div class="tt-foot__bottom"><span>© 0000 Event Name</span><p>Made at · <a class="tt-foot__credit" href="#">Studio name</a></p></div>
</footer>`;
  }
  // Footer table drawing: round table, four chairs, pieces on the board — a drawing placeholder (the original is a hand-drawn illustration)
  function tableArt() {
    const chair = (x, s) => `<g transform="translate(${x} 0) scale(${s} 1)"><path d="M-60 520v-260c0-40 120-40 120 0v260M-60 360h120M-48 300v60M0 290v70M48 300v60M-70 520h140M-60 520l-10 200M60 520l10 200"/></g>`;
    return `${chair(330, 1)}${chair(1270, -1)}${chair(620, 0.8)}${chair(980, -0.8)}
      <ellipse cx="800" cy="600" rx="560" ry="150"/><path d="M240 600v40c0 80 1120 80 1120 0v-40M800 750v130M650 880h300"/>
      <rect x="690" y="545" width="220" height="90" rx="6" transform="skewX(-25)"/><path d="M640 590h200M680 570v50M720 570v50M760 570v50"/>
      <path d="M500 610l40-14 34 18-40 14z M1050 600l30 6-6 30-30-6z M980 640c10-30 30-30 40 0z M560 660c0-20 20-20 20 0v10h-20z"/>`;
  }

  // ── Smooth Scroll
  if (window.Lenis && !reduced) {
    const lenis = (TT.lenis = new Lenis({ lerp: 0.1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Header: hides after scrolling down past 160px and shows when scrolling up, changes color following the data-tone of the plate beneath the header center
  const nav = document.querySelector(".tt-nav");
  let menuOpen = false;
  const tone = () => {
    if (!nav) return;
    if (menuOpen) { nav.dataset.tone = "dark"; return; }
    const y = nav.offsetHeight / 2;
    const under = document.elementsFromPoint(innerWidth / 2, y).find((e) => !nav.contains(e) && !e.closest(".tt-menu, .tt-deal") && e.closest("[data-tone]"));
    nav.dataset.tone = under?.closest("[data-tone]")?.dataset.tone || "dark";
  };
  TT.tone = tone;
  let lastY = 0;
  const onScroll = () => {
    const y = TT.lenis ? TT.lenis.scroll : scrollY;
    if (!menuOpen) nav?.toggleAttribute("data-hidden", y > 160 && y > lastY);
    if (y <= 160) nav?.removeAttribute("data-hidden");
    lastY = y;
    tone();
  };
  TT.lenis ? TT.lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });
  addEventListener("tone:change", tone);
  requestAnimationFrame(tone);

  // ── Menu: on open four panels turn 90° → 0 (1.05s deal · .08 gap), items switch on at .4s, and from .46s the lines rise from 120% below in .9s expo.out (.05 gap).
  //    On close, the lines go back down in reverse over .3s sweep (.015), and from .16s the panel rotates 90° from the top in .6s sweep
  const menu = document.querySelector(".tt-menu"), burger = document.querySelector("[data-menu-toggle]");
  if (menu && burger) {
    const bgs = [...menu.querySelectorAll(".tt-menu__bg")], items = menu.querySelector(".tt-menu__items"), lines = [...menu.querySelectorAll("[data-menu-line]")];
    gsap.set(bgs, { rotation: 90, transformOrigin: "100% 0%" });
    gsap.set(lines, { yPercent: 120 });
    gsap.set(items, { autoAlpha: 0 });
    let tl = null;
    const set = (open) => {
      menuOpen = open;
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.setAttribute("aria-hidden", String(!open));
      tl?.kill();
      if (open) { menu.classList.add("is-open"); TT.lenis?.stop(); nav?.removeAttribute("data-hidden"); }
      else TT.lenis?.start();
      tone();
      if (reduced) {
        gsap.set(bgs, { rotation: open ? 0 : 90 }); gsap.set(lines, { yPercent: open ? 0 : 120 }); gsap.set(items, { autoAlpha: open ? 1 : 0 });
        if (!open) menu.classList.remove("is-open");
        return;
      }
      tl = open
        ? gsap.timeline().to(bgs, { rotation: 0, duration: 1.05, stagger: 0.08, ease: "deal" }, 0).set(items, { autoAlpha: 1 }, 0.4).to(lines, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "expo.out" }, 0.46)
        : gsap.timeline({ onComplete: () => { menu.classList.remove("is-open"); tone(); } })
          .to(lines, { yPercent: 120, duration: 0.3, stagger: { each: 0.015, from: "end" }, ease: "sweep" })
          .set(items, { autoAlpha: 0 })
          .to(bgs, { rotation: 90, duration: 0.6, stagger: { each: 0.06, from: "end" }, ease: "sweep" }, 0.16);
    };
    burger.addEventListener("click", () => set(!menuOpen));
    addEventListener("keydown", (e) => e.key === "Escape" && menuOpen && set(false));
  }

  // Loader sentence: two shields, a cross and a dot with 28 laurel leaves (two per side grouped into seven lines) — like the original logo, draws eleven lines at .035s intervals.
  if (!document.querySelector("[data-loader]")) {
    const blade = (side, k) => { const y = 9 + k * 3, x = 25 + side * (17 + k * 0.4); return `M${x} ${y}c${side * 3} -2 ${side * 5} 0 ${side * 5} 3c${-side * 3} 1 ${-side * 5} 0 ${-side * 5} -3Z`; };
    const leaf = (g) => `<path d="${[2 * g, 2 * g + 1].flatMap((k) => [blade(-1, k), blade(1, k)]).join("")}"/>`;
    document.body.insertAdjacentHTML("afterbegin", `<div class="tt-loader" data-loader aria-hidden="true"><svg viewBox="-2 0 54 57" fill="none" stroke="currentColor" stroke-width="0.6"><path d="M25 3c6 4 13 5 19 4 1 14-2 32-19 46C8 39 5 21 6 7c6 1 13 0 19-4Z"/><path d="M25 9c5 3 10 4 14 3 0 11-3 25-14 35C14 37 11 23 11 12c4 1 9 0 14-3Z"/><path d="M17 22h16M25 22v18M20 30h10"/><circle cx="25" cy="16" r="1.6"/>${Array.from({ length: 7 }, (_, g) => leaf(g)).join("")}</svg></div>`);
  }
  // ── First-visit loader: the sentence logo lines are drawn in 1.5s (.035 stagger, power2.inOut), .4s later the logo moves up 10% and disappears in a .5s sweep,
  //    the curtain tilts −3° and clears upward by −118% in a .95s sweep — fx:reveal fires .6s before the clearing ends
  const loader = document.querySelector("[data-loader]");
  // Hero motion runs when the loader lifts (tt:reveal) or the transition curtain lifts (fx:reveal) — immediately if already past
  const gateEvent = loader && html.classList.contains("tt-loading") ? "tt:reveal" : "fx:reveal";
  let revealed = false;
  addEventListener(gateEvent, () => (revealed = true), { once: true });
  const revealSoon = (fn) => {
    if (revealed) return void fn();
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    addEventListener(gateEvent, go, { once: true });
    setTimeout(go, 6000);
  };
  TT.onReveal = revealSoon;
  if (loader && html.classList.contains("tt-loading")) {
    try { sessionStorage.setItem("tt-load-seen", "1"); } catch {}
    const paths = loader.querySelectorAll("path, circle"), logo = loader.querySelector("svg");
    const fire = () => dispatchEvent(new Event("tt:reveal"));
    const end = () => { html.classList.remove("tt-loading", "tt-lifting"); TT.lenis?.start(); };
    const lift = () => html.classList.add("tt-lifting");
    TT.lenis?.stop();
    if (reduced || !window.DrawSVGPlugin) {
      gsap.timeline({ delay: 0.6, onComplete: end }).call(lift).call(fire).to(loader, { autoAlpha: 0, duration: 0.3 });
    } else {
      gsap.set(paths, { drawSVG: "0%" });
      gsap.timeline({ onComplete: end })
        .to(paths, { drawSVG: "100%", duration: 1.5, stagger: 0.035, ease: "power2.inOut" })
        .to(logo, { yPercent: -10, autoAlpha: 0, duration: 0.5, ease: "sweep" }, "+=0.4")
        .to(loader, { yPercent: -118, rotation: -3, duration: 0.95, ease: "sweep", onStart: lift }, "-=0.3")
        .call(fire, [], "-=0.6");
    }
  }

  // ── Footer motion: at 70% of the screen, big-line letters rise with 1.2s power4.out (.03 stagger), and the sentence · one-liner · contact move up 20px from .3s (1s · .08),
  //  Seat cards rise from 30% below starting at .45s, 1.2s expo.out (.1 stagger). The table art goes from 16% below·.92 scale into place while the floor comes in
  const footEl = document.querySelector(".tt-foot");
  if (footEl) {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const title = footEl.querySelector("[data-foot-title]"), bits = footEl.querySelectorAll("[data-foot-reveal]"), places = footEl.querySelectorAll("[data-foot-place]");
      const split = SplitText.create(title, { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 100 }); gsap.set(bits, { autoAlpha: 0, y: 20 }); gsap.set(places, { autoAlpha: 0, yPercent: 30 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } })
        .to(split.chars, { yPercent: 0, duration: 1.2, stagger: 0.03 }, 0)
        .to(bits, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.3)
        .to(places, { autoAlpha: 1, yPercent: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0.45);
      ScrollTrigger.create({ trigger: footEl, start: "top 70%", once: true, onEnter: () => tl.play() });
      gsap.fromTo(footEl.querySelector("[data-foot-art]"), { yPercent: 16, scale: 0.92 }, { yPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: footEl, start: "top bottom", end: "bottom bottom", scrub: true } });
      return () => split.revert();
    });
    inkArt(footEl.querySelector("[data-foot-art]"));
  }
  // A gold line drawing is revealed only along the path the brush passes over the table image, then dries — the original WebGL ink was measured and rewritten with our own shader.
  // Brush radius is 5.5% of image width (up to 30% thinner when stroked fast), paint dries evenly over 4.2s and crumbles away on screen by a grain threshold (.16~.76).
  // If the cursor rests 2.4s inside the picture the brush paints a figure-8 path by itself, and stops drawing 7.14s after the last stroke
  function inkArt(box) {
    if (!box || reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const INK = { radius: 0.055, thin: 0.3, dry: 4.2, idle: 2.4, stop: 7.14 };
    const INK_VERT = `#version 300 es
in vec2 pos; out vec2 uv;
void main() { uv = pos * 0.5 + 0.5; gl_Position = vec4(pos, 0.0, 1.0); }`;
    const INK_NOISE = `
float rnd(vec2 q) { return fract(sin(dot(q, vec2(41.31, 289.17))) * 15731.743); }
float vnoise(vec2 q) {
  vec2 c = floor(q), t = fract(q);
  t = t * t * (3.0 - 2.0 * t);
  float a = rnd(c), b = rnd(c + vec2(1.0, 0.0)), d = rnd(c + vec2(0.0, 1.0)), e = rnd(c + vec2(1.0, 1.0));
  return mix(mix(a, b, t.x), mix(d, e, t.x), t.y);
}`;
    // Paint plate: dry the previous plate by u_dry, then add this segment (u_a→u_b) with a fur-pattern brush. Coordinates take the image width as 1 (y goes down)
    const INK_PAINT = `#version 300 es
precision highp float;
uniform sampler2D u_prev; uniform vec2 u_a, u_b; uniform float u_r, u_ink, u_dry, u_trail, u_hw;
in vec2 uv; out vec4 o;
${INK_NOISE}
void main() {
  float m = max(texture(u_prev, uv).r - u_dry, 0.0);
  if (u_ink > 0.0) {
    vec2 p = vec2(uv.x, (1.0 - uv.y) * u_hw), ab = u_b - u_a;
    float len = max(length(ab), 1e-5);
    vec2 dir = ab / len, nrm = vec2(-dir.y, dir.x);
    float s = dot(p - u_a, dir);
    vec2 off = p - u_a - dir * clamp(s, 0.0, len);
    float across = dot(off, nrm) / u_r;
    float tip = 0.85 + 0.35 * vnoise(vec2(across * 6.0, 7.1));
    float core = 1.0 - smoothstep(0.5, 1.0, length(off) / u_r * tip);
    float wet = mix(0.5, 1.6, vnoise(vec2(across * 16.0, (u_trail + s) / u_r * 0.35)));
    m = max(m, core * wet * u_ink);
  }
  o = vec4(m, 0.0, 0.0, 1.0);
}`;
    // Visible plate: only where the fill amount passes each grain’s different threshold does the golden image show
    const INK_SHOW = `#version 300 es
precision highp float;
uniform sampler2D u_mask, u_art; uniform float u_hw;
in vec2 uv; out vec4 o;
${INK_NOISE}
void main() {
  vec2 g = vec2(uv.x, uv.y * u_hw) * 240.0;
  float grain = 0.5 * vnoise(g) + 0.25 * vnoise(g * 2.07 + 11.3) + 0.125 * vnoise(g * 4.28 + 34.7);
  float edge = 0.16 + 0.6 * grain;
  float a = smoothstep(edge - 0.05, edge + 0.05, texture(u_mask, uv).r);
  o = texture(u_art, vec2(uv.x, 1.0 - uv.y)) * a;
}`;
    const canvas = box.querySelector("[data-foot-ink]"), svg = box.querySelector("svg");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    const gold = getComputedStyle(html).getPropertyValue("--kf-accent").trim();
    // The original gold plate is dense copperplate engraving, so the brush band turns entirely gold — only on the gold plate, fill the inside of the table and chair outlines with engraving hatching
    const seat = (x, s) => `<path transform="translate(${x} 0) scale(${s} 1)" d="M-60 520v-260c0-40 120-40 120 0v260z"/>`;
    const lit = `<svg viewBox="${svg.getAttribute("viewBox")}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="${gold}" stroke-width="5">
      <defs><pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><path d="M0 3.5h7" stroke="${gold}" stroke-width="2.2"/></pattern></defs>
      <g fill="url(#h)" stroke="none">${seat(330, 1)}${seat(1270, -1)}${seat(620, 0.8)}${seat(980, -0.8)}<path d="M240 600v40c0 80 1120 80 1120 0v-40z"/><ellipse cx="800" cy="600" rx="560" ry="150"/><path d="M780 690h40v190h-40z"/></g>
      ${tableArt()}</svg>`;
    const program = (frag) => {
      const p = gl.createProgram();
      for (const [type, src] of [[gl.VERTEX_SHADER, INK_VERT], [gl.FRAGMENT_SHADER, frag]]) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(p, s); }
      gl.bindAttribLocation(p, 0, "pos"); gl.linkProgram(p);
      const u = {}; for (const n of ["u_prev", "u_a", "u_b", "u_r", "u_ink", "u_dry", "u_trail", "u_hw", "u_mask", "u_art"]) u[n] = gl.getUniformLocation(p, n);
      return { p, u };
    };
    // When building the world, both shaders are connected and drawn once — so the screen doesn’t freeze from connecting them on the first brush stroke
    const paint = program(INK_PAINT), show = program(INK_SHOW);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // So that something drying evenly over 4.2s can still be shaved one step at a time at 120Hz, the paint layer uses half-precision floats where possible
    const half = !!gl.getExtension("EXT_color_buffer_float");
    const MW = 768;
    let MH = 432, hw = 0.5625;
    const tex = (w, h, data) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
      else if (half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    };
    const target = () => { const t = tex(MW, MH), f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return { t, f }; };
    let read, write, art = null;
    const size = () => {
      const r = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.min(2048, Math.round(r.width * dpr)));
      canvas.height = Math.max(1, Math.round((canvas.width * r.height) / Math.max(1, r.width)));
      const nh = Math.max(1, Math.round((MW * r.height) / Math.max(1, r.width)));
      hw = r.height / Math.max(1, r.width);
      if (!read || nh !== MH) { MH = nh; [read, write] = [target(), target()]; }
      // Gold line art is rasterized once at the art box size and put on the panel
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        if (art) gl.deleteTexture(art);
        art = tex(0, 0, c);
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(lit.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'));
    };
    size(); new ResizeObserver(size).observe(box);
    const stroke = (ax, ay, bx, by, r, ink, dt) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.f); gl.viewport(0, 0, MW, MH);
      gl.useProgram(paint.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, read.t);
      gl.uniform1i(paint.u.u_prev, 0); gl.uniform2f(paint.u.u_a, ax, ay); gl.uniform2f(paint.u.u_b, bx, by);
      gl.uniform1f(paint.u.u_r, r); gl.uniform1f(paint.u.u_ink, ink); gl.uniform1f(paint.u.u_dry, dt / INK.dry);
      gl.uniform1f(paint.u.u_trail, brush.trail); gl.uniform1f(paint.u.u_hw, hw);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      [read, write] = [write, read];
    };
    const present = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (!art) return;
      gl.useProgram(show.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, read.t); gl.uniform1i(show.u.u_mask, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, art); gl.uniform1i(show.u.u_art, 1); gl.uniform1f(show.u.u_hw, hw);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const brush = { x: 0, y: 0, down: false, trail: 0, mode: "auto" };
    stroke(0, 0, 0, 0, INK.radius, 0, 0); present();
    let near = false;
    new IntersectionObserver(([e]) => (near = e.isIntersecting)).observe(box);
    const ptr = { x: 0, y: 0, inside: false, moved: false };
    addEventListener("pointermove", (e) => {
      const r = box.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      ptr.inside = u >= 0 && u <= 1 && v >= 0 && v <= 1; ptr.x = u; ptr.y = v * hw; ptr.moved = true;
    }, { passive: true });
    html.addEventListener("pointerleave", () => { ptr.inside = false; });
    let lastMove = -Infinity, lastInk = -Infinity, prev = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, (now - prev) / 1000), t = now / 1000;
      prev = now;
      if (!near || !art) return;
      let dab = null;
      if (ptr.moved) { ptr.moved = false; if (ptr.inside) { lastMove = t; dab = { x: ptr.x, y: ptr.y, ink: 1 }; } }
      const mode = t - lastMove > INK.idle ? "auto" : "pointer";
      if (mode !== brush.mode || (mode === "pointer" && !ptr.inside)) brush.down = false;
      brush.mode = mode;
      if (mode === "auto") {
        const k = 0.42 * t, gate = Math.sin(0.55 * t);
        dab = { x: 0.5 + 0.3 * Math.sin(k), y: (0.36 + 0.1 * Math.sin(2 * k + 1.3)) * hw, ink: gate > -0.25 ? 0.85 * Math.min(1, (gate + 0.25) * 3) : 0 };
      }
      if (dab && dab.ink > 0) {
        if (!brush.down) { brush.x = dab.x; brush.y = dab.y; brush.down = true; }
        const d = Math.hypot(dab.x - brush.x, dab.y - brush.y), speed = d / Math.max(dt, 1 / 240);
        stroke(brush.x, brush.y, dab.x, dab.y, INK.radius * (1 - INK.thin * Math.min(1, speed / 3)), dab.ink, dt);
        brush.trail += d; brush.x = dab.x; brush.y = dab.y; lastInk = t;
      } else {
        if (dab) brush.down = false;
        if (t - lastInk > INK.stop) return;
        stroke(0, 0, 0, 0, INK.radius, 0, dt);
      }
      present();
    });
  }

  // ── Play cell · record row entrance (shared by the first page, collection and record)
  TT.games = () => {
    if (reduced) return;
    const ft = document.querySelector("[data-featured-title], [data-head-title]");
    if (ft) { gsap.set(ft, { yPercent: 100 }); revealSoon(() => ScrollTrigger.create({ trigger: ft, start: "top 85%", once: true, onEnter: () => gsap.to(ft, { yPercent: 0, duration: 1.2, ease: "deal" }) })); }
    // When a cell reaches 92% of the screen, the picture rises from 40px below with a 1.1s deal curve and the text follows .12s later — .08 apart within a row
    document.querySelectorAll("[data-game]").forEach((g, i) => {
      const media = g.querySelector("[data-game-media]"), meta = g.querySelector("[data-game-meta]");
      const both = [media, meta].filter(Boolean);
      if (!both.length) return;
      gsap.set(both, { autoAlpha: 0, y: 40 });
      ScrollTrigger.create({ trigger: g, start: "top 92%", once: true, onEnter: () => {
        if (media) gsap.to(media, { autoAlpha: 1, y: 0, duration: 1.1, delay: (i % 4) * 0.08, ease: "deal" });
        if (meta) gsap.to(meta, { autoAlpha: 1, y: 0, duration: 1.1, delay: (i % 4) * 0.08 + 0.12, ease: "deal" });
      } });
    });
  };
  // Record row: text from 24px below in .9s deal (.05 interval, each row .08 later), gold underline .2s later in 1.4s expo.out
  TT.rows = () => {
    if (reduced) return;
    const rows = [...document.querySelectorAll("[data-row]")];
    if (!rows.length) return;
    rows.forEach((r) => { gsap.set(r.querySelectorAll("[data-row-reveal]"), { autoAlpha: 0, y: 24 }); gsap.set(r.querySelector("[data-row-ledger]"), { scaleX: 0 }); });
    ScrollTrigger.batch(rows, { start: "top 92%", once: true, onEnter: (batch) => batch.forEach((r, k) => {
      gsap.to(r.querySelectorAll("[data-row-reveal]"), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.05, delay: 0.08 * k, ease: "deal" });
      gsap.to(r.querySelector("[data-row-ledger]"), { scaleX: 1, duration: 1.4, delay: 0.08 * k + 0.2, ease: "expo.out" });
    }) });
  };

  // Gold-framed ”Tonight” card: unfolds with a 1.1s deal from the inner 6%·4% cutouts, and from .45s gold bars fill in 1.2s expo.out, .12 apart
  TT.night = () => {
    if (reduced) return;
    const card = document.querySelector("[data-night]");
    if (card) {
      const fills = card.querySelectorAll("[data-bar-fill]");
      gsap.set(card, { clipPath: "inset(6% 4% 6% 4%)", autoAlpha: 0 });
      gsap.set(fills, { scaleX: 0 });
      ScrollTrigger.create({ trigger: card, start: "top 82%", once: true, onEnter: () => gsap.timeline()
        .to(card, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1, duration: 1.1, ease: "deal", clearProps: "clipPath" })
        .to(fills, { scaleX: 1, duration: 1.2, stagger: 0.12, ease: "expo.out" }, 0.45) });
    }
  };

  // ── Text line rise (shared): [data-lines] per line from 100% below → 0 (.8s power3.out · .08), [data-rise] from 24px below .9s deal
  TT.reveal = (root = document) => {
    if (reduced) return;
    const go = () => {
      root.querySelectorAll("[data-lines]").forEach((el) => {
        const sp = SplitText.create(el, { type: "lines", mask: "lines" });
        gsap.set(sp.lines, { yPercent: 100 });
        revealSoon(() => ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(sp.lines, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }) }));
      });
      root.querySelectorAll("[data-rise]").forEach((el) => {
        gsap.set(el, { autoAlpha: 0, y: 24 });
        revealSoon(() => ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "deal" }) }));
      });
      ScrollTrigger.refresh();
    };
    document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]).then(go) : go();
  };
})();
