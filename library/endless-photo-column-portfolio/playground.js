// Phone list — the original fetches data after 1s, draws cells .15s later, and 1s after that fades the panel in over .5s. Only visible cells (10% · 50px margin) play video.
(() => {
  const list = document.querySelector(".cd-pg-list");
  if (!list || innerWidth >= 768) return;
  setTimeout(() => list.classList.add("is-in"), 2150);
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.querySelector(".is-video")?.classList.toggle("is-playing", e.isIntersecting)), { rootMargin: "50px", threshold: 0.1 });
  list.querySelectorAll(".cd-pg-list__cell").forEach((c) => io.observe(c));
})();
