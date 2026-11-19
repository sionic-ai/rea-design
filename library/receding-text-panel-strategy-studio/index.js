// Home — the second sentence of About switches to the next one every 3 seconds (original Statements animation_interval 3 · duration 1).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-fg-rotate]").forEach((list) => {
    const items = [...list.children];
    if (!items.length) return;
    let i = 0;
    items[0].classList.add("is-on");
    if (items.length < 2 || reduce) return;
    setInterval(() => {
      items[i].classList.remove("is-on");
      i = (i + 1) % items.length;
      items[i].classList.add("is-on");
    }, +list.dataset.fgRotate || 3000);
  });
})();
