(() => {
  // Each cell loops x 0 → -100% of its own width with no curve — all cells share the same width, so after shifting one cell and returning to the start there is no seam.
  // If the cells don’t fill twice the panel width, they are cloned until they do. The word flip is handled by keyframes in fx.css.
  kfFx.register("flip-word-ticker", (el, { options, reduce }) => {
    const row = el.querySelector('[data-fx-part="row"]');
    if (!row || !row.children.length || !window.gsap) return;
    const keep = row.innerHTML;
    const first = [...row.children];
    const fill = () => {
      const unit = first.reduce((w, c) => w + c.getBoundingClientRect().width, 0);
      if (unit <= 0) return;
      let guard = 0;
      while (row.scrollWidth < el.clientWidth * 2 + unit && guard++ < 40) {
        first.forEach((c) => { const n = c.cloneNode(true); n.setAttribute("aria-hidden", "true"); row.append(n); });
      }
    };
    fill();
    const right = options.dir === "right";
    const narrow = +(options.narrow ?? 750);
    const mm = gsap.matchMedia();
    let tween;
    const run = (dur) => {
      const cells = row.children;
      tween && tween.kill();
      tween = right
        ? gsap.fromTo(cells, { xPercent: -100 }, { xPercent: 0, duration: dur, ease: "none", repeat: -1 })
        : gsap.fromTo(cells, { xPercent: 0 }, { xPercent: -100, duration: dur, ease: "none", repeat: -1 });
    };
    if (!reduce) {
      mm.add(`(max-width: ${narrow}px)`, () => run(+(options["narrow-dur"] ?? options.dur ?? 3.5) || 3.5));
      mm.add(`(min-width: ${narrow + 0.02}px)`, () => run(+(options.dur ?? 4) || 4));
    }
    const ro = new ResizeObserver(fill);
    ro.observe(el);
    return () => {
      ro.disconnect(); mm.revert(); tween && tween.kill();
      row.innerHTML = keep;
    };
  });
})();
