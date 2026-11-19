(() => {
  // Original (Brand renewal page case card): write the corner nearest to where it came in as data-from and the corner it left through as data-to — the grid flows in from that corner
  kfFx.register("corner-grid-hover", (el, { hover }) => {
    if (!hover || !el.querySelector('[data-fx-part="figure"]')) return;
    const near = (e) => {
      const r = el.getBoundingClientRect();
      return [["right-top", r.right, r.top], ["right-bottom", r.right, r.bottom], ["left-bottom", r.left, r.bottom], ["left-top", r.left, r.top]]
        .map(([c, x, y]) => [c, Math.hypot(e.clientX - x, e.clientY - y)]).sort((a, b) => a[1] - b[1])[0][0];
    };
    const enter = (e) => { el.dataset.from = near(e); el.classList.add("is-fx-on"); };
    const leave = (e) => { el.dataset.to = near(e); el.classList.remove("is-fx-on"); };
    el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.classList.remove("is-fx-on"); delete el.dataset.from; delete el.dataset.to; };
  });
})();
