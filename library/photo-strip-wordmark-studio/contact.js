// Contact — the question section and the office panel stick when they reach the top of the screen (ScrollTrigger pin, no spacing) and the next panel rises over them to cover. It sits inside a smooth-scroll panel so sticky is not used
(() => {
  gsap.registerPlugin(ScrollTrigger);
  // The FAQ section sticks too — in the original, the first office panel covers over the FAQ and rises
  const panels = [document.querySelector(".ax-ask"), ...document.querySelectorAll(".ax-office")];
  panels.slice(0, -1).forEach((p) => ScrollTrigger.create({ trigger: p, start: "top top", endTrigger: panels[panels.length - 1], end: "top top", pin: true, pinSpacing: false }));
})();
