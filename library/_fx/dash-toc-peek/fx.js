(() => {
  // Dash index — one short horizontal dash per section (length ragged, following the section name length). The current section’s dash gets longer and darker,
  // Hovering the table of contents lights up the section name next to the dash in .2s. Pressing the dash goes to that section
  kfFx.register("dash-toc-peek", (el, { options, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.ScrollTrigger) return;
    const at = options.at || "top 30%";
    const min = +(options.min ?? 8), max = +(options.max ?? 22), grow = +(options.grow ?? 8);
    const labels = items.map((a) => (a.querySelector('[data-fx-part="label"]')?.textContent || a.textContent).trim());
    const longest = Math.max(...labels.map((t) => t.length), 1);
    items.forEach((a, i) => {
      const w = min + (max - min) * (labels[i].length / longest);
      a.style.setProperty("--fx-dash", `${Math.round(w)}px`);
      a.style.setProperty("--fx-dash-grow", `${grow}px`);
    });
    const targets = items.map((a) => { const id = (a.getAttribute("href") || "").slice(1); return id ? document.getElementById(id) : null; });
    const mark = (i) => items.forEach((a, k) => { if (k === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    const sts = targets.map((t, i) => t && ScrollTrigger.create({ trigger: t, scroller: scroller || undefined, start: at, end: "max",
      onToggle: (st) => (st.isActive ? mark(i) : i > 0 && st.direction < 0 && mark(i - 1)) })).filter(Boolean);
    return () => { sts.forEach((s) => s.kill()); items.forEach((a) => { a.style.removeProperty("--fx-dash"); a.style.removeProperty("--fx-dash-grow"); a.removeAttribute("aria-current"); }); };
  });
})();
