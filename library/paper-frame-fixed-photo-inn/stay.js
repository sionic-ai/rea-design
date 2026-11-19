// Room photos — original roomSlider3: loop, one slide, centered, gap 10, 0.8s every 3s, dots and arrows. The collapse is jQuery slideToggle(300) rebuilt as a height WAAPI animation.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Swiper) document.querySelectorAll(".roomSlider3").forEach((el) => {
    new Swiper(el, { loop: true, slidesPerView: 1, centeredSlides: true, spaceBetween: 10, autoplay: { delay: 3000, disableOnInteraction: false }, speed: 800, pagination: { el: el.querySelector(".swiper-pagination"), clickable: true }, navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") }, observer: true, observeParents: true });
  });
  const quad = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  const slide = (el, open) => {
    if (open) el.style.display = "block";
    const h = el.scrollHeight;
    const a = el.animate({ height: open ? ["0px", h + "px"] : [h + "px", "0px"] }, { duration: reduce ? 0 : 300, easing: quad });
    a.onfinish = () => { if (!open) el.style.display = "none"; };
  };
  const qs = [...document.querySelectorAll(".acdn-q")];
  qs.forEach((q) => q.addEventListener("click", () => {
    qs.filter((o) => o !== q && o.classList.contains("open")).forEach((o) => { o.classList.remove("open"); slide(o.nextElementSibling, false); });
    const open = q.classList.toggle("open");
    slide(q.nextElementSibling, open);
  }));
})();
