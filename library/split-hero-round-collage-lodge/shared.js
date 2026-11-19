// All pages — fill the header row and footer, and hook up the opening curtain, phone menu, ScrollSmoother, section title letters and photo reveal.
// Values are straight from the original scripts.js: curtain logo 1s power4.out (.1 delay) → curtain 1.5s power1.out (.1 delay), menu panel .6s expo.out x 100,
// ScrollSmoother smooth 1.15 · smoothTouch .2 · ease power4, title letters .8s at .05 stagger power4.out (top 98%), photo reveal at top 95% once.
(() => {
  const page = document.body.dataset.page;
  const home = page === "home";
  const href = (id) => (home ? `#${id}` : `index.html#${id}`);
  const MENU = [
    ["story", "OUR STORY", "Brand story section"],
    ["experience", "EXPERIENCE", "Stay experience section"],
    ["feature", "FEATURE", "Featured facility Section"],
    ["spec", "SPEC", "Room specs section"],
    ["access", "ACCESS", "Directions section"],
  ];
  // Same 531×197 panel as the original logo SVG — a three-droplet symbol + English wordmark
  const LOGO = `<svg class="fg-logo" viewBox="0 0 531 197" fill="currentColor" role="img" aria-label="Brand Title" data-label="Brand wordmark — three-droplet symbol + English name"><ellipse cx="42" cy="44" rx="30" ry="34" transform="rotate(-18 42 44)"/><ellipse cx="96" cy="94" rx="20" ry="22"/><ellipse cx="56" cy="148" rx="36" ry="40" transform="rotate(14 56 148)"/><text x="168" y="128" textLength="350" lengthAdjust="spacingAndGlyphs">NAME.</text></svg>`;
  const links = (cls) => MENU.map(([id, name, label]) => `<li><a href="${href(id)}" class="${cls} fg-scrollto" data-label="${label}">${name}</a></li>`).join("");

  const openingLogo = document.querySelector(".fg-opening__logo");
  if (openingLogo) openingLogo.innerHTML = LOGO;

  const header = document.querySelector('[data-slot="header"]');
  header.className = "fg-header";
  header.innerHTML = `<div class="fg-header__inner">
      <h1 class="fg-header__logo"><a href="${home ? "#top" : "index.html"}" class="fg-scrollto">${LOGO}</a></h1>
      <nav class="fg-header__nav">
        <ul class="fg-header__menu">${links("fg-uline")}</ul>
        <a href="#reserve" class="fg-btn fg-header__contact fg-scrollto" data-label="Book now button"><span>Book now</span></a>
      </nav>
    </div>`;

  const mobile = document.querySelector('[data-slot="mobile-menu"]');
  mobile.innerHTML = `<button class="fg-nav-trigger" type="button" aria-label="Open Menu" aria-expanded="false"><span></span></button>
    <div class="fg-nav-backdrop"></div>
    <div class="fg-nav"><ul class="fg-nav__menu"><li><a href="${home ? "#top" : "index.html"}" class="fg-scrollto">TOP</a></li>${links("")}</ul></div>`;

  const footer = document.querySelector('[data-slot="footer"]');
  footer.className = "fg-footer";
  footer.innerHTML = `<div class="fg-container fg-footer__inner">
      <a href="index.html" class="fg-footer__logo">${LOGO}</a>
      <div class="fg-footer__reserve" id="reserve">
        <div class="fg-reserve">
          <p class="fg-reserve__title">Book online here</p>
          <a href="#reserve" class="fg-btn fg-btn--lg" data-label="External booking site button — new window"><span>Booking site</span>
            <svg class="fg-btn__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 4h8v1.4H3.4v11.2h11.2V10H16v8H2z"/><path d="M11 2h7v7h-1.4V4.4l-6.6 6.6-1-1 6.6-6.6H11z"/></svg></a>
        </div>
      </div>
      <nav><ul class="fg-footer__menu">${links("fg-uline")}</ul></nav>
      <div class="fg-footer__contact"><ul><li>TEL <a href="#reserve">0000-00-0000</a></li><li><a href="#reserve">Contact Us</a></li></ul></div>
      <div class="fg-footer__sns"><a href="#reserve" aria-label="Social Media"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="24" height="24" rx="7"/><circle cx="15" cy="15" r="5.6"/><circle cx="22" cy="8" r="1.2" fill="currentColor" stroke="none"/></svg></a></div>
      <div class="fg-footer__copyright">&copy; NAME.</div>
    </div>`;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  ScrollTrigger.normalizeScroll(true);
  ScrollTrigger.config({ ignoreMobileResize: false });

  // Hero height — re-measured only when the width changes, so it doesn’t jitter when the address bar collapses
  let lastW = 0;
  const setVh = () => document.documentElement.style.setProperty("--js-vh", `${innerHeight + 1}px`);
  addEventListener("resize", () => { if (lastW === innerWidth) return; lastW = innerWidth + 1; setVh(); });
  setVh();

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerH = () => getComputedStyle(document.documentElement).getPropertyValue("--site-header-h").trim();

  // Phone menu — the panel pivots on the bottom right from 100px to the right at .6s expo.out, and the overlay turns on for the same length
  const trigger = mobile.querySelector(".fg-nav-trigger"), nav = mobile.querySelector(".fg-nav"), backdrop = mobile.querySelector(".fg-nav-backdrop");
  const HIDE = { autoAlpha: 0, x: 100, duration: 0.6, ease: "expo.out" }, SHOW = { autoAlpha: 1, x: 0, duration: 0.6, ease: "expo.out" };
  let opened = false;
  gsap.set(nav, { ...HIDE, transformOrigin: "right bottom" });
  gsap.set(backdrop, { autoAlpha: 0 });
  const openNav = () => {
    opened = true;
    [trigger, backdrop, nav].forEach((n) => n.classList.add("is-active"));
    trigger.setAttribute("aria-expanded", "true");
    gsap.to(backdrop, { autoAlpha: 1, duration: 0.6, ease: "expo.out" });
    gsap.to(nav, SHOW);
  };
  const closeNav = () => {
    if (!opened) return;
    opened = false;
    [trigger, backdrop, nav].forEach((n) => n.classList.remove("is-active"));
    trigger.setAttribute("aria-expanded", "false");
    gsap.to(backdrop, { autoAlpha: 0, duration: 0.6, ease: "expo.out" });
    gsap.to(nav, HIDE);
  };
  trigger.addEventListener("click", (e) => { e.preventDefault(); opened ? closeNav() : openNav(); });
  backdrop.addEventListener("click", (e) => { e.preventDefault(); closeNav(); });
  addEventListener("keyup", (e) => e.key === "Escape" && closeNav());

  const smoother = ScrollSmoother.create({
    wrapper: "#fg-smooth-wrapper", content: "#fg-smooth-content",
    smooth: reduce ? 0 : 1.15, smoothTouch: reduce ? 0 : 0.2, effects: !reduce, normalizeScroll: false, ease: "power4",
  });
  smoother.scrollTop(0);
  const scrollToId = (id) => {
    const el = id === "top" ? document.body : document.getElementById(id);
    if (!el) return false;
    closeNav();
    smoother.scrollTo(id === "top" ? 0 : el, true, `top ${headerH()}`);
    return true;
  };
  document.querySelectorAll(".fg-scrollto").forEach((a) => a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    if (h.startsWith("#") && scrollToId(h.slice(1))) e.preventDefault();
  }));

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    // Once when visible — photo cells run CSS transition via is-show, groups at .1s intervals
    const START = { start: "top 95%", once: true };
    if (conditions.still) {
      document.querySelectorAll('[data-inview="class"], [data-inview-batch-item]').forEach((n) => n.classList.add("is-show"));
      return;
    }
    gsap.utils.toArray('[data-inview="class"]').forEach((el) => ScrollTrigger.create({ trigger: el, toggleClass: { targets: el, className: "is-show" }, ...START }));
    gsap.utils.toArray('[data-inview="classBatch"]').forEach((group) => {
      const items = gsap.utils.toArray("[data-inview-batch-item]", group);
      if (!items.length) return;
      ScrollTrigger.create({ trigger: group, ...START, onEnter: () => items.forEach((n, i) => gsap.delayedCall(i * 0.1, () => n.classList.add("is-show"))) });
    });
    // Section title, split into letters that rise in turn from 100% below
    gsap.utils.toArray(".fg-split-title").forEach((el) => {
      const { chars } = new SplitText(el, { type: "chars,words" });
      gsap.set(el, { overflow: "hidden" });
      gsap.set(chars, { yPercent: 100 });
      gsap.to(chars, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 98%", once: true } });
    });
  });

  // Opening curtain — first page only. When the curtain starts to lift (1.5s before it ends), the page side starts its hero
  const openers = [];
  window.fgOnOpen = (fn) => openers.push(fn);
  const opening = document.querySelector(".fg-opening");
  const tl = gsap.timeline({ paused: true });
  if (opening && !reduce) {
    const logo = opening.querySelector(".fg-opening__logo");
    gsap.set(logo, { opacity: 0, filter: "blur(30px)" });
    tl.to(logo, { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power4.out", delay: 0.1 });
    tl.to(opening, { opacity: 0, duration: 1.5, ease: "power1.out", delay: 0.1, onStart: () => opening.classList.add("is-inactive") });
  }
  const run = () => new Promise((done) => {
    if (opening && !reduce) {
      tl.eventCallback("onStart", () => document.body.classList.add("is-visible"));
      tl.call(done, [], "-=1.5");
      tl.eventCallback("onComplete", () => gsap.set(opening, { autoAlpha: 0 }));
      tl.play();
    } else {
      if (opening) gsap.set(opening, { autoAlpha: 0 });
      document.body.classList.add("is-visible");
      done();
    }
  });
  let started = false;
  const start = async () => {
    if (started) return;
    started = true;
    const id = location.hash.slice(1);
    if (id) setTimeout(() => scrollToId(id), 100);
    await run();
    openers.forEach((fn) => fn());
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
  addEventListener("pageshow", start);
})();
