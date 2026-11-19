// Home: Hero slick (center mode 27% · 5s autoplay · .5s slide, with one more set of slides appended like the original, ten in all) + phone product list slick (center mode 8%)
// + About scene art. On phones the Hero stacks the slides of a horizontal track vertically (is-active-next) so they look like they slide up — same as the original
(() => {
  const $mv = $(".ts-mv");
  const $list = $('[data-slider="mv"]');
  $list.append($list.children().clone());
  // Cloned slides are redrawn too so image IDs do not collide
  $list.children().slice(5).find("[data-char]").each((_, el) => {
    const [s, a, b] = el.dataset.char.split(" ");
    el.innerHTML = TS.char(s, a, b, el.dataset.charLabel);
  });
  $list.slick({
    centerMode: true,
    centerPadding: "27%",
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    draggable: false,
    focusOnSelect: true,
    pauseOnHover: false,
    swipe: false,
    speed: 500,
    responsive: [{ breakpoint: 768, settings: { centerPadding: "22%" } }],
  });
  $mv.addClass("is-show");
  $list.on("beforeChange", (event, slick, current, next) => {
    $list.find(".slick-slide").each((_, el) => {
      const i = el.getAttribute("data-slick-index");
      let on = false;
      if (next === slick.slideCount - 1 && current === 0) on = i === "-1";
      else if (next === 0) on = i === String(slick.slideCount);
      el.classList.toggle("is-active-next", on);
    });
  });

  $('[data-slider="product"]').slick({
    responsive: [
      { breakpoint: 768, settings: { centerMode: true, centerPadding: "8%", arrows: false, draggable: false, focusOnSelect: true, pauseOnHover: false, swipe: true, speed: 500, infinite: false } },
      { breakpoint: 10000, settings: "unslick" },
    ],
  });

  // About scene — characters on a white isometric base (the original is a single 3D render)
  const scene = document.querySelector('[data-scene="podium"]');
  if (scene) {
    const base = [[60, 200, 70, 70], [150, 160, 60, 110], [230, 190, 70, 60], [300, 140, 50, 130], [110, 240, 80, 40], [200, 230, 60, 50]]
      .map(([x, y, w, h]) => TS.podium(x, y, w, h)).join("");
    scene.innerHTML = TS.group([
      ["gem", "c2", "c1", 70, 105, 70], ["poly", "c1", "c2", 160, 70, 70], ["cluster", "c5", "c4", 240, 110, 70], ["leaf", "c3", "c4", 305, 40, 60],
      ["swirl", "c2", "c3", 120, 160, 60], ["steps", "c4", "c6", 210, 150, 55], ["cube", "c5", "c4", 345, 120, 45], ["gem", "c2", "c6", 30, 170, 50],
    ], 420, 315, base);
  }

  // Loader mass drawing — as in the original, one mass where characters densely cover the panel center (scaled 2x so it hides the whole screen as it passes)
  const lump = document.querySelector(".ts-load__img");
  if (lump) lump.innerHTML = TS.group([
    ["cluster", "c5", "c4", 120, 50, 170], ["blob", "c2", "c6", 70, 100, 150], ["gear", "c2", "c1", 200, 30, 130], ["cloud", "c5", "c2", 210, 120, 140],
    ["swirl", "c2", "c3", 130, 150, 130], ["gem", "c2", "c1", 60, 40, 110], ["leaf", "c3", "c4", 280, 80, 100], ["cube", "c5", "c4", 260, 170, 100],
    ["steps", "c4", "c6", 90, 190, 90], ["poly", "c1", "c2", 170, 100, 90], ["drop", "c2", "c5", 300, 40, 70],
  ], 400, 300);
})();
