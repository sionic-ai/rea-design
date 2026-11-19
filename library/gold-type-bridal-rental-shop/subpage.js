// Sub page — store region tabs (original Alpine cat filter), opening the detail grade table, detail photo swiper (5 thumbnails → vertical column at 768 and up, big photo fades)
(() => {
  const areas = document.querySelector("[data-areas]");
  if (areas) {
    const btns = [...areas.querySelectorAll("[data-area]")];
    const regions = [...document.querySelectorAll("[data-region]")];
    btns.forEach((b) => b.addEventListener("click", () => {
      const cat = b.dataset.area;
      btns.forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      regions.forEach((r) => { r.hidden = !(cat === "all" || r.dataset.region === cat); });
      window.ScrollTrigger?.refresh();
    }));
  }

  const q = document.querySelector(".rd-item__q");
  const grade = document.querySelector(".rd-grade");
  if (q && grade) {
    q.addEventListener("click", () => { window.rdShow(grade); q.setAttribute("aria-expanded", "true"); });
    grade.querySelector(".rd-grade__close")?.addEventListener("click", () => { window.rdHide(grade); q.setAttribute("aria-expanded", "false"); });
  }

  if (window.Swiper && document.querySelector("#item-gallery")) {
    const thumbs = new Swiper("#item-gallery-thumbs", { direction: "horizontal", slidesPerView: 5, spaceBetween: 10, autoHeight: true, breakpoints: { 768: { direction: "vertical", slidesPerView: "auto", spaceBetween: 12 } } });
    new Swiper("#item-gallery", { effect: "fade", thumbs: { swiper: thumbs } });
  }
})();
