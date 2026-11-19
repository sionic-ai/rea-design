// Subpage photo slider — Swiper 8.0.5 as in the original (About region photo strip·pricing photos), pin in front of the event venue.
(() => {
  addEventListener("load", () => {
    if (!window.Swiper) return;
    document.querySelectorAll(".rz-carousel").forEach((el) => new Swiper(el, {
      loop: true, slidesPerView: "auto", centeredSlides: true, spaceBetween: 20, speed: 600,
      navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
    }));
    document.querySelectorAll(".rz-plan__photo").forEach((el) => new Swiper(el, {
      loop: true, speed: 600, effect: "fade", fadeEffect: { crossFade: true },
      navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
    }));
  });
  document.querySelectorAll(".rz-tabs").forEach((tabs) => tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-current", x === b));
  }));
  const pin = '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8Z"/><circle cx="6" cy="5" r="1.8"/></svg>';
  document.querySelectorAll("[data-pin]").forEach((el) => el.insertAdjacentHTML("afterbegin", pin));
})();
