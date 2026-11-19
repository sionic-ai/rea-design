// Body shared by three pages — Lenis (1.5s, cubic-bezier(.25,0,.35,1)), page fade-in, phone menu drawer, header on dark panels, in-page navigation
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Original bezier-easing(.25,0,.35,1) — finds t from x with Newton’s method
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = (t) => ((ax * t + bx) * t + cx) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) { const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= (fx(t) - x) / d; }
      t = Math.min(1, Math.max(0, t));
      return ((ay * t + by) * t + cy) * t;
    };
  };
  const quinticInOut = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.5, easing: bezier(0.25, 0, 0.35, 1) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.eLenis = lenis;

  // On the home page the opening turns on the body (index.js) — the rest fade in on load with 1s ease-in-out.
  if (!document.body.classList.contains("e-home")) document.addEventListener("DOMContentLoaded", () => root.classList.add("e-shown"));

  const menuBtn = document.querySelector(".e-menu-btn"), shade = document.querySelector(".e-menu-shade");
  menuBtn?.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", String(root.classList.toggle("is-menu"))));
  shade?.addEventListener("click", () => { root.classList.remove("is-menu"); menuBtn?.setAttribute("aria-expanded", "false"); });

  // From when the panel top passes 50px above the screen until the bottom passes, the header line is white text — phone-only panels only below 768px
  const dark = (el) => ScrollTrigger.create({ trigger: el, start: "top 50px", end: "bottom 50px", onToggle: (s) => root.classList.toggle("is-dark", s.isActive) });
  document.querySelectorAll("[data-dark]").forEach(dark);
  if (innerWidth < 769) document.querySelectorAll("[data-dark-sp]").forEach(dark);

  ScrollTrigger.create({ trigger: document.body, start: "top top", onEnter: () => root.classList.add("is-scrolled"), onLeaveBack: () => root.classList.remove("is-scrolled") });

  document.querySelectorAll("[data-anchor]").forEach((a) => a.addEventListener("click", (e) => {
    const to = document.querySelector(a.dataset.anchor);
    if (!to) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(to, { duration: +(a.dataset.duration || 2), easing: quinticInOut });
    else to.scrollIntoView();
  }));
})();
