// About: city photo parallax — original ParallaxMedia (1.2x · bottom axis, yPercent 0 → 20 from when the section enters the bottom of the screen until it leaves at the top, scrub).
// It is a script inside the wrapper, so it reruns every time we arrive via a same-document transition — clean up what was hooked when leaving
(() => {
  const run = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-parallax]").forEach((box) => {
        gsap.to(box.firstElementChild, { yPercent: +box.dataset.parallax || 20, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    document.addEventListener("fx:page-leave", () => mm.revert(), { once: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
