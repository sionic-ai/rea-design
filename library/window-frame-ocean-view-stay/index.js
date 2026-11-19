(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The original sets up the band and experience cards at window load, and the room slider as soon as the script is read
  const roomSwipers = [...document.querySelectorAll(".bs-room__slides")].map((box) => new Swiper(box.querySelector(".swiper"), {
    slidesPerView: "auto", spaceBetween: 3, breakpoints: { 1400: { slidesPerView: "auto", spaceBetween: 10 } },
    loop: true, loopAdditionalSlides: 1, centeredSlides: true, initialSlide: 1, grabCursor: true,
    navigation: { nextEl: box.querySelector(".swiper-button-next"), prevEl: box.querySelector(".swiper-button-prev") },
  }));
  const startSwipers = () => {
    document.querySelectorAll(".bs-loop__row").forEach((row) => new Swiper(row, {
      slidesPerView: "auto", spaceBetween: 0, loop: true, speed: 10000, allowTouchMove: false,
      autoplay: reduce ? false : { delay: 0, reverseDirection: row.dataset.dir === "right" },
    }));
    new Swiper(".bs-acts__slider", {
      slidesPerView: "auto", spaceBetween: 20, breakpoints: { 1400: { slidesPerView: "auto", spaceBetween: 21 } },
      loop: true, loopAdditionalSlides: 1, centeredSlides: true, initialSlide: 1, grabCursor: true,
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
      pagination: { el: ".bs-acts .swiper-pagination", clickable: true },
      navigation: { nextEl: ".bs-acts .swiper-button-next", prevEl: ".bs-acts .swiper-button-prev" },
    });
  };
  if (document.readyState === "complete") startSwipers();
  else addEventListener("load", startSwipers, { once: true });

  // Concept right photo — turns on in 2s when the section heading drops below the screen, turns off in 1s when the section leaves the screen
  const photo = document.querySelector(".bs-concept__photo");
  const cat = document.querySelector(".bs-concept__cat");
  const concept = document.querySelector(".bs-concept");
  let photoState = "";
  const setPhoto = (s) => {
    if (s === photoState || (s === "out" && !photoState)) return;
    photoState = s;
    photo.classList.toggle("is-in", s === "in");
    photo.classList.toggle("is-out", s === "out");
  };
  const top = (el) => el.getBoundingClientRect().top + scrollY;

  // Hero news pill — when the vertical text leaves the screen it fades out in 1s, and turns back on when it returns
  const lead = document.querySelector(".bs-hero__lead");
  const pill = document.querySelector(".bs-pill");

  // Booking button — hides in .5s while the feature panel hangs on screen on wide screens (the original measures by the first panel’s sticky position)
  const firstPanel = document.querySelector(".bs-feat");
  const reserve = document.querySelector(".bs-reserve__btn");

  const onScroll = () => {
    const vh = innerHeight, y = scrollY;
    const catTop = top(cat), boxTop = top(concept);
    if (y + vh >= catTop && y <= catTop + cat.offsetHeight) setPhoto("in");
    if (y + vh < catTop || y + vh <= boxTop || y >= boxTop + concept.offsetHeight) setPhoto("out");

    const r = lead.getBoundingClientRect();
    pill.classList.toggle("is-gone", r.bottom < 0 || r.top > vh);

    if (innerWidth > 992) {
      const p = firstPanel.getBoundingClientRect();
      reserve.classList.toggle("is-hidden", p.top < vh && p.bottom > 0);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // FAQ — pressing opens the answer over .4s (jQuery slideToggle’s swing = Opens and closes with sine.inOut)
  document.querySelectorAll(".bs-qa").forEach((qa) => {
    const q = qa.querySelector(".bs-qa__q"), a = qa.querySelector(".bs-qa__a");
    q.addEventListener("click", () => {
      const open = !qa.classList.contains("is-open");
      qa.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", String(open));
      gsap.killTweensOf(a);
      if (reduce) { a.style.height = open ? "auto" : "0px"; return; }
      if (open) gsap.fromTo(a, { height: a.offsetHeight }, { height: "auto", duration: 0.4, ease: "sine.inOut" });
      else gsap.to(a, { height: 0, duration: 0.4, ease: "sine.inOut" });
    });
  });

  addEventListener("resize", () => roomSwipers.forEach((s) => s.update()));
})();
