// Regional map — the original is two map images painted with step colors (one per tab). Same position·size as a cell map (one cell = Draw one region) and fill in only the level colors.
(() => {
  const SHAPE = [
    "..............45......",
    ".............4565.....",
    "............455554....",
    ".............45545....",
    "..............5.......",
    "..............46......",
    ".............456......",
    ".............566......",
    ".............677......",
    "............4576......",
    "............5556......",
    "...........45556......",
    "..........445655......",
    ".........45556664.....",
    "......4455565564......",
    "....44556656545.......",
    "...4555665554.........",
    "..45566...545.........",
    "..5566...4554.........",
    ".4567....44...........",
    ".5675.................",
    ".4565.................",
    "..44..................",
    "4.....................",
  ];
  const TAGS = [[16, 8, 236, 70, "Earthquake here in 0000"], [3, 19, 6, 222, "Earthquake here in 0000"], [13, 14, 214, 168, "Earthquake here in 0000"], [8, 16, 56, 186, "Earthquake here in 0000"]];
  const RATE = { 7: "r1", 6: "r2", 5: "r3", 4: "r4" };
  const C = 13, NS = "http://www.w3.org/2000/svg";
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

  document.querySelectorAll(".hm-map").forEach((map) => {
    const svg = map.querySelector("svg"), rate = map.dataset.kind === "rate";
    const g = el("g", { transform: "translate(8 6)" });
    SHAPE.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === ".") return;
      // The signup rate map is a different distribution in the same cells — blend by cell position to pick the stage
      const lv = rate ? 4 + ((x * 7 + y * 3) % 4) : +ch;
      g.append(el("rect", { x: x * C, y: y * C, width: C, height: C, rx: 2.5, class: `cell ${rate ? RATE[lv] : "lv" + lv}` }));
    }));
    if (!rate) TAGS.forEach(([cx, cy, tx, ty, t]) => {
      const px = 8 + cx * C + C / 2, py = 6 + cy * C + C / 2;
      svg.append(el("path", { d: `M${px} ${py}L${tx + (tx > px ? 0 : 50)} ${ty - 3}`, class: "lead" }));
      svg.append(el("circle", { cx: px, cy: py, r: 2, class: "pin" }));
      const tag = el("text", { x: tx, y: ty, class: "tag" }); tag.textContent = t; svg.append(tag);
    });
    svg.prepend(g);
  });
})();
