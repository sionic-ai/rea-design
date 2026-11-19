// When the pointer enters a card that is not frontmost, that card unfolds (is-open) and the rest fold (is-folded). On leaving, all return to place. Touch devices are left alone
(() => {
  kfFx.register("fold-strip-cards", (el, { hover }) => {
    const cards = [...el.querySelectorAll(':scope > [data-fx-part="card"]')];
    el.style.setProperty("--fx-count", Math.max(2, cards.length));
    if (!hover || cards.length < 2) return () => el.style.removeProperty("--fx-count");
    const ac = new AbortController();
    const clear = () => cards.forEach((c) => c.classList.remove("is-folded", "is-open"));
    cards.forEach((card, i) => {
      card.addEventListener("mouseenter", () => {
        if (i === 0) return;
        cards.forEach((c) => { c.classList.toggle("is-folded", c !== card); c.classList.toggle("is-open", c === card); });
      }, { signal: ac.signal });
      card.addEventListener("mouseleave", clear, { signal: ac.signal });
    });
    return () => { ac.abort(); clear(); el.style.removeProperty("--fx-count"); };
  });
})();
