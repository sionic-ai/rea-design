(() => {
  gsap.registerPlugin(ScrollTrigger);
  const D = { lg: 1 };
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // Hero: wordmark → title (after .25s) → video and intro text (after .25s, total .1s) switch on over 1s with power4.out
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".at-hero", start: "top 80%" } });
    tl.to(".at-hero__logo", { opacity: 1, duration: D.lg, ease: "power4.out" })
      .to(".at-hero__title", { opacity: 1, duration: D.lg, ease: "power4.out" }, "<0.25")
      .to([".at-hero__media", ".at-hero__text"], { opacity: 1, duration: D.lg, ease: "power4.out", stagger: { amount: 0.1, ease: "circ.in" } }, "<0.25");
    gsap.fromTo(".at-hero__inner", { y: "-20%" }, { y: "20%", ease: "none", scrollTrigger: { trigger: ".at-hero", start: "top bottom", end: "bottom top", scrub: true } });

    // Problem paragraphs: 1s each at 75% of the screen, 1s apart
    gsap.to(".at-reveal__item", { opacity: 1, duration: D.lg, ease: "power4.out", stagger: { each: 1 }, scrollTrigger: { trigger: ".at-reveal", start: "top 75%" } });
    return () => gsap.set(".at-hero [data-hero-in], .at-reveal__item", { clearProps: "opacity" });
  });
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => gsap.set(".at-hero [data-hero-in], .at-reveal__item", { opacity: 1 }));
})();
