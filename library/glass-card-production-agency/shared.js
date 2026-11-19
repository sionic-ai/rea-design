// Shared by all five pages — includes the header · expand panel · contact window · footer, and attaches Lenis (original 1.3.26 · lerp .2) and the entrance that plays when elements enter the viewport.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const I = {
    logo: '<svg viewBox="0 0 34 15" fill="currentColor" aria-hidden="true"><path d="M3 0h4L4 15H0zM9 0h5a7.5 7.5 0 0 1 0 15H9zm4 3v9a4.5 4.5 0 0 0 0-9zM20 0h5a7.5 7.5 0 0 1 0 15h-5zm4 3v9a4.5 4.5 0 0 0 0-9z"/></svg>',
    globe: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M2 10h16M10 2c2.5 2.6 2.5 13.4 0 16M10 2c-2.5 2.6-2.5 13.4 0 16"/></svg>',
    search: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="6" cy="6" r="4.3"/><path d="m9.3 9.3 3.4 3.4"/></svg>',
    bell: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 11V7a4 4 0 0 1 8 0v4l1.3 1.5H2.7zM6.5 14.5h3"/></svg>',
    mail: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="1.5" y="3.5" width="13" height="9" rx="1"/><path d="m2 4 6 5 6-5"/></svg>',
    out: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5"/></svg>',
    down: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 2v8M2.5 6.5 6 10l3.5-3.5"/></svg>',
    right: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg>',
    x: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m2 2 8 8M10 2l-8 8"/></svg>',
    menu: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 5h12M2 11h12"/></svg>',
  };
  window.D_ICON = I;
  const links = [["works.html", "Work", "works"], ["service.html", "Service", "service"], ["service.html#care", "Function", ""], ["detail.html", "Tool", "detail"], ["works.html#skills", "Capability", ""], ["contact.html", "Inquiry", "contact"]];

  // ───────── Head ─────────
  const head = document.querySelector("[data-slot='header']");
  head.classList.add("d-head");
  head.innerHTML = `<div class="d-head__row">
    <div class="d-brand d-glass">
      <button class="d-util d-burger d-glass" type="button" aria-label="Open Menu" aria-expanded="false" data-menu>${I.menu}</button>
      <a href="index.html" aria-label="First Page">${I.logo}<span class="d-brand__name">Brand Title</span></a>
      <button class="d-region" type="button" aria-expanded="false" data-pop="market">${I.globe}<span>US</span></button>
    </div>
    <div class="d-nav" id="d-nav">
      <nav class="d-nav__links" aria-label="Header Menu">${links.map(([h, t, p], k) => `<a href="${h}" style="--k:${k}"${p && p === page ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
      <button class="d-search" type="button" aria-expanded="false" data-pop="search">${I.search}<span>Search</span><em>Search work, features, services…</em><kbd>/</kbd></button>
    </div>
    <div class="d-utils">
      <button class="d-util d-glass" type="button" aria-label="Notice" aria-expanded="false" data-pop="news">${I.bell}<span class="d-util__dot"></span></button>
      <button class="d-util d-glass" type="button" aria-label="Send email" aria-expanded="false" data-pop="mail">${I.mail}</button>
    </div>
  </div>`;
  const pops = {
    search: `<div class="d-pop is-search d-glass" data-popbox="search" role="dialog" aria-label="Search"><button class="d-pop__close" type="button" aria-label="Close">${I.x}</button><input type="search" placeholder="Search work, features, services…" aria-label="Search term"><p>Type your text here and the result appears.</p></div>`,
    news: `<div class="d-pop is-right d-glass" data-popbox="news" role="dialog" aria-label="Notice"><a class="d-promo" href="service.html">News: Your notice line here</a><div class="d-latest"><a href="detail.html"><div class="wf-img" data-label="Shop screen frame · Landscape 4:3"></div>Work name 1</a><a href="detail.html"><div class="wf-img" data-label="Shop screen frame · Landscape 4:3"></div>Work name 2</a></div><div class="d-clocks"><div class="d-clock"><i></i><span>City 1<br>00:00</span></div><div class="d-clock"><i></i><span>City 2<br>00:00</span></div></div></div>`,
    mail: `<div class="d-pop is-right d-glass" data-popbox="mail" role="dialog" aria-label="Mail"><button class="d-pop__close" type="button" aria-label="Close">${I.x}</button><h2>Your mail window title here</h2><p>One line promising a reply within hours here.</p><form class="d-form" onsubmit="return false" style="margin-top:14px"><label><span>Email*</span><input type="email" required></label><button type="submit">Get a reply</button></form></div>`,
    market: `<div class="d-pop is-left d-glass" data-popbox="market" role="dialog" aria-label="Choose a market"><button class="d-pop__close" type="button" aria-label="Close">${I.x}</button><h2>Your market selector title here</h2><p>Your one line saying the market decides currency and office goes here.</p><div class="d-markets"><a href="#">Region 1 · currency · city</a><a href="#">Region 2 · currency · city</a></div></div>`,
  };
  head.insertAdjacentHTML("afterend", Object.values(pops).join(""));
  let openKey = null;
  const setPop = (key) => {
    openKey = key === openKey ? null : key;
    document.querySelectorAll("[data-popbox]").forEach((p) => p.classList.toggle("is-open", p.dataset.popbox === openKey));
    head.querySelectorAll("[data-pop]").forEach((b) => b.setAttribute("aria-expanded", b.dataset.pop === openKey));
    if (openKey === "search") setTimeout(() => document.querySelector("[data-popbox=search] input").focus(), 50);
  };
  head.querySelectorAll("[data-pop]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); setPop(b.dataset.pop); }));
  document.querySelectorAll("[data-popbox]").forEach((p) => { p.addEventListener("click", (e) => e.stopPropagation()); p.querySelector(".d-pop__close")?.addEventListener("click", () => setPop(openKey)); });
  document.addEventListener("click", () => openKey && setPop(openKey));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openKey) setPop(openKey);
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); if (openKey !== "search") setPop("search"); }
  });
  const burger = head.querySelector("[data-menu]");
  burger.addEventListener("click", () => { const on = !head.classList.contains("is-menu"); head.classList.toggle("is-menu", on); burger.setAttribute("aria-expanded", on); });

  // ───────── Say hello ─────────
  document.body.insertAdjacentHTML("beforeend", `
    <button class="d-talk" type="button" aria-haspopup="dialog" aria-expanded="false" data-slot="talk-launcher"><span class="d-talk__wave" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map((k) => `<i style="--k:${k}"></i>`).join("")}</span><span class="d-talk__txt">Say hello<small>Conversation · voice · quote</small></span>${I.right}</button>
    <section class="d-chat" role="dialog" aria-label="Chat window" data-slot="talk-dialog"><header><span>Your consultation window name</span><button class="d-pop__close" type="button" aria-label="Close" style="position:static">${I.x}</button></header>
      <div class="d-chat__body"><p class="d-chat__msg">Your one-line first greeting goes here. Ask what they want to make.</p></div>
      <div class="d-chat__opts"><button type="button">Receive a quote</button><button type="button">Speak by voice</button><button type="button">Reserve a Store Visit</button></div></section>`);
  const talk = document.querySelector(".d-talk"), chat = document.querySelector(".d-chat");
  const setChat = (on) => { chat.classList.toggle("is-open", on); talk.hidden = on; talk.setAttribute("aria-expanded", on); if (!on) talk.focus(); };
  talk.addEventListener("click", () => setChat(true));
  chat.querySelector(".d-pop__close").addEventListener("click", () => setChat(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setChat(false); });

  // ───────── Footer ─────────
  const foot = document.querySelector("[data-slot='footer']");
  if (foot) {
    foot.classList.add("d-foot");
    foot.innerHTML = `
      <div class="d-foot__cta"><div><h2>Your large statement here, three lines, on what you make and run together.</h2><a class="d-foot__btn" href="contact.html">Talk about your project ${I.out}</a></div></div>
      <div class="d-foot__main">
        <div class="d-foot__links"><p>Company</p>${["Inquiry", "Work", "Service", "Tool", "Capability", "Add", "Method", "Studio"].map((t) => `<a href="${t === "Work" ? "works.html" : t === "Service" ? "service.html" : t === "Inquiry" ? "contact.html" : "#"}">${t}</a>`).join("")}</div>
        <form class="d-form" onsubmit="return false"><p class="is-sub">A one-line prompt asking whether to talk about the project goes here</p><label><span>Email*</span><input type="email" required></label><p class="is-sub">Your two lines here on how many hours a reply takes, and that it’s not a newsletter.<br><a href="#" style="color:inherit">Privacy policy</a></p><button type="submit">Get a reply</button></form>
      </div>
      <div class="d-eco"><p>Your bundle name here</p><div class="d-eco__cards">
        <a class="d-eco__card" href="index.html"><div class="d-ph is-dark" data-label="Logo card · dark gray"></div><span><b>Brand Title</b><small>Your intro, about two lines, here.</small></span></a>
        <a class="d-eco__card" href="#"><div class="d-ph is-dark" data-label="Logo card · dark gray"></div><span><b>Studio name</b><small>Your one-line intro here.</small></span></a>
      </div></div>
      <div class="d-sub"><span>${I.globe.replace('aria-hidden="true"', 'aria-hidden="true" width="14" height="14"')} Region · Currency</span><a href="mailto:hello@example.com">hello@example.com</a><span class="d-sub__legal"><a href="#">Privacy policy</a><a href="#">Terms</a><span>© 0000 Company Name</span></span></div>`;
  }

  // ───────── Lenis — original 1.3.26, lerp .2 ─────────
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.2 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll(".d-pop, .d-chat").forEach((el) => el.setAttribute("data-lenis-prevent", ""));
  }

  // ───────── Reveal — once when it enters the screen ─────────
  // If is-in is attached before the first paint it snaps in without a transition — attach it two frames later
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const t = e.target; io.unobserve(t); requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("is-in"))); } }), { rootMargin: "0px 0px -8% 0px" });
  const watch = () => document.querySelectorAll("[data-anim]:not(.is-in)").forEach((el) => (reduce ? el.classList.add("is-in") : io.observe(el)));
  watch();

  window.DS = { lenis, reduce, icon: I, watch };
})();
