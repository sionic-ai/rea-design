// Home page: village Lottie after load, tie the intro card stack (cards) and text (fade) together, make the video row draggable, fold and unfold the bottom right banner
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => matchMedia("(min-width: 769px)").matches;
  addEventListener("load", () => {
    document.querySelectorAll(".mv [data-lottieillust][data-late]").forEach((el) => window.bhPlay && bhPlay(el, el.dataset.lottieillust));
  });

  const images = new Swiper(".about__images .swiper", { effect: "cards", loop: false, grabCursor: true, cardsEffect: { perSlideRotate: 8, slideShadows: false } });
  const texts = new Swiper(".about__texts .swiper", {
    effect: "fade", loop: false, grabCursor: true, slidesPerView: 1, fadeEffect: { crossFade: true }, speed: 400,
    navigation: { nextEl: ".about__nav .swiper-button-next", prevEl: ".about__nav .swiper-button-prev" },
    pagination: { el: ".about__texts .swiper-pagination", clickable: false },
  });
  images.controller.control = texts;
  texts.controller.control = images;
  new Swiper(".video__list .swiper", { loop: false, slidesPerView: "auto", grabCursor: true, speed: 400, navigation: { nextEl: ".video__nav .swiper-button-next", prevEl: ".video__nav .swiper-button-prev" } });

  // ‹What is a map?› — opens the dialog, closes via outside click·close button·Esc
  const modal = document.querySelector(".map__modal");
  document.querySelector(".map__what").addEventListener("click", () => modal.showModal());
  modal.querySelector(".map__modal-head button").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  // Banner — opens on load, folds after scrolling past the lower half of the hero, and folds again after scrolling past 1000px on desktop or 500px on phone once opened
  const hb = document.querySelector(".hb"), inu = hb.querySelector(".hb__inu");
  let from = null, armed = false;
  hb.classList.add("is-hidden");
  addEventListener("load", () => { hb.classList.remove("is-hidden"); from = scrollY; armed = true; });
  inu.addEventListener("click", () => {
    const wasHidden = hb.classList.contains("is-hidden");
    hb.classList.toggle("is-hidden");
    if (wasHidden) { from = scrollY; armed = true; } else armed = false;
  });
  ScrollTrigger.create({
    trigger: ".mv", start: "bottom 50%", end: "max",
    onEnter: () => hb.classList.add("is-hidden"),
    onLeaveBack: () => hb.classList.remove("is-hidden"),
    onUpdate: (self) => {
      if (!armed || from === null) return;
      if (Math.abs(self.scroll() - from) > (isPc() ? 1000 : 500)) { hb.classList.add("is-hidden"); armed = false; }
    },
  });
  if (reduce) document.querySelectorAll(".slideshow ul").forEach((u) => (u.style.animation = "none"));
})();
