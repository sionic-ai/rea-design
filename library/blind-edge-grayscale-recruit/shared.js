// Shared by all pages: draws the header, dropdown, drawer, loader, entry and footer in one place, and hooks up the blind boundary and the loader timeline.
// Original values: logo clip .5s power2.out → white veil y -100% 1s power4.out → 8 strips height 0 .6s power2.inOut stagger .08(-=1.2)
// · drawer items y20→0 .6s stagger .04 (close y-20 .3s) · blinds scaleY 1→0 stagger .08 from end · scrub 1.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("linkhover", ".115,.405,.24,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const MT = (window.MT = window.MT || { hooks: [] });
  MT.reduced = reduced;

  const arrow = '<span class="mt-arrow"><svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M14 11.2 14 0H2.8v1.4h8.8L0 13l1 1L12.6 2.4v8.8z"/></svg></span>';
  // A placeholder logo drawn new with the same size and composition (square outline + two lines of text) in place of the original box-type wordmark
  const logo = '<svg viewBox="0 0 50 50" aria-hidden="true"><rect x=".75" y=".75" width="48.5" height="48.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M.75 25h48.5" stroke="currentColor" stroke-width="1.5"/><g font-family="Bricolage Grotesque, sans-serif" font-weight="700" font-size="15" fill="currentColor" text-anchor="middle"><text x="25" y="19.5" textLength="42" lengthAdjust="spacingAndGlyphs">LOGO</text><text x="25" y="44" textLength="42" lengthAdjust="spacingAndGlyphs">MARK</text></g></svg>';
  MT.icons = { arrow, logo };

  const btn = (href, label, cls = "") =>
    `<a class="mt-btn mt-swap ${cls}" href="${href}"><span class="mt-btn__bg"></span><span class="mt-btn__inner">${label}${arrow}</span></a>`;
  MT.btn = btn;

  const cur = (p) => (p === page ? " is-current" : "");
  const NAV = [
    { en: "About", ja: "About us", href: "about.html", key: "about", sub: [["Our Thoughts", "about.html#thoughts"], ["Three features", "about.html#features"]] },
    { en: "Work", ja: "What we do", href: "works.html", key: "works", sub: [["Business 1 Name", "works.html#service-1"], ["Business 2 Name", "works.html#service-2"]] },
    { en: "Staff Interview", ja: "Staff Interview", href: "index.html#interview", key: "recruit", sub: [["Job group 1 interview", "recruit.html"], ["Job group 2 interview", "recruit.html"]] },
    { en: "Member", ja: "Meet the Members", href: "index.html#member" },
    { en: "Top Interview", ja: "CEO interview", href: "index.html#message" },
    { en: "Company", ja: "Company info", href: "index.html#others", sub: [["Company philosophy", "index.html#others"], ["Company overview", "index.html#others"]] },
    { en: "Requirements", ja: "Application guidelines", href: "index.html#others" },
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <div class="mt-head__bar">
        <a class="mt-logo" href="index.html" aria-label="Home">${logo}</a>
        <nav class="mt-gnav" aria-label="Main menu"><ul>
          ${NAV.map((n, i) => `<li><a class="mt-gnav__link${cur(n.key)}" href="${n.href}" data-hover="${n.ja}" ${n.sub ? `data-drop="${i}"` : ""}>${n.en}</a></li>`).join("")}
        </ul></nav>
      </div>
      ${NAV.map((n, i) => n.sub ? `<div class="mt-drop" data-drop-panel="${i}"><div class="mt-drop__bg">${n.sub.map(([t, h]) => `<a class="mt-drop__link mt-swap" href="${h}"><span>${t}</span>${arrow}</a>`).join("")}</div></div>` : "").join("")}
      <a class="mt-cta mt-swap" href="#entry"><span class="mt-cta__text" data-hover="Apply"><span>Entry</span></span>${arrow}</a>
      <button class="mt-burger" type="button" aria-expanded="false" aria-label="Open Menu"><span class="mt-burger__bars"><i></i><i></i><i></i></span></button>`;
  }

  const sub = (n) => (n.sub ? `<ul class="is-sub">${n.sub.map(([t, h]) => `<li data-drawer-item><a href="${h}">${t}</a></li>`).join("")}</ul>` : "");
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="mt-intro" aria-hidden="true">
      <div class="mt-intro__first"><div class="mt-intro__logo">${logo}</div></div>
      <div class="mt-intro__second">${"<div><span></span></div>".repeat(8)}</div>
    </div>
    <div class="mt-drawer" data-slot="drawer" aria-hidden="true">
      <div class="mt-drawer__bg"></div>
      <div class="mt-drawer__box">
        <div class="mt-drawer__head" data-drawer-item>
          <a class="mt-logo" href="index.html" aria-label="Home">${logo}</a>
          <div class="mt-drawer__links">
            <a class="mt-drawer__entry mt-swap" href="#entry" data-drawer-close>Entry${arrow}</a>
            <button class="mt-drawer__close" type="button" aria-label="Close Menu"><span class="mt-burger__bars"><i></i><i></i><i></i></span></button>
          </div>
        </div>
        <nav class="mt-drawer__nav" aria-label="Full menu">
          <ul>${NAV.slice(0, 5).map((n) => `<li><a href="${n.href}" data-drawer-item>${n.en}</a>${sub(n)}</li>`).join("")}</ul>
          <ul>${NAV.slice(5).map((n) => `<li><a href="${n.href}" data-drawer-item>${n.en}</a>${sub(n)}</li>`).join("")}
            <li><a href="#entry" data-drawer-item data-drawer-close>Entry</a></li>
            <li><a href="#entry" data-drawer-item data-drawer-close>Contact</a></li>
            <li data-drawer-item><a class="is-dim" href="news.html">News</a></li>
            <li data-drawer-item><a class="is-dim" href="index.html#blog">Blog</a></li>
          </ul>
        </nav>
      </div>
    </div>`
  );

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const fl = (n) => `<li><a href="${n.href}">${n.en}</a>${n.sub ? `<ul class="is-sub">${n.sub.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>` : ""}</li>`;
    foot.outerHTML = `
    <section class="mt-entry" id="entry" data-slot="entry">
      <div class="mt-entry__photo wf-img" data-label="Long shadows of three people cast on paving blocks · black and white · low afternoon sun · wide landscape view from above at an angle"></div>
      <div class="mt-wrap">
        <h2 class="mt-title"><div class="en">Entry</div><div class="ja">Apply</div></h2>
        <div class="mt-entry__inner">
          <p class="mt-entry__text">Your one-line pledge goes here.<br>Your one-line invitation here to start a conversation.</p>
          <a class="mt-btn mt-btn--white mt-btn--large mt-swap" href="#entry"><span class="mt-btn__bg"></span><span class="mt-btn__inner"><span class="mt-btn__text"><span class="en">Get in touch</span><span class="ja">Application Form</span></span>${arrow}</span></a>
        </div>
      </div>
    </section>
    <footer class="mt-foot" data-slot="footer">
      <div class="mt-wrap">
        <div class="mt-foot__top">
          <nav class="mt-foot__nav" aria-label="Bottom Menu">
            <ul>${NAV.slice(0, 3).map(fl).join("")}</ul>
            <ul>${NAV.slice(3).map(fl).join("")}</ul>
            <ul><li><a href="#entry">Entry</a></li><li><a href="#entry">Contact</a></li><li class="is-dim"><a href="news.html">News</a></li><li class="is-dim"><a href="index.html#blog">Blog</a></li></ul>
          </nav>
          <p class="mt-foot__copy">Here, your big title.<br>Second title.</p>
        </div>
        <div class="mt-foot__bottom">
          <div class="mt-foot__info">
            <h3 class="mt-foot__name">Your company name here</h3>
            <p class="mt-foot__text">〒000-0000<br>Your address line goes here</p>
            <p class="mt-foot__text"><b>Business 1</b><em>000-000-0000</em></p>
            <p class="mt-foot__text"><b>Business 2</b><em>000-000-0000</em></p>
          </div>
          <div class="mt-foot__others">
            <a class="mt-foot__link" href="#">Privacy policy</a>
            <p class="mt-foot__copyright">© WORDMARK Inc. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>`;
  }

  // ── Dropdown: opens attached 22px below the trigger’s center
  document.querySelectorAll("[data-drop]").forEach((t) => {
    const panel = document.querySelector(`[data-drop-panel="${t.dataset.drop}"]`);
    const place = () => {
      const r = t.getBoundingClientRect();
      panel.style.left = r.left + r.width / 2 + "px";
      panel.style.top = r.top + 22 + "px";
    };
    const open = () => { place(); panel.classList.add("is-open"); };
    // Closes right away like the original — moving from ring to plate, the plate’s mouseenter reopens it within the same event order
    const close = () => panel.classList.remove("is-open");
    [t, panel].forEach((el) => {
      el.addEventListener("mouseenter", open);
      el.addEventListener("mouseleave", close);
      el.addEventListener("focusin", open);
      el.addEventListener("focusout", close);
    });
  });

  // ── Drawer
  const drawer = document.querySelector(".mt-drawer");
  const burgers = document.querySelectorAll(".mt-burger, .mt-drawer__close");
  let opened = false, itemsTween;
  const setExpanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", v));
  const openDrawer = () => {
    if (opened) return;
    opened = true;
    drawer.classList.remove("is-closing");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    setTimeout(() => setExpanded(true), 200);
    itemsTween = gsap.fromTo(drawer.querySelectorAll("[data-drawer-item]"), { opacity: 0, y: 20 },
      { opacity: 1, y: 0, delay: reduced ? 0 : 0.3, duration: reduced ? 0 : 0.6, ease: "power1.out", stagger: { each: 0.04 } });
  };
  const closeDrawer = () => {
    if (!opened) return;
    itemsTween && itemsTween.pause();
    gsap.fromTo(drawer.querySelectorAll("[data-drawer-item]"), { opacity: 1, y: 0 }, {
      opacity: 0, y: -20, ease: "power1.out", duration: reduced ? 0 : 0.3, stagger: { each: 0.002 },
      onComplete: () => {
        drawer.classList.add("is-closing");
        setTimeout(() => {
          drawer.classList.remove("is-open", "is-closing");
          drawer.setAttribute("aria-hidden", "true");
          document.body.classList.remove("is-locked");
          opened = false;
          setExpanded(false);
        }, reduced ? 0 : 600);
      },
    });
  };
  burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  drawer.querySelectorAll("[data-drawer-close], .mt-drawer__nav a").forEach((a) => a.addEventListener("click", () => opened && closeDrawer()));
  addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

  // ── Blind boundary: a horizontal band in the next face’s color folds up and the lower face thickens ──
  const RANGE = {
    default: { pc: ["top 70%", "bottom 80%"], sp: ["top bottom", "bottom 75%"] },
    compact: { pc: ["top 60%", "top 20%"], sp: ["top 70%", "top 20%"] },
  };
  const mm = gsap.matchMedia();
  const blinds = document.querySelectorAll("[data-blind]");
  const build = (kind) => blinds.forEach((el) => {
    const spans = el.querySelectorAll("span");
    const grow = el.dataset.blind === "grow";
    const [start, end] = (RANGE[el.dataset.blindRange] || RANGE.default)[kind];
    const state = (p) => { el.dataset.blindState = p >= 0.5 ? "revealed" : "covered"; };
    state(0);
    if (reduced) { gsap.set(spans, { scaleY: grow ? 1 : 0 }); state(1); return; }
    let tw = null;
    tw = gsap.fromTo(spans, { scaleY: grow ? 0 : 1 }, {
      scaleY: grow ? 1 : 0, ease: "none", stagger: { each: 0.08, from: "end" },
      onUpdate: () => tw && state(tw.progress()),
      scrollTrigger: { trigger: el, start, end, scrub: 1, invalidateOnRefresh: true, onRefresh: (s) => state(s.progress) },
    });
  });
  mm.add("(min-width: 768px)", () => build("pc"));
  mm.add("(max-width: 767.98px)", () => build("sp"));

  // ── Loader: the original plays only when arriving from another site or on refresh. Opened as a file the referrer is empty, so a session flag stands in
  const INTERNAL = "mt-internal-nav";
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (/^(https?:|mailto:|tel:)/.test(href) || href.startsWith("#")) return;
    sessionStorage.setItem(INTERNAL, "1");
  });
  const internal = sessionStorage.getItem(INTERNAL) === "1";
  sessionStorage.removeItem(INTERNAL);
  const playIntro = !internal && !reduced;
  if (!playIntro) document.documentElement.classList.add("mt-no-intro");
  MT.playIntro = playIntro;

  const run = () => {
    const tl = gsap.timeline();
    if (playIntro) {
      tl.to(".mt-intro__logo", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, delay: 0.5, ease: "power2.out" })
        .to(".mt-intro__logo", { opacity: 0, duration: 0.3, delay: 0.5, ease: "power4.out" })
        .to(".mt-intro__first", { y: "-100%", duration: 1, delay: 0.5, ease: "power4.out" })
        .to(".mt-intro__second span", { delay: 0.3, height: "0%", duration: 0.6, ease: "power2.inOut", stagger: 0.08 }, "-=1.2")
        .set(".mt-intro", { display: "none" })
        .call(() => ScrollTrigger.refresh());
    }
    MT.hooks.forEach((fn) => fn(tl, playIntro));
  };
  if (document.readyState === "complete") run();
  else addEventListener("load", run, { once: true });

  // Arriving at another page’s #anchor scrolls down less by the fixed header height
  addEventListener("load", () => {
    if (!location.hash) return;
    const t = document.querySelector(location.hash);
    if (!t) return;
    setTimeout(() => {
      const h = document.querySelector(".mt-head__bar").offsetHeight;
      scrollTo(0, t.getBoundingClientRect().top + scrollY - h);
    }, 200);
  });
})();
