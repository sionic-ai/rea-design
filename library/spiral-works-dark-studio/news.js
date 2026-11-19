// Branch buttons — keep only the cards of the pressed branch (All shows everything), and since the remaining cards change position, re-measure ScrollTrigger
(() => {
  const chips = [...document.querySelectorAll(".v-chips button")], cards = [...document.querySelectorAll("[data-cat]")];
  chips.forEach((b, i) => b.addEventListener("click", () => {
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    cards.forEach((c) => (c.hidden = i !== 0 && c.dataset.cat !== b.textContent));
    ScrollTrigger.refresh();
  }));
})();
