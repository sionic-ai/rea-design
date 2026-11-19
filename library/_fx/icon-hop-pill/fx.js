(() => {
  // Apply the reverse crossing on leave only to buttons that were hovered once — so that animation doesn’t run on first open
  kfFx.register("icon-hop-pill", (el, { hover }) => {
    if (!hover) return;
    const mark = () => el.classList.add("is-fx-touched");
    el.addEventListener("mouseenter", mark, { once: true });
    el.addEventListener("focusin", mark, { once: true });
    return () => {
      el.removeEventListener("mouseenter", mark);
      el.removeEventListener("focusin", mark);
      el.classList.remove("is-fx-touched");
    };
  });
})();
