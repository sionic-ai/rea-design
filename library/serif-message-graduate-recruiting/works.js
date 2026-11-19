// Job filter — keeps only the cards of the chosen job (All shows everything)
(() => {
  const btns = document.querySelectorAll(".ns-filter__btn"), cards = document.querySelectorAll(".ns-wl__grid > li");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    cards.forEach((c) => (c.hidden = b.dataset.job !== "Everyone" && c.dataset.job !== b.dataset.job));
  }));
})();
