// Frame and motion shared by all pages. Values are read from style.css and script.js of the original site.
(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => matchMedia("(max-width: 768px)").matches;
  const page = document.body.dataset.page || "home";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(CustomEase);
  // Original CSS transition curve — used for the accordion height tween
  CustomEase.create("kwu", ".23,1,.32,1");

  const svg = (vb, body, cls = "") => `<svg class="${cls}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const I = {
    arrow: svg("0 0 12 12", '<path d="M2.5 9.5 9.5 2.5M4.5 2.5h5v5"/>'),
    book: svg("0 0 22 20", '<path d="M11 4.5C9 3 6 2.5 2 2.8v13.4c4-.3 7 .2 9 1.8 2-1.6 5-2.1 9-1.8V2.8c-4-.3-7 .2-9 1.7zM11 4.5V18"/>', "ico"),
    campus: svg("0 0 20 21", '<path d="M2 7.5 10 3l8 4.5M3 8.5h14M4.5 9v7M8 9v7M12 9v7M15.5 9v7M2 18.5h16"/>', "ico"),
    pc: svg("0 0 19 19", '<rect x="2" y="2.5" width="15" height="10" rx="1"/><path d="M7 16.5h5M9.5 12.5v4"/>', "ico"),
    search: svg("0 0 16 16", '<circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/>', "ico"),
    balloon: svg("0 0 12 12", '<path d="M1.5 2h9v6.5H5L2.5 10.5V8.5h-1z"/>'),
    pin: svg("0 0 10 13", '<path d="M5 12s4-4.2 4-7a4 4 0 0 0-8 0c0 2.8 4 7 4 7z"/><circle cx="5" cy="5" r="1.4"/>'),
    globe: svg("0 0 12 12", '<circle cx="6" cy="6" r="5"/><path d="M1 6h10M6 1c1.6 1.4 1.6 8.6 0 10M6 1c-1.6 1.4-1.6 8.6 0 10"/>'),
    heart: svg("0 0 12 11", '<path d="M6 10S1 7 1 3.8A2.6 2.6 0 0 1 6 2.6a2.6 2.6 0 0 1 5 1.2C11 7 6 10 6 10z"/>'),
    news: svg("0 0 12 12", '<path d="M2 2h8v8H2zM4 4.5h4M4 6.5h4M4 8.5h2"/>'),
    line: '<svg class="ico" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2.5c-4.7 0-8.5 3-8.5 6.8 0 3.3 3 6.1 7 6.7l-.3 2.3c0 .3.3.5.6.3l3.2-2.6c3.6-.8 6.5-3.4 6.5-6.7 0-3.8-3.8-6.8-8.5-6.8z"/></svg>',
    insta: svg("0 0 20 20", '<rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.2"/><circle cx="14.2" cy="5.8" r=".6" fill="currentColor"/>', "ico"),
    yt: '<svg class="ico" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2 6.2C2 4.4 3.4 3.5 10 3.5s8 .9 8 2.7v7.6c0 1.8-1.4 2.7-8 2.7s-8-.9-8-2.7z"/><path d="M8.3 7.3v5.4L13 10z" fill="var(--kf-surface)"/></svg>',
    tiktok: svg("0 0 20 20", '<path d="M11 3v9.5a2.7 2.7 0 1 1-2.7-2.7M11 3c.5 2.3 2 3.7 4.5 3.9"/>', "ico"),
    x: svg("0 0 20 20", '<path d="M3.5 3.5 16.5 16.5M16.5 3.5 3.5 16.5"/>', "ico"),
    star: '<svg class="star" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0c.6 4.4 3.6 7.4 8 8-4.4.6-7.4 3.6-8 8-.6-4.4-3.6-7.4-8-8 4.4-.6 7.4-3.6 8-8z"/></svg>',
  };
  const round = (cls = "") => `<span class="ic-round ${cls}">${I.arrow}</span>`;
  // School emblem slot: the original emblem isn’t used, a shield + quill shape of the same size instead
  const crest = '<svg viewBox="0 0 46 50" aria-hidden="true"><path d="M23 3 41 9v14c0 12-8 20-18 24C13 43 5 35 5 23V9z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 31c6-4 13-12 19-24l3 1c-4 11-11 20-20 25z" fill="currentColor" opacity=".85"/><path d="M9 36c9 2 19 1 28-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  const logo = (href = "index.html") => `<a class="logo" href="${href}" aria-label="Home">${crest}<b>Your university name here<small>SCHOOL NAME UNIVERSITY</small></b></a>`;

  const MAIN = [
    { label: "School Guide", href: "index.html", kids: ["About the School", "Education Policy", "Campus Guide", "Information disclosure"] },
    { label: "Undergraduate · Graduate", href: "index.html#department", kids: ["Literature Dept.", "Home Economics Faculty", "Dept. of Health and Welfare", "Nursing Faculty", "Graduate school"] },
    { label: "Admissions Info", href: "guide.html", key: "guide", kids: ["Admissions Schedule", "Adult Admissions", "Tuition · Scholarships", "Material Request"] },
    { label: "Learning and research", href: "index.html#featured", kids: ["Research center", "Open Course", "Library"] },
    { label: "Student life and facilities", href: "index.html#life", kids: ["Annual schedule", "Dorms and boarding", "Club", "Restaurant · Café"] },
    { label: "International exchange", href: "index.html#featured", kids: ["Study Abroad Program", "Exchange partner schools"] },
    { label: "Jobs · Careers", href: "career.html", key: "career", kids: ["Overview", "Career support center", "Placement Record", "To the hiring manager"] },
    { label: "Local and community ties", href: "visitor.html", key: "visitor", kids: ["Community partnership activities", "Lifelong Learning", "Facility Use"] },
  ];
  const SUB = [
    { label: "Admitted students site", href: "#" },
    { label: "To exam candidates", href: "guide.html" },
    { label: "To current students", href: "#" },
    { label: "To Our Graduates", href: "#" },
    { label: "To parents", href: "#" },
    { label: "For individuals and companies", href: "visitor.html", key: "visitor" },
    { label: "Donation information", href: "#" },
  ];
  const curKey = { about: "career" }[page] || page;

  function buildChrome() {
    const hd = $('[data-slot="header"]');
    if (hd) {
      hd.className = "hd";
      hd.innerHTML = `<div class="hd__inner">${logo()}
        <nav class="gnav" aria-label="Main menu">
          <ul class="gnav__sub">${SUB.map((s) => `<li><a href="${s.href}">${s.label}</a></li>`).join("")}
            <li class="sep" aria-hidden="true"></li>
            <li><a href="#">${I.balloon}Inquiry</a></li><li><a href="#">${I.pin}Directions</a></li><li><a href="#">${I.globe}EN</a></li></ul>
          <ul class="gnav__main">${MAIN.map((m) => `<li><a href="${m.href}"${m.key && m.key === curKey ? ' aria-current="page"' : ""}>${m.label}</a></li>`).join("")}</ul>
        </nav></div>`;
    }
    const side = $('[data-slot="side-menu"]');
    if (side) {
      side.className = "side";
      side.innerHTML = `<button class="side__btn" type="button" aria-expanded="false" aria-label="Open Menu"><span class="burger"><i></i></span></button>
        <a class="side__link" href="#">${I.book}<span>Material Request</span></a>
        <a class="side__link" href="#">${I.campus}<b>OPEN<br>CAMPUS</b></a>
        <a class="side__link" href="#">${I.pc}<span>Internet<br>Filing</span></a>
        <button class="side__link is-search" type="button" aria-expanded="false">${I.search}<span>Search</span></button>`;
    }
    const dr = $('[data-slot="menu-drawer"]');
    if (dr) {
      dr.className = "drawer";
      dr.setAttribute("aria-hidden", "true");
      dr.innerHTML = `<div class="drawer__row">
        <div class="drawer__main">
          <label class="dsearch"><input type="search" placeholder="Search the site" aria-label="Search the site">${I.search}</label>
          ${MAIN.map((m) => `<details class="dacc" data-acc><summary>${m.label}<span class="plus"></span></summary>
            <div class="dacc__body"><ul><li><a href="${m.href}">${m.label} First Page</a></li>${m.kids.map((k) => `<li><a href="${m.href}">${k}</a></li>`).join("")}</ul></div></details>`).join("")}
        </div>
        <div class="drawer__sub">
          <ul class="dlist">${SUB.slice(0, 6).map((s) => `<li><a href="${s.href}"><span>${s.label}</span>${round("is-s")}</a></li>`).join("")}</ul>
          <div class="dother"><a href="#">${I.heart}Donation information</a><a href="news.html">${I.news}News</a><a href="#">${I.balloon}Inquiry</a><a href="#">${I.pin}Directions</a></div>
          <a class="dlang" href="#">${I.globe}EN</a>
          <div class="dsns">${I.line}${I.insta}${I.yt}${I.x}${I.tiktok}</div>
        </div></div>`;
    }
    // Category nav on phone screens of sub pages (original LowerNavigation) — a 49px horizontal scroll row right below the header
    if (page !== "home" && hd && !$(".lnav")) {
      hd.insertAdjacentHTML("afterend", `<nav class="lnav" aria-label="Category Menu"><ul>${MAIN.map((m) => `<li><a class="lnav__link${m.key && m.key === curKey ? " is-current" : ""}" href="${m.href}">${m.label}</a></li>`).join("")}</ul></nav>`);
      document.body.classList.add("has-lnav");
    }
    const se = $('[data-slot="search"]');
    if (se) {
      se.className = "search";
      se.innerHTML = `<form role="search" onsubmit="return false"><input type="search" placeholder="Enter a keyword" aria-label="Search term"><button type="submit" aria-label="Search">${I.search}</button></form>`;
    }
    const bar = $('[data-slot="sp-bar"]');
    if (bar) {
      bar.className = "spbar";
      bar.innerHTML = `<a href="#">${I.book}Material Request</a><a href="#">${I.campus}<b>OPEN<br>CAMPUS</b></a><a href="#">${I.pc}Internet filing</a>`;
    }
  }

  function buildBottom() {
    const sns = $('[data-slot="sns"]');
    if (sns) {
      sns.className = "sns";
      sns.innerHTML = `<hgroup class="ttl"><p class="ttl__sub">${I.star}Connected with school</p><h2 class="ttl__main">SNS</h2></hgroup>
        <ul class="sns__list">
          <li><a href="#">${I.line}LINE</a></li><li><a href="#">${I.insta}instagram</a></li><li><a href="#">${I.yt}YouTube</a></li>
          <li><a href="#">${I.tiktok}TikTok</a></li><li><a href="#">${I.x}X</a></li><li><a class="is-more" href="#">SNS list by department${round("is-m")}</a></li>
        </ul>`;
    }
    const ban = $('[data-slot="banner-slider"]');
    if (ban) {
      ban.className = "banner";
      const posters = ["Event poster · group photo of students on stage + bold Japanese-style title lettering", "Festival poster · illustrated figure + brush-lettered title", "Festival poster · purple night illustration + large title", "New department announcement · bright photo of four students in white walking", "Admissions guide · sky-blue illustration + rounded lettering", "Open Campus · close-up of a smiling student face + date", "Open house notice · Students and staff talking"];
      ban.innerHTML = `<div class="sl" data-slider="banner"><div class="sl__track">${Array.from({ length: 22 }, (_, i) => posters[i % posters.length]).map((p) => `<div class="banner__item"><a href="#"><div class="wf-img" data-label="${p} · Square"></div></a></div>`).join("")}</div></div>`;
    }
    const links = $('[data-slot="link-circles"]');
    if (links) {
      links.className = "links";
      const L = [["Research center", "Close-up of an old scroll painting"], ["Consultation center", "Illustration of joined hands"], ["Open College", "Classroom lesson scene"], ["Education Support Association", "Building Exterior"], ["Donation information", "Aerial campus view"], ["Alumni association", "White building and trees"], ["Diet and Health", "Photo taken from above a lunchbox"], ["Homecoming Day", "Event logo image"]];
      links.innerHTML = `<ul>${L.map(([t, d]) => `<li><a href="#"><div class="wf-img" data-label="${d} · Circular"></div><span>${t}</span></a></li>`).join("")}</ul>`;
    }
    const mq = $('[data-slot="boundary-marquee"]');
    if (mq) {
      mq.className = "marquee";
      // Original giant wordmark (school nickname + quill) as placeholder serif letters of the same height·letter count
      const word = '<svg viewBox="0 0 1400 145" aria-hidden="true"><text x="0" y="128" style="font-family: var(--kf-font-mark, var(--kf-font-serif))" font-size="170" letter-spacing="40" fill="currentColor">SCHOOL</text><g transform="translate(1020 18)" fill="none" stroke="currentColor" stroke-width="3"><path d="M10 110C60 70 120 30 200 0c-30 60-90 100-160 110z"/><path d="M30 100 160 20"/></g></svg>';
      mq.innerHTML = `<div class="marquee__inner">${word}</div><div class="marquee__inner">${word}</div><div class="marquee__inner">${word}</div>`;
    }
    const cta = $('[data-slot="contact"]');
    if (cta) {
      cta.className = "cta";
      cta.innerHTML = `<h3 class="cta__title"><small>${I.star}Contact · Request materials</small><span>Contact</span></h3>
        <div class="cta__btns"><a href="#">${I.balloon.replace('class=""', 'class="ico"')}<span>Contact Us</span>${round("is-s")}</a><a href="#">${I.book}<span>Material Request</span>${round("is-s")}</a></div>`;
    }
    const ft = $('[data-slot="footer"]');
    if (ft) {
      ft.className = "ft";
      const addr = ["First Campus|Postal code 000-0000 address line here|TEL : 000-000-0000", "Second Campus|Postal code 000-0000 Address in one line here|TEL : 000-000-0000", "Third Campus|ZIP 000-0000 One-line address here|TEL : 000-000-0000"];
      const inst = ["School foundation info", "Staff Recruitment", "Site Policy", "Privacy policy", "Privacy protection activities"];
      ft.innerHTML = `<div class="ft__bg"><div class="wf-img" data-label="Photo of three students coming down campus stairs · clear daytime light through leaves · full width, top blends into blue"></div></div>
        <div class="ft__logos">${logo()}<p class="ft__catch">Your School’s one-line phrase here.</p></div>
        <div class="ft__info">
          <details class="ft__acc" data-acc data-acc-pc-open><summary class="ft__h">${I.star}Campus<span class="plus"></span></summary><div><ul class="ft__addr">${addr.map((a) => { const [n, b, c] = a.split("|"); return `<li>${n}<br>${b}<br>${c}</li>`; }).join("")}</ul></div></details>
          <details class="ft__acc" data-acc data-acc-pc-open><summary class="ft__h">${I.star}Institution<span class="plus"></span></summary><div><ul class="ft__inst">${inst.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div></details>
          <div class="ft__partners"><a href="#"><span class="logo">${crest}<b>Your junior college here</b></span></a><a href="#"><span class="logo">${crest}<b>Your school corporation here</b></span></a></div>
        </div>
        <p class="ft__copy">© SCHOOL NAME INSTITUTE.</p>`;
    }
  }

  // Accordion: the original opens details with a gsap height tween
  function initAccordions(root = document) {
    $$("details[data-acc]", root).forEach((d) => {
      if (d.dataset.accReady) return;
      d.dataset.accReady = "1";
      const sum = d.querySelector("summary");
      const body = sum.nextElementSibling;
      if (d.hasAttribute("data-acc-pc-open") && !isSP()) d.open = true;
      sum.addEventListener("click", (e) => {
        e.preventDefault();
        if (d.hasAttribute("data-acc-pc-open") && !isSP()) return;
        if (d.open) {
          gsap.to(body, { height: 0, opacity: 0, duration: reduce ? 0 : 0.4, ease: "kwu", overwrite: true, onComplete: () => { d.open = false; gsap.set(body, { clearProps: "all" }); } });
        } else {
          d.open = true;
          gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: reduce ? 0 : 0.4, ease: "kwu", overwrite: true, onComplete: () => gsap.set(body, { clearProps: "all" }) });
        }
      });
    });
  }

  function initTabs(root = document) {
    $$("[data-tabs]", root).forEach((t) => {
      const btns = $$(".tabs__btn", t);
      const bodies = $$(".tabs__body", t);
      btns.forEach((b, i) => b.addEventListener("click", () => {
        btns.forEach((x, j) => x.setAttribute("aria-selected", String(i === j)));
        bodies.forEach((x, j) => (x.hidden = i !== j));
      }));
    });
  }

  function initChrome() {
    const body = document.body;
    const btn = $(".side__btn");
    const dr = $(".drawer");
    const setMenu = (open) => {
      body.classList.toggle("is-menu-open", open);
      btn?.setAttribute("aria-expanded", String(open));
      btn?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      dr?.setAttribute("aria-hidden", String(!open));
      if (open) setSearch(false);
    };
    const sBtn = $(".side__link.is-search");
    const setSearch = (open) => {
      body.classList.toggle("is-search-open", open);
      sBtn?.setAttribute("aria-expanded", String(open));
      if (open) $(".search input")?.focus({ preventScroll: true });
    };
    btn?.addEventListener("click", () => setMenu(!body.classList.contains("is-menu-open")));
    sBtn?.addEventListener("click", () => { if (body.classList.contains("is-menu-open")) setMenu(false); setSearch(!body.classList.contains("is-search-open")); });
    // Clicking the outer cover closes it (the original uses a body::before cover)
    addEventListener("click", (e) => {
      if (!body.classList.contains("is-menu-open")) return;
      if (e.target.closest(".drawer, .side")) return;
      setMenu(false);
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); setSearch(false); } });
  }

  // Original di(): once past the height of the Hero area (where .MainVisual sits) it adds is-scrolled, and when moving more than 10px it adds is-scroll-down/up by direction
  function initScrollState() {
    const body = document.body;
    const mv = $('[data-slot="hero"], [data-slot="page-hero"], [data-slot="page-title"]');
    if (!mv) return;
    let h = mv.offsetHeight, last = scrollY, acc = 0, dir = null, ticking = false;
    const tick = () => {
      ticking = false;
      body.classList.toggle("is-scrolled", scrollY > h);
      const d = scrollY - last;
      if (d === 0) return;
      acc += d;
      if (Math.abs(acc) >= 10) {
        const now = acc > 0 ? "down" : "up";
        if (now !== dir) { body.classList.toggle("is-scroll-down", now === "down"); body.classList.toggle("is-scroll-up", now === "up"); dir = now; }
        acc = 0;
      }
      last = scrollY;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } });
    addEventListener("resize", () => { h = mv.offsetHeight; last = scrollY; acc = 0; });
  }

  // Original gr(): a ScrollMagic scene gets is-inview once at 10% from the bottom of the screen (triggerHook .9). Elements near the end of the document that can’t reach that point have their hook pulled to the spot they can reach.
  function initInview() {
    const els = $$("[data-inview]");
    if (!els.length) return;
    if (typeof ScrollMagic === "undefined" || reduce) return els.forEach((el) => el.classList.add("is-inview"));
    const ctrl = new ScrollMagic.Controller();
    const docH = () => Math.max(document.body.scrollHeight, document.body.offsetHeight, doc.clientHeight, doc.scrollHeight, doc.offsetHeight);
    els.forEach((el) => {
      const hook = el.dataset.inview ? Number(el.dataset.inview) : 0.9;
      new ScrollMagic.Scene({ triggerElement: el, triggerHook: hook, reverse: false })
        .setClassToggle(el, "is-inview")
        .on("update", (e) => {
          const H = docH(), edge = H - doc.clientHeight * (1 - hook), top = el.getBoundingClientRect().top + scrollY;
          e.currentTarget.triggerHook(top >= edge ? (doc.clientHeight - (H - top)) / doc.clientHeight : hook);
        })
        .addTo(ctrl);
    });
  }

  /* Original Swiper 12.0.3 — slide frame (.sl > .sl__track > Just add the swiper class to the cell) and apply the original settings as they are */
  function swiper(root, opt) {
    if (!root || typeof Swiper === "undefined") return null;
    const track = $(".sl__track", root);
    root.classList.add("swiper");
    track.classList.add("swiper-wrapper");
    [...track.children].forEach((el) => el.classList.add("swiper-slide"));
    if (reduce) opt = { ...opt, autoplay: false, speed: 0 };
    return new Swiper(root, opt);
  }

  // News row placeholder — tag, date, two-line title, with lengths matched to the original character counts
  const NEWS = [
    ["Event", "0000.08.31", "【00th anniversary】 Homecoming Day for alumni — applications now open"],
    ["News", "0000.10.19", "【Event report】 Your event name here: we held a celebration for students who placed 3rd at the World Championship"],
    ["News", "0000.10.09", "Your text here: ranked first among regional women’s colleges in real employment rate ~ A school strong in employment ~"],
    ["News report", "0000.09.30", "Your note that a transit ad ran at the local station here"],
    ["News report", "0000.09.24", "Your note here: an internship experiencing committee and child committee member work was covered by broadcast media."],
    ["Admissions", "0000.09.20", "The 0000 admissions guidelines are now available"],
  ];
  function fillNews(root = document) {
    $$("[data-news]", root).forEach((box, k) => {
      const n = +box.dataset.news || 4;
      const tag = box.dataset.tag;
      box.innerHTML = `<ul class="news-list">${Array.from({ length: n }, (_, i) => {
        const [t, d, s] = NEWS[(i + k) % NEWS.length];
        return `<li><a href="news.html"><p class="news-list__head"><span class="tag${tag === "Important" ? " is-red" : ""}">${tag || t}</span><span class="date">${d}</span></p><p class="news-list__title">${s}</p></a></li>`;
      }).join("")}</ul>`;
    });
  }
  function decorate(root = document) {
    $$(".ic-round:empty", root).forEach((el) => (el.innerHTML = I.arrow));
    $$("[data-star]", root).forEach((el) => { el.insertAdjacentHTML("afterbegin", I.star); el.removeAttribute("data-star"); });
  }

  window.KWU = { I, round, swiper, initAccordions, decorate, isSP, reduce, $, $$ };

  fillNews();
  buildChrome();
  buildBottom();
  decorate();
  initChrome();
  initAccordions();
  initTabs();
  // Banner (original js-footerSlider): centered · 3s · 600ms · cell width css 317px (phone 175px) !important
  swiper($('[data-slider="banner"]'), { slidesPerView: "auto", centeredSlides: true, spaceBetween: 20, loop: true, speed: 600, autoplay: { delay: 3000, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 2, spaceBetween: 10 }, 768: { slidesPerView: 3, spaceBetween: 20 }, 1024: { slidesPerView: 5, spaceBetween: 24 } } });
  // Hero photo: the original MainVisual goes 1.05→1 once both -inview (ScrollMagic) and -imageloaded (imagesLoaded — waits for that one photo only) are attached.
  // The placeholder has no image to wait for, so it attaches after drawing the first frame — attaching directly inside the script would paint the end state from the first frame and hide the transition
  const heroes = $$('[data-slot="hero"][data-inview], [data-slot="page-hero"][data-inview]');
  requestAnimationFrame(() => requestAnimationFrame(() => heroes.forEach((el) => el.classList.add("is-imageloaded"))));
  initScrollState();
  initInview();
})();
