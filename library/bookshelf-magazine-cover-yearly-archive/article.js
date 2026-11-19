// Pressing a floor plan number opens that spot’s description box. Only one is open, and it closes via close, Esc, or another number.
(() => {
  const items = [...document.querySelectorAll(".ar-item__nums > li")];
  const close = () => items.forEach((li) => li.classList.remove("is-act"));
  items.forEach((li) => {
    li.querySelector(".ar-num").addEventListener("click", () => {
      const open = li.classList.contains("is-act");
      close();
      if (!open) li.classList.add("is-act");
    });
    li.querySelector(".ar-box__close").addEventListener("click", close);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
