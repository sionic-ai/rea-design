// The Hero photo moves down 25% while passing from top to bottom of the screen, flowing slower than the text.
(() => {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const bg = document.querySelector(".fp-hero__bg");
    gsap.fromTo(bg.querySelector(".wf-img"), { yPercent: 0 }, { yPercent: 25, ease: "none", scrollTrigger: { trigger: bg, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });
})();
