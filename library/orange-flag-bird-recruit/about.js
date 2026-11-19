// Learn about combinations: timeline line — the line grows from the screen bottom edge up to a point 20% of the screen short (stopping 5px below the last circle),
// Each year’s circle turns on when it crosses the 30% line from the screen bottom (original .js-progress-line · .js-line-circle)
(() => {
  const line = document.querySelector(".ab-line"), bar = line?.querySelector(".ab-line__progress"), years = [...document.querySelectorAll(".ab-year")];
  if (!line || !bar) return;
  const update = () => {
    const vh = innerHeight, bottom = scrollY + vh, top = bar.getBoundingClientRect().top + scrollY;
    const last = years[years.length - 1]?.querySelector(".ab-year__dot");
    const max = last ? Math.max(0, last.getBoundingClientRect().top + scrollY - top - 5) : line.offsetHeight;
    bar.style.height = Math.max(0, Math.min(bottom - top - 0.2 * vh, max)) + "px";
    years.forEach((y) => y.classList.toggle("is-active", bottom > y.getBoundingClientRect().top + scrollY + 0.3 * vh));
  };
  ["scroll", "resize", "load"].forEach((t) => addEventListener(t, update, { passive: true }));
  update();
})();
