// One post — photo carousel (original carousel: one slide at a time, loop, .8s, drag, fraction page number ”01 / 04”) and swapping the marker after the URL when passing subheadings
(() => {
  const pad = (n) => (n < 10 ? "0" + n : String(n));
  document.querySelectorAll(".hk-carousel__swiper").forEach((el) => new window.hkSwiper5(el, {
    slidesPerView: 1, loop: true, loopAdditionalSlides: 1, speed: 800, spaceBetween: 0, grabCursor: true, keyboard: { enabled: true },
    pagination: { el: el.querySelector(".swiper-pagination-fraction"), type: "custom", renderCustom: (s, cur, total) => `<span>${pad(cur)}</span><span class="swiper-pagination-fraction-slash"></span><span>${pad(total)}</span>` },
    navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
  }));

  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) history.replaceState(null, "", `${location.pathname}${location.search}#${en.target.id}`);
  }), { rootMargin: "-10% 0%", threshold: 0 });
  document.querySelectorAll(".hk-h2[id]").forEach((h) => io.observe(h));
})();
