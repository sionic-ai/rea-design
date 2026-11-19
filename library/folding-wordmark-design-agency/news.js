/* News — post cards in a masonry layout (same layout and options as the original Masonry) */
(() => {
  frReady.then(() => {
    const wall = document.querySelector("[data-masonry]");
    if (!wall || !window.Masonry) return;
    new Masonry(wall, { itemSelector: ".fr-card-w", columnWidth: 10, gutter: 10 });
    const m = new Masonry(wall, {});
    // Load more — the original receives the next page’s cards, appends them and restacks the bricks. As a placeholder it clones the first three cards and appends them, appended card photos load at blur 5px · .3
    const more = document.querySelector("[data-more]");
    more?.addEventListener("click", () => {
      const add = [...wall.children].slice(0, 3).map((c) => {
        const n = c.cloneNode(true);
        n.querySelectorAll(".fr-lazy").forEach((f) => f.classList.remove("is-loaded"));
        wall.append(n);
        return n;
      });
      m.appended(add);
      requestAnimationFrame(() => requestAnimationFrame(() => add.forEach((n) => n.querySelectorAll(".fr-lazy").forEach((f) => f.classList.add("is-loaded")))));
      ScrollTrigger.refresh();
    });
  });
})();
