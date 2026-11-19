// Photo fade on the space detail (original space_photos_slider: fade crossFade · ring · arrows, clicking a thumbnail does slideToLoop) and the pricing tabs.
(() => {
  const el = document.querySelector(".hy-photos__slider");
  if (el && typeof Swiper !== "undefined") {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = new Swiper(el, { effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: still ? 0 : 300, navigation: { nextEl: ".ph-next", prevEl: ".ph-prev" } });
    document.querySelectorAll(".hy-thumbs [data-i]").forEach((b) => b.addEventListener("click", () => s.slideToLoop(+b.dataset.i)));
  }
  document.querySelectorAll(".hy-course").forEach((tabs) => tabs.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
  })));
})();
