// Common to all pages: draws the header bar, drawer, intro curtain, contact section and footer, and applies motion with the original values.
// Original values: Lenis lerp .1 (driven by the GSAP tick) · intro 1s after load, 1s Power4.easeOut · reveal at 20% from screen bottom · letters .7s with .03s stagger ·
// Letter roll .6s expo.inOut / .4s cubic-bezier(.115,.405,.24,1) · drawer items .6s after .3s at .04s intervals (close .3s)
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const KM = (window.KM = { lenis: null, ready: false });
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("kmLinkHover", ".115,.405,.24,1");

  /* ---------- Artwork: newly drawn in place of the original logo · city · van ---------- */
  const logo = '<svg viewBox="0 0 100 28" aria-label="Logo"><text x="0" y="19" fill="currentColor" style="font: 600 21px var(--kf-font-display); letter-spacing: .5px">LOGO</text><rect x="58" y="3" width="3" height="17" rx="1.5" fill="currentColor"/><text x="66" y="19" fill="currentColor" style="font: 600 21px var(--kf-font-display)">AB</text><text x="40" y="27" fill="currentColor" style="font: 500 5px var(--kf-font-display); letter-spacing: 1.6px">SUBLINE</text></svg>';
  // One city board (1440×400) — buildings of varying heights, slanted roofs and trapezoid towers in the same color. Three boards chained flow past one board per 10s
  const B = [[0, 260, 120, 1], [140, 150, 70], [230, 330, 150, 1], [400, 120, 230], [650, 210, 90], [760, 380, 110, 1], [890, 170, 180], [1090, 260, 80], [1190, 140, 120, 1], [1330, 230, 110]];
  const city = `<svg class="km-city__tile" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${B.map(([x, h, w, s]) => s
    ? `<path d="M${x} 400 L${x + w * .22} ${400 - h} L${x + w * .78} ${400 - h} L${x + w} 400 Z" fill="currentColor"/>`
    : `<path d="M${x} 400 V${400 - h} H${x + w * .62} L${x + w} ${400 - h + Math.min(60, h * .35)} V400 Z" fill="currentColor"/>`).join("")}</svg>`;
  const cityStrip = `<div class="km-city"><div class="km-city__track">${city}${city}${city}</div></div>`;
  const van = '<svg viewBox="0 0 150 72" aria-hidden="true"><path d="M6 18a10 10 0 0 1 10-10h78l26 4 22 22a8 8 0 0 1 2 5v16a7 7 0 0 1-7 7H8a6 6 0 0 1-6-6V18Z" fill="currentColor"/><path d="M98 15h16l20 19H98Z" style="fill: var(--kf-surface)" fill-opacity=".85"/><circle cx="34" cy="62" r="9" style="fill: var(--kf-ink)"/><circle cx="114" cy="62" r="9" style="fill: var(--kf-ink)"/><circle cx="34" cy="62" r="3.5" style="fill: var(--kf-surface)"/><circle cx="114" cy="62" r="3.5" style="fill: var(--kf-surface)"/></svg>';
  // Rear view of the van — open the cargo door to show three boxes, colors from the --illust-* variables given by the section
  const vanBack = '<svg viewBox="0 0 447 430" aria-label="Illustration of a van from behind with the cargo door open"><path d="M40 70a50 50 0 0 1 50-50h267a50 50 0 0 1 50 50v290H40Z" style="fill: var(--illust-body)"/><path d="M78 70h291v140H78Z" style="fill: var(--illust-window)"/><path d="M96 160h70v50H96ZM170 140h90v70h-90ZM264 150h78v60h-78Z" style="fill: var(--illust-line)"/><path d="M40 238h367M40 258h367M40 278h367" style="stroke: var(--illust-line)" stroke-width="4"/><rect x="184" y="296" width="80" height="34" rx="4" style="fill: var(--illust-accent)"/><path d="M28 340h391v26a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10Z" style="fill: var(--illust-line)"/><rect x="68" y="372" width="44" height="58" rx="10" style="fill: var(--kf-dim)"/><rect x="335" y="372" width="44" height="58" rx="10" style="fill: var(--kf-dim)"/></svg>';
  KM.svg = { cityStrip, van, vanBack, logo };
  // Truck-shaped window — a rounded panel with its top left cut diagonally like a windshield (shared by the hero and the subpage big photo)
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position: absolute" aria-hidden="true"><clipPath id="km-truck-clip" clipPathUnits="objectBoundingBox"><path d="M.16 0H.955Q1 0 1 .08V.92Q1 1 .955 1H.045Q0 1 0 .92V.5Q0 .44 .03 .39L.118 .055Q.135 0 .16 0Z"/></clipPath></svg>');

  /* ---------- Menu row (placeholder) ---------- */
  const NAV = [
    ["Company About", "about.html", [["Company Thinking", "about.html#thoughts"], ["What we cherish", "about.html#values"], ["Guiding goal", "about.html#vision"], ["Strength", "about.html#strengths"]]],
    ["Business details", "service.html", [["One business", "service.html#corporate"], ["Business Two", "service.html#personal"]]],
    ["Partner Recruitment", "index.html#partner", [["Message", "index.html#partner"], ["Three assurances", "index.html#partner"], ["Frequently asked questions", "index.html#partner"], ["Application guidelines", "index.html#partner"]]],
    ["Company info", "about.html#outline", [], [["Inquiry", "#km-contact"], ["News", "news.html"], ["Blog", "news.html"]]],
  ];
  const roll = (text) => `<span class="km-roll"><span class="km-roll__a">${text}</span><span class="km-roll__b" aria-hidden="true">${text}</span></span>`;
  const navCols = (item) => NAV.map(([t, h, kids, extra]) => `<ul>
      <li><a class="is-parent" href="${h}" data-roll${item}>${roll(t)}</a></li>
      ${kids.map(([k, kh]) => `<li><a class="is-child" href="${kh}" data-roll${item}>${roll(k)}</a></li>`).join("")}
      ${(extra || []).map(([k, kh]) => `<li><a class="is-parent" href="${kh}" data-roll${item}>${roll(k)}</a></li>`).join("")}
    </ul>`).join("");

  const head = document.querySelector('[data-slot="header"]');
  head.className = "km-head";
  head.innerHTML = `<div class="km-head__bar">
      <a class="km-logo" href="index.html">${logo}</a>
      <nav class="km-gnav" aria-label="Main menu"><ul>
        <li><a href="about.html" data-roll>${roll("Company About")}</a></li>
        <li><a href="service.html" data-roll>${roll("Business details")}</a></li>
        <li><a href="index.html#partner" data-roll>${roll("Partner Recruitment")}</a></li>
        <li><a href="about.html#outline" data-roll>${roll("Company info")}</a></li>
        <li><a href="#km-contact" data-roll>${roll("Inquiry")}</a></li>
      </ul></nav>
      <div class="km-head__burger"><button class="km-burger" type="button" data-burger aria-expanded="false" aria-controls="km-drawer" aria-label="Open Menu"><span class="km-burger__in"><span class="km-burger__bar"></span><span class="km-burger__bar"></span></span></button></div>
    </div>`;
  head.insertAdjacentHTML("beforebegin", `<div class="km-drawer" id="km-drawer" aria-hidden="true" data-slot="drawer">
      <div class="km-drawer__bg"></div>
      <div class="km-drawer__box" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="km-drawer__wrap">
          <header class="km-drawer__head"><button class="km-burger" type="button" data-burger aria-expanded="true" aria-label="Close Menu"><span class="km-burger__in"><span class="km-burger__bar"></span><span class="km-burger__bar"></span></span></button></header>
          <div class="km-drawer__in"><div class="km-drawer__content">
            <div class="km-drawer__img" data-drawer-item><div class="wf-img" data-label="Vertical photo of a driver with luggage standing beside a van · clear day · 2:3 portrait"></div></div>
            <div class="km-drawer__body">
              <nav class="km-drawer__nav" aria-label="Drawer Menu">${navCols(" data-drawer-item")}</nav>
              <span class="km-drawer__logo" data-drawer-item>${logo}</span>
            </div>
          </div></div>
          <span class="km-drawer__logo-fixed" data-drawer-item>${logo}</span>
        </div>
      </div>
    </div>`);
  if (!document.querySelector(".km-intro")) document.body.insertAdjacentHTML("afterbegin", `<div class="km-intro" data-slot="intro" aria-hidden="true"><div class="km-intro__scene">${cityStrip}<div class="km-road"></div><div class="km-intro__car km-van">${van}</div></div></div>`);

  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.className = "km-contact";
    contact.id = "km-contact";
    contact.innerHTML = `<div class="km-container"><div class="km-grid2">
        <div class="km-contact__left">${vanBack}</div>
        <div class="km-contact__right">
          <div class="km-sh" data-reveal="top"><span class="km-sh__en">Contact</span><span class="km-sh__bar"></span><span>Inquiry</span></div>
          <h2 class="km-contact__title"><span data-reveal="text">Your quick word, casually here.</span></h2>
          <p class="km-contact__content" data-reveal="top">Your first line of contact info here.<br>One line saying small questions are fine.<br>A line saying we reply to each story we receive.</p>
          <div class="km-contact__more"><a class="km-btn" href="#"><span>Contact Us</span></a></div>
        </div>
      </div></div>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  foot.className = "km-foot";
  foot.innerHTML = `<div class="km-foot__wrap" data-is-dark>
      <div class="km-foot__content"><div class="km-foot__inner">
        <div><a class="km-foot__logo" href="index.html">${logo}</a><p class="km-foot__name">Company name</p><address class="km-foot__address">Postal code 000-0000<br>Your one-line address 00-0-000 here</address></div>
        <nav class="km-foot__nav" aria-label="Footer Menu">${navCols("")}</nav>
      </div></div>
      <div class="km-foot__bottom"><a href="#">Privacy policy</a><small class="km-en">©logo</small></div>
    </div>`;

  /* ---------- Intro: only on first visit of a session · reload — 1s after load the curtain lifts in 1s, then the reveal starts ---------- */
  const ready = () => { KM.ready = true; dispatchEvent(new CustomEvent("km:ready")); };
  let showIntro = true;
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    showIntro = !sessionStorage.getItem("km-visited") || (nav && nav.type === "reload");
    sessionStorage.setItem("km-visited", "1");
  } catch (e) { showIntro = true; }
  const intro = document.querySelector(".km-intro");
  addEventListener("load", () => {
    if (showIntro && intro && !reduce) {
      gsap.timeline({ delay: 1 }).to(intro, { opacity: 0, duration: 1, ease: "power4.out", onComplete: () => { intro.style.display = "none"; ready(); } });
    } else {
      if (intro) intro.style.display = "none";
      ready();
    }
  });

  /* ---------- Smooth scroll · scrollbar: the original ties Lenis to the GSAP tick, with OverlayScrollbars on body ---------- */
  if (!reduce && window.Lenis) {
    KM.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    KM.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => KM.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (window.OverlayScrollbarsGlobal) {
    const { OverlayScrollbars, ScrollbarsHidingPlugin, ClickScrollPlugin } = OverlayScrollbarsGlobal;
    OverlayScrollbars.plugin([ScrollbarsHidingPlugin, ClickScrollPlugin]);
    OverlayScrollbars(document.body, { scrollbars: { autoHide: "scroll", clickScroll: true }, cancel: { nativeScrollbarsOverlaid: true, body: null } });
  }
  const headH = () => head.offsetHeight;
  const jump = (target) => {
    const y = target.getBoundingClientRect().top + scrollY - headH();
    if (KM.lenis) KM.lenis.scrollTo(y, { duration: 1 });
    else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (t) { e.preventDefault(); if (drawer.classList.contains("is-open")) closeDrawer(); jump(t); }
  });
  addEventListener("load", () => setTimeout(() => { if (location.hash) { const t = document.querySelector(location.hash); if (t) jump(t); } }, 200));

  /* ---------- Header band: past the marker (data-not-top) it becomes a deep blue band, and over dark panels (data-is-dark) the text turns white ---------- */
  const notTop = document.querySelector("[data-not-top]");
  if (notTop) ScrollTrigger.create({ trigger: notTop, start: () => `-${headH()}px top`, endTrigger: document.body, onToggle: (st) => head.classList.toggle("is-not-top", st.isActive) });
  let dark = 0;
  document.querySelectorAll("[data-is-dark]").forEach((el) => {
    const on = () => head.classList.toggle("is-dark", ++dark > 0), off = () => head.classList.toggle("is-dark", (dark = Math.max(0, dark - 1)) > 0);
    ScrollTrigger.create({ trigger: el, start: () => `-${headH()}px top`, end: () => `bottom ${headH()}px`, onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off });
  });

  /* ---------- Reveal ---------- */
  document.querySelectorAll('[data-reveal="text"]').forEach((el) => {
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = [...el.textContent].map((c) => `<span class="km-ch" aria-hidden="true">${c}</span>`).join("");
  });
  const fire = (el) => {
    if (el.dataset.reveal === "text") {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      gsap.fromTo(el.querySelectorAll(".km-ch"), { y: el.dataset.y || "100%", opacity: +(el.dataset.opacity ?? 1) }, { y: 0, opacity: 1, ease: el.dataset.ease || "power1.inOut", duration: +(el.dataset.duration || 0.7), delay: +(el.dataset.delay || 0), stagger: { each: +(el.dataset.each || 0.03) }, onComplete: () => el.classList.add("is-visible") });
    } else if (!el.classList.contains("is-visible")) setTimeout(() => el.classList.add("is-visible"), (+el.dataset.delay || 0) * 1000);
  };
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reduce) reveals.forEach((el) => el.classList.add("is-visible"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && fire(e.target)), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    const start = () => reveals.forEach((el) => { const r = el.getBoundingClientRect(); r.top < innerHeight && r.bottom > 0 ? fire(el) : io.observe(el); });
    KM.ready ? start() : addEventListener("km:ready", start, { once: true });
  }

  /* ---------- Letter roll hover (original data-hover-animation) ----------
     The original’s outgoing curve is "expo.inout"(lowercase) so GSAP can’t read it and runs the default curve power1.out — matching the visible motion, power1.out */
  if (!touch) document.querySelectorAll("[data-roll]").forEach((el) => {
    const a = el.querySelector(".km-roll__a"), b = el.querySelector(".km-roll__b");
    if (!a || !b || reduce) return;
    const x = el.dataset.roll === "x";
    // GSAP reads CSS translateY(150%) as px (y), so pin y·x to 0 so it doesn’t overlap yPercent
    gsap.set(b, x ? { x: 0, y: 0, xPercent: -150, yPercent: 0 } : { x: 0, y: 0, yPercent: 150 });
    el.addEventListener("mouseenter", () => {
      if (x) { gsap.fromTo(a, { xPercent: 0, opacity: 1 }, { xPercent: -105, opacity: 0, duration: 0.4, ease: "power1.out" }); gsap.fromTo(b, { xPercent: 105 }, { xPercent: 0, duration: 0.4, ease: "kmLinkHover" }); }
      else { gsap.fromTo(a, { yPercent: 0, opacity: 1 }, { yPercent: -105, opacity: 0, duration: 0.6, ease: "power1.out" }); gsap.fromTo(b, { yPercent: 105 }, { yPercent: 0, duration: 0.4, ease: "kmLinkHover" }); }
    });
  });

  /* ---------- Drawer ---------- */
  const drawer = document.getElementById("km-drawer");
  const burgers = document.querySelectorAll("[data-burger]");
  let opened = false, anim = null;
  const expanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
  const items = () => drawer.querySelectorAll("[data-drawer-item]");
  const openDrawer = () => {
    if (opened) return;
    MicroModal.show("km-drawer", {
      disableScroll: true, disableFocus: true, awaitOpenAnimation: true, awaitCloseAnimation: true,
      onShow: () => {
        opened = true;
        KM.lenis?.stop();
        setTimeout(() => expanded(true), 200);
        anim = gsap.fromTo(items(), { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
        drawer.querySelector(".km-drawer__box").scrollTop = 0;
      },
      onClose: () => { opened = false; expanded(false); KM.lenis?.start(); },
    });
  };
  const closeDrawer = () => {
    if (!opened) return;
    anim?.pause();
    gsap.fromTo(items(), { opacity: 1, y: 0 }, { opacity: 0, y: -20, ease: "power1.out", duration: 0.3, stagger: { each: 0.002 }, onComplete: () => MicroModal.close("km-drawer") });
  };
  burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && opened) closeDrawer(); });
})();
