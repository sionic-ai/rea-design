// Careers portal home page — original values as they are
// · Hero video: while the About section’s top edge passes from 5% above the screen top → 50% above (phone: top+300 at screen bottom → top+100 at screen top)
//   clip-path inset(0 0 0 round 0) → inset(77% 31.25% 0 round 10px) (phone 90% 16%), inner --scale 1 → 1.5, no curve · scrub 1
// · Glass ribbon: while the section’s top edge goes from screen center → bottom edge at center, mask-position (original spot → 50% 0%) · scrub 1
// Like the original, hook in after .5s and re-measure ScrollTrigger (after video · image heights settle)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mv = document.querySelector(".rp-mv");
  const clip = mv?.querySelector(".rp-mv__clip");
  const intro = document.querySelector(".rp-intro");
  const cs = mv && getComputedStyle(mv);
  const v = (n) => cs.getPropertyValue(n).trim();

  setTimeout(() => {
    const mm = gsap.matchMedia();
    mm.add({ isPC: "(min-width: 768px)", isSP: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { isSP, reduce } = ctx.conditions;
      if (reduce) return;
      if (clip && intro) {
        gsap.fromTo(clip, { "clip-path": "inset(0 0 0 round 0)", "--scale": 1 }, {
          ease: "none",
          "clip-path": () => `inset(${v("--clip-top")} ${v("--clip-side")} 0 round ${v("--clip-round")})`,
          "--scale": () => `${v("--zoom")}`,
          scrollTrigger: { trigger: intro, start: isSP ? "top+=300 bottom" : "top-=5% top", end: isSP ? "top+=100 top" : "top-=50% top", scrub: 1, fastScrollEnd: false },
        });
      }
      document.querySelectorAll(".js-bg-line").forEach((el) => {
        const from = getComputedStyle(el).getPropertyValue("mask-position").trim();
        gsap.fromTo(el, { "mask-position": from }, { ease: "none", "mask-position": "50% 0%", scrollTrigger: { trigger: el, start: "top center", end: "bottom center", scrub: 1, fastScrollEnd: false } });
      });
    });
    ScrollTrigger.refresh();
  }, 500);
})();
