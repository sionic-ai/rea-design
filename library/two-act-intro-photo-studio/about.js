// Concept: the fixed background floats up 100px while passing the page (scrub 1.5), and once past the page center the front photo switches off to reveal the second photo
(() => {
  const page = document.querySelector(".ws-cpt");
  const bg = page?.querySelector(".ws-cpt__bg");
  if (!page || !bg) return;
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(bg, { y: -100, scrollTrigger: { trigger: page, start: "top top", end: "bottom bottom", scrub: 1.5, invalidateOnRefresh: true } });
  });
  ScrollTrigger.create({ trigger: page, start: "center center", onEnter: () => bg.classList.add("is-changed"), onLeaveBack: () => bg.classList.remove("is-changed") });
})();
