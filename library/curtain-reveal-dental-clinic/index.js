/* Home page — original pageTop() and pageTopLoad(): vertical photo slideshow (slick fade 2s, every 4s), bottom photo band (slick 40s continuous flow), white curtain lifts and the vertical greeting appears */
(() => {
  const { E } = MI;
  MI.view("top", {
    enter(c) {
      const $c = $(c);
      $c.find(".slider-top").slick({ fade: true, speed: 2000, autoplay: false, autoplaySpeed: 4000, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: true, centerMode: true, centerPadding: "0px", draggable: false, accessibility: false, swipe: false, swipeToSlide: false, touchMove: false });
      if (!MI.reduce) $c.find(".img-btm1").slick({ speed: MI.isPc() ? 40000 : 10000, autoplay: true, autoplaySpeed: 0, infinite: true, cssEase: "linear", arrows: false, dots: false, slidesToShow: 1, slidesToScroll: 1, centerMode: false, draggable: false, variableWidth: true, touchMove: false, pauseOnHover: false, pauseOnFocus: false });
    },
    load(c) {
      const $c = $(c);
      const wrapMask = c.querySelector(".slider-top-wrap .mask"), imgMask = c.querySelector(".img .mask");
      const h2 = c.querySelector(".top-main .txt h2"), rest = c.querySelectorAll(".top-main .txt p, .top-main .txt .btn");
      if (MI.reduce) { gsap.set([wrapMask, imgMask], { width: 0 }); gsap.set([h2, ...rest], { opacity: 1 }); return; }
      $c.find(".slider-top").slick("slickPlay");
      if (MI.isPc()) {
        gsap.to(wrapMask, { width: 0, duration: 0.8, delay: 0.6, ease: E.inOutQuart });
        gsap.to(imgMask, { width: 0, duration: 1, delay: 1, ease: E.outQuint });
        gsap.set(rest, { y: 20 });
        gsap.to(h2, { opacity: 1, y: 0, duration: 0.8, delay: 1.6, ease: "none" });
        gsap.to(rest, { opacity: 1, y: 0, duration: 1.1, delay: 1.6, ease: E.outCubic });
      } else {
        gsap.to([wrapMask, imgMask], { width: 0, duration: 0.8, delay: 0.4, ease: E.inOutQuart });
        gsap.set(rest, { y: 10 });
        gsap.to(h2, { opacity: 1, y: 0, duration: 0.6, delay: 1.2, ease: "none" });
        gsap.to(rest, { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: E.outCubic });
        gsap.fromTo(document.querySelector(".btn-nav-top"), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.8, ease: E.outCubic, onComplete: () => document.querySelectorAll(".btn-nav").forEach((b) => b.classList.add("on")) });
      }
    },
    leave(c) { try { $(c).find(".slider-top").slick("slickPause"); } catch (e) { /* None */ } },
  });
})();
