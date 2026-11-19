// Applies across everything: smooth scroll (same Lenis 1.0.23 settings as the original), menu·privacy cover, back to top.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && window.Lenis) {
    const mobile = innerWidth <= 991;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, gestureOrientation: "vertical", normalizeWheel: false, smoothWheel: true, smoothTouch: false, syncTouch: mobile, syncTouchLerp: 0.08, touchMultiplier: 1.2, touchInertiaMultiplier: 15 });
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Overlay: opening stops scrolling, and pressing a menu item switches to that item’s detail. Back goes detail → list → close
  const pops = [...document.querySelectorAll(".po-pop")];
  const close = (pop) => { pop.classList.remove("is-open"); pop.setAttribute("aria-hidden", "true"); pop.removeAttribute("data-detail"); pop.querySelectorAll("[data-menu-detail]").forEach((d) => d.classList.remove("is-on")); lenis?.start(); };
  document.querySelectorAll("[data-pop-open]").forEach((b) => b.addEventListener("click", () => { const pop = document.getElementById(b.dataset.popOpen); pop.classList.add("is-open"); pop.setAttribute("aria-hidden", "false"); lenis?.stop(); }));
  pops.forEach((pop) => {
    pop.querySelector("[data-pop-close]").addEventListener("click", () => {
      if (pop.dataset.detail) { pop.removeAttribute("data-detail"); pop.querySelectorAll("[data-menu-detail]").forEach((d) => d.classList.remove("is-on")); } else close(pop);
    });
    pop.querySelectorAll("[data-menu-item]").forEach((b) => b.addEventListener("click", () => { pop.dataset.detail = b.dataset.menuItem; pop.querySelector(`[data-menu-detail="${b.dataset.menuItem}"]`).classList.add("is-on"); }));
    pop.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") pops.filter((p) => p.classList.contains("is-open")).forEach(close); });
  document.querySelectorAll("[data-top]").forEach((b) => b.addEventListener("click", () => (lenis ? lenis.scrollTo(0) : scrollTo({ top: 0 }))));
  document.querySelectorAll('.foot a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  window.PO = { reduce, lenis };
})();
