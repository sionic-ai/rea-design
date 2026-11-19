// Shared by all pages — draws the header band · menu panel · left photo panel · footer in the same frame, and runs the original script.js order (session first-visit loader → menu → left Swiper fade → scroll reveal) as is.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";

  // Line art — redraw the original GIF (navy hand-drawn lines) as an SVG in the same position and ratio
  const waves = (y, w) => ["a", "b", "c"].map((k, i) => {
    const o = i * 9;
    const row = (yy, x0, n, amp) => Array.from({ length: n }, (_, j) => `M${x0 + j * 46 + o} ${yy}q11 -${amp} 23 0`).join("");
    return `<g class="wv is-${k}"><path class="ln is-thin" d="${row(y, 6, Math.floor(w / 46), 6)}${row(y + 14, 24, Math.floor(w / 46) - 1, 5)}${row(y + 28, 12, Math.floor(w / 46) - 1, 4)}"/></g>`;
  }).join("");
  const windows = (x, y, n, w) => Array.from({ length: n }, (_, i) => `<rect class="pp" x="${x + i * w}" y="${y}" width="${w - 3}" height="8"/>`).join("");
  window.awBoat = (kind = "sail") => {
    if (kind === "row") {
      // A sailless boat pushed by a boatman with a pole — original mv_illust (horizontal 2.3:1, 5fps 45 frames 9s)
      return `<svg class="aw-line" viewBox="0 0 440 190" style="--aw-loop:9s" aria-hidden="true">
        <g class="boat">
          <path class="ln" d="M20 110 L22 92 L392 96 Q420 92 428 74 Q418 118 380 130 L60 132 Q30 128 20 110Z"/>
          <path class="ln is-thin" d="M24 104 L396 108"/>${windows(32, 112, 26, 13)}
          <path class="ln" d="M40 92 L40 62 L130 56 L136 92 M40 62 L54 50 L124 46 L130 56"/>${windows(48, 66, 6, 13)}
          <path class="ln" d="M180 92 L180 66 L250 64 L252 92 M176 66 L214 48 L254 64"/>${windows(190, 72, 4, 14)}
          <path class="ln" d="M150 92 V10 M158 92 V14"/>
          <path class="ln" d="M268 92 h26 v-16 h-26z M300 92 h22 v-14 h-22z"/>
          <path class="ln" d="M352 92 L356 54 M346 54 q10 -14 20 0 M344 54 h24 L356 42Z M356 60 l-10 22 M358 62 L412 6"/>
          <path class="ln" d="M356 92 l-4 -10 M362 92 l2 -12"/>
        </g>${waves(150, 440)}
      </svg>`;
    }
    // Sailboat — original loading · sect02_lwr · pagetop (1.39:1 wide, 5fps 15 frames 3s)
    return `<svg class="aw-line" viewBox="0 0 440 320" style="--aw-loop:3s" aria-hidden="true">
      <g class="boat">
        <path class="ln" d="M16 222 L20 204 L374 190 Q404 184 414 160 Q408 210 360 232 L54 244 Q24 238 16 222Z"/>
        <path class="ln is-thin" d="M20 214 L380 200"/>${windows(28, 218, 26, 13)}
        <path class="ln" d="M184 4 V206 M138 24 L230 18"/>
        <path class="pp" d="M146 28 Q136 112 152 200 L224 194 Q240 108 222 22 Z"/>
        <path class="ln is-thin" d="M144 62 L228 56 M142 98 L234 92 M144 134 L234 128 M148 170 L230 164"/>
        <path class="fl" d="M168 92 h8 v26 h22 l-4 8 h-30z M184 80 h14 v30 h-6 v-22 h-8z"/>
        <path class="ln" d="M282 50 V196"/>
        <path class="pp" d="M262 70 L300 66 Q314 128 298 190 L244 194 Q264 130 262 70Z"/>
        <path class="ln is-thin" d="M140 26 L56 188 M230 20 L282 50"/>
        <path class="ln" d="M36 204 L36 172 L110 166 L114 200 M36 172 L48 160 L104 156 L110 166"/>${windows(42, 176, 5, 13)}
        <path class="ln" d="M236 198 L236 168 L300 164 L302 194 M232 168 L268 148 L304 164"/>${windows(244, 174, 4, 14)}
        <path class="ln" d="M330 190 L332 156 M324 156 q8 -12 16 0 M322 156 h20 L332 146Z M332 164 l-8 18 M334 166 l12 14"/>
      </g>${waves(262, 440)}
    </svg>`;
  };
  // Map — original sect02_upr (plays once, 33fps 36 frames 1.35s): the region’s land is filled dark, lines are drawn out from the points, and red place names appear one letter at a time
  window.awMap = () => `<svg class="aw-map" viewBox="0 0 520 360" aria-hidden="true">
    <path class="mp-coast" d="M10 300 C40 250 60 230 110 222 C150 216 170 190 210 186 C250 182 268 150 300 146 C340 140 360 120 400 118 C440 116 470 96 510 92 M20 120 C60 110 90 80 130 84 C170 88 190 60 236 58 M360 40 C390 30 420 44 444 36 C470 30 492 42 512 38 M400 200 C430 196 460 210 500 206 M300 250 C330 260 350 300 330 340"/>
    <text class="mp-pref" x="40" y="70">Current name</text><text class="mp-pref" x="250" y="40">Island name</text><text class="mp-pref" x="430" y="70">Division name</text><text class="mp-pref" x="410" y="150">Current name</text>
    <path class="mp-land" d="M190 150 C210 132 236 128 256 120 C274 112 296 118 304 136 C314 150 330 154 326 176 C322 198 300 206 286 222 C270 240 246 236 230 226 C214 216 196 212 188 196 C180 180 176 164 190 150Z"/>
    <text class="mp-here-ttl" x="150" y="182">Current name</text>
    <circle class="mp-dot" cx="226" cy="168" r="4"/>
    <path class="mp-pin" d="M226 168 L300 290" pathLength="1"/>
    <text class="mp-city" x="282" y="314">City name</text><text class="mp-city-en" x="290" y="334">CITY</text>
  </svg>`;
  const ICON = {
    note: '<svg viewBox="0 0 26 22" aria-hidden="true"><path d="M2 20V3.5Q2 2 3.5 2H15Q24 2 24 10V20h-4.6V10.6Q19.4 6.6 15 6.6H6.6V20Z" fill="currentColor"/></svg>',
    insta: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="2" width="24" height="24" rx="7" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="14" cy="14" r="5.4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="21.2" cy="6.8" r="1.5" fill="currentColor"/></svg>',
    ec: '<svg viewBox="0 0 35 28" aria-hidden="true"><path d="M1 2h5l4 16h18l4-11H9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="24" r="2" fill="currentColor"/><circle cx="26" cy="24" r="2" fill="currentColor"/></svg>',
  };
  const ext = (cls = "") => `<ul class="aw-ext ${cls}"><li class="is-note"><a href="#" aria-label="Post channel">${ICON.note}</a></li><li class="is-insta"><a href="#" aria-label="Photo account">${ICON.insta}</a></li><li class="is-ec"><a href="#" aria-label="Online shop">${ICON.ec}</a></li></ul>`;
  // Logo — the original is an image of ‹four-character shop name + ship emblem + two-character store›. Letters are placeholders, the emblem is a navy line ship
  const logo = (cls) => `<span class="aw-logo ${cls}" data-label="Shop name logo (four-character name in a round shape + ship mark + shop)">
    <span class="aw-logo__name">Shop Name</span>
    <svg class="aw-logo__mark" viewBox="0 0 60 50" aria-hidden="true"><path d="M14 4 h6 v26 h28 l-6 10 H8z M30 2 h16 v22 h-6 V8 h-10z" fill="currentColor"/><path d="M4 44 q26 6 52 -2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    <span class="aw-logo__shop">Shop</span><span class="aw-logo__en">SHOP NAME</span></span>`;
  const MENU = [["news.html", "Notice"], ["about.html", "About us"], ["service.html#sect01", "Product Story"], ["service.html#sect03", "Cooking Class Stories"], ["#", "journal"], ["index.html#sect05", "Company overview"]];
  const menu = () => `<ul class="aw-menu-links">${MENU.map(([h, t]) => `<li><a href="${h}" class="fs-md">${t}</a></li>`).join("")}</ul>`;
  const COPY = "©SHOP NAME. All Rights Reserved";
  const slides = Array.from({ length: 13 }, (_, i) => `<div class="swiper-slide aw-slide-item"><span class="aw-ph ${["", "is-tone2", "is-tone3"][i % 3]}" data-label="${["Old street lined with white-walled warehouses · clear day · full-height portrait panel", "Tea field rows below a mountain · close-up · full vertical panel", "Straight road to a mountain village · summer · full-height panel", "Old riverside house tile roof · Overcast day · Portrait full-bleed panel"][i % 4]} ${String(i + 1).padStart(2, "0")}"></span></div>`).join("");

  const loadBoat = document.querySelector(".aw-loading__boat");
  if (loadBoat) loadBoat.innerHTML = window.awBoat("sail");
  const wrap = document.querySelector(".aw-all");
  wrap.insertAdjacentHTML("afterbegin", `
    <div class="aw-cont-wrapper">
      <header class="aw-header" data-slot="side-header">
        <div class="aw-header__wrapper">
          <div class="aw-header__logo"><a href="index.html" aria-label="To the first page">${logo("is-head")}</a></div>
          <div class="aw-menu-btn" role="button" tabindex="0" aria-label="Menu"><span></span><span></span></div>
          ${ext("aw-header__links")}
        </div>
        <nav class="aw-gnav" data-slot="menu-panel">
          <div class="aw-gnav__wrapper">
            <div class="aw-gnav__img"><span class="aw-ph" data-label="Riverside mountain village scenery · clear day · landscape strip"></span><span class="aw-gnav__illust">${window.awBoat("sail")}</span></div>
            <div class="aw-gnav__inner aw-paper is-gray">
              ${menu()}${ext()}
              <div class="aw-contact"><a href="#" class="fs-xl">Contact Us</a></div>
              <p class="aw-gnav__copy font-en fs-xs">${COPY}</p>
            </div>
          </div>
        </nav>
        <div class="aw-header__bg"></div>
      </header>
      <div class="aw-slide-lft" data-slot="fixed-photo-fade">
        <div class="swiper"><div class="swiper-wrapper">${slides}</div></div>
        <p class="aw-slide-lft__copy font-en">${COPY}</p>
      </div>
    </div>`);
  const main = document.querySelector(".aw-contents");
  main.insertAdjacentHTML("beforeend", `
    <footer class="aw-footer" data-slot="footer">
      <div class="aw-wrap">
        <div class="aw-contact"><a href="#">Contact Us</a></div>
        <div class="aw-pagetop" style="--aw-wave: .66s"><a href="#scr-top" aria-label="Back to top">${window.awBoat("sail").replace("--aw-loop:3s", "--aw-loop:6.82s")}</a></div>
        <div class="aw-footer__area">
          <nav class="aw-footer__nav">${menu()}${ext()}</nav>
          <div class="aw-footer__logo">${logo("is-foot")}</div>
          <p class="aw-footer__access fs-sm">〒000-0000<br>Your address line here 0-00</p>
          <p class="aw-footer__copy font-en fs-xs">${COPY}</p>
        </div>
      </div>
    </footer>`);

  const start = () => {
    const $ = window.jQuery;
    const $w = $(window);
    const $header = $(".aw-header");

    // Anchors — same-page # targets use a 550ms swing
    $("a[href*='#']").not("[data-lity]").on("click", function () {
      if (location.pathname.replace(/^\//, "") !== this.pathname.replace(/^\//, "") || location.hostname !== this.hostname) return;
      const target = $(this.hash);
      if (!target.length) return;
      $("html, body").animate({ scrollTop: target.offset().top }, 550, "swing");
      return false;
    });

    // Only on the first visit of a session turn the drawing on and lift the curtain after 3s — from the second time it lifts right away (1s)
    if (sessionStorage.getItem("aw-access")) {
      $(".aw-loading").addClass("is-hidden");
    } else {
      sessionStorage.setItem("aw-access", "true");
      $(".aw-loading__img").addClass("is-active");
      setTimeout(() => {
        $(".aw-loading").addClass("is-hidden");
        $(".aw-loading__img").removeClass("is-active");
      }, 3000);
    }

    const $gnav = $(".aw-gnav");
    $header.find(".aw-menu-btn").on("click", () => { $header.toggleClass("is-active"); $gnav.toggleClass("is-opened"); });
    $(".aw-gnav .aw-menu-links a").on("click", () => { $gnav.removeClass("is-opened"); $header.removeClass("is-active"); });
    $header.find(".aw-header__bg").on("click", () => { $gnav.removeClass("is-opened"); $header.removeClass("is-active"); });

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    new Swiper(".aw-cont-wrapper .aw-slide-lft .swiper", { loop: true, effect: "fade", allowTouchMove: false, autoplay: reduce ? false : { delay: 3000 }, speed: 1100 });

    // The original measures only on scroll events (not on open) — on for items past the lower 1/6 of the screen
    $w.on("scroll", () => {
      const ws = $w.scrollTop(), wh = $w.height();
      $(".scr-fade-in").each(function () {
        if (ws > $(this).offset().top - wh + wh / 6) $(this).addClass("on");
      });
    });
    if (reduce) $(".scr-fade-in").addClass("on");
    document.dispatchEvent(new CustomEvent("aw:ready"));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
