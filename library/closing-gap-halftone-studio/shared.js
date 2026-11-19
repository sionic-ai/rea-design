// The original is an Astro + barba 2.10.3 single-page app, so it swaps the containers (header, body, footer) wholesale.
// Page script registers with MO.page(name, { set, intro, init }) raises it, and unhooks and re-hooks on every slide.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  document.documentElement.classList.add("mo-js");
  // Original CustomEase names and values as they are
  CustomEase.create("ease-primary", "0.55, 0, 0.7, 0");
  CustomEase.create("ease-secondary", "0.31,0.75,0.22,1");
  CustomEase.create("ease-fade", "0.76, 0, 0.24, 1");
  CustomEase.create("ease-preloader", "0.25, 1, 0.5, 1");
  CustomEase.create("ease-transition", "0.22, 1, 0.36, 1");
  CustomEase.create("ease-menu", ".7,0,.22,1");
  const D = { fast: 0.3, normal: 0.65, slow: 0.95, slower: 1.25, stagger: 0.05 };
  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceQ.matches;
  reduceQ.addEventListener?.("change", (e) => (reduced = e.matches));
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const MO = (window.MO = { D, pages: {}, cleanups: new Set(), get reduced() { return reduced; } });
  MO.page = (name, def) => (MO.pages[name] = def);
  MO.onClean = (fn) => MO.cleanups.add(fn);
  const cleanAll = () => { MO.cleanups.forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); MO.cleanups.clear(); };

  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>';
  MO.btn = (label, href, cls = "", attrs = "") => `<a href="${href}" class="mo-btn ${cls}" ${attrs}><span class="mo-btn__text-wrap"><span class="mo-btn__text">${label}</span></span><span class="mo-btn__aside"><span class="mo-btn__aside-bg"></span><span class="mo-btn__arrow">${ARROW}</span><span class="mo-btn__arrow is-entering">${ARROW}</span></span></a>`;
  const logo = (cls = "") => `<span class="mo-logo mo-wordmark ${cls}" aria-label="Studio logo">LOGO<i></i></span>`;

  // ── Header ──
  const NAV = `
<div class="mo-nav__in">
  <div class="mo-nav__left"><a href="index.html" class="mo-nav__home" aria-label="Home">${logo()}</a></div>
  <nav class="mo-nav__links" aria-label="Main menu"><ul class="mo-nav__ul" style="display:flex" data-label="Menu English section name">
    <li class="mo-nav__li"><a href="about.html" class="mo-nav__link" data-link-hover data-open-modal data-barba-prevent="self">About</a></li>
    <li class="mo-nav__li"><a href="work.html" class="mo-nav__link" data-link-hover>Work</a></li>
    <li class="mo-nav__li"><a href="index.html#services" class="mo-nav__link" data-link-hover>Services</a></li>
    <li class="mo-nav__li"><a href="index.html#process" class="mo-nav__link" data-link-hover>Process</a></li>
  </ul></nav>
  <div class="mo-nav__cta">
    <div><button class="mo-sound" type="button" data-btn-default aria-pressed="false" aria-label="Sound On"><span class="mo-sound__box"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3 8v4h3l4 3V5L6 8z" fill="currentColor" stroke="none"/><path class="mo-path-curve" d="M13 7.5a3.5 3.5 0 0 1 0 5"/><path class="mo-path-curve" d="M14.5 4a8 8 0 0 1 0 12"/><path class="mo-path-cross" d="M12.5 7.5l5.5 5.5"/><path class="mo-path-cross" d="M18 7.5l-5.5 5.5"/></svg></span></button></div>
    <div class="mo-nav__cta-contain">${MO.btn("Begin a project", "contact.html")}</div>
    <button class="mo-menu-btn" type="button" data-menu-btn aria-label="Open Menu"><span class="mo-menu-btn__wrap"><span class="mo-menu-btn__span">Menu</span><span class="mo-menu-btn__span is-close">Close</span></span></button>
  </div>
</div>`;

  const NAVLIST = (items) => `<ul class="mo-navlist" data-label="Menu English section name">${items.map(([t, h, extra = ""]) => `<li class="mo-navlist__li"><a href="${h}" class="mo-navlist__a" data-hover-highlight="link" ${extra}><span class="mo-navlist__span" data-hover-heading>${t}</span><span class="mo-navlist__span is-arrow" data-footer-arrow>→</span></a></li>`).join("")}</ul>`;
  const ABOUT_LINK = 'data-open-modal data-barba-prevent="self"';

  const FOOTER = `
<div class="mo-footer" data-footer-parallax>
  <div class="mo-footer__wrap" data-footer-parallax-inner data-theme-section="dark">
    <div class="mo-footer__top">
      <div class="mo-footer__eyebrow">
        <div class="mo-eyebrow" data-eyebrow><span class="mo-eyebrow__marker"></span><p class="mo-eyebrow__text">Move</p></div>
        <nav aria-label="Footer Menu">${NAVLIST([["Home", "index.html"], ["About", "about.html", ABOUT_LINK], ["Work", "work.html"], ["Process", "index.html#process"], ["Services", "index.html#services"], ["Resources", "#"], ["Begin a project", "contact.html"]])}</nav>
      </div>
      <div class="mo-footer__aside">
        <div class="mo-footer__col">
          <p class="t-mono" style="opacity:.6">(Contact)</p>
          <a href="#" class="mo-footer__badge t-xsmall"><i></i>Certified partner badge</a>
          <a class="mo-footer__mail t-main" data-hover-highlight="link" href="mailto:hello@studio-name.com"><span data-hover-heading style="display:flex;gap:.35em;align-items:center"><span aria-hidden="true">↳</span>hello@studio-name.com</span></a>
          <p class="mo-footer__where t-small">Your two hub cities here, plus one line saying the team works remotely.</p>
        </div>
        <div class="mo-footer__col">
          <p class="t-mono" style="opacity:.6">(Social)</p>
          <div class="mo-footer__socials t-main">
            <a class="mo-footer__social" data-hover-highlight="link" href="#"><span data-hover-heading>Video channel ↗</span></a>
            <a class="mo-footer__social" data-hover-highlight="link" href="#"><span data-hover-heading>Network ↗</span></a>
            <a class="mo-footer__social" data-hover-highlight="link" href="#"><span data-hover-heading>Social ↗</span></a>
          </div>
        </div>
        <div class="mo-footer__col" style="flex-basis:100%">
          <p class="t-mono" style="opacity:.6">(Ask AI about this studio)</p>
          <div class="mo-footer__ai">
            <a href="#" data-btn-default aria-label="AI 1"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 2v16M2 10h16M4.3 4.3l11.4 11.4M15.7 4.3L4.3 15.7"/></svg></a>
            <a href="#" data-btn-default aria-label="AI 2"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5c.6 4.6 3.9 7.9 8.5 8.5-4.6.6-7.9 3.9-8.5 8.5-.6-4.6-3.9-7.9-8.5-8.5 4.6-.6 7.9-3.9 8.5-8.5z"/></svg></a>
            <a href="#" data-btn-default aria-label="AI 3"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="6.5"/><path d="M6 10h8M10 6v8"/></svg></a>
            <a href="#" data-btn-default aria-label="AI 4"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 14a6 6 0 1 1 12 0"/><circle cx="10" cy="14" r="2"/></svg></a>
            <a href="#" data-btn-default aria-label="AI 5"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="12" height="12" rx="2"/><path d="M7 10h6"/></svg></a>
          </div>
        </div>
      </div>
    </div>
    <div class="mo-footer__bottom t-main">
      <div class="mo-footer__time"><span><span>City Name</span> <span data-footer-time>00:00:00</span></span><span data-footer-date>Weekday, Month 00, 0000 (GMT +00)</span></div>
      <button class="mo-footer__totop" type="button" data-to-top data-hover-highlight="link"><span data-hover-heading>Back to top <span aria-hidden="true">↑</span></span></button>
      <p class="mo-footer__copy">©<span data-footer-year>2026</span> Studio name</p>
    </div>
  </div>
  <div class="mo-footer__canvas" data-footer-canvas-bottom data-cursor-hover data-cursor-text="Hold it down and it gets messy">
    <div class="mo-footer__canvas-item" data-canvas-container><canvas data-canvas aria-hidden="true"></canvas></div>
    <div class="mo-footer__canvas-content t-main">
      <span data-canvas-content="left">${logo()}</span>
      <span data-canvas-content="right">”Your studio’s one-line pledge goes here.”</span>
    </div>
  </div>
</div>`;

  const ABOUT = `
<button class="mo-about__veil" type="button" data-close-modal aria-label="Close About"></button>
<div class="mo-about__panel" data-lenis-prevent role="dialog" aria-label="About the studio">
  <div class="mo-about__close"><button type="button" class="mo-btn is-inverse" data-close-modal="true"><span class="mo-btn__text-wrap"><span class="mo-btn__text">Close</span></span><span class="mo-btn__aside"><span class="mo-btn__aside-bg"></span><span class="mo-btn__hint">esc</span><span class="mo-btn__hint is-entering">esc</span></span></button></div>
  <div class="mo-about__contain">
    <div class="mo-about__top"><div class="mo-eyebrow"><span class="mo-eyebrow__marker"></span><p class="mo-eyebrow__text">About the studio</p></div></div>
    <p class="mo-about__p t-h5" data-split="heading" data-split-reveal="lines">Hello, this is where the CEO’s first greeting goes, with about three lines on why this studio was started. Describe the moment a good company could not show its true self.<br><br>Your two lines here on what was explored over the years since and how many people it reached.<br><br>Your last two lines on what we promise when working together go here.</p>
    <div class="mo-about__cover">
      <div class="mo-about__deco t-mono">
        <svg viewBox="0 0 24 16" fill="currentColor"><circle cx="3" cy="3" r="1.6"/><circle cx="3" cy="8" r="1.6"/><circle cx="9" cy="3" r="1.6"/><circle cx="15" cy="13" r="1.6"/><circle cx="21" cy="8" r="1.6"/><circle cx="21" cy="3" r="1.6"/></svg>
        <span>Est. 0000</span><span>Bases in two cities</span>
      </div>
      <div class="mo-about__video">
        <div class="mo-ph wf-img wf-video mo-vid" data-label="Vertical video of representative work · low indoor light · 2:3 looping"></div>
        <div class="mo-about__shade"></div>
        <div class="mo-about__word t-h2" data-label="One floating English word">Listen</div><div class="mo-about__word t-h2 is-1">Make</div><div class="mo-about__word t-h2 is-2">Dig in</div><div class="mo-about__word t-h2 is-3">Spark</div>
      </div>
    </div>
    <div class="mo-about__row"><div class="mo-about__label"><span class="mo-about__dot"></span><h2 class="t-h5">Clients</h2></div><div class="mo-about__list t-h5" data-label="List of client names in English">${["Client Name 01", "Client Name 02", "Client Name 03", "Client Name 04", "Client Name 05", "Client Name 06", "Client Name 07", "Client Name 08", "Client Name 09", "Client Name 10"].map((t) => `<span>${t}</span>`).join("")}</div></div>
    <div class="mo-about__row"><div class="mo-about__label"><span class="mo-about__dot"></span><h2 class="t-h5">Awards</h2></div><div class="mo-about__list t-h5" data-label="Award English name list · times received">${["Award Name One (x0)", "Award Name Two (x0)", "Award Name Three (x0)", "A Longer Award Name (x0)", "Award Name Five (x0)", "The Longest Award Name Runs Over Two Lines (x0)"].map((t) => `<span>${t}</span>`).join("")}</div></div>
    <div class="mo-about__row"><div class="mo-about__label"><span class="mo-about__dot"></span><h2 class="t-h5">Principles</h2></div><div class="mo-about__values" data-label="Principle name in English · Description below in Korean">${["First principle in a line", "Second principle", "Third principle here", "Fourth principle name"].map((t) => `<div><h3 class="t-h5">${t}</h3><p class="t-small">Explain what this principle means in two or three lines. Say what is asked first when deciding.</p></div>`).join("")}</div></div>
  </div>
</div>`;

  // Things kept as just one set outside the page — cursor, transition curtain, particles, about drawer, phone menu
  const body = document.body;
  const shell = (cls, html, tag = "div") => { const el = document.createElement(tag); el.className = cls; el.innerHTML = html; body.prepend(el); return el; };
  const grain = shell("mo-grain", ""); grain.setAttribute("aria-hidden", "true");
  const trans = shell("mo-transition", "");
  const cursor = shell("mo-cursor", '<div class="mo-cursor__bubble"><span class="mo-cursor__text" data-cursor-text-target>Watch video ↗</span></div>');
  cursor.setAttribute("data-cursor", "");
  const about = shell("mo-about", ABOUT);
  about.dataset.slot = "about-drawer";
  const menu = shell("mo-menu", `<div class="mo-menu__contain">${NAVLIST([["About", "about.html", ABOUT_LINK], ["Work", "work.html"], ["Process", "index.html#process"], ["Services", "index.html#services"], ["Contact", "contact.html"]])}</div><button class="mo-menu__veil" type="button" aria-label="Close Menu"></button>`);
  menu.dataset.slot = "mobile-menu";
  body.dataset.navigationStatus ||= "is-closed";
  body.dataset.aboutStatus ||= "is-closed";

  // ── Lenis (original 1.3.27, duration .5) ──
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 0.5 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  MO.lenis = lenis;
  const scrollToEl = (target, duration) => (lenis ? lenis.scrollTo(target, { duration, offset: target === 0 ? 0 : 20 }) : (target === 0 ? scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }) : target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })));

  // ── Shared in-page utilities ──
  const mountShell = (root) => {
    const head = root.querySelector('[data-slot="header"]');
    if (head && !head.firstElementChild) { head.classList.add("mo-nav"); head.setAttribute("data-theme-nav", "light"); head.setAttribute("data-navigation-status", body.dataset.navigationStatus); head.innerHTML = NAV; }
    const foot = root.querySelector('[data-slot="footer"]');
    if (foot && !foot.firstElementChild) foot.innerHTML = FOOTER;
  };

  // Reads data-theme-section on each section to make the header light or dark (original: on every scroll, the section straddling the top of the screen)
  const navTheme = (root) => {
    const head = root.querySelector(".mo-nav");
    if (!head) return;
    const run = () => {
      for (const s of root.querySelectorAll("[data-theme-section]")) {
        const r = s.getBoundingClientRect();
        if (r.top <= 0 && r.bottom >= 0) { const t = s.getAttribute("data-theme-section"); if (head.getAttribute("data-theme-nav") !== t) head.setAttribute("data-theme-nav", t); break; }
      }
    };
    run();
    addEventListener("scroll", run, { passive: true });
    MO.onClean(() => removeEventListener("scroll", run));
  };

  // Sound button — the original plays press and hover sounds with Howler. Here only the icon’s line drawing (no sound files)
  let soundOn = false;
  const soundIcon = (root, animate) => root.querySelectorAll(".mo-sound").forEach((b) => {
    const curves = [...b.querySelectorAll(".mo-path-curve")], crosses = [...b.querySelectorAll(".mo-path-cross")];
    const show = soundOn ? curves : crosses, hide = soundOn ? crosses : curves;
    [...curves, ...crosses].forEach((p) => gsap.set(p, { strokeDasharray: p.getTotalLength() + 1 }));
    const off = { strokeDashoffset: (i, p) => p.getTotalLength() + 1, opacity: 0, filter: "blur(1px)" }, on = { strokeDashoffset: 0, opacity: 1, filter: "blur(0px)" };
    b.setAttribute("aria-pressed", String(soundOn)); b.setAttribute("aria-label", soundOn ? "Sound Off" : "Sound On");
    if (!animate || reduced) { gsap.set(hide, off); gsap.set(show, on); return; }
    gsap.timeline().to(hide, { ...off, duration: 0.2, ease: "ease-secondary", stagger: D.stagger }, 0).to(show, { ...on, duration: D.fast, ease: "ease-secondary", stagger: D.stagger }, 0);
  });

  // The original also turns sound on the first time a non-sound button or link is pressed (unless the user turned it off) — the icon stroke is redrawn then
  let soundPref = null;
  try { soundPref = localStorage.getItem("mo-sound"); } catch {}
  document.addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    const t = e.target.closest?.(".mo-sound, button, a, [data-btn-default]");
    if (!t || t.closest("[inert], [aria-disabled='true']") || t.matches(":disabled") || t.closest(".wf-ui")) return;
    const root = document.querySelector('[data-barba="container"]') || document;
    if (t.matches(".mo-sound")) { e.preventDefault(); soundOn = !soundOn; soundPref = String(soundOn); try { localStorage.setItem("mo-sound", soundPref); } catch {} soundIcon(root, true); return; }
    if (!soundOn && soundPref !== "false") { soundOn = true; soundIcon(root, true); }
  }, true);

  // ── Phone menu ──
  const menuContain = menu.querySelector(".mo-menu__contain"), menuVeil = menu.querySelector(".mo-menu__veil");
  let menuTl = null;
  gsap.set(menuContain, { yPercent: -100, autoAlpha: 1 });
  gsap.set(menuVeil, { autoAlpha: 0, pointerEvents: "none" });
  const setNavStatus = (s) => { body.dataset.navigationStatus = s; document.querySelectorAll(".mo-nav[data-navigation-status]").forEach((h) => h.setAttribute("data-navigation-status", s)); };
  const menuClose = () => {
    menuTl?.kill(); body.removeAttribute("data-lenis-prevent"); body.classList.remove("overflow-hidden"); lenis?.start();
    menu.style.pointerEvents = "none";
    menuTl = gsap.timeline({ defaults: { ease: "ease-transition" }, onComplete: () => (menuVeil.style.pointerEvents = "none") })
      .to(menuContain, { yPercent: -100, duration: D.fast }).to(menuVeil, { autoAlpha: 0, duration: D.fast }, "<");
  };
  const menuOpen = () => {
    menuTl?.kill(); body.setAttribute("data-lenis-prevent", "true"); body.classList.add("overflow-hidden"); lenis?.stop();
    menu.style.pointerEvents = "auto";
    menuTl = gsap.timeline({ defaults: { ease: "ease-transition" }, onStart: () => (menuVeil.style.pointerEvents = "auto") })
      .to(menuContain, { yPercent: 0, duration: D.slow }).to(menuVeil, { autoAlpha: 1, duration: D.normal }, "<")
      .from(menuContain.querySelectorAll(".mo-navlist__li"), { yPercent: 20, autoAlpha: 0, duration: D.normal, stagger: { each: 0.05, from: "start" } }, "<0.15");
  };
  const menuToggle = () => { const open = body.dataset.navigationStatus === "is-open"; setNavStatus(open ? "is-closed" : "is-open"); open ? menuClose() : menuOpen(); };
  const menuShut = () => { if (body.dataset.navigationStatus === "is-open") { setNavStatus("is-closed"); menuClose(); } };
  menuVeil.addEventListener("click", menuShut);

  // ── About drawer ── opening changes the URL to about.html, the drawer enters in 1.25s and pushes the page behind it by -5%
  const panel = about.querySelector(".mo-about__panel"), veil = about.querySelector(".mo-about__veil");
  const aboutHead = panel.querySelector('[data-split="heading"]');
  const aboutShade = panel.querySelector(".mo-about__shade"), aboutVid = panel.querySelector(".mo-about__video .mo-ph");
  let aboutTl = null, aboutSplit = null, aboutFrom = null;
  // A closed drawer is hidden off-screen and inert — keyboard focus and presses can’t get in
  gsap.set(panel, { xPercent: 100, autoAlpha: 0 });
  about.inert = true;
  gsap.set(aboutShade, { opacity: 1 });
  gsap.set(aboutVid, { scale: 1.05 });
  const pageKids = () => [...(document.querySelector('[data-barba="container"]')?.children || [])];
  const aboutIsOpen = () => body.dataset.aboutStatus === "is-open";
  const aboutAnimOpen = (instant) => {
    aboutTl?.kill(); body.classList.add("overflow-hidden"); lenis?.stop();
    veil.style.pointerEvents = "auto";
    about.inert = false;
    gsap.set(panel, { autoAlpha: 1 });
    if (!aboutSplit && aboutHead) aboutSplit = SplitText.create(aboutHead, { type: "lines", mask: "lines", linesClass: "line" });
    if (aboutSplit) gsap.set(aboutSplit.lines, { yPercent: 150, opacity: 0 });
    aboutTl = gsap.timeline()
      .to(panel, { xPercent: 0, duration: D.slower, ease: "ease-transition" })
      .to(veil, { autoAlpha: 1, duration: D.slower, ease: "ease-transition" }, "<")
      .to(pageKids(), { xPercent: -5, duration: D.slower, ease: "ease-transition" }, "<")
      .add(aboutSplit ? gsap.to(aboutSplit.lines, { yPercent: 0, opacity: 1, duration: D.slower, stagger: 0.03, ease: "ease-transition", immediateRender: false }) : null, "-=1.2")
      .to(aboutShade, { opacity: 0, duration: D.slow, ease: "ease-transition" }, "-=1.05")
      .to(aboutVid, { scale: 1, duration: D.slow, ease: "ease-transition" }, "<");
    if (instant || reduced) aboutTl.progress(1);
    aboutVid.classList.add("is-playing");
  };
  const aboutAnimClose = () => {
    aboutTl?.kill(); body.classList.remove("overflow-hidden"); lenis?.start();
    veil.style.pointerEvents = "none";
    aboutTl = gsap.timeline({ onComplete: () => { panel.scrollTop = 0; gsap.set(panel, { autoAlpha: 0 }); about.inert = true; } })
      .to(panel, { xPercent: 100, duration: D.normal, ease: "ease-transition" })
      .to(veil, { autoAlpha: 0, duration: D.normal, ease: "ease-transition" }, "<")
      .to(pageKids(), { xPercent: 0, duration: D.normal, ease: "ease-transition" }, "<")
      .set(aboutShade, { opacity: 1 }).set(aboutVid, { scale: 1.05 }, "<")
      .call(() => aboutVid.classList.remove("is-playing"));
    if (reduced) aboutTl.progress(1);
  };
  MO.aboutOpen = (instant) => {
    if (aboutIsOpen()) return;
    body.dataset.aboutStatus = "is-open";
    if (document.body.dataset.page !== "about" && location.protocol !== "file:") {
      aboutFrom = { href: location.href, title: document.title };
      history.pushState({ ...history.state, about: aboutFrom }, "", "about.html");
    }
    document.title = "About · Studio";
    aboutAnimOpen(instant);
  };
  MO.aboutClose = () => {
    if (!aboutIsOpen()) return;
    body.dataset.aboutStatus = "is-closed";
    aboutAnimClose();
    // If about.html is opened directly, the page behind is only the Hero, so closing goes to home
    if (document.body.dataset.page === "about") { setTimeout(() => MO.go("index.html"), D.normal * 1000); return; }
    if (aboutFrom) { document.title = aboutFrom.title; if (history.state?.about) history.replaceState({ ...history.state, about: null }, "", aboutFrom.href); aboutFrom = null; }
  };
  addEventListener("popstate", () => { if (aboutIsOpen()) { body.dataset.aboutStatus = "is-closed"; aboutAnimClose(); } });
  document.addEventListener("click", (e) => {
    const close = e.target.closest?.("[data-close-modal]");
    if (close) { e.preventDefault(); MO.aboutClose(); return; }
    const open = e.target.closest?.("[data-open-modal]");
    if (open && e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) { e.preventDefault(); e.stopPropagation(); menuShut(); MO.aboutOpen(); }
  }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { menuShut(); MO.aboutClose(); } });

  // ── Cursor bubble ── follows the mouse with .4s power3.out and shows text only over [data-cursor-hover] ──
  if (fine) {
    const tx = cursor.querySelector("[data-cursor-text-target]");
    const qx = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3.out" }), qy = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3.out" });
    let mx = 0, my = 0, moved = false;
    const check = () => {
      const hit = document.elementFromPoint(mx, my)?.closest("[data-cursor-hover]");
      const edge = cursor.getBoundingClientRect().right >= innerWidth;
      cursor.setAttribute("data-cursor", hit ? (edge ? "active-edge" : "active") : "");
      if (hit) { const t = hit.getAttribute("data-cursor-text"); if (t) tx.textContent = t; }
    };
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; moved = true; qx(mx); qy(my); requestAnimationFrame(check); });
    addEventListener("scroll", () => moved && requestAnimationFrame(check), { passive: true });
    addEventListener("mousedown", (e) => e.button === 0 && gsap.to(cursor, { scale: 0.9, duration: 0.4, ease: "power2.out" }));
    addEventListener("mouseup", (e) => e.button === 0 && gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" }));
  }

  // ── Per-page hooks (re-attached on every page turn) ──
  const splitStore = new WeakMap();
  const splitOf = (el) => {
    if (splitStore.has(el)) return splitStore.get(el);
    const type = el.dataset.splitReveal || "lines";
    const types = type === "lines" ? ["lines"] : type === "words" ? ["lines", "words"] : ["lines", "words", "chars"];
    const inst = SplitText.create(el, { type: types.join(", "), autoSplit: true, mask: "lines", linesClass: "line", wordsClass: "word", charsClass: "letter" });
    gsap.set(el, { autoAlpha: 1 });
    const out = { inst, type };
    splitStore.set(el, out);
    return out;
  };
  const REVEAL = { lines: { duration: D.slow, stagger: 0.03 }, words: { duration: 0.6, stagger: 0.06 }, chars: { duration: 0.4, stagger: 0.01 } };
  const splitHeadings = (root) => root.querySelectorAll('[data-split="heading"]').forEach((el) => {
    if (panel.contains(el)) return;
    const { inst, type } = splitOf(el);
    const parts = inst[type];
    gsap.set(parts, { yPercent: 150, opacity: 0 });
    gsap.to(parts, { yPercent: 0, opacity: 1, ...REVEAL[type], ease: "ease-transition", immediateRender: false, scrollTrigger: { trigger: el, start: "clamp(top 80%)", once: true } });
  });
  MO.splitText = (root) => root.querySelectorAll("[data-split-text]").forEach((el) => {
    SplitText.create(el, { type: "lines", linesClass: "lines-split", mask: "lines", autoSplit: true, deepSlice: true, onSplit: (s) => { el.textSplit = s; } });
  });
  // Eyebrow label: words unfold from -40% · skewX 15, and the dot grows at .4
  const eyebrows = (root) => root.querySelectorAll("[data-eyebrow]:not([data-eyebrow-intro])").forEach((el) => {
    const tl = MO.eyebrowTl(el);
    if (tl) ScrollTrigger.create({ trigger: el, start: "clamp(top 85%)", once: true, onEnter: () => tl.play() });
  });
  MO.eyebrowTl = (el) => {
    const text = el.querySelector(".mo-eyebrow__text"), marker = el.querySelector(".mo-eyebrow__marker");
    if (!text) return null;
    const words = (el._split ||= SplitText.create(text, { type: "words", wordsClass: "eyebrow-word", autoSplit: true })).words;
    const tl = gsap.timeline({ paused: true });
    tl.set(words, { xPercent: -40, opacity: 0, skewX: 15 }).set(text, { xPercent: -10 });
    if (marker) tl.set(marker, { scale: 0.4, opacity: 0, transformOrigin: "center center" });
    tl.set(el, { autoAlpha: 1 })
      .to(words, { xPercent: 0, opacity: 1, skewX: 0, duration: D.normal, stagger: 0.05, ease: "ease-transition" }, 0)
      .to(text, { xPercent: 0, duration: D.fast, ease: "ease-transition" }, "-=0.15");
    if (marker) tl.to(marker, { scale: 1, opacity: 1, duration: D.normal, ease: "ease-transition" }, "<");
    if (reduced) tl.progress(1);
    return tl;
  };
  // Big paragraph: per line, letters go from .2 opacity to solid (top 100% → center 40%, scrub)
  MO.highlight = (root) => root.querySelectorAll("[data-highlight-text]").forEach((el) => {
    const start = el.dataset.highlightScrollStart || "top 100%", end = el.dataset.highlightScrollEnd || "center 40%";
    const fade = parseFloat(el.dataset.highlightFade) || 0.2, stagger = parseFloat(el.dataset.highlightStagger) || 0.1, lineStagger = parseFloat(el.dataset.highlightLineStagger) || 0.4;
    SplitText.create(el, { type: "lines, words, chars", autoSplit: true, onSplit(s) {
      return gsap.context(() => {
        const rows = s.lines.map((l) => s.chars.filter((c) => l.contains(c)));
        const tl = gsap.timeline({ scrollTrigger: { scrub: true, trigger: el, start, end } });
        rows.forEach((r, i) => tl.from(r, { autoAlpha: fade, stagger, ease: "linear" }, i * lineStagger));
      });
    } });
  });

  // Review slider — when the 16-second bar fills, go to the next, the line exits at -150% and rises in from 150%
  MO.slider = (wrap) => {
    const items = [...wrap.querySelectorAll("[data-slider-item]")].map((root) => ({ root, headshot: root.querySelector("[data-slider-headshot]"), message: root.querySelector("[data-slider-message]"), details: [...root.querySelectorAll("[data-slider-details]")], get split() { return this.message?.textSplit ?? null; } }));
    const n = items.length;
    if (!n) return;
    const next = wrap.querySelector("[data-slider-next]"), prev = wrap.querySelector("[data-slider-prev]"), count = wrap.querySelector("[data-counter-value]"), dyn = wrap.querySelector("[data-dynamic-value]");
    const barA = wrap.querySelector("[data-progress-bar-start]"), barB = wrap.querySelector("[data-progress-bar-end]");
    let cur = 0, prog = null, swap = null, front = barA, back = barB;
    if (count) count.textContent = n;
    const num = () => dyn && (dyn.textContent = cur + 1);
    const hide = (it) => { gsap.set(it.root, { opacity: 0, yPercent: 150 }); it.headshot && gsap.set(it.headshot, { opacity: 0, yPercent: 100 }); it.details.length && gsap.set(it.details, { opacity: 0 }); };
    const kill = (it) => { gsap.killTweensOf(it.root); gsap.killTweensOf(it.headshot); it.details.length && gsap.killTweensOf(it.details); };
    const out = (it) => {
      if (!it.split) return null;
      const t = D.fast, tl = gsap.timeline();
      tl.to(it.split.lines, { yPercent: -150, opacity: 0, stagger: 0.03, ease: "ease-primary", duration: t });
      it.headshot && tl.to(it.headshot, { yPercent: -50, opacity: 0, ease: "ease-primary", duration: t }, `-=${t * 1.2}`);
      it.details.length && tl.to(it.details, { yPercent: -150, opacity: 0, ease: "ease-primary", duration: t, stagger: 0.03 }, "<");
      return tl;
    };
    const inn = (it) => {
      if (!it.split) return null;
      const tl = gsap.timeline();
      tl.set(it.root, { opacity: 1, yPercent: 0 }).fromTo(it.split.lines, { yPercent: 150, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.03, ease: "ease-transition", duration: D.slow });
      it.headshot && tl.fromTo(it.headshot, { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "ease-transition", duration: D.slow }, "-=1");
      it.details.length && tl.fromTo(it.details, { yPercent: 150, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "ease-transition", duration: D.slow, stagger: 0.03 }, "<");
      return tl;
    };
    const go = (to) => {
      swap?.kill();
      const a = items[cur], b = items[to];
      cur = to; num();
      const o = out(a);
      if (!o) return;
      const at = o.duration() * 0.6;
      swap = gsap.timeline({ onComplete: () => (swap = null) });
      swap.add(o, 0).call(() => { kill(a); hide(a); }, null, at).add(inn(b), at);
    };
    const run = ({ delay, onSwap }) => {
      const old = front, fresh = back;
      front = fresh; back = old;
      gsap.set(fresh, { xPercent: -100 });
      prog = gsap.timeline({ onComplete: () => auto() });
      onSwap && prog.add(onSwap, 0);
      prog.to(old, { xPercent: 100, duration: 0.5, ease: "power2.inOut" }, 0).to(fresh, { xPercent: 0, duration: 16, ease: "none" }, delay);
    };
    const first = () => { prog?.kill(); prog = gsap.timeline({ onComplete: () => auto() }); prog.to(front, { xPercent: 0, duration: 16, ease: "none" }); };
    const auto = () => { prog?.kill(); run({ delay: 0.4, onSwap: () => go((cur + 1) % n) }); };
    const pause = () => prog?.pause();
    const stop = () => { prog?.kill(); prog = null; swap?.kill(); swap = null; };
    const step = (dir) => { stop(); run({ delay: 0.2, onSwap: () => go(dir === "next" ? (cur + 1) % n : (cur - 1 + n) % n) }); };
    const onN = () => step("next"), onP = () => step("prev");
    next?.addEventListener("click", onN); prev?.addEventListener("click", onP);
    items.forEach(hide);
    gsap.set([barA, barB], { xPercent: -100 });
    const firstIn = inn(items[cur]); if (reduced) firstIn?.progress(1);
    num();
    if (reduced) return;
    first();
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onEnter: () => (prog ? prog.resume() : first()), onEnterBack: () => (prog ? prog.resume() : first()), onLeave: pause, onLeaveBack: pause });
    MO.onClean(() => { stop(); next?.removeEventListener("click", onN); prev?.removeEventListener("click", onP); });
  };

  // Photo panel parallax — moves [data-translate-hero] inside [data-scroll-container] from -n to n px (wide screens only)
  const parallax = (root) => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll("[data-scroll-container]").forEach((c) => {
        const kids = c.querySelectorAll('[data-translate-hero="true"]');
        if (!kids.length) return;
        const n = parseFloat(c.dataset.targetTranslate) || 800;
        kids.forEach((k) => gsap.fromTo(k, { y: -n }, { y: n, ease: "none", scrollTrigger: { trigger: c, start: c.dataset.start || "top top", end: c.dataset.end || "bottom top", scrub: true, invalidateOnRefresh: true, immediateRender: false } }));
      });
    });
    MO.onClean(() => mm.revert());
  };

  // Video slot — plays only while visible (original data-video="playpause")
  const videos = (root) => root.querySelectorAll('[data-video="playpause"]').forEach((v) => {
    const st = ScrollTrigger.create({ trigger: v, start: "0% 100%", end: "100% 0%", onToggle: (s) => v.classList.toggle("is-playing", s.isActive) });
    MO.onClean(() => st.kill());
  });

  // Row hover: background brightens (.3s in, .65s out)
  const highlightHover = (root) => {
    if (!fine) return;
    root.querySelectorAll("[data-hover-highlight]").forEach((el) => {
      const on = () => gsap.to(el, { backgroundColor: css("--kf-surface"), duration: D.fast, ease: "ease-transition", overwrite: true });
      const off = () => { const keep = el.dataset.hoverHighlight === "accordion" && el.closest("[data-accordion-status]")?.getAttribute("data-accordion-status") === "active"; gsap.to(el, { backgroundColor: keep ? css("--kf-surface") : "transparent", duration: D.normal, ease: "ease-transition", overwrite: true }); };
      el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off);
    });
  };
  const accordions = (root) => root.querySelectorAll("[data-accordion-css-init]").forEach((wrap) => {
    const solo = wrap.getAttribute("data-accordion-close-siblings") === "true";
    wrap.addEventListener("click", (e) => {
      const t = e.target.closest("[data-accordion-toggle]"); if (!t) return;
      const item = t.closest("[data-accordion-status]"); if (!item) return;
      const was = item.getAttribute("data-accordion-status") === "active";
      item.setAttribute("data-accordion-status", was ? "not-active" : "active");
      t.setAttribute("aria-expanded", String(!was));
      if (solo && !was) wrap.querySelectorAll('[data-accordion-status="active"]').forEach((o) => { if (o !== item) { o.setAttribute("data-accordion-status", "not-active"); o.querySelector("[data-accordion-toggle]")?.setAttribute("aria-expanded", "false"); } });
    });
  });

  // Final call: when the section bottom passes the screen center, the edges are clipped by 1.25% and the arrow row shifts 50%
  const cta = (root) => {
    const w = root.querySelector(".mo-cta__clip");
    if (!w) return;
    gsap.timeline({ scrollTrigger: { trigger: w, start: "bottom center", end: "90% top", scrub: true } }).to(w, { clipPath: "inset(0% 1.25% 1.25% 1.25% round 0.35rem)", ease: "none" });
    gsap.timeline({ scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true } }).to(w.querySelector(".mo-cta__inner"), { xPercent: 50, ease: "none" });
  };

  // ── Footer ── clock · back to top · pull-down · hide header · halftone
  const footer = (root) => {
    const f = root.querySelector("[data-footer-parallax]");
    if (!f) return;
    const zone = "Asia/Ho_Chi_Minh";
    const yr = f.querySelector("[data-footer-year]"); if (yr) yr.textContent = new Date().getFullYear();
    const tick = () => {
      const now = new Date();
      const d = f.querySelector("[data-footer-date]"), t = f.querySelector("[data-footer-time]");
      if (d) d.textContent = `${now.toLocaleDateString("ko-KR", { weekday: "long", month: "short", day: "numeric", year: "numeric", timeZone: zone })} (GMT +07)`;
      if (t) {
        const s = now.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: zone });
        const ap = s.match(/AM|PM/)?.[0] ?? "", [h, m, sec] = s.replace(/[\s ]*(AM|PM)/, "").trim().split(":");
        t.innerHTML = `${h}<span class="blinking-colon">:</span>${m}<span class="blinking-colon">:</span>${sec}<span style="margin-left:.2em">${ap}</span>`;
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    MO.onClean(() => clearInterval(iv));
    f.querySelector("[data-to-top]")?.addEventListener("click", () => scrollToEl(0, 1));
    const head = root.querySelector(".mo-nav");
    if (head) ScrollTrigger.create({ trigger: f, start: "top bottom", onEnter: () => gsap.to(head, { opacity: 0, pointerEvents: "none", duration: 0.4, ease: "power2.out" }), onLeaveBack: () => gsap.to(head, { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" }) });
    const inner = f.querySelector("[data-footer-parallax-inner]");
    gsap.timeline({ scrollTrigger: { trigger: f, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true } }).from(inner, { yPercent: -15, ease: "linear" });
    const box = f.querySelector("[data-canvas-container]"), bottom = f.querySelector("[data-footer-canvas-bottom]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: bottom, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true } });
    tl.from(box, { yPercent: -80, ease: "linear" });
    f.querySelectorAll("[data-canvas-content]").forEach((c) => tl.fromTo(c, { xPercent: c.dataset.canvasContent === "left" ? 100 : -100, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "linear" }, "<"));
  };

  // Halftone panel — stamps the flowing pattern as dots on a 4px grid and makes neighboring dots stick together. Our shader (not original code): draws a 45° staggered grid in one pass.
  // Values were measured from the original — amplitude .8·flow .0045/frame·on press amplitude ×2, flow ×1.5·catch-up .03/frame·reveal 2s (delayed .3s, ease-secondary)·dot 4px·stickiness .58·contrast 1.5·invert
  MO.halftone = (box, canvas, opt = {}) => {
    if (!window.THREE || !box || !canvas) return null;
    const P = { amplitude: 0.8, timeSpeed: 0.0045, holdAmp: 2, holdSpeed: 1.5, lerp: 0.03, reveal: 2, revealDelay: 0.3, cell: 4, goo: 0.58, contrast: 1.5, bias: 0, invert: 1, maxDpr: 1, frameMs: 1000 / 60, ...opt };
    const col = (v) => new THREE.Color(css(v) || 0);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const U = {
      uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uAmp: { value: P.amplitude }, uReveal: { value: 0 },
      uCell: { value: P.cell }, uGoo: { value: P.goo }, uGain: { value: P.contrast }, uBias: { value: P.bias }, uInvert: { value: P.invert },
      uPaper: { value: col("--kf-bg") }, uInk: { value: col("--kf-ink") },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: U,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        precision highp float;
        uniform vec2 uRes; uniform float uT, uAmp, uReveal, uCell, uGoo, uGain, uBias, uInvert; uniform vec3 uPaper, uInk;
        varying vec2 vUv;
        // Warps the coordinates with three sine waves of different sizes, then builds bands that split into bright and dark farther from the center
        float flow(vec2 q) {
          vec2 p = q * 2.0 - 1.0;
          float a = uAmp * uReveal;
          p += a * vec2(0.42 * sin(p.y * 0.9 + uT + 1.3), 0.36 * sin(p.x * 1.1 - uT * 0.8 + 0.2));
          p += a * vec2(0.18 * sin(p.y * 4.9 + uT * 1.3 + 2.6), 0.22 * sin(p.x * 4.1 - uT + 0.9));
          p += a * vec2(1.5 * sin(p.y * 0.42 + uT * 0.7 + 0.5), 1.7 * sin(p.x * 0.36 - uT * 0.6 + 2.2));
          float d = length(p);
          return clamp(0.5 + 0.55 * cos(d * 2.1 + 0.4) * cos(d * 0.7), 0.0, 1.0);
        }
        float radiusFor(float v, float s) {
          float k = clamp((v - 0.5 + uBias) * uGain + 0.5, 0.0, 1.0);
          if (uInvert > 0.5) k = 1.0 - k;
          return k * s * 0.6 + s * 0.05;
        }
        float blend(float a, float b, float k) {
          if (k < 0.001) return min(a, b);
          float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
          return mix(b, a, h) - k * h * (1.0 - h);
        }
        void main() {
          vec2 px = vUv * uRes;
          float s = uCell;
          // Grid rotated 45° — dots sit only on the checkerboard spots
          vec2 g = vec2(px.x + px.y, px.y - px.x) / (2.0 * s);
          vec2 base = floor(g);
          float dmin = 1e5;
          for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
              vec2 c = base + vec2(float(i), float(j)) + 0.5;
              vec2 cp = vec2(c.x - c.y, c.x + c.y) * s;
              float r = radiusFor(flow(cp / uRes), s * 1.41421356 * 0.75);
              dmin = blend(dmin, length(px - cp) - r, uGoo * 1.5 * s);
            }
          }
          float aa = max(fwidth(dmin), 0.0001);
          float dot = 1.0 - smoothstep(-aa, aa, dmin);
          gl_FragColor = vec4(mix(uPaper, uInk, dot) * uReveal, 1.0);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const st = { hold: false, amp: P.amplitude, speed: P.timeSpeed }, rev = { v: 0 };
    const sync = () => (U.uReveal.value = rev.v);
    const down = () => (st.hold = true), up = () => (st.hold = false);
    canvas.addEventListener("mousedown", down); addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: true }); addEventListener("touchend", up);
    const size = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio, P.maxDpr);
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      U.uRes.value.set(w * dpr, h * dpr);
    };
    const ro = new ResizeObserver(size); ro.observe(box);
    const frame = (time, dt) => {
      const n = Math.min(Math.max(dt, 1) / P.frameMs, 3);
      const ta = st.hold ? P.amplitude * P.holdAmp : P.amplitude, ts = st.hold ? P.timeSpeed * P.holdSpeed : P.timeSpeed;
      const k = 1 - (1 - P.lerp) ** n;
      st.amp += (ta - st.amp) * k; st.speed += (ts - st.speed) * k;
      U.uAmp.value = st.amp; U.uT.value += st.speed * n;
      renderer.render(scene, cam);
    };
    let on = false, seen = true;
    const start = () => { if (!on) { gsap.ticker.add(frame); on = true; } }, stop = () => { if (on) { gsap.ticker.remove(frame); on = false; } };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? start() : stop(); }); io.observe(canvas);
    const vis = () => (document.hidden ? stop() : seen && start()); document.addEventListener("visibilitychange", vis);
    size(); renderer.render(scene, cam); canvas.style.opacity = "1"; start();
    if (reduced) { rev.v = 1; sync(); } else gsap.to(rev, { v: 1, duration: P.reveal, delay: P.revealDelay, ease: "ease-secondary", onUpdate: sync });
    const destroy = () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); removeEventListener("mouseup", up); removeEventListener("touchend", up); canvas.removeEventListener("mousedown", down); canvas.removeEventListener("touchstart", down); gsap.killTweensOf(rev); mat.dispose(); renderer.dispose(); renderer.forceContextLoss(); };
    MO.onClean(destroy);
    return { destroy, params: P };
  };

  // ── Enter ──
  // Default entrance (original Jf): [data-animate] rises from 24px below over .95s, and in the header the logo, menu and button rise in sequence
  MO.navIntro = (tl, root, at, stagger = 0.0625) => {
    const head = root.querySelector(".mo-nav");
    if (!head) return tl;
    return tl.from(root.querySelector(".mo-nav__home"), { yPercent: 100, duration: D.slow, rotate: 0.001 }, at)
      .to(head, { autoAlpha: 1, duration: 0 }, "<")
      .from(root.querySelectorAll(".mo-nav__li"), { yPercent: 100, duration: D.slow, rotate: 0.001, stagger }, "<")
      .from(root.querySelectorAll(".mo-nav__cta > *"), { yPercent: 100, rotate: 0.001, duration: D.slow, stagger }, "<");
  };
  const defaultIntro = (root) => {
    const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });
    const anim = root.querySelectorAll("[data-animate]");
    if (anim.length) tl.fromTo(anim, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: D.slow, stagger: 0.06, clearProps: "transform" });
    return MO.navIntro(tl, root, "<0.25");
  };

  let current = null;
  const mount = (root) => {
    const ns = root.dataset.barbaNamespace;
    const def = MO.pages[ns] || {};
    mountShell(root);
    soundIcon(root, false);

    root.querySelectorAll("[data-menu-btn]").forEach((b) => b.addEventListener("click", menuToggle));
    root.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const url = new URL(a.getAttribute("href"), location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
      const t = document.querySelector(url.hash);
      if (t) { e.preventDefault(); e.stopPropagation(); menuShut(); scrollToEl(t, 1.2); }
    }, true));
    const ctx = gsap.context(() => {
      navTheme(root); MO.splitText(root); splitHeadings(root); eyebrows(root); parallax(root); videos(root);
      highlightHover(root); accordions(root); cta(root); footer(root);
      def.set?.(root);
      const off = def.init?.(root);
      if (typeof off === "function") MO.onClean(off);
    }, root);
    current = { ctx, def, root };
    return def;
  };
  const unmount = () => { if (!current) return; cleanAll(); current.ctx.revert(); current = null; };
  const intro = (def, root) => { const tl = def.intro?.(root) || defaultIntro(root); if (reduced) tl.progress(1); return tl; };
  const halftoneFor = (root) => { const box = root.querySelector("[data-canvas-container]"); MO.halftone(box, box?.querySelector("[data-canvas]")); };

  // ── Transition curtain (original: covers in black and clears with .35s ease-transition) ──
  const cover = () => new Promise((done) => { if (reduced) { gsap.set(trans, { autoAlpha: 1 }); return done(); } gsap.timeline({ onComplete: done }).set(trans, { willChange: "opacity" }).to(trans, { autoAlpha: 1, duration: 0.35, ease: "ease-transition" }).set(trans, { willChange: "auto" }); });
  const uncover = () => (reduced ? gsap.set(trans, { autoAlpha: 0 }) : gsap.to(trans, { autoAlpha: 0, duration: 0.35, ease: "ease-transition" }));
  const toTop = () => { scrollTo(0, 0); lenis?.scrollTo(0, { immediate: true, force: true, lock: true }); };
  const KEY = "mo-trans";
  const local = (href) => { try { const u = new URL(href, location.href); return u.origin === location.origin && /\.html$/.test(u.pathname) ? u : null; } catch { return null; } };
  MO.go = (href) => { cover().then(() => { sessionStorage.setItem(KEY, "1"); location.href = href; }); };

  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    body.dataset.page = doc.body.dataset.page || "";
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => { document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r })); setTimeout(r, 800); })));
    have.forEach((l) => want.includes(l.href) || l.remove());
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
  };

  const plainNav = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.closest(".wf-ui") || a.hasAttribute("data-open-modal")) return;
      const u = local(a.getAttribute("href"));
      if (!u) return;
      if (u.pathname === location.pathname) { if (!u.hash) { e.preventDefault(); scrollToEl(0, 1); } return; }
      e.preventDefault();
      menuShut();
      MO.go(a.getAttribute("href"));
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set(trans, { autoAlpha: 0 }));
  };

  const start = () => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    toTop();
    const first = document.querySelector('[data-barba="container"]');
    const arriving = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (arriving) gsap.set(trans, { autoAlpha: 1 });
    const def = mount(first);
    ScrollTrigger.refresh();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (arriving) uncover();
      intro(def, first);
      halftoneFor(first);
      if (body.dataset.page === "about") MO.aboutOpen();
    }));
    const hash = location.hash && document.querySelector(location.hash);
    if (hash) setTimeout(() => scrollToEl(hash, 0.01), 300);
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plainNav();
    let busy = false;
    barba.init({
      debug: false, timeout: 7000, preventRunning: true,
      prevent: ({ el, event, href }) => {
        if (busy) { event?.preventDefault?.(); return true; }
        if (!el || el.closest(".wf-ui") || el.target === "_blank" || el.hasAttribute("data-open-modal")) return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return true;
        const u = local(href);
        if (!u) return true;
        if (u.pathname === location.pathname) { if (event?.type === "click" && !u.hash) { event.preventDefault(); scrollToEl(0, 1); } return true; }
        return false;
      },
      transitions: [{
        name: "default",
        async leave() { busy = true; menuShut(); if (aboutIsOpen()) { body.dataset.aboutStatus = "is-closed"; aboutAnimClose(); } await cover(); lenis?.stop(); unmount(); },
        afterLeave({ current: c }) { ScrollTrigger.getAll().forEach((t) => t.kill()); c.container.remove(); },
        async beforeEnter({ next }) { await bring(next.html); toTop(); },
        async enter({ next }) {
          try {
            const d = mount(next.container);
            lenis?.resize(); lenis?.start(); ScrollTrigger.refresh();
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            uncover(); intro(d, next.container); halftoneFor(next.container);
            if (body.dataset.page === "about") MO.aboutOpen();
            const u = local(next.url.href); const h = u?.hash && document.querySelector(u.hash); if (h) setTimeout(() => scrollToEl(h, 0.01), 200);
          } finally { busy = false; }
        },
        afterEnter() { ScrollTrigger.refresh(); },
      }],
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  const boot = () => fontsReady.then(start);
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
  let rz = 0;
  new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => { lenis?.resize(); ScrollTrigger.refresh(); }, 150); }).observe(body);
})();
