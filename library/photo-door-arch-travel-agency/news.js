// Journal list: when the map is visible its lines are drawn (2.6s, .25s per piece) and pins light up in turn. The note entering the central 10% band of the screen lights up and the map pin and place name follow.
// Tapping a pin smoothly scrolls to that note.
(() => {
  const map = document.querySelector(".jn-atlas__map");
  const list = document.querySelector(".jn-atlas__list");
  if (!map || !list) return;
  const where = map.querySelector(".jn-atlas__where");
  const entries = [...list.querySelectorAll("[data-slug]")];
  const pins = [...map.querySelectorAll(".jn-map__pin")];
  let on = entries[0]?.dataset.slug;
  const set = (slug) => {
    if (slug === on) return;
    on = slug;
    entries.forEach((e) => e.classList.toggle("is-on", e.dataset.slug === slug));
    pins.forEach((p) => p.classList.toggle("is-on", p.dataset.slug === slug));
    const k = entries.findIndex((e) => e.dataset.slug === slug);
    // Redrawn each time the name changes, so the .6s rise-up runs again
    where.innerHTML = `<span><span class="jn-atlas__where-place">Place ${k + 1}, Region</span><span class="jn-atlas__where-coords">00.0000° N, 0.0000° E</span></span>`;
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && set(e.target.dataset.slug)), { rootMargin: "-45% 0px -45% 0px" });
  entries.forEach((e) => io.observe(e));
  const draw = new IntersectionObserver(([e]) => { if (e.isIntersecting) { map.classList.add("is-drawn"); draw.disconnect(); } });
  draw.observe(map);
  pins.forEach((p) => p.addEventListener("click", () => {
    const e = entries.find((x) => x.dataset.slug === p.dataset.slug);
    if (!e) return;
    const top = e.getBoundingClientRect().top + scrollY - innerHeight / 2 + e.offsetHeight / 2;
    if (window.qsSite?.lenis) window.qsSite.lenis.scrollTo(top); else scrollTo({ top, behavior: "smooth" });
  }));
})();
