// Activity intro — original script.js #service order: three Swipers (.6s · loop · fraction number), Read more height 300ms, show more for lists over three, image panel pin-scrub (800px · scrub 1)
(() => {
  document.querySelectorAll(".sect02 .illust").forEach((el) => (el.innerHTML = window.awBoat("sail").replace("class=\"aw-line\"", "class=\"aw-line is-flip\"")));
  const start = () => {
    const $ = window.jQuery;
    const opts = { loop: true, speed: 600, fadeEffect: { crossFade: true }, pagination: { el: ".swiper-pagination", type: "fraction" }, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" } };
    ["#products", "#producers", "#cooking-classes"].forEach((id) => new Swiper(`${id}.swiper`, opts));

    $(".sect04 .dtl-more-btn").on("click", function () {
      const dd = $(this).siblings("dl").find("dd");
      if (!dd.length) return;
      if (dd.hasClass("open")) {
        dd.animate({ height: 215 }, 300).removeClass("open");
        $(this).children("span").text("View more");
        $(this).removeClass("active");
      } else {
        dd.animate({ height: dd[0].scrollHeight }, 300).addClass("open");
        $(this).children("span").text("Fold");
        $(this).addClass("active");
      }
    });

    const total = $(".sect04 .cont-dtl li").length;
    $(".sect04 .cont-inner").each(function () {
      let num = 3;
      const closeNum = num - 1, $more = $(this).find(".more-btn"), $close = $(this).find(".close-btn"), $items = $(this).find("li");
      if ($items.length <= 3) { $more.hide(); $close.hide(); return; }
      $more.show(); $close.hide();
      $items.not(":lt(" + num + ")").hide();
      $more.on("click", function () {
        num += 3;
        $(this).parent().find("li:lt(" + num + ")").slideDown();
        if (total <= num) {
          $more.hide(); $close.show();
          $close.on("click", function () { $(this).parent().find("li:gt(" + closeNum + ")").slideUp(); $(this).hide(); $more.show(); });
        }
      });
    });

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Original is positioned "500px"(a nonexistent label), so GSAP appends it to the end of the timeline — the text appears after the background has fully grown
      const tl = gsap.timeline({ scrollTrigger: { trigger: "#scr-trigger", start: "top top", end: "+=800", scrub: 1, pin: true } });
      tl.to("#scr-trigger", { backgroundSize: "100%", ease: "none" });
      tl.to("#scr-target", { opacity: 1, ease: "power1.inOut" }, "500px");
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set("#scr-trigger", { backgroundSize: "100%" }); gsap.set("#scr-target", { opacity: 1 }); });
  };
  if (window.jQuery && document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
