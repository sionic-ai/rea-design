// Work process: numbers exactly as in the simple version (initEvents2) of the original PageProcessoCreativo.js.
(() => {
  const AM = (window.AM = window.AM || { pages: {} });
  AM.pages.process = (main, { mobile }) => {
    // When the photo slot reaches 65% of the screen, the clip opens from bottom to top in 1.2s power2.out
    main.querySelectorAll("[data-reveal]").forEach((el) => {
      const clip = el.querySelector(".p-clip");
      if (clip) gsap.to(clip, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: el.querySelector(".p-image"), start: `top ${el.dataset.triggerStart || 65}%`, end: "bottom bottom" } });
    });
    // Each cell rises −25vh × speed according to its speed (1·2·3) (scrub 1, stopped on phone)
    main.querySelectorAll(".p-par").forEach((el) => {
      const speed = mobile ? 0 : +el.dataset.speed || 1;
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } }).to(el.querySelector(".p-tr"), { y: `${-25 * speed}vh`, ease: "none" });
    });
  };
})();
