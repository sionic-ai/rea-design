// Shared by all pages: top-left logo · center menu · hamburger · menu drawer · footer set as one piece, first-visit loader, and the is-onscreen class added on entry,
// Handles an arrow descending every 1 second, a logo color that changes per section, and a left-right swipe slider. The original just swaps pages with no library-style transition
// The arrived page header blooming out as a blurred circle serves as the transition — leave it as is.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ARROW = '<svg viewBox="0 0 8 10" aria-hidden="true"><path d="M3.3 0h1.4v6.5L7.1 4.3l.9 1L4 9.8 0 5.3l.9-1 2.4 2.2z"/></svg>';
  const icon = (dir = "down", extra = "") =>
    `<span class="pm-icon ${dir === "down" ? "" : "pm-icon--" + dir} ${extra}"><svg viewBox="0 0 60 29" aria-hidden="true"><ellipse cx="30" cy="14.5" rx="29.5" ry="14"/></svg>` +
    `<span class="pm-icon__inner"><span class="pm-icon__arrows">${ARROW}${ARROW}</span></span></span>`;

  const mark = (cls = "") =>
    `<svg class="pm-mark ${cls}" viewBox="0 0 1250 170" aria-label="Wordmark slot"><text x="0" y="163" font-size="228" textLength="1250" lengthAdjust="spacingAndGlyphs">BRAND NAME</text></svg>`;
  const mark2 = (cls = "") =>
    `<svg class="pm-mark ${cls}" viewBox="0 0 570 373" aria-label="Wordmark slot (two lines)"><text x="0" y="168" font-size="232" textLength="570" lengthAdjust="spacingAndGlyphs">BRAND</text><text x="0" y="368" font-size="232" textLength="570" lengthAdjust="spacingAndGlyphs">NAME</text></svg>`;
  const monogram =
    '<svg viewBox="0 0 49 50" aria-label="Logo slot"><path class="pm-logo__line" d="M5.5 49.5V22a19 19 0 0 1 38 0v27.5" fill="none" stroke-width="1.1"/><path class="pm-logo__line" d="M2 49.5h45" stroke-width="1.1"/><text class="pm-logo__fill" x="24.5" y="40" text-anchor="middle" font-size="24" font-family="Federo, serif">B</text></svg>';

  const MENU = [
    ["MENU 1", "index.html"],
    ["MENU 2", "list.html"],
    ["MENU 3", "index.html#journal"],
    ["MENU 4", "#contact"],
    ["MENU 5", "#footer"],
  ];

  const chrome = `
    <a class="pm-logo" href="index.html" data-slot="logo">${monogram}</a>
    <header class="pm-header" data-slot="nav">
      <nav class="pm-header__menu">${MENU.map(([t, h]) => `<div class="pm-header__item"><a href="${h}">${t}</a></div>`).join("")}</nav>
      <a class="pm-header__logo" href="index.html">${mark()}</a>
    </header>
    <button class="pm-burger" type="button" aria-label="Open Menu"><span class="pm-burger__text">CLOSE</span><span class="pm-burger__lines"><span class="pm-burger__line"></span><span class="pm-burger__line"></span></span></button>
    <div class="pm-gnav" data-slot="menu-drawer">
      <div class="pm-gnav__body">${MENU.map(([t, h]) => `<div class="pm-gnav__item"><a href="${h}"><p>${t}</p>${icon("right")}</a></div>`).join("")}</div>
    </div>`;

  const footer = `
    <div class="pm-footer__contact js-onscreen" id="contact"><a href="#contact"><span>HEADING</span>${icon("right")}</a></div>
    <div class="pm-footer__house js-onscreen"><div class="pm-footer__row">
      <p>Your one-line notice goes here.</p>
      <a href="detail.html"><span class="pm-footer__sublogo" title="Sub-brand logo slot — wide horizontal English logo">Sub Brand Name</span>${icon("right")}</a>
    </div></div>
    <div class="pm-footer__house js-onscreen"><div class="pm-footer__row">
      <p>Your one-line notice goes here.</p>
      <a href="list.html"><span class="pm-footer__sublogo pm-footer__sublogo--script" title="Project logo spot — script subtitle below the wordmark">BRAND NAME</span>${icon("right")}</a>
    </div></div>
    <div class="pm-footer__logo js-onscreen">
      <div class="pm-footer__logo-main">${mark()}</div>
      <div class="pm-footer__produce"><p>Produced by</p><a href="#footer" title="Operating company logo here">COMPANY NAME</a></div>
    </div>
    <a class="pm-footer__top" href="#top" aria-label="Back to top">${icon("up", "js-loop")}</a>
    <div class="pm-footer__bottom js-onscreen">
      <nav class="pm-footer__list">${MENU.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <p class="pm-footer__copy js-onscreen">© 0000 BRAND NAME. All rights reserved.</p>
    </div>`;

  document.body.insertAdjacentHTML("afterbegin", chrome);
  const foot = document.querySelector("[data-pm-footer]");
  if (foot) { foot.innerHTML = footer; foot.id = "footer"; }
  document.querySelectorAll("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon, el.className); });
  document.querySelectorAll("[data-mark]").forEach((el) => { el.outerHTML = el.dataset.mark === "2" ? mark2(el.className) : mark(el.className); });
  if (!document.getElementById("top")) document.body.id = "top";

  // ── Loader: only when the first page is opened for the first time in this tab. Percent catches up 0.2 of the remaining amount each step, minimum 2 seconds, opens 0.3s after finishing ──
  // Whether to turn it on is decided by a short script in the head of index.html before anything is painted (like the original — deciding here would let the hero flash once before the loader covers it)
  const loader = document.querySelector(".pm-loader");
  const open = () => {
    sessionStorage.setItem("pm-loader-shown", "true");
    root.classList.remove("is-show-loader");
    root.classList.add("is-page-loaded");
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  if (loader && root.classList.contains("is-show-loader")) {
    const percent = loader.querySelector(".pm-loader__percent");
    const start = performance.now();
    let shown = 0;
    const tick = (now) => {
      const target = Math.floor(Math.min((now - start) / 2000, 1) * 100);
      shown += (target - shown) * 0.2;
      percent.textContent = Math.floor(shown);
      if (now - start < 2000) requestAnimationFrame(tick);
      else { percent.textContent = 100; setTimeout(open, 300); }
    };
    requestAnimationFrame(tick);
  } else {
    root.classList.add("is-no-loader");
    open();
  }

  // ── Adds is-onscreen on entering, removes it on leaving (redrawn on re-entry, as in the original) ──
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("is-onscreen", e.isIntersecting));
  });
  document.querySelectorAll(".js-onscreen").forEach((el) => io.observe(el));

  // ── Arrow: toggles is-loop on and off every second ──
  let loop = false;
  setInterval(() => {
    loop = !loop;
    document.querySelectorAll(".js-loop").forEach((el) => el.classList.toggle("is-loop", loop));
  }, 1000);

  // ── Menu Drawer ──
  const burger = document.querySelector(".pm-burger");
  const toggle = () => {
    const opened = root.classList.toggle("is-gnav-open");
    burger.setAttribute("aria-label", opened ? "Close Menu" : "Open Menu");
  };
  burger.addEventListener("click", toggle);
  document.querySelectorAll(".pm-gnav__item a").forEach((a) => a.addEventListener("click", toggle));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-gnav-open")) toggle(); });

  // ── Center menu ↔ small wordmark: swaps when the top edge of the data-pm-header element passes above the screen ──
  const header = document.querySelector(".pm-header");
  const headerAt = document.querySelector("[data-pm-header]");
  // ── Logo and hamburger color: data-chrome="cream|green" Once past each element’s data-chrome-start (default top top), that color ──
  const marks = [...document.querySelectorAll("[data-chrome]")].map((el) => {
    const [edge, at] = (el.dataset.chromeStart || "top top").split(" ");
    return { el, edge, at, color: el.dataset.chrome };
  });
  const pct = (v, h) => (v === "top" ? 0 : v === "center" ? h / 2 : v === "bottom" ? h : (parseFloat(v) / 100) * h);
  const onScroll = () => {
    const vh = innerHeight;
    if (headerAt) header.classList.toggle("is-active", headerAt.getBoundingClientRect().top < 0);
    let color = "green";
    marks.forEach((m) => {
      const r = m.el.getBoundingClientRect();
      const y = r.top + pct(m.edge, r.height);
      if (y <= pct(m.at, vh)) color = m.color;
    });
    root.classList.toggle("is-chrome-cream", color === "cream");
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // ── Same-page anchors scroll smoothly ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const target = id === "top" ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  // ── Left/right slider: same Swiper 8.4.7 as the original — prev · next are [data-prev] · [data-next] inside the same [data-slider-scope] ──
  const slider = (el, opts) => {
    if (!el) return null;
    const scope = el.closest("[data-slider-scope]") || el;
    return new Swiper(el, { ...opts, navigation: { prevEl: scope.querySelector("[data-prev]"), nextEl: scope.querySelector("[data-next]") } });
  };


  // ── Story pin: like the original, triggers are set at the positions of the empty cells (.pm-sp) and follow with scrub 1. Called inside the page’s matchMedia ──
  const CIRCLE = "93.106186954104px";
  const story = (root, pc) => {
    const q = (s, r = root) => r.querySelector(s);
    const qa = (s, r = root) => [...r.querySelectorAll(s)];
    const st = (trigger, start, end) => ({ trigger, start, end, invalidateOnRefresh: true, scrub: 1 });
    const start = q(".pm-sp--start");
    gsap.to(qa(".pm-story__frame-img"), { width: "101%", height: "100%", duration: 3, scrollTrigger: st(start, "top bottom", "bottom bottom") });
    gsap.to(qa(".pm-story__img"), { scale: 1, duration: 2, scrollTrigger: st(start, "top bottom", "bottom bottom") });
    gsap.to(qa(".pm-story__heading, .pm-story__tag, .pm-story__progress"), { opacity: 1, duration: 3, scrollTrigger: st(start, "bottom bottom") });
    const ttl = q(".pm-sp--ttl");
    const heading = q(".pm-story__heading");
    if (ttl && heading) {
      if (pc) {
        gsap.to(q("span", heading), { opacity: 0, filter: "blur(5px)", duration: 1, scrollTrigger: st(ttl, "top top", "bottom bottom") });
      } else {
        gsap.to(heading, { bottom: "50%", duration: 1, scrollTrigger: st(ttl, "top top", "bottom bottom") });
        gsap.to(q("span", heading), { opacity: 0, filter: "blur(5px)", duration: 1, scrollTrigger: st(ttl, "center center", "bottom bottom") });
      }
    }
    const show = (t, d) => gsap.to(t, { autoAlpha: 1, duration: d, overwrite: true });
    const hide = (t, d) => gsap.to(t, { autoAlpha: 0, duration: d, overwrite: true });
    const tagNum = q(".pm-story__tag-num");
    const items = qa(".pm-story__item");
    items.forEach((item, i) => {
      const n = i + 1;
      const copy = q(".pm-story__copy", item);
      const jp = q(".pm-story__jp", item);
      const eng = q(".pm-story__eng", item);
      const space = q(`[data-copy="${n}"]`);
      const spaceJp = q(".pm-sp--jp", space);
      const out = q(`[data-out="${n}"]`);
      const dot = q(`.pm-story__dot[data-n="${n}"]`);
      gsap.set([copy, jp, eng], { autoAlpha: 0 });
      if (n > 1) gsap.to(item, { opacity: 1, duration: 1, scrollTrigger: st(q(`[data-out="${n - 1}"]`), "top 25%", "bottom bottom") });
      if (dot) {
        const ring = q("svg", dot);
        gsap.to(ring, { strokeDashoffset: "1px", strokeDasharray: CIRCLE, duration: 1, scrollTrigger: st(space, "top bottom", "bottom bottom") });
        ScrollTrigger.create({ trigger: space, start: "top bottom", toggleClass: { targets: dot, className: "is-active" } });
        ScrollTrigger.create({ trigger: out, start: "top center", end: "max", toggleClass: { targets: ring, className: "is-done" } });
        // Original: circles 1 and 2 retreat to transparent 0 when the next section’s blank slot touches the bottom of the screen (scrub 1)
        const next = q(`[data-copy="${n + 1}"]`);
        if (n <= 2 && next) gsap.to(ring, { opacity: 0, duration: 1, scrollTrigger: st(next, "top bottom", "top bottom") });
      }
      const enter = () => { show(copy, 0.6); show(jp, 0.6); show(eng, 0.8); if (tagNum) tagNum.textContent = `0${n}`; };
      ScrollTrigger.create({
        trigger: space,
        start: "top bottom",
        onEnter: enter,
        onEnterBack: enter,
        onLeaveBack: () => { hide(copy, 0.4); hide(jp, 0.4); hide(eng, 0.4); if (tagNum) tagNum.textContent = `0${Math.max(1, n - 1)}`; },
      });
      // Vertical text lines: split evenly from the 100% point below the screen up to the 28% point, forming one line at a time
      const lines = qa("p", jp);
      lines.forEach((p, k) => {
        const at = lines.length > 1 ? 100 - (72 * k) / (lines.length - 1) : 100;
        ScrollTrigger.create({
          trigger: spaceJp,
          start: `top ${at}%`,
          onEnter: () => p.classList.add("is-active"),
          onEnterBack: () => p.classList.add("is-active"),
          onLeaveBack: () => p.classList.remove("is-active"),
        });
      });
      ScrollTrigger.create({ trigger: out, start: "top bottom", onEnter: () => hide(copy, 0.6), onEnterBack: () => hide(copy, 0.6), onLeaveBack: () => show(copy, 0.6) });
      gsap.to(n === 1 ? item : q(".pm-story__inner", item), { opacity: 0, duration: 1, scrollTrigger: st(out, "top bottom", "bottom bottom") });
      const bg = q(".pm-story__bg", item);
      gsap.to(bg, { borderWidth: 0, filter: "blur(0px)", duration: 1, scrollTrigger: st(out, "top bottom", "bottom bottom") });
      gsap.to(bg, { opacity: 1, duration: 1, scrollTrigger: st(out, "top bottom", "top bottom") });
    });
    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      onLeaveBack: () => {
        gsap.set(qa(".pm-story__copy, .pm-story__jp, .pm-story__eng"), { autoAlpha: 0 });
        qa(".pm-story__jp p").forEach((p) => p.classList.remove("is-active"));
      },
    });
  };

  window.pm = { icon, mark, slider, story, reduce, isSp: () => matchMedia("(max-width: 767px)").matches };
})();
