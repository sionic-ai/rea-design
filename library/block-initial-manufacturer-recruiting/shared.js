// Draws the header, phone menu and footer shared by all pages, and attaches the original common motion (Lenis 1.2s, arc growth, decorative shape parallax, photo shrink, header change).
(() => {
  const ARROW = '<svg viewBox="0 0 18 14" aria-hidden="true"><path d="M11 0.6 17.4 7 11 13.4 9.7 12.1l4.2-4.2H0.6V6.1h13.3L9.7 1.9Z"/></svg>';
  const CHEV = '<svg viewBox="0 0 7 5" aria-hidden="true"><path d="M0 0h7L3.5 5Z"/></svg>';
  const EXT = '<svg viewBox="0 0 18 19" aria-hidden="true"><path d="M5 4.5H1.5v13h13V14M7 1.5h9.5V11M16.5 1.5 8 10"/></svg>';
  const MARK = '<svg viewBox="0 0 102 45" aria-hidden="true"><g class="g-top"><text x="2" y="30" font-size="34" letter-spacing="-1">ABC</text></g><g class="g-bottom"><text x="3" y="43" font-size="8.4" letter-spacing="0.4">COMPANY NAME</text></g></svg>';
  const WORKS = ["Role 01", "Role 02", "Role 03", "Role 04", "Role 05 long name", "Job 06 name", "Role 07", "Role 08"];

  const navWork = WORKS.map((w) => `<li><a href="detail.html">${w}</a></li>`).join("");
  const header = `
  <div class="l-headerLimit">
    <div class="l-headerLogo"><a href="index.html"><span class="l-mark" data-label="Company logo — English initials wordmark and company English name">${MARK}</span><p>Your company name here　<br class="u-sp">Recruiting site</p></a></div>
    <button class="l-headerButton" type="button" aria-label="Menu"><span></span></button>
    <div class="l-headerGnav">
      <ul class="l-navigation">
        <li class="l-navigation__item"><a href="index.html#company">Company About</a></li>
        <li class="l-navigation__item -nest"><div class="l-navigation__item__label"><p>Role Introduction</p>${CHEV}</div><ul class="l-navigationNest">${navWork}</ul></li>
        <li class="l-navigation__item -nest"><div class="l-navigation__item__label"><p>Hiring Info</p>${CHEV}</div><ul class="l-navigationNest"><li><a href="recruit.html">Development and Career</a></li><li><a href="recruit.html#career">Recruitment guidelines and<br>Selection Order</a></li></ul></li>
        <li class="l-navigation__button -s27"><a href="#entry">Newcomer'27<br> Apply</a></li>
        <li class="l-navigation__button -s28"><a href="#entry">Newcomer'28<br> Apply</a></li>
      </ul>
      <div class="l-menu">
        <div class="l-menu__logo"><span class="l-mark">${MARK}</span><p>Your company name here<br>New Grad Hiring</p></div>
        <div class="l-menuWrap">
          <div class="l-menuWrap__item"><div class="l-menuWrap__item__heading"><p class="c-heading-r">Company</p><span>Company About</span></div>
            <ul class="l-menuWrap__link"><li><a href="index.html#company">Company About<span class="c-buttonHover__arrow">${ARROW}</span></a></li></ul></div>
          <div class="l-menuWrap__item"><div class="l-menuWrap__item__heading"><p class="c-heading-r">Work</p><span>Role Introduction</span></div>
            <ul class="l-menuWrap__link -half">${WORKS.map((w) => `<li><a href="detail.html">${w}<span class="c-buttonHover__arrow">${ARROW}</span></a></li>`).join("")}</ul></div>
          <div class="l-menuWrap__item"><div class="l-menuWrap__item__heading"><p class="c-heading-r">Recruit info</p><span>Hiring Info</span></div>
            <ul class="l-menuWrap__link"><li><a href="recruit.html">Development and Career<span class="c-buttonHover__arrow">${ARROW}</span></a></li><li><a href="recruit.html#career">Admission Guide and Selection Steps<span class="c-buttonHover__arrow">${ARROW}</span></a></li></ul></div>
        </div>
      </div>
    </div>
  </div>`;

  const footer = `
  <div class="l-footerLimit">
    <div class="c-titleWrap -short c-fontColor-w"><p class="c-heading-l">Entry</p><p class="c-titleWrap__text">Apply</p></div>
    <div class="l-footerButtons">
      <div class="l-footerButtons__item c-button"><a class="c-buttonHover" href="#entry">Newcomer'27 Apply<span class="c-buttonHover__arrow">${ARROW}</span></a></div>
      <div class="l-footerButtons__item c-button"><a class="c-buttonHover" href="#entry">Newcomer'28 Apply<span class="c-buttonHover__arrow">${ARROW}</span></a></div>
    </div>
    <div class="l-footerMain">
      <div class="l-footerHead">
        <div class="l-footerHead__logo"><p>Your company name careers site here</p><span class="l-mark" data-label="Company logo white">${MARK}</span></div>
        <div class="l-footerHead__link"><a href="#corporate">Company homepage${EXT}</a></div>
      </div>
      <ul class="l-footerMenu">
        <li class="l-footerMenu__item"><p>Company<a href="index.html#company">Company About</a></p></li>
        <li class="l-footerMenu__item"><p>Work<span>Role Introduction</span></p>
          <ul class="l-footerMenu__nest -row">${WORKS.map((w) => `<li class="l-footerMenu__nest__item"><a href="detail.html">${w}</a></li>`).join("")}</ul></li>
        <li class="l-footerMenu__item"><p>Recruit<span>Hiring Info</span></p>
          <ul class="l-footerMenu__nest"><li class="l-footerMenu__nest__item"><a href="recruit.html">Development and Career</a></li><li class="l-footerMenu__nest__item"><a href="recruit.html#career">Admission Guide and Selection Steps</a></li></ul></li>
      </ul>
    </div>
    <div class="l-footerCopyright"><small>Copyright © Company Name All Rights Reserved.</small></div>
    <div class="l-footerItems" data-label="Block initial still graphic and surrounding decorative shapes">
      <div class="l-footerItems__main" data-fx="iso-block-glyph" data-fx-iso-block-glyph="still: true; letter: A"><canvas></canvas></div>
      <div class="l-footerItems__el -items1 c-obj" data-para="60" data-obj="zig"></div>
      <div class="l-footerItems__el -items2 c-obj" data-para="30" data-obj="crescent"></div>
      <div class="l-footerItems__el -items3 c-obj" data-para="70" data-obj="ball"></div>
      <div class="l-footerItems__el -items4 c-obj" data-para="50" data-obj="ring"></div>
      <div class="l-footerItems__el -items5 c-obj" data-para="80" data-obj="pill"></div>
      <div class="l-footerItems__el -items6 c-obj" data-para="90" data-obj="cone"></div>
    </div>
  </div>`;

  // Floating decorative shapes — SVG of the same size and feel in place of the original candy-colored 3D art
  const OBJ = {
    gem: '<svg viewBox="0 0 100 100"><polygon class="o-a" points="50,4 90,28 92,68 56,96 12,80 8,36"/><polygon class="o-a-l" points="50,4 90,28 54,42 8,36"/><polygon class="o-a-d" points="54,42 90,28 92,68 56,96"/><polygon class="o-a-d" points="12,80 56,96 30,66" opacity=".6"/></svg>',
    zig: '<svg viewBox="0 0 100 100"><path class="o-sb" d="M10 74 30 30 50 74 70 30 90 74" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 66 30 32 46 66" fill="none" stroke-width="4" stroke-linecap="round" class="o-hl" style="stroke:var(--kf-surface)"/></svg>',
    pill: '<svg viewBox="0 0 100 100"><g transform="rotate(-24 50 50)"><rect class="o-b-d" x="8" y="32" width="84" height="38" rx="19"/><rect class="o-b" x="8" y="30" width="80" height="34" rx="17"/><rect class="o-hl" x="18" y="36" width="44" height="8" rx="4"/></g></svg>',
    cone: '<svg viewBox="0 0 100 100"><polygon class="o-d" points="52,4 88,80 50,96"/><polygon class="o-d-d" points="52,4 50,96 12,80"/></svg>',
    ring: '<svg viewBox="0 0 100 100"><ellipse class="o-sa" cx="50" cy="52" rx="36" ry="24" fill="none" stroke-width="18"/><path d="M22 44a30 18 0 0 1 40-14" fill="none" stroke-width="5" stroke-linecap="round" class="o-hl" style="stroke:var(--kf-surface)"/></svg>',
    ball: '<svg viewBox="0 0 100 100"><circle class="o-c-d" cx="50" cy="50" r="42"/><circle class="o-c" cx="46" cy="45" r="37"/><ellipse class="o-hl" cx="36" cy="32" rx="12" ry="8"/></svg>',
    crescent: '<svg viewBox="0 0 100 100"><path class="o-se" d="M70 20a32 32 0 1 0 8 52" fill="none" stroke-width="18" stroke-linecap="round"/><path d="M44 26a22 22 0 0 0-14 18" fill="none" stroke-width="5" stroke-linecap="round" class="o-hl" style="stroke:var(--kf-surface)"/></svg>',
    cube: '<svg viewBox="0 0 100 100"><polygon class="o-f-l" points="50,8 90,30 50,52 10,30"/><polygon class="o-f" points="10,30 50,52 50,96 10,74"/><polygon class="o-f-d" points="50,52 90,30 90,74 50,96"/></svg>',
  };

  gsap.registerPlugin(ScrollTrigger, ...(window.ScrollToPlugin ? [ScrollToPlugin] : []));
  ScrollTrigger.config({ ignoreMobileResize: true });

  const head = document.querySelector('[data-slot="header"]');
  if (head) { head.classList.add("l-header"); head.innerHTML = header; }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) { foot.classList.add("l-footer"); foot.innerHTML = footer; }
  document.querySelectorAll("[data-obj]").forEach((el) => { el.innerHTML = OBJ[el.dataset.obj] || OBJ.ball; });
  document.documentElement.classList.add("is-built");

  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BP = 768;

  /* Header: white strip (is-fixed) after scrolling down 50px. On phone it hides when scrolling down (0.35s power2.out) and returns when scrolling up, and hides in 0.25s inside the pinned job panel */
  if (head) {
    const btn = head.querySelector(".l-headerButton");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const open = head.classList.toggle("is-open");
      document.body.style.overflow = open ? "hidden" : "";
      if (window.pnpLenis) open ? window.pnpLenis.stop() : window.pnpLenis.start();
    });
    head.querySelectorAll(".l-menu a").forEach((a) => a.addEventListener("click", () => {
      head.classList.remove("is-open");
      document.body.style.overflow = "";
      if (window.pnpLenis) window.pnpLenis.start();
    }));
    let fixed = false, last = scrollY, hidden = false;
    const show = (d) => { gsap.to(head, { y: 0, duration: d, ease: "power2.out", overwrite: "auto" }); hidden = false; };
    const hide = (d) => { gsap.to(head, { y: "-100%", duration: d, ease: "power2.out", overwrite: "auto" }); hidden = true; };
    const inPin = () => [...document.querySelectorAll(".t-pinContent")].some((el) => {
      const r = el.getBoundingClientRect(), mid = innerHeight * 0.5;
      return mid >= r.top && mid <= r.bottom;
    });
    const onScroll = () => {
      const y = scrollY;
      if (y > 50 && !fixed) { head.classList.add("is-fixed"); fixed = true; }
      else if (y <= 50 && fixed) { head.classList.remove("is-fixed"); fixed = false; }
      if (innerWidth >= BP) { last = y; return; }
      if (inPin()) { if (!hidden) hide(0.25); }
      else if (head.classList.contains("is-open")) show(0.2);
      else if (y < 50) show(0.35);
      else if (y > last && !hidden) hide(0.35);
      else if (y < last && hidden) show(0.35);
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { if (innerWidth >= BP) { gsap.set(head, { y: 0 }); hidden = false; head.classList.remove("is-open"); document.body.style.overflow = ""; } });
    onScroll();
  }

  /* Lenis — original settings as is (duration 1.2, smoothWheel). Updates ScrollTrigger on every scroll */
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.pnpLenis = lenis;
  }

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduced) return;
    /* Arc under each section: scaleY 0→1, 0.6s power2.out — the first screen’s plays right away, the rest when they reach top 80% */
    document.querySelectorAll(".c-arc").forEach((el) => {
      gsap.set(el, { scaleY: 0, transformOrigin: "bottom center" });
      if (el.classList.contains("c-arc--first")) gsap.to(el, { scaleY: 1, duration: 0.6, ease: "power2.out" });
      else gsap.to(el, { scaleY: 1, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" } });
    });
    document.querySelectorAll(".c-reverseArc").forEach((el) => {
      gsap.set(el, { scaleY: 0, transformOrigin: "top center" });
      gsap.to(el, { scaleY: 1, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" } });
    });
    /* Decorative shape parallax: moves down by data-para while passing through the screen */
    document.querySelectorAll(".c-obj[data-para]").forEach((el) => {
      gsap.fromTo(el, { y: 0 }, { y: parseFloat(el.dataset.para) || 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* Photo enters large and settles to scale 1 as it passes through the section */
    document.querySelectorAll(".c-scale").forEach((el) => {
      const media = el.querySelector(".wf-img, video, img");
      if (media) gsap.to(media, { scale: 1, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    });
  });

  const refresh = () => requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
  addEventListener("load", refresh);
  if (document.fonts) document.fonts.ready.then(refresh);
})();
