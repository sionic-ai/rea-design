// Common to all pages: draws the header, drawer, footer and paper-grain background, and hooks up smooth scroll, heartbeat reveal, peel-off, hover flicker and page transitions.
// Original values: Lenis lerp .1 (off at 1024 and below) · heartbeat 2.26s 150ms gap · shell scale .94→1 blur 8→0 brightness .75→1 opacity .35→1
//           hover letter flicker .32s · diamond push .7s · transition 1.5s cubic-bezier(.75,0,.2,1)
// Page transitions use swup 4.9.2 with parallel · js · head · body-class · preload · a11y plugins, same as the original. Only the body (main) is swapped, so page scripts
// Register with AD.page(name, init), and on each navigation detach (gsap.context revert + clean up AD.listen·interval·observe) and reattach to the new body.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth <= 1024;
  root.classList.add(reduced ? "reduced" : "js");
  const AD = (window.AD = { reduced, isSP, lenis: null });
  const pages = {};
  let scope = null;
  AD.page = (name, init) => (pages[name] = init);
  AD.listen = (t, type, fn, o) => { t.addEventListener(type, fn, o); scope?.cleanups.push(() => t.removeEventListener(type, fn, o)); };
  AD.interval = (fn, ms) => { const id = setInterval(fn, ms); scope?.cleanups.push(() => clearInterval(id)); return id; };
  AD.observe = (io) => { scope?.cleanups.push(() => io.disconnect()); return io; };
  AD.cleanup = (fn) => scope?.cleanups.push(fn);

  const icon = (cls = "") => `<span class="ad-icon ${cls}"><i></i></span>`;
  // A placeholder text of the same ratio (206:42) instead of the original logo (serif wordmark) — the story section’s mask uses the same shape
  const wordmark = (id = "") =>
    `<svg viewBox="0 0 1000 204" aria-hidden="true"${id ? ` id="${id}"` : ""}><text x="0" y="200" style="font-family: var(--kf-font-display)" font-weight="500" font-size="318" textLength="1000" lengthAdjust="spacingAndGlyphs">SAMPLE</text></svg>`;
  const subbrand = `<span class="ad-subbrand">subbrand</span>`;
  AD.icon = icon;
  AD.wordmark = wordmark;
  AD.subbrand = subbrand;

  const services = ["Service one", "Service Two", "Service set · two-line name", "Service four · a slightly long name", "Service five"];
  const wrap = document.querySelector(".wrapper");

  // ── Paper Grain Background ──
  wrap.insertAdjacentHTML("afterbegin", `<div class="ad-bg" aria-hidden="true"><div class="ad-bg__noise"></div><div class="ad-bg__nami"></div></div>`);

  // ── Header ──
  const head = document.querySelector('[data-slot="header"]');
  head.innerHTML = `
    <div class="ad-logo"><a href="index.html" aria-label="Home">${wordmark()}</a></div>
    <nav class="ad-nav" aria-label="Main menu">
      <ul class="ad-nav__list">
        <li class="ad-nav__item"><a class="ad-nav__link" href="about.html"><span>About</span></a></li>
        <li class="ad-nav__item ad-nav__item--service">
          <button class="ad-nav__link" type="button" aria-expanded="false" data-sp-href="service.html"><span>Service</span>${icon("is-toggle")}</button>
          <div class="ad-pull" aria-hidden="true">
            <a class="ad-pull__ttl" href="service.html">Your business details here</a>
            <ul>${services.map((s, i) => `<li><a href="service.html#s${i + 1}">${s}</a></li>`).join("")}</ul>
          </div>
        </li>
        <li class="ad-nav__item"><a class="ad-nav__link" href="list.html"><span>Works</span></a></li>
        <li class="ad-nav__item mq-pc"><a class="ad-nav__link" href="news.html"><span>News</span></a></li>
        <li class="ad-nav__item mq-pc"><a class="ad-nav__sub" href="index.html#subbrand">${subbrand}${icon("is-out")}</a></li>
      </ul>
      <button class="ad-burger" type="button" aria-expanded="false" aria-label="Open Menu"><i></i><i></i></button>
    </nav>
    <nav class="ad-cta" aria-label="Contact · Recruiting">
      <a class="ad-cta__btn" href="#contact"><span>Contact</span></a>
      <a class="ad-cta__btn" href="recruit.html"><span>Recruit</span></a>
    </nav>
    <div class="ad-drawer" aria-hidden="true" inert data-lenis-prevent data-slot="menu-drawer">
      <ul class="ad-drawer__list">
        <li><a class="ad-drawer__link" href="index.html"><span class="ad-drawer__en">Home</span><span class="ad-drawer__ja">Your home here</span></a></li>
        <li><a class="ad-drawer__link" href="about.html"><span class="ad-drawer__en">About</span><span class="ad-drawer__ja">Your company intro here</span></a></li>
        <li><a class="ad-drawer__link" href="list.html"><span class="ad-drawer__en">Works</span><span class="ad-drawer__ja">Your track record here</span></a></li>
        <li><a class="ad-drawer__link" href="service.html"><span class="ad-drawer__en">Service</span><span class="ad-drawer__ja">Your business details here</span></a>
          <ul class="ad-drawer__sub">${services.map((s, i) => `<li><a href="service.html#s${i + 1}">${s}</a></li>`).join("")}</ul></li>
        <li><a class="ad-drawer__link" href="news.html"><span class="ad-drawer__en">News</span><span class="ad-drawer__ja">Your news here</span></a></li>
        <li><a class="ad-drawer__link" href="#contact"><span class="ad-drawer__en">Contact</span><span class="ad-drawer__ja">Your inquiry here</span></a></li>
        <li><a class="ad-drawer__link" href="recruit.html"><span class="ad-drawer__en">Recruit</span><span class="ad-drawer__ja">Your hiring info here</span></a></li>
        <li><a class="ad-drawer__subbrand" href="index.html#subbrand">${subbrand}${icon("is-out")}</a></li>
      </ul>
    </div>
    <div class="ad-overlay"></div>`;

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  foot.classList.add("ad-foot");
  foot.id = "contact";
  foot.innerHTML = `
    <div class="ad-foot__bg"><div class="wf-img wf-video" data-label="Black-and-white video · office portrait shots cut together · window backlight · full-screen 16:9 · 38s loop"><video class="ad-foot__video ad-video" data-src="media/hero.webm" muted loop playsinline preload="none" aria-hidden="true"></video></div></div>
    <div class="ad-foot__cta" data-slot="footer-cta">
      <div class="ad-foot__col">
        <div class="ad-heading" data-pulse><p class="ad-heading__en" data-pulse-child>Contact</p><p class="ad-heading__ja" data-pulse-child>Your inquiry here</p></div>
        <div class="ad-foot__colBody">
          <p class="ad-foot__colTxt t-body">Your one line of contact info here.<br>One line leading into the button.</p>
          <div class="ad-btn is-black"><a href="#contact"><p>Contact us here</p>${icon()}</a></div>
        </div>
      </div>
      <div class="ad-foot__col">
        <div class="ad-heading" data-pulse><p class="ad-heading__en" data-pulse-child>Recruit</p><p class="ad-heading__ja" data-pulse-child>Your hiring notice here</p></div>
        <div class="ad-foot__colBody">
          <p class="ad-foot__colTxt t-body">Your one line saying you are looking for people to join.<br>Your one line: see roles and guidelines here.</p>
          <div class="ad-btn is-black"><a href="recruit.html"><p>Your job listings here</p>${icon()}</a></div>
        </div>
      </div>
    </div>
    <div class="ad-foot__inner">
      <div class="ad-foot__top">
        <div class="ad-foot__info t-ui">
          <p class="ad-foot__name">Your company name here</p>
          <p class="ad-foot__addr t-body">Postal code 000-0000<br>Your address line 1, 00-00 here<br>Your building name, floor 00 here</p>
        </div>
        <nav class="ad-foot__map" aria-label="Foot menu">
          <ul class="ad-foot__mapCol">
            <li><a class="ad-foot__link" href="index.html">Your home here</a></li>
            <li><a class="ad-foot__link" href="about.html">Your company intro here</a></li>
            <li><a class="ad-foot__link" href="list.html">Your track record here</a></li>
          </ul>
          <ul class="ad-foot__mapCol">
            <li class="ad-foot__accItem">
              <a class="ad-foot__link ad-foot__acc" href="service.html">Your business details here<span class="ad-foot__accIcon" aria-hidden="true"></span></a>
              <div class="ad-foot__subWrap"><ul class="ad-foot__subs">
                <li class="mq-sp"><a href="service.html">Your business details start here</a></li>
                ${services.map((s, i) => `<li><a href="service.html#s${i + 1}">${s}</a></li>`).join("")}
              </ul></div>
            </li>
          </ul>
          <ul class="ad-foot__mapCol">
            <li><a class="ad-foot__link" href="news.html">Your news here</a></li>
            <li><a class="ad-foot__link" href="recruit.html">Your hiring info here</a></li>
          </ul>
          <ul class="ad-foot__mapCol">
            <li class="is-last"><a class="ad-foot__link" href="#contact">Your inquiry here</a></li>
            <li><a class="ad-foot__subbrand" href="index.html#subbrand">${subbrand}${icon("is-out")}</a></li>
            <li class="ad-foot__privacy"><a href="#">Privacy policy here</a></li>
          </ul>
        </nav>
      </div>
      <div class="ad-foot__bottom">
        <div class="ad-foot__mark" data-burst data-slot="footer-wordmark" role="img" aria-label="Wordmark">${wordmark()}</div>
        <div class="ad-foot__copy"><p>© 0000 Your company name in English here. All Rights Reserved.</p><a href="#">Privacy policy here</a></div>
      </div>
    </div>`;

  // ── Smooth scroll (PC only) ──
  if (!reduced && !isSP() && window.Lenis) {
    const lenis = (AD.lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  AD.scrollTo = (target) => (AD.lenis ? AD.lenis.scrollTo(target) : (typeof target === "number" ? scrollTo(0, target) : target.scrollIntoView()));

  // ── Dropdown and drawer ──
  const serviceItem = head.querySelector(".ad-nav__item--service");
  const serviceBtn = serviceItem.querySelector("button");
  const pull = serviceItem.querySelector(".ad-pull");
  const drawer = head.querySelector(".ad-drawer");
  const burger = head.querySelector(".ad-burger");
  const overlay = head.querySelector(".ad-overlay");
  let pullTimer;
  const setPull = (open) => {
    pull.classList.toggle("is-show", open);
    pull.setAttribute("aria-hidden", String(!open));
    serviceBtn.setAttribute("aria-expanded", String(open));
  };
  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    drawer.inert = !open; // Like the original, hiding is done with inert — it stays in place transparent, then opens
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    overlay.classList.toggle("is-show", open);
    document.body.classList.toggle("is-menuLock", open);
    if (open) setPull(false);
    AD.lenis && (open ? AD.lenis.stop() : AD.lenis.start());
  };
  AD.closeMenus = () => { setPull(false); setDrawer(false); };
  serviceItem.addEventListener("pointerenter", () => { if (!isSP()) { clearTimeout(pullTimer); setPull(true); } });
  serviceItem.addEventListener("pointerleave", () => { if (!isSP()) pullTimer = setTimeout(() => setPull(false), 300); });
  // The original also goes to the business page on press — the dropdown opens only on hover or focus
  serviceBtn.addEventListener("click", () => (swup ? swup.navigate(serviceBtn.dataset.spHref) : go(serviceBtn.dataset.spHref)));
  serviceItem.addEventListener("focusin", () => !isSP() && setPull(true));
  serviceItem.addEventListener("focusout", (e) => !serviceItem.contains(e.relatedTarget) && setPull(false));
  burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
  overlay.addEventListener("click", () => setDrawer(false));
  addEventListener("keydown", (e) => e.key === "Escape" && AD.closeMenus());
  drawer.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => setDrawer(false)));

  // Footer accordion (phone) — original height .4s cubic-bezier(.4,.4,0,1)
  const accItem = foot.querySelector(".ad-foot__accItem");
  const accWrap = accItem.querySelector(".ad-foot__subWrap");
  accItem.querySelector(".ad-foot__acc").addEventListener("click", (e) => {
    if (!isSP()) return;
    e.preventDefault();
    const open = !accItem.classList.contains("is-on");
    accItem.classList.toggle("is-on", open);
    accWrap.style.height = open ? accWrap.scrollHeight + "px" : "0px";
  });

  // Logo color: Home starts with white text and turns ink color over bright panels, other pages start ink color and turn white over the footer
  const logo = head.querySelector(".ad-logo");
  const logoMargin = () => { const r = logo.getBoundingClientRect(), mid = r.top + r.height / 2; return `-${mid}px 0px -${innerHeight - mid - 1}px 0px`; };
  const watchLogo = () => {
    if (isSP()) return;
    new IntersectionObserver((es) => es.forEach((e) => logo.classList.toggle("is-onDark", e.isIntersecting)), { rootMargin: logoMargin() }).observe(foot);
  };
  const watchLights = (main) => {
    logo.classList.remove("is-onLight");
    const lights = main.querySelectorAll("[data-logo-light]");
    if (isSP() || !lights.length) return;
    const lit = new Set();
    const io = AD.observe(new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? lit.add(e.target) : lit.delete(e.target)));
      logo.classList.toggle("is-onLight", lit.size > 0);
    }, { rootMargin: logoMargin() }));
    lights.forEach((el) => io.observe(el));
  };

  // ── Entrance ──
  const PULSE = [
    { opacity: 0.5, filter: "blur(10px)", offset: 0, easing: "linear" },
    { opacity: 0.5, filter: "blur(10px)", offset: 0.044, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    { opacity: 1, filter: "blur(0px)", offset: 0.08, easing: "cubic-bezier(0.37, 0, 0.63, 1)" },
    { opacity: 0.92, filter: "blur(2px)", offset: 0.115, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    { opacity: 1, filter: "blur(0px)", offset: 1 },
  ];
  const BURST = [
    { opacity: 0, filter: "blur(10px)", transform: "scale(0.98)", offset: 0, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    { opacity: 1, filter: "blur(0px)", transform: "scale(1.01)", offset: 0.5, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
    { opacity: 1, filter: "blur(0px)", transform: "scale(1)", offset: 1 },
  ];
  const FLICK = [
    { opacity: 1, filter: "blur(0px)", offset: 0, easing: "cubic-bezier(0.55, 0.085, 0.68, 0.53)" },
    { opacity: 0.6, filter: "blur(4px)", offset: 0.5625, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    { opacity: 1, filter: "blur(0px)", offset: 1 },
  ];
  const NUDGE = [
    { "--icon-x": "0px", offset: 0, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    { "--icon-x": "5px", offset: 0.114, easing: "cubic-bezier(0.37, 0, 0.63, 1)" },
    { "--icon-x": "3px", offset: 0.229, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    { "--icon-x": "0px", offset: 1 },
  ];
  const pulse = (el, delay = 0) => el.animate(PULSE, { duration: 2260, delay, fill: "both" });
  AD.pulse = pulse;
  AD.flick = (el) => el && el.animate(FLICK, { duration: 320 });
  AD.nudge = (el) => el && !el.getAnimations().some((a) => a.playState === "running") && el.animate(NUDGE, { duration: 700 });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pulseIO = () => new IntersectionObserver((es, io) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const kids = e.target.matches("[data-pulse-self]") ? [e.target] : [...e.target.querySelectorAll("[data-pulse-child]")];
      kids.forEach((k, i) => pulse(k, 150 * i));
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });
    AD.observePulse = (root, keep) => { const io = keep ? pulseIO() : AD.observe(pulseIO()); root.querySelectorAll("[data-pulse], [data-pulse-self]").forEach((el) => io.observe(el)); };

    const burst = foot.querySelector("[data-burst]");
    gsap.set(burst, { opacity: 0, filter: "blur(10px)", scale: 0.98 });
    const bio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gsap.set(burst, { clearProps: "all" });
      burst.animate(BURST, { duration: 900, fill: "both" });
      bio.disconnect();
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });
    bio.observe(burst);

    // Peel (original data-peel): while the section top rises from the screen bottom to the 60% point, cubic out
    const mix = (a, b, t) => a + (b - a) * t;
    AD.peel = (root) => {
      const peels = [...root.querySelectorAll("[data-peel]")];
      const peel = () => peels.forEach((el) => {
        const h = innerHeight;
        const s = Math.max(0, Math.min(1, (h - el.getBoundingClientRect().top) / (h - 0.6 * h)));
        const r = 1 - Math.pow(1 - s, 3);
        if (r >= 0.999) { el.style.transform = el.style.filter = el.style.opacity = ""; return; }
        el.style.transform = `translate3d(0,0,0) scale(${mix(0.94, 1, r)})`;
        el.style.filter = `blur(${mix(8, 0, r)}px) brightness(${mix(0.75, 1, r)})`;
        el.style.opacity = String(mix(0.35, 1, r));
      });
      peels.forEach((el) => (el.style.transformOrigin = "center top"));
      if (peels.length) { ScrollTrigger.create({ start: 0, end: "max", onUpdate: peel }); peel(); }
    };

    // Hover: text flicker and diamond push
    const hoverNudge = [[".ad-btn a", "p"], [".ad-next", null], [".ad-news", null], [".ad-case", null], [".ad-sdetail", null], [".ad-position", null], [".ad-page__next", "span"], [".ad-nav__sub", ".ad-subbrand"], [".ad-drawer__subbrand", ".ad-subbrand"], [".ad-foot__subbrand", ".ad-subbrand"], [".home-svc__catch", "p"]];
    const hoverFlick = [[".home-fv__news a", ".home-fv__date, .home-fv__ttl"], [".ad-filter a", "span"], [".ad-cat a", "span"], [".ad-page a:not(.ad-page__next)", null], [".ad-nav__link", "span, .ad-icon"], [".ad-cta a", "span"], [".ad-pull__ttl", null], [".ad-pull li a", null], [".ad-drawer__link", "span"], [".ad-drawer__sub a", null], [".ad-foot__link", null], [".ad-foot__subs a", null], [".ad-foot__copy a", null], [".ad-crumb a", null]];
    AD.bindHover = (scope = document) => {
      hoverNudge.forEach(([sel, txt]) => scope.querySelectorAll(sel).forEach((el) => {
        if (el.dataset.hv) return;
        el.dataset.hv = 1;
        el.addEventListener("pointerenter", () => { if (txt) AD.flick(el.querySelector(txt)); AD.nudge(el.querySelector(".ad-icon")); });
      }));
      hoverFlick.forEach(([sel, txt]) => scope.querySelectorAll(sel).forEach((el) => {
        if (el.dataset.hv) return;
        el.dataset.hv = 1;
        el.addEventListener("pointerenter", () => (txt ? el.querySelectorAll(txt) : [el]).forEach((t) => t.animate(FLICK, { duration: 320 })));
      }));
    };
    return () => {};
  });

  // ── Page Turn ──
  // On http it uses swup (parallel) like the original: while the old body slides up 100% in place · blur 6 · .85 and leaves, the new body starts from 8% below · .82 scale · blur 12 · brightness .5
  // Stands in 1.5s cubic-bezier(.75,0,.2,1). Opened as a file, fetch is blocked so swup cannot run, so the old body is pushed up before moving on and only the entrance in the new page uses the same values.
  const EASE = "cubic-bezier(0.75, 0, 0.2, 1)";
  const LIFT = [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0.85, filter: "blur(6px)" }];
  const RISE = [{ transform: "translateY(8%) scale(0.82)", filter: "blur(12px) brightness(0.5)", opacity: 0.6 }, { transform: "translateY(0) scale(1)", filter: "blur(0px) brightness(1)", opacity: 1 }];
  const BUMP = [{ transform: "scale(1)", offset: 0, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }, { transform: "scale(0.96)", offset: 0.114, easing: "cubic-bezier(0.37, 0, 0.63, 1)" }, { transform: "scale(0.98)", offset: 0.229, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }, { transform: "scale(1)", offset: 1 }];
  const VEIL = [{ opacity: 0, offset: 0, easing: "cubic-bezier(0.55, 0.085, 0.68, 0.53)" }, { opacity: 0.4, offset: 0.5, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }, { opacity: 0, offset: 1 }];
  const veil = document.createElement("div");
  veil.className = "ad-veil";
  veil.setAttribute("aria-hidden", "true");
  document.body.append(veil);
  const menusOpen = () => drawer.classList.contains("is-open") || pull.classList.contains("is-show");

  const mainOf = () => document.querySelector("main:not(.is-previous-container)");
  const mountPage = (main) => {
    scope = { cleanups: [] };
    scope.ctx = gsap.context(() => {
      AD.observePulse && AD.observePulse(main);
      AD.bindHover && AD.bindHover(main);
      AD.peel && AD.peel(main);
      watchLights(main);
      pages[main.dataset.page]?.(main);
    });
  };
  const unmountPage = () => {
    if (!scope) return;
    scope.cleanups.forEach((f) => f());
    scope.ctx.revert();
    scope = null;
  };

  let swup = null;
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup || !window.SwupParallelPlugin || !window.SwupJsPlugin) return;
    let fromY = 0, footTop = null, bodyBg = "", bgClone = null;
    const resetFoot = () => {
      if (footTop === null) return;
      foot.getAnimations().forEach((a) => a.cancel());
      ["position", "left", "width", "top", "margin", "zIndex", "visibility"].forEach((k) => (foot.style[k] = ""));
      footTop = null;
    };
    const enterIn = (done) => {
      const prev = document.querySelector("main.is-previous-container"), next = mainOf();
      if (reduced || !prev || !next) { resetFoot(); done(); return; }
      prev.style.top = `${-fromY}px`;
      prev.style.height = `calc(100vh + ${fromY}px)`;
      if (bodyBg) prev.style.backgroundColor = bodyBg;
      if (bgClone) { prev.prepend(bgClone); bgClone = null; }
      const opt = { duration: 1500, easing: EASE, fill: "both" };
      prev.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], opt);
      if (footTop !== null) {
        const h = prev.getBoundingClientRect().height;
        Object.assign(foot.style, { position: "fixed", left: "0", width: "100%", top: `${footTop}px`, margin: "0", zIndex: "32", visibility: "visible" });
        foot.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-h}px)` }], opt);
        foot.animate(LIFT, opt);
      }
      prev.animate(LIFT, opt);
      prev.animate(BUMP, { duration: 700, composite: "add", fill: "both" });
      const rise = next.animate(RISE, opt);
      veil.animate(VEIL, { duration: 1500, fill: "both" });
      rise.finished.then(() => { next.getAnimations().forEach((a) => a.cancel()); resetFoot(); AD.lenis?.resize(); done(); }).catch(() => { resetFoot(); done(); });
    };
    const plugins = [new SwupParallelPlugin({ containers: ["main"] }), new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)", out: (done) => done(), in: enterIn }] })];
    if (window.SwupHeadPlugin) plugins.unshift(new SwupHeadPlugin({ persistAssets: true, awaitAssets: true }));
    if (window.SwupBodyClassPlugin) plugins.unshift(new SwupBodyClassPlugin());
    if (window.SwupPreloadPlugin) plugins.unshift(new SwupPreloadPlugin());
    if (window.SwupA11yPlugin) plugins.unshift(new SwupA11yPlugin());
    history.scrollRestoration = "manual";
    swup = new Swup({
      containers: ["main"],
      animationSelector: false,
      animateHistoryBrowsing: true,
      plugins,
      // In-page # links scroll with Lenis, and links with an empty # do nothing
      ignoreVisit: (url, { el } = {}) => {
        const a = el?.closest("a[href]");
        if (!a) return false;
        if (a.getAttribute("href") === "#" || a.closest("[data-no-swup]")) return true;
        const u = new URL(a.href, location.href);
        return !!u.hash && u.pathname === location.pathname;
      },
    });
    swup.hooks.on("visit:start", async () => {
      fromY = scrollY;
      const r = foot.getBoundingClientRect();
      footTop = r.top < innerHeight && r.bottom > 0 ? r.top : null;
      const opening = menusOpen();
      AD.closeMenus();
      bodyBg = getComputedStyle(document.body).backgroundColor;
      const bg = document.querySelector(".wrapper > .ad-bg");
      bgClone = bg && getComputedStyle(bg).display !== "none" ? Object.assign(bg.cloneNode(true), { className: "ad-bg ad-bg--clone" }) : null;
      if (opening) await new Promise((r) => setTimeout(r, 600));
    });
    swup.hooks.on("content:replace", () => { unmountPage(); mountPage(mainOf()); });
    swup.hooks.on("content:scroll", (visit) => {
      const t = visit.scroll?.target || (location.hash && document.getElementById(location.hash.slice(1)));
      AD.lenis?.scrollTo(t || 0, { immediate: true, force: true });
    });
    swup.hooks.on("visit:end", () => { ScrollTrigger.refresh(); AD.lenis?.resize(); });
  };

  let leaving = false;
  const go = (href) => {
    if (leaving) return;
    if (reduced) { location.href = href; return; }
    leaving = true;
    const opening = menusOpen();
    AD.closeMenus();
    setTimeout(() => {
      root.classList.add("is-leaving");
      const main = mainOf();
      const footVisible = foot.getBoundingClientRect().top < innerHeight;
      const lift = [{ transform: "translateY(0)", ...LIFT[0] }, { transform: `translateY(${-innerHeight}px)`, ...LIFT[1] }];
      const opt = { duration: 900, easing: "cubic-bezier(0.75, 0, 1, 1)", fill: "forwards" };
      main.animate(lift, opt);
      if (footVisible) foot.animate(lift, opt);
      main.animate(BUMP, { duration: 700, composite: "add" });
      veil.animate([{ opacity: 0 }, { opacity: 0.4 }], { duration: 900, easing: "cubic-bezier(0.55, 0.085, 0.68, 0.53)", fill: "forwards" })
        .finished.then(() => {
          sessionStorage.setItem("ad-enter", "1");
          location.href = href;
        });
    }, opening ? 600 : 0);
  };
  AD.go = go;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (href.startsWith("#")) {
      if (href === "#") { e.preventDefault(); return; }
      const t = document.getElementById(href.slice(1));
      if (t) { e.preventDefault(); AD.closeMenus(); AD.scrollTo(t); }
      return;
    }
    if (!/\.html(#.*)?$/.test(href)) return;
    const [file, hash] = href.split("#");
    if (file === location.pathname.split("/").pop() && hash) {
      const t = document.getElementById(hash);
      if (t) { e.preventDefault(); AD.closeMenus(); AD.scrollTo(t); }
      return;
    }
    if (swup) return;
    e.preventDefault();
    go(href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  const enter = () => {
    if (reduced || sessionStorage.getItem("ad-enter") !== "1") return;
    sessionStorage.removeItem("ad-enter");
    const main = mainOf();
    main.style.transformOrigin = "50% 50vh";
    main.animate(RISE, { duration: 1500, easing: EASE }).finished.then(() => (main.style.transformOrigin = ""));
    veil.animate([{ opacity: 0.4 }, { opacity: 0 }], { duration: 1500, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" });
  };

  // Video loads late like the original (data-src → preload auto · play). Footer video starts 200px before entering the screen
  AD.loadVideo = (v) => { const s = v?.dataset.src; if (!s) return; delete v.dataset.src; v.preload = "auto"; v.src = s; v.play().catch(() => {}); };
  const footVideo = foot.querySelector(".ad-foot__video");
  new IntersectionObserver((es, io) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); AD.loadVideo(footVideo); } }, { rootMargin: "200px" }).observe(footVideo);

  addEventListener("DOMContentLoaded", () => {
    AD.observePulse && AD.observePulse(foot, true);
    AD.bindHover && AD.bindHover(document);
    mountPage(mainOf());
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); t && requestAnimationFrame(() => t.scrollIntoView()); }
    watchLogo();
    enter();
    bootSwup();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => ScrollTrigger.refresh());
  });
})();
