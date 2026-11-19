(() => {
  // Advancing is decided by the slider that uses it — just before advancing, send fx:step to the panel and it flips once (in slick, at beforeChange).
  // Without a slider it flips by itself every N seconds via every(sec). Even if the slider clones cells in, the odd/even order is repainted so the alternation doesn’t break.
  kfFx.register("bob-swap-slides", (el, { options, reduce }) => {
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items().length) return;
    for (const k of ["drop", "dur", "delay", "ease"]) if (options[k] != null) el.style.setProperty(`--fx-${k}`, options[k]);
    const firstDown = (options.first || "down") !== "up";
    let flip = false;
    const paint = () => items().forEach((it, i) => it.classList.toggle("is-fx-down", ((i % 2 === 0) === firstDown) !== flip));
    paint();
    const step = () => { flip = !flip; paint(); };
    el.addEventListener("fx:step", step);
    const every = +(options.every ?? 0);
    const id = every > 0 && !reduce ? setInterval(step, every * 1000) : 0;
    const mo = new MutationObserver((list) => { if (list.some((m) => m.type === "childList")) paint(); });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("fx:step", step);
      clearInterval(id);
      mo.disconnect();
      items().forEach((it) => it.classList.remove("is-fx-down"));
      for (const k of ["drop", "dur", "delay", "ease"]) el.style.removeProperty(`--fx-${k}`);
    };
  });
})();
