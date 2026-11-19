// The original top.js four swipers (recommended, world, events, blog) and the video window. Values are the original’s.
(() => {
  const start = () => {
    new Swiper(".pickup-swiper", {
      loop: true, spaceBetween: 38, slidesPerView: "auto", centeredSlides: false, autoplay: true, speed: 600, grabCursor: true,
      pagination: { el: ".pickup-swiper .swiper-pagination", clickable: true },
      breakpoints: { 0: { spaceBetween: 20, centeredSlides: true }, 800: { spaceBetween: 38, centeredSlides: false } },
    });

    // World card dots are character images — where the original renderBullet put the world-slide_dots0n images
    const icons = ["p", "b", "o", "g", "y"];
    const world = new Swiper(".world-swiper", {
      loop: true, centeredSlides: true, slidesPerView: "auto", autoplay: true, speed: 800,
      pagination: {
        el: ".world-pagination", clickable: true,
        renderBullet: (i, cls) => `<span class="${cls} icon-0${i + 1}"><i class="ch ch-${icons[i]}" data-ch="${icons[i]}"></i></span>`,
      },
      breakpoints: { 0: { spaceBetween: 12, slidesPerView: 1.2, centeredSlides: true }, 800: { spaceBetween: 40, slidesPerView: "auto" } },
    });
    window.ukPaint?.(document.querySelector(".world-pagination"));

    // Clicking an island zone slides to that card in 600ms and scrolls down to the card row
    document.querySelectorAll("[data-slide]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      world.slideToLoop(+a.dataset.slide, 600);
      document.querySelector("#world-slide").scrollIntoView({ behavior: "smooth" });
    }));

    // Only at 800px and below, event·blog cards advance one at a time
    let ev = null, bl = null;
    const sp = () => {
      const small = innerWidth <= 800;
      if (small && !ev) ev = new Swiper(".event-links", { loop: true, slidesPerView: 1, centeredSlides: true, autoplay: true, spaceBetween: 16, pagination: { el: ".event-links .swiper-pagination", clickable: true } });
      if (!small && ev) { ev.destroy(true, true); ev = null; }
      if (small && !bl) bl = new Swiper(".blog-links", { loop: true, slidesPerView: 1, centeredSlides: true, autoplay: true, spaceBetween: 16, speed: 800, pagination: { el: ".blog-links .swiper-pagination", clickable: true } });
      if (!small && bl) { bl.destroy(true, true); bl = null; }
    };
    sp();
    let t;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(sp, 300); });
  };

  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
