(() => {
  // Stacking is one per whole page — even if side-panel rows (rail) are scattered across several sections, the next widget stacks below the one attached first.
  // The widget is placed absolute inside the row and lowered only by the amount attached: with fixed, even if focus lands on an off-screen widget link, the page wouldn’t scroll there
  const rails = new Set();
  let raf = 0;
  const place = () => {
    raf = 0;
    const list = [...rails].filter((r) => r.on()).sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    let stack = null;
    for (const r of list) {
      if (stack === null) stack = r.top();
      const top = r.el.getBoundingClientRect().top + parseFloat(getComputedStyle(r.el).paddingTop || "0");
      let offset = 0;
      for (const w of r.widgets) {
        const nat = top + offset;
        const y = Math.max(nat, stack);
        if (nat <= stack) stack += w.offsetHeight + r.gap;
        w.style.transform = `translateY(${offset + y - nat}px)`;
        offset += w.offsetHeight + r.gap;
      }
    }
  };
  const request = () => { if (!raf) raf = requestAnimationFrame(place); };
  const sync = () => {
    if (rails.size) { addEventListener("scroll", place, { passive: true }); addEventListener("resize", request); }
    else { removeEventListener("scroll", place); removeEventListener("resize", request); cancelAnimationFrame(raf); raf = 0; }
  };

  kfFx.register("widget-stack-rail", (el, { options }) => {
    const widgets = [...el.querySelectorAll('[data-fx-part="widget"]')];
    if (!widgets.length) return;
    const min = +(options.min ?? 900);
    const rail = {
      el,
      widgets,
      gap: +(options.gap ?? 10),
      top: () => +(options.top ?? 64),
      on: () => innerWidth >= min,
    };
    const positioned = getComputedStyle(el).position !== "static";
    if (!positioned) el.style.position = "relative";
    const style = () => {
      const pad = getComputedStyle(el);
      widgets.forEach((w) => {
        if (rail.on()) {
          Object.assign(w.style, { position: "absolute", top: pad.paddingTop, left: pad.paddingLeft, width: `${el.clientWidth - parseFloat(pad.paddingLeft || "0") - parseFloat(pad.paddingRight || "0")}px` });
        } else {
          Object.assign(w.style, { position: "", top: "", left: "", width: "", transform: "" });
        }
      });
    };
    style();
    rails.add(rail);
    sync();
    const ro = new ResizeObserver(() => { style(); request(); });
    ro.observe(el);
    widgets.forEach((w) => ro.observe(w));
    request();
    return () => {
      rails.delete(rail);
      ro.disconnect();
      widgets.forEach((w) => Object.assign(w.style, { position: "", top: "", left: "", width: "", transform: "" }));
      if (!positioned) el.style.position = "";
      if (rails.size) request();
      sync();
    };
  });
})();
