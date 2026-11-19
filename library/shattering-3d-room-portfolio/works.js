// Work list filter — pressing a category button leaves only that category’s cards and changes the count text (original: instant hide, button color .2s)
(() => {
  const btns = [...document.querySelectorAll("[data-filter]")], cards = [...document.querySelectorAll(".project-card")], count = document.querySelector("[data-project-count]");
  btns.forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.filter;
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    let n = 0;
    cards.forEach((c) => { const on = f === "all" || c.dataset.category === f; c.hidden = !on; if (on) n++; });
    if (count) count.textContent = `${String(n).padStart(2, "0")} PROJECT${n === 1 ? "" : "S"}`;
  }));
})();
