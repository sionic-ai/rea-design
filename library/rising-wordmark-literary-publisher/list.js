// List page — category buttons change the pressed state, and author initial buttons keep only that letter’s authors (everything is ”All”)
(() => {
  document.querySelectorAll(".li-chips").forEach((group) => {
    const chips = [...group.querySelectorAll(".li-chip")];
    const cards = [...document.querySelectorAll("[data-letter]")];
    chips.forEach((chip) => chip.addEventListener("click", () => {
      const all = chip.classList.contains("is-all");
      const letter = chip.dataset.letter;
      if (letter || all) chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      else chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
      if (letter || all) cards.forEach((c) => { c.hidden = !all && c.dataset.letter !== letter; });
      window.ScrollTrigger?.refresh();
    }));
  });
})();
