// Home page only — the two layers of hero photos (blurred background · arch window) change by swiper fade every 10 seconds over 1.5s and the new photo goes 1.2 → 1 (13.5s),
// The region button changes following the current section and moves on immediately when pressed. On wide panels, the left logo text rises -5vh and fades while the intro text comes up
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buttons = document.querySelectorAll(".rl-mv__visual .locations button");
  let at = 1;
  const zoom = (swiper) => {
    const img = swiper.el.querySelector(".swiper-slide-active .wf-img");
    if (img && !reduce) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 13.5 });
  };
  const opts = (extra) => ({ slidesPerView: 1, initialSlide: 2, speed: reduce ? 0 : 1500, autoplay: reduce ? false : { delay: 10000 }, effect: "fade", fadeEffect: { crossFade: true }, loop: true, allowTouchMove: false, ...extra });
  const bg = new Swiper(".rl-mv__visual .bg", opts({
    on: {
      slideNextTransitionStart(s) {
        zoom(s);
        buttons[at]?.classList.remove("now");
        at = at === 0 ? 1 : 0;
        buttons[at]?.classList.add("now");
      },
    },
  }));
  const kv = new Swiper(".rl-mv__visual .kv", opts({ on: { slideNextTransitionStart: zoom } }));
  buttons.forEach((b) => b.addEventListener("click", () => { bg.slideNext(); kv.slideNext(); }));

  gsap.matchMedia().add("(min-width: 860px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to(".rl-mv__kv", { y: "-5vh", opacity: 0, scrollTrigger: { trigger: ".rl-mv__kv", start: "top top", endTrigger: ".rl-mv__concept", end: "bottom bottom", scrub: true } });
  });
})();
