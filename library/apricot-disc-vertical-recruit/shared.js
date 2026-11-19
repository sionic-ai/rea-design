// Shared by several pages — lenis (lerp .4), swup (swaps only #gf-main with no transition effect, main turns on at .4s), a background disc slot per page,
// Scrolling down raises the header button and the top bar (small button + hamburger) drops in over .65s, menu dialog, motion pause button,
// And the devices inside #gf-main (hero vertical copy, late photo turn-on, pinned working-environment photo, left position guide, FAQ fold, slider).
// The original swup swaps only #Main and re-attaches the setup on every page view — here too it is cleared and re-attached on each change. Motion parts attach themselves to new elements via fx-core.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, body = document.body;
  const sysReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = matchMedia("(max-width: 766.98px)");
  let reduced = sysReduce.matches;

  // ---------- Background disc position per page (share of screen width: top-left x·y, diameter size) — the fourth is a white bloom ----------
  const ORB_A = { pc: [{ x: -0.13, y: 0.38, size: 0.27, opacity: 0.3, gradient: "left" }, { x: 0.58, y: -0.34, size: 0.8 }, { x: 0, y: 0, size: 0 }, { x: 0.4, y: 0.55, size: 0.58 }],
    sp: [{ x: -0.44, y: 1.31, size: 0.52, opacity: 0.3, gradient: "left" }, { x: 0.6, y: -0.65, size: 1.52 }, { x: 0, y: 0, size: 0 }, { x: 0.21, y: 1.65, size: 0.78 }] };
  const ORB_B = { pc: [{ x: -0.11, y: 0.34, size: 0.34 }, { x: 0.3, y: -0.3, size: 0.55, opacity: 0.3, gradient: "right" }, { x: 0, y: 0, size: 0 }, { x: 0.02, y: 0.59, size: 0.94 }],
    sp: [{ x: -0.44, y: 1, size: 0.65 }, { x: 0.28, y: -0.52, size: 1.05, opacity: 0.3, gradient: "right" }, { x: 0, y: 0, size: 0 }, { x: -0.28, y: 1.92, size: 1.57 }] };
  const ORBS = {
    about: { pc: [{ x: -0.18, y: 0.17, size: 0.55 }, { x: 0.58, y: -0.13, size: 0.27, opacity: 0.3, gradient: "right" }, { x: 0, y: 0, size: 0 }, { x: 0.2, y: 0.59, size: 0.94 }],
      sp: [{ x: -0.68, y: 0.73, size: 1.05 }, { x: 0.6, y: -0.26, size: 0.52, opacity: 0.3, gradient: "right" }, { x: 0, y: 0, size: 0 }, { x: -0.05, y: 1.65, size: 2.1 }] },
    culture: ORB_B,
    workstyle: ORB_A,
    detail: { pc: [{ x: 0.2, y: -0.06, size: 0.27 }, { x: 0.65, y: 0.13, size: 0.66, opacity: 0.3, gradient: "right" }, { x: 0, y: 0, size: 0 }, { x: 0.2, y: 0.79, size: 0.58 }],
      sp: [{ x: -0.05, y: -0.13, size: 0.52 }, { x: 0.68, y: 0.81, size: 1.26, opacity: 0.3, gradient: "right" }, { x: 0, y: 0, size: 0 }, { x: 0.1, y: 2.05, size: 0.78 }] },
  };
  const homeOrbs = () => ({
    pc: [{ x: 0.02, y: 0.083, size: 0.8 }, { x: 0.02, y: 0.083, size: 0, opacity: 0 }, { x: 0.22, y: reduced ? 3.5 : 1.45, size: 0.94, gradient: "right", lensWeight: 0.25 }, { x: 0, y: 0, size: 0, opacity: 0 }],
    sp: [{ x: -0.68, y: 0.23, size: 1.57 }, { x: -0.68, y: 0.23, size: 0 }, { x: 0.34, y: reduced ? 12.4 : 6, size: 2.1, gradient: "right" }, { x: 0, y: 0, size: 0, opacity: 0 }],
  });
  const page = () => $("#gf-main")?.dataset.page || "home";
  const orbsFor = (p) => (p === "home" ? homeOrbs() : ORBS[p] || ORB_A);
  const bg = $(".gf-bg");
  if (bg) bg.setAttribute("data-orbs", JSON.stringify(orbsFor(page())));
  const sendOrbs = () => bg?.dispatchEvent(new CustomEvent("fx:orbs", { detail: orbsFor(page()) }));

  // ---------- lenis — the original turns autoRaf off with lerp .4 ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.4, prevent: (n) => n.id === "gf-menu" || !!n.closest?.(".gf-menu") });
    const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    window.lenis = lenis;
  }

  // ---------- is-scrolled when scrolling down — on the first page when the About section head touches under the header menu, on other pages at 100px ----------
  let hideAt = 100;
  const measureHide = () => {
    root.dataset.orientation = innerWidth >= innerHeight ? "landscape" : "portrait";
    const about = $("#gf-about"), header = $(".gf-header"), nav = $(".gf-nav");
    if (page() === "home" && about && header && nav) {
      const pad = parseFloat(getComputedStyle(about).paddingTop) || 0;
      hideAt = Math.floor(about.offsetTop + pad - Math.floor(header.offsetHeight + nav.offsetHeight));
    } else hideAt = 100;
  };
  const motionFront = $(".gf-motion--front");
  const onScroll = () => {
    const y = lenis ? lenis.scroll : scrollY;
    const on = y > hideAt;
    body.classList.toggle("is-scrolled", on);
    motionFront?.classList.toggle("is-scrolled", on);
    window.ScrollTrigger?.update();
    localNav();
    styleStage?.();
  };
  if (lenis) lenis.on("scroll", onScroll); else addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { measureHide(); onScroll(); });

  // ---------- Header menu — coral dot before the current page ----------
  const markNav = () => {
    const p = page();
    $$(".gf-nav a, .gf-localnav-root a").forEach((a) => {
      const on = a.dataset.page && a.dataset.page === p;
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  };

  // ---------- Reduced motion — all durations to 0, background as a crisp flat disc ----------
  const applyMotion = (on) => {
    reduced = on;
    root.classList.toggle("-reduced-motion", on);
    $$(".gf-motion").forEach((b) => {
      b.dataset.reducedMotion = String(on);
      const l = $(".gf-motion__label", b);
      if (l) l.textContent = on ? "Replay Motion" : "Motion Paused";
    });
    bg?.dispatchEvent(new CustomEvent("fx:motion", { detail: { reduce: on } }));
    sendOrbs();
  };
  document.addEventListener("click", (e) => { if (e.target.closest?.(".gf-motion")) applyMotion(!reduced); });
  applyMotion(reduced);

  // ---------- Menu dialog — curtain .4s · panel .5s (.98 → 1) starting .1s later, fades out in .3s on close ----------
  const menu = $("#gf-menu");
  const openMenu = () => {
    if (!menu || menu.open) return;
    menu.classList.remove("is-closing");
    menu.showModal();
    body.classList.add("is-menu-open");
    lenis?.stop();
    $$("[data-gf-menu-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
  };
  const closeMenu = (instant) => {
    if (!menu?.open) return;
    const done = () => {
      menu.close(); menu.classList.remove("is-closing");
      body.classList.remove("is-menu-open");
      lenis?.start();
      $$("[data-gf-menu-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
    };
    if (instant === true || reduced) return done();
    menu.classList.add("is-closing");
    setTimeout(done, 300);
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest?.("[data-gf-menu-open]")) { e.preventDefault(); openMenu(); }
    else if (e.target.closest?.("[data-gf-menu-close]") || e.target.classList?.contains("gf-menu__bg")) closeMenu();
  });
  menu?.addEventListener("cancel", (e) => { e.preventDefault(); closeMenu(); });

  // ---------- Devices inside #gf-main ----------
  let cleanups = [];
  let styleStage = null;
  const later = (fn) => cleanups.push(fn);

  // Hero — once direction is set, .is-loaded (vertical copy characters settle from blur in 2.6s at 90ms intervals)
  const firstview = () => {
    const fv = $(".gf-fv");
    if (!fv) return;
    $$(".gf-fv__line > span", fv).forEach((s, i) => s.style.setProperty("--i", i));
    void fv.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => fv.classList.add("is-loaded")));
  };

  // Photo fades in over .4s when it enters the screen (original astro-fadein-img)
  const fadeins = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-show"); io.unobserve(e.target); } }), { threshold: 0 });
    $$(".gf-fadein").forEach((n) => io.observe(n));
    later(() => io.disconnect());
  };

  // Work environment — as the pinned photo comes within 800px of its paired text line, it goes .8 → 1 scale and transparent → clear
  const workstyle = () => {
    const stage = $(".gf-style");
    if (!stage) { styleStage = null; return; }
    const imgs = $$("[data-sibling]", stage).map((el) => ({ el, sib: document.getElementById(el.dataset.sibling) }));
    // Original HomeStickySection — when the job panel header touches the top of the screen, turn on this section pinned underneath (.2s), and after passing the whole job panel, return it to its in-flow position
    const stack = stage.closest(".gf-stack"), intro = stack?.querySelector(".gf-jobs");
    let top = 0, stackTop = 0, introH = 0;
    const measure = () => {
      top = (parseFloat(getComputedStyle(imgs[0]?.el || stage).top) || 0) - 1;
      if (!stack || !intro) return;
      stackTop = stack.getBoundingClientRect().top + (lenis ? lenis.scroll : scrollY);
      introH = intro.offsetHeight;
      stack.style.setProperty("--gf-style-h", `${stage.offsetHeight}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage); if (intro) ro.observe(intro);
    later(() => ro.disconnect());
    styleStage = () => {
      const y = lenis ? lenis.scroll : scrollY;
      if (stack && intro) {
        stage.classList.toggle("is-scrolling", y >= stackTop + introH);
        stage.classList.toggle("is-show", y >= stackTop);
      }
      if (reduced || narrow.matches) { imgs.forEach(({ el }) => { el.style.transform = ""; el.style.opacity = ""; }); return; }
      imgs.forEach(({ el, sib }) => {
        if (!sib) return;
        const a = el.getBoundingClientRect(), b = sib.getBoundingClientRect();
        if (a.top < top) return;
        const n = a.top - b.top;
        if (n === 0) { el.style.transform = "scale(1)"; return; }
        const k = (800 - Math.min(800, n)) / 800;
        el.style.transform = `scale(${0.8 + k * 0.2})`;
        el.style.opacity = String(k);
      });
    };
    addEventListener("resize", measure);
    later(() => { removeEventListener("resize", measure); styleStage = null; });
    styleStage();
  };

  // Left location guide — dot on the last section past the top 1/3 of the screen
  let localNav = () => {};
  const localNavSetup = () => {
    const ln = $(".gf-localnav");
    if (!ln) { localNav = () => {}; return; }
    const items = $$("a[href^='#']", ln).map((a) => ({ li: a.parentElement, sec: document.getElementById(a.getAttribute("href").slice(1)) })).filter((x) => x.sec);
    localNav = () => {
      let cur = null;
      items.forEach((x) => { if (x.sec.getBoundingClientRect().top < innerHeight / 3) cur = x; });
      items.forEach((x) => x.li.classList.toggle("is-current", x === cur));
    };
    ln.addEventListener("click", (e) => {
      const a = e.target.closest("a[href^='#']");
      if (!a) return;
      const t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView(); }
    });
    later(() => { localNav = () => {}; });
  };

  // FAQ — details goes from height 0 ↔ full height and transparent ↔ clear in 200ms ease-out (original Web Animations)
  const faq = () => {
    $$(".gf-faq details").forEach((d) => {
      const sum = $("summary", d), content = $(".gf-faq__a", d);
      const onClick = (e) => {
        e.preventDefault();
        if (d.dataset.anim === "running") return;
        const opt = { duration: 200, easing: "ease-out" };
        if (d.open) {
          d.classList.remove("is-opened");
          if (reduced) { d.open = false; return; }
          d.dataset.anim = "running";
          const a = content.animate([{ height: content.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], opt);
          a.onfinish = () => { d.open = false; d.dataset.anim = ""; };
        } else {
          d.open = true; d.classList.add("is-opened");
          if (reduced) return;
          d.dataset.anim = "running";
          const a = content.animate([{ height: 0, opacity: 0 }, { height: content.offsetHeight + "px", opacity: 1 }], opt);
          a.onfinish = () => { d.dataset.anim = ""; };
        }
      };
      sum.addEventListener("click", onClick);
      later(() => sum.removeEventListener("click", onClick));
    });
  };

  // Slider — the original splide (loop, centered, 20px gap, 400ms cubic-bezier(.25,1,.5,1))
  const sliders = () => {
    if (!window.Splide) return;
    $$(".splide[data-carousel]").forEach((el) => {
      const s = new Splide(el, { type: "loop", perPage: 1, perMove: 1, gap: "20px", pagination: false, focus: "center", autoWidth: true, speed: 400, easing: "cubic-bezier(0.25, 1, 0.5, 1)" });
      s.mount();
      later(() => s.destroy());
    });
  };

  const mountPage = () => {
    cleanups.forEach((f) => f()); cleanups = [];
    root.classList.toggle("is-home", page() === "home");
    markNav();
    measureHide();
    firstview(); fadeins(); workstyle(); localNavSetup(); faq(); sliders();
    onScroll();
    window.ScrollTrigger?.refresh();
  };

  const showPage = () => {
    root.classList.add("pageview");
    sendOrbs();
  };

  mountPage();
  setTimeout(showPage, 100);

  // ---------- swup — swaps only #gf-main. On click main turns off (.pageview removed) and scrolls to the top at .4s, when the new page arrives it turns on 100ms later over .4s ----------
  if (window.Swup && !/^file:/.test(location.protocol)) {
    const plugins = [];
    if (window.SwupA11yPlugin) plugins.push(new SwupA11yPlugin({ headingSelector: "title", contentSelector: "#gf-main" }));
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin({ preloadHoveredLinks: true, preloadVisibleLinks: true }));
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ awaitAssets: true }));
    if (window.SwupBodyClassPlugin) plugins.push(new SwupBodyClassPlugin());
    const swup = new Swup({ containers: ["#gf-main"], animationSelector: false, cache: true, native: false, plugins, ignoreVisit: (url, { el } = {}) => !!el?.closest("[data-no-swup]") || /^#/.test(url) });
    swup.hooks.on("link:click", () => {
      closeMenu(true);
      root.classList.remove("pageview");
      setTimeout(() => lenis?.scrollTo(0, { duration: 0.4 }), 10);
    });
    swup.hooks.on("content:replace", () => { lenis?.scrollTo(0, { immediate: true }); mountPage(); });
    swup.hooks.on("page:view", () => setTimeout(showPage, 100));
  }
})();
