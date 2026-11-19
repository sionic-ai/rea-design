(() => {
  // Original stacks the cards in one cell (grid 1/1) and swaps CSS keyframe classes — kept the same way with the same values
  kfFx.register("tilt-swap-cards", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]') || el;
    const cards = [...track.children].filter((c) => c.dataset.fxPart !== "prev" && c.dataset.fxPart !== "next");
    if (cards.length < 2) { cards[0]?.classList.add("is-fx-active"); return () => cards[0]?.classList.remove("is-fx-active"); }
    const stack = options.look === "stack";
    const every = +(options.every ?? 3) * 1000, start = +(options.start ?? 0) * 1000;
    let cur = 0, busy = false, timer = 0, wait = 0;
    const ALL = ["is-fx-out", "is-fx-in", "is-fx-out-back", "is-fx-in-back", "is-fx-standby"];
    cards.forEach((c) => c.classList.remove("is-fx-active", ...ALL));
    cards[0].classList.add("is-fx-active");
    const go = (next) => {
      if (busy || next === cur) return;
      const a = cards[cur], b = cards[next], n = cards.length;
      const fwd = (next - cur + n) % n === 1;
      const standby = fwd ? (next + 1) % n : (next - 1 + n) % n;
      busy = true;
      a.classList.remove("is-fx-out", "is-fx-out-back");
      b.classList.remove("is-fx-in", "is-fx-in-back", "is-fx-standby");
      if (stack) setTimeout(() => cards[standby].classList.add("is-fx-standby"), 200);
      requestAnimationFrame(() => {
        if (fwd) { a.classList.add("is-fx-out"); b.classList.add("is-fx-in", "is-fx-active"); }
        else { a.classList.add("is-fx-in-back"); b.classList.add("is-fx-out-back", "is-fx-active"); }
      });
      a.addEventListener("animationend", () => a.classList.remove("is-fx-active", fwd ? "is-fx-out" : "is-fx-in-back"), { once: true });
      b.addEventListener("animationend", () => {
        b.classList.remove(fwd ? "is-fx-in" : "is-fx-out-back");
        cards.forEach((c, i) => { if (i !== standby) c.classList.remove("is-fx-standby"); });
        cur = next;
        busy = false;
      }, { once: true });
    };
    const nextOne = () => go((cur + 1) % cards.length), prevOne = () => go((cur - 1 + cards.length) % cards.length);
    const play = () => { if (!timer && !reduce) timer = setInterval(() => { if (!busy) nextOne(); }, every); };
    const restart = () => { clearInterval(timer); timer = 0; play(); };
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const onPrev = () => { if (!busy) { prevOne(); restart(); } }, onNext = () => { if (!busy) { nextOne(); restart(); } };
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    el.addEventListener("fx:next", onNext);
    el.addEventListener("fx:prev", onPrev);
    // Turns on auto-advance after start seconds — in the original, after the transition (opacity) in which the panel appears has ended
    wait = setTimeout(play, start);
    return () => {
      clearTimeout(wait);
      clearInterval(timer);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      el.removeEventListener("fx:next", onNext);
      el.removeEventListener("fx:prev", onPrev);
      cards.forEach((c) => c.classList.remove("is-fx-active", ...ALL));
    };
  });
})();
