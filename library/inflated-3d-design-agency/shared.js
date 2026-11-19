// Common to all pages: draws the header (mega menu, phone menu, hide on scroll), Get In Touch and footer in one place, and
// Hooks up Lenis (lerp .25), text splitting, mascot pop-out, lens follow, motion switch, cookie band and page transition.
// Original values: MOTION_PRESETS standard .3s power2 · emphasized .6s power3 · strong 1.2s power4 · mascot .46s back.out / back.in
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const GP = (window.GP = { reduced, lenis: null, still: false });
  // Canvas, three and GSAP can’t read var(), so skin variables are resolved to rgb on the spot. Change the skin and the color follows
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  GP.color = (name, alpha = 1) => {
    const el = document.createElement("i");
    el.style.cssText = `display:none;color:var(${name})`;
    document.documentElement.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = c;
    swatch.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = swatch.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${+((a / 255) * alpha).toFixed(3)})`;
  };

  // ── mega menu Lottie ─ as in the original LottiePlayer: svg render · loop · xMidYMid slice · revealed with .6s power3 when ready ·
  // Plays only when visible, delayed by standard (.3s) · pauses off-screen or when the tab is hidden. Instead of the original JSON, draws our shapes on the same canvas (282×196, 30fps 4s loop).
  const lc = (name) => GP.color(name).match(/[\d.]+/g).slice(0, 3).map((v) => +(v / 255).toFixed(3)).concat(1);
  const st = (k) => ({ a: 0, k });
  const kf = (keys) => ({
    a: 1,
    k: keys.map(([t, v], i) => (i < keys.length - 1 ? { t, s: [].concat(v), o: { x: [0.45], y: [0] }, i: { x: [0.25], y: [1] } } : { t, s: [].concat(v) })),
  });
  const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) });
  const ell = (d, x = 0, y = 0) => ({ ty: "el", p: st([x, y]), s: st([d, d]) });
  const box = (w, h, r, x = 0, y = 0) => ({ ty: "rc", p: st([x, y]), s: st([w, h]), r: st(r) });
  const fill = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1 });
  const line = (c, w) => ({ ty: "st", c: st(c), o: st(100), w: st(w), lc: 2, lj: 2 });
  const gr = (...it) => ({ ty: "gr", it: [...it, tr()] });
  let layerNo = 0;
  const layer = (shapes, ks = {}) => ({
    ddd: 0, ind: ++layerNo, ty: 4, nm: `l${layerNo}`, sr: 1, ao: 0, ip: 0, op: 120, st: 0, bm: 0, shapes,
    ks: { o: st(100), r: st(0), p: st([141, 98, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]), ...ks },
  });
  const heart = (d, c) => gr({ ty: "gr", it: [box(d * 0.7, d * 0.7, d * 0.12), fill(c), { ...tr(), p: st([0, d * 0.08]), r: st(45) }] }, ell(d * 0.5, -d * 0.2, -d * 0.12), ell(d * 0.5, d * 0.2, -d * 0.12), fill(c));
  const LOTTIE = {
    why: (w, p) => [
      layer([heart(64, p)], { s: kf([[0, [100, 100, 100]], [20, [116, 116, 100]], [40, [100, 100, 100]], [80, [100, 100, 100]], [100, [116, 116, 100]], [120, [100, 100, 100]]]) }),
      layer([gr(ell(132), line(w, 3))], { s: kf([[0, [100, 100, 100]], [60, [108, 92, 100]], [120, [100, 100, 100]]]) }),
      layer([gr(ell(12), fill(w))], { p: kf([[0, [207, 98, 0]], [30, [141, 32, 0]], [60, [75, 98, 0]], [90, [141, 164, 0]], [120, [207, 98, 0]]]) }),
    ],
    promise: (w, p) => [
      layer([gr(ell(96), line(w, 3))], { p: kf([[0, [96, 98, 0]], [40, [124, 98, 0]], [80, [124, 98, 0]], [120, [96, 98, 0]]]) }),
      layer([gr(ell(96), line(w, 3))], { p: kf([[0, [186, 98, 0]], [40, [158, 98, 0]], [80, [158, 98, 0]], [120, [186, 98, 0]]]) }),
      layer([heart(26, p)], { s: kf([[0, [0, 0, 100]], [40, [0, 0, 100]], [52, [100, 100, 100]], [80, [100, 100, 100]], [92, [0, 0, 100]], [120, [0, 0, 100]]]) }),
    ],
    strength: (w, p) => [-62, 0, 62].map((x, i) =>
      layer([gr(ell(i === 1 ? 64 : 48), fill(i === 1 ? p : w))], {
        p: kf([[0, [141 + x, 120, 0]], [16 + i * 12, [141 + x, 64, 0]], [44 + i * 12, [141 + x, 120, 0]], [120, [141 + x, 120, 0]]]),
        s: kf([[0, [100, 100, 100]], [16 + i * 12, [92, 110, 100]], [44 + i * 12, [112, 88, 100]], [56 + i * 12, [100, 100, 100]], [120, [100, 100, 100]]]),
      })),
    partner: (w, p) => [
      layer([gr(ell(110), fill(w))], { p: kf([[0, [70, 98, 0]], [50, [118, 98, 0]], [70, [118, 98, 0]], [120, [70, 98, 0]]]), o: st(90) }),
      layer([gr(ell(110), fill(p))], { p: kf([[0, [212, 98, 0]], [50, [164, 98, 0]], [70, [164, 98, 0]], [120, [212, 98, 0]]]), o: st(90) }),
    ],
    platform: (w, p) => [0, 1, 2].map((i) =>
      layer([gr(box(150 - i * 24, 34, 10), fill(i === 2 ? p : w))], {
        p: kf([[0, [141, 160, 0]], [20 + i * 14, [141, 140 - i * 42, 0]], [86, [141, 140 - i * 42, 0]], [104, [141, 160, 0]], [120, [141, 160, 0]]]),
        o: kf([[0, 0], [20 + i * 14, 100], [86, 100], [104, 0], [120, 0]]),
      })),
  };
  const lottieData = (kind) => {
    layerNo = 0;
    const layers = LOTTIE[kind](lc("--kf-on-accent"), lc("--site-heart"));
    return { v: "5.7.4", fr: 30, ip: 0, op: 120, w: 282, h: 196, nm: kind, ddd: 0, assets: [], layers: layers.reverse() };
  };
  const anims = new Map();
  const seen = new IntersectionObserver((list) => list.forEach((e) => ((anims.get(e.target) || {}).inView = e.isIntersecting, syncLottie(e.target))));
  const syncLottie = (el) => {
    const a = anims.get(el);
    if (!a || !a.ready) return;
    clearTimeout(a.wait);
    if (a.inView && !document.hidden && !a.paused) a.wait = setTimeout(() => a.anim.play(), 300);
    else a.anim.pause();
  };
  document.addEventListener("visibilitychange", () => anims.forEach((a, el) => syncLottie(el)));
  GP.mountLottie = (root) => {
    if (!window.lottie || reduced) return;
    root.querySelectorAll("[data-lottie]").forEach((el) => {
      const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: lottieData(el.dataset.lottie), rendererSettings: { preserveAspectRatio: "xMidYMid slice" } });
      const a = { anim, ready: false, inView: false, paused: false };
      anims.set(el, a);
      anim.addEventListener("DOMLoaded", () => {
        a.ready = true;
        el.dataset.lottieReady = "true";
        syncLottie(el);
      });
      seen.observe(el);
    });
  };
  GP.unmountLottie = (root) =>
    root.querySelectorAll("[data-lottie]").forEach((el) => {
      const a = anims.get(el);
      if (!a) return;
      clearTimeout(a.wait);
      a.anim.destroy();
      seen.unobserve(el);
      anims.delete(el);
    });
  GP.pauseLottie = (root) => root.querySelectorAll("[data-lottie]").forEach((el) => anims.has(el) && (anims.get(el).paused = true, syncLottie(el)));

  const arrowR = '<svg viewBox="0 0 12 12" fill="none"><path d="M1.5 6h9M7 2.5 10.5 6 7 9.5" stroke="currentColor" stroke-width="1.6"/></svg>';
  const arrowUR = '<svg class="gp-nav__ext" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9 9 3M4 3h5v5"/></svg>';
  const arrowUp = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 10.5v-9M2.5 5 6 1.5 9.5 5"/></svg>';
  const pause = '<svg class="is-pause" viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="1.5" width="2.4" height="9" rx="1"/><rect x="7.1" y="1.5" width="2.4" height="9" rx="1"/></svg><svg class="is-play" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1.5v9l7.5-4.5z"/></svg>';
  GP.icons = { arrowR, arrowUR, arrowUp, pause };
  GP.arrow = `<span class="gp-arrow">${arrowR}</span>`;
  document.querySelectorAll(".gp-arrow:empty").forEach((a) => (a.innerHTML = arrowR));
  GP.motionBtn = (cls = "") => `<button class="gp-motion ${cls}" type="button" data-motion aria-pressed="false">Motion<span class="gp-motion__knob">${pause}</span></button>`;

  // Instead of the original logo: a placeholder wordmark with a ring holding a heart inside a lens bead set in the o position
  const logo = (href = "index.html") =>
    `<a class="gp-logo" href="${href}" aria-label="Home"><span>W</span><svg class="gp-logo__mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M12 16.2c-2.9-2-4.3-3.6-4.3-5.2a2.2 2.2 0 0 1 4.3-.7 2.2 2.2 0 0 1 4.3.7c0 1.6-1.4 3.2-4.3 5.2z" fill="currentColor"/></svg><span>rdmark</span></a>`;
  GP.logo = logo;

  // Instead of the original character (a blue dog holding a heart balloon), a mascot redrawn with the same silhouette and colors
  GP.mascot = (balloon = true) => `
    <svg class="gp-mascot" viewBox="0 0 120 170" aria-hidden="true">
      <defs>
        <radialGradient id="gpm-h" cx="35%" cy="30%" r="75%"><stop offset="0" style="stop-color: var(--site-heart-hi)"/><stop offset=".55" style="stop-color: var(--site-heart)"/><stop offset="1" style="stop-color: var(--site-heart-deep)"/></radialGradient>
        <radialGradient id="gpm-b" cx="35%" cy="30%" r="80%"><stop offset="0" style="stop-color: var(--site-cobalt-hi)"/><stop offset="1" style="stop-color: var(--site-cobalt-deep)"/></radialGradient>
      </defs>
      ${balloon ? `<path d="M40 50c-12-9-19-16-19-24a9.5 9.5 0 0 1 19-3 9.5 9.5 0 0 1 19 3c0 8-7 15-19 24z" fill="url(#gpm-h)"/><ellipse cx="33" cy="22" rx="4" ry="2.4" style="fill: var(--kf-on-accent)" opacity=".6" transform="rotate(-30 33 22)"/><path d="M40 50c2 14 14 22 30 44" fill="none" style="stroke: var(--site-mascot-ink)" stroke-width="1.4"/>` : ""}
      <ellipse cx="62" cy="138" rx="24" ry="25" fill="url(#gpm-b)"/>
      <ellipse cx="50" cy="161" rx="8" ry="6" style="fill: var(--site-cobalt)"/><ellipse cx="74" cy="161" rx="8" ry="6" style="fill: var(--site-cobalt)"/>
      <rect x="66" y="92" width="11" height="28" rx="5.5" style="fill: var(--site-cobalt)" transform="rotate(28 71 106)"/>
      <circle cx="64" cy="98" r="29" fill="url(#gpm-b)"/>
      <path d="M36 92c0-20 14-31 30-31s27 10 28 24c-9-6-22-9-36-6-8 2-15 7-22 13z" style="fill: var(--site-mascot-ink)"/>
      <path d="M38 84c-10 2-16 14-12 28 3 8 9 6 11 0 2-9 3-18 1-28z" style="fill: var(--site-mascot-ink)"/>
      <ellipse cx="80" cy="106" rx="15" ry="11" style="fill: var(--kf-on-accent)"/>
      <ellipse cx="90" cy="100" rx="5" ry="4" style="fill: var(--site-mascot-ink)"/>
      <circle cx="70" cy="92" r="3.2" style="fill: var(--site-mascot-ink)"/>
      <path d="M76 113c3 3 7 3 10 0" fill="none" style="stroke: var(--site-mascot-ink)" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;

  // ── Header ──────────────────────────────────────
  // design·business are Lottie thumbnail cards like the original (three at 282×196, two at 440×293), work·company are text links
  const MEGA = {
    design: [["Why Design", "Your submenu description here", "why"], ["Our Promise", "Your submenu description here", "promise"], ["Our Strength", "Your submenu description here", "strength"]],
    business: [["Partnership", "Your business 1 name here", "partner"], ["Platforms", "Your business 2 name here", "platform"]],
    work: [["All Work", "All your results here"], ["By Solution", "Find by solution · 8 items"], ["By Phase", "Find by step · 3 items"]],
    company: [["Vision", "Vision · Mission · Values"], ["Profile", "Company overview"], ["Message", "Message from the CEO"], ["Members", "Leadership team"], ["History", "History"]],
  };
  const MEGA_HEAD = { design: "Our Design", business: "Business", work: "Work", company: "Company" };
  const megaHref = { design: "service.html", business: "service.html", work: "works.html", company: "about.html" };
  const cur = (p) => (p === page ? " is-current" : "");
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("gp-head");
    if (document.body.dataset.head === "light") head.classList.add("is-light");
    if (page === "home") head.classList.add("is-intro");
    head.innerHTML = `
      <i class="gp-head__visual" aria-hidden="true"></i>
      <div class="gp-head__bar">
        ${logo()}
        <i class="gp-head__sep"></i>
        <nav class="gp-nav" aria-label="Main menu">
          <div class="gp-nav__item" data-mega="design"><a href="service.html">Our Design</a></div>
          <div class="gp-nav__item${cur("service")}" data-mega="business"><a href="service.html">Business</a></div>
          <div class="gp-nav__item${cur("works")}" data-mega="work"><a href="works.html">Work</a></div>
          <div class="gp-nav__item"><a href="service.html">AI × Design</a></div>
        </nav>
        <nav class="gp-nav is-right" aria-label="Sub Menu">
          <div class="gp-nav__item${cur("about")}" data-mega="company"><a href="about.html">Company</a></div>
          <div class="gp-nav__item"><a href="about.html">IR</a></div>
          <div class="gp-nav__item"><a class="gp-nav__out" href="#" data-ext><span class="gp-nav__lab">Careers<span class="gp-nav__ico">${arrowR}</span></span></a></div>
          <div class="gp-nav__item${cur("news")}"><a href="news.html">News</a></div>
        </nav>
        <i class="gp-head__sep"></i>
        <div class="gp-lang"><a class="is-on" href="#">KO</a><i></i><a href="#">EN</a></div>
        <i class="gp-head__sep"></i>
        <a class="gp-head__dl" href="#">Downloads</a>
        <a class="gp-head__cta" href="#contact"><span class="gp-head__roll"><span>Contact</span><span aria-hidden="true">Contact</span></span></a>
        <button class="gp-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i></button>
      </div>
      <div class="gp-mega" data-slot="mega-menu"></div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="gp-mega__veil"></div>
      <div class="gp-menu" data-slot="mobile-menu" aria-hidden="true">
        <div class="gp-menu__top">${logo()}<button class="gp-menu__x" type="button" aria-label="Close Menu"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 4 12 12M16 4 4 16"/></svg></button></div>
        <div class="gp-menu__body">
          <div class="gp-lang"><a class="is-on" href="#">KO</a><i></i><a href="#">EN</a></div>
          <nav class="gp-menu__list">
            <a href="service.html"><b>Our Design</b><span>Your menu description here</span></a>
            <a href="service.html"><b>Business</b><span>Your menu description here</span></a>
            <a href="works.html"><b>Work</b><span>Your menu description here</span></a>
            <a href="service.html"><b>AI × Design</b><span>Your menu description here</span></a>
            <a href="about.html"><b>Company</b><span>Your menu description here</span></a>
            <a href="about.html"><b>IR</b><span>Your menu description here</span></a>
            <a href="#"><b>Careers</b><span>Your menu description here</span></a>
            <a href="news.html"><b>News</b><span>Your menu description here</span></a>
          </nav>
          <nav class="gp-menu__sub"><a href="news.html">Blogs</a><a href="#">Seminar</a><a href="#">Press kit</a></nav>
          <div class="gp-menu__btns"><a class="gp-foot__btn" href="#contact"><i>${arrowR}</i>Contact</a><a class="gp-foot__btn" href="#"><i>${arrowR}</i>Downloads</a></div>
          <p class="gp-menu__copy">©2026 Company Inc. Your copyright line here</p>
        </div>
      </div>`
    );

    const mega = head.querySelector(".gp-mega");
    const veil = document.querySelector(".gp-mega__veil");
    let openKey = null;
    const closeMega = () => {
      openKey = null;
      GP.pauseLottie(mega);
      mega.classList.remove("is-open");
      veil.classList.remove("is-on");
      head.classList.remove("is-mega");
      head.querySelectorAll(".gp-nav__item.is-open").forEach((n) => n.classList.remove("is-open"));
    };
    head.querySelectorAll("[data-mega]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const key = item.dataset.mega;
        if (openKey !== key) {
          GP.unmountLottie(mega);
          const cards = MEGA[key][0][2];
          const grid = key === "business" ? "is-wide" : cards ? "" : "is-list";
          mega.innerHTML = `<p class="gp-mega__h en">${MEGA_HEAD[key]}</p><div class="gp-mega__grid ${grid}">${MEGA[key]
            .map(([b, s, lt]) => `<a class="gp-mcard" href="${megaHref[key]}">${lt ? `<span class="gp-mcard__th"><span class="gp-mcard__lt" data-lottie="${lt}" data-lottie-ready="false"></span></span>` : ""}<b>${b}</b><span>${s}</span></a>`)
            .join("")}</div>`;
          GP.mountLottie(mega);
        }
        openKey = key;
        mega.querySelectorAll("[data-lottie]").forEach((el) => {
          const a = anims.get(el);
          if (a) (a.paused = false), syncLottie(el);
        });
        head.querySelectorAll(".gp-nav__item.is-open").forEach((n) => n.classList.remove("is-open"));
        item.classList.add("is-open");
        head.style.setProperty("--gp-visual-open", `${975 - mega.offsetHeight}px`);
        head.classList.add("is-mega");
        mega.classList.add("is-open");
        veil.classList.add("is-on");
      });
    });
    head.querySelectorAll(".gp-nav__item:not([data-mega])").forEach((n) => n.addEventListener("mouseenter", closeMega));
    // The original closes one beat after leaving (measured delay 51~107ms per side — .02s to match the middle value) — so it doesn’t flicker when passing between the menu line and the panel
    let closeT = 0;
    head.addEventListener("mouseleave", () => (closeT = setTimeout(closeMega, 20)));
    head.addEventListener("mouseenter", () => clearTimeout(closeT));

    const menu = document.querySelector(".gp-menu");
    const burger = head.querySelector(".gp-burger");
    const setMenu = (on) => {
      menu.classList.toggle("is-open", on);
      menu.setAttribute("aria-hidden", String(!on));
      burger.setAttribute("aria-expanded", String(on));
      document.documentElement.style.overflow = on ? "hidden" : "";
      if (GP.lenis) on ? GP.lenis.stop() : GP.lenis.start();
      if (on) menu.querySelectorAll(".gp-menu__list a").forEach((a, i) => (a.style.animationDelay = `${0.1 + i * 0.04}s`));
    };
    burger.addEventListener("click", () => setMenu(true));
    menu.querySelector(".gp-menu__x").addEventListener("click", () => setMenu(false));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

    // Original: scrolling down moves the header up -24px and hides it, and scrolling up brings it back down on a pale gray background
    let lastY = 0;
    GP.onScroll = (y) => {
      if (head.classList.contains("is-intro")) return;
      const down = y > lastY;
      if (Math.abs(y - lastY) > 4) head.classList.toggle("is-hidden", down && y > 120 && !openKey);
      head.classList.toggle("is-solid", y > 88 && !down);
      if (y <= 88) head.classList.remove("is-solid");
      lastY = y;
    };
    GP.showHead = () => head.classList.remove("is-intro");
  }

  // ── Get In Touch ──────────────────────────────
  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.classList.add("gp-contact");
    contact.id = "contact";
    contact.innerHTML = `
      <span class="wf-note">Contact · Heart balloon and hand (original 3D render) redrawn as SVG · 3 bubbles hover 1.04x .6s power3 · letters rise in, stagger .04</span>
      <svg class="gp-contact__heart" viewBox="0 0 400 470" aria-hidden="true">
        <defs>
          <radialGradient id="gpc-h" cx="32%" cy="28%" r="80%"><stop offset="0" style="stop-color: var(--site-heart-hi)"/><stop offset=".45" style="stop-color: var(--site-heart)"/><stop offset="1" style="stop-color: var(--site-heart-deep)"/></radialGradient>
          <filter id="gpc-blur"><feGaussianBlur stdDeviation="10"/></filter>
        </defs>
        <path d="M200 395C78 304 6 226 20 128 32 44 146 18 200 96c54-78 168-52 180 32 14 98-58 176-180 267z" fill="url(#gpc-h)"/>
        <ellipse cx="118" cy="112" rx="52" ry="26" style="fill: var(--kf-on-accent)" opacity=".45" filter="url(#gpc-blur)" transform="rotate(-32 118 112)"/>
        <path d="M188 392h24l-6 16h-12z" style="fill: var(--site-heart-dark)"/>
        <path d="M200 408c-6 26 10 40 30 62" fill="none" style="stroke: var(--site-mascot-ink)" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <h2 class="gp-contact__title t-giant" data-split>Get In Touch</h2>
      <svg class="gp-contact__hand" viewBox="0 0 760 520" aria-hidden="true">
        <defs>
          <linearGradient id="gpc-s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color: var(--site-skin-hi)"/><stop offset=".6" style="stop-color: var(--site-skin)"/><stop offset="1" style="stop-color: var(--site-skin-deep)"/></linearGradient>
          <linearGradient id="gpc-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--site-cobalt-hi)"/><stop offset="1" style="stop-color: var(--site-cobalt-deep)"/></linearGradient>
        </defs>
        <path d="M120 470C40 400 60 300 160 300c80 0 120 40 190 70" fill="none" stroke="url(#gpc-a)" stroke-width="64" stroke-linecap="round"/>
        <path d="M160 300c-30 30-40 80-20 130" fill="none" style="stroke: var(--site-mascot-ink)" stroke-width="6" stroke-linecap="round"/>
        <path d="M760 250c-70-6-140-4-200 6-40 7-60 30-90 34l-70 6c-22 2-24 30 0 32l80 4c-30 16-70 24-104 26-24 2-22 34 4 34l120-8c40 26 100 36 160 30h100z" fill="url(#gpc-s)"/>
        <path d="M520 290c-30-34-80-54-120-58-22-2-26 24-6 30 40 12 70 34 92 58z" fill="url(#gpc-s)"/>
        <ellipse cx="640" cy="280" rx="70" ry="18" style="fill: var(--kf-on-accent)" opacity=".25"/>
      </svg>
      <a class="gp-bubble is-a" href="#" data-float="0"><small>Contact</small><b>Contact Us</b><p>Your short notice goes here in one line.</p>${GP.arrow}</a>
      <a class="gp-bubble is-b" href="#" data-float="1"><small>Downloads</small><b>Material Request</b><p>Your materials guide here<br>Set in two lines.</p>${GP.arrow}</a>
      <a class="gp-bubble is-c" href="#" data-float="2"><small>Career</small><b>Hiring Info</b>${GP.arrow}</a>
      <p class="gp-contact__note">Your collaboration text goes here in about four lines. Say what you can do together, from services and brands to organizations and strategy, and invite easy consultation.</p>`;
  }

  // ── Footer ──────────────────────────────────────
  const social = `<nav class="gp-social" aria-label="Social">
    <a href="#" aria-label="X"><svg viewBox="0 0 24 24"><path d="M4 4h4.6l4 5.6L17.4 4H20l-6.1 7.1L20.6 20H16l-4.4-6.1L6.4 20H3.8l6.6-7.6z"/></svg><span class="gp-tip" aria-hidden="true">X</span></a>
    <a href="#" aria-label="Note"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 17V8h5.2A2.8 2.8 0 0 1 16 10.8V17" fill="none" style="stroke: var(--kf-contrast-bg)" stroke-width="2"/></svg><span class="gp-tip" aria-hidden="true">Note</span></a>
    <a href="#" aria-label="Video"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" style="fill: var(--kf-contrast-bg)"/></svg><span class="gp-tip" aria-hidden="true">Video</span></a>
    <a href="#" aria-label="Photo"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2"/></svg><span class="gp-tip" aria-hidden="true">Photo</span></a>
  </nav>`;
  GP.social = social;
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("gp-foot");
    const ico = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="m2.5 4.5 5.5 4 5.5-4" fill="none" style="stroke: var(--kf-on-accent)" stroke-width="1.2"/></svg>';
    foot.innerHTML = `
      <div class="gp-foot__in">
        <div class="gp-foot__top">${logo()}<div class="gp-lang"><a class="is-on" href="#">KO</a><i></i><a href="#">EN</a></div><a class="gp-foot__pagetop" href="#top" data-top>Page Top ${arrowUp}</a></div>
        <div class="gp-foot__mid">
          ${social}
          <div class="gp-foot__col"><b>Our Design</b><a href="service.html">Menu 1</a><a href="service.html">Menu 2</a><a href="service.html">Menu 3</a><a href="service.html">Menu 4</a></div>
          <div class="gp-foot__col"><b>Business</b><a href="service.html">Menu 1</a><a href="service.html">Menu 2</a><a href="service.html">Menu 3</a><a href="works.html">Work</a></div>
          <div class="gp-foot__col"><b>Company</b><a href="about.html">Menu 1</a><a href="#">Careers ${arrowUR}</a><a href="#">Menu 3 ${arrowUR}</a><a href="#">Menu 4 ${arrowUR}</a></div>
        </div>
        <div class="gp-foot__low">
          <div><div class="gp-foot__legal" style="margin-top:90px"><a href="#">Privacy policy</a><a href="#">Security Policy</a><a href="#">Web accessibility</a></div><p class="gp-foot__copy">©2026 Company Inc. All rights reserved.</p></div>
          <div></div>
          <div class="gp-foot__col is-others"><b>Others</b><a href="news.html">News</a><a href="news.html">Blogs ${arrowUR}</a><a href="#">Seminar ${arrowUR}</a><a href="#">Press kit</a></div>
          <div class="gp-foot__btns"><a class="gp-foot__btn" href="#contact"><i>${ico}</i>Contact</a><a class="gp-foot__btn" href="#"><i>${ico}</i>Downloads</a></div>
        </div>
      </div>
      <div class="gp-foot__sky" data-slot="footer-sky"><canvas></canvas>${GP.motionBtn()}</div>`;
  }

  // ── Cookie bar · chat mascot · transition curtain ──────────────────
  document.body.insertAdjacentHTML(
    "beforeend",
    `${localStorage.getItem("gp-cookie") ? "" : `<div class="gp-cookie" data-slot="cookie-bar"><p>About two lines of cookie notice. So we can give you better information <a href="#">Privacy policy</a>Cookies are set according to this.</p><button class="gp-cookie__off" type="button">Turn off cookies</button><button class="gp-cookie__ok" type="button">Agree</button></div>`}
     <div class="gp-chat" data-slot="chat"><div class="gp-chat__panel"><b>Assistant</b>Your chatbot’s first greeting here, in two lines.</div><button class="gp-chat__dots" type="button" aria-label="Open chat">··</button>${GP.mascot(true)}</div>
     <div class="gp-veil" aria-hidden="true"></div>`
  );
  document.querySelectorAll(".gp-cookie button").forEach((b) =>
    b.addEventListener("click", () => {
      localStorage.setItem("gp-cookie", "1");
      b.closest(".gp-cookie").classList.add("is-gone");
    })
  );
  const chat = document.querySelector(".gp-chat");
  chat.querySelector(".gp-chat__dots").addEventListener("click", () => chat.classList.toggle("is-open"));

  const veil = document.querySelector(".gp-veil");
  if (!reduced) {
    gsap.fromTo(veil, { opacity: page === "home" ? 0 : 1 }, { opacity: 0, duration: 0.3, ease: "power2.out" });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href$='.html']");
      if (!a || a.target || e.metaKey || e.ctrlKey || a.closest(".wf-ui")) return;
      e.preventDefault();
      veil.classList.add("is-on");
      gsap.to(veil, { opacity: 1, duration: 0.3, ease: "power2.in", onComplete: () => (location.href = a.href) });
    });
  }
  addEventListener("pageshow", (e) => e.persisted && gsap.set(veil, { opacity: 0 }) && veil.classList.remove("is-on"));

  // ── Motion switch — the original shows the switch openly in a corner of the hero and footer ──────
  const setStill = (on) => {
    GP.still = on;
    document.documentElement.classList.toggle("is-still", on);
    document.querySelectorAll("[data-motion]").forEach((b) => b.setAttribute("aria-pressed", String(on)));
    dispatchEvent(new CustomEvent("gp:motion", { detail: on }));
  };
  document.addEventListener("click", (e) => e.target.closest("[data-motion]") && setStill(!GP.still));

  // ── Smooth scroll ──────────────────────────────
  if (!reduced && window.Lenis) {
    GP.lenis = new Lenis({ lerp: 0.25 });
    GP.lenis.on("scroll", (l) => {
      ScrollTrigger.update();
      GP.onScroll && GP.onScroll(l.scroll);
    });
    gsap.ticker.add((t) => GP.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else addEventListener("scroll", () => GP.onScroll && GP.onScroll(scrollY), { passive: true });
  document.querySelectorAll("[data-top]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      GP.lenis ? GP.lenis.scrollTo(0, { duration: 1.2 }) : scrollTo(0, 0);
    })
  );
  document.querySelectorAll('a[href="#contact"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const t = document.getElementById("contact");
      if (!t) return;
      e.preventDefault();
      GP.lenis ? GP.lenis.scrollTo(t, { duration: 1.2 }) : t.scrollIntoView();
    })
  );

  // ── Helpers ──────────────────────────────────────
  // Letter splitting: the original TypoMotion splits each letter into a span and raises it from below
  GP.split = (el) => {
    if (el.dataset.splitDone) return el.querySelectorAll(".gp-split > i");
    el.dataset.splitDone = "1";
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            if (ch === " " || ch === "\n") return frag.append(document.createTextNode(ch === "\n" ? "" : " "));
            const s = document.createElement("span");
            s.className = "gp-split";
            s.innerHTML = `<i>${ch}</i>`;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return el.querySelectorAll(".gp-split > i");
  };

  // Lens: a circle following the cursor (.6s power3) — it swells with back.out on enter and folds with back.in on leave
  // grow type (first page business cells): hides between two cells (rest) at 280px·.7 scale, then on entry appears right there (original 0ms) and flies to the cursor over .7s
  // Grows to 440px · 1x in .3s (standard-out), and on leaving rests .1s then returns to the rest position, shrinking, then hides
  GP.lens = (area, lens, grow) => {
    if (reduced || matchMedia("(hover: none)").matches) return;
    // grow type fits the movement measured in the original (95% in 400ms), so .7s
    const follow = grow ? 0.7 : 0.6;
    const xTo = gsap.quickTo(lens, "x", { duration: follow, ease: "power3.out" });
    const yTo = gsap.quickTo(lens, "y", { duration: follow, ease: "power3.out" });
    const pos = (e) => {
      const r = (lens.offsetParent || area).getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    if (grow) {
      const [rw, hw] = grow.size, [rs, hs] = grow.scale;
      const rest = () => {
        const r = (lens.offsetParent || area).getBoundingClientRect();
        return typeof grow.rest === "function" ? grow.rest(r) : [r.width * grow.rest[0], r.height * grow.rest[1]];
      };
      const [x0, y0] = rest();
      gsap.set(lens, { xPercent: -50, yPercent: -50, x: x0, y: y0, width: rw, height: rw, scale: rs, autoAlpha: 0 });
      area.addEventListener("mouseenter", (e) => {
        const [x, y] = pos(e);
        xTo(x);
        yTo(y);
        gsap.set(lens, { autoAlpha: 1 });
        gsap.to(lens, { width: hw, height: hw, scale: hs, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      });
      area.addEventListener("mousemove", (e) => {
        const [x, y] = pos(e);
        xTo(x);
        yTo(y);
      });
      // The original rests .1s after leaving a cell, then returns (measured delay 135~152ms)
      area.addEventListener("mouseleave", () => {
        const [x, y] = rest();
        gsap.delayedCall(0.1, () => {
          if (area.matches(":hover")) return;
          xTo(x);
          yTo(y);
          gsap.to(lens, { width: rw, height: rw, scale: rs, duration: 0.3, ease: "power2.out", overwrite: "auto" });
          gsap.delayedCall(0.7, () => area.matches(":hover") || gsap.set(lens, { autoAlpha: 0 }));
        });
      });
      return;
    }
    gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0 });
    area.addEventListener("mouseenter", (e) => {
      const [x, y] = pos(e);
      gsap.set(lens, { x, y });
      gsap.to(lens, { scale: 1, duration: 0.46, ease: "back.out(1.7)", overwrite: "auto" });
    });
    area.addEventListener("mousemove", (e) => {
      const [x, y] = pos(e);
      xTo(x);
      yTo(y);
    });
    area.addEventListener("mouseleave", () => gsap.to(lens, { scale: 0, duration: 0.3, ease: "back.in(1.7)", overwrite: "auto" }));
  };

  const mm = gsap.matchMedia();
  GP.mm = mm;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-split]").forEach((el) => {
      const chars = GP.split(el);
      gsap.from(chars, { yPercent: 110, duration: 0.9, ease: "power3.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 0.6, ease: "power3.out", delay: (+el.dataset.reveal || 0) / 1000, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    // Mascot: scale 0→1 from the section edge in .46s back.out, and it hides with back.in after it passes
    document.querySelectorAll("[data-pop]").forEach((el) => {
      el.classList.add("gp-pop");
      el.innerHTML = GP.mascot(el.dataset.pop !== "plain");
      const show = () => gsap.to(el, { scale: 1, duration: 0.46, ease: "back.out(1.7)", overwrite: "auto" });
      const hide = () => gsap.to(el, { scale: 0, duration: 0.38, ease: "back.in(1.7)", overwrite: "auto" });
      ScrollTrigger.create({ trigger: el.parentElement, start: "top 70%", end: "bottom 30%", onEnter: show, onEnterBack: show, onLeave: hide, onLeaveBack: hide });
    });
    document.querySelectorAll("[data-float]").forEach((el, i) => {
      gsap.to(el, { y: i % 2 ? 10 : -10, duration: 3 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true });
    });
  });

  // Empty sky below the footer: small white dots and paper planes drift slowly
  const sky = document.querySelector(".gp-foot__sky canvas");
  if (sky) {
    const ctx = sky.getContext("2d");
    const items = [
      { k: "dot", x: 0.58, y: 0.42, s: 5, vx: -0.004, vy: -0.002 },
      { k: "plane", x: 0.53, y: 0.5, s: 9, vx: -0.006, vy: -0.004 },
      { k: "plane", x: 0.5, y: 0.7, s: 8, vx: -0.005, vy: -0.003 },
      { k: "plane", x: 0.46, y: 0.74, s: 7, vx: -0.004, vy: -0.0025 },
    ];
    let w = 0, h = 0, run = false;
    const size = () => {
      w = sky.width = sky.clientWidth * devicePixelRatio;
      h = sky.height = sky.clientHeight * devicePixelRatio;
    };
    const ink = GP.color("--kf-contrast-ink");
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink;
      items.forEach((it, i) => {
        const x = ((it.x + it.vx * Math.sin(t / 2000 + i)) % 1) * w;
        const y = (it.y + it.vy * Math.cos(t / 1700 + i) * 6) * h;
        const s = it.s * devicePixelRatio;
        ctx.save();
        ctx.translate(x, y);
        if (it.k === "dot") {
          ctx.beginPath();
          ctx.arc(0, 0, s, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.rotate(-0.6 + Math.sin(t / 900 + i) * 0.15);
          ctx.beginPath();
          ctx.moveTo(-s, s * 0.6);
          ctx.lineTo(s * 1.2, 0);
          ctx.lineTo(-s, -s * 0.6);
          ctx.lineTo(-s * 0.4, 0);
          ctx.closePath();
          ctx.globalAlpha = 0.85;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      });
    };
    const loop = (t) => {
      if (!run) return;
      draw(t);
      requestAnimationFrame(loop);
    };
    size();
    addEventListener("resize", size);
    draw(0);
    ScrollTrigger.create({
      trigger: sky,
      start: "top bottom",
      end: "bottom top",
      onToggle: (st) => {
        run = st.isActive && !reduced && !GP.still;
        if (run) requestAnimationFrame(loop);
      },
    });
    addEventListener("gp:motion", (e) => {
      run = !e.detail && !reduced;
      if (run) requestAnimationFrame(loop);
    });
  }
  // Footer footprints (original FooterFootprints) — when the cursor enters the sky cell a white dot (20px) follows the cursor at .3s power2.out, and from the corner farthest from the cursor (56px inside)
  // A walker walks toward the cursor 73px every .25s (until the remaining distance is -66), leaving footprints staggered 15px left and right (.85 · .6→1 scale in .3s · vanish in .3s after 1.6s).
  // Within 110px the 160px circle opens in .6s power3.out, and closes beyond 230px. With no cursor, after 3s (then every 6~12s) from one edge
  // Footprints passing the other way (.5 · vanish after .4s). On large touch screens it wanders alone, and tapping within 140px of it opens it, and it closes after 6s. The original has none under 1024px either
  const skyBox = document.querySelector(".gp-foot__sky");
  if (skyBox && !reduced && matchMedia("(min-width: 1024px)").matches) {
    const area = document.createElement("div");
    area.className = "gp-steps";
    area.setAttribute("aria-hidden", "true");
    const sole = (flip) => `<svg viewBox="0 0 47 80"${flip ? ' style="transform: scaleX(-1)"' : ""}><ellipse cx="23" cy="50" rx="15" ry="21"/><circle cx="9" cy="19" r="6"/><circle cx="20" cy="10" r="6.5"/><circle cx="32" cy="12" r="5.5"/><circle cx="40" cy="22" r="4.5"/></svg>`;
    area.innerHTML =
      Array.from({ length: 18 }, (_, i) => `<span class="gp-steps__p">${sole(i % 2)}</span>`).join("") +
      '<div class="gp-steps__me"><i class="gp-steps__dot"></i><div class="gp-steps__open"><div class="wf-img" data-label="Short video of a walking character · Inside a circle"></div></div></div>';
    skyBox.prepend(area);
    const prints = [...area.querySelectorAll(".gp-steps__p")], me = area.querySelector(".gp-steps__me");
    const dot = area.querySelector(".gp-steps__dot"), open = area.querySelector(".gp-steps__open");
    const at = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let n = 0, opened = false;
    const local = (e) => {
      const r = area.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const step = (x, y, a, op = 0.85, hold = 1.6) => {
      const p = prints[n % prints.length], s = n % 2 ? 1 : -1;
      n += 1;
      gsap.killTweensOf(p);
      gsap.set(p, { x: x + 15 * Math.cos(a + Math.PI / 2) * s - 10, y: y + 15 * Math.sin(a + Math.PI / 2) * s - 17, rotation: (a * 180) / Math.PI + 90, transformOrigin: "50% 50%" });
      gsap.fromTo(p, { opacity: 0, scale: 0.6 }, { opacity: op, scale: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(p, { opacity: 0, delay: hold, duration: 0.3, ease: "power2.in" });
    };
    const show = () => {
      opened = true;
      gsap.to(open, { scale: 1, duration: 0.6, ease: "power3.out" });
      gsap.to(dot, { scale: 0, duration: 0.3, ease: "power2.in" });
    };
    const hide = () => {
      opened = false;
      gsap.to(open, { scale: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
    };
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const xTo = gsap.quickTo(me, "x", { duration: 0.3, ease: "power2.out" }), yTo = gsap.quickTo(me, "y", { duration: 0.3, ease: "power2.out" });
      let inside = false, seen = false, roam = false, walk = null, auto = null, heading = 0, left = 0;
      const pos = { x: 0, y: 0 };
      const toward = () => {
        if (!inside) return;
        const dx = cur.x - at.x, dy = cur.y - at.y, d = Math.hypot(dx, dy);
        if (opened && d > 230) hide();
        if (!opened && d <= 110) show();
        if (!opened && d > 110) {
          const a = Math.atan2(dy, dx), s = Math.min(73, d - 66);
          at.x += Math.cos(a) * s;
          at.y += Math.sin(a) * s;
          step(at.x, at.y, a);
        }
        walk = gsap.delayedCall(0.25, toward);
      };
      const pace = () => {
        if (!roam || inside || !seen) return void (roam = false);
        const r = area.getBoundingClientRect();
        heading += (Math.random() - 0.5) * 0.3;
        pos.x += 73 * Math.cos(heading);
        pos.y += 73 * Math.sin(heading);
        left -= 1;
        if (left <= 0 || pos.x < -34 || pos.x > r.width + 34 || pos.y < -34 || pos.y > r.height + 34) {
          roam = false;
          return later(6 + 6 * Math.random());
        }
        step(pos.x, pos.y, heading, 0.5, 0.4);
        gsap.delayedCall(0.25, pace);
      };
      const cross = () => {
        if (inside || roam || !seen) return;
        const r = area.getBoundingClientRect(), fromLeft = Math.random() < 0.5;
        pos.x = fromLeft ? -20 : r.width + 20;
        pos.y = r.height * (0.2 + 0.6 * Math.random());
        heading = (fromLeft ? 0 : Math.PI) + (Math.random() - 0.5) * 0.6;
        left = Math.ceil(r.width / 73) + 4;
        roam = true;
        pace();
      };
      const later = (s) => {
        auto?.kill();
        auto = gsap.delayedCall(s, cross);
      };
      area.addEventListener("pointerenter", (e) => {
        auto?.kill();
        roam = false;
        Object.assign(cur, local(e));
        inside = true;
        gsap.set(me, { x: cur.x, y: cur.y });
        gsap.to(me, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
        const r = area.getBoundingClientRect();
        const far = [[56, 56], [r.width - 56, 56], [56, r.height - 56], [r.width - 56, r.height - 56]].reduce((a, b) => (Math.hypot(cur.x - a[0], cur.y - a[1]) > Math.hypot(cur.x - b[0], cur.y - b[1]) ? a : b));
        at.x = far[0] + (far[0] < r.width / 2 ? 1 : -1) * Math.random() * 180;
        at.y = far[1] + (far[1] < r.height / 2 ? 1 : -1) * Math.random() * Math.min(180, r.height / 3);
        walk?.kill();
        walk = gsap.delayedCall(0.25, toward);
      });
      area.addEventListener("pointermove", (e) => {
        Object.assign(cur, local(e));
        xTo(cur.x);
        yTo(cur.y);
      });
      area.addEventListener("pointerleave", () => {
        inside = false;
        walk?.kill();
        if (opened) hide();
        gsap.to(me, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
        prints.forEach((p) => (gsap.killTweensOf(p), gsap.to(p, { opacity: 0, duration: 0.3, ease: "power2.in" })));
        if (seen) later(3);
      });
      new IntersectionObserver(([en]) => ((seen = en.isIntersecting) ? inside || roam || later(3) : auto?.kill()), { threshold: 0.3 }).observe(area);
    } else {
      let wander = null, shut = null, ang = Math.random() * Math.PI * 2;
      const stroll = () => {
        if (!opened) {
          const r = area.getBoundingClientRect();
          ang += (Math.random() - 0.5) * 0.5;
          let x = at.x + 73 * Math.cos(ang), y = at.y + 73 * Math.sin(ang);
          if (x < 48 || x > r.width - 48 || y < 48 || y > r.height - 48) {
            ang = Math.atan2(r.height / 2 - at.y, r.width / 2 - at.x) + (Math.random() - 0.5) * 0.8;
            x = at.x + 73 * Math.cos(ang);
            y = at.y + 73 * Math.sin(ang);
          }
          at.x = x;
          at.y = y;
          step(x, y, ang);
        }
        wander = gsap.delayedCall(0.25, stroll);
      };
      const close = () => {
        shut?.kill();
        if (!opened) return;
        hide();
        gsap.to(me, { autoAlpha: 0, delay: 0.3, duration: 0.3, ease: "power2.in" });
      };
      area.addEventListener("pointerdown", (e) => {
        const p = local(e);
        if (opened) return close();
        if (Math.hypot(p.x - at.x, p.y - at.y) > 140) return;
        gsap.set(me, { x: at.x, y: at.y });
        gsap.to(me, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
        show();
        shut = gsap.delayedCall(6, close);
      });
      new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return void (wander?.kill(), (wander = null), close());
        if (wander) return;
        const r = area.getBoundingClientRect();
        at.x = r.width * (0.25 + 0.5 * Math.random());
        at.y = r.height * (0.25 + 0.5 * Math.random());
        stroll();
      }, { threshold: 0.3 }).observe(area);
    }
  }

  // Original AnimatedArrowIcon: on hover the arrow exits by r (standard-in .3s), then enters from the opposite side r (standard-out .3s), rests .6s while hovered, and repeats.
  // masked (inside pill) r = (pill width + arrow width) / 2, fade (bare arrow — Page Top) r = Arrow width × .8 with opacity too. On release, it finishes the current lap and stops
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const arrowMotion = (root, variant) => {
    const icon = root.querySelector("svg");
    const target = root.closest("a, button") || root;
    if (!icon || reduced || !fine) return;
    let hovering = false, running = false, tl = null, wait = null;
    const reset = () => {
      tl?.kill();
      wait?.kill();
      tl = wait = null;
      running = false;
      gsap.set(icon, variant === "fade" ? { x: 0, autoAlpha: 1, clearProps: "transform,opacity,visibility" } : { x: 0, clearProps: "transform" });
    };
    const run = () => {
      if (running) return;
      running = true;
      const w = icon.getBoundingClientRect().width;
      const r = variant === "masked" ? (root.getBoundingClientRect().width + w) / 2 : w * 0.8;
      tl = gsap.timeline({ onComplete: () => ((running = false), hovering ? (wait = gsap.delayedCall(0.6, run)) : reset()) });
      if (variant === "masked") tl.to(icon, { x: r, duration: 0.3, ease: "power2.in" }).set(icon, { x: -r }).to(icon, { x: 0, duration: 0.3, ease: "power2.out" });
      else tl.to(icon, { x: r, autoAlpha: 0, duration: 0.3, ease: "power2.in" }).set(icon, { x: -r, autoAlpha: 0 }).to(icon, { x: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    };
    target.addEventListener("mouseenter", () => ((hovering = true), run()));
    target.addEventListener("mouseleave", () => ((hovering = false), running || reset()));
    target.addEventListener("focusin", run);
  };
  // The blog button (.bg-call) has no moving arrow in the original
  document.querySelectorAll(".gp-arrow").forEach((a) => a.closest(".bg-call") || arrowMotion(a, "masked"));
  document.querySelectorAll(".gp-foot__pagetop").forEach((a) => arrowMotion(a, "fade"));
  document.querySelectorAll(".gp-nav__ico").forEach((a) => arrowMotion(a, "fade"));
})();
