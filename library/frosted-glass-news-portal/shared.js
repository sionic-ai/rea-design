// Draws the header, drawer, phone menu, country picker window and footer shared by all pages in one place — the original also attaches the same frame (header-global·general_footer) to each page.
// Motion values are exactly those of the original header-global.js and navigation.js (velocity): the curve name is easeOutQuart = power3.out, easeOutCubic = power2.out, easeInCubic = power2.in, easeInOutQuad = power1.inOut
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";

  const icon = {
    mark: '<svg class="gt-mark" viewBox="0 0 68 41" aria-hidden="true"><path fill="currentColor" d="M21 3h31l-3 7H23C16.5 10 12 14.8 12 21s4.3 10 10 10h5l-3 7h-4C9.6 38 3 31.4 3 21.6 3 11.3 11 3 21 3Z"/><path fill="currentColor" d="M34 17h12l-9.3 21H30Zm16-7h17l-3 7h-7l-9.3 21h-7.2L50 17Z"/></svg>',
    fb: '<svg viewBox="0 0 12 12"><path d="M7 12V6.9h1.7l.3-2H7V3.7c0-.6.2-1 1-1h1V1A13 13 0 0 0 7.6.9C6.2.9 5.2 1.8 5.2 3.4v1.5H3.5v2h1.7V12Z"/></svg>',
    x: '<svg viewBox="0 0 12 12"><path d="M9.2 1h1.6L7.3 5 11.4 11H8.2L5.7 7.7 2.8 11H1.2l3.7-4.3L1 1h3.3l2.3 3Zm-.6 9h.9L3.8 1.9h-1Z"/></svg>',
    yt: '<svg viewBox="0 0 12 12"><path d="M11.4 3.4a1.4 1.4 0 0 0-1-1C9.5 2.2 6 2.2 6 2.2s-3.5 0-4.4.2a1.4 1.4 0 0 0-1 1A15 15 0 0 0 .4 6a15 15 0 0 0 .2 2.6 1.4 1.4 0 0 0 1 1c.9.2 4.4.2 4.4.2s3.5 0 4.4-.2a1.4 1.4 0 0 0 1-1 15 15 0 0 0 .2-2.6 15 15 0 0 0-.2-2.6ZM4.9 7.7V4.3L7.8 6Z"/></svg>',
    ig: '<svg viewBox="0 0 12 12"><path d="M6 1.1c1.6 0 1.8 0 2.4.1 1.6.1 2.3.8 2.4 2.4v4.8c-.1 1.6-.8 2.3-2.4 2.4H3.6c-1.6-.1-2.3-.8-2.4-2.4V3.6c.1-1.6.8-2.3 2.4-2.4Zm0-1.1H3.5C1.4.1.1 1.4 0 3.5v5C.1 10.6 1.4 11.9 3.5 12h5c2.1-.1 3.4-1.4 3.5-3.5v-5C11.9 1.4 10.6.1 8.5 0ZM6 2.9A3.1 3.1 0 1 0 9.1 6 3.1 3.1 0 0 0 6 2.9ZM6 8a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm3.2-5.9a.7.7 0 1 0 .7.7.7.7 0 0 0-.7-.7Z"/></svg>',
    me: '<svg viewBox="0 0 18 18"><circle cx="9" cy="5.5" r="3.6"/><path d="M2.2 17c.4-3.7 3.2-6.2 6.8-6.2s6.4 2.5 6.8 6.2Z"/></svg>',
    search: '<svg viewBox="0 0 18 18"><circle cx="7.5" cy="7.5" r="5.6"/><path d="m11.6 11.6 5 5"/></svg>',
  };
  const sns = `<ul class="gt-sns">${[["fb", "Social 1"], ["x", "Social 2"], ["yt", "Video channel"], ["ig", "Social 3"]].map(([k, l]) => `<li><a href="#" aria-label="${l}" data-nofade>${icon[k]}</a></li>`).join("")}</ul>`;
  // The three product logos in the original menu are image text — replaced with our English wordmarks at the same spot and width
  const word = {
    title: '<span class="gt-word" data-label="Game title logo"><small>Title</small><b>7</b></span>',
    live: '<span class="gt-word is-live" data-label="Relay channel logo"><small>Brand</small>Live</span>',
    series: '<span class="gt-word is-series" data-label="Tournament series logo">World<small>Series</small></span>',
  };
  const navItems = [
    ["news.html", "News", null, "news"],
    ["#", null, word.title],
    ["#", null, word.live],
    ["#", null, word.series],
    ["product.html", "Product Info", null, "product"],
  ];
  const navTop = navItems.map(([h, t, w]) => `<a href="${h}">${t || w}</a>`).join("");
  const navBar = navItems.map(([h, t, w, key]) => `<a href="${h}"${key && (key === page || (page === "article" && key === "news")) ? ' aria-current="page"' : ""}>${t ? `<span class="gt-nav-text">${t}</span>` : w}</a>`).join("");

  const drawer = `
    <div class="gt-drawer" data-fx-part="layer">
      <div data-fx-part="lay"></div>
      <nav class="gt-drawer__panel" data-fx-part="panel" aria-label="Full menu">
        <div class="gt-drawer__inner">
          <button class="gt-drawer__close" type="button" aria-label="Close"></button>
          <a class="gt-drawer__logo" href="index.html" aria-label="Home">${icon.mark}</a>
          <a class="gt-drawer__home" href="index.html" data-nofade>Home</a>
          <div class="gt-drawer__nav">
            <ul><li><a href="news.html" data-nofade>News</a></li><li><a href="#" data-nofade>Game title</a></li><li><a href="#" data-nofade>Relay channel</a></li><li><a href="#" data-nofade>Event Series</a></li><li><a href="product.html" data-nofade>Product Info</a></li></ul>
            <ul style="margin-top:28px"><li><a href="#" data-nofade>Concept car project</a></li><li><a href="#" data-nofade>Driver Academy</a></li></ul>
          </div>
          <div class="gt-drawer__btm"><a href="#" data-nofade>Terms of service</a><a href="#" data-nofade>Privacy policy</a><a href="#" data-nofade>Report copyright infringement</a></div>
          <span class="gt-drawer__pdi wf-logo">Developer logo</span>
          ${sns}
        </div>
      </nav>
    </div>`;

  const user = `
    <div class="gt-user">
      <a class="gt-user__me" href="#">${icon.me}<span>My Page</span></a>
      <a class="gt-user__search" href="#" aria-label="Search">${icon.search}</a>
      <button class="gt-burger is-pc" type="button" data-fx-part="toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <button class="gt-burger is-sp" type="button" data-sp-open aria-label="Menu"><span></span><span></span><span></span></button>
      <button class="gt-user__flag" type="button" data-locale-open aria-label="Choose a country"><i></i></button>
    </div>`;

  const drawerFx = 'data-fx="side-drawer" data-fx-side-drawer="dur: .6; close: .6; fade: .1; delay: 0; ease: 0.23,1,0.32,1"';
  const head = document.querySelector('[data-gt="header"]');
  if (head) {
    const top = head.dataset.head === "top";
    head.outerHTML = top
      ? `<header class="gt-head gt-head--top" data-slot="header" ${drawerFx}>
          ${sns}
          <a class="gt-head__logo" href="index.html" aria-label="Home">${icon.mark}</a>
          ${user}
          <nav class="gt-head__nav" aria-label="Main menu">${navTop}</nav>
          <button class="gt-fab" type="button" aria-label="Open Menu" data-fx="float-rise-corner" data-fx-float-rise-corner="at: 145; axis: x; from: 113; dur: .6; out: .4; ease: 0.77,0,0.175,1; sink-ease: 0.165,0.84,0.44,1; look: fade"><span></span><span></span><span></span></button>
          ${drawer}
        </header>`
      : `<header class="gt-head gt-head--bar" data-slot="header" ${drawerFx}>
          <a class="gt-head__logo" href="index.html" aria-label="Home">${icon.mark}</a>
          <nav class="gt-head__nav" aria-label="Main menu">${navBar}</nav>
          ${sns}
          ${user}
          ${drawer}
        </header>`;
  }

  const foot = document.querySelector('[data-gt="footer"]');
  if (foot) {
    foot.outerHTML = `
      <footer class="gt-foot is-${foot.dataset.foot || "top"}" data-slot="footer">
        <nav class="gt-foot__nav" aria-label="Legal notice"><ul><li><a href="#" data-nofade>Terms of service</a></li><li><a href="#" data-nofade>Privacy policy</a></li><li><a href="#" data-nofade>Report copyright infringement</a></li></ul></nav>
        <div class="gt-foot__links">
          <div><span class="wf-logo" style="width:122px;min-width:0">Company</span><span class="wf-logo" style="width:46px;min-width:0">ST</span></div>
          <div><a href="#" class="wf-logo" style="width:133px;min-width:0;height:22px" data-nofade>Platform</a><a href="#" class="wf-logo" style="width:162px;min-width:0;height:22px" data-nofade>Network</a></div>
        </div>
        <div class="gt-foot__base"><small class="gt-foot__copy">© 2026 Company Name. Developed by Studio Name.<br>Manufacturers, cars, names, brands and associated imagery featured here are placeholders for the legal notice — trademarks and copyrighted materials of their respective owners. Any depiction or recreation of real world locations, entities or businesses is not intended to imply sponsorship or endorsement.</small></div>
        <a class="gt-foot__pdi" href="#" data-nofade aria-label="Developer company"><span class="wf-logo">Studio Logo</span></a>
      </footer>`;
  }

  // ── Phone full menu·country picker window — a layer visible only when open, so attached at the end of the document ──
  const layers = document.createElement("div");
  layers.innerHTML = `
    <div class="gt-spnav" data-slot="mobile-menu" aria-hidden="true">
      <button class="gt-spnav__close" type="button" aria-label="Close"></button>
      <div class="gt-spnav__main">
        <a class="gt-spnav__logo" href="index.html" aria-label="Home">${icon.mark}</a>
        <a class="gt-spnav__home" href="index.html">Home</a>
        <ul class="gt-spnav__list">
          <li><a href="news.html">News</a></li>
          <li><button class="gt-spnav__mega" type="button" aria-expanded="false">Game title</button>
            <div class="gt-spnav__sub"><a href="#">Home</a><a href="#">My Page</a><a href="#">Showcase</a><a href="#">Versus mode</a><a href="#">Manual</a><a href="#">Included Car Models</a><a href="#">Included Courses</a><a href="#">Beyond Title</a></div></li>
          <li><a href="#">Relay channel</a></li>
          <li><a href="#">Event Series</a></li>
          <li><a href="product.html">Product Info</a></li>
        </ul>
        <ul class="gt-spnav__list"><li><a href="#">Concept car project</a></li><li><a href="#">Driver Academy</a></li></ul>
        <div class="gt-spnav__btm"><a href="#">Terms of service</a><a href="#">Privacy policy</a><a href="#">Report copyright infringement</a></div>
        <div class="gt-spnav__foot"><span class="wf-logo">Studio Logo</span>${sns}</div>
      </div>
    </div>
    <div class="gt-locale" data-slot="locale-window" aria-hidden="true">
      <div class="gt-locale__bg"></div>
      <h2 class="gt-locale__title">Select your country / region</h2>
      <button class="gt-locale__close" type="button"><span>Close Window</span></button>
      <div class="gt-locale__inner">
        ${[[10], [11, 10], [2, 1, 1]].map((cols, i) => `<div class="gt-locale__area">${cols.length === 2
          ? `<h3>Region Name ${i + 1}</h3><div class="gt-locale__cols">${cols.map((n) => `<ul>${Array.from({ length: n }, () => '<li><a href="#" data-nofade>Country (Language)</a></li>').join("")}</ul>`).join("")}</div>`
          : cols.map((n, j) => `<h3>Region Name ${i + j + 1}</h3><ul>${Array.from({ length: n }, () => '<li><a href="#" data-nofade>Country (Language)</a></li>').join("")}</ul>`).join("")}</div>`).join("")}
      </div>
    </div>`;
  body.append(...layers.children);

  // The original passes the drawer menu, footer, banner (.no_fade) and country links straight through without the cover — the cover (page-veil) takes presses on body, so stop here
  document.addEventListener("click", (e) => { if (e.target.closest("a[data-nofade]")) e.stopPropagation(); }, true);
  // Stopping at the capture phase leaves the link’s default action, so it still navigates. But other handlers above it can’t receive the event either, so no other handlers are attached to data-nofade links

  const mm = gsap.matchMedia();
  let reduce = false;
  mm.add("(prefers-reduced-motion: reduce)", () => { reduce = true; return () => { reduce = false; }; });
  const d = (s) => (reduce ? 0 : s);

  // ── Drawer (side-drawer part) — the close button and the floating round button press the same toggle. While open, the background doesn’t scroll ──
  const header = document.querySelector(".gt-head");
  const toggle = header?.querySelector('[data-fx-part="toggle"]');
  header?.querySelector(".gt-drawer__close")?.addEventListener("click", () => toggle?.click());
  header?.querySelector(".gt-fab")?.addEventListener("click", () => toggle?.click());
  if (header) new MutationObserver(() => body.classList.toggle("is-locked", header.classList.contains("is-open"))).observe(header, { attributes: true, attributeFilter: ["class"] });

  // ── Phone full menu — curtain .2s easeOutCubic, panel from 100px below .2s later over .35s easeOutQuart. On close the panel goes to 50px in .2s easeInCubic, curtain after .3s over .2s ──
  const sp = document.querySelector(".gt-spnav"), spMain = sp.querySelector(".gt-spnav__main");
  const spOpen = () => {
    sp.style.display = "block";
    sp.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    gsap.killTweensOf([sp, spMain]);
    gsap.to(sp, { opacity: 1, duration: d(0.2), ease: "power2.out" });
    gsap.fromTo(spMain, { opacity: 0, top: 100 }, { opacity: 1, top: 0, duration: d(0.35), delay: d(0.2), ease: "power3.out" });
  };
  const spClose = () => {
    gsap.killTweensOf([sp, spMain]);
    gsap.to(spMain, { opacity: 0, top: 50, duration: d(0.2), ease: "power2.in" });
    gsap.to(sp, { opacity: 0, duration: d(0.2), delay: d(0.3), ease: "none", onComplete: () => {
      sp.style.display = "";
      sp.setAttribute("aria-hidden", "true");
      gsap.set(spMain, { top: 100 });
      sp.querySelectorAll(".gt-spnav__mega").forEach((m) => { m.classList.remove("is-open"); m.setAttribute("aria-expanded", "false"); gsap.set(m.nextElementSibling, { clearProps: "all" }); });
    } });
    body.classList.remove("is-locked");
  };
  document.querySelector("[data-sp-open]")?.addEventListener("click", spOpen);
  sp.querySelector(".gt-spnav__close").addEventListener("click", spClose);
  // Collapsible submenu — slideDown·slideUp 300ms easeOutQuart
  sp.querySelectorAll(".gt-spnav__mega").forEach((m) => m.addEventListener("click", () => {
    const sub = m.nextElementSibling, open = !m.classList.contains("is-open");
    m.classList.toggle("is-open", open);
    m.setAttribute("aria-expanded", String(open));
    gsap.killTweensOf(sub);
    if (open) gsap.fromTo(sub, { display: "block", height: 0 }, { height: "auto", duration: d(0.3), ease: "power3.out" });
    else gsap.to(sub, { height: 0, duration: d(0.3), ease: "power3.out", onComplete: () => gsap.set(sub, { display: "none" }) });
  }));

  // ── Country picker window — curtain .1s, title .3s linear, list after .25s .4s easeInOutQuad margin-top 30 → 0, close text after .6s .4s easeOutCubic top 53 → 45 ──
  const lc = document.querySelector(".gt-locale");
  const lcBg = lc.querySelector(".gt-locale__bg"), lcIn = lc.querySelector(".gt-locale__inner"), lcTitle = lc.querySelector(".gt-locale__title"), lcClose = lc.querySelector(".gt-locale__close");
  document.querySelector("[data-locale-open]")?.addEventListener("click", () => {
    lc.style.display = "block";
    lc.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    gsap.killTweensOf([lcBg, lcIn, lcTitle, lcClose]);
    gsap.to(lcBg, { opacity: 1, duration: d(0.1), ease: "power2.out" });
    gsap.to(lcIn, { opacity: 1, marginTop: 0, duration: d(0.4), delay: d(0.25), ease: "power1.inOut" });
    gsap.to(lcTitle, { opacity: 1, duration: d(0.3), ease: "none" });
    gsap.to(lcClose, { opacity: 1, top: 45, duration: d(0.4), delay: d(0.6), ease: "power2.out" });
  });
  lcClose.addEventListener("click", () => {
    gsap.killTweensOf([lcBg, lcIn, lcTitle, lcClose]);
    gsap.to(lcIn, { opacity: 0, duration: d(0.2), ease: "power2.out" });
    gsap.to(lcClose, { opacity: 0, top: 53, duration: d(0.2), ease: "power2.out" });
    gsap.set(lcTitle, { opacity: 0 });
    gsap.to(lcBg, { opacity: 0, duration: d(0.3), delay: d(0.2), ease: "none", onComplete: () => {
      lc.style.display = "";
      lc.setAttribute("aria-hidden", "true");
      gsap.set(lcIn, { marginTop: 30 });
    } });
    body.classList.remove("is-locked");
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (lc.style.display === "block") lcClose.click();
    if (sp.style.display === "block") spClose();
  });
})();
