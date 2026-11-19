// Contact — three tabs: pressing swaps the panel in .2s, and the line between tabs up to the chosen one fills in .9s
(() => {
  const tabs = [...document.querySelectorAll(".ct-tab")], seps = [...document.querySelectorAll(".ct-sep")], panels = [...document.querySelectorAll(".ct-panel")];
  const pick = (i) => {
    tabs.forEach((t, k) => { t.classList.toggle("is-on", k === i); t.setAttribute("aria-selected", String(k === i)); });
    seps.forEach((s, k) => s.classList.toggle("is-full", k < i));
    panels.forEach((p, k) => { const on = k === i; p.hidden = !on; requestAnimationFrame(() => p.classList.toggle("is-on", on)); });
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => pick(i)));
  document.querySelectorAll(".check__box").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-checked", String(b.getAttribute("aria-checked") !== "true"))));
  document.querySelectorAll(".ct-select").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"))));
})();
