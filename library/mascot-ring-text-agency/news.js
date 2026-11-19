// News — filter chips and view buttons turn on one at a time (waves are css keyframes)
(() => {
  document.querySelectorAll(".n-chips").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest(".q-filter, .n-view button"); if (!b) return;
    const set = b.classList.contains("q-filter") ? g.querySelectorAll(".q-filter") : g.querySelectorAll(".n-view button");
    set.forEach((x) => x.classList.toggle("is-on", x === b));
  }));
})();
