// Workshop detail — when more than half of the course panel is visible, reduce the back photo blur to 1/3 (original threshold .5, .5s)
(() => {
  const p = document.querySelector(".fg-proc"), inner = p && p.querySelector(".fg-proc__inner");
  if (!inner) return;
  new IntersectionObserver((es) => es.forEach((en) => p.classList.toggle("is-visible", en.isIntersecting)), { threshold: 0.5 }).observe(inner);
})();
