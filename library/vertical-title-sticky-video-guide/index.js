// First page graphics: the faint land silhouette behind the area intro and the access route map are redrawn as SVG instead of the original images.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.append(n);
    return n;
  };
  const text = (parent, x, y, t, attrs = {}) => { const n = el("text", { x, y, "font-size": 11, fill: "var(--kf-ink)", ...attrs }, parent); n.textContent = t; return n; };

  // Area intro: white silhouette of a bay closed off by a sandbar
  const place = document.querySelector(".place__map");
  if (place) {
    el("path", { d: "M0 0 H300 C320 120 260 180 300 260 C340 340 420 360 400 460 C380 560 300 580 320 680 C340 780 440 820 420 920 C400 1020 300 1080 330 1200 H0 Z", fill: "currentColor" }, place);
    el("path", { d: "M300 260 C360 300 470 330 520 420 C560 500 500 560 540 640", fill: "none", stroke: "currentColor", "stroke-width": 18, "stroke-linecap": "round" }, place);
  }

  // Access: thick lines (highways) · dotted lines (railways) · city names over a white landmass, destination as a black label
  const map = document.querySelector(".access__map");
  if (map) {
    el("path", { d: "M120 210 C170 170 240 150 300 120 C360 90 400 40 470 30 C520 24 560 60 590 120 C620 190 600 260 610 330 C620 420 590 500 560 570 C530 640 470 700 420 740 L380 720 C400 640 360 600 300 590 C240 580 180 560 150 500 C120 440 60 420 30 380 C10 340 40 300 80 280 C110 266 100 236 120 210 Z", fill: "var(--kf-surface)" }, map);
    const ink = "var(--kf-dim)";
    const roads = ["M470 30 L460 160 L440 300 L400 440 L380 560 L330 700", "M20 330 L180 330 L300 300 L440 300", "M300 120 L320 260 L300 420 L260 560", "M590 140 L560 300 L520 470 L470 620 L420 740"];
    roads.forEach((d) => el("path", { d, fill: "none", stroke: ink, "stroke-width": 2.2 }, map));
    const rails = ["M480 0 L470 170 L452 310 L410 450 L390 580 L345 720 L330 760", "M600 120 L575 300 L535 470 L485 630 L440 760", "M40 300 L200 310 L330 290"];
    rails.forEach((d) => el("path", { d, fill: "none", stroke: "var(--kf-ink)", "stroke-width": 1.4, "stroke-dasharray": "6 4" }, map));
    [[455, 160, "City 1"], [440, 300, "City 2"], [300, 300, "City 3"], [400, 440, "City 4"], [520, 470, "City 5"], [330, 700, "City 6"], [130, 330, "City 7"], [470, 620, "City 8"]].forEach(([x, y, t]) => {
      el("circle", { cx: x, cy: y, r: 3.5, fill: "var(--kf-surface)", stroke: "var(--kf-ink)", "stroke-width": 1 }, map);
      text(map, x + 8, y - 6, t);
    });
    const tag = el("g", { transform: "translate(560 300)" }, map);
    el("rect", { x: 0, y: -14, width: 72, height: 26, fill: "var(--kf-ink)" }, tag);
    text(tag, 10, 4, "Area Name", { fill: "var(--kf-surface)", "font-size": 12 });
    el("path", { d: "M-22 0 H0", stroke: "var(--kf-ink)", "stroke-width": 1 }, tag);
    text(map, 610, 420, "Sea", { "font-size": 12, "writing-mode": "vertical-rl" });
  }
})();
