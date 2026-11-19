// Series row — same as the original Swiper 6 (cssMode, slide width auto, gap 20, wheel · keyboard · arrows). The original also builds it after load
(() => {
  if (!window.Swiper) return;
  const make = () => document.querySelectorAll(".cl-row").forEach((el) => new Swiper(el, {
    cssMode: true, slidesPerView: "auto", spaceBetween: 20, mousewheel: true, keyboard: true,
    navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
  }));
  if (document.readyState === "complete") make(); else addEventListener("load", make, { once: true });
})();
