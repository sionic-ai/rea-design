(() => {
  // Original Brand About sentence: the sentence is split into three phrases and only one lights up every 2.4s — the lit phrase takes its own color, and the chip (mark) inside gets accent-colored text · a pale accent background.
  // The cards below (pick) light up in the same order, and the art inside each card moves with the lit segment. Hovering a card jumps to that segment and restarts the timer from zero.
  kfFx.register("phrase-cycle-mark", (el, { options, reduce, hover, scroller }) => {
    const phrases = [...el.querySelectorAll('[data-fx-part="phrase"]')];
    if (phrases.length < 2) return;
    const picks = [...el.querySelectorAll('[data-fx-part="pick"]')];
    const each = +(options.each || 2.4) * 1000;
    let at = -1, timer = 0, seen = false, held = false;
    const go = (i) => {
      at = (i + phrases.length) % phrases.length;
      phrases.forEach((p, k) => p.classList.toggle("is-on", k === at));
      picks.forEach((p, k) => p.classList.toggle("is-on", k === at));
      el.dispatchEvent(new CustomEvent("fx:pick", { detail: { index: at }, bubbles: false }));
    };
    const tick = () => {
      clearTimeout(timer);
      if (!seen || held || reduce) return;
      timer = setTimeout(() => { go(at + 1); tick(); }, each);
    };
    go(0);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? tick() : clearTimeout(timer); }, { root: scroller || null });
    io.observe(el);
    const ac = new AbortController();
    if (hover) picks.forEach((p, k) => {
      p.addEventListener("pointerenter", () => { held = true; if (k !== at) go(k); clearTimeout(timer); }, { signal: ac.signal });
      p.addEventListener("pointerleave", () => { held = false; tick(); }, { signal: ac.signal });
    });
    return () => {
      ac.abort(); io.disconnect(); clearTimeout(timer);
      [...phrases, ...picks].forEach((p) => p.classList.remove("is-on"));
    };
  });
})();
