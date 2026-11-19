// First page — same Swiper 11.0.7 build and values as the original.
// Opening curtain: on the first visit of a session, lifts the paper curtain at 3s and starts the hero slide advance at 4s, on a return visit goes straight in with no curtain.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const vw = () => innerWidth;

  // Hero — 2s overlap, stays 6.5s on the first section, then every 4.5s after that
  const hero = () => new Swiper(".kk-hero-swiper", {
    effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: reduce ? 0 : 2000,
    autoplay: reduce ? false : { delay: 6500 },
    on: { slideChange() { if (this.realIndex > 0 && this.params.autoplay) this.params.autoplay.delay = 4500; } },
  });
  const done = () => { body.classList.remove("is-intro-run"); body.classList.add("is-intro-over"); };
  // Ticker line — one loop takes character count × 20/117 seconds (30–200 characters)
  const ln = document.querySelector(".kk-notice .txt");
  if (ln) ln.style.setProperty("--kk-dur", `${Math.min(200, Math.max(30, ln.textContent.length)) * (20 / 117)}s`);
  if (reduce || sessionStorage.getItem("kk-intro-done")) {
    body.classList.add("is-intro-skip");
    done();
    hero();
  } else {
    sessionStorage.setItem("kk-intro-done", "1");
    setTimeout(() => body.classList.add("is-intro-show"), 3000);
    setTimeout(() => { done(); hero(); }, 4000);
  }

  // Room strip — wide screens: gap between cells 65/1440 of the screen, leading pad width 129/1440, each cell flows straight at 10s and never pauses once on screen. Dragging adds inertia .4
  const roomEl = document.querySelector(".kk-room-swiper");
  const wide = vw() > 768;
  // To wind endlessly you need twice as many cells as are visible on one screen — append one more set of the same photos, like the original markup
  const twice = (wrap) => [...wrap.children].forEach((s) => wrap.append(s.cloneNode(true)));
  if (wide) twice(roomEl.querySelector(".swiper-wrapper"));
  twice(document.querySelector(".kk-jr-swiper .swiper-wrapper"));
  const room = new Swiper(roomEl, wide ? {
    slidesPerView: "auto", loop: true, speed: 10000, grabCursor: true, observer: true,
    spaceBetween: Math.round((65 / 1440) * vw()), slidesOffsetBefore: Math.round(roomEl.offsetWidth * (129 / 1440)),
    freeMode: { enabled: true, momentumRatio: 0.4, momentumVelocityRatio: 0.4 },
    autoplay: reduce ? false : { delay: 10000, disableOnInteraction: false, reverseDirection: false, pauseOnMouseEnter: false },
  } : {
    slidesPerView: "auto", loop: true, speed: 7000, observer: true, observeParents: true, longSwipes: true, freeMode: true,
    spaceBetween: Math.round((20 / 390) * vw()), slidesOffsetBefore: Math.round(roomEl.offsetWidth * (20 / 390)),
    autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
  });
  if (wide && !reduce) {
    const io = new IntersectionObserver((ens) => ens.forEach((e) => {
      if (!e.isIntersecting) return;
      room.params.autoplay.delay = 0;
      room.autoplay.start();
      io.unobserve(e.target);
    }));
    io.observe(roomEl);
  }

  // Facilities — overlap 1.5s, after the first section’s 5.5s, every 4s. The current dot’s ring fills in 5s (ring-fill-dots)
  document.querySelectorAll(".kk-fac-swiper").forEach((el) => new Swiper(el, {
    effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: reduce ? 0 : 1500,
    autoplay: reduce ? false : { delay: 5500 },
    pagination: { el: el.querySelector(".swiper-pagination"), clickable: true, renderBullet: (i, cls) => `<button type="button" class="${cls}" aria-label="${i + 1}Nth photo"></button>` },
    on: { slideChange() { if (this.realIndex > 0 && this.params.autoplay) this.params.autoplay.delay = 4000; } },
  }));

  // Journal strip: flows straight and endlessly at 11s per cell (7s on narrow screens) and can’t be pushed by hand
  new Swiper(".kk-jr-swiper", {
    loop: true, speed: 7000, slidesPerView: 1.81, spaceBetween: 20, longSwipes: true, allowTouchMove: false,
    autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
    breakpoints: { 768: { speed: 11000, slidesPerView: 3.8, spaceBetween: 40 }, 1100: { speed: 11000, slidesPerView: 3.8, spaceBetween: 40 } },
  });
})();
