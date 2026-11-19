// Shared across pages — header, menu drawer, footer, cookie bar, Lenis, parallax, phone photo zoom, page transition.
// Values are taken as is from the original bundle: Lenis lerp .12, menu panel x 10%→0 over 1.1s expo.out, curtain 0.3s, transition body 0.25s fade, first entry 0.3s.
(() => {
  const body = document.body;
  const navKey = body.dataset.nav || "";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth <= 767;

  const NAV = [
    ["home", "Home", "index.html"], ["about", "About", "about.html"], ["stay", "Stay", "about.html"], ["food", "Food", "about.html"],
    ["feel", "Feel", "about.html"], ["news", "News", "news.html"], ["faq", "FAQ", "#"], ["contact", "Contact", "#"],
  ];
  const cur = (k) => (k === navKey ? ' class="is-current"' : "");
  const items = NAV.map(([k, t, h]) => `<li${cur(k)}><a class="font-ext" href="${h}" data-hover="linethrough">${t}</a></li>`).join("");
  const ext = '<svg class="ky-ext" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" stroke-width="0.9"/></svg>';
  const logo = (cls = "") => `<span class="ky-logo ${cls}" data-label="Brand English wordmark + one line place name"><b>BRAND NAME</b><small>Place Name</small></span>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ky-head");
    head.innerHTML = `
      <div class="ky-head-abs"><div class="ky-head-abs__in">
        <div class="ky-head-abs__left"><a href="index.html" aria-label="Back to start">${logo()}</a></div>
        <div class="ky-head-abs__right">
          <ul class="ky-head-abs__list t-nav">${items}</ul>
          <div><a class="ky-dir font-ext t-nav" href="about.html#directions" data-hover="underline2"><svg viewBox="0 0 15 15" aria-hidden="true"><path d="M7.5 13.5s4-4.1 4-7.4a4 4 0 0 0-8 0c0 3.3 4 7.4 4 7.4Z" fill="none" stroke="currentColor" stroke-width="0.9"/><circle cx="7.5" cy="6" r="1.4" fill="none" stroke="currentColor" stroke-width="0.9"/></svg>Directions</a></div>
        </div>
      </div></div>
      <div class="ky-head-fix"><div class="ky-head-fix__in">
        <a class="ky-reserve ky-btn-white font-ext t-nav" href="#" data-hover="button"><span data-hover="button-text">Reserve</span></a>
        <a class="ky-tel" href="#" aria-label="Phone" data-hover="opacity"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.2 2.5 8.4 6 6.9 7.6c.9 2.2 3.1 4.4 5.5 5.5l1.6-1.5 3.5 2.2-1.2 3.1c-6.2.3-13.1-6.6-12.6-12.8l2.5-1.6Z" fill="none" stroke="currentColor" stroke-width="1"/></svg></a>
        <a class="ky-head-logo" href="index.html" aria-label="Back to start">${logo()}</a>
        <button class="ky-burger" type="button" aria-label="Menu" data-menu-open><span class="ky-burger__bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
      </div></div>`;
  }

  const nav = document.createElement("nav");
  nav.className = "ky-nav";
  nav.setAttribute("data-slot", "menu-drawer");
  nav.setAttribute("data-lenis-prevent", "");
  nav.innerHTML = `
    <div class="ky-nav__bg" data-menu-close aria-hidden="true"></div>
    <div class="ky-nav__head"><button class="ky-nav__close" type="button" aria-label="Close" data-menu-close><span class="ky-nav__x" aria-hidden="true"><i></i><i></i></span></button></div>
    <div class="ky-nav__panel">
      <div class="ky-nav__main">
        <ul class="ky-nav__list">${items}</ul>
        <div class="ky-nav__info">
          <div><p>Add a one-line notice here that there are two areas.</p><p><a class="ky-link" href="about.html#directions" data-hover="underline">Access / Check-in</a></p></div>
          <div>
            <dl><dt>Area name (sea)</dt><dd><a class="ky-link" href="#" data-hover="underline">Your one-line address here 00-00</a>${ext}</dd><dd>(Map code: 000 000 000*00)</dd></dl>
            <dl><dt>Area name (hill)</dt><dd><a class="ky-link" href="#" data-hover="underline">Your one-line address here 00-00</a>${ext}</dd><dd>(Map code: 000 000 000*00)</dd></dl>
          </div>
          <div><p>Tel. <a class="ky-link" href="#" data-hover="underline">0000-00-0000</a></p></div>
        </div>
        <div class="ky-nav__subrow">
          <ul class="ky-nav__sub font-ext"><li><a class="ky-link" href="#" data-hover="underline">Privacy policy</a>${ext}</li><li><a class="ky-link" href="#" data-hover="underline">Terms</a>${ext}</li></ul>
          <ul class="ky-lang font-ext"><li><a href="#" data-hover="linethrough">KO</a></li><li><a class="is-current" href="#" data-hover="linethrough">EN</a></li></ul>
        </div>
      </div>
      <div class="ky-nav__foot"><a class="ky-nav__reserve ky-btn-white font-ext" href="#" data-hover="button"><span data-hover="button-text">Reserve</span></a></div>
    </div>`;
  body.append(nav);

  const mres = document.createElement("a");
  mres.className = "ky-mobile-reserve ky-btn-white font-ext";
  mres.href = "#";
  mres.setAttribute("data-hover", "button");
  mres.innerHTML = '<span data-hover="button-text">Reserve</span>';
  body.append(mres);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ky-foot");
    foot.innerHTML = `
      <div class="ky-foot-banner" data-parallax-parent data-slot="reserve-banner">
        <div class="ky-ph ky-ph-par" data-parallax aria-hidden="true"><div class="wf-img" data-label="Lodging roof on a forest hill · clear daytime · wide landscape view toward the sea"></div></div>
        <div class="ky-foot-banner__in">
          <div class="ky-foot-banner__texts">
            <p class="ky-foot-banner__en font-ext" data-label="Booking prompt, English one line">Reserve a Stay</p>
            <p class="ky-foot-banner__ko">Your booking here</p>
          </div>
          <a class="ky-foot-banner__btn ky-btn-white font-ext" href="#" data-hover="button2"><span data-hover="button-text">Reserve</span></a>
        </div>
      </div>
      <div class="ky-foot__contents">
        <div class="ky-foot__top"><div class="ky-foot__top-in container">
          <ul class="ky-foot__nav">${items}</ul>
          <ul class="ky-lang ky-foot__lang font-ext"><li><a href="#" data-hover="linethrough">KO</a></li><li><a class="is-current" href="#" data-hover="linethrough">EN</a></li></ul>
        </div></div>
        <div class="ky-foot__center" id="directions"><div class="ky-foot__center-in container">
          <p class="ky-foot__heading font-ext">Directions</p>
          <div class="ky-foot__body">
            <div class="ky-foot__map" aria-hidden="true" data-label="Island location graphic · island enlarged in a circle with a line to a dot on the main island">${mapSvg()}</div>
            <ul class="ky-foot__list">
              <li><p>Your one-line note here that it is divided into two zones.</p><p>Add one more line on how many minutes it takes by car from the airport and where to check in.</p><p>For details, <a class="ky-link" href="#" data-hover="underline">Access / Check-in</a>Seen at.</p></li>
              <li>
                <div class="ky-foot__row"><b>Area name (sea)</b><div><a class="ky-link" href="#" data-hover="underline">Your address here, one line 0000-0</a>${ext}<p>(Map code: 000 000 000*00)</p></div></div>
                <div class="ky-foot__row"><b>Area name (hill)</b><div><a class="ky-link" href="#" data-hover="underline">Your address here, one line 0000-0</a>${ext}<p>(Map code: 000 000 000*00)</p></div></div>
                <div class="ky-foot__row"><b>Tel. <a class="ky-link" href="#" data-hover="underline">0000-00-0000</a></b><div>※ For press and business inquiries, <a class="ky-link" href="#" data-hover="underline">Inquiry</a>We will contact you via</div></div>
              </li>
              <li><div class="ky-foot__hours"><span>Check-in(00:00~)</span><span>Check-out(~00:00)</span></div></li>
            </ul>
          </div>
        </div></div>
        <div class="ky-foot__bottom"><div class="ky-foot__bottom-in container font-ext">
          <div><a class="ky-link" href="#" data-hover="underline">Instagram</a>${ext}</div>
          <div class="ky-foot__bottom-right">
            <ul><li><a class="ky-link" href="#" data-hover="underline">Careers</a>${ext}</li><li><a class="ky-link" href="#" data-hover="underline">Privacy policy</a>${ext}</li><li><a class="ky-link" href="#" data-hover="underline">Terms</a>${ext}</li></ul>
            <p><small>© BRAND NAME</small></p>
          </div>
        </div></div>
      </div>`;
  }

  const cookie = document.createElement("div");
  cookie.className = "ky-cookie";
  cookie.innerHTML = '<div class="ky-cookie__in"><p class="ky-cookie__text font-ext">We use cookies to improve your experience.</p><button class="ky-link font-ext" type="button" data-hover="underline">Accept</button></div>';
  // Original fades out on press with gsap defaults (.5s power1.out), then removes it from the document. If already loaded, it isn’t attached at all
  cookie.querySelector("button").addEventListener("click", () => {
    sessionStorage.setItem("ky-cookie", "1");
    gsap.to(cookie, { opacity: 0, duration: reduce ? 0 : 0.5, onComplete: () => cookie.remove() });
  }, { once: true });
  if (sessionStorage.getItem("ky-cookie") !== "1") body.append(cookie);

  // Island location drawing — redraws the original map illustration with the same composition (magnified circle + main island on the right + connecting line)
  function mapSvg() {
    const dots = [];
    let s = 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 140; i++) {
      const a = rnd() * Math.PI * 2, r = 46 + rnd() * 26;
      dots.push(`<circle cx="${(165 + Math.cos(a) * r * 0.82).toFixed(1)}" cy="${(108 + Math.sin(a) * r).toFixed(1)}" r="0.7"/>`);
    }
    return `<svg viewBox="0 0 531 425" fill="none" stroke="currentColor" stroke-width="0.7">
      <circle cx="165" cy="165" r="164" stroke-opacity="0.55"/>
      <path d="M110 70c20-30 70-40 100-20 25 18 30 60 15 95-14 30-50 40-80 30-30-10-55-60-35-105Z"/>
      <g fill="currentColor" stroke="none" opacity="0.7">${dots.join("")}</g>
      <path d="M180 180 150 290M188 182 158 292"/>
      <path d="M100 300c30-8 60-10 90-2l5 30H95Z"/>
      <path d="M300 80 446 287M150 328 432 300" stroke-opacity="0.55"/>
      <path d="M440 280c20-15 30-35 50-50 8 10 2 30-10 45-12 18-20 40-35 60-10 14-20 30-35 40-6-12 5-30 15-45 6-12 12-30 15-50Z"/>
      <circle cx="446" cy="287" r="4"/>
      <g fill="currentColor" stroke="none" font-size="12" font-family="inherit">
        <text x="130" y="112">Island Name</text><text x="78" y="178">(sea)</text><text x="114" y="212">(hill)</text>
        <text x="200" y="236">Bridge Name</text><text x="430" y="240">Region</text><text x="265" y="372">Airport Name</text>
      </g>
    </svg>`;
  }

  // ── Lenis — original 1.0.42, lerp .12 ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }
  window.kySite = { lenis };
  const scrollY_ = () => (lenis ? lenis.animatedScroll : window.scrollY);

  // ── Parallax — progress (0~1) while the parent is on screen. default: (inner height−parent height)×.5×(p−.5)×2, fixed-top: inner height×value×p ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const items = [...document.querySelectorAll("[data-parallax]")].map((el) => {
      const parent = el.closest("[data-parallax-parent]");
      return parent && { el, parent, type: el.dataset.parallax || "default", value: +(el.dataset.parallaxValue ?? 1), start: 0, end: 0, amount: 0 };
    }).filter(Boolean);
    const measure = () => {
      const vh = innerHeight, sy = scrollY_();
      items.forEach((it) => {
        const top = it.parent.getBoundingClientRect().top + sy;
        it.start = Math.max(top - vh, 0);
        it.end = it.start + vh + it.parent.offsetHeight;
        it.amount = it.type === "fixed-top" ? it.el.offsetHeight * it.value : (it.el.offsetHeight - it.parent.offsetHeight) * 0.5 * it.value;
      });
    };
    const tick = () => {
      const y = scrollY_();
      items.forEach((it) => {
        if (y < it.start || y > it.end) return;
        const p = Math.min(1, Math.max(0, (y - it.start) / (it.end - it.start || 1)));
        const v = it.type === "fixed-top" ? it.amount * p : it.amount * (p - 0.5) * 2;
        it.el.style.transform = `translateY(${v.toFixed(2)}px)`;
      });
    };
    measure(); tick();
    const ro = new ResizeObserver(() => { measure(); tick(); });
    ro.observe(document.body);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); items.forEach((it) => (it.el.style.transform = "")); };
  });

  // ── On phones only, the photo settles from 1.125x to 1 (2s quart.out) ──
  mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const inner = e.target.querySelector("[data-inview-scale-inner]");
      if (inner) gsap.to(inner, { scale: 1, duration: 2, ease: "quart.out" });
    }));
    document.querySelectorAll("[data-inview-scale]").forEach((el) => {
      const inner = el.querySelector("[data-inview-scale-inner]");
      if (inner) gsap.set(inner, { scale: 1.125 });
      io.observe(el);
    });
    return () => io.disconnect();
  });

  // ── Menu Drawer ──
  const panel = nav.querySelector(".ky-nav__panel");
  const fixBtns = [...document.querySelectorAll(".ky-head-fix .ky-reserve, .ky-head-fix .ky-burger")];
  let opened = false;
  // The plate is always pushed 10% when closed (the original sets it in the init close) — opening only goes from there to 0
  gsap.set(panel, { x: "10%", rotate: 0.001 });
  // The original sets up the panel in rAF after the press (open) and attaches motion in the following rAFs — matched to the start delay measured on the original (about 150ms)
  const openMenu = () => {
    if (opened) return;
    opened = true;
    requestAnimationFrame(() => {
      if (!opened) return;
      lenis?.stop();
      body.classList.add("is-menu-opened");
      gsap.killTweensOf([nav, panel]);
      nav.style.display = "block";
      panel.scrollTop = 0;
      if (reduce) { gsap.set(nav, { opacity: 1 }); gsap.set(panel, { x: 0 }); return; }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!opened) return;
        gsap.to(nav, { opacity: 1, duration: 0.3, ease: "none" });
        gsap.to(fixBtns, { opacity: 0, duration: 0.3 });
        gsap.to(panel, { x: 0, rotate: 0.001, duration: 1.1, ease: "expo.out" });
      }));
    });
  };
  const closeMenu = () => {
    if (!opened) return;
    opened = false;
    lenis?.start();
    body.classList.remove("is-menu-opened");
    gsap.killTweensOf([nav, panel]);
    gsap.to(fixBtns, { opacity: 1, duration: reduce ? 0 : 0.3 });
    gsap.to(nav, { opacity: 0, duration: reduce ? 0 : 0.3, onComplete: () => { nav.style.display = "none"; gsap.set(panel, { x: "10%", rotate: 0.001 }); } });
  };
  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", openMenu));
  nav.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", closeMenu));
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // ── Phone: on the photo-header page the header turns opaque after 30px of scroll, and the bottom booking button hides when it reaches the booking strip ──
  const banner = document.querySelector(".ky-foot-banner");
  const onScroll = () => {
    const y = window.scrollY;
    head?.classList.toggle("is-scrolled", y > 30);
    if (banner && getComputedStyle(banner).display !== "none") {
      const pos = banner.getBoundingClientRect().top + y - innerHeight;
      mres.classList.toggle("is-hidden", y >= pos);
    } else mres.classList.toggle("is-hidden", y + innerHeight >= document.documentElement.scrollHeight - 80);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Page transition — on leave the body clears over 0.25s, on enter it turns on over 0.25s. The first entrance is a 0.3s linear ──
  // The original hides the board until all photos are loaded and then turns it on. The copy has no photos to load, so it waits for fonts and load.
  const came = sessionStorage.getItem("ky-nav") === "1";
  sessionStorage.removeItem("ky-nav");
  window.kySite.came = came;
  // First entry hides only the original #App (header and body) area — the entrance door and cookie bar are outside #App so they show from the start. In-site navigation swaps the whole body
  if (!reduce) {
    const app = came ? [body] : [...document.querySelectorAll("body > header, body > main, body > .ky-topnews")];
    gsap.set(app, { opacity: 0 });
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
    Promise.all([loaded, document.fonts ? document.fonts.ready : null]).then(() => requestAnimationFrame(() => {
      gsap.to(app, came ? { opacity: 1, duration: 0.25 } : { opacity: 1, duration: 0.3, ease: "none" });
    }));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    closeMenu();
    sessionStorage.setItem("ky-nav", "1");
    if (reduce) { location.href = url.href; return; }
    gsap.to(body, { opacity: 0, duration: 0.25, onComplete: () => (location.href = url.href) });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(body, { opacity: 1 }); });
})();
