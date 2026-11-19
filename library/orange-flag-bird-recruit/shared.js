// Shared by all pages: draws the header, MENU drawer, footer and back to top, with header pinning (500px), drawer open and close (.4s),
// Text block float-up (20% below, 1.2s power2.out, when the section touches the bottom of the screen) · simpleParallax (1.4x · .3s · cubic-bezier(0,0,0,1)) ·
// Hooks up the infinite photo band (5s per photo), Lottie (our art: birds, lines, sparkles) and the left sticky table of contents.
(() => {
  const arrow = '<span class="mg-arrow" aria-hidden="true"></span>';
  const bird = '<div class="mg-bird mg-lottie" data-lottie="bird-move" aria-hidden="true"></div>';
  const nav = [
    { href: "index.html", en: "TOP", ja: "Careers site, first section" },
    { href: "about.html", en: "ABOUT US", ja: "Explore Combinations" },
    { href: "service.html", en: "WORK", ja: "Explore the work" },
    { href: "recruit.html", en: "VOICE", ja: "Our heroes" },
  ];
  const env = { href: "#environment", en: "ENVIRONMENT", ja: "Explore the work environment", kids: ["Employee benefits", "Talent Development"] };
  const entry = { href: "detail.html", en: "ENTRY", ja: "Application guidelines" };
  const link = (p) => `<a class="mg-menu__link" href="${p.href}"><span class="mg-bird-box">${bird}<span class="eng">${p.en}</span></span><span class="ja">${p.ja}</span></a>`;
  const logo = '<span class="mg-logo"><span class="mg-logo__mark"></span>LOGO</span>';
  const wave = (cls = "") => `<div class="mg-wave ${cls}" aria-hidden="true"><svg viewBox="0 0 1400 120" preserveAspectRatio="none"><path fill="currentColor" d="M0 60C180 10 330 0 520 34s330 86 520 60S1290 10 1400 30V120H0Z"/></svg></div>`;

  // MENU button·drawer are kept as siblings outside the header — so the fixed position isn’t tied to the header while it moves (Hero About y −40)
  const headEl = document.querySelector("[data-slot=header]");
  headEl?.insertAdjacentHTML("beforebegin", `
    <button class="mg-menuBtn" type="button" aria-controls="mg-menu" aria-expanded="false"><span class="mg-menuBtn__inner"><span class="mg-menuBtn__line"></span><span class="mg-menuBtn__text is-open">MENU</span><span class="mg-menuBtn__text is-close">CLOSE</span></span></button>
    <div class="mg-menu__overlay"></div>
    <div class="mg-menu" id="mg-menu" inert><div class="mg-menu__content">
      <div class="mg-menu__menus is-pc">
        <ul class="mg-menu__list">${nav.map((p) => `<li>${link(p)}</li>`).join("")}</ul>
        <ul class="mg-menu__list"><li>${link(env)}<ul class="mg-menu__children">${env.kids.map((k) => `<li><a class="mg-menu__child" href="${env.href}">${arrow}${k}</a></li>`).join("")}</ul></li><li>${link(entry)}</li></ul>
      </div>
      <div class="mg-menu__menus is-sp">
        <ul class="mg-menu__list">${[nav[0], nav[1], nav[2]].map((p) => `<li>${link(p)}</li>`).join("")}</ul>
        <ul class="mg-menu__list"><li>${link(nav[3])}</li><li>${link(env)}<ul class="mg-menu__children">${env.kids.map((k) => `<li><a class="mg-menu__child" href="${env.href}">${arrow}${k}</a></li>`).join("")}</ul></li></ul>
      </div>
      <a class="mg-menu__entry" href="${entry.href}"><span><span class="eng">ENTRY</span><span class="ja">Entry</span></span>${arrow}</a>
      <div class="mg-menu__buttons"><a class="mg-btn is-link is-sm" href="#">${arrow}<span class="text">Company Site</span></a><a class="mg-btn is-link is-sm" href="#">${arrow}<span class="text">Part-time hiring is here</span></a></div>
      ${wave("is-bottom")}
    </div></div>`);
  headEl?.insertAdjacentHTML("afterbegin", `
    <div class="mg-header__content">
      <h1 class="mg-header__logo"><a href="index.html">${logo}<span class="mg-header__logo-text">Your association name here<br>Recruiting site</span></a></h1>
      <a class="mg-header__button" href="detail.html"><span>Application guidelines</span></a>
    </div>`);
  headEl?.classList.add("mg-header");

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.classList.add("mg-footer");
    const col = (ps) => `<ul class="mg-footer__list">${ps.map((p) => `<li><a class="mg-footer__parent" href="${p.href}"><span class="eng">${p.en}</span><span class="ja">${p.ja}</span></a>${p.kids ? `<div class="mg-footer__sub">${p.kids.map((k) => `<a class="mg-footer__child" href="${p.href}">${arrow}${k}</a>`).join("")}</div>` : ""}</li>`).join("")}</ul>`;
    footer.innerHTML = `<div class="mg-wrap"><div class="mg-footer__inner">
        <div class="mg-footer__info"><a class="mg-footer__logo" href="index.html">${logo}<span class="mg-footer__logoText">Your union name, hiring site here</span></a>
          <address class="mg-footer__address">Head office 〒000-0000 Your address here 0-0</address>
          <div class="mg-footer__sns"><a href="#" aria-label="SNS 1"></a><a href="#" aria-label="SNS 2"></a><a href="#" aria-label="SNS 3"></a><a href="#" aria-label="SNS 4"></a></div></div>
        <nav class="mg-footer__menu">${col([nav[0], nav[1], nav[2], nav[3]])}${col([env, entry])}</nav>
        <div class="mg-footer__links"><a class="mg-btn is-link is-sm" href="#corporate">${arrow}<span class="text">Company Site</span></a><a class="mg-btn is-link is-sm" href="#part-time">${arrow}<span class="text">Part-time hiring is here</span></a></div>
      </div></div>
      <div class="mg-footer__content"><div class="mg-wrap"><a class="mg-footer__other" href="#">Privacy policy<span class="mg-tl-border"></span></a></div><p class="mg-footer__copy">Copyright © 0000 COMPANY All Rights Reserved.</p></div>
      <div class="mg-pagetop"><button type="button" aria-label="Back to top">${arrow}</button></div>`;
  }
  // Wave placeholders are swapped for wave drawings — pinned to the top and bottom edges relative to the section
  document.querySelectorAll("[data-wave]").forEach((el) => { el.outerHTML = wave(el.dataset.wave); });

  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement, body = document.body;

  // Header — past 500px of scrolling, a white .8 panel appears (original measures on every rAF)
  const head = document.querySelector(".mg-header"), top = document.querySelector(".mg-pagetop");
  const onScroll = () => {
    const y = scrollY;
    head?.classList.toggle("is-fixed", y > 500);
    top?.classList.toggle("is-fixed", y > 100);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  top?.querySelector("button").addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  // MENU drawer — is-menu-open on the body, closes on a backdrop or # link click
  const btn = document.querySelector(".mg-menuBtn"), menu = document.querySelector(".mg-menu");
  const setMenu = (on) => { body.classList.toggle("is-menu-open", on); btn.setAttribute("aria-expanded", String(on)); on ? menu.removeAttribute("inert") : menu.setAttribute("inert", ""); };
  btn?.addEventListener("click", () => setMenu(!body.classList.contains("is-menu-open")));
  document.querySelector(".mg-menu__overlay")?.addEventListener("click", () => setMenu(false));
  menu?.addEventListener("click", (e) => { if (e.target === menu) setMenu(false); });
  menu?.querySelectorAll("a[href*='#']").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("is-menu-open")) setMenu(false); });

  // Lottie — our artwork (lottie/data.js). The bird plays from the start on hover and stops on release / lines · sparkles play at times the page decides
  const L = window.mgLottie || {}, anims = new Map();
  const load = (el, opt = {}) => {
    const data = L[el.dataset.lottie];
    if (!data || !window.lottie) return null;
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: data, ...opt });
    anims.set(el, a);
    return a;
  };
  document.querySelectorAll(".mg-bird[data-lottie]").forEach((el) => {
    const a = load(el), host = el.closest(".mg-menu__link, a, .mg-bird-host");
    if (!a || !host || reduce) return;
    host.addEventListener("mouseenter", () => a.goToAndPlay(0, true));
    host.addEventListener("mouseleave", () => a.stop());
  });
  document.querySelectorAll("[data-lottie-loop]").forEach((el) => { const a = load(el, { loop: true }); if (a && !reduce) a.play(); });
  // Once the bird passes the screen center it flies off one time (js-lottie-bird)
  const birds = [...document.querySelectorAll("[data-lottie-scroll]")].map((el) => ({ el, a: load(el), played: false }));
  const birdScroll = () => birds.forEach((b) => { if (b.played || !b.a || !b.el.offsetParent) return; const r = b.el.getBoundingClientRect(); if (r.top + r.height / 2 < innerHeight / 2) { b.played = true; reduce ? b.a.goToAndStop(b.a.totalFrames - 1, true) : b.a.play(); } });
  if (birds.length) { addEventListener("scroll", birdScroll, { passive: true }); addEventListener("load", birdScroll); birdScroll(); }
  window.mgShared = { load, anims, reduce };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Text block — 1.2s power2.out from 20% of its own height below. By default when its top edge touches the screen bottom, top70 at the 70% line
    [[".mg-up", "top bottom"], [".mg-up-70", "top 70%"]].forEach(([sel, start]) => document.querySelectorAll(sel).forEach((el) => {
      gsap.fromTo(el, { y: "20%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: el, start } });
    }));
  });

  // simpleParallax — original options as they are (overflow·up·delay .3·cubic-bezier(0,0,0,1)·scale 1.4), the down and sideways types only change orientation
  if (window.simpleParallax && !reduce) {
    const o = { overflow: true, orientation: "up", delay: 0.3, transition: "cubic-bezier(0,0,0,1)", scale: 1.4 };
    const make = (sel, ori) => { const els = document.querySelectorAll(sel); if (els.length) new simpleParallax(els, { ...o, orientation: ori }); };
    make(".mg-plx:not(.is-bottom):not(.is-ltr):not(.is-rtl)", "up");
    make(".mg-plx.is-bottom", "down"); make(".mg-plx.is-ltr", "right"); make(".mg-plx.is-rtl", "left");
    const kick = () => requestAnimationFrame(() => requestAnimationFrame(() => dispatchEvent(new Event("resize"))));
    document.readyState === "complete" ? kick() : addEventListener("load", kick, { once: true });
    addEventListener("mgLoaderComplete", kick, { once: true });
  }

  // Infinite photo strip — one set is cloned to cover the screen and x is flowed with GSAP. One photo (plus gap) passes in speed ms
  document.querySelectorAll(".mg-infinite").forEach((wrap) => {
    const track = wrap.querySelector(".mg-infinite__track");
    if (!track || reduce) return;
    const speed = parseFloat(wrap.dataset.speed) || 3000, dir = wrap.dataset.direction || "forward";
    const items = [...track.children], gap = parseInt(getComputedStyle(track).gap) || 0;
    track.style.width = "max-content";
    const one = items[0].getBoundingClientRect().width, set = track.getBoundingClientRect().width, view = wrap.getBoundingClientRect().width;
    for (let k = 0; k < Math.ceil((view + set) / set); k++) items.forEach((it) => { const c = it.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c); });
    const dist = set + gap, from = dir === "forward" ? 0 : -dist, to = dir === "forward" ? -dist : 0, dur = (dist / (one + gap)) * (speed / 1000);
    const loop = () => { gsap.set(track, { x: from }); gsap.to(track, { x: to, duration: dur, ease: "none", onComplete: loop }); };
    loop();
  });

  // Left fixed contents — appears after passing the first section, and the last section past the 100px line from the top of the screen is the current one
  const side = document.querySelector(".mg-sidenav");
  if (side) {
    const links = [...side.querySelectorAll("a")], secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const spy = () => {
      const y = scrollY + 100;
      let now = secs[0];
      secs.forEach((s) => { if (y >= s.getBoundingClientRect().top + scrollY) now = s; });
      links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + now?.id));
      side.classList.toggle("is-show", secs[0] && scrollY + innerHeight * 0.5 > secs[0].getBoundingClientRect().top + scrollY);
    };
    addEventListener("scroll", spy, { passive: true }); addEventListener("resize", spy); spy();
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
