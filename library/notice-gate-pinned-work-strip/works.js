// Work list — on open, photos turn on .05s apart and filters .06s apart. Pressing a category or tag empties the columns, then fills the chosen photos into the shortest column first and turns them on again .04s apart
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gallery = document.querySelector(".ft-gallery");
  const cols = [...gallery.querySelectorAll(".ft-gallery__col")];
  const all = [...gallery.querySelectorAll(".ft-tile")];
  const filters = [...document.querySelectorAll(".ft-filter li")];
  const step = (els, ms) => els.forEach((el, i) => setTimeout(() => el.classList.add("is-in"), reduce ? 0 : i * ms));
  step(all, 50);
  step(filters, 60);

  const cats = [...document.querySelectorAll(".ft-filter__cats li")];
  const tags = [...document.querySelectorAll(".ft-filter__tags li")];
  let cat = "";
  let picked = [];
  const refill = () => {
    cats.forEach((li) => li.classList.toggle("is-active", (li.dataset.cat || "") === cat));
    tags.forEach((li) => li.classList.toggle("is-active", picked.includes(li.dataset.tag)));
    const show = all.filter((t) => !cat || t.dataset.cat === cat).sort(() => Math.random() - 0.5);
    cols.forEach((c) => c.replaceChildren());
    show.forEach((t) => {
      t.classList.remove("is-in");
      cols.reduce((a, b) => (b.offsetHeight < a.offsetHeight ? b : a)).append(t);
    });
    step(show, 40);
  };
  cats.forEach((li) => li.addEventListener("click", (e) => { e.preventDefault(); cat = li.dataset.cat || ""; refill(); }));
  tags.forEach((li) => li.addEventListener("click", (e) => {
    e.preventDefault();
    const t = li.dataset.tag;
    picked = picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t].slice(-2);
    refill();
  }));

  // more — the original loads 40 more at a time. As a placeholder, shuffle the current items and append one more set
  const more = document.querySelector(".ft-more .ft-btn1");
  more?.addEventListener("click", () => {
    more.disabled = true;
    more.textContent = "Loading...";
    setTimeout(() => {
      const extra = all.map((t) => t.cloneNode(true)).sort(() => Math.random() - 0.5);
      extra.forEach((t) => { t.classList.remove("is-in"); cols.reduce((a, b) => (b.offsetHeight < a.offsetHeight ? b : a)).append(t); });
      step(extra, 40);
      more.disabled = false;
      more.textContent = "more";
    }, reduce ? 0 : 300);
  });
})();
