// Stay list — card photo Splide (same defaults as the original hotel-list.js), wishlist button
(() => {
  document.querySelectorAll(".mm-hotel__photo").forEach((el) => {
    if (el.querySelectorAll(".splide__slide").length < 2) return;
    new Splide(el, { arrowPath: " ", speed: 500, easing: "cubic-bezier(0.165, 0.84, 0.44, 1)", type: "loop", autoWidth: true, snap: true, flickMaxPages: 0.5 }).mount();
  });
  document.querySelectorAll(".mm-hotel__fav").forEach((b) => b.addEventListener("click", () => {
    const on = b.classList.toggle("is-active");
    b.setAttribute("aria-pressed", String(on));
  }));
})();
