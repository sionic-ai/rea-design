/* Home page — kept exactly as the original home.js.
   Swiper 11: on wide screens the three feature phone screens advance one at a time every 4 seconds over 600ms (autoplay, continues even after touch), at 743px and below
   On phones the screen becomes a hand-swiped strip (auto · 16px) and the reading cards also become a strip (auto · 16px · equal height). Rebuilt when the width changes.
   AOS 2.3.1: offset 200 · 500ms · ease-out-cubic · once — each section’s own offset and curve are written as-is in the html data-aos-* attributes. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 743px)");
  const ids = ["#js-svc-1", "#js-svc-2", "#js-svc-3"];
  let topics = null, services = [];

  const spOpts = { slidesPerView: "auto", autoHeight: false, spaceBetween: 16, speed: 600 };
  const pcOpts = { slidesPerView: 1, autoHeight: false, spaceBetween: 0, speed: 600, autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false, waitForTransition: false } };

  const init = () => {
    services.forEach((s) => s.destroy(false, true));
    if (sp.matches) {
      topics = new Swiper(".js-topics", { slidesPerView: "auto", spaceBetween: 16, speed: 600, autoHeight: true });
      services = ids.map((id) => new Swiper(id, spOpts));
    } else {
      if (topics) { topics.destroy(false, true); topics = null; }
      services = ids.map((id) => new Swiper(id, pcOpts));
    }
  };
  sp.addEventListener("change", init);
  init();

  AOS.init({ offset: 200, delay: 0, duration: 500, easing: "ease-out-cubic", once: true, disable: reduce });
})();
