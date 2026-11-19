// About: clicking a dot in the production photo makes it the current dot (small dark plate) and the left text panel switches to that dot’s story — original product-features (switches instantly, no motion)
(() => {
  document.querySelectorAll(".mm-craft").forEach((sec) => {
    const spots = [...sec.querySelectorAll("[data-point]")];
    const feats = [...sec.querySelectorAll("[data-feature]")];
    spots.forEach((s) => s.addEventListener("click", () => {
      spots.forEach((o) => o.classList.toggle("is-active", o === s));
      feats.forEach((f) => { f.hidden = f.dataset.feature !== s.dataset.point; });
    }));
  });
})();
