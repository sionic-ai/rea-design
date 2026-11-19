// Shared by all pages: draws the header · Join Us · footer, and sets up Lenis (same options as original 1.3.18) · header color change · phone menu ·
// Sets up the appearances (text 14px·2s, photo blur 14px·1.2s, card 24px·1.5s), photo parallax 3%, stacking cards and ribbon pattern.
(() => {
  const arrow = '<svg viewBox="0 0 7 6" aria-hidden="true"><path d="M0 0l7 3-7 3 1.6-3z"/></svg>';
  const pages = [
    { href: "about.html", en: "Our Vision", ja: "What the company aims for" },
    { href: "service.html", en: "Our Works", ja: "Work and Results" },
    { href: "recruit.html", en: "Our Members", ja: "Employees making an impact" },
    { href: "detail.html#job", en: "Recruit", ja: "Hiring Info" },
  ];
  const slide = (cls, text) => `<span class="ck-slide__clip ${cls}"><span class="ck-slide__in" data-text="${text}">${text}</span></span>`;
  const sns = ["Oil", "Person", "Tick"].map((t) => `<a class="ck-follow__icon" href="#" aria-label="SNS ${t}"><svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5"/></svg></a>`).join("");
  const logo = '<span class="ck-logo"><span class="ck-logo__mark">Toward</span><span class="ck-logo__word">logo</span></span>';

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("ck-header");
    header.innerHTML = `<div class="ck-header__inner">
      <a class="ck-header__logo" href="index.html">${logo}<span class="ck-header__tag">RECRUITING SITE</span></a>
      <nav class="ck-header__nav" id="ck-menu" aria-hidden="false"><div class="ck-header__scroll" data-lenis-prevent>
        <ul class="ck-header__items">${pages.map((p) => `<li class="ck-header__item"><a class="ck-header__link ck-slide" href="${p.href}">${slide("ck-header__en", p.en)}${slide("ck-header__ja", p.ja)}<svg class="ck-header__arrow" viewBox="0 0 11 10" fill="none" stroke="currentColor"><path d="M0 5h10M6 1l4 4-4 4"/></svg></a></li>`).join("")}
          <li class="ck-header__entryItem"><a class="ck-header__link ck-slide" href="#entry">${slide("ck-header__en", "Entry")}${slide("ck-header__ja", "Entry")}<svg class="ck-header__arrow" viewBox="0 0 11 10" fill="none" stroke="currentColor"><path d="M0 5h10M6 1l4 4-4 4"/></svg></a></li></ul>
        <div class="ck-header__follow"><div class="ck-follow"><p class="ck-follow__title">Follow us</p>${sns}</div></div>
      </div></nav>
      <div class="ck-header__actions"><a class="ck-entry" href="#entry">ENTRY</a><button class="ck-menuBtn" type="button" aria-label="Menu" aria-controls="ck-menu" aria-expanded="false"><span class="ck-menuBtn__in"></span></button></div>
    </div>`;
  }

  const cta = document.querySelector("[data-slot=footer-cta]");
  if (cta) {
    cta.classList.add("ck-cta");
    cta.dataset.headerTheme = "light";
    cta.innerHTML = `<div class="ck-ribbon" data-ribbon="cta" style="inset:-10% -5% -10% 20%"></div><div class="ck-wrap">
      <h2 class="ck-cta__head"><span class="ck-cta__en">Join Us</span><span class="ck-cta__ja">Let’s turn results into value here.</span></h2>
      <div class="ck-cta__row">
        <a class="ck-cta__btn is-light" href="detail.html#job"><span class="ck-cta__btnEn">Job description</span><span class="ck-cta__btnJa">View admissions guidelines</span><span class="ck-cta__icon">${arrow}</span></a>
        <a class="ck-cta__btn is-green" id="entry" href="#entry"><span class="ck-cta__btnEn">Entry</span><span class="ck-cta__btnJa">Enter here</span><span class="ck-cta__icon">${arrow}</span></a>
      </div></div>`;
  }

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.classList.add("ck-footer");
    const cols = [[pages[0], { href: "detail.html#job", ja: "Hiring Info" }], [pages[1], { href: "#entry", ja: "Entry" }], [pages[2], { href: "index.html#faq", ja: "Frequently asked questions" }, { href: "#", ja: "Company overview" }]];
    footer.innerHTML = `<div class="ck-wrap"><div class="ck-footer__box">
      <div class="ck-footer__details"><a href="index.html">${logo}</a>
        <p class="ck-footer__address">〒000-0000 Your address line 1 here 0-0-0<br>Your building name 0F here<br>TEL: 000-0000-0000 (Business hours 10:00-18:00)</p>
        <a class="ck-footer__corp" href="#"><span class="ck-footer__corpEn">Corporate site</span><span class="ck-footer__corpJa">Visit the company site here</span><svg class="ck-footer__corpIcon" viewBox="0 0 14 14" fill="none" stroke="currentColor"><rect x="1" y="4" width="9" height="9"/><path d="M4 1h9v9"/></svg></a></div>
      <div class="ck-footer__nav"><div class="ck-footer__cols">${cols.map((c) => `<div class="ck-footer__col">${c.map((l) => `<a class="ck-footer__link" href="${l.href}">${l.ja}</a>`).join("")}</div>`).join("")}</div>
        <div class="ck-footer__sub"><a href="#">Privacy policy</a><div class="ck-follow"><p class="ck-follow__title">Follow us</p>${sns}</div></div></div>
      </div><p class="ck-footer__copy">© Company Co.,Ltd</p></div>`;
  }

  // Ribbon pattern — draw dozens of thin lines along the center line and flip the band width with cos to make a twist (stands in for the original decorative image)
  const ribbonShapes = {
    a: { pts: [[0.05, 0.9], [0.35, 0.95], [0.45, 0.1], [0.95, 0.15]], w: 0.16, twist: 1.5 },
    b: { pts: [[0.1, 0.05], [0.25, 0.5], [0.7, 0.2], [0.9, 0.95]], w: 0.12, twist: 2 },
    c: { pts: [[0.0, 0.6], [0.3, 0.1], [0.6, 1.0], [1.0, 0.3]], w: 0.18, twist: 1 },
    cta: { pts: [[0.0, 0.8], [0.3, 0.0], [0.65, 1.1], [1.0, 0.2]], w: 0.3, twist: 2.5 },
  };
  const bez = (p, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
  document.querySelectorAll("[data-ribbon]").forEach((el, n) => {
    const shape = ribbonShapes[el.dataset.ribbon] || ribbonShapes.a, W = 1000, H = 1000, lines = 64, steps = 48, id = "ck-rib-" + n;
    let paths = "";
    for (let i = 0; i < lines; i++) {
      const f = i / (lines - 1) - 0.5;
      let d = "";
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, [x, y] = bez(shape.pts, t), [x2, y2] = bez(shape.pts, Math.min(1, t + 0.01)), [x0, y0] = bez(shape.pts, Math.max(0, t - 0.01));
        const dx = x2 - x0, dy = y2 - y0, len = Math.hypot(dx, dy) || 1, w = shape.w * Math.cos(t * Math.PI * shape.twist) * (0.6 + 0.4 * Math.sin(t * Math.PI));
        d += (s ? "L" : "M") + ((x - (dy / len) * w * f) * W).toFixed(1) + " " + ((y + (dx / len) * w * f) * H).toFixed(1);
      }
      paths += `<path d="${d}"/>`;
    }
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--site-ribbon-b)" stop-opacity="0.2"/><stop offset=".55" stop-color="var(--site-ribbon-a)"/><stop offset="1" stop-color="var(--site-ribbon-b)" stop-opacity="0.3"/></linearGradient></defs><g fill="none" stroke="url(#${id})" stroke-width="0.9" vector-effect="non-scaling-stroke">${paths}</g></svg>`;
  });

  // Below width 360 it is scaled down to the 360 layout (original viewport fix)
  const vp = document.querySelector('meta[name="viewport"]');
  const fitVp = () => { const c = innerWidth > 360 ? "width=device-width,initial-scale=1" : "width=360"; vp && vp.getAttribute("content") !== c && vp.setAttribute("content", c); };
  addEventListener("resize", fitVp); fitVp();

  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, smoothTouch: false, touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    window.lenis = lenis;
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const h = a.getAttribute("href"), t = h && h !== "#" && document.querySelector(h);
      if (t) { e.preventDefault(); lenis.scrollTo(t, { onComplete: syncTheme }); }
    }));
  }

  // Header color — data-header-theme of the section touching the top of the screen (dark means white text)
  const head = document.querySelector(".ck-header");
  const startTheme = () => (head?.classList.contains("is-top") || document.body.dataset.headerStart === "dark" ? "dark" : "light");
  const setTheme = (t) => { if (!head) return; if (matchMedia("(max-width: 896px)").matches && head.classList.contains("is-open")) t = "dark"; head.classList.toggle("is-dark", t === "dark"); };
  const zones = [...document.querySelectorAll("[data-header-theme]")];
  function syncTheme() {
    if (!zones.length) return setTheme(startTheme());
    const on = zones.filter((z) => { const r = z.getBoundingClientRect(); return r.top <= 1 && r.bottom > 1; });
    if (on.length) return setTheme(on[on.length - 1].dataset.headerTheme);
    const above = zones.filter((z) => z.getBoundingClientRect().top <= 1);
    if (above.length) return setTheme(above[above.length - 1].dataset.headerTheme);
    const first = zones.find((z) => { const r = z.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 64; });
    setTheme(first ? first.dataset.headerTheme : startTheme());
  }
  setTheme(startTheme()); syncTheme();
  zones.forEach((z, i) => ScrollTrigger.create({ trigger: z, start: "top top", end: "bottom top", onEnter: () => setTheme(z.dataset.headerTheme), onLeaveBack: () => setTheme(zones[i - 1]?.dataset.headerTheme || startTheme()) }));

  // Phone menu — a green curtain entering from the right in .8s, Lenis paused while open
  if (head) {
    const mq = matchMedia("(max-width: 896px)"), btn = head.querySelector(".ck-menuBtn"), nav = head.querySelector(".ck-header__nav"), scroll = head.querySelector(".ck-header__scroll");
    const open = (on) => {
      if (!mq.matches) { head.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); nav.setAttribute("aria-hidden", "false"); lenis?.start(); syncTheme(); return; }
      head.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", String(on)); nav.setAttribute("aria-hidden", String(!on));
      if (on) { setTheme("dark"); lenis?.stop(); document.documentElement.classList.add("is-menuLock"); } else { lenis?.start(); document.documentElement.classList.remove("is-menuLock"); syncTheme(); }
    };
    open(false);
    // While open, dragging outside the menu panel doesn’t move the page behind (as in the original) — the scroll panel inside the menu still scrolls
    document.addEventListener("touchmove", (e) => { if (mq.matches && head.classList.contains("is-open") && !scroll.contains(e.target)) e.preventDefault(); }, { passive: false });
    btn.addEventListener("click", () => mq.matches && open(!head.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (mq.matches && (e.target === nav || e.target === scroll)) open(false); });
    document.addEventListener("keydown", (e) => { if (mq.matches && e.key === "Escape" && head.classList.contains("is-open")) open(false); });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => mq.matches && open(false)));
    head.querySelector(".ck-entry").addEventListener("click", () => mq.matches && open(false));
    mq.addEventListener("change", () => open(false));
  }

  // Tabs beside the staff list — appear when the staff section spans the screen’s middle 80%, and underline the person currently being read (row at 25~45% of screen)
  document.querySelectorAll(".ck-follownav").forEach((nav) => {
    const toggle = nav.querySelector(".ck-follownav__toggle"), links = [...nav.querySelectorAll(".ck-follownav__link")], zone = nav.parentElement;
    const close = () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", String(nav.classList.toggle("is-open"))));
    nav.querySelector(".ck-follownav__overlay").addEventListener("click", close);
    links.forEach((l) => l.addEventListener("click", close));
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) nav.classList.add("is-visible"); else { nav.classList.remove("is-visible"); close(); } }), { rootMargin: "-10% 0px -10% 0px" }).observe(zone);
    const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-25% 0px -55% 0px" });
    links.forEach((l) => { const t = document.querySelector(l.getAttribute("href")); if (t) spy.observe(t); });
  });

  window.ckShared = { lenis: () => lenis, syncTheme };
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Text line entrance — each sibling line is delayed .08s, and for vertical writing it comes in from 14px to the right. Underlined title lines take 1.5s, the inner text of the others 2s
    document.querySelectorAll(".ck-wipe").forEach((el) => {
      if (el.closest("[data-intro]")) return;
      const sibs = el.parentElement ? [...el.parentElement.children].filter((s) => s.classList.contains("ck-wipe") && getComputedStyle(s).display !== "none") : [];
      const delay = el.dataset.wipeDelay != null ? +el.dataset.wipeDelay : sibs.length > 1 ? Math.max(0, sibs.indexOf(el)) * 0.08 : 0;
      const vert = (getComputedStyle(el).writingMode || "").includes("vertical");
      const tl = gsap.timeline({ delay, defaults: { ease: "power3.out" }, scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } });
      if (el.classList.contains("is-line")) { tl.fromTo(el, { [vert ? "x" : "y"]: 14, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.5 }); return; }
      let inner = el.querySelector(":scope > .ck-wipe__in");
      if (!inner) { inner = document.createElement("span"); inner.className = "ck-wipe__in"; while (el.firstChild) inner.appendChild(el.firstChild); el.appendChild(inner); }
      tl.fromTo(inner, { opacity: 0, x: vert ? 14 : 0, y: vert ? 0 : 14 }, { opacity: 1, x: 0, y: 0, duration: 2 });
    });
    // Photo cell — from blur 14px·brightness 1.15 over 1.2s
    document.querySelectorAll(".ck-imgin").forEach((el) => {
      gsap.fromTo(el, { filter: "blur(14px) brightness(1.15)", opacity: 0 }, { filter: "blur(0px) brightness(1)", opacity: 1, duration: 1.2, delay: +(el.dataset.inviewDelay || 0), ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } });
    });
    // Card — 1.5s from 24px below
    document.querySelectorAll(".ck-fadeup").forEach((el) => {
      gsap.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.5, delay: +(el.dataset.fadeupDelay || 0), ease: "power2.out", clearProps: "transform", scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" } });
    });
    // Photo parallax — scrub while passing through ±3% of the cell height
    document.querySelectorAll(".ck-parallax").forEach((el) => {
      const img = el.querySelector(".ck-parallax__img") || el.firstElementChild;
      if (!img) return;
      gsap.fromTo(img, { y: () => Math.round(el.clientHeight * 0.03) }, { y: () => -Math.round(el.clientHeight * 0.03), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    // Stacking cards — the stuck card goes .9× and transparent until the next card touches it, with blur 8px from the .3 point (scrub .75)
    document.querySelectorAll(".ck-stack").forEach((box) => {
      const items = [...box.querySelectorAll(".ck-stack__item")];
      const top = () => { const v = parseFloat(getComputedStyle(items[0]).top); return Number.isFinite(v) ? v : 100; };
      items.forEach((it, i) => { it.style.zIndex = String(2 + i * 10); gsap.set(it, { transformOrigin: "center top", filter: "blur(0px)" }); });
      items.forEach((it, i) => {
        const next = items[i + 1];
        if (!next) return;
        const at = () => `top ${top()}px`;
        gsap.timeline({ scrollTrigger: { trigger: it, start: at, endTrigger: next, end: at, scrub: 0.75, invalidateOnRefresh: true } })
          .to(it, { scale: 0.9, autoAlpha: 0, ease: "none", duration: 1 }, 0)
          .to(it, { filter: "blur(8px)", ease: "none", duration: 0.6 }, 0.3);
      });
    });
    // Home page wide screen — when the vision section’s top edge touches the top of the screen, nav items rise 10px in sequence at .06s.
    const topNav = document.querySelector(".ck-header.is-top"), vision = document.querySelector("[data-nav-reveal]");
    if (topNav && vision && matchMedia("(min-width: 897px)").matches) {
      const items = topNav.querySelectorAll(".ck-header__item");
      gsap.set(items, { opacity: 0, y: 10, visibility: "hidden", pointerEvents: "none" });
      gsap.timeline({ scrollTrigger: { trigger: vision, start: "top top", toggleActions: "play none none reverse" }, onStart: () => gsap.set(items, { visibility: "visible", pointerEvents: "auto" }), onReverseComplete: () => gsap.set(items, { visibility: "hidden", pointerEvents: "none" }) })
        .to(items, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".ck-header.is-top .ck-header__item").forEach((i) => gsap.set(i, { opacity: 1, y: 0, visibility: "visible", pointerEvents: "auto" }));
  });

  // Infinite text strip — Splide AutoScroll (original speed .5 · .7 px/frame)
  if (window.Splide && window.splide?.Extensions) {
    document.querySelectorAll(".ck-infinite").forEach((el) => {
      new Splide(el, { type: "loop", drag: false, focus: "center", arrows: false, pagination: false, autoWidth: true, gap: "0.2em", autoScroll: { speed: reduce ? 0 : +(el.dataset.speed || 0.5), pauseOnHover: false } }).mount(window.splide.Extensions);
    });
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
