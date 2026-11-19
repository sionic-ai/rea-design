// Facility intro — side index (appears at .5s on the first facility section · shows the current section), two photo sliders (three frames · one frame disappearing swap)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const nav = document.querySelector(".fa__fixed");
  gsap.to(nav, { opacity: 1, duration: 0.5, scrollTrigger: { trigger: "#genkan", start: "top center", toggleActions: "play none none reverse" } });

  // Current section — chosen by whether the point (section top minus the page header height) has been passed (the original PositionCheck · ScrollAnime)
  const items = [...nav.querySelectorAll("li")];
  const points = [...document.querySelectorAll(".fa__section")];
  const head = document.querySelector(".fc-head");
  const mark = () => {
    const off = head.offsetHeight;
    const tops = points.map((p) => Math.round(p.getBoundingClientRect().top + scrollY - off));
    const y = Math.round(scrollY);
    let cur = 0;
    tops.forEach((t, i) => { if (i && y >= t) cur = i; });
    items.forEach((li, i) => li.classList.toggle("current", i === cur));
  };
  addEventListener("scroll", mark, { passive: true });
  addEventListener("load", mark);
  mark();

  const NAV = (root) => ({ nextEl: root.querySelector(".custom-next"), prevEl: root.querySelector(".custom-prev") });
  document.querySelectorAll(".fa__slide3").forEach((el) => new Swiper(el, {
    slidesPerView: 1.4, spaceBetween: 8, centeredSlides: true, speed: 400, loop: true, navigation: NAV(el),
    breakpoints: { 428: { spaceBetween: 40, slidesPerView: 3, centeredSlides: false, initialSlide: 0 } },
  }));
  document.querySelectorAll(".fa__slide1").forEach((el) => new Swiper(el, { slidesPerView: 1, speed: 400, effect: "fade", loop: true, navigation: NAV(el) }));
})();
