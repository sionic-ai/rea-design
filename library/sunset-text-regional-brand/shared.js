// Common to all pages: draws in the paper wave background, logo, menu, map badge, contact band and footer, and hooks up menu open/close, nav hiding and rise from below.
// Original values: float-up y20→0 1.2s power2.out delay .3 (top 90%, once) · menu background .2s, content 60px→0 .8s cubic-bezier(.16,1,.3,1)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.documentElement.classList.add("is-reduced");
  const page = document.body.dataset.page || "home";
  const NM = (window.NM = { reduced });

  // Instead of the original sentence (one brush-written Chinese character), a new placeholder sentence drawn with the same navy ring and four-color brush strokes
  NM.emblem = (cls = "") => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="92" style="fill:var(--kf-on-accent)"/><circle cx="100" cy="100" r="86" fill="none" style="stroke:var(--site-navy)" stroke-width="12"/>
    <path d="M58 52 Q66 48 72 54 L74 150 Q66 158 58 150 Z" style="fill:var(--site-crimson)"/>
    <path d="M44 84 Q70 74 100 80 L98 92 Q72 88 46 96 Z" style="fill:var(--site-crimson)"/>
    <path d="M52 112 Q62 104 72 112 L70 160 Q60 166 52 158 Z" style="fill:var(--site-gold)"/>
    <path d="M90 60 Q96 54 104 60 L102 140 Q94 148 88 140 Z" style="fill:var(--site-black)"/>
    <path d="M112 52 Q150 44 156 70 Q158 92 132 100 Q160 108 156 138 Q150 162 120 158 L118 146 Q140 146 140 126 Q138 108 116 106 L116 94 Q140 90 140 72 Q138 60 114 64 Z" style="fill:var(--site-navy)"/>
  </svg>`;
  const wordmark = `<svg viewBox="0 0 230 60" aria-hidden="true"><g font-weight="900" font-size="44" stroke-width="5" paint-order="stroke" letter-spacing="2" style="font-family:var(--kf-font-display);stroke:var(--kf-on-accent)"><text x="0" y="46" style="fill:var(--site-navy)">Whoa</text><text x="52" y="46" style="fill:var(--site-crimson)">Deu</text><text x="104" y="46" style="fill:var(--site-gold)">Ma</text><text x="156" y="46" style="fill:var(--site-black)">Big</text></g></svg>`;
  // As in the original, name the frame (h1.p-header__logo) and leave the inner link bare
  const logo = `<div class="nm-logo"><a href="index.html" aria-label="Home"><span style="width:24%;flex:0 0 auto">${NM.emblem()}</span><span style="flex:1">${wordmark}</span></a></div>`;
  NM.wordmark = wordmark;
  const arrow = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 7h11M8 3l4 4-4 4"/></svg>';
  // Like the original c-button-0n, the frame holds the type name and the inner a is the button
  NM.btn = (text, href, cls = "") => `<div class="nm-btn ${cls}"><a href="${href}"><span>${text}</span><span class="nm-btn__arrow">${arrow}${arrow}</span></a></div>`;
  document.querySelectorAll("[data-btn]").forEach((el) => (el.outerHTML = NM.btn(el.textContent, el.getAttribute("href") || "#", el.className)));

  // Background: two or three layers of golden waves on cream paper (the original is a fixed background image)
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="nm-paper" aria-hidden="true"><svg viewBox="0 0 1440 900" preserveAspectRatio="none"><path d="M0 560 Q360 420 760 520 T1440 470 V900 H0Z" style="fill:var(--site-paper-1)" opacity=".55"/><path d="M0 700 Q420 600 820 680 T1440 640 V900 H0Z" style="fill:var(--site-paper-2)" opacity=".45"/><path d="M0 300 Q500 200 900 260 T1440 220" fill="none" style="stroke:var(--site-paper-3)" stroke-width="60" opacity=".25"/></svg></div>`
  );

  const menu = [
    ["Your what-is-a-brand text here", "about.html", "about", ["Type 1", "Type 2", "Type 3", "Type 4"]],
    ["Your port intro here", "index.html#port", "-", ["Port map", "Market 1", "Market 2"]],
    ["Your special product here", "about.html#premium", "-"],
    ["Participating Stores", "list.html", "list"],
    ["News", "news.html", "news"],
  ];
  const cur = (k) => (k === page || (k === "news" && page === "article") ? " is-current" : "");
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      ${logo}
      <nav class="nm-nav" aria-label="Main menu"><ul>${menu.filter((m) => m[1] !== "about.html#premium").map(([t, h, k]) => `<li class="${cur(k)}"><a href="${h}">${t}</a></li>`).join("")}</ul></nav>
      <div class="nm-icons">
        <a class="nm-yt" href="#video" aria-label="Video channel"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="currentColor"/><rect x="8" y="10.5" width="16" height="11" rx="3" style="fill:var(--kf-bg)"/><path d="M14 13.5v5l4.4-2.5z" fill="currentColor"/></svg></a>
        <div class="nm-menu-btn" role="button" tabindex="0" aria-label="Open Menu" aria-expanded="false"><svg viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="24.5" fill-opacity=".3" style="fill:var(--kf-surface)"/><circle class="nm-menu-btn__ring" cx="26" cy="26" r="24.5" stroke-width="3"/><circle class="nm-menu-btn__ring" cx="26" cy="26" r="21.5" stroke-width="1"/><rect x="18" y="18" width="6" height="6" style="fill:var(--site-black)"/><rect x="18" y="28" width="6" height="6" style="fill:var(--site-gold)"/><rect x="28" y="18" width="6" height="6" style="fill:var(--site-crimson)"/><rect x="28" y="28" width="6" height="6" style="fill:var(--site-navy)"/></svg></div>
      </div>
      <div class="nm-menu-bg"></div>
      <div class="nm-menu" data-slot="menu-drawer">
        <div>
          <div class="nm-menu__tree">${menu.map(([t, h, , kids]) => `<dl><dt class="nm-menu__p"><a href="${h}">${t}</a></dt>${kids ? `<dd class="nm-menu__c">${kids.map((c) => `<a href="${h}">${c}</a>`).join("")}</dd>` : ""}</dl>`).join("")}</div>
          <div class="nm-menu__foot">${NM.btn("Your contact button here", "#contact", "is-s")}<div><a href="#privacy">Privacy policy</a><p>© WORDMARK All Rights Reserved.</p></div></div>
        </div>
        <div class="nm-menu__img"><div class="wf-img" data-label="Close-up of a red tuna block · grain visible · wide landscape band"></div><p>A local privilege: natural fresh products</p></div>
      </div>`;
  }
  document.body.insertAdjacentHTML(
    "beforeend",
    `<a class="nm-map" href="index.html#port" aria-label="Port map" data-slot="map-badge"><svg viewBox="0 0 105 118"><path d="M52.5 2a48 48 0 0 1 48 48c0 30-48 52-48 52S4.5 80 4.5 50a48 48 0 0 1 48-48z" style="fill:var(--site-crimson)"/><circle cx="52.5" cy="50" r="40" fill="none" style="stroke:var(--kf-on-accent)" stroke-width="2"/><text x="52.5" y="38" text-anchor="middle" font-weight="900" font-size="17" style="fill:var(--kf-on-accent);font-family:var(--kf-font-display)">Here</text><text x="52.5" y="58" text-anchor="middle" font-weight="900" font-size="17" style="fill:var(--kf-on-accent);font-family:var(--kf-font-display)">Harbor</text><text x="52.5" y="76" text-anchor="middle" font-weight="900" font-size="13" style="fill:var(--kf-on-accent);font-family:var(--kf-font-display)">MAP</text><path d="M30 106h46l-6 9H36z M50 92v14 M50 94l12 8H50" style="fill:var(--site-crimson);stroke:var(--site-crimson)" stroke-width="2"/></svg></a>`
  );

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const stripe = ["var(--site-black)", "var(--site-navy)", "var(--site-crimson)", "var(--site-gold)"];
    foot.outerHTML = `
      <div class="nm-contact" id="contact" data-slot="contact-band"><dl class="nm-contact__in">
        <div class="wf-img" data-label="Dawn harbor · bridge and moored boats · blue sky with clouds · reflection on the water · wide landscape"></div>
        <div class="nm-contact__text"><dt>Inquiry</dt><dd>${NM.btn("Your contact button here", "#contact", "is-light")}</dd></div>
      </dl></div>
      <footer class="nm-foot" data-slot="footer">
        <div class="nm-foot__top"><a href="#top" data-pagetop>(Page Top)</a></div>
        <div class="nm-foot__row">
          <div><div class="nm-foot__brand">${NM.emblem()}<div style="width:100%">${wordmark}</div></div><p class="nm-foot__tag">Your short slogan here, one line<small>WORDMARK ───── Pure. Fresh. Here.</small></p></div>
          <div class="nm-foot__info"><a href="#privacy">Privacy policy</a><dl><dt>Your business name here</dt><dd>Your operating agency name here</dd><dd>〒000-0000 One line of your address here</dd><dd>tel.<a href="#tel">000-000-0000</a></dd></dl><p>©WORDMARK All Rights Reserved.</p></div>
        </div>
        <div class="nm-foot__word"><svg viewBox="0 0 1440 170" aria-hidden="true"><text x="720" y="150" text-anchor="middle" textLength="1400" lengthAdjust="spacingAndGlyphs" font-weight="900" font-size="190" fill="currentColor" style="font-family:var(--kf-font-display)">WORDMARK</text></svg></div>
        <div class="nm-stripe">${Array.from({ length: 24 }, (_, i) => `<i style="background:${stripe[i % 4]}"></i>`).join("")}</div>
      </footer>`;
    document.querySelector("[data-pagetop]").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
  }

  // ── Loader (first visit of the day, whichever page you land on) ──
  // Original: logo on .7s → .25s later off .7s → .15s later curtain lifts .9s, overlapping with logo entering from −40 and nav from +40 (on the first page, tagline and sun come in from 12px blur, wordmark from 40 below), map badge last
  const root = document.documentElement;
  if (!reduced && root.classList.contains("is-intro")) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="intro" aria-hidden="true" data-slot="loader"><div class="intro__logo">${NM.emblem()}<div style="margin-top:12px">${wordmark}</div></div></div>`);
    const home = page === "home";
    // Missing slots are filled with an empty object holding the same values — the order (timeline length) stays and it passes without warnings
    const $ = (sel) => (home || !/^#kv|nm-logo/.test(sel) ? document.querySelector(sel) : null) || { x: 0, y: 0, opacity: 0, filter: "blur(0px)" };
    const done = () => {
      root.classList.remove("is-intro");
      document.querySelector(".intro")?.remove();
      // As in the original, the leftover opacity:1 on logo, nav, buttons and map badge is not removed — so opening the menu behind them or hiding the nav makes them vanish at once via visibility after .4s instead of fading (the original quirk, kept as is)
      if (home) { gsap.set(["#kv-sun", "#kv-word"], { clearProps: "all" }); gsap.set("#kv-title", { clearProps: "opacity,filter" }); }
    };
    if (home) {
      gsap.set(".nm-logo", { x: -40, opacity: 0 });
      gsap.set(["#kv-title", "#kv-sun"], { opacity: 0, filter: "blur(12px)" });
      gsap.set("#kv-word", { opacity: 0, y: 40 });
    }
    gsap.set([".nm-nav", ".nm-icons"], { x: 40, opacity: 0 });
    gsap.set(".nm-map", { autoAlpha: 0 });
    gsap.timeline({ onComplete: done })
      .fromTo(".intro__logo", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.1 })
      .to(".intro__logo", { opacity: 0, duration: 0.7, ease: "power2.inOut", delay: 0.25 })
      .to(".intro", { opacity: 0, duration: 0.9, ease: "power2.inOut", delay: 0.15 })
      .to($(".nm-logo"), { opacity: 1, x: 0, duration: 1.2, ease: "power3.out", delay: -1.2 })
      .to([".nm-nav", ".nm-icons"], { opacity: 1, x: 0, duration: 1.8, ease: "power3.out" }, "-=0.65")
      .fromTo($("#kv-title"), { y: 30 }, { opacity: 1, filter: "blur(0px)", y: 12, duration: 1.4, ease: "power1.out", delay: 0.04 }, "-=1.1")
      .fromTo($("#kv-sun"), { y: 40 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.4, ease: "power1.out" }, "-=1.2")
      .to($("#kv-word"), { opacity: 1, y: 0, duration: 1.4, ease: "power2.out", delay: -0.8 })
      .to(".nm-map", { autoAlpha: 1, duration: 0.8, ease: "power2.out", delay: -0.4 });
  }
  // Original: a one-day cookie — returning within a day skips the loader
  localStorage.setItem("nm-visited", String(Date.now() + 864e5));

  // ── Menu ──
  const btn = document.querySelector(".nm-menu-btn");
  const panel = document.querySelector(".nm-menu");
  const bg = document.querySelector(".nm-menu-bg");
  const nav = document.querySelector(".nm-nav");
  btn &&
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); } });
  btn &&
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      [panel, bg].forEach((el) => el.classList.toggle("is-open", open));
      head && head.classList.toggle("is-menu-open", open);
      nav.classList.toggle("is-menu", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
  panel && panel.addEventListener("click", (e) => e.target.closest("a") && btn.getAttribute("aria-expanded") === "true" && btn.click());
  // Original: when the bottom of the hero block touches the top of the screen the nav hides, and it shows again when passing back (a single news item with no hero is always visible)
  const kv = document.querySelector(".kv, .ab-kv, .sp-head");
  if (nav && kv) ScrollTrigger.create({ trigger: kv, start: "bottom top", invalidateOnRefresh: true, onEnter: () => nav.classList.add("is-hide"), onLeaveBack: () => nav.classList.remove("is-hide") });
  // Original: on PC, when the top edge of the dark special-product band touches 80px from the screen top, logo, menu button and nav underline turn white
  const dark = document.querySelector(".premium");
  if (dark) gsap.matchMedia().add("(min-width: 768px)", () => {
    const light = [document.querySelector(".nm-logo"), btn, nav];
    ScrollTrigger.create({ trigger: dark, start: "top 80px", end: "bottom top", invalidateOnRefresh: true, onEnter: () => light.forEach((el) => el && el.classList.add("is-light")), onLeaveBack: () => light.forEach((el) => el && el.classList.remove("is-light")) });
    return () => light.forEach((el) => el && el.classList.remove("is-light"));
  });

  // ── Rise ──
  NM.fadeUps = () =>
    document.querySelectorAll(".js-fade-up:not([data-fu])").forEach((el) => {
      el.dataset.fu = "1";
      if (reduced) return gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(el, { y: +el.dataset.distance || 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: +el.dataset.duration || 1.2, delay: el.dataset.delay ? +el.dataset.delay : 0.3, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
  addEventListener("DOMContentLoaded", NM.fadeUps);
})();
