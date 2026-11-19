// Field list: stacks rows overlapped (shared stickyStack), and pressing a field name scrolls to the start of that row over 2s.
(() => {
  const V = window.V;
  const section = document.querySelector(".ind-section");
  const wrappers = [...section.querySelectorAll(".ind-row-wrapper")];
  V.stickyStack(section, { item: ".ind-row-wrapper", row: ".ind-row", card: ".ind-row__card", overlay: ".ind-row__overlay" });
  section.querySelectorAll(".ind-nav__item").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = wrappers.indexOf(document.getElementById(a.dataset.target).closest(".ind-row-wrapper"));
      const y = section.getBoundingClientRect().top + scrollY + wrappers.slice(0, idx).reduce((s, w) => s + w.offsetHeight, 0);
      V.scrollTo(y, 2);
    })
  );
})();
