// First page: News slick (centered · .8s) · gallery two-row slick (every 3s .8s, the left rtl one drags the right along) · facility helmet beetle jump · flowing band on/off
(() => {
  const PC = BT.PC, reduce = BT.reduce;
  const $news = $(".bt-news__slider");
  const pad = (n) => String(n).padStart(2, "0");
  $(".bt-news__max").text(pad($news.children().length));
  $news.on("beforeChange", (e, s, cur, next) => $(".bt-news__current").text(pad(next + 1)));
  $news.slick({ infinite: true, arrows: true, prevArrow: $(".bt-news__arrow.is-prev"), nextArrow: $(".bt-news__arrow.is-next"), speed: 800, centerMode: true, slidesToShow: 1, slidesToScroll: 1, variableWidth: true, touchThreshold: 10, touchMove: false, pauseOnHover: false, pauseOnFocus: false });

  const opts = { autoplay: !reduce, infinite: true, arrows: false, autoplaySpeed: 3000, speed: 800, slidesToShow: 1, slidesToScroll: 1, swipe: false, touchMove: false, variableWidth: true, pauseOnHover: false, pauseOnFocus: false };
  const $l = $(".bt-zukan__slider--l .bt-zukan__wrap"), $r = $(".bt-zukan__slider--r .bt-zukan__wrap");
  if (PC) {
    $l.slick({ ...opts, asNavFor: $r, rtl: true, initialSlide: $l.children().length - 1 });
    $r.slick({ ...opts, autoplay: false, initialSlide: $r.children().length - 1 });
  } else $l.slick({ ...opts, autoplaySpeed: 0, speed: 5000, centerMode: true, cssEase: "linear", rtl: true });

  // The flowing band runs only while on screen (original toggleClass ani-running)
  [".bt-facility", ".bt-shindan"].forEach((t) => ScrollTrigger.create({ trigger: t, start: "top bottom", end: "bottom top", toggleClass: { targets: t, className: "is-run" } }));

  // Beetle over the facility artwork: jumps up 80px, goes back at half size (100px to the left), then returns and sits — numbers exactly as in the original timeline.
  const beetle = document.querySelector(".bt-facility__beetle");
  if (beetle && !reduce) ScrollTrigger.create({
    trigger: ".bt-facility__imgarea", start: PC ? "top 80%" : "top 70%",
    onEnter: () => gsap.timeline()
      .to(beetle, { y: -80, duration: .8, ease: "power1.inOut" })
      .to(beetle, { x: PC ? -100 : -30, z: 0, scale: .5, duration: 1.1, ease: "power1.inOut" }, "<")
      .to(beetle, { zIndex: 1, rotateY: 0, duration: 0 }, "-=.1")
      .to(beetle, { y: 0, duration: .5, ease: "power1.inOut" }, "-=.2")
      .to(beetle, { x: 0, z: 0, scale: 1, duration: .8, ease: "power1.inOut" }, "<"),
  });
})();
