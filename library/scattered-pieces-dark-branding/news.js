// News — category filter, article header photo parallax (yPercent 10, scrub), body paragraphs float up when visible
(() => {
  const btns = document.querySelectorAll("[data-f]");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-on", x === b));
    document.querySelectorAll("[data-cat]").forEach((p) => (p.hidden = b.dataset.f !== "all" && p.dataset.cat !== b.dataset.f));
  }));
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((el) => gsap.to(el, { yPercent: -10, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));
    gsap.utils.toArray(".a-body > *, .a-callout, .a-pair > *, .post").forEach((el) => gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: "premiumGlide", scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none none" } }));
  });
})();
