// 2024 first page — original ZE component. Once the images arrive, the Hero image sharpens from brightness 3, blur 4px, scale 1.05 over 2.5s power2.out, and
// The hero frame stays stuck to the screen (no pinSpacing) while, over one screen of scroll, the theme panel rises at yPercent −100 and covers it (.9) — meanwhile the picture goes blur 40px · .5 · 1.05×, the logo .9× (.5), and the last .5 holds still
(() => {
  const MR = window.MR;
  const body = document.body;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ scrollTrigger: {
      trigger: ".js-l_visual", start: "top top", end: "bottom top", scrub: true, pin: true, pinSpacing: false,
      onEnter: () => body.classList.remove("is-bg-default"), onLeave: () => body.classList.add("is-bg-default"),
      onEnterBack: () => body.classList.remove("is-bg-default"), onLeaveBack: () => { if (scrollY > 0) body.classList.add("is-bg-default"); },
    } });
    tl.to(".js-l_concept", { yPercent: -100, duration: 0.9, ease: "none" })
      .to(".js-l_visual .js-visual", { filter: "blur(40px)", opacity: 0.5, scale: 1.05, duration: 0.9, ease: "none" }, 0)
      .to(".js-l_visual .js-logo", { scale: 0.9, duration: 0.5, ease: "none" }, 0)
      .to({}, { duration: 0.5 });
  });
  MR.parallax();
  MR.inview();
  MR.loaded(() => {
    if (MR.reduce) return;
    gsap.fromTo(".js-l_visual .js-visual .js-visual_image", { filter: "brightness(3) blur(4px)", scale: 1.05 }, { filter: "brightness(1) blur(0px)", scale: 1, duration: 2.5, ease: "power2.out" });
  });
})();
