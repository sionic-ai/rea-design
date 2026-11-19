// Detail: Splide 4.1.4 same as the original — the main track (centered, auto width, .6x height, gap 20) and 80px thumbnails (click goes to that slide) are tied together with sync.
(() => {
  if (!window.Splide) return;
  document.querySelectorAll("[data-blog-slider]").forEach((wrap) => {
    const mainEl = wrap.querySelector("[data-main-slider]"), thumbEl = wrap.querySelector("[data-thumbnail-slider]");
    if (!mainEl || !thumbEl) return;
    const main = new Splide(mainEl, {
      gap: 20, heightRatio: 0.6, pagination: false, arrows: false, drag: true, autoWidth: true, focus: "center",
      breakpoints: { 640: { gap: 10 } },
    });
    const thumbs = new Splide(thumbEl, {
      rewind: true, arrows: false, fixedWidth: 80, fixedHeight: 80, isNavigation: true, gap: 8, focus: "center", pagination: false, cover: true,
      dragMinThreshold: { mouse: 4, touch: 10 },
      breakpoints: { 640: { fixedWidth: 45, fixedHeight: 45, gap: 5 } },
    });
    main.sync(thumbs);
    main.mount();
    thumbs.mount();
  });
})();
