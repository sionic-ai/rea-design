// ”Settled” section — once a cell’s top edge reaches 80% of the screen it becomes ”visible” once (the original only adds a class and a CSS transition does the moving)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const els = document.querySelectorAll("[data-gd-reveal], .gd-fade");
  if (reduce) { els.forEach((el) => el.classList.add("is-shown")); return; }
  gsap.matchMedia().add("all", () => {
    els.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-shown") }));
  });
})();
