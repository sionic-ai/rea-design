// Spanning several pages — draws the header, menu drawer, side strips, badge, entry section and footer, and hooks up Lenis, Swup handoff and common motion.
// Motion for each page is <page>.js fills opPages[<data-page>] register it there. When arriving via Swup, load that file and hook it up again.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PC = "(min-width: 751px)";
  window.opPages = window.opPages || {};

  const ICON = {
    mark: '<svg viewBox="0 0 64 40" fill="currentColor" aria-hidden="true"><path d="M32 38c-9 0-16-5-17-12h34c-1 7-8 12-17 12z"/><g>' +
      [-62, -40, -20, 0, 20, 40, 62].map((r, i) => `<ellipse cx="32" cy="${i % 2 ? 13 : 11}" rx="4.2" ry="${i % 2 ? 11 : 13}" transform="rotate(${r} 32 26)"/>`).join("") + "</g></svg>",
    arrow: '<svg viewBox="0 0 6 8" fill="currentColor" aria-hidden="true"><path d="M0 0l6 4-6 4z"/></svg>',
    person: '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><circle cx="6" cy="3.2" r="2.6"/><path d="M1 12c0-3 2.2-5 5-5s5 2 5 5z"/></svg>',
    grid: '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect width="5" height="5" rx="1"/><rect x="7" width="5" height="5" rx="1"/><rect y="7" width="5" height="5" rx="1"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg>',
    close: '<svg viewBox="0 0 12 12" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11"/></svg>',
    chev: '<svg viewBox="0 0 14 18" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M2 2l5 5 5-5M2 10l5 5 5-5"/></svg>',
    up: '<svg viewBox="0 0 12 8" fill="currentColor" aria-hidden="true"><path d="M6 0l6 8H0z"/></svg>',
    sns1: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11 0c.3 2 1.6 3.3 3.6 3.5v2.4c-1.3 0-2.5-.4-3.6-1.1v5.4c0 3-2.4 5.3-5.3 5.3S.4 13.2.4 10.2s2.4-5.3 5.3-5.3c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.8s1.2 2.8 2.7 2.8 2.8-1.2 2.8-2.8V0z"/></svg>',
    sns2: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="4"/><circle cx="8" cy="8" r="3"/></svg>',
  };
  window.opIcon = ICON;

  const MENU = [
    ["index.html", "First Page", "Top"],
    ["about.html", "Company Thinking", "Concept"],
    ["about-strength.html", "Company Traits", "Strength"],
    ["works.html", "About the work", "Work", [["detail.html", "Team Name 1"], ["detail.html", "Team Name 2"], ["detail.html", "Team Name 3"], ["detail.html", "Team Name 4"], ["detail.html", "Team Name 5"]]],
    ["index.html#member", "Working people", "Member", [["index.html#member", "Person Name 1"], ["index.html#member", "Person Name 2"], ["index.html#member", "Person Name 3"]]],
    ["index.html#grow", "Company in Numbers", "Number"],
    ["index.html#grow", "Career", "Career up"],
    ["index.html#entry", "Hiring Info", "Recruit"],
  ];
  const tt = (href, title, en) => `<a class="op-tt" href="${href}"><span class="op-tt__line op-tt__title">${title}</span><span class="op-tt__line op-tt__en">${en}</span></a>`;
  const kids = (list, cls) => (list ? `<ul class="${cls}">${list.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>` : "");

  const entryBtn = (cls) => `<a class="${cls}" href="index.html#entry"><span>Entry</span>${ICON.person}</a>`;
  const menuBtn = (cls) => `<button class="${cls}" type="button" aria-label="Open Menu" data-menu>${ICON.grid}</button>`;
  const header = () => `
    <div class="op-h__inner">
      <a class="op-h__logo" href="index.html" aria-label="First Page">${ICON.mark}<span class="op-h__logoName">Company name</span><span class="op-h__logoSub">Recruiting site</span></a>
      <ul class="op-h__nav">${MENU.slice(1).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      ${entryBtn("op-h__entry")}
      ${menuBtn("op-h__menu")}
    </div>
    <div class="op-sh">
      <div class="op-sh__inner">
        <a class="op-sh__logo" href="index.html" aria-label="First Page">${ICON.mark}<span>Company name</span></a>
        ${entryBtn("op-sh__entry")}
        ${menuBtn("op-sh__menu")}
      </div>
    </div>`;

  const nav = () => `
    <div class="op-nav__bg" data-menu></div>
    <div class="op-nav__body">
      <div class="op-nav__top">
        <a class="op-nav__entry" href="index.html#entry">${ICON.person}Entry</a>
        <button class="op-nav__close" type="button" aria-label="Close Menu" data-menu>${ICON.close}</button>
      </div>
      <ul class="op-nav__list">${MENU.map(([h, t, e, k]) => `<li class="op-nav__item">${tt(h, t, e)}${kids(k, "op-nav__kids")}</li>`).join("")}</ul>
    </div>`;

  const footer = () => `
    <div class="op-f__in op-sec">
      <div class="op-f__info">
        <a class="op-f__mark" href="index.html" aria-label="First Page">${ICON.mark}</a>
        <p class="op-f__brand"><small>BRAND LINE</small>BRAND</p>
        <p class="op-f__name">Company name</p>
        <p class="op-f__sub">Recruiting site</p>
        <div class="op-f__sns"><a href="#" aria-label="SNS 1">${ICON.sns1}</a><a href="#" aria-label="SNS 2">${ICON.sns2}</a></div>
        <a class="op-f__group" href="#">Group Site</a>
      </div>
      <div class="op-f__nav">
        <ul class="op-f__list">${[MENU[1], ["index.html#intro", "Industry myths", "Real"], MENU[2], MENU[5], MENU[6]].map(([h, t, e]) => `<li>${tt(h, t, e)}</li>`).join("")}</ul>
        <ul class="op-f__list">${[MENU[3], MENU[4]].map(([h, t, e, k]) => `<li>${tt(h, t, e)}${kids(k, "op-f__kids")}</li>`).join("")}</ul>
        <ul class="op-f__list">${[["#", "Company info", "Company"], MENU[7], ["index.html#entry", "Entry", "Entry"]].map(([h, t, e]) => `<li>${tt(h, t, e)}</li>`).join("")}<li><a class="op-f__policy" href="#">Privacy policy</a></li></ul>
      </div>
    </div>
    <p class="op-f__copy">© 0000 COMPANY NAME</p>
    <a class="op-f__top" href="#op-wrap"><span>Top</span>${ICON.up}</a>`;

  const entry = () => {
    const line = (first) => `<${first ? "hgroup" : "div"} class="op-entry__line"${first ? "" : ' aria-hidden="true"'}><p class="en">Entry</p><${first ? "h2" : "div"} class="jp">Entry</${first ? "h2" : "div"}></${first ? "hgroup" : "div"}>`;
    return `
    <div class="op-entry__body">
      <div class="op-entry__title" data-marquee>${line(true)}${line()}${line()}${line()}</div>
      <div class="op-entry__intro"><div class="op-entry__introIn">
        <span class="op-entry__chev">${ICON.chev}${ICON.chev}${ICON.chev}</span>
        <p class="op-entry__text">Your line encouraging applications here,<em>Highlighted line here!</em></p>
        <span class="op-entry__chev">${ICON.chev}${ICON.chev}${ICON.chev}</span>
      </div></div>
      <ul class="op-entry__links"><li><a class="op-entry__link" href="#">Entry this way<i></i></a></li><li><a class="op-entry__link" href="#">Job site name<i></i></a></li></ul>
    </div>
    <div class="op-entry__img"><div class="wf-img" data-label="Group photo of five staff · fluorescent lighting inside the store · landscape 21:9"></div></div>`;
  };

  // Badge: a wavy-edged circle + a small speech-bubble cloud — redrawn at the same size and position as the original drawing
  const badge = () => {
    const pts = [];
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, r = i % 2 ? 92 : 98;
      pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(118 + Math.sin(a) * r).toFixed(1)}`);
    }
    return `<a class="op-scale" href="index.html#intro" aria-label="See industry myths"><svg viewBox="0 0 200 224">
      <polygon class="op-badge__ring" points="${pts.join(" ")}"/><circle class="op-badge__in" cx="100" cy="118" r="78"/>
      <text x="100" y="98" font-size="13">Your question line here</text><text class="is-big" x="100" y="132">”Misunderstanding”</text><text x="100" y="156" font-size="13">Unlocks!</text>
      <path class="op-badge__cloud" d="M118 30c2-12 18-15 24-6 8-6 20 0 18 10 9 2 10 15 1 18-1 9-12 12-18 6-6 7-18 5-20-3-9 0-12-12-5-17-4-4-2-9 0-8z"/>
      <text class="is-cloud" x="142" y="40">The real look is</text><text class="is-cloud" x="142" y="53">What?</text></svg></a>`;
  };

  // Side bands: stack the same bundle to the document height — the original is a vertical image repeating at 32.6875em intervals
  function fillSide() {
    const wrap = document.getElementById("op-wrap");
    wrap.querySelectorAll(".op-side__col").forEach((col) => {
      const unit = `<div class="op-side__unit"><b>BRAND MARK</b>${ICON.chev}<i>Your slogan line goes here</i>${ICON.chev}</div>`;
      col.innerHTML = unit;
      const h = col.firstElementChild.offsetHeight || 400;
      col.innerHTML = unit.repeat(Math.ceil((wrap.offsetHeight + 3000) / h));
    });
  }

  function chrome() {
    const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => !el.dataset.filled && ((el.innerHTML = html()), (el.dataset.filled = "1")));
    fill('[data-slot="header"]', header);
    fill('[data-slot="menu-drawer"]', nav);
    fill('[data-slot="footer"]', footer);
    fill('[data-slot="entry"]', entry);
    fill('[data-slot="badge"]', badge);
  }

  // ── Lenis (original duration 1.1 · lerp .12, driven by gsap ticker) ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.opLenis = lenis;

  // ── Menu drawer: open .4s power2.out + .05 stagger per row, close .3s ──
  function toggleMenu() {
    const navEl = document.querySelector(".op-nav"), body = navEl.querySelector(".op-nav__body"), bg = navEl.querySelector(".op-nav__bg");
    const items = gsap.utils.toArray(".op-nav__item");
    if (root.classList.contains("is-menuopen")) {
      root.classList.remove("is-menuopen");
      lenis && lenis.start();
      gsap.timeline({ onComplete: () => { gsap.set(navEl, { autoAlpha: 0 }); gsap.set(items, { alpha: 0 }); body.scrollTop = 0; } })
        .to(body, { duration: 0.3, ease: "power2.out", x: "100%" })
        .to(bg, { duration: 0.3, ease: "power2.out", alpha: 0 }, "<");
    } else {
      root.classList.add("is-menuopen");
      lenis && lenis.stop();
      gsap.timeline().set(navEl, { autoAlpha: 1 })
        .fromTo(body, { x: "100%" }, { duration: 0.4, ease: "power2.out", x: 0 })
        .to(bg, { duration: 0.4, ease: "power2.out", alpha: 1 }, "<")
        .fromTo(items, { alpha: 0, y: -8 }, { duration: 0.4, ease: "power2.out", alpha: 1, y: 0, stagger: { each: 0.05 } }, "-=.25");
    }
  }
  window.opToggleMenu = toggleMenu;
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu]")) { e.preventDefault(); toggleMenu(); return; }
    if (root.classList.contains("is-menuopen") && e.target.closest(".op-nav a") && !window.opSwup) toggleMenu();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && root.classList.contains("is-menuopen") && toggleMenu());

  // ── Shared motion re-attached on every page ──
  let mm = null;
  function common(main) {
    mm && mm.revert();
    mm = gsap.matchMedia();
    const small = document.querySelector(".op-sh");
    const trigger = main.querySelector("[data-smallheader]");
    mm.add(PC, () => {
      if (trigger) ScrollTrigger.create({ trigger, start: "bottom top", endTrigger: main, end: "bottom bottom", toggleClass: { targets: small, className: "is-active" } });
      else small.classList.add("is-active");
      const mq = main.querySelector("[data-marquee]");
      if (mq && !reduce) {
        const lines = mq.querySelectorAll(".op-entry__line");
        const w = lines[0].offsetWidth * lines.length;
        gsap.set(mq, { x: 0 });
        gsap.to(mq, { x: -w / 2, duration: Number(mq.dataset.marqueeSpeed || 60), ease: "linear", repeat: -1 });
      }
      return () => small.classList.remove("is-active");
    });
    if (reduce) { gsap.set(".op-ab", { alpha: 1 }); return; }
    ScrollTrigger.batch(main.querySelectorAll(".op-ab"), {
      start: "0% 80%", once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 30 }, { duration: 0.8, ease: "power3.inOut", alpha: 1, y: 0 }),
    });
  }

  // After the page is fully visible: badge pop-out + hide in the footer + header title letters rise
  function shown(main) {
    const b = main.querySelector(".op-badge");
    if (b) {
      if (reduce) gsap.set(b, { autoAlpha: 1 });
      else {
        gsap.fromTo(b, { autoAlpha: 1, scale: 0 }, { duration: 0.8, ease: "elastic.out(1,0.3)", scale: 1, delay: 0.5 });
        gsap.to(b, { ease: "power2.out", autoAlpha: 0, scrollTrigger: { trigger: "#op-footer", start: () => "0% 100%", toggleActions: "play none none reverse" } });
      }
    }
    const en = main.querySelectorAll(".op-pagehead__en span"), jp = main.querySelectorAll(".op-pagehead__jp span");
    if (en.length && !reduce) {
      gsap.timeline({ delay: 0.1 })
        .fromTo(en, { y: "100%" }, { ease: "power3.out", duration: 0.4, y: "0%", stagger: 0.04 })
        .fromTo(jp, { y: "100%" }, { ease: "power3.out", duration: 0.4, y: "0%", stagger: 0.04 }, "<+.1");
    } else gsap.set([en, jp], { y: "0%" });
  }

  // Wrap the header title letter by letter (original setletter) — spaces stay as they are
  function letters(main) {
    main.querySelectorAll("[data-letters]").forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      el.setAttribute("aria-label", el.textContent);
      el.innerHTML = [...el.textContent].map((c) => (c === " " ? " " : `<span aria-hidden="true">${c}</span>`)).join("");
    });
  }

  let cleanup = null;
  function loadScript(src) {
    return new Promise((res) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = res; document.body.append(s); });
  }
  async function startPage(first) {
    const main = document.getElementById("op-main");
    document.body.dataset.page = main.dataset.page;
    chrome();
    letters(main);
    if (!window.opPages[main.dataset.page] && main.dataset.js) await loadScript(main.dataset.js);
    common(main);
    const run = window.opPages[main.dataset.page];
    const footerEl = document.getElementById("op-footer");
    const reveal = () => {
      shown(main);
      requestAnimationFrame(() => { fillSide(); ScrollTrigger.refresh(); });
    };
    cleanup = run ? run(main, { first, reduce, PC, reveal }) : null;
    if (cleanup && cleanup.ownReveal) return;
    if (first) gsap.to("#op-wrap", { duration: reduce ? 0 : 0.4, ease: "power3.out", autoAlpha: 1, onComplete: reveal });
    else {
      gsap.to(footerEl, { duration: 0.4, ease: "power3.out", autoAlpha: 1 });
      gsap.to(main, { duration: 0.4, ease: "power3.out", autoAlpha: 1, onComplete: reveal });
    }
  }

  // ── Swup: swaps only #op-main, and on leave clears body·footer with .1s power3.out. Opened as a file (file://), normal navigation ──
  function swupInit() {
    if (!/^https?:/.test(location.protocol) || !window.Swup) return;
    let delay = 0;
    const swup = new Swup({
      containers: ["#op-main"],
      plugins: [
        new SwupHeadPlugin({ persistAssets: true }),
        new SwupPreloadPlugin(),
        new SwupScrollPlugin({ animateScroll: { betweenPages: false, samePageWithHash: true, samePage: true }, scrollFriction: 0.4, scrollAcceleration: 0.05 }),
        new SwupJsPlugin({ animations: [{
          from: "(.*)", to: "(.*)",
          out: async () => {
            await Promise.all([
              gsap.to("#op-footer", { duration: 0.1, ease: "power3.out", autoAlpha: 0, delay }),
              gsap.to("#op-main", { duration: 0.1, ease: "power3.out", autoAlpha: 0, delay }),
            ]);
            delay = 0;
          },
          in: (done) => done(),
        }] }),
      ],
    });
    swup.hooks.on("visit:start", () => {
      if (root.classList.contains("is-menuopen")) { toggleMenu(); delay += 0.1; }
      document.body.dataset.loaded = "false";
    });
    swup.hooks.on("link:self", () => root.classList.contains("is-menuopen") && toggleMenu());
    swup.hooks.on("content:replace", () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (typeof cleanup === "function") cleanup();
      cleanup = null;
      gsap.set("#op-main", { autoAlpha: 0 });
      startPage(false).then(() => (document.body.dataset.loaded = "true"));
    });
    window.opSwup = swup;
  }

  const boot = () => {
    chrome();
    fillSide();
    swupInit();
    startPage(true).then(() => (document.body.dataset.loaded = "true"));
    let w = innerWidth;
    addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; fillSide(); } });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
