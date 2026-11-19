// Plug the four-corner frame, booking drawer, menu, dot cursor, loader and footer into every page with the same markup, porting the original’s jQuery toggle behavior as it is.
(() => {
  gsap.registerPlugin(ScrollToPlugin);
  const page = document.body.dataset.page;
  const isHome = page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const NAV = [
    ["about.html", "Menu 1"],
    ["product.html", "Menu 2"],
    ["service.html", "Menu 3 & Name"],
    ["index.html#faq", "Menu 4"],
    ["index.html#location", "Menu 5"],
  ];
  const navItems = (cls = "") => NAV.map(([h, t]) => `<li class="${cls}"><a href="${h}">${t}</a></li>`).join("");
  const LOGO = '<span class="vi-logo" aria-label="example" data-label="Brand logo goes here — a wordmark of seven scattered lowercase English letters"><i>e</i><i>x</i><i>a</i><i>m</i><i>p</i><i>l</i><i>e</i></span>';
  const PIN = '<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M6.5 12.6S2.2 7.9 2.2 5A4.3 4.3 0 0 1 10.8 5c0 2.9-4.3 7.6-4.3 7.6Z" fill="currentColor"/><circle cx="6.5" cy="5" r="1.5" fill="var(--kf-bg)"/></svg>';
  const RESV = `
    <button class="vi-resv js-resv" type="button" aria-expanded="false" data-label="Your English booking button text here (one line in a 140px slot)">Book Here</button>
    <ul class="vi-resv-list" data-label="Two English names of booking channels here"><li><a href="#">Site 1</a></li><li><a href="#">Site 2</a></li></ul>`;
  // The original swaps the image address inside the cursor to the previous/next arrow when hovering a half, and clears it on leave — the image changes instantly with no transition
  const ARROW = {
    next: '<svg viewBox="0 0 29 12" aria-hidden="true"><path d="M0 6h27M22 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    prev: '<svg viewBox="0 0 29 12" aria-hidden="true"><path d="M29 6H2M7 1 2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  };

  const frame = `
  <header class="vi-frame vi-fadein" data-slot="frame">
    <div class="vi-frame__top">
      <a class="vi-frame__brand" href="index.html">${LOGO}<span class="vi-frame__brand-sub" data-label="Your brand name in English and a short subtitle here">Studio · Name<small>Small Tagline</small></span></a>
      <button class="vi-frame__lead vi-fv-only js-lead" type="button" data-label="Your one-line English intro here — click to expand the opening passage"><span class="more vi-w130">“A short line set in quotes” </span><span class="vi-w130">followed by a longer second line.</span></button>
      <nav class="vi-row-nav" aria-label="Menu" data-label="Your English menu name here"><ul>${navItems("vi-w120")}</ul></nav>
    </div>
    <div class="vi-frame__bottom">
      <div>
        <nav class="vi-main-nav vi-fv-only" aria-label="Menu" data-label="Your English menu name here"><p class="vi-h5">(Menu)</p><ul>${navItems("vi-w120")}</ul></nav>
        <a class="vi-map" href="index.html#location">${PIN}<span class="vi-fv-only" data-label="Your English region / city name here">Town Name, Region Name</span></a>
      </div>
      <div class="vi-frame__side" data-label="Your social accounts, English terms links and English copyright name go here">
        <a class="vi-arrow vi-w130 vi-fv-only" href="#">Follow us<br>Social</a>
        <a class="vi-arrow vi-w130 vi-fv-only" href="#">Legal Notice</a>
        <small class="vi-copy">© NAME</small>
      </div>
    </div>
  </header>
  <div class="vi-fixed vi-fadein" data-slot="reservation">
    ${RESV}
    <span class="vi-amount"><span class="js-amount">0</span><i>%</i></span>
  </div>
  <button class="vi-burger js-burger" type="button" aria-expanded="false" aria-label="Open Menu"><span class="vi-burger__t">menu</span></button>
  <nav class="vi-spnav" data-slot="mobile-menu" aria-label="Phone menu">
    <div class="vi-spnav__in">
      <div>
        <ul class="vi-spnav__list" data-label="Your chapter name in English here — same as the first-page chapter title">
          <li><a href="product.html"><span data-letter="Works" data-pre="01/"></span></a></li>
          <li><a href="service.html"><span data-letter="Works & Notes" data-pre="02/"></span></a></li>
          <li><a href="index.html#dining"><span data-letter="Journal" data-pre="03/"></span></a></li>
          <li><a href="index.html#island"><span data-letter="Place Name" data-pre="04/"></span></a></li>
          <li><a href="index.html#location"><span data-letter="Location" data-pre="05/"></span></a></li>
          <li><a href="index.html#faq"><span data-letter="FAQ" data-pre="06/"></span></a></li>
        </ul>
        <div class="vi-spnav__sub"><a href="about.html">（Menu 1）</a><div>${RESV}</div></div>
      </div>
      <div>
        <div class="vi-spnav__links" data-label="Your English group name for contact, social and directions goes here">
          <div><span>（Contact）</span><a href="#">mail@example.com</a></div>
          <div><span>（Follow us）</span><a href="#">@account</a></div>
          <div><span>（Access）</span><a class="vi-ul" href="index.html#location">View on map</a></div>
        </div>
        <p class="vi-spnav__text" data-label="Your two-line English intro">A short welcome line set<br>across two lines about the stay.</p>
        <small class="vi-copy">© NAME</small>
      </div>
    </div>
  </nav>`;

  const footer = `
  <footer class="vi-footer" data-slot="footer">
    <div class="vi-footer__in">
      <div class="vi-footer__row vi-footer__top">
        <div class="vi-footer__left">
          ${LOGO}
          <p class="vi-footer__name vi-w130" data-label="Your brand’s English name here">Studio Name</p>
          <address class="vi-footer__addr vi-w130" data-label="Your three-line English address">000 Street Name, Town Name,<br>District Name,<br>Region Name</address>
        </div>
        <div class="vi-footer__center"><div class="vi-footer__center-in">
          <nav class="vi-footer__nav" data-label="Your English menu name here"><p class="vi-h5">(Menu)</p><ul class="vi-footer__menu">${navItems("vi-w120")}<li class="vi-w120"><a href="#">Menu 6</a></li></ul></nav>
          <div class="vi-footer__links">
            <div><p class="vi-h5">(Contact)</p><a href="#">mail@example.com</a></div>
            <div><p class="vi-h5">(Follow us)</p><a href="#">@account</a></div>
          </div>
        </div>
          <div class="vi-footer__right--sp">
          <div>
            <p class="vi-h5 vi-footer__acc-t">(Access)</p>
            <a class="vi-footer__acc-link" href="index.html#location">View on map</a>
            <address class="vi-footer__addr-ko">Your address first line here<br>Second line 00-0</address>
          </div>
          <a class="vi-totop js-totop" href="#" aria-label="Back to top"><svg viewBox="0 0 15 15"><path d="M7.5 14V1.5M2 7l5.5-5.5L13 7" fill="none" stroke="currentColor"/></svg></a>
        </div>
        </div>
        <div class="vi-footer__right">
          <p class="vi-h5 vi-footer__acc-t">(Access)</p>
          <a class="vi-footer__acc-link" href="index.html#location">View on map</a>
          <address class="vi-footer__addr-ko">Your address first line here<br>Second line 00-0</address>
          <a class="vi-arrow vi-w130" href="#">Follow us<br>Social</a><br>
          <a class="vi-arrow vi-w130" href="#">Legal Notice</a>
        </div>
      </div>
      <div class="vi-footer__row vi-footer__bottom">
        <div class="vi-footer__left"><button class="vi-frame__lead js-lead" type="button" style="position:relative;top:auto;right:auto;color:inherit" data-label="Your one-line English intro here — click to expand the opening passage"><span class="more vi-w130">“A short line set in quotes” </span><span class="vi-w130">followed by a longer second line.</span></button></div>
        <div class="vi-footer__center"><div class="vi-footer__center-in" data-label="Your two-line English intro and two-line English closing go here.">
          <span class="vi-footer__text vi-w130">A short welcome line set<br>across two lines about the stay.</span>
          <span class="vi-footer__text vi-w130">A closing line here<br>set quietly in two lines</span>
        </div></div>
        <div class="vi-footer__right">
          <a class="vi-totop js-totop" href="#" aria-label="Back to top"><svg viewBox="0 0 15 15"><path d="M7.5 14V1.5M2 7l5.5-5.5L13 7" fill="none" stroke="currentColor"/></svg></a>
          <p class="vi-h5">(Contact)</p>
          <a class="vi-sans" href="#">mail@example.com</a>
        </div>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML("afterbegin", `<div class="vi-cursor" aria-hidden="true"></div>` + frame);
  document.querySelector("main").insertAdjacentHTML("afterend", footer);

  // Title letters: offset each letter’s baseline and size slightly — decided by the char code so the same letter always jumps to the same spot
  document.querySelectorAll("[data-letter]").forEach((el) => {
    const pre = el.dataset.pre ? `<span class="pre">${el.dataset.pre}</span>` : "";
    const chars = [...el.dataset.letter].map((c, i) => {
      if (c === " ") return '<span class="l sp"></span>';
      const h = (c.codePointAt(0) * 31 + i * 17) % 10;
      const y = h < 2 ? "-0.26em" : h === 2 ? "0.12em" : h === 3 ? "-0.1em" : "0";
      const s = h === 3 ? 0.86 : h === 4 ? 1.08 : 1;
      return `<span class="l" style="--y:${y};--s:${s}">${c}</span>`;
    });
    el.classList.add("vi-letter");
    el.setAttribute("aria-label", el.dataset.letter);
    el.innerHTML = pre + chars.join("");
  });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const burger = $(".js-burger");
  const rowNav = $(".vi-row-nav");
  const spNav = $(".vi-spnav");

  // ---------- Reveal ----------
  const reveal = () => $$(".vi-fadein, .vi-blurin").forEach((el) => el.classList.add("on"));
  const showBurger = () => document.body.classList.add("is-burger");
  const loader = $(".vi-loader");
  if (isHome && !reduce && loader && !sessionStorage.getItem("vi-visited")) {
    sessionStorage.setItem("vi-visited", "1");
    // The original has two clocks — 3s after DOM ready the loader curtain does fadeOut(800), and separately 3s after load + 1s the heading and first photo turn on
    const lock = (on) => { document.body.style.overflowY = on ? "hidden" : ""; };
    lock(true);
    setTimeout(() => {
      loader.classList.add("is-hide");
      lock(false);
      setTimeout(() => loader.remove(), 1000);
    }, 3000);
    const afterLoad = () => {
      lock(true);
      setTimeout(() => { lock(false); setTimeout(() => { reveal(); showBurger(); }, 1000); }, 3000);
    };
    if (document.readyState === "complete") afterLoad(); else addEventListener("load", afterLoad, { once: true });
  } else if (isHome && !reduce) {
    loader?.remove();
    setTimeout(() => { reveal(); showBurger(); }, 800);
  } else {
    loader?.remove();
    reveal();
    showBurger();
  }

  // ---------- Menu ----------
  const setBurger = (open) => {
    const sp = innerWidth <= 576;
    burger.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (sp) {
      spNav.classList.toggle("active", open);
      document.body.classList.toggle("is-locked", open);
      $(".vi-burger__t", burger).textContent = open ? "CLOSE" : "menu";
    } else {
      rowNav.classList.toggle("active", open);
      if (!open) spNav.classList.remove("active");
    }
  };
  burger.addEventListener("click", () => setBurger(!burger.classList.contains("active")));
  $$(".vi-spnav a, .vi-row-nav a").forEach((a) => a.addEventListener("click", () => setBurger(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setBurger(false); });

  // ---------- Reservation drawer: original slideToggle(300) — jQuery’s default swing is 0.5 − cos(πp)/2, the same formula as GSAP sine.inOut ----------
  // Like jQuery slideToggle, expand height together with top and bottom padding and margin from 0 (so leftover margin doesn’t show first)
  const BOX = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"];
  const slide = (el, open, ms) => {
    if (reduce) { el.style.display = open ? "block" : "none"; return; }
    if (open) {
      el.style.display = "block";
      const cs = getComputedStyle(el);
      // Height uses the computed css height like jQuery — border-box, so it includes padding. With inner height, it would jump by the padding when released to auto at the end
      const to = Object.fromEntries(BOX.map((k) => [k, cs[k]]));
      gsap.fromTo(el, Object.fromEntries(BOX.map((k) => [k, 0])), { ...to, duration: ms / 1000, ease: "sine.inOut", overflow: "hidden", clearProps: BOX.join(",") + ",overflow" });
    } else {
      gsap.to(el, { ...Object.fromEntries(BOX.map((k) => [k, 0])), overflow: "hidden", duration: ms / 1000, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; gsap.set(el, { clearProps: BOX.join(",") + ",overflow" }); } });
    }
  };
  $$(".js-resv").forEach((b) => b.addEventListener("click", () => {
    const list = b.nextElementSibling;
    const open = getComputedStyle(list).display === "none";
    b.setAttribute("aria-expanded", String(open));
    slide(list, open, 300);
  }));
  $$(".js-lead").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-open")));

  // ---------- Question fold: original slideToggle(200), opening one closes the rest ----------
  $$(".vi-aco button").forEach((b) => b.addEventListener("click", () => {
    const open = !b.classList.contains("open");
    $$(".vi-aco button.open").forEach((o) => { if (o !== b) { o.classList.remove("open"); o.setAttribute("aria-expanded", "false"); slide(o.nextElementSibling, false, 200); } });
    b.classList.toggle("open", open);
    b.setAttribute("aria-expanded", String(open));
    slide(b.nextElementSibling, open, 200);
  }));

  $$(".js-totop").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (reduce) scrollTo(0, 0); else gsap.to(window, { scrollTo: 0, duration: 0.5, ease: "sine.inOut" });
  }));
  $$('a[href^="#"]:not(.js-totop)').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return e.preventDefault();
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (reduce) t.scrollIntoView(); else gsap.to(window, { scrollTo: t, duration: 0.6, ease: "sine.inOut" });
  }));

  // ---------- Photo slideshow: original swiper 10.3.1 fade (crossFade · loop · speed 1600 · autoplay 2000) — pressing the left or right half goes back or forward ----------
  const cursor = $(".vi-cursor");
  if (window.Swiper) $$(".vi-fader").forEach((box) => {
    const el = $(".swiper", box);
    if (!el) return;
    new Swiper(el, {
      slidesPerView: 1,
      loop: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: reduce ? 0 : 1600,
      autoplay: reduce ? false : { delay: 2000, disableOnInteraction: false },
      // Panels like the facility page and room decor photos, where the original has no half-click zones, only advance on their own without navigation
      ...($(".vi-fader__nav", box) && { navigation: { prevEl: $(".vi-fader__nav.is-prev", box), nextEl: $(".vi-fader__nav.is-next", box) } }),
    });
  });

  // ---------- Dot cursor ----------
  if (fine && innerWidth > 900) {
    addEventListener("mousemove", (e) => { cursor.style.left = e.clientX + "px"; cursor.style.top = e.clientY + "px"; });
    document.addEventListener("mouseover", (e) => {
      const nav = e.target.closest(".vi-fader__nav, .vi-slider__nav");
      const art = nav ? ARROW[nav.dataset.dir === "-1" ? "prev" : "next"] : "";
      if (cursor.dataset.art !== art) { cursor.innerHTML = art; cursor.dataset.art = art; }
      cursor.classList.toggle("slider-hover", !!nav);
      cursor.classList.toggle("hover", !nav && !!e.target.closest("a, button"));
    });
  }

  // ---------- Scroll: past hero, progress, section fade ----------
  const fv = $(".vi-fv");
  const amount = $(".js-amount");
  const fades = $$(".vi-fade");
  fades.forEach((el) => el.classList.add("show"));
  let wasPast = null;
  const fvOnly = $$(".vi-fv-only");
  const onScroll = (first) => {
    const y = scrollY;
    const wh = innerHeight;
    if (!first && burger.classList.contains("active")) setBurger(false);
    const past = fv ? y > fv.offsetHeight : y > 0;
    if (past !== wasPast) {
      document.body.classList.toggle("is-past-fv", past);
      // Original fadeOut/fadeIn(400) swing — inline opacity, so the link’s CSS hover transition (.2s) stays intact
      // On reappearing, clear the inline value — like jQuery fadeIn, leaving it would override the link’s a:hover opacity
      if (fvOnly.length && past) gsap.to(fvOnly, { autoAlpha: 0, duration: first || reduce ? 0 : 0.4, ease: "sine.inOut", overwrite: true });
      else if (fvOnly.length && !first) gsap.to(fvOnly, { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: "sine.inOut", overwrite: true, clearProps: "opacity,visibility" });
      wasPast = past;
    }
    const max = document.documentElement.scrollHeight - wh;
    amount.textContent = Math.round(Math.min(max > 0 ? y / max : 0, 1) * 100);
    if (first || reduce) return;
    fades.forEach((el) => el.classList.toggle("show", y + wh * 0.7 > el.getBoundingClientRect().top + y));
  };
  onScroll(true);
  addEventListener("scroll", () => onScroll(false), { passive: true });
})();
