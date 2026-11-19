// Draws in the shared header·full menu·footer so all pages use the same ones, and runs the original common.js order (loader → hero photo transition → scroll → hamburger → intro) as is.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const NAV = [
    ["index.html", "Home"],
    ["about.html", "Hot spring stories"],
    ["detail.html", "Lodging and Facility Info"],
    ["index.html#spring", "About the hot spring"],
    ["index.html#explore", "Trails · Nearby spots"],
    ["about.html#seasons", "Four-season notebook"],
    ["index.html#news", "Notice"],
    ["index.html#access", "Access · directions"],
    ["index.html", "English"],
  ];
  const current = { home: 0, about: 1, news: 1, detail: 2 }[page] ?? 0;
  const ICON_PLAY = '<svg class="sh-icon is-solid" viewBox="0 0 24 17" aria-hidden="true"><path d="M23.5 2.7A3 3 0 0 0 21.4.6C19.5 0 12 0 12 0S4.5 0 2.6.6A3 3 0 0 0 .5 2.7 31 31 0 0 0 0 8.5a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.8 31 31 0 0 0-.5-5.8ZM9.6 12.1V4.9l6.2 3.6Z"/></svg>';
  const ICON_CAM = '<svg class="sh-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none"/></svg>';
  const logo = (copy = true) =>
    `<span class="sh-logo__area" data-label="Two-character area name">Area</span><span class="sh-logo__name" data-label="Brush calligraphy hot spring name logo, four characters">Hot spring town</span>${copy ? `<span class="sh-logo__copy" data-label="One-line calligraphy slogan">A place to return to, here</span>` : ""}`;
  const POEM = "Stillness and the light of four seasons, submerged in water<br>People return to their origins";
  const INN = ["Lodging name 01", "Lodging name 02", "Lodging name 03", "Hotel Name 04", "Lodging Name 05", "Lodging Name 06", "Lodging Name 07", "Lodging Name 08", "Lodging Name 09", "Lodging Name 10", "Shop name 11", "Restaurant name 12", "Retreat Name 13", "Open-air bath name 14"];
  const map = (kind) => `
    <ul class="sh-map is-${kind}">
      <li class="is-home"><a href="index.html"><span class="sh-btn" data-fx="ink-pod-hover">Home</span></a></li>
      <li class="is-story"><a href="about.html"><span class="sh-btn" data-fx="ink-pod-hover">Hot spring stories</span></a>
        <ul class="sh-map__sub"><li><a href="about.html">How the hot spring began</a></li><li><a href="about.html#keep">People Who Protect</a></li><li><a href="news.html">Speaker</a></li><li><a href="about.html#guest">People gathering</a></li></ul></li>
      <li class="is-inn"><a href="detail.html"><span class="sh-btn" data-fx="ink-pod-hover">Lodging and Facility Info</span></a>
        <ul class="sh-map__sub is-inn">${INN.map((n) => `<li><a href="detail.html">${n}</a></li>`).join("")}</ul></li>
      <li class="is-spring"><a href="index.html#spring"><span class="sh-btn" data-fx="ink-pod-hover">About the hot spring</span></a></li>
      <li class="is-around"><a href="index.html#explore"><span class="sh-btn" data-fx="ink-pod-hover">Trails · Nearby spots</span></a></li>
      <li class="is-seasons"><a href="about.html#seasons"><span class="sh-btn" data-fx="ink-pod-hover">Four-season notebook</span></a></li>
      <li class="is-news"><a href="index.html#news"><span class="sh-btn" data-fx="ink-pod-hover">Notice</span></a></li>
      <li class="is-access"><a href="index.html#access"><span class="sh-btn" data-fx="ink-pod-hover">Access · directions</span></a></li>
    </ul>`;

  const poem = body.dataset.poem === "cite"
    ? '<blockquote class="sh-poem is-fixed" data-label="Two lines of an old poet’s tanka + author">In the water welling up from deep in the valley<br>On the hillside slope, soaking in again today<cite>Author Name</cite></blockquote>'
    : `<p class="sh-poem" data-label="Two vertical lines of verse">${POEM}</p>`;

  // The loader veil is placed directly in HTML like the original (covered from the first paint) — only the first page on a first visit shows the verse and clears after 3s, the others clear right away
  body.insertAdjacentHTML("afterbegin", `
    <header class="sh-head" data-slot="header">
      <a href="index.html" class="sh-logo${page === "home" ? " is-home" : ""} inert-target" aria-label="To the first page">${logo()}</a>
      <button class="sh-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="sh-menu"><span class="sh-burger__icon"></span><span class="sh-sr">Menu</span></button>
      <div class="sh-menu" id="sh-menu" aria-hidden="true" data-slot="menu-overlay">
        <div class="sh-menu__side"><div class="sh-menu__title">
          <div class="sh-menu__logo">${logo(false)}</div>
          <div class="sh-menu__lead"><span class="sh-logo__copy">A place to return to, here</span><p class="sh-v">${POEM}</p></div>
        </div></div>
        <div class="sh-menu__inner"><nav class="sh-menu__wrap">${map("header")}
          <div class="sh-menu__sns"><a href="#" aria-label="Video channel">${ICON_PLAY}</a><a href="#" aria-label="Photo account">${ICON_CAM}</a></div>
        </nav></div>
      </div>
      <nav class="sh-gnav inert-target" aria-label="Full menu" data-slot="vertical-nav">
        <ul>${NAV.map(([h, t], i) => `<li class="${i === current ? "is-current" : ""}"><a href="${h}">${t}</a></li>`).join("")}
          <li><a href="#" aria-label="Photo account"><span class="sh-gnav__icon">${ICON_CAM}</span></a></li>
          <li><a href="#" aria-label="Video channel"><span class="sh-gnav__icon">${ICON_PLAY}</span></a></li>
        </ul>
      </nav>
    </header>
    ${poem}`);

  // First page should be blank slots like the original (120px top and bottom margin separates the sheets)
  const footLink = body.dataset.footlink === "empty" ? '<div class="sh-foot-link" aria-hidden="true"></div>' : `
    <div class="sh-foot-link" data-slot="footer-link"><a href="index.html#access" class="sh-btn sh-foot-link__item" data-fx="ink-pod-hover">Access · directions</a></div>`;
  const main = document.querySelector("main");
  // The store detail sits inside a gray-green band like the original
  const footHost = document.querySelector("[data-foot-link-here]") || main;
  if (footHost) footHost.insertAdjacentHTML("beforeend", footLink);
  body.insertAdjacentHTML("beforeend", `
    <div class="sh-foot-poem inert-target" data-slot="footer-poem">
      <span class="sh-ph is-dark" data-label="In front of a hot spring town information center · back view of an old man opening a door · dusk shade · full-width strip"></span>
      <div class="sh-foot-poem__lead"><span class="sh-foot-poem__ttl">A place to return to, here</span><p>${POEM}</p></div>
    </div>
    <footer class="sh-foot inert-target" data-slot="footer">
      <div class="sh-wrap-primary">
        <div class="sh-foot__top">
          <nav class="sh-foot__sitemap" aria-label="Sitemap">${map("footer")}</nav>
          <div class="sh-foot__title">
            <div class="sh-foot__logo">${logo(false)}</div>
            <div class="sh-foot__lead"><span class="sh-logo__copy">A place to return to, here</span><p class="sh-v">${POEM}</p></div>
          </div>
        </div>
        <div class="sh-foot__bottom">
          <div><div class="sh-foot__sns"><a href="#" aria-label="Video channel">${ICON_PLAY}</a><a href="#" aria-label="Photo account">${ICON_CAM}</a></div>
            <a href="#" class="sh-foot__privacy sh-plain">Privacy policy</a></div>
          <small class="sh-foot__copy">© 2026 Onsen Name</small>
        </div>
      </div>
    </footer>`);

  const header = document.querySelector(".sh-head");
  const menu = document.getElementById("sh-menu");
  const burger = document.querySelector(".sh-burger");
  const inertTargets = document.querySelectorAll(".inert-target");
  const isTop = page === "home";
  const isInternal = document.referrer.startsWith(location.origin);

  // Original slider-function.js — Splide fade, crossfading over 3s every 4s. Held paused, then plays after a delay
  const setupSlider = (delay = 0) => {
    const el = document.querySelector(".js-main-slider");
    if (!el || !window.Splide) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const splide = new Splide(el, { type: "fade", arrows: false, rewind: true, pagination: false, interval: 4000, speed: reduce ? 0 : 3000, autoplay: !reduce });
    splide.mount();
    if (reduce) return;
    splide.Components.Autoplay.pause();
    setTimeout(() => splide.Components.Autoplay.play(), delay);
  };

  const loadingFadeOut = (delay) => {
    setTimeout(() => {
      document.querySelectorAll(".js-loading").forEach((el) => {
        el.classList.add("is-fadeout");
        el.style.transition = "opacity 2s .5s";
        el.style.opacity = 0;
      });
    }, delay);
  };

  const ready = () => {
    body.classList.add("is-loaded");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      body.classList.add("is-no-opening");
      document.querySelectorAll(".js-loading").forEach((el) => (el.style.display = "none"));
      setupSlider();
    } else if (isTop && !isInternal) {
      setupSlider(0);
      loadingFadeOut(3000);
    } else {
      body.classList.add("is-no-opening");
      setupSlider();
      loadingFadeOut(0);
    }

    let lastWidth = innerWidth;
    addEventListener("resize", () => {
      if (innerWidth === lastWidth) return;
      lastWidth = innerWidth;
      setMenu(false);
    });

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = scrollY > 0;
          header.classList.toggle("is-scrolled", scrolled);
          body.classList.toggle("is-scrolled", scrolled);
          ticking = false;
        });
        ticking = true;
      }
      burger.classList.toggle("is-show", scrollY >= 200);
    };
    addEventListener("scroll", onScroll);
    onScroll();

    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      body.classList.toggle("is-menu-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      inertTargets.forEach((el) => (el.inert = open));
    }
    burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));

    // Original scroll-function.js: when jquery.inview sees the element, it adds inview (once).
    if (window.jQuery) {
      jQuery(".js-inview").on("inview", function (e, isInView) {
        if (isInView) jQuery(this).addClass("inview");
      });
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
