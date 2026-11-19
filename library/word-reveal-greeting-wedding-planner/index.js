// First page — lays down the greeting silhouette, photo slider (Swiper fade · 2s transition · every 3.5s · infinite), four horizontal sliders (width auto · gap 40 / 32 at 1025px and above),
// Parallax photos (Rellax — original data-rellax-speed·percentage values), other-stories video window (MicroModal — plays when opened, stops when closed)
(() => {
  const { reduced, icons } = window.HP;
  document.querySelector(".hp-message").insertAdjacentHTML("afterbegin", icons.island("hp-message__island"));

  new Swiper(".hp-slider .swiper", {
    effect: "fade",
    fadeEffect: { crossFade: true },
    loop: true,
    loopAdditionalSlides: 1,
    speed: 2000,
    autoplay: reduced ? false : { delay: 3500, disableOnInteraction: false },
    followFinger: false,
    pagination: { el: ".hp-slider .swiper-pagination", clickable: true },
  });
  document.querySelectorAll(".hp-future__slide").forEach((box) =>
    new Swiper(box.querySelector(".swiper"), {
      slidesPerView: "auto",
      spaceBetween: 40,
      grabCursor: true,
      navigation: { nextEl: box.querySelector(".swiper-button-next"), prevEl: box.querySelector(".swiper-button-prev") },
      breakpoints: { 1025: { spaceBetween: 32 } },
    }),
  );

  if (!reduced && window.Rellax) new Rellax(".rellax");

  // Photo grid hover — original plugin jQuery fadeTo(200, .85) / fadeTo(500, 1) (swing = sine.inOut) pushed on top of a css transition .5s
  if (!reduced && window.gsap)
    document.querySelectorAll(".hp-insta__item").forEach((a) => {
      a.addEventListener("mouseenter", () => gsap.to(a, { opacity: 0.85, duration: 0.2, ease: "sine.inOut", overwrite: true }));
      a.addEventListener("mouseleave", () => gsap.to(a, { opacity: 1, duration: 0.5, ease: "sine.inOut", overwrite: true }));
    });

  // Text read one character at a time — like the original, when a ScrollMagic scene (triggerHook .8) enters it gains is-in, and char-seq-rise handles the character stagger (45ms) · .3s
  if (window.ScrollMagic) {
    const controller = new ScrollMagic.Controller();
    document.querySelectorAll(".hp-read").forEach((el) =>
      new ScrollMagic.Scene({ triggerElement: el, triggerHook: 0.8 }).on("enter", () => el.classList.add("is-in")).addTo(controller),
    );
  } else document.querySelectorAll(".hp-read").forEach((el) => el.classList.add("is-in"));

  document.querySelectorAll(".hp-story__btn").forEach((b) =>
    b.addEventListener("click", () => {
      const modal = document.getElementById(b.dataset.micromodalTrigger);
      const video = modal.querySelector("video");
      video.play().catch(() => {});
      modal.querySelector(".hp-story__close").addEventListener("click", () => video.pause(), { once: true });
    }),
  );
})();
