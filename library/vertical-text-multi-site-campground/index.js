// Home page — three card sliders (Swiper 11: slide width in css, 36px gap (phone 3.13vw), prev/next buttons · draggable bar) and the map travel-time accordion (only one open, .2s ease-out).
(() => {
  const desk = matchMedia("(min-width: 834px)");
  const gap = () => (desk.matches ? 36 * Math.min(innerWidth, 1352) / 1352 : innerWidth * 0.0313261 * 2 / 2);
  if (window.Swiper) {
    document.querySelectorAll(".cs").forEach((sec) => {
      const el = sec.querySelector(".cs__swiper");
      if (!el) return;
      const sw = new Swiper(el, {
        slidesPerView: "auto",
        spaceBetween: gap(),
        speed: 300,
        navigation: { prevEl: sec.querySelector(".cs__prev"), nextEl: sec.querySelector(".cs__next") },
        scrollbar: { el: sec.querySelector(".cs__bar"), draggable: true },
      });
      addEventListener("resize", () => { sw.params.spaceBetween = gap(); sw.update(); });
    });
  }

  const items = [...document.querySelectorAll(".map__item")];
  const open = (i) => items.forEach((it, k) => {
    const b = it.querySelector(".map__btn"), p = it.querySelector(".map__panel");
    const on = k === i;
    b.classList.toggle("is-open", on);
    b.setAttribute("aria-expanded", String(on));
    p.style.maxHeight = on ? `${p.scrollHeight}px` : "0px";
  });
  items.forEach((it, k) => it.querySelector(".map__btn").addEventListener("click", () => open(k)));
  if (items.length) open(0);
})();
