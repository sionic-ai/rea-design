// All pages — smooth scroll (lenis 1.0.32, lerp .14), search panel, phone menu, sub-page opening, collection name scroll choreography
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1, infinite: false, gestureOrientation: "vertical", normalizeWheel: false, smoothTouch: false });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    window.siteLenis = lenis;
  }
  // Lock scroll on the home page during the loader and reopen it at the top when done (the original also calls stop every 150ms and start at the end)
  addEventListener("fx:intro-start", () => lenis?.stop());
  addEventListener("fx:intro-done", () => { lenis?.scrollTo(0, { immediate: true }); lenis?.start(); window.ScrollTrigger?.refresh(); });

  // Header bar and footer are one set — filled in here so the same menu sits in the same spot on every page
  const mark = (extra = "") => `<svg class="li-mark" viewBox="0 0 1329 123" aria-hidden="true"${extra}><text x="0" y="112" font-size="150" textLength="1329" lengthAdjust="spacingAndGlyphs">PUBLISHING HOUSE</text></svg>`;
  const arrow = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="m11 11 3.5 3.5"/></svg>';
  const page = document.body.dataset.page;
  const links = [["product", "product.html", "Our Books"], ["authors", "authors.html", "Our Authors"], ["collection", "collection.html", "The House"]];
  const menu = links.map(([k, href, t]) => `<a class="li-nav__link" href="${href}"${k === page ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  const bigMark = document.body.classList.contains("has-big-mark");
  const navHost = document.querySelector('.li-nav[data-slot="nav"]');
  if (navHost) {
    navHost.setAttribute("data-fx", "hide-on-scroll");
    navHost.setAttribute("data-fx-hide-on-scroll", `look: slide; delay: 0; step: 8; end: hide; ${bigMark ? "after: .li-hero" : "offset: 150"}`);
    navHost.style.cssText = "--fx-dur: .4s; --fx-ease: cubic-bezier(.33,0,.2,1)";
    const logoFx = bigMark ? ' data-fx="appear-past-scroll" data-fx-appear-past-scroll="look: drop; after: .li-bigmark" style="--fx-y: -115%; --fx-dur: .6s; --fx-ease: cubic-bezier(.22,.61,.36,1)"' : "";
    navHost.innerHTML = `
  <div class="li-nav__bar">
    <nav class="li-nav__left" aria-label="Main menu">${menu}</nav>
    <a class="li-nav__logo" href="index.html"${page === "home" ? ' aria-current="page"' : ""} aria-label="First Page"><span class="li-nav__slot" data-label="Brand English name wordmark">${mark(logoFx)}</span></a>
    <div class="li-nav__right"><button class="li-nav__link" type="button" data-search-open>${arrow}Search</button><a class="li-nav__link" href="#contact">Contact</a></div>
    <div class="li-nav__mobile">
      <button class="li-nav__search-m" type="button" data-search-open aria-label="Search">${arrow}</button>
      <button class="li-nav__burger" type="button" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
    </div>
    <div class="li-nav__drawer"><nav class="li-nav__panel" aria-label="Phone menu">${menu}<a class="li-nav__link" href="#contact">Contact</a></nav></div>
  </div>
  <div class="li-search" data-slot="search-panel">
    <form class="li-search__form" role="search">
      <label class="li-search__field">${arrow}<input type="search" placeholder="Search by book or author name" aria-label="Find"></label>
      <button class="li-search__close" type="button" data-search-close aria-label="Close"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m3 3 10 10M13 3 3 13"/></svg></button>
    </form>
    <div class="li-search__veil" data-search-close></div>
  </div>`;
  }
  const footHost = document.querySelector('.li-footer[data-slot="footer-wordmark"]');
  if (footHost) {
    const fl = (href, t) => `<a class="li-footer__link" href="${href}">${t}</a>`;
    footHost.innerHTML = `<div class="li-pad"><div class="li-wrap li-footer__in">
    <div class="li-footer__top">
      <div class="li-footer__col">${fl("product.html", "Our Books")}${fl("authors.html", "Our Authors")}</div>
      <div class="li-footer__col">${fl("collection.html", "The House")}${fl("#", "Instagram")}</div>
      <div class="li-footer__col">${fl("#contact", "Contact")}${fl("#", "Partner Name")}</div>
      <div class="li-footer__col">${fl("#", "Legal Notice")}</div>
    </div>
    <div class="li-footer__mark">${mark()}</div>
    <div class="li-footer__bottom"><div class="li-footer__social"><span>Follow us on</span><a href="#">instagram</a></div><p>© 2026 Publisher Name. All rights reserved.</p></div>
  </div></div>`;
  }

  const nav = document.querySelector(".li-nav");
  if (nav) {
    const search = nav.querySelector(".li-search");
    const setSearch = (open) => {
      search?.classList.toggle("is-open", open);
      nav.classList.toggle("is-searching", open);
      if (open) setTimeout(() => search?.querySelector("input")?.focus({ preventScroll: true }), 50);
    };
    nav.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); setSearch(true); }));
    nav.querySelectorAll("[data-search-close]").forEach((b) => b.addEventListener("click", () => setSearch(false)));
    search?.querySelector("form")?.addEventListener("submit", (e) => e.preventDefault());

    const burger = nav.querySelector(".li-nav__burger");
    const drawer = nav.querySelector(".li-nav__drawer");
    burger?.addEventListener("click", () => {
      const open = !nav.classList.contains("is-menu-open");
      if (drawer) nav.style.setProperty("--site-drawer-h", drawer.scrollHeight + "px");
      nav.classList.toggle("is-menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      setSearch(false);
      nav.classList.remove("is-menu-open");
      burger?.setAttribute("aria-expanded", "false");
    });
  }

  // Band around the collection panel — wordmark words joined without spaces fill the four sides (the original is lettering baked into the image border)
  document.querySelectorAll(".li-col__frame span").forEach((s) => { s.textContent = "PUBLISHINGHOUSE".repeat(14); });

  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // Sub-page opening (Webflow page start) — the title rises from 30px below with .8s easeOut, the list appears faintly after a delay
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-open]").forEach((el) => {
      const [dur, delay, y] = el.dataset.open.split(" ").map(Number);
      gsap.fromTo(el, { opacity: 0, y: y || 0 }, { opacity: 1, y: 0, duration: dur, delay: delay || 0, ease: "power1.out", clearProps: "transform" });
    });

    // Collection name — the panel rises from half its height below to center and turns on over half a screen, starting half a screen before the bottom (original measured .85→1.35 screens)
    document.querySelectorAll(".li-col").forEach((col) => {
      const name = col.querySelector(".li-col__name");
      if (!name) return;
      gsap.fromTo(name, { yPercent: 0, opacity: 0 }, { yPercent: -50, opacity: 1, ease: "power1.inOut", scrollTrigger: { trigger: col, start: "top 147%", end: "top 97%", scrub: 0.5 } });
    });

    // Sub page footer — while on screen, the link row (25%), wordmark (30%) and bottom row (35%) rise in turn from 30px below (original IX2, not on the home page)
    const foot = document.body.classList.contains("has-big-mark") ? null : document.querySelector(".li-footer");
    if (foot) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: 0.5 } });
      [[".li-footer__top", 0.25], [".li-footer__mark", 0.3], [".li-footer__bottom", 0.35]].forEach(([s, at]) => {
        const n = foot.querySelector(s);
        if (n) tl.fromTo(n, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power1.out", duration: at }, 0);
      });
      tl.to({}, { duration: 1 }, 0);
    }
  });
})();
