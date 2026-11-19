// Shared: Lenis (original smooth-1.0.2 — lerp .07, wheel ×1, driven by the GSAP clock), top date and time, phone menu panel
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.vLenis = lenis;
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      const to = document.querySelector(a.getAttribute("href"));
      if (to) { e.preventDefault(); lenis.scrollTo(to); }
    });
  }
  const d = document.querySelector("[data-date]"), t = document.querySelector("[data-time]");
  const tick = () => {
    const n = new Date();
    if (d) d.textContent = `${n.getFullYear()}Year ${n.getMonth() + 1}Month ${n.getDate()}Day`;
    if (t) t.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  };
  tick();
  setInterval(tick, 10000);
  const menu = document.querySelector(".mnav"), burger = document.querySelector(".hx__burger");
  const open = (v) => { menu.classList.toggle("is-open", v); menu.setAttribute("aria-hidden", String(!v)); burger?.setAttribute("aria-expanded", String(v)); };
  burger?.addEventListener("click", () => open(!menu.classList.contains("is-open")));
  menu?.querySelector(".mnav__close").addEventListener("click", () => open(false));
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open(false)));
})();
