// One place builds the frame shared by every page (menu drawer, header, footer), and hooks up page transitions, scroll reveals, parallax and the flowing band.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) root.classList.add("cc-still");
  // With reduced motion, the background video stops on its first frame
  if (still) document.querySelectorAll("video[autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });

  // Of the original eight menu slots, pages not built (Dining, Company Info, Notices, Contact) link to the nearest page of ours
  const NAV = [
    ["About us", "about.html"],
    ["Shop Info", "shop.html"],
    ["Cooking", "shop.html"],
    ["Company info", "about.html"],
    ["Hiring Info", "recruit.html"],
    ["Blog · Video", "news.html"],
    ["Notice", "news.html"],
    ["Inquiry", "recruit.html#requirement"],
  ];
  const INSTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>';
  const burger = (extra = "") =>
    `<button class="cc-burger ${extra}" type="button" data-burger aria-haspopup="true" aria-expanded="false"><span class="wf-visually-hidden" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Open and close menu</span><span class="cc-burger__box"><span class="cc-burger__bar"></span><span class="cc-burger__bar"></span><span class="cc-burger__bar"></span></span></button>`;

  const chrome = document.querySelector('[data-cc="chrome"]');
  if (chrome) {
    chrome.outerHTML = `
<div class="cc-drawer" id="cc-drawer" aria-hidden="true" data-slot="menu-drawer" data-lenis-prevent>
  <div class="cc-drawer__bg"></div>
  <div class="cc-drawer__wrap" role="dialog" aria-modal="true">
    <div class="cc-drawer__head">${burger()}</div>
    <div class="cc-drawer__content">
      <div class="cc-drawer__photo" data-drawer-item><div class="wf-img cc-ph cc-ph--dark" data-label="Inside the shop · clerk behind the counter · warm bulb light · fills the full height"></div></div>
      <nav class="cc-drawer__nav">
        <ul class="cc-drawer__ul">${NAV.map(([t, h]) => `<li><a class="cc-drawer__link cc-vlink" href="${h}" data-drawer-item data-drawer-close>${t}</a></li>`).join("")}</ul>
        <a class="cc-drawer__sns" href="#" aria-label="Social Media" data-drawer-item>${INSTA}</a>
      </nav>
    </div>
  </div>
</div>
<header class="cc-header" data-slot="header"><div class="cc-header__in"><a class="cc-header__logo" href="index.html">COMPANY NAME INC.</a></div></header>
<div class="cc-header-burger">${burger()}</div>`;
  }

  const foot = document.querySelector('[data-cc="footer"]');
  if (foot) {
    foot.outerHTML = `
<footer class="cc-footer" data-slot="footer">
  <div class="cc-container">
    <a class="cc-footer__logo" href="index.html"><span class="cc-footer__mark">COMPANY<br>NAME<br>INC.</span></a>
    <ul class="cc-footer__nav">${NAV.map(([t, h]) => `<li><a class="cc-vlink" href="${h}">${t}</a></li>`).join("")}</ul>
    <p class="cc-footer__addr">〒000-0000 Your company address in one line 0F<span>000-000-0000</span></p>
    <div class="cc-footer__sns"><a href="#" aria-label="Social Media">${INSTA}</a></div>
    <p class="cc-footer__copy">2024 COMPANY NAME Inc.</p>
  </div>
</footer>
<div class="cc-footer-end" data-slot="footer-end">
  <p class="cc-footer-end__catch">Your closing sentence here,<br class="cc-br-sp"> Placed in short breaks,<br> The second line too<br class="cc-br-sp"> Keep it a similar length,<br> At the third line<br class="cc-br-sp"> That wraps it up.</p>
</div>`;
  }

  // News box, blog strip and recruit invite are used in the same Type across pages
  const BLOCKS = {
    entry: `<aside class="cc-entry" data-slot="boundary-photo-wall">
    <div class="cc-entry__bg" aria-hidden="true">
      <div class="cc-entry__col"><div class="wf-img cc-ph cc-ph--dark" data-label="Working staff"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Kitchen"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Toast"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Guest seating"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Cooking"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Smiling clerk"></div></div>
      <div class="cc-entry__col"><div class="wf-img cc-ph cc-ph--dark" data-label="Counter"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Meeting"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Serving"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Entrance"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Drinking glass"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Staff two"></div></div>
      <div class="cc-entry__col"><div class="wf-img cc-ph cc-ph--dark" data-label="Hand close-up"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Kitchen fire"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Smiling guest"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Training"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Add food"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Shop curtain"></div></div>
      <div class="cc-entry__col"><div class="wf-img cc-ph cc-ph--dark" data-label="Pour a beer"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Welcoming Guests"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Group photo"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Knife work"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Shop Night"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Checkout counter"></div></div>
      <div class="cc-entry__col"><div class="wf-img cc-ph cc-ph--dark" data-label="Smiling staff member"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Skewer"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Guest seating"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Kitchen two"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Glass Clink"></div><div class="wf-img cc-ph cc-ph--dark" data-label="Entrance, etc."></div></div>
    </div>
    <div class="cc-container">
      <div class="cc-entry__in">
        <h2 class="cc-entry__tit">Your one-line invitation goes here.</h2>
        <p class="cc-entry__body">Your first body line here. Break it into two short sentences.<br>The second line runs a bit longer and ends with a question.<br>The third line says they’re looking for people to join them.</p>
        <div class="cc-btn-wrap cc-btn-wrap--center"><a class="cc-btn cc-btn--base" href="recruit.html#requirement">Apply</a></div>
      </div>
    </div>
    <span class="wf-note">Five photo rows tilted -5.5deg flow in opposite directions (yPercent -5·8·-12·15·-20) · 50% navy overlay</span>
  </aside>`,
    blog: `<section class="cc-blog-sec" data-slot="blog-list">
    <div class="cc-noren">
      <h2 class="cc-noren__tit">Blog · Video</h2>
      <p class="cc-noren__lead">Your blog intro here<br>Set in two lines.</p>
    </div>
    <div class="cc-container">
      <div class="cc-blog-grid">
        <article class="cc-blog-card"><a class="cc-blog-card__link" href="news.html"><div class="cc-blog-card__img"><div class="wf-img cc-ph" data-label="Gathering photo or illustration · Landscape 5:3"></div></div><h3 class="cc-blog-card__tit">Your post title here</h3><p class="cc-blog-card__excerpt">Your two-line opening here. If too long, cut with an ellipsis at the end of the second line.</p></a><ul class="cc-cat"><li class="cc-cat__item"><a class="cc-cat__link" href="news.html">Category 1</a></li></ul></article>
        <article class="cc-blog-card"><a class="cc-blog-card__link" href="news.html"><div class="cc-blog-card__img"><div class="wf-img cc-ph" data-label="Education scene illustration · Bright colors · Landscape 5:3"></div></div><h3 class="cc-blog-card__tit">Your slightly longer article title here</h3><p class="cc-blog-card__excerpt">Your two-line opening here. If too long, cut with an ellipsis at the end of the second line.</p></a><ul class="cc-cat"><li class="cc-cat__item"><a class="cc-cat__link" href="news.html">Category 1</a></li></ul></article>
        <article class="cc-blog-card"><a class="cc-blog-card__link" href="news.html"><div class="cc-blog-card__img"><div class="wf-img cc-ph" data-label="Staff group photo · outdoors at night · landscape 5:3"></div></div><h3 class="cc-blog-card__tit">Your post title here</h3><p class="cc-blog-card__excerpt">Your two-line opening here. If too long, cut with an ellipsis at the end of the second line.</p></a><ul class="cc-cat"><li class="cc-cat__item"><a class="cc-cat__link" href="news.html">Category 2</a></li></ul></article>
        <article class="cc-blog-card"><a class="cc-blog-card__link" href="news.html"><div class="cc-blog-card__img"><div class="wf-img cc-ph cc-ph--dark" data-label="Navy logo plate when there is no photo · landscape 5:3"></div></div><h3 class="cc-blog-card__tit">Your post title here</h3><p class="cc-blog-card__excerpt">Your two-line opening here. If too long, cut with an ellipsis at the end of the second line.</p></a><ul class="cc-cat"><li class="cc-cat__item"><a class="cc-cat__link" href="news.html">Category 1</a></li></ul></article>
        <article class="cc-blog-card"><a class="cc-blog-card__link" href="news.html"><div class="cc-blog-card__img"><div class="wf-img cc-ph" data-label="Illustration of a server making a toast · landscape 5:3"></div></div><h3 class="cc-blog-card__tit">Your post title here</h3><p class="cc-blog-card__excerpt">Your two-line opening here. If too long, cut with an ellipsis at the end of the second line.</p></a><ul class="cc-cat"><li class="cc-cat__item"><a class="cc-cat__link" href="news.html">Category 3</a></li></ul></article>
        <article class="cc-blog-card"><a class="cc-blog-card__link" href="news.html"><div class="cc-blog-card__img"><div class="wf-img cc-ph cc-ph--dark" data-label="Navy logo plate when there is no photo · landscape 5:3"></div></div><h3 class="cc-blog-card__tit">Your post title here</h3><p class="cc-blog-card__excerpt">Your two-line opening here. If too long, cut with an ellipsis at the end of the second line.</p></a><ul class="cc-cat"><li class="cc-cat__item"><a class="cc-cat__link" href="news.html">Category 1</a></li></ul></article>
      </div>
      <div class="cc-btn-wrap cc-btn-wrap--center"><a class="cc-btn cc-btn--accent" href="news.html">View details</a></div>
    </div>
  </section>`,
    news: `
<aside class="cc-news-box" data-slot="news-box">
  <div class="cc-container">
    <div class="cc-news-box__wrap">
      <h2 class="cc-default-title">Notice</h2>
      <article class="cc-news-row"><div class="cc-news-row__time"><time>0000.00.00</time></div><h3 class="cc-news-row__tit"><a class="cc-news-row__link" href="news.html">Your notice title in one line here</a></h3></article>
      <article class="cc-news-row"><div class="cc-news-row__time"><time>0000.00.00</time></div><h3 class="cc-news-row__tit"><a class="cc-news-row__link" href="news.html">A slightly longer notice title here, cut with an ellipsis if it overflows</a></h3></article>
    </div>
  </div>
</aside>`,
  };
  document.querySelectorAll("[data-cc]").forEach((el) => { if (BLOCKS[el.dataset.cc]) el.outerHTML = BLOCKS[el.dataset.cc]; });

  // ---------- Smooth scroll — original Lenis lerp .2 ----------
  // The Lenis 1.0.10 build, same as the original, is exposed as window.lenis
  let lenis = null;
  const LenisCtor = window.Lenis || window.lenis;
  if (!still && LenisCtor) {
    lenis = new LenisCtor({ lerp: 0.2, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ccLenis = lenis;

  // ---------- Page transition — on first visit the curtain lifts up in 1s, on in-site navigation the curtain covers from below, then lifts in .6s on the next page ----------
  const page = document.querySelector(".cc-page");
  const overlay = document.querySelector(".cc-intro__overlay");
  const intro = document.querySelector(".cc-intro");
  const fromInside = sessionStorage.getItem("cc-inside") === "1";
  sessionStorage.removeItem("cc-inside");
  if (!still && overlay) {
    // The original lifts the curtain after window load
    gsap.set(page, { opacity: fromInside ? 0 : 1 });
    addEventListener("load", () => {
      if (fromInside) {
        gsap.set(overlay, { y: 0 });
        gsap.to(overlay, { y: "-100%", duration: 0.6, delay: 0.3, ease: "power4.out", onComplete: () => gsap.set(intro, { display: "none" }) });
        gsap.to(page, { opacity: 1, duration: 0.6, delay: 0.3, ease: "power4.out" });
      } else {
        gsap.to(overlay, { y: "-100%", duration: 1, delay: 0.5, ease: "power4.out", onComplete: () => gsap.set(intro, { display: "none" }) });
      }
    }, { once: true });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || a.host !== location.host) return;
      if (a.pathname === location.pathname && a.hash) return;
      e.preventDefault();
      sessionStorage.setItem("cc-inside", "1");
      gsap.set(intro, { display: "block" });
      gsap.fromTo(overlay, { y: "100%" }, { y: "0%", duration: 0.5, delay: 0.5, ease: "power4.out" });
      gsap.to(page, { opacity: 0, duration: 0.3, delay: 0.6, ease: "expo.inOut", onComplete: () => (location.href = a.href) });
    });
    addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      gsap.set(page, { opacity: 1 });
      gsap.set(intro, { display: "none" });
    });
  } else if (page) {
    page.style.opacity = 1;
  }

  // ---------- Menu drawer ----------
  const drawer = document.getElementById("cc-drawer");
  const burgers = document.querySelectorAll("[data-burger]");
  let opened = false;
  let itemsTween = null;
  const setExpanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", v));
  const openDrawer = () => {
    if (opened) return;
    opened = true;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    lenis?.stop();
    setTimeout(() => setExpanded(true), 200);
    itemsTween = gsap.fromTo(drawer.querySelectorAll("[data-drawer-item]"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: 0.04 });
  };
  const closeDrawer = () => {
    if (!opened) return;
    itemsTween?.pause();
    gsap.fromTo(drawer.querySelectorAll("[data-drawer-item]"), { opacity: 1, y: 0 }, {
      opacity: 0, y: 10, duration: 0.3, ease: "power1.out", stagger: 0.002,
      onComplete: () => {
        drawer.setAttribute("aria-hidden", "true");
        setExpanded(false);
        setTimeout(() => { drawer.classList.remove("is-open"); opened = false; lenis?.start(); }, 600);
      },
    });
  };
  burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  drawer?.querySelectorAll("[data-drawer-close]").forEach((a) => a.addEventListener("click", closeDrawer));
  addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

  // ---------- Hide the header and menu button while the hero is visible (only the first page has a hero) ----------
  const hero = document.querySelector("[data-hero]");
  const heads = [document.querySelector(".cc-header"), document.querySelector(".cc-header-burger")];
  if (hero) {
    new IntersectionObserver((es) => es.forEach((en) => heads.forEach((h) => h?.classList.toggle("is-hero", en.isIntersecting))), { threshold: 0 }).observe(hero);
  }

  // ---------- Once when visible — when it enters the area minus the bottom 20% of the screen ----------
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-visible");
    io.unobserve(en.target);
  }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Photo parallax — the original turns it off at 1024px and below
    if (!matchMedia("(max-width: 1024px)").matches) {
      gsap.utils.toArray("[data-px]").forEach((el) => {
        gsap.fromTo(el.querySelector("[data-px-in]"), { yPercent: 0 }, {
          yPercent: +el.dataset.px || -10, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    }
    // Recruiting-vibe photos, five rows
    const ys = [-5, 8, -12, 15, -20];
    document.querySelectorAll(".cc-entry__col").forEach((c, i) => {
      gsap.to(c, { yPercent: ys[i % 5], ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  // Auto-flowing photo strip — same Splide loop + AutoScroll as the original (speed px per frame, does not stop on hover). Food strip on the first page has gap 30 (phone 25·20), shop strip 10
  const AutoScroll = window.splide?.Extensions?.AutoScroll;
  document.querySelectorAll("[data-strip]").forEach((el) => {
    if (!window.Splide) return;
    const food = el.classList.contains("cc-shop__strip");
    const sp = new Splide(el, {
      type: "loop",
      arrows: false,
      pagination: false,
      drag: false,
      gap: food ? 30 : 10,
      autoWidth: true,
      autoScroll: { speed: still ? 0 : +el.dataset.strip || 0.5, pauseOnHover: false },
      breakpoints: food ? { 767: { gap: 25 }, 575: { gap: 20 } } : {},
    });
    sp.mount(AutoScroll ? { AutoScroll } : {});
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
