// Menu drawer (is-active on header bar, drawer and overlay, closes on overlay click or Esc) and in-page link scroll (.5s power2.out, 50px up) — values from original fv.js and other.js
(() => {
  const header = document.querySelector(".cp-header");
  const drawer = document.querySelector(".cp-drawer");
  const overlay = document.querySelector(".cp-overlay");
  const menu = document.querySelector(".cp-menu");
  if (!header || !drawer || !overlay || !menu) return;
  const set = (open) => {
    [header, drawer, overlay].forEach((n) => n.classList.toggle("is-active", open));
    menu.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menu.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); set(!header.classList.contains("is-active")); });
  overlay.addEventListener("click", (e) => { e.preventDefault(); set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  drawer.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => set(false)));

  if (window.gsap && window.ScrollToPlugin) {
    gsap.registerPlugin(ScrollToPlugin);
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        gsap.to(window, { duration: reduce ? 0 : 0.5, ease: "power2.out", scrollTo: { y: target, offsetY: 50, autoKill: true } });
      });
    });
  }
})();
