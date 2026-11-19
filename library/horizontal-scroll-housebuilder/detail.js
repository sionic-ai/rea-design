// Case detail — ties the large photo slider and the thumbnail row below (original Splide 4.1.4 options as is, only the arrow graphics are ours)
(() => {
  const main = document.querySelector(".th-gallery__main"), thumbs = document.querySelector(".th-gallery__thumbs");
  if (!main || !thumbs || !window.Splide) return;
  const arrowPath = "M14 37 31 20 14 3 12.6 4.4 28.2 20 12.6 35.6Z";
  const big = new Splide(main, { gap: 20, heightRatio: 0.6, pagination: false, arrows: true, drag: true, autoWidth: true, focus: "center", arrowPath, breakpoints: { 640: { gap: 10 } } });
  const nav = new Splide(thumbs, { rewind: true, arrows: false, fixedWidth: 80, fixedHeight: 55, isNavigation: true, gap: 10, focus: "center", pagination: false, cover: true, dragMinThreshold: { mouse: 4, touch: 10 }, breakpoints: { 575: { fixedWidth: 60, fixedHeight: 45, gap: 5 } } });
  big.sync(nav);
  big.mount();
  nav.mount();
})();
