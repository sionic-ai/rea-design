// Shared — body Lenis(1.3.11), menu drawer (letter flip + peel away from below). Talks with the page choreography (index.js) via window.lx.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const html = document.documentElement;
  const PC = matchMedia("(min-width: 768px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bus = new EventTarget();
  const lx = (window.lx = {
    PC, reduce,
    on: (n, f) => bus.addEventListener(n, (e) => f(e.detail)),
    emit: (n, d) => bus.dispatchEvent(new CustomEvent(n, { detail: d })),
    names: ["BRAND\nCOUPE CONCEPT", "BRAND HOUSE", "BRAND\nBOAT CONCEPT", "PARTNER", "BRAND\nMICRO CONCEPT", "BRAND\nSPORT CONCEPT", "BRAND HUB", "BRAND\nSEDAN CONCEPT"],
  });
  html.dataset.active = "loading";

  // ---------- Body Lenis — original defaults as-is, driven by the gsap ticker ----------
  const lenis = (lx.lenis = new Lenis());
  gsap.ticker.lagSmoothing(0);
  const tick = (t) => lenis.raf(t * 1000);
  lx.on("lenis:start", () => { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(tick); lenis.start(); });
  lx.on("lenis:stop", () => { lenis.off("scroll", ScrollTrigger.update); gsap.ticker.remove(tick); lenis.scrollTo(lenis.scroll, { immediate: true }); ScrollTrigger.refresh(); lenis.stop(); });
  lx.animation = true;

  // ---------- Menu ----------
  const subs = document.querySelector("[data-menu-subs]");
  if (subs) subs.innerHTML = lx.names.map((n, i) => `<button type="button" class="lx-menu__sub-link" data-menu-link="${i + 1}"><span class="lx-menu__sub-no">( ${String(i + 1).padStart(2, "0")} )</span><span class="lx-menu__sub-text">${n.replace("\n", " ")}</span><i class="lx-menu__sub-border"></i></button>`).join("");
  const M = {
    body: document.querySelector('[data-menu="body"]'), burger: document.querySelector('[data-menu="burger"]'),
    open: document.querySelectorAll('[data-menu="open"] span'), close: document.querySelectorAll('[data-menu="close"] span'),
    date: document.querySelector('[data-menu="date"]'), stage: document.querySelector('[data-menu="stage"]'),
    links: document.querySelectorAll("[data-menu-link]"), contents: document.querySelector("#contents"),
  };
  if (!M.body || !M.burger) return;
  let isOpen = false, before = "statement";
  const prep = () => { gsap.set(M.links, { clipPath: "inset(0% 100% 0% 0%)", x: "-1rem" }); gsap.set([M.date, M.stage], { autoAlpha: 0, filter: "blur(10px)" }); };
  const open = () => {
    prep(); isOpen = true; M.contents.inert = true;
    before = html.dataset.active; html.dataset.active = "menu"; html.classList.add("is-menu-opened");
    M.burger.setAttribute("aria-expanded", "true");
    gsap.killTweensOf([M.body, M.date, M.stage, ...M.links]);
    lx.emit("gl:stop"); lx.emit("lenis:stop");
    gsap.set(M.close, { rotateX: "-90deg" });
    gsap.to(M.open, { autoAlpha: 0, duration: 0.3, ease: "power2.out", rotateX: "180deg", stagger: 0.05 });
    gsap.to(M.close, { autoAlpha: 1, duration: 0.3, ease: "power2.out", rotateX: "0deg", stagger: 0.05 });
    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } });
    tl.set(M.links, { autoAlpha: 1 });
    tl.set(M.body, { clipPath: PC ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)", display: "block" });
    tl.to(M.body, { clipPath: "inset(0% 0% 0% 0%)", duration: PC ? 1.2 : 1, ease: "expo.inOut" });
    tl.to(M.links, { clearProps: "all", clipPath: "inset(0 0% 0 0)", stagger: 0.05, x: "0rem" }, "-=0.2");
    tl.to([M.date, M.stage], { autoAlpha: 1, duration: 1, filter: "blur(0px)" }, "<");
  };
  const close = (go) => {
    isOpen = false; M.contents.inert = false; html.classList.remove("is-menu-opened");
    M.burger.setAttribute("aria-expanded", "false");
    gsap.killTweensOf([M.body, M.date, M.stage, ...M.links]);
    if (html.dataset.active === "menu") html.dataset.active = before;
    if (html.dataset.active === "detail") lx.emit("detail:resume"); else { lx.emit("gl:start"); lx.emit("lenis:start"); lx.animation = true; }
    gsap.set(M.open, { rotateX: "90deg" });
    gsap.to(M.open, { autoAlpha: 1, duration: 0.3, ease: "power2.out", rotateX: "0deg", stagger: 0.05 });
    gsap.to(M.close, { autoAlpha: 0, duration: 0.3, ease: "power2.out", rotateX: "-180deg", stagger: 0.05 });
    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } });
    tl.to([M.date, M.stage, ...M.links], { autoAlpha: 0 });
    tl.to(M.body, PC ? { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut" } : { clipPath: "inset(0 0 0 100%)", duration: 1, ease: "expo.inOut" }, PC ? "-=0.5" : "-=0.2");
    tl.to([M.date, M.stage, ...M.links], { clearProps: "all", onComplete: () => { prep(); gsap.set(M.body, { display: "none" }); } });
    go?.();
  };
  M.burger.addEventListener("click", (e) => { e.preventDefault(); isOpen ? close() : open(); });
  addEventListener("keydown", (e) => { if (isOpen && e.key === "Escape") close(); });
  M.links.forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const k = b.dataset.menuLink;
    lx.animation = false;
    if (k === "top") before = "statement", close(() => lx.emit("go:top"));
    else if (k === "statement") before = "statement", close(() => lx.emit("go:statement"));
    else if (k === "gallery") before = "gallery", close(() => lx.emit("go:gallery"));
    else before = "detail", close(() => lx.emit("go:detail", +k));
  }));
  document.querySelectorAll("[data-menu-go='top']").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); if (isOpen) close(); lx.emit("go:top"); }));
})();
