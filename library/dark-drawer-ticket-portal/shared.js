// Shared by all pages: draws in sidebar (bottom band on phone)·three drawers·blur curtain·bottom band·footer, and sets up smooth scroll·entrance·sidebar push-up·page transition.
// Original libraries kept as is: page transitions barba 2.10.0 · smooth scroll Lenis 1.0.18 · drawer scroll SimpleBar 5.3.6 · slider slick 1.6.0(index.js).
// Original values: drawer content — after other drawers go out in .2s, .8s power2.out · close rests .5s then .2s fade · phone drag 1/2 vertical · 1/7 horizontal, closes when pulled down past 45px ·
// Transition: body fades out over .5s, next page after 300ms.
(() => {
  document.documentElement.classList.add("dg-js");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMQ = matchMedia("(max-width: 780px)");
  const DG = (window.DG = { reduced, lenis: null, special: null, pauseHero: null });

  const svg = (d, vb = "0 0 24 24", extra = "") => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const I = (DG.icons = {
    search: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'),
    close: svg('<path d="m4 4 16 16M20 4 4 20"/>', "0 0 24 24", 'stroke-width="1.8"'),
    arrowUR: svg('<path d="M3 9 9 3M4 3h5v5"/>', "0 0 12 12", 'stroke-width="1.4"'),
    chevR: svg('<path d="m4 2 4 4-4 4"/>', "0 0 12 12", 'stroke-width="1.4"'),
    chevU: svg('<path d="m2 8 4-4 4 4"/>', "0 0 12 12", 'stroke-width="1.4"'),
    arrowL: svg('<path d="M10 6H2M5 3 2 6l3 3"/>', "0 0 12 12", 'stroke-width="1.4"'),
    arrowR: svg('<path d="M2 6h8M7 3l3 3-3 3"/>', "0 0 12 12", 'stroke-width="1.4"'),
    back: svg('<path d="M8 9H15a4 4 0 0 1 0 8h-4M8 9l3-3M8 9l3 3"/>'),
    calendar: svg('<rect x="3" y="5" width="18" height="15" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    ticket: svg('<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M9 7v10" stroke-dasharray="1.5 1.5"/>'),
    person: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 21v-2.5A4.5 4.5 0 0 1 9 14h6a4.5 4.5 0 0 1 4.5 4.5V21"/>'),
    week: svg('<circle cx="12" cy="12" r="9"/><path d="M8 10.5h8M8 13.5h8" stroke-width="1"/>'),
    news: svg('<path d="M4 7h13l3 5-3 5H4z"/><path d="M7.5 12h6" stroke-width="1"/>'),
    faq: svg('<rect x="3" y="3" width="11" height="9" rx="1.5"/><rect x="10" y="10" width="11" height="9" rx="1.5"/><path d="M6.5 6.5h4M13.5 14.5h4"/>'),
    pin: svg('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
    sns1: svg('<path d="m6 6 12 12M18 6 6 18"/>', "0 0 24 24", 'stroke-width="2.4"'),
    sns2: svg('<circle cx="12" cy="12" r="7"/><path d="M12 9v8M10 12h4" stroke-width="2"/>', "0 0 24 24", 'stroke-width="2"'),
    sns3: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3.5" fill="currentColor"/><path d="m10 9.5 4.5 2.5-4.5 2.5z" style="fill: var(--kf-contrast-ink)"/></svg>',
  });

  const mark = '<span class="dg-mark"><b>W</b>ORD <b>M</b>ARK</span>';
  const sns = `<a href="#" aria-label="SNS 1">${I.sns1}</a><a href="#" aria-label="SNS 2">${I.sns2}</a><a href="#" aria-label="SNS 3">${I.sns3}</a>`;
  const ext = I.arrowUR;

  const menuRows = [
    ["Find Performances", [["Artist · event list"], ["New show"], ["Performance Calendar"], ["This week’s release show"], ["Same-day ticket info"], ["Past performances"]]],
    ["Help", [["Venue List"], ["Frequently asked questions"]]],
    ["News", [["News List", "article.html"]]],
    ["Magazine", [["Web magazine", "#", 1], ["Free magazine", "#", 1]]],
    ["For companies · schools", [["Event sponsorship info"], ["Ad placement info"], ["Venue partnership info", "service.html"], ["School festival Contact"], ["Group sales information"], ["Group visit information"]]],
    ["Other Info", [["No unauthorized resale notice"], ["Resale report form"]]],
    ["Site Guide", [["Transaction Display"], ["Privacy policy"], ["About this site", "terms.html"], ["Sitemap"]]],
    ["Company info", [["Company Home", "#", 1], ["Company overview", "#", 1], ["Hiring guide", "#", 1]]],
  ];

  const side = document.createElement("aside");
  side.className = "dg-side";
  side.dataset.slot = "side-nav";
  side.innerHTML = `
    <a class="dg-logo" href="index.html" aria-label="Home">${mark}</a>
    <div class="dg-head-sns">${sns}</div>
    <a class="dg-back" href="index.html" data-back hidden><i>${I.back}</i>Back</a>
    <nav class="dg-navi" aria-label="Main menu">
      <div class="dg-navi__bar">
        <a href="#" class="dg-gnav dg-search-btn" data-target="program"><span class="dg-search-btn__in">${I.search}<span class="dg-gnav__label">Find Performances</span></span></a>
        <a href="index.html" class="dg-gnav dg-navi__btn" data-icon="home"><i class="dg-navi__icon"></i><span class="dg-gnav__label">Home</span></a>
        <i class="dg-navi__border"></i>
        <a href="#" class="dg-gnav dg-navi__btn" data-icon="help" data-target="help"><i class="dg-navi__icon"></i><span class="dg-gnav__label">Help</span></a>
        <i class="dg-navi__border"></i>
        <a href="#" class="dg-gnav dg-navi__btn" data-icon="menu" data-target="menu"><i class="dg-navi__icon"></i><span class="dg-gnav__label">Menu</span></a>
        <div class="dg-sns">${sns}</div>
      </div>
      <div class="dg-drawers" data-slot="nav-drawer" data-lenis-prevent>
        <button class="dg-drawer__close" type="button" aria-label="Close">${I.close}</button>
        <section class="dg-drawer dg-drawer--program" data-target="program">
          <h3 class="dg-drawer__title">Find Performances</h3>
          <div class="dg-drawer__scroll" data-simplebar>
            <label class="dg-input">${I.search}<input type="search" placeholder="Enter the artist, show and venue names"></label>
            <div class="dg-tiles">
              <a href="#" class="dg-tile" data-tone="calendar">${I.calendar}Performance Calendar</a>
              <a href="#" class="dg-tile" data-tone="ticket">${I.ticket}Same-day ticket info</a>
              <a href="#" class="dg-tile" data-tone="artist">${I.person}<span>Artist·<br>Event list</span></a>
              <a href="#" class="dg-tile" data-tone="week">${I.week}This week’s releases</a>
              <a href="#" class="dg-tile" data-tone="new">${I.news}New show</a>
            </div>
            <div class="dg-drawer__foot"><a href="#">Past performances</a><a href="#" class="dg-detail-btn" data-target="detail">Performance details<br>Find</a></div>
          </div>
        </section>
        <section class="dg-drawer dg-drawer--help" data-target="help">
          <h3 class="dg-drawer__title">Help</h3>
          <div class="dg-drawer__scroll" data-simplebar>
            <a href="#" class="dg-tile" data-tone="faq">${I.faq}Frequently asked questions</a>
            <div class="dg-tags"><a href="#">How to buy tickets</a><a href="#">Table After Purchase</a><a href="#">About the Performance</a><a href="#">Wheelchair access and accommodation info</a><a href="#">Flowers · Gifts</a><a href="#">Others</a></div>
            <span class="dg-help-label">Find FAQs by keyword</span>
            <label class="dg-input">${I.search}<input type="search" placeholder="Enter the word you want to look up"></label>
            <a href="#" class="dg-tile" data-tone="venue">${I.pin}Venue List</a>
          </div>
        </section>
        <section class="dg-drawer dg-drawer--menu" data-target="menu">
          <h3 class="dg-drawer__title">Menu</h3>
          <div class="dg-drawer__scroll" data-simplebar>
            <div class="dg-menu-list">
              ${menuRows.map(([h, links]) => `<div class="dg-menu-row"><h3>${h}</h3><ul>${links.map(([t, href = "#", out]) => `<li><a href="${href}"${out ? ' target="_blank"' : ""}>${t}${out ? ext : ""}</a></li>`).join("")}</ul></div>`).join("")}
            </div>
          </div>
        </section>
        <section class="dg-drawer dg-drawer--detail" data-target="detail">
          <h3 class="dg-drawer__title">Search performances in detail</h3>
          <div class="dg-drawer__scroll" data-simplebar>
            <form class="dg-detail" onsubmit="return false">
              <div class="dg-detail__group"><span>Search by artist or show name</span><label class="dg-input">${I.search}<input type="search" placeholder="Name goes here"></label></div>
              <div class="dg-detail__group"><span>Find by performance date</span><div class="dg-detail__date"><input inputmode="numeric" placeholder="0000" aria-label="Year"><span>Year</span><input inputmode="numeric" placeholder="00" aria-label="Month"><span>Month</span><input inputmode="numeric" placeholder="00" aria-label="Day"><span>Day</span></div></div>
              <div class="dg-detail__group"><span>Find by Venue</span><label class="dg-input">${I.search}<input type="search" placeholder="Enter the venue name"></label></div>
              <a href="#" class="dg-detail__clear">${I.close}Clear input</a>
              <a href="#" class="dg-detail__go">Find</a>
            </form>
          </div>
        </section>
      </div>
    </nav>`;
  document.body.prepend(side);
  const veil = document.createElement("div");
  veil.className = "dg-veil";
  side.after(veil);
  const back = side.querySelector(".dg-back");

  // The footer stays outside the page transition — only the breadcrumb in the bottom band changes per page
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("dg-foot-wrap");
    foot.innerHTML = `
      <div class="dg-crumbs" data-extrude>
        <ol></ol>
        <a class="dg-totop" href="#top">TOP<i>${I.chevU}</i></a>
      </div>
      <div class="dg-foot">
        <a class="dg-foot__logo" href="index.html" aria-label="Home">${mark}</a>
        <div class="dg-foot__row">
          <nav class="dg-foot__links"><a href="#">Transaction Display</a><a href="#">Privacy policy</a><a href="terms.html">About this site</a><a href="#">Sitemap</a><a href="#" target="_blank">Company Overview${ext}</a></nav>
          <small data-label="Company English name · one line noting the brand name is a registered trademark · copyright line">COMPANY inc. BRAND NAME and BRAND are registered trademarks of COMPANY.<br>Copyright 0000 COMPANY inc. All Rights Reserved.</small>
        </div>
      </div>`;
  }
  const crumbs = foot?.querySelector(".dg-crumbs");
  const setCrumb = (name) => {
    if (!crumbs) return;
    crumbs.classList.toggle("is-home", !name);
    crumbs.querySelector("ol").innerHTML = `<li><a href="index.html">TOP</a></li>${name ? `<li>${name}</li>` : ""}`;
  };

  // ── Smooth scroll: original new Lenis({ syncTouch, overscroll, smoothTouch:false, vertical, touchInertiaMultiplier 22, normalizeWheel:false }) with rAF ──
  const LenisC = window.Lenis || window.lenis;
  if (!reduced && LenisC) {
    const lenis = (DG.lenis = new LenisC({ syncTouch: true, overscroll: true, smoothTouch: false, gestureOrientation: "vertical", touchInertiaMultiplier: 22, normalizeWheel: false }));
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const lock = (on) => {
    document.documentElement.style.overflowY = on ? "hidden" : "";
    document.body.style.overflowY = on ? "hidden" : "";
  };
  const toTop = () => { DG.lenis ? DG.lenis.scrollTo(0, { immediate: true, force: true }) : 0; window.scrollTo(0, 0); };

  // ── Sidebar push-up: when the first [data-extrude] strip rises, the sidebar (including logo and back button) stops above it ──
  let extrude = null;
  const navi = side.querySelector(".dg-navi");
  let push = 0;
  const pushUp = () => {
    if (mobileMQ.matches || !extrude) { push = 0; side.style.transform = ""; return; }
    const top = extrude.getBoundingClientRect().top - parseFloat(getComputedStyle(extrude).marginTop);
    const bottom = 24 + 16 + 20 + navi.offsetHeight;
    push = Math.max(Math.min(top - bottom, 0), -scrollY);
    side.style.transform = push ? `translate3d(0,${push}px,0)` : "";
  };
  addEventListener("scroll", pushUp, { passive: true });
  addEventListener("resize", pushUp);
  DG.lenis?.on("scroll", pushUp);

  // ── Drawer open and close ──
  const btns = [...side.querySelectorAll(".dg-gnav")];
  const drawers = [...side.querySelectorAll(".dg-drawer")];
  const btnOf = (target) => btns.find((b) => b.dataset.target === target);
  // When SimpleBar is attached, the element that actually scrolls is the inner wrapper
  const scrollOf = (d) => d.querySelector(".simplebar-content-wrapper") || d.querySelector(".dg-drawer__scroll");
  let opened = null;
  const open = (btn, toX = 0) => {
    const target = btn.dataset.target;
    if (opened === target) return close();
    // If the sidebar has been pushed up, raise the drawer by that much so it shows fully (original .5s power3.inOut, not on phone)
    if (push < 0 && !mobileMQ.matches) gsap.to([document.documentElement, document.body], { scrollTop: scrollY + push, duration: reduced ? 0 : 0.5, ease: "power3.inOut" });
    DG.lenis?.stop();
    lock(true);
    btns.forEach((b) => { b.classList.toggle("is-active", b === btn); b.classList.toggle("is-other", b !== btn); });
    navi.classList.add("is-open");
    veil.classList.add("is-active");
    document.body.classList.add("is-menu-open");
    const next = drawers.find((d) => d.dataset.target === target);
    const tl = gsap.timeline();
    if (toX === 0) tl.to(drawers.filter((d) => d !== next), { autoAlpha: 0, duration: reduced ? 0 : 0.2 });
    drawers.forEach((d) => d.classList.toggle("is-active", d === next));
    tl.fromTo(next, { autoAlpha: 0, x: toX }, { autoAlpha: 1, x: 0, duration: reduced ? 0 : 0.8, ease: "power2.out" });
    scrollOf(next).scrollTop = 0;
    opened = target;
    DG.pauseHero?.(true);
  };
  const close = () => {
    if (!opened) return;
    DG.lenis?.start();
    lock(false);
    btns.forEach((b) => b.classList.remove("is-active", "is-other"));
    navi.classList.remove("is-open");
    veil.classList.remove("is-active");
    document.body.classList.remove("is-menu-open");
    gsap.timeline().to({}, { duration: reduced ? 0 : 0.5 }).to(drawers, { autoAlpha: 0, duration: 0.2, onComplete: () => drawers.forEach((d) => d.classList.remove("is-active")) });
    opened = null;
    DG.pauseHero?.(false);
  };
  btns.forEach((b) => {
    if (!b.dataset.target) return;
    b.addEventListener("click", (e) => { e.preventDefault(); open(b); });
  });
  // The ”Detailed event search” in the event finder drawer opens the fourth drawer — as in the original, all sidebar buttons fade to ”other”
  side.querySelector(".dg-detail-btn").addEventListener("click", (e) => { e.preventDefault(); e.stopImmediatePropagation(); open(e.currentTarget); });
  side.querySelector(".dg-detail__clear").addEventListener("click", (e) => { e.preventDefault(); e.stopImmediatePropagation(); e.currentTarget.closest("form").reset(); });
  side.querySelector(".dg-drawer__close").addEventListener("click", close);
  veil.addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && close());
  side.querySelectorAll(".dg-drawer a").forEach((a) => a.addEventListener("click", () => a.getAttribute("href") === "#" && close()));
  DG.closeMenu = close;

  // ── Phone drawer drag: pulling down moves the whole strip along (1/2) and closes past 45px, pushing sideways the drawer follows (1/7) and past 12 it goes to the next drawer ──
  let sx = 0, sy = 0;
  const active = () => drawers.find((d) => d.dataset.target === opened);
  const atTop = (d) => scrollOf(d).scrollTop <= 0;
  const delta = (e) => [(e.changedTouches[0].pageX - sx) / 7, Math.max(0, e.changedTouches[0].pageY - sy) / 2];
  navi.addEventListener("touchstart", (e) => { sx = e.touches[0].pageX; sy = e.touches[0].pageY; }, { passive: true });
  navi.addEventListener("touchmove", (e) => {
    const d = active();
    if (!d || !mobileMQ.matches || !atTop(d)) return;
    const [tx, ty] = delta(e);
    gsap.set(navi, { "--drag": `${ty}px` });
    gsap.set(d, { x: tx });
  }, { passive: true });
  navi.addEventListener("touchend", (e) => {
    const d = active();
    if (!d || !mobileMQ.matches) return;
    const [tx, ty] = delta(e);
    if (atTop(d) && ty > 45) close();
    gsap.to(navi, { "--drag": "0px", duration: Math.max(0, (500 - ty) / 700), ease: "power1.out" });
    // Swipe sideways only between the drawers of the three sidebar buttons (the original’s detailed search drawer is also outside the swipe row)
    const row = drawers.filter((x) => btnOf(x.dataset.target));
    const i = row.indexOf(d);
    const swap = (to, fromX, toX) => gsap.timeline().to(d, { x: fromX, opacity: 0, duration: 0.3, ease: "power2.out" }).add(() => open(btnOf(to.dataset.target), toX));
    if (opened && i >= 0 && tx < -12 && i < row.length - 1) swap(row[i + 1], -50, 40);
    else if (opened && i > 0 && tx > 12) swap(row[i - 1], 50, -40);
    else gsap.to(d, { x: 0, duration: 0.5, ease: "power1.out" });
  });

  // ── Brightens once when visible ──
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  const watch = () => document.querySelectorAll(".anim:not(.is-in)").forEach((el) => (reduced ? el.classList.add("is-in") : io.observe(el)));

  // ── Attached and detached per page — page scripts register with DG.page(namespace, ready), and the function ready returns is called on leave ──
  const parts = [];
  let cleanups = [];
  DG.page = (ns, ready) => parts.push({ ns, ready });
  const box = () => document.querySelector('[data-barba="container"]');
  const apply = (el) => {
    const ns = el.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    document.body.classList.toggle("is-dark", el.hasAttribute("data-dark"));
    back.hidden = ns === "home" || ns === "article";
    setCrumb(el.dataset.crumb);
  };
  const mount = (el) => {
    extrude = document.querySelector("[data-extrude]");
    cleanups = parts.filter((p) => p.ns === el.dataset.barbaNamespace).map((p) => p.ready(el)).filter((f) => typeof f === "function");
    watch();
    pushUp();
  };
  const unmount = () => cleanups.splice(0).forEach((f) => f());
  const show = () => requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-ready")));

  // Makes Barba fetch the next page’s page css — the original has a single css so this isn’t needed
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(
      want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
        const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
        l.onload = l.onerror = res;
        document.head.append(l);
      }))
    );
  };

  // ── Page transition: content and footer fade out over .5s, the next page follows after 300ms, and the new page fades in .2s and .4s later. On hero slides a blurred panel covers the screen (DG.special in index.js) ──
  const fade = () => { document.body.classList.add("is-leaving"); return new Promise((r) => setTimeout(r, reduced ? 0 : 300)); };
  const leave = (trigger) => {
    close();
    const slide = trigger && trigger.closest && trigger.closest(".dg-mv__slide");
    return slide && DG.special ? DG.special(slide) : fade();
  };
  // Only pages of this site set (*.html in the same folder) are treated as transitions — things like ../../index.html in the list bar normally just navigate
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");
  let backY = 0;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href");
    if (href === "#top") { e.preventDefault(); return DG.lenis ? DG.lenis.scrollTo(0, { duration: 1 }) : window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (a.hasAttribute("data-back") && window.barba && barba.history.previous) { e.preventDefault(); history.back(); }
  });

  function start() {
    const el = box();
    apply(el);
    mount(el);
    show();
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        timeout: 5000,
        prevent: ({ el: a, event }) => (event && event.defaultPrevented) || !a || a.tagName !== "A" || !own(a.getAttribute("href")),
        transitions: [{
          name: "default-transition",
          leave: ({ trigger }) => { if (trigger !== "back" && trigger !== "forward") backY = scrollY; return leave(trigger); },
          beforeEnter: async ({ current, next }) => {
            unmount();
            current.container.style.display = "none";
            await sheets(next.html);
            document.body.classList.remove("is-leaving", "is-ready");
            apply(next.container);
            toTop();
          },
          // Barba counts it as a page transition only if both leave and enter exist
          enter() {},
          after: ({ trigger, next }) => {
            if (trigger === "back") scrollTo(0, backY);
            mount(next.container);
            DG.afterSpecial?.();
            show();
          },
        }],
      });
      return;
    }
    // Under file:// barba cannot fetch the next page — fade out with the same values, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href)) return;
      e.preventDefault();
      if (a.hasAttribute("data-back") && history.length > 1 && document.referrer) return leave(a).then(() => history.back());
      leave(a).then(() => (location.href = href));
    });
    addEventListener("pageshow", (e) => e.persisted && document.body.classList.remove("is-leaving"));
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
