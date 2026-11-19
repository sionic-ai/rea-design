// Spanning several pages: logo box·two fixed round buttons·two right drawers·footer·bottom guide strip·white curtain transition,
// And the shared ‹hover grows the photo and pushes it away from the mouse› behavior, plus the pause button for automatic motion, used across pages.
(() => {
  const ICON = {
    bag: '<svg viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.5h13l1 14h-15z"/><path d="M6.8 7.5V6a3.2 3.2 0 0 1 6.4 0v1.5"/></svg>',
    note: '<svg viewBox="0 0 16 16"><path d="M2 3h8.2C12.8 3 14 4.3 14 6.8V14h-3V7.3c0-1-.4-1.5-1.4-1.5H5V14H2z"/></svg>',
    insta: '<svg viewBox="0 0 16 16"><path d="M8 1.4c1.8 0 2 0 2.7.1 1.8.1 2.7 1 2.8 2.8.1.7.1.9.1 2.7s0 2-.1 2.7c-.1 1.8-1 2.7-2.8 2.8-.7.1-.9.1-2.7.1s-2 0-2.7-.1c-1.8-.1-2.7-1-2.8-2.8C2.4 9 2.4 8.8 2.4 7s0-2 .1-2.7c.1-1.8 1-2.7 2.8-2.8.7-.1.9-.1 2.7-.1zM8 0C6.1 0 5.9 0 5.2.1 2.6.2 1.2 1.6 1.1 4.2 1 4.9 1 5.1 1 7s0 2.1.1 2.8c.1 2.6 1.5 4 4.1 4.1.7.1.9.1 2.8.1s2.1 0 2.8-.1c2.6-.1 4-1.5 4.1-4.1.1-.7.1-.9.1-2.8s0-2.1-.1-2.8C14.8 1.6 13.4.2 10.8.1 10.1 0 9.9 0 8 0zm0 3.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zm0 5.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6zm3.7-6.9a.8.8 0 1 0 0 1.7.8.8 0 0 0 0-1.7z"/></svg>',
    x: '<svg viewBox="0 0 16 16"><path d="M9.5 6.8 15.3 0H14L8.9 5.9 4.9 0H.3l6.1 8.9L.3 16h1.4l5.3-6.2 4.3 6.2H16zm-1.9 2.2-.6-.9L2.1 1h2.1l4 5.7.6.9 5.2 7.4h-2.1z"/></svg>',
    arrow: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><circle cx="5" cy="5" r="4.5"/><path d="M4.2 3 6.2 5l-2 2"/></svg>',
    blank: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M8 1.5h4.5V6M12.5 1.5 6.5 7.5M10.5 8.5v4h-9v-9h4"/></svg>',
    chev: '<svg viewBox="0 0 8 5" fill="none" stroke="currentColor"><path d="m.5.5 3.5 3.5 3.5-3.5"/></svg>',
    crumb: '<svg viewBox="0 0 4 6" fill="none" stroke="currentColor"><path d="m.5.5 2.5 2.5-2.5 2.5"/></svg>',
    diamond: '<svg viewBox="0 0 14 14"><path d="M7 0 14 7 7 14 0 7z"/></svg>',
    login: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="7" cy="4.5" r="2.8"/><path d="M1.5 13.5c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/></svg>',
  };
  window.kIcon = ICON;

  const page = document.body.dataset.page || "home";
  const mark = '<span class="k-mark">logo</span>';

  // ---------- Head ----------
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <a class="k-logo" href="index.html"><span class="k-logo__inner"><span class="k-logo__concept">Your one-line pledge goes here.</span>${mark}</span></a>
      <button class="k-toggle k-toggle--menu" type="button" aria-label="Open Menu" aria-expanded="false" data-drawer-open="nav"><span class="k-blob"><span class="k-blob__face k-blob__open"><span class="k-blob__hand"><span>me</span><span>nu</span></span></span><span class="k-blob__face k-blob__close"><span class="k-blob__hand">close</span></span></span></button>
      <button class="k-toggle k-toggle--cart" type="button" aria-label="Cart" data-drawer-open="cart"><span class="k-blob k-blob--cart">${ICON.bag}<span class="k-blob__count" data-cart-count>0</span></span></button>`;
  }

  const productCard = (href, label, name, isNew) => `
    <li><a class="k-nav-products__link" href="${href}">${isNew ? '<span class="k-nav-products__new k-new">new</span>' : ""}
      <span class="wf-img" data-label="${label}"></span><span class="k-nav-products__text"><span class="k-ul">${name}</span></span></a></li>`;

  const drawers = document.createElement("div");
  drawers.innerHTML = `
    <nav class="k-drawer" data-drawer="nav" data-slot="menu-drawer" aria-label="Full menu">
      <div class="k-drawer__wrap"><div class="k-drawer__main"><div class="k-drawer__inner">
        <div class="k-drawer__body">
          <div class="k-nav__head">
            <a class="k-nav__logo" href="index.html">${mark}</a>
            <div class="k-lang"><button class="k-lang__trigger" type="button" aria-expanded="false">Language ${ICON.chev}</button>
              <div class="k-lang__menu"><a class="is-current" href="#">Language 1</a><a href="#">Language 2</a><a href="#">Language 3</a><a href="#">Language 4</a><a href="#">Language 5</a></div></div>
          </div>
          <dl class="k-nav__menu">
            <div class="k-menu"><dt class="k-menu__title">Menu Group 1</dt><dd><ul class="k-menu__links k-menu__links--inside">
              <li><a href="about.html"><span class="k-ul">About the Brand</span></a></li>
              <li><a href="#"><span class="k-ul">Reads</span>${ICON.blank}<span class="k-note-bubble">New post!</span></a></li>
              <li><a href="news.html"><span class="k-ul">News</span></a></li></ul></dd></div>
            <div class="k-menu"><dt class="k-menu__title">Product</dt><dd><ul class="k-nav-products">
              ${productCard("detail.html", "Product 1 cutout · white background · square", "Product name one", true)}
              ${productCard("detail.html", "Product 2 cutout · white background · square", "Product name Two", true)}
              ${productCard("detail.html", "Product 3 cutout · white background · square", "Product name Three", false)}</ul></dd></div>
            <div class="k-menu"><dt class="k-menu__title">“Menu set 3”</dt><dd><ul class="k-menu__links k-menu__links--2">
              <li><a href="#"><span class="k-ul">Menu 3-1 Guide</span></a></li><li><a href="#"><span class="k-ul">Menu 3-2 Apply</span></a></li></ul></dd></div>
            <div class="k-menu"><dt class="k-menu__title">Help</dt><dd><ul class="k-menu__links k-menu__links--2">
              <li><a href="#"><span class="k-ul">Frequently asked questions</span></a></li><li><a href="#"><span class="k-ul">Contact Us</span></a></li></ul></dd></div>
          </dl>
          <div class="k-nav__others"><ul>${["Privacy processing", "Terms of service", "Refund policy", "Shipping policy", "Legal notice"].map((t) => `<li><a class="k-arrow-link" href="#"><span class="k-ul">${t}</span>${ICON.arrow}</a></li>`).join("")}</ul></div>
          <div class="k-nav__login"><p>Members, sign in here</p><a class="k-frame-btn" href="#">${ICON.login}<span>Log in</span></a></div>
        </div>
        <div class="k-nav__foot">${follow(true)}</div>
      </div></div></div>
    </nav>
    <div class="k-drawer" data-drawer="cart" data-slot="cart-drawer" role="dialog" aria-label="Cart">
      <div class="k-drawer__wrap"><div class="k-drawer__main"><div class="k-drawer__inner">
        <section class="k-cart">
          ${mark}
          <h2 class="k-cart__title">[ Cart ]</h2>
          <div class="k-cart__list" data-cart-list></div>
          <figure class="k-cart__empty" data-cart-empty>
            <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M38 92c-6-18 0-40 18-50 6-12 2-26-4-30 10 2 18 10 20 18 14-4 30-2 42 6 4-8 12-14 22-14-4 6-4 16 0 24 14 12 18 32 10 48-6 12-22 16-40 14H62c-12 0-20-6-24-16z" fill="currentColor"/><path d="M150 84c14-2 26 6 30 16" /><path d="M24 62l-12-6M26 74H10M28 86l-12 8"/></svg>
            <figcaption>Your cart is empty</figcaption>
          </figure>
        </section>
      </div></div></div>
      <button class="k-drawer__close" type="button" aria-label="Close cart" data-drawer-close><span class="k-blob"><span class="k-blob__hand">close</span></span></button>
    </div>`;
  document.body.append(...drawers.children);

  function follow(lg) {
    return `<dl class="k-follow${lg ? " k-follow--lg" : ""}"><dt class="k-follow__head"><span class="k-follow__dot"></span><span class="k-follow__hand">follow me!</span></dt>
      <dd><ul class="k-follow__items"><li><a href="#" aria-label="SNS 1">${ICON.note}</a></li><li><a href="#" aria-label="SNS 2">${ICON.insta}</a></li><li><a href="#" aria-label="SNS 3">${ICON.x}</a></li></ul></dd></dl>`;
  }

  // ---------- Footer ----------
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const crumb = document.body.dataset.crumb;
    const link = (href, t, ext) => `<li><a href="${href}"><span class="k-ul">${t}</span>${ext ? ICON.blank : ""}</a></li>`;
    foot.className = "k-footer";
    foot.innerHTML = `<div class="k-footer__wrap">
      ${crumb ? `<nav class="k-crumb" aria-label="Current location"><a class="k-ul" href="index.html">First</a>${ICON.crumb}<span>${crumb}</span></nav>` : ""}
      <div class="k-footer__inner">
        <div class="k-footer__main">
          <div class="k-footer__logos"><a href="index.html">${mark}</a>${follow(false)}</div>
          <nav class="k-footer__nav">
            <div class="k-footer__block"><h3 class="k-footer__heading">Menu Group 1</h3><ul class="k-footer__items k-footer__items--2">${link("about.html", "About the Brand")}${link("#", "Reads", true)}${link("news.html", "News")}</ul></div>
            <div class="k-footer__block"><h3 class="k-footer__heading">Product</h3><ul class="k-footer__items">${link("detail.html", "Product name one")}${link("detail.html", "Product name Two")}${link("detail.html", "Product name Three")}</ul></div>
            <div class="k-footer__block"><h3 class="k-footer__heading">“Menu set 3”</h3><ul class="k-footer__items">${link("#", "Menu 3-1 Guide")}${link("#", "Menu 3-2 Apply")}</ul></div>
            <div class="k-footer__block"><h3 class="k-footer__heading">Help</h3><ul class="k-footer__items k-footer__items--2">${link("#", "Frequently asked questions")}${link("#", "Contact Us")}</ul></div>
          </nav>
        </div>
        <div class="k-footer__aside">
          <ul>${["Regarding how privacy is handled", "Terms of service", "Refund policy", "Shipping policy", "Legal notice"].map((t) => `<li><a class="k-arrow-link" href="#"><span class="k-ul">${t}</span>${ICON.arrow}</a></li>`).join("")}
            <li><button class="k-arrow-link" type="button" data-consent-open><span class="k-ul">External transfer settings</span></button></li></ul>
          <small class="k-footer__copy">Copyright ©brand Co., Ltd.</small>
        </div>
      </div></div>`;
  }

  // ---------- Bottom guide strip ----------
  const consent = document.createElement("div");
  consent.className = "k-consent";
  consent.dataset.slot = "consent-bar";
  consent.innerHTML = `<div class="k-consent__inner"><p class="k-consent__text">This site sends usage information to external services to improve the service and measure ad effectiveness. For details, see <a href="#">Privacy policy</a></p><button class="k-consent__btn" type="button">Close</button></div>`;
  // The original writes to localStorage on close and removes the strip from the document (doesn’t show until reopened)
  const KEY = "k-consent";
  const setBanner = () => document.documentElement.style.setProperty("--banner-h", consent.isConnected ? consent.offsetHeight + "px" : "0px");
  if (!localStorage.getItem(KEY)) document.body.append(consent);
  consent.querySelector("button").addEventListener("click", () => {
    localStorage.setItem(KEY, "1");
    consent.remove();
    setBanner();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-consent-open]")) return;
    localStorage.removeItem(KEY);
    if (!consent.isConnected) document.body.append(consent);
    setBanner();
  });
  addEventListener("resize", setBanner);
  setBanner();

  // ---------- White curtain: lifts in .35s only on first open (the original is Next.js navigation, so there is no curtain when moving by link) ----------
  // The original attaches is-loaded as soon as React mounts (useEffect) — it does not wait for image or font load
  // If arrived via our page link, it shows straight away with no curtain like the original (Next.js navigation). A fresh open or reload lifts the curtain
  const navEntry = performance.getEntriesByType?.("navigation")[0];
  let fromInside = false;
  try { fromInside = navEntry?.type === "navigate" && !!document.referrer && new URL(document.referrer).origin === location.origin; } catch {}
  if (fromInside) document.body.classList.add("is-instant");
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));

  // ---------- Drawer: original useGlobalModal — the panel’s two left corners sweep from the right edge (100%) to 0% over .5s power2.out and
  // The bottom corner follows .05s late and opens slightly slanted. Once the top corner passes 80%, the inside shows through. On closing, reverse ----------
  const corners = new WeakMap();
  const sweep = (d, opening) => {
    const main = d.querySelector(".k-drawer__main"), inner = d.querySelector(".k-drawer__inner");
    if (!main || !inner) return;
    let c = corners.get(d);
    if (!c) corners.set(d, (c = { TL: { x: 100 }, BL: { x: 100 } }));
    const draw = () => (main.style.clipPath = `polygon(${c.TL.x}% 0%, 100% 0%, 100% 100%, ${c.BL.x}% 100%)`);
    const still = !window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.gsap) gsap.killTweensOf([c.TL, c.BL]);
    if (still) {
      c.TL.x = c.BL.x = opening ? 0 : 100;
      draw();
      return inner.classList.toggle("is-active", opening);
    }
    if (opening) {
      c.TL.x = c.BL.x = 100;
      draw();
      gsap.to(c.TL, { x: 0, duration: 0.5, ease: "power2.out", onUpdate() { draw(); if (this.progress() > 0.8) inner.classList.add("is-active"); } });
      gsap.to(c.BL, { x: 0, duration: 0.5, ease: "power2.out", delay: 0.05, onUpdate: draw });
    } else {
      inner.classList.remove("is-active");
      gsap.to(c.TL, { x: 100, duration: 0.5, ease: "power2.out", onUpdate: draw });
      gsap.to(c.BL, { x: 100, duration: 0.5, ease: "power2.out", delay: 0.05, onUpdate: draw });
    }
  };
  const open = (name) => {
    document.querySelectorAll(".k-drawer.is-active").forEach((d) => { d.classList.remove("is-active"); sweep(d, false); });
    const d = document.querySelector(`[data-drawer="${name}"]`);
    if (d) { d.classList.add("is-active"); sweep(d, true); }
    document.querySelector(`[data-drawer-open="${name}"]`)?.classList.add("is-active");
    document.documentElement.style.overflow = "hidden";
    ariaMenu();
  };
  const close = () => {
    document.querySelectorAll(".k-drawer.is-active").forEach((d) => sweep(d, false));
    document.querySelectorAll(".k-drawer.is-active, .k-toggle.is-active").forEach((d) => d.classList.remove("is-active"));
    document.documentElement.style.overflow = "";
    ariaMenu();
  };
  function ariaMenu() {
    const t = document.querySelector(".k-toggle--menu");
    if (!t) return;
    const on = t.classList.contains("is-active");
    t.setAttribute("aria-expanded", String(on));
    t.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
  }
  document.addEventListener("click", (e) => {
    // The menu button turns into a “close” graphic while open and stays above the drawer (original NavToggle) — press again to close
    const o = e.target.closest("[data-drawer-open]");
    if (o) return o.classList.contains("is-active") ? close() : open(o.dataset.drawerOpen);
    if (e.target.closest("[data-drawer-close]")) return close();
    const d = e.target.closest(".k-drawer");
    if (d && !e.target.closest(".k-drawer__main")) close();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && close());
  document.querySelectorAll(".k-lang").forEach((l) =>
    l.querySelector("button").addEventListener("click", () => {
      const on = l.classList.toggle("is-open");
      l.querySelector("button").setAttribute("aria-expanded", on);
    }),
  );

  // ---------- Cart count ----------
  let count = 0;
  window.kCart = {
    add(label, price) {
      count += 1;
      document.querySelectorAll("[data-cart-count]").forEach((n) => (n.textContent = count > 9 ? "9+" : count));
      const list = document.querySelector("[data-cart-list]");
      list.insertAdjacentHTML("beforeend", `<div class="k-cart__item"><span class="wf-img" data-label="Product cutout"></span><div><p class="k-w6">${label}</p><p>${price}</p></div></div>`);
      document.querySelector("[data-cart-empty]").hidden = true;
    },
    target: () => document.querySelector(".k-toggle--cart"),
  };

  // ---------- Pause auto motion (the original remembers it for 30 days via cookie) ----------
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const listeners = new Set();
  let enabled = !document.cookie.includes("k_motion=false");
  window.kMotion = {
    get on() { return enabled && !reduce.matches; },
    listen(fn) { listeners.add(fn); },
    toggle() {
      enabled = !enabled;
      document.cookie = `k_motion=${enabled};max-age=2592000;path=/`;
      sync();
    },
  };
  function sync() {
    const on = window.kMotion.on;
    document.querySelectorAll("[data-pause]").forEach((b) => {
      b.classList.toggle("is-paused", !on);
      b.setAttribute("aria-label", on ? "Pause auto motion" : "Turn auto motion back on");
      b.closest(b.dataset.pause)?.classList.toggle("is-paused", !on);
    });
    listeners.forEach((fn) => fn(on));
  }
  document.addEventListener("click", (e) => e.target.closest("[data-pause]") && window.kMotion.toggle());
  reduce.addEventListener("change", sync);
  addEventListener("DOMContentLoaded", sync);

  // ---------- On hover the photo grows and shifts slightly away from the mouse ----------
  // Original: on enter scale .75s, while moving (center − mouse) × amount .5s, on leave 1s — all power2.out
  addEventListener("DOMContentLoaded", () => {
    if (!window.gsap) return;
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
      const off = [];
      document.querySelectorAll("[data-hover-thumb]").forEach((el) => {
        const img = el.querySelector("[data-hover-thumb-img]");
        if (!img) return;
        let s = 1.1, mx = 0.02, my = 0.02, inside = false;
        if (el.dataset.scale) { s = parseFloat(el.dataset.scale); mx = my = 0.01818181818181818 * s; }
        if (el.dataset.moveX) mx = parseFloat(el.dataset.moveX);
        if (el.dataset.moveY) my = parseFloat(el.dataset.moveY);
        const enter = () => { inside = true; gsap.to(img, { scale: s, duration: 0.75, ease: "power2.out" }); };
        const move = (e) => {
          if (!inside) return;
          const r = el.getBoundingClientRect();
          gsap.to(img, { x: (r.width / 2 - (e.clientX - r.left)) * mx, y: (r.height / 2 - (e.clientY - r.top)) * my, duration: 0.5, ease: "power2.out" });
        };
        const leave = () => { inside = false; gsap.to(img, { scale: 1, x: 0, y: 0, duration: 1, ease: "power2.out" }); };
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        off.push(() => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); });
      });
      return () => off.forEach((f) => f());
    });
  });
})();
