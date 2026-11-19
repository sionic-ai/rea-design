// Shared by three pages: nav · phone menu · footer markup, smooth scroll (lenis 1.3.25, same as the original), page transition curtain,
// Logo letter band (three r180 plane like the original + our shader), a button that follows the cursor, a footer letter pile (matter-js 0.20.0 same as the original).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, ...(window.CustomEase ? [CustomEase] : []));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth <= 767;
  const root = document.documentElement;
  const cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const markFont = () => cssVar("--kf-font-mark") || cssVar("--kf-font-display");

  // Canvas and GL cannot read variables, so they read from the skin when painting — color-mix is also painted at one point and received as rgba
  const probeEl = document.createElement("i");
  const probeCtx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  function rgba(name) {
    probeEl.style.cssText = `display:none;color:var(${name})`;
    document.body.append(probeEl);
    const c = getComputedStyle(probeEl).color;
    probeEl.remove();
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = c;
    probeCtx.fillRect(0, 0, 1, 1);
    return [...probeCtx.getImageData(0, 0, 1, 1).data];
  }
  const cssRgb = (name) => `rgb(${rgba(name).slice(0, 3).join(" ")})`;

  const WORD = "ABC";
  const fontsReady = (async () => {
    try {
      await Promise.all([
        document.fonts.load(`900 100px ${markFont()}`),
        document.fonts.load(`500 16px ${cssVar("--kf-font-sans")}`),
      ]);
      await document.fonts.ready;
    } catch (e) { /* Draws with a fallback font if the font doesn’t load */ }
  })();

  // ── Placeholder wordmark: slices wide, bold letters with thin gaps like a stencil (only carries over the fragmented feel of the original logo)
  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 8h11M9 3.5 13.5 8 9 12.5"/></svg>';
  const ARROW_L = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 8H3M7 3.5 2.5 8 7 12.5"/></svg>';
  const arrow = () => `<span class="c-arrow" aria-hidden="true">${ARROW}${ARROW}</span>`;
  const MARK = `<svg class="nav__mark" viewBox="0 0 92 30" aria-hidden="true">
    <text x="0" y="27" textLength="92" lengthAdjust="spacingAndGlyphs" fill="currentColor"
      style="font:900 34px var(--kf-font-mark, var(--kf-font-display));font-stretch:125%">${WORD}</text>
    <rect x="0" y="14.2" width="92" height="1.4" fill="var(--cut, var(--site-black))" class="nav__mark-cut"/>
    <rect x="44" y="0" width="1.4" height="14" fill="var(--cut, var(--site-black))" class="nav__mark-cut"/>
  </svg>`;

  const LINKS = [
    { href: "index.html", label: "List", key: "home" },
    { href: "list.html", label: "Resource room", key: "list", sup: "20" },
    { href: "about.html", label: "About", key: "about" },
  ];

  // Nav and phone menu sit offscreen just once — they persist across page changes (the original is also outside data-taxi-view)
  function renderChrome() {
    const nav = document.querySelector('[data-slot="nav"]');
    if (nav) {
      nav.className = "nav";
      nav.innerHTML = `<div class="c-wrap nav__in">
        <a class="nav__logo" href="index.html" aria-label="Back to start">${MARK}<span class="nav__name">Your name here<br>Two-line notation®</span></a>
        <nav class="nav__links">
          ${LINKS.map((l) => `<a href="${l.href}" data-underline data-key="${l.key}">${l.label}${l.sup ? `<sup>${l.sup}</sup>` : ""}</a>`).join("")}
          <button class="nav__menu" type="button" aria-label="Open Menu"><span>Menu</span><span>Close</span></button>
        </nav>
      </div>`;
    }
    const mm = document.querySelector('[data-slot="mobile-menu"]');
    if (mm) {
      mm.className = "mmenu";
      mm.innerHTML = `<ul class="mmenu__list">
        ${LINKS.map((l) => `<li><a class="mmenu__item" data-key="${l.key}" href="${l.href}">
          <span class="mmenu__txt"><span>${l.label}</span></span>${l.sup ? `<span class="mmenu__small"><span>(${l.sup})</span></span>` : ""}
          <i class="mmenu__dot"></i><i class="mmenu__line"></i></a></li>`).join("")}
      </ul>
      <div class="mmenu__bottom">${creditsHTML("mm")}</div>`;
      bindCredits(mm);
    }
  }
  function markCurrent(key) {
    document.querySelectorAll(".nav__links [data-key]").forEach((a) => a.classList.toggle("is-active", a.dataset.key === key));
    document.querySelectorAll(".mmenu [data-key]").forEach((a) => a.classList.toggle("is-current", a.dataset.key === key));
  }
  // Footer per screen (only on About)
  function renderFooter(view) {
    const ft = view.querySelector('[data-slot="footer"]');
    if (!ft) return;
    ft.className = "footer";
    ft.innerHTML = `<div class="footer__top">
        <div class="c-wrap c-grid">
          <a class="footer__logo" href="index.html">${MARK}<span>Your name here<br>Two-line notation®</span></a>
          <div class="footer__right">${creditsHTML("ft")}</div>
        </div>
      </div>
      <div class="footer__bottom c-wrap" data-slot="letter-pile">
        <div class="footer__row"><p>ABC®/V.00</p><p>(0000)</p><a href="#top" data-underline data-top>Back to top</a></div>
        <div class="footer__pile"><canvas aria-hidden="true"></canvas></div>
      </div>`;
    bindCredits(ft);
  }

  // The original DES/DEV switch: alternately lights up the names and links of the two makers
  function creditsHTML(id) {
    const col = (k, name) => `<div class="footer__col" data-credit="${k}">
      <p>${name}</p><div class="footer__line"><span></span></div>
      <ul><li><a href="#" data-underline>Link 1</a></li><li><a href="#" data-underline>Link 2</a></li><li><a href="#" data-underline>Link 3</a></li><li><a href="#" data-underline>Your address.com here</a></li></ul>
    </div>`;
    return `<div class="footer__switch" data-switch="${id}">
        <div class="footer__switch-btns"><button type="button" data-credit-btn="a" class="is-active">AAA</button><i>/</i><button type="button" data-credit-btn="b">BBB</button></div>
        <span class="footer__dot" aria-hidden="true"></span>
      </div>${col("a", "Your name 1 here")}${col("b", "Your name 2 here")}`;
  }

  function bindCredits(rootEl) {
    rootEl.querySelectorAll("[data-switch]").forEach((sw) => {
      const scope = sw.parentElement;
      const set = (k) => {
        scope.querySelectorAll("[data-credit-btn]").forEach((b) => b.classList.toggle("is-active", b.dataset.creditBtn === k));
        scope.querySelectorAll("[data-credit]").forEach((c) => c.classList.toggle("is-active", c.dataset.credit === k));
      };
      scope.querySelectorAll("[data-credit-btn]").forEach((b) => b.addEventListener("click", () => set(b.dataset.creditBtn)));
      set("a");
    });
  }

  // ── Phone menu: clip-path top→bottom 1s power4.inOut, text 115%→0 at .09 spacing 1.2s power4.out (after .25), line scaleX
  let menuOpen = false;
  let toggleMenu = () => {};
  function bindMenu() {
    const btn = document.querySelector(".nav__menu");
    const panel = document.querySelector(".mmenu");
    if (!btn || !panel) return;
    let tl;
    const texts = panel.querySelectorAll(".mmenu__txt > span, .mmenu__small > span");
    const lines = panel.querySelectorAll(".mmenu__line");
    const bottom = panel.querySelector(".mmenu__bottom");
    gsap.set(texts, { yPercent: 115 });
    gsap.set(bottom, { autoAlpha: 0 });
    toggleMenu = (open = !menuOpen) => {
      if (open === menuOpen) return;
      menuOpen = open;
      document.documentElement.classList.toggle("is-menu-open", open);
      tl?.kill();
      if (open) {
        lenis?.stop();
        tl = gsap.timeline()
          .to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" })
          .to(texts, { yPercent: 0, duration: 1.2, stagger: 0.09, ease: "power4.out" }, 0.25)
          .to(lines, { scaleX: 1, duration: 1, stagger: 0.1, ease: "power4.inOut" }, 0.25)
          .to(bottom, { autoAlpha: 1, duration: 0.8, ease: "sine.out" }, 0.5);
      } else {
        lenis?.start();
        tl = gsap.timeline()
          .to(texts, { yPercent: -100, duration: 0.4, ease: "power3.out" })
          .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "power4.inOut" }, 0.1)
          .set(texts, { yPercent: 115 })
          .set(lines, { scaleX: 0 })
          .set(bottom, { autoAlpha: 0 });
      }
    };
    btn.addEventListener("click", () => toggleMenu());
  }

  // ── Smooth scroll (lenis 1.3.25) — created when entering the scrolling screen (About) and removed on leaving
  let lenis = null;
  let arrived = false;
  function startScroll(view, life) {
    if (view.hasAttribute("data-no-scroll") || reduce || !window.Lenis) return;
    // During the transition the old and new screens overlap, so teardown clears only its own
    const inst = new Lenis({ lerp: 0.1 });
    lenis = inst;
    inst.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
    life.tick((t) => inst.raf(t * 1000));
    view.querySelectorAll("[data-top]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); inst.scrollTo(0, { duration: 1.5 }); }));
    life.add(() => { inst.destroy(); if (lenis === inst) lenis = null; });
  }

  // ── Life of a screen: gathers the window listeners · ticker · GL · observers made on mount, and clears them all at once on leaving.
  //    GSAP is held in a screen-scoped context and reverted on leave (including repeating tweens · delayedCall · ScrollTrigger · SplitText)
  function makeLife(view) {
    const offs = [], leaves = [];
    const ctx = gsap.context(() => {}, view);
    return {
      // When leaving begins (before fetching) — the spot where GL is cleared, like the original scene transitionOut. The original clears when the new screen is attached, but,
      // In the copy each screen has its own canvas, so clearing in place made the transition measure longer (first page entry 2.67 → 3.08s)
      leave(fn) { leaves.push(fn); },
      runLeave(trigger) { leaves.splice(0).forEach((f) => f(trigger)); },
      on(t, type, fn, o) { t.addEventListener(type, fn, o); offs.push(() => t.removeEventListener(type, fn, o)); },
      tick(fn) { gsap.ticker.add(fn); offs.push(() => gsap.ticker.remove(fn)); },
      add(fn) { offs.push(fn); },
      gsap(fn) { return ctx.add(fn); },
      wrap(fn) { return (...a) => ctx.add(() => fn(...a)); },
      kill() { offs.splice(0).reverse().forEach((f) => { try { f(); } catch (e) { /* Already removed */ } }); ctx.revert(); },
    };
  }
  const pages = {};
  let currentView = null;
  function runPage(view) {
    const init = pages[view.dataset.page];
    if (!init || view.crlMounted) return;
    view.crlMounted = true;
    view.crlLife.gsap(() => init(view, view.crlLife));
  }
  function mount(view) {
    const key = view.dataset.page;
    currentView = view;
    root.dataset.page = key;
    document.body.dataset.page = key;
    document.body.toggleAttribute("data-no-scroll", view.hasAttribute("data-no-scroll"));
    markCurrent(key);
    view.crlLife = makeLife(view);
    renderFooter(view);
    startScroll(view, view.crlLife);
    view.querySelectorAll('[data-slot="letter-pile"]').forEach((box) => letterPile(box, view.crlLife));
    runPage(view);
  }
  function unmount(view) {
    view.crlLife?.kill();
    view.crlLife = null;
  }
  const definePage = (key, init) => { pages[key] = init; if (currentView) runPage(currentView); };

  // ── Original section theme: swaps the body skin by the on-screen data-theme, with a .6s color transition while changing
  const THEMES = ["t-brand", "t-dark"];
  let themeT;
  function setTheme(theme, animate) {
    const b = document.body;
    if (theme ? b.classList.contains(theme) : !THEMES.some((t) => b.classList.contains(t))) return;
    if (animate) b.classList.add("is-theme-switching");
    THEMES.forEach((t) => b.classList.remove(t));
    if (theme) b.classList.add(theme);
    clearTimeout(themeT);
    if (animate) themeT = setTimeout(() => b.classList.remove("is-theme-switching"), 600);
  }

  // ── Page transition (original Taxi 1.9.1, removeOldContent:false): keeps the old screen, attaches the new screen on top over .3s("out") turns on, and the old screen is turned off with .5s sine.inOut.
  //    When leaving via the ‹Enter Archive› sheet the old screen goes in .2s, the new screen after .85 then .2s. When all done, remove the old screen and go to the top.
  //    On file:// the next page can’t be fetched, so a background-color curtain (.5s sine.inOut) covers the screen and it navigates normally.
  let taxiCore = null;
  const afterEnter = [];
  function bindTaxi() {
    const C = window.taxi;
    if (!C || !/^https?:$/.test(location.protocol)) return false;
    const waitStyles = () => Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => !l.sheet).map((l) => new Promise((r) => { l.addEventListener("load", r, { once: true }); l.addEventListener("error", r, { once: true }); setTimeout(r, 1500); })));
    class Route extends C.Transition {
      onLeave({ trigger, done }) { toggleMenu(false); lenis?.stop(); currentView?.crlLife?.runLeave(trigger); done(); }
      onEnter({ to, trigger, done }) {
        const old = [...document.querySelectorAll("[data-taxi-view]")].filter((v) => v !== to);
        const curtain = !!trigger?.closest?.("[data-curtain]");
        to.classList.add("is-transition");
        gsap.set(to, { opacity: 0 });
        let left = old.length ? 2 : 1;
        const finish = () => {
          if (--left > 0) return;
          old.forEach((v) => { unmount(v); v.remove(); });
          to.classList.remove("is-transition");
          gsap.set(to, { clearProps: "opacity" });
          scrollTo(0, 0);
          ScrollTrigger.refresh();
          lenis?.start();
          afterEnter.splice(0).forEach((f) => f());
          done();
        };
        // The old screen starts fading out right away, and the new screen turns on after that page’s css has fully loaded (the original has one css bundle so there is no wait)
        if (old.length) gsap.to(old, { opacity: 0, duration: reduce ? 0 : curtain ? 0.2 : 0.5, ease: "sine.inOut", onComplete: finish });
        waitStyles().then(() => gsap.to(to, { opacity: 1, duration: reduce ? 0 : curtain ? 0.2 : 0.3, ease: "power1.out", delay: reduce ? 0 : curtain ? 0.85 : 0, onComplete: finish }));
      }
    }
    taxiCore = new C.Core({
      // Only pages of this site’s set (same-folder .html) — outside links like the library list navigate normally
      links: 'a[href$=".html"]:not([target]):not([href*="/"]):not([data-taxi-ignore])',
      removeOldContent: false, allowInterruption: false, transitions: { default: Route },
      reloadJsFilter: (el) => el.dataset.taxiReload !== undefined,
      reloadCssFilter: (el) => el.dataset.taxiReload !== undefined,
    });
    taxiCore.on("NAVIGATE_IN", ({ to }) => {
      arrived = true;
      const view = to.renderer.content;
      setTheme(view.dataset.theme || "", true);
      mount(view);
    });
    return true;
  }
  function go(href, trigger) {
    if (taxiCore) return taxiCore.navigateTo(href, false, trigger).catch(() => { /* Ignores input while swiping */ });
    location.href = href;
  }

  // file:// version: on leaving, the curtain covers over .5s sine.inOut, and the new page starts by lifting the same curtain
  function bindVeil() {
    const veil = document.createElement("div");
    veil.className = "page-veil";
    document.body.append(veil);
    arrived = !!sessionStorage.getItem("crl-veil");
    if (arrived) {
      veil.style.setProperty("--veil", sessionStorage.getItem("crl-veil"));
      gsap.set(veil, { opacity: 1 });
      gsap.to(veil, { opacity: 0, duration: 0.5, ease: "sine.inOut", delay: 0.05 });
      sessionStorage.removeItem("crl-veil");
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || a.hasAttribute("data-curtain")) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html$/.test(href)) return;
      e.preventDefault();
      if (href === location.pathname.split("/").pop()) return;
      const bg = getComputedStyle(document.body).backgroundColor;
      veil.style.setProperty("--veil", bg);
      document.documentElement.classList.add("is-leaving");
      sessionStorage.setItem("crl-veil", bg);
      gsap.to(veil, { opacity: 1, duration: reduce ? 0 : 0.5, ease: "sine.inOut", onComplete: () => (location.href = href) });
    });
  }

  // ── Line splitting: the original puts a mask on each line and lifts it up from 115% below
  function splitLines(el) {
    const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line-child" });
    s.masks?.forEach((m) => m.classList.add("line-mask"));
    return s;
  }

  // ── Letter fragments: draws one bold wide letter as an alpha plate and cuts two thin gaps like a stencil
  function makeGlyph(ch, cap) {
    const probe = document.createElement("canvas").getContext("2d");
    const size = 200;
    const font = `900 ${size}px ${markFont()}`;
    probe.font = font;
    probe.fontStretch = "expanded";
    const m = probe.measureText(ch);
    const k = cap / (m.actualBoundingBoxAscent + Math.max(0, m.actualBoundingBoxDescent));
    const w = Math.ceil((m.actualBoundingBoxLeft + m.actualBoundingBoxRight) * k);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = Math.ceil(cap);
    const ctx = c.getContext("2d");
    ctx.font = font;
    ctx.fontStretch = "expanded";
    ctx.fillStyle = "#fff"; // Not skin: alpha plate — the shader/tint reads the color from the skin and applies it
    ctx.save();
    ctx.translate(0, cap - Math.max(0, m.actualBoundingBoxDescent) * k);
    ctx.scale(k, k);
    ctx.fillText(ch, m.actualBoundingBoxLeft, 0);
    ctx.restore();
    ctx.globalCompositeOperation = "destination-out";
    const t = Math.max(1, cap * 0.012);
    const code = ch.charCodeAt(0);
    ctx.fillRect(0, cap * (0.5 + ((code % 3) - 1) * 0.04) - t / 2, w, t);
    ctx.fillRect(w * (0.36 + (code % 4) * 0.07) - t / 2, 0, t, cap * 0.5);
    return c;
  }

  // Original _spaceLetters: leaves a gap between letters of average letter length × gap. The vertical band lays letters down -90° so they read bottom to top.
  const stripCache = new Map();
  function buildStrip(text, orientation, base, gap) {
    const key = `${text}|${orientation}|${base}|${gap}`;
    if (stripCache.has(key)) return stripCache.get(key);
    const glyphs = [...text].map((ch) => makeGlyph(ch, base));
    const lens = glyphs.map((g) => g.width);
    const g = Math.round((lens.reduce((a, b) => a + b, 0) / lens.length) * gap);
    const len = lens.reduce((a, b) => a + b, 0) + g * lens.length;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const bands = [];
    if (orientation === "vertical") {
      c.width = base;
      c.height = len;
      let y = len - g / 2;
      glyphs.forEach((gl) => {
        ctx.save();
        ctx.translate(0, y);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(gl, 0, 0);
        ctx.restore();
        bands.push({ y0: y - gl.width, y1: y });
        y -= gl.width + g;
      });
    } else {
      c.width = len;
      c.height = base;
      let x = g / 2;
      glyphs.forEach((gl) => { ctx.drawImage(gl, x, 0); bands.push({ x0: x, x1: x + gl.width }); x += gl.width + g; });
    }
    const out = { mask: c, bands, tex: null };
    stripCache.set(key, out);
    return out;
  }
  function tint(mask, color) {
    const c = document.createElement("canvas");
    c.width = mask.width;
    c.height = mask.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    return c;
  }

  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  // The original passes colors to the shader as linear values, so the skin’s hex value appears on screen as is
  const glColor = (name) => { const [r, g, b] = rgba(name); return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.LinearSRGBColorSpace); };
  // Paint one dot of a computed color (a color-mix gives the color(srgb …) form — three can’t read it) and read it back
  const glFromCss = (css) => {
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = css;
    probeCtx.fillRect(0, 0, 1, 1);
    const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.LinearSRGBColorSpace);
  };

  const PLANE_VERT = "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  // Wraps a strip image around one plane covering the screen and flows it (uScroll). By the push accumulated per 5×5 grid cell, each cell offsets its strip uv in 3% steps, shifting like blocks,
  // uCover fills even beyond the band with the band color (archive entry curtain)
  const STRIP_FRAG = `
    uniform sampler2D uMask;
    uniform sampler2D uGrid;
    uniform vec3 uColor;
    uniform vec2 uResolution;
    uniform float uOpacity, uScroll, uTexAspect, uViewAspect, uZoom, uHover, uCover, uHorizontal, uWrap;
    varying vec2 vUv;
    void main() {
      vec2 push = texture2D(uGrid, gl_FragCoord.xy / uResolution).rg * uHover * 0.03;
      vec2 st = uHorizontal > 0.5
        ? vec2((vUv.x - 0.5) * uViewAspect / (uTexAspect * uZoom) + uScroll, (vUv.y - 0.5) / uZoom + 0.5)
        : vec2((vUv.x - 0.5) / uZoom + 0.5, (vUv.y - 0.5) * uTexAspect / (uViewAspect * uZoom) + uScroll);
      st -= push;
      float across = uHorizontal > 0.5 ? st.y : st.x;
      float along = uHorizontal > 0.5 ? st.x : st.y;
      float keep = step(0.0, across) * step(across, 1.0) * mix(step(0.0, along) * step(along, 1.0), 1.0, uWrap);
      float a = texture2D(uMask, st).a * keep;
      gl_FragColor = vec4(uColor, mix(a, 1.0, uCover) * uOpacity);
    }`;

  // ── Text strip (original WebGL marquee): flows at baseSpeed (.02) per second in strip-length units, with wheel speed (5e-5×deltaY/s, ±2, damping 12) added.
  //    On hover a 5×5 grid accumulates mouse movement×10 within radius .22 and cools by .965 per frame — each cell’s band is offset by .03 so they shift like blocks.
  //    color is a skin variable name (--site-black).
  class Strip {
    constructor(o) {
      Object.assign(this, {
        text: WORD, color: "--site-black", orientation: "vertical", zoom: 0.9, baseSpeed: 0.02, dir: 1,
        opacity: { value: 1 }, cover: { value: 0 }, hover: false, scroll: false, wrap: true, gap: 0.025,
        active: () => true,
      }, o);
      this.zoomV = { value: this.zoom };
      this.offset = 0;
      this.vel = 0;
      this.accum = 0;
      this.grid = new Float32Array(100);
      this.dm = [0, 0];
      this.mouse = null;
      this.offs = [];
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
      this.renderer.setClearColor(0, 0);
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
      this.gridTex = new THREE.DataTexture(this.grid, 5, 5, THREE.RGBAFormat, THREE.FloatType);
      this.gridTex.magFilter = this.gridTex.minFilter = THREE.NearestFilter;
      this.gridTex.needsUpdate = true;
      this.uniforms = {
        uMask: { value: null }, uGrid: { value: this.gridTex }, uColor: { value: glColor(this.color) },
        uResolution: { value: new THREE.Vector2(1, 1) }, uOpacity: this.opacity, uScroll: { value: 0 },
        uTexAspect: { value: 1 }, uViewAspect: { value: 1 }, uZoom: this.zoomV, uHover: { value: this.hover ? 1 : 0 },
        uCover: this.cover, uHorizontal: { value: this.orientation === "horizontal" ? 1 : 0 }, uWrap: { value: this.wrap ? 1 : 0 },
      };
      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
        vertexShader: PLANE_VERT, fragmentShader: STRIP_FRAG, uniforms: this.uniforms, transparent: true, depthWrite: false, depthTest: false,
      }));
      this.mesh.frustumCulled = false;
      this.scene.add(this.mesh);
      this.resize();
      this.listen(window, "resize", () => this.resize());
      if (this.scroll) this.bindScroll();
      if (this.hover && !reduce && matchMedia("(hover: hover)").matches) this.bindHover();
      this.renderer.compile(this.scene, this.camera);
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = this.canvas.getBoundingClientRect();
      this.W = r.width;
      this.H = r.height;
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(this.W, this.H, false);
      this.renderer.getDrawingBufferSize(this.uniforms.uResolution.value);
      Object.assign(this.camera, { left: -this.W / 2, right: this.W / 2, top: this.H / 2, bottom: -this.H / 2 });
      this.camera.updateProjectionMatrix();
      this.mesh.scale.set(this.W, this.H, 1);
      const side = this.orientation === "vertical" ? this.W : this.H;
      const base = Math.min(2048, Math.max(512, Math.round((side * dpr * this.zoom) / 64) * 64));
      this.strip = buildStrip(this.text, this.orientation, base, this.gap);
      this.tex = this.strip.mask;
      if (!this.strip.tex) {
        const t = new THREE.CanvasTexture(this.tex);
        if (this.orientation === "vertical") t.wrapT = THREE.RepeatWrapping;
        else t.wrapS = THREE.RepeatWrapping;
        t.generateMipmaps = false;
        t.minFilter = t.magFilter = THREE.LinearFilter;
        t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.strip.tex = t;
      }
      this.maskTex = this.strip.tex;
      this.uniforms.uMask.value = this.maskTex;
      this.uniforms.uTexAspect.value = this.tex.width / this.tex.height;
      this.uniforms.uViewAspect.value = this.W / Math.max(1, this.H);
      this.uniforms.uColor.value = glColor(this.color);
    }
    listen(t, type, fn, o) { t.addEventListener(type, fn, o); this.offs.push(() => t.removeEventListener(type, fn, o)); }
    dispose() {
      this.offs.splice(0).forEach((f) => f());
      this.scene.traverse((o) => { if (o.material && o !== this.mesh) o.material.dispose(); });
      this.mesh.material.dispose();
      this.mesh.geometry.dispose();
      this.gridTex.dispose();
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    setScroll(v) { this.offset = ((v % 1) + 1) % 1; }
    bindScroll() {
      this.listen(window, "wheel", (e) => { if (this.active()) this.accum += e.deltaY; }, { passive: true });
      let ly = null;
      this.listen(window, "touchstart", (e) => { ly = e.touches[0].clientY; }, { passive: true });
      this.listen(window, "touchmove", (e) => {
        const y = e.touches[0].clientY;
        if (ly != null && this.active()) this.accum += (ly - y) * 2;
        ly = y;
      }, { passive: true });
    }
    bindHover() {
      this.listen(window, "pointermove", (e) => {
        if (!this.active() || (this.hoverReady && !this.hoverReady())) return;
        const r = this.canvas.getBoundingClientRect();
        const uv = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
        if (this.mouse) this.dm = [(uv[0] - this.mouse[0]) * 10, (uv[1] - this.mouse[1]) * 10];
        this.mouse = uv;
      }, { passive: true });
    }
    update(dt) {
      let speed = this.baseSpeed;
      if (this.scroll) {
        const target = Math.max(-2, Math.min(2, (5e-5 * this.accum) / Math.max(dt, 1e-3)));
        this.accum = 0;
        this.vel = damp(this.vel, target, 12, dt);
        speed += this.vel;
      }
      this.offset = (((this.offset + this.dir * speed * dt) % 1) + 1) % 1;
      if (!this.mouse) return;
      this.dm[0] *= 0.965;
      this.dm[1] *= 0.965;
      for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
        const k = (j * 5 + i) * 4;
        const d = 1 - smooth(0, 0.22, Math.hypot((i + 0.5) / 5 - this.mouse[0], (j + 0.5) / 5 - this.mouse[1]));
        this.grid[k] = (this.grid[k] + this.dm[0] * d) * 0.965;
        this.grid[k + 1] = (this.grid[k + 1] + this.dm[1] * d) * 0.965;
      }
      this.gridTex.needsUpdate = true;
    }
    // Size the strip image takes up on screen: for a vertical strip, the width = Screen width × zoom, height of the horizontal strip = Seat height × zoom
    dims() {
      const z = this.zoomV.value;
      if (this.orientation === "vertical") {
        const sw = this.W * z;
        return { sw, sh: (sw * this.tex.height) / this.tex.width };
      }
      const sh = this.H * z;
      return { sh, sw: (sh * this.tex.width) / this.tex.height };
    }
    draw() {
      this.uniforms.uScroll.value = this.offset;
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ── Text plane (original GL text): split letters · lines are baked on a canvas and laid over the same scene as the band. Takes the band’s 5×5 grid shift in plane uv units of .2 and shifts along with it,
  //    The entrance reads the DOM piece’s yPercent as is and rises from below within the plane (original uv.y += 1 − reveal). DOM text stays transparent so reading and selection work as before.
  //    Plane = Clip box + .12×font size on left and right, top and bottom use the glyph clip max(0,(font size−box height)/2)+.15×font size · line clip .3×font size (original values).
  //    Piece shape: char · line (one piece = one plane), lines (a long paragraph, one plane per on-screen line — original data-gl-text="lines"), rule (line — wiped in from the left by the DOM scaleX amount).
  //    with follow, the plane tracks the DOM entrance (y · opacity) of that element as is — the DOM still does the entrance and only the picture moves to GL.
  const TEXT_FRAG = `
    uniform sampler2D uText;
    uniform sampler2D uGrid;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform float uOpacity, uAlpha, uStrength, uRise, uWipe;
    varying vec2 vUv;
    void main() {
      vec2 st = vUv - texture2D(uGrid, gl_FragCoord.xy / uResolution).rg * uStrength;
      st.y += uRise;
      float inside = step(0.0, st.x) * step(st.x, 1.0) * step(0.0, st.y) * step(st.y, 1.0) * step(vUv.x, uWipe);
      gl_FragColor = vec4(uColor, texture2D(uText, st).a * uOpacity * uAlpha * inside);
    }`;
  // Text and box per screen row — measure each character with Range and group characters with the same top edge into one line
  function lineRects(el) {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), range = document.createRange(), out = [];
    let cur = null;
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.textContent;
      for (let i = 0; i < t.length; i++) {
        range.setStart(n, i);
        range.setEnd(n, i + 1);
        const b = range.getClientRects()[0];
        if (!b || !b.width) continue;
        if (cur && Math.abs(b.top - cur.top) < b.height / 2) {
          cur.text += t[i];
          cur.left = Math.min(cur.left, b.left);
          cur.right = Math.max(cur.right, b.right);
          cur.bottom = Math.max(cur.bottom, b.bottom);
        } else {
          if (cur) out.push(cur);
          cur = { text: t[i], top: b.top, bottom: b.bottom, left: b.left, right: b.right };
        }
      }
    }
    if (cur) out.push(cur);
    return out;
  }
  // Follower pieces hide the DOM text as transparent, so on re-bake (window resize) they use the color first read
  const inkOf = new WeakMap();
  class TextPlanes {
    constructor(strip, pieces, hide) {
      Object.assign(this, { strip, pieces, hide, items: [], opacity: { value: 1 }, geo: new THREE.PlaneGeometry(1, 1) });
      this.build();
      let rt;
      strip.listen(window, "resize", () => { clearTimeout(rt); rt = setTimeout(() => this.build(), 160); });
      strip.offs.push(() => clearTimeout(rt));
    }
    build() {
      this.items.forEach((it) => { this.strip.scene.remove(it.mesh); it.mesh.material.dispose(); it.tex.dispose(); });
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const { W, H } = this.strip;
      // For when the canvas is not full screen (About header), measures with the canvas top-left as 0 — it scrolls along with the page, so measuring once is enough
      const cr = this.strip.canvas.getBoundingClientRect();
      this.items = this.pieces.flatMap(({ el, mode, follow }) => {
        const cs = getComputedStyle(el);
        if (!inkOf.has(el)) inkOf.set(el, mode === "rule" ? cs.backgroundColor : cs.color);
        const fs = parseFloat(cs.fontSize);
        const r = el.getBoundingClientRect();
        // Subtract the current offset to measure the resting position — for a follower piece, the y of the element it follows, otherwise its own yPercent and y
        const shift = follow ? gsap.getProperty(follow, "y") : (gsap.getProperty(el, "yPercent") / 100) * el.offsetHeight + gsap.getProperty(el, "y");
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const spacing = cs.letterSpacing && cs.letterSpacing !== "normal" ? cs.letterSpacing : null;
        const walkText = (ctx, b0, padX, padY, ascent) => {
          const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          for (let n = walk.nextNode(); n; n = walk.nextNode()) {
            if (!n.textContent.trim()) continue;
            range.selectNodeContents(n);
            const b = range.getBoundingClientRect();
            ctx.fillText(n.textContent.replace(/\s+/g, " "), b.left - b0.left + padX, b.top - b0.top + padY + ascent);
          }
        };
        // Rest-spot box · spacing · baking
        const boxes = mode === "rule"
          ? [{ left: r.left, top: r.top - shift, width: el.offsetWidth, height: r.height, padX: 0, padY: 0, paint: (ctx, w, h) => ctx.fillRect(0, 0, w, h) }]
          : mode === "lines"
            ? lineRects(el).map((ln) => ({ left: ln.left, top: ln.top - shift, width: ln.right - ln.left, height: ln.bottom - ln.top, padX: 0.12 * fs, padY: 0.3 * fs, paint: (ctx, w, h, b, ascent) => ctx.fillText(ln.text, b.padX, b.padY + ascent) }))
            : [{ left: r.left, top: r.top - shift, width: r.width, height: r.height, padX: 0.12 * fs, padY: mode === "line" ? 0.3 * fs : Math.max(0, (fs - r.height) / 2) + 0.15 * fs, paint: (ctx, w, h, b, ascent) => walkText(ctx, r, b.padX, b.padY, ascent) }];
        return boxes.map((b) => {
          const w = b.width + 2 * b.padX, h = b.height + 2 * b.padY;
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.ceil(w * dpr));
          c.height = Math.max(1, Math.ceil(h * dpr));
          const ctx = c.getContext("2d");
          ctx.scale(dpr, dpr);
          ctx.font = font;
          if (spacing) ctx.letterSpacing = spacing;
          ctx.fillStyle = "#fff"; // Not skin: alpha plate — the shader paints it with the glyph’s computed color
          b.paint(ctx, w, h, b, ctx.measureText("Hg").fontBoundingBoxAscent);
          const tex = new THREE.CanvasTexture(c);
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          const u = {
            uText: { value: tex }, uGrid: { value: this.strip.gridTex }, uResolution: this.strip.uniforms.uResolution,
            uColor: { value: glFromCss(inkOf.get(el)) }, uOpacity: this.opacity, uAlpha: { value: 1 },
            uStrength: { value: this.strip.hover ? 0.2 : 0 }, uRise: { value: 0 }, uWipe: { value: 1 },
          };
          const mesh = new THREE.Mesh(this.geo, new THREE.ShaderMaterial({ vertexShader: PLANE_VERT, fragmentShader: TEXT_FRAG, uniforms: u, transparent: true, depthWrite: false, depthTest: false }));
          mesh.frustumCulled = false;
          mesh.renderOrder = 2;
          const y0 = H / 2 - (b.top - cr.top - b.padY + h / 2);
          mesh.position.set(b.left - cr.left - b.padX + w / 2 - W / 2, y0, 0);
          mesh.scale.set(w, h, 1);
          this.strip.scene.add(mesh);
          return { el, mode, follow, mesh, tex, u, h, y0, elH: el.offsetHeight };
        });
      });
      this.hide.forEach((e) => (e.style.opacity = "0"));
      for (const { el, mode, follow } of this.pieces) {
        if (mode === "rule") el.style.opacity = "0";
        else if (follow) el.style.color = "transparent";
      }
      this.update();
      this.strip.renderer.compile(this.strip.scene, this.strip.camera);
    }
    update() {
      for (const it of this.items) {
        if (it.follow) {
          it.mesh.position.y = it.y0 - gsap.getProperty(it.follow, "y");
          it.u.uAlpha.value = gsap.getProperty(it.follow, "opacity");
        } else it.u.uRise.value = ((gsap.getProperty(it.el, "yPercent") / 100) * it.elH + gsap.getProperty(it.el, "y")) / it.h;
        if (it.mode === "rule") it.u.uWipe.value = gsap.getProperty(it.el, "scaleX");
      }
    }
  }

  // Cursor reveal (original cursorreveal): buttons start hidden (autoAlpha 0) and appear with .4s power2.out when the mouse enters their area
  //    follows with quickTo .6s power3.out. With reduced motion it does not follow and only turns on and off in the middle of its spot (original Yv branch)
  function cursorFollow(area) {
    const item = area.querySelector("[data-cursor-item]");
    if (!item) return;
    const hover = matchMedia("(hover: hover)").matches;
    gsap.set(item, { xPercent: -50, yPercent: -50, x: area.clientWidth / 2, y: area.clientHeight / 2, ...(hover && { autoAlpha: 0 }) });
    if (!hover) return;
    const show = (on) => gsap.to(item, { autoAlpha: on ? 1 : 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    if (reduce) {
      area.addEventListener("mouseenter", () => show(true));
      area.addEventListener("mouseleave", () => show(false));
      return;
    }
    const qx = gsap.quickTo(item, "x", { duration: 0.6, ease: "power3.out" });
    const qy = gsap.quickTo(item, "y", { duration: 0.6, ease: "power3.out" });
    const host = area.parentElement;
    let inside = null;
    host.addEventListener("mousemove", (e) => {
      const r = area.getBoundingClientRect();
      const now = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (now !== inside) show((inside = now));
      if (now) { qx(e.clientX - r.left); qy(e.clientY - r.top); }
    });
    host.addEventListener("mouseleave", () => { inside = false; show(false); });
  }

  // ── Letter pile (original LetterPile, matter-js 0.20.0): drops 50 letters (30 on phones) from above at .1s intervals.
  //    Font size = width/20.5 (phone /9), body is a rectangle .9 times the image with corners cut .15, restitution .7, gravity 1, wall thickness width×10.
  //    While the mouse is over the panel, letters within a 1.5-letter radius are pushed by .025×mass×(1-d/R). Physics steps 1000/60ms per frame.
  function letterPile(box, life) {
    const canvas = box.querySelector("canvas");
    if (!canvas || reduce || !window.Matter) return;
    const { Engine, Bodies, Composite, Body } = Matter;
    const ctx = canvas.getContext("2d");
    const letters = [...WORD];
    let engine, W, H, size, bodies = [], sprites = {}, spawnT, running = false, spawned = false, mouse = null, n = 0, ground;
    const build = () => {
      clearTimeout(spawnT);
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth + 2; H = canvas.clientHeight + 2;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = W / (isMobile() ? 9 : 20.5);
      ground = cssRgb("--site-black");
      const ink = cssRgb("--site-white");
      letters.forEach((ch) => (sprites[ch] = tint(makeGlyph(ch, 256), ink)));
      engine = Engine.create();
      engine.world.gravity.y = 1;
      const t = W / 0.1;
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2 + 2 * t, H + t, W + 4 * t, 2 * t, { isStatic: true }),
        Bodies.rectangle(-t, H / 2, 2 * t, H, { isStatic: true }),
        Bodies.rectangle(W + t, H / 2, 2 * t, H, { isStatic: true }),
        Bodies.rectangle(W / 2 + 2 * t, -t, W + 4 * t, 2 * t, { isStatic: true }),
      ]);
      bodies = [];
      n = 0;
      spawned = false;
      if (running) spawn();
    };
    const add = () => {
      const ch = letters[n % letters.length];
      const g = sprites[ch];
      const s = size / Math.max(g.width, g.height);
      const w = g.width * s * 0.9, h = g.height * s * 0.9;
      const x = w / 2 + Math.random() * (W - w);
      const b = Bodies.rectangle(x, h / 4, w, h, { restitution: 0.7, chamfer: { radius: 0.15 * Math.min(w, h) } });
      b.sprite = { g, s };
      Composite.add(engine.world, b);
      bodies.push(b);
      n++;
    };
    const spawn = () => {
      if (spawned) return;
      spawned = true;
      const total = isMobile() ? 30 : 50;
      const next = () => { if (n >= total) return; add(); spawnT = setTimeout(next, 100); };
      next();
    };
    const step = () => {
      if (mouse) {
        const R = 1.5 * size;
        for (const b of bodies) {
          const dx = b.position.x - mouse[0], dy = b.position.y - mouse[1], d = Math.hypot(dx, dy);
          if (d === 0 || d > R) continue;
          const f = (0.025 * b.mass * (1 - d / R)) / d;
          Body.applyForce(b, b.position, { x: dx * f, y: dy * f });
        }
      }
      Engine.update(engine, 1000 / 60);
    };
    const render = () => {
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, W, H);
      for (const b of bodies) {
        const { g, s } = b.sprite;
        ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
        ctx.drawImage(g, (-g.width * s) / 2, (-g.height * s) / 2, g.width * s, g.height * s);
        ctx.restore();
      }
    };
    canvas.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse = [e.clientX - r.left, e.clientY - r.top]; });
    canvas.addEventListener("pointerleave", () => (mouse = null));
    fontsReady.then(() => {
      build();
      render();
      const io = new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running) spawn(); });
      io.observe(box);
      let rt;
      life.tick(() => { if (running) { step(); render(); } });
      life.on(window, "resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); render(); }, 150); });
      life.add(() => { io.disconnect(); clearTimeout(rt); clearTimeout(spawnT); Composite.clear(engine.world, false); Engine.clear(engine); });
    });
  }

  renderChrome();
  bindMenu();
  if (!bindTaxi()) bindVeil();
  const firstView = document.querySelector("[data-taxi-view]");
  if (firstView) mount(firstView);

  window.CRL = { page: definePage, go, afterEnter, get taxi() { return !!taxiCore; }, reduce, isMobile, fontsReady, Strip, TextPlanes, buildStrip, tint, rgba, cssRgb, glColor, PLANE_VERT, splitLines, cursorFollow, arrow, ARROW_L, ARROW, get lenis() { return lenis; }, get arrived() { return arrived; } };
})();
