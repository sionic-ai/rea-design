// Home page motion: two seamless photo strips (autoplay delay 0, loop, straight curve) using swiper 11.2.10, same as the original, and
// What changes when the center of the section passes 66% · 33% of the screen across three facility photos (0.3s).
gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const strip = (sel, opts) => new Swiper(sel, {
  allowTouchMove: false,
  loop: true,
  autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
  ...opts,
});
strip("[data-swiper='home-facility']", { slidesPerView: 1.211355, speed: 1e4, breakpoints: { 769: { slidesPerView: 2, speed: 15e3 } } });
strip("[data-swiper='home-gallery']", { slidesPerView: 1.4325, speed: 1e4, breakpoints: { 769: { slidesPerView: 2.6875 } } });

const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  const imgs = document.querySelector("[data-fade]").children;
  gsap.set(imgs, { opacity: 0, zIndex: 0 });
  gsap.set(imgs[0], { opacity: 1, zIndex: 1 });
  const swap = (from, to) => {
    gsap.to(imgs[from], { opacity: 0, duration: 0.3 });
    gsap.to(imgs[to], { opacity: 1, duration: 0.3, zIndex: 1 });
  };
  ScrollTrigger.create({ trigger: imgs[0].parentNode, start: "center 66%", onEnter: () => swap(0, 1), onLeaveBack: () => swap(1, 0) });
  ScrollTrigger.create({ trigger: imgs[0].parentNode, start: "center 33%", onEnter: () => swap(1, 2), onLeaveBack: () => swap(2, 1) });
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  const imgs = document.querySelector("[data-fade]").children;
  gsap.set(imgs, { opacity: 0 });
  gsap.set(imgs[imgs.length - 1], { opacity: 1 });
});
