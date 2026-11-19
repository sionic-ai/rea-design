// Work list — original Finsweet list filtering (category checkboxes, title search) with the same result: only cards that belong to one of the chosen categories and whose title contains the search term remain.
AB.page("works", (root, { k }) => {
  const form = root.querySelector("[data-filters]");
  if (!form) return {};
  const items = [...root.querySelectorAll("[data-cat]")];
  const empty = root.querySelector("[data-empty]");
  const q = form.querySelector("[data-filter-q]");
  const apply = () => {
    const cats = [...form.querySelectorAll("[data-filter-cat]:checked")].map((c) => c.value);
    const term = q.value.trim().toLowerCase();
    let n = 0;
    items.forEach((it) => {
      const ok = (!cats.length || cats.includes(it.dataset.cat)) && (!term || it.dataset.title.toLowerCase().includes(term));
      it.hidden = !ok;
      if (ok) n++;
    });
    empty.hidden = n > 0;
    ScrollTrigger.refresh();
  };
  k.on(form, "input", apply);
  k.on(form, "change", apply);
  return {};
});
