// About: vision strip width 95%→100% (start "top 50%" end "bottom 100%" scrub 1, 768 and up) · square-grid map · people modal (remodal) · Vision slide-through on phones (Swiper).
(() => {
  const { reduced } = SW;

  // Square-cell map — fills the arc-shaped island with cells, visited cells turn red (original coordinates are not used)
  const svg = document.querySelector(".area .map");
  const isles = [{ cx: 760, cy: 140, rx: 150, ry: 115, r: -20 }, { cx: 600, cy: 400, rx: 95, ry: 250, r: 30 }, { cx: 400, cy: 610, rx: 85, ry: 200, r: 64 }, { cx: 250, cy: 720, rx: 75, ry: 95, r: 40 }, { cx: 140, cy: 800, rx: 80, ry: 62, r: 0 }, { cx: 330, cy: 860, rx: 30, ry: 30, r: 0 }];
  const inside = (x, y) => isles.some(({ cx, cy, rx, ry, r }) => {
    const a = (r * Math.PI) / 180, dx = x - cx, dy = y - cy;
    const u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
    return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1;
  });
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let cells = "";
  for (let y = 0; y < 900; y += 22) for (let x = 0; x < 950; x += 22) {
    if (!inside(x + 10, y + 10)) continue;
    const red = rnd() < (y < 520 ? 0.55 : 0.2);
    cells += `<rect x="${x}" y="${y}" width="19" height="19" fill="${red ? "var(--kf-accent)" : "var(--site-map-cell)"}"/>`;
  }
  svg.innerHTML = cells;

  // Person window — remodal 1.1.0 same as the original (hash following turned off). Copies the pressed person’s name and role into the window
  document.querySelectorAll("[data-member]").forEach((a) => a.addEventListener("click", () => {
    const modal = document.querySelector('[data-remodal-id="member"]');
    modal.querySelector(".name").textContent = a.querySelector(".name").textContent;
    modal.querySelector(".cat").textContent = a.querySelector(".cat").textContent;
  }));

  // Vision two-tier — Swiper only at 767 and below (removed when wider, like the original)
  let vision;
  const mql = matchMedia("(max-width: 767px)");
  const visionSwiper = () => {
    if (mql.matches && !vision) vision = new Swiper(".vision__swiper", { slidesPerView: 1.5, spaceBetween: 0, slidesOffsetAfter: 120, watchOverflow: false, scrollbar: { el: ".vision__swiper .swiper-scrollbar", draggable: true } });
    else if (!mql.matches && vision) { vision.destroy(true, true); vision = undefined; }
  };
  visionSwiper();
  mql.addEventListener("change", visionSwiper);

  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".vision", { width: "95%" }, { width: "100%", ease: "none", scrollTrigger: { trigger: ".vision", start: "top 50%", end: "bottom 100%", scrub: 1, invalidateOnRefresh: true } });
  });
  if (reduced) gsap.set(".vision", { width: "100%" });
})();
