// First page — switch the grid with Feed · Work · News pills, swap the hero for that office drawer with the + city (click again to close), city list via a globe button on phones.
// In the original both are Framer variant changes, so they switch immediately without transition (+ the icon’s 45° too, instantly)
(() => {
  const hero = document.querySelector(".b-hero");
  const tabs = [...document.querySelectorAll(".b-tab")];
  const panels = [...document.querySelectorAll("[data-view-panel]")];
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => { const on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", String(on)); });
    panels.forEach((p) => { p.hidden = p.dataset.viewPanel !== t.dataset.view; });
  }));

  const btns = [...document.querySelectorAll("[data-city]")];
  const open = (id) => {
    btns.forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.city === id)));
    document.querySelectorAll(".b-city").forEach((c) => { c.hidden = c.id !== id; });
    hero.classList.toggle("is-city", !!id);
  };
  btns.forEach((b) => b.addEventListener("click", () => open(b.getAttribute("aria-expanded") === "true" ? null : b.dataset.city)));

  const globe = document.querySelector("[data-globe]");
  globe?.addEventListener("click", () => {
    const on = !hero.classList.contains("is-globe");
    hero.classList.toggle("is-globe", on);
    globe.setAttribute("aria-expanded", String(on));
    if (!on) open(null);
  });

  const mark = document.querySelector(".b-mark");
  mark?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mark.click(); } });
})();
