// Home — hero slick fade (4 seconds) and per-section white wing and new line drawing (Vivus 400 frames, once at first),
// Photo strip slick (centered, 2s, .8s) with an odd-even bob on every slide change (motion part bob-swap-slides), dove thread line drawing, video plays when visible
(() => {
  const $ = window.jQuery;
  const { reduce, drawLine } = AK;

  // Original wing (mainPath1~9) slot — one wing at the end of a curved tail line, or one bird on the tail line
  const WING = {
    box: "0 0 200 80",
    d: ["M4 46C26 30 46 58 70 50 88 44 96 30 88 26c-8-4-12 8-2 14 14 8 34 2 54-10", "M138 32c10-14 30-26 58-30-4 18-20 36-50 40", "M150 38c12 0 28-6 38-16"],
  };
  const BIRD = {
    box: "0 0 200 96",
    d: ["M4 90C30 70 56 82 84 66", "M84 60c10-18 26-24 40-16 8-14 26-24 46-22-12 8-20 18-24 30-14 8-38 10-62 8z", "M124 44c4 6 4 12 0 18"],
  };
  const LINES = { w1: WING, w2: WING, w3: WING, w4: WING, w5: WING, w6: WING, b1: BIRD, b2: BIRD, b3: BIRD };
  const svgOf = (k) => `<svg class="ak-wing is-${k}" viewBox="${LINES[k].box}" aria-hidden="true">${LINES[k].d.map((d) => `<path d="${d}"/>`).join("")}</svg>`;

  const slides = [...document.querySelectorAll(".ak-slide")];
  slides.forEach((s) => s.insertAdjacentHTML("afterbegin", (s.dataset.lines || "").split(" ").filter(Boolean).map(svgOf).join("")));

  const draw = (i) => {
    const s = slides[i];
    if (!s || s.dataset.drawn) return;
    s.dataset.drawn = "1";
    s.querySelectorAll(".ak-wing").forEach((svg) => {
      svg.style.display = "block";
      if (!reduce) new Vivus(svg, { duration: 400, forceRender: false, animTimingFunction: Vivus.EASE_OUT });
    });
  };

  const $hero = $(".ak-hero-slider");
  $hero.on("init", () => draw(0));
  $hero.on("afterChange", (e, slick, cur) => draw(cur));
  $hero.slick({ autoplay: !reduce, autoplaySpeed: 4000, arrows: false, dots: true, infinite: true, fade: true });

  // Photo strip — right before paging, tells the part to give one beat of a nudge (the original flips moved in beforeChange)
  const $gal = $(".ak-gallery__slider");
  $gal.on("beforeChange", () => $gal[0].dispatchEvent(new CustomEvent("fx:step")));
  $gal.slick({ autoplay: !reduce, autoplaySpeed: 2000, centerMode: true, speed: 800, arrows: false, dots: false, infinite: true, variableWidth: true });

  addEventListener("DOMContentLoaded", () => {
    drawLine(document.querySelector(".ak-concept__bird"), 400);
  });

  // Video — the original plays an embedded video muted when visible, and loops it when it ends. Same behavior applied to the placeholder video
  const video = document.querySelector(".ak-movie video");
  if (video && $) $(".ak-movie").one("inview", () => { if (!reduce) video.play().catch(() => {}); });
})();
