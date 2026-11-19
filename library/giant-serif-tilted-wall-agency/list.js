// Category chips — in the original each category is a same-shaped page at a different address (works-cat/…), so here the chips filter within one page.
AD.page("list", (main) => {
  const chips = [...main.querySelectorAll(".ad-filter__item")];
  const cases = [...main.querySelectorAll(".wk-case")];
  const empty = main.querySelector(".wk-empty");
  const crumbCat = main.querySelector(".wk-crumbCat");
  const pick = (cat, push) => {
    chips.forEach((c) => c.classList.toggle("is-current", c.dataset.cat === cat));
    let shown = 0;
    cases.forEach((el) => { const on = cat === "all" || el.dataset.cat === cat; el.hidden = !on; shown += on; });
    empty.hidden = shown > 0;
    const chip = chips.find((c) => c.dataset.cat === cat);
    crumbCat.hidden = cat === "all";
    crumbCat.querySelector("p").textContent = chip ? chip.textContent.trim() : "";
    if (push) history.replaceState(history.state, "", cat === "all" ? location.pathname : `#cat${cat}`);
    ScrollTrigger.refresh();
  };
  chips.forEach((c) => c.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); pick(c.dataset.cat, true); }));
  const m = location.hash.match(/^#cat(\d)$/);
  pick(m ? m[1] : "all", false);
});
