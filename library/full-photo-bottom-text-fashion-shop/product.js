// View switch — original c-view-switcher: puts the chosen column count straight into the grid variable (wide screen 2 · 4 · 8, phone 1 · 2)
(() => {
  const box = document.querySelector("[data-en-view]");
  if (!box) return;
  const wide = matchMedia("(min-width: 700px)");
  const apply = () => {
    const set = box.querySelector(`[data-en-viewsw="${wide.matches ? "desktop" : "mobile"}"] input:checked`);
    if (set) box.style.setProperty("--cols", set.value);
  };
  box.querySelectorAll("[data-en-viewsw] input").forEach((i) => i.addEventListener("change", apply));
  wide.addEventListener("change", apply);
  apply();
})();
