// Shared by all pages: draws the header, drawer and footer in one place, with lenis (lerp .2 · time ×600 on raf), is-active when visible (top 75%), parallax (scrub 1.5),
// Hooks up accordion (.4s power3.out) · drawer · sliding to the map position. The original just navigates with no page transition effect
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const md = matchMedia("screen and (min-width: 960px)");
  const TW = (window.TW = { reduced, lenis: null });

  // Placeholder logo drawn fresh instead of the original symbol — layered diamond + wings + English name
  const logo = `<svg viewBox="0 0 100 121" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M50 2 84 36 50 70 16 36Z M50 16 70 36 50 56 30 36Z"/>
    <path d="M50 28 58 36 50 44 42 36Z"/>
    <path d="M8 60 50 80 92 60 92 66 50 86 8 66Z"/>
    <text class="tw-logo__word" x="50" y="106" text-anchor="middle" font-size="19" letter-spacing="2">BRAND</text>
    <text class="tw-logo__sub" x="50" y="119" text-anchor="middle" font-size="8.5" letter-spacing="2.4">WEDDING</text>
  </svg>`;
  const talk = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="tw-talk__base" cx="20" cy="20" r="19.9"/><path class="tw-talk__mark" d="M20 10.5c-6.4 0-11.6 4.1-11.6 9.2 0 4.5 4 8.3 9.6 9 .4.1.9.3 1 .6.1.3 0 .7 0 1l-.2 1c0 .3-.2 1.1 1 .6 1.2-.5 6.2-3.7 8.5-6.3 1.6-1.7 2.3-3.5 2.3-5.4 0-5.1-5.2-9.2-11.6-9.2z"/></svg>`;
  const camera = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="tw-social__base" cx="20" cy="20" r="19.9"/><path class="tw-social__mark" fill-rule="evenodd" d="M14 11h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V14a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V14a1 1 0 0 0-1-1Zm6 2.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8ZM25 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>`;
  const share = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="tw-social__base" cx="20" cy="20" r="19.9"/><path class="tw-social__mark" d="M25 11a3.2 3.2 0 1 1-3 4.3l-5.6 3a3.2 3.2 0 0 1 0 3.4l5.6 3a3.2 3.2 0 1 1-.9 1.8l-5.7-3a3.2 3.2 0 1 1 0-5l5.7-3A3.2 3.2 0 0 1 25 11Z"/></svg>`;
  TW.icons = { logo, talk, camera, share };

  const navItems = (drawer) => `
      <a class="tw-nav__item" href="index.html"><span class="tw-nav__text">Top</span></a>
      <div class="tw-nav__item tw-nav__item--parent${drawer ? " tw-js-details" : ""}">
        <button class="tw-nav__text${drawer ? " tw-js-summary" : ""}" type="button">Service${drawer ? '<span class="tw-nav__icon"></span>' : ""}</button>
        <div class="tw-nav__child-wrap${drawer ? " tw-js-content" : ""}"><div class="tw-nav__child">
          <a class="tw-nav__child-item" href="service.html"><span class="tw-sp-6">Custom wedding</span></a>
          <a class="tw-nav__child-item" href="service.html"><span class="tw-sp-6">Wedding Photo</span></a>
        </div></div>
      </div>
      <a class="tw-nav__item" href="article.html"><span class="tw-nav__text">Flow</span></a>
      <a class="tw-nav__item" href="lookbook.html"><span class="tw-nav__text">Gallery</span></a>
      <a class="tw-nav__item" href="#map" data-to-map><span class="tw-nav__text">Access</span></a>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <a class="tw-logo" href="index.html" aria-label="Home" data-label="Brand logo · symbol + English name"><span class="tw-logo__mark">${logo}</span></a>
      <div class="tw-nav-wrap" id="tw-drawer" aria-expanded="false" data-slot="menu-drawer">
        <div class="tw-nav-wrap__backdrop"></div>
        <div class="tw-nav-wrap__inner">
          <nav class="tw-nav" aria-label="Main menu" data-label="Menu English name">${navItems(true)}
            <a class="tw-nav__item" href="#contact" data-to-map><span class="tw-nav__text">Contact</span></a>
          </nav>
          <div class="tw-nav-icons">
            <a class="tw-talk" href="#" aria-label="Messenger"><span class="tw-icon">${talk}</span></a>
            <a class="tw-social" href="#" aria-label="Photo account"><span class="tw-icon">${camera}</span></a>
            <a class="tw-social" href="#" aria-label="News Account"><span class="tw-icon">${share}</span></a>
          </div>
        </div>
      </div>
      <div class="tw-head-line"><a class="tw-talk" href="#" aria-label="Messenger">${talk}</a></div>
      <button class="tw-burger" type="button" aria-expanded="false" aria-controls="tw-drawer" aria-label="Menu"><i></i><i></i></button>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "tw-footer";
    foot.innerHTML = `
      <a class="tw-talk tw-talk-fixed" href="#" aria-label="Messenger">${talk}</a>
      <div class="tw-footer-head" data-slot="footer-map">
        <div class="tw-footer-info">
          <address class="tw-sp-text" style="font-style: normal">〒000-0000 One line of your address here</address>
          <div class="tw-sp-text">Tel: 00-0000-0000<br><a class="tw-uline" href="#"><span class="tw-uline__text">mail@example.com</span></a></div>
        </div>
        <div class="tw-map" id="map">
          <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path class="water" d="M610 330c40-30 120-36 160-10s40 70-10 90-130 10-160-20-20-40 10-60Z"/>
            <path class="road road--main" d="M-20 120C200 160 380 90 560 150S900 300 1100 250 1380 120 1460 140"/>
            <path class="road road--main" d="M420 -20C440 120 520 260 500 520"/>
            <path class="road road--sub" d="M-20 380C160 340 300 400 460 360S760 420 900 380"/>
            <path class="road road--sub" d="M980 -20C960 120 1020 220 1000 520"/>
            <path class="road road--sub" d="M700 150C720 220 690 300 720 330M1100 250C1180 320 1260 330 1460 300M200 140C220 220 180 300 240 520"/>
            <path class="pin" d="M700 228a14 14 0 0 1 14 14c0 11-14 24-14 24s-14-13-14-24a14 14 0 0 1 14-14Zm0 8a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
          </svg>
          <span class="tw-map__label">Map embed slot · grayscale · center pin</span>
        </div>
      </div>
      <div class="tw-footer-body" data-slot="footer-contact">
        <div class="tw-treat tw-footer-treat-1" data-fx="foliage-sway"></div>
        <div class="tw-treat tw-footer-treat-2" data-fx="foliage-sway"></div>
        <div class="tw-footer-body__bg"><div class="wf-img" data-label="Lakeside pavilion and forest scenery · faded tone · landscape full-bleed"></div></div>
        <div class="tw-footer-body__inner">
          <a class="tw-contact" href="#" id="contact">
            <span class="tw-contact__bg" aria-hidden="true"><span class="tw-contact__bg-inner" data-label="Hero headline, two lines in English"><span class="tw-contact__line">Simple Words,</span><span class="tw-contact__line">Across Two Lines</span></span></span>
            <span class="tw-contact__front"><span class="tw-contact__front-in"><span class="tw-sp-5" style="display:block">Contact us this way</span><span class="tw-contact__en tw-pf-4" style="display:block" data-label="English Contact Button">Contact Us</span></span></span>
          </a>
          <div class="tw-footer-nav"><nav class="tw-nav" aria-label="Footer Menu">${navItems(false)}</nav></div>
          <div class="tw-footer-socials">
            <a class="tw-social" href="#" aria-label="Photo account"><span class="tw-icon">${camera}</span></a>
            <a class="tw-social" href="#" aria-label="News Account"><span class="tw-icon">${share}</span></a>
          </div>
          <div class="tw-footer-icon"><span class="tw-logo__mark">${logo}</span></div>
          <div class="tw-footer-copy">
            <p class="tw-footer-copy__text tw-pf-text tw-pf-small" data-label="English copyright, one line">© by Brand Name. Company Name corporation.</p>
            <span class="tw-footer-copy__label tw-sp-text tw-sp-small">Your support program label here</span>
          </div>
        </div>
      </div>`;
  }

  // ── lenis — original @studio-freight/lenis 1.0.36 · lerp .2 · ×600 is applied to the seconds of the gsap clock (as in the original — 600 instead of 1000 for ms) ──
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.2 });
    TW.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 600));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => (TW.lenis ? TW.lenis.scrollTo(el) : el.scrollIntoView());

  // ── Drawer (phone) — opens and closes with button · backdrop · Esc, and locks the body while open ──
  const drawer = document.querySelector(".tw-nav-wrap");
  const burger = document.querySelector(".tw-burger");
  const lock = {
    y: 0,
    on() { this.y = scrollY; document.body.style.top = `-${this.y}px`; document.body.classList.add("scroll-locked"); TW.lenis?.stop(); },
    off() { document.body.classList.remove("scroll-locked"); document.body.style.top = ""; scrollTo(0, this.y); TW.lenis?.start(); },
  };
  let open = false;
  const setDrawer = (v) => {
    if (v === open || !drawer) return;
    open = v;
    drawer.setAttribute("aria-expanded", String(v));
    burger.setAttribute("aria-expanded", String(v));
    v ? lock.on() : lock.off();
  };
  burger?.addEventListener("click", () => setDrawer(!open));
  drawer?.querySelector(".tw-nav-wrap__backdrop")?.addEventListener("click", () => setDrawer(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setDrawer(false));

  // ”Access” and ”Contact” — glide with lenis to the map and inquiry spots (if the drawer is open, close it and wait .3s)
  document.querySelectorAll("[data-to-map]").forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (open && !md.matches) { setDrawer(false); setTimeout(() => scrollToEl(target), 300); } else scrollToEl(target);
    }),
  );

  // ── Accordion — on open height 0→auto · transparent→1, on close the reverse (.4s power3.out). Shared by the drawer’s Service·pricing·questions ──
  TW.accordion = (root = document) =>
    root.querySelectorAll(".tw-js-details").forEach((el) => {
      const summary = el.querySelector(".tw-js-summary"), content = el.querySelector(".tw-js-content");
      if (!summary || !content || el.dataset.twAcc) return;
      el.dataset.twAcc = "1";
      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (el.classList.contains("is-opened")) {
          el.classList.remove("is-opened");
          gsap.to(content, { height: 0, opacity: 0, duration: 0.4, ease: "power3.out", overwrite: true, onComplete: () => el.removeAttribute("open") });
        } else {
          el.classList.add("is-opened");
          el.setAttribute("open", "true");
          gsap.fromTo(content, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.4, ease: "power3.out", overwrite: true });
        }
      });
    });

  // ── When visible, is-active (top edge at 75% of the screen, once) — border · entrance · text plate start their css transitions with this class ──
  TW.reveal = (root = document) =>
    root.querySelectorAll(".tw-js-anim").forEach((t) => {
      if (reduced) { t.classList.add("is-active"); return; }
      ScrollTrigger.create({ trigger: t, start: "top 75%", once: true, onEnter: () => t.classList.add("is-active") });
    });

  // ── Parallax — the cell enters above 50% of the screen center and, until 10% before the end, the inside moves from 10% below into place (scrub 1.5, no curve) ──
  TW.parallax = (root = document) => {
    if (reduced) return;
    root.querySelectorAll(".tw-js-parallax").forEach((box) => {
      const items = box.querySelectorAll(".tw-js-parallax-item");
      if (!items.length) return;
      gsap.timeline({ scrollTrigger: { trigger: box, start: "top-=50% center", end: "bottom-=10% center", scrub: 1.5 } })
        .from(items, { transform: "translate(0, 10%)", ease: "none" }, 0);
    });
  };

  // Hooked on DOMContentLoaded so it catches boards drawn by page scripts (rate cards etc.)
  addEventListener("DOMContentLoaded", () => {
    TW.accordion();
    TW.reveal();
    TW.parallax();
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
