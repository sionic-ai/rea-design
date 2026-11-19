// Solutions page — when an annotated screen is half visible, the annotations float up in order (original data-animated)
(() => {
  const stage = document.querySelector("[data-snap]");
  if (!stage) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { stage.classList.add("is-in"); return; }
  const io = new IntersectionObserver((list) => {
    if (list.some((e) => e.isIntersecting)) { stage.classList.add("is-in"); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(stage);
})();
