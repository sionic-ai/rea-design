// Work detail — gallery drawer (IX2 Project – Gallery Open·Close) and the arrow below the cover
(() => {
  // The site builder’s IX2 inOutCubic is a true cubic curve (power2.inOut) — a cubic-bezier approximation differs at both ends, so the length looks stretched
  const cubic = "power2.inOut";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = reduce ? 0 : 1;
  const gallery = document.querySelector(".gallery");
  const box = gallery?.querySelector(".gallery-box");
  const shift = document.querySelectorAll(".case-wrap, .sidebar.f");
  const open = () => {
    gallery.style.display = "block";
    gallery.setAttribute("aria-hidden", "false");
    site.loco?.stop();
    gsap.fromTo(box, { xPercent: 100 }, { xPercent: 0, duration: 0.8 * d, ease: cubic });
    if (innerWidth > 991) gsap.to(shift, { xPercent: -43, duration: 0.8 * d, ease: cubic });
  };
  const close = () => {
    gsap.to(box, { xPercent: 100, duration: 0.8 * d, ease: cubic, onComplete: () => { gallery.style.display = "none"; gallery.setAttribute("aria-hidden", "true"); site.loco?.start(); } });
    gsap.to(shift, { xPercent: 0, duration: 0.8 * d, ease: cubic });
  };
  document.querySelector(".gallery-open")?.addEventListener("click", open);
  gallery?.querySelector(".gallery-close")?.addEventListener("click", close);
  gallery?.querySelector(".gallery-overlay")?.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && gallery?.style.display === "block") close(); });

  // On the cover the nav is hidden upward (body.nav-hidden from the first image), drops down in .5s when the body (.case-wrap) is visible and goes back up in .4s when it leaves (IX2 Project – Navbar SHOW·HIDE)
  const body = document.querySelector(".case-wrap");
  if (body) new IntersectionObserver(([e]) => site.navShown(e.isIntersecting, e.isIntersecting ? 0.5 : 0.4)).observe(body);

  document.querySelector(".bar-trigger")?.addEventListener("click", () => {
    const to = document.querySelector(".case-wrap");
    if (site.loco) site.loco.scrollTo(to);
    else to.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
})();
