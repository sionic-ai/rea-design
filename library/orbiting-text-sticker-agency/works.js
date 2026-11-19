// Results list: picking a category chip fades the rest (the original goes to that category’s page), and ”Show all categories” expands every chip.
// Tapping a map pin shows that pin’s label.
(() => {
  const box = document.querySelector(".wk-chips");
  const chips = [...document.querySelectorAll(".wk-chips button")];
  chips.forEach((c) => c.addEventListener("click", () => {
    const on = !c.classList.contains("is-on");
    chips.forEach((o) => o.classList.toggle("is-on", on && o === c));
    box.classList.toggle("is-picked", on);
  }));
  const all = document.querySelector(".wk-all"), cats = document.querySelector(".wk-cats");
  all?.addEventListener("click", () => {
    const open = cats.classList.toggle("is-all");
    all.textContent = open ? "Close" : "View all categories";
    all.setAttribute("aria-expanded", open);
  });
  const pins = [...document.querySelectorAll(".wk-pin")];
  pins.forEach((p) => p.addEventListener("click", () => pins.forEach((o) => o.classList.toggle("is-on", o === p && !o.classList.contains("is-on")))));
})();
