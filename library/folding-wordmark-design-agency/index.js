/* Home — the bottom wordmark (95vw · bottom 20px) shrinks and rises to the header logo (100px), tied to scroll until the hero is fully scrolled down,
   The moment the top edge of the body touches the top of the screen it swaps with the header logo. One-line News fades over three times the Hero distance. News cards stack like bricks */
(() => {
  const mm = gsap.matchMedia();
  frReady.then(() => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".fr-landing", { width: "95vw", bottom: 20, ease: "none", scrollTrigger: { trigger: ".fr-hero", scrub: true, start: "top top", end: "bottom 10" } });
      gsap.to(".fr-landing", { opacity: 0, ease: "none", duration: 0.3, scrollTrigger: { trigger: "main", scrub: true, start: "top top", end: "top top" } });
      gsap.to(".fr-head__center", { opacity: 1, ease: "none", duration: 0.3, scrollTrigger: { trigger: "main", scrub: true, start: "top top", end: "top top" } });
      gsap.to(".fr-tagline", { opacity: 0, ease: "none", display: "none", scrollTrigger: { trigger: ".fr-hero", scrub: true, start: "top 50vh", end: "top -200vh" } });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".fr-landing", { display: "none" });
      gsap.set(".fr-head__center", { opacity: 1 });
    });
    const wall = document.querySelector("[data-masonry]");
    if (wall && window.Masonry) {
      new Masonry(wall, { itemSelector: ".fr-card-w", columnWidth: 10, gutter: 10 });
      new Masonry(wall, {});
    }
  });
})();
