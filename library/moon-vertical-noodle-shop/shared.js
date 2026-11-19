// Common to all pages: header · phone menu once, footer · floor scene · moon drawn in per page (Barba container), and hooks up ScrollSmoother · Barba transition · header invert · moon pin · hover dot · parallax · floor follow.
// Original library as is: barba 2.9.7 (prefix data-trans) — current container turns off over .1s → next container turns on over .1s (CustomEase fade .5,1,.89,1).
// Original values: ScrollSmoother smooth 1 · normalizeScroll (.1 right after a transition → 1 when it ends) / moon pin "top top"→Footer "center center" /
// Hover dot .5s power2.out / bottom y -50% scrub / phone menu panel .5s · lines x30% clip .5s with .05 gap · button clip .6s
// Page scripts use KS.page(namespace, (box) => Register with detach) — it attaches again even when handed over via Barba, and detach is called on leave
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase);
  CustomEase.create("fade", "0.5, 1, 0.89, 1");
  CustomEase.create("slide", ".32, .95, .6, 1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Original isMobile: if the browser sniffer (bowser) says phone or tablet, or ontouchstart exists, it counts as a touch device — ScrollSmoother and parallax are turned off and body is fixed and locked.
  const touch = /Mobi|Android|iPhone|iPad|iPod|Tablet|Silk|Kindle/i.test(navigator.userAgent) || "ontouchstart" in window;
  const isSP = () => innerWidth <= 768;
  const KS = (window.KS = { reduced, smoother: null });

  const arrowR = '<svg viewBox="0 0 12 12"><path d="M4 2l4 4-4 4"/></svg>';
  const extIco = '<svg viewBox="0 0 12 12"><path d="M5 2H2v8h8V7M7 2h3v3M10 2 5.5 6.5"/></svg>';
  const split = (t) => `<span class="ks-split__txt">${t}</span><span class="ks-split__shadow" aria-hidden="true">${t}</span>`;
  KS.icons = { arrowR };

  // Store logo spots: redraws the original vertical brush-script logo and sun-and-cloud logo as shapes of the same size
  const brush = (x, y, w, h, r = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
  const LOGOS = {
    vertical: `<svg class="ks-shoplogo is-vertical" viewBox="0 0 102 280" role="img" aria-label="Store Logo Slot">
      <g class="is-ink">${brush(78, 8, 9, 7, 2)}${brush(77, 20, 11, 6, 2)}${brush(78, 31, 9, 8, 2)}${brush(77, 44, 10, 6, 2)}${brush(78, 55, 9, 8, 2)}
      ${brush(36, 30, 26, 30, 8)}${brush(32, 72, 34, 22, 6)}${brush(38, 104, 22, 40, 9)}${brush(34, 154, 30, 26, 7)}${brush(40, 190, 20, 48, 9)}</g>
      <g class="is-ink" opacity=".55">${brush(14, 150, 2, 90, 1)}</g>
      <rect class="is-seal" x="72" y="246" width="12" height="12"/></svg>`,
    round: `<svg class="ks-shoplogo is-round" viewBox="0 0 287 141" role="img" aria-label="Store Logo Slot">
      <circle class="is-sun" cx="143" cy="68" r="56"/><circle class="is-ring" cx="143" cy="68" r="46" fill="none" stroke-width="2"/>
      <g class="is-ink">${brush(139, 34, 8, 12, 2)}${brush(138, 52, 10, 10, 2)}${brush(139, 68, 8, 14, 2)}${brush(138, 88, 10, 10, 2)}</g>
      <g class="is-sealLine" fill="none" stroke-width="7" stroke-linecap="round">
        <path d="M20 112c18-2 30-14 44-14s20 10 34 8 18-14 28-14"/><path d="M60 100a12 12 0 1 1 14-14"/>
        <path d="M267 92c-18 2-30-12-44-12s-22 10-34 8"/><path d="M226 82a12 12 0 1 0-14-14"/>
      </g></svg>`,
  };
  const logos = (box) => box.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = LOGOS[el.dataset.logo] || ""; });

  const NAV = [
    ["Menu 1", "about.html"],
    ["Menu 2", "index.html#shop-a"],
    ["Menu 3", "index.html#shop-b"],
    ["Menu 4", "product.html"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ks-head");
    head.innerHTML = `
      <div class="ks-logo"><a href="index.html" aria-label="Home"><span class="ks-wordmark">LOGOTYPE</span></a></div>
      <nav class="ks-nav" aria-label="Main menu">
        <ul class="ks-nav__list">
          ${NAV.map(([t, h]) => `<li class="ks-nav__item"><a class="ks-nav__link ks-split" href="${h}">${split(t)}</a></li>`).join("")}
          <li class="ks-nav__item" data-sub>
            <span class="ks-nav__link ks-split">${split("Menu 5")}</span>
            <div class="ks-nav__child"><ul>
              <li><a class="ks-split" href="index.html#shop-a">${split(`Store 1 map ${extIco}`)}</a></li>
              <li><a class="ks-split" href="index.html#shop-b">${split(`Store 2 map ${extIco}`)}</a></li>
            </ul></div>
          </li>
        </ul>
        <button class="ks-menu-btn is-close-btn" type="button" aria-label="Close Menu"><svg viewBox="0 0 32 32"><path d="M10 10l12 12M22 10 10 22"/></svg></button>
        <button class="ks-menu-btn is-open-btn" type="button" aria-label="Open Menu"><svg viewBox="0 0 32 32"><path d="M7 10h18M7 16h18M7 22h18"/></svg></button>
      </nav>`;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="ks-menu" data-slot="menu-drawer" data-lenis-prevent>
        <nav class="ks-menu__nav"><ul class="ks-menu__list">
          <li><a class="ks-menu__link" href="about.html">Menu 1</a></li>
          <li><a class="ks-menu__link" href="index.html#shop-a">Menu 2 <small>Shop 1</small></a></li>
          <li><a class="ks-menu__link" href="index.html#shop-b">Menu 3 <small>Shop 2</small></a></li>
          <li><a class="ks-menu__link" href="product.html">Menu 4</a></li>
          <li><button class="ks-menu__link" type="button" data-acc>Menu 5</button>
            <ul class="ks-menu__child"><li><a href="index.html#shop-a">Shop 1 Map</a></li><li><a href="index.html#shop-b">Shop 2 Map</a></li></ul></li>
          <li><a class="ks-menu__link" href="contact.html">Menu 6</a></li>
        </ul>
        <p class="ks-menu__rules"><a href="contact.html">Your guide link here</a></p></nav>
      </div>
      <div class="ks-menu-bg"></div>`
    );
  }

  const SHOPS = [
    ["Shop Name 1", "| Branch name"],
    ["Shop Name 2", "| Main branch name"],
  ];
  // Footer, bottom scene, moon and back-to-top sit inside the Barba container like the original, so they are redrawn on every page
  const buildFoot = (box) => {
    const foot = box.querySelector('[data-slot="footer"]');
    if (!foot || foot.classList.contains("ks-foot")) return;
    foot.outerHTML = `
      <footer class="ks-foot dark" data-slot="footer">
        <div class="ks-foot__inner">
          <div class="ks-foot__top"><a href="index.html"><span class="ks-wordmark">LOGOTYPE</span></a><p class="ks-foot__tagline">Your one-line brand introduction here.</p></div>
          <div class="ks-foot__bottom">
            <div class="ks-foot__shop">
              ${SHOPS.map(([n, s]) => `
                <div class="ks-foot__shopitem">
                  <h3 class="ks-foot__shopname">${n}<small>${s}</small></h3>
                  <dl class="ks-foot__info">
                    <div class="ks-foot__row"><dt>Item 1</dt><dd>〒000-0000 Add your address on a single line here<a href="#">Map link</a></dd></div>
                    <div class="ks-foot__row"><dt>Item 2</dt><dd>00-0000-0000</dd></div>
                    <div class="ks-foot__row"><dt>Item 3</dt><dd>00:00~00:00 / 00:00~00:00</dd></div>
                    <div class="ks-foot__row"><dt>Item 4</dt><dd>Your day off here</dd></div>
                  </dl>
                </div>`).join("")}
            </div>
            <nav class="ks-foot__nav">
              <ul class="ks-foot__navlist">
                <li><a class="ks-foot__navlink ks-split" href="about.html">${split("Menu 1")}</a></li>
                <li><a class="ks-foot__navlink ks-split" href="index.html#shop">${split("Shop Guide")}</a>
                  <div class="ks-foot__child"><a class="ks-split" href="index.html#shop-a">${split("Shop 1")}</a><a class="ks-split" href="index.html#shop-b">${split("Shop 2")}</a></div></li>
                <li><a class="ks-foot__navlink ks-split" href="index.html#shop">${split("Menu 5")}</a>
                  <div class="ks-foot__child"><a class="ks-split" href="index.html#shop-a">${split("Shop 1 Map")}</a><a class="ks-split" href="index.html#shop-b">${split("Shop 2 Map")}</a></div></li>
                <li><a class="ks-foot__navlink ks-split" href="product.html">${split("Menu 4")}</a></li>
                <li><a class="ks-foot__navlink ks-split" href="contact.html">${split("Menu 6")}</a></li>
                <li><a class="ks-foot__navlink ks-split" href="contact.html">${split("Your guide link here")}</a></li>
              </ul>
              <p class="ks-foot__copy">© 0000 LOGOTYPE</p>
            </nav>
          </div>
        </div>
      </footer>
      <section class="ks-bottom" data-slot="bottom-reveal">
        <figure class="ks-bottom__fig"><div class="wf-img ks-ph is-wood" data-label="Bowl on a wooden tray seen from directly above · gray stone surface · landscape 9:4"></div></figure>
        <h2 class="ks-bottom__ttl">Your last line goes here.</h2>
        <p class="ks-bottom__desc">Your two-line brand intro goes here. Your two-line brand intro goes here.<br>Add one more line here and center it.</p>
      </section>
      <div class="ks-moon" data-slot="moon" aria-hidden="true"><span class="ks-moon__sphere is-light"></span><span class="ks-moon__sphere is-dark"></span><span class="ks-moon__stalker"></span></div>
      <button class="ks-scroller" type="button" aria-label="Back to top"><span>${arrowR}</span></button>`;
  };

  // ── Smooth scroll: as in the original, the Barba container is itself the ScrollSmoother shell (.ks-main) and the .ks-page inside is the content. Disabled on touch devices ──
  const makeSmoother = (box, smooth) => {
    if (KS.smoother) { KS.smoother.kill(); KS.smoother = null; }
    if (reduced || touch) return;
    KS.smoother = ScrollSmoother.create({ wrapper: box, content: box.querySelector(".ks-page"), smooth, normalizeScroll: true, effects: false, ignoreMobileResize: true });
    KS.smoother.scrollTop(0);
  };
  const headH = () => (head ? head.clientHeight : 0);
  const scrollTo = (target, offset = 0) => {
    if (KS.smoother) KS.smoother.scrollTo(target === 0 ? 0 : KS.smoother.offset(target, `top ${offset}px`), true);
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: reduced ? "auto" : "smooth" });
  };
  // Original scrollResetPosition: if the URL has a #, go to that spot (up by the header height), otherwise to the top — immediately
  const resetPosition = (box) => {
    const t = location.hash && box.querySelector(location.hash);
    const y = t ? t.offsetTop - headH() : 0;
    if (KS.smoother) KS.smoother.scrollTop(y);
    else requestAnimationFrame(() => window.scrollTo(0, y));
  };

  // Header dropdown: opens on mouse hover and the other items dim to .3
  if (head) {
    const nav = head.querySelector(".ks-nav");
    head.querySelectorAll("[data-sub]").forEach((li) => {
      li.addEventListener("mouseenter", () => { if (isSP()) return; li.classList.add("is-open"); nav.classList.add("is-open"); });
      li.addEventListener("mouseleave", () => { li.classList.remove("is-open"); nav.classList.remove("is-open"); });
    });
  }

  // ── Phone menu ──
  const menu = document.querySelector(".ks-menu");
  const menuBg = document.querySelector(".ks-menu-bg");
  const openBtn = head && head.querySelector(".is-open-btn");
  const closeBtn = head && head.querySelector(".is-close-btn");
  let mtl = null;
  const items = menu ? menu.querySelectorAll(".ks-menu__list > li, .ks-menu__rules") : [];
  // Original lockScroll: on mouse devices it stops ScrollSmoother, on touch devices it pins body in place (fixed, top −y) and shrinks its height to the screen
  let lockY = 0;
  const lock = (on) => {
    if (KS.smoother) return KS.smoother.paused(on);
    const b = document.body.style;
    if (on) {
      lockY = scrollY;
      Object.assign(b, { overflow: "hidden", position: "fixed", top: `-${lockY}px` });
    } else {
      ["overflow", "position", "top"].forEach((k) => b.removeProperty(k));
      window.scrollTo(0, lockY);
    }
  };
  function openMenu() {
    document.body.classList.add("menu-open");
    mtl && mtl.kill();
    gsap.set(menu, { autoAlpha: 1 });
    gsap.set(menuBg, { x: "100%", width: "100%" });
    mtl = gsap.timeline()
      .fromTo(openBtn, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 50% 0% 50%)", duration: 0.6 }, "<")
      .to(menuBg, { x: "0%", width: "100%", autoAlpha: 1, duration: 0.5 }, "<")
      .fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .fromTo(items, { x: "30%", autoAlpha: 0.5, clipPath: "inset(0% 0% 0% 100%)" }, { x: "0%", autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, stagger: { each: 0.05 } }, "<")
      // As in the original, after all lines have come in (.call ">") is locked with an ing marker — the previous "<" is the spot for that call
      .call(() => document.body.classList.toggle("ing"), null, ">")
      .add(() => lock(true), "<")
      .fromTo(closeBtn, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, ">");
  }
  function closeMenu() {
    if (!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    mtl && mtl.kill();
    mtl = gsap.timeline()
      .fromTo(closeBtn, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 50% 0% 50%)", duration: 0.8 }, "<")
      .add(() => lock(false), "<")
      .fromTo(items, { x: "0%", autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" }, { autoAlpha: 0.5, clipPath: "inset(0% 100% 0% 0%)", duration: 0.5, stagger: { each: 0.05 } }, "<")
      .to(menuBg, { x: "-100%", width: "0%", autoAlpha: 0.9, duration: 0.5 }, "<")
      .fromTo(openBtn, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, ">")
      .to(menu, { autoAlpha: 0 }, "<")
      .call(() => document.body.classList.toggle("ing"), null, ">");
  }
  if (openBtn) {
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    menu.querySelectorAll("[data-acc]").forEach((b) => {
      const child = b.nextElementSibling;
      b.addEventListener("click", () => {
        const open = b.classList.toggle("is-open");
        if (open) { gsap.set(child, { height: 0 }); gsap.to(child, { autoAlpha: 1, height: "auto" }); }
        else gsap.to(child, { autoAlpha: 0, height: 0 });
      });
    });
  }

  // Hover dot: hovering a menu letter sends the small dot in the moon to that spot. Header links are outside the Brand box, so it hooks once and finds the current moon
  const stalkTo = (a) => {
    const moon = KS.moon, stalker = moon && moon.querySelector(".ks-moon__stalker");
    if (!stalker) return;
    const r = a.getBoundingClientRect(), m = moon.getBoundingClientRect(), s = stalker.getBoundingClientRect();
    const x = r.left + r.width / 2 - m.left - s.width / 2;
    const y = r.top + r.height / 2 - m.top - s.height / 2;
    // Original: over the header menu the dot is moon-white, over the black footer it is jet black, reading the skin color at the same spot
    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue(a.closest(".ks-foot") ? "--kf-contrast-bg" : "--kf-raised").trim();
    gsap.to(stalker, { x, y, backgroundColor: bg, opacity: 1, duration: 0.5, ease: "power2.out" });
  };
  const stalkOut = () => { const s = KS.moon && KS.moon.querySelector(".ks-moon__stalker"); if (s) gsap.to(s, { opacity: 0, duration: 0.5, ease: "power2.out" }); };
  const stalkOn = (root) => root.querySelectorAll(".ks-nav__link, .ks-nav__child a, .ks-foot__navlink, .ks-foot__child a").forEach((a) => {
    a.addEventListener("mouseenter", () => stalkTo(a));
    a.addEventListener("mouseleave", stalkOut);
  });
  if (head) stalkOn(head);

  // ── Attach and detach per box ──
  const parts = [];
  KS.page = (ns, fn) => parts.push({ ns, fn });
  let ctx = null;
  let cleanups = [];
  function build(box) {
    document.body.dataset.page = box.dataset.transNamespace;
    buildFoot(box);
    logos(box);
    stalkOn(box);
    const sc = box.querySelector(".ks-scroller");
    if (sc) sc.addEventListener("click", () => scrollTo(0));
  }
  function mount(box) {
    const content = box.querySelector(".ks-page");
    const footer = box.querySelector(".ks-foot");
    const bottom = box.querySelector(".ks-bottom");
    const moon = (KS.moon = box.querySelector(".ks-moon"));
    ctx = gsap.context(() => {
      // Header: on scroll down the margin shrinks and the logo rises 12. Over black sections the text turns light
      ScrollTrigger.create({
        start: "top top", end: "max",
        onUpdate: (st) => {
          document.body.classList.toggle("is-scroll-down", st.direction === 1 && st.scroll() > 10);
          document.body.classList.toggle("is-scroll-up", st.direction === -1);
        },
      });
      box.querySelectorAll(".dark").forEach((el) =>
        ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top", toggleClass: { targets: head, className: "negative" } })
      );
      // Parallax photo: the body comes down from above by the spare length (PC·mouse devices only)
      gsap.matchMedia().add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
        if (touch) return;
        box.querySelectorAll(".ks-pax").forEach((outer) => {
          const inner = outer.querySelector(".ks-pax__in");
          gsap.from(inner, {
            y: () => -(inner.offsetHeight - outer.clientHeight),
            ease: "none",
            scrollTrigger: { trigger: outer, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true, fastScrollEnd: true },
          });
        });
      });
      // The bottom scene rises up from behind the footer
      if (!reduced && footer && bottom) {
        gsap.from(bottom, { y: "-50%", ease: "none", scrollTrigger: { trigger: footer, start: "bottom bottom", endTrigger: bottom, end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
      }
      // Moon: stays at screen center from the Hero to the Footer center
      if (moon && footer) {
        const copyBlend = () => {
          const p = moon.parentNode;
          if (p && p.classList.contains("pin-spacer")) { p.style.mixBlendMode = getComputedStyle(moon).mixBlendMode; p.style.pointerEvents = "none"; }
        };
        ScrollTrigger.create({ trigger: content, start: "top top", endTrigger: footer, end: "center center", pin: moon, pinSpacing: false, invalidateOnRefresh: true, onEnter: copyBlend, onUpdate: copyBlend, onRefresh: copyBlend });
      }
    }, box);
    cleanups = parts.filter((p) => p.ns === "*" || p.ns === box.dataset.transNamespace).map((p) => p.fn(box)).filter((f) => typeof f === "function");
    ScrollTrigger.refresh();
  }
  // Original resetAnyFunc: clears events and timers and kills all ScrollTrigger instances
  function unmount() {
    cleanups.splice(0).forEach((f) => f());
    if (ctx) { ctx.revert(); ctx = null; }
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }

  // Re-measure after the elements whose height changes (horizontal slider, fonts) have settled
  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  // Only pages of this site set (*.html in the same folder) count as transitions — same-page # moves don’t transition, they glide
  const box = () => document.querySelector('[data-trans="container"]');
  const fileOf = (href) => (href || "").split("#")[0];
  const here = () => location.pathname.split("/").pop() || "index.html";
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (href === "#") { e.preventDefault(); return; }
    const [file, hash] = href.split("#");
    if ((!file || file === here()) && hash) {
      e.preventDefault();
      closeMenu();
      const t = box().querySelector(`#${hash}`);
      if (t) scrollTo(t, headH());
    }
  }, true);

  // Makes Barba fetch the next page’s page css — the original has a single css so this isn’t needed
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };

  function start() {
    build(box());
    makeSmoother(box(), 1);
    mount(box());
    addEventListener("load", () => resetPosition(box()));
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        schema: { prefix: "data-trans", wrapper: "wrapper", container: "container", namespace: "namespace" },
        prevent: ({ el }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")) || fileOf(el.getAttribute("href")) === here(),
        transitions: [{
          name: "global-transitions",
          // Original fade.leave: erases the current box in .1s
          leave: ({ current }) => new Promise((res) => {
            closeMenu();
            if (reduced) return res();
            gsap.to(current.container, { duration: 0.1, opacity: 0, ease: "fade", onComplete: res });
          }),
          // Original fade.enter: the erased box stays fixed in place, and after aligning positions the next box turns on in .1s
          enter: ({ current, next }) => new Promise((res) => {
            gsap.set(current.container, { opacity: 0, position: "fixed" });
            resetPosition(next.container);
            if (reduced) return res();
            gsap.from(next.container, { opacity: 0, duration: 0.1, ease: "fade", onComplete: res });
          }),
        }],
      });
      barba.hooks.afterLeave(() => unmount());
      // Original: rebuild ScrollSmoother with the next box, using smooth .1 while handing over and 1 once done
      barba.hooks.beforeEnter(async ({ next }) => {
        await sheets(next.html);
        build(next.container);
        makeSmoother(next.container, 0.1);
      });
      barba.hooks.afterEnter(({ next }) => mount(next.container));
      barba.hooks.after(({ next }) => {
        const t = new DOMParser().parseFromString(next.html, "text/html").title;
        if (t) document.title = t;
        if (KS.smoother) KS.smoother.smooth(1);
      });
      return;
    }
    // Under file:// barba cannot fetch the next page — clear out with the same values, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href) || fileOf(href) === here()) return;
      e.preventDefault();
      if (reduced) return void (location.href = href);
      gsap.to(box(), { opacity: 0, duration: 0.1, ease: "fade", onComplete: () => { location.href = href; } });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(box(), { opacity: 1 }); });
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
