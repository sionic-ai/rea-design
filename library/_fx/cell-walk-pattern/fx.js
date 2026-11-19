(() => {
  // Cell width is given as ”n columns + m gutters” to mesh with that page’s grid. If no cell is specified it makes a few diagonally walking paths
  // Fill 30% so cells never touch edge to edge (only diagonally) — the pattern differs each time it opens, like the original.
  const parse = (s, d) => { try { return s ? JSON.parse(s) : d; } catch { return d; } };
  function walk(rows, cols, cover) {
    const f = Array.from({ length: rows }, () => Array(cols).fill(false));
    const ok = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;
    const touches = (r, c) => [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([a, b]) => ok(r + a, c + b) && f[r + a][c + b]);
    const filled = () => f.flat().filter(Boolean).length / (rows * cols);
    const go = (r, c, stopAtEdge) => {
      f[r][c] = true;
      for (let n = 0; n < rows * cols; n++) {
        const next = [];
        for (const dr of [-1, 1]) for (const dc of [-1, 1]) if (ok(r + dr, c + dc) && !f[r + dr][c + dc] && !touches(r + dr, c + dc)) next.push([r + dr, c + dc]);
        if (!next.length || (!stopAtEdge && Math.random() < 0.25)) break;
        [r, c] = next[Math.floor(Math.random() * next.length)];
        f[r][c] = true;
      }
    };
    go(0, Math.floor(Math.random() * cols), true);
    go(Math.floor(Math.random() * rows), 0, true);
    for (let tries = 0; filled() < cover && tries < 200; tries++) {
      const cells = [];
      f.forEach((row, r) => row.forEach((on, c) => on && cells.push([r, c])));
      const [r, c] = cells[Math.floor(Math.random() * cells.length)];
      go(r, c, false);
    }
    return f;
  }

  kfFx.register("cell-walk-pattern", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const cols = parse(options.cols || el.getAttribute("data-cols"), null);
    const rowsP = parse(options.rows || el.getAttribute("data-rows"), null);
    if (!Array.isArray(cols) || !Array.isArray(rowsP) || !cols.length || !rowsP.length) return;
    const grid = parse(el.getAttribute("data-grid"), null) || walk(rowsP.length, cols.length, +(options.cover ?? 0.3));
    const box = document.createElement("div");
    box.className = "fx-cwp";
    box.style.gridTemplateColumns = cols.map(([n, g]) => `calc(${n} * var(--fx-column, 1fr) + ${g} * var(--fx-gutter, 0px))`).join(" ");
    box.style.gridTemplateRows = rowsP.map((p) => `${p}%`).join(" ");
    const cells = [];
    grid.forEach((row, r) => row.forEach((on, c) => {
      if (!on) return;
      const cell = document.createElement("i");
      cell.style.gridRow = String(r + 1);
      cell.style.gridColumn = String(c + 1);
      cell.dataset.row = String(r);
      box.appendChild(cell);
      cells.push(cell);
    }));
    el.appendChild(box);
    const want = options.mode || "scroll";
    const mode = (want === "scroll" || want === "scrub") && !window.ScrollTrigger ? "still" : want;
    const order = (desc) => [...cells].sort((a, b) => (desc ? b.dataset.row - a.dataset.row : a.dataset.row - b.dataset.row));
    let tw = null, st = null;
    const offs = [];
    if (reduce || mode === "still") gsap.set(cells, { opacity: mode === "veil" ? 0 : 1 });
    else if (mode === "scroll") {
      tw = gsap.from(order(), { opacity: 0, duration: +(options.dur ?? 1.6), ease: "power4.out", stagger: { each: +(options.each ?? 0.2), ease: "circ.in" },
        scrollTrigger: { trigger: el, scroller, start: options.start || "top 75%" } });
    } else if (mode === "scrub") {
      tw = gsap.from(order(), { opacity: 0, duration: 1.5, ease: "power2.out", stagger: +(options.each ?? 0.15),
        scrollTrigger: { trigger: el, scroller, start: options.start || "top 75%", end: options.end || "bottom bottom", scrub: true } });
    } else if (mode === "hover") {
      const host = el.closest(options.host || "a, [data-fx-part=host]") || el;
      gsap.set(cells, { opacity: 0 });
      tw = gsap.to(order(), { opacity: 1, duration: 0.1, stagger: +(options.each ?? 0.08), paused: true });
      const on = () => tw.play(), off = () => tw.reverse();
      host.addEventListener("pointerenter", on);
      host.addEventListener("pointerleave", off);
      offs.push(() => { host.removeEventListener("pointerenter", on); host.removeEventListener("pointerleave", off); });
    } else if (mode === "veil") {
      gsap.set(cells, { opacity: 0 });
      // Transition curtain: turn on from the bottom row up (fx:cover) and turn off in the same order (fx:uncover) — spacing is .3s per row divided by the number of cells
      const each = () => (cells.length ? +(options.dur ?? 0.3) / cells.length : 0);
      const cover = () => gsap.to(order(true), { opacity: 1, duration: +(options.dur ?? 0.3), stagger: { each: each() }, overwrite: true });
      const uncover = () => gsap.to(order(true), { opacity: 0, duration: +(options.dur ?? 0.3), stagger: { each: each() }, overwrite: true });
      el.addEventListener("fx:cover", cover);
      el.addEventListener("fx:uncover", uncover);
      offs.push(() => { el.removeEventListener("fx:cover", cover); el.removeEventListener("fx:uncover", uncover); });
    }
    st = tw?.scrollTrigger;
    return () => { offs.forEach((f) => f()); st?.kill(); tw?.kill(); gsap.killTweensOf(cells); box.remove(); };
  });
})();
