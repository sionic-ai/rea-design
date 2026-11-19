// First page — the rest of the opening timeline (1.59s info line, 1.88s first two work plates), review slider
(() => {
  const slides = [...document.querySelectorAll(".rh-quote__slide")];
  let at = 0;
  const show = (n) => { at = (n + slides.length) % slides.length; slides.forEach((s, i) => s.classList.toggle("is-on", i === at)); };
  document.querySelector(".rh-quote__prev")?.addEventListener("click", () => show(at - 1));
  document.querySelector(".rh-quote__next")?.addEventListener("click", () => show(at + 1));

  if (!window.gsap) return;
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const circ = "circ.out";
    const tl = gsap.timeline();
    tl.fromTo(".rh-nav, [data-hero='info']", { opacity: 0 }, { opacity: 1, duration: 0.68, ease: "none" }, 1.59);
    tl.fromTo("[data-hero='card-up']", { opacity: 0, y: "8rem" }, { opacity: 1, y: 0, duration: 1, ease: circ }, 1.88);
    tl.fromTo("[data-hero='card-right']", { opacity: 0, x: "5rem" }, { opacity: 1, x: 0, duration: 1, ease: circ }, 1.88);
    tl.fromTo(".rh-hero__btn-arrow", { opacity: 0, xPercent: -100, yPercent: -100 }, { opacity: 1, xPercent: 0, yPercent: 0, duration: 0.64, ease: circ }, 2.2);
    return () => tl.kill();
  });
})();
