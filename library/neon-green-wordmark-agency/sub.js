// Subpage: case filter chips filter the cards. The header title doesn’t move in the original and just appears (the screen changes all at once after the transition, 183ms).
(() => {
  // The original is Finsweet list filtering: within one row, matching any one chosen (OR), across rows all must match (AND). ”All” clears that row
  const chips = [...document.querySelectorAll(".wk-filter .nv-chip")];
  const cards = [...document.querySelectorAll("[data-slot=interview-grid] .nv-card")];
  const apply = () => {
    const picked = {};
    chips.forEach((c) => c.classList.contains("is-on") && c.dataset.val !== "all" && (picked[c.dataset.key] ||= []).push(c.dataset.val));
    cards.forEach((card) => { card.hidden = !Object.entries(picked).every(([k, vals]) => vals.includes(card.dataset[k])); });
    window.ScrollTrigger?.refresh();
  };
  chips.forEach((chip) => {
    chip.setAttribute("aria-pressed", chip.classList.contains("is-on"));
    chip.addEventListener("click", () => {
      const row = chips.filter((c) => c.dataset.key === chip.dataset.key);
      const all = row.find((c) => c.dataset.val === "all");
      if (chip === all) row.forEach((c) => c.classList.toggle("is-on", c === all));
      else {
        chip.classList.toggle("is-on");
        all?.classList.toggle("is-on", !row.some((c) => c !== all && c.classList.contains("is-on")));
      }
      row.forEach((c) => c.setAttribute("aria-pressed", c.classList.contains("is-on")));
      apply();
    });
  });
})();
