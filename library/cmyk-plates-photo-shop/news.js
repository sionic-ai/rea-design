// Category pill: pressing the + pill opens and closes a small branch panel
(() => {
  document.querySelectorAll(".nw-cats__more").forEach((b) => {
    const child = b.nextElementSibling;
    b.addEventListener("click", () => {
      const open = !b.classList.contains("is-open");
      b.classList.toggle("is-open", open);
      child?.classList.toggle("is-show", open);
    });
  });
})();
