// Frame and motion shared by all pages. The values are read from the main.css and main.js of the original site.
(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => matchMedia("(min-width: 1025px)").matches;
  const page = document.body.dataset.page || "home";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  // Convert skin variables to [r, g, b] for canvas·shaders — oklch() and color-mix() are also read as the values painted on screen
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function rgbOf(name) {
    const el = document.createElement("i");
    el.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    return [...probe.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }
  const cssOf = (name) => `rgb(${rgbOf(name).join(" ")})`;

  // Dot map bitmap: Natural Earth 1:50m land and national borders (world-atlas 2.0.2, public-domain data) baked at the same cell count as the original. One bit is one dot.
  // The world is 173×104 cells centered on an ocean (18°W~326°E, 83.5°N~57°S, Miller projection), a single country is 62×62 cells in Mercator — school is the cell where the School sits
  const MAPS = { world: { cols: 173, rows: 104, aspect: 2600 / 1569, data: "AAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAD/wH9AAAAAAgAAAAAAAAAAAAAAAAD//f/+AAAAAVoABgAAAAAAAAAAAAAIb9//4AACABEAAHAAAAAAAAAAAAAA4/v//gAHuAAAAgHAAAAAAAAAAAAAB/8P//AAPwAAAAACwAAAAAAAAAAAAx3x//+AAGQAAAAACAAAAAAAAAAABQoPn//8AAMAAAAAADAAAAAAAAAAAMEA8H//4AAAAAAEAAP4AAAAAAAAAAkjdoP//wAAAAADgAP/wAPAAAAAAAAtqtwAf/gAAAAAMAB//AAAAAAAAAAAIBXgA//AAAAAAwAD/+AAIAAAAAAAPALgAA/+AAAAABAEf//7gAAAAAAAA/UW/gA/8AAAAAGAz////B0AAAAAAB/4p7gD///////78BAAABAD//P/f//wHuAf+AAAAHwACH///////gAAH8AAP4x3wD/gAAf8CBv///////+8Af/1+O2jXwH///+ABsACAAAAAAAAB+AAAA7+B4/wB//8ABQAIAAAAAAAAB+AAAAAADYfAC//wA0AAAAAAAAAAAA6AAAAAAPifAJ//BhwAAAAAAAAAAAbgAAAAABcH+B4AD9+///////////+AH/////9h4B8AAPn////////////8A//////gBgDwAA/P///////////vgB/////+AcAHgAB+f//////////w8AB/f///8A8AHAAD+H//////////iAAB6H///wB5AAACG5/////////+AMAAAwD///wD6AAAMBr/////////4A4AAAgD///wD+AAAILH/////////gDwAAIAD///4H8AABwYP////////+AHgAAgAH///+f8AAGQ//////////+gMAAAAAD///9/+AAN3///////////gIAAAAAD///5/8AAD///////////+AAAAAAAH///3/wAAB///////////8AAAAAAAP////wQAAP///////////8AAAAAAAP////ZwAAP//9////////oAAAAAAAP////gQAAP/+Xx//////+BAAAAAAAf////gAAA/n8Pv//////8gAAAAAAA////5AAAfxnwHP//////RgAAAAAAB////wAAAfBnmPf/////8EAAAAAAAD////gAAA8IJ/+f/////4IAAAAAAAH///8AAAB4AJ/8/////wwQAAAAAAAP///wAAADgET/5/////8ggAAAAAAAP///gAAAAfAAf//////hHAAAAAAAAf///AAAAH+AA///////g4AAAAAAAAf//8AAAIf/AB///////CAAAAAAAAAf//wAAAB//PX//////+AAAAAAAAAAP//AAAAD////7/////8AAAAAAAAAA//iAAAAP////7/////4AAAAAAAAAAfwGAAAA////fw/////gAAAAAAAAABfgGAAAB////fwD////AAAAAAAAAABfAAAAAH///+f+D///9AAAAAAAAAAAeAAAAAP///+/8F/v/AAAAAAAAAAAA8BQAAAf///9/wD+PwAAAAAAAAAAAB8QcAAA////5/gHwfgEAAAAAAAAAAB7gPAAB////58APAfgIAAAAAAAAAAA/AAAAD////zwAcAfggAAAAAAAAAAAPgAAAH////2AAYAPAAAAAAAAAAAAAHAAAAP////xAAwAOBAAAAAAAAAAAACAAAAP////+ABgAABAAAAAAAAAAAAEP4AAf////4AAgEABAAAAAAAAAAAAG/4AAf////wABAEAOAAAAAAAAAAAAB/4AAIH///AAAAkDAAAAAAAAAAAAAD/+AAAD//+AAAAoMAAAAAAAAAAAAAH/8AAAH//wAAAAx8AAAAAAAAAAAAAf/8AAAP//gAAABjwAAAAAAAAAAAAA//4AAAf/+AAAABnpdAAAAAAAAAAAD//+AAAf/4AAAADBYPgAAAAAAAAAAD///gAA//wAAAACAgHmAAAAAAAAAAP///gAA//gAAAABwAHgAAAAAAAAAAP///gAB//AAAAAAPQEhAAAAAAAAAAf//+AAD/+AAAAAAAAAgAAAAAAAAAAf//8AAH/8AAAAAAAEQAAAAAAAAAAA///wAAf/4QAAAAAA4gAABAAAAAAAA///AAA//wgAAAAAH5gAgAAAAAAAAB//+AAB//HAAAAAAf7AAAAAAAAAAAA//8AAD/8OAAAAAB//AAAAAAAAAAAA//4AAD/4cAAAAAH//AAAAAAAAAAAB//wAAH/wwAAAAA//+AAAAAAAAAAAD//AAAP/hgAAAAD//+AAAAAAAAAAAH/4AAAP+CAAAAAH//+AAAAAAAAAAAP/gAAAf8AAAAAAP//8AAAAAAAAAAA//AAAA/wAAAAAAP//4AAAAAAAAAAB/+AAAA/gAAAAAAf//wAAAAAAAAAAD/4AAAB+AAAAAAA///gAAAAAAAAAAH/gAAAD4AAAAAAB8H+AAAAAAAAAAAP/AAAAAAAAAAAADAD8AAAAAAAAAAAf8AAAAAAAAAAAAAAH4AIAAAAAAAAB/gAAAAAAAAAAAAAAHgAIAAAAAAAAD/AAAAAAAAAAAAAAAAAAYAAAAAAAAH4AAAAAAAAAAAAAAAAAAgAAAAAAAAPwAAAAAAAAAAAAAAAMAGAAAAAAAAAeAAAAAAAAAAAAAAAAAAIAAAAAAAAA8AAAAAAAAAAAAAAAAABgAAAAAAAAA4AAAAAAAAAAAAAAAAADAAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAwQAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" },
    japan: { cols: 62, rows: 62, aspect: 1, school: [39, 40], data: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAHgAAAAAAAAAYAAAAAAAAAHAAAAAAAAAB4AAAAAAAAAfBAAAAAAAAH+AAAAAAAAD/4AAAAAAAA//AAAAAAABP/4AAAAAAAf/4AAAAAAAP/gAAAAAAAH/wAAAAAAABgcAAAAAAAAMBAAAAAAAADgAAAAAAAAAgAAAAAAAAADAAAAAAAAABAAAAAAAAAAcAAAAAAAAAfAAAAAAAAAD4AAAAAAAAA+AAAAAAAAAPwAAAAAAAAD8AAAAAAAAA/AAAAAAAAAfgAAAAAAAAHwAAAAAAAAD8AAAAAAAAA+AAAAAAAACPAAAAAAAAAP4AAAAAAABD+AAAAAAAAh/gAAAAAAAJ/4AAAAAAAD/8AAAAAAAB//AAAAAAEA//gAAAAAAAP/8AAAAAAAj/7AAAAAAP///gAAAAAH//+QAAAAAD/++gAAAAED/DwAAAAAAD0R8AAAAAAA0ucAAAAAACYPjAAAAAAAfvQAAAAAAAP5gAAAAAAALeYAAAAAAAEHgAAAAAAAAFwAAAAAAAAA8AAAAAAAAAPAAAAAAAAACwAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAA==" } };
  const bitOf = (m) => { const b = atob(m.data); return (c, r) => (b.charCodeAt((r * m.cols + c) >> 3) >> (7 - ((r * m.cols + c) & 7))) & 1; };
  // Stamp one dot map onto a w×h canvas — diameter at the cell center = Dots of cell × ratio. If no color is given, default fill (the shader reads only alpha)
  function drawDots(cv, m, w, h, ratio, color) {
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d"), on = bitOf(m), cw = w / m.cols, ch = h / m.rows, r = (Math.min(cw, ch) * ratio) / 2;
    if (color) ctx.fillStyle = color;
    ctx.beginPath();
    for (let y = 0; y < m.rows; y++) for (let x = 0; x < m.cols; x++) if (on(x, y)) { const px = (x + 0.5) * cw, py = (y + 0.5) * ch; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); }
    ctx.fill();
    return cv;
  }

  const I = {
    // Arrow as a symbol like the original (<symbol>) <use> Called and drawn this way — the color changes with currentColor alone
    arw: '<svg viewBox="0 0 12 12" aria-hidden="true"><use href="#mk-arw"/></svg>',
    tri: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M4 2.5 8.5 6 4 9.5z"/></svg>',
    dl: '<svg viewBox="0 0 12 12" aria-hidden="true"><use href="#mk-dl"/></svg>',
    globe: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="7" cy="7" r="5.6"/><path d="M1.4 7h11.2M7 1.4c1.8 1.6 1.8 9.6 0 11.2M7 1.4c-1.8 1.6-1.8 9.6 0 11.2"/></svg>',
    up: '<svg viewBox="0 0 21 12" aria-hidden="true"><use href="#mk-up"/></svg>',
  };
  const arw = (cls = "") => `<span class="arw ${cls}">${I.arw}${I.arw}</span>`;
  // School mark slot: the original crest isn’t used, a shield-shaped shape of the same size stands in. The three lines are cut-out holes, so they stay visible when the logo color changes
  const crest = '<svg viewBox="0 0 44 44" aria-hidden="true"><path fill-rule="evenodd" d="M22 3 38 9v12c0 10-7 17-16 20C13 38 6 31 6 21V9zM15 14.9h14v2.2H15zM15 20.9h14v2.2H15zM15 26.9h9v2.2h-9z" fill="currentColor"/></svg>';
  const logo = `<a href="index.html" aria-label="Home">${crest}<b>School Name<small>Your school name in one line here</small></b></a>`;

  const NAV = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "news.html", label: "News", key: "news" },
    { href: "about.html", label: "About the School", key: "about" },
    { href: "works.html", label: "Character", key: "works" },
    { href: "index.html#feature", label: "International education" },
    { href: "index.html#feature", label: "Dormitory" },
    { href: "career.html", label: "Career Info", key: "career" },
    { href: "index.html#exams", label: "Admissions Guide" },
    { href: "index.html#footer", label: "Directions" },
  ];
  const curKey = { results: "career" }[page] || page;
  const SUBS = ["Your newsletter here", "Students · Guardians", "Graduate", "Hiring Info", "Inquiry"];
  const SITEMAP = [
    { label: "About the School", href: "about.html", kids: ["Principal’s Greeting", "Educational Philosophy", "History", "Your sustainable practice here", "Facility Guide"] },
    { label: "Character", href: "works.html", kids: ["General class", "Academic club", "International Class", "International Baccalaureate class", "Science-focused program", "Your gallery here"] },
    { label: "Career Info", href: "career.html", kids: ["Career Guidance", "Admission Results"] },
    { label: "News", href: "news.html", kids: ["School life · Events", "Admissions News", "Event details", "Club activities"] },
  ];
  const sitemapHTML = () => `<nav class="sitemap-nav">${SITEMAP.map((g) => `<ul><li><a class="lv0" href="${g.href}">${arw()}<span>${g.label}</span></a>
      <div class="lv1">${g.kids.map((k) => `<a href="${g.href}">${k}</a>`).join("")}</div></li></ul>`).join("")}</nav>`;

  function buildChrome() {
    document.body.insertAdjacentHTML("afterbegin", '<svg aria-hidden="true" style="display:none"><symbol id="mk-arw" viewBox="0 0 12 12"><path d="M2.5 6h7M6.5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></symbol><symbol id="mk-dl" viewBox="0 0 12 12"><path d="M6 1.5v6.5M3 5.5 6 8.5l3-3M2 10.5h8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></symbol><symbol id="mk-up" viewBox="0 0 21 12"><path d="M.9 11.1 10.5 1.5l9.6 9.6" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol></svg>');
    const header = $('[data-slot="header"]');
    if (header) {
      header.className = "l-header";
      header.innerHTML = `<div class="l-header__inner">
        <p class="logo">${logo}</p>
        <div class="m-sub"><nav><ul style="display:flex">${SUBS.map((s) => `<li><a class="uline" href="#"><span class="line">${s}</span></a></li>`).join("")}</ul></nav></div>
        <div class="m-lang"><a class="uline" href="#">${I.globe}<span class="line">EN</span></a></div>
        <div class="m-req"><a href="#" data-hover="circle"><span>Download materials</span>${I.dl}</a></div>
        <div class="m-global"><nav><ul>${NAV.map((n) => `<li><a class="uline" href="${n.href}"${n.key === curKey ? ' aria-current="page"' : ""}><span class="line">${n.label}</span></a></li>`).join("")}</ul></nav></div>
      </div>`;
    }
    const db = $('[data-slot="drawer-button"]');
    if (db) {
      db.className = "m-drawer-button";
      db.innerHTML = `<button type="button" data-hover="circle" aria-label="Menu" aria-expanded="false"><span class="bars"><i></i><i></i><i></i><i></i><i></i></span><span class="mtext"><span>Menu</span><span>Close</span></span></button>`;
    }
    const dr = $('[data-slot="drawer"]');
    if (dr) {
      dr.className = "m-drawer";
      dr.innerHTML = `<div class="m-drawer__container">${sitemapHTML()}
        <div class="m-drawer__foot"><div class="subs">${SUBS.map((s) => `<a href="#">${s}</a>`).join("")}</div>
        <a class="btn uline-r" href="#" data-hover="circle"><span class="line">Download materials</span>${arw()}</a></div></div>`;
    }
    const bnr = $('[data-slot="banners"]');
    if (bnr) {
      bnr.className = "l-bnr";
      const labels = ["School banner · navy background logo · square", "Admissions site banner · sky blue · square", "Club banner · field photo · square", "Library banner · bookshelf photo · square", "Newsletter banner · Text on white · Square", "International education banner · globe · square", "Dorm banner · building exterior · square"];
      bnr.innerHTML = `<div class="l-bnr__inner"><div class="m-control"><button class="nav-sq is-prev" type="button" data-hover="circle" aria-label="Previous" style="rotate:180deg">${I.tri}</button>
        <button class="nav-sq is-next" type="button" data-hover="circle" aria-label="Next">${I.tri}</button><div class="m-control__pagination"></div></div>
        <div class="l-bnr__vp swiper"><div class="l-bnr__list swiper-wrapper">${labels.map((l) => `<a class="swiper-slide" href="#"><span class="wf-img" data-label="${l}"></span></a>`).join("")}</div></div></div>`;
    }
    const cta = $('[data-slot="cta"]');
    if (cta) {
      cta.className = "l-cta";
      cta.dataset.toggleColor = "add";
      cta.innerHTML = `<div class="l-cta__mat"><canvas data-world="cta"></canvas></div><div class="container l-cta__inner">
        <div class="l-cta-item"><div class="l-cta-item__head"><p>Admissions</p><h2>Admissions Guide</h2></div>
          <div class="l-cta-item__body"><p>Your download guide for admissions info and application guidelines here.<br class="is-pc">Set in two lines.</p><a class="cta-btn" href="index.html#exams" data-hover="circle"><span>View details</span><span class="ic">${I.arw}${I.arw}</span></a></div></div>
        <div class="l-cta-item"><div class="l-cta-item__head"><p>Request</p><h2>Request Materials</h2></div>
          <div class="l-cta-item__body"><p>Your note here that the school brochure can be downloaded.<br class="is-pc">Put the notice in two lines.</p><a class="cta-btn" href="#" data-hover="circle"><span>Download</span><span class="ic">${I.dl}${I.dl}</span></a></div></div>
      </div>`;
    }
    const footer = $('[data-slot="footer"]');
    if (footer) {
      footer.className = "l-footer";
      footer.id = "footer";
      footer.innerHTML = `<div class="m-sitemap"><button class="m-sitemap__toggle-btn uline" type="button" aria-expanded="false" aria-label="View Sitemap"><span class="m-sitemap__toggle-el"><span class="m-sitemap__toggle-bar"><span class="bar-wrap is-menu"><span class="bar"></span><span class="bar"></span><span class="bar"></span></span></span><span class="m-sitemap__toggle-text"><span class="text is-menu"><span class="line">View Sitemap</span></span></span></span><span class="m-sitemap__toggle-el"><span class="m-sitemap__toggle-bar"><span class="bar-wrap is-close"><span class="bar"></span><span class="bar"></span></span></span><span class="m-sitemap__toggle-text"><span class="text is-close"><span class="line">Close</span></span></span></span></button>
          <div class="m-sitemap__content"><div><div class="m-sitemap__container">${sitemapHTML()}</div></div></div></div>
        <div class="l-footer__inner">
          <div class="l-footer__logo">${crest}<b>School Name</b></div>
          <dl><dt>Address</dt><dd><a class="uline" href="#"><span class="line">Postal code 000-0000 Your address line here</span></a>${arw()}</dd></dl>
          <div class="l-footer__tel"><dl><dt>Tel</dt><dd><a class="uline" href="#"><span class="line">000-000-0000</span></a></dd></dl><dl><dt>Fax</dt><dd>000-000-0000</dd></dl>
            <button class="to-top" type="button" aria-label="Back to top"><span class="arrow">${I.up}</span><span class="label">Page Top</span></button></div>
          <p class="l-footer__copy">© School Name</p>
        </div>`;
    }
  }

  // ── Circle spread · arrow swap ──
  function initHover() {
    if ("ontouchstart" in document) return;
    $$('[data-hover="circle"]').forEach((el) => {
      const c1 = document.createElement("span"), c2 = document.createElement("span");
      c1.className = "c1"; c2.className = "c2";
      el.prepend(c1, c2);
      if (reduce) return;
      const to = (t, scale, z, d) => gsap.to(t, { scale, zIndex: z, duration: d, ease: d ? "sine.out" : "none", overwrite: "auto" });
      el.addEventListener("mouseenter", () => { to(c1, 0, 0, 0); to(c2, 1, 0, 0); to(c1, 1, 1, 0.3); });
      el.addEventListener("mouseleave", () => { to(c2, 0, 0, 0); to(c1, 1, 0, 0); to(c2, 1, 1, 0.3); });
    });
    $$(".arw, .cta-btn .ic, .to-top .arrow").forEach((a) => {
      const host = a.closest("a, button");
      // Reference links in body text (with the round arrow in front) — in the original the arrow does not change, only the circle color changes immediately
      if (!host || reduce || host.classList.contains("file-link")) return;
      const s1 = a.querySelector("svg:first-child"), s2 = a.querySelector("svg:last-child");
      const mv = (t, x, d) => gsap.to(t, { x, y: 0, duration: d, ease: d ? "sine.out" : "none", overwrite: "auto" });
      // The single-arrow Back to top stays exited from 0 to 110% (up) as in the original (the next time it rises, it exits from 0 again)
      const single = s1 === s2;
      host.addEventListener("mouseenter", () => { mv(s1, "0%", 0); if (single) return mv(s1, "110%", 0.3); mv(s2, "-110%", 0); mv(s1, "110%", 0.3); mv(s2, "0%", 0.3); });
    });
  }

  // ── Header band shrinks (from 1px of scroll) · drawer · sitemap · back to top ──
  function initHeader() {
    const header = $(".l-header");
    const hero = $('[data-trigger="hero"]');
    // Original data-toggle-update-mod·color: when the top of the marked cell touches 1px below the top of the screen, the header band shrinks (Pick up on the first page, breadcrumbs on sub pages),
    // Touching a dark cell (add) turns the logo white, touching a light cell (remove) turns it navy again
    $$("[data-toggle-mod]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 1px", end: "bottom bottom",
      onEnter: () => doc.classList.add("is-mod"), onLeaveBack: () => doc.classList.remove("is-mod") }));
    $$("[data-toggle-color]").forEach((el) => {
      const add = el.dataset.toggleColor === "add";
      ScrollTrigger.create({ trigger: el, start: "top 1px", end: "bottom bottom",
        onEnter: () => doc.classList.toggle("is-color", add), onLeaveBack: () => doc.classList.toggle("is-color", !add) });
    });
    const setWhite = () => header?.classList.toggle("is-white", scrollY > 1 && !hero);
    addEventListener("scroll", setWhite, { passive: true });
    setWhite();
    const btn = $(".m-drawer-button button");
    btn?.addEventListener("click", () => {
      const open = doc.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close" : "Menu");
    });
    addEventListener("keydown", (e) => e.key === "Escape" && doc.classList.remove("nav-open"));
    const sm = $(".m-sitemap");
    $(".m-sitemap__toggle-btn")?.addEventListener("click", (e) => {
      const open = sm.classList.toggle("is-open");
      e.currentTarget.setAttribute("aria-expanded", open);
      e.currentTarget.setAttribute("aria-label", open ? "Close Sitemap" : "View Sitemap");
    });
    $$(".p-side h2").forEach((h) => h.addEventListener("click", () => !isPC() && h.parentElement.classList.toggle("is-open")));
    $$(".to-top").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));
  }

  // ── slider panel: same Swiper 8.4.7 as the original · same settings (speed 500 · slidesPerView auto · 5s autoplay, does not stop on touch) ──
  // Auto-advance runs and the control buttons appear only when at least 10% of the board is visible (original IntersectionObserver).
  const sliders = [];
  function makeSwiper(box, extra) {
    const el = $(".swiper", box);
    if (!el || !window.Swiper) return null;
    const sw = new Swiper(el, { speed: 500, slidesPerView: "auto", autoplay: { delay: 5000, disableOnInteraction: false },
      navigation: { prevEl: $(".m-control .is-prev", box), nextEl: $(".m-control .is-next", box) },
      pagination: { el: $(".m-control__pagination", box), clickable: true }, ...extra });
    if (reduce) sw.autoplay.stop();
    sliders.push(sw);
    return sw;
  }
  function watchSliders() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const sw = e.target.swiper, ctl = $(".m-control", e.target.closest("[data-swiper]") || e.target.parentNode);
      ctl?.classList.toggle("is-inview", e.isIntersecting);
      if (!reduce) e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop();
    }), { threshold: 0.1 });
    sliders.forEach((sw) => io.observe(sw.el));
  }
  function initBanner() {
    const box = $(".l-bnr");
    if (box) makeSwiper(box, { loop: false, breakpoints: { 1025: { loop: true } } });
  }

  // ── Speckle border image: a repeating tile full at the bottom, with dots thinning upward (27 wide · 166 tall) ──
  function joinTile() {
    let dots = "";
    for (let r = 0; r < 13; r++) {
      const y = 100 - r * 8;
      const rad = Math.max(0.4, 6.4 - r * 0.5);
      const off = r % 2 ? 6.75 : 0;
      for (let c = -1; c < 3; c++) dots += `<circle cx="${(c * 13.5 + off).toFixed(2)}" cy="${y}" r="${rad.toFixed(2)}"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="27" height="166" viewBox="0 0 27 166"><g fill="currentColor"><rect x="0" y="108" width="27" height="58"/>${dots}</g></svg>`;
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
  }
  // Dot shape via mask, color via the CSS data-color fill — changing the skin changes the edge color too
  function initJoins() {
    $$(".m-join").forEach((j) => j.style.setProperty("--join-mask", joinTile()));
  }

  // ── Dotted world map behind the enrollment CTA (original 130.8×84.6rem plate, slightly lighter navy dots on a navy background) ──
  function initWorlds() {
    const draw = () => $$('canvas[data-world="cta"]').forEach((c) => {
      const w = c.clientWidth, h = c.clientHeight;
      if (w && h) drawDots(c, MAPS.world, Math.round(w * Math.min(2, devicePixelRatio)), Math.round(h * Math.min(2, devicePixelRatio)), 0.57, cssOf("--site-cta-dot"));
    });
    draw();
    addEventListener("resize", draw);
  }
  // ── Subpage open (original __page.first): the opening curtain lifts with 1s power2.inOut and the header band enters at .5s. The first page is handled by index.js ──
  function initOpen() {
    if (page === "home") return;
    const splash = $(".m-splash");
    if (reduce) return splash?.remove();
    gsap.set($$(".l-header .logo a, .l-header .m-global, .l-header .m-sub, .l-header .m-lang, .l-header .m-req"), { opacity: 0 });
    // The original opens after all images and fonts have loaded (load)
    const run = () => {
    gsap.to(splash, { opacity: 0, duration: 1, ease: "power2.inOut", onComplete: () => splash?.remove() });
    gsap.to($$(".l-header .logo a, .l-header .m-global, .l-header .m-sub, .l-header .m-lang, .l-header .m-req"), { opacity: 1, duration: 0.5, ease: "power2.inOut" });
    };
    document.readyState === "complete" ? run() : addEventListener("load", run, { once: true });
  }

  // ── Enters from 2rem below over .85s ──
  function initFade() {
    const els = $$("[data-fade]");
    if (reduce) return els.forEach((e) => e.classList.add("is-in"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -20% 0px" });
    els.forEach((e) => io.observe(e));
  }

  buildChrome();
  initJoins();
  initHover();
  initHeader();
  initBanner();
  initWorlds();
  initFade();
  initOpen();
  // Home page slide panels (Pick up · newsletter) are built by index.js — watched once after all are built.
  addEventListener("DOMContentLoaded", watchSliders);
  window.MK = { gsap, isPC, reduce, MAPS, drawDots, rgbOf, cssOf, makeSwiper, watchSliders, arw, I, $, $$ };
})();
