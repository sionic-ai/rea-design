// First page only motion: endless sliding of room photos, and the stretch where the island photo stays stuck while the frame clears and the poem rises
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Room slider: original swiper 10.3.1 — 3 slides centered · loop · gap 20 · speed 1600 · autoplay 2500, below 576 one slide · 4000 ----------
  const roomEl = document.querySelector(".vi-slider .swiper");
  let rooms = null;
  let roomsSp = null;
  const initRooms = () => {
    // The original tears down and rebuilds on every window resize — so the start isn’t reset whenever the phone address bar moves up and down, rebuild only when the width range changes
    const sp = document.documentElement.clientWidth < 576;
    if (!roomEl || !window.Swiper || sp === roomsSp) return;
    roomsSp = sp;
    rooms?.destroy(true, true);
    rooms = new Swiper(roomEl, {
      slidesPerView: sp ? 1 : 3,
      spaceBetween: 20,
      centeredSlides: true,
      loop: true,
      speed: reduce ? 0 : 1600,
      autoplay: reduce ? false : { delay: sp ? 4000 : 2500, disableOnInteraction: false },
      navigation: { prevEl: roomEl.querySelector(".vi-slider__nav.is-prev"), nextEl: roomEl.querySelector(".vi-slider__nav.is-next") },
    });
  };
  initRooms();
  addEventListener("resize", initRooms);

  // ---------- Island photo: sticks via sticky, the 26px margin peels away as it darkens, 4 photos overlap per range, six poem lines scrub ----------
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const body = document.querySelector(".vi-island__body");
    const mask = body.querySelector(".vi-island__mask");
    const scrollArea = document.querySelector(".vi-island__scroll");
    const bgs = gsap.utils.toArray(".vi-island__bg");
    const range = { trigger: body, start: "center center", endTrigger: scrollArea, end: "top top", scrub: true, invalidateOnRefresh: true };

    gsap.fromTo(mask, { clipPath: "inset(26px 26px 26px 26px)" }, { clipPath: "inset(0px 0px 0px 0px)", ease: "none", scrollTrigger: range });
    // Brightness and photo overlap use GSAP default (power1.out) since the original lists no curve — only the frame and poem lines are none
    gsap.fromTo(bgs, { filter: "brightness(100%)" }, { filter: "brightness(40%)", ease: "power1.out", scrollTrigger: { ...range } });

    gsap.utils.toArray(".vi-island__lines .t").forEach((t) => {
      gsap.fromTo(t, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: t, start: "top 90%", end: "bottom 70%", scrub: true } });
    });

    gsap.set(bgs, { opacity: 0 });
    gsap.set(bgs[0], { opacity: 1 });
    bgs.forEach((bg, i) => {
      if (i === 0) return;
      const a = (i - 1) / (bgs.length - 1);
      const b = i / (bgs.length - 1);
      gsap.to(bg, {
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: { trigger: scrollArea, start: `${a * 100}% top`, end: i === bgs.length - 1 ? "bottom center" : `${b * 100}% top`, scrub: true },
      });
    });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
