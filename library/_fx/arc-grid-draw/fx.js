(() => {
  kfFx.register("arc-grid-draw", (el, { options, reduce }) => {
    const n = Math.max(1, Math.floor(+options.n || 12)), sw = Math.min(100, Math.max(1, +(options.width ?? 20)));
    const dur = Math.max(0.2, +(options.dur ?? 2)), stagger = Math.max(0, +(options.stagger ?? 2));
    const gap = Math.max(0, +(options.gap ?? 0.1)), rings = (options.look || "rings") !== "random";
    const hide = rings && options.hide !== "off", accent = rings ? Math.max(0, Math.floor(+(options.accent ?? 0))) : 0;
    const erase = options.erase === "on", hold = Math.min(Math.max(0, +(options.hold ?? 0.2)), dur * 0.95);
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const pitch = 100 * (1 + gap), H = n * pitch, r = 100 - sw / 2 + 0.07;
    const d = `M ${(100 - r).toFixed(2)} 100.14 A ${r} ${r} 0 0 1 100.14 ${(100 - r).toFixed(2)}`;
    // rings: per 2×2 cell group one delay, one piece to empty, one faint piece / random: per cell
    const groups = new Map();
    const group = (col, row) => {
      const key = rings ? `${col >> 1}_${row >> 1}` : `${col}_${row}`;
      if (!groups.has(key)) {
        const cells = rings ? [0, 1].flatMap((i) => [0, 1].map((k) => [(row >> 1) * 2 + i, (col >> 1) * 2 + k])).filter(([y, x]) => y < n && x < n).map(([y, x]) => y * n + x) : [row * n + col];
        const hidden = hide ? pick(cells) : -1;
        const acc = cells.filter((c) => (c % n < accent || c % n >= n - accent) && c !== hidden);
        groups.set(key, { delay: Math.random() * stagger, hidden, accent: accent && acc.length ? pick(acc) : -1 });
      }
      return groups.get(key);
    };
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "fx-agd__svg");
    svg.setAttribute("viewBox", `0 0 ${H} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const paths = [];
    for (let i = 0; i < n * n; i++) {
      const col = i % n, row = Math.floor(i / n), g = group(col, row);
      const rot = rings ? (col % 2 === 0 && row % 2 === 0 ? 0 : col % 2 === 1 && row % 2 === 0 ? 90 : col % 2 === 0 ? 270 : 180) : pick([0, 90, 180, 270]);
      const gEl = document.createElementNS(NS, "g");
      gEl.setAttribute("transform", `translate(${col * pitch} ${row * pitch}) rotate(${rot} 50 50)`);
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("pathLength", "1");
      p.setAttribute("stroke-width", sw);
      if (i === g.hidden) p.classList.add("is-hidden");
      else if (i === g.accent) p.classList.add("is-accent");
      gEl.append(p);
      svg.append(gEl);
      paths.push([p, g.delay]);
    }
    el.append(svg);
    const fit = () => { const s = Math.max(el.clientWidth, el.clientHeight); svg.style.width = svg.style.height = `${s}px`; };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const done = () => el.dispatchEvent(new CustomEvent("arc-grid-draw:done"));
    let anims = [], io = null;
    const ending = () => {
      if (reduce) { paths.forEach(([p]) => (p.style.strokeDashoffset = erase ? 3 : 2)); if (erase) done(); return; }
      const c = (dur - hold) / 2 / dur;
      const frames = erase
        ? [{ strokeDashoffset: 1, offset: 0, easing: "ease-out" }, { strokeDashoffset: 2, offset: c, easing: "linear" }, { strokeDashoffset: 2, offset: c + hold / dur, easing: "ease-in" }, { strokeDashoffset: 3, offset: 1 }]
        : [{ strokeDashoffset: 1, easing: "ease-out" }, { strokeDashoffset: 2 }];
      anims = paths.map(([p, delay]) => p.animate(frames, { duration: dur * 1000, delay: delay * 1000, fill: "forwards" }));
      if (erase) Promise.all(anims.map((a) => a.finished)).then(done, () => {});
    };
    if (options.on === "load" || reduce) ending();
    else {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); io = null; ending(); } }, { threshold: 0 });
      io.observe(el);
    }
    return () => { io?.disconnect(); ro.disconnect(); anims.forEach((a) => a.cancel()); svg.remove(); };
  });
})();
