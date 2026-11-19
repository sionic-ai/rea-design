// Shared by all pages — the right menu panel (phone: header bar + drawer), shortcuts, and footer are plugged in as one set,
// Wires up the accordion (400ms easeOutCubic), banner fade (Splide), reveal (ScrollTrigger is-show), text turn-on (SplitText) and anchor scrolling.
(() => {
  const ICON = {
    mark: '<svg viewBox="0 0 56 58" aria-hidden="true"><path d="M4 30c9-1 16-5 21-12L33 4c-2 9-5 15-9 20 8-4 17-5 28-3-10 3-18 7-24 13 7 2 13 7 17 15-8-4-15-6-22-5l-5 9-2-8c-5 0-9-1-12-3 5-1 9-3 12-6-6 0-11-3-12-6Z"/></svg>',
    down: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3h8L5 8Z"/></svg>',
    right: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1v8l7-4Z"/></svg>',
    more: '<svg viewBox="0 0 12 4" aria-hidden="true"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="10" cy="2" r="1.2"/></svg>',
    book: '<svg viewBox="0 0 20 16" aria-hidden="true"><path d="M10 3C7.5 1.5 4.5 1 1 1.5v12c3.5-.5 6.5 0 9 1.5 2.5-1.5 5.5-2 9-1.5v-12C15.5 1 12.5 1.5 10 3Zm0 0v12"/></svg>',
    note: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1h7l3 3v11H3Zm2 5h6v1H5Zm0 3h6v1H5Zm0 3h4v1H5Z"/></svg>',
    cal: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12v11H2Zm1 3v7h10V6ZM4 1h2v3H4Zm6 0h2v3h-2Z"/></svg>',
    chat: '<svg viewBox="0 0 18 16" aria-hidden="true"><path d="M8 1C4 1 1 3.4 1 6.5c0 1.6.8 3 2.2 4L2.5 14l3.6-2c.6.2 1.2.3 1.9.3 4 0 7-2.4 7-5.5S12 1 8 1Zm8 6.5c.7.8 1 1.7 1 2.7 0 1.2-.6 2.3-1.6 3.1l.5 2.7-2.7-1.5c-.4.1-.9.2-1.4.2-1.3 0-2.4-.4-3.3-1 3.5-.4 6.2-2.6 6.5-5.2Z"/></svg>',
    tel: '<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 4c6-3 30-3 36 0v4H2Zm4 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm16 0h-4v3h4Zm12-3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/></svg>',
  };
  const SNS = ["x", "fb", "insta", "tiktok", "line", "yt"].map((k, i) => {
    const d = [
      "M3 3h5l4 6 5-6h3l-7 8 8 10h-5l-5-6-5 6H3l8-9Z",
      "M12 2a10 10 0 0 0-1.6 19.9V15H8v-3h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v6.9A10 10 0 0 0 12 2Z",
      "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z",
      "M14 2h3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1.2V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3Z",
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-5 7h1.5v5H11v1.2H7Zm5 0h1.5v6.2H12Zm2.5 0H16l2 3.2V9h1.5v6.2H18l-2-3.2v3.2h-1.5Z",
      "M2 7.5C2 5.6 3.6 4 5.5 4h13C20.4 4 22 5.6 22 7.5v9c0 1.9-1.6 3.5-3.5 3.5h-13A3.5 3.5 0 0 1 2 16.5Zm8 1v7l6-3.5Z",
    ][i];
    return `<li class="ky-bounce__i"><a href="#" aria-label="SNS ${i + 1}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg></a></li>`;
  }).join("");

  const NAV = [
    { t: "Menu 1", href: "about.html", kids: ["Sub Menu 1", "Sub Menu 2", "Sub Menu 3", "Sub Menu 4"] },
    { t: "Menu 2", href: "index.html#course", kids: ["Sub Menu 1", "Sub Menu 2"] },
    { t: "Menu 3", href: "career.html", kids: ["Sub Menu 1", "Sub Menu 2", "Sub Menu 3"] },
    { t: "Menu 4", href: "adults.html", kids: ["Sub Menu 1", "Sub Menu 2", "Sub Menu 3"] },
  ];
  const navItem = (n) => `
    <li class="ky-nav__item ky-acc">
      <button class="ky-nav__row" type="button" aria-expanded="false"><span class="ky-nav__txt">${n.t}</span><span class="ky-nav__icon">${ICON.down}</span></button>
      <div class="ky-acc__body"><div class="ky-acc__inner"><ul class="ky-nav-child">
        ${[`${n.t} First Page`, ...n.kids].map((k) => `<li><a class="ky-nav-child__inner" href="${n.href}"><span class="ky-nav-child__txt">${k}</span><span class="ky-nav-child__arrow" aria-hidden="true">${ICON.right}</span></a></li>`).join("")}
      </ul></div></div>
    </li>`;
  const logoTxt = `<span class="ky-header__org" data-label="School corporation name">The school corporation name goes here</span><span class="ky-header__name" data-label="School Name">Your school name here</span><span class="ky-header__tags"><span>Department 1</span><span>Department 2</span></span>`;

  const header = `
  <header class="ky-header" data-slot="side-nav">
    <div class="ky-header__sp">
      <a class="ky-mark" href="index.html" aria-label="Back to start">${ICON.mark}</a>
      <a class="ky-header__sp-logo" href="index.html">${logoTxt}</a>
      <button class="ky-switch" type="button" aria-label="Open Menu" aria-expanded="false"><span class="ky-switch__dots"><span></span><span></span><span></span></span><span class="ky-switch__close"></span><span class="ky-switch__txt">MENU</span></button>
    </div>
    <div class="ky-header__body">
      <a class="ky-header__logo" href="index.html"><span class="ky-mark">${ICON.mark}</span>${logoTxt}</a>
      <nav><ul class="ky-nav">
        ${NAV.map(navItem).join("")}
        <li class="ky-nav__item ky-acc">
          <button class="ky-nav__row" type="button" aria-expanded="false"><span class="ky-nav__txt">See more</span><span class="ky-nav__icon is-more">${ICON.more}</span></button>
          <div class="ky-acc__body"><div class="ky-acc__inner"><ul class="ky-nav-child">
            ${[["news.html", "News List"], ["index.html#op", "Info session guide"], ["#", "Contact Us"], ["#", "To graduates"]].map(([h, t]) => `<li><a class="ky-nav-child__inner" href="${h}"><span class="ky-nav-child__txt">${t}</span><span class="ky-nav-child__arrow" aria-hidden="true">${ICON.right}</span></a></li>`).join("")}
          </ul></div></div>
        </li>
        <li class="ky-nav__item is-sp"><a class="ky-nav__row" href="index.html#op"><span class="ky-nav__txt">Menu 5</span></a></li>
      </ul></nav>
      <div class="ky-header__sub">
        <p class="ky-route__head">${ICON.book}Admissions info here</p>
        <ul class="ky-route__nav">
          <li><a href="adults.html">Item 1</a></li><li><a href="adults.html">Item 2</a></li><li><a href="adults.html">Item 3</a></li>
          <li><a href="adults.html">Item 4</a></li><li><a href="#">Item 5</a></li><li><a href="about.html">Item 6</a></li>
        </ul>
        <div class="ky-banner splide" aria-label="Banner">
          <div class="splide__track"><ul class="splide__list">
            <li class="splide__slide"><a href="index.html#op"><div class="wf-img" data-label="Info session banner · light green to teal gradient · date badge · 2:1 landscape"></div></a></li>
            <li class="splide__slide"><a href="index.html#sp1"><div class="wf-img" data-label="Feature banner · two-person illustration on pink · handwritten title · 2:1 landscape"></div></a></li>
          </ul></div>
        </div>
      </div>
    </div>
  </header>`;

  const subnav = `
  <div class="ky-subnav" data-slot="shortcut-dock">
    <ul class="ky-subnav__list">
      <li class="ky-subnav__item"><a href="#" data-label="Go to request materials">Shortcut 1<span class="ky-subnav__icon">${ICON.note}</span></a></li>
      <li class="ky-subnav__item is-op-pc"><a href="index.html#op" data-label="Go to info session">Shortcut 2<span class="ky-subnav__icon">${ICON.cal}</span></a></li>
      <li class="ky-subnav__item"><a href="#" data-label="Quick link to book a one-on-one consultation">Shortcut 3<span class="ky-subnav__icon">${ICON.chat}</span></a></li>
      <li class="ky-subnav__item is-op"><span class="ky-badge">Next<b>00/00</b>(Sun)</span><a href="index.html#op">Shortcut 2<span class="ky-subnav__icon">${ICON.cal}</span></a></li>
    </ul>
  </div>`;

  const footer = `
  <footer class="ky-footer ky-noise" data-slot="footer">
    <div class="ky-footer__short ky-inner">
      <ul class="ky-footer__short-list">
        <li><a href="#">${ICON.note}Shortcut 1</a></li><li><a href="index.html#op">${ICON.cal}Shortcut 2</a></li><li><a href="#">${ICON.chat}Shortcut 3</a></li>
      </ul>
      <ul class="ky-footer__short-list2">
        <li><a href="adults.html">Admissions info link</a></li><li><a href="adults.html">Tuition info link</a></li><li><a href="adults.html">Scholarship program link</a></li><li><a href="#">Consultation booking link</a></li><li><a href="#">Online application link</a></li>
      </ul>
    </div>
    <div class="ky-footer__profile ky-noise" data-slot="footer-arch">
      <div class="ky-inner">
        <div class="ky-footer__logo"><span class="ky-mark">${ICON.mark}</span><p class="ky-footer__logo-en" data-label="School English abbreviation">school</p></div>
        <p class="ky-footer__org">School corporation name<br>Your school name here</p>
        <address class="ky-footer__addr">Postal code 000-0000 Your address line here<br>Phone : <u>000-000-0000</u> / Fax: 000-000-0000<br>Email : name@example.com</address>
        <ul class="ky-sns">${SNS}</ul>
        <p class="ky-footer__ask">Admissions Inquiries & Consultation</p>
        <a class="ky-tel" href="#"><span class="ky-tel__label">Toll-free call</span><span class="ky-tel__num">${ICON.tel}<span>0000-000-000</span></span><span class="ky-tel__time">Hours / Weekdays 00:00~00:00</span></a>
        <p class="ky-footer__links"><a href="#">Privacy policy</a><a href="#">Related organization link</a></p>
        <div class="ky-footer__banner splide" aria-label="Banner">
          <div class="splide__track"><ul class="splide__list">
            <li class="splide__slide"><a href="index.html#sp1"><div class="wf-img" data-label="Feature banner · pink background with two-person illustration · landscape 2:1"></div></a></li>
            <li class="splide__slide"><a href="index.html#op"><div class="wf-img" data-label="Info session banner · light green to teal gradient · date badge · 2:1 landscape"></div></a></li>
          </ul></div>
        </div>
        <div class="ky-footer__pamph"><div class="wf-img" data-label="Guide booklet cover · student in a white coat · portrait 3:4"></div><div><p class="ky-footer__pamph-title">Digital brochure</p><a class="ky-footer__pamph-btn" href="#">View brochure ›</a></div></div>
      </div>
    </div>
    <div class="ky-footer__main" data-slot="footer-nav">
      <nav class="ky-inner"><ul class="ky-nav ky-fnav">
        ${NAV.map(navItem).join("")}
        <li class="ky-nav__item"><a class="ky-nav__row" href="index.html#op"><span class="ky-nav__txt">Menu 5</span></a></li>
        <li class="ky-nav__item"><a class="ky-nav__row" href="news.html"><span class="ky-nav__txt">Menu 6</span></a></li>
        <li class="ky-nav__item"><a class="ky-nav__row" href="#"><span class="ky-nav__txt">Menu 7</span></a></li>
        <li class="ky-nav__item"><a class="ky-nav__row" href="#"><span class="ky-nav__txt">Menu 8</span></a></li>
      </ul></nav>
      <p class="ky-footer__copy">© 0000 School Name in Latin Letters<br>Placeholder College</p>
      <div class="ky-footer__obj" aria-hidden="true"></div>
      <p class="ky-footer__slogan">Your one-line motto here.</p>
      <div class="ky-footer__bg" aria-hidden="true"><svg viewBox="0 0 540 260" preserveAspectRatio="none"><path fill="currentColor" d="M0 120 60 90l50 30 70-60 60 50 50-40 70 55 60-35 60 40 60-30v210H0Z"/><path fill="none" stroke="currentColor" stroke-width="1" opacity=".6" d="M0 170c80-20 160 10 270-10s200-10 270 5"/></svg></div>
    </div>
  </footer>`;

  // Child on a bicycle — a line drawing shared by the home stage and footer (stands in for the original pencil drawing)
  window.kyCyclist = () => `<svg viewBox="0 0 120 150" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" style="color:var(--site-pencil-soft)">
    <circle cx="35" cy="118" r="22"/><circle cx="88" cy="118" r="22"/><circle cx="35" cy="118" r="3"/><circle cx="88" cy="118" r="3"/>
    <path d="M35 118 55 90h30l3 28M55 90l-6-10M50 80h12M85 90l-8-22h10"/>
    <path d="M58 30c8-6 18-2 20 6 2 7-3 14-11 14s-13-6-11-13Z"/>
    <path d="M60 50c-6 10-8 22-3 34M66 50c10 6 14 14 16 22M56 60 38 46M60 84l-6 14M64 82l14 20"/>
    <path d="M52 52c-14-4-30 4-44 18 16-4 30-2 40 4M70 52c14-8 30-8 46 2-14 0-28 4-38 12"/>
    <path d="M58 40c-6-4-14-2-16 4 6-2 12-2 16 0Z"/>
  </svg>`;

  const mount = (sel, html) => {
    const slot = document.querySelector(sel);
    if (slot) slot.outerHTML = html;
  };
  mount("[data-mount=header]", header);
  mount("[data-mount=subnav]", subnav);
  mount("[data-mount=footer]", footer);
  document.querySelectorAll("[data-mount-sns]").forEach((ul) => { ul.innerHTML = SNS; });
  const obj = document.querySelector(".ky-footer__obj");
  if (obj) obj.innerHTML = window.kyCyclist();

  // Show current page menu
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(`.ky-nav-child a[href="${here}"]`).forEach((a) => a.setAttribute("aria-current", "page"));

  // Phone menu drawer — is-menu-open instead of the original is-sitemap-open
  const sw = document.querySelector(".ky-switch");
  const mq = matchMedia("(min-width: 800px)");
  const setMenu = (on) => {
    document.body.classList.toggle("is-menu-open", on);
    if (sw) sw.setAttribute("aria-expanded", String(on));
  };
  if (sw) sw.addEventListener("click", () => setMenu(!document.body.classList.contains("is-menu-open")));
  document.querySelectorAll(".ky-header__body a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  mq.addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  // Accordion — original js-accordion: 400ms var(--easing_easeOutCubic), other cells in the same list close
  document.querySelectorAll(".ky-acc").forEach((acc) => {
    const btn = acc.querySelector(":scope > .ky-nav__row, :scope > .ky-acc__btn");
    const body = acc.querySelector(":scope > .ky-acc__body");
    const inner = body && body.firstElementChild;
    if (!btn || !body || !inner) return;
    let t;
    const close = (el) => {
      const b = el.querySelector(":scope > .ky-acc__body");
      b.style.height = b.firstElementChild.clientHeight + "px";
      el.classList.remove("is-open");
      el.querySelector(":scope > button")?.setAttribute("aria-expanded", "false");
      requestAnimationFrame(() => requestAnimationFrame(() => { b.style.height = "0px"; }));
    };
    btn.addEventListener("click", () => {
      clearTimeout(t);
      if (acc.classList.contains("is-open")) { close(acc); return; }
      acc.parentElement.querySelectorAll(":scope > .ky-acc.is-open").forEach(close);
      body.style.height = inner.clientHeight + "px";
      acc.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      t = setTimeout(() => { body.style.height = "auto"; }, 400);
    });
  });

  // Banner fade — original Splide fade · speed 1000 · interval 4500 · cubic-bezier(.45,0,.55,1)
  if (window.Splide) {
    document.querySelectorAll(".ky-banner, .ky-footer__banner").forEach((el) => {
      new Splide(el, { type: "fade", rewind: true, autoplay: true, speed: 1000, interval: 4500, pauseOnHover: false, pauseOnFocus: false, drag: false, pagination: false, arrows: false, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }).mount();
    });
  }

  // Appear — original js-scrollTrigger (top 80%) · 2 (top bottom) · 3 (top 70%) · c-effect-hato (top 60%), once
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
    document.querySelectorAll(".ky-stagger, .ky-bounce").forEach((list) => {
      const step = list.classList.contains("ky-bounce") ? (list.dataset.step ? +list.dataset.step : 0.1) : (list.dataset.step ? +list.dataset.step : 0.1);
      [...list.children].forEach((c, i) => { c.style.transitionDelay = `${(i * step).toFixed(2)}s`; });
    });
    const shows = [[".ky-up, .ky-fade, .ky-left, .ky-stagger, .ky-bounce", "top 80%"], [".ky-hato", "top 60%"]];
    shows.forEach(([sel, start]) => document.querySelectorAll(sel).forEach((el) => {
      if (reduce) { el.classList.add("is-show"); return; }
      ScrollTrigger.create({ trigger: el, start: el.dataset.start || start, once: true, toggleClass: { targets: el, className: "is-show" } });
    }));

    // Text reveal — original js-splitText: letters opacity 0→1 in .8s, spread across 1.4s overall (power1.out) · js-splitText3: each letter .07s power4.out
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".ky-split").forEach((el) => {
        if (!window.SplitText) { el.classList.add("is-done"); return; }
        const split = SplitText.create(el, { type: "chars", charsClass: "char", aria: "hidden", tag: "span" });
        gsap.set(split.chars, { opacity: 0 });
        const each = el.dataset.each ? +el.dataset.each : null;
        gsap.to(split.chars, {
          opacity: 1,
          duration: 0.8,
          ease: el.dataset.ease || "power1.out",
          stagger: each != null ? { each } : { amount: 1.4 },
          scrollTrigger: { trigger: el, start: "top 65%" },
        });
      });
      // Sub-page title — original l-hero__title: letters x 20→0 · opacity 0→1 · .8s power4.out · starts after .5s with .075 stagger
      document.querySelectorAll(".ky-split-hero").forEach((el) => {
        if (!window.SplitText) { el.classList.add("is-split"); return; }
        const split = SplitText.create(el, { type: "chars", charsClass: "char", aria: "hidden", tag: "span" });
        gsap.set(split.chars, { opacity: 0, x: 20 });
        el.classList.add("is-split");
        gsap.to(split.chars, { opacity: 1, x: 0, duration: 0.8, delay: 0.5, ease: "power4.out", stagger: { each: 0.075 }, scrollTrigger: { trigger: el, start: "top 65%" } });
      });
    });

    // Anchor scroll — original ScrollTo .6s power2.inOut, offset by the header height (desktop 50 · phone 120)
    document.querySelectorAll('a[href^="#"]:not([href="#"]), a[href*=".html#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        const [path, hash] = href.split("#");
        if (path && path !== here) return;
        const target = document.getElementById(hash);
        if (!target || !window.ScrollToPlugin) return;
        e.preventDefault();
        gsap.to(window, { duration: 0.6, ease: "power2.inOut", scrollTo: { y: target, offsetY: mq.matches ? 50 : 120, autoKill: false } });
      });
    });
  }
})();
