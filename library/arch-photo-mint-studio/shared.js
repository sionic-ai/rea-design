// Put the header, menu panel and footer on every page as one set, and wire in the state changes of the original function.js and inline scripts (hide header text · open menu · .sa reveal) as they are.
(() => {
  const page = document.body.dataset.page || "";
  const logo = (cls = "") => `<span class="mm-logo ${cls}" data-label="Brand mark + two-line English wordmark"><i class="mm-logo__mark"></i><span class="mm-logo__word">studio<br>name</span></span>`;
  const NAV = [
    ["index.html", "TOP", "First Page"],
    ["about.html", "ABOUT", "About the studio"],
    ["#", "STUDIO LESSON", "Studio lesson", ["Semi personal", "Personal"]],
    ["#", "ONLINE LESSON", "Online lessons"],
    ["#", "STUDIO", "Studio guide"],
    ["#", "Q&amp;A", "Frequently asked questions"],
    ["news.html", "NEWS &amp; COLUMN", "News · Column"],
  ];
  const form = `<ul class="mm-form">
      <li><a href="#"><i class="is-cal"></i>RESERVE</a></li>
      <li><a href="#"><i class="is-mail"></i>CONTACT</a></li>
    </ul>
    <ul class="mm-sns">
      <li><a class="is-ig" href="#" aria-label="SNS 1"></a></li>
      <li><a class="is-chat" href="#" aria-label="SNS 2"></a></li>
    </ul>`;

  const header = document.createElement("header");
  header.className = "mm-header";
  header.dataset.slot = "header";
  header.innerHTML = `<div class="mm-header__in">
    <h1 class="mm-header__logo${page === "home" ? " is-hid" : ""}"><a href="index.html">${logo()}</a></h1>
    <p class="mm-header__text">Here is a long one-line sentence introducing an expert studio for all women before and after childbirth</p>
    <button class="mm-menu-btn${page === "home" ? " is-white" : ""}" type="button" aria-label="Open Menu"><i class="mm-menu-btn__icon"></i><span class="mm-menu-btn__label">MENU</span></button>
  </div>`;

  const menu = document.createElement("div");
  menu.className = "mm-menu";
  menu.dataset.slot = "menu-drawer";
  menu.innerHTML = `<div class="mm-menu__in">
    <div class="mm-menu__h">${logo("is-white")}<p>Here is a long one-line sentence introducing an expert studio for all women before and after childbirth</p><button class="mm-close" type="button" aria-label="Close Menu"></button></div>
    <div class="mm-menu__box">
      <ul class="mm-menu__list">${NAV.map(([href, en, ko, sub]) => `<li><a href="${href}">${en}<span>${ko}</span></a>${sub ? `<ol>${sub.map((s) => `<li><a class="mm-ext" href="#">${s}</a></li>`).join("")}</ol>` : ""}</li>`).join("")}</ul>
      <div class="mm-menu__sub">${form}
        <div class="mm-banner"><a href="#"><div class="wf-img" data-label="Ancillary services banner · illustration + text · landscape 2:1"></div></a>Corporate website<a href="#"><div class="wf-img" data-label="Company site banner · photo + logo · landscape 2:1"></div></a></div>
      </div>
    </div>
    <div class="mm-menu__img wf-img" data-label="Cut-out person illustration · seated pose · transparent background"></div>
  </div>`;

  const footer = document.createElement("footer");
  footer.className = "mm-footer";
  footer.dataset.slot = "footer";
  footer.innerHTML = `<div class="mm-footer__in">
    <a class="mm-footer__logo" href="index.html">${logo("is-white")}</a>
    <div class="mm-footer__cols">
      <ul class="mm-footer__list">
        <li><a href="index.html">TOP</a></li>
        <li><a href="about.html">ABOUT</a></li>
        <li><a href="#">STUDIO LESSON</a></li>
        <li><a href="#">ONLINE LESSON</a></li>
        <li><a href="#">Q&amp;A</a></li>
        <li class="is-studio"><a href="#">STUDIO</a><ol>${["Studio 1 (Region)", "Studio 2 (Region)", "Studio 3"].map((s) => `<li><a class="mm-ext" href="#">${s}<span>Map</span></a></li>`).join("")}</ol></li>
        <li><a href="news.html">NEWS &amp; COLUMN</a></li>
      </ul>
      <div class="mm-footer__sub">${form}</div>
    </div>
    <div class="mm-footer__copy">&copy; Studio Name All Rights Reserved.</div>
  </div>`;

  document.body.prepend(header, menu);
  (document.querySelector("main") || document.body).after(footer);

  const btn = header.querySelector(".mm-menu-btn");
  const toggle = () => menu.classList.toggle("is-open");
  btn.addEventListener("click", toggle);
  menu.querySelector(".mm-close").addEventListener("click", toggle);
  addEventListener("keydown", (e) => { if (e.key === "Escape") menu.classList.remove("is-open"); });

  // Header text hides after scrolling down over 50px. The first page hides the logo until past the first screen and keeps the menu button white
  const text = header.querySelector(".mm-header__text");
  const hLogo = header.querySelector(".mm-header__logo");
  const fv = document.querySelector("[data-fv]");
  const sas = [...document.querySelectorAll(".sa")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 769px)");
  const onScroll = () => {
    const y = scrollY;
    // The phone panel has no header text (removed from the original sp panel HTML) — the hide is applied only on wide screens
    if (wide.matches) text.classList.toggle("is-none", y > 50);
    if (fv) {
      const past = y > fv.offsetHeight - 50;
      btn.classList.toggle("is-white", !past);
      hLogo.classList.toggle("is-hid", !past);
    }
    for (const el of sas) if (reduce || innerHeight > el.getBoundingClientRect().top + 250) el.classList.add("show");
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("load", onScroll);
  // The original only checks on load·scroll — text inside the hero also turns on after load
  if (document.readyState === "complete") onScroll();
  // White curtain — lifted 1.5s after load. When returning via the back button, it plays again like the original
  addEventListener("load", () => setTimeout(() => document.body.classList.remove("fadeout"), reduce ? 0 : 1500));
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  window.mmSite = { onScroll };
})();
