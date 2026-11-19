// Draws the same header, footer and transition for all four pages in one place. The original is a barba 2.10.3 sync transition, so header and footer stay as they are and
// [data-barba="container"] only the box is swapped — page scripts are registered with AB.page (name, attach), attached when the box enters and detached when it leaves.
// Curve ”osmo” 0.625,0.05,0,1 is the gsap default (0.6s), the transition uses ”parallax” 0.7,0.05,0.13,1.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  if (window.Flip) gsap.registerPlugin(Flip);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  CustomEase.create("parallax", "0.7, 0.05, 0.13, 1");
  CustomEase.create("pop", "M0,0 C0.17,0.67 0.3,1.33 1,1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });
  const rmq = matchMedia("(prefers-reduced-motion: reduce)");
  const AB = (window.AB = { reduced: rmq.matches, lenis: null, pages: {}, firstLoad: true });
  rmq.addEventListener?.("change", (e) => (AB.reduced = e.matches));
  AB.page = (ns, init) => (AB.pages[ns] = init);
  document.documentElement.classList.add("js");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const LOGO = '<svg viewBox="0 0 54 50" fill="currentColor" aria-hidden="true"><path d="M27 0 2 37l3 3L24 12v35h3V0Zm0 0 25 37-3 3L30 12v35h-3V0Z"/><path d="M12 29 9 33c4 3 9 6 15 7v-5c-5-1-8-3-12-6Zm30 0 3 4c-4 3-9 6-15 7v-5c5-1 8-3 12-6Z"/></svg>';
  const CARET = '<svg class="ab-nav__caret" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 8h8l-4 5z"/></svg>';
  const ARROW = '<svg class="ab-plink__arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  const ICONS = [
    '<path d="M4 6h16M4 12h10M4 18h7"/>', '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', '<path d="M5 19 19 5M8 5h11v11"/>',
    '<path d="M4 18 9 12l4 3 7-9"/>', '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12h6"/>', '<path d="M12 3v18M3 12h18"/>',
  ];
  const icon = (i) => `<span class="ab-plink__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${ICONS[i % ICONS.length]}</svg></span>`;
  const plink = (href, title, desc, i) =>
    `<li><a class="ab-plink" href="${href}" data-menu-link>${icon(i)}<span><span class="ab-plink__title">${title}${ARROW}</span><span class="ab-plink__desc">${desc}</span></span></a></li>`;
  const col = (label, links, wide = "") =>
    `<div class="ab-panel__col${wide}" data-menu-fade><span class="ab-panel__label" data-menu-fade>${label}</span><ul class="ab-panel__list">${links}</ul></div>`;

  // ── Header: logo · four links (two are mega menus) · login·contact buttons · hamburger
  const head = document.querySelector("[data-slot=header]");
  if (head) {
    head.outerHTML = `
<header class="ab-nav" data-slot="header" data-menu-wrap data-menu-open="false">
  <div class="ab-nav__bar" data-nav-bar>
    <div class="ab-nav__in">
      <div class="ab-nav__start">
        <a class="ab-nav__logo" href="index.html" aria-label="To the first page" data-menu-logo>${LOGO}<span data-label="Your brand’s English name here">Company</span></a>
        <div class="ab-back" data-mobile-back><button type="button"><svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 5 7 10l5 5z"/></svg>Back</button></div>
        <div class="ab-nav__list" data-nav-list>
          <ul class="ab-nav__links">
            <li data-nav-item><a class="ab-nav__link" href="index.html">Menu 1</a></li>
            <li data-nav-item><button class="ab-nav__link is-drop" type="button" data-dropdown-toggle="solutions" aria-expanded="false">Menu 2${CARET}</button></li>
            <li data-nav-item><button class="ab-nav__link is-drop" type="button" data-dropdown-toggle="resources" aria-expanded="false">Menu 3${CARET}</button></li>
            <li data-nav-item><a class="ab-nav__link" href="about.html">Company About</a></li>
          </ul>
          <ul class="ab-nav__actions" data-nav-item>
            <li><a class="ab-btn is-ghost" href="#"><span class="ab-chars" data-chars>Log in</span></a></li>
            <li><a class="ab-btn" href="contact.html"><span class="ab-chars" data-chars>Contact Us</span></a></li>
          </ul>
        </div>
      </div>
      <div class="ab-nav__end">
        <button class="ab-burger" type="button" aria-label="Open Menu" aria-expanded="false" data-burger><i data-line="top"></i><i data-line="mid"></i><i data-line="bot"></i></button>
      </div>
    </div>
  </div>
  <div class="ab-drop" data-dropdown-wrapper>
    <div class="ab-drop__box" data-dropdown-container>
      <div class="ab-drop__bg"></div>
      <div class="ab-panel" data-nav-content="solutions"><div class="ab-panel__in">
        ${col("By use", plink("works.html", "Menu item 1", "Your one-line description here", 0) + plink("works.html", "Menu item 2", "Your one-line description here", 1) + plink("works.html", "Menu item 3", "Your one-line description here", 2) + plink("works.html", "Menu item 4", "Your one-line description here", 3) + plink("works.html", "Menu item 5", "Your one-line description here", 4))}
        ${col("By market", plink("works.html", "Menu item 6", "Your one-line description here", 5) + plink("works.html", "Menu item 7", "Your one-line description here", 0))}
        ${col("By Organization", plink("about.html", "Menu item 8", "Your one-line description here", 1) + plink("about.html", "Menu item 9", "Your one-line description here", 2) + plink("about.html", "Menu item 10", "Your one-line description here", 3))}
      </div></div>
      <div class="ab-panel" data-nav-content="resources"><div class="ab-panel__in">
        ${col("Materials", plink("works.html", "Report", "Your one-line description here", 4) + plink("works.html", "Text", "Your one-line description here", 5) + plink("works.html", "Event", "Your one-line description here", 0) + plink("contact.html", "Newsletter", "Subscribe", 1))}
        ${col("Case study", plink("works.html", "Customer case", "Your one-line description here", 2))}
        ${col("Recommended", `<li><a class="ab-latest" href="works.html" data-menu-link><span class="ab-latest__card"><span class="ab-h6 ab-faded">Featured</span><span class="ab-h5" data-label="Your featured post title in English, two lines">A featured article title that runs across two lines</span></span></a></li>`, " is-wide")}
      </div></div>
    </div>
  </div>
  <div class="ab-backdrop" data-menu-backdrop></div>
</header>`;
  }

  const groups = [
    ["By use", ["Menu item 1", "Menu item 2", "Menu item 3", "Menu item 4", "Menu item 5"]],
    ["By market", ["Menu item 6", "Menu item 7"]],
    ["By Organization", ["Menu item 8", "Menu item 9", "Menu item 10"]],
    ["Company", [["Menu 1", "index.html"], ["Company About", "about.html"]]],
    ["Materials", [["Report", "works.html"], ["Event", "works.html"], ["Text", "works.html"], ["Customer case", "works.html"], ["Newsletter", "contact.html"]]],
    ["Connection", ["Link 1", "Link 2"]],
  ];
  // The footer sits inside the page box like the original, so it rises along when turning pages — redrawn each time the box attaches
  AB.footer = (root) => {
    const foot = root.querySelector("footer[data-slot=footer]:empty");
    if (!foot) return;
    foot.outerHTML = `
<footer class="ab-foot" data-slot="footer">
  <div class="ab-wrap ab-foot__grid">
    <div class="ab-foot__brand">
      <a class="ab-foot__logo" href="index.html">${LOGO}<span data-label="Your brand’s English name here">Company</span></a>
      <div class="ab-foot__tag"><h3 class="ab-h4" data-label="Your one-sentence, two-line English intro to the company here">A one-line sentence<br>about the company</h3><a class="ab-btn is-narrow is-on-dark" href="contact.html"><span class="ab-chars" data-chars>Contact Us</span></a></div>
    </div>
    <div class="ab-foot__groups">
      ${groups.map(([t, ls]) => `<section><h3 class="ab-foot__label">${t}</h3><div class="ab-foot__links">${ls.map((l) => (Array.isArray(l) ? `<a class="ab-foot__link" href="${l[1]}">${l[0]}</a>` : `<a class="ab-foot__link" href="works.html">${l}</a>`)).join("")}</div></section>`).join("")}
    </div>
  </div>
  <div class="ab-foot__bottom"><div class="ab-wrap">
    <div class="ab-foot__addr"><span>Company Legal Name<br>Your address first line here,<br>Your address second line here</span><span>Copyright © <span data-year>0000</span> Company legal name. All rights reserved.</span></div>
    <div class="ab-foot__legal"><ul><li><a href="#">Personal information</a></li><li><a href="#">Terms of Use</a></li><li><a href="#">Emissions disclosure</a></li><li><a href="#">Where it’s made</a></li></ul>
      <div class="ab-foot__badges"><span class="wf-logo">Certification 1</span><span class="wf-logo">Certification 2</span></div></div>
  </div></div>
</footer>`;
    root.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  };

  // Only one per document, like the cursor bubble and the page-turn blocking head
  document.body.insertAdjacentHTML("beforeend", '<div class="ab-cursor" data-cursor=""><div class="ab-cursor__bubble"><i class="ab-cursor__dot"></i><span data-cursor-text>View details</span></div></div><div class="ab-trans" data-transition-wrap><div class="ab-trans__dark" data-transition-dark></div></div>');

  // ── Smooth scroll: original Lenis 1.3.17 values as is (lerp .1, wheel multiplier 1)
  if (window.Lenis) {
    const lenis = (AB.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const nav = document.querySelector("[data-menu-wrap]");
  const navBar = nav?.querySelector("[data-nav-bar]");
  const backdrop = nav?.querySelector("[data-menu-backdrop]");

  // ── Header hide (992 and up): past 80px down it goes -150% in .4s, restored when scrolling up (power2.inOut)
  if (nav) {
    gsap.matchMedia().add("(min-width: 992px)", () => {
      let lastY = 0, hidden = false;
      const onScroll = () => {
        const y = AB.lenis ? AB.lenis.scroll : scrollY;
        const d = y - lastY;
        if (nav.dataset.menuOpen === "true") { lastY = y; return; }
        if (d > 0 && y > 80 && !hidden) {
          gsap.to(nav, { yPercent: -150, duration: 0.4, ease: "power2.inOut" });
          gsap.to(backdrop, { yPercent: 150, duration: 0.4, ease: "power2.inOut" });
          hidden = true;
        } else if (d < 0 && hidden) {
          gsap.to(nav, { yPercent: 0, duration: 0.4, ease: "power2.inOut" });
          gsap.to(backdrop, { yPercent: 0, duration: 0.4, ease: "power2.inOut" });
          hidden = false;
        }
        lastY = y;
      };
      const t = AB.lenis || window;
      requestAnimationFrame(() => (AB.lenis ? AB.lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true })));
      AB.navShow = () => { hidden = false; gsap.set([nav, backdrop], { yPercent: 0 }); };
      return () => {
        AB.lenis ? AB.lenis.off("scroll", onScroll) : removeEventListener("scroll", onScroll);
        gsap.killTweensOf([nav, backdrop]);
        gsap.set([nav, backdrop], { clearProps: "transform" });
        void t;
      };
    });
  }

  // ── Mega menu (values of the original initMegaNavDirectionalHover): opens 120ms after entering, closes 150ms after leaving
  //    Open — back curtain .3 power2.out · plate height .35 power3.out · cells y8→0 .3 power3.out (stagger total .25) · moving to another plate pushes ±30px and matches height over .4
  if (nav) {
    const DUR = { bgMorph: 0.4, contentIn: 0.3, contentOut: 0.2, stagger: 0.25, backdropIn: 0.3, backdropOut: 0.2, openScale: 0.35, closeScale: 0.25 };
    const navList = nav.querySelector("[data-nav-list]");
    const dropWrap = nav.querySelector("[data-dropdown-wrapper]");
    const box = nav.querySelector("[data-dropdown-container]");
    const toggles = [...nav.querySelectorAll("[data-dropdown-toggle]")];
    const panels = [...nav.querySelectorAll("[data-nav-content]")];
    const burger = nav.querySelector("[data-burger]");
    const back = nav.querySelector("[data-mobile-back]");
    const logo = nav.querySelector("[data-menu-logo]");
    const [lt, lm, lb] = ["top", "mid", "bot"].map((k) => nav.querySelector(`[data-line="${k}"]`));
    const allLinks = [...nav.querySelectorAll(".ab-nav__link")];
    const st = { open: false, panel: null, mobile: innerWidth <= 991, mOpen: false, mPanel: null, hT: null, lT: null, tl: null, mTl: null, pTl: null };
    const P = (n) => nav.querySelector(`[data-nav-content="${n}"]`);
    const T = (n) => nav.querySelector(`[data-dropdown-toggle="${n}"]`);
    const fades = (el) => el.querySelectorAll("[data-menu-fade]");
    const items = () => navList.querySelectorAll("[data-nav-item]");
    const idx = (n) => toggles.indexOf(T(n));
    const stg = (n) => (n <= 1 ? 0 : { amount: DUR.stagger });
    const killTl = (k) => { st[k]?.kill(); st[k] = null; };
    const killDrop = () => { killTl("tl"); gsap.killTweensOf([box, backdrop]); panels.forEach((p) => { gsap.killTweensOf(p); gsap.killTweensOf(fades(p)); }); };
    const resetDesk = () => {
      panels.forEach((p) => { gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 }); gsap.set(fades(p), { autoAlpha: 0, x: 0, y: 0 }); });
      gsap.set(box, { height: 0 });
      gsap.set(backdrop, { autoAlpha: 0 });
      nav.dataset.menuOpen = "false";
      toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    };
    const setupMobile = () => {
      panels.forEach((p) => { gsap.set(p, { autoAlpha: 0, xPercent: 0, visibility: "visible", pointerEvents: "none" }); gsap.set(fades(p), { xPercent: 20, autoAlpha: 0 }); });
      gsap.set(items(), { xPercent: 0, y: 0, autoAlpha: 1 });
      gsap.set(navList, { autoAlpha: 0, x: 0 });
      gsap.set(back, { autoAlpha: 0 });
      gsap.set(logo, { autoAlpha: 1 });
      gsap.set(box, { clearProps: "height" });
      gsap.set(backdrop, { autoAlpha: 0 });
    };
    const measure = (n) => {
      const el = P(n), s = el.style, prev = [s.visibility, s.opacity, s.pointerEvents];
      Object.assign(s, { visibility: "visible", opacity: "0", pointerEvents: "none" });
      const h = el.getBoundingClientRect().height;
      [s.visibility, s.opacity, s.pointerEvents] = prev;
      return h;
    };
    const iconTo = (n) => toggles.forEach((t) => gsap.to(t.querySelector(".ab-nav__caret"), { rotation: t.dataset.dropdownToggle === n ? 180 : 0, duration: 0.3, ease: "power2.out" }));
    const iconReset = () => toggles.forEach((t) => gsap.to(t.querySelector(".ab-nav__caret"), { rotation: 0, duration: 0.25, ease: "power2.out" }));
    const dim = (on) => allLinks.forEach((l) => gsap.to(l, { opacity: l !== on ? 0.5 : 1, duration: 0.2, ease: "power2.out" }));
    const undim = () => gsap.to(allLinks, { opacity: 1, duration: 0.2, ease: "power2.out" });
    const openDrop = (n) => {
      if (st.open && st.panel === n) return;
      if (st.open) return switchPanel(st.panel, n);
      const h = measure(n);
      if (!h) return;
      killDrop(); resetDesk();
      const el = P(n), fd = fades(el);
      st.open = true; st.panel = n;
      nav.dataset.menuOpen = "true";
      T(n)?.setAttribute("aria-expanded", "true");
      iconTo(n);
      const tl = (st.tl = gsap.timeline());
      tl.to(backdrop, { autoAlpha: 1, duration: DUR.backdropIn, ease: "power2.out" }, 0)
        .to(box, { height: h, duration: DUR.openScale, ease: "power3.out" }, 0)
        .set(el, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
      if (fd.length) tl.fromTo(fd, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.contentIn, stagger: stg(fd.length), ease: "power3.out" }, 0.1);
    };
    const closeDrop = () => {
      if (!st.open) return;
      const el = P(st.panel), fd = el ? fades(el) : [];
      killDrop();
      const tl = (st.tl = gsap.timeline({ onComplete() { st.open = false; st.panel = null; st.tl = null; resetDesk(); iconReset(); undim(); } }));
      if (fd.length) tl.to(fd, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
      tl.to(box, { height: 0, duration: DUR.closeScale, ease: "power2.in" }, 0.05)
        .to(backdrop, { autoAlpha: 0, duration: DUR.backdropOut, ease: "power2.out" }, 0);
      if (el) tl.set(el, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
    };
    const switchPanel = (from, to) => {
      const dir = idx(to) > idx(from) ? 1 : -1;
      const fEl = P(from), tEl = P(to), ff = fades(fEl), tf = fades(tEl), th = measure(to);
      if (!th) return;
      killDrop();
      panels.forEach((p) => { gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 }); gsap.set(fades(p), { autoAlpha: 0, x: 0, y: 0 }); });
      gsap.set(fEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", x: 0 });
      gsap.set(ff, { autoAlpha: 1, x: 0, y: 0 });
      gsap.set(backdrop, { autoAlpha: 1 });
      st.panel = to;
      toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
      T(to)?.setAttribute("aria-expanded", "true");
      iconTo(to);
      const tl = (st.tl = gsap.timeline());
      tl.to(ff, { autoAlpha: 0, x: dir * -30, duration: DUR.contentOut, ease: "power2.in" }, 0)
        .set(fEl, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 }, DUR.contentOut)
        .set(ff, { x: 0 }, DUR.contentOut)
        .to(box, { height: th, duration: DUR.bgMorph, ease: "power3.out" }, 0.05)
        .set(tEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", xPercent: 0 }, DUR.contentOut * 0.5)
        .fromTo(tf, { autoAlpha: 0, x: dir * 30 }, { autoAlpha: 1, x: 0, duration: DUR.contentIn, stagger: stg(tf.length), ease: "power3.out" }, DUR.contentOut * 0.6);
    };
    const burgerTo = (x) => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      if (x) tl.to(lt, { y: "0.3125em", duration: 0.15 }, 0).to(lb, { y: "-0.3125em", duration: 0.15 }, 0).to(lm, { autoAlpha: 0, duration: 0.1 }, 0.1).to(lt, { rotation: 45, duration: 0.2 }, 0.15).to(lb, { rotation: -45, duration: 0.2 }, 0.15);
      else tl.to([lt, lb], { rotation: 0, duration: 0.2 }, 0).to([lt, lb], { y: 0, duration: 0.15 }, 0.15).to(lm, { autoAlpha: 1, duration: 0.1 }, 0.15);
      return tl;
    };
    const openMobile = () => {
      killTl("mTl");
      st.mOpen = true; nav.dataset.menuOpen = "true"; burger.setAttribute("aria-expanded", "true");
      AB.lenis?.stop();
      const tl = (st.mTl = gsap.timeline());
      tl.add(burgerTo(true), 0).to(navList, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
        .fromTo(items(), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }, 0.15);
    };
    const closeMobile = () => {
      const had = st.mPanel, pEl = had ? P(had) : null;
      killTl("mTl"); killTl("pTl");
      nav.dataset.menuOpen = "false"; st.mOpen = false; st.mPanel = null; burger.setAttribute("aria-expanded", "false");
      const tl = (st.mTl = gsap.timeline({ onComplete() { AB.lenis?.start(); st.mTl = null; setupMobile(); } }));
      tl.add(burgerTo(false), 0);
      if (pEl) tl.to(pEl, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05).to(back, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.05);
      tl.to(navList, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
    };
    const openPanelM = (n) => {
      const el = P(n), pf = fades(el);
      killTl("pTl"); st.mPanel = n;
      const tl = (st.pTl = gsap.timeline());
      tl.to(items(), { xPercent: -10, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0)
        .to(logo, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
        .to(back, { autoAlpha: 1, duration: 0.25, ease: "power2.inOut" }, 0.15)
        .set(el, { autoAlpha: 1, xPercent: 0, pointerEvents: "auto" }, 0.2)
        .fromTo(pf, { xPercent: 8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.3, stagger: stg(pf.length), ease: "power3.out" }, 0.25);
    };
    const closePanelM = () => {
      if (!st.mPanel) return;
      const el = P(st.mPanel);
      killTl("pTl");
      const tl = (st.pTl = gsap.timeline({ onComplete() { st.mPanel = null; st.pTl = null; } }));
      tl.to(el, { xPercent: 20, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0)
        .set(el, { autoAlpha: 0, pointerEvents: "none" }, 0.25)
        .to(back, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
        .to(logo, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.15)
        .fromTo(items(), { xPercent: -20, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: "power3.out" }, 0.25);
    };
    toggles.forEach((b) => {
      b.addEventListener("mouseenter", (e) => {
        if (st.mobile) return;
        clearTimeout(st.lT); clearTimeout(st.hT);
        dim(e.currentTarget);
        st.hT = setTimeout(() => openDrop(b.dataset.dropdownToggle), st.open ? 0 : 120);
      });
      b.addEventListener("mouseleave", () => { if (st.mobile) return; clearTimeout(st.hT); st.lT = setTimeout(closeDrop, 150); });
      // Desktop opens on hover and ignores presses (original handleToggleClick) — keyboard works with Enter·Space·↓
      b.addEventListener("click", (e) => { if (st.mobile && st.mOpen) { e.preventDefault(); openPanelM(b.dataset.dropdownToggle); } });
      b.addEventListener("keydown", (e) => {
        if (st.mobile) return;
        const n = b.dataset.dropdownToggle;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); st.open && st.panel === n ? closeDrop() : openDrop(n); }
        if (e.key === "ArrowDown") { e.preventDefault(); openDrop(n); setTimeout(() => P(n)?.querySelector("a")?.focus(), 80); }
      });
    });
    allLinks.filter((l) => !l.hasAttribute("data-dropdown-toggle")).forEach((l) => {
      l.addEventListener("mouseenter", (e) => !st.mobile && dim(e.currentTarget));
      l.addEventListener("mouseleave", () => !st.mobile && !st.open && undim());
    });
    nav.querySelectorAll(".ab-plink").forEach((l) => {
      const a = l.querySelector(".ab-plink__arrow");
      l.addEventListener("mouseenter", () => a?.classList.add("is-showing"));
      l.addEventListener("mouseleave", () => a?.classList.remove("is-showing"));
    });
    dropWrap.addEventListener("mouseenter", () => { if (!st.mobile) { clearTimeout(st.lT); st.lT = null; } });
    dropWrap.addEventListener("mouseleave", () => { if (!st.mobile) st.lT = setTimeout(closeDrop, 150); });
    backdrop.addEventListener("click", closeDrop);
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (st.mobile) return st.mPanel ? closePanelM() : st.mOpen && closeMobile();
      if (st.open) { const t = T(st.panel); closeDrop(); t?.focus(); }
    });
    document.addEventListener("click", (e) => { if (!st.mobile && st.open && !e.target.closest("[data-menu-wrap]")) closeDrop(); });
    burger.addEventListener("click", () => (st.mOpen ? closeMobile() : openMobile()));
    back.addEventListener("click", closePanelM);
    // Clicking a link in the menu lifts the panel immediately (original handleNavLinkClose) — the transition curtain comes over it
    nav.addEventListener("click", (e) => {
      if (!e.target.closest("a[href]")) return;
      if (st.mobile && st.mOpen) {
        killTl("mTl"); killTl("pTl");
        gsap.set(navList, { autoAlpha: 0 });
        gsap.set([lt, lm, lb], { rotation: 0, y: 0, autoAlpha: 1 });
        nav.dataset.menuOpen = "false"; burger.setAttribute("aria-expanded", "false");
        st.mOpen = false; st.mPanel = null; setupMobile(); AB.lenis?.start();
      } else if (st.open) { killDrop(); st.open = false; st.panel = null; resetDesk(); iconReset(); undim(); }
    });
    let lastW = innerWidth, rT;
    addEventListener("resize", () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth; clearTimeout(rT);
      rT = setTimeout(() => {
        const was = st.mobile;
        st.mobile = innerWidth <= 991;
        if (was && !st.mobile) {
          killTl("mTl"); killTl("pTl");
          gsap.set([navList, items(), logo], { clearProps: "all" });
          gsap.set(back, { autoAlpha: 0 });
          gsap.set([lt, lm, lb], { rotation: 0, y: 0, autoAlpha: 1 });
          st.mOpen = false; st.mPanel = null; resetDesk();
        }
        if (!was && st.mobile) { killDrop(); st.open = false; st.panel = null; resetDesk(); iconReset(); undim(); setupMobile(); }
      }, 150);
    });
    st.mobile ? setupMobile() : resetDesk();
  }

  // ── Button text splitting — each letter rolls 0.018s later than the last (css lifts it 1.5em over 0.6s osmo)
  AB.chars = (scope) => scope.querySelectorAll("[data-chars]").forEach((el) => {
    if (el.dataset.charsInit) return;
    el.dataset.charsInit = "1";
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.setAttribute("aria-hidden", "true");
      s.textContent = c === " " ? " " : c;
      s.style.transitionDelay = `${i * 0.018}s`;
      el.append(s);
    });
  });
  AB.chars(document);

  // ── Cursor bubble: follows x·y with 0.4s power3.out and turns on only over [data-cursor-hover] (flips to the left at the right edge)
  const cursor = document.querySelector("[data-cursor]");
  if (cursor && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const text = cursor.querySelector("[data-cursor-text]");
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3.out" });
    let mx = 0, my = 0, moved = false;
    const update = () => {
      const hit = document.elementFromPoint(mx, my)?.closest("[data-cursor-hover]");
      const r = cursor.getBoundingClientRect();
      cursor.dataset.cursor = hit ? (r.right >= innerWidth ? "active-edge" : "active") : "";
      if (hit?.dataset.cursorText) text.textContent = hit.dataset.cursorText;
    };
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; moved = true; xTo(mx); yTo(my); requestAnimationFrame(update); });
    addEventListener("scroll", () => moved && requestAnimationFrame(update), { passive: true });
  }

  // ── Shared in-page motion (attach and detach per box)
  const kit = (root) => {
    const offs = [];
    return {
      on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
      add(fn) { if (typeof fn === "function") offs.push(fn); },
      kill() { offs.splice(0).reverse().forEach((f) => f()); },
    };
  };
  AB.desktop = () => innerWidth > 991;

  // Reveal (original initRevealAnimations): once when the section reaches 80% — title letters .5s with a 0.03s stagger (ease none),
  // Paragraph .9x→1 .8s power2.out after 0.4s, button .5s power2.out after 0.8s. Sections already visible get duration 0. Below 992 it shows immediately
  AB.reveal = (root, k) => {
    const splits = [];
    root.querySelectorAll('[data-reveal="component"]').forEach((c) => {
      const hs = c.querySelectorAll('[data-reveal="heading"]'), ps = c.querySelectorAll('[data-reveal="paragraph"]'), bs = c.querySelectorAll('[data-reveal="fade"]');
      if (!AB.desktop() || AB.reduced) { gsap.set([...hs, ...ps, ...bs], { opacity: 1, scale: 1, visibility: "visible" }); return; }
      const r = c.getBoundingClientRect();
      const seen = r.top < innerHeight * 0.8 || (scrollY > 0 && r.bottom < innerHeight);
      const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: "top 80%", once: true, refreshPriority: -1 }, defaults: seen ? { duration: 0 } : {} });
      hs.forEach((h) => {
        const s = SplitText.create(h, { type: "chars, words, lines", linesClass: "line-mask", wordsClass: "word-mask", charsClass: "char-mask" });
        splits.push(s);
        gsap.set(h, { opacity: 1 });
        gsap.set(s.chars, { opacity: 0 });
        tl.to(s.chars, { opacity: 1, duration: 0.5, stagger: { each: 0.03, from: "start" }, ease: "none" }, 0);
      });
      ps.forEach((p) => {
        gsap.set(p, { opacity: 0, scale: 0.9, transformOrigin: "center" });
        tl.to(p, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, 0.4);
      });
      if (bs.length) { gsap.set(bs, { autoAlpha: 0 }); tl.to(bs, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.8); }
    });
    k.add(() => splits.forEach((s) => s.revert()));
  };

  // Parallax (original initGlobalParallax): yPercent from start value → end value, scrub from when the section enters at the screen bottom until it leaves at the top
  AB.parallax = (root) => {
    root.querySelectorAll('[data-parallax="trigger"]').forEach((t) => {
      const target = t.querySelector('[data-parallax="target"]') || t;
      const prop = t.dataset.parallaxDirection === "horizontal" ? "xPercent" : "yPercent";
      const from = t.dataset.parallaxStart != null ? +t.dataset.parallaxStart : 20;
      const to = t.dataset.parallaxEnd != null ? +t.dataset.parallaxEnd : -20;
      gsap.fromTo(target, { [prop]: from }, { [prop]: to, ease: "none", scrollTrigger: { trigger: t, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: t.dataset.parallaxScrub ? +t.dataset.parallaxScrub : true } });
    });
  };

  // Fan-shaped cards (original initTiltCards, 768 and up): pinned for 400vh, text disappears in the first 25%, each card takes 300vh/n in turn
  // The circle (250vw) rotates by rot and the card rises from 55vh below to the screen center, rotating by rot (power1.out). rot = -6, -2, 2, 6
  AB.tilt = (root, k) => {
    const wrap = root.querySelector("[data-tilt]");
    if (!wrap) return;
    const mm = gsap.matchMedia();
    k.add(() => mm.revert());
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const pin = wrap.querySelector("[data-tilt-pin]"), circles = wrap.querySelectorAll("[data-tilt-circle]");
      gsap.fromTo(wrap.querySelector("[data-tilt-circles]"), { y: "5%" }, { y: "-5%", ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: "bottom bottom", pin: wrap.querySelector("[data-tilt-stage]"), scrub: true, anticipatePin: 1, pinSpacing: true } });
      const total = pin.clientHeight - innerHeight;
      gsap.to(wrap.querySelector("[data-tilt-copy]"), { opacity: 0, ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: "+=" + total * 0.25, scrub: true } });
      const spread = 4, per = total / circles.length;
      let rot = -((circles.length - 1) * spread) / 2;
      circles.forEach((c, i) => {
        const card = c.querySelector("[data-tilt-card]");
        const s = { trigger: pin, start: "top top-=" + per * i, end: "+=" + per, scrub: true };
        gsap.to(c, { rotation: rot, ease: "power1.out", scrollTrigger: s });
        gsap.fromTo(card, { y: innerHeight * 0.55, yPercent: 0 }, { rotation: rot, y: 0, yPercent: -50, ease: "power1.out", scrollTrigger: { ...s } });
        rot += spread;
      });
      return () => circles.forEach((c) => gsap.set([c, c.querySelector("[data-tilt-card]")], { clearProps: "all" }));
    });
  };

  // Testimonials (original initLineRevealTestimonials): old line −110% in .6s power4.inOut (sequence total .25), photo closes to the center —
  // overlapping .3s, new line 110%→0 in .7s (stagger total .4), photo inset 50%→0 in .75s, buttons·logo 1s power2.out. No auto advance (the original doesn’t set it either)
  AB.reviews = (root, k) => {
    root.querySelectorAll("[data-testimonial-wrap]").forEach((wrap) => {
      const items = [...wrap.querySelectorAll("[data-testimonial-item]")];
      if (!items.length) return;
      const show = "inset(0% 0% 0% 0%)", hide = "inset(50% 50% 50% 50%)";
      let active = 0, busy = false;
      const cur = wrap.querySelector("[data-current]");
      const slides = items.map((item) => ({
        item,
        img: item.querySelector("[data-testimonial-img]"),
        logo: item.querySelector("[data-testimonial-logo]"),
        btn: item.querySelector("[data-testimonial-button]"),
        splits: [item.querySelector("[data-testimonial-text]"), ...item.querySelectorAll("[data-testimonial-split]")].filter(Boolean),
        inst: [],
        lines() { return this.inst.flatMap((s) => s.lines); },
      }));
      const setState = (i, on) => {
        items[i].classList.toggle("is-active", on);
        items[i].setAttribute("aria-hidden", String(!on));
        gsap.set(items[i], { autoAlpha: on ? 1 : 0, pointerEvents: on ? "auto" : "none" });
      };
      slides.forEach((_, i) => setState(i, i === active));
      slides.forEach((s, i) => {
        s.inst = s.splits.map((el) => SplitText.create(el, {
          type: "lines", mask: "lines", linesClass: "text-line", autoSplit: true,
          onSplit(self) {
            if (AB.reduced) return;
            const on = i === active;
            gsap.set(self.lines, { yPercent: on ? 0 : 110 });
            if (s.img) gsap.set(s.img, { clipPath: on ? show : hide });
            if (s.logo) gsap.set(s.logo, { autoAlpha: on ? 1 : 0 });
            if (s.btn) gsap.set(s.btn, { autoAlpha: on ? 1 : 0 });
          },
        }));
      });
      k.add(() => slides.forEach((s) => s.inst.forEach((x) => x.revert())));
      const go = (n) => {
        if (busy || n === active) return;
        busy = true;
        const o = slides[active], nx = slides[n];
        const tl = gsap.timeline({ onComplete() { setState(active, false); setState(n, true); active = n; if (cur) cur.textContent = n + 1; busy = false; } });
        if (AB.reduced) { tl.to(o.item, { autoAlpha: 0, duration: 0.4, ease: "power2" }, 0).fromTo(nx.item, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2" }, 0); return; }
        gsap.set(nx.item, { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(nx.lines(), { yPercent: 110 });
        if (o.img) gsap.set(o.img, { clipPath: show });
        tl.to(o.lines(), { yPercent: -110, duration: 0.6, ease: "power4.inOut", stagger: { amount: 0.25 } }, 0);
        if (o.img) tl.to(o.img, { clipPath: hide, duration: 0.6, ease: "power4.inOut" }, 0);
        if (o.logo) tl.to(o.logo, { autoAlpha: 0, duration: 0.6, ease: "power4.inOut" }, 0);
        if (o.btn) tl.to(o.btn, { autoAlpha: 0, duration: 0.6, ease: "power4.inOut" }, 0);
        tl.to(nx.lines(), { yPercent: 0, duration: 0.7, ease: "power4.inOut", stagger: { amount: 0.4 } }, ">-=0.3");
        if (nx.img) tl.fromTo(nx.img, { clipPath: hide }, { clipPath: show, duration: 0.75, ease: "power4.inOut" }, "<");
        if (nx.btn) tl.fromTo(nx.btn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }, ">-=0.3");
        if (nx.logo) tl.fromTo(nx.logo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }, "<.125");
        tl.set(o.item, { autoAlpha: 0 }, ">");
      };
      const next = wrap.querySelector("[data-next]"), prev = wrap.querySelector("[data-prev]");
      if (next) k.on(next, "click", () => go((active + 1) % slides.length));
      if (prev) k.on(prev, "click", () => go((active - 1 + slides.length) % slides.length));
      k.on(window, "keydown", (e) => {
        if (e.target.closest?.("input, textarea, [contenteditable]")) return;
        if (e.key === "ArrowRight") go((active + 1) % slides.length);
        if (e.key === "ArrowLeft") go((active - 1 + slides.length) % slides.length);
      });
    });
  };

  // Horizontal card row (original initSwipers): Swiper 8 · 0.3s · slidesPerView auto · wheel horizontal only · end buttons get is-disabled
  AB.sliders = (root, k) => {
    if (!window.Swiper) return;
    root.querySelectorAll("[data-slider]").forEach((c) => {
      const el = c.querySelector(".swiper");
      if (!el) return;
      const loop = c.dataset.loop === "true";
      const sw = new Swiper(el, {
        speed: +(c.dataset.sliderDuration || 300), loop, centeredSlides: loop, followFinger: true, slideToClickedSlide: false, slidesPerView: "auto", rewind: false,
        mousewheel: { forceToAxis: true },
        navigation: { nextEl: c.querySelector("[data-next]"), prevEl: c.querySelector("[data-prev]"), disabledClass: "is-disabled" },
        slideActiveClass: "is-active",
      });
      k.add(() => sw.destroy(true, true));
    });
  };

  // ── Box Attach · Detach
  let mounted = null;
  const mount = (root) => {
    const k = kit(root);
    let api = {};
    AB.footer(root);
    const ctx = gsap.context(() => {
      AB.chars(root);
      api = (AB.pages[root.dataset.barbaNamespace]?.(root, { k })) || {};
      AB.tilt(root, k);
      AB.reviews(root, k);
      AB.sliders(root, k);
      AB.parallax(root);
    }, root);
    mounted = { ctx, k, api, root };
    return api;
  };
  // Reveals are set when the loader starts (first page) or after the transition ends — same order as the original
  AB.startReveal = () => mounted && mounted.ctx.add(() => AB.reveal(mounted.root, mounted.k));
  // The original pauses reveal and loader while the script bundle downloads after first paint (measured 1.6s) — wait that long and start, only on the first open
  AB.HOLD = 1600;
  AB.afterHold = (fn) => {
    const fp = () => performance.getEntriesByName("first-paint")[0]?.startTime ?? performance.getEntriesByType("paint")[0]?.startTime;
    const go = () => setTimeout(fn, Math.max(0, (fp() ?? performance.now()) + AB.HOLD - performance.now()));
    if (fp() != null) return go();
    new PerformanceObserver((l, o) => { o.disconnect(); requestAnimationFrame(go); }).observe({ type: "paint", buffered: true });
  };
  const unmount = () => {
    if (!mounted) return;
    mounted.k.kill();
    mounted.ctx.revert();
    mounted = null;
  };

  // ── Page transition (the original sync transition as is): the new box is laid over as fixed, and the old box goes 0→-25vh · dark curtain 0→.8,
  //    The new box goes 100vh→0 — all 1.2s ”parallax”. When fully risen, remove the old box and go to the top
  const transWrap = document.querySelector("[data-transition-wrap]");
  const transDark = transWrap.querySelector("[data-transition-dark]");
  const leave = (current) => {
    const tl = gsap.timeline();
    if (AB.reduced) return tl.set(current, { autoAlpha: 0 });
    tl.set(transWrap, { zIndex: 2 })
      .fromTo(transDark, { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 1.2, ease: "parallax" }, 0)
      .fromTo(current, { y: "0vh" }, { y: "-25vh", duration: 1.2, ease: "parallax" }, 0)
      .set(transDark, { autoAlpha: 0 })
      .set(transWrap, { clearProps: "zIndex" });
    return tl;
  };
  const enter = (next) => new Promise((done) => {
    const tl = gsap.timeline({ onComplete: done });
    if (AB.reduced) { tl.set(next, { autoAlpha: 1 }); return; }
    tl.set(next, { zIndex: 3 }).fromTo(next, { y: "100vh" }, { y: "0vh", duration: 1.2, clearProps: "all", ease: "parallax" });
  });
  const toTop = () => { scrollTo(0, 0); AB.lenis?.scrollTo(0, { immediate: true, force: true }); AB.lenis?.resize(); };

  // All four sections carry their css and page scripts together, like the original Webflow (so there is no delay when paging) — for anyone appending other sections, css and scripts found only in the next section are brought in
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
      setTimeout(r, 800);
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
    return () => [...document.querySelectorAll('link[rel="stylesheet"]')].forEach((l) => want.includes(l.href) || l.remove());
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    const api = mount(first);
    // On the first page with a loader, the loader triggers the reveal
    if (api.once) api.once();
    else AB.afterHold(AB.startReveal);
    AB.firstLoad = false;
    ScrollTrigger.refresh();
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    let busy = false, dropOld = null;
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el, event, href }) => {
        if (busy) { if (event?.type === "click") event.preventDefault(); return true; }
        if (!el || el.closest(".wf-ui") || el.target === "_blank") return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return true;
        try { const u = new URL(href, location.href); if (u.origin !== location.origin) return true; } catch { return true; }
        return false;
      },
      transitions: [{
        name: "default",
        sync: true,
        beforeLeave() { busy = true; AB.lenis?.stop(); },
        async beforeEnter({ next }) {
          dropOld = await bring(next.html);
          gsap.set(next.container, { position: "fixed", top: 0, left: 0, right: 0 });
        },
        leave({ current }) { return leave(current.container).then(() => current.container?.remove()); },
        async enter({ next }) {
          await enter(next.container);
          toTop();
          gsap.set(next.container, { clearProps: "position,top,left,right" });
        },
        afterLeave() { unmount(); ScrollTrigger.getAll().forEach((t) => t.kill()); },
        afterEnter({ next }) {
          dropOld?.();
          AB.navShow?.();
          mount(next.container);
          AB.startReveal();
          AB.lenis?.resize();
          AB.lenis?.start();
          ScrollTrigger.refresh();
          busy = false;
        },
      }],
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
