// Subpage — original ad (.p-sdgs-kv) and the Protection header of the same type: on load -inview is added inside the header to bring up the title and image in order.
// Movie coverflow is the original Swiper { effect coverflow · centeredSlides · slidesPerView auto · speed 700 · loop · autoplay 3000 }
(() => {
  const head = document.querySelector(".bt-subhead");
  // Together with the header’s inner -inview, turns on title stroke drawing (squiggle-stroke-title on: state)
  const go = () => { head?.classList.add("is-inview"); head?.querySelector('[data-fx~="squiggle-stroke-title"]')?.classList.add("is-in"); };
  if (document.readyState === "complete") go(); else addEventListener("load", go);
  const mv = document.querySelector(".bt-movie .swiper");
  if (mv && window.Swiper) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    new Swiper(mv, { effect: "coverflow", grabCursor: true, centeredSlides: true, slidesPerView: "auto", speed: 700, loop: true, autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false } });
  }
})();
