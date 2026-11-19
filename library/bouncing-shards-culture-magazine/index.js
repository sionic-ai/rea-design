// Home motion — rebuilt with the original index.js numbers and order. Motion is split with gsap.matchMedia, and with reduced motion only the still first scene is kept
(() => {
  const $ = window.jQuery;
  const narrow = () => innerWidth <= 750;
  const mm = gsap.matchMedia();

  // DVD screensaver — each piece’s starting position (50+80i, 50+60i), speed 1~3px/frame, flips only that axis on hitting a wall. Stops at 750px and below
  const box = document.querySelector(".fv__lft");
  const dvds = [...document.querySelectorAll(".dvd")].map((el, i) => ({
    el, x: 50 + i * 80, y: 50 + i * 60,
    vx: (Math.random() * 2 + 1) * (i % 2 === 0 ? 1 : -1),
    vy: (Math.random() * 2 + 1) * (i % 3 === 0 ? -1 : 1),
  }));
  dvds.forEach((d) => (d.el.style.transform = `translate(${d.x}px, ${d.y}px)`));
  let raf = 0;
  const step = () => {
    const w = box.getBoundingClientRect().width, h = box.getBoundingClientRect().height;
    dvds.forEach((d) => {
      d.x += d.vx; d.y += d.vy;
      if (d.x <= 0 || d.x >= w - d.el.offsetWidth) d.vx *= -1;
      if (d.y <= 0 || d.y >= h - d.el.offsetHeight) d.vy *= -1;
      d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    });
    raf = requestAnimationFrame(step);
  };
  const startDvd = () => { if (!raf && !narrow()) raf = requestAnimationFrame(step); };
  const stopDvd = () => { cancelAnimationFrame(raf); raf = 0; };

  // Photo slide: 4s until the next one (for video, the original waits until it ends)
  const timed = (sw, next) => { clearTimeout(sw.autoTimer); if (sw.autoplayOn) sw.autoTimer = setTimeout(next, 4000); };
  const pager = document.querySelector(".fv__pager");
  const paint = (sw) => { pager.querySelector(".current").textContent = String(sw.activeIndex + 1).padStart(2, "0"); pager.querySelector(".total").textContent = String(sw.slides.length).padStart(2, "0"); };
  const mask = narrow() ? null : new Swiper(".mask-swiper", { loop: true, effect: "fade", speed: 1200, allowTouchMove: false, autoplay: false,
    on: { init(s) { timed(s, () => s.slideNext()); }, slideChange(s) { timed(s, () => s.slideNext()); } } });
  const rgt = new Swiper(".rgt-swiper", { loop: false, effect: "fade", speed: 1200, preventClicks: true, preventClicksPropagation: true,
    navigation: { nextEl: ".fv__next" }, allowTouchMove: false, breakpoints: { 0: { allowTouchMove: true }, 751: { allowTouchMove: false } },
    on: { init(s) { paint(s); }, slideChangeTransitionEnd(s) { paint(s); timed(s, goNext); } } });
  function goNext() { if (rgt.activeIndex === rgt.slides.length - 1) rgt.slideTo(0, rgt.params.speed); else rgt.slideNext(); }

  // Movie thumbnails — 1.6 slides (phone) → 2.3 → 3 → 4, centered alignment below 980. Pressing one jumps straight to that slide in the modal video slider
  const move = new Swiper(".move-swiper", { slidesPerView: 1.6, spaceBetween: 24, centeredSlides: true, loop: true,
    navigation: { nextEl: ".move-swiper-button-next", prevEl: ".move-swiper-button-prev" },
    breakpoints: { 500: { slidesPerView: 2.3, spaceBetween: 20, centeredSlides: true }, 750: { slidesPerView: 3, spaceBetween: 20, centeredSlides: true }, 980: { slidesPerView: 4, spaceBetween: 20, centeredSlides: false } } });
  const video = new Swiper(".modal-swiper", { slidesPerView: 1, loop: false, navigation: { nextEl: ".modal-button-next", prevEl: ".modal-button-prev" } });
  const modal = document.querySelector(".modal");
  const close = () => { modal.classList.remove("is-open"); document.body.style.overflow = ""; };
  move.on("click", (s, e) => {
    const slide = e.target.closest(".swiper-slide");
    if (!slide) return;
    modal.classList.add("is-open"); document.body.style.overflow = "hidden";
    video.slideTo(Number(slide.getAttribute("data-slide-index")), 0);
  });
  modal.querySelector(".modal__close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  document.querySelectorAll(".sound-toggle").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); b.closest(".video-container").classList.toggle("is-muted"); }));

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    startDvd();
    const onResize = () => (narrow() ? stopDvd() : startDvd());
    addEventListener("resize", onResize);
    [mask, rgt].forEach((s) => { if (s) { s.autoplayOn = true; timed(s, s === rgt ? goNext : () => s.slideNext()); } });
    // The npm build creates $.fn.infiniteslide after the DOM is ready — hook it inside $(function) like the original
    $(function () {
      $(".article__slide").infiniteslide({ speed: 100, clone: 10 });
      $(".regulars__logoSlide").infiniteslide({ speed: 100, clone: 20 });
    });
    return () => { stopDvd(); removeEventListener("resize", onResize); [mask, rgt].forEach((s) => s && (s.autoplayOn = false, clearTimeout(s.autoTimer))); };
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { $(".article__slide, .regulars__logoSlide").css({ display: "flex", overflow: "hidden" }); });

  // Sticky sticker at the phone bottom — appears after scrolling past 100px (.3s)
  $(window).on("scroll", function () { $(".btn-fixed").toggleClass("is-show", $(this).scrollTop() > 100); });

  // Contact — choosing a type unfolds the remaining fields (jQuery slideDown default 400ms)
  const $sel = $("#kindSelect"), $acc = $(".form__accordion");
  if ($sel.val()) $acc.show();
  $sel.on("change", function () { if ($(this).val() !== "") $acc.slideDown(); else $acc.slideUp(); });
})();
