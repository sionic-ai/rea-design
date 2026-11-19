// Services: the table-of-contents link of the service item most visible on screen gets bolder (thresholds 0–1 measured in .1 steps)
(() => {
  const links = [...document.querySelectorAll(".an-feed__anchor")], items = [...document.querySelectorAll(".an-feed__item")];
  if (!links.length || !items.length) return;
  const seen = new Map();
  const pick = () => {
    let best = 0, id = null;
    for (const [k, h] of seen) if (h > best) { best = h; id = k; }
    if (id !== null) links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href").slice(1) === id));
  };
  const io = new IntersectionObserver((es) => { es.forEach((e) => seen.set(e.target.id, e.intersectionRect.height)); pick(); }, { threshold: [...Array(11)].map((_, i) => i / 10) });
  items.forEach((it) => io.observe(it));
})();
