// Category card: stays pinned under the header bar while the body passes (original setupPin — start and end pulled by the header bar height, wide screens only)
(() => {
  const side = document.querySelector(".nl__side"), content = document.querySelector(".nl__content");
  const headOf = () => side.querySelector(".nl__sidehead").offsetHeight;
  const bar = () => document.querySelector(".zb-head").offsetHeight;
  ZB.mm.add("(min-width: 769px)", () => {
    ScrollTrigger.create({
      trigger: content, pin: side,
      start: () => `top-=${headOf()} top+=${bar()}`,
      end: () => `bottom-=${headOf()} top+=${bar() + side.offsetHeight}`,
    });
  });
  document.querySelectorAll(".nl__tag").forEach((b, i, all) => b.addEventListener("click", () => all.forEach((x) => x.classList.toggle("is-on", x === b))));
})();
