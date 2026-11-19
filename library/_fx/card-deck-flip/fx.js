(() => {
  // Flip through a stack of overlapped cards one by one — forward: the current card tilts (−10°) and disappears, and from the 30% point the next card’s inside turns on.
  // Back: the current section’s inside shuts off and the previous section drops in from above tilted, then stands upright. No new input while it advances
  kfFx.register("card-deck-flip", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    const dur = +(options.dur ?? 0.5), tilt = +(options.tilt ?? -10), overlap = +(options.overlap ?? 0.3);
    const ease = !options.ease ? "power1.out" : kfFx.ease(options.ease, "power1.out");
    const origin = options.origin || null;
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    let index = Math.max(0, cards.findIndex((c) => c.classList.contains("is-current")));
    let busy = false, tl = null;
    const bodyOf = (c) => c.querySelector('[data-fx-part="body"]') || c;
    const clear = () => cards.forEach((c) => c.classList.remove("is-current", "is-next", "is-prev"));
    const settle = (to) => {
      clear();
      cards[to].classList.add("is-current");
      cards.forEach((c, k) => { c.inert = k !== to; });
      index = to;
      busy = false;
    };
    const mark = (to) => {
      tabs.forEach((t, k) => t.classList.toggle("is-current", k === to));
      el.dataset.deckIndex = String(to);
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: to, total: cards.length } }));
    };
    const go = (to, dir) => {
      to = ((to % cards.length) + cards.length) % cards.length;
      if (busy || to === index) return;
      mark(to);
      if (reduce) return settle(to);
      busy = true;
      const cur = cards[index], nxt = cards[to];
      clear();
      cur.classList.add("is-current");
      nxt.classList.add(dir > 0 ? "is-next" : "is-prev");
      tl = gsap.timeline({ defaults: { ease, duration: dur }, onComplete: () => { tl.revert(); tl = null; settle(to); } });
      if (dir > 0) {
        tl.to(cur, { rotate: tilt, opacity: 0, ...(origin ? { transformOrigin: origin } : {}) });
        tl.fromTo(bodyOf(nxt), { opacity: 0 }, { opacity: 1 }, `<${overlap * 100}%`);
      } else {
        tl.to(bodyOf(cur), { opacity: 0 });
        tl.fromTo(nxt, { rotate: tilt, opacity: 0, ...(origin ? { transformOrigin: origin } : {}) }, { rotate: 0, opacity: 1 }, `<${overlap * 100}%`);
      }
    };
    const onClick = (e) => {
      const b = e.target.closest('[data-fx-part="next"],[data-fx-part="prev"],[data-fx-part="first"],[data-fx-part="tab"]');
      if (!b || !el.contains(b)) return;
      const part = b.dataset.fxPart;
      if (part === "next") return index < cards.length - 1 ? go(index + 1, 1) : go(0, -1);
      if (part === "prev") return go(index - 1, -1);
      if (part === "first") return go(0, -1);
      const k = tabs.indexOf(b);
      if (k >= 0) go(k, k > index ? 1 : -1);
    };
    el.addEventListener("click", onClick);
    settle(index);
    mark(index);
    return () => {
      el.removeEventListener("click", onClick);
      if (tl) { tl.revert(); tl = null; }
      clear();
      cards.forEach((c) => { c.inert = false; });
      tabs.forEach((t) => t.classList.remove("is-current"));
      delete el.dataset.deckIndex;
    };
  });
})();
