// Shared by all pages: Lenis · Barba transitions · loader · menu (pill chain, dropdown, hamburger, color change following light/dark sections) · line rise · parallax · footer parallax.
// Per-page choreography is PB.page("<namespace>", { init, destroy }) attached — the transition library swaps only the body, so every page loads the script.
(() => {
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, Flip);
  history.scrollRestoration = "manual";
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  CustomEase.create("parallax", "0.7, 0.05, 0.13, 1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });

  const rmq = matchMedia("(prefers-reduced-motion: reduce)");
  const PB = (window.PB = {
    reduce: rmq.matches,
    lenis: null,
    pages: {},
    splits: [],
    cleanups: [],
    page(ns, def) { this.pages[ns] = def; },
    // While the page-transition library swaps pages, clear leftover ScrollTrigger and listeners all at once
    onLeave(fn) { this.cleanups.push(fn); },
    // Color variables as rgb 0~1 — the canvas also resolves color-mix·oklch
    rgb(name, el = root) {
      const v = getComputedStyle(el).getPropertyValue(name).trim() || name;
      const probe = PB._probe || (PB._probe = document.createElement("span"));
      if (!probe.isConnected) { probe.style.display = "none"; document.body.append(probe); }
      probe.style.color = v.startsWith("--") ? `var(${v})` : v;
      const c = PB._cv || (PB._cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true }));
      c.clearRect(0, 0, 1, 1);
      c.fillStyle = getComputedStyle(probe).color;
      c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
    },
    lines(el, type = "lines") {
      const s = SplitText.create(el, { type, mask: "lines", linesClass: "split-line" });
      PB.splits.push(s);
      el.classList.add("is-split");
      return s;
    },
  });
  rmq.addEventListener?.("change", (e) => (PB.reduce = e.matches));

  // ---------- Lenis ----------
  function initLenis() {
    if (PB.lenis || !window.Lenis || PB.reduce) return;
    PB.lenis = new Lenis({ lerp: 0.05, wheelMultiplier: 1.2 });
    window.lenis = PB.lenis;
    PB.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => PB.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  PB.scrollTo = (target, opts = {}) => {
    if (PB.lenis) PB.lenis.scrollTo(target, { duration: PB.reduce ? 0 : 1.2, easing: gsap.parseEase("osmo"), lock: true, ...opts });
    else (typeof target === "number" ? scrollTo(0, target) : target.scrollIntoView());
  };

  // ---------- Menu ----------
  const nav = document.querySelector(".pb-nav");
  // A chain of pills joined by concave necks — measures the link positions and draws one single path
  function drawChain() {
    const chain = nav?.querySelector(".pb-chain");
    if (!chain) return;
    const svg = chain.querySelector(".pb-chain__svg path");
    const items = [...chain.querySelectorAll(":scope > .pb-link, :scope > .pb-drop")];
    if (!svg || !items.length || getComputedStyle(chain).flexDirection === "column") return;
    const base = chain.getBoundingClientRect();
    const H = base.height, r = H / 2, neck = H * 0.2;
    const box = items.map((el) => { const b = el.getBoundingClientRect(); return [b.left - base.left, b.right - base.left]; });
    let top = `M${box[0][0] + r},0`, bot = "";
    box.forEach(([a, b], i) => {
      top += ` L${b - r},0`;
      const nx = box[i + 1];
      if (nx) {
        const mid = (b + nx[0]) / 2, k = r * 0.55;
        top += ` C${b - r + k},0 ${mid - r * 0.45},${r - neck} ${mid},${r - neck} C${mid + r * 0.45},${r - neck} ${nx[0] + r - k},0 ${nx[0] + r},0`;
      }
    });
    const last = box[box.length - 1];
    top += ` A${r},${r} 0 0 1 ${last[1] - r},${H}`;
    for (let i = box.length - 1; i >= 0; i--) {
      const [a] = box[i];
      bot += ` L${a + r},${H}`;
      const pv = box[i - 1];
      if (pv) {
        const mid = (pv[1] + a) / 2, k = r * 0.55;
        bot += ` C${a + r - k},${H} ${mid + r * 0.45},${r + neck} ${mid},${r + neck} C${mid - r * 0.45},${r + neck} ${pv[1] - r + k},${H} ${pv[1] - r},${H}`;
      }
    }
    bot += ` A${r},${r} 0 0 1 ${box[0][0] + r},0 Z`;
    svg.setAttribute("d", top + bot);
    chain.querySelector(".pb-chain__svg").setAttribute("viewBox", `0 0 ${base.width} ${H}`);
  }
  function initNavMenu() {
    if (!nav) return;
    const drop = nav.querySelector(".pb-drop");
    const trigger = drop?.querySelector(".pb-link");
    const burger = nav.querySelector(".pb-burger");
    const canHover = matchMedia("(hover: hover)").matches;
    let timer;
    const chain = nav.querySelector(".pb-chain");
    let closing;
    // Original: after the dropdown has fully closed (.25s later) the neighboring pills return from blur
    const setDrop = (open) => {
      if (!open && drop?.classList.contains("is-open")) { chain?.classList.add("is-closing"); clearTimeout(closing); closing = setTimeout(() => chain?.classList.remove("is-closing"), 600); }
      drop?.classList.toggle("is-open", open);
      trigger?.setAttribute("aria-expanded", open ? "true" : "false");
    };
    const setMenu = (open) => {
      nav.classList.toggle("is-menu-open", open);
      burger?.setAttribute("aria-expanded", open ? "true" : "false");
      if (PB.lenis) open ? PB.lenis.stop() : PB.lenis.start();
    };
    drop?.addEventListener("mouseenter", () => { clearTimeout(timer); setDrop(true); });
    drop?.addEventListener("mouseleave", () => { timer = setTimeout(() => setDrop(false), 120); });
    trigger?.addEventListener("click", (e) => { e.preventDefault(); if (!canHover) setDrop(!drop.classList.contains("is-open")); });
    burger?.addEventListener("click", () => setMenu(!nav.classList.contains("is-menu-open")));
    nav.querySelectorAll(".pb-menu a[href]").forEach((a) => a.addEventListener("click", () => nav.classList.contains("is-menu-open") && setMenu(false)));
    document.addEventListener("click", (e) => { if (drop?.classList.contains("is-open") && !drop.contains(e.target)) setDrop(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setDrop(false); setMenu(false); } });
    addEventListener("resize", () => { if (innerWidth >= 992 && nav.classList.contains("is-menu-open")) setMenu(false); drawChain(); });
    document.fonts?.ready.then(drawChain);
    drawChain();
  }
  function markCurrent(ns) {
    nav?.querySelectorAll("[data-ns]").forEach((a) => (a.dataset.ns === ns ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  }
  // While a section’s top edge crosses the 50px line of the screen, switch the menu color to that section’s brightness. Hide the menu when the footer is 85% up
  function initNavTheme(scope) {
    if (!nav) return;
    const secs = [...scope.querySelectorAll("[data-nav]")];
    const active = [];
    const apply = () => { if (active.length) nav.classList.toggle("is-on-light", active[active.length - 1].light); };
    nav.classList.toggle("is-on-light", scope.dataset.pageTheme === "light");
    secs.forEach((el, index) => {
      const item = { el, index, light: el.dataset.nav === "light" };
      const add = () => { active.push(item); active.sort((a, b) => a.index - b.index); apply(); };
      const rm = () => { const i = active.indexOf(item); if (i > -1) active.splice(i, 1); apply(); };
      ScrollTrigger.create({ trigger: el, start: "top 50px", end: "bottom 50px", onEnter: add, onLeave: rm, onEnterBack: add, onLeaveBack: rm });
    });
    const foot = scope.querySelector("[data-footer-container]");
    if (foot) {
      const upd = (self) => nav.classList.toggle("is-hidden", self.progress >= 0.85 && !nav.classList.contains("is-menu-open"));
      ScrollTrigger.create({ trigger: foot, start: "clamp(top bottom)", end: "clamp(top top)", onUpdate: upd, onRefresh: upd, onToggle: upd });
    }
  }

  // ---------- Loader (once on first visit) ----------
  function preloader() {
    const loader = document.querySelector(".pb-loader");
    if (!loader) return null;
    if (PB.reduce) { loader.style.display = "none"; root.classList.add("is-loaded"); return null; }
    const capL = loader.querySelector(".is-left"), capR = loader.querySelector(".is-right");
    const square = loader.querySelector(".pb-loader__square"), circle = loader.querySelector(".pb-loader__circle");
    const d = circle.getBoundingClientRect().width || 30;
    const cover = Math.ceil(Math.hypot(innerWidth, innerHeight) / d) + 4;
    const tl = gsap.timeline({ delay: 0.5, defaults: { ease: "expo.out", duration: 1 } });
    tl.addLabel("texts").to(capL, { top: "50%", yPercent: -50 }, "texts").to(capR, { bottom: "50%", yPercent: 50 }, "texts");
    const a = square.getBoundingClientRect(), b = circle.getBoundingClientRect();
    const half = (b.left + b.width / 2 - (a.left + a.width / 2)) / 2;
    tl.addLabel("shapes", "texts+=0.45")
      .to(square, { x: half, rotation: 90, borderRadius: "50%", duration: 1, ease: "power3.out" }, "shapes")
      .to(circle, { x: -half, duration: 1, ease: "power3.out" }, "shapes")
      .to([capL, capR], { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, "shapes+=0.4");
    tl.to(square, { autoAlpha: 0, duration: 0.2 }, "shapes+=0.8").to(circle, { scale: cover, duration: 0.8, ease: "power4.in" }, "<");
    tl.to(loader, { autoAlpha: 0, duration: 0.35, ease: "power2.out" }).set(loader, { display: "none" }).call(() => root.classList.add("is-loaded"));
    tl.addLabel("heroStart", "-=0.6");
    return tl;
  }

  // ---------- Line rise ----------
  function initScrollReveal(scope) {
    scope.querySelectorAll("[data-split]").forEach((el) => {
      if (el.closest("[data-hero]") || el.closest("[data-split-own]")) return;
      const s = PB.lines(el);
      if (PB.reduce) return;
      gsap.from(s.lines, { yPercent: 110, duration: 0.8, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
  }
  // Subpage header: the line rises over 1.25s and the cover curtain pulls away to the right
  function initHeroIntro(scope) {
    const hero = scope.querySelector("[data-hero]");
    if (!hero) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 0.9 }, paused: true });
    const splits = [...hero.querySelectorAll("[data-split]")];
    splits.forEach((el, i) => {
      const s = PB.lines(el);
      if (!PB.reduce && s.lines.length) tl.from(s.lines, { yPercent: 110, stagger: 0.15, duration: 1.25 }, i ? 0.15 : 0);
    });
    const dot = hero.querySelector('[data-reveal="dot"]'), label = hero.querySelector('[data-reveal="label"]');
    if (!PB.reduce) {
      hero.querySelectorAll(".divider-mask").forEach((m) => tl.to(m, { scaleX: 0, transformOrigin: "right center", duration: 1 }, 0.2));
      hero.querySelectorAll(".image-mask").forEach((m) => tl.to(m, { scaleX: 0, transformOrigin: "right center", duration: 1.1 }, 0.4));
      if (dot) tl.from(dot, { scale: 0, ease: "back.out(3)", duration: 0.6 }, ">-0.5");
      if (label) tl.from(label, { autoAlpha: 0, y: 12, duration: 0.5 }, "<0.1");
    }
    return tl;
  }
  // Vertical parallax — scrub data-parallax-start/end(%) while crossing the screen
  function initParallax(scope) {
    if (PB.reduce) return;
    scope.querySelectorAll("[data-parallax]").forEach((el) => {
      const target = el.querySelector("[data-parallax-target]") || el;
      gsap.fromTo(target, { yPercent: +(el.dataset.parallaxStart ?? 20) }, {
        yPercent: +(el.dataset.parallaxEnd ?? -20), ease: "none",
        scrollTrigger: { trigger: el, start: `clamp(${el.dataset.parallaxScrollStart || "top bottom"})`, end: `clamp(${el.dataset.parallaxScrollEnd || "bottom top"})`, scrub: true },
      });
    });
  }
  // While the footer rises, the previous section follows from -25% and the dark overlay above it clears at .5
  function initFooterParallax(scope) {
    if (PB.reduce) return;
    scope.querySelectorAll("[data-footer-parallax]").forEach((el) => {
      const trig = el.querySelector("[data-footer-container]") || el;
      const inner = el.querySelector("[data-footer-parallax-inner]");
      const dark = el.querySelector("[data-footer-parallax-dark]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: trig, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true, invalidateOnRefresh: true } });
      if (inner) tl.from(inner, { yPercent: -25, ease: "none" }, 0);
      if (dark) tl.from(dark, { opacity: 0.5, ease: "none" }, 0);
    });
  }
  function initGeneric(scope) {
    if (PB.reduce) return;
    scope.querySelectorAll("[data-line-reveal]").forEach((el) => {
      const right = el.dataset.lineReveal === "right";
      gsap.fromTo(el, { clipPath: right ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    scope.querySelectorAll("[data-reveal-fade]").forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: "2.5rem", filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } });
    });
    scope.querySelectorAll("[data-reveal-grid]").forEach((g) => {
      gsap.fromTo(g.children, { opacity: 0, y: 40, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, stagger: 0.11, ease: "power3.out", scrollTrigger: { trigger: g, start: "top 80%" } });
    });
    scope.querySelectorAll("[data-img-scale]").forEach((el) => {
      gsap.fromTo(el, { scale: 1.5 }, { scale: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } });
    });
    scope.querySelectorAll("[data-divider-height]").forEach((el) => {
      gsap.fromTo(el, { height: "0%" }, { height: "100%", duration: 1.5, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 65%" } });
    });
    scope.querySelectorAll("[data-hor-divider]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" } });
    });
    scope.querySelectorAll("[data-bracket-clip]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } });
    });
  }
  scopeClicks();
  function scopeClicks() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-scroll-to]");
      if (!a) return;
      const t = a.dataset.scrollTo === "next" ? a.closest("section")?.nextElementSibling : document.querySelector(a.dataset.scrollTo);
      if (t) { e.preventDefault(); PB.scrollTo(t); }
    });
  }


  // ---------- Contact modal (original initGetInTouchModal) ----------
  function initModal() {
    const modal = document.querySelector("[data-modal]");
    if (!modal) return;
    const panel = modal.querySelector("[data-modal-panel]"), overlay = modal.querySelector("[data-modal-overlay]"), right = modal.querySelector("[data-modal-right]");
    const glCanvas = modal.querySelector("[data-modal-gl]");
    const DUR = 1.2, LAG = 0.25, FROM = "25vh", EASE = "parallax";
    let tl = null, stopGL = null;
    const open = () => {
      if (modal.classList.contains("is-open")) return;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      PB.lenis?.stop();
      if (!stopGL && PB.heroGL) stopGL = PB.heroGL(glCanvas);
      tl?.kill();
      if (PB.reduce) { gsap.set(panel, { y: "0vh" }); gsap.set(overlay, { autoAlpha: 0.8 }); gsap.set(right, { y: "0vh" }); return; }
      tl = gsap.timeline()
        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 0.8, duration: DUR, ease: EASE }, 0)
        .fromTo(panel, { y: "100vh" }, { y: "0vh", duration: DUR, ease: EASE }, 0)
        .fromTo(right, { y: FROM }, { y: "0vh", duration: DUR + LAG, ease: EASE }, 0)
        // Original scene stands at 1.1x on open, turns transparent ~.23s after click (measured 317·318ms on two pages), then floats back up
        .fromTo(glCanvas, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1, ease: EASE, immediateRender: false }, 0.23);
      gsap.set(glCanvas, { scale: 1.1 });
    };
    const close = () => {
      if (!modal.classList.contains("is-open")) return;
      tl?.kill();
      const done = () => { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); gsap.set([panel, overlay, right], { clearProps: "all" }); stopGL?.(); stopGL = null; if (!nav?.classList.contains("is-menu-open")) PB.lenis?.start(); };
      if (PB.reduce) return done();
      tl = gsap.timeline({ onComplete: done })
        .to(panel, { y: "100vh", duration: DUR, ease: EASE }, 0)
        .to(overlay, { autoAlpha: 0, duration: DUR, ease: EASE }, 0)
        .to(right, { y: FROM, duration: DUR, ease: EASE }, 0);
    };
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-open]")) { e.preventDefault(); open(); }
      else if (e.target.closest("[data-modal-close]") || e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  // ---------- Page on and off ----------
  let current = null;
  function enterPage(container, { first } = {}) {
    const ns = container.dataset.barbaNamespace;
    document.body.dataset.pageTheme = container.dataset.pageTheme || "light";
    markCurrent(ns);
    initNavTheme(container);
    initScrollReveal(container);
    initParallax(container);
    initFooterParallax(container);
    initGeneric(container);
    const heroTl = initHeroIntro(container);
    window.PBGlass?.mount(container);
    const def = PB.pages[ns];
    current = def?.init?.(container, { first }) || null;
    if (heroTl) first ? PB.afterLoader(() => heroTl.play()) : heroTl.play();
    PB.lenis?.resize();
    ScrollTrigger.refresh();
  }
  function leavePage(container) {
    current?.(); current = null;
    PB.cleanups.splice(0).forEach((fn) => fn());
    ScrollTrigger.getAll().forEach((t) => t.kill());
    PB.splits.splice(0).forEach((s) => s.revert());
    window.PBGlass?.unmount(container);
  }
  let loaderTl = null;
  PB.afterLoader = (fn, offset = 0) => {
    if (!loaderTl || loaderTl.progress() === 1) return fn();
    loaderTl.call(fn, null, `heroStart+=${offset}`);
  };

  // The current page is pushed -25vh while darkening (1.2s), and the new page covers it rising from 100vh below (1.2s) — both on the parallax curve
  function leaveAnim(cur) {
    const wrap = document.querySelector("[data-transition-wrap]");
    const dark = wrap.querySelector("[data-transition-dark]");
    const tl = gsap.timeline();
    if (PB.reduce) return tl.set(cur, { autoAlpha: 0 });
    tl.set(wrap, { zIndex: 2 });
    tl.fromTo(dark, { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 1.2, ease: "parallax" }, 0);
    tl.fromTo(cur, { y: "0vh" }, { y: "-25vh", duration: 1.2, ease: "parallax" }, 0);
    tl.set(dark, { autoAlpha: 0 });
    return tl;
  }
  function enterAnim(next) {
    if (PB.reduce) return gsap.set(next, { autoAlpha: 1 });
    gsap.set(next, { zIndex: 3 });
    return gsap.fromTo(next, { y: "100vh" }, { y: "0vh", duration: 1.2, clearProps: "all", ease: "parallax" });
  }
  function resetPage(container) {
    scrollTo(0, 0);
    gsap.set(container, { clearProps: "position,top,left,right" });
    PB.lenis?.resize(); PB.lenis?.start();
  }

  function boot() {
    root.classList.add("is-ready");
    initLenis();
    initNavMenu();
    initModal();
    const container = document.querySelector('[data-barba="container"]');
    const arrived = sessionStorage.getItem("pb-arrive") === "1";
    sessionStorage.removeItem("pb-arrive");
    if (arrived) {
      document.querySelector(".pb-loader")?.remove();
      root.classList.add("is-loaded");
    } else {
      loaderTl = preloader();
    }
    enterPage(container, { first: true });
    if (arrived && !PB.reduce) {
      gsap.set(container, { position: "fixed", top: 0, left: 0, right: 0 });
      gsap.timeline().add(enterAnim(container)).call(() => { resetPage(container); ScrollTrigger.refresh(); });
    }
    if (window.barba && /^https?:$/.test(location.protocol)) {
      // Barba also calls beforeEnter·afterEnter on first load (trigger "barba") — then pin the body and apply the effect once more and scrolling gets blocked
      const navigating = (data) => data.trigger !== "barba";
      barba.hooks.beforeEnter((data) => {
        if (!navigating(data)) return;
        gsap.set(data.next.container, { position: "fixed", top: 0, left: 0, right: 0 });
        PB.lenis?.stop();
      });
      barba.hooks.afterLeave((data) => navigating(data) && leavePage(data.current.container));
      barba.hooks.afterEnter((data) => {
        if (!navigating(data)) return;
        enterPage(data.next.container); PB.lenis?.resize(); PB.lenis?.start(); ScrollTrigger.refresh();
      });
      if (window.barbaPrefetch) barba.use(barbaPrefetch);
      barba.init({
        timeout: 7000,
        preventRunning: true,
        transitions: [{
          name: "default",
          sync: true,
          leave: ({ current: c }) => leaveAnim(c.container),
          enter: ({ next }) => new Promise((res) => {
            const t = enterAnim(next.container);
            (t.then ? t : Promise.resolve()).then(() => { resetPage(next.container); res(); });
          }),
        }],
      });
    } else {
      // On file:// barba can’t read the next document — play the same push and darkness, then after navigating the new page covers and rises
      document.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || a.target || e.metaKey || e.ctrlKey || a.hasAttribute("data-no-barba")) return;
        const href = a.getAttribute("href");
        if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
        e.preventDefault();
        sessionStorage.setItem("pb-arrive", "1");
        leaveAnim(container).then(() => (location.href = href));
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
