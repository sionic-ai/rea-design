// Pinned year — a big year panel (counter) stays pinned on screen throughout the section, and the block where the year changes (block, data-key=While the top edge of the year moves from the bottom of the screen → the center
// (scrub .5) the current year text exits 100% upward and the next year text rises from 100% below. If the same year continues, it does not scroll
(() => {
  kfFx.register("pin-year-roller", (el, { options, reduce, scroller }) => {
    const counter = el.querySelector('[data-fx-part="counter"]');
    const blocks = [...el.querySelectorAll('[data-fx-part="block"]')];
    if (!counter || !blocks.length || !window.ScrollTrigger) return;
    const years = [...new Set(blocks.map((b) => b.dataset.key || ""))];
    const scrub = +(options.scrub ?? 0.5), start = options.start || "top bottom", end = options.end || "top center";
    const roller = document.createElement("span");
    roller.className = "fx-pyr";
    roller.setAttribute("aria-hidden", "true");
    const splits = years.map((y, i) => {
      const s = document.createElement("span");
      s.className = "fx-pyr__year";
      [...y].forEach((c) => { const ch = document.createElement("span"); ch.className = "fx-pyr__ch"; ch.textContent = c; s.append(ch); });
      roller.append(s);
      const chars = [...s.children];
      gsap.set(chars, { yPercent: i ? 100 : 0 });
      return chars;
    });
    counter.append(roller);
    const made = [];
    if (!reduce) {
      made.push(ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom bottom", pin: counter, pinSpacing: false }));
      let k = 0;
      for (let i = 1; i < blocks.length; i++) {
        if ((blocks[i - 1].dataset.key || "") === (blocks[i].dataset.key || "")) continue;
        const a = splits[k], b = splits[k + 1];
        made.push(ScrollTrigger.create({
          trigger: blocks[i], scroller, start, end, scrub, invalidateOnRefresh: true,
          onUpdate: (st) => { gsap.set(a, { yPercent: -100 * st.progress }); if (b) gsap.set(b, { yPercent: 100 - 100 * st.progress }); },
        }));
        k++;
      }
    }
    return () => { made.forEach((t) => t.kill(true)); roller.remove(); };
  });
})();
