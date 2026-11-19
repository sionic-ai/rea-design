// Common to all pages: draws in the header, drawer and Footer, and hooks up loader, smooth scroll and parallax.
// Original values: loader bar 1.8s → fades over .8s at 2.2s · Lenis duration 1.2 (off at widths 834 and below) · drawer panel .7s cubic-bezier(.65,0,.35,1)
// · item delay i×.1+.5s · on close, up -10px · parallax y -200 scrub 1.5~3.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const KZ = (window.KZ = { reduced, lenis: null });
  // For people who reduce motion, the autoplay video is held on its first scene
  if (reduced) document.querySelectorAll("video[autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });

  // Placeholder drawn fresh instead of the original logo: slanted roof symbol + widely spaced capitals
  const logo = (cls = "kz-logo") => `<a class="${cls}" href="index.html" aria-label="Home"><svg viewBox="0 0 200 22" aria-hidden="true"><path d="M0 21 14 1h7L8 21Zm11 0L25 1h7L18 21Z" fill="currentColor"/><text x="40" y="18" fill="currentColor" font-family="Albert Sans, sans-serif" font-weight="700" font-size="19" letter-spacing="5">WORDMARK</text></svg><small>Company name slot</small></a>`;
  const roll = (en, ko) => `<span class="kz-roll"><span>${en}</span><span>${ko}</span></span>`;
  const MENU = [
    ["About Us", "Company About", "about.html"],
    ["Our Business", "Business details", "service.html"],
    ["Projects", "Installation Record", "works.html"],
    ["Sustainability", "Sustainability", "about.html#dx"],
    ["Company Information", "Company info", "about.html"],
    ["Contact Us", "Inquiry", "#contact"],
  ];
  KZ.btn = (t, mod = "black", href = "#") => `<a class="kz-btn kz-btn--${mod}" href="${href}"><span class="kz-btn__wrap"><span>${t}</span><span>${t}</span></span></a>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("kz-head");
    if (page === "home") head.classList.add("is-light");
    head.innerHTML = `<div class="kz-head__in">${logo()}
      <nav class="kz-gnav" aria-label="Main menu"><ul>${MENU.map((m) => `<li><a href="${m[2]}">${roll(m[0], m[1])}</a></li>`).join("")}</ul>
        <div class="kz-lang"><a class="is-on" href="#">KO</a><a href="#">EN</a></div></nav></div>`;
    head.insertAdjacentHTML("afterend", `
      <button class="kz-burger" type="button" aria-label="Open Menu"><i></i><i></i></button>
      <div class="kz-drawer" data-slot="menu-drawer" data-lenis-prevent><div class="kz-drawer__in">
        <div class="kz-drawer__items">
          <p class="kz-drawer__label" data-ditem>Discover</p>
          <nav class="kz-drawer__nav">${MENU.slice(0, 5).concat([["News", "News", "news.html"], ["Recruit", "Hiring", "article.html"]]).map((m) => `<a href="${m[2]}" data-ditem>${roll(m[0], m[1])}</a>`).join("")}</nav>
          <p class="kz-drawer__label" data-ditem>Get in Touch</p>
          <nav class="kz-drawer__nav"><a href="#contact" data-ditem>${roll("Contact Us", "Inquiry")}</a></nav>
        </div>
        <div class="kz-drawer__foot" data-ditem>${logo()}<span>© WORDMARK</span></div>
      </div></div>`);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const list = (items) => `<ul class="kz-foot__list">${items.map((m) => `<li><a href="${m[2]}">${roll(m[0], m[1])}</a></li>`).join("")}</ul>`;
    foot.classList.add("kz-foot");
    foot.id = "contact";
    foot.innerHTML = `<div class="kz-inner kz-foot__in">
      <div class="kz-foot__crumbs"></div>
      <a class="kz-foot__top-link kz-line" href="#top">( Page Top )</a>
      <div class="kz-foot__top">
        <div class="kz-foot__nav">
          <div><p class="kz-foot__head">Discover</p>${list(MENU.slice(0, 5).concat([["News", "News", "news.html"], ["Recruit", "Hiring", "article.html"]]))}</div>
          <div><p class="kz-foot__head">Get in Touch</p>${list([MENU[5]])}<p class="kz-foot__doc">Your document link in one line here</p></div>
        </div>
        <p class="kz-copy kz-foot__copyline">The Next<br>Landmark.</p>
      </div>
      <div class="kz-foot__bottom">
        <div>${logo("kz-logo kz-foot__logo")}<p class="kz-foot__copy">© 0000 WORDMARK Co., Ltd. All Rights Reserved.</p></div>
        <div class="kz-foot__info"><p>〒000-0000<br>Your one-line address here 0-0-0<br>TEL.00-0000-0000　FAX.00-0000-0000<br>Your business hours line here</p><small>0-0-0 Placeholder street, City<br>Open: 0:00 am Close: 0:00 pm</small></div>
      </div></div>`;
  }

  // The original puts breadcrumbs in the top strip of the footer, not under the title
  const crumb = document.querySelector(".kz-under .kz-crumb");
  const crumbSlot = document.querySelector(".kz-foot__crumbs");
  if (crumb && crumbSlot) crumbSlot.append(crumb);
  else if (crumbSlot) crumbSlot.remove();

  /* ---------- Smooth scrolling (original smooth-scroll library 1.0.19 · duration 1.2): off at widths of 834 and below, leaving only scroll-behavior smooth on html ---------- */
  if (!reduced && innerWidth <= 834) document.documentElement.style.scrollBehavior = "smooth";
  // The npm UMD build’s global name is lowercase lenis (the bundled build the original used is Lenis)
  const LenisCtor = window.Lenis || window.lenis;
  if (!reduced && innerWidth > 834 && typeof LenisCtor === "function") {
    const lenis = (KZ.lenis = new LenisCtor({ duration: 1.2, smooth: true, smoothTouch: false }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); KZ.lenis ? KZ.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); }));

  /* ---------- Drawer ---------- */
  const burger = document.querySelector(".kz-burger");
  const drawer = document.querySelector(".kz-drawer");
  const items = drawer ? drawer.querySelectorAll("[data-ditem]") : [];
  const open = () => {
    burger.classList.add("is-active");
    burger.setAttribute("aria-label", "Close Menu");
    drawer.classList.add("is-active");
    drawer.classList.remove("is-closing");
    document.body.classList.add("no-scroll");
    KZ.lenis && KZ.lenis.stop();
    items.forEach((it, i) => { it.classList.remove("is-hide-up"); it.style.transitionDelay = `${i * 0.1 + 0.5}s`; it.classList.add("is-show"); });
  };
  const close = () => {
    burger.classList.remove("is-active");
    burger.setAttribute("aria-label", "Open Menu");
    drawer.classList.add("is-closing");
    drawer.classList.remove("is-active");
    document.body.classList.remove("no-scroll");
    KZ.lenis && KZ.lenis.start();
    items.forEach((it) => { it.classList.remove("is-show"); it.classList.add("is-hide-up"); it.style.transitionDelay = ""; setTimeout(() => it.classList.remove("is-hide-up"), 600); });
    setTimeout(() => drawer.classList.remove("is-closing"), 700);
  };
  if (burger) {
    burger.addEventListener("click", () => (burger.classList.contains("is-active") ? close() : open()));
    drawer.addEventListener("click", (e) => e.target === drawer && close());
    addEventListener("keydown", (e) => e.key === "Escape" && burger.classList.contains("is-active") && close());
  }

  /* ---------- Loader (first page only) + letters that stagger in after load (load-delay) ---------- */
  const loading = document.querySelector(".kz-loading");
  if (loading && !reduced) {
    requestAnimationFrame(() => loading.classList.add("is-active"));
    setTimeout(() => loading.classList.add("is-hidden"), 2200);
  }
  // Like the original, is-loaded is added on DOMContentLoaded — the initial state (clip-path closed) must be computed first so the 3.2s and 4.3s delayed transitions do not get skipped
  addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll("[data-load]");
    items.forEach((el) => getComputedStyle(el).clipPath);
    void document.body.offsetHeight;
    items.forEach((el) => el.classList.add("is-loaded"));
  });

  /* ---------- Parallax: background plate moves to y -200 ---------- */
  KZ.parallax = (target, trigger, { y = -200, start = "top bottom", end = "bottom center", scrub = 1.5 } = {}) => {
    if (reduced) return;
    document.querySelectorAll(target).forEach((el) => gsap.to(el, { y, ease: "none", scrollTrigger: { trigger: el.closest(trigger) || trigger, start, end, scrub } }));
  };
  KZ.parallax("[data-plx]", "[data-plx-box]", { scrub: 3 });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
