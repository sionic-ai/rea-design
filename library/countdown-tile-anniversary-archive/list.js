// List-page category pills: filter cards in place by their data-cat (a News list with no tags only moves the active marker).
(() => {
  const pills = [...document.querySelectorAll(".nt-cats .nt-pill")];
  const items = [...document.querySelectorAll("[data-cat]")];
  pills.forEach((p) =>
    p.addEventListener("click", () => {
      pills.forEach((q) => q.classList.toggle("is-on", q === p));
      const f = p.dataset.filter;
      if (!f) return;
      items.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
      ScrollTrigger.refresh();
    })
  );
})();
