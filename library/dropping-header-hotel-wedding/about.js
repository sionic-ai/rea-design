// About: a full black-and-white photo drifts from -40% to 20% (large screens), and a white panel grows from 0.5× over it to cover it
(() => {
  TR.views.about = () => {
    gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".tr-ab-beyond", { scale: 0.5 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".tr-imagearea", start: "30% bottom", end: "40% top-=20%", scrub: true } });
      gsap.fromTo(".tr-imagearea__inner", { yPercent: -40 }, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".tr-imagearea", start: "5% bottom", end: "bottom top", scrub: true } });
    });
  };
})();
