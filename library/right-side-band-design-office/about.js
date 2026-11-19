// While the right item enters 100px above the screen bottom and touches the center, the left photo of the same number opens from bottom to top (original facilities-layout).
(() => {
  if (!window.gsap) return;
  const items = document.querySelectorAll(".arch__item");
  const imgs = document.querySelectorAll(".arch__img");
  window.AC.mm.add("(prefers-reduced-motion: no-preference) and (min-width: 801px)", () => {
    items.forEach((item, i) => {
      if (i === 0) return;
      gsap.fromTo(imgs[i], { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)",
        scrollTrigger: { trigger: item, start: "top bottom-=100px", end: "top center", scrub: 1 },
      });
    });
  });
})();
