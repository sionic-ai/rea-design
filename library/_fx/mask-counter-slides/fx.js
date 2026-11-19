// The photo board (main) and the same photo row inside the shaped window above it run as two separate swipers — the board runs backward, the window forward, so they stagger.
// The original sets up two swipers with the same tempo (loop · speed · delay) so they run together without syncing. Follow it as is.
(() => {
  kfFx.register("mask-counter-slides", (el, { options, reduce }) => {
    const main = el.querySelector('[data-fx-part="main"]');
    if (!main || typeof Swiper === "undefined" || main.querySelectorAll(".swiper-slide").length < 2) return;
    const win = el.querySelector('[data-fx-part="window"]');
    const pager = el.querySelector('[data-fx-part="pager"]');
    const every = +(options.every ?? 5000), speed = +(options.speed ?? 2000);
    const base = { direction: options.dir === "horizontal" ? "horizontal" : "vertical", effect: "slide", slidesPerView: 1, loop: true, speed, allowTouchMove: false };
    const auto = (back) => (reduce ? false : { delay: every, reverseDirection: back, disableOnInteraction: false });
    const a = new Swiper(main, { ...base, autoplay: auto(options.reverse !== "off"), ...(pager && { pagination: { el: pager, clickable: true } }) });
    const b = win && win.querySelectorAll(".swiper-slide").length > 1 ? new Swiper(win, { ...base, autoplay: auto(options.reverse === "both") }) : null;
    return () => { a.destroy(true, true); b?.destroy(true, true); };
  });
})();
