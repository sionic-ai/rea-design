(() => {
  /* Character cards: only the hovered card lights up */
  const cards = [...document.querySelectorAll(".js-services-card")];
  cards.forEach((c) => {
    c.addEventListener("mouseenter", () => { cards.forEach((o) => o.classList.remove("is-active")); c.classList.add("is-active"); });
    c.addEventListener("mouseleave", () => c.classList.remove("is-active"));
  });
})();
