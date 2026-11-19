// Work detail: the contents row of the most visible section lights up and its summary expands (.4s), pressing a contents name scrolls smoothly to that section
(() => {
  const rows = [...document.querySelectorAll(".an-sw-main__row")], parts = [...document.querySelectorAll(".an-flex-row")];
  if (!rows.length || !parts.length) return;
  const seen = new Map();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => seen.set(e.target.dataset.index, e.intersectionRect.height));
    let best = 0, id = null;
    for (const [k, h] of seen) if (h > best) { best = h; id = k; }
    if (id !== null) rows.forEach((r) => r.classList.toggle("is-active", r.dataset.index === id));
  }, { threshold: [...Array(11)].map((_, i) => i / 10) });
  parts.forEach((p) => io.observe(p));
  rows.forEach((r) => r.querySelector("a")?.addEventListener("click", (e) => {
    e.preventDefault();
    const t = document.querySelector('.an-flex-row[data-index="' + r.dataset.index + '"]');
    if (!t) return;
    if (window.lenisInstance) window.lenisInstance.scrollTo(t); else t.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
})();
