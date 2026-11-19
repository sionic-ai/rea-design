// One post — header photo slider (Swiper default: .5s flip, loop, drag)
(() => {
  const OL = (window.OL = window.OL || { pages: {} });
  OL.page("article", (root) => {
    const el = root.querySelector(".ol-jh__slider");
    if (!el) return;
    const sw = new Swiper(el, {
      loop: true, speed: 500, threshold: 5, grabCursor: true, keyboard: true,
      navigation: { prevEl: el.querySelector(".ol-jh__prev"), nextEl: el.querySelector(".ol-jh__next") },
    });
    return () => sw.destroy(true, true);
  });
})();
