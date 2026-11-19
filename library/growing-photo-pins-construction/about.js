// Company About only: the photo box widens from 90% (max 1500px) to full screen width while passing from 80% at screen bottom to 50% center (scrub .5),
// The inner photo drifts separately at y -200 (original c-fv.js value).
(() => {
  const box = document.querySelector(".ufv__box");
  if (!box || KZ.reduced) return;
  const bg = box.querySelector(".ufv__bg");
  gsap.to(bg, { y: -200, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 0.5 } });
  gsap.fromTo(box, { width: () => box.parentElement.clientWidth * 0.9 > 1500 ? 1500 : box.parentElement.clientWidth * 0.9 }, {
    width: () => document.documentElement.clientWidth, maxWidth: "none", ease: "none",
    scrollTrigger: { trigger: box, start: "top 80%", end: "bottom 50%", scrub: 0.5, invalidateOnRefresh: true },
  });
})();
