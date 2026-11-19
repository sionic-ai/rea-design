// First page — hero photo strip (spreads out .5s after the loader, flows from 4s), photo gallery (swiper 8.4.2 fade · 5 seconds · pauses on hover)
(() => {
  const slider = document.querySelector(".ss-mv__slider");
  const start = () => {
    setTimeout(() => slider?.classList.remove("is-pre"), 500);
    // Attach the parts after spreading — the position at the moment of attaching is read as the cell position, so it must come after is-pre is removed, and the first move (3 seconds later) arrives at 4s like the original.
    setTimeout(() => slider?.setAttribute("data-fx", "slot-step-conveyor"), 1000);
  };
  if (document.body.classList.contains("is-loading")) document.addEventListener("ss:loaded", start, { once: true });
  else start();

  const gallery = document.querySelector(".ss-gallery__slider");
  if (gallery && window.Swiper) {
    new Swiper(gallery, {
      effect: "fade", fadeEffect: { crossFade: true }, loop: true,
      autoplay: { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false },
      pagination: { el: ".ss-gallery__pagination", clickable: true },
    });
  }
})();
