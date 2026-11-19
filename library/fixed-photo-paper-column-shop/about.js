// About us — add the sailboat and map drawings (the map once when visible)
(() => {
  document.querySelectorAll(".sect01 .illust").forEach((el) => (el.innerHTML = window.awBoat("sail").replace("class=\"aw-line\"", "class=\"aw-line is-flip\"")));
  const box = document.querySelector(".sect02 .sect-heading .illust");
  if (!box) return;
  box.innerHTML = window.awMap();
  const map = box.querySelector(".aw-map");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { map.classList.add("is-play"); io.disconnect(); } }));
  io.observe(map);
})();
