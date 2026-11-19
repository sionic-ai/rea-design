// Build the header·mega menu·PC full menu·phone drawer·footer as one set so every page uses the same one.
(() => {
  // Set of symbols, as in the original <use> With this — only the svg color changes, and shape fills follow along inside the symbol
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="ih-tri" viewBox="0 0 7 8"><path fill="currentColor" d="M0 0l7 4-7 4z"/></symbol>
    <symbol id="ih-arrow" viewBox="0 0 14 8"><path fill="currentColor" d="M10 0l4 4-4 4V5H0V3h10z"/></symbol>
    <symbol id="ih-down" viewBox="0 0 11 6"><path d="M0 0h11L5.5 6z"/></symbol>
    <symbol id="ih-prev" viewBox="0 0 14 14"><path fill="currentColor" d="M10 1L4 7l6 6-1.2 1.2L1.6 7 8.8-.2z"/></symbol>
    <symbol id="ih-next" viewBox="0 0 14 14"><path fill="currentColor" d="M4 1l6 6-6 6 1.2 1.2L12.4 7 5.2-.2z"/></symbol>
  </svg>`);
  const use = (id) => `<svg class="ih-i" aria-hidden="true"><use href="#${id}"/></svg>`;
  const ICON = { down: use("ih-down"), tri: use("ih-tri"), arrow: use("ih-arrow") };
  const MARK = '<svg class="ih-logo__mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2l12 7-12 7L4 9z" style="fill:var(--kf-accent)"/><path d="M4 9l12 7v14L4 23z" style="fill:var(--kf-ink)"/><path d="M28 9v14l-12 7V16z" style="fill:var(--kf-dim)"/></svg>';
  const LOGO = `<a class="ih-logo" href="index.html" aria-label="Company logo slot">${MARK}<span class="ih-logo__words"><span class="ih-logo__group">Group name · Group companies</span><span class="ih-logo__name">Company name Inc.</span></span></a>`;

  const list = (word, n, to) => Array.from({ length: n }, (_, i) => [`${word} ${String(i + 1).padStart(2, "0")}`, typeof to === "function" ? to(i) : to]);
  const NAV = [
    { en: "Our Business", ja: "Business introduction", href: "service.html", links: list("Business item name", 9, "service.html") },
    { en: "Our Solution", ja: "Product Lineup", href: "product.html", links: list("Product name", 6, (i) => (i === 4 ? "detail.html" : "product.html")) },
    { en: "Corporate Profile", ja: "Company Info", href: "about.html", links: list("Company info", 12, (i) => (i === 3 ? "recruit.html" : "about.html")) },
    { en: "Search", ja: "Find a home", href: null, links: list("Home search menu", 6, (i) => (i === 1 ? "detail.html" : "works.html")) },
    { en: "Contact", ja: "Inquiry", href: "#", links: list("Contact menu", 5, "#") },
  ];
  const NEWS = { en: "News", ja: "News and Notices", href: "#", links: list("News Menu", 5, "#") };
  const SUB = [["Search new-build listings", "works.html"], ["Used items for sale", "detail.html"], ["Search rental listings", "works.html"], ["Agents-only page", "about.html"], ["Store list", "about.html"], ["Model home", "works.html"]];
  // Like the original navMap, the menu to highlight per section — the agent section belongs to no group
  const CURRENT = { service: 0, product: 1, detail: 1, works: 3 };

  const head = (g, cls) => {
    const inner = `<p class="ih-mega__en">${g.en}</p><p class="ih-mega__title"><span>${g.ja}</span>${g.href ? ICON.tri : ""}</p>`;
    return `<div class="${cls}">${g.href ? `<a class="ih-mega__wrap" href="${g.href}">${inner}</a>` : `<div class="ih-mega__wrap">${inner}</div>`}</div>`;
  };
  const links = (g) => `<ul class="ih-mega__list">${g.links.map(([t, h]) => `<li class="ih-mega__item"><a class="ih-mega__link" href="${h}"><span>${t}</span>${ICON.tri}</a></li>`).join("")}</ul>`;

  function buildHeader(el) {
    el.className = "ih-head js-header";
    el.innerHTML = `${LOGO.replace('class="ih-logo"', 'class="ih-logo js-head-plain"')}
      <div class="ih-head__nav-wrap">
        <nav class="ih-head__nav" aria-label="Main menu">
          <ul class="ih-sub">${SUB.map(([t, h]) => `<li class="js-head-plain"><a href="${h}">${t}</a></li>`).join("")}</ul>
          <ul class="ih-list">${NAV.map((g) => `<li class="ih-item js-mega-item"><button class="ih-link" type="button"><span>${g.ja}</span>${ICON.down}</button>
            <div class="ih-mega">${head(g, "ih-mega__head")}<div class="ih-mega__body">${links(g)}</div></div></li>`).join("")}</ul>
        </nav>
        <button class="ih-menu-btn js-head-plain" type="button" aria-label="Open Menu"><span class="ih-menu-btn__icon"><span></span><span></span><span></span></span></button>
      </div>`;
    const menu = document.createElement("div");
    menu.className = "ih-menu";
    menu.innerHTML = `<div class="ih-menu__content">${[...NAV, NEWS].map((g) => `<div class="ih-menu__section">${head(g, "ih-menu__head")}<div class="ih-mega__body">${links(g)}</div></div>`).join("")}</div>`;
    const drawer = document.createElement("div");
    drawer.className = "ih-drawer";
    drawer.dataset.slot = "mobile-menu";
    drawer.innerHTML = `<div class="ih-drawer__content">${[...NAV, NEWS].map((g) => `<div class="ih-drawer__section">
      <a class="ih-drawer__head" href="${g.href || "#"}"><span class="ih-drawer__en">${g.en}</span><span class="ih-drawer__title"><span>${g.ja}</span>${ICON.tri}</span></a>
      <ul>${g.links.map(([t, h]) => `<li class="ih-drawer__item"><a class="ih-drawer__link" href="${h}"><span>${t}</span>${ICON.tri}</a></li>`).join("")}</ul></div>`).join("")}</div>`;
    menu.dataset.slot = "full-menu";
    el.after(menu, drawer);

    const items = [...el.querySelectorAll(".js-mega-item")];
    const page = document.body.dataset.page;
    if (CURRENT[page] != null) items[CURRENT[page]].classList.add("is-current");
    const closeMega = () => items.forEach((i) => i.classList.remove("is-open"));
    items.forEach((it) => it.addEventListener("mouseenter", () => { closeMega(); it.classList.add("is-open"); }));
    el.addEventListener("mouseleave", closeMega);
    el.querySelectorAll(".js-head-plain").forEach((x) => x.addEventListener("mouseenter", closeMega));

    const btn = el.querySelector(".ih-menu-btn");
    const sp = matchMedia("(max-width: 767px)");
    let saved = 0;
    const lock = (on) => {
      if (on) { saved = scrollY; document.body.style.top = `${-saved}px`; document.body.classList.add("is-locked"); }
      else { document.body.classList.remove("is-locked"); document.body.style.top = ""; scrollTo({ top: saved, behavior: "instant" }); }
    };
    const close = () => {
      if (!btn.classList.contains("is-open")) return;
      lock(false);
      btn.classList.remove("is-open");
      drawer.classList.remove("is-open");
      menu.classList.remove("is-open");
      document.body.classList.remove("is-drawer-open", "is-menu-open");
      btn.setAttribute("aria-label", "Open Menu");
    };
    btn.addEventListener("click", () => {
      const opening = !btn.classList.contains("is-open");
      if (!opening) return close();
      btn.classList.add("is-open");
      lock(true);
      if (sp.matches) { drawer.classList.add("is-open"); document.body.classList.add("is-drawer-open"); }
      else { menu.classList.add("is-open"); closeMega(); document.body.classList.add("is-menu-open"); }
      btn.setAttribute("aria-label", "Close Menu");
    });
    addEventListener("keydown", (e) => e.key === "Escape" && close());
    sp.addEventListener("change", close);
  }

  const FOOT = [
    ["Business introduction", "service.html", 9], ["Product Lineup", "product.html", 6], ["Company Info", "about.html", 12], ["Inquiry", "#", 7],
    ["News and Notices", "#", 2], ["Find a home", "works.html", 6], ["Living Info", "#", 5], ["Link", "#", 5],
  ];
  function buildFooter(el) {
    el.className = "ih-foot js-footer";
    const cta = ["Material Request", "Visit booking", "Contact Us"];
    const thumbs = ["Guide brochure open on a tabletop · natural light · square", "Model house exterior · clear daytime · square", "Consultation shot with a hand resting on a laptop · indoor light · square"];
    el.innerHTML = `<div class="ih-foot__inner js-footer-inner">
      <div class="ih-foot__cards" data-slot="footer-cta">${cta.map((t, i) => `<a class="c-cta" href="#"><span class="c-cta__bg"></span><span class="c-cta__inner"><span class="c-cta__thumb wf-img" data-label="${thumbs[i]}"></span><span class="c-cta__body"><span class="c-cta__title">${t}</span><span class="c-cta__arrow">${ICON.tri}</span></span></span></a>`).join("")}</div>
      <nav class="ih-foot__nav" aria-label="Sitemap">${FOOT.map(([t, h, n], c) => `<div class="ih-foot__col"><a class="ih-foot__title" href="${h}">${t}</a><ul class="ih-foot__list">${Array.from({ length: n }, (_, i) => `<li><a href="${h}"><i>${ICON.tri}</i>${t} Menu ${String(i + 1).padStart(2, "0")}</a></li>`).join("")}</ul></div>`).join("")}</nav>
      <div class="ih-foot__bottom"><div><div class="ih-foot__logo">${LOGO}</div><ul class="ih-foot__links"><li><a href="#">Privacy policy</a></li><li><a href="#">Terms of service</a></li><li><a href="#">Sitemap</a></li></ul></div>
        <div class="ih-foot__right"><a class="ih-foot__sns" href="#" aria-label="Video channel">${ICON.tri}</a><p class="ih-foot__copy">© Company Name Co.,Ltd. All Rights Reserved.</p></div></div>
    </div>`;
  }

  function footerZoom() {
    const foot = document.querySelector(".js-footer"), inner = document.querySelector(".js-footer-inner");
    if (!foot || !inner || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add({ go: "(prefers-reduced-motion: no-preference)" }, () => {
      // Original: while the screen goes 90%→25%, 1.175 → 1 and transparent → opaque (scrub .5)
      gsap.fromTo(inner, { scale: 1.175, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: foot, start: "top 90%", end: "top 25%", scrub: 0.5 } });
    });
  }

  function headings() {
    const hs = document.querySelectorAll(".c-top-h--reveal");
    if (!hs.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add("is-inview"); io.unobserve(e.target); }), { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
    hs.forEach((h) => io.observe(h));
  }
  function pageHead() {
    const go = () => setTimeout(() => document.querySelectorAll(".c-page-h__head").forEach((e) => e.classList.add("is-inview")), 100);
    document.readyState === "complete" ? go() : addEventListener("load", go);
  }
  function fadeLists() {
    const ls = document.querySelectorAll(".js-fade-list");
    if (!ls.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const step = +(e.target.dataset.step ?? 0.1);
      [...e.target.children].forEach((it, i) => { it.style.transitionDelay = `${i * step}s`; it.classList.add("is-visible"); });
      io.unobserve(e.target);
    }), { threshold: 0.2 });
    ls.forEach((l) => io.observe(l));
  }
  // Photo parallax — large photo −22.5%, small photo −10%, video −18% (top edge at screen bottom → bottom edge at screen top, scrub .5)
  function parallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.matchMedia().add({ go: "(prefers-reduced-motion: no-preference)" }, () => {
      document.querySelectorAll("[data-parallax]").forEach((box) => {
        const img = box.querySelector("[data-parallax-target]") || box.firstElementChild;
        if (!img) return;
        gsap.fromTo(img, { yPercent: 0 }, { yPercent: -+box.dataset.parallax, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 0.5 } });
      });
    });
  }

  // Like the original, seeing a sub-page first skips the first-page loader
  if (document.body.dataset.page !== "home") sessionStorage.setItem("ih-opening-shown", "1");
  const h = document.querySelector('header[data-slot="header"]');
  if (h) buildHeader(h);
  const f = document.querySelector('footer[data-slot="footer"]');
  if (f) buildFooter(f);
  headings();
  pageHead();
  fadeLists();
  parallax();
  footerZoom();
  // When height changes from late-rendering fonts or photo slots, remeasure positions
  if (window.ScrollTrigger) {
    let t;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 100); }).observe(document.body);
  }
})();
