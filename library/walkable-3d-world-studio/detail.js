/* Work — name row rising, big screen coming in shrinking slightly into place, call card title */
(() => {
  // Original entrance door loader length (from first paint until the screen settles, ms measured by motion-probe)
  Em.gateDur = 3250;
  const mm = gsap.matchMedia();
  Em.onEnter.push(() => {
    const t = document.querySelector(".pd-name__t");
    gsap.fromTo(Em.lines(t), { yPercent: 105 }, { yPercent: 0, duration: Em.reduce ? 0 : 1.1, ease: "expo.out" });
    gsap.fromTo(".pd-video", { clipPath: "inset(100% 0 0 0 round 1rem)" }, { clipPath: "inset(0% 0 0 0 round 1rem)", duration: Em.reduce ? 0 : 1.2, ease: "expo.out" });
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".pd-shot").forEach((s) =>
      gsap.fromTo(s, { scale: 1.06, yPercent: 6 }, { scale: 1, yPercent: 0, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 30%", scrub: true } }),
    );
    document.querySelectorAll(".pd-cta__t [data-split]").forEach((el) =>
      gsap.fromTo(Em.lines(el), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".pd-cta", start: "top 75%" } }),
    );
    gsap.fromTo(".pd-statement", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: Em.ease, scrollTrigger: { trigger: ".pd-case", start: "top 75%" } });
  });
})();
