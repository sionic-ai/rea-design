// About the company: with the same jquery.inview as the original, cards and books rise when they enter (.on), and 1s later the hand drawings appear (.is-shown),
// The hand drawing floats up separately by the scroll’s data-dy times (after it touches the bottom of the screen, 0 at 1060px and below).
// The original server randomly gives each image a dy from .05~.25 (in .01 steps) at every open — draw anew each time from the same range.
$(".br-aIntro__figImg").each(function () {
  this.dataset.dy = (5 + Math.floor(Math.random() * 21)) / 100;
});
$(function () {
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) {
      $(".br-inview").addClass("on");
      $(".br-ready").addClass("is-shown");
      return;
    }
    const $figs = $(".br-aIntro__figImg");
    const parallax = () => {
      const scrl = $(window).scrollTop();
      $figs.each(function () {
        let dy = parseFloat($(this).data("dy"));
        if ($(window).width() <= 1060) dy = 0;
        let offset = $(this).offset().top - $(window).height();
        if (offset < 0) offset = 0;
        const y = dy * (scrl - offset);
        this.style.transform = dy > 0 ? `translateY(-${y}px)` : "";
      });
    };
    $(".br-inview").on("inview", function () { $(this).addClass("on"); });
    $(window).on("scroll", parallax);
    const t = setTimeout(() => $(".br-ready").addClass("is-shown"), 1000);
    return () => {
      clearTimeout(t);
      $(window).off("scroll", parallax);
      $(".br-inview").off("inview");
    };
  });
});
