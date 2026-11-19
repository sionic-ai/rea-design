// Shared by all pages: Lenis, grass-blade pill fill, loading (grass stands up and the Hero comes together), hamburger menu,
// Section jumps from menu and Footer links, purchase banner, and the header fading out and hiding when it touches the Footer.
// A page-side scene can tell via sMotion.jumps[id] which point within that section’s pin to jump to — the original jumps to a label in the pin range.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const isPC = () => matchMedia("(min-width: 769px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$("[data-grass]").forEach((box) => {
    const n = +box.dataset.grass;
    for (let i = 0; i < n; i++) {
      const item = document.createElement("div");
      item.className = "s-grass__item";
      box.append(item);
    }
  });

  let lenis = null;
  if (!reduce) {
    // The original passes smoothTouch: true, but that option does not exist in Lenis 1.3.25, so touch scrolling is not smoothed — turning on syncTouch changes the feel on phones
    lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    addEventListener("load", () => ScrollTrigger.refresh());
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  // Hero grass blades drift right by half a turn every 70s (64 = 8 colors × 8, so there is no seam even when cut and joined at the half)
  let grassLoop = null;
  const topGrass = $("#s-grass-top");
  const getGrassLoop = () => {
    if (!grassLoop && topGrass) grassLoop = gsap.to(topGrass, { xPercent: 0, duration: 70, ease: "none", repeat: -1, paused: true });
    return grassLoop || { play() {}, pause() {} };
  };

  const sMotion = (window.sMotion = {
    isPC,
    reduce,
    get lenis() { return lenis; },
    grassLoop: getGrassLoop,
    jumps: {},
    scrollTo(target) {
      if (lenis) lenis.scrollTo(target, { duration: 1.2 });
      else (typeof target === "number" ? scrollTo(0, target) : target.scrollIntoView());
    },
    // Jumps to the label position within the pin range
    toLabel(tl, label) {
      ScrollTrigger.refresh();
      sMotion.scrollTo(tl.scrollTrigger.labelToScroll(label));
    },
  });

  const logo = $(".s-header-logo");
  const nav = $(".s-header-nav");
  const burger = $(".s-hamburger");
  const cta = $(".s-cta");

  // ── Loading ──
  const loading = $("#s-loading");
  const showChrome = () => gsap.set([logo, nav, burger, cta].filter(Boolean), { x: 0, y: 0 });
  if (loading && !reduce) {
    lenis && lenis.stop();
    const contents = $(".s-loading__contents", loading);
    const bar = $(".s-loading__bar", loading);
    const items = topGrass ? $$(".s-grass__item", topGrass) : [];
    const fvBg = $("#s-fv-background");
    const fvContents = $("#s-fv-contents");
    const pc = isPC();
    if (topGrass) gsap.set(topGrass, { xPercent: -100 });
    const tl = gsap.timeline();
    tl.to(contents, { filter: "blur(0px)", opacity: 1, duration: 0.6, delay: 0.3 })
      .to(bar, { width: "100%", duration: 2.4, ease: "circ.out" }, "<");
    if (topGrass) {
      tl.to(topGrass, { xPercent: -50, columnGap: pc ? 25 : 16, duration: 2.4, ease: "sine.inOut" }, "<")
        .to(items, { "--grass-opacity": 1, duration: 1.2, ease: "sine.inOut" }, "<")
        .to(items, {
          "--grass-line": pc ? "26px" : "17px",
          "--grass-rotate-odd": "0deg",
          "--grass-rotate-even": "0deg",
          "--grass-rotate-odd-after": "0deg",
          "--grass-rotate-even-after": "0deg",
          duration: 2.4,
          ease: "sine.inOut",
        }, "<");
    }
    tl.to(contents, { filter: "blur(12px)", opacity: 0, duration: 0.6, delay: 0.3 })
      .to(loading, { autoAlpha: 0, duration: 0.3 });
    if (fvBg) tl.to(fvBg, { filter: "blur(0px)", opacity: 1, duration: 0.6 });
    if (fvContents) {
      tl.to(fvContents, { opacity: 1, duration: 0.6 }, "<")
        .to(fvContents, { filter: "blur(0px)", duration: 0.4, onComplete: () => topGrass && topGrass.classList.remove("-front") }, "<+=0.2");
    }
    tl.to(logo, { y: 0, duration: 0.4 })
      .to(nav, { y: 0, duration: 0.4 }, "<")
      .to(cta, { x: 0, duration: 0.4 }, "<")
      .to(burger, { y: 0, duration: 0.4, onComplete: () => { getGrassLoop().play(); lenis && lenis.start(); } }, "<");
  } else {
    if (loading) loading.hidden = true;
    if (topGrass) topGrass.classList.remove("-front");
    showChrome();
  }

  // ── Hamburger menu: three lines gather to the center, then spread out at ±15° ──
  const menu = $("#s-menu");
  const filter = $("#s-filter");
  const bars = $$(".s-hamburger__item");
  const burgerOpen = () => gsap.timeline({ delay: 0.15 })
    .to(bars[0], { top: "50%", yPercent: -50, duration: 0.3 })
    .to(bars[2], { bottom: "50%", yPercent: 50, duration: 0.3 }, "<")
    .to(bars[1], { opacity: 0, duration: 0 })
    .to(bars[2], { width: "4.8rem", duration: 0 }, "<")
    .to(bars[0], { rotate: 15, duration: 0.3 })
    .to(bars[2], { rotate: -15, duration: 0.3 }, "<");
  const burgerClose = () => gsap.timeline()
    .to(bars[0], { rotate: 0, duration: 0.3 })
    .to(bars[2], { rotate: 0, duration: 0.3 }, "<")
    .to(bars[1], { opacity: 1, duration: 0 })
    .to(bars[2], { width: "1.2rem", duration: 0 }, "<")
    .to(bars[0], { top: "0%", yPercent: 0, duration: 0.3 })
    .to(bars[2], { bottom: "0%", yPercent: 0, duration: 0.3 }, "<");
  const openMenu = () => {
    menu.classList.add("-opened");
    filter.classList.add("-visibled");
    burger.setAttribute("aria-expanded", "true");
    lenis && lenis.stop();
    burgerOpen();
    getGrassLoop().pause();
  };
  const closeMenu = () => {
    if (!menu.classList.contains("-opened")) return;
    menu.classList.remove("-opened");
    filter.classList.remove("-visibled");
    burger.setAttribute("aria-expanded", "false");
    setTimeout(() => (menu.scrollTop = 0), 300);
    lenis && lenis.start();
    burgerClose();
    getGrassLoop().play();
  };
  burger && burger.addEventListener("click", () => (menu.classList.contains("-opened") ? closeMenu() : openMenu()));
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // ── Section navigation: sections with a pin go to the label the scene registered, others to the section head ──
  $$(".s-jump").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (!el && !sMotion.jumps[id]) return;
      e.preventDefault();
      closeMenu();
      if (sMotion.jumps[id]) sMotion.jumps[id]();
      else sMotion.scrollTo(el);
    });
  });

  // ── Purchase banner: once × is pressed it never comes back ──
  let ctaClosed = false;
  const ctaButton = $(".s-cta__button");
  ctaButton && ctaButton.addEventListener("click", () => {
    ctaClosed = true;
    cta.classList.add("-hidden");
  });

  // ── Footer: on contact the header blurs and hides, and the bottom grass flows right by half a turn every 70s ──
  const footer = $(".s-footer");
  // Lower refreshPriority because measuring must happen after the page scene’s pin spacing is all created
  if (footer) {
    const footGrass = $(".s-footer__grass", footer);
    gsap.set(footGrass, { xPercent: -51 });
    const flow = gsap.to(footGrass, { xPercent: -1, duration: 70, ease: "none", repeat: -1, paused: true });
    const headerTl = gsap.timeline({ paused: true })
      .to(logo, { filter: "blur(12px)", autoAlpha: 0, duration: 0.4, overwrite: "auto" })
      .to(nav, { filter: "blur(12px)", autoAlpha: 0, duration: 0.4, overwrite: "auto" }, "<")
      .to(burger, { filter: "blur(12px)", autoAlpha: 0, duration: 0.4, overwrite: "auto" }, "<");
    const enter = () => {
      if (headerTl.progress() < 1) headerTl.play();
      cta && cta.classList.add("-hidden");
      if (!reduce) flow.play();
    };
    const leave = () => {
      if (headerTl.progress() > 0) headerTl.reverse();
      if (cta && !ctaClosed) cta.classList.remove("-hidden");
      flow.pause();
    };
    ScrollTrigger.create({ trigger: footer, start: "top bottom", end: "bottom top", refreshPriority: -1, onEnter: enter, onEnterBack: enter, onLeave: leave, onLeaveBack: leave });
  }
})();
