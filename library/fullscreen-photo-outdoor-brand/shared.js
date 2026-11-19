// Shared by five pages: draws the header, search window, menu drawer, two contact blocks and footer, and animates the mega menu, accordion, card row (Splide) and repeating cards.
// Original figures: mega menu autoAlpha · y -10→0 .4s power2.out (on leaving .3s power2.in, when closed by another cell opening .2s), drawer autoAlpha .3s power2.out,
// Search curtain .3s power2.out (close .3s power2.in), hamburger X .3s ease, accordion height .4s power2.out.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = (s) => (reduced ? 0 : s);
  window.DD = { reduced };

  const ICON = {
    logo: '<svg viewBox="0 0 40 52" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 22C9 14 8 4 11 2s7 9 7 18M26 22c5-8 6-18 3-20s-7 9-7 18"/><ellipse cx="20" cy="28" rx="9" ry="7"/><circle cx="16.5" cy="27" r="1" fill="currentColor"/><circle cx="23.5" cy="27" r="1" fill="currentColor"/></g><g fill="currentColor"><rect x="3" y="40" width="9" height="11" rx="1"/><circle cx="20" cy="45.5" r="5.5"/><rect x="28" y="40" width="9" height="11" rx="1"/></g></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 6 6"/></g></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 3h4l2.5 12h12L22 6H6.2"/><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></g></svg>',
    arrow: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    chev: (r) => `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="${r ? "M3.5 1.5 7 5 3.5 8.5" : "M6.5 1.5 3 5l3.5 3.5"}" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`,
    sns: ['<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>', '<path d="M5 5l14 14M19 5 5 19"/>', '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>', '<circle cx="12" cy="12" r="9"/><path d="M13 21v-8h3M10 13h6M13 13V9q0-2 2-2h1"/>', '<circle cx="12" cy="12" r="9"/><path d="M10 17l2-8M9.5 9.5q2.5-2 5 0t-1 5"/>', '<rect x="2" y="5" width="20" height="14" rx="1"/><path d="m2 6 10 7 10-7"/>'],
  };
  // The circle arrow is two copies of the same arrow — on hover the front one exits to the upper right and the back one enters from the lower left (original .4s simultaneous)
  const circle = (cls = "") => `<span class="dd-circle ${cls}">${ICON.arrow}${ICON.arrow}</span>`;
  window.DD.circle = circle;
  window.DD.ICON = ICON;
  // Original mega menu cell count — Products has 19 cells with 72px images, the rest are text links
  const MEGA = [19, 5, 5, 3, 5, 9];
  const NAV = [
    ["Product", "product.html", "PRODUCTS"], ["Special Feature", "news.html", "SPECIALS"], ["Editorial team", "about.html", "EDITORIAL"],
    ["About the Brand", "about.html", "ABOUT"], ["News", "news.html", "NEWS"], ["Support", "service.html", "SUPPORT"],
  ];

  const header = `
  <header class="dd-header" data-slot="header-mega">
    <div class="dd-header__inner">
      <a class="dd-logo" href="index.html" aria-label="First Page">${ICON.logo}</a>
      <nav class="dd-nav" aria-label="Main menu"><ul>
        ${NAV.map(([t, href, en], i) => `<li class="dd-mega__item">
          <a class="dd-mega__link" href="${href}">${t}<i class="dd-caret" aria-hidden="true"></i></a>
          <div class="dd-mega__body"><div class="dd-mega__grid">
            <a class="dd-mega__title" href="${href}">${t} List</a>
            <ul class="dd-mega__list">${Array.from({ length: MEGA[i] }, (_, n) => `<li><a class="dd-nav-link" href="${href}">${i === 0 ? '<span class="wf-img is-cut" data-label="Line flagship product cutout · white background · square"></span>' : ""}<span class="dd-nav-link__t">Sub Menu ${n + 1}</span>${circle()}</a></li>`).join("")}</ul>
          </div></div>
        </li>`).join("")}
      </ul></nav>
      <div class="dd-actions">
        <button class="dd-icon-btn js-search-open" type="button" aria-label="Search">${ICON.search}</button>
        <a class="dd-icon-btn" href="product.html" aria-label="Online shop">${ICON.cart}</a>
        <button class="dd-icon-btn js-drawer-open" type="button" aria-label="Open Menu"><span class="dd-burger"><i></i><i></i><i></i><span class="dd-burger__text" aria-hidden="true">CLOSE</span></span></button>
      </div>
    </div>
  </header>
  <div class="dd-search" data-slot="search-modal" role="dialog" aria-label="Search">
    <div class="dd-search__body">
      <form class="dd-search__form" onsubmit="return false">${ICON.search}<input type="search" placeholder="Please enter a word"><button class="dd-search__close js-search-close" type="button" aria-label="Close">×</button></form>
      <div class="dd-search__tags">Frequently searched words<ul><li><a href="product.html">Word one</a></li><li><a href="product.html">Word Two</a></li><li><a href="product.html">Three (native Korean)</a></li></ul></div>
    </div>
  </div>
  <div class="dd-drawer" data-slot="menu-drawer" role="dialog" aria-label="Menu">
    <div class="dd-drawer__inner">
      <div class="dd-drawer__list">
        ${NAV.map(([t, href]) => `<div class="dd-acc"><button class="dd-acc__head" type="button" aria-expanded="false">${t}<i class="dd-plus" aria-hidden="true"></i></button>
          <div class="dd-acc__body" hidden><ul>${[1, 2, 3, 4, 5, 6].map((n) => `<li><a href="${href}">Sub Menu ${n}</a></li>`).join("")}</ul></div></div>`).join("")}
      </div>
      <div class="dd-drawer__side">
        <a class="dd-drawer__logo" href="index.html" aria-label="First Page">${ICON.logo}</a>
        <a class="dd-drawer__news" href="news.html">Latest notice here in two lines — system notice</a>
        <div class="dd-follow"><p>FOLLOW US</p><ul>${ICON.sns.map((p) => `<li><a href="#" aria-label="SNS"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${p}</svg></a></li>`).join("")}</ul></div>
        <div class="dd-apps"><span>App download 1</span><span>App download 2</span></div>
      </div>
      <p class="dd-drawer__policy"><a href="#">Policy Link 1</a><a href="#">Policy Link 2</a><a href="#">Your long policy link here</a><a href="#">Company info</a><a href="#">Hiring Info</a><a href="#">Inquiry</a></p>
    </div>
  </div>`;

  const footer = `
  <section class="dd-cta" data-slot="contact-pair">
    <a href="#"><p class="dd-label">CONTACT</p><h2>Contact Us</h2><p>Your two-line contact note goes here. Product, business and press inquiries are received through the contact form.</p>${circle()}</a>
    <a href="service.html"><p class="dd-label">SUPPORT</p><h2>Product Support</h2><p>Your two-line support notice here. From user manuals to repair info and warranty, all in one place.</p>${circle()}</a>
  </section>
  <footer class="dd-footer" data-slot="footer">
    <div class="dd-footer__top">
      <div class="dd-footer__links">
        <div style="grid-column: 1 / -1"><h3>Product list</h3><ul class="is-two">${Array.from({ length: 20 }, (_, n) => `<li><a href="product.html">Product category ${n + 1}</a></li>`).join("")}</ul></div>
        ${["News", "Special Feature", "Editorial team", "Support"].map((t, i) => `<div><h3>${t}</h3><ul>${Array.from({ length: i === 3 ? 10 : 6 }, (_, n) => `<li><a href="${NAV[[4, 1, 2, 5][i]][1]}">Sub Link ${n + 1}</a></li>`).join("")}</ul></div>`).join("")}
      </div>
      <div class="dd-footer__side">
        <div class="dd-follow"><p>FOLLOW US</p><ul>${ICON.sns.map((p) => `<li><a href="#" aria-label="SNS"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${p}</svg></a></li>`).join("")}</ul></div>
        <div class="dd-follow"><p>Your app name here</p><div class="dd-apps"><span>App download 1</span><span>App download 2</span></div></div>
        <div class="dd-follow"><p>Your online store name here</p><a class="dd-store" href="product.html" aria-label="Online shop">${ICON.logo}</a></div>
      </div>
    </div>
    <p class="dd-footer__policy"><a href="#">Policy Link 1</a><a href="#">Policy Link 2</a><a href="#">Your long policy link here</a><a href="#">Company info</a><a href="#">Hiring Info</a><a href="#">Inquiry</a></p>
    <a class="dd-footer__logo" href="index.html" aria-label="First Page">${ICON.logo}</a>
    <p class="dd-footer__copy">© 0000 Company Co.,Ltd.</p>
  </footer>`;

  document.querySelector("[data-dd=header]")?.replaceWith(document.createRange().createContextualFragment(header));
  document.querySelector("[data-dd=footer]")?.replaceWith(document.createRange().createContextualFragment(footer));
  document.querySelectorAll("[data-circle]").forEach((el) => el.insertAdjacentHTML("beforeend", circle(el.dataset.circle)));
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = ICON[el.dataset.icon]));
  document.querySelectorAll(".dd-circle").forEach((c) => c.children.length === 1 && c.append(c.firstElementChild.cloneNode(true)));

  // Same-type cards: extend the first slot to n cards — only the labels are reused
  // data-cats="all*12,c1*12" If given like this, each cell gets a category — the original card rows keep the same number of cards per category separately, and a tab leaves only that group
  document.querySelectorAll("[data-repeat]").forEach((box) => {
    const tpl = box.firstElementChild;
    const labels = (box.dataset.labels || "").split("|").filter(Boolean);
    const cats = (box.dataset.cats || "").split(",").filter(Boolean).flatMap((c) => { const [k, n] = c.split("*"); return Array(Number(n) || 1).fill(k); });
    const every = Number(box.dataset.newEvery || 0);
    if (cats.length) tpl.dataset.category = cats[0];
    for (let i = 1; i < Number(box.dataset.repeat); i++) {
      const c = tpl.cloneNode(true);
      if ((every ? i % every : i) >= Number(box.dataset.newUntil || 0)) c.querySelector(".dd-prod__new")?.remove();
      const img = c.querySelector(".wf-img");
      if (img && labels.length) img.dataset.label = labels[i % labels.length];
      if (cats.length) c.dataset.category = cats[i % cats.length];
      box.append(c);
    }
  });

  // ── Mega Menu ──
  const items = [...document.querySelectorAll(".dd-mega__item")];
  const closeMega = (except) =>
    items.forEach((it) => {
      if (it === except || !it.classList.contains("is-open")) return;
      it.classList.remove("is-open");
      gsap.to(it.querySelector(".dd-mega__body"), { autoAlpha: 0, y: -10, duration: d(0.2), overwrite: true });
    });
  const leaveMega = (it) => {
    it.classList.remove("is-open");
    gsap.to(it.querySelector(".dd-mega__body"), { autoAlpha: 0, y: -10, duration: d(0.3), ease: "power2.in", overwrite: true });
  };
  items.forEach((it) => {
    const body = it.querySelector(".dd-mega__body");
    gsap.set(body, { autoAlpha: 0, y: -10 });
    const open = (ease) => {
      closeMega(it);
      it.classList.add("is-open");
      gsap.to(body, { autoAlpha: 1, y: 0, duration: d(0.4), ...(ease && { ease }), overwrite: true, force3D: true });
    };
    it.addEventListener("mouseenter", () => open("power2.out"));
    it.querySelector(".dd-mega__link").addEventListener("focus", () => open());
    it.addEventListener("mouseleave", () => leaveMega(it));
  });

  // ── Search overlay: the whole curtain turns on in .3s power2.out and off in .3s power2.in ──
  // The original code also tries to lower the box (.p-search-modal__body) from y -30→0, but no element of that name is on the page, so in practice only the veil moves — ported as it looks
  const search = document.querySelector(".dd-search");
  document.querySelector(".js-search-open").addEventListener("click", () => {
    document.body.classList.add("is-locked");
    gsap.to(search, { autoAlpha: 1, duration: d(0.3), ease: "power2.out", onComplete: () => search.querySelector("input").focus({ preventScroll: true }) });
  });
  const closeSearch = () => gsap.to(search, { autoAlpha: 0, duration: d(0.3), ease: "power2.in", onComplete: () => document.body.classList.remove("is-locked") });
  search.querySelector(".js-search-close").addEventListener("click", closeSearch);
  search.addEventListener("click", (e) => e.target === search && closeSearch());

  // ── Menu drawer: opened and closed with a single hamburger in the header (changes to X · CLOSE in .3s ease) ──
  const drawer = document.querySelector(".dd-drawer");
  const burger = document.querySelector(".js-drawer-open");
  const tl = gsap.timeline({ paused: true }).to(drawer, { autoAlpha: 1, duration: d(0.3), ease: "power2.out" });
  let menuOpen = false;
  const toggleMenu = () => {
    menuOpen = !menuOpen;
    burger.classList.toggle("is-active", menuOpen);
    burger.setAttribute("aria-label", menuOpen ? "Close Menu" : "Open Menu");
    document.body.classList.toggle("is-locked", menuOpen);
    menuOpen ? tl.play() : tl.reverse();
  };
  burger.addEventListener("click", toggleMenu);
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (menuOpen) toggleMenu();
    if (gsap.getProperty(search, "opacity") > 0) closeSearch();
  });

  // ── Accordion (drawer · FAQ) ──
  document.querySelectorAll(".dd-acc, .dd-faq__item").forEach((acc) => {
    const head = acc.querySelector("button");
    const body = head.nextElementSibling;
    head.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      gsap.killTweensOf(body);
      if (open) { body.hidden = false; gsap.fromTo(body, { height: 0 }, { height: "auto", duration: d(0.4), ease: "power2.out" }); }
      else gsap.to(body, { height: 0, duration: d(0.4), ease: "power2.out", onComplete: () => (body.hidden = true) });
    });
  });

  // ── Filter tabs: only the selected one turns red ──
  document.querySelectorAll(".dd-tabs").forEach((tabs) =>
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
    }),
  );

  // ── Card row: same Splide 4.1.4 as the original (slide, no pagination dots, default speed and curve) — the progress bar works exactly like the original ──
  const SPLIDE = {
    new: { perPage: 6, gap: "24px", breakpoints: { 1024: { perPage: 3 }, 768: { perPage: 2 }, 480: { perPage: 2 } } },
    special: { perPage: 4, gap: "24px", breakpoints: { 1024: { perPage: 3 }, 768: { perPage: 2 }, 480: { perPage: 1 } } },
    video: { perPage: 5, gap: "1.5rem", breakpoints: { 1024: { perPage: 3 }, 768: { perPage: 2, gap: "1rem" }, 500: { perPage: 1, gap: "1rem", padding: { right: "4rem" } } } },
    style: { perPage: 6, gap: "24px", breakpoints: { 1024: { perPage: 4, gap: "16px" }, 767: { perPage: 2, gap: "16px" } } },
  };
  document.querySelectorAll(".dd-slider[data-slider]").forEach((root) => {
    const kind = root.dataset.slider;
    const list = root.querySelector(".dd-slider__track");
    root.classList.add("splide");
    root.querySelector(".dd-slider__view").classList.add("splide__track");
    list.classList.add("splide__list");
    [...list.children].forEach((li) => li.classList.add("splide__slide"));
    const arrows = root.querySelector(".dd-arrows");
    if (arrows) {
      arrows.classList.add("splide__arrows");
      const [p, n] = arrows.querySelectorAll("button");
      p.classList.add("splide__arrow", "splide__arrow--prev");
      n.classList.add("splide__arrow", "splide__arrow--next");
    }
    const sp = new Splide(root, { type: "slide", pagination: false, i18n: { prev: "Front cell", next: "Next cell" }, ...(reduced && { speed: 0 }), ...SPLIDE[kind] });
    const bar = root.querySelector(".dd-progress i");
    sp.on("mounted move refresh", () => {
      let r;
      if (kind === "style") { const n = sp.length, per = sp.options.perPage; r = n <= per ? 1 : Math.min(sp.index + per, n) / n; }
      else r = Math.min((sp.index + 1) / (sp.Components.Controller.getEnd() + 1), 1);
      bar.style.width = `${100 * r}%`;
    });
    sp.mount();

    // Filter tab: keeps only the chosen category’s cards in the row and re-measures (original: replaceChildren then refresh). The usage row also swaps the description text and returns to the first cell
    const tabs = [...(root.closest("section")?.querySelectorAll(".dd-tabs [data-filter]") || [])];
    if (!tabs.length) return;
    const all = [...list.children];
    const descs = [...root.closest("section").querySelectorAll("[data-desc]")];
    const pick = (b, jump) => {
      const f = b.dataset.filter;
      descs.forEach((el) => (el.hidden = el.dataset.desc !== f));
      list.replaceChildren(...all.filter((li) => li.dataset.category === f));
      if (jump) sp.go(0);
      sp.refresh();
    };
    tabs.forEach((b) => b.addEventListener("click", () => pick(b, kind === "style")));
    pick(tabs.find((b) => b.classList.contains("is-active")) || tabs[0], false);
  });
})();
