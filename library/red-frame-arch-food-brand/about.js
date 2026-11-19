// Motion unique to About: a small photo stays pinned while growing to fill the screen, and history cells light up one by one.
// Original is end "+=500vh" is written that way but ScrollTrigger doesn’t know vh and reads it as 500px — follow the length that is visible on screen.
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({
      scrollTrigger: { trigger: "[data-grow]", start: "top top", end: "+=500", scrub: 0.25, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
    })
      .to("[data-grow-box]", { width: "100%", height: "100vh", ease: "none" }, 0)
      .to("[data-grow-img]", { scale: 1, ease: "none" }, 0);

    document.querySelectorAll("[data-tl]").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 83%", once: true, onEnter: () => el.classList.add("is-in") });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set("[data-grow-img]", { scale: 1 });
    document.querySelectorAll("[data-tl]").forEach((el) => el.classList.add("is-in"));
  });
})();
