// Original about.js — while the big photo spans the screen, it is pushed up by (distance passed from the bottom of the screen × .1)
(() => {
  const box = document.querySelector(".ab-parallax");
  const img = box?.querySelector(".parallax-img");
  if (!img || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const run = () => {
    const r = box.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) img.style.transform = `translate(-50%, -${(innerHeight - r.top) * 0.1}px)`;
  };
  addEventListener("scroll", run, { passive: true });
  run();
})();
