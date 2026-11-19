// Hand-drawn map engine. Like the original, five layers and tools (including min and max spacing) are attached to a paper.js canvas, curves use paper’s smooth()/simplify(), and noise uses simplex-noise as is.
// Colors are painted by reading skin variables (--site-map-*), and when brightness changes the pre-drawn parts are repainted like the original.
(() => {
  const canvas = document.getElementById("map");
  const stage = canvas.parentElement;
  const reduced = APP.reduced;
  const ps = new paper.PaperScope();
  ps.setup(canvas);
  const { Path, Point, Group, Layer, Tool, Rectangle, Size } = ps;
  const fit = () => { const r = stage.getBoundingClientRect(); ps.view.viewSize = new Size(Math.max(1, r.width), Math.max(1, r.height)); };
  fit();
  new ResizeObserver(fit).observe(stage);

  // Skin variable → rgba() that paper reads. Values like color-mix are resolved by the browser, and we paint one dot of the resolved color and read it back
  const probe = Object.assign(document.createElement("span"), { hidden: true });
  document.body.append(probe);
  const px = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const read = (name) => {
    probe.style.color = `var(${name})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = px.getImageData(0, 0, 1, 1).data;
    return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
  };
  let C;
  const palette = () => (C = { STROKE: read("--site-map-ink"), FILL: read("--site-map-paper"), FILL_SELECT: read("--site-map-sel") });
  palette();

  const LAYERS = ["Land", "Roads", "Mountains", "Trees", "Buildings"];
  const layer = (name) => ps.project.layers.find((l) => l.name === name);
  LAYERS.forEach((name) => { new Layer().name = name; });

  // Inserts so that the lower one (larger sortY) within the same layer comes in front — exactly as in the original (a neighbor without sortY is treated as the new symbol’s bottom end)
  const sortIn = (lay, item) => {
    let next = null;
    const y = item.data?.sortY ?? item.bounds.bottom;
    for (const c of lay.children) {
      const cy = c.data?.sortY ?? item.bounds.bottom;
      if (c !== item && cy > y && (!next || cy < next.data.sortY)) next = c;
    }
    next ? item.insertBelow(next) : item.bringToFront();
  };
  // Pivoting on the bottom center, bounces upright from the from scale to 1
  const pop = (g, from, start, dur, ease) => {
    if (reduced) return;
    let cur = from;
    g.scale(from, g.pivot);
    const s = { scale: start };
    gsap.to(s, { scale: 1, duration: dur, ease, onUpdate: () => { g.scale(s.scale / cur, g.pivot); cur = s.scale; } });
  };

  // ── Undo: snapshot the whole project as JSON (max 20)
  const undoS = [], redoS = [];
  const emitH = () => APP.emit("history", undoS.length, redoS.length);
  const push = () => { undoS.push(ps.project.exportJSON()); if (undoS.length > 20) undoS.shift(); redoS.length = 0; emitH(); };
  const restore = (json) => {
    unselect(); dropBounds();
    ps.project.clear();
    ps.project.importJSON(json);
    dropBounds();
    // Brightness may differ from when it was captured, so repaint with the current skin
    repaint();
    reselect();
    activate(current);
  };
  APP.on("undo", () => { if (!undoS.length) return; redoS.push(ps.project.exportJSON()); restore(undoS.pop()); emitH(); });
  APP.on("redo", () => { if (!redoS.length) return; undoS.push(ps.project.exportJSON()); restore(redoS.pop()); emitH(); });

  // ── Ground: a coastline whose thickness wobbles with noise + an echo line 15px to the right of travel. New points follow the previous point’s spot over 0.4s
  const landNoise = SimplexNoise.createNoise2D();
  let landClosed = true, main = null, echo = null;
  const follow = (path, t) => {
    if (!path.lastSegment || reduced) return void path.add(t);
    const seg = path.add(path.lastSegment.point.clone());
    gsap.to(seg.point, { x: t.x, y: t.y, duration: 0.4, ease: "power2.out" });
  };
  const land = new Tool({ minDistance: 7, maxDistance: 45 });
  land.onMouseDown = (e) => {
    layer("Land").activate();
    push();
    const n = e.delta.normalize().rotate(90), r = landNoise(e.point.x * 0.5, e.point.y * 0.5);
    main = new Path({ fillColor: C.FILL, strokeColor: C.STROKE, strokeWidth: 4 });
    main.add(e.point.add(n.multiply(r * 5)));
    echo = new Path({ strokeColor: C.STROKE, strokeWidth: 1.5 });
  };
  land.onMouseDrag = (e) => {
    const n = e.delta.normalize().rotate(90), r = landNoise(e.point.x * 0.5, e.point.y * 0.5);
    follow(main, e.point.add(n.multiply(r * 5)));
    follow(echo, e.point.add(n.multiply(15 + r * 2)));
  };
  land.onMouseUp = () => {
    main.smooth(); main.closed = landClosed;
    echo.smooth(8); echo.closed = landClosed;
    layer("Land").addChild(new Group([echo, main]));
    main = echo = null;
  };

  // ── Trees: five trees each within radius 10 along the path, scattered at least radius×1.2 apart from each other. 0.5→1 elastic 0.8s
  const treeNoise = SimplexNoise.createNoise2D();
  let pointy = true;
  const scatter = (at, radius = 10, count = 5) => {
    const lay = layer("Trees");
    lay.activate();
    const made = [], gap = radius * 1.2, old = lay.children.filter((g) => g.data?.isTree);
    for (let tries = 0; made.length < count && tries < count * 10; tries++) {
      const a = Math.random() * 2 * Math.PI, d = Math.sqrt(Math.random()) * radius;
      const c = new Point(at.x + d * Math.cos(a), at.y + d * Math.sin(a));
      if (old.some((g) => c.getDistance(g.data.treePoint) < gap) || made.some((m) => c.getDistance(m) < gap)) continue;
      const k = (treeNoise(c.x, c.y) + 1) / 2, f = 4 + k * 2, s = (pointy ? 1.5 : 1) + k * 0.8;
      let crown;
      if (pointy) {
        const w = (Math.random() - 0.5) * 1.5, t = f * s;
        const top = new Point(c.x + w, c.y - t), rt = new Point(c.x + f + w * 0.7, c.y + t * (0.6 + (Math.random() - 0.5) * 0.15));
        const bot = new Point(c.x, c.y + t * (1 + (Math.random() - 0.5) * 0.15)), lf = new Point(c.x - f - w * 0.7, c.y + t * (0.6 + (Math.random() - 0.5) * 0.15));
        crown = new Path();
        crown.moveTo(top); crown.lineTo(rt);
        crown.quadraticCurveTo(new Point(c.x + f * 0.6 + w * 0.5, c.y + t), bot);
        crown.quadraticCurveTo(new Point(c.x - f * 0.6 - w * 0.5, c.y + t), lf);
        crown.lineTo(top);
        const o = f * 0.5;
        crown.firstSegment.handleOut = new Point(o, o);
        crown.lastSegment.handleIn = new Point(-o, o);
        crown.set({ closed: true, fillColor: C.FILL, strokeWidth: 2, strokeColor: C.STROKE });
      } else {
        crown = new Path.Circle({ center: c, radius: f, fillColor: C.FILL, strokeWidth: 2, strokeColor: C.STROKE });
        crown.scale(1, s, c);
        const r1 = crown.segments[1];
        r1.handleIn = r1.handleIn.multiply(Math.random() * 1.5);
        r1.handleOut = r1.handleOut.multiply(Math.random() * 1.5);
        r1.point = new Point(r1.point.x + Math.random() * 2 - 1, r1.point.y + Math.random() * 2 - 1);
        const r3 = crown.segments[3];
        r3.handleIn = r3.handleIn.multiply(1 + Math.random() * 2);
        r3.handleOut = r3.handleOut.multiply(1 + Math.random() * 2);
      }
      const h = f * s;
      const trunk = new Path([c.x, c.y + h - 1], [c.x, c.y + h + 4]);
      trunk.set({ strokeWidth: 2, strokeColor: C.STROKE, strokeCap: "round" });
      const g = new Group({ children: [crown, trunk], applyMatrix: false });
      Object.assign(g.data, { isTree: true, sortY: c.y, treePoint: [c.x, c.y] });
      g.pivot = g.bounds.bottomCenter;
      lay.addChild(g);
      sortIn(lay, g);
      made.push(c);
      pop(g, 0.5, 0.5, 0.8, "elastic.out");
    }
  };
  const trees = new Tool({ minDistance: 20, maxDistance: 45 });
  trees.onMouseDown = (e) => { push(); scatter(e.point, 5, 1); };
  trees.onMouseDrag = (e) => scatter(e.point);

  // ── Mountains: peaks stamped at 40~65 spacing by size (small .7 · medium 1 · large 1.4), rising with back.out(4) 0.4s
  const SIZE = { SM: 0.7, MD: 1, LG: 1.4 };
  const mtNoise = SimplexNoise.createNoise2D();
  let mtSize = "MD";
  const peak = (at) => {
    const k = SIZE[mtSize], w = (50 + Math.random() * 20) * k, h = (40 + Math.random() * 20) * k, seed = Math.random() * 1e3;
    const L = at.x - w / 2, base = at.y, top = base - h;
    const body = new Path();
    body.add(new Point(L, base));
    for (let i = 1; i <= 3; i++) { const t = i / 4, j = mtNoise(seed + i * 0.8, seed + i * 1.7); body.add(new Point(L + (w / 2) * t + j * 4, base - h * t + j * 4)); }
    body.add(new Point(at.x, top));
    for (let i = 3; i >= 1; i--) { const t = i / 4, j = mtNoise(seed + i * 0.8, seed + i * 1.7); body.add(new Point(at.x + (w / 2) * (1 - t) + j * 4, base - h * t + j * 4)); }
    body.add(new Point(at.x + w / 2, base));
    body.set({ fillColor: C.FILL, strokeColor: C.STROKE, strokeWidth: 3, strokeCap: "round" });
    body.data.isMountain = true;
    body.pivot = body.bounds.bottomCenter;
    const ridge = new Path(), steps = mtSize === "SM" ? 1 : 3, end = new Point(at.x + (mtNoise(seed + 30, seed) * w) / 6, base - h * 0.25);
    ridge.moveTo(new Point(at.x, top));
    for (let i = 1; i <= steps; i++) { const t = i / (steps + 1), j = mtNoise(seed + i * 1.4, seed + i * 0.9); ridge.lineTo(new Point(at.x + (end.x - at.x) * t + j * 5, top + (end.y - top) * t + j * 3)); }
    ridge.lineTo(end);
    ridge.set({ strokeColor: C.STROKE, strokeWidth: 2, strokeCap: "round" });
    ridge.smooth();
    const g = new Group({ children: [body, ridge], applyMatrix: false });
    Object.assign(g.data, { isMountain: true, sortY: base });
    g.pivot = g.bounds.bottomCenter;
    const lay = layer("Mountains");
    lay.addChild(g);
    sortIn(lay, g);
    pop(g, 0.3, 0.5, 0.4, "back.out(4)");
  };
  const mountains = new Tool();
  const sizeMt = () => { mountains.minDistance = 40 * SIZE[mtSize]; mountains.maxDistance = 65 * SIZE[mtSize]; };
  sizeMt();
  mountains.onMouseDown = (e) => { layer("Mountains").activate(); push(); peak(e.point); };
  mountains.onMouseDrag = (e) => peak(e.point);

  // Path: dotted line and endpoints. Within 15px of an endpoint it snaps onto that point, and on release it runs simplify()
  let road = null, startEnd = null;
  const nearEnd = (p) => layer("Roads").children.find((g) => g.data?.isRoadEndpoint && p.getDistance(g.position) <= 15);
  const endDot = (center) => {
    const d = new Path.Circle({ center, radius: 3, fillColor: C.STROKE });
    d.data.isRoadEndpoint = true;
    return d;
  };
  const roads = new Tool({ minDistance: 5, maxDistance: 15 });
  roads.onMouseDown = (e) => {
    layer("Roads").activate();
    push();
    const hit = nearEnd(e.point), at = hit?.position ?? e.point;
    startEnd = hit ? null : endDot(at);
    road = new Path({ segments: [at], strokeColor: C.STROKE, strokeCap: "round", strokeWidth: 1.5, fillColor: null, dashArray: [2, 5] });
    road.data.isRoadPath = true;
  };
  roads.onMouseDrag = (e) => road?.add(e.point);
  roads.onMouseUp = (e) => {
    if (!road) return;
    const hit = nearEnd(e.point), at = hit?.position ?? e.point;
    road.lastSegment.point = at;
    const lastEnd = hit ? null : endDot(at);
    road.simplify();
    const g = new Group([startEnd, road, lastEnd].filter(Boolean));
    g.data.isRoad = true;
    layer("Roads").addChild(g);
    road = startEnd = null;
  };

  // ── Buildings: a castle, house or tower at the clicked spot. bounce.out 0.4s at .75 scale
  let bKind = "castle";
  const ink = (p, w = 2) => p.set({ fillColor: C.FILL, strokeColor: C.STROKE, strokeWidth: w });
  // Window (radius 0) and arched door. Filled with ink, border in paper color
  const hole = (x, y, w, h, arc = 0) => {
    let p;
    if (arc === 0) {
      p = new Path.Rectangle({ point: [x, y - h], size: [w, h] });
      p.data.isWindow = true;
    } else {
      const top = y - h, s = top + arc;
      p = new Path();
      p.moveTo([x, y]); p.lineTo([x, s]); p.arcTo([x + arc, top], [x + w, s]); p.lineTo([x + w, y]); p.closePath();
      p.data.isDoor = true;
    }
    return p.set({ fillColor: C.STROKE, strokeColor: C.FILL, strokeWidth: 0 });
  };
  const door = (wall) => hole(wall.bounds.center.x - 3.5, wall.bounds.bottom, 7, 10, 3.5);
  const windows = (wall, both = true) => {
    const b = wall.bounds, tw = bKind === "tower", spread = tw ? 20 : 5, i = b.bottom - b.height / (tw ? 2.5 : 1.8);
    const a = b.height > 40 ? i - Math.random() * spread : i, o = b.height > 40 ? i - Math.random() * spread : i;
    const s = b.left + b.width * 0.2, c = b.left + b.width * 0.8 - 3, l = Math.floor(Math.random() * 3);
    if (l === 0) return [hole(s, bKind === "house" ? i + 5 : i, 3, 5)];
    if (l === 1) return [hole(c, o, 3, 5)];
    return both ? [hole(s, a, 3, 5), hole(c, o, 3, 5)] : [];
  };
  const flag = (wall) => {
    const t = wall.bounds.center.x, n = wall.bounds.top + 5;
    return ink(new Path({ segments: [[t, n], [t, n - 20], [t + 10, n - 16], [t, n - 12]] }));
  };
  const ground = (wall) => {
    const b = wall.bounds, house = bKind === "house";
    return new Path({ segments: [[b.left - (house ? 6 : 5), b.bottom], [b.right + (house ? 22 : 5), b.bottom]], strokeWidth: 2, strokeColor: C.STROKE });
  };
  // Wall + top crenellations (5×5) merged into one piece with unite(). The tower gets a separate crenellation band 3px wider on each side than the wall
  const block = (at, tall = false, isTower = false) => {
    let w = tall ? 10 + Math.random() * 5 : 20 + Math.random() * 10, h = tall ? 25 + Math.random() * 10 : 15 + Math.random() * 10;
    if (isTower) { w = 15 + Math.random() * 5; h = 30 + Math.random() * 10; }
    const wall = new Path.Rectangle({ point: [at.x - w / 2, at.y - h], size: [w, h] });
    if (isTower) ink(wall);
    const o = Math.max(1, Math.floor(wall.bounds.width / 5)), span = wall.bounds.width + (isTower ? 6 : 0), gap = o > 1 ? (span - o * 5) / (o - 1) : 0;
    const u = wall.bounds.top - 5 + 1, d = wall.bounds.center.x - span / 2;
    const teeth = Array.from({ length: o }, (_, k) => new Path.Rectangle({ point: [d + k * (5 + gap), u], size: [5, 5] }));
    const unite = (parts) => parts.reduce((acc, p) => { if (!acc) return p; const r = acc.unite(p); acc.remove(); p.remove(); return r; }, null);
    if (isTower) return { wall, bricks: ink(unite([new Path.Rectangle({ point: [d, u + 5 - 1], size: [span, 5] }), ...teeth])) };
    return ink(unite([wall, ...teeth]));
  };
  const tower = (at, side = false) => {
    // The original stacks flag then ground line for a side tower, and ground line then flag for a standalone tower
    const t = block(at, !side, true), f = Math.random() < 0.5 ? flag(t.wall) : null, g0 = ground(t.wall);
    const parts = side ? [f, g0, t.wall, t.bricks] : [g0, f, t.wall, t.bricks, door(t.wall), ...windows(t.wall)];
    const g = new Group(parts.filter(Boolean));
    g.data.isBuilding = true;
    g.pivot = g.bounds.bottomCenter;
    return g;
  };
  const BUILD = {
    castle(at) {
      const body = block(at), side = Math.random() < 0.5 ? "left" : "right", off = Math.random() * 5, towers = [];
      const t = tower({ x: side === "left" ? body.bounds.left - off : body.bounds.right + off, y: body.bounds.bottom }, true);
      towers.push(t);
      if (Math.random() < 0.5) { const t2 = t.clone(); t2.position.x = side === "right" ? body.bounds.left - off : body.bounds.right + off; towers.push(t2); }
      const g = new Group([ground(body), ...towers, body, door(body), ...windows(body, false)]);
      g.data.isBuilding = true;
      g.pivot = g.bounds.bottomCenter;
      return g;
    },
    house(at) {
      const front = ink(new Path({ segments: [[at.x - 10, at.y - 15], [at.x - 10, at.y], [at.x + 10, at.y], [at.x + 10, at.y - 15]] }));
      const side = ink(new Path([at.x + 10, at.y - 15], [at.x + 10, at.y], [at.x + 25, at.y], [at.x + 25, at.y - 15]));
      const r = front.bounds.top + 2;
      const roof = ink(new Path({ segments: [[front.bounds.left - 5, r], [at.x, r - 10], [front.bounds.right + 5, r], [front.bounds.right + 18, r], [front.bounds.right + 5, r - 10], [at.x, r - 10]] }));
      let chimney = null;
      if (Math.random() < 0.5) {
        chimney = ink(new Path({ segments: [[at.x + 5, r - 10], [at.x + 5, r - 16], [at.x + 10, r - 16], [at.x + 10, r - 10]] }));
        chimney.position.x += 3; chimney.position.y += 2;
      }
      const g = new Group([front, side, roof, chimney, door(front), ground(front)].filter(Boolean));
      g.data.isBuilding = true;
      g.pivot = g.bounds.bottomCenter;
      g.scale(0.6, g.pivot);
      return g;
    },
    tower: (at) => tower(at),
  };
  const buildings = new Tool();
  buildings.onMouseDown = (e) => {
    const lay = layer("Buildings");
    lay.activate();
    push();
    const g = BUILD[bKind](e.point);
    g.data.sortY = e.point.y;
    lay.addChild(g);
    sortIn(lay, g);
    pop(g, 0.75, 0.5, 0.4, "bounce.out");
  };

  // ── Selection: a dashed box (6px outside) and four corner handles on the pressed symbol, following with 0.4s back.out(1.15) when dragged. Delete removes it
  let bounds = null, selected = null, selId = null, selN = 1, drag = null, dragTw = null;
  // The original’s match receives a HitResult and has no data, so it can’t filter — pressing the chosen one again hits the selection box itself — as intended, the box is excluded
  const inBounds = (it) => { for (let t = it; t; t = t.parent) if (t.data?.isSelectionBounds) return true; return false; };
  const HIT = { fill: true, stroke: true, tolerance: 4, match: (r) => !inBounds(r.item) };
  const boundsGroup = () => {
    if (!bounds || bounds.project !== ps.project || !bounds.parent) { bounds = new Group(); bounds.data.isSelectionBounds = true; }
    bounds.bringToFront();
    return bounds;
  };
  const drawBounds = (item) => {
    const g = boundsGroup();
    g.removeChildren();
    const r = item.bounds.expand(6);
    const box = new Path.Rectangle({ rectangle: r, strokeColor: C.STROKE, strokeWidth: 1, fillColor: C.FILL_SELECT, dashArray: [5, 3] });
    box.data.isBoundBox = true;
    g.addChild(box);
    [r.topLeft, r.topRight, r.bottomLeft, r.bottomRight].forEach((p) => {
      const h = new Path.Rectangle({ rectangle: new Rectangle(p.subtract(3), new Size(6, 6)), fillColor: C.STROKE });
      h.data.isBoundBoxHandler = true;
      g.addChild(h);
    });
    g.bringToFront();
  };
  const unselect = () => { bounds?.removeChildren(); selected = null; };
  const select = (item) => {
    if (!item) return unselect();
    item.data.selectionId ||= `selection-${selN++}`;
    selId = item.data.selectionId;
    selected = item;
    drawBounds(item);
  };
  const dropBounds = () => { ps.project.getItems({ match: (i) => i.data?.isSelectionBounds }).forEach((i) => i.remove()); bounds = null; };
  const reselect = () => { if (!selId) return; const it = ps.project.getItems({ match: (i) => i instanceof Group && i.data?.selectionId === selId })[0]; if (it) select(it); };
  const topItem = (it) => { for (let t = it; t?.parent; t = t.parent) if (t instanceof Group && t.parent instanceof Layer) return t; return null; };
  const pick = new Tool();
  pick.onMouseDown = (e) => {
    const it = topItem(ps.project.hitTest(e.point, HIT)?.item);
    drag = it?.position.clone() || null;
    dragTw?.kill();
    select(it);
    if (it) push();
  };
  pick.onMouseDrag = (e) => {
    const it = selected;
    if (!it || !drag) return;
    drag = drag.add(e.delta);
    dragTw?.kill();
    const settle = () => { if (it.layer) { it.data.sortY = it.bounds.bottom; sortIn(it.layer, it); } };
    if (reduced) { it.position = drag; drawBounds(it); return settle(); }
    dragTw = gsap.to(it.position, { x: drag.x, y: drag.y, duration: 0.4, ease: "back.out(1.15)", onUpdate: () => drawBounds(it), onComplete: settle });
  };
  APP.on("delete", () => { if (!selected) return; push(); selected.remove(); unselect(); });

  // ── Brightness: repaint what was drawn, like the original, in the current skin color
  const paint = (t) => {
    if (t instanceof Group) return t.children.forEach(paint);
    if (t.fillColor) t.fillColor = C.FILL;
    if (t.strokeColor) t.strokeColor = C.STROKE;
    if (t.data.isRoadPath) t.strokeColor = C.STROKE;
    else if (t.data.isRoadEndpoint) t.fillColor = C.STROKE;
    if (t.data.isDoor || t.data.isWindow) { t.strokeColor = C.FILL; t.fillColor = C.STROKE; }
    if (t.data.isBoundBox) { t.strokeColor = C.STROKE; t.fillColor = C.FILL_SELECT; }
    else if (t.data.isBoundBoxHandler) t.fillColor = C.STROKE;
  };
  const repaint = () => { palette(); ps.project.layers.forEach(paint); };
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });

  // ── Tool switch
  const TOOLS = { select: pick, land, trees, mountains, roads, buildings };
  const HOME = { land: "Land", trees: "Trees", mountains: "Mountains", roads: "Roads", buildings: "Buildings" };
  let current = "select";
  const activate = (name) => { if (HOME[name]) layer(HOME[name])?.activate(); else layer("Buildings")?.activate(); TOOLS[name].activate(); };
  APP.on("tool", (name, opt) => {
    current = TOOLS[name] ? name : "select";
    if (current === "mountains" && opt) { mtSize = opt; sizeMt(); }
    if (current === "buildings" && opt) bKind = opt;
    activate(current);
    canvas.classList.toggle("active-draw", current !== "select");
    canvas.classList.toggle("active-select", current === "select");
  });
  APP.on("switch", (name, on) => { if (name === "land") landClosed = on; if (name === "trees") pointy = on; });

  // ── Edit·File
  APP.on("clear", () => { push(); unselect(); selId = null; dropBounds(); ps.project.layers.forEach((l) => l.removeChildren()); });
  APP.on("new", () => {
    unselect(); selId = null; dropBounds();
    ps.project.layers.forEach((l) => l.removeChildren());
    undoS.length = redoS.length = 0; emitH(); APP.setTitle("No title");
  });
  // Like the original, opens an SVG painted in a light skin in a new window and prints with the chosen paper size and orientation
  APP.on("export", (name, size) => {
    const html = document.documentElement, was = html.dataset.theme, sel = selected;
    let svg;
    unselect();
    try { if (was !== "light") { html.dataset.theme = "light"; repaint(); } svg = ps.project.exportSVG({ asString: true }); }
    finally { if (was !== "light") { html.dataset.theme = was; repaint(); } if (sel) select(sel); }
    const w = open("", "_blank", "width=800,height=600");
    if (!w) return alert("Allow pop-ups to open the print window.");
    const vb = ps.view.bounds, doc = w.document;
    doc.title = name;
    const st = doc.createElement("style");
    st.textContent = `@page { size: ${size} ${vb.width > vb.height ? "landscape" : "portrait"}; margin: 0; }
html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
.print-page { width: 100%; height: 100%; display: grid; place-items: center; overflow: hidden; box-sizing: border-box; }
.print-page svg { display: block; width: auto; height: auto; max-width: 100%; max-height: 100%; }`;
    const page = doc.createElement("div");
    page.className = "print-page";
    page.innerHTML = svg;
    doc.head.append(st);
    doc.body.append(page);
    requestAnimationFrame(() => { w.focus(); w.print(); w.close(); });
  });

  APP.emit("tool", "select");
  emitH();
})();
