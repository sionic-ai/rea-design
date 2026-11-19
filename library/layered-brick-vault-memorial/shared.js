// Motion shared by every page: Locomotive Scroll (5.0.0 like the original — Lenis 1.3.17 inside), line and word splitting, phone menu drawer, page transition curtain.
// Viewport entry marking (data-scroll → is-inview, data-scroll-offset) and speed parallax (data-scroll-speed) are handled by Locomotive like the original.
// Page scenes are registered with eSite.scene(fn) so they are set up after all fonts load and text is split — because line breaks depend on font width.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("magic", "M0,0 C0.33,0 0,1 1,1");

  const scenes = [];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  window.eSite = { scene: (fn) => scenes.push(fn), reduce };

  // In reduced motion mode, no parallax is applied and the entrance marks are all attached from the start, leaving the final state
  if (reduce.matches) document.querySelectorAll("[data-scroll]").forEach((el) => { el.removeAttribute("data-scroll-speed"); el.classList.add("is-inview"); });
  // Original Scroll component as is: run on the gsap tick and update ScrollTrigger on every Lenis scroll
  const loco = (window.eSite.loco = new LocomotiveScroll({ initCustomTicker: (f) => gsap.ticker.add(f), destroyCustomTicker: (f) => gsap.ticker.remove(f) }));
  const lenis = (window.lenis = loco.lenisInstance);
  if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; scrollTo(0, 0); }
  lenis?.on("scroll", ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);

  const split = () => {
    document.querySelectorAll('[data-split="lines"]').forEach((el) =>
      SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line", propIndex: true, autoSplit: true }));
    document.querySelectorAll('[data-split="words"]').forEach((el) =>
      SplitText.create(el, { type: "words", mask: "words", wordsClass: "word", propIndex: true }));
    document.querySelectorAll('[data-split="chars"]').forEach((el) =>
      SplitText.create(el, { type: "chars", mask: "chars", charsClass: "char", propIndex: true }));
  };

  const menu = document.getElementById("menu");
  const openBtn = document.querySelector("[data-menu-open]");
  if (menu && openBtn) {
    let tl;
    const setMenu = (on) => {
      tl?.kill();
      openBtn.setAttribute("aria-expanded", String(on));
      if (on) {
        window.lenis?.stop();
        tl = gsap.timeline()
          .set(menu, { autoAlpha: 1 })
          .fromTo(menu, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }, { clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)", duration: 1, ease: "power3.inOut" })
          .fromTo(menu.querySelectorAll("li > *"), { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power3.out" }, "<40%")
          .fromTo(menu.querySelector(".e-menu__foot"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.inOut" }, "<40%");
        menu.querySelector("[data-menu-close]").focus();
      } else {
        window.lenis?.start();
        tl = gsap.timeline()
          .fromTo(menu.querySelectorAll("li > *"), { y: 0, autoAlpha: 1 }, { y: -80, autoAlpha: 0, duration: 0.2, stagger: { each: 0.05 }, ease: "power2.inOut" })
          .fromTo(menu.querySelector(".e-menu__foot"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 80, duration: 0.2, ease: "power2.inOut" }, "<")
          .fromTo(menu, { clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 0.4, ease: "power2.out" }, "<80%")
          .set(menu, { autoAlpha: 0 });
      }
    };
    openBtn.addEventListener("click", () => setMenu(true));
    menu.querySelector("[data-menu-close]").addEventListener("click", () => { setMenu(false); openBtn.focus(); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a[href^='#']")) setMenu(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && openBtn.getAttribute("aria-expanded") === "true") setMenu(false); });
  }

  // Page transition: on leaving, it darkens to 0.7 over 0.6s, the body rises 100px, and the curtain covers from bottom to top in 0.8s.
  // The next page opens with the curtain still covering and lifts over 0.6s
  const veil = document.querySelector(".e-veil");
  const curtain = document.querySelector(".e-curtain");
  const page = document.querySelector("[data-page]");
  const KEY = "e-curtain";
  if (veil && curtain) {
    if (sessionStorage.getItem(KEY)) {
      sessionStorage.removeItem(KEY);
      gsap.set(curtain, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.to(curtain, { autoAlpha: 0, duration: 0.6, ease: "none", delay: 0.1, onComplete: () => gsap.set(curtain, { clearProps: "all" }) });
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (a.getAttribute("href").startsWith("#") || url.origin !== location.origin || !url.pathname.endsWith(".html") || url.hash) return;
      e.preventDefault();
      const photo = curtain.querySelector(".wf-img");
      if (photo) gsap.set(photo, { autoAlpha: a.hasAttribute("data-curtain-photo") ? 1 : 0 });
      if (reduce.matches) return (location.href = url.href);
      window.lenis?.stop();
      gsap.timeline({ onComplete: () => { sessionStorage.setItem(KEY, "1"); location.href = url.href; } })
        .set(curtain, { autoAlpha: 1 })
        .to(veil, { autoAlpha: 0.7, duration: 0.6, ease: "none" })
        .to(page, { y: -100, duration: 0.8, ease: "power3.inOut" }, "<")
        .fromTo(curtain, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.inOut" }, "<");
    });
    // So the curtain doesn’t stay covered when returning via Back (bfcache)
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set([veil, curtain, page], { clearProps: "all" }); });
  }

  // Footer name: glyph widths differ per typeface, so the viewBox is fitted to the glyph box measured with the loaded font, filling the full screen width
  const fitMarks = () => document.querySelectorAll(".e-footer__mark").forEach((svg) => {
    const b = svg.getBBox();
    if (b.width) svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
  });
  matchMedia("(max-width: 767px)").addEventListener("change", () => { fitMarks(); ScrollTrigger.refresh(); });

  document.fonts.ready.then(() => {
    fitMarks();
    split();
    scenes.forEach((fn) => fn());
    loco.resize();
    ScrollTrigger.refresh();
  });
})();
