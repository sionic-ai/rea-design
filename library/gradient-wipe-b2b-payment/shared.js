// All pages use the same header line, drawer, vertical menu, floating banner and footer, drawn once here — pages <main> Keeps only that.
// Motion slots: rise on view (bottom 20% line of screen, once) · Hero lift-in (.01% line, every time) · parallax (.3, opposite direction) · vertical menu on/off ·
// Legacy sub-page entrance and footer entrance · FAQ and picker panel open/close (sine.inOut, same as jQuery 300ms swing)
(() => {
  const body = document.body;
  const page = body.dataset.nav || "";
  const old = body.classList.contains("np-old");
  const home = page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const NAV = [
    ["service", "service.html", "Menu First"],
    ["price", "service.html#price", "Price"],
    ["function", "service.html#function", "Function"],
    ["merit", "index.html#about", "Strength"],
    ["works", "works.html", "Case study"],
    ["faq", "faq.html", "Frequently asked questions"],
  ];
  const navList = () => `<ul class="np-nav__list">${NAV.map(([k, href, t]) => `<li class="np-nav__item${k === page ? " is-current" : ""}"><a href="${href}">${t}</a></li>`).join("")}</ul>`;
  const ICON_DL = '<svg viewBox="0 0 17 17" aria-hidden="true"><path d="M8.5 1v10M4 7l4.5 4.5L13 7M1.5 15.5h14" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const ICON_TALK = '<svg viewBox="0 0 17 17" aria-hidden="true"><path d="M1.5 2.5h14v9h-8l-4 3v-3h-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const navBox = () => `<div class="np-nav__box"><a href="index.html#cta" class="np-nav__btn np-nav__btn--dl">${ICON_DL}Download materials</a><a href="faq.html" class="np-nav__btn np-nav__btn--contact">${ICON_TALK}Contact Us</a></div>`;
  const kind = (side) => `<div class="np-kind${side ? " np-kind--side is-out" : ""}"><a href="index.html" class="np-kind__item is-current">Selling company</a><a href="index.html" class="np-kind__item">Buyer company</a></div>`;
  const logo = (cls = "", sub = "") => `<span class="np-logo ${cls}" data-label="Brand logo — one-line slogan + ring mark + English service name"><span class="np-logo__tag">Your one-line slogan sits here.</span><span class="np-logo__row"><span class="np-logo__mark"></span><span class="np-logo__word">Service</span></span>${sub}</span>`;

  const head = `
<header class="np-head" data-slot="header" data-fx="updown-header">
  <a class="np-head__logo" href="index.html" aria-label="First Page">${logo()}</a>
  <nav class="np-nav" aria-label="Main menu">${navList()}${navBox()}</nav>
</header>
<div class="np-drawer" id="np-drawer" data-slot="menu-drawer" aria-hidden="true">
  <div class="np-drawer__inner">
    <a class="np-drawer__logo" href="index.html">${logo()}</a>
    ${navList()}${navBox()}${kind(false)}
  </div>
</div>
<button class="np-burger" type="button" aria-label="Open Menu" aria-controls="np-drawer" aria-expanded="false" data-fx="updown-header" data-fx-updown-header="look: side"><span class="np-burger__line"></span><span class="np-burger__line"></span><span class="np-burger__line"></span></button>
${kind(true)}`;

  const FOOT_ICONS = [
    '<svg viewBox="0 0 78 78" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M14 64c8 6 26 7 38 0l12-9c3-2 1-6-3-5l-12 5H38"/><path d="M8 58l8-6c5-3 12-4 18-1h10c3 0 3 5 0 5H33"/><rect x="26" y="30" width="7" height="16"/><rect x="38" y="22" width="7" height="24"/><rect x="50" y="14" width="7" height="32"/><path d="M22 26l14-12 8 6 16-14M52 6h8v8"/></svg>',
    '<svg viewBox="0 0 96 78" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 22h50v32H24l-12 10V54H4z"/><path d="M12 32h30M12 40h22M12 47h16"/><circle cx="68" cy="24" r="20"/><path d="M62 18c0-4 3-6 6-6s6 2 6 6c0 5-6 5-6 10M68 33v2"/><path d="M58 42l-6 8 10-4"/></svg>',
    '<svg viewBox="0 0 78 78" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="39" cy="39" r="36"/><path d="M27 22l12 16 12-16M39 38v20M29 41h20M29 49h20"/></svg>',
  ];
  const FOOT_ITEMS = [
    ["If you adopt<br>What will it look like?", "Get free materials"],
    ["Our Company’s<br>Will it fit your workflow?", "Contact Us"],
    ["So how much is it in total?", "View price list"],
  ];
  const foot = `
<footer class="np-foot" data-slot="footer">
  <div class="np-foot__head"><div class="np-foot__head-wrap"><div class="np-foot__catch"><p class="np-foot__catch-text">Your one line inviting consultation here,<br>First, feel free to ask ‹Service›.</p></div></div></div>
  <div class="np-foot__box">
    <div class="np-foot__box-wrap">
      <div class="np-foot__list">
        ${FOOT_ITEMS.map(([t, b], i) => `<div class="np-foot__item"><div class="np-foot__item-inner"><div class="np-foot__item-wrap"><span class="np-foot__icon">${FOOT_ICONS[i]}</span><p class="np-foot__item-title">${t}</p></div><a class="np-foot__item-btn" href="${i === 2 ? "service.html#price" : "faq.html"}">${b}</a></div></div>`).join("")}
      </div>
      <div class="np-foot__grade"></div>
    </div>
  </div>
  <div class="np-foot__nav">
    <div class="np-foot__nav-wrap">
      <dl class="np-foot__nav-data">
        <dt class="np-foot__nav-title">${logo("np-logo--white", '<span class="np-logo__sub">B2B payment processing service</span>')}</dt>
        <dd class="np-foot__nav-txt"><a href="#">Member terms</a><br><a href="#">Terms of service</a><br><a href="#" class="np-ext">Operating company (Company name)</a><br><a href="#" class="np-ext">Privacy policy</a></dd>
      </dl>
      <div class="np-foot__nav-box">
        <div class="np-foot__nav-inner np-foot__nav-inner--single"><ul class="np-foot__nav-list">
          <li><a href="service.html">Menu First</a></li><li><a href="service.html#function">Function</a></li><li><a href="service.html#price">Price</a></li><li><a href="index.html#howto">How to use</a></li><li><a href="#">Connectable API</a></li><li><a href="service.html">Credit payment field</a></li><li><a href="faq.html">Seller Company FAQ</a></li>
        </ul></div>
        <div class="np-foot__nav-inner np-foot__nav-inner--double"><ul class="np-foot__nav-list">
          <li><a href="index.html#about">Strengths · Benefits</a></li><li><a href="works.html">Case study</a></li><li><a href="news.html">News</a></li><li><a href="#">Help article</a></li><li><a href="#">Help resources list</a></li>
        </ul><ul class="np-foot__nav-list">
          <li><a href="index.html">Buyer company</a></li><li><a href="#" class="np-ext">Log in</a></li><li><a href="faq.html" class="np-ext">Business buyer FAQ</a></li>
        </ul></div>
      </div>
    </div>
    <div class="np-foot__nav-txt np-foot__nav-txt--sp"><a href="#">Member terms</a><br><a href="#">Terms of service</a><br><a href="#" class="np-ext">Operating company (Company name)</a><br><a href="#" class="np-ext">Privacy policy</a></div>
  </div>
  <div class="np-foot__bottom"><div class="np-foot__bottom-inner">
    <p class="np-foot__copy">Copyright © Company Name, Inc. All Rights Reserved.</p>
    <div class="np-foot__badges" data-label="Three certification marks — privacy, information security, payment security"><span class="np-foot__badge">Verification<br>Mark 1</span><span class="np-foot__badge">Certification mark 2</span><span class="np-foot__badge">Verification<br>Mark 3</span></div>
  </div></div>
</footer>
<aside class="np-side-cta" data-slot="side-cta">
  <button class="np-side-cta__close" type="button" aria-label="Close banner"></button>
  <a class="np-side-cta__card" href="index.html#cta">
    <span class="np-side-cta__title">Service’s<br>3 resources containing everything</span>
    <svg class="np-side-cta__docs" viewBox="0 0 172 68" aria-hidden="true" data-label="Graphic of three resource covers overlapping at an angle">
      <g transform="rotate(-6 30 40)"><rect x="4" y="18" width="56" height="40" rx="2" style="fill: var(--kf-accent-text)"/><rect x="10" y="26" width="32" height="3" style="fill: var(--kf-on-accent)"/></g>
      <rect x="60" y="4" width="54" height="38" rx="2" style="fill: var(--kf-bg); stroke: var(--site-pale-2)"/><rect x="72" y="18" width="30" height="4" style="fill: var(--kf-accent)"/>
      <g transform="rotate(5 140 40)"><rect x="116" y="16" width="52" height="40" rx="2" style="fill: var(--site-cyan)"/><rect x="122" y="24" width="28" height="3" style="fill: var(--kf-on-accent)"/></g>
    </svg>
    <span class="np-side-cta__btn">Download materials</span>
  </a>
</aside>`;

  const main = document.querySelector("main");
  main.insertAdjacentHTML("beforebegin", head);
  main.insertAdjacentHTML("afterend", foot);

  // Logo mark: a ribbon of two interlocked rings — colors from the logo gradient (sky → purple → pink)
  let gid = 0;
  document.querySelectorAll(".np-logo__mark").forEach((m) => {
    const id = `np-logo-g${++gid}`;
    m.innerHTML = `<svg viewBox="0 0 62 40" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color: var(--site-logo-a)"/><stop offset=".8" style="stop-color: var(--site-logo-b)"/><stop offset="1" style="stop-color: var(--site-logo-c)"/></linearGradient></defs><g fill="none" stroke="url(#${id})" stroke-width="1.6"><ellipse cx="24" cy="24" rx="21" ry="9" transform="rotate(-14 24 24)"/><ellipse cx="38" cy="18" rx="9" ry="17" transform="rotate(38 38 18)"/><path d="M6 30c10 6 30 4 42-8"/></g></svg>`;
  });

  // Burger — while open, pins the document in place (locks the original body top)
  const burger = document.querySelector(".np-burger"), drawer = document.querySelector(".np-drawer");
  let keep = 0;
  burger.addEventListener("click", () => {
    const open = !burger.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    drawer.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    drawer.setAttribute("aria-hidden", String(!open));
    if (open) { keep = scrollY; Object.assign(body.style, { position: "fixed", top: `${-keep}px`, width: "100%" }); }
    else { Object.assign(body.style, { position: "", top: "", width: "" }); scrollTo(0, keep); }
  });

  document.querySelector(".np-side-cta__close").addEventListener("click", () => document.querySelector(".np-side-cta").classList.add("is-closed"));

  // Right vertical menu — on the first page it shows from the start, on subpages it turns on after scrolling 2/3 of the screen, and turns off 500px before the footer
  const side = document.querySelector(".np-kind--side");
  const footEl = document.querySelector(".np-foot");
  let vh = innerHeight, footTop = 0, sideBusy = false;
  const measure = () => { vh = innerHeight; footTop = footEl.getBoundingClientRect().top + scrollY - 500; };
  const sideCheck = () => {
    sideBusy = false;
    const y = scrollY, on = (home || y > (vh * 2) / 3) && y <= footTop;
    side.classList.toggle("is-in", on);
    side.classList.toggle("is-out", !on);
  };
  // The old board starts with the vertical menu on (3.8s late) and follows the rule from the first scroll
  let waiting = old;
  if (old) { side.classList.add("is-wait", "is-in"); side.classList.remove("is-out"); }
  addEventListener("scroll", () => { waiting = false; side.classList.remove("is-wait"); if (!sideBusy) { sideBusy = true; requestAnimationFrame(sideCheck); } }, { passive: true });
  addEventListener("resize", () => { measure(); if (!waiting) sideCheck(); });
  new ResizeObserver(() => { measure(); if (!waiting) sideCheck(); }).observe(body);
  measure(); if (!waiting) sideCheck();

  // Open and close — Q&A (.3s), picker plate (.3s / phone .4s). jQuery animate swing is the same as sine.inOut
  const toggleBox = (box, open, dur) => {
    if (!box) return;
    gsap.killTweensOf(box);
    if (reduce) { box.hidden = !open; return; }
    if (open) {
      box.hidden = false;
      gsap.fromTo(box, { height: 0, opacity: 0, overflow: "hidden" }, { height: "auto", opacity: 1, duration: dur, ease: "sine.inOut", clearProps: "height,overflow" });
    } else {
      gsap.to(box, { height: 0, opacity: 0, overflow: "hidden", duration: dur, ease: "sine.inOut", onComplete: () => { box.hidden = true; gsap.set(box, { clearProps: "height,opacity,overflow" }); } });
    }
  };
  window.npToggle = toggleBox;
  document.querySelectorAll("[data-np-acc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      toggleBox(btn.nextElementSibling, open, 0.3);
    });
  });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const rises = [...document.querySelectorAll(".np-rise, [data-np-in]")];
    if (ctx.conditions.still) {
      rises.forEach((el) => el.classList.add("is-in"));
      document.querySelectorAll("[data-np-first], [data-np-show], .np-old .np-foot__head, .np-old .np-foot__nav-data, .np-old .np-foot__nav-box, .np-old .np-foot__bottom-inner, .np-old .np-foot__box").forEach((el) => el.classList.add("is-in"));
      document.querySelector(".np-page")?.classList.remove("is-wait");
      return;
    }
    // Float up when visible — once, when it reaches the line 20% above the bottom of the screen (original js-trigger)
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    rises.forEach((el) => io.observe(el));
    // Hero: turns on when entering and off when leaving (original js-trigger-firstview)
    const first = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)), { rootMargin: "0px 0px -0.01% 0px", threshold: 0 });
    document.querySelectorAll("[data-np-first]").forEach((el) => first.observe(el));

    // Parallax — while the cell passes from the bottom to the top of the screen, it moves (2p − 1) × screen height × .25 × speed in the opposite direction (original js-parallax default .3)
    const pars = [...document.querySelectorAll("[data-np-parallax]")];
    const seen = new Set();
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (!seen.size) return;
      const h = innerHeight;
      seen.forEach((el) => {
        const r = el.getBoundingClientRect();
        let p = (h - r.top) / (h + r.height);
        p = 2 * Math.max(0, Math.min(1, p)) - 1;
        const speed = parseFloat(el.dataset.npParallax) || 0.3;
        el.style.transform = `translate3d(0, ${(-p * 0.25 * h * speed).toFixed(2)}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    const pio = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      if (seen.size && !raf) raf = requestAnimationFrame(tick);
    }, { threshold: [0, 1] });
    pars.forEach((el) => pio.observe(el));

    // Old panel — the panel turns on when the document is ready, and footer pieces turn on once they rise 200px above the screen bottom (0px for the bottom row)
    let footOff = null;
    if (old) {
      requestAnimationFrame(() => document.querySelector(".np-page")?.classList.remove("is-wait"));
      const parts = [[".np-foot__head", 200], [".np-foot__box", 200], [".np-foot__nav-data", 200], [".np-foot__nav-box", 200], [".np-foot__bottom-inner", 0]].map(([s, t]) => [document.querySelector(s), t])
        .concat([...document.querySelectorAll("[data-np-show]")].map((el) => [el, +el.dataset.npShow || 0]));
      const check = () => parts.forEach(([el, t]) => { if (el && el.getBoundingClientRect().top - (innerHeight - t) < 0) el.classList.add("is-in"); });
      addEventListener("scroll", check, { passive: true });
      addEventListener("load", check);
      check();
      footOff = () => removeEventListener("scroll", check);
    }
    return () => { io.disconnect(); first.disconnect(); pio.disconnect(); cancelAnimationFrame(raf); pars.forEach((el) => (el.style.transform = "")); footOff?.(); };
  });
})();
