// First page motion — same library and same values as the original top.js.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero: slick 1.6 fade (2.5s · every 6 seconds, under 992 1.7s · 4 seconds). Just before the switch, attach the flow class to the incoming slide, and detach it from the outgoing slide after the switch
  if (window.jQuery && jQuery.fn.slick) {
    const $s = jQuery(".sm-hero__slider");
    $s.on("init", () => {
      const first = document.querySelector(".sm-hero__slider .slick-active .sm-hero__img");
      if (!first) return;
      first.classList.remove("add-animation");
      setTimeout(() => first.classList.add("add-animation"), 100);
    }).slick({
      autoplay: !reduce, autoplaySpeed: 6000, infinite: true, pauseOnHover: false, pauseOnFocus: false,
      swipe: false, fade: true, speed: 2500, slidesToShow: 1, slidesToScroll: 1, dots: false, arrows: false,
      responsive: [{ breakpoint: 992, settings: { autoplaySpeed: 4000, speed: 1700 } }],
    }).on({
      beforeChange(e, slick, cur, next) {
        const imgs = this.querySelectorAll(".sm-hero__img");
        imgs[next] && imgs[next].classList.add("add-animation");
        imgs[cur] && imgs[cur].classList.add("remove-animation");
      },
      afterChange() {
        this.querySelectorAll(".remove-animation").forEach((el) => el.classList.remove("remove-animation", "add-animation"));
      },
    });
  }

  // Event cards: Swiper 8 — phone 1.28 slides centered, 768 two, 992 three (loop only when more than three)
  const ev = document.querySelector(".sm-event__slider");
  if (ev && window.Swiper) {
    const n = ev.querySelectorAll(".swiper-slide").length;
    new Swiper(ev, {
      loop: true, slidesPerView: 1.28, spaceBetween: 20, centeredSlides: true, centeredSlidesBounds: true, grabCursor: true, speed: 600, autoplay: false,
      breakpoints: {
        768: { slidesPerView: Math.min(2, n) },
        992: { slidesPerView: Math.min(3, n), spaceBetween: 30, centeredSlides: false, centeredSlidesBounds: false, loop: n > 2 },
      },
    });
  }

  // Concept photo parallax — rellax (speed 2·1.5, under 576 .6·.9, base .3)
  if (!reduce && window.Rellax && document.querySelector(".rellax")) new Rellax(".rellax");
})();
