// Home page — illustration in the circle slick fade (4.5s·1s) and the progress ring around it (4.5s linear), vertical copy split into characters. Values exactly as in the original idx.js.
(() => {
  const { reduce } = window.kfMk;
  const $ = jQuery;
  const AUTO = 4500;

  // Wrap characters per copy line with a .5s delay + .3s per line + .05s per character — CSS runs only in the active section.
  document.querySelectorAll(".mk-slide__item").forEach((slide) => {
    slide.querySelectorAll(".btt").forEach((line, li) => {
      const t = line.textContent;
      line.innerHTML = [...t].map((c, j) => `<span><span style="animation-delay:${(0.5 + li * 0.3 + j * 0.05).toFixed(2)}s">${c === " " ? "&nbsp;" : c}</span></span>`).join("");
    });
  });

  const $slide = $(".mk-slide");
  $slide.slick({
    autoplay: !reduce, autoplaySpeed: AUTO, speed: reduce ? 0 : 1000, infinite: true, slidesToShow: 1, slidesToScroll: 1,
    arrows: false, dots: true, pauseOnFocus: false, pauseOnHover: false, pauseOnDotsHover: false, fade: true, draggable: false, touchMove: false,
  });

  // Progress circle — hidden by its length, then redrawn from the start with 4.5s linear each time the section changes
  const path = document.querySelector(".mk-progress .path");
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  const start = () => {
    path.style.transition = "none";
    path.style.strokeDashoffset = len;
    if (reduce) return;
    setTimeout(() => {
      path.style.transition = `stroke-dashoffset ${AUTO}ms linear`;
      path.style.strokeDashoffset = 0;
    }, 50);
  };
  $slide.on("beforeChange", start);
  start();
})();
