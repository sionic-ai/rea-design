// Inner slider — same swiper 11.2.10 as the original (loop · parallax-x 99.375% · speed 1000 · cubic-bezier(.46,.36,0,.99)) and
// A ”left half is previous, right half is next” circle cursor (PC only). On phones, previous·next buttons replace the cursor.
(() => {
  const box = document.querySelector("[data-swiper='facility-interior']");
  const cursor = box.querySelector(".sv-int__cursor");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "cubic-bezier(.46, .36, 0, .99)";
  const slider = new Swiper(box, {
    loop: true,
    navigation: { nextEl: box.querySelector(".sv-int__nav.is-next"), prevEl: box.querySelector(".sv-int__nav.is-prev") },
    parallax: true,
    slidesPerView: 1,
    speed: reduce ? 0 : 1000,
    breakpoints: { 769: { navigation: false, pagination: { clickable: true, el: box.querySelector(".sv-int__dots") } } },
  });
  // swiper doesn’t take curves as options — as in the original, curve and duration are set directly on the panel and parallax layers per slide
  slider.on("setTransition", (s, ms) => {
    s.wrapperEl.style.transitionTimingFunction = ease;
    s.slides.forEach((el) => el.querySelectorAll("[data-swiper-parallax-x]").forEach((p) => {
      p.style.transitionTimingFunction = ease;
      p.style.transitionDuration = `${ms}ms`;
    }));
  });

  const pc = matchMedia("(min-width: 769px)");
  box.addEventListener("click", (e) => {
    if (!pc.matches || e.target.closest(".sv-int__nav, .sv-int__dots")) return;
    const r = box.getBoundingClientRect();
    e.clientX < r.left + r.width / 2 ? slider.slidePrev() : slider.slideNext();
  });
  document.addEventListener("mousemove", (e) => {
    if (!pc.matches) return;
    const r = box.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) { cursor.style.display = "none"; return; }
    const prev = e.clientX < r.left + r.width / 2;
    cursor.style.display = "flex";
    cursor.style.left = `${e.clientX - r.left - cursor.offsetWidth / 2}px`;
    cursor.style.top = `${e.clientY - r.top - cursor.offsetHeight / 2}px`;
    cursor.classList.toggle("is-prev", prev);
  });
})();
