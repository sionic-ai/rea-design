// Category tabs: on click the list blurs for .3s and returns (the original FAQ·News filtering)
(() => {
  const grid = document.querySelector(".nw-grid");
  document.querySelectorAll(".nw-cats button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".nw-cats button").forEach((o) => o.classList.toggle("is-active", o === b));
      grid.classList.add("is-fade");
      setTimeout(() => grid.classList.remove("is-fade"), TD.reduced ? 0 : 300);
    })
  );
})();
