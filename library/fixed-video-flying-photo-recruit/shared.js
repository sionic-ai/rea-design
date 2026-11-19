// Draws the frame all pages share (header, dropdown, menu drawer, recruiting panel, footer) in one place, and
// Attach the loader, page transition, character-roll hover, header card transition, and show-once on view.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) root.classList.add("ky-still");

  const ARROW_PATH = '<path d="M16.9 10.6 21.3 15l-4.4 4.4-1-1 2.7-2.7H9v-1.4h9.6l-2.7-2.7z"/>';
  const arrow = () => `<span class="ky-arrow" aria-hidden="true"><svg class="ky-arrow__a" viewBox="0 0 30 30">${ARROW_PATH}</svg><svg class="ky-arrow__b" viewBox="0 0 30 30">${ARROW_PATH}</svg></span>`;
  const EXT = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M7 0h5v5h-1.2V2L5.4 7.4l-.8-.8L10 1.2H7zM0 2h5v1.2H1.2v7.6h7.6V7H10v5H0z"/></svg>';
  window.kyArrow = arrow;

  // Original menu pages that weren’t recorded (talk·interview detail·support form) link to our closest page
  const WORK_CHILD = [["View in numbers", "work.html#number"], ["A day at work", "work.html#oneday"], ["Steps before getting started", "work.html#flow"], ["Training and support system", "work.html#system"], ["Frequently asked questions", "work.html#faq"]];
  const NAV_L = [["First Page", "Top", "index.html"], ["Getting to know ”Work”", "Our Work", "work.html", WORK_CHILD]];
  const NAV_R = [["Interview", "Crosstalk", "index.html#crosstalk"], ["Staff Interview", "Interview", "index.html#interview"], ["Company info", "Company", "about.html"], ["Blog and alerts", "Blog & News", "news.html"], ["Apply", "Entry", "recruit.html#contact"]];
  const navList = (items, attrs = "") => `<ul class="ky-navlist">${items.map(([ja, en, href, kids]) => `
      <li class="ky-navlist__li" ${attrs}><a class="ky-navlist__link" href="${href}" data-roll><span class="ky-navlist__ja">${ja}</span><span class="ky-navlist__en" data-roll-target>${en}</span></a>${kids ? `
        <ul class="ky-navlist__child">${kids.map(([t, h]) => `<li ${attrs}><a href="${h}" data-roll><span data-roll-target>${t}</span></a></li>`).join("")}</ul>` : ""}
      </li>`).join("")}</ul>`;
  const banner = (attrs = "") => `
    <div class="ky-banner"><a class="ky-banner__link ky-hov" href="recruit.html" ${attrs}>
      <div class="ky-banner__fig"><div class="wf-img ky-ph" data-label="Three uniformed staff · under a clear sky · landscape 4:5"></div></div>
      <div class="ky-banner__body"><span class="ky-banner__tit">Application guidelines</span><span class="ky-banner__sub">Your recruitment here<br>Place one line</span></div>
      <span class="ky-banner__arrow">${arrow()}</span>
    </a></div>`;
  const burger = () => `<button class="ky-burger" type="button" data-burger aria-expanded="false" aria-controls="ky-drawer"><span class="ky-sr">Open and close menu</span><span class="ky-burger__box"><span class="ky-burger__bar"></span><span class="ky-burger__bar"></span><span class="ky-burger__bar"></span></span></button>`;
  const logo = (cls = "") => `<a class="ky-logo ${cls}" href="index.html"><span class="ky-logo__img"><span class="ky-logo__mark">LOGO</span><span class="ky-logo__sub">Company name Inc.</span></span><span class="ky-logo__str">Your job site name here</span></a>`;

  const BLOCKS = {
    chrome: `
<div class="ky-drawer" id="ky-drawer" aria-hidden="true" data-slot="menu-drawer">
  <div class="ky-drawer__bg"></div>
  <div class="ky-drawer__box">
    <div class="ky-drawer__head">${burger()}</div>
    <div class="ky-drawer__content">
      <nav class="ky-drawer__nav" aria-label="Drawer Menu">${navList(NAV_L, "data-drawer-item")}${navList(NAV_R, "data-drawer-item")}</nav>
      <div class="ky-drawer__rec" data-drawer-item>${banner("data-drawer-close")}</div>
      <ul class="ky-drawer__ext">
        <li data-drawer-item><a href="#" data-roll><span data-roll-target>Company Website</span>${EXT}</a></li>
        <li data-drawer-item><a href="#" data-roll><span data-roll-target>Privacy policy</span></a></li>
      </ul>
    </div>
  </div>
</div>
<header class="ky-header" data-slot="header">
  <div class="ky-header__wrap">
    ${logo()}
    <nav class="ky-gnav" aria-label="Main menu"><ul class="ky-gnav__ul">
      <li class="ky-gnav__li ky-gnav__drop">
        <button class="ky-gnav__link" type="button" aria-haspopup="true"><span class="ky-gnav__str">Getting to know ”Work”</span><span class="ky-gnav__icon"></span></button>
        <nav class="ky-drop" data-slot="dropdown"><div class="ky-drop__bg"><div class="ky-drop__wrap">
          <a class="ky-drop__btn ky-hov" href="work.html" data-roll><span data-roll-target>Getting to know ”Work”</span>${arrow()}</a>
          <ul class="ky-drop__ul">${WORK_CHILD.map(([t, h], i) => `<li><a class="ky-drop__link" href="${h}" data-roll><div class="ky-drop__fig"><div class="wf-img ky-ph" data-label="${["Hand passing a delivery box", "Set off by bicycle", "In-center consultation", "Training with seniors", "Back view in front of elevator"][i]} · Landscape 3:2"></div></div><span class="ky-drop__str" data-roll-target>${t}</span></a></li>`).join("")}</ul>
        </div></div></nav>
      </li>
      <li class="ky-gnav__li"><a class="ky-gnav__link" href="index.html#interview" data-roll><span data-roll-target>Staff Interview</span></a></li>
      <li class="ky-gnav__li"><a class="ky-gnav__link" href="index.html#crosstalk" data-roll><span data-roll-target>Interview</span></a></li>
      <li class="ky-gnav__li"><a class="ky-gnav__link" href="about.html" data-roll><span data-roll-target>Company info</span></a></li>
    </ul></nav>
    <div class="ky-header__rec"><a class="ky-btn ky-btn--navy ky-hov" href="recruit.html"><span class="ky-btn__str">Application guidelines</span>${arrow()}</a></div>
    <div class="ky-header__entry"><a class="ky-btn ky-hov" href="recruit.html#contact"><span class="ky-btn__str">Apply</span>${arrow()}</a></div>
    <div class="ky-header__burger">${burger()}</div>
  </div>
</header>`,
    entry: `
<aside class="ky-entry" data-slot="entry-cta">
  <div class="ky-fluid">
    <a class="ky-entry__link ky-noise ky-hov" href="recruit.html#contact" data-reveal>
      <div class="ky-entry__body">
        <h2><div class="ky-entry__en">Work With Us</div><div class="ky-entry__ja">Apply</div></h2>
        <p class="ky-entry__text">One sentence here encouraging people to apply.<br>End the second line by saying we are waiting.</p>
        <span class="ky-entry__arrow">${arrow()}</span>
      </div>
    </a>
  </div>
</aside>`,
    footer: `
<footer class="ky-footer" data-slot="footer">
  <div class="ky-footer__top">
    <nav class="ky-footer__nav" aria-label="Footer Menu">${navList(NAV_L.slice(1))}${navList(NAV_R)}</nav>
    <div class="ky-footer__side">
      ${banner()}
      <div class="ky-footer__ext"><a href="#" data-roll><span data-roll-target>Company Website</span> ${EXT}</a></div>
      ${logo("ky-footer__logo")}
      <address class="ky-footer__addr">〒000-0000 Your company address in one line<br>TEL 000-000-0000</address>
    </div>
  </div>
  <div class="ky-footer__bottom">
    <a class="ky-footer__pp" href="#" data-roll><span data-roll-target>Privacy policy</span></a>
    <p class="ky-footer__copy">©company-name All Rights Reserved.</p>
  </div>
</footer>`,
  };
  document.querySelectorAll("[data-ky]").forEach((el) => {
    const k = el.dataset.ky;
    if (k === "crumb") {
      const trail = JSON.parse(el.dataset.trail || "[]");
      el.outerHTML = `<div class="ky-container"><ol class="ky-crumb" aria-label="Current location"><li><a href="index.html">Home</a></li>${trail.map(([t, h]) => (h ? `<li><a href="${h}">${t}</a></li>` : `<li aria-current="page">${t}</li>`)).join("")}</ol></div>`;
    } else if (BLOCKS[k]) el.outerHTML = BLOCKS[k];
  });
  document.querySelectorAll("[data-arrow]").forEach((el) => (el.outerHTML = arrow()));

  // ---------- Loader · page transition — from outside the site shows the Loading loader, from inside a .6s fade ----------
  const page = document.querySelector(".ky-page");
  const intro = document.querySelector(".ky-intro");
  const inside = sessionStorage.getItem("ky-inside") === "1";
  sessionStorage.removeItem("ky-inside");
  const fireEnd = () => dispatchEvent(new CustomEvent("ky:ready"));
  if (still || !page) {
    if (intro) intro.style.display = "none";
    if (page) page.style.opacity = 1;
    setTimeout(fireEnd, 0);
  } else if (!inside && intro) {
    gsap.set(page, { opacity: 1 });
    gsap.set(".ky-intro__text span", { y: 5 });
    const catchChars = document.querySelectorAll("[data-catch] span");
    gsap.set(catchChars, { opacity: 0 });
    const tl = gsap.timeline({ onComplete: fireEnd });
    tl.to(".ky-intro__text span", { y: 0, opacity: 1, duration: 1, stagger: 0.2, repeat: 1, repeatDelay: 0.1, ease: "power4.out" });
    tl.to(".ky-intro__text", { opacity: 0, duration: 0.5, delay: 0.2, ease: "power4.out" });
    tl.to(".ky-intro__overlay", { opacity: 0, duration: 1.5, ease: "power4.out", onComplete: () => gsap.set(intro, { display: "none" }) }, "<");
    if (catchChars.length) tl.to(catchChars, { delay: 1, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out" }, "<");
  } else {
    if (intro) intro.style.display = "none";
    gsap.to(page, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out", onComplete: fireEnd });
  }
  const samePageHash = (a) => a.pathname === location.pathname && a.hash;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href === "#" ) return e.preventDefault();
    if (href.startsWith("#") || samePageHash(a)) return;
    if (a.target === "_blank" || a.host !== location.host || still) return;
    e.preventDefault();
    sessionStorage.setItem("ky-inside", "1");
    gsap.to(page, { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: a.closest(".ky-drawer") ? 1 : 0.3, onComplete: () => (location.href = a.href) });
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted) { gsap.set(page, { opacity: 1 }); if (intro) intro.style.display = "none"; }
  });

  // ---------- In-page # navigation — offset by the header height, 1s ----------
  const header = document.querySelector(".ky-header");
  const toHash = (hash, dur = 1) => {
    const t = hash && document.querySelector(hash);
    if (!t) return;
    const y = t.getBoundingClientRect().top + scrollY - (header?.querySelector(".ky-header__wrap").offsetHeight || 0);
    if (still) return scrollTo(0, y);
    gsap.to(window, { scrollTo: y, duration: dur, ease: "power2.inOut" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.length > 1 && (href.startsWith("#") || samePageHash(a))) { e.preventDefault(); closeDrawer(); toHash(a.hash); }
  });
  addEventListener("ky:ready", () => location.hash && setTimeout(() => toHash(location.hash, 0.01), 200));

  // ---------- Letter roll hover — front letters rise and fade in .6s, back letters come from below in .4s ----------
  // Original curve name is "expo.inout"(lowercase) so GSAP can’t read it and falls back to the default power1.out — copy the curve that actually plays on screen
  CustomEase.create("kyLink", ".115,.405,.24,1");
  if (!still && !matchMedia("(hover: none)").matches) {
    document.querySelectorAll("[data-roll]").forEach((el) => {
      const t = el.querySelector("[data-roll-target]");
      if (!t) return;
      const html = t.innerHTML;
      const label = t.textContent.trim();
      t.innerHTML = `<span data-roll-a aria-hidden="true">${html}</span><span data-roll-b aria-hidden="true">${html}</span>`;
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", label);
      const a = t.querySelector("[data-roll-a]");
      const b = t.querySelector("[data-roll-b]");
      el.addEventListener("mouseenter", () => {
        gsap.fromTo(a, { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "power1.out" });
        gsap.fromTo(b, { y: "105%" }, { y: "0%", duration: 0.4, ease: "kyLink" });
      });
    });
  }

  // ---------- Menu drawer ----------
  const drawer = document.getElementById("ky-drawer");
  const burgers = document.querySelectorAll("[data-burger]");
  let opened = false;
  let itemsTween = null;
  const setExpanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", v));
  const openDrawer = () => {
    if (opened || !drawer) return;
    opened = true;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => setExpanded(true), 200);
    drawer.querySelector(".ky-drawer__box").scrollTop = 0;
    itemsTween = gsap.fromTo(drawer.querySelectorAll("[data-drawer-item]"), { opacity: 0 }, { opacity: 1, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: 0.04 });
  };
  function closeDrawer() {
    if (!opened) return;
    itemsTween?.pause();
    gsap.fromTo(drawer.querySelectorAll("[data-drawer-item]"), { opacity: 1 }, {
      opacity: 0, duration: 0.3, ease: "power1.out", stagger: 0.002,
      onComplete: () => {
        drawer.setAttribute("aria-hidden", "true");
        setExpanded(false);
        setTimeout(() => { drawer.classList.remove("is-open"); document.body.style.overflow = ""; opened = false; }, 1400);
      },
    });
  }
  burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

  // ---------- When the header touches [data-not-top] it becomes a floating white card — if absent, it is a card from the start ----------
  const notTop = document.querySelector("[data-not-top]");
  const setTop = (v) => document.body.classList.toggle("is-not-top", v);
  if (notTop && header) {
    ScrollTrigger.create({
      trigger: notTop, start: () => `-${header.offsetHeight}px top`, endTrigger: document.body, end: "bottom bottom",
      onEnter: () => setTop(true), onEnterBack: () => setTop(true), onLeaveBack: () => setTop(false),
    });
  } else setTop(true);

  // ---------- Once when visible — when it enters the area minus the bottom 20% of the screen ----------
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    const d = +en.target.dataset.revealDelay || 0;
    setTimeout(() => en.target.classList.add("is-visible"), d * 1000);
    io.unobserve(en.target);
  }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  addEventListener("load", () => ScrollTrigger.refresh());
})();
