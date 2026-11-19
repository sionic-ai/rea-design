// First page — menu card Splide (3 cards, gap 74, 1s), news card Splide (rtl stacking from right to left, ltr on phones)
(() => {
  // Where the original icon-font arrow sat — a thin chevron line
  const arrowPath = "M13 4l16 16-16 16";

  const menu = document.querySelector("#menu .splide");
  if (menu && window.Splide) {
    new Splide(menu, {
      type: "slide",
      perPage: 3,
      arrows: true,
      drag: true,
      pagination: false,
      gap: 74,
      speed: 1000,
      arrowPath,
      breakpoints: { 767: { gap: 36, autoWidth: true, perPage: 1 } },
    }).mount();
  }

  const news = document.querySelector("#news .splide");
  const prev = document.querySelector(".cb-news__btn > .-prev");
  const next = document.querySelector(".cb-news__btn > .-next");
  if (news && window.Splide) {
    const s = new Splide(news, {
      type: "slide",
      direction: "rtl",
      autoWidth: true,
      arrows: false,
      drag: true,
      pagination: false,
      speed: 1000,
      breakpoints: { 767: { direction: "ltr", autoWidth: true, perPage: 1 } },
    });
    // Because it’s rtl, the Prev button goes to the next section (>), and the ”Next” button goes to the previous section(<) goes as is — original unchanged
    prev?.addEventListener("click", () => s.go(">"));
    next?.addEventListener("click", () => s.go("<"));
    s.mount();
  }
})();
