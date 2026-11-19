// Motion shared by all pages: Lenis (lerp .165, wheel 1.25x), loader, hiding header bar, corner menu panel, rotating pastel (menu panel, logo roof, text selection color),
// Footer parallax underneath, swup page transitions. Page scenes added with wPage.add(fn) are rebuilt on the first screen and again after each swup transition.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("default-ease", "0.625, 0.05, 0, 1");
  gsap.defaults({ ease: "default-ease", duration: 0.6 });

  const reduceQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => reduceQuery.matches;

  let lenis = null;
  if (!reduce()) {
    lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scenes = [];
  window.wPage = { add: (fn) => scenes.push(fn), lenis: () => lenis, reduce };

  // Four pastels of the skin — menu panel takes the next color each time it opens, logo roof each time hovered, text selection color each press
  const PASTELS = ["var(--site-beige)", "var(--site-sky)", "var(--site-pink)", "var(--site-grey)"];

  const header = document.querySelector(".w-header");
  const overlay = document.querySelector("[data-menu-overlay]");
  const toggle = header?.querySelector("[data-menu-toggle]");
  const toggleText = toggle?.querySelector(".w-menu-btn__text");
  const nav = header?.querySelector(".w-nav");
  let navColor = 0, roofColor = 0;
  const closeMenu = () => {
    if (!header) return;
    header.dataset.open = "false";
    if (overlay) overlay.dataset.active = "false";
    if (toggleText) toggleText.textContent = "Menu";
    toggle?.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const open = header.dataset.open === "true";
    header.dataset.open = open ? "false" : "true";
    if (overlay) overlay.dataset.active = open ? "false" : "true";
    if (toggleText) toggleText.textContent = open ? "Menu" : "Close";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    if (!open && nav) { nav.style.backgroundColor = PASTELS[navColor]; navColor = (navColor + 1) % PASTELS.length; }
  });
  overlay?.addEventListener("click", closeMenu);
  nav?.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  const logo = header?.querySelector(".w-logo");
  const roof = logo?.querySelector(".w-logo__roof");
  if (logo && roof) {
    logo.addEventListener("mouseenter", () => { roof.style.fill = PASTELS[roofColor]; roofColor = (roofColor + 1) % PASTELS.length; });
    logo.addEventListener("mouseleave", () => { roof.style.fill = ""; });
  }

  let selColor = 0;
  document.addEventListener("mousedown", () => {
    document.documentElement.style.setProperty("--selection-color", `color-mix(in srgb, ${PASTELS[selColor]} 75%, transparent)`);
    selColor = (selColor + 1) % PASTELS.length;
  });

  // After scrolling down more than 5%, each time direction changes the header bar hides up by its own height + 10px or comes back down (.5s) — unchanged if the menu is open
  const headerScroll = () => {
    if (!header) return;
    const h = header.offsetHeight;
    let dir = 0;
    ScrollTrigger.create({
      start: "top -5%",
      onUpdate: (self) => {
        if (header.dataset.open === "true" || self.direction === dir) return;
        dir = self.direction;
        gsap.to(header, { top: dir === 1 ? -(h + 10) : 0, duration: 0.5, ease: "default-ease" });
      },
    });
  };

  // From when the footer group touches the bottom of the screen until it touches the top — the inside goes from −25% to its place, the black curtain from .5 to 0
  const footerParallax = () => {
    const wrap = document.querySelector("[data-footer-parallax]");
    if (!wrap) return;
    const inner = wrap.querySelector("[data-footer-parallax-inner]");
    const dark = wrap.querySelector("[data-footer-parallax-dark]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true } });
    if (inner) tl.from(inner, { yPercent: -25, ease: "linear" });
    if (dark) tl.from(dark, { opacity: 0.5, ease: "linear" }, "<");
  };

  let mm = null;
  const build = () => {
    mm?.revert();
    mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => { headerScroll(); footerParallax(); });
    scenes.forEach((fn) => fn());
    lenis?.resize();
    ScrollTrigger.refresh();
  };

  // Loader — bottom bar · logo fill · first word are CSS animations (2.8s · delayed .6s · .2s). When the first word finishes rising, it splits into letters, rests .4s, pulls up, and raises the second word,
  // When the bar fills, drops the second word, .5s later turns off the logo group while drawing the bar back to the right, and lifts the cover to −101% in 1s
  const loader = () => {
    const wrap = document.querySelector("[data-load-wrap]");
    if (!wrap || reduce()) { wrap?.remove(); return Promise.resolve(); }
    lenis?.stop();
    CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");
    const box = wrap.querySelector("[data-load-container]");
    const bg = wrap.querySelector("[data-load-bg]");
    const bar = wrap.querySelector("[data-load-progress]");
    const words = [...wrap.querySelectorAll("[data-load-text]")];
    let lastChars = null;
    let swap = Promise.resolve();
    if (words.length >= 2) {
      const run = () => new Promise((done) => {
        gsap.set(words[0], { autoAlpha: 1 });
        words[0].style.animation = "none";
        const a = new SplitText(words[0], { type: "lines,chars", mask: "lines" });
        const b = new SplitText(words[1], { type: "lines,chars", mask: "lines" });
        lastChars = b.chars;
        gsap.set(b.chars, { autoAlpha: 0, yPercent: 125 });
        gsap.set(words[1], { autoAlpha: 1 });
        gsap.timeline({ onComplete: done })
          .to(a.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, "+=0.4")
          .to(b.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, "<");
      });
      const first = words[0].getAnimations?.().find(Boolean);
      swap = first && first.playState !== "finished" ? first.finished.then(run).catch(run) : run();
    }
    const fills = bar?.getAnimations?.() ?? [];
    const filled = fills.length ? Promise.all(fills.map((a) => a.finished)) : new Promise((r) => gsap.delayedCall(2.8, r));
    const hide = () => new Promise((done) => {
      if (bar) { gsap.set(bar, { scaleX: 1 }); bar.style.animation = "none"; }
      const tl = gsap.timeline({
        defaults: { ease: "loader" },
        onComplete: () => { wrap.remove(); lenis?.resize(); lenis?.start(); done(); },
      });
      if (lastChars) tl.to(lastChars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, 0);
      tl.to(box, { autoAlpha: 0, duration: 0.5 }, lastChars ? 0.5 : 0);
      if (bar) tl.to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.5, force3D: true }, "<");
      tl.to(bg, { yPercent: -101, duration: 1, force3D: true }, "<");
      tl.set(wrap, { display: "none" });
    });
    return Promise.all([swap, filled]).then(hide, hide);
  };

  // swup — only the body (#swup) is swapped and .transition-fade fades out and back in .3s. Before advancing, scroll scenes are cleared and the menu is closed
  const startSwup = () => {
    if (typeof Swup === "undefined") return;
    const swup = new Swup({ animationSelector: '[class*="transition-"]', containers: ["#swup"] });
    swup.hooks.on("visit:start", () => {
      lenis?.stop();
      closeMenu();
      gsap.to(header, { top: 0, duration: 0.5, ease: "default-ease" });
      mm?.revert();
    });
    swup.hooks.on("content:replace", () => { scrollTo({ top: 0, behavior: "instant" }); });
    swup.hooks.on("page:view", () => { build(); lenis?.start(); });
  };

  const ready = () => {
    loader();
    build();
    startSwup();
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", ready);
  else ready();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
