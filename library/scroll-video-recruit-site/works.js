// Work: header photo splide fade (as in the original — every 3 seconds, 2-second transition, no drag or hover pause), vertical strip pinned beside “Why · How”,
// When the employee voices section reaches screen center it sticks, and the next case covers over it and passes by.
// Original case.js — vertical strip: top top+=Head height · +=200% / voice: bottom center · +=200% · pinSpacing false
(() => {
  const el = document.querySelector(".cs-mv__slider");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (el && window.Splide) {
    new Splide(el, { type: "fade", rewind: true, autoplay: !reduce, interval: 3000, speed: 2000, pauseOnHover: false, pauseOnFocus: false, arrows: false, pagination: false, drag: false }).mount();
  }
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const head = () => document.querySelector(".w-head")?.offsetHeight || 0;
  addEventListener("load", () => {
    document.querySelectorAll("[data-pinwrap]").forEach((wrap) => {
      ScrollTrigger.create({ trigger: wrap, start: "bottom center", end: "+=200%", pin: true, pinSpacing: false });
    });
    document.querySelectorAll("[data-side]").forEach((side) => {
      ScrollTrigger.create({ trigger: side, start: () => `top top+=${head()}`, end: "+=200%", pin: true, pinSpacing: false, invalidateOnRefresh: true });
    });
    ScrollTrigger.refresh();
  });
})();
