(() => {
  // Pushes the card row (track) one cell left at regular intervals — in rock type the cards alternate tilting ±2°, and the tilt flips with every push,
  // peel type: the front card tilts −4° and disappears, the rest are pulled forward one slot, each .1s later. When done the front card goes to the back, looping forever
  kfFx.register("rock-shift-row", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || track.children.length < 2 || reduce) return;
    const peel = options.look === "peel";
    const every = +(options.every ?? (peel ? 4 : 3)) * 1000, start = +(options.start ?? 0) * 1000;
    const dur = +(options.dur ?? (peel ? 0.7 : 0.8)), tilt = +(options.tilt ?? 2), stagger = +(options.stagger ?? 0.1) * 1000;
    const ease = peel ? "cubic-bezier(0.17,0.84,0.44,1)" : "cubic-bezier(0.123,0.96,0.44,1)";
    const width = () => track.firstElementChild.offsetWidth;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    if (!peel) {
      [...track.children].forEach((c, i) => { c.dataset.fxRock = i % 2 ? "neg" : "pos"; c.style.transform = `rotate(${i % 2 ? -tilt : tilt}deg)`; c.style.transition = `transform ${dur}s ease`; });
      track.style.transition = `transform ${dur}s ${ease}`;
    }
    const step = () => {
      if (peel) {
        const kids = [...track.children], first = kids[0], w = width(), sp = innerWidth <= 840;
        first.classList.add("is-fx-peel");
        first.style.zIndex = 1;
        kids.slice(1).forEach((c, i) => {
          c.style.zIndex = 2;
          const move = () => { c.style.transition = `transform ${dur}s ${ease}`; c.style.transform = `translateX(-${w}px)`; };
          if (sp) move(); else later(move, stagger * i);
        });
        first.addEventListener("animationend", () => {
          first.classList.remove("is-fx-peel");
          kids.slice(1).forEach((c) => { c.style.transition = "none"; c.style.transform = "none"; c.style.zIndex = ""; });
          first.style.zIndex = "";
          track.append(first);
        }, { once: true });
        return;
      }
      [...track.children].forEach((c) => { const nx = c.dataset.fxRock === "pos" ? "neg" : "pos"; c.dataset.fxRock = nx; c.style.transform = `rotate(${nx === "pos" ? tilt : -tilt}deg)`; });
      track.style.transform = `translateX(-${width()}px)`;
      track.addEventListener("transitionend", function end(e) {
        if (e.target !== track) return;
        track.removeEventListener("transitionend", end);
        track.append(track.firstElementChild);
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        later(() => { track.style.transition = `transform ${dur}s ${ease}`; }, 0);
      });
    };
    let loop = 0;
    // every: 0 — no skipping, only a tilt
    if (every > 0) later(() => { loop = setInterval(step, every); }, start);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
      track.style.removeProperty("transform");
      track.style.removeProperty("transition");
      [...track.children].forEach((c) => { c.classList.remove("is-fx-peel"); ["transform", "transition", "z-index"].forEach((p) => c.style.removeProperty(p)); delete c.dataset.fxRock; });
    };
  });
})();
