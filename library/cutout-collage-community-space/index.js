// Three hero strips and a four-scene photo slider — original Swiper 8.0.5 settings as-is. The strips start running .1s after the curtain begins to clear (original load + 2s + 100ms)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ticker = (el) => new Swiper(el, {
    loop: true, loopedSlides: 10, slidesPerView: "auto",
    spaceBetween: +el.dataset.gap, speed: +el.dataset.speed, allowTouchMove: false,
    autoplay: { delay: 0, disableOnInteraction: false },
  });
  document.addEventListener("rz:ready", () => {
    if (!window.Swiper) return;
    setTimeout(() => {
      if (!reduce) document.querySelectorAll(".rz-hero__row").forEach(ticker);
      document.querySelectorAll(".rz-fade").forEach((el) => new Swiper(el, {
        loop: true, effect: "fade", fadeEffect: { crossFade: true }, threshold: 10, speed: 600, slidesPerView: "auto", allowTouchMove: true,
        pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
        breakpoints: { 768: { allowTouchMove: false, navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") } } },
      }));
    }, 100);
  }, { once: true });
  // People strip — 18s per cell, runs on load
  addEventListener("load", () => {
    if (!window.Swiper || reduce) return;
    new Swiper(".rz-people__slider", { loop: true, loopedSlides: 5, slidesPerView: "auto", spaceBetween: 0, speed: 18000, allowTouchMove: false, autoplay: { delay: 0, disableOnInteraction: false } });
  });
  // Event cards: advance 2.1 cards on phone only (original 768 and below)
  addEventListener("load", () => {
    if (!window.Swiper || innerWidth > 768) return;
    const wrap = document.querySelector(".rz-event-wrap");
    const ul = wrap?.querySelector(".rz-events");
    if (!ul) return;
    const box = document.createElement("div");
    box.className = "swiper rz-events-swiper";
    ul.classList.add("swiper-wrapper");
    [...ul.children].forEach((li) => li.classList.add("swiper-slide"));
    ul.before(box);
    box.append(ul);
    new Swiper(box, { speed: 600, slidesPerView: 2.1, spaceBetween: 10 });
  });
  // Pin before event venue
  const pin = '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8Z"/><circle cx="6" cy="5" r="1.8"/></svg>';
  document.querySelectorAll("[data-pin]").forEach((el) => el.insertAdjacentHTML("afterbegin", pin));
})();
