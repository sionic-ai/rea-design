/* Site-wide shared: bear art bundle (SVG symbol), header · phone menu · vertical application tab, page end (interview application · contact · footer), loader, infinite band, entrance, back-to-top button.
   Instead of the original art (bear character PNG), a newly drawn SVG in the same spot, size and feel is used <use> reused as is. All colors are --bb-* → --site-* → --kf-* variables. */
(() => {
  const SPRITE = `
<svg class="bb-sprite" aria-hidden="true" width="0" height="0" style="position:absolute">
  <symbol id="bb-bust" viewBox="0 0 360 720">
    <g stroke="currentColor" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
      <path style="fill:var(--bb-shirt)" d="M8 720C12 600 30 520 70 488C120 455 240 455 290 488C330 520 348 600 352 720Z"/>
      <path style="fill:var(--bb-trim)" stroke="none" d="M40 650H320V676H40Z"/>
      <circle style="fill:var(--bb-white)" cx="180" cy="606" r="62"/>
      <path style="fill:var(--bb-scarf)" d="M148 636L204 566L216 632Z"/>
      <path style="fill:var(--bb-star)" stroke-width="4" d="M222 560l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2z"/>
      <path style="fill:var(--bb-scarf)" d="M64 468C120 500 240 500 296 468L306 508C240 544 120 544 54 508Z"/>
      <circle style="fill:var(--bb-fur)" cx="62" cy="150" r="54"/>
      <circle style="fill:var(--bb-muzzle)" stroke="none" cx="62" cy="152" r="26"/>
      <circle style="fill:var(--bb-fur)" cx="298" cy="150" r="54"/>
      <circle style="fill:var(--bb-muzzle)" stroke="none" cx="298" cy="152" r="26"/>
      <ellipse style="fill:var(--bb-fur)" cx="180" cy="300" rx="160" ry="150"/>
      <ellipse style="fill:var(--bb-white)" cx="180" cy="354" rx="78" ry="62"/>
      <ellipse style="fill:currentColor" cx="180" cy="322" rx="28" ry="18"/>
      <path fill="none" d="M180 340V366M148 370Q180 396 212 370"/>
      <circle style="fill:currentColor" stroke="none" cx="112" cy="282" r="14"/>
      <circle style="fill:currentColor" stroke="none" cx="248" cy="282" r="14"/>
      <circle style="fill:var(--bb-white)" stroke="none" cx="117" cy="277" r="4"/>
      <circle style="fill:var(--bb-white)" stroke="none" cx="253" cy="277" r="4"/>
    </g>
  </symbol>
  <symbol id="bb-fist" viewBox="0 0 360 720">
    <use href="#bb-bust"/>
    <g stroke="currentColor" stroke-width="8" stroke-linejoin="round">
      <path style="fill:var(--bb-shirt)" d="M20 720C14 640 30 560 64 520L128 560C104 600 92 660 96 720Z"/>
      <circle style="fill:var(--bb-fur)" cx="92" cy="500" r="50"/>
      <path fill="none" d="M70 482Q92 470 112 486M66 508Q90 496 116 512"/>
    </g>
  </symbol>
  <symbol id="bb-full" viewBox="0 0 200 260">
    <g stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <rect style="fill:var(--bb-pants)" x="62" y="184" width="32" height="50" rx="12"/>
      <rect style="fill:var(--bb-pants)" x="106" y="184" width="32" height="50" rx="12"/>
      <ellipse style="fill:currentColor" cx="74" cy="240" rx="22" ry="11"/>
      <ellipse style="fill:currentColor" cx="126" cy="240" rx="22" ry="11"/>
      <ellipse style="fill:var(--bb-shirt)" cx="42" cy="118" rx="15" ry="32" transform="rotate(38 42 118)"/>
      <circle style="fill:var(--bb-fur)" cx="26" cy="92" r="14"/>
      <ellipse style="fill:var(--bb-shirt)" cx="160" cy="152" rx="15" ry="30" transform="rotate(-22 160 152)"/>
      <circle style="fill:var(--bb-fur)" cx="170" cy="178" r="14"/>
      <path style="fill:var(--bb-shirt)" d="M56 128C58 110 142 110 144 128L150 196C120 206 80 206 50 196Z"/>
      <circle style="fill:var(--bb-white)" stroke-width="4" cx="100" cy="160" r="17"/>
      <path style="fill:var(--bb-scarf)" stroke="none" d="M92 170L104 150L108 168Z"/>
      <path style="fill:var(--bb-scarf)" d="M58 114C80 128 120 128 142 114L146 130C120 144 80 144 54 130ZM132 120L176 100L166 134Z"/>
      <circle style="fill:var(--bb-fur)" cx="60" cy="34" r="17"/>
      <circle style="fill:var(--bb-fur)" cx="140" cy="34" r="17"/>
      <ellipse style="fill:var(--bb-fur)" cx="100" cy="72" rx="56" ry="48"/>
      <ellipse style="fill:var(--bb-white)" cx="100" cy="90" rx="25" ry="19"/>
      <ellipse style="fill:currentColor" stroke="none" cx="100" cy="81" rx="9" ry="6"/>
      <path fill="none" stroke-width="4" d="M90 96Q100 104 110 96"/>
      <circle style="fill:currentColor" stroke="none" cx="76" cy="66" r="5"/>
      <circle style="fill:currentColor" stroke="none" cx="124" cy="66" r="5"/>
    </g>
  </symbol>
  <symbol id="bb-box" viewBox="0 0 200 260">
    <use href="#bb-full"/>
    <g stroke="currentColor" stroke-width="5" stroke-linejoin="round">
      <path style="fill:var(--bb-box)" d="M48 128H152V196H48Z"/>
      <path fill="none" d="M48 146H152M100 128V146"/>
      <circle style="fill:var(--bb-fur)" cx="46" cy="166" r="13"/>
      <circle style="fill:var(--bb-fur)" cx="154" cy="166" r="13"/>
    </g>
  </symbol>
  <symbol id="bb-desk" viewBox="0 0 640 400">
    <g stroke="currentColor" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
      <path style="fill:var(--bb-chair)" d="M40 190H120V330H40Z"/>
      <path style="fill:var(--bb-chair)" d="M520 190H600V330H520Z"/>
      <path fill="none" d="M60 330V392M108 330V392M532 330V392M580 330V392M276 262V392M364 262V392"/>
    </g>
    <use href="#bb-full" x="40" y="96" width="210" height="273" style="--bb-shirt:var(--bb-shirt-a)"/>
    <use href="#bb-full" x="390" y="96" width="210" height="273" style="--bb-shirt:var(--bb-shirt-b)" transform="translate(990 0) scale(-1 1)"/>
    <g stroke="currentColor" stroke-width="6" stroke-linejoin="round">
      <path style="fill:var(--bb-chair)" d="M196 236H444L470 266H170Z"/>
      <path style="fill:var(--bb-white)" d="M262 240H372L380 256H254Z"/>
    </g>
  </symbol>
  <symbol id="bb-wave" viewBox="0 0 1160 830">
    <g stroke="currentColor" stroke-width="10" stroke-linejoin="round" stroke-linecap="round">
      <ellipse style="fill:var(--bb-shirt)" cx="250" cy="520" rx="72" ry="200" transform="rotate(62 250 520)"/>
      <circle style="fill:var(--bb-fur)" cx="96" cy="430" r="64"/>
      <ellipse style="fill:var(--bb-shirt)" cx="910" cy="500" rx="72" ry="200" transform="rotate(-62 910 500)"/>
      <circle style="fill:var(--bb-fur)" cx="1062" cy="404" r="64"/>
      <path style="fill:var(--bb-helmet)" d="M968 352A100 92 0 0 1 1150 352Z"/>
      <path style="fill:var(--bb-helmet)" d="M950 352H1160V372H950Z"/>
      <path style="fill:var(--bb-shirt)" d="M320 830C330 650 420 570 580 570C740 570 830 650 840 830Z"/>
      <circle style="fill:var(--bb-white)" cx="580" cy="728" r="82"/>
      <path style="fill:var(--bb-scarf)" d="M540 770L606 680L626 762Z"/>
      <path style="fill:var(--bb-scarf)" d="M380 548C460 600 700 600 780 548L800 600C700 650 460 650 360 600ZM740 570L900 500L870 610Z"/>
      <circle style="fill:var(--bb-fur)" cx="390" cy="150" r="72"/>
      <circle style="fill:var(--bb-muzzle)" stroke="none" cx="390" cy="152" r="36"/>
      <circle style="fill:var(--bb-fur)" cx="770" cy="150" r="72"/>
      <circle style="fill:var(--bb-muzzle)" stroke="none" cx="770" cy="152" r="36"/>
      <ellipse style="fill:var(--bb-fur)" cx="580" cy="330" rx="232" ry="210"/>
      <ellipse style="fill:var(--bb-white)" cx="580" cy="412" rx="108" ry="82"/>
      <ellipse style="fill:currentColor" cx="580" cy="370" rx="38" ry="24"/>
      <path style="fill:currentColor" d="M526 430Q580 500 634 430Z"/>
      <circle style="fill:currentColor" stroke="none" cx="482" cy="306" r="19"/>
      <circle style="fill:currentColor" stroke="none" cx="678" cy="306" r="19"/>
    </g>
  </symbol>
  <symbol id="bb-logo" viewBox="0 0 140 158">
    <g stroke="currentColor" stroke-width="4" stroke-linejoin="round">
      <circle style="fill:var(--bb-logo-disc)" cx="66" cy="62" r="50"/>
      <ellipse style="fill:none" stroke-width="6" cx="66" cy="66" rx="58" ry="20" transform="rotate(-24 66 66)"/>
      <path style="fill:var(--bb-scarf)" d="M42 92L112 18L96 84Z"/>
      <path style="fill:var(--bb-star)" stroke="none" d="M24 18l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1zM50 6l2 5 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1z"/>
    </g>
    <text x="70" y="150" text-anchor="middle" style="fill:currentColor;font:italic 900 34px var(--kf-font-label);letter-spacing:-1px">BRAND</text>
  </symbol>
  <symbol id="bb-star" viewBox="0 0 40 40">
    <path style="fill:currentColor" d="M20 0C21 12 28 19 40 20C28 21 21 28 20 40C19 28 12 21 0 20C12 19 19 12 20 0Z"/>
  </symbol>
  <symbol id="bb-user" viewBox="0 0 32 32">
    <g fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="16" cy="10" r="6"/><path d="M5 29C6 21 10 18 16 18S26 21 27 29"/></g>
  </symbol>
</svg>`;

  const bear = (sym, mod = "", label = "") =>
    `<svg class="bb ${mod}" viewBox="${sym === "bb-desk" ? "0 0 640 400" : sym === "bb-wave" ? "0 0 1160 830" : sym === "bb-bust" || sym === "bb-fist" ? "0 0 360 720" : "0 0 200 260"}"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}><use href="#${sym}"/></svg>`;
  window.bbBear = bear;

  const MENU = [
    ["index.html", "Home"],
    ["about.html", "About the Brand"],
    ["flow.html", "Registration / date intro flow"],
    ["faq.html", "Frequently asked questions"],
    ["about.html#company", "Company info"],
  ];
  const here = document.body.dataset.page;

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.innerHTML = `
<div class="bh-frame" aria-hidden="true"></div>
<a class="bh-logo" href="index.html" aria-label="Go home"><svg class="bb" viewBox="0 0 140 158" role="img" aria-label="Logo mark — circular emblem and English wordmark" data-label="Logo mark · circular emblem + English wordmark · portrait 140×158"><use href="#bb-logo"/></svg></a>
<nav class="bh-nav" aria-label="Main menu">
  <button class="bh-toggle" type="button" aria-expanded="false" aria-controls="bh-menu">MENU <i class="bh-burger" aria-hidden="true"></i></button>
  <div class="bh-collapse" id="bh-menu">
    <ul class="bh-menu">
      ${MENU.map(([h, t]) => `<li><a class="bh-link" href="${h}"${h === here + ".html" ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}
      <li><a class="bh-link bh-contact" href="#bh-contact">CONTACT</a></li>
    </ul>
  </div>
</nav>
<a class="bh-contact-sp" href="#bh-contact">CONTACT</a>
<a class="bh-apply" href="#bh-fee"><svg class="bh-apply__icon" viewBox="0 0 32 32" aria-hidden="true"><use href="#bb-user"/></svg> Request an interview</a>`;
  }

  // Original .sc6-walk·.illustration-strip img — while the strip flows, each cell walks for 1.1s (motion part sticker-wiggle look: walk)
  const walkers = (mods, n) => Array.from({ length: n }, (_, i) =>
    `<li><span class="bh-walker" data-fx="sticker-wiggle" data-fx-sticker-wiggle="look: walk">${bear(i % 3 === 1 ? "bb-box" : "bb-full", mods[i % mods.length])}</span></li>`).join("");
  const strip = (slot, mods, n = 6) =>
    `<div class="bh-strip ${slot}" aria-hidden="true"><ul class="bh-strip__list">${walkers(mods, n)}</ul></div>`;
  window.bbStrip = strip;
  document.querySelectorAll("[data-walk]").forEach((el) => {
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<ul class="bh-strip__list">${walkers(el.dataset.walk.split(" "), 6)}</ul>`;
  });

  const tail = document.querySelector("[data-shared=tail]");
  if (tail) {
    tail.innerHTML = `
<section class="bh-fee" id="bh-fee" data-slot="apply-cta">
  <div class="bh-fee__in">
    <div class="bh-fee__text">
      <h2 class="bh-fee__title">Staff Registration<br>Request a meeting</h2>
      <p class="bh-fee__lead">Before we introduce the work, please visit us once,<br>Interviews and staff registration are in progress.<br>Please feel free to request a meeting first.</p>
    </div>
    <div class="bh-fee__img" data-label="Illustration of three bears sitting around a desk in a meeting · front view · landscape 3:2">${bear("bb-desk", "bb--pink-green")}</div>
  </div>
  <div class="bh-btn-wrap"><a class="bh-btn" href="#bh-fee" data-fx="sweep-through-hover" style="--fx-dur:.3s;--fx-ease:ease;--fx-fill:var(--kf-ink)"><span class="bh-btn__text is-ko">Request an interview here</span><span class="bh-btn__arrow"></span></a></div>
  <div class="bh-sit-row" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<span class="bh-sit-row__item">${i < 2 ? "" : bear("bb-desk", ["bb--navy-pink", "bb--green-orange", "bb--orange-navy", "bb--pink-green"][i % 4])}</span>`).join("")}</div>
</section>
<section class="bh-contact" id="bh-contact" data-slot="contact">
  <h2 class="bh-contact__title">Contact Us</h2>
  <p class="bh-contact__lead">For inquiries, requests, or consultations about the service,<br>Feel free to get in touch.</p>
  <div class="bh-btn-wrap"><a class="bh-btn bh-btn--line" href="#bh-contact" data-fx="sweep-through-hover" style="--fx-dur:.3s;--fx-ease:ease;--fx-fill:var(--kf-surface)"><span class="bh-btn__text is-ko">Inquire by email</span><span class="bh-btn__arrow"></span></a></div>
  <div class="bh-peek" aria-hidden="true">${["bb--navy", "bb--pink", "", "bb--green", "", "bb--orange"].map((m) => `<span class="bh-peek__item">${m ? bear("bb-full", m) : ""}</span>`).join("")}</div>
</section>
<footer class="bh-footer" data-slot="footer" id="company">
  <div class="bh-footer__top">
    <a class="bh-footer__logo" href="index.html" aria-label="Go home"><svg class="bb" viewBox="0 0 140 158" aria-hidden="true"><use href="#bb-logo"/></svg></a>
    <div class="bh-footer__info">
      <p class="bh-footer__name">Brand Inc.</p>
      <p class="bh-footer__addr">Postal code 000-0000<br>Your one-line address here 0-0-0<br>Your building name 0F here<span class="bh-footer__map"><a href="#company">[ View Map ]</a></span></p>
      <a class="bh-footer__tel" href="#company">TEL : 00-0000-0000</a>
    </div>
    <div class="bh-footer__cta"><a class="bh-btn bh-btn--small" href="#bh-fee" data-fx="sweep-through-hover" style="--fx-dur:.3s;--fx-ease:ease;--fx-fill:var(--kf-ink)"><span class="bh-btn__text is-ko"><svg class="bh-apply__icon" viewBox="0 0 32 32" aria-hidden="true"><use href="#bb-user"/></svg> Request an interview here</span><span class="bh-btn__arrow"></span></a></div>
  </div>
  <ul class="bh-footer__nav">
    ${MENU.concat([["#bh-contact", "Contact Us"]]).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}
  </ul>
  <div class="bh-footer__bears" aria-hidden="true">${bear("bb-full", "bb--navy")}${bear("bb-box", "bb--green")}${bear("bb-full", "bb--pink")}${bear("bb-box", "bb--orange")}</div>
  <p class="bh-footer__copy">© BRAND Inc.</p>
</footer>`;
  }

  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  // Original common/js/scripts.js — the endlessly flowing picture band is infiniteslidev2 as is (speed 50 = 50px per second)
  const startStrips = () => {
    if (!window.jQuery) return;
    // infiniteslidev2 attaches to $.fn inside jQuery ready — so it comes after that
    jQuery(() => {
      if (!jQuery.fn.infiniteslide) return;
      jQuery(".bh-strip__list, .bh-sit-row, .bh-peek").each(function () {
        jQuery(this).infiniteslide({ speed: Number(this.dataset.speed || 50), responsive: true, pauseonhover: false });
      });
    });
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.getElementById("loader");
  const dot = loader.querySelector(".bh-loader__text span");
  const dotTween = reduce ? null : gsap.fromTo(dot, { y: 0 }, { y: -10, duration: 0.5, ease: "none", yoyo: true, yoyoEase: "bounce.out", repeat: -1, repeatDelay: 0.3 });
  const hide = () => {
    if (reduce) { loader.style.display = "none"; document.dispatchEvent(new Event("bh:ready")); return; }
    // Original Loader.hide — after .5s the logo drops off the bottom of the screen (expo.in) and the navy and white curtains peel down .2s apart (expo.out)
    gsap.timeline({ delay: 0.5, onComplete: () => { dotTween && dotTween.kill(); loader.style.display = "none"; } })
      .to(loader.querySelector(".bh-loader__text"), { y: "100vh", duration: 0.8, ease: "expo.in" }, 0)
      .to(loader.querySelector(".bh-loader__ink"), { yPercent: 100, duration: 1, ease: "expo.out" }, 0.8)
      .to(loader.querySelector(".bh-loader__paper"), { yPercent: 100, duration: 1, ease: "expo.out" }, 1)
      .add(() => document.dispatchEvent(new Event("bh:ready")), 0.8);
  };

  // Phone menu — original bootstrap collapse (height 0 → content height at .35s ease)
  const toggle = document.querySelector(".bh-toggle");
  const collapse = document.querySelector(".bh-collapse");
  if (toggle && collapse) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      collapse.style.height = (open ? 0 : collapse.scrollHeight) + "px";
      collapse.classList.add("is-moving");
      requestAnimationFrame(() => { collapse.style.height = (open ? collapse.scrollHeight : 0) + "px"; });
      setTimeout(() => { collapse.classList.remove("is-moving"); collapse.classList.toggle("is-open", open); collapse.style.height = ""; }, 350);
    });
  }


  // Original script.js initAccordion — Web Animations animate height and margin 0 ↔ content height, 400ms ease-in-out
  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.addEventListener("click", () => {
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      panel.getAnimations().forEach((a) => a.cancel());
      trigger.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) panel.hidden = false;
      const cs = getComputedStyle(panel);
      const frames = [{ height: "0px", marginTop: "0px", paddingTop: "0px", paddingBottom: "0px" }, { height: panel.scrollHeight + "px", marginTop: cs.marginTop, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom }];
      const anim = panel.animate(willOpen ? frames : [...frames].reverse(), { duration: reduce ? 0 : 400, easing: "ease-in-out", fill: "forwards" });
      anim.onfinish = () => { if (!willOpen) panel.hidden = true; anim.cancel(); };
    });
  });

  // Original initPageTop — shows after scrolling past 100px, and pressing it smoothly scrolls to the top
  const top = document.querySelector(".bh-totop");
  if (top && !document.querySelector("#pagepiling")) {
    const on = () => top.classList.toggle("is-on", scrollY > 100);
    addEventListener("scroll", on, { passive: true });
    on();
    top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  // The original loads all the heavy scripts (recaptcha, pixi, etc.), then starts hiding on jQuery ready plus an empty PIXI.loader callback, so it lags the first screen by about .2s. The lightweight copy hooks into window load to match that lag
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startStrips);
  else startStrips();
  if (document.readyState === "complete") hide();
  else addEventListener("load", hide, { once: true });
})();
