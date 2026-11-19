// Inserted here so all pages share the same header, phone menu, full banner and footer. The three jobs of the original script_common.js
// (button text splitting — here the letter-spring-rise part · adding classes on scroll · phone menu open/close) is also handled here.
(() => {
  const ICON = {
    insta: '<svg viewBox="0 0 16 16" fill="none" stroke-width="1.4"><rect x="1.5" y="1.5" width="13" height="13" rx="4"/><circle cx="8" cy="8" r="3"/><circle cx="12" cy="4" r=".4"/></svg>',
    cart: '<svg viewBox="0 0 16 16" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 2h2l1.6 8h7.4l1.5-5.5H4.3"/><circle cx="6" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    blank: '<svg viewBox="0 0 16 16" fill="none" stroke-width="1.3" stroke-linejoin="round"><rect x="2" y="5" width="9" height="9" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2H12.5A1.5 1.5 0 0 1 14 3.5V9.5A1.5 1.5 0 0 1 12.5 11H11"/></svg>',
  };
  const NAV = [["Illustrations", "index.html#illustrations"], ["Works", "works.html"], ["About", "about.html"], ["News", "news.html"]];

  const header = `
<a class="ts-logo" href="index.html" data-fx="bubble-bound-hover" aria-label="First Page">
  <span class="ts-logo__face ts-art" data-art="logo-face" data-label="Logo · hand-drawn owner’s face · side profile landscape 6:5"></span>
  <span class="ts-logo__text" data-fx-part="bubble" data-label="English wordmark two lines">Name<br>portfolio</span>
</a>
<div class="ts-nav">
  <nav class="ts-nav__ext" aria-label="External Link"><a class="ts-act" href="#" aria-label="Social Media">${ICON.insta}</a><a class="ts-act" href="#" aria-label="Online shop">${ICON.cart}</a></nav>
  <nav class="ts-nav__int" aria-label="Menu">
    ${NAV.map(([t, h]) => `<a class="ts-nav__link" href="${h}">${t}</a>`).join("")}
    <a class="ts-nav__link is-contact ts-btn" href="#ts-contact" data-fx="letter-spring-rise"><span data-fx-part="letters">Contact</span></a>
  </nav>
</div>
<button class="ts-spbtn is-normal" type="button" aria-label="Open Menu" aria-controls="ts-spmenu" data-sp-toggle>${ICON.menu}</button>`;

  const spmenu = `
<div class="ts-spmenu__inner">
  <button class="ts-spbtn is-close" type="button" aria-label="Close Menu" data-sp-toggle>${ICON.plus}</button>
  <div class="ts-spmenu__logo"><span class="ts-art" data-art="logo-face"></span><span class="ts-spmenu__name">Name<br>portfolio</span></div>
  <nav class="ts-spmenu__links"><a href="index.html">Home</a><a href="about.html">About</a><a href="index.html#illustrations">Illustrations</a><a href="works.html">Works</a><a href="news.html">News</a><a href="#ts-contact">Contact</a></nav>
  <nav class="ts-spmenu__ext"><a class="ts-act" href="#" aria-label="Social Media">${ICON.insta}</a><a class="ts-act" href="#" aria-label="Online shop">${ICON.cart}</a></nav>
</div>`;

  const store = `
<a class="ts-banner ts-banner--dark ts-grass-frame" href="#">
  <div class="ts-banner__img"><span class="ts-art" data-art="basket" data-label="Store illustration · hand-drawn figure sitting in a basket · portrait 7:8"></span></div>
  <dl class="ts-banner__info"><dt class="ts-banner__title"><span class="ts-banner__en">Online Store</span>Your shop name here</dt><dd class="ts-banner__text">Introduce what the shop sells in about two lines here. A spot for items like portfolios, stickers and postcards.</dd></dl>
  <span class="ts-banner__go">${ICON.blank}</span>
</a>`;
  const contact = `
<a class="ts-banner ts-banner--light ts-grass-frame" href="#" id="ts-contact">
  <div class="ts-banner__img"><span class="ts-art" data-art="envelope" data-label="Contact image · open envelope surrounded by grass · nearly square"></span></div>
  <dl class="ts-banner__info"><dt class="ts-banner__title"><span class="ts-banner__en">Contact</span>Your contact title here</dt><dd class="ts-banner__text">Your one line of contact info here.<br>Your one more line saying requests, consultations and questions are welcome here.</dd></dl>
</a>`;

  const footer = `
<span class="ts-footer__clouds ts-art" data-art="footer-clouds"></span>
<div class="ts-footer__wrap">
  <span class="ts-footer__land is-1 ts-art" data-art="land-1"></span><span class="ts-footer__land is-3 ts-art" data-art="land-3"></span>
  <div class="ts-footer__in">
    <span class="ts-footer__hill ts-art" data-art="footer-hill" data-label="Footer top · hand-drawn round grassy hill and bushes · very wide landscape"></span>
    <ul class="ts-footer__links">
      <li><a href="index.html">Home<span class="ts-footer__en">Home</span></a></li>
      <li><a href="index.html#illustrations">Picture<span class="ts-footer__en">Illustrations</span></a></li>
      <li><a href="works.html">Work intro<span class="ts-footer__en">Works</span></a></li>
      <li><a href="about.html">About<span class="ts-footer__en">About</span></a></li>
      <li><a href="news.html">News<span class="ts-footer__en">News</span></a></li>
      <li class="ts-footer__land ts-art ts-pc" data-art="land-2" aria-hidden="true"></li>
    </ul>
    <nav class="ts-footer__big" aria-label="Contact · Shop · Social">
      <a href="#ts-contact"><span class="ts-art is-env" data-art="envelope"></span><p>Contact Us<span class="ts-footer__en">Contact</span></p></a>
      <a href="#"><span class="ts-art is-store" data-art="basket"></span><p>Shop Name<span class="ts-footer__en">Online Shop</span></p></a>
      <a href="#"><span class="ts-art is-insta" data-art="insta"></span><p>Social Media<span class="ts-footer__en">Instagram</span></p></a>
    </nav>
  </div>
  <div class="ts-footer__copy"><small>Copyright ©Name All Rights Reserved.</small><p>Your copyright notice goes here in two lines. Say that unauthorized copying and reposting of text, photos and art is prohibited, with a note on legal action.</p></div>
</div>`;

  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { if (!el.children.length) el.innerHTML = html; });
  fill("header[data-slot=header]", header);
  fill("nav[data-slot=mobile-menu]", spmenu);
  document.querySelectorAll("[data-ts-banners]").forEach((el) => {
    if (el.querySelector(".ts-banner")) return;
    el.insertAdjacentHTML("afterbegin", el.dataset.tsBanners.split(" ").map((k) => (k === "store" ? store : contact)).join(""));
  });
  fill("footer[data-slot=footer]", footer);
  // Drawings with Motion parts attached (walking child, curtain section turn) must be drawn before the parts sweep so the section can be found. The rest after the first screen is painted — they must appear immediately like the original
  window.tsArt(document, (el) => el.hasAttribute("data-fx"));
  // The rest one at a time during idle gaps — drawing them all at once delays the first gesture (logo hover) by a few frames
  const idle = window.requestIdleCallback || ((f) => setTimeout(() => f({ timeRemaining: () => 8 }), 16));
  const rest = [...document.querySelectorAll("[data-art]:not([data-art-done])")];
  const drawSome = (dl) => {
    do { const el = rest.shift(); if (el) window.tsArt(el.parentNode, (n) => n === el); } while (rest.length && dl.timeRemaining() > 4);
    if (rest.length) idle(drawSome, { timeout: 500 });
  };
  idle(drawSome, { timeout: 500 });

  // Phone menu — toggles a single class as in the original (display and opacity change at once so it appears immediately)
  const menu = document.getElementById("ts-spmenu");
  document.querySelectorAll("[data-sp-toggle]").forEach((b) => b.addEventListener("click", () => menu && menu.classList.toggle("is-open")));
  menu && menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("is-open")));

  // Original js__animateEffect — only while scrolling, add is-active once the element’s top edge passes the screen bottom
  const reveals = [...document.querySelectorAll(".ts-reveal")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) reveals.forEach((el) => el.classList.add("is-active"));
  else addEventListener("scroll", () => {
    for (const el of reveals) {
      if (el.classList.contains("is-active")) continue;
      if (scrollY > el.getBoundingClientRect().top + scrollY - innerHeight) el.classList.add("is-active");
    }
  }, { passive: true });

  // More on the list section — receives the next section’s items via the original Infinite Scroll (same board) and appends them below
  const list = document.querySelector("[data-ts-infinite]");
  if (list && window.InfiniteScroll) {
    // The original Work list has more pages, so the button stays and gets pushed down by the appended items, which drops the hover. News has only two pages, so the button disappears once loaded — loads data-ts-pages times
    const next = list.dataset.tsInfinite, pages = +(list.dataset.tsPages || 1);
    new InfiniteScroll(list, {
      path() { return next && this.loadCount < pages ? next : undefined; },
      append: ".js-infinite-item",
      button: ".js-view-more",
      scrollThreshold: false,
      status: ".ts-load-status",
      history: false,
    }).on("append", () => window.tsArt(list));
  }
})();
