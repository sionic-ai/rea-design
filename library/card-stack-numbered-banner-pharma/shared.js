// Draws the header bar (dropdown and phone menu), footer, cookie card and loading curtain shared by every page, and re-attaches the original motion with the same values.
// Original values: Lenis lerp .1 · reveal 20px up .9s power3.out (top 85%) · line scaleX 1.5s power1.inOut (top 87%) ·
// Curtain: logo and line .7s power1.inOut → line fills → clip-path inset(0 0 0 100%) .9s power3.inOut, Hero opens at .64s
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";

  // Company symbol slot — a line drawing of two interlocked rings in place of the original logo
  const MARK = `<svg viewBox="0 0 34 30" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 26V8a6 6 0 0 1 12 0v6a6 6 0 0 1-6 6"/><path d="M30 4v18a6 6 0 0 1-12 0v-6a6 6 0 0 1 6-6"/></svg>`;
  const LOGO = `${MARK}<svg class="ps-logo__word" viewBox="0 0 146 16" width="146" height="16" aria-hidden="true"><text x="0" y="12.5" textLength="146" lengthAdjust="spacingAndGlyphs">COMPANY NAME</text></svg>`;
  const CHEV = `<svg viewBox="0 0 8 8" aria-hidden="true"><rect y="3.4" width="8" height="1.2"/><rect x="3.4" width="1.2" height="8"/></svg>`;
  const ARROW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 8h12M9 3l5 5-5 5"/></svg>`;
  window.psArrow = ARROW;
  window.psMark = MARK;

  const NAV_L = [
    ["Group", page === "recruit" ? "index.html" : "recruit.html", [["Leadership", "recruit.html"], ["Sustainability", "recruit.html"], ["Manufacturing", "index.html#companies"]]],
    ["Company portfolio", "product.html"],
    ["Innovation", "", [["Scientific expertise", "index.html#science"], ["Original products", "product.html"]]],
    ["Quality control", "index.html#principles"],
  ];
  const NAV_R = [
    ["Export", "index.html#export"],
    ["Careers", "", [["Job applicants", "recruit.html"], ["University students", "recruit.html#students"], ["School students", "recruit.html#students"]]],
    ["Press centre", "", [["News", "news.html"], ["Press kit", "news.html"]]],
    ["Contacts", "#contacts"],
  ];
  const item = ([t, h, sub], end) => {
    if (!sub) return `<div class="ps-header__item"><a class="ps-header__link" href="${h}">${t}</a></div>`;
    const trigger = h ? `<a class="ps-header__link ps-header__trigger" href="${h}" aria-haspopup="true"><span>${t}</span>${CHEV}</a>` : `<button class="ps-header__link ps-header__trigger" type="button" aria-haspopup="true"><span>${t}</span>${CHEV}</button>`;
    return `<div class="ps-header__item">${trigger}<div class="ps-header__drop${end ? " is-end" : ""}"><div class="ps-header__drop-in"><div class="ps-header__drop-list">${sub.map(([a, b]) => `<a href="${b}">${a}</a>`).join("")}</div></div></div></div>`;
  };

  const head = $('[data-slot="header"]');
  if (head) {
    head.className = "ps-header" + (document.body.dataset.header === "light" ? " is-light" : "");
    head.innerHTML = `<div class="ps-header__shell">
        <nav class="ps-header__nav" aria-label="Main menu">${NAV_L.map((x) => item(x)).join("")}</nav>
        <a class="ps-logo ps-header__logo" href="index.html" aria-label="Home" data-label="Company logo (symbol + name)">${LOGO}</a>
        <div class="ps-header__nav is-end">${NAV_R.map((x) => item(x, true)).join("")}
          <div class="ps-header__util"><div class="ps-search"><button class="ps-search__btn" type="button" aria-label="Open search"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="9" cy="9" r="6.2"/><path d="m13.5 13.5 4 4"/></svg></button><label class="ps-search__panel"><svg width="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><input type="search" placeholder="Site Search" aria-label="Site Search"></label></div><div class="ps-locale"><button class="ps-locale__btn" type="button" aria-expanded="false"><span>EN</span>${CHEV}</button><ul class="ps-locale__panel"><li><a href="#">KO</a></li></ul></div></div>
        </div>
        <button class="ps-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i></button>
      </div>`;
    head.insertAdjacentHTML("afterend", `<nav class="ps-mmenu" aria-label="Phone menu">${[...NAV_L, ...NAV_R].flatMap(([t, h, sub]) => sub ? sub.map(([a, b]) => `<a href="${b}">${a}</a>`) : [`<a href="${h}">${t}</a>`]).join("")}</nav>`);
    const search = $(".ps-search", head);
    $(".ps-search__btn", head).addEventListener("click", () => { search.classList.add("is-open"); $("input", search).focus(); });
    $("input", search).addEventListener("blur", () => search.classList.remove("is-open"));
    const loc = $(".ps-locale", head);
    $("button", loc).addEventListener("click", (e) => { const on = loc.classList.toggle("is-open"); e.currentTarget.setAttribute("aria-expanded", on); });
    document.addEventListener("click", (e) => { if (!loc.contains(e.target)) loc.classList.remove("is-open"); });
    const burger = $(".ps-burger", head);
    burger.addEventListener("click", () => {
      const on = head.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", on);
    });
  }

  const foot = $('[data-slot="footer"]');
  if (foot) {
    foot.className = "ps-footer";
    foot.id = "contacts";
    foot.innerHTML = `<div class="ps-par"><div class="wf-img ps-dark" data-par data-label="Abstract glass with flowing blue light streaks · dark background · full-width background"></div></div>
      <div class="ps-footer__in">
        <div class="ps-footer__top">
          <nav class="ps-footer__nav">${["Portfolio", "Scientific expertise", "Quality", "Export", "Job applicants", "News", "Contacts"].map((t) => `<a href="#">${t}</a>`).join("")}</nav>
          <div class="ps-footer__contact">
            <a class="ps-t2" href="#">+0 (000) 00-00-00</a><a class="ps-t2" href="#">info@company-name.com</a>
            <button class="ps-btn is-line is-sm" type="button">Feedback</button>
            <div class="ps-footer__social"><a href="#" aria-label="Social 1">S1</a><a href="#" aria-label="Social 2">S2</a></div>
          </div>
        </div>
        <div class="ps-footer__mark">
          <span class="ps-wordmark" style="font-size:clamp(34px,10.4vw,200px)" data-label="Company wordmark (English capitals)">COMPANY NAME</span>
          <span class="ps-anniv" style="font-size:clamp(30px,6vw,110px)" data-label="Anniversary number mark"><b>30</b><small>years<br>anniversary</small></span>
        </div>
        <div class="ps-footer__bottom"><span>© 0000 COMPANY NAME</span><span>Privacy policy link here</span><span>Site by Studio</span></div>
      </div>`;
  }

  if (!sessionStorage.getItem("ps-cookie")) {
    document.body.insertAdjacentHTML("beforeend", `<div class="ps-cookie" role="dialog" aria-label="Cookie Notice"><p>If you use this site <a href="#">Cookie use</a>Continuing is taken as agreement. You can turn this off in your browser settings.</p><button class="ps-btn is-green is-sm" type="button">Accept <span class="ps-btn__icon">${ARROW}</span></button></div>`);
    $(".ps-cookie button").addEventListener("click", (e) => {
      sessionStorage.setItem("ps-cookie", "1");
      e.currentTarget.closest(".ps-cookie").classList.add("is-gone");
    });
  }

  $$("[data-mark]").forEach((el) => el.insertAdjacentHTML("afterbegin", MARK));
  $$("[data-arrow]").forEach((el) => el.insertAdjacentHTML("beforeend", `<span class="ps-btn__icon">${ARROW}</span>`));
  $$("[data-arrow-only]").forEach((el) => { el.innerHTML = ARROW; });

  // ── Tabs: clicking swaps the panels (photo and text layers) of the same group ──
  $$("[data-tabs]").forEach((root) => {
    const tabs = $$(".ps-tab", root), panes = $$("[data-pane]", root);
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((x, j) => x.setAttribute("aria-selected", i === j));
      panes.forEach((p) => p.classList.toggle("is-active", +p.dataset.pane === i));
      root.dispatchEvent(new CustomEvent("ps:tab", { detail: i }));
    }));
  });

  const start = () => {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);
    let lenis = null;
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true, autoRaf: false, allowNestedScroll: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Header row — turns into a light panel after the Hero, hides on scroll down and returns on scroll up
    const header = $(".ps-header");
    if (header) {
      ScrollTrigger.create({ start: 200, end: "max", onUpdate: (s) => header.classList.toggle("is-hidden", s.direction === 1 && !header.classList.contains("is-open")) });
      ScrollTrigger.create({ start: 0, end: 200, onLeaveBack: () => header.classList.remove("is-hidden") });
    }

    const swipers = $$("[data-swiper]");
    if (window.Swiper) swipers.forEach((el) => new Swiper(el, { slidesPerView: "auto", spaceBetween: Number(el.dataset.gap ?? 6), speed: 600, grabCursor: true }));

    if (reduce) {
      gsap.set("[data-rise]", { autoAlpha: 1 });
      document.dispatchEvent(new CustomEvent("ps:ready", { detail: { lenis } }));
      return;
    }

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      $$("[data-rise]").forEach((el) => {
        if (el.closest("[data-intro]")) return;
        gsap.fromTo(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
      $$("[data-line]").forEach((el) => gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: "power1.inOut", duration: 1.5, transformOrigin: "0 50%", scrollTrigger: { trigger: el, start: "top 87%", once: true } }));
      $$("[data-par]").forEach((el) => gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));
    });

    document.dispatchEvent(new CustomEvent("ps:ready", { detail: { lenis, mm } }));
    ScrollTrigger.refresh();
  };

  // ── Loading curtain (the original Preloader lives in the layout so it plays once on the first load whichever page you enter — later page moves have no curtain) ──
  const intro = () => document.dispatchEvent(new Event("ps:intro"));
  if (!$(".ps-loader") && !sessionStorage.getItem("ps-loaded")) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="ps-loader" data-slot="preloader" aria-hidden="true"><i class="ps-loader__line"></i><div class="ps-loader__logo">${MARK}<b>COMPANY NAME</b></div></div>`);
  } else if (sessionStorage.getItem("ps-loaded")) $(".ps-loader")?.remove();
  document.documentElement.classList.remove("ps-boot");
  const loader = $(".ps-loader");
  const run = () => {
    start();
    if (!loader || reduce || !window.gsap) { loader?.classList.add("is-done"); intro(); return; }
    sessionStorage.setItem("ps-loaded", "1");
    // Original fills the line by the actual loading share (each time the share rises, max(.5, difference×1.7)s) — a fixed length fitted to the ~5s curtain length measured on the original
    const tl = gsap.timeline();
    tl.to([".ps-loader__logo", ".ps-loader__line"], { autoAlpha: 1, duration: 0.7, ease: "power1.inOut" }, 0)
      .to(".ps-loader__line", { scaleX: 1, duration: 3.6, ease: "power1.out" }, 0.2)
      .to(loader, { clipPath: "inset(0 0 0 100%)", duration: 0.9, ease: "power3.inOut" }, "+=0.1")
      .call(intro, [], "-=0.26")
      .call(() => loader.classList.add("is-done"));
  };
  // If the font takes long to load the curtain shows late — wait only up to 250ms
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 250))]).then(run);
  else addEventListener("load", run);
})();
