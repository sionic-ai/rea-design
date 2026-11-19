// Product list: photo swap · filter button toggle · floating narrow-down button · narrow-down window · sort window
(() => {
  const grid = document.querySelector(".lb-grid");
  document.querySelectorAll(".lb-chips button, .lb-gmodal__group button").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-on")));

  // Floating narrow-down button: the button fixed on screen is shown only when its document position falls between the top and bottom of the product grid (original SortFloat — remeasured on every scroll and resize)
  const float = document.querySelector(".lb-float");
  const target = document.querySelector("[data-float-target]");
  const check = () => {
    const f = float.getBoundingClientRect().top;
    const t = target.getBoundingClientRect();
    float.classList.toggle("is-visible", t.top < f && f < t.bottom);
  };
  ["scroll", "resize", "pageshow"].forEach((ev) => addEventListener(ev, check, { passive: true }));
  check();

  // Narrow-down window (the sort row button and the floating button open the same window) and sort window. While open, the page behind doesn’t scroll
  const modals = [...document.querySelectorAll(".lb-gmodal")];
  const setModal = (name) => {
    modals.forEach((m) => {
      const on = m.dataset.name === name;
      m.classList.toggle("is-show", on);
      m.setAttribute("aria-hidden", String(!on));
    });
    document.documentElement.style.overflow = name ? "hidden" : "";
  };
  document.querySelectorAll("[data-narrow-open]").forEach((b) => b.addEventListener("click", () => setModal("narrow")));
  document.querySelectorAll("[data-sort-open]").forEach((b) => b.addEventListener("click", () => setModal("sort")));
  document.querySelectorAll("[data-narrow-close], [data-modal-close]").forEach((b) => b.addEventListener("click", () => setModal(null)));
  addEventListener("keydown", (e) => e.key === "Escape" && setModal(null));
  document.querySelectorAll(".lb-sort button").forEach((b) => b.addEventListener("click", () => document.querySelectorAll(".lb-sort button").forEach((x) => x.classList.toggle("is-on", x === b))));

  // Swap photo: every frame cross-fades to its second photo (the worn shot) all at once (450ms) — after the swap, hovering brings back the first photo
  const swap = document.querySelector("[data-swap]");
  swap.addEventListener("click", () => {
    const on = grid.classList.toggle("is-change");
    swap.setAttribute("aria-pressed", String(on));
  });
})();
