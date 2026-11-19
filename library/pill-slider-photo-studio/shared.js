// Site-wide: .play when visible (once at 20% from screen bottom·25% on phone — immediately if visible from the start), hamburger, orange drawer (backdrop·Esc·focus trap), smooth scroll between sections.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const play = () => {
    const targets = document.querySelectorAll(".u-anime, .u-anime-up, .u-anime-down, .u-anime-left, .u-anime-right, .u-anime-zoom");
    const margin = innerWidth <= 768 ? "0px 0px -25% 0px" : "0px 0px -20% 0px";
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("play"); io.unobserve(e.target); } }), { rootMargin: margin, threshold: 0 });
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (reduced || (r.top < innerHeight && r.bottom > 0)) t.classList.add("play");
      else io.observe(t);
    });
  };

  const hm = document.querySelector(".np-hm"), gn = document.querySelector(".np-gn"), ol = document.querySelector(".np-ol");
  const set = (open) => {
    hm.classList.toggle("open", open); gn.classList.toggle("open", open); ol.classList.toggle("open", open);
    hm.setAttribute("aria-expanded", String(open));
    hm.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) hm.focus();
  };
  hm.addEventListener("click", (e) => { e.preventDefault(); set(!hm.classList.contains("open")); });
  ol.addEventListener("click", () => set(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  gn.querySelector(".np-trap")?.addEventListener("focus", () => hm.focus());

  document.querySelectorAll("a.np-sc").forEach((a) => a.addEventListener("click", (e) => {
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: reduced ? "auto" : "smooth" });
    set(false);
  }));
  if (location.hash) {
    scrollTo({ top: 0 });
    setTimeout(() => {
      const t = document.getElementById(location.hash.slice(1));
      if (t) scrollTo({ top: scrollY + t.getBoundingClientRect().top - (outerWidth <= 768 ? 60 : 80), behavior: "smooth" });
    }, 0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", play);
  else play();
})();
