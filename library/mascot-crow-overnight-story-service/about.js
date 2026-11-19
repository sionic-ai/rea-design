/* Team About — columns of the member grid shift at different speeds on scroll (even columns reverse), and the second row of the closing plate settles into place */
(() => {
  const { reduce, mm } = window.CFS;
  if (reduce) return;
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
    document.querySelectorAll(".crew__col").forEach((col, i) => {
      gsap.fromTo(col, { y: i % 2 ? 90 : 0 }, { y: i % 2 ? -90 : -40, ease: "none", scrollTrigger: { trigger: ".crew", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const t1 = document.querySelector(".endcta__t1"), t2 = document.querySelector(".endcta__t2");
    gsap.timeline({ scrollTrigger: { trigger: ".endcta", start: "top 60%", end: "top 10%", scrub: true } })
      .fromTo(t1, { color: getComputedStyle(document.querySelector(".is-accent") || document.body).color }, { color: window.CFSCrow.color("var(--site-white-60)"), ease: "none" }, 0)
      .fromTo(t2, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.3);
  });
})();
