(() => {
  // Title letters are first laid down in the line color, and as scroll progresses they flash to the accent color one letter at a time from the front (wave .3), then settle into their own letter color (wave .7).
  // On scrolling back, passed letters return to the line color over a .5 wave. The original rounds progress to the letter count and touches only changed letters — so even rolled fast, flashes pass by in a row
  kfFx.register("char-flash-scrub", (el, { options, reduce }) => {
    if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !el.textContent.trim()) return;
    if (reduce) return;
    const wave = +(options.wave ?? .4);
    const start = options.start || "top 90%", end = options.end || "center 40%";
    const scrub = +(options.scrub ?? .1);
    const css = getComputedStyle(el);
    const read = (name) => css.getPropertyValue(name).trim();
    let ctx = null;
    const split = SplitText.create(el, {
      type: "words, chars", wordsClass: "word", aria: "auto", autoSplit: true,
      onSplit(self) {
        ctx?.revert();
        const chars = self.chars;
        ctx = gsap.context(() => {
          const from = read("--fx-from") || read("--kf-line");
          const flash = read("--fx-flash") || read("--kf-accent");
          const lit = new Set();
          let shown = 0, live = false;
          const settle = (c) => gsap.set(c, { clearProps: "color" });
          const jump = (n) => {
            chars.forEach((c, i) => { gsap.killTweensOf(c); if (i < n) { settle(c); lit.add(c); } else { gsap.set(c, { color: from }); lit.delete(c); } });
            shown = n;
          };
          const move = (n) => {
            if (n === shown) return;
            const lo = Math.min(n, shown), hi = Math.max(n, shown), ink = getComputedStyle(el).color;
            for (let i = lo; i < hi; i++) {
              const c = chars[i], on = i < n;
              if (on && !lit.has(c)) {
                lit.add(c);
                gsap.killTweensOf(c);
                gsap.timeline().to(c, { color: flash, duration: .3 * wave, ease: "power2.out" }).to(c, { color: ink, duration: .7 * wave, ease: "power2.in", onComplete: () => settle(c) });
              } else if (!on && lit.has(c)) {
                lit.delete(c);
                gsap.killTweensOf(c);
                gsap.to(c, { color: from, duration: .5 * wave, ease: "none" });
              }
            }
            shown = n;
          };
          gsap.set(chars, { color: from });
          const p = { v: 0 };
          gsap.to(p, {
            v: 1, ease: "none",
            scrollTrigger: { trigger: el, start, end, scrub, onRefresh: () => { live = false; jump(Math.round(p.v * chars.length)); requestAnimationFrame(() => (live = true)); } },
            onUpdate: () => { if (live) move(Math.round(p.v * chars.length)); },
          });
        }, el);
      },
    });
    return () => { ctx?.revert(); split.revert(); };
  });
})();
