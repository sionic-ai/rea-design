// Services — matches the heights of the what-we-do cell headers (photo · name · description) within the same row, so the list below starts at the same height on every row (original adjustHeight)
(() => {
  const NS = (window.NS = window.NS || { views: {} });
  let ro = null;
  const fit = (heads) => {
    heads.forEach((h) => (h.style.minHeight = ""));
    const rows = new Map();
    heads.forEach((h) => {
      const top = Math.round(h.getBoundingClientRect().top + scrollY);
      const key = [...rows.keys()].find((k) => Math.abs(k - top) <= 5) ?? top;
      rows.set(key, [...(rows.get(key) || []), h]);
    });
    rows.forEach((list) => {
      const max = Math.max(...list.map((h) => h.offsetHeight));
      list.forEach((h) => (h.style.minHeight = `${max}px`));
    });
  };
  NS.views.service = {
    init(c) {
      const heads = [...c.querySelectorAll(".ns-cap__head")];
      if (!heads.length) return;
      ro = new ResizeObserver(() => requestAnimationFrame(() => fit(heads)));
      ro.observe(c.querySelector(".ns-caps"));
      fit(heads);
    },
    destroy() { ro?.disconnect(); ro = null; },
  };
})();
