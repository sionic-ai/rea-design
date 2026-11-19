// One shared set for Brand — header bar · menu panel · two contact panels · footer · loader fitted in the same form on every page, hooking up Lenis and the header bar state.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const roll = (t, cls = "") => `<span class="${cls}" data-fx="fade-swap-hover"><span data-fx-part="next" aria-hidden="true">${t}</span><span data-fx-part="label">${t}</span></span>`;
  const arrowSvg = '<svg viewBox="0 0 8 6" stroke-width="1"><path d="M0 3h7M4.6.6 7 3 4.6 5.4"/></svg>';
  const chip = () => `<span class="nj-chip"><svg viewBox="0 0 20 14" fill="currentColor" aria-hidden="true"><path d="M10 0C17.6 0 20 1.7 20 7s-2.4 7-10 7S0 12.3 0 7 2.4 0 10 0Z"/></svg><span data-fx="arrow-pass-hover" data-fx-arrow-pass-hover="leave: snap">${arrowSvg}${arrowSvg}</span></span>`;
  const link = (t, href = "#", cls = "") => `<a class="nj-link ${cls}" href="${href}">${roll(t, "nj-link__text")}${chip()}</a>`;
  const logo = (cls = "") => `<span class="nj-logo ${cls}" data-label="Brand English name"><svg viewBox="0 0 26 28" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 27 6.2 11.5C7.4 7.2 9.8 5 13 5s5.6 2.2 6.8 6.5L24 27"/><path d="M8.6 27 10.6 15.8c.4-1.9 1.2-2.8 2.4-2.8s2 .9 2.4 2.8L17.4 27"/><circle cx="13" cy="1.6" r="1.1" fill="currentColor" stroke="none"/></svg><span class="nj-logo__word">name</span></span>`;
  const arrowBtn = (dir) => `<button class="nj-arrow splide__arrow splide__arrow--${dir} is-${dir}" type="button" aria-label="${dir === "prev" ? "Previous" : "Next"}"><svg viewBox="0 0 32 26" fill="none" stroke="currentColor"><path d="M16 .5C28.2.5 31.5 2.6 31.5 13S28.2 25.5 16 25.5.5 23.4.5 13 3.8.5 16 .5Z" stroke="var(--kf-line)"/><path class="nj-arrow__a" d="M21 13H11m3.4-3.6L10.8 13l3.6 3.6"/><path class="nj-arrow__a" d="M21 13H11m3.4-3.6L10.8 13l3.6 3.6"/></svg></button>`;
  // One photo strip per house — slot width follows photo ratio (portrait, landscape, narrow portrait)
  const strip = ({ name, type = "Two-story house", area = "Area Name", isNew = false, shots, href = "detail.html" }) => `
    <div class="nj-strip splide" data-fx="brake-auto-strip" aria-label="${name}">
      <a class="nj-strip__link" href="${href}">
        <div class="splide__track"><div class="splide__list">${shots.map(([k, label]) => `<div class="splide__slide is-${k}"><div class="wf-img" data-label="${label}"></div></div>`).join("")}</div></div>
        <div class="nj-strip__bottom">
          <div class="nj-strip__data">${isNew ? '<span class="nj-strip__new nj-num">NEW</span>' : ""}<p class="nj-strip__type">${type}</p><p class="nj-strip__area">${area}</p><p class="nj-strip__name">${name}</p></div>
          <div class="nj-strip__nav"><div class="nj-counter"><span data-fx-part="count">1</span><span class="nj-counter__rail"><span data-fx-part="bar"></span></span><span data-fx-part="total">${shots.length}</span></div><div class="nj-arrows splide__arrows">${arrowBtn("prev")}${arrowBtn("next")}</div></div>
        </div>
      </a>
    </div>`;
  window.nj = { roll, chip, link, logo, strip, arrowBtn };
  // Swaps placeholders in the page html into the same shape — [data-link] is a one-line text link, [data-roll] is a two-copy text roll
  window.nj.fill = (root = document) => {
    root.querySelectorAll("[data-link]").forEach((el) => { el.outerHTML = link(el.dataset.link, el.dataset.href || "#", el.hasAttribute("data-serif") ? "is-serif" : el.hasAttribute("data-white") ? "is-white" : ""); });
    root.querySelectorAll("[data-roll]").forEach((el) => { el.innerHTML = roll(el.textContent.trim()); el.removeAttribute("data-roll"); });
    root.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = logo(el.dataset.logo); });
  };
  window.nj.fill();

  const sitemap = `
    <nav class="nj-sitemap__nav" aria-label="Sitemap">
      <ul class="nj-sitemap__list">
        <li><a class="nj-sitemap__link" href="index.html">${roll("First Page")}</a></li>
        <li><a class="nj-sitemap__link" href="about.html" data-tab>${roll("Concept")}</a><div class="nj-sitemap__sub"><a href="about.html">${roll("Homes built with architects")}</a><a href="about.html">${roll("How to face it")}</a><a href="about.html">${roll("Our Steps")}</a><a href="news.html">${roll("Column")}</a></div></li>
        <li><a class="nj-sitemap__link" href="works.html" data-tab>${roll("Installation Cases")}</a><div class="nj-sitemap__sub"><a href="works.html">${roll("A Newly Built Home")}</a><a href="works.html">${roll("Renovation")}</a></div></li>
        <li><a class="nj-sitemap__link" href="#" data-tab>${roll("Model home")}</a><div class="nj-sitemap__sub"><a href="#">${roll("Region 1")}</a><a href="#">${roll("Region 2")}</a><a href="#">${roll("Region 3")}</a></div></li>
      </ul>
      <ul class="nj-sitemap__list">
        <li><a class="nj-sitemap__link" href="#">${roll("Home building consultation event")}</a></li>
        <li><a class="nj-sitemap__link" href="#">${roll("Completion tour")}</a></li>
        <li><a class="nj-sitemap__link" href="#" data-tab>${roll("Renovation")}</a><div class="nj-sitemap__sub"><a href="works.html">${roll("Installation Cases")}</a><a href="#">${roll("Inquiry")}</a></div></li>
        <li><a class="nj-sitemap__link" href="#" data-tab>${roll("Home Basics")}</a><div class="nj-sitemap__sub"><a href="#">${roll("Home-building steps")}</a><a href="#">${roll("Performance that supports daily life")}</a><a href="#">${roll("Warranty · Support")}</a></div></li>
        <li><a class="nj-sitemap__link" href="#">${roll("Individual consultation")}</a></li>
      </ul>
      <ul class="nj-sitemap__list">
        <li><a class="nj-sitemap__link" href="#">${roll("Frequently asked questions")}</a></li>
        <li><a class="nj-sitemap__link" href="news.html">${roll("News")}</a></li>
        <li><a class="nj-sitemap__link" href="#">${roll("Design room")}</a></li>
        <li><a class="nj-sitemap__link" href="#">${roll("Company info")}</a></li>
        <li><a class="nj-sitemap__link" href="#">${roll("Inquiry")}</a></li>
        <li><a class="nj-sitemap__link nj-sitemap__ext" href="#">${roll("The shape of home and life")}</a></li>
        <li><a class="nj-sitemap__link nj-sitemap__ext" href="#">${roll("Hiring Info")}</a></li>
      </ul>
    </nav>
    <div class="nj-sitemap__sns">
      <p class="nj-sitemap__snsTitle">Messenger chat support</p>
      <p class="nj-sitemap__snsText">Your two-line notice goes here saying small consultations on land, buildings, or budgets are accepted by messenger.</p>
      <div class="nj-sitemap__snsLink">${link("Consult via Messenger", "#", "is-white")}</div>
      <ul class="nj-sitemap__snsList">
        <li><a href="#"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="11" height="11" rx="3"/><circle cx="6" cy="6" r="2.4"/></svg>${roll("Instagram")}</a></li>
        <li><a href="#"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><rect x=".5" y="2" width="11" height="8" rx="2"/><path d="m5 4.4 2.6 1.6L5 7.6Z"/></svg>${roll("YouTube")}</a></li>
      </ul>
    </div>`;
  const bottom = `
    <div class="nj-bottom">
      <div class="nj-bottom__notes"><p class="nj-bottom__note">Registered architect office name here</p><p class="nj-bottom__note">One line of guidance about the design credit notation.</p></div>
      <div class="nj-bottom__others"><p class="nj-bottom__copy nj-num">© Company Name Co.,Ltd. All rights reserved.</p><a href="#">${roll("Privacy policy")}</a></div>
    </div>`;

  const loading = `
    <div class="nj-loading" data-slot="loader">
      <div class="nj-loading__logo">${logo("is-stack")}</div>
      <div class="nj-loading__content"><span class="nj-loading__icon"></span><p class="nj-loading__text">Loading</p></div>
    </div>`;
  const header = `
    <button class="nj-header__menu" type="button" aria-label="Open Menu"><span class="nj-header__dot"></span><span class="nj-header__menuText nj-num"><span>menu</span><span>close</span></span></button>
    <a class="nj-header__logo" href="index.html">${logo()}</a>
    <ul class="nj-header__cv">
      <li><a class="nj-header__cvLink is-contact" href="#"><svg class="nj-header__cvSvg" viewBox="0 0 76 32" preserveAspectRatio="none" aria-hidden="true"><path class="nj-header__cvBg" vector-effect="non-scaling-stroke" d="M6.5.5h63c3.3 0 6 2.7 6 6v19c0 3.3-2.7 6-6 6h-63c-3.3 0-6-2.7-6-6v-19c0-3.3 2.7-6 6-6Z"/></svg>${roll("Material Request")}</a></li>
      <li><a class="nj-header__cvLink is-model" href="#"><svg class="nj-header__cvSvg" viewBox="0 0 128 32" preserveAspectRatio="none" aria-hidden="true"><path class="nj-header__cvBg" vector-effect="non-scaling-stroke" d="M6.5.5h115c3.3 0 6 2.7 6 6v19c0 3.3-2.7 6-6 6h-115c-3.3 0-6-2.7-6-6v-19c0-3.3 2.7-6 6-6Z"/></svg>${roll("Model house tour")}</a></li>
    </ul>`;
  const cv = `
    <a class="nj-cv__section" href="#">
      <div class="nj-cv__bg"><div class="wf-img" data-label="Model home exterior · overcast day · eaves and garden · landscape"></div></div>
      <h2 class="nj-cv__title">Model house tour</h2>
      <p class="nj-cv__text">Your one-line note goes here: you can experience a life connected with nature firsthand.<br>Add one more line here on the number of model homes by region.</p>
      <span class="nj-cv__link">${roll("Book now")}${chip()}</span>
    </a>
    <a class="nj-cv__section" href="#">
      <div class="nj-cv__bg"><div class="wf-img" data-label="Garden-side veranda and chair · Green light · Landscape"></div></div>
      <h2 class="nj-cv__title">Material Request</h2>
      <p class="nj-cv__text">Your brochure bundling concepts and project cases here<br>Add a two-line sentence about sending it over.</p>
      <span class="nj-cv__link">${roll("Request materials")}${chip()}</span>
    </a>`;

  const put = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };
  // The loader curtain exists only on the first page — subpages show right away on a first visit, and on a return visit only the body turns on over .8s
  if (document.body.classList.contains("is-home")) document.body.insertAdjacentHTML("afterbegin", loading);
  const headerEl = put('[data-slot="header"]', header);
  const menuEl = put('[data-slot="menu"]', `<div class="nj-menu__inner"><div class="nj-sitemap">${sitemap}</div><div class="nj-menu__bottom">${bottom}</div></div>`);
  put('[data-slot="cv"]', cv);
  put('[data-slot="footer"]', `<div class="nj-sitemap">${sitemap}</div>${bottom}`);

  // Loader — only the first page opened in a session shows the curtain, after that only the body turns on with .8s linear
  const loadEl = document.querySelector(".nj-loading");
  const wrapper = document.querySelector(".nj-wrapper");
  const KEY = "nj-visited";
  let first = false;
  if (reduce || sessionStorage.getItem(KEY)) {
    loadEl?.remove();
    if (reduce) gsap.set(wrapper, { opacity: 1 });
    else gsap.to(wrapper, { duration: 0.8, opacity: 1, ease: "linear" });
  } else {
    first = true;
    sessionStorage.setItem(KEY, "true");
    gsap.set(wrapper, { opacity: 1 });
  }
  const onLoad = () => {
    if (!first || !loadEl) return;
    gsap.to(loadEl.querySelector(".nj-loading__logo"), {
      duration: 0.6, opacity: 1, ease: "linear", delay: 0.2,
      onComplete: () => gsap.to(loadEl, { duration: 0.6, opacity: 0, ease: "linear", delay: 0.6, onComplete: () => loadEl.remove() }),
    });
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);

  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.8, duration: 0.6, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.nj.lenis = lenis;

  // Header bar — switches to the panel (is-change) when it touches the band below the hero, and hides (is-hide) when it touches the two Contact panels
  const startAt = () => `top top+=${headerEl.clientHeight}px`;
  const change = document.querySelector("[data-header-change]");
  if (change) ScrollTrigger.create({ trigger: change, start: startAt, end: "bottom bottom", onEnter: () => headerEl.classList.add("is-change"), onLeaveBack: () => headerEl.classList.remove("is-change") });
  const hide = document.querySelector('[data-slot="cv"]');
  if (hide) ScrollTrigger.create({ trigger: hide, start: startAt, end: "bottom bottom", onEnter: () => headerEl.classList.add("is-hide"), onLeaveBack: () => headerEl.classList.remove("is-hide") });
  addEventListener("load", () => ScrollTrigger.refresh());
  new ResizeObserver(() => ScrollTrigger.refresh()).observe(document.body);

  // Menu panel — opened and closed with a button. Wheel over the panel isn’t passed on to the page
  const btn = headerEl.querySelector(".nj-header__menu");
  btn.addEventListener("click", () => {
    document.body.classList.toggle("is-menu-open");
    menuEl.classList.toggle("is-open");
    btn.classList.toggle("is-open");
  });
  menuEl.addEventListener("wheel", (e) => e.stopPropagation());
  // On phone, rows with a sub list are accordions: height 0 ↔ auto in .2s
  const sp = matchMedia("(max-width: 767px)");
  menuEl.querySelectorAll("[data-tab]").forEach((tab) => {
    const sub = tab.nextElementSibling;
    tab.addEventListener("click", (e) => {
      if (!sp.matches) return;
      e.preventDefault();
      const open = tab.classList.toggle("is-open");
      gsap.to(sub, { height: open ? "auto" : 0, duration: 0.2 });
    });
  });
  const syncTabs = () => menuEl.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.classList.remove("is-open");
    gsap.set(tab.nextElementSibling, { height: sp.matches ? 0 : "", overflow: sp.matches ? "hidden" : "" });
  });
  sp.addEventListener("change", syncTabs);
  syncTabs();
})();
