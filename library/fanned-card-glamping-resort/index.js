// First page — hero photo rotating every 8s · booking calendar (flatpickr) · room Swiper creative · reviews Swiper fade · on phones the feature photo is pinned
(() => {
  const BREAK = 767;
  const items = [...document.querySelectorAll(".ge-hero__item")];
  let now = 0, prev = 0;
  // 8s after turning on, turn on the next section, and 1.5s later turn off the previous one — when returning to the first, bring the first to the top.
  const slide = () => {
    items[now]?.classList.add("is-active");
    setTimeout(() => {
      setTimeout(() => { items[prev]?.classList.remove("is-active"); prev = prev < items.length - 1 ? prev + 1 : 0; }, 1500);
      if (now < items.length - 1) { now++; if (items[0]) items[0].style.zIndex = 1; } else { now = 0; if (items[0]) items[0].style.zIndex = 2; }
      slide();
    }, 8000);
  };

  addEventListener("load", () => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) slide(); else items[0]?.classList.add("is-active");

    if (window.flatpickr) {
      const d = new Date(); d.setDate(d.getDate() + 1);
      const day = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      flatpickr(".ge-date", { locale: window.flatpickr.l10ns?.ko || "default", dateFormat: "Y/m/d", defaultDate: day, minDate: day, maxDate: "2026/12/06", disableMobile: true });
    }

    if (window.Swiper) {
      new Swiper(".ge-room__slider", {
        effect: "creative",
        creativeEffect: { limitProgress: 2, prev: { translate: ["-100%", "10%", 0], rotate: [0, 0, -15], origin: "50% 300px" }, next: { translate: ["100%", "10%", 0], rotate: [0, 0, 15], origin: "50% 300px" } },
        breakpoints: { 768: { creativeEffect: { limitProgress: 4, prev: { translate: ["-100%", "15%", 0], rotate: [0, 0, -8], origin: "50% 500px" }, next: { translate: ["100%", "15%", 0], rotate: [0, 0, 8], origin: "50% 500px" } } } },
        slidesPerView: "auto", loop: true, speed: 1400,
        autoplay: { delay: 8000, disableOnInteraction: false, waitForTransition: false },
        centeredSlides: true, spaceBetween: 100, followFinger: true, freeMode: false,
      });
      new Swiper(".ge-recom__slider", {
        effect: "fade", fadeEffect: { crossFade: true }, slidesPerView: 1, loop: true, speed: 1400,
        autoplay: { delay: 8000, disableOnInteraction: false, waitForTransition: false },
        navigation: { nextEl: ".ge-recom__arrow.is-next", prevEl: ".ge-recom__arrow.is-prev" },
        followFinger: false, freeMode: false,
      });
    }

    // Phone — pins the Appeal section photo to the screen up to the top edge of the Rooms section (phones don’t support background-attachment: fixed)
    const bg = document.querySelector(".ge-charm__bgimg"), room = document.querySelector(".ge-room");
    if (bg && room) {
      const pin = () => {
        if (innerWidth > BREAK) { bg.style.position = ""; return; }
        const end = room.getBoundingClientRect().top + scrollY;
        bg.style.position = scrollY <= end ? "fixed" : "absolute";
      };
      addEventListener("scroll", pin, { passive: true });
      pin();
    }
  });
})();
