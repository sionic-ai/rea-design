// Shared by all pages: builds the header, menu panel, MYPAGE window, RECRUIT INFO and red footer, and hooks up open and close.
// Original values — menu panel xPercent 90→0 .6s expo.out · line groups switch on at .2/.4/.52s · /// bars ±14px .24s power3.out · middle bar 54° .24s (at .3s)
// Close line .2s power3.in · panel xPercent 130 .3s sine.in (at .1s) · opacity .2s (at .32s). MYPAGE window .4s sine.out / close .4s power2.out.
// Fade-up (.js-inview) starts 200ms after the font loads, once when it enters above the bottom 15% of the screen.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => matchMedia("(max-width: 768px)").matches;

  const arrow = '<svg class="kk-arrow" viewBox="0 0 40 9" aria-hidden="true"><rect x="0" y="4" width="38" height="1"/><path d="M34.5 .5l4 4-4 4"/></svg>';
  const logo = '<svg class="kk-logo" viewBox="0 0 159 25" aria-label="Company name"><text x="0" y="23">COMPANY</text></svg>';
  const bar = (n) => `<svg class="kk-burger__bar kk-burger__bar--${n}" viewBox="0 0 14 13" aria-hidden="true"><path d="M8 0h6L6 13H0z"/></svg>`;
  const ig = '<svg viewBox="0 0 19 19" aria-hidden="true"><rect x="1.5" y="1.5" width="16" height="16" rx="4.5"/><circle cx="9.5" cy="9.5" r="3.8"/></svg>';
  const NAV = [
    ["TOP", "index.html"], ["PEOPLE", "list.html"], ["PROJECT STORY", "works.html"],
    ["CEO MESSAGE", "index.html#ceo"], ["HR MESSAGE", "index.html#hr"], ["Business areas", "index.html#business", 0, 1],
    ["Job Type Introduction", "index.html#business", 0, 1], ["Employee benefits", "index.html#hr", 0, 1], ["Hiring Info", "index.html#info", 0, 1], ["Q&A", "index.html#info"],
  ];
  const navItems = NAV.map(([t, h, , ko]) => `<li><a class="kk-navlink kk-arrow-link${ko ? " is-ko" : ""}" href="${h}">${t}${arrow}</a></li>`).join("");
  const lineBtns = '<li><a class="kk-line-btn" href="#">00<strong>Apply for cohort</strong></a></li><li><a class="kk-line-btn" href="#">00<strong>Flag</strong> MYPAGE</a></li><li><a class="kk-line-btn" href="#">INTERNSHIP</a></li>';

  document.body.insertAdjacentHTML("afterbegin", `
<header class="kk-header" data-slot="header"><div class="kk-header__wrap"><div class="kk-header__title"><a href="index.html">${logo}</a><p class="kk-header__sub">RECRUITING</p></div></div></header>
<nav class="kk-nav" data-slot="header-nav"><ul class="kk-nav__list"><li><button class="kk-nav__btn js-mypage-open" type="button">MYPAGE</button></li><li><a class="kk-nav__btn" href="#">INTERNSHIP</a></li></ul></nav>
<button class="kk-burger js-menu-open" type="button" aria-label="Open Menu" data-slot="menu-button"><span class="kk-burger__inner">${bar(1)}${bar(2)}${bar(3)}</span></button>
<div class="kk-menu" data-slot="menu-drawer"><div class="kk-menu__content"><div class="kk-menu__inner">
  <ul class="kk-menu__group kk-menu__main">${navItems}</ul>
  <ul class="kk-menu__group kk-menu__aside">${lineBtns}</ul>
  <ul class="kk-menu__group kk-menu__sns"><li><a class="kk-sns" href="#">${ig}SNS</a></li></ul>
</div></div><div class="kk-menu__veil js-menu-veil"></div></div>`);

  const main = document.querySelector(".kk-main");
  main.insertAdjacentHTML("afterend", `
<div class="kk-info" id="info" data-slot="recruit-info"><div class="kk-wrap"><p class="kk-label">RECRUIT INFO</p><ul class="kk-info__list">
  <li><a class="kk-arrow-btn" href="#"><span class="kk-arrow-btn__label">Hiring Info</span>${arrow}</a></li>
  <li><a class="kk-arrow-btn" href="#"><span class="kk-arrow-btn__label">Q&amp;A</span>${arrow}</a></li></ul></div></div>
<footer class="kk-footer js-footer" data-slot="footer"><div class="kk-footer__main"><div class="kk-wrap kk-footer__inner">
  <div class="kk-footer__head">${logo}<p class="kk-footer__sub">RECRUITING</p><ul class="kk-footer__btns">${lineBtns}</ul></div>
  <div class="kk-footer__body"><ul class="kk-footer__nav">${navItems}</ul><ul class="kk-footer__sns"><li><a class="kk-sns" href="#">${ig}SNS</a></li></ul>
    <div class="kk-footer__koma js-footer-koma" data-fx="frame-flip-loop" data-fx-frame-flip-loop="every: 200; hide: opacity; run: always" data-label="Two people as black-and-white cutouts · working around a desk · 6-panel comic frames · landscape 580:354">${koma("desk", 6)}</div></div>
</div></div>
<div class="kk-footer__bottom"><div class="kk-wrap kk-footer__bottom-inner"><ul class="kk-footer__links"><li><a href="#">Privacy policy</a></li><li><a href="#">Terms of service</a></li><li><a href="#">SNS usage policy</a></li><li><a href="#">Hiring guidelines</a></li></ul><small class="kk-footer__copy">© COMPANY All Rights Reserved.</small></div></div></footer>
<div class="kk-modal" data-slot="mypage-modal"><div class="kk-modal__content"><div class="kk-modal__inner">
  <button class="kk-modal__close js-modal-close" type="button" aria-label="Close"><svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg></button>
  <p class="kk-modal__title">00<strong>Flag</strong></p>
  <ul class="kk-modal__main"><li><a href="#">ENTRY</a></li><li><a href="#">MYPAGE</a></li></ul>
  <ul class="kk-modal__sub"><li><a href="#">Cohort 00 MYPAGE</a></li><li><a href="#">Experienced hiring</a></li></ul>
</div></div><div class="kk-modal__veil js-modal-close"></div></div>`);

  // Coma — instead of a photo slot, our silhouette moves slightly each frame, flipping in jerks like the original sprite (.2s per frame)
  function koma(kind, n) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const s = Math.sin((i / n) * Math.PI * 2), c = Math.cos((i / n) * Math.PI * 2);
      let g = "";
      if (kind === "desk") {
        g = `<rect class="kk-desk" x="70" y="230" width="440" height="14"/><rect x="110" y="244" width="8" height="110"/><rect x="460" y="244" width="8" height="110"/>
          <circle cx="${200 + s * 4}" cy="${118 + c * 3}" r="30"/><path d="M${150 + s * 3} 230q8-70 50-74q42 4 50 74z"/><path d="M${230 + s * 6} 190l${50 + c * 10} ${30 + s * 8}l-6 10-${56 + c * 10}-${24 + s * 8}z"/>
          <circle cx="${380 - s * 3}" cy="${112 - c * 4}" r="28"/><path d="M${334 - s * 2} 230q8-72 46-76q40 4 48 76z"/><path d="M${350 - c * 4} 186l-${48 + s * 12} ${34 + c * 6}l6 9 ${52 + s * 12}-${30 + c * 6}z"/>`;
      } else if (kind === "earth") {
        g = `<circle cx="100" cy="100" r="92"/><path class="kk-desk" d="M${40 + i * 9} 70q30-20 50 0t40 10q-10 30-40 20t-50 -30z" opacity=".35"/>`;
      } else {
        const lean = kind === "stairs" ? 0 : s * 6;
        g = `<circle cx="${100 + lean}" cy="${40 + c * 2}" r="18"/><path d="M${72 + lean} 120q4-58 28-60q24 2 28 60z"/><path d="M${118 + lean} 82l${26 + c * 8} ${12 + s * 6}l-4 7-${28 + c * 8}-${8 + s * 6}z"/><rect class="kk-desk" x="20" y="120" width="160" height="6"/>`;
      }
      const vb = kind === "desk" ? "0 0 580 354" : kind === "earth" ? "0 0 200 200" : "0 0 200 130";
      out += `<div data-fx-part="frame"><svg viewBox="${vb}" aria-hidden="true">${g}</svg></div>`;
    }
    return out;
  }
  document.querySelectorAll("[data-kk-koma]").forEach((el) => { const [kind, n] = el.dataset.kkKoma.split(":"); el.insertAdjacentHTML("beforeend", koma(kind, +n)); });

  // Lock — keeps the screen behind from scrolling while a menu or window is open (fills the right side by the scrollbar width)
  let locks = 0;
  const lock = () => { if (!locks++) { document.documentElement.style.setProperty("--kk-scrollbar", `${innerWidth - document.documentElement.clientWidth}px`); document.body.classList.add("is-locked"); } };
  const unlock = () => { if (locks && !--locks) document.body.classList.remove("is-locked"); };

  // Shared open/close — can’t be pressed again while opening or closing
  function toggle({ target, open, close, openers, closers, again, onState }) {
    let state = "closed", busy = false;
    const doOpen = async () => {
      if (busy || state === "opened") return;
      busy = true; state = "opened"; lock(); onState?.("opened");
      try { await open(target); } finally { busy = false; onState?.("opened-end"); }
    };
    const doClose = async () => {
      if (busy || state === "closed") return;
      busy = true; state = "closed"; onState?.("closed");
      try { await close(target); } finally { unlock(); busy = false; onState?.("closed-end"); }
    };
    openers.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); if (again && state === "opened") doClose(); else doOpen(); }));
    closers.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); doClose(); }));
    addEventListener("keydown", (e) => { if (e.key === "Escape") doClose(); });
  }

  const menu = document.querySelector(".kk-menu"), burger = document.querySelector(".kk-burger");
  const inner = menu.querySelector(".kk-menu__inner"), groups = [...menu.querySelectorAll(".kk-menu__group")];
  const [b1, b2, b3] = burger.querySelectorAll(".kk-burger__bar");
  let mt = null;
  toggle({
    target: menu, openers: [burger], closers: [menu.querySelector(".js-menu-veil")], again: true,
    onState: (s) => { if (s === "opened") burger.classList.add("is-open"); if (s === "closed") burger.classList.remove("is-open"); },
    open: () => new Promise((done) => {
      mt?.kill();
      menu.style.display = "block"; inner.scrollTop = 0;
      const d = sp() ? 9 : 14;
      mt = gsap.timeline({ onComplete: done });
      mt.set(groups, { opacity: 0 }).addLabel("start")
        .fromTo(inner, { xPercent: 90, opacity: 0 }, { xPercent: 0, opacity: 1, duration: reduce ? 0 : 0.6, ease: "expo.out" }, "start")
        .set(groups, { opacity: 1 }, "start")
        .add(() => groups[0].classList.add("is-shown"), "start+=0.2")
        .add(() => groups[1].classList.add("is-shown"), "start+=0.4")
        .add(() => groups[2].classList.add("is-shown"), "start+=0.52")
        .to(b1, { x: d, duration: 0.24, ease: "power3.out" }, 0).to(b1, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.2)
        .to(b3, { x: -d, duration: 0.24, ease: "power3.out" }, 0).to(b3, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.2)
        .to(b2, { rotation: 54, duration: 0.24, ease: "power2.out" }, 0.3);
    }),
    close: () => new Promise((done) => {
      mt?.kill();
      mt = gsap.timeline({ onComplete: () => { menu.style.display = ""; gsap.set(inner, { xPercent: 0 }); gsap.set([b1, b3], { x: 0, autoAlpha: 1 }); gsap.set(b2, { rotation: 0 }); done(); } });
      mt.to(groups, { opacity: 0, duration: 0.2, ease: "power3.in", onComplete: () => groups.forEach((g) => g.classList.remove("is-shown")) }, 0)
        .to(inner, { xPercent: 130, duration: 0.3, ease: "sine.in" }, 0.1)
        .to(inner, { opacity: 0, duration: 0.2, ease: "power3.out" }, 0.32)
        .to(b2, { rotation: 0, duration: 0.24, ease: "power2.out" }, 0)
        .to(b1, { autoAlpha: 1, duration: 0.1, ease: "none" }, 0.2).to(b1, { x: 0, duration: 0.24, ease: "power3.out" }, 0.24)
        .to(b3, { autoAlpha: 1, duration: 0.1, ease: "none" }, 0.2).to(b3, { x: 0, duration: 0.24, ease: "power3.out" }, 0.24);
    }),
  });

  const modal = document.querySelector(".kk-modal");
  let ct = null;
  toggle({
    target: modal, openers: [...document.querySelectorAll(".js-mypage-open")], closers: [...modal.querySelectorAll(".js-modal-close")],
    open: (t) => new Promise((done) => { ct?.kill(); t.style.display = "block"; t.scrollTop = 0; ct = gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.out", onComplete: () => { t.classList.add("is-shown"); done(); } }); }),
    close: (t) => new Promise((done) => { ct?.kill(); ct = gsap.to(t, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: () => { t.classList.remove("is-shown"); t.style.display = ""; done(); } }); }),
  });

  // Menu and footer link arrows — reverse only after the .2s stretch has finished (the original waits for transitionend)
  document.querySelectorAll(".kk-arrow-link").forEach((a) => {
    const rect = a.querySelector(".kk-arrow rect");
    let want = false, busy = false;
    const run = () => {
      if (busy || want === a.classList.contains("is-active")) return;
      busy = true;
      a.classList.toggle("is-active", want);
      const end = (e) => { if (e.propertyName !== "transform") return; rect.removeEventListener("transitionend", end); busy = false; run(); };
      rect.addEventListener("transitionend", end);
      setTimeout(() => { if (busy) { rect.removeEventListener("transitionend", end); busy = false; run(); } }, 260);
    };
    a.addEventListener("pointerenter", () => { want = true; run(); });
    a.addEventListener("pointerleave", () => { want = false; run(); });
  });

  // Header text turns white over a dark header section
  const header = document.querySelector(".kk-header");
  const inverts = document.querySelectorAll(".js-header-invert");
  if (inverts.length) {
    const on = new Set();
    let io;
    const watch = () => {
      io?.disconnect(); on.clear();
      io = new IntersectionObserver((es) => {
        es.forEach((e) => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
        header.classList.toggle("is-invert", on.size > 0); document.body.classList.toggle("is-invert", on.size > 0);
      }, { rootMargin: `0px 0px ${-(innerHeight - header.offsetHeight)}px 0px` });
      inverts.forEach((s) => io.observe(s));
    };
    watch(); addEventListener("resize", watch);
  }

  // When the footer is visible, the phone bottom bar slides down · the mascot illustration rises and takes over when the footer shows
  const footer = document.querySelector(".js-footer"), fk = document.querySelector(".js-footer-koma");
  new IntersectionObserver(([e]) => document.body.classList.toggle("is-nav-hide", e.isIntersecting)).observe(footer);
  new IntersectionObserver(([e]) => fk.classList.toggle("is-shown", e.isIntersecting)).observe(fk);

  // Photo parallax — while on screen, passes the section progress (0~1) as --kk-progress
  const par = [...document.querySelectorAll(".js-parallax")];
  if (par.length && !reduce) {
    const live = new Set(); let raf = 0;
    const tick = () => { const h = innerHeight; live.forEach((el) => { const r = el.getBoundingClientRect(); el.style.setProperty("--kk-progress", Math.max(0, Math.min(1, (h - r.top) / (h + r.height))).toFixed(4)); }); raf = live.size ? requestAnimationFrame(tick) : 0; };
    const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target))); if (!raf && live.size) raf = requestAnimationFrame(tick); });
    par.forEach((el) => io.observe(el));
  }

  // Once the font loads, reveal the body text (.2s) and set the lift 200ms later
  const ready = () => {
    document.documentElement.classList.add("is-ready");
    setTimeout(() => {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
      document.querySelectorAll(".js-inview").forEach((el) => io.observe(el));
    }, 200);
    document.dispatchEvent(new Event("kk:ready"));
  };
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]).then(ready);
  window.kkLock = { lock, unlock };
})();
