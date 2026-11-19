(() => {
  kfFx.register("card-fan-rotate", (el) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (cards.length < 3) return;
    let f = 0;
    const seat = () => {
      const n = cards.length;
      cards.forEach((c, i) => (c.dataset.seat = i === f ? "front" : i === (f + 1) % n ? "right" : i === (f - 1 + n) % n ? "left" : "back"));
    };
    const step = (d) => { f = (f + d + cards.length) % cards.length; seat(); };
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const p = () => step(-1), q = () => step(1);
    prev?.addEventListener("click", p);
    next?.addEventListener("click", q);
    seat();
    return () => { prev?.removeEventListener("click", p); next?.removeEventListener("click", q); cards.forEach((c) => delete c.dataset.seat); };
  });
})();
