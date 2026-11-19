// Home — placing images, hero photo Swiper fade (3s·1.1s), header logo turns on after a set amount of scroll, map image drawn once when visible.
(() => {
  const put = (sel, html) => document.querySelectorAll(sel).forEach((el) => (el.innerHTML = html));
  put(".mv-area__illust", window.awBoat("row"));
  put(".lwr-area__illust", window.awBoat("sail"));
  put(".sect04 .upr-illust", window.awBoat("sail"));
  put(".upr-area__illust", window.awMap());

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Like the original lazyload, the GIF is fetched when it becomes visible and plays once — once at that same moment
  const map = document.querySelector(".upr-area__illust .aw-map");
  if (map && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { map.classList.add("is-play"); io.disconnect(); } }));
    io.observe(map);
  }

  const start = () => {
    const $ = window.jQuery, $w = $(window);
    $w.on("scroll", () => {
      const pos = $(".sect01").offset().top + 1000 - $w.height();
      $(".aw-header").toggleClass("is-on", $w.scrollTop() > pos);
    });
    new Swiper(".mv-area .swiper", { loop: true, effect: "fade", autoplay: reduce ? false : { delay: 3000 }, speed: 1100 });
  };
  if (window.jQuery && document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
