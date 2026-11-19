// Detail — while the body rises from 90% of the screen to the top, the head photo rises -10% and goes 1.05 → 1, other projects use swiper (auto width) + prev/next buttons
(() => {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.to(".rl-detail .mv .wf-img", { y: "-10%", scale: 1, scrollTrigger: { trigger: ".rl-detail .contents", start: "top 90%", end: "top top", scrub: true } });
  new Swiper(".rl-detail .others", { slidesPerView: "auto", navigation: { prevEl: ".swiper-nav .prev", nextEl: ".swiper-nav .next" } });
})();
