// Common to all pages: draws the header (logo · two gradient pills · round MENU), water-colored menu drawer (bubbles), floating CHECK card, phone bottom fixed strip, and footer (two photo rows flowing endlessly) in one place,
// Apply the original shared motions with the same values — reveal (is-act when it reaches -25% of the screen, 2s · 20px · cubic-bezier(.215,.61,.355,1)) · parallax (.js-parallax data-y, scrub 1) ·
// Arrow pass-through (.5s) · text splitting (.1s stagger) · bubbles on scroll down · subpage header English flow · water-colored background 2s near the footer · scroll position indicator
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const KS = (window.KS = { reduce, page });
  const body = document.body;

  const arrow = '<i class="c-ico"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 5.3h6.6L5.6 2.8l1-1L10.8 6l-4.2 4.2-1-1 2.5-2.5H1.5z"/></svg></i>';
  const book = '<i class="c-ico"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 2.5h3.5a1 1 0 0 1 1 1v6a1 1 0 0 0-1-1H1.5zM10.5 2.5H7a1 1 0 0 0-1 1v6a1 1 0 0 1 1-1h3.5z"/></svg></i>';
  const cal = '<i class="c-ico"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3h8v7H2zM2 5h8M4 2v2M8 2v2"/></svg></i>';
  const pen = '<i class="c-ico"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10l1-3 5-5 2 2-5 5zM7 3l2 2"/></svg></i>';
  KS.icons = { arrow, book, cal, pen };
  // The arrow slides out to the right while the same arrow pushes in from the left inside a circle (original MovingArrow .5s, reversed on release) — motion part arrow-pass-hover slide type
  const svgOf = (icon) => icon.replace('<i class="c-ico">', "").replace("</i>", "").replace('viewBox="0 0 12 12"', 'viewBox="-12 -12 36 36"');
  KS.ico = (cls = "ico", icon = arrow) => `<span class="${cls}"><span class="ks-pass" data-fx="arrow-pass-hover" data-fx-arrow-pass-hover="look: slide">${svgOf(icon)}${svgOf(icon)}</span></span>`;
  KS.btn = (label, href = "#", cls = "") => `<div class="ks-btn ${cls}"><a href="${href}"><span class="text">${label}</span>${KS.ico()}</a></div>`;
  const logo = (white = false) => `<span class="ks-logo${white ? " ks-logo--white" : ""}"><svg class="ks-logo__mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30"/><path class="w1" d="M8 34c8-6 16-6 24 0s16 6 24 0v8c-8 6-16 6-24 0s-16-6-24 0z"/><path class="w2" d="M14 22c6-8 14-10 18-4-6 2-10 6-12 12z"/><path class="w3" d="M50 22c-6-8-14-10-18-4 6 2 10 6 12 12z"/></svg><span class="ks-logo__word">logo</span><span class="ks-logo__sub">Your school subtitle here</span></span>`;
  KS.logo = logo;

  // The pill button’s circle isn’t passed over by the arrow, the whole circle shifts 20% (original .l-header__cta-button a:hover .ico)
  const cta = (cls) => `
    <div class="${cls}-button -pamphlet"><a href="contact.html"><span class="text">Brochure Request</span><span class="ico">${book}</span></a></div>
    <div class="${cls}-button -event"><a href="#"><span class="text">Event</span><span class="ico">${cal}</span></a></div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ks-head");
    head.innerHTML = `
      <div class="ks-head__in">
        <a class="ks-head__logo" href="index.html" aria-label="First Page">${logo()}${logo(true)}</a>
        <div class="ks-head__cta">${cta("ks-head__cta")}</div>
        <button class="ks-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="ks-drawer">
          <span class="ks-burger__face -default"><i></i><i></i><i></i><b>MENU</b></span>
          <span class="ks-burger__face -close"><i></i><i></i><b>CLOSE</b></span>
        </button>
      </div>`;
    const groups = [
      [["About the School", "about.html", ["Greeting", "Graduation Requirements", "Instructor Intro", "Classrooms & Facilities", "Operating company", "Directions"]]],
      [["Faculty Guide", "#", ["Faculty 1", "Faculty 2", "Faculty 3", "Special Training"]], ["School life", "#", ["Dormitory", "School trip", "Club", "School Festival"]]],
      [["Admissions Info", null, ["Application guidelines", "WEB application", "Admissions Process"]]],
      [["Career Support", "#"], ["Event details", "#"], ["To the guardian", "#"], ["To the teacher", "#"], ["News", "news.html"], ["Creature guide", "#"], ["Hiring Info", "#"]],
    ];
    head.insertAdjacentHTML(
      "afterend",
      `<div class="ks-drawer" id="ks-drawer" data-slot="menu-drawer" aria-hidden="true">
        <div class="ks-drawer__bubbles"><canvas data-fx="bubble-rise"></canvas></div>
        <div class="ks-drawer__wrap">
          <div class="ks-drawer__in">
            <nav class="ks-drawer__menu" aria-label="Full menu">${groups
              .map(
                (g) => `<div class="ks-drawer__group">${g
                  .map(([t, href, kids]) =>
                    kids
                      ? `<div class="ks-drawer__item -acc"><div class="ks-drawer__page">${href ? `<a href="${href}" class="ks-arrow-trg"><span class="text">${t}</span>${KS.ico()}</a>` : `<span class="link"><span class="text">${t}</span></span>`}<button class="toggle" type="button" aria-label="${t} Unfold"></button></div><div class="ks-drawer__children">${kids.map((k) => `<a href="${k === "WEB application" ? "recruit.html" : "#"}">${k}</a>`).join("")}</div></div>`
                      : `<div class="ks-drawer__item"><div class="ks-drawer__page"><a href="${href}"><span class="text">${t}</span>${KS.ico()}</a></div></div>`,
                  )
                  .join("")}</div>`,
              )
              .join("")}
              <div class="ks-drawer__group -sub"><a href="#">Official site</a><a href="#">Inquiry</a><a href="#">Privacy policy</a><a href="#">E-commerce disclosure</a></div>
            </nav>
            <div class="ks-drawer__cta">
              <p class="ks-drawer__ctaTitle">Department 1 · Department 2 · Department 3 <strong>Now accepting applications!</strong></p>
              <div class="ks-drawer__ctaBtns">
                <div class="ks-drawer__cta-button -entry"><a href="recruit.html"><span class="text">Support</span><span class="ico">${pen}</span></a></div>
                ${cta("ks-drawer__cta")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ks-overlay"></div>`,
    );
  }

  const main = document.querySelector("main");
  if (main) {
    main.insertAdjacentHTML(
      "afterbegin",
      `<canvas class="ks-bubbles" data-fx="bubble-rise" data-fx-bubble-rise="mode: scroll; look: fixed" aria-hidden="true"></canvas>
      <div class="ks-check" data-slot="check-card">
        <a class="ks-check__link" href="#">
          <span class="ks-check__img"><span class="wf-img" data-label="Info banner · smiling student upper body · square"></span></span>
          <span class="ks-check__body"><b class="ks-check__en">CHECK!</b><span class="ks-check__title">For 0/0000 enrollment<br>Application inquiries here</span></span>
          <span class="ks-check__arrow">${arrow}</span>
        </a>
        <button class="ks-check__x" type="button" aria-label="Close"><i></i><i></i></button>
      </div>
      <div class="ks-fixbar" data-slot="fixed-cta">
        <a href="contact.html">${book}<span>Brochure Request</span></a>
        <a href="recruit.html">${pen}<span>Support</span></a>
        <a href="#">${cal}<span>Event</span></a>
      </div>`,
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const shots = ["Two people seen from behind in front of a dark large aquarium", "Staff explaining in front of a fish tank", "A tank where a school of fish passes", "Fish close-up", "Student petting a capybara", "White dolphin face", "Blue-lit aquarium tunnel"];
    const row = (rev) => `<div class="swiper ks-gallery__row${rev ? " -reverse" : ""}" data-speed="15000"><div class="swiper-wrapper">${shots.map((s) => `<div class="swiper-slide"><span class="wf-img wf-r-1x1" data-label="${s} · Square"></span></div>`).join("")}</div></div>`;
    foot.classList.add("ks-foot");
    foot.id = "ks-footer";
    foot.innerHTML = `
      <figure class="ks-gallery">${row(false)}${row(true)}</figure>
      <div class="ks-foot__main ks-container">
        <div class="ks-foot__company">
          <a class="ks-foot__logo" href="index.html" aria-label="First Page">${logo(true)}</a>
          <div class="ks-foot__address"><p class="zip">〒000-0000</p><p>Your one-line address sits here <span class="u-ib">Building Name Floor 0</span></p></div>
          <a class="ks-foot__mail" href="#">${'<i class="c-ico"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 3h9v6h-9zM1.5 3 6 6.5 10.5 3"/></svg></i>'}<span>info@example.com</span></a>
          <div class="ks-foot__links"><a class="ks-foot__site" href="#"><span>Official site</span></a>
            <div class="ks-foot__sns">${["X", "IG", "TT", "YT"].map((s) => `<a href="#" aria-label="SNS ${s}"><span>${s}</span></a>`).join("")}</div></div>
        </div>
        <div class="ks-foot__cta">${cta("ks-foot__cta")}</div>
      </div>
      <div class="ks-foot__bottom ks-container">
        <ul class="ks-foot__menu"><li><a href="#">School Contact</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">E-commerce disclosure</a></li></ul>
        <p class="ks-foot__copy">Copyright © Your company name here All Rights Reserved.</p>
      </div>`;
    document.body.insertAdjacentHTML("afterbegin", '<div class="ks-bg" aria-hidden="true"></div>');
  }

  // ── Image pieces: bubbles, fish (the original is photos/drawings — redrawn as silhouettes of the same place and size) ──
  KS.bubble = '<svg class="ks-bubble" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48"/><path d="M24 40a28 28 0 0 1 16-18"/></svg>';
  KS.fish = (label) => `<svg class="ks-fish" viewBox="0 0 200 100" role="img" aria-label="${label}"><path d="M10 50c30-38 100-44 140-10l40-26-12 36 12 36-40-26C110 94 40 88 10 50z"/><circle class="eye" cx="42" cy="44" r="6"/></svg>`;

  // ── Subpage header: built from data-title · data-en — the English flows faintly forever (30s), two fish float up and down ──
  document.querySelectorAll('[data-slot="page-head"]').forEach((el) => {
    const en = el.dataset.en || "information";
    const note = el.querySelector(".wf-note")?.outerHTML || "";
    el.classList.add("ks-lkv");
    el.innerHTML = `${note}<div class="ks-lkv__in">
        <h1 class="ks-lkv__title">${el.dataset.title || "Your page title here"}</h1>
        <div class="ks-lkv__en" aria-hidden="true"><div class="swiper"><div class="swiper-wrapper">${Array(4).fill(`<div class="swiper-slide">${en}</div>`).join("")}</div></div></div>
        <div class="ks-lkv__bubble -b1 js-parallax" data-y="-40">${KS.bubble}</div>
        <div class="ks-lkv__bubble -b2 js-parallax" data-y="-80">${KS.bubble}</div>
        <div class="ks-lkv__fish"><div class="fish -f1">${KS.fish("Small tropical fish cutout photo slot · facing right")}</div><div class="fish -f2">${KS.fish("Cat and fish cutout photo slot · bottom left")}</div></div>
      </div>`;
  });
  document.querySelectorAll('[data-slot="breadcrumb"]').forEach((el) => {
    el.classList.add("ks-crumb", "ks-container--s");
    el.innerHTML = `<span><a href="index.html">TOP</a></span><span>${el.dataset.title || ""}</span>`;
  });
  // ── Three ongoing event cards ──
  document.querySelectorAll('[data-slot="events"]').forEach((el) => {
    const evs = [["Open campus poster · students and a turtle · vertical 4:5", "Your event name · Open Campus is on!"], ["Experience tour poster · behind the tank · portrait 4:5", "Event name · Behind-the-tank tour"], ["Info session poster · reptile and student · portrait 4:5", "Your event name · private consultation session here"]];
    el.classList.add("ks-events", "ks-container--s");
    el.innerHTML = `<p class="ks-events__head">Ongoing events</p>
      <ul class="ks-events__list js-anim -list1">${evs.map(([l, t]) => `<li class="ks-ev"><a href="#"><div class="ks-ev__img"><span class="wf-img wf-r-4x3" data-label="${l}"></span></div><p class="ks-ev__title">${t}</p><p class="ks-ev__text">About three lines of event intro go here. Describe experiencing a day at school firsthand and being able to ask questions.</p><p class="ks-ev__label">For: Undergrad 1, Undergrad 2</p></a></li>`).join("")}</ul>
      ${KS.btn("Back to event list", "#", "-center")}`;
  });

  // ── Drawer: on open the drawer goes from top 200% → 0 over 1s, a scrim is laid and the header logo turns white. Click outside the drawer or press Esc to close ──
  const drawer = document.getElementById("ks-drawer");
  const burger = document.querySelector(".ks-burger");
  let open = false;
  const setDrawer = (v) => {
    open = v;
    body.classList.toggle("is-drawer-open", v);
    body.classList.toggle("is-fixed", v);
    drawer?.setAttribute("aria-hidden", String(!v));
    burger?.setAttribute("aria-expanded", String(v));
    burger?.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
  };
  burger?.addEventListener("click", () => setDrawer(!open));
  document.addEventListener("click", (e) => {
    if (open && !e.target.closest("#ks-drawer, .ks-burger")) setDrawer(false);
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && open && setDrawer(false));
  // Expand inside the drawer (original DrawerAccordion, height .5s)
  drawer?.querySelectorAll(".ks-drawer__item.-acc").forEach((it) => {
    const kids = it.querySelector(".ks-drawer__children");
    it.querySelector(".toggle").addEventListener("click", () => {
      const on = !it.classList.contains("is-open");
      it.classList.toggle("is-open", on);
      gsap.to(kids, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "power2.out" });
    });
  });
  const mqDrawer = matchMedia("(max-width: 767px)");
  const syncAcc = () => drawer?.querySelectorAll(".ks-drawer__item.-acc").forEach((it) => {
    const kids = it.querySelector(".ks-drawer__children");
    it.classList.toggle("is-open", !mqDrawer.matches);
    gsap.set(kids, { height: mqDrawer.matches ? 0 : "auto" });
  });
  syncAcc();
  mqDrawer.addEventListener("change", syncAcc);

  document.querySelector(".ks-check__x")?.addEventListener("click", () => document.querySelector(".ks-check").classList.add("is-closed"));

  // ── Scroll position indicator (original ScrollStatus: is-top/middle/bottom at 100px boundaries, direction is-up/down) ──
  let prevY = scrollY, pos = "";
  const status = () => {
    const y = scrollY, bottom = body.clientHeight - 100;
    const next = y <= 100 ? "top" : y + innerHeight < bottom ? "middle" : "bottom";
    if (next !== pos) { body.classList.remove(`is-${pos}`); body.classList.add(`is-${next}`); pos = next; }
    if (y > 100 && y > prevY) { body.classList.add("is-down"); body.classList.remove("is-up"); }
    else if (y <= prevY) { body.classList.add("is-up"); body.classList.remove("is-down"); }
    prevY = y;
  };
  addEventListener("scroll", status, { passive: true });
  status();

  // ── Reveal: when a .js-anim panel enters the inner 25% of the screen top and bottom, is-act (once) ──
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-act"); io.unobserve(e.target); } }), { rootMargin: "-25% 0px" });
  document.querySelectorAll(".js-anim").forEach((el) => (reduce ? el.classList.add("is-act") : io.observe(el)));

  // ── Split text: each letter delayed .1s (transition in css) ──
  document.querySelectorAll(".js-split").forEach((el) => {
    const base = parseFloat(el.dataset.delay || 0);
    const chars = [...el.textContent.trim()];
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = chars.map((c, i) => `<span aria-hidden="true" style="transition-delay:${(base + i * 0.1).toFixed(1)}s">${c === " " ? " " : c}</span>`).join("");
  });

  // ── Parallax: .js-parallax by data-y (default 100) while the panel passes the screen (scrub 1) ──
  if (!reduce)
    document.querySelectorAll(".js-parallax").forEach((el) =>
      gsap.to(el, { y: +(el.dataset.y ?? 100), scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } }),
    );

  // ── Endlessly flowing Swiper (two footer photo rows 15s · subpage header English 30s) — runs only when visible ──
  const endless = () => {
    if (!window.Swiper) return;
    const vis = new IntersectionObserver((es) => es.forEach((e) => { const s = e.target.swiper; if (!s?.autoplay) return; e.isIntersecting && !reduce ? s.autoplay.start() : s.autoplay.stop(); }));
    document.querySelectorAll(".ks-gallery__row, .ks-lkv__en .swiper").forEach((el) => {
      el.querySelectorAll(".swiper-slide").forEach((s) => el.querySelector(".swiper-wrapper").append(s.cloneNode(true)));
      const sw = new Swiper(el, {
        autoplay: { delay: 0, reverseDirection: el.classList.contains("-reverse") },
        loop: true, speed: +(el.dataset.speed || 30000), spaceBetween: +(el.dataset.gap || 0), slidesPerView: "auto", allowTouchMove: false,
      });
      if (reduce) sw.autoplay.stop();
      vis.observe(el);
    });
  };
  if (document.readyState === "complete") endless();
  else addEventListener("load", endless);

  // ── Near the footer (within 30% from the top and bottom of the screen), the water-colored background turns on in 2s ──
  const footer = document.getElementById("ks-footer");
  if (footer) {
    const m = innerHeight * 0.3;
    new IntersectionObserver((es) => es.forEach((e) => body.classList.toggle("is-bg", e.isIntersecting)), { rootMargin: `-${m}px 0px` }).observe(footer);
  }

  // ── Document is hidden at first and then appears (.5s on the first page, immediate on subpages) ──
  const pageEl = document.getElementById("page");
  if (pageEl && page !== "home") gsap.set(pageEl, { opacity: 1 });
})();
