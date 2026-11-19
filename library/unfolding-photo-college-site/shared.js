// Common to all pages: draws in the header bar (mega menu), phone menu, bottom fixed strip, back to top and sitemap footer, and hooks up scroll indicator, accordion, reveal and number counting.
// Original values: past scroll 0 adds is-scrolled (50ms interval), the mega menu opens when the hand enters and closes when it leaves, collapsible .5s power2.inOut,
// Appears after scrolling past 500px, click scrolls to top with a .5s swing. Number counting starts when the element is within 90% to 10% of the screen and runs linear for data-duration (ms).
(() => {
  const html = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NC = (window.NC = { reduced, page, ready: [] });
  NC.onReady = (fn) => (NC.loaded ? fn() : NC.ready.push(fn));

  // Placeholder symbol instead of the original logo — only one of nine cells painted in the accent color
  const mark = `<svg viewBox="0 0 40 46" aria-hidden="true"><rect x="0" y="0" width="40" height="34" rx="2" fill="var(--kf-ink)"/><g fill="var(--kf-bg)"><rect x="4" y="4" width="9" height="7"/><rect x="15.5" y="4" width="9" height="7"/><rect x="27" y="4" width="9" height="7"/><rect x="4" y="13.5" width="9" height="7"/><rect x="27" y="13.5" width="9" height="7"/><rect x="4" y="23" width="9" height="7"/><rect x="15.5" y="23" width="9" height="7"/><rect x="27" y="23" width="9" height="7"/></g><rect x="15.5" y="13.5" width="9" height="7" fill="var(--kf-accent)"/><rect x="0" y="38" width="40" height="3" fill="var(--kf-ink)"/><rect x="8" y="43" width="24" height="2" fill="var(--kf-ink)"/></svg>`;
  const icon = {
    x: '<svg viewBox="0 0 16 16"><path d="M9.5 6.8 15.3 0h-1.4L8.9 5.9 4.9 0H.3l6.1 8.9L.3 16h1.4l5.3-6.2 4.3 6.2h4.6Z"/></svg>',
    ig: '<svg viewBox="0 0 16 16"><path d="M8 1.4c2.1 0 2.4 0 3.3.1 2.2.1 3.1 1.1 3.2 3.2.1.9.1 1.1.1 3.3s0 2.4-.1 3.3c-.1 2.1-1 3.1-3.2 3.2-.9 0-1.1.1-3.3.1s-2.4 0-3.3-.1c-2.2-.1-3.1-1.1-3.2-3.2C1.4 10.4 1.4 10.1 1.4 8s0-2.4.1-3.3C1.6 2.6 2.5 1.6 4.7 1.5c.9-.1 1.2-.1 3.3-.1ZM8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.6A2.6 2.6 0 1 1 8 5.4a2.6 2.6 0 0 1 0 5.2Zm4.2-7.7a1 1 0 1 0 0 1.9 1 1 0 0 0 0-1.9Z"/></svg>',
    line: '<svg viewBox="0 0 16 16"><path d="M13 0H3a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3Zm-5 12.3c-.3.2-1.6 1-2 .9.3-.3.4-.9.3-1.1C3.7 11.6 2 9.9 2 7.9 2 5.4 4.7 3.5 8 3.5s6 1.9 6 4.4-2.7 4.4-6 4.4Z"/></svg>',
    yt: '<svg viewBox="0 0 16 16"><path d="M15.7 4.3a2 2 0 0 0-1.4-1.4C13 2.6 8 2.6 8 2.6s-5 0-6.3.3A2 2 0 0 0 .3 4.3 21 21 0 0 0 0 8a21 21 0 0 0 .3 3.7 2 2 0 0 0 1.4 1.4c1.3.3 6.3.3 6.3.3s5 0 6.3-.3a2 2 0 0 0 1.4-1.4A21 21 0 0 0 16 8a21 21 0 0 0-.3-3.7ZM6.4 10.4V5.6L10.6 8Z"/></svg>',
    tt: '<svg viewBox="0 0 16 16"><path d="M11.4 0H8.7v10.9a2.3 2.3 0 1 1-1.6-2.2V6a5 5 0 1 0 4.3 4.9V5.4A6.4 6.4 0 0 0 15 6.6V3.9A3.7 3.7 0 0 1 11.4 0Z"/></svg>',
    book: '<svg viewBox="0 0 20 20"><path d="M10 4.5C8.3 3.2 5.8 2.6 2 2.6v13.2c3.8 0 6.3.6 8 1.9 1.7-1.3 4.2-1.9 8-1.9V2.6c-3.8 0-6.3.6-8 1.9Zm-1 11c-1.5-.8-3.5-1.2-5.6-1.3V4.1c2.6.1 4.3.6 5.6 1.5Zm7.6-1.3c-2.1.1-4.1.5-5.6 1.3V5.6c1.3-.9 3-1.4 5.6-1.5Z"/></svg>',
    cap: '<svg viewBox="0 0 20 20"><path d="m10 3-10 5 10 5 8-4v5h2V8Zm-6 7.6V14c1.5 1.3 3.7 2 6 2s4.5-.7 6-2v-3.4l-6 3Z"/></svg>',
    entry: '<svg viewBox="0 0 20 20"><path d="M11 2v2h5v12h-5v2h7V2Zm-2.6 3.6L7 7l2 2H2v2h7l-2 2 1.4 1.4L12.8 10Z"/></svg>',
  };
  const sns = `<a href="#" aria-label="X">${icon.x}</a><a href="#" aria-label="Social Media">${icon.ig}</a><a href="#" aria-label="Line">${icon.line}</a><a href="#" aria-label="Video">${icon.yt}</a><a href="#" aria-label="Tick-tock">${icon.tt}</a>`;

  // Seven menu items — those leading to our pages go to that file
  const NAV = [
    { k: "school", t: "About the School", en: "SCHOOL", href: "about.html", cards: ["The people we nurture", "Feature List", "Directions", "School Facilities"] },
    { k: "course", t: "Major list", en: "COURSE", href: "index.html#course", cards: ["Game world", "Illustration · Design", "CG · Video", "Esports", "AI·IT Technology", "Majors at a glance"] },
    { k: "education", t: "Education System", en: "EDUCATION", href: "service.html", cards: ["Company Project", "Industry-academia education", "Qualification Support", "Overseas training"] },
    { k: "campuslife", t: "Campus Life", en: "CAMPUS LIFE", href: "lookbook.html", cards: ["Photo Gallery", "A Student’s Day", "Annual schedule", "Student Interview"] },
    { k: "career", t: "Debut · Employment", en: "CAREER", href: "career.html", cards: ["Esports support · Results", "Placement Record", "Debut Record", "Company interview"] },
    { k: "admissions", t: "Admissions Guide", en: "ADMISSIONS", href: "#", cards: ["Departments admitted", "Admissions Schedule", "Tuition Aid", "Online application"] },
    { k: "visitor", t: "By Visitor", en: "VISITOR", href: "#", cards: ["High school student", "Guardian", "Working adult", "International student"] },
  ];
  const cardHref = { "The people we nurture": "about.html", "Feature List": "list.html", "Company Project": "service.html", "Photo Gallery": "lookbook.html", "Esports support · Results": "detail.html" };
  const curOf = { about: "school", list: "school", service: "education", lookbook: "campuslife", career: "career", detail: "career" };

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("nc-head");
    // In the original, subpages also have an inverted header (white text) laid over the red header band
    head.setAttribute("data-invert", "");
    head.innerHTML = `
      <div class="nc-head__inner">
        <h1 class="nc-head__title"><a class="nc-head__link" href="index.html" aria-label="Home"><span class="nc-head__mark">${mark}</span><span class="nc-head__name"><svg viewBox="0 0 222 30" aria-label="School Name"><text x="0" y="8" font-size="7" font-weight="500">Your one-line corporate name here</text><text x="0" y="26" font-size="16" font-weight="900">Your school name wordmark here</text></svg></span></a></h1>
        <div class="nc-head__body">
          <div class="nc-head__sub"><p class="nc-head__sub-links"><a href="#">Directions</a><a href="#">Inquiry</a><a href="#">One line of certification notice · disclosure</a></p><p class="nc-head__sns">${sns}</p></div>
          <nav class="nc-gnav" aria-label="Main menu"><ul class="nc-gnav__menu">
            ${NAV.map((n) => `<li class="nc-gnav__item${curOf[page] === n.k ? " is-current" : ""}" data-megamenu><a class="nc-gnav__link" href="${n.href}">${n.t}</a>
              <div class="nc-drop"><div class="nc-drop__inner"><div class="nc-drop__head"><p class="nc-drop__jp">${n.t}</p><p class="nc-drop__en nc-en">${n.en}</p></div>
              <div class="nc-drop__menu"${n.cards.length > 4 ? ' data-cols="3"' : ""}>${n.cards.map((c, i) => `<a class="nc-drop__card" href="${cardHref[c] || "#"}"><div class="wf-img" data-label="${n.t} ${i + 1} · Classroom/student scene · landscape 16:9"></div><span>${c}</span></a>`).join("")}</div></div></div></li>`).join("")}
          </ul></nav>
        </div>
        <div class="nc-head__btns"><a class="nc-sq" data-color="dark-blue" href="#">${icon.book}Brochure Request</a><a class="nc-sq" data-color="light-red" href="#">${icon.cap}Open Campus</a></div>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<button class="nc-burger" type="button" aria-label="Open Menu" data-slot="drawer-button"><i></i><i></i><i></i></button>
      <nav class="nc-spnav" aria-label="Phone menu" data-slot="drawer"><div class="nc-spnav__list">
        <div class="nc-spnav__btns"><a class="nc-sq" data-color="dark-blue" href="#">${icon.book}Brochure Request</a><a class="nc-sq" data-color="light-red" href="#">${icon.cap}Open Campus</a></div>
        ${NAV.map((n) => `<div class="nc-acc"><button class="nc-acc__toggle" type="button">${n.t}<span class="nc-acc__icon"></span></button><div class="nc-acc__body">${n.cards.map((c) => `<a href="${cardHref[c] || "#"}">${c}</a>`).join("")}</div></div>`).join("")}
      </div></nav>
      <div class="nc-float" data-slot="float-bar"><a href="#">Brochure Request</a><a href="#">Chat consultation</a><a href="#">Open Campus</a></div>
      <button class="nc-pagetop" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24"><path d="m4 16 8-8 8 8"/></svg></button>`,
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const list3 = (a) => `<div class="nc-sitemap__row">${a.map((col) => `<ul>${col.map((t) => `<li><a class="nc-smap-link" href="#">${t}</a></li>`).join("")}</ul>`).join("")}</div>`;
    const sub = (t, items, href = "#") => `<li><a class="nc-smap-link" href="${href}">${t}</a><div class="nc-smap-sub">${items.map((s) => `<a href="#">${s}</a>`).join("")}</div></li>`;
    const course = [["game", "Game world"], ["illust", "Illustration, design and animation world"], ["cg", "CG·Video World"], ["e-sports", "eSports World"], ["ai", "AI·IT Tech World"]];
    foot.innerHTML = `
      <div class="nc-sitemap"><div class="nc-sitemap__inner">
        ${list3([["For those considering admission", "Working adult", "International student"], ["High school senior", "Students · Guardians", "Company recruiter"], ["High school year 1·2 students", "Graduate", "High School Teacher"]])}
        <p class="nc-sitemap__cap">• Majors list</p>
        <div class="nc-sitemap__row nc-smap-drops">${[0, 1, 2].map((c) => `<div>${course.filter((_, i) => i % 3 === c).map(([k, t]) => `<div class="nc-smap-drop" data-course="${k}"><a class="nc-smap-drop__head" href="index.html#course">${t}<span class="nc-smap-drop__plus"></span></a><div class="nc-smap-drop__body"><a href="#">Major 1 · Your major name here</a><a href="#">Major 2 · Your major name here</a><a href="#">Major 3 · Your major name here</a><a href="#">Major 4 · Your major name here</a></div></div>`).join("")}</div>`).join("")}</div>
        <div class="nc-sitemap__row">
          <ul>${sub("About the School", ["The people we nurture", "Directions", "Feature List", "School Facilities", "Frequently asked questions", "Information disclosure"], "about.html")}${sub("Debut · Employment", ["Esports tryout application", "Placement Record", "Job Placement Support", "Hiring Schedule", "Debut Record", "Debut Support", "Company interview", "Industry column"], "career.html")}</ul>
          <ul>${sub("Education System", ["Industry-academia education", "Company Project", "Qualification Support", "Overseas training", "Instructor Intro"], "service.html")}${sub("Admissions Guide", ["Admissions departments · majors", "Eligibility and selection", "AO admissions", "General Admissions", "Recommended Admissions", "Tuition Aid", "Success story", "Online application"])}</ul>
          <ul>${sub("Campus Life", ["Photo Gallery", "A Student’s Day", "Annual schedule", "Student Interview", "Dormitory"], "lookbook.html")}<li><a class="nc-smap-link" href="#">Student Work</a></li><li><a class="nc-smap-link" href="#">Open Campus</a></li><li><a class="nc-smap-link" href="#">Brochure Request</a></li><li><a class="nc-smap-link" href="#">Inquiry</a></li><li><a class="nc-smap-link" href="#">Privacy policy</a></li></ul>
        </div>
      </div></div>
      <div class="nc-foot"><div class="nc-foot__inner">
        <div><a class="nc-foot__logo" href="index.html">${mark.replace(/var\(--kf-ink\)/g, "var(--kf-contrast-ink)").replace(/var\(--kf-bg\)/g, "var(--kf-contrast-bg)")}<span><small>Your one-line corporate name here</small><b>Your school name wordmark here</b></span></a>
          <p class="nc-foot__addr">ZIP 000-0000 Your school address here, one line</p>
          <p class="nc-foot__contact"><span>TEL<b>0000-000-000</b></span><span>MAIL<b>info@example.ac</b></span></p>
          <p class="nc-foot__links"><a href="#">Privacy policy</a><a href="#">Social media approach</a></p></div>
        <div class="nc-foot__side"><p class="nc-foot__sns">${sns}</p><p class="nc-foot__copy">© SCHOOL NAME HERE. ALL RIGHTS RESERVED.</p></div>
      </div></div>`;
  }

  // End of sub pages — contact box, two banners, related links — the same type on every page, so they are filled in here
  const arrowCircle = '<span class="nc-circle" data-color="white"></span>';
  document.querySelectorAll("[data-nc-fill]").forEach((box) => {
    const kind = box.dataset.ncFill;
    if (kind === "contact") box.innerHTML = `<div class="nc-contact"><p class="nc-contact__lead">Feel free to contact us if you have any questions.</p><a class="nc-btn" href="#">Send via contact form</a><p class="nc-contact__nums"><span>TEL<b>0000-000-000</b></span><span>MAIL<b>info@example.ac</b></span></p><p class="nc-contact__name">Your school name wordmark here</p><p class="nc-contact__addr">ZIP 000-0000 Your school address here, one line</p></div>`;
    if (kind === "cta") box.innerHTML = `<div class="nc-cta"><a href="#" data-fx="inset-clip-hover"><div class="wf-img" data-fx-part="media" data-label="Brochure request banner · large text on a pink background with a pamphlet · landscape 3.2:1"></div><p>Request school materials here ${arrowCircle}</p></a><a href="#" data-fx="inset-clip-hover"><div class="wf-img" data-fx-part="media" data-label="Open campus banner · sky-blue background, large text and a student · landscape 3.2:1"></div><p>Open campus details here ${arrowCircle}</p></a></div>`;
    if (kind === "links") {
      const cards = (box.dataset.cards ?? "People we nurture, Directions, Feature list").split(",").filter(Boolean);
      const rows = (box.dataset.rows || "").split(",").filter(Boolean);
      box.innerHTML = `<div class="nc-links__inner"><div class="nc-links__grid">${cards.map((c, i) => `<a class="nc-lcard" href="${cardHref[c] || "#"}" data-fx="inset-clip-hover"><div class="wf-img" data-fx-part="media" data-label="${c} · ${box.dataset.photo || "Student and classroom scene"} · Landscape 16:9"></div><p>${c}${arrowCircle}</p></a>`).join("")}${rows.map((r, i) => `<a class="nc-lrow${i === rows.length - 1 && box.dataset.redLast ? " -red" : ""}" href="${cardHref[r] || "#"}">${r}${arrowCircle}</a>`).join("")}</div><a class="nc-btn -center" href="${box.dataset.back || "index.html"}">${box.dataset.backLabel || "To the School About first page"}</a></div>`;
    }
  });

  // Scroll indicator — original ScrollPosition: 50ms interval, is-scrolled once past 0
  let lastSet = 0;
  const setScrolled = () => {
    html.classList.toggle("is-scrolled", scrollY > 0);
    document.querySelector(".nc-pagetop")?.classList.toggle("-show", scrollY > 500);
  };
  addEventListener("scroll", () => {
    const now = performance.now();
    if (now - lastSet >= 50) { lastSet = now; setScrolled(); } else setTimeout(setScrolled, 50);
  }, { passive: true });
  addEventListener("resize", setScrolled);
  setScrolled();

  // Mega menu — over the header bar sets is-header-on, over the menu opens that plate
  const inner = document.querySelector(".nc-head");
  inner?.addEventListener("mouseenter", () => html.classList.add("is-header-on"));
  inner?.addEventListener("mouseleave", () => html.classList.remove("is-header-on"));
  const triggers = [...document.querySelectorAll("[data-megamenu]")];
  const enter = (e) => {
    const t = e.currentTarget;
    if (t.classList.contains("is-open")) return;
    triggers.forEach((x) => x.classList.remove("is-open"));
    t.classList.add("is-open");
    html.classList.add("is-megamenu-open");
  };
  const leave = (e) => { e.currentTarget.classList.remove("is-open"); html.classList.remove("is-megamenu-open"); };
  triggers.forEach((t) => {
    // The original attaches only the current page’s menu after 1 second — so the plate under the cursor doesn’t unfold the moment it opens
    const bind = () => { t.addEventListener("mouseenter", enter); t.addEventListener("mouseleave", leave); };
    t.classList.contains("is-current") ? setTimeout(bind, 1000) : bind();
  });

  // Phone menu
  let open = false;
  document.querySelector(".nc-burger")?.addEventListener("click", () => {
    open = !open;
    html.classList.toggle("is-unscroll", open);
    html.classList.toggle("is-gnav-open", open);
  });

  // Collapsible — original Accordion
  document.querySelectorAll(".nc-acc").forEach((acc) => {
    const t = acc.querySelector(".nc-acc__toggle"), b = acc.querySelector(".nc-acc__body");
    if (!t || !b) return;
    t.addEventListener("click", () => {
      const on = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", on);
      gsap.to(b, { duration: reduced ? 0 : 0.5, height: on ? "auto" : 0, alpha: on ? 1 : 0, ease: "power2.inOut" });
    });
  });

  // Back to top: original jQuery animate 500ms swing(= sine.inOut)
  document.querySelector(".nc-pagetop")?.addEventListener("click", () => {
    if (reduced) return scrollTo(0, 0);
    gsap.to(window, { duration: 0.5, scrollTo: 0, ease: "sine.inOut" });
  });

  // Appear — original onscreen (tolerance 0): is-onscreen as soon as even one pixel is on screen
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-onscreen");
    io.unobserve(e.target);
  }), { threshold: 0 });
  NC.watch = (root = document) => root.querySelectorAll(".js-onscreen").forEach((el) => (reduced ? el.classList.add("is-onscreen") : io.observe(el)));

  // Number counting — original initCoutup
  const countUp = (el) => {
    const from = parseInt(el.dataset.from) || 0, to = parseInt(el.dataset.to) || 0, dur = parseInt(el.dataset.duration) || 1000;
    if (reduced) return (el.textContent = to);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor(from + (to - from) * p);
      p < 1 ? requestAnimationFrame(step) : (el.textContent = to);
    };
    requestAnimationFrame(step);
  };
  const checkCount = () => document.querySelectorAll(".js-count:not(.is-counted)").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.9 && r.bottom > innerHeight * 0.1) { el.classList.add("is-counted"); countUp(el); }
  });
  addEventListener("scroll", checkCount, { passive: true });

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Original Root: on a first visit (sessionStorage) play the opening screen and then open the page, otherwise open the page right away
  const initPage = () => {
    html.classList.add("is-page-loaded");
    NC.loaded = true;
    NC.watch();
    checkCount();
    NC.ready.splice(0).forEach((fn) => fn());
  };
  const opening = document.querySelector(".js-opening");
  const visited = sessionStorage.getItem("ncVisited");
  sessionStorage.setItem("ncVisited", "1");
  if (visited || reduced) {
    opening?.remove();
    if (document.readyState === "loading") addEventListener("DOMContentLoaded", initPage, { once: true });
    else initPage();
    return;
  }
  // In the original, even subpages without an opening panel wait through the same opening timeline (2.6 seconds) on a first visit before the page opens — the header photo blur-in is that late too
  if (!opening) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => gsap.delayedCall(2.6, initPage));
    return;
  }
  // The opening panel’s text is an image in the original, so it never changes late — run it after the font is ready so the text doesn’t swap on a late web font (1s at most)
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => gsap.timeline()
    .to(".js-opening-logo", { autoAlpha: 1, ease: "expo.out", scale: 1, duration: 0.8, delay: 0.2 })
    .to(".js-opening-logo-typo", { autoAlpha: 1, ease: "power3.out", y: 0, duration: 0.8 })
    .to(".js-opening", { duration: 0.4, display: "none", onStart: initPage }, "+=0.8"));
})();
