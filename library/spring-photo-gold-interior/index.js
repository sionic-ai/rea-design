// Home: partner company card row — exactly the original slick 1.8.1 settings (no infinite loop · .3s · 4/3/2/1 cards), arrows as round buttons
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const box = $(".av-slick");
  box.slick({
    dots: false, arrows: false, infinite: false, speed: 300, slidesToShow: 4, slidesToScroll: 1,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } }, { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 } }, { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }],
  });
  $(".av-sbtn--prev").on("click", () => box.slick("slickPrev"));
  $(".av-sbtn--next").on("click", () => box.slick("slickNext"));
  box.on("setPosition", () => window.avLoco?.update());
})();
