// Original schedule.js: event band Splide auto-scroll (.5px/frame · gap 9 · width per card, phone two cards · gap 4) · age tabs only below 896px.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabs = () => {
    const btns = document.querySelectorAll(".tabbtn");
    const contents = document.querySelectorAll(".tab-content");
    btns.forEach((b, i) => b.addEventListener("click", () => {
      btns.forEach((o) => o.classList.toggle("active", o === b));
      contents.forEach((c, j) => c.classList.toggle("active", j === i));
    }));
  };
  addEventListener("load", () => {
    new Splide(".year__slider", {
      type: "loop", arrows: false, pagination: false, drag: false, gap: 9, autoWidth: true,
      breakpoints: { 896: { autoWidth: false, perPage: 2, gap: 4 } },
      autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false },
    }).mount(window.splide.Extensions);
    if (innerWidth < 896) tabs();
  });
})();
