// Work list: each row grows in width from 125% → 500% by (screen height - row top) / (row height + screen height) (every tick).
// Panel height is fixed in advance to the height when all rows have grown — so the document length stays the same even as rows grow and push the rows below.
window.yf.scene((mm) => {
  mm.add("(min-width: 1000px)", () => {
    const box = document.querySelector(".yf-works");
    const rows = gsap.utils.toArray(".yf-works__row", box);
    if (!rows.length) return;
    const MIN = 125, MAX = 500;
    const fit = () => {
      rows[0].style.width = `${MAX}%`;
      const h = rows[0].offsetHeight;
      rows[0].style.width = "";
      const cs = getComputedStyle(box), gap = parseFloat(cs.rowGap) || 0, pad = parseFloat(cs.paddingTop) || 0;
      box.style.height = `${h * rows.length + gap * (rows.length - 1) + 2 * pad}px`;
    };
    const tick = () => {
      const vh = innerHeight;
      rows.forEach((row) => {
        const r = row.getBoundingClientRect();
        const o = Math.max(0, Math.min(1, (vh - r.top) / (r.height + vh)));
        row.style.width = `${MIN + (MAX - MIN) * o}%`;
      });
    };
    fit();
    gsap.ticker.add(tick);
    addEventListener("resize", fit);
    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("resize", fit);
      box.style.height = "";
      rows.forEach((r) => (r.style.width = ""));
    };
  });
});
