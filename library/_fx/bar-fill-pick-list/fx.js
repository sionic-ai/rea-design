// One-line list: behind the chosen line a bar fills over every seconds and the text flips at the bar edge. When full, the next line, on click that line. Emits fx:pick on change.
(() => {
  kfFx.register("bar-fill-pick-list", (el, { options, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    const every = +(options.every || 20) || 20, auto = options.auto !== "false";
    let current = -1, timer = 0;
    // Two layers for the letter cell in a line: a base layer (own color) and a layer visible only over the bar (background color)
    const built = rows.map((row) => {
      const kids = [...row.childNodes];
      const bar = document.createElement("span"), wrap = document.createElement("span"), a = document.createElement("span"), b = document.createElement("span");
      bar.className = "fx-bfp-bar"; wrap.className = "fx-bfp-wrap"; a.className = "fx-bfp-layer"; b.className = "fx-bfp-layer is-over";
      b.setAttribute("aria-hidden", "true");
      kids.forEach((k) => { a.append(k); b.append(k.cloneNode(true)); });
      wrap.append(a, b);
      row.append(bar, wrap);
      row.style.setProperty("--fx-every", every + "s");
      if (!row.hasAttribute("tabindex")) row.tabIndex = 0;
      return { row, kids, bar, wrap };
    });
    const pick = (i, silent) => {
      i = ((i % rows.length) + rows.length) % rows.length;
      clearTimeout(timer);
      rows.forEach((r) => r.classList.remove("is-on", "is-running", "is-full"));
      const row = rows[i];
      row.classList.add("is-on");
      if (reduce || !auto) row.classList.add("is-full");
      else { void row.offsetWidth; row.classList.add("is-running"); timer = setTimeout(() => pick(current + 1), every * 1000); }
      const changed = i !== current;
      current = i;
      if (changed && !silent) el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { index: i, row } }));
    };
    const onClick = (e) => { const r = e.target.closest('[data-fx-part="row"]'); if (r && rows.includes(r)) pick(rows.indexOf(r)); };
    const onKey = (e) => { if (e.key !== "Enter" && e.key !== " ") return; const r = e.target.closest('[data-fx-part="row"]'); if (r && rows.includes(r)) { e.preventDefault(); pick(rows.indexOf(r)); } };
    const onVis = () => { if (document.hidden) clearTimeout(timer); else if (current >= 0) pick(current, true); };
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    el.fxPick = pick;
    pick(0, true);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      delete el.fxPick;
      built.forEach(({ row, kids, bar, wrap }) => { kids.forEach((k) => row.append(k)); bar.remove(); wrap.remove(); row.classList.remove("is-on", "is-running", "is-full"); row.style.removeProperty("--fx-every"); });
    };
  });
})();
