// Directions: fills in the hand-drawn guide map.
(() => {
  M.page("access", (main) => {
    main.querySelector("[data-map]").innerHTML = M.map();
  });
})();
