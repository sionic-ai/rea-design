// Bilingual text — when interaction enters one line, every line in the group changes 12 times every 28ms, from the front up to the progress using the other language (data-alt) letters, the rest shuffled letters,
// When the pointer leaves the group (waits 40ms to see whether it moved to another row) it returns to the original word along the same path. The finger changes when pressed and returns 1.6 seconds later
(() => {
  kfFx.register("scramble-alt-swap", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')].filter((l) => l.dataset.alt);
    if (!lines.length) return;
    const chars = options.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%+=";
    const frames = +(options.frames || 12), every = +(options.every ?? 28), back = +(options.back ?? 1600);
    const items = lines.map((l) => ({ el: l, base: l.textContent, alt: l.dataset.alt, t: 0 }));
    const write = (it, to) => {
      clearInterval(it.t);
      if (reduce) { it.el.textContent = to; return; }
      const n = Math.max(to.length, 1);
      let f = 0;
      it.t = setInterval(() => {
        f++;
        const p = f / frames;
        let out = "";
        for (let j = 0; j < n; j++) out += j < n * p ? to[j] || "" : chars[(Math.random() * chars.length) | 0];
        it.el.textContent = out;
        if (f >= frames) { clearInterval(it.t); it.el.textContent = to; }
      }, every);
    };
    let inside = 0, swapped = false, touchT = 0, leaveT = 0;
    const toAlt = () => { if (swapped) return; swapped = true; items.forEach((it) => write(it, it.alt)); };
    const toBase = () => { if (!swapped) return; swapped = false; items.forEach((it) => write(it, it.base)); };
    const enter = () => { inside++; clearTimeout(leaveT); toAlt(); };
    const leave = () => { inside = Math.max(0, inside - 1); clearTimeout(leaveT); leaveT = setTimeout(() => inside <= 0 && toBase(), 40); };
    const touch = () => { toAlt(); clearTimeout(touchT); touchT = setTimeout(toBase, back); };
    lines.forEach((l) => { l.addEventListener("mouseenter", enter); l.addEventListener("mouseleave", leave); });
    el.addEventListener("touchstart", touch, { passive: true });
    return () => {
      lines.forEach((l) => { l.removeEventListener("mouseenter", enter); l.removeEventListener("mouseleave", leave); });
      el.removeEventListener("touchstart", touch);
      clearTimeout(touchT); clearTimeout(leaveT);
      items.forEach((it) => { clearInterval(it.t); it.el.textContent = it.base; });
    };
  });
})();
