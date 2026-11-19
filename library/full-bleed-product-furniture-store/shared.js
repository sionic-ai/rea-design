// Alert bar, header row, drawer menu, search panel, footer, page transition cover, entrance motion, product card hover and FAQ accordion shared by the five pages.
// Original theme values: length .66s · curve CustomEase(0.33,0,0,1) · gap .14s · a section appears once when 56px is visible (never more than half its height).
(() => {
  const ICON = {
    menu: '<svg viewBox="0 0 28 28"><path d="M3 7h22M3 14h22M3 21h22"/></svg>',
    search: '<svg viewBox="0 0 28 28"><circle cx="12" cy="12" r="8.5"/><path d="m18.5 18.5 7 7"/></svg>',
    user: '<svg viewBox="0 0 28 28"><circle cx="14" cy="9" r="5.5"/><path d="M4 26c.6-5.5 4.6-9 10-9s9.4 3.5 10 9z"/></svg>',
    cart: '<svg viewBox="0 0 28 28"><path d="M5 9h18l-1.5 17h-15z"/><path d="M9.5 9a4.5 4.5 0 0 1 9 0"/></svg>',
    close: '<svg viewBox="0 0 28 28"><path d="m6 6 16 16M22 6 6 22"/></svg>',
    cat: '<svg viewBox="0 0 20 18" class="kc-logo__mark"><path d="M2 1 6 6h8l4-5v11a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z"/></svg>',
    insta: '<svg viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="4.5"/><circle cx="10" cy="10" r="3.6"/></svg>',
    play: '<svg viewBox="0 0 20 20"><rect x="1.5" y="4" width="17" height="12" rx="3"/><path d="m8 7.5 5 2.5-5 2.5z" class="kc-fill"/></svg>',
  };
  const LINKS = [["Product list", "product.html"], ["Reading list", "news.html"], ["Usage guide", "page.html"], ["Digital Catalog", "page.html"], ["Contact Us", "page.html"]];
  const FOOT = ["Product list", "Digital Catalog", "Reading list", "Usage guide", "Company About", "Privacy policy", "Terms of service", "Seller Information Display"];

  const head = `
  <div id="kc-veil" class="kc-veil is-on" aria-hidden="true"></div>
  <div class="kc-announce" data-slot="announcement-bar"><a href="news.html">Your one-line news announcement goes here · Learn more</a></div>
  <header class="kc-header" data-slot="header">
    <div class="kc-header__inner">
      <div class="kc-header__left"><button class="kc-icon kc-menu-btn" type="button" aria-label="Open Menu">${ICON.menu}</button></div>
      <a class="kc-logo" href="index.html" data-label="Brand logo (cat mark + English capitals)">${ICON.cat}<span>SHOP NAME</span></a>
      <div class="kc-header__right">
        <button class="kc-icon kc-search-btn" type="button" aria-label="Open search">${ICON.search}</button>
        <a class="kc-icon" href="#" aria-label="Log in">${ICON.user}</a>
        <a class="kc-icon kc-cart" href="#" aria-label="Cart">${ICON.cart}<span class="kc-cart__count">0</span></a>
      </div>
    </div>
  </header>
  <div class="kc-drawer" data-slot="drawer-menu" aria-hidden="true">
    <button class="kc-drawer__overlay" type="button" aria-label="Close Menu"></button>
    <nav class="kc-drawer__panel" aria-label="Menu">
      <div class="kc-drawer__close"><button class="kc-icon" type="button" aria-label="Close Menu">${ICON.close}</button></div>
      <ul class="kc-drawer__links">${LINKS.map(([t, h], i) => `<li style="--i: ${i}"><a href="${h}">${t}</a></li>`).join("")}</ul>
      <ul class="kc-drawer__sub"><li style="--i: 5"><a href="#">Search</a></li><li style="--i: 6"><a href="#">Log in / Sign up</a></li><li style="--i: 7" class="kc-drawer__cur">Call <span>KRW ₩</span></li></ul>
    </nav>
  </div>
  <div class="kc-search" data-slot="quick-search" aria-hidden="true">
    <button class="kc-search__overlay" type="button" aria-label="Close search"></button>
    <div class="kc-search__panel">
      <div class="kc-drawer__close"><button class="kc-icon kc-search__close" type="button" aria-label="Close search">${ICON.close}</button></div>
      <p class="kc-search__title">Search</p>
      <label class="kc-search__bar"><input type="search" placeholder="Search"><span class="kc-icon">${ICON.search}</span></label>
    </div>
  </div>`;

  const foot = `
  <footer class="kc-footer" data-slot="footer">
    <div class="kc-footer__inner">
      <div class="kc-footer__groups">
        <div class="kc-footer__about"><p class="kc-footer__heading" data-label="Section English name">ABOUT US</p><p>Add about four lines introducing the shop here. Briefly note the makers’ craftsmanship and the care that puts cats first, and close with one sentence of what you hope for.</p></div>
        <ul class="kc-footer__links">${FOOT.map((t) => `<li><a href="page.html">${t}</a></li>`).join("")}</ul>
      </div>
      <div class="kc-footer__news">
        <p class="kc-footer__heading">Get news by email</p>
        <p>Sign up with your email to receive news. Once registered, <a href="page.html">Terms of service</a>, <a href="page.html">Privacy policy</a>You are deemed to have agreed to this.</p>
        <label class="kc-footer__field"><input type="email" placeholder="Email address"></label>
      </div>
      <div class="kc-footer__bottom">
        <div class="kc-footer__social"><a href="#" aria-label="Social Media">${ICON.insta}</a><a href="#" aria-label="Video channel">${ICON.play}</a></div>
        <ul class="kc-footer__pay" aria-label="Payment method">${["Card 1", "Pay 1", "Pay 2", "Card 2", "Card 3", "Pay 3", "Card 4"].map((p) => `<li>${p}</li>`).join("")}</ul>
        <p class="kc-footer__copy">© 0000, SHOP NAME.</p>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML("afterbegin", head);
  // The detail page (page-builder landing) has its own separate footer
  if (document.body.dataset.footer !== "none") (document.querySelector("main") || document.body).insertAdjacentHTML("afterend", foot);

  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const D = 0.66, STAG = 0.14;
  gsap.registerPlugin(CustomEase, SplitText);
  const EASE = CustomEase.create("kc", "0.33,0,0,1");

  // Page transition — the new page’s background-color curtain lifts in .3s, and clicking an inner link covers with the curtain in .3s before navigating.
  // The original calls the next page at 200ms, but while waiting on the network the curtain ends up fully covering — a local file opens immediately and would pass with the curtain only partly covered, so the full .3s is filled.
  const veil = document.getElementById("kc-veil");
  setTimeout(() => veil.classList.remove("is-on"), reduce ? 0 : 200);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.ctrlKey || e.metaKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/.test(href)) return;
    e.preventDefault();
    veil.classList.add("is-on");
    setTimeout(() => { location.href = a.href; }, reduce ? 0 : 300);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) veil.classList.remove("is-on"); });

  // Header bar — on the first page it sits transparent over the photo, then background and shadow fill in after the notice band
  const header = document.querySelector(".kc-header");
  const announce = document.querySelector(".kc-announce");
  const sticky = () => header.classList.toggle("is-sticky", scrollY > announce.offsetHeight);
  addEventListener("scroll", sticky, { passive: true });
  sticky();

  // Drawer and search panel — the panel slides in over .66s and the backdrop scrim deepens to .9
  const panel = (root, openBtn, closeSel) => {
    const open = () => {
      root.classList.add("is-active");
      root.setAttribute("aria-hidden", "false");
      html.classList.add("kc-lock");
      // In the original the menu lines start turning on first (about 50ms) and the panel slides in after (about 85ms)
      requestAnimationFrame(() => root.classList.add("is-items"));
      setTimeout(() => root.classList.add("is-visible"), reduce ? 0 : 80);
    };
    const close = () => {
      root.classList.remove("is-visible", "is-items");
      root.setAttribute("aria-hidden", "true");
      html.classList.remove("kc-lock");
      setTimeout(() => root.classList.remove("is-active"), reduce ? 0 : D * 1000);
    };
    openBtn.addEventListener("click", open);
    root.querySelectorAll(closeSel).forEach((b) => b.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-visible")) close(); });
  };
  panel(document.querySelector(".kc-drawer"), document.querySelector(".kc-menu-btn"), ".kc-drawer__overlay, .kc-drawer__close button");
  panel(document.querySelector(".kc-search"), document.querySelector(".kc-search-btn"), ".kc-search__overlay, .kc-search__close");

  // Reveal — original FadeUpSplitReveal (each line from 20px below and transparent, .14 apart) · FadeUpReveal (20px) · FadeScaleReveal (1.2~1.25→1) · ImageReveal (the cover lifts from below while 1.75→1)
  const play = {
    split(el, t) {
      const s = new SplitText(el, { type: "lines", linesClass: "kc-line" });
      gsap.set(s.lines, { y: 20, opacity: 0 });
      gsap.set(el, { opacity: 1 });
      gsap.to(s.lines, { y: 0, opacity: 1, duration: D, delay: t, stagger: STAG, ease: EASE, onComplete: () => s.revert() });
      return s.lines.length * STAG;
    },
    up(el, t) { gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: D, delay: t, ease: EASE, clearProps: "opacity,transform" }); return STAG; },
    scale(el, t) { gsap.fromTo(el, { scale: +(el.dataset.scaleStart || 1.2), opacity: 0 }, { scale: 1, opacity: 1, duration: D, delay: t, ease: EASE }); return 0; },
    image(el, t) {
      const inner = el.firstElementChild;
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: D, delay: t, ease: EASE });
      if (inner) gsap.fromTo(inner, { yPercent: -100, scale: 1.75 }, { yPercent: 0, scale: 1, duration: D, delay: t, ease: EASE });
      return 0;
    },
    gp(el, t) { gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.7, delay: t, ease: "power1.out" }); return 0; },
  };
  const sections = [...document.querySelectorAll("[data-reveal]")];
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    sections.forEach((sec) => {
      const items = [...sec.querySelectorAll("[data-anim]")];
      if (sec.matches("[data-anim]")) items.unshift(sec);
      items.forEach((el) => gsap.set(el, { opacity: 0 }));
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        let t = 0;
        items.forEach((el) => { t += play[el.dataset.anim](el, t) || 0; });
      }, { threshold: Math.min(56 / Math.max(1, sec.offsetHeight), 0.5) });
      io.observe(sec);
    });
  });

  // Product card — on hover the second photo fades in overlapping at 1.2→1 scale (.66s) and the first photo turns off afterward. On leave, the first photo returns instantly
  mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    const off = [];
    document.querySelectorAll(".kc-card").forEach((card) => {
      const a = card.querySelector(".kc-card__img--main"), b = card.querySelector(".kc-card__img--alt");
      if (!a || !b) return;
      const on = () => {
        gsap.killTweensOf([a, b]);
        gsap.set(b, { zIndex: 2 }); gsap.set(a, { zIndex: 1 });
        gsap.fromTo(b, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: D, ease: EASE });
        gsap.to(a, { opacity: 0, delay: D, duration: 0 });
      };
      const leave = () => {
        gsap.killTweensOf([a, b]);
        gsap.set(a, { zIndex: 2, opacity: 1 }); gsap.set(b, { zIndex: 1, opacity: 0 });
      };
      card.addEventListener("mouseenter", on);
      card.addEventListener("mouseleave", leave);
      off.push(() => { card.removeEventListener("mouseenter", on); card.removeEventListener("mouseleave", leave); });
    });
    return () => off.forEach((f) => f());
  });

  // Question accordion — answer cell unfolds over .66s while the inner board scales .8→1, and the arrow flips
  document.querySelectorAll(".kc-faq__label").forEach((btn) => {
    const group = btn.parentElement, ans = btn.nextElementSibling, inner = ans.firstElementChild;
    btn.addEventListener("click", () => {
      const open = group.dataset.open !== "true";
      group.dataset.open = String(open);
      btn.setAttribute("aria-expanded", String(open));
      if (reduce) { ans.style.display = open ? "block" : "none"; return; }
      if (open) {
        ans.style.display = "block";
        gsap.fromTo(ans, { height: 0 }, { height: "auto", duration: D, ease: EASE });
        gsap.fromTo(inner, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: D, ease: EASE });
      } else {
        gsap.to(inner, { scale: 0.8, opacity: 0, duration: D, ease: EASE });
        gsap.to(ans, { height: 0, duration: D, ease: EASE, onComplete: () => { ans.style.display = "none"; } });
      }
    });
  });
})();
