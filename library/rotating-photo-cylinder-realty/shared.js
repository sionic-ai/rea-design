// Common to all pages — builds the header, drawer, floating contact, blog cards, Get in Touch band and footer, and wires up the motion.
// Original values: Lenis lerp .2 · loader (on first arrival from outside) logo strokes .4s Power2.easeIn .3s stagger → .9s later logo vanishes .6s · text logo .6s → .7s later vanishes .6s → curtain .8s Expo.easeInOut(-.3s)
// Internal links: the body blurs out over .6s Expo.easeInOut and then navigates (.3s delay, drawer links 1s) · the new page appears after .1s over .6s Power4.easeOut.
// Link letter roll .6s (power1.out because of a curve-name typo in the original) / .4s cubic-bezier(.115,.405,.24,1) · letter-split rise .5s Power1.easeInOut staggered .03s · drawer rows .6s Power1.easeOut staggered .025s (.3s delay)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const page = document.getElementById("page");
  const mark = '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M0 30V12L10 4v26z"/><path d="M13 30V2l9 7v21z"/><path d="M25 30V11l11 9v10z"/></svg>';
  const logo = `<a class="jf-logo" href="index.html" aria-label="Company name">${mark}<span><small>Home and living consulting company</small><b>Company name</b></span></a>`;
  const roll = (t) => `<span data-hover-target>${t}</span>`;
  const NAV = [["About us", "about.html"], ["Business details", "service.html"], ["Items Owned", "index.html#property"], ["Company guide", "index.html#company"], ["Hiring Info", "recruit.html"]];
  // The drawer has three columns like the original — the page name is the heading with sub-links beneath, the last column has single links and two white buttons
  const DRAWER = [
    [["About us", "about.html", [["Concept", "about.html"], ["Our Strengths", "about.html"]]], ["Business details", "service.html", [["Real estate distribution business", "service.html"], ["Rental management business", "service.html"], ["Development Project", "service.html"], ["Consulting", "service.html"]]]],
    [["Company guide", "index.html#company", [["Message from the CEO", "index.html#company"], ["Meet the Members", "index.html#company"], ["Company overview", "index.html#company"], ["Directions", "index.html#company"]]], ["Hiring Info", "recruit.html", [["Message", "recruit.html"], ["People searching", "recruit.html"], ["View in numbers", "recruit.html"], ["Employee Voices", "recruit.html"], ["Cross Talk", "recruit.html"], ["Application guidelines", "recruit.html"], ["Apply", "recruit.html"]]]],
  ];
  const DRAWER_MORE = [["Items Owned", "index.html#property"], ["Contact Us", "#"], ["Blog", "news.html"], ["News", "news.html"]];
  const btn = (t, h, cls = "") => `<a class="jf-btn ${cls}" href="${h}"><span class="jf-en">${t}</span><i class="jf-btn__icon"></i></a>`;
  window.jfBtn = btn;
  // The floating ‹Property Info› button exists only on the first page, like the original
  const FLOAT = '<div class="jf-float" data-slot="float-contact"><a href="#"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 9.5 10 3l7 6.5V17H3z"/><path d="M8 17v-5h4v5"/></svg>Item Info</a></div>';

  document.body.insertAdjacentHTML("afterbegin", `
<div class="jf-intro" data-intro><div class="jf-intro__logo" data-intro-logo><svg viewBox="0 0 36 30">${mark.replace(/<\/?svg[^>]*>/g, "")}</svg></div><div class="jf-intro__second" data-intro-second>Company name</div><div class="jf-intro__overlay" data-intro-overlay></div></div>
<header class="jf-header" data-header data-slot="header"><div class="jf-header__wrap">${logo}
  <nav class="jf-gnav">${NAV.map(([t, h]) => `<a href="${h}" data-hover>${roll(t)}</a>`).join("")}
    <a class="jf-ig" href="#" aria-label="SNS"><svg viewBox="0 0 22 22"><rect x="2" y="2" width="18" height="18" rx="5"/><circle cx="11" cy="11" r="4.2"/><circle cx="16.3" cy="5.7" r=".6"/></svg></a>
    <a class="jf-contact-btn" href="#">Contact Us</a>
    <button class="jf-burger" type="button" data-hamburger aria-expanded="false" aria-label="Menu"><span></span><span></span><span></span></button></nav></div></header>
<div class="jf-drawer" id="jf-drawer" aria-hidden="true" data-slot="drawer-menu"><div class="jf-drawer__bg" tabindex="-1"><div class="jf-drawer__box" role="dialog" aria-modal="true">
  <div class="jf-drawer__head"><button class="jf-burger" type="button" data-drawer-close aria-expanded="true" aria-label="Close"><span></span><span></span><span></span></button></div>
  <div class="jf-drawer__content"><div class="jf-drawer__nav">${DRAWER.map((col) => `<div class="jf-drawer__block">${col.map(([t, h, subs]) => `<ul class="jf-drawer__ul"><li><a class="jf-drawer__link" href="${h}" data-drawer-close data-drawer-item>${t}</a><ul class="jf-drawer__ul jf-drawer__sub">${subs.map(([s, sh]) => `<li><a class="jf-drawer__link" href="${sh}" data-drawer-close data-drawer-item>${s}</a></li>`).join("")}</ul></li></ul>`).join("")}</div>`).join("")}
    <div class="jf-drawer__block is-split"><ul class="jf-drawer__ul">${DRAWER_MORE.map(([t, h]) => `<li><a class="jf-drawer__link" href="${h}" data-drawer-close data-drawer-item>${t}</a></li>`).join("")}<li><a class="jf-drawer__link jf-drawer__ig" href="#" data-drawer-close data-drawer-item aria-label="SNS"><svg viewBox="0 0 22 22"><rect x="2" y="2" width="18" height="18" rx="5"/><circle cx="11" cy="11" r="4.2"/><circle cx="16.3" cy="5.7" r=".6"/></svg></a></li></ul>
      <div class="jf-drawer__btns" data-drawer-close data-drawer-item>${btn("Item info", "#", "jf-btn--white")}${btn("To management companies", "#", "jf-btn--white")}</div></div></div>
    <div class="jf-drawer__img"><div class="jf-drawer__cover" data-drawer-item><span class="jf-ph" data-label="Office consulting seat in color · window natural light · vertical"></span></div></div></div>
</div></div></div>
${document.body.classList.contains("page-index") ? FLOAT : ""}`);

  page.insertAdjacentHTML("beforeend", `
${document.body.dataset.noBlog === undefined ? `<section class="jf-blog" data-slot="blog-cards"><div class="jf-wrap"><div class="jf-blog__head"><h2 class="jf-title" data-scroll-trigger="text">Blog</h2><span class="jf-sub">Blog</span></div>
  <div class="jf-cards">${[["Store flyer in color · promo piece with large contact info · landscape 540:450", "Notice", "540 / 450"], ["Office desk color · low indoor lighting · landscape 16:9", "Column", "1024 / 576"], ["Park pond and trees in color · clear day · portrait 3:4", "Neighborhood", "768 / 1024"], ["Person crouching on a lawn in color · midday · vertical 3:4", "In-house", "768 / 1024"]].map(([l, t, r], i) => `<a class="jf-card" href="detail.html" data-scroll-trigger="top"><div class="jf-card__img" style="aspect-ratio: ${r}"><span class="jf-ph" data-label="${l}"></span></div><time class="jf-card__time">2026.10.${String(20 - i * 3).padStart(2, "0")}</time><span class="jf-card__tag">${t}</span><p class="jf-card__title">Your blog post title here in two lines.</p></a>`).join("")}</div>
  <div class="jf-center">${btn("View more", "news.html")}</div></div></section>` : ""}
<aside class="jf-touch" data-slot="touch-loop"><div class="jf-touch__inner jf-wrap"><div class="jf-touch__loop splide" aria-label="Get in Touch"><div class="splide__track"><ul class="splide__list">${'<li class="splide__slide"><p>Get in Touch</p></li>'.repeat(3)}</ul></div></div>
  <div class="jf-touch__side"><p>Feel free to ask about anything related to your home and daily life.</p>${btn("Contact us", "#", "jf-btn--white jf-btn--lg")}</div></div></aside>
<footer class="jf-footer" data-footer data-slot="footer"><div class="jf-wrap"><div class="jf-footer__top"><div>${logo}<p class="jf-footer__addr">Postal code 000-0000<br>Your company address, one line<br>Tel 00-0000-0000 · Fax 00-0000-0000</p></div>
  <div class="jf-footer__nav">${NAV.map(([t, h]) => `<div><p>${t}</p><ul><li><a href="${h}" data-hover>${roll("Second side")}</a></li><li><a href="${h}" data-hover>${roll("Third page")}</a></li><li><a href="${h}" data-hover>${roll("Page four")}</a></li></ul></div>`).join("")}</div></div>
  <div class="jf-footer__pills"><a class="jf-pill" href="#">Item info<i class="jf-btn__icon"></i></a><a class="jf-pill" href="#">To management companies<i class="jf-btn__icon"></i></a></div>
  <div class="jf-footer__bottom"><small>© Company Name All Rights Reserved.</small><a href="#">Privacy policy</a></div></div></footer>`);

  // Lenis — original 1.0.42, lerp .2
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.2, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.jfLenis = lenis;

  // Loader — only on first entry from outside. When arriving from inside, only the body is revealed over .6s
  const intro = document.querySelector("[data-intro]");
  // The original plays the loader when the referrer’s origin isn’t this site or the same page is reopened — an empty referrer (typing the address directly) also has an empty origin string, so the loader runs.
  // On file:// even inner navigation has an empty referrer so the loader runs every time, so also check the mark an inner link leaves before navigating
  let marked = false;
  try { marked = sessionStorage.getItem("jf-inside") === "1"; sessionStorage.removeItem("jf-inside"); } catch (e) { /* If storage is unavailable, only check the referrer */ }
  const ref = document.referrer;
  const fromInside = marked || (!!ref && new URL(ref).origin === location.origin && ref !== location.href);
  const show = () => { gsap.set("[data-header]", { opacity: 1 }); gsap.to(page, { opacity: 1, duration: reduce ? 0 : 0.6, delay: 0.1, ease: "power4.out" }); };
  if (fromInside || reduce) { document.documentElement.classList.add("jf-ready"); show(); }
  else {
    intro.style.display = "block"; gsap.set(page, { opacity: 1 });
    document.documentElement.classList.add("jf-ready");
    const tl = gsap.timeline({ onComplete: () => { intro.style.display = "none"; } });
    tl.to(intro.querySelectorAll("path"), { opacity: 1, duration: 0.4, ease: "power2.in", stagger: 0.3 })
      .to("[data-intro-logo]", { delay: 0.9, opacity: 0, duration: 0.6, ease: "power4.out" })
      .to("[data-intro-second]", { opacity: 1, duration: 0.6, ease: "power1.in" }, "-=.6")
      .to("[data-intro-second]", { delay: 0.7, opacity: 0, duration: 0.6, ease: "power1.in" })
      .to("[data-intro-overlay]", { opacity: 0, duration: 0.8, ease: "expo.inOut" }, "-=.3");
  }
  // Internal links — blur the body and move on
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || !/\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    gsap.to(page, { opacity: 0, ease: "expo.inOut", duration: reduce ? 0 : 0.6, delay: a.hasAttribute("data-drawer-close") ? 1 : 0.3, onComplete: () => {
      try { if (a.href.split("#")[0] !== location.href.split("#")[0]) sessionStorage.setItem("jf-inside", "1"); } catch (err) { /* If storage is unavailable, only check the referrer */ }
      location.href = a.href;
    } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set([page, "[data-header]"], { opacity: 1 }); });

  // Header — hides upward when the Footer shows
  const header = document.querySelector("[data-header]");
  new IntersectionObserver(([e]) => header.classList.toggle("is-footer", e.isIntersecting)).observe(document.querySelector("[data-footer]"));
  const float = document.querySelector(".jf-float");
  if (window.Headroom && float) new Headroom(float).init();

  // Drawer — opened with micromodal, rows come in .3s later from 10px above over .6s
  let tween = null, opened = false;
  const items = () => document.querySelectorAll("[data-drawer-item]");
  const expanded = (v) => document.querySelectorAll("[data-hamburger]").forEach((b) => b.setAttribute("aria-expanded", v));
  const open = () => {
    if (opened || !window.MicroModal) return;
    MicroModal.show("jf-drawer", {
      onShow: () => { setTimeout(() => expanded(true), 200); opened = true; lenis?.stop(); tween = gsap.fromTo(items(), { opacity: 0, y: -10 }, { opacity: 1, y: 0, delay: 0.3, duration: reduce ? 0 : 0.6, ease: "power1.out", stagger: 0.025 }); },
      onClose: () => { opened = false; expanded(false); lenis?.start(); },
      disableScroll: true, awaitOpenAnimation: true, awaitCloseAnimation: true, openClass: "is-open",
    });
  };
  const close = () => { if (!opened) return; tween?.pause(); gsap.fromTo(items(), { opacity: 1, y: 0 }, { opacity: 0, y: -10, ease: "power1.out", duration: reduce ? 0 : 0.2, stagger: 0.0015, onComplete: () => MicroModal.close("jf-drawer") }); };
  document.querySelectorAll("[data-hamburger]").forEach((b) => b.addEventListener("click", () => (opened ? close() : open())));
  document.querySelectorAll("#jf-drawer [data-drawer-close]").forEach((b) => b.addEventListener("click", close));

  // Link text roll
  if (!touch) {
    try { CustomEase.create("linkhover", ".115,.405,.24,1"); } catch (e) { /* Default curve when CustomEase is missing */ }
    document.querySelectorAll("[data-hover]").forEach((a) => {
      const t = a.querySelector("[data-hover-target]");
      if (!t) return;
      const html = t.innerHTML;
      a.setAttribute("aria-label", t.textContent);
      t.innerHTML = `<span aria-hidden="true">${html}</span><span aria-hidden="true">${html}</span>`;
      const [first, second] = t.children;
      a.addEventListener("mouseenter", () => {
        if (reduce) return;
        // The original uses ‹expo.inout› (lowercase), so GSAP can’t find the curve and falls back to the default power1.out — the measured values (17ms delay · .5s tail) are also from that, so we keep it the same
        gsap.fromTo(first, { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "power1.out" });
        gsap.fromTo(second, { y: "105%" }, { y: "0%", duration: 0.4, ease: CustomEase.get?.("linkhover") || "power3.out" });
      });
    });
  }

  // Split-text rise · float-up — once when lifted above the bottom 20% of the screen
  document.querySelectorAll('[data-scroll-trigger="text"]').forEach((el) => {
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = [...el.textContent].map((c) => `<span data-str aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
  const fire = (el) => {
    if (el.dataset.scrollTrigger === "text") {
      gsap.fromTo(el.querySelectorAll("[data-str]"), { y: el.dataset.y || "100%", opacity: 1 }, { y: 0, opacity: 1, ease: "power1.inOut", duration: reduce ? 0 : +(el.dataset.duration || 0.5), delay: +(el.dataset.delay || 0), stagger: { each: +(el.dataset.each || 0.03) }, onComplete: () => el.classList.add("is-visible") });
    } else setTimeout(() => el.classList.add("is-visible"), +(el.dataset.delay || 0) * 1000);
  };
  const go = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -20% 0px" });
    document.querySelectorAll("[data-scroll-trigger]").forEach((el) => io.observe(el));
  };
  // The original (ScrollTrigger module) watches from the start without waiting for the transition or loader — it is revealed already risen just beneath the loader curtain
  go();

  // Get in Touch strip — Splide auto scroll (speed .9, gaps 20/50)
  if (window.Splide) document.querySelectorAll(".jf-touch__loop, .jf-entry-loop").forEach((el) => {
    const fast = el.classList.contains("jf-entry-loop");
    new Splide(el, { type: "loop", arrows: false, pagination: false, drag: false, gap: 20, autoWidth: true, autoScroll: { speed: reduce ? 0 : fast ? 1.2 : 0.9, pauseOnHover: false }, breakpoints: fast ? { 1024: { gap: 60 }, 767: { gap: 40 }, 575: { gap: 30 } } : { 1024: { gap: 50 }, 767: { gap: 40 }, 575: { gap: 30 } } }).mount(window.splide?.Extensions || {});
  });
})();
