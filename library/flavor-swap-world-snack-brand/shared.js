// Shared by all pages: draws in the icon symbols (characters, bags, peanuts, icons), loader, header band (product drawer, search), phone menu and footer,
// Hooks up Lenis·entrance (text splitting)·text-roll links·round button rotation·magnet button·page transition.
// Original values: Lenis duration 1.2 · easeOutQuint · loader 2.9s on first visit (2.2s on return) · entrance back.inOut(2.2) .5s with stagger .2
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, CustomWiggle);
  CustomWiggle.create("hsWiggle", { wiggles: 5, type: "easeOut" });

  const page = document.body.dataset.page || "home";
  const HS = (window.HS = { reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, lenis: null, startDelay: 0, t0: performance.now() });
  const mobile = () => matchMedia("(max-width: 991px)").matches;

  // Resolve skin variables to rgb — GSAP cannot read oklch(from …), and cursor drawings and canvases cannot use variables
  const probe = document.createElement("i");
  const pix = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  HS.color = (name) => {
    probe.style.color = `var(${name})`;
    document.body.appendChild(probe);
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    probe.remove();
    const [r, g, b] = pix.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Cursor: original arrow 32px, finger 38px, text bar, and product cells use that flavor’s character (the original uses a photo cursor per flavor). Drawn in skin colors and kept in variables
  const svgUrl = (w, svg, x, y, fb) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${w}' viewBox='0 0 ${w} ${w}'>${svg}</svg>`)}") ${x} ${y}, ${fb}`;
  const paintCursors = () => {
    const ink = HS.color("--kf-ink"), paper = HS.color("--kf-surface"), red = HS.color("--site-red");
    const root = document.documentElement.style;
    root.setProperty("--site-cursor", svgUrl(32, `<path d='M5 3l21 10.5-9.3 2.8L12.4 27z' fill='${ink}' stroke='${paper}' stroke-width='2.2' stroke-linejoin='round'/>`, 5, 3, "auto"));
    root.setProperty("--site-cursor-pointer", svgUrl(38, `<path d='M14 34c-3.8-2.5-7.6-7.6-8.2-11.6-.4-2 2-3 3.4-1.5L12.6 24V7a2.5 2.5 0 0 1 5 0v9.5l.1-1.9a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v1.9a2.5 2.5 0 0 1 4.9.5c.3 5.8-.9 11.6-3.8 15.1z' fill='${red}' stroke='${ink}' stroke-width='2.2' stroke-linejoin='round'/>`, 12, 3, "pointer"));
    root.setProperty("--site-cursor-text", svgUrl(32, `<path d='M11 4h10M11 28h10M16 4v24' fill='none' stroke='${ink}' stroke-width='5' stroke-linecap='round'/><path d='M11 4h10M11 28h10M16 4v24' fill='none' stroke='${paper}' stroke-width='2' stroke-linecap='round'/>`, 16, 16, "text"));
    FLAVORS.forEach((f, i) => {
      const body = HS.color(`--site-m-${i + 1}`), scarf = HS.color(`--site-${f.key === "orange" ? "pouch" : f.key}`), glass = HS.color("--site-m-glass");
      root.setProperty(`--site-cursor-${f.key}`, svgUrl(48, `<path d='M24 3c6 10 18 22 18 35 0 6-8 8-18 8S6 44 6 38C6 25 18 13 24 3z' fill='${body}' stroke='${ink}' stroke-width='2'/><rect x='10' y='24' width='12' height='8' rx='4' fill='${glass}'/><rect x='26' y='24' width='12' height='8' rx='4' fill='${glass}'/><path d='M8 40q16 8 32 0l1 4q-17 8-34 0z' fill='${scarf}'/>`, 24, 24, "pointer"));
    });
  };

  // ---------- Drawn symbols: newly drawn in the same position and feel in place of the original 3D characters, product bags, and peanut photos ----------
  const sprite = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <radialGradient id="hs-shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="var(--kf-surface)" stop-opacity=".35"/><stop offset=".6" stop-color="var(--kf-surface)" stop-opacity="0"/><stop offset="1" stop-color="var(--site-black)" stop-opacity=".25"/></radialGradient>
    </defs>
    <symbol id="hs-mascot" viewBox="0 0 200 240">
      <path d="M100 8C126 52 176 104 178 160c2 46-34 76-78 76S20 206 22 160C24 104 74 52 100 8z" fill="var(--m-body, var(--site-m-1))"/>
      <path d="M100 8C126 52 176 104 178 160c2 46-34 76-78 76S20 206 22 160C24 104 74 52 100 8z" fill="url(#hs-shade)"/>
      <g fill="var(--site-m-dot)" opacity=".7"><circle cx="78" cy="70" r="3"/><circle cx="120" cy="84" r="2.5"/><circle cx="60" cy="150" r="3"/><circle cx="148" cy="140" r="2.5"/><circle cx="96" cy="58" r="2"/><circle cx="134" cy="178" r="3"/></g>
      <g fill="var(--site-m-glass)" stroke="var(--site-m-frame)" stroke-width="5"><rect x="34" y="104" width="58" height="40" rx="16"/><rect x="108" y="104" width="58" height="40" rx="16"/></g>
      <path d="M92 116q8-6 16 0" fill="none" stroke="var(--site-m-frame)" stroke-width="5"/>
      <path d="M42 112l18 0" stroke="var(--kf-surface)" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
      <path d="M86 168q14 10 28 0" fill="none" stroke="var(--site-m-mouth)" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 190q70 34 140 0l6 24q-76 38-152 0z" fill="var(--m-scarf, var(--site-scarf))"/>
      <g fill="var(--site-brown)"><circle cx="58" cy="206" r="4"/><circle cx="86" cy="214" r="4"/><circle cx="116" cy="214" r="4"/><circle cx="144" cy="206" r="4"/></g>
    </symbol>
    <symbol id="hs-pouch" viewBox="0 0 200 290">
      <path d="M14 22h172l-4 238c0 14-10 24-24 24H42c-14 0-24-10-24-24z" fill="var(--site-pouch)"/>
      <path d="M14 22h172l-4 238c0 14-10 24-24 24H42c-14 0-24-10-24-24z" fill="url(#hs-shade)" opacity=".7"/>
      <path d="M14 6h172v20H14z" fill="var(--site-crimp)"/>
      <path d="M14 26l7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8" fill="none" stroke="var(--site-crimp)" stroke-width="3"/>
      <text x="100" y="66" text-anchor="middle" font-size="30" style="font-family: var(--kf-font-display); fill: var(--kf-ink)">LOGOTYPE</text>
      <text x="100" y="92" text-anchor="middle" font-size="22" style="font-family: var(--kf-font-display); fill: var(--kf-ink)">HERE</text>
      <rect x="34" y="104" width="132" height="132" rx="66" fill="var(--p-accent, var(--site-red))"/>
      <use href="#hs-mascot" x="54" y="112" width="92" height="112"/>
      <rect x="40" y="244" width="120" height="18" rx="2" fill="var(--p-accent, var(--site-red))"/>
      <rect x="56" y="250" width="88" height="5" rx="2" fill="var(--site-pouch)" opacity=".8"/>
    </symbol>
    <symbol id="hs-nut" viewBox="0 0 60 40">
      <path d="M6 22c-4-10 4-19 14-16 5 2 9 2 14-1 9-5 21 2 20 13-1 11-12 15-20 11-5-2-9-2-13 1-7 5-13 0-15-8z" fill="var(--site-m-2)"/>
      <g fill="var(--site-nut-dot)"><circle cx="17" cy="16" r="1.6"/><circle cx="28" cy="22" r="1.3"/><circle cx="41" cy="14" r="1.6"/><circle cx="45" cy="25" r="1.2"/><circle cx="12" cy="26" r="1.2"/></g>
      <path d="M12 14c4-3 8-3 10 0" fill="none" stroke="var(--kf-surface)" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
    </symbol>
    <symbol id="hs-ic-nut" viewBox="0 0 60 60"><use href="#hs-nut" x="2" y="10" width="56" height="40"/></symbol>
    <symbol id="hs-ic-avocado" viewBox="0 0 60 60"><path d="M30 6c10 0 14 12 18 22 6 14-4 26-18 26S6 42 12 28C16 18 20 6 30 6z" fill="#5d7c2a"/><path d="M30 12c8 0 10 10 14 18 4 10-4 19-14 19s-18-9-14-19c4-8 6-18 14-18z" fill="#c9d77a"/><circle cx="30" cy="36" r="8" fill="#7a4a22"/></symbol><!-- Not Skin: the ingredient illustration’s own colors (avocado, leaf, broccoli green) -->
    <symbol id="hs-ic-leaf" viewBox="0 0 60 60"><path d="M8 50C10 24 26 10 52 8c0 26-14 42-40 42z" fill="#4f9a3a"/><path d="M10 50C22 36 32 26 46 14" fill="none" stroke="#2e6a22" stroke-width="3" stroke-linecap="round"/></symbol><!-- Not Skin: the ingredient illustration’s own colors (avocado, leaf, broccoli green) -->
    <symbol id="hs-ic-wing" viewBox="0 0 60 60"><path d="M10 40c-6-10 2-26 18-28 12-2 22 6 20 16-2 9-12 12-20 16-6 4-14 6-18-4z" fill="var(--site-wing)"/><path d="M42 30l10 10m-4-14 8 6" stroke="var(--site-pouch)" stroke-width="5" stroke-linecap="round"/></symbol>
    <symbol id="hs-ic-broc" viewBox="0 0 60 60"><path d="M26 34h8l2 20h-12z" fill="#8fb34a"/><g fill="#3f8a32"><circle cx="20" cy="26" r="11"/><circle cx="40" cy="26" r="11"/><circle cx="30" cy="16" r="12"/></g></symbol><!-- Not Skin: the ingredient illustration’s own colors (avocado, leaf, broccoli green) -->
    <symbol id="hs-ic-bell" viewBox="0 0 60 60"><path d="M20 22a10 10 0 0 1 20 0" fill="none" stroke="var(--site-red)" stroke-width="6"/><circle cx="30" cy="38" r="16" fill="var(--site-red)"/><rect x="24" y="34" width="12" height="4" rx="2" fill="var(--site-pouch)"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  const use = (id, cls = "", style = "") => `<svg class="hs-svg ${cls}" style="${style}" viewBox="${id === "hs-mascot" ? "0 0 200 240" : id === "hs-pouch" ? "0 0 200 290" : id === "hs-nut" ? "0 0 60 40" : "0 0 60 60"}" aria-hidden="true"><use href="#${id}"/></svg>`;
  HS.use = use;

  // Character colors for four flavors — kimchi (red)·chicken (brown)·buffalo (orange)·lemon (yellow)
  const FLAVORS = [
    { key: "red", name: "Flavor Name 1", body: "var(--site-m-1)", scarf: "var(--site-red)" },
    { key: "brown", name: "Flavor Name 2", body: "var(--site-m-2)", scarf: "var(--site-brown)" },
    { key: "orange", name: "Flavor Name 3", body: "var(--site-m-3)", scarf: "var(--site-pouch)" },
    { key: "lemon", name: "Flavor Name 4", body: "var(--site-m-4)", scarf: "var(--site-lemon)" },
  ];
  HS.FLAVORS = FLAVORS;
  paintCursors();
  const mascotStyle = (f) => `--m-body:${f.body};--m-scarf:${f.scarf}`;
  HS.mascotStyle = mascotStyle;

  const logo = '<span class="hs-logo" aria-label="Logo"><span class="hs-logo__top">LOGOTYPE</span><span class="hs-logo__bot"><i></i>HERE<i></i></span></span>';
  const searchIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg>';
  const NAV = [["index.html", "home", "Home"], ["list.html", "list", "Latest News"], ["about.html", "about", "About Us"], ["press.html", "press", "Press"], ["index.html#contact", "contact", "Contact"]];

  // ---------- Loader ----------
  const skipPre = sessionStorage.getItem("hs-pre-skip") === "1";
  sessionStorage.removeItem("hs-pre-skip");
  if (page === "home" && !skipPre && !HS.reduced) {
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="hs-pre" data-slot="preloader">
        <div class="hs-pre__box">
          <a class="hs-pre__logo" href="index.html">${logo}</a>
          ${FLAVORS.map((f, i) => use("hs-mascot", `hs-pre__mascot is-${i + 1}`, mascotStyle(f))).join("")}
          <div class="hs-pre__count hs-d">0%</div>
        </div>
      </div>`);
  }

  // ---------- Header band · drawer · phone menu ----------
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("hs-head");
    const links = NAV.map(([href, key, label], i) =>
      `${i ? '<span class="hs-nav__div"></span>' : ""}<a href="${href}" ${key === page ? 'aria-current="page"' : ""} data-stagger><span class="hs-link hs-t">${label}</span></a>`).join("");
    head.innerHTML = `
      <div class="hs-head__bar">
        <button class="hs-hbtn hs-sq hs-menu-btn" type="button" aria-label="Menu" aria-expanded="false"><span class="hs-burger"><i class="t"></i><i class="m"></i><i class="b"></i><b>Close</b></span></button>
        <nav class="hs-nav" aria-label="Main menu" data-label="Your English menu name here">${links}</nav>
        <div class="hs-head__logo"><a href="index.html">${logo}</a></div>
        <div class="hs-head__side">
          <a class="hs-hbtn hs-products-btn hs-t" href="#products"><span>Products</span><i class="hs-hbtn__fill"></i></a>
          <button class="hs-hbtn hs-sq hs-search-btn" type="button" aria-label="Search">${searchIc}</button>
        </div>
        <form class="hs-search" role="search" onsubmit="return false"><input type="search" placeholder="Enter a search term…" aria-label="Search term"><button class="hs-hbtn hs-sq" type="button" aria-label="Close search">${searchIc}</button></form>
      </div>
      <div class="hs-sub" data-slot="products-drawer">
        ${FLAVORS.map((f) => `<a class="hs-sub__card" href="#products" data-cursor="${f.key}"><span class="hs-sub__fill ${f.key}"></span>${use("hs-mascot", "hs-sub__mascot", mascotStyle(f))}<span class="hs-sub__tag hs-t" style="background:var(--site-${f.key})">${f.name}</span>${use("hs-nut", "hs-sub__nuts")}</a>`).join("")}
      </div>
      <nav class="hs-menu" data-slot="mobile-menu" aria-label="Phone menu">
        <div class="hs-menu__row is-1"><a href="index.html">Home</a></div>
        <div class="hs-menu__row is-drop is-6">
          <button class="hs-menu__toggle" type="button" aria-expanded="false">Products <i><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 4 4 4-4"/></svg></i></button>
          <div class="hs-menu__list" data-label="Your flavor English name here">${FLAVORS.map((f) => `<a href="#products" data-cursor="${f.key}" style="background:var(--site-${f.key})">${f.name}</a>`).join("")}</div>
        </div>
        ${NAV.slice(1).map(([href, , label], i) => `<div class="hs-menu__row is-${i + 2}"><a href="${href}">${label}</a></div>`).join("")}
      </nav>`;
    head.insertAdjacentHTML("afterend", '<div class="hs-fade"></div><div class="hs-wipe"></div>');
  }

  // ---------- Footer ----------
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("hs-foot");
    const ic = {
      a: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 16V9h2.3l.4-2.7H9.5V4.6c0-.8.2-1.3 1.3-1.3h1.4V.9A19 19 0 0 0 10.2.8C8.2.8 6.8 2 6.8 4.3v2H4.5V9h2.3v7z"/></svg>',
      b: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.4 0h-2.7v10.9a2.3 2.3 0 1 1-2.3-2.3l.6.1V6a5 5 0 1 0 4.4 4.9V5.3a6 6 0 0 0 3.5 1.1V3.7A3.5 3.5 0 0 1 11.4 0z"/></svg>',
      c: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.5" y="1.5" width="13" height="13" rx="4"/><circle cx="8" cy="8" r="3"/><circle cx="12" cy="4" r=".6" fill="currentColor"/></svg>',
    };
    foot.innerHTML = `
      <div class="hs-foot__box">
        <div class="hs-foot__logo"><a href="index.html">${logo}</a></div>
        <div class="hs-foot__title"><h2 class="hs-d" data-reveal-foot data-label="Your brand English closing slogan here, two words">Closing<br>Tagline</h2></div>
        <div class="hs-foot__nav">
          <nav class="hs-foot__main" aria-label="Footer Menu">${NAV.map(([href, , label], i) => `${i ? '<span class="hs-nav__div"></span>' : ""}<a href="${href}" data-stagger><span class="hs-link hs-t">${label}</span></a>`).join("")}</nav>
          <div class="hs-foot__social">${["a", "b", "c"].map((k) => `<a class="hs-social" href="#" aria-label="Social Link">${ic[k]}</a>`).join("")}</div>
          <nav class="hs-foot__sub" aria-label="Sub Menu"><a href="#" data-stagger><span class="hs-link hs-t">Parent company name</span></a><a href="#" data-stagger><span class="hs-link hs-t">Terms of service</span></a><a href="#" data-stagger><span class="hs-link hs-t">Privacy policy</span></a></nav>
        </div>
        <p class="hs-foot__copy hs-t">© Your company name here 0000</p>
      </div>`;
  }

  // A click that goes to another page skips the next page’s loader (same as the original wf_preloader_skip)
  addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href || href[0] === "#" || /^(mailto|tel):/.test(href) || a.target === "_blank" || /^https?:/.test(href)) return;
    sessionStorage.setItem("hs-pre-skip", "1");
    // Where view transitions do not work, like file://, the curtain rises from below to mimic the original page transition
    if (!document.startViewTransition || location.protocol === "file:") {
      if (HS.reduced) return;
      e.preventDefault();
      gsap.to(".hs-wipe", { clipPath: "inset(0% 0 0 0)", duration: 0.8, ease: "power4.inOut", onComplete: () => (location.href = a.href) });
      gsap.to("main", { scale: 0.9, opacity: 0.6, transformOrigin: "50% 30%", duration: 0.8, ease: "power4.inOut" });
    }
  });
  if (skipPre && !HS.reduced && location.protocol === "file:") {
    gsap.fromTo(".hs-wipe", { clipPath: "inset(0% 0 0 0)" }, { clipPath: "inset(0 0 100% 0)", duration: 0.95, ease: "power4.inOut" });
  }

  // ---------- Motion ----------
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = (HS.lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 5), smoothWheel: true, touchMultiplier: 1.5 }));
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); HS.lenis = null; };
  });

  // Loader: four characters enter from both sides and exit with back.inOut(2.2), the number climbs in four stops, and the box shrinks to header-bar height (65px) as the curtain lifts
  const pre = document.querySelector(".hs-pre");
  if (pre) {
    const first = !sessionStorage.getItem("hs-pre-visited");
    sessionStorage.setItem("hs-pre-visited", "1");
    const START = first ? 2.9 : 2.2;
    HS.startDelay = START;
    const off = mobile() ? "50vw" : "25vw";
    const L = ".hs-pre__mascot.is-1, .hs-pre__mascot.is-3", R = ".hs-pre__mascot.is-2, .hs-pre__mascot.is-4";
    gsap.from(L, { x: "-" + off, duration: 1, ease: "back.inOut(2.2)" });
    gsap.from(R, { x: off, duration: 1, ease: "back.inOut(2.2)" });
    gsap.to(L, { x: "-" + off, duration: 0.8, ease: "back.inOut(2.2)", delay: START - 0.8 });
    gsap.to(R, { x: off, duration: 0.8, ease: "back.inOut(2.2)", delay: START - 0.8 });
    const count = pre.querySelector(".hs-pre__count");
    const runFor = START - 0.5;
    const tl = gsap.timeline();
    const c = { v: first ? 0 : 53 };
    const weights = [0, 1, 2, 3].map(() => 0.6 + Math.random() * 0.8), wsum = weights.reduce((a, b) => a + b);
    const steps = [0.22, 0.48, 0.77, 1].map((p) => c.v + (100 - c.v) * p);
    steps.forEach((to, i) => {
      tl.to(c, { v: to, duration: runFor * 0.8 * (weights[i] / wsum), ease: "power1.inOut", onUpdate: () => (count.textContent = Math.round(c.v) + "%") });
      if (i < 3) tl.to({}, { duration: (runFor * 0.2) / 3 });
    });
    gsap.to(count, { scale: 0, duration: 0.5, ease: "back.inOut(2.2)", delay: runFor });
    gsap.timeline()
      .to(".hs-pre__box", { height: 65, duration: 0.8, ease: "power3.out" }, START)
      .to(pre, { height: 0, duration: 0.8, ease: "sine.in" }, START)
      .to(pre, { opacity: 0, duration: 0.3, ease: "sine.in" }, START + 0.8)
      .set(pre, { display: "none" });
  }

  // Reveal: data-reveal="chars|words|lines" ...text is raised 100% from below inside a mask, timed to when the loader lifts (+.5s).
  // Delay counts from when the page started — so it doesn’t get later by the time spent waiting for fonts (the original applies it without waiting for fonts)
  HS.split = (el, type) => (el._split ||= new SplitText(el, { type: type === "chars" ? "words,chars" : type, mask: type }));
  HS.reveal = (root = document) => {
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      const kind = el.dataset.reveal;
      const s = HS.split(el, kind);
      const units = kind === "chars" ? s.chars : kind === "lines" ? s.lines : s.words;
      gsap.from(units, {
        yPercent: 100, duration: parseFloat(el.dataset.dur) || 0.5, ease: el.dataset.ease || "back.inOut(2.2)",
        stagger: { amount: el.dataset.stagger ? parseFloat(el.dataset.stagger) : 0.2 },
        delay: Math.max(0, HS.startDelay + 0.5 + (parseFloat(el.dataset.delay) || 0) - (performance.now() - HS.t0) / 1000),
        scrollTrigger: { trigger: el, start: "top bottom", once: true },
      });
    });
  };

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.fonts.ready.then(() => {
      HS.reveal();
      // Footer title: when it reaches 50% from the top, the text rises from 101% below, and rewinds when scrolled back up
      const ft = document.querySelector("[data-reveal-foot]");
      if (ft) {
        const s = HS.split(ft, "chars");
        gsap.from(s.chars, { yPercent: 101, stagger: { amount: 0.2 }, duration: 0.5, ease: "back.out(1.7)", scrollTrigger: { trigger: ".hs-foot__box", start: "top 50%", toggleActions: "play none none reverse" } });
      }
    });
  });

  // Letter-roll link: each letter slides up past 100% and the same letter in text-shadow rises from below (.5s, .4s return, .01s between letters)
  mm.add("(pointer: fine) and (min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    const offs = [];
    document.querySelectorAll("[data-stagger]").forEach((a) => {
      const t = a.querySelector(".hs-link");
      const s = new SplitText(t, { type: "chars" });
      const on = () => gsap.to(s.chars, { yPercent: -100, duration: 0.5, ease: "back.inOut(2)", stagger: { each: 0.01, from: "start" }, overwrite: true });
      const off = () => gsap.to(s.chars, { yPercent: 0, duration: 0.4, ease: "back.inOut(2)", stagger: { each: 0.01, from: "end" }, overwrite: true });
      a.addEventListener("mouseenter", on);
      a.addEventListener("mouseleave", off);
      offs.push(() => { a.removeEventListener("mouseenter", on); a.removeEventListener("mouseleave", off); s.revert(); });
    });
    return () => offs.forEach((f) => f());
  });

  // Round button: on hover it spins 375 degrees (x 1px) with a light gray background, ink text and a salmon rim (back.inOut(2.5) .5s). Flavor buttons (data-flavor) fill with that flavor’s color while the text and rim turn light gray.
  // The social circle spins 360 degrees and fills with ink black
  HS.hoverSpin = (root = document) => {
    root.querySelectorAll(".hs-round").forEach((b) => {
      const k = b.dataset.flavor;
      const to = k
        ? { backgroundColor: HS.color(`--site-${k}`), color: HS.color("--kf-surface"), borderColor: HS.color("--kf-surface") }
        : { backgroundColor: HS.color("--kf-surface"), color: HS.color("--kf-ink"), borderColor: HS.color("--kf-bg") };
      const tw = gsap.to(b, { x: 1, rotation: 375, ...to, duration: 0.5, ease: "back.inOut(2.5)", paused: true });
      b.addEventListener("mouseenter", () => tw.restart());
      b.addEventListener("mouseleave", () => tw.reverse());
    });
  };
  HS.hoverSpin();
  document.querySelectorAll(".hs-social").forEach((b) => {
    const tw = gsap.to(b, { rotation: 360, backgroundColor: HS.color("--kf-ink"), color: HS.color("--kf-bg"), duration: 0.5, ease: "back.inOut(1.7)", paused: true });
    b.addEventListener("mouseenter", () => tw.play());
    b.addEventListener("mouseleave", () => tw.reverse());
  });

  // Magnet: News panel cards (strength .2) and the Contact panel (.4) are pulled toward the mouse (.4s power2.out) and return with elastic.out(1,.4) over .7s when it leaves.
  mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-magnetic]").forEach((z) => {
      const t = z.querySelector("[data-magnetic-target]") || z;
      const k = parseFloat(z.dataset.magneticStrength) || 0.4;
      z.addEventListener("mousemove", (e) => {
        const r = z.getBoundingClientRect();
        gsap.to(t, { x: (e.clientX - r.left - r.width / 2) * k, y: (e.clientY - r.top - r.height / 2) * k, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      });
      z.addEventListener("mouseleave", () => gsap.to(t, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)", overwrite: "auto" }));
    });
  });

  // Product drawer: hovering ”View Products” in the header band animates height 0→auto (back.out), cell top half 0→50%, and images · names scatter in from .8→1. Hovering a cell makes the character shake five times at 7 degrees
  const sub = document.querySelector(".hs-sub");
  const pbtn = document.querySelector(".hs-products-btn");
  if (sub && pbtn) {
    const subTl = gsap.timeline({ paused: true })
      .set(sub, { display: "grid" })
      .fromTo(pbtn.querySelector(".hs-hbtn__fill"), { opacity: 0, yPercent: 101, scale: 0.5 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.5, ease: "back.inOut(1.7)" }, 0)
      .fromTo(sub, { height: 0 }, { height: "auto", duration: 0.5, ease: "back.out(1.7)" }, 0.06)
      .fromTo(sub.querySelectorAll(".hs-sub__fill"), { height: "0%" }, { height: "50%", duration: 0.5, ease: "back.inOut(1.7)", stagger: { amount: 0.1 } }, 0.14)
      .fromTo(sub.querySelectorAll(".hs-sub__mascot, .hs-sub__tag, .hs-sub__nuts"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)", stagger: { amount: 0.3 } }, 0.5);
    pbtn.addEventListener("mouseenter", () => { if (!mobile()) subTl.timeScale(1).play(); });
    // The original keeps it open when leaving the button, and rewinds at 1.5x only on leaving the drawer cell
    sub.addEventListener("mouseleave", () => subTl.timeScale(1.5).reverse());
    sub.querySelectorAll(".hs-sub__card").forEach((c) => {
      const m = c.querySelector(".hs-sub__mascot");
      c.addEventListener("mouseenter", () => gsap.fromTo(m, { rotation: 0 }, { rotation: 7, duration: 0.5, ease: "hsWiggle" }));
    });
  }

  // Search: an input floats over the header band and the back is a 70% dark ink overlay. Pressing the overlay or close rewinds it
  const fade = document.querySelector(".hs-fade");
  const search = document.querySelector(".hs-search");
  if (search) {
    const sTl = gsap.timeline({ paused: true })
      .set([search, fade], { display: "flex" })
      .fromTo(search, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      .fromTo(fade, { opacity: 0 }, { opacity: 0.7, duration: 0.5 }, 0);
    document.querySelector(".hs-search-btn").addEventListener("click", () => { sTl.play(); search.querySelector("input").focus({ preventScroll: true }); });
    search.querySelector("button").addEventListener("click", () => sTl.reverse());
    fade.addEventListener("click", () => { sTl.reverse(); menuClose(); });
  }

  // Phone menu: lines drop from behind the header band, starting at -101% · -201% … -601%, with back.out(1.7) over .8s, the two hamburger lines slide out left and right, and ”Close” snaps upright from 20 degrees
  const menu = document.querySelector(".hs-menu");
  const mbtn = document.querySelector(".hs-menu-btn");
  let menuTl;
  const menuClose = () => { if (menuTl && menuTl.progress() > 0) { menuTl.reverse(); mbtn.setAttribute("aria-expanded", "false"); } };
  if (menu && mbtn) {
    const rows = [".is-1", ".is-6", ".is-2", ".is-3", ".is-4", ".is-5"].map((s) => menu.querySelector(s));
    menuTl = gsap.timeline({ paused: true })
      .set(menu, { display: "flex" }).set(fade, { display: "block" });
    rows.forEach((r, i) => menuTl.fromTo(r, { yPercent: -(i + 1) * 100 - 1 }, { yPercent: 0, duration: 0.8, ease: "back.out(1.7)" }, 0.11 - i * 0.02));
    menuTl.fromTo(fade, { opacity: 0 }, { opacity: 0.6, duration: 0.5 }, 0.01)
      .to(mbtn.querySelector(".t"), { xPercent: 101, duration: 0.5, ease: "back.inOut(1.7)" }, 0.1)
      .to(mbtn.querySelector(".m"), { xPercent: -101, duration: 0.5, ease: "back.inOut(1.7)" }, 0.1)
      .fromTo(mbtn.querySelector("b"), { y: 0, rotation: 20 }, { y: -20, rotation: 0, duration: 0.5, ease: "back.inOut(3)" }, 0.2);
    mbtn.addEventListener("click", () => {
      const open = mbtn.getAttribute("aria-expanded") === "true";
      mbtn.setAttribute("aria-expanded", String(!open));
      open ? menuTl.reverse() : menuTl.play();
    });
    const tg = menu.querySelector(".hs-menu__toggle");
    const list = menu.querySelector(".hs-menu__list");
    tg.addEventListener("click", () => {
      const open = tg.getAttribute("aria-expanded") === "true";
      tg.setAttribute("aria-expanded", String(!open));
      if (open) gsap.to(list, { height: 0, duration: 0.4, ease: "back.in(1.7)", onComplete: () => gsap.set(list, { display: "none", height: "auto" }) });
      else gsap.fromTo(list, { display: "flex", height: 0 }, { height: "auto", duration: 0.5, ease: "back.out(1.7)" });
    });
  }

  // In the original, on a page returned to by back, Lenis is turned on again and ScrollTrigger is re-measured
  addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set(".hs-wipe", { clipPath: "inset(100% 0 0 0)" }); gsap.set("main", { clearProps: "all" }); ScrollTrigger.refresh(true); } });
})();
