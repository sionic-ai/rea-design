/* Topic list — in the original, pressing See more fetches the next page and appends cards, expanding from .7x scale 0.1s apart, and category pills navigate to the category page.
   The copy works within one page: More adds six cards of the same shape, and category pills keep only that category (opens directly via the address #report). */
(() => {
  const list = document.querySelector(".js-entries__items");
  const more = document.querySelector(".js-entries__more");
  if (!list) return;
  const pills = document.querySelectorAll(".p-topics__cat-link");
  const filter = (cat) => {
    pills.forEach((p) => p.classList.toggle("current", p.dataset.cat === cat));
    list.querySelectorAll(".p-topics__list").forEach((li) => li.classList.toggle("hidden", cat !== "all" && li.dataset.cat !== cat));
  };
  pills.forEach((p) => p.addEventListener("click", (e) => { e.preventDefault(); filter(p.dataset.cat); history.replaceState(null, "", `#${p.dataset.cat}`); }));
  const start = location.hash.slice(1);
  if ([...pills].some((p) => p.dataset.cat === start)) filter(start);

  if (!more) return;
  let pages = 0;
  more.querySelector(".c-link").addEventListener("click", () => {
    const src = [...list.querySelectorAll(".p-topics__list")].slice(0, 6);
    src.forEach((li, t) => {
      const c = li.cloneNode(true);
      c.classList.add("add-item");
      c.classList.remove("visibled");
      c.style.setProperty("--delay", `${0.1 * t}s`);
      list.appendChild(c);
      setTimeout(() => c.classList.add("visibled"), 100);
    });
    if (++pages >= 2) more.remove();
  });
})();
