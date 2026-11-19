// Home only — icon tabs in the search section (original static-top-new.js: the pressed tab gets -is-active, only the panel whose id matches the value gets -is-active, switching with no transition)
(() => {
  const start = () => {
    const tabs = [...document.querySelectorAll(".js-shtab button")];
    tabs.forEach((b) => b.addEventListener("click", () => {
      tabs.forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", x === b); });
      document.querySelectorAll(".nb-sh__content").forEach((c) => c.classList.toggle("is-active", c.id === b.dataset.target));
    }));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
