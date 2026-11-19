// Hero photos — same slick as the original: 1.8s fade every 3 seconds (cssEase ease), no arrows, number dots. With reduced motion it stays on the first slide.
// The original loads jQuery and slick separately inside an iframe and only starts after the first screen is fully on — hook it up once the photo panel’s turn-on transition ends
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const visual = document.querySelector(".r-hero__visual");
  let done = false;
  const start = () => {
    if (done) return;
    done = true;
    $(".r-slide").slick({ autoplay: !reduce, autoplaySpeed: 3000, speed: 1800, fade: true, arrows: false, dots: true });
  };
  visual?.addEventListener("transitionend", (e) => { if (e.target === visual && e.propertyName === "opacity") start(); });
  setTimeout(start, 2400);
})();
