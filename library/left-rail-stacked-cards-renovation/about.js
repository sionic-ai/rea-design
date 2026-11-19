// Big circle line — rises -15vw while the body passes, and past the halfway point grows to 2x (original page-about inline)
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.to(".rl-circle__ratio", { y: "-15vw", ease: "none", scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: true } });
  gsap.to(".rl-circle__ratio", { scale: 2, ease: "none", scrollTrigger: { trigger: "main", start: "50% top", end: "bottom top", scrub: true } });
})();
