// Admissions tabs — only the pressed tab’s table shows, and the left and right arrow keys also move between them
(() => {
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    const items = [...tab.querySelectorAll("[data-tab-item]")];
    const panes = [...tab.querySelectorAll("[data-tab-pane]")];
    const pick = (i) => {
      items.forEach((b, j) => { b.classList.toggle("is-active", i === j); b.setAttribute("aria-selected", i === j); });
      panes.forEach((p, j) => { p.classList.toggle("is-active", i === j); p.hidden = i !== j; });
      panes[i].querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      ScrollTrigger.refresh();
    };
    items.forEach((b, i) => {
      b.addEventListener("click", () => pick(i));
      b.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        const n = (i + d + items.length) % items.length;
        items[n].focus();
        pick(n);
      });
    });
  });
})();
