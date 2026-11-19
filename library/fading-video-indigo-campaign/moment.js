/* Moment gallery — 20 at a time, 20 more per More click. A pill tab keeps only that event’s photos (the original reloads via a URL query) */
(() => {
  const grid = document.querySelector("[data-gallery]");
  const tpl = document.querySelector("template[data-gallery-item]");
  let more = document.querySelector("[data-more]");
  const events = { a: "Event Name 2026", b: "Market Name 2026", c: "FESTIVAL NAME 2026" };
  const keys = Object.keys(events);
  const all = Array.from({ length: 60 }, (_, i) => ({ no: 381 - i, key: keys[Math.floor(i / 20)] }));
  let filter = "all";
  let shown = 20;

  const render = () => {
    const list = all.filter((it) => filter === "all" || it.key === filter);
    grid.replaceChildren(...list.slice(0, shown).map((it) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.querySelector("[data-no]").textContent = it.no;
      node.querySelector("[data-event]").textContent = events[it.key];
      return node;
    }));
    more.parentElement.hidden = shown >= list.length;
  };

  /* Original redraws the button below the list after loading more — swap in a new button so the pushed-out button does not leave a hover-release transition */
  /* The original draws after loading the next batch — the new photos attach about 50ms after the press */
  const onMore = () => setTimeout(() => {
    shown += 20;
    render();
    const fresh = more.cloneNode(true);
    more.replaceWith(fresh);
    more = fresh;
    more.addEventListener("click", onMore);
  }, 50);
  more.addEventListener("click", onMore);
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    filter = b.dataset.filter;
    shown = 20;
    document.querySelectorAll("[data-filter]").forEach((x) => x.classList.toggle("is-current", x === b));
    render();
  }));
  render();
})();
