/* The original illustration (isometric town and company building) is redrawn with our own shapes — box buildings, roads, trees, people and cars on a grid of cells.
   Colors are painted by the .iso-* rules in css (skin variables), computed colors are written as attributes only when handed to a pixi texture. */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const make = (svg, tw = 64) => {
    const th = tw / 2;
    let x0 = 0, y0 = 0;
    const layer = document.createElementNS(NS, "g");
    svg.append(layer);
    const at = (gx, gy, h = 0) => [x0 + (gx - gy) * tw / 2, y0 + (gx + gy) * th / 2 - h];
    const poly = (pts, cls) => {
      const p = document.createElementNS(NS, "polygon");
      p.setAttribute("points", pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" "));
      p.setAttribute("class", cls);
      layer.append(p);
      return p;
    };
    const ell = (cx, cy, rx, ry, cls) => {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("cx", cx.toFixed(1)); e.setAttribute("cy", cy.toFixed(1));
      e.setAttribute("rx", rx.toFixed(1)); e.setAttribute("ry", ry.toFixed(1));
      e.setAttribute("class", cls);
      layer.append(e);
    };
    const tile = (gx, gy, cls) => poly([at(gx, gy), at(gx + 1, gy), at(gx + 1, gy + 1), at(gx, gy + 1)], cls);
    const box = (gx, gy, w, d, h, top = "iso-top", base = 0, windows = false) => {
      const lift = base;
      poly([at(gx, gy + d, lift), at(gx + w, gy + d, lift), at(gx + w, gy + d, lift + h), at(gx, gy + d, lift + h)], "iso-l");
      poly([at(gx + w, gy, lift), at(gx + w, gy + d, lift), at(gx + w, gy + d, lift + h), at(gx + w, gy, lift + h)], "iso-r");
      poly([at(gx, gy, lift + h), at(gx + w, gy, lift + h), at(gx + w, gy + d, lift + h), at(gx, gy + d, lift + h)], top);
      if (!windows || h < 30) return;
      for (let z = lift + 12; z < lift + h - 8; z += 14) {
        poly([at(gx + w, gy + 0.12, z), at(gx + w, gy + d - 0.12, z), at(gx + w, gy + d - 0.12, z + 6), at(gx + w, gy + 0.12, z + 6)], "iso-win");
        poly([at(gx + 0.12, gy + d, z), at(gx + w - 0.12, gy + d, z), at(gx + w - 0.12, gy + d, z + 6), at(gx + 0.12, gy + d, z + 6)], "iso-win-l");
      }
    };
    const tree = (gx, gy, s = 1) => {
      const [x, y] = at(gx, gy);
      poly([[x - 1.5, y], [x + 1.5, y], [x + 1.5, y - 10 * s], [x - 1.5, y - 10 * s]], "iso-trunk");
      ell(x, y - 16 * s, 10 * s, 11 * s, "iso-tree");
      ell(x - 3 * s, y - 19 * s, 4 * s, 4 * s, "iso-tree-hi");
    };
    const person = (gx, gy) => {
      const [x, y] = at(gx, gy);
      poly([[x - 3.5, y], [x + 3.5, y], [x + 3, y - 14], [x - 3, y - 14]], "iso-suit");
      ell(x, y - 17, 3.2, 3.2, "iso-face");
      poly([[x - 4, y - 19], [x + 4, y - 19], [x + 3, y - 22], [x - 3, y - 22]], "iso-cap");
    };
    const car = (gx, gy, cls = "iso-car") => { box(gx, gy, 0.7, 0.35, 8, cls); box(gx + 0.15, gy + 0.05, 0.4, 0.25, 6, "iso-glass", 8); };
    return { layer, at, tile, box, tree, person, car, poly, ell, setOrigin: (x, y) => { x0 = x; y0 = y; } };
  };

  // Town map — each block divided by roads mixes buildings, parks, hills, factories and solar
  function town(svg, { cols = 16, rows = 16, tw = 64, seed = 11, people = 9 } = {}) {
    const rnd = seeded(seed);
    const d = make(svg, tw);
    const W = (cols + rows) * tw / 2, H = (cols + rows) * tw / 4 + 260;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    d.setOrigin(rows * tw / 2, 230);
    const road = (i) => i % 4 === 0;
    const items = [];
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
      d.tile(gx, gy, road(gx) || road(gy) ? (road(gx) && road(gy) ? "iso-cross" : "iso-road") : "iso-ground");
    }
    for (let by = 1; by < rows; by += 4) for (let bx = 1; bx < cols; bx += 4) {
      const kind = Math.floor(rnd() * 6);
      if (kind <= 1) {
        const n = 2 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) {
          const gx = bx + (k % 2) * 1.5, gy = by + Math.floor(k / 2) * 1.5;
          const tall = kind === 0 && k === 0;
          items.push({ o: gx + gy, f: () => d.box(gx + 0.15, gy + 0.15, 1.2, 1.2, tall ? 90 + rnd() * 120 : 24 + rnd() * 40, rnd() < 0.2 ? "iso-roof-a" : "iso-top", 0, true) });
        }
      } else if (kind === 2) {
        items.push({ o: bx + by, f: () => { d.box(bx, by, 2.9, 2.9, 10, "iso-hill"); } });
        for (let k = 0; k < 6; k++) { const gx = bx + 0.4 + rnd() * 2.2, gy = by + 0.4 + rnd() * 2.2; items.push({ o: gx + gy + 0.1, f: () => d.tree(gx, gy, 0.9 + rnd() * 0.5) }); }
      } else if (kind === 3) {
        items.push({ o: bx + by, f: () => d.box(bx + 0.2, by + 0.2, 2.4, 1.6, 30, "iso-top", 0, true) });
        for (let k = 0; k < 2; k++) { const gx = bx + 0.5 + k, gy = by + 2.1; items.push({ o: gx + gy, f: () => { d.box(gx, gy, 0.35, 0.35, 70, "iso-stripe-top"); d.box(gx, gy, 0.35, 0.35, 10, "iso-stripe", 50); } }); }
      } else if (kind === 4) {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const gx = bx + c * 0.95, gy = by + r * 0.95; items.push({ o: gx + gy, f: () => d.box(gx + 0.1, gy + 0.1, 0.75, 0.75, 4, "iso-panel") }); }
      } else {
        items.push({ o: bx + by + 1, f: () => d.box(bx + 0.3, by + 0.3, 2.2, 1.4, 22, "iso-roof-a", 0, false) });
        for (let k = 0; k < 3; k++) { const gx = bx + 0.4 + k * 0.9, gy = by + 2.4; items.push({ o: gx + gy, f: () => d.tree(gx, gy, 0.8) }); }
      }
    }
    for (let k = 0; k < people; k++) { const gx = 4 * Math.floor(rnd() * (cols / 4)) + 0.5, gy = 1 + rnd() * (rows - 2); items.push({ o: gx + gy + 0.2, f: () => d.person(gx, gy) }); }
    for (let k = 0; k < people; k++) { const gy = 4 * Math.floor(rnd() * (rows / 4)) + 0.3, gx = 1 + rnd() * (cols - 2); items.push({ o: gx + gy + 0.2, f: () => d.car(gx, gy, rnd() < 0.3 ? "iso-car-red" : "iso-car") }); }
    items.sort((a, b) => a.o - b.o).forEach((it) => it.f());
    return svg;
  }

  // One company building — signboard strip, two cars in the front yard, one security guard
  function building(svg, { tw = 80 } = {}) {
    const d = make(svg, tw);
    svg.setAttribute("viewBox", "0 0 760 600");
    d.setOrigin(330, 170);
    for (let gy = 0; gy < 6; gy++) for (let gx = 0; gx < 6; gx++) d.tile(gx, gy, gx > 4 || gy > 4 ? "iso-road" : "iso-ground");
    d.box(0.5, 0.5, 3.2, 2.4, 120, "iso-top", 0, true);
    d.box(0.5, 2.9, 3.2, 0.05, 18, "iso-sign", 92);
    d.box(3.9, 0.6, 0.9, 0.6, 50, "iso-roof-a", 0, false);
    d.tree(4.5, 1.8, 1.1); d.tree(4.6, 2.6, 0.9);
    d.car(3.6, 3.6, "iso-car-red"); d.car(1.2, 4.1);
    d.person(4.4, 4.2);
    return svg;
  }

  // When handing off to a pixi texture — bake the computed fills in as attributes so it becomes a single image
  function toImage(svg, w, h) {
    const clone = svg.cloneNode(true);
    const src = svg.querySelectorAll("polygon,ellipse"), dst = clone.querySelectorAll("polygon,ellipse");
    src.forEach((el, i) => { const cs = getComputedStyle(el); dst[i].setAttribute("fill", cs.fill); dst[i].setAttribute("stroke", cs.stroke); dst[i].setAttribute("stroke-width", cs.strokeWidth); dst[i].removeAttribute("class"); });
    clone.setAttribute("width", w); clone.setAttribute("height", h);
    clone.setAttribute("xmlns", NS);
    const img = new Image();
    img.width = w; img.height = h;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    return img.decode().then(() => img);
  }

  window.miIso = { town, building, toImage };
})();
