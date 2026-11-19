(() => {
  kfFx.register("aurora-pillars-bg", (el) => {
    if (el.querySelector(':scope > [data-fx-part="glow"]')) return;
    const glow = document.createElement("div");
    glow.setAttribute("data-fx-part", "glow");
    glow.setAttribute("aria-hidden", "true");
    glow.innerHTML = "<i></i><i></i><i></i><i></i>";
    el.prepend(glow);
    return () => glow.remove();
  });
})();
