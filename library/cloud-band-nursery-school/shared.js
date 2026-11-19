// Shared by all pages — header (logo, menu, contact button, phone drawer), footer (round photo hill, tour inquiry card, site map), back-to-top button,
// Inserting kid illustrations, clouds and bird line drawings, turning on when visible (jquery-inview), same-page anchor scroll (400ms easeInOutCubic), footer bird line drawing (Vivus 800 frames)
const AK = (() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";

  // ---------- Icons ----------
  const ICO = {
    arrow: '<svg viewBox="0 0 16 7" aria-hidden="true"><path d="M0 3.5h14.5M11 .6l3.6 2.9L11 6.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 15 20" aria-hidden="true"><path d="M3.5 8V5.5a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="1" y="8" width="13" height="11" rx="2" fill="currentColor"/></svg>',
    blank: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M8 1h5v5M13 1 6.5 7.5M11 9v4H1V3h4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    mail: '<svg viewBox="0 0 20 15.5" aria-hidden="true"><rect width="20" height="15.5" rx="2" fill="currentColor"/><path d="m1.5 2 8.5 6.5L18.5 2" fill="none" class="ak-ico__cut" stroke-width="1.6"/></svg>',
    tel: '<svg viewBox="0 0 28 30" aria-hidden="true"><path d="M7 1.5 11.5 9 8.4 12.2c1.6 3.7 4.1 6.6 7.6 8.6l3.3-3 7.2 4.6-2.6 5.4c-.8 1.4-2.3 2-3.9 1.6C11.4 26.6 3.4 18 1.6 8.2c-.3-1.6.4-3.1 1.8-3.8z" fill="currentColor"/></svg>',
    insta: '<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="1.5" y="1.5" width="23" height="23" rx="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="13" cy="13" r="5.4" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="19.6" cy="6.4" r="1.6" fill="currentColor"/></svg>',
    up: '<svg viewBox="0 0 16 7" aria-hidden="true"><path d="M0 3.5h14.5M11 .6l3.6 2.9L11 6.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  // ---------- Drawings (the original’s hand-drawn kids, clouds and sun — redrawn at the same position and size) ----------
  const face = (cx, cy, r) => `<circle class="k-skin" cx="${cx}" cy="${cy}" r="${r}"/>
    <circle class="k-eye" cx="${cx - r * 0.32}" cy="${cy + r * 0.1}" r="${r * 0.11}"/><circle class="k-eye" cx="${cx + r * 0.32}" cy="${cy + r * 0.1}" r="${r * 0.11}"/>
    <circle class="k-cheek" cx="${cx - r * 0.55}" cy="${cy + r * 0.42}" r="${r * 0.18}"/><circle class="k-cheek" cx="${cx + r * 0.55}" cy="${cy + r * 0.42}" r="${r * 0.18}"/>
    <path class="k-mouth" d="M${cx - r * 0.2} ${cy + r * 0.45}q${r * 0.2} ${r * 0.22} ${r * 0.4} 0"/>`;
  const hairBoy = (cx, cy, r) => `<path class="k-hair" d="M${cx - r * 1.02} ${cy + r * 0.1}C${cx - r * 1.1} ${cy - r * 0.9} ${cx - r * 0.2} ${cy - r * 1.25} ${cx + r * 0.5} ${cy - r * 0.95}C${cx + r * 1.05} ${cy - r * 0.7} ${cx + r * 1.08} ${cy - r * 0.2} ${cx + r * 1.02} ${cy + r * 0.05}C${cx + r * 0.6} ${cy - r * 0.45} ${cx - r * 0.2} ${cy - r * 0.55} ${cx - r * 0.55} ${cy - r * 0.25}C${cx - r * 0.75} ${cy - r * 0.05} ${cx - r * 0.9} ${cy + r * 0.05} ${cx - r * 1.02} ${cy + r * 0.1}Z"/>`;
  const hairGirl = (cx, cy, r) => hairBoy(cx, cy, r) + `<path class="k-hair" d="M${cx - r * 1.02} ${cy - r * 0.1}c-${r * 0.5} ${r * 0.3} -${r * 0.55} ${r * 0.9} -${r * 0.2} ${r * 1.2}c${r * 0.1} -${r * 0.4} ${r * 0.2} -${r * 0.7} ${r * 0.35} -${r * 0.95}zM${cx + r * 1.02} ${cy - r * 0.1}c${r * 0.5} ${r * 0.3} ${r * 0.55} ${r * 0.9} ${r * 0.2} ${r * 1.2}c-${r * 0.1} -${r * 0.4} -${r * 0.2} -${r * 0.7} -${r * 0.35} -${r * 0.95}z"/>`;
  const ART = {
    // Child flying through the sky — arms stretched forward, legs back
    fly: `<svg viewBox="0 0 140 96" aria-hidden="true"><path class="k-limb" d="M58 46 24 26M62 42 50 14"/><path class="k-limb k-leg" d="M86 58l26 12M80 64l20 18"/>
      <path class="k-shoe" d="m110 64 13 3-2 9-13-2zM97 78l12 6-4 8-12-5z"/><path class="k-shirt" d="M48 40c12-10 34-6 42 12l-6 16c-16 4-34-2-42-14z"/>
      <path class="k-pants" d="M80 50l14 6-6 14-12-6z"/>${face(40, 46, 16)}${hairBoy(40, 46, 16)}</svg>`,
    // Child running with arms spread (dress)
    jump: `<svg viewBox="0 0 100 116" aria-hidden="true"><path class="k-limb" d="M50 50 20 34M50 50 80 34"/><path class="k-limb k-leg" d="M44 84 38 104M56 84 62 104"/>
      <path class="k-shoe" d="M30 102h11v6H28zM59 102h11l3 6H59z"/><path class="k-shirt" d="M42 44h16l14 42H28z"/>${face(50, 30, 15)}${hairGirl(50, 30, 15)}</svg>`,
    // Child in a hot-air balloon basket — vertical-striped balloon
    balloon: `<svg viewBox="0 0 120 176" aria-hidden="true"><ellipse class="k-bal-a" cx="60" cy="54" rx="48" ry="52"/>
      <path class="k-bal-b" d="M60 2C40 22 38 86 52 108h16C82 86 80 22 60 2zM60 2C30 8 14 50 30 98l8 6C26 60 36 18 60 2zM60 2c30 6 46 48 30 96l-8 6c12-44 2-86-22-102z"/>
      <path class="k-rope" d="M40 104 44 140M80 104l-4 36M58 108v32"/>${face(60, 124, 15)}${hairBoy(60, 124, 15)}
      <path class="k-limb" d="M74 136 92 120"/><path class="k-basket" d="M38 138h44l-5 30H43z"/><path class="k-basket-line" d="M40 150h40M42 160h36"/></svg>`,
    // Two children holding hands (on the footer lawn)
    pair: `<svg viewBox="0 0 150 110" aria-hidden="true"><path class="k-limb" d="M44 52 18 36M44 52 70 64M106 52l26-16M106 52 80 64"/><path class="k-limb k-leg" d="M38 86 36 104M50 86l2 18M100 86l-2 18M112 86l2 18"/>
      <path class="k-shoe" d="M28 102h10v6H26zM50 102h10l2 6H50zM90 102h10v6H88zM112 102h10l2 6h-12z"/>
      <path class="k-shirt" d="M34 46h20l8 42H26z"/><path class="k-shirt k-shirt-2" d="M96 46h20v26H96z"/><path class="k-pants" d="M96 70h20l2 18H94z"/>
      ${face(44, 32, 14)}${hairGirl(44, 32, 14)}${face(106, 32, 14)}${hairBoy(106, 32, 14)}</svg>`,
    // Sun with stippled rays spreading (lower half buried in clouds)
    sun: `<svg viewBox="0 0 500 460" aria-hidden="true"><g class="k-rays">${Array.from({ length: 9 }, (_, i) => {
      const a = (-170 + i * 20) * (Math.PI / 180), x = 250 + Math.cos(a) * 250, y = 330 + Math.sin(a) * 250;
      const w = 0.09;
      return `<path d="M250 330L${(250 + Math.cos(a - w) * 250).toFixed(1)} ${(330 + Math.sin(a - w) * 250).toFixed(1)}L${(250 + Math.cos(a + w) * 250).toFixed(1)} ${(330 + Math.sin(a + w) * 250).toFixed(1)}Z" data-x="${x.toFixed(0)}" data-y="${y.toFixed(0)}"/>`;
    }).join("")}</g><circle class="k-sun" cx="250" cy="330" r="46"/></svg>`,
  };

  // ---------- Line drawing (Vivus draws along the strokes) ----------
  const LINES = {
    // Slanted threads and pigeon in the Heart for Education section (original decoBird 566 wide)
    dove: { box: "0 0 566 360", d: ["M8 352 420 62", "M420 62c18-10 38-14 54-6 6-26 22-48 38-46-8 12-12 26-8 38 16-4 30 0 40 10-14 6-30 6-44 2-12 16-34 24-54 18-12-4-22-12-26-16z", "M486 52c8-10 18-16 26-12"] },
    // Kite string hanging over the footer photo hill (original footerBird 232 width)
    string: { box: "0 0 232 300", d: ["M118 296C40 236 4 160 30 96 46 58 80 36 116 26c10-3 18-10 14-16-5-6-15 0-12 8 3 6 12 6 20 2"] },
  };
  const line = (key, cls) => {
    const L = LINES[key];
    return `<svg class="${cls}" viewBox="${L.box}" aria-hidden="true">${L.d.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
  };
  const drawLine = (svg, frames) => {
    if (!svg || !window.Vivus) return;
    if (reduce) return;
    new Vivus(svg, { duration: frames, animTimingFunction: Vivus.EASE_OUT });
  };

  document.querySelectorAll("[data-art]").forEach((el) => {
    el.innerHTML = ART[el.dataset.art] || "";
  });
  document.querySelectorAll("[data-ico]").forEach((el) => {
    el.innerHTML = ICO[el.dataset.ico] || "";
  });
  document.querySelectorAll("[data-line]").forEach((el) => {
    el.outerHTML = line(el.dataset.line, el.className);
  });

  // ---------- Head ----------
  const NAV = [
    ["index.html", "Home", "is-sp"],
    ["about.html", "A heart for education"],
    ["service.html", "Our center’s strengths"],
    ["#", "About Our Center"],
    ["#", "Life at the kindergarten"],
    ["#", "Enrolled guardian page", "", "lock"],
    ["recruit.html", "Hiring Info", "is-sp", "blank"],
  ];
  const logo = `<span class="ak-logo__mark" aria-hidden="true"><svg viewBox="0 0 60 60"><path class="ak-logo__petal" d="M30 2l6 9 10-4 1 11 11 1-4 10 9 6-9 6 4 10-11 1-1 11-10-4-6 9-6-9-10 4-1-11-11-1 4-10-9-6 9-6-4-10 11-1 1-11 10 4z"/><circle class="ak-logo__ring" cx="30" cy="30" r="15"/><path class="ak-logo__sun" d="M21 33a9 9 0 0 1 18 0zM20 36h20"/></svg></span>
    <span class="ak-logo__txt"><small data-label="Company name, one line">Social welfare corporation name</small><b data-label="Circle name (logo text)">Daycare name</b></span>`;
  const header = document.querySelector(".ak-header");
  if (header) {
    header.innerHTML = `<div class="ak-header__in">
      <a class="ak-logo" href="index.html" aria-label="First Page">${logo}</a>
      <nav class="ak-nav" aria-label="Site Menu">
        <button class="ak-nav__btn" type="button" aria-label="Open Menu" aria-expanded="false"><span class="ak-nav__icon"><span></span><span></span><span></span></span></button>
        <div class="ak-nav__veil"></div>
        <div class="ak-nav__panel">
          <ul class="ak-nav__list">${NAV.map(([h, t, c = "", ico]) => `<li class="ak-nav__item ${c}"><a class="ak-nav__link" href="${h}"><span class="ak-ico is-arrow">${ICO.arrow}</span><span>${t}</span>${ico ? `<span class="ak-ico is-${ico}">${ICO[ico]}</span>` : ""}</a></li>`).join("")}</ul>
          <div class="ak-nav__contact"><a class="ak-btn is-contact no-shadow" href="#contact" data-fx="plate-pop-hover"><span class="ak-ico">${ICO.mail}</span><span>Contact Us</span></a></div>
          <a class="ak-nav__insta" href="#" aria-label="Social Media">${ICO.insta}</a>
        </div>
      </nav></div>`;
    const nav = header.querySelector(".ak-nav");
    const btn = header.querySelector(".ak-nav__btn");
    const setOpen = (v) => {
      nav.classList.toggle("is-open", v);
      btn.setAttribute("aria-expanded", v);
      btn.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = v ? "hidden" : "";
      document.body.style.overflow = v ? "hidden" : "";
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    header.querySelector(".ak-nav__veil").addEventListener("click", () => setOpen(false));
    addEventListener("keyup", (e) => e.key === "Escape" && setOpen(false));
  }

  // ---------- Footer ----------
  const FOOT = [
    ["is-a", "index.html", "Home", []],
    ["is-b", "about.html", "A heart for education", ["Founding Spirit", "Educational Philosophy", "Childcare Goals"]],
    ["is-c", "service.html", "Our center’s strengths", ["Education Strengths", "Commitment to Dining", "Peace of mind·Safety"]],
    ["is-d", "#", "About Our Center", ["Center overview", "Directions", "About the Facility", "Original outfit"]],
    ["is-e", "#", "Life at the kindergarten", ["A day at the clinic", "Annual events", "Main Events"]],
  ];
  const footer = document.querySelector(".ak-footwrap");
  if (footer) {
    footer.innerHTML = `<div class="ak-footwrap__photo wf-img" data-label="Clinic building full view · grass field and trees · clear blue sky · arched top · landscape 2.4:1"></div>
      <i class="ak-art ak-kid is-foot-1" data-art="jump" style="--k-shirt: var(--site-purple)"></i>
      <i class="ak-art ak-kid is-foot-2" data-art="pair"></i>
      ${line("string", "ak-line ak-footwrap__bird")}
      <aside class="ak-contact" id="contact" data-slot="contact-card">
        <div class="ak-contact__top"><p>Welcome · Preschool building and childcare tour</p><p>Check with your eyes, feel with your heart</p><p>Please contact us in advance if you would like to visit.</p></div>
        <div class="ak-contact__in">
          <div class="ak-contact__tel"><h3>Phone Inquiry</h3><a href="#"><span class="ak-ico">${ICO.tel}</span><span class="ak-contact__num">0000-00-0000</span></a><p>Hours: Mon–Sat 00:00~00:00</p></div>
          <div class="ak-contact__mail"><h3>Email Inquiry</h3><a class="ak-btn is-contact" href="#" data-fx="plate-pop-hover"><span class="ak-ico">${ICO.mail}</span><span>Contact Us</span></a></div>
        </div>
      </aside>
      <footer class="ak-footer">
        <a class="ak-top" href="#" aria-label="Back to top"><span class="ak-ico">${ICO.up}</span></a>
        <div class="ak-footer__in">
          <div class="ak-footer__info"><p class="ak-footer__logo"><a class="ak-logo is-dark" href="index.html">${logo}</a></p>
            <address>〒000-0000<br>Your address line here 00-0<br>[<a href="#">View on map<span class="ak-ico">${ICO.blank}</span></a>]</address></div>
          <nav class="ak-footer__nav"><div class="ak-footer__list">
            ${FOOT.map(([c, h, t, kids]) => `<div class="ak-footer__item ${c}"><a class="ak-footer__link" href="${h}">${t}</a>${kids.length ? `<ul>${kids.map((k) => `<li><a href="${h}">${k}</a></li>`).join("")}</ul>` : ""}</div>`).join("")}
            <div class="is-f"><div class="ak-footer__item"><a class="ak-footer__link" href="#"><span>Enrolled guardian page</span><span class="ak-ico is-lock">${ICO.lock}</span></a></div>
              <div class="ak-footer__item"><a class="ak-footer__link" href="#">Information disclosure</a></div>
              <div class="ak-footer__item"><a class="ak-footer__link" href="recruit.html"><span>Hiring Info</span><span class="ak-ico is-blank">${ICO.blank}</span></a></div>
              <div class="ak-footer__item"><a class="ak-footer__link" href="#" aria-label="Social Media"><span class="ak-ico is-insta">${ICO.insta}</span></a></div></div>
          </div></nav>
        </div>
        <p class="ak-footer__copy"><small>© School Name</small></p>
      </footer>`;
    footer.querySelectorAll("[data-art]").forEach((el) => { el.innerHTML = ART[el.dataset.art]; });
  }

  // Paper grain on the drawing (rough edges) — slot for the original drawing and cloud stippled borders
  document.body.insertAdjacentHTML("beforeend", `<svg class="ak-defs" width="0" height="0" aria-hidden="true"><filter id="ak-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`);

  // ---------- Show on visible — original jquery-inview attaches inview to .js-inview (1s transparent · 10% below → in place) ----------
  const inview = () => {
    if (reduce || !$ || !$.fn.on) { document.querySelectorAll(".ak-inview").forEach((el) => el.classList.add("is-in")); return; }
    $(".ak-inview").on("inview", function () { this.classList.add("is-in"); });
  };

  // ---------- Back to top — appears with a bounce after scrolling half a screen height ----------
  const top = document.querySelector(".ak-top");
  const onScroll = () => top && top.classList.toggle("is-scrolled", scrollY > innerHeight * 0.5);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Same-page anchor — original js-scroll: 400ms easeInOutCubic, header gap 120 (PC) · 90 (tablet) · 56 (phone) ----------
  const gap = () => (matchMedia("(min-width: 1024px)").matches ? 120 : matchMedia("(min-width: 768px)").matches ? 90 : 56);
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".ak-scroll, .ak-top");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    const t = href === "#" ? null : document.querySelector(href);
    const y = t ? t.getBoundingClientRect().top + scrollY - gap() : 0;
    if (reduce || !$) return scrollTo(0, y);
    $("html, body").stop().animate({ scrollTop: y }, 400, "easeInOutCubic");
  });

  addEventListener("DOMContentLoaded", () => {
    inview();
    if (footer) drawLine(footer.querySelector(".ak-footwrap__bird"), 800);
  });

  return { reduce, page, drawLine, ICO, ART };
})();
