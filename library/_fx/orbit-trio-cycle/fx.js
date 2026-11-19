// Orbit picker: on each overlapping circle (orbit) a small circle (orbiter) circles the inner edge once every 10s (css), and each time a plate is pressed the next one in turn darkens,
// The title word (word) in the same order goes .3→1, and the description (item) changes .2s later in .4s — the Be·Say·Do philosophy of the original agency
(() => {
  kfFx.register("orbit-trio-cycle", (el, { options }) => {
    const groups = ["orbiter", "word", "item"].map((r) => [...el.querySelectorAll(`[data-fx-part="${r}"]`)]);
    const n = Math.max(...groups.map((g) => g.length));
    if (!n) return;
    let at = Math.min(Math.max(+(options.start ?? 0), 0), n - 1);
    const show = (i, quiet) => {
      at = ((i % n) + n) % n;
      groups.forEach((g) => g.forEach((node, k) => {
        node.classList.toggle("is-active", k === at);
        if (g === groups[2]) node.setAttribute("aria-hidden", k === at ? "false" : "true");
      }));
      if (!quiet) el.dispatchEvent(new CustomEvent("fx:pick", { detail: { index: at } }));
    };
    const next = (e) => {
      if (e.target instanceof Element && e.target.closest("a, input, textarea, select")) return;
      show(at + 1);
    };
    const go = (e) => { if (Number.isFinite(e.detail?.index) && e.detail.index !== at) show(e.detail.index, true); };
    show(at, true);
    el.addEventListener("click", next);
    el.addEventListener("fx:go", go);
    return () => {
      el.removeEventListener("click", next);
      el.removeEventListener("fx:go", go);
      groups.flat().forEach((node) => node.classList.remove("is-active"));
    };
  });
})();
