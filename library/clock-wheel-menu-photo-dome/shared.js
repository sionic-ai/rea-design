// What stays outside the wrapper — smooth scroll (original Lenis, lerp .12) and the video list category filter (button next to the menu). Only the wrapper changes between pages (vt-swap-page), so this runs just once.
(() => {
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.12 });
    window.mcLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("fx:page-enter", () => lenis.scrollTo(0, { immediate: true }));
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".mc-sub__btn");
    if (!b) return;
    b.closest(".mc-sub").querySelectorAll(".mc-sub__btn").forEach((x) => (x.dataset.active = String(x === b)));
    document.querySelector(".mc-strip")?.dispatchEvent(new CustomEvent("fx:filter", { detail: { category: b.dataset.filter } }));
  });
  // When swapping pages, clear the previous page’s scroll effects
  document.addEventListener("fx:page-enter", () => window.ScrollTrigger && ScrollTrigger.getAll().forEach((t) => { if (t.trigger && !t.trigger.isConnected) t.kill(); }));
})();
