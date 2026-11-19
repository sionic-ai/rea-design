// ‹Other work› — current work (data-key=this) is excluded, the rest are shuffled and only two are shown (original Fisher–Yates)
(() => {
  const list = document.querySelector("[data-random-list]");
  if (!list) return;
  let items = [...list.children];
  items.forEach((it) => (it.style.display = "none"));
  items = items.filter((it) => it.dataset.key !== "this");
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((it) => list.appendChild(it));
  items.slice(0, 2).forEach((it) => (it.style.display = "flex"));
})();
