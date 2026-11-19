/* Brand — draws the header · large menu panel · phone drawer · footer · floating banner in the same form on every page, and hooks up the fixed header · accordion · card strip (Swiper 9) */
(() => {
  const NAV = [
    { key: "feature", label: "Key strengths", icon: "star", cols: 3, groups: [["For first-timers", ["Guide for first-time visitors", "Why we choose"]], ["Brand", ["Brand message", "Brand Statement"]], ["Browse all", ["Special 1", "Special 2"]]] },
    { key: "price", label: "Pricing · Services", icon: "coin", cols: 3, href: "service.html", groups: [["Fee", ["Price list", "Calculate Fees"]], ["Service", ["Service · Option list", "Unlimited data"]], ["Discount", ["Campaign", "Family Discount"]]] },
    { key: "device", label: "Terminal", icon: "phone", cols: 3, groups: [["Device fraud", ["Smartphone", "Tablets and routers"]], ["Use your own device", ["Operation check terminal"]], ["Accessories", ["Case · charger"]]] },
    { key: "shop", label: "Store", icon: "shop", cols: 2, href: "shop.html", groups: [["Find a store", ["Store search", "What you can do in store"]], ["Receive", ["Pick up a card in store"]]] },
    { key: "guide", label: "Application Guide", icon: "doc", cols: 3, groups: [["Preparation", ["Application Flow", "On the device you already have"]], ["After receiving", ["Initial Setup", "Start writing"]], ["Switching", ["Move number"]]] },
    { key: "support", label: "Help", icon: "hand", cols: 3, groups: [["Get help", ["Customer support", "Setup Guide"]], ["Asking", ["Frequently asked questions", "AI chat"]], ["Contact", ["Contact Us"]]] },
    { key: "community", label: "Community", icon: "crown", cols: 2, groups: [["Group site", ["Group site", "Beginner’s guide"]], ["Recommended posts", ["Review", "Questions and Answers"]]] },
  ];
  const ICON = {
    star: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="ic-b"/><path d="M20 9l3.2 7 7.6.8-5.7 5.1 1.6 7.5L20 25.6l-6.7 3.8 1.6-7.5-5.7-5.1 7.6-.8z" class="ic-a"/></svg>',
    coin: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" class="ic-a"/><path d="M14 12l6 8 6-8M20 20v10M15 21h10M15 25h10" class="ic-s"/></svg>',
    phone: '<svg viewBox="0 0 40 40"><rect x="12" y="5" width="16" height="30" rx="3" class="ic-a"/><rect x="15" y="9" width="10" height="20" class="ic-b"/><path d="M26 6l6-3v8" class="ic-s2"/></svg>',
    shop: '<svg viewBox="0 0 40 40"><path d="M7 15l3-8h20l3 8z" class="ic-a"/><rect x="9" y="15" width="22" height="17" class="ic-b2"/><rect x="16" y="21" width="8" height="11" class="ic-a"/></svg>',
    doc: '<svg viewBox="0 0 40 40"><rect x="10" y="6" width="20" height="28" rx="2" class="ic-b2"/><path d="M14 13h12M14 18h12M14 23h8" class="ic-s2"/><circle cx="29" cy="29" r="6" class="ic-a"/></svg>',
    hand: '<svg viewBox="0 0 40 40"><path d="M6 26c6-1 10 2 14 2h10c2 0 2 3 0 3H18" class="ic-s2"/><circle cx="22" cy="14" r="7" class="ic-a"/></svg>',
    crown: '<svg viewBox="0 0 40 40"><path d="M7 30l-2-17 9 7 6-11 6 11 9-7-2 17z" class="ic-y"/><rect x="7" y="30" width="26" height="4" class="ic-a"/></svg>',
  };
  const LOGO = '<svg viewBox="0 0 114 40" aria-hidden="true"><path d="M30 13c-3-6-1-11 3-12 2 4 1 9-3 12zm1 0c5-4 10-4 12-1-3 3-8 3-12 1z" fill="currentColor"/><text x="57" y="35" text-anchor="middle" font-size="27" font-weight="900" fill="currentColor" style="font-family:var(--kf-font-display)">LOGO</text></svg>';
  const SEARCH = '<svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="6"/><path d="M13 13l5 5"/></svg>';
  const ME = '<span class="mn-ic mn-ic--me"><svg viewBox="0 0 20 20"><circle cx="10" cy="6" r="4" class="a"/><path d="M2 19c0-5 4-7 8-7s8 2 8 7z" class="b"/></svg></span>';
  const APPLY = '<span class="mn-ic mn-ic--apply"><svg viewBox="0 0 20 20"><path d="M5 3h8l3 3v11H5z"/><path d="M8 9h5M8 12h4"/></svg></span>';
  const link = (t, href = "#") => `<a class="mn-mm__link" href="${href}">${t}</a>`;

  const page = document.querySelector(".mn-page");
  const current = document.body.dataset.nav;

  function head() {
    const nav = NAV.map((n) => `<a href="#mm-${n.key}" class="mn-gnav__a${n.key === current ? " is-current" : ""}" data-fx-part="trigger">${n.label}</a>`).join("");
    const boxes = NAV.map((n) => `
      <div data-fx-part="box" id="mm-${n.key}">
        <div class="mn-mm__head"><span class="mn-mm__icon">${ICON[n.icon]}</span>${n.label}<button type="button" class="mn-mm__close" data-fx-part="close" aria-label="Close"></button></div>
        <div class="mn-mm__body" style="--cols:${n.cols}">${n.groups.map(([h, ls]) => `<div><p>${h}</p>${ls.map((l, i) => link(l, i === 0 && n.href ? n.href : "#")).join("")}</div>`).join("")}</div>
        <div class="mn-mm__banners">${[1, 2, 3].map((i) => `<a href="news.html" class="mn-hover"><div class="wf-img" data-label="Menu Banner ${i} · Campaign lettering art · landscape 2:1"></div></a>`).join("")}</div>
      </div>`).join("");
    return `
    <div class="mn-head__bar">
      <a class="mn-logo" href="index.html" aria-label="First Page">${LOGO}</a>
      <ul class="mn-util">
        <li><a class="mn-util__a" href="biz.html">Corporate clients</a></li><li><a class="mn-util__a" href="index.html#news">Notice</a></li><li><a class="mn-util__a" href="news.html">Campaign</a></li><li><a class="mn-util__a" href="#">Feature</a></li><li><a class="mn-util__a" href="about.html">Brand message</a></li>
        <li class="mn-search"><input type="text" placeholder="Site Search" aria-label="Site Search"><button type="button" aria-label="Search">${SEARCH}</button></li>
      </ul>
      <nav class="mn-gnav" data-fx="click-mega-panel" aria-label="Large menu">${nav}
        <div data-fx-part="panel"><div style="position:relative"><span data-fx-part="arrow"></span>${boxes}</div></div>
        <div data-fx-part="mask"></div>
      </nav>
      <ul class="mn-btns">
        <li><a href="#">${ME}My Page</a></li>
        <li><a href="#">${APPLY}Application</a></li>
        <li class="mn-burger"><button type="button" data-mn-drawer aria-label="Open Menu"><span class="mn-ic"><span></span><span></span><span></span></span>Menu</button></li>
      </ul>
    </div>`;
  }

  function drawer() {
    return `
    <div class="mn-drawer__bg" data-mn-close></div>
    <div class="mn-drawer__in">
      <button type="button" class="mn-drawer__close" data-mn-close><span></span>Close</button>
      <div class="mn-drawer__search"><input type="text" placeholder="Site Search" aria-label="Site Search"><button type="button" aria-label="Search">${SEARCH}</button></div>
      <ul class="mn-drawer__link"><li><a href="#">My Page</a></li><li><a href="#">Application</a></li></ul>
      <div class="mn-drawer__list" data-acc>
        ${NAV.map((n) => `<dl data-acc-item><dt data-acc-head>${ICON[n.icon]}${n.label}</dt><dd data-acc-body>${n.groups.flatMap(([, ls]) => ls).map((l, i) => `<a href="${i === 0 && n.href ? n.href : "#"}">${l}</a>`).join("")}</dd></dl>`).join("")}
      </div>
      <a class="mn-drawer__logo" href="index.html" aria-label="First Page">${LOGO}</a>
    </div>`;
  }

  const SNS = ["f", "l", "x", "y", "i"].map((k) => `<li><a href="#" aria-label="SNS ${k}"><svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="${k === "x" ? 3 : 4}"/></svg></a></li>`).join("");
  const MAP = [
    [["Key strengths", ["For first-time visitors", "Why we choose", "Brand Statement"]], ["Pricing · Services", ["Price list", "Service · Option list", "Easy fee calculation"]]],
    [["Terminal", ["Choose a device to use", "<b>Device fraud</b>", "Smartphone", "Tablets and routers", "<b>Use your own device</b>", "Operation check terminal"]], ["Store", ["Find a store", "What you can do in store", "Pick up a card in store"]]],
    [["Application Guide", ["<b>From preparation to application</b>", "On the device you already have", "Buy device together", "<b>When the Card Arrives</b>", "From first setup to first use"]], ["Help", ["Customer support", "Initial settings · all settings", "Frequently asked questions", "AI Chat Support", "Inquiry"]]],
    [["Community", ["Group site", "First-time meetup guide", "<b>Recommended posts</b>", "Review", "Questions and Answers", "Idea collection", "Data sharing bin"]]],
  ];
  function foot(crumb) {
    const col = (groups) => groups.map(([h, ls]) => `<dl data-acc-item><dt data-acc-head>${h}</dt><dd data-acc-body>${ls.map((l) => (l.startsWith("<b>") ? l : `<a href="#">${l}</a>`)).join("")}</dd></dl>`).join("");
    return `
    <div class="mn-crumb"><div class="mn-wrap">${crumb}</div><button type="button" class="mn-top" data-mn-top aria-label="Back to top"></button></div>
    <footer class="mn-foot" data-slot="footer">
      <ul class="mn-sns">${SNS}</ul>
      <a class="mn-foot__logo mn-hover" href="index.html" aria-label="First Page">${LOGO}</a>
      <div class="mn-wrap mn-sitemap" data-acc>${MAP.map((g) => `<div>${col(g)}</div>`).join("")}</div>
      <div class="mn-foot__util"><div class="mn-narrow">
        <div class="mn-foot__btns"><a href="#" class="mn-foot__me">${ME.replace("mn-ic ", "mn-ic mn-ic--sm ")}My Page</a><a href="#" class="is-pink">Application</a></div>
        <ul class="mn-foot__links"><li><a href="biz.html">Corporate clients</a></li><li><a href="#">Notice</a></li><li><a href="news.html">Campaign</a></li><li><a href="#">Feature</a></li></ul>
        <div class="mn-foot__search"><input type="text" placeholder="Site Search" aria-label="Site Search"><button type="button" aria-label="Search">${SEARCH}</button></div>
        <p class="mn-foot__note">Put two lines of price notice here. Listed prices include tax unless noted otherwise.</p>
      </div></div>
      <div class="mn-foot__corp"><div class="wf-logo">Operator Logo</div><div class="mn-foot__line"></div>
        <ul class="mn-foot__legal"><li><a href="#">Operator</a></li><li><a href="#">Information security</a></li><li><a href="#">Personal information</a></li><li><a href="#">Cookie Policy</a></li><li><a href="#">Site Use</a></li><li><a href="#">Terms</a></li></ul>
        <p class="mn-foot__copy">© Operator name</p></div>
    </footer>`;
  }

  // Draws on the placeholder — brand message and corporate pages place their own header and footer directly
  const headEl = document.querySelector("[data-mn-head]");
  if (headEl) headEl.innerHTML = head();
  const drawerEl = document.querySelector("[data-mn-drawer-box]");
  if (drawerEl) drawerEl.innerHTML = drawer();
  const footEl = document.querySelector("[data-mn-foot]");
  if (footEl) footEl.outerHTML = foot(footEl.dataset.crumb || "Home");
  const floatEl = document.querySelector("[data-mn-float]");
  if (floatEl) floatEl.innerHTML = `<a href="news.html" class="mn-hover"><div class="wf-img" data-label="Limited-time pricing banner · big price number and period · landscape 330:88"></div></a><button type="button" class="mn-float__x" data-mn-float-x aria-label="Close banner"></button>`;

  // Fixed header — original template.js: once scroll passes the header height (90) it becomes a fixed panel (-80px→0 .3s)
  const header = document.querySelector(".mn-head[data-mn-head]");
  if (header && page) {
    const onScroll = () => {
      if (document.documentElement.style.overflow === "hidden") return;
      const on = scrollY > 90 && innerWidth > 767;
      header.classList.toggle("is-fixed", on);
      page.classList.toggle("is-fixed", on);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Phone drawer
  const box = drawerEl;
  if (box) {
    let y = 0;
    const open = () => { y = scrollY; box.classList.add("is-on"); document.documentElement.style.overflow = "hidden"; };
    const close = () => { box.classList.remove("is-on"); document.documentElement.style.overflow = ""; };
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-mn-drawer]")) open();
      else if (e.target.closest("[data-mn-close]")) close();
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && box.classList.contains("is-on")) close(); });
  }

  // Accordion — original slideToggle 400ms (swing replaced with easeOutQuad by jquery.easing). The footer sitemap collapses only on phones
  document.querySelectorAll("[data-acc]").forEach((acc) => {
    acc.addEventListener("click", (e) => {
      const h = e.target.closest("[data-acc-head]");
      if (!h || !acc.contains(h)) return;
      if (acc.classList.contains("mn-sitemap") && innerWidth > 767) return;
      const item = h.closest("[data-acc-item]");
      const body = item.querySelector("[data-acc-body]");
      const on = !item.classList.contains("is-on");
      item.classList.toggle("is-on", on);
      h.setAttribute("aria-expanded", on);
      gsap.killTweensOf(body);
      if (on) gsap.fromTo(body, { display: "block", height: 0 }, { height: "auto", duration: reduce ? 0 : 0.4, ease: "power1.out", clearProps: "height" });
      else gsap.to(body, { height: 0, duration: reduce ? 0 : 0.4, ease: "power1.out", onComplete: () => gsap.set(body, { clearProps: "display,height" }) });
    });
  });

  // Back to top — set the original scrollTop straight to 0
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-mn-top]")) scrollTo({ top: 0, behavior: "auto" });
    if (e.target.closest("[data-mn-float-x]")) e.target.closest(".mn-float")?.classList.add("is-off");
  });

  // Card strip — exactly the original main.js Swiper 9 settings: phone 1.5 slides centered, gap 15, 768 and up 3 slides, gap 24/28, endless
  window.mnSwipers = [...document.querySelectorAll(".mn-swiper")].map((wrap) => {
    const el = wrap.querySelector(".swiper");
    if (!el || !window.Swiper) return null;
    const gap = +(wrap.dataset.gap || 28);
    return new Swiper(el, {
      slidesPerView: 1.5,
      spaceBetween: 15,
      centeredSlides: true,
      loop: true,
      navigation: { nextEl: wrap.querySelector(".mn-swiper__next"), prevEl: wrap.querySelector(".mn-swiper__prev") },
      breakpoints: { 768: { centeredSlides: false, slidesPerView: 3, spaceBetween: gap } },
    });
  });

  // Tabs — only the pressed tab’s panel is shown (original .top-news-tab · .top-feature-tab switch instantly with no motion)
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const btns = [...tabs.querySelectorAll("[data-tab]")];
    const panes = [...tabs.querySelectorAll("[data-pane]")];
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (!b) return;
      e.preventDefault();
      btns.forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", x === b); });
      panes.forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.tab; });
    });
  });
})();
