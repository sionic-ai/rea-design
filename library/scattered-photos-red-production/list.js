// List search·sort: keeps only rows containing the search term and hides empty year bands. The sort button reorders rows per band by that column’s text (ascending·descending on each press),
// The first press on name sort rotates only its ▾ by −87° over .5s (original Click sort button)
(() => {
  const { reduce } = window.snSite;
  const years = [...document.querySelectorAll("[data-sn-year]")];
  const input = document.querySelector("[data-sn-search]");
  const text = (row, key) => (row.querySelector(`.sn-row__${key}`)?.textContent || "").trim().toLowerCase();

  input?.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    years.forEach((y) => {
      let shown = 0;
      y.querySelectorAll("[data-sn-row]").forEach((row) => {
        const hit = !q || row.textContent.toLowerCase().includes(q);
        row.hidden = !hit;
        shown += hit ? 1 : 0;
      });
      y.hidden = shown === 0;
    });
  });

  const dir = {};
  document.querySelectorAll("[data-sn-sort]").forEach((btn) => {
    const key = btn.getAttribute("data-sn-sort");
    btn.addEventListener("click", () => {
      dir[key] = dir[key] === 1 ? -1 : 1;
      years.forEach((y) => {
        const box = y.querySelector(".sn-year__rows");
        [...box.children].sort((a, b) => text(a, key).localeCompare(text(b, key)) * dir[key]).forEach((r) => box.appendChild(r));
      });
      const caret = btn.querySelector(".sn-sort__caret");
      if (caret && key === "name") gsap.to(caret, { rotation: -87, duration: reduce ? 0 : 0.5, ease: "none" });
    });
  });
})();
