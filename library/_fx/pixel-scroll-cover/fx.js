// A cell grid (cols across × rows down) is laid under the section, and while the section passes through the screen the cells light up one by one from the bottom row (in shuffled order within a row)
// Covers with the next section’s color (cover). With reveal it starts covered and turns off in the same order. .1 per cell · 1.5 total · scrub .3
(() => {
  kfFx.register("pixel-scroll-cover", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mode = options.mode === "reveal" ? "reveal" : "cover";
    const narrow = (bp) => matchMedia(`(max-width: ${bp}px)`).matches;
    const baseCols = parseInt(options.cols, 10) || 12;
    const cols = narrow(478) ? Math.max(4, Math.round(baseCols * 0.4)) : narrow(767) ? Math.max(6, Math.round(baseCols * 0.6)) : narrow(991) ? Math.max(8, Math.round(baseCols * 0.75)) : baseCols;
    const rows = parseInt(options.rows, 10) || 6;
    const panel = document.createElement("div");
    panel.className = "fx-psc-panel";
    const columns = [];
    for (let c = 0; c < cols; c++) {
      const col = document.createElement("div");
      col.className = "fx-psc-col";
      for (let r = 0; r < rows; r++) { const px = document.createElement("div"); px.className = "fx-psc-px"; col.appendChild(px); }
      panel.appendChild(col);
      columns.push(col);
    }
    el.appendChild(panel);
    const all = columns.flatMap((c) => [...c.children]);
    if (reduce) { gsap.set(all, { autoAlpha: mode === "cover" ? 0 : 1 }); return () => panel.remove(); }
    // Order: lower rows go first (50 per row) + 0~300 random + a sin wave of 30 per column
    const order = [];
    for (let r = 0; r < rows; r++) columns.forEach((col, ci) => { const px = col.children[r]; if (px) order.push({ px, p: (rows - 1 - r) * 50 + Math.random() * 300 + Math.sin(ci * 0.3) * 30 }); });
    order.sort((a, b) => a.p - b.p);
    const trigger = el.closest("section") || el.parentElement;
    const starts = { cover: "bottom bottom", reveal: "top bottom" }, ends = { cover: "bottom top", reveal: "top center" };
    const from = mode === "cover" ? 0 : 1;
    gsap.set(all, { autoAlpha: from });
    const tl = gsap.timeline({ scrollTrigger: { trigger, ...(scroller && { scroller }), start: options.start || starts[mode], end: options.end || ends[mode], scrub: +(options.scrub ?? 0.3), invalidateOnRefresh: true } });
    tl.to(order.map((o) => o.px), { autoAlpha: 1 - from, duration: +(options.each ?? 0.1), ease: "none", stagger: { amount: +(options.amount ?? 1.5), from: "start" } });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); panel.remove(); };
  });
})();
