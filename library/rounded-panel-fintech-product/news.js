// Blog list — the filter pill is moved by the pill-tab-slide part. Only rows matching the chosen category remain (placeholder, so it filters by category text)
(() => {
  const tabs = document.querySelectorAll(".av-filter [data-fx-part=tab]");
  const rows = document.querySelectorAll(".av-row");
  tabs.forEach((t) => t.addEventListener("click", () => {
    const want = t.textContent.trim();
    rows.forEach((r) => {
      const cats = [...r.querySelectorAll(".av-cat")].map((c) => c.textContent.trim());
      r.hidden = want !== "All" && !cats.includes(want);
    });
    ScrollTrigger.refresh();
  }));
})();
