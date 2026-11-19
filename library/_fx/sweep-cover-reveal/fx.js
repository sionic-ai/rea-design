(() => {
  // On screens without hover (touch) it turns on by scroll — when the frame’s bottom edge rises above screen height × line (default .65), is-fx-on
  kfFx.register("sweep-cover-reveal", (el, { options, hover, scroller }) => {
    if (hover) return;
    const line = +(options.line ?? 0.65);
    const target = scroller || window;
    const update = () => el.classList.toggle("is-fx-on", el.getBoundingClientRect().bottom <= innerHeight * line);
    target.addEventListener("scroll", update, { passive: true });
    update();
    return () => { target.removeEventListener("scroll", update); el.classList.remove("is-fx-on"); };
  });
})();
