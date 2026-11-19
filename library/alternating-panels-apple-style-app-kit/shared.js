// When a black section is under the header row, flip the text, trigger each section’s rise-in as it enters the screen, and run only the visible video slots
(() => {
  const root = document.documentElement;
  const header = document.querySelector(".pa-header");

  const darks = [...document.querySelectorAll("[data-invert-header]")];
  const checkInvert = () => {
    const y = (header?.offsetHeight || 72) / 2;
    const on = darks.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    root.toggleAttribute("data-header-invert", on);
  };
  addEventListener("scroll", checkInvert, { passive: true });
  addEventListener("resize", checkInvert);
  checkInvert();

  // Browsers without scroll-linked animation paint the glass panel opacity directly within 69px.
  if (!CSS.supports("animation-timeline: scroll()")) {
    const frost = document.querySelector(".pa-header__frost");
    const paint = () => { if (frost) frost.style.opacity = Math.min(1, scrollY / 69).toFixed(3); };
    addEventListener("scroll", paint, { passive: true });
    paint();
  }

  const burger = document.querySelector(".pa-burger");
  const setMenu = (on) => { root.toggleAttribute("data-menu-open", on); burger?.setAttribute("aria-expanded", String(on)); };
  burger?.addEventListener("click", () => setMenu(!root.hasAttribute("data-menu-open")));
  document.querySelector(".pa-menu-backdrop")?.addEventListener("click", () => setMenu(false));
  document.querySelectorAll(".pa-menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.setAttribute("data-revealed", "");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".pa-rise").forEach((el) => io.observe(el));

  // Video slot — the original plays only while visible (data-playing) and stops when it leaves. Our placeholder only sets the same flag
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target.querySelector("video");
    e.target.toggleAttribute("data-playing", e.isIntersecting);
    if (!v) return;
    if (e.isIntersecting) v.play?.().catch(() => {}); else v.pause?.();
  }), { threshold: 0.5 });
  document.querySelectorAll("[data-video]").forEach((el) => vio.observe(el));
})();
