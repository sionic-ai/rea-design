// Common to all pages: the header (mega menu, search drawer), phone menu and footer are drawn in one place, along with smooth scroll, page-enter fade,
// Attach the hero loader, late-appearing header, accordion and entrance (.fadein).
// Original values: body fade 1.5s ease · header .4s ease(-2rem) · mega menu .6s · drawer .6s · search .4s · accordion .4s power2.out ·
//           phone menu tab switch .3s Power3 · entrance 1.5s(top bottom-=20%) · loader waits 1.5s → logo 1s → curtain 3.5s.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const MT = (window.MT = { reduced, lenis: null });

  // A placeholder drawn new in place of the original symbol: two pillars and a horizontal band inside a portrait rectangle frame, plus a wide-tracked wordmark
  const mono = `<svg class="mt-mono" viewBox="0 0 33 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">
      <rect x="0.6" y="0.6" width="31.8" height="42.8"/><path d="M8 9v26M25 9v26M8 9l8.5 11L25 9M12 35h17"/></svg>`;
  const word = `<svg class="mt-word" viewBox="0 0 149 12" aria-hidden="true"><text x="0" y="10.5" textLength="149" lengthAdjust="spacing"
      fill="currentColor" font-family="Switzer, sans-serif" font-size="11" font-weight="300">WORDMARK  NAME</text></svg>`;
  const searchIcon = `<svg class="mt-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><circle cx="6.8" cy="6.8" r="5.3"/><path d="m10.7 10.7 4.5 4.5"/></svg>`;
  const closeIcon = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><line x1="0.5" y1="0.5" x2="11.5" y2="11.5"/><line x1="11.5" y1="0.5" x2="0.5" y2="11.5"/></svg>`;
  const longArrow = `<svg class="mt-long-arrow" viewBox="0 0 47 8" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 3.7h46M42.8.4l3.3 3.3-3.3 3.3"/></svg>`;
  const shortArrow = `<svg class="mt-short-arrow" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 4h11M7.8.6 11.2 4 7.8 7.4"/></svg>`;
  MT.icons = { mono, word, longArrow, shortArrow };

  // Menu text is Latin like the original — what to put in is written in data-label
  const cats = [
    { t: "Category 1", n: 7 },
    { t: "Category 2", n: 6 },
    { t: "Category 3", n: 8 },
    { t: "Category 4", n: 1 },
    { t: "Category 5", n: 1 },
  ];
  const catList = (c) =>
    `<li><a href="index.html#new">All</a></li>` +
    Array.from({ length: c.n - 1 }, (_, i) => `<li><a href="index.html#new">Subcategory ${i + 1}</a></li>`).join("");
  const col = (c) => `<div class="sub-menu-products__col" data-label="Your product category name (English) here"><h2 class="sub-menu-products__title">${c.t}</h2><ul class="sub-menu-products__list">${c.n === 1 ? `<li><a href="index.html#new">Subcategory 1</a></li>` : catList(c)}</ul></div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("header");
    head.innerHTML = `
      <nav class="header__pc-nav" aria-label="Main menu">
        <ul>
          <li><a href="about.html">Brand</a></li>
          <li class="js-mega-menu">
            <a href="index.html#new">Products</a>
            <aside class="sub-menu" data-slot="mega-products">
              <div class="sub-menu__container">
                <div class="sub-menu-products__container">
                  <div class="sub-menu-products__half">
                    <div class="sub-menu-products__col">
                      <h2 class="sub-menu-products__title">New In</h2>
                      <a class="sub-menu-products__image sub-menu__image" href="index.html#new">
                        <span class="wf-img mt-img--light" data-label="New bag cutout · light gray · 4:5"></span>
                      </a>
                    </div>
                    ${col(cats[0])}
                  </div>
                  <div class="sub-menu-products__half">${cats.slice(1).map(col).join("")}</div>
                </div>
              </div>
            </aside>
          </li>
          <li class="js-mega-menu">
            <a href="index.html#journal">Journal</a>
            <aside class="sub-menu" data-slot="mega-journal">
              <div class="sub-menu__container">
                <div class="sub-menu-journal__container">
                  ${[1, 2, 3, 4]
                    .map(
                      (n) => `<article><a href="index.html#journal">
                    <div class="sub-menu__image sub-menu-journal__image"><span class="wf-img mt-img--mid" data-label="Journal ${n} Cover · black-and-white wearing shot · landscape"></span></div>
                    <h2 class="sub-menu-journal__title" data-label="Your journal title (English) here">Journal Title ${n}.</h2></a></article>`
                    )
                    .join("")}
                </div>
              </div>
            </aside>
          </li>
          <li><a href="#">Store</a></li>
        </ul>
      </nav>
      <a class="header__logo" href="index.html" aria-label="Home">${word}</a>
      <div class="header__right">
        <ul>
          <li><a class="search-button js-search-toggle" href="#" aria-label="Search">${searchIcon}</a></li>
          <li class="u-pc"><a href="#">Login</a></li>
          <li><a class="cart-link" href="#">Cart<span>(0)</span></a></li>
        </ul>
      </div>`;

    head.insertAdjacentHTML(
      "afterend",
      `<div class="header-search" aria-hidden="true" data-slot="search-drawer" data-lenis-prevent>
        <div class="header-search__inner">
          <form class="predictive__form" role="search" onsubmit="return false">
            <input class="predictive__input" type="search" placeholder="Search" aria-label="Product search">
            <div class="predictive__buttons">
              <button class="predictive__submit" type="submit">Search</button>
              <button class="header-search__close" type="button" aria-label="Close search">${closeIcon}</button>
            </div>
          </form>
        </div>
      </div>
      <div class="header-search__overlay"></div>
      <button class="menu__button" type="button">Menu</button>
      <div class="menu__overlay"></div>
      <aside class="menu" data-slot="mobile-menu">
        <div class="menu__inner" data-lenis-prevent>
          <div class="menu__container">
            <div class="menu__tab" data-tab="1">
              <nav class="menu__nav"><ul>
                <li><button class="menu__tab-button js-menu-to-tab-2" type="button">Products</button></li>
                <li><a href="about.html">Brand</a></li>
                <li><a href="index.html#journal">Journal</a></li>
                <li><a href="#">Store</a></li>
              </ul></nav>
              <div class="menu__buttons"><ul><li><a href="#">Login</a></li></ul></div>
              <div class="menu__accordions">
                <div class="menu__accordions-item js-accordion-item">
                  <button class="menu__accordions-button js-accordion-button" type="button">Company</button>
                  <div class="menu__accordions-content js-accordion-content"><ul>
                    <li><a href="list.html">News</a></li><li><a href="recruit.html">Recruit</a></li></ul></div>
                </div>
                <div class="menu__accordions-item js-accordion-item">
                  <button class="menu__accordions-button js-accordion-button" type="button">Service</button>
                  <div class="menu__accordions-content js-accordion-content"><ul>
                    <li><a href="guide.html">Shopping Guide</a></li><li><a href="#">Care &amp; Repair</a></li><li><a href="#">Custom Order</a></li></ul></div>
                </div>
              </div>
              <div class="menu__secondary"><ul><li><a href="#">SNS 1</a></li><li><a href="#">SNS 2</a></li><li><a href="#">SNS 3</a></li></ul></div>
              <div class="menu__tertiary"><ul><li><a href="#">Contact</a></li><li><a href="#">Legal</a></li><li><a href="#">Privacy Policy</a></li></ul></div>
            </div>
            <div class="menu__tab" data-tab="2">
              <div class="menu__tab2-item"><button class="menu__tab2-back js-menu-to-tab-1" type="button">Products</button></div>
              <div class="menu__tab2-item"><a href="index.html#new">New In</a></div>
              ${cats
                .map(
                  (c) => `<div class="menu__tab2-item js-accordion-item">
                <button class="menu__tab2-button js-accordion-button" type="button">${c.t}</button>
                <div class="menu__tab2-content js-accordion-content"><ul>${c.n === 1 ? `<li><a href="index.html#new">Subcategory 1</a></li>` : catList(c)}</ul></div>
              </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </aside>`
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("footer");
    foot.innerHTML = `
      <div class="footer__left">
        <div class="footer__left-products">
          <h2>Products</h2>
          <ul><li><a href="index.html#new">New In</a></li><li><a href="index.html#new">Category 1</a></li><li><a href="index.html#new">Category 2</a></li><li><a href="index.html#new">Category 3</a></li></ul>
        </div>
        <div class="footer__left-newsletter">
          <h2>Newsletter</h2>
          <p class="footer__left-success" hidden>We’ve received your subscription.</p>
          <form class="footer__left-newsletter__form" novalidate>
            <div class="footer__left-newsletter__fieldset"><input type="email" placeholder="E-mail" aria-label="Email address"></div>
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <nav class="footer__pc-nav" aria-label="Bottom Menu">
        <ul><li><a href="#">SNS 1</a></li><li><a href="#">SNS 2</a></li><li><a href="#">SNS 3</a></li></ul>
        <ul><li><a href="guide.html">Shopping Guide</a></li><li><a href="#">Care &amp; Repair</a></li><li><a href="#">Custom Order</a></li></ul>
        <ul><li><a href="list.html">News</a></li><li><a href="recruit.html">Recruit</a></li></ul>
        <ul><li><a href="#">Contact</a></li><li><a href="#">Legal</a></li><li><a href="#">Privacy Policy</a></li></ul>
      </nav>
      <p class="footer__small"><small>©0000 BRAND NAME</small></p>`;
    const form = foot.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.querySelector("input").value.trim()) return;
      foot.querySelector(".footer__left-success").hidden = false;
      form.reset();
    });
  }

  // Smooth scroll: original is Lenis defaults (lerp .1) with anchor -60px
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ anchors: { offset: -60 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    MT.lenis = lenis;
  }
  MT.scrollTo = (target, opts = {}) => {
    if (MT.lenis) {
      // Even right after movement that did not go through Lenis, like keyboard or scrollbar, align so it starts from the current position
      if (Math.abs(MT.lenis.scroll - scrollY) > 1) MT.lenis.scrollTo(scrollY, { immediate: true, force: true });
      MT.lenis.scrollTo(target, opts);
    }
    else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      const y = typeof target === "number" ? target : el.getBoundingClientRect().top + scrollY + (opts.offset || 0);
      scrollTo(0, y);
    }
  };

  const body = document.body;

  // Home page only: a gray curtain covering the screen with a wordmark in the center. Skipped from the second time in the same tab
  const startLoaded = (afterIntro) => {
    const overlay = document.querySelector('[data-slot="loader"]');
    if (!overlay) {
      body.classList.add("is-loaded");
      afterIntro && afterIntro();
      return;
    }
    overlay.innerHTML = word;
    const KEY = "mt-wireframe-intro";
    if (reduced || sessionStorage.getItem(KEY)) {
      gsap.set(overlay, { display: "none" });
      body.classList.add("is-loaded");
      afterIntro && afterIntro();
      return;
    }
    sessionStorage.setItem(KEY, "1");
    body.classList.add("is-loaded");
    gsap
      .timeline({ delay: 1.5 })
      .to(overlay.firstElementChild, { opacity: 0, duration: 1 })
      .set(overlay, { pointerEvents: "none" }, "-=0.2")
      .to(overlay, { opacity: 0, duration: 3.5, onComplete: () => gsap.set(overlay, { display: "none" }) })
      .add(() => afterIntro && afterIntro(), "-=2.5");
  };
  MT.startLoaded = startLoaded;

  // On the first page the header and menu button come down only after scrolling past the hero (window height)
  if (page === "home") {
    body.classList.add("is-home");
    ScrollTrigger.create({
      start: () => `${innerHeight}px top`,
      onEnter: () => body.classList.add("header-is-visible"),
      onLeaveBack: () => body.classList.remove("header-is-visible"),
    });
  }

  // Phone menu: right drawer + strikethrough on button text, tapping Product moves to the second tab in .3s
  const menu = document.querySelector(".menu");
  if (menu) {
    const btn = document.querySelector(".menu__button");
    const veil = document.querySelector(".menu__overlay");
    let open = false;
    const set = (v) => {
      open = v;
      body.classList.toggle("menu-is-open", v);
    };
    btn.addEventListener("click", () => set(!open));
    veil.addEventListener("click", () => set(false));
    const t1 = menu.querySelector('[data-tab="1"]');
    const t2 = menu.querySelector('[data-tab="2"]');
    const tabs = gsap
      .timeline({ paused: true })
      .to(t1, { opacity: 0, x: -3, duration: 0.3, ease: "power3.in" })
      .set(t1, { display: "none" })
      .set(t2, { display: "block" })
      .to(t2, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" });
    menu.querySelectorAll(".js-menu-to-tab-2").forEach((b) => b.addEventListener("click", () => tabs.play()));
    menu.querySelectorAll(".js-menu-to-tab-1").forEach((b) => b.addEventListener("click", () => tabs.reverse()));
  }

  // Accordion: height 0 ↔ scrollHeight .4s power2.out, when open the vertical stroke of the + disappears
  document.querySelectorAll(".js-accordion-item").forEach((item) => {
    const btn = item.querySelector(".js-accordion-button");
    const panel = item.querySelector(".js-accordion-content");
    if (!btn || !panel) return;
    gsap.set(panel, { height: 0 });
    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      item.classList.toggle("is-open", open);
      if (open) {
        gsap.to(panel, { height: panel.scrollHeight, duration: reduced ? 0 : 0.4, ease: "power2.out", onComplete: () => gsap.set(panel, { height: "auto" }) });
      } else {
        gsap.set(panel, { height: panel.scrollHeight });
        gsap.to(panel, { height: 0, duration: reduced ? 0 : 0.4, ease: "power2.out" });
      }
    });
  });

  // Search drawer: drops 1rem from the top over .4s, closes via gray scrim, close button or Esc
  const toggle = document.querySelector(".js-search-toggle");
  const drawer = document.querySelector(".header-search");
  if (toggle && drawer) {
    const input = drawer.querySelector("input");
    const openS = () => {
      body.classList.add("search-is-open");
      drawer.setAttribute("aria-hidden", "false");
      setTimeout(() => input.focus(), 60);
    };
    const closeS = () => {
      body.classList.remove("search-is-open");
      drawer.setAttribute("aria-hidden", "true");
    };
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      body.classList.contains("search-is-open") ? closeS() : openS();
    });
    document.querySelector(".header-search__overlay").addEventListener("click", closeS);
    drawer.querySelector(".header-search__close").addEventListener("click", closeS);
    addEventListener("keydown", (e) => e.key === "Escape" && body.classList.contains("search-is-open") && closeS());
  }

  // Anchor that centers on screen (About page table of contents)
  document.querySelectorAll("a.js-anchor-centered").forEach((a) => {
    a.addEventListener("click", (e) => {
      const el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      MT.scrollTo(el, { offset: -(innerHeight - el.offsetHeight) / 2 });
    });
  });

  // Float up slowly when visible: opacity over 1.5s once it touches the line 20% from the screen bottom
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".fadein").forEach((el) => {
      gsap.set(el, { opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: "top bottom-=20%", once: true, onEnter: () => gsap.to(el, { opacity: 1, duration: 1.5 }) });
    });
  });

  // On the home page index.js adds is-loaded when it finishes the loader. Other pages enter right away with a 1.5s fade
  if (page !== "home") addEventListener("DOMContentLoaded", () => body.classList.add("is-loaded"));
})();
