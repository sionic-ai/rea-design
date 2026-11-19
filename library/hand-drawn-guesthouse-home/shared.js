// Fills the placeholders (data-nt-shared) so every page uses the same header, phone menu, footer and first-visit loading, and attaches hooks in the original order.
// Per-page differences come from the body’s data-head (w if the very top text is white) and data-th (scroll px where the header changes).
(() => {
  const body = document.body;
  const isHome = body.dataset.page === "home";
  // The original has the menu ?id even on the first page=… Reopen the page with this, and once it has opened, roll to that section with a 700ms swing
  const home = (id) => `index.html?id=${id}`;
  const ico = {
    ig: '<svg class="nt-ico" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="3" width="24" height="24" rx="7"/><circle cx="15" cy="15" r="5.5"/><circle cx="22" cy="8" r="0.9" fill="currentColor"/></svg>',
    mail: '<svg class="nt-ico" viewBox="0 0 25 18" width="23" height="17" aria-hidden="true"><rect x="1" y="1" width="23" height="16" rx="1"/><path d="M1.5 1.5 12.5 10 23.5 1.5"/></svg>',
    cal: '<svg class="nt-ico" viewBox="0 0 30 26" width="30" height="26" aria-hidden="true"><rect x="1" y="3" width="22" height="19" rx="2"/><path d="M1 8h22M6 1v4M18 1v4M5 12h2M10 12h2M15 12h2M5 16h2M10 16h2"/><circle cx="23" cy="19" r="5.5" fill="var(--kf-surface)"/><path d="M23 16.5V19l1.8 1.3"/></svg>',
  };
  const logo = (cls = "") => `<svg viewBox="0 0 80 90" aria-hidden="true" class="${cls}">
      <path class="nt-logo__house" d="M10 24 40 4l30 20v34a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z"/>
      <path class="nt-logo__wave" d="M14 30c10-6 18 6 30-1s18-4 22 0M14 42c8-5 16 4 26-1s20-6 26 2M18 52c10-3 22 3 44-2"/>
      <text class="nt-logo__name" x="40" y="80" text-anchor="middle">inn name</text>
      <text class="nt-logo__sub" x="40" y="89" text-anchor="middle">guest house</text></svg>`;
  // Horizontal logo for the phone header — house board on the left, two-line name on the right
  const logoH = () => `<svg viewBox="0 0 150 46" aria-hidden="true" class="nt-logo--h">
      <path class="nt-logo__house" d="M4 14 22 3l18 11v24a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>
      <path class="nt-logo__wave" d="M7 18c6-4 11 4 18-1s11-3 13 0M7 26c5-3 10 3 16-1s12-4 15 1"/>
      <text class="nt-logo__name" x="48" y="27">inn name</text>
      <text class="nt-logo__sub" x="49" y="39">guest house</text></svg>`;
  const nav = [["top", "index.html"], ["about", home("about")], ["stay", home("stay")], ["column", "news.html"], ["access", home("access")]];
  const btns = `<li><a href="#" aria-label="Photo SNS">${ico.ig}</a></li>
      <li><a class="nt-cbtn" href="contact.html">${ico.mail}<span>contact</span></a></li>
      <li><a class="nt-cbtn" href="#">${ico.cal}<span>reservation</span></a></li>`;
  const parts = {
    head: `<header class="nt-head${body.dataset.head === "w" ? " is-w" : ""}" data-slot="header">
      <div class="nt-head__toplogo nt-logo">${logo()}</div>
      <div class="nt-head__in nt-flex">
        <div class="nt-head__nav nt-flex">
          <h1><a class="nt-logo" href="index.html" data-label="Inn logo · two wave lines on a house-shaped plate + English name">${logo("nt-logo--sq")}${logoH()}</a></h1>
          <ul class="nt-flex nt-e">${nav.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        </div>
        <ul class="nt-head__btn nt-flex nt-e">${btns}</ul>
        <div class="nt-menu-btn nt-sp"><button class="nt-trigger" type="button" aria-label="Menu"><i></i><i></i><i></i></button></div>
      </div>
    </header>
    <div class="nt-menu nt-sp" data-slot="menu-panel">
      <p class="nt-menu__h"><a href="index.html">inn name</a></p>
      <ul class="nt-menu__list nt-e">${nav.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      <ul class="nt-menu__btn nt-e">
        <li><a class="nt-cbtn" href="contact.html">${ico.mail}<span>contact</span></a></li>
        <li><a class="nt-cbtn" href="#">${ico.cal}<span>reservation</span></a></li>
        <li><a href="#" aria-label="Photo SNS">${ico.ig}</a></li>
      </ul>
      <div class="nt-menu__bottom"><svg viewBox="0 0 390 208" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 90 60 40l55 45 70-70 80 75 60-50 65 55v113H0z"/></svg></div>
    </div>`,
    first: `<div class="nt-first" data-slot="first-visit-loader" aria-hidden="true">
      <svg viewBox="0 0 457 407">
        <g class="nt-first__fly"><g class="nt-first__bird">
          <path class="nt-first__wing is-up" d="M0 0c8-4 14-12 22-26 6-10 16-16 30-20-8 8-14 18-20 30-6 10-14 16-26 18M4 2c6 2 12 2 18-1M22-26c4 0 8 2 10 4M30-8c4-1 8 0 11 2"/>
          <path class="nt-first__wing is-down" d="M0 0c10 2 22 0 34-6 10-5 22-6 34-2-12 2-22 6-30 12-10 7-24 8-38 2M-8-2c-4-2-8-6-10-10M40-4c4 2 10 2 14 0"/>
          <path d="M-14-4c6-2 12-2 18 0 6 2 12 2 16-2-2 6-8 9-16 9-6 0-12-3-18-7zM-14-4l-6-2 5 5"/>
        </g></g>
        <text class="nt-first__name" x="40" y="370"></text>
      </svg>
    </div>`,
    foot: `<footer class="nt-foot" data-slot="footer">
      <div class="nt-foot__in nt-flex">
        <div class="nt-foot__add">
          <p class="nt-foot__name"><span class="nt-e">inn name</span> Accommodation</p>
          <p class="nt-foot__addr">〒000-0000<br>Your lodging address here, on one line<br><span class="nt-e">TEL : 000-0000-0000</span><br><span class="nt-e">MAIL : info@example.com</span></p>
          <p class="nt-foot__copy nt-e">© inn name All Rights Reserved.</p>
        </div>
        <div>
          <ul class="nt-foot__nav nt-flex nt-e">${nav.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
          <ul class="nt-foot__btn nt-flex nt-e">${btns}</ul>
          <p class="nt-foot__info"><a href="#">Things to note before your stay</a></p>
        </div>
      </div>
    </footer>`,
  };
  document.querySelectorAll("[data-nt-shared]").forEach((el) => { el.outerHTML = parts[el.dataset.ntShared] || ""; });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = window.jQuery;
  const head = document.querySelector(".nt-head");

  // First-visit loading — only the first time in the same tab, shown for 5s and lifted at 1s. After that (or on the second visit after 2.5s) the hero text rises in .8s
  const first = document.querySelector(".nt-first");
  const fvText = document.querySelector("[data-nt-fvtext]");
  const showFv = () => fvText && fvText.classList.add("is-a");
  if (first) {
    // When opened via file://, each document has its own sessionStorage, so also write to window.name, which remembers the same tab
    const seen = sessionStorage.getItem("nt-access") || window.name.includes("nt-access");
    if (seen || reduce) {
      first.classList.add("is-none");
      setTimeout(showFv, reduce ? 0 : 2500);
    } else {
      sessionStorage.setItem("nt-access", "true");
      window.name = `${window.name} nt-access`.trim();
      first.classList.add("is-show");
      // A bird flies across the screen (5.18s) and the name is written one letter at a time — same tempo as the original drawing length
      const fly = first.querySelector(".nt-first__fly"), name = first.querySelector(".nt-first__name");
      const word = "inn name";
      const t0 = performance.now();
      const step = (now) => {
        const t = (now - t0) / 5180;
        if (t >= 1 || !first.classList.contains("is-show")) return;
        const x = 70 + t * 330, y = 250 - Math.sin(t * Math.PI * 1.6) * 110 - t * 60;
        fly.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1.4 + t * 0.6).toFixed(2)})`);
        first.classList.toggle("is-flap", Math.floor(now / 140) % 2 === 0);
        name.textContent = word.slice(0, Math.min(word.length, Math.floor(t * 1.35 * word.length)));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(() => { first.classList.remove("is-show"); setTimeout(showFv, 1000); }, 5000);
    }
  } else if (fvText) setTimeout(showFv, 2500);

  // White page cover — lifts 1.5s after load
  addEventListener("load", () => setTimeout(() => body.classList.remove("is-fadeout"), reduce ? 0 : 1500));

  // Scroll reveal
  const sa = document.querySelectorAll(".nt-sa");
  const saCheck = () => sa.forEach((el) => { if (innerHeight > el.getBoundingClientRect().top + 250) el.classList.add("is-show"); });
  addEventListener("load", saCheck);
  addEventListener("scroll", saCheck, { passive: true });

  // Header — past the threshold (600 on the first page, 100 on subpages) it becomes a translucent white band, and disappears when the footer enters more than 100px below the screen
  const th = +(body.dataset.th || 100), keepW = body.dataset.head === "w";
  const foot = document.querySelector(".nt-foot");
  const onScroll = () => {
    const s = scrollY, sb = s + innerHeight;
    const past = s > th;
    head.classList.toggle("is-mv", past);
    if (isHome) body.classList.toggle("is-top", !past);
    if (keepW) head.classList.toggle("is-w", !past);
    head.classList.toggle("is-hide", foot && sb > foot.getBoundingClientRect().top + s + 100 && s !== 0);
  };
  addEventListener("scroll", onScroll, { passive: true });

  $(() => {
    // In-page link — 700ms swing, scrolls 80px short to allow for the header height
    $('a[href^="#"]').on("click", function () {
      const href = $(this).attr("href");
      const $t = $(href === "#" || href === "" ? "html" : href);
      if (!$t.length) return;
      $("body,html").animate({ scrollTop: $t.offset().top - 80 }, reduce ? 0 : 700, "swing");
      return false;
    });
    // From another page ?id=If it comes as …, jump to that section
    const m = location.search.match(/[?&]id=([\w-]+)/);
    if (m && $("#" + m[1]).length) $("html,body").animate({ scrollTop: $("#" + m[1]).offset().top }, reduce ? 0 : 700, "swing");
    // Phone menu
    $(".nt-trigger").on("click", function () {
      $(".nt-menu").toggleClass("is-open");
      $(this).toggleClass("is-active");
    });
  });
})();
