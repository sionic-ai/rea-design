// Draws the same header, menu drawer, retailer window and footer once here so all pages share them.
// The original is a CMS multi-page site with no page transition — left as ordinary navigation.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => innerWidth < 768;

  const ico = {
    cart: '<svg class="a-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 2h2.2l1.6 8.2h8l1.4-6H4"/><circle cx="6" cy="13.3" r="1"/><circle cx="12" cy="13.3" r="1"/></svg>',
    sns1: '<svg class="a-ico" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 7l16 16M23 7L7 23"/></svg>',
    sns2: '<svg class="a-ico" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="20" height="20" rx="6"/><circle cx="15" cy="15" r="4.6"/><circle cx="21" cy="9" r="0.9" fill="currentColor"/></svg>',
    sns3: '<svg class="a-ico" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 5v14a4.5 4.5 0 1 1-4.5-4.5M17 5c0 3 2.4 5.4 5.4 5.4"/></svg>',
    blank: '<svg class="a-ico" viewBox="0 0 8 8" fill="none" stroke="currentColor"><path d="M2 1h5v5M7 1L1 7"/></svg>',
  };
  const sns = `<ul class="a-sns">
      <li><a class="a-alpha" href="#" aria-label="SNS 1">${ico.sns1}</a></li>
      <li><a class="a-alpha" href="#" aria-label="SNS 2">${ico.sns2}</a></li>
      <li><a class="a-alpha" href="#" aria-label="SNS 3">${ico.sns3}</a></li>
    </ul>`;
  const subnav = `<ul class="a-subnav">
      <li><a class="a-en a-cap" href="#"><span class="a-line">contact</span></a></li>
      <li><a class="a-en a-cap" href="#"><span class="a-line">company</span></a></li>
      <li><a class="a-en a-cap" href="#"><span class="a-line">privacy policy</span></a></li>
    </ul>`;
  const home = page === "home" ? "" : "index.html";

  const header = `
  <div class="a-nav-overlay js-nav-overlay"></div>
  <header class="a-header js-header" data-slot="header">
    <div class="a-header__inner">
      <h1 class="a-header__logo"><a class="a-alpha" href="index.html"><span class="a-wordmark">Logo</span><span class="a-sr">Your brand name here</span></a></h1>
      <button class="a-cart js-cart" type="button" data-micromodal-trigger="mdl-cv" data-slot="cart-pill">
        <span class="a-cart__in"><span class="a-cart__icon">${ico.cart}</span><span class="a-cart__txt">Buy Now</span></span>
      </button>
      <button class="a-navbtn js-navbtn" type="button" aria-expanded="false" aria-controls="a-nav">
        <span class="a-navbtn__txt a-en a-cap" data-k="menu" aria-hidden="false">menu</span>
        <span class="a-navbtn__txt a-en a-cap" data-k="close" aria-hidden="true">Close</span>
        <span class="a-navbtn__lines"><span class="a-navbtn__line"></span><span class="a-navbtn__line"></span></span>
      </button>
      <nav id="a-nav" class="a-nav js-nav" data-slot="menu-drawer" aria-label="Menu">
        <ul class="a-nav-list a-en a-cap">
          <li class="a-nav-list__item"><a class="a-nav-list__link" href="${home}#about"><span class="a-line">menu 1</span></a></li>
          <li class="a-nav-list__item"><a class="a-nav-list__link" href="${home}#point"><span class="a-line">menu 2</span></a></li>
          <li class="a-nav-list__item"><a class="a-nav-list__link" href="list.html"><span class="a-line">menu 3</span></a>
            <ul class="a-nav-list__child">
              <li><a href="detail.html"><span class="a-line">Your product name 1 here: Shampoo / Treatment</span></a></li>
              <li><a href="detail.html"><span class="a-line">Your product name 2 here: Shampoo / Treatment</span></a></li>
            </ul>
          </li>
          <li class="a-nav-list__item"><a class="a-nav-list__link" href="${home}#shop"><span class="a-line">menu 4</span></a></li>
          <li class="a-nav-list__item"><a class="a-nav-list__link" href="${home}#online"><span class="a-line">menu 5</span></a></li>
          <li class="a-nav-list__item"><a class="a-nav-list__link" href="${home}#topics"><span class="a-line">menu 6</span></a></li>
        </ul>
        <div class="a-nav-foot">${sns}${subnav}<p class="a-nav-copy a-en">&copy; Your Brand All Rights Reserved.</p></div>
      </nav>
    </div>
  </header>`;

  const shops = ["Shopping Mall 1", "Shopping Mall 2", "Shopping Mall 3", "Shopping Mall 4", "Official online store"]
    .map((t, i) => `<li class="a-btn is-ghost-ink"><a class="a-btn__in" href="#"><span class="a-btn__txt">${i === 4 ? `<span class="a-btn__txt-icon">${ico.cart}</span>` : ""}${t}</span><span class="a-btn__icon">${ico.blank}</span></a></li>`)
    .join("");
  const cvModal = `
  <section class="a-modal js-modal" id="mdl-cv" aria-hidden="true" data-slot="buy-modal">
    <div class="a-modal__overlay" data-micromodal-close>
      <div class="a-modal__box" role="dialog" aria-modal="true" aria-label="Place of purchase">
        <div class="a-modal__head"><button class="a-modal__close a-en" type="button" data-micromodal-close>close</button></div>
        <div class="a-modal__content">
          <div class="a-modal__inner">
            <p class="a-cv__head a-en a-cap">online store</p>
            <div class="a-cv__img"><div class="wf-img a-ph-amber" style="aspect-ratio:470/352" data-label="Product · two rows of four bottles · on a wooden stand · amber side light · landscape 4:3"></div></div>
            <ul class="a-cv__list">${shops}</ul>
          </div>
        </div>
      </div>
      <div class="a-modal__bg"></div>
    </div>
  </section>`;

  // The parallax photo above the footer exists only on the first page (subpages have the footer right under the breadcrumb)
  const para = page !== "home" ? "" : `
  <div class="a-fpara js-fpara" data-slot="footer-parallax">
    <div class="a-fpara__img wf-img a-ph-amber" data-label="Four product bottles side by side · old wooden tabletop · warm backlight · wide landscape"></div>
  </div>`;
  const footer = `${para}
  <footer class="a-footer js-footer" data-slot="footer">
    <div class="a-footer__inner a-full">
      <div class="a-footer__logo"><a class="a-alpha" href="index.html" aria-label="Back to start"><span class="a-wordmark">Logo</span></a></div>
      ${sns}${subnav}
      <p class="a-footer__cr a-en">&copy; Your Brand All Rights Reserved.</p>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  const foot = document.querySelector("[data-a-footer]");
  if (foot) foot.outerHTML = cvModal + footer;
  else document.body.insertAdjacentHTML("beforeend", cvModal + footer);

  const headerEl = document.querySelector(".js-header");
  headerEl.classList.add("is-init");
  addEventListener("load", () => requestAnimationFrame(() => requestAnimationFrame(() => headerEl.classList.remove("is-init"))));
  const updateHeader = () => {
    // Always on for article pages, on the first page and product page only when the body turns on after the photo header
    const on = page === "news" || document.querySelector("[data-header-bg].is-active");
    headerEl.classList.toggle("has-bg", !!on);
  };

  /* Menu Drawer */
  const navBtn = document.querySelector(".js-navbtn");
  const nav = document.querySelector(".js-nav");
  const overlay = document.querySelector(".js-nav-overlay");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    navBtn.classList.toggle("is-open", open);
    navBtn.setAttribute("aria-expanded", open);
    navBtn.querySelector('[data-k="menu"]').setAttribute("aria-hidden", open);
    navBtn.querySelector('[data-k="close"]').setAttribute("aria-hidden", !open);
    overlay.style.display = open && innerWidth < 1024 ? "block" : "none";
  };
  navBtn.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  overlay.addEventListener("click", () => setNav(false));
  nav.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", () => setNav(false)));

  /* Window: same MicroModal as the original — on open 0.6s fade + rises 20px, on close it rises -20px while vanishing (closes after the keyframes finish).
     When opened, the video window plays the visible version (PC landscape, phone portrait) from the start, and stops when closed (the original’s YouTube playVideo·stopVideo spot) */
  const movieOf = (m) => [...m.querySelectorAll("video[data-src]")].find((v) => v.offsetParent !== null);
  if (window.MicroModal) MicroModal.init({
    disableScroll: true, disableFocus: true, awaitOpenAnimation: true, awaitCloseAnimation: true,
    onShow: (m) => {
      const v = movieOf(m);
      if (!v) return;
      if (!v.src) v.src = v.dataset.src;
      v.currentTime = 0;
      v.play().catch(() => {});
    },
    onClose: (m) => m.querySelectorAll("video").forEach((v) => v.pause()),
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* Collapsible Q&A: height and opacity at 300ms linear */
  document.querySelectorAll(".js-details").forEach((d) => {
    const sum = d.querySelector("summary");
    const body = d.querySelector(".js-details-content");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = "1";
      if (d.open) {
        d.classList.remove("is-open");
        const a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], { duration: reduce ? 0 : 300, easing: "linear" });
        a.onfinish = () => { d.open = false; delete d.dataset.busy; };
      } else {
        d.open = true;
        d.classList.add("is-open");
        const a = body.animate([{ height: 0, opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: reduce ? 0 : 300, easing: "linear" });
        a.onfinish = () => delete d.dataset.busy;
      }
    });
  });

  /* English title fades in with blur + cover mask */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-animated");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".a-reveal").forEach((el) => io.observe(el));

  gsap.registerPlugin(ScrollTrigger);

  /* Section state on: the original default start is ”element top at screen middle”, once past it stays on, and it turns off when scrolled back up */
  const startOf = (el) => (isSp() && el.dataset.startSp) || el.dataset.start || "top bottom-=50%";
  // Video background section (is-video) tells index.js to fetch and play the video when it turns on
  const turnOn = (el) => { el.classList.add("is-active"); updateHeader(); el.dispatchEvent(new Event("ap:st-on", { bubbles: true })); };
  const turnOff = (el) => { el.classList.remove("is-active"); updateHeader(); };
  document.querySelectorAll(".js-st").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: () => startOf(el),
      invalidateOnRefresh: true,
      onEnter: () => turnOn(el),
      onEnterBack: () => turnOn(el),
      onLeaveBack: () => turnOff(el),
      onRefresh: (st) => (st.isActive || st.progress > 0 || st.scroll() >= st.start ? turnOn(el) : turnOff(el)),
    });
  });
  updateHeader();

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* Photo above the footer: scrub 1.1 with yPercent -20→-30 (phone -12→-22) */
    document.querySelectorAll(".js-fpara").forEach((wrap) => {
      gsap.fromTo(wrap.firstElementChild,
        { yPercent: () => (isSp() ? -12 : -20) },
        { yPercent: () => (isSp() ? -22 : -30), ease: "none",
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 1.1, invalidateOnRefresh: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".js-fpara").forEach((wrap) => gsap.set(wrap.firstElementChild, { yPercent: -25 }));
  });

  /* In-page # link: scrolls over 0.75s power2.out */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const y = Math.max(scrollY + t.getBoundingClientRect().top, 0);
    if (reduce) return scrollTo(0, y);
    const s = { y: scrollY };
    gsap.to(s, { y, duration: 0.75, ease: "power2.out", overwrite: "auto", onUpdate: () => scrollTo(0, s.y) });
  });

  window.AP = { page, isSp, reduce, updateHeader };
})();
