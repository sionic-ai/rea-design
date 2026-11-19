// Store guide: the large photo slider and the thumbnail row are tied together with Splide (pressing a thumbnail slides the large photo to that slide)
(() => {
  if (!window.Splide) return;
  document.querySelectorAll(".ab-si").forEach((box) => {
    const mainEl = box.querySelector("[data-main-slider]"), thumbEl = box.querySelector("[data-thumbnail-slider]");
    if (!mainEl || !thumbEl) return;
    // Original settings as they are — big photos are swiped (gap 20 · centered), small images are 196×130 cells
    const main = new Splide(mainEl, { gap: 20, perPage: 1, pagination: false, arrows: false, drag: true, autoWidth: true, focus: "center", breakpoints: { 640: { gap: 10 } } });
    const thumbs = new Splide(thumbEl, { rewind: true, arrows: false, fixedWidth: 196, fixedHeight: 130, isNavigation: true, pagination: false, cover: true, dragMinThreshold: { mouse: 4, touch: 10 }, breakpoints: { 1024: { fixedWidth: 130, fixedHeight: 87 }, 575: { fixedWidth: 100, fixedHeight: 67 } } });
    main.sync(thumbs);
    main.mount();
    thumbs.mount();
  });
})();
