// First page — same order and values as fncInit in the original function.js.
// The hashtag row clones one set before and after to join three, then takes one loop length = 0.02s × (line width × 3), second and third lines delayed by −2/3 and −1/3 so they flow staggered.
// The hero text board is Swiper 8.4.5 fade crossFade 1500ms · 10s autoplay, with a play/pause button. The clock turns the hands every 10ms from the original reference time zone (+9), adding each city’s offset.
window.jpInit = ({ reduce }) => {
  $(".jp-loop ul").each(function () {
    $(this).clone(true).insertBefore(this).addClass("is-clone");
    $(this).clone(true).insertAfter(this).addClass("is-clone");
    $(".jp-loop ul.is-clone a").attr("tabindex", "-1");
  });
  const speed = () => {
    const sec = 0.02 * $(".jp-loop ul").first().outerWidth() * 3;
    $(".jp-loop .jp-loop__wrap ul").css("animation-duration", sec + "s");
    $(".jp-loop .jp-loop__wrap ul:nth-child(2)").css("animation-delay", (sec / -3) * 2 + "s");
    $(".jp-loop .jp-loop__wrap ul:last-child").css("animation-delay", sec / -3 + "s");
  };
  speed();
  $(".jp-loop__toggle").on("click", () => $(".jp-kv").toggleClass("is-tag-hide"));

  const sw = new Swiper(".jp-kv__articles", {
    loop: true,
    speed: reduce ? 0 : 1500,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    autoplay: reduce ? false : { delay: 10000, disableOnInteraction: false },
    navigation: { nextEl: ".jp-kv .jp-swNext", prevEl: ".jp-kv .jp-swPrev" },
    pagination: { el: ".jp-kv .jp-swDots", type: "bullets", clickable: true },
    effect: "fade",
    fadeEffect: { crossFade: true },
  });
  window.jpSwipers.push(sw);
  $(".jp-kv .jp-swPlay").on("click", function () {
    if ($(this).hasClass("is-stop")) sw.autoplay.start();
    else sw.autoplay.stop();
    $(this).toggleClass("is-stop");
  });
  if (reduce) $(".jp-kv .jp-swPlay").addClass("is-stop");

  const week = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"];
  const tick = () => {
    const t = new Date(Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000);
    $(".jp-cal__year").text(t.getFullYear());
    $(".jp-cal__month").text(t.getMonth() + 1);
    $(".jp-cal__date b").text(t.getDate());
    $(".jp-cal__day").text(week[t.getDay()]);
    const m = t.getMinutes();
    $(".jp-clock").each(function () {
      const h = (24 + t.getHours() + Number(this.dataset.lag || 0)) % 24;
      $(this).find(".jp-clock__ampm").text(h > 12 ? "PM" : "AM");
      $(this).find(".jp-clock__hour").css("transform", `rotate(${(h / 12) * 360 + (m / 60) * 30}deg)`);
      $(this).find(".jp-clock__min").css("transform", `rotate(${(m / 60) * 360}deg)`);
    });
  };
  tick();
  if ($(".jp-clock").length) setInterval(tick, 10);
};
