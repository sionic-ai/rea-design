/* Common to all pages: draws the header (fixed logo · top-right cluster · menu button) · yellow menu panel · white footer, and fills in graphics like the logo mark · pattern · arrows. 
   Original config.js as is — pressing the menu button fades the panel in with jQuery fadeIn('fast')(200ms swing = sine.inOut) to cover, and once fully covered,
   is_menu_open is added and the three lines turn into × (.2s), and on close it is removed immediately along with fadeOut. Esc closes it too. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const A = '<path class="tt-mark-a" d="M14 6C7 6 3 11 4 18l5 44c1 8 6 12 14 12h17c10 0 16-7 14-16-1-5-5-9-10-10 7-2 11-8 10-15l-2-15c-1-8-6-12-14-12Z"/><circle class="tt-mark-eye" cx="17" cy="62" r="3.2"/><circle class="tt-mark-eye" cx="27" cy="61" r="3.2"/>';
  const B = '<path class="tt-mark-b" stroke-width="5" stroke-linejoin="round" d="M65 10c-6-1-10 3-10 9v15c6 1 9 6 8 12-1 5-5 7-9 7l-1 11c0 6 4 10 10 10l37 3c6 0 10-4 10-10l2-45c0-6-4-10-10-10Z"/><circle class="tt-mark-eye" cx="73" cy="23" r="3.2"/><circle class="tt-mark-eye" cx="83" cy="24" r="3.2"/>';
  const SVG = {
    mark: `<svg viewBox="0 0 120 82" aria-hidden="true">${A}${B}</svg>`,
    a: `<svg viewBox="0 0 60 80" aria-hidden="true"><g transform="rotate(-8 30 40)">${A}</g></svg>`,
    b: `<svg viewBox="48 2 70 80" aria-hidden="true"><g transform="rotate(6 84 42)">${B}</g></svg>`,
    clap: `<svg viewBox="0 0 64 60" aria-hidden="true"><g transform="translate(18 12) scale(.6) rotate(-14 30 40)">${A}</g><path class="tt-clap__burst" d="M10 10l6 7M4 24l8 2M20 3l2 8M50 46l6 5M46 54l3 5" fill="none" stroke-width="3" stroke-linecap="round"/></svg>`,
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.9 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8C6.9 7.3 5.4 8.2 4.6 9.7c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.6-4ZM14.1 5.6c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 2.8v18.4c0 .5.5.8.9.6l16-8.9c.5-.3.5-.9 0-1.2l-16-9C4.5 2 4 2.3 4 2.8Z" opacity=".9"/></svg>',
  };
  const badges = (cls = "") => `<ul class="tt-badges ${cls}">
      <li><a href="#" aria-label="Download from the app store"><span class="tt-badge" data-label="App store download badge (black rounded plate)">${SVG.store}<span><b>App Store</b><small>Download from</small></span></span></a></li>
      <li><a href="#" aria-label="Get it on the app store"><span class="tt-badge" data-label="App store download badge (black rounded plate)">${SVG.play}<span><b>Google Play</b><small>Receive from</small></span></span></a></li>
    </ul>`;
  const NAV = [
    ["index.html", "TOP"], ["news.html", "Reads"], ["faq.html", "Frequently asked questions"], ["service.html", "Advertising · partnership info"], ["index.html#guide", "Contact Us"],
  ];
  const navItem = ([href, txt], fill) => `<li><a href="${href}" data-fx="sweep-through-hover" style="--fx-dur: .5s; --fx-ease: ease; --fx-fill: ${fill}"><span data-fx-part="band"></span><span>${txt}</span></a></li>`;
  const sns = `<dl class="tt-sns"><dt>FOLLOW US</dt><dd><a class="tt-sns__x" href="#" aria-label="Official social account">${SVG.x}</a></dd></dl>`;

  const header = document.querySelector("[data-slot='header']");
  if (header) {
    header.innerHTML = `<h1 class="tt-logo"><a href="index.html" aria-label="Brand first page" data-label="Logo — yellow two-piece speech bubble mark + thin logotype">${SVG.mark}<span class="tt-logo__type">Brand name</span></a></h1>
      <svg class="tt-corner" viewBox="0 0 181 140" preserveAspectRatio="xMaxYMin meet" aria-hidden="true"><path d="M0 0h181v140h-36c-31 0-49-14-62-38C71 80 60 64 40 52 20 40 6 24 0 0Z"/></svg>
      <button type="button" class="tt-burger" aria-label="Open Menu" aria-expanded="false"><span></span></button>
      <div class="tt-drawer" data-slot="menu-drawer">
        <div class="tt-drawer__pict" data-hand-phone="3D render of a hand-held phone — app post list screen, white sleeve, transparent background, portrait 659:840"></div>
        <div class="tt-drawer__wrap"><div class="tt-drawer__body">
          <ul class="tt-drawer__nav">${NAV.map((n) => navItem(n, "var(--kf-surface)")).join("")}</ul>
          ${sns}
          <ul class="tt-links tt-drawer__links"><li><a href="#">Terms of service</a></li><li><a href="#">Privacy policy</a></li><li><a href="service.html">Ad placement info</a></li><li><a href="#">Operating company</a></li></ul>
        </div></div>
        ${badges("tt-drawer__badges")}
        <p class="tt-drawer__copy"><small>Copyright © 0000 Company Name. All Rights Reserved.</small></p>
      </div>`;
  }

  const footer = document.querySelector("[data-slot='footer']");
  if (footer) {
    footer.classList.add("tt-footer");
    footer.innerHTML = `<div class="tt-container">
      <div class="tt-footer__pict"><div class="tt-phone tt-footer__phone"><div class="tt-phone__screen"><div class="wf-img" data-label="App start screen · yellow wavy header · logo · yellow start button"></div></div></div></div>
      <div class="tt-footer__body">
        <div class="tt-footer__cta">
          <p class="tt-footer__cta-text">The brand<br>Start right now!</p>
          ${badges()}
        </div>
        <ul class="tt-footer__nav">${[NAV[0], NAV[2], NAV[4], NAV[1], NAV[3]].map((n) => navItem(n, "var(--kf-accent)")).join("")}</ul>
        ${sns}
        <ul class="tt-links"><li><a href="#">Terms of service</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Related Links</a></li><li><a href="#">Operating company</a></li><li><a href="service.html">Ad placement info</a></li></ul>
        <p class="tt-footer__copy"><small>Copyright © 0000 Company Name. All Rights Reserved.</small></p>
      </div>
    </div>`;
  }

  // Picture fill — logomark pieces · arrows · phone in hand · patterns
  document.querySelectorAll("[data-mark]").forEach((el) => (el.innerHTML = SVG[el.dataset.mark] || ""));
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = SVG[el.dataset.icon] || ""));
  document.querySelectorAll("[data-hand-phone]").forEach((el) => {
    el.classList.add("tt-handphone");
    el.innerHTML = `<span class="tt-handphone__hand"></span><span class="tt-handphone__cuff"></span>
      <div class="tt-phone tt-handphone__phone"><div class="tt-phone__screen"><div class="wf-img" data-label="${el.dataset.handPhone}"></div></div></div><span class="tt-handphone__thumb"></span>`;
  });
  let pat = 0;
  document.querySelectorAll("[data-pattern]").forEach((el) => {
    const id = `tt-pat-${++pat}`;
    el.insertAdjacentHTML("afterbegin", `<svg class="tt-pattern" aria-hidden="true"><defs><pattern id="${id}" width="300" height="230" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
      <g transform="translate(12 18) scale(.9)"><path class="tt-pat-fill" d="M14 6C7 6 3 11 4 18l5 44c1 8 6 12 14 12h17c10 0 16-7 14-16-1-5-5-9-10-10 7-2 11-8 10-15l-2-15c-1-8-6-12-14-12Z"/></g>
      <text x="110" y="62" font-size="46">Brand</text>
      <g transform="translate(150 100) scale(.85)"><path class="tt-pat-line" stroke-width="7" stroke-linejoin="round" d="M65 10c-6-1-10 3-10 9v15c6 1 9 6 8 12-1 5-5 7-9 7l-1 11c0 6 4 10 10 10l37 3c6 0 10-4 10-10l2-45c0-6-4-10-10-10Z"/></g>
      <text x="8" y="200" font-size="46">Brand</text>
    </pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`);
  });

  // Lazy image loading — the original config.js .u-loadlazy: images not yet arrived are hidden, and once they arrive they wait 300ms then appear with .3s linear.
  // The copy has no images to download so window load counts as arrival. The original doesn’t hide when images are cached (reopened in the same session), so first visit first page only
  const seen = sessionStorage.getItem("tt-seen") === "1";
  sessionStorage.setItem("tt-seen", "1");
  if (!reduce && !seen && document.body.dataset.page === "home") {
    const lazy = document.querySelectorAll(".tt-fv__art, .tt-svc__shot, .tt-card__thumb, .tt-product__hp, .tt-footer__pict");
    lazy.forEach((el) => el.classList.add("is-lazy-hide"));
    const show = () => setTimeout(() => lazy.forEach((el) => el.classList.add("is-lazy-show")), 300);
    document.readyState === "complete" ? show() : addEventListener("load", show, { once: true });
  }

  // Menu panel — fadeIn( from the original config.js'fast') / fadeOut('fast')
  const btn = document.querySelector(".tt-burger"), drawer = document.querySelector(".tt-drawer");
  if (btn && drawer) {
    const body = document.body;
    let pos = 0;
    const open = () => {
      pos = scrollY;
      drawer.style.display = "block";
      btn.setAttribute("aria-expanded", "true");
      gsap.fromTo(drawer, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.2, ease: "sine.inOut", overwrite: true, onComplete: () => {
        body.classList.add("is-menu-open");
        body.style.top = `${-pos}px`;
      } });
    };
    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      gsap.to(drawer, { opacity: 0, duration: reduce ? 0 : 0.2, ease: "sine.inOut", overwrite: true, onComplete: () => (drawer.style.display = "none") });
      if (body.classList.contains("is-menu-open")) {
        body.classList.remove("is-menu-open");
        body.style.top = "";
        scrollTo(0, pos);
      }
    };
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      body.classList.contains("is-menu-open") ? close() : open();
    });
    addEventListener("keyup", (e) => { if (e.key === "Escape" && body.classList.contains("is-menu-open")) close(); });
  }
})();
