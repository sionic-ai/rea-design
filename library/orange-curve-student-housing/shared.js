// Builds the header, dropdown, full menu (MicroModal), contact strip and footer as one set, and places the drawn curve (ChCurve) for the hero and sub-section headers.
(() => {
  const ICO = (cls = "") => `<span class="ch-ico ${cls}" aria-hidden="true"></span>`;
  const ARROW = '<span class="ch-arrow" aria-hidden="true"></span>';
  const TEL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>';
  const LOGO = (small = true) => `<a class="ch-logo" href="index.html" aria-label="Brand logo slot">${small ? '<span class="ch-logo__small">Region Name’s<br>If a student residence</span>' : ""}<span class="ch-logo__word">BRAND</span></a>`;
  const roll = (text, tag = "a", attrs = "") => `<${tag} class="ch-roll" data-content="${text}" ${attrs}><span class="label">${text}</span></${tag}>`;

  function buildHeader(el) {
    el.className = "ch-head";
    el.id = "header";
    el.innerHTML = `<h1 class="ch-head__logo">${LOGO()}</h1>
      <nav class="ch-nav" aria-label="Main menu"><ul class="ch-nav__list">
        <li class="ch-nav__item has-drop js-drop-menu">${roll("Find Apartments", "button", 'type="button" aria-expanded="false"')}
          <div class="ch-drop js-drop-menu-content"><ul class="ch-drop__menu">
            <li><span class="ch-drop__label">Search in list</span><span class="ch-drop__tags"><a class="ch-tag" href="list.html">Region 1</a><a class="ch-tag" href="list.html">Region 2</a></span></li>
            <li><span class="ch-drop__label">Find on map</span><span class="ch-drop__tags"><a class="ch-tag" href="list.html">Region 1</a><a class="ch-tag" href="list.html">Region 2</a></span></li>
            <li><a class="ch-drop__link" href="index.html#search">Search by school name${ICO()}</a></li>
          </ul></div></li>
        <li class="ch-nav__item has-drop js-drop-menu">${roll("Key strengths", "button", 'type="button" aria-expanded="false"')}
          <div class="ch-drop js-drop-menu-content"><ul class="ch-drop__menu">
            <li><a class="ch-drop__link is-c1" href="index.html#feature">Rooms · Facilities${ICO()}</a></li>
            <li><a class="ch-drop__link is-c2" href="index.html#feature">Dining Stories ${ICO()}</a></li>
            <li><a class="ch-drop__link is-c3" href="index.html#feature">Reliable support${ICO()}</a></li>
            <li><a class="ch-drop__link is-c4" href="index.html#feature">Comfortable Surroundings${ICO()}</a></li>
          </ul></div></li>
        <li class="ch-nav__item">${roll("Steps to Move-In", "a", 'href="index.html#flow"')}</li>
        <li class="ch-nav__item">${roll("Frequently asked questions", "a", 'href="index.html#faq"')}</li>
      </ul></nav>
      <a class="ch-contact-btn ch-roll" href="#contact" data-content="Contact Us"><span class="label">Contact Us</span></a>
      <button class="ch-menu-btn" type="button" data-modal-open="global-nav" aria-label="Open Menu"><span></span><span></span><span></span></button>`;
    const modal = document.createElement("div");
    modal.className = "ch-modal";
    modal.id = "global-nav";
    modal.setAttribute("aria-hidden", "true");
    modal.dataset.slot = "global-nav";
    modal.innerHTML = `<div class="ch-modal__overlay js-nav-overlay" tabindex="-1" data-modal-close>
      <div class="ch-modal__container js-nav-container" role="dialog" aria-modal="true" aria-label="Full menu">
        <div class="ch-modal__content">
          <div class="ch-modal__top"><button class="ch-modal__close" type="button" aria-label="Close" data-modal-close></button></div>
          <div class="ch-modal__inner is-contact">
            <div class="ch-modal__box js-nav-contact"><h3>For those considering moving in</h3><div class="ch-modal__tel">${TEL}<b>0000-000-000</b></div>
              <div class="ch-modal__btns"><a class="is-line" href="#">Consult via messenger${ICO()}</a><a href="contact.html">Contact via form${ICO()}</a></div></div>
            <div class="ch-modal__box js-nav-search"><h3>Find Apartments</h3><div class="ch-modal__search"><a class="ch-tag" href="list.html">Region 1</a><a class="ch-tag" href="list.html">Region 2</a><a class="ch-tag" href="list.html">Map 1</a><a class="ch-tag" href="list.html">Map 2</a></div></div>
          </div>
          <div class="ch-modal__inner is-map js-nav-nav">${sitemap("ch-map")}</div>
        </div>
      </div>
    </div>`;
    el.after(modal);
  }

  function sitemap(cls) {
    const col = (items) => `<ul>${items.map(([h, href, sub]) => `<li class="${cls}__item">${href ? `<a class="${cls}__heading" href="${href}">${h}${ICO()}</a>` : `<span class="${cls}__heading">${h}</span>`}${sub ? `<div class="${cls}__sub">${sub}</div>` : ""}</li>`).join("")}</ul>`;
    const links = (arr) => arr.map((t) => `<a class="ch-sitemap__link" href="#">${t}</a>`).join("");
    return `<nav class="${cls}" aria-label="Sitemap">
      ${col([["First Page", "index.html"], ["Find Apartments", null, `<span class="ch-drop__tags"><a class="ch-tag" href="list.html">Region 1</a><a class="ch-tag" href="list.html">Region 2</a></span><a class="ch-sitemap__link" href="list.html">Search by school name</a>`]])}
      ${col([["Mansion highlights", null, links(["Rooms · Facilities", "Meal stories", "Reliable support", "Comfortable surroundings"])], ["Steps to Move-In", "index.html#flow"], ["Frequently asked questions", "index.html#faq"]])}
      ${cls === "ch-sitemap" ? col([["Inquiry", null, links(["For those considering moving in", "Consult via messenger", "Inquire via form", "Material Request", "Move-in Application", "Company and school staff", "Residents & Guardians"])]]) : ""}
      ${cls === "ch-sitemap" ? col([["Moving discount", "#"], ["Monitor recruitment", "#"], ["Guest room", null, links(["Stay booking form"])]]) : ""}
    </nav>`;
  }

  function buildContact(el) {
    el.className = "ch-contact";
    el.id = "contact";
    el.innerHTML = `<div class="ch-wrap">
      <div class="ch-h"><p class="ch-h__sub">contact</p><h2 class="ch-h__title">Contact Us</h2></div>
      <div class="ch-contact__container">
        <div class="ch-contact__wrap">
          <div class="ch-contact__head"><h3 class="ch-contact__title">For those considering moving in</h3><a class="ch-textlink" href="index.html#faq">Frequently asked questions${ICO()}</a></div>
          <div class="ch-tel"><h5 class="ch-tel__label">Phone Inquiry</h5><div class="ch-tel__content"><a class="ch-tel__number" href="contact.html">${TEL}0000-000-000</a><p class="ch-tel__info">Open year-round · Hours <span>00:00~00:00</span></p></div></div>
          <div class="ch-cbtns">
            <a class="ch-cbtn ch-hov is-line" href="contact.html"><span class="ch-cbtn__inner"><span>Easy consultation via messenger</span>${ARROW}</span></a>
            <a class="ch-cbtn ch-hov" href="contact.html"><span class="ch-cbtn__inner"><span>Inquire via form</span>${ARROW}</span></a>
            <a class="ch-cbtn ch-hov" href="contact.html"><span class="ch-cbtn__inner"><span>Material Request</span>${ARROW}</span></a>
            <a class="ch-cbtn ch-hov" href="contact.html"><span class="ch-cbtn__inner"><span>Move-in Application</span>${ARROW}</span></a>
          </div>
        </div>
      </div>
      <div class="ch-contact__links"><a class="ch-textlink" href="contact.html">To residents and guardians${ICO()}</a><a class="ch-textlink" href="contact.html">Companies and schools, this way${ICO()}</a></div>
    </div>`;
  }

  function buildFooter(el) {
    el.className = "ch-foot";
    const sns = ['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="currentColor"/></svg>', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 7l8 5-8 5z"/></svg>', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 5h3l11 14h-3zM5 19l6-7 1 1-5 6zm14-14l-6 7-1-1 5-6z"/></svg>'];
    el.innerHTML = `<div class="ch-wrap">
      <div class="ch-media" data-slot="media-links">
        <a class="ch-media__item" href="#"><span class="wf-logo">Magazine logo</span><p>A lifestyle information magazine supporting the new life of university and vocational students</p>${ICO("is-out")}</a>
        <a class="ch-media__item" href="#"><span class="wf-logo">Video Channel Logo</span><p>Video channel about students living alone</p>${ICO("is-out")}</a>
      </div>
      ${sitemap("ch-sitemap")}
      <div class="ch-info"><div class="ch-info__logo">${LOGO()}</div><div class="ch-info__social">${sns.map((s, i) => `<a href="#" aria-label="SNS ${i + 1}">${s}</a>`).join("")}</div>
        <p class="ch-info__copy">© BRAND. All rights reserved.</p><ul class="ch-info__links"><li><a href="#">Company info</a></li><li><a href="#">Commerce Notice</a></li><li><a href="#">Operating company</a></li><li><a href="#">Privacy policy</a></li></ul></div>
    </div>`;
  }

  // Dropdown — opens on hover and closes when you leave. Click to pin (click again to release)
  function dropMenus() {
    const menus = [...document.querySelectorAll(".js-drop-menu")];
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const pinned = new WeakMap();
    const closeOthers = (keep) => menus.forEach((m) => { if (m === keep) return; pinned.set(m, false); m.classList.remove("is-open"); m.querySelector("button")?.setAttribute("aria-expanded", "false"); });
    menus.forEach((m) => {
      const b = m.querySelector("button");
      const open = () => { if (m.classList.contains("is-open")) return; closeOthers(m); m.classList.add("is-open"); b.setAttribute("aria-expanded", "true"); };
      const shut = () => { m.classList.remove("is-open"); b.setAttribute("aria-expanded", "false"); };
      if (fine) { m.addEventListener("mouseenter", () => pinned.get(m) || open()); m.addEventListener("mouseleave", () => pinned.get(m) || shut()); }
      m.addEventListener("focusin", () => pinned.get(m) || open());
      b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); if (fine) { if (pinned.get(m)) { pinned.set(m, false); shut(); } else { pinned.set(m, true); open(); } } else m.classList.contains("is-open") ? shut() : open(); });
    });
    document.addEventListener("click", (e) => menus.forEach((m) => { if (!m.contains(e.target)) { pinned.set(m, false); m.classList.remove("is-open"); } }));
  }

  // Full menu — MicroModal opens and closes it, and on open: backdrop .3s → panel 30px from the right in .35s → contact · search · site map in order (on phone from above by 240px)
  function navModal() {
    if (!window.MicroModal) return;
    MicroModal.init({ openTrigger: "data-modal-open", closeTrigger: "data-modal-close", disableScroll: true, awaitCloseAnimation: true, onShow: (m) => {
      const ov = m.querySelector(".js-nav-overlay"), box = m.querySelector(".js-nav-container");
      if (!ov || !box || !window.gsap) return;
      box.style.overflow = "hidden";
      const done = () => (box.style.overflow = "");
      const tl = gsap.timeline({ onComplete: done, onInterrupt: done });
      if (innerWidth > 768) {
        tl.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo(box, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, "-=0.2")
          .fromTo(m.querySelector(".js-nav-contact"), { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.2")
          .fromTo(m.querySelector(".js-nav-search"), { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.2")
          .fromTo(m.querySelector(".js-nav-nav"), { x: 10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, "-=0.15");
      } else {
        tl.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.3 })
          .fromTo(box, { opacity: 0, y: -240 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, "-=0.2")
          .fromTo(m.querySelector(".js-nav-nav"), { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.1");
      }
    } });
  }

  // Same-section #links — scroll smoothly, offset by the fixed header height, and move focus (instantly with reduced motion). When entering via # from another section, it runs once on open
  function anchors() {
    const head = () => { const h = document.getElementById("header"); if (!h) return "0"; const cs = getComputedStyle(h); return cs.position === "fixed" || cs.position === "sticky" ? cs.blockSize : "0"; };
    const go = (el) => { el.style.scrollMarginBlockStart = head(); el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", inline: "end" }); el.focus({ preventScroll: true }); if (document.activeElement !== el) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); } };
    document.addEventListener("click", (e) => {
      if (e.button !== 0) return;
      const a = e.target.closest('a[href*="#"]');
      if (!a || a.getAttribute("role") === "button" || a.pathname !== location.pathname) return;
      const id = decodeURIComponent(a.hash.slice(1)), el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault(); go(el); history.pushState({}, "", a.hash);
    }, { capture: true });
    if (location.hash) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) setTimeout(() => go(el), 0); }
  }

  // On reaching 78% of the screen, rises from 20px below in .6s
  function inview() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add({ go: "(prefers-reduced-motion: no-preference)" }, () => {
      document.querySelectorAll("[data-inview]").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 20 });
        gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 78%" }, onComplete: () => (el.style.opacity = "") });
      });
    });
  }

  // Bold gradient curve — drawn with stroke-dashoffset (1.2s, 1.3s power3.inOut for lower sections), and on exit it keeps running through in the same direction.
  const NS = "http://www.w3.org/2000/svg";
  const SHAPES = {
    top: [
      { vb: "0 0 2000 480", pos: { left: "-30%", bottom: "166px", width: "max(152%, 1038px)" }, d: "M60 330C220 250 420 140 660 180C960 230 1080 420 1360 410C1700 400 1880 200 1940 70", w: 120 },
      { vb: "0 0 2000 560", pos: { left: "50%", transform: "translateX(-50%)", bottom: "220px", width: "max(147.5%, 1005px)" }, d: "M60 360C260 430 520 500 840 490C1260 480 1660 360 1940 70", w: 120 },
      { vb: "0 0 1730 890", pos: { left: "50%", transform: "translateX(-50%)", bottom: "60px", width: "max(126.6%, 865px)" }, d: "M60 830C110 720 220 610 460 560C760 500 1040 700 1320 580C1580 460 1640 220 1670 60", w: 120 },
    ],
    sp: [
      { vb: "0 0 880 240", pos: { top: "270px", left: "50%", transform: "translateX(-50%)", width: "max(120%, 875px)" }, d: "M40 170C120 90 230 20 340 60C440 100 470 180 560 195C680 215 780 170 840 60", w: 80 },
      { vb: "0 0 630 620", pos: { top: "46px", left: "50%", transform: "translateX(-50%)", width: "max(140%, 631px)" }, d: "M40 580C300 560 500 440 590 40", w: 80 },
      { vb: "0 0 610 840", pos: { top: "-74px", left: "50%", transform: "translateX(-50%)", width: "auto", height: "max(120%, 606px)" }, d: "M40 40C80 240 120 320 210 400C330 510 520 520 570 800", w: 80 },
    ],
    lower: [
      { vb: "0 0 1730 380", pos: { bottom: "90px", left: "50%", transform: "translateX(-50%)", width: "max(120%, 1731px)" }, d: "M1670 250C1600 150 1420 50 1220 80C960 120 900 260 640 300C320 350 150 220 60 110", w: 100 },
      { vb: "0 0 1680 1010", pos: { top: "-100px", left: "50%", transform: "translateX(-50%)", width: "max(120%, 1684px)" }, d: "M1620 60C1560 170 1440 330 1220 380C960 440 820 300 520 400C220 500 100 860 60 950", w: 100 },
    ],
  };
  const ChCurve = (window.ChCurve = {
    index: 0,
    list(type) { return type === "top" ? (innerWidth < 768 ? SHAPES.sp : SHAPES.top) : SHAPES.lower; },
    pick(type) { return Math.floor(Math.random() * this.list(type).length); },
    play(wrap, { type = "lower", index, delay = 0 } = {}) {
      const old = wrap.querySelector(".fv-curve");
      if (old) { gsap.killTweensOf(old.querySelectorAll("path")); old.remove(); }
      const list = this.list(type);
      this.index = index ?? this.pick(type);
      const s = list[this.index % list.length];
      const id = `chc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "fv-curve");
      svg.setAttribute("viewBox", s.vb);
      svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
      svg.setAttribute("aria-hidden", "true");
      Object.assign(svg.style, { width: "100%", height: "auto", ...s.pos });
      // Start and end colors are skin variables — keep the gradient cell colors as CSS variables
      svg.innerHTML = `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${s.vb.split(" ")[2]}" y2="${s.vb.split(" ")[3]}"><stop offset="0%" style="stop-color:var(--kf-accent)"/><stop offset="100%" style="stop-color:var(--kf-accent-soft)"/></linearGradient></defs><path d="${s.d}" fill="none" stroke="url(#${id})" stroke-width="${s.w}" stroke-linecap="round" opacity=".95"/>`;
      wrap.append(svg);
      const p = svg.querySelector("path"), L = p.getTotalLength();
      gsap.set(p, { attr: { "stroke-dasharray": L, "stroke-dashoffset": L } });
      return gsap.timeline({ delay }).to(p, { attr: { "stroke-dashoffset": 0 }, duration: type === "top" ? 1.2 : 1.3, ease: "power3.inOut" });
    },
    dismiss(wrap, delay = 0, done) {
      const svg = wrap.querySelector(".fv-curve"), p = svg && svg.querySelector("path");
      if (!p) { done?.(); return gsap.timeline(); }
      const L = p.getTotalLength();
      return gsap.timeline({ delay, onComplete: () => { svg.remove(); done?.(); } }).fromTo(p, { attr: { "stroke-dashoffset": L * 2 } }, { attr: { "stroke-dashoffset": L }, duration: 1.2, ease: "power3.inOut" });
    },
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const h = document.querySelector('header[data-slot="header"]');
  if (h) buildHeader(h);
  const c = document.querySelector('section[data-slot="contact"]');
  if (c) buildContact(c);
  const f = document.querySelector('footer[data-slot="footer"]');
  if (f) buildFooter(f);
  dropMenus();
  navModal();
  anchors();
  inview();
  // The subsection header curve is drawn once, when opened
  const lower = document.querySelector(".ch-lower .js-fv-curve-wrap");
  if (lower && window.gsap && !reduce) ChCurve.play(lower, { type: "lower" });
  else if (lower && window.gsap) { ChCurve.play(lower, { type: "lower" }).progress(1); }
})();
