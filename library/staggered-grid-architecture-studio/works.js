// Work list — in the original, choosing a field fetches a new list with htmx: the results turn transparent right away (0s), and after the fetched list is swapped in they return over .32s cubic-bezier(.625,.05,0,1).
// The copy keeps the same type, with .5s measured from the original in the receive-time slot, and cards are re-shown by skipping. ‹Show all› clears every chosen cell, and even if all are already visible it refetches the list like the original.
(() => {
  const list = document.querySelector(".w-list .x-items"), all = document.querySelector(".w-filter-all"), boxes = [...document.querySelectorAll(".w-filter input")];
  const cards = [...list.querySelectorAll(".x-card")];
  let t = 0;
  const apply = () => {
    const on = boxes.filter((b) => b.checked).map((b) => b.value);
    cards.forEach((c) => c.classList.toggle("is-hidden", on.length > 0 && !on.includes(c.dataset.cat)));
    list.querySelectorAll(".x-batch").forEach((b) => (b.hidden = !b.querySelector(".x-card:not(.is-hidden)")));
  };
  const run = () => {
    if (X.reduce) return apply();
    list.classList.add("is-filtering");
    clearTimeout(t);
    t = setTimeout(() => { apply(); list.classList.remove("is-filtering"); requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh())); }, 500);
  };
  boxes.forEach((b) => b.addEventListener("change", run));
  all.addEventListener("click", () => { boxes.forEach((b) => (b.checked = false)); run(); });
})();
