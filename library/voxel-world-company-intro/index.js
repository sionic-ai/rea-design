// Hero (pixel logo · rolling cube) → enter (logo flies up and stands, camera tilts 45° and pulls back) → sections on a tilted floor. Values read from the original engine.
(() => {
  const { World, cubeAt, rgb, bezier, mat4 } = window.YnWorld;
  const root = document.documentElement;
  const stage = document.querySelector(".yn-stage");
  const box = document.querySelector(".yn-box");
  const canvas = document.querySelector(".yn-view");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = () => root.classList.contains("lite");
  if (reduce) root.classList.add("lite");

  let world;
  try { world = new World(canvas); } catch (e) { root.classList.add("lite"); return; }

  const SP = () => innerWidth < 768;
  const BASE = () => (SP() ? { w: 288, h: 228, logo: 12, dot: 8 } : { w: 768, h: 512, logo: 32, dot: 16 });
  // In-section placement — adds only layout values that ignore transforms (3D)
  const offsetIn = (el, sec) => { let x = 0, y = 0; for (let n = el; n && n !== sec; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return [x, y]; };
  const CONTENT_MARGIN = 3; // × panel height — between sections
  const INTRO_FOCAL = 200, VIEW_FOCAL = 5000, VIEW_XROT = 45;

  const pal = () => ({
    base: rgb("--kf-line"),
    colors: [rgb("--kf-accent"), rgb("--kf-danger"), rgb("--kf-success"), rgb("--kf-warning")],
    board: rgb("--site-board"),
    square: rgb("--site-pixel"),
    doodle: { trunk: rgb("--site-trunk"), white: rgb("--kf-ink") },
  });
  let P = pal();

  // ───── Pixel logo: 24×11 cells (border + four letters). Our own letters ”LOGO” instead of the original logo image
  const LOGO = [
    "XXXXXXXXXXXXXXXXXXXXXXXX",
    "X......................X",
    "X..X.....XX...XXX..XX..X",
    "X..X....X..X.X....X..X.X",
    "X..X....X..X.X....X..X.X",
    "X..X....X..X.X.XX.X..X.X",
    "X..X....X..X.X..X.X..X.X",
    "X..X....X..X.X..X.X..X.X",
    "X..XXXX..XX...XXX..XX..X",
    "X......................X",
    "XXXXXXXXXXXXXXXXXXXXXXXX",
  ];
  // Four text chunks each fly up and spin separately — the original is a group (0 = Each item gets a different rotation
  const groupOf = (c, r) => (r === 0 || r === 10 || c === 0 || c === 23 ? 0 : c <= 7 ? 1 : c <= 12 ? 2 : c <= 17 ? 3 : 4);

  const logo = { cells: [], z: 0, groups: [], colorWait: [], colors: [], changer: 1, pressed: false, finished: false };
  LOGO.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === "X") logo.cells.push({ c, r, g: groupOf(c, r), glyph: groupOf(c, r) > 0 }); }));
  for (let g = 0; g < 5; g++) logo.groups.push({ z: 0, vz: 0, y: 0, ang: 0, va: -0.001 - 0.01 * Math.random(), kick: 0.2 + 0.3 * Math.random(), target: -Math.PI / 2 + 2 * Math.PI });
  logo.groups[0].target = -Math.PI / 2 + 3 * Math.PI;
  logo.cells.forEach((cell, i) => { logo.colors[i] = null; logo.colorWait[i] = 0; });

  // ───── 100 rolling cubes: each moves by rolling one cell (10 frames · cubic-bezier(0,0,1,.4)), with a 10~100 frame rest between
  const ROLL_EASE = bezier(0, 0, 1, 0.4);
  const DIRS_STABLE = [[1, 0], [-1, 0], [0, -1], [0, 1]];
  const DIRS_DOWN = [[1, 0], [-1, 0], [0, -1], [0, 1], [1, 0], [-1, 0], ...Array(15).fill([0, 1])];
  const DIRS_UP = [[1, 0], [-1, 0], [0, -1], [0, 1], [1, 0], [-1, 0], ...Array(15).fill([0, -1])];
  const free = { list: [], occ: new Map(), count: 0 };
  const key = (x, y) => x + "," + y;

  // ───── World panel
  const logoBatch = world.batch(400);
  const freeBatch = world.batch(120);
  const wellBatch = world.batch(4);
  const doodleBatch = world.batch(4000);
  const sections = [];

  const m = mat4.create(), t = mat4.create();
  let B = BASE(), viewRot = 0, mode = "intro", scrollY = 0, contentTop = 0;

  function buildDots() {
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    const x = c.getContext("2d");
    x.fillStyle = getComputedStyle(root).getPropertyValue("--kf-bg").trim();
    x.fillRect(0, 0, 8, 8);
    x.fillStyle = getComputedStyle(root).getPropertyValue("--kf-surface").trim();
    x.fillRect(0, 0, 4, 4);
    world.plane(world.texture(c, true), -8000, -8000, 16000, 64000, { rep: [2000, 8000], z: -0.5 });
  }

  function seedFree() {
    free.list = []; free.occ.clear();
    // Original floor: PC 200×100 cells (3200×1600px), phone 120×80 cells, centered on the middle of the board
    const s = B.dot, cols = SP() ? 120 : 200, rows = SP() ? 80 : 100;
    const x0 = Math.floor(B.w / 2 / s - cols / 2), y0 = Math.floor(B.h / 2 / s - rows / 2);
    const logoRect = [0, 0, B.w / s, (B.logo * 11) / s];
    for (let i = 0; i < 100; i++) {
      let cx, cy, tries = 0;
      do { cx = x0 + Math.floor(Math.random() * cols); cy = y0 + Math.floor(Math.random() * rows); tries++; }
      while (tries < 50 && (free.occ.has(key(cx, cy)) || (cx >= logoRect[0] && cx < logoRect[2] && cy >= logoRect[1] && cy < logoRect[3])));
      free.occ.set(key(cx, cy), i);
      free.list.push({ cx, cy, color: P.colors[i % 4], wait: 10 + Math.floor(90 * Math.random()), dirs: DIRS_STABLE, dirLeft: 0, rolling: false, t: 0, dx: 0, dy: 0 });
    }
    free.count = 0;
  }

  // ───── Pixel text: write the text small on a canvas and place one square per lit cell (replaces the original’s Japanese glyph image → Korean placeholder)
  function pixelText(text, cols, font = 13) {
    const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
    const lineH = Math.round(font * 1.25);
    x.font = `500 ${font}px ${getComputedStyle(root).getPropertyValue("--kf-font-sans")}`;
    const lines = [];
    for (const para of text.split(/\n+/)) {
      let line = "";
      for (const ch of para) { if (x.measureText(line + ch).width > cols) { lines.push(line); line = ch; } else line += ch; }
      if (line) lines.push(line);
    }
    c.width = cols; c.height = Math.max(1, lines.length * lineH);
    x.font = `500 ${font}px ${getComputedStyle(root).getPropertyValue("--kf-font-sans")}`;
    x.fillStyle = "#fff"; /* Not skin: invisible panel that extracts only the letter shapes */
    x.textBaseline = "top";
    lines.forEach((l, i) => x.fillText(l, 0, i * lineH + 1));
    const d = x.getImageData(0, 0, c.width, c.height).data, on = [];
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 110) on.push([xx, y]);
    return { on, rows: c.height };
  }

  // ───── Decorative models (original doodles spot): our basic shapes — tree, flag, lantern, cloud, house
  const MODELS = {
    tree: { size: 8, cells: (() => { const a = []; for (let z = 0; z < 3; z++) a.push([1, 1, z, "trunk"]); for (let z = 3; z < 6; z++) for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (!(z === 5 && (x !== 1 && y !== 1))) a.push([x, y, z, "green"]); return a; })() },
    flag: { size: 8, cells: (() => { const a = []; for (let z = 0; z < 9; z++) a.push([0, 0, z, "white"]); for (let z = 6; z < 9; z++) for (let x = 1; x < 5; x++) a.push([x, 0, z, "flag"]); return a; })() },
    lamp: { size: 8, cells: (() => { const a = []; for (let z = 0; z < 7; z++) a.push([0, 0, z, "trunk"]); a.push([0, 0, 7, "yellow"], [1, 0, 7, "yellow"], [-1, 0, 7, "yellow"], [0, 0, 8, "yellow"]); return a; })() },
    cloud: { size: 12, cells: (() => { const a = []; for (let x = 0; x < 6; x++) for (let y = 0; y < 2; y++) a.push([x, y, 10, "white"]); for (let x = 1; x < 4; x++) a.push([x, 0, 11, "white"]); return a; })() },
    house: { size: 10, cells: (() => { const a = []; for (let x = 0; x < 4; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) a.push([x, y, z, "white"]); for (let x = 0; x < 4; x++) for (let y = 0; y < 3; y++) a.push([x, y, 3, "red"]); for (let x = 1; x < 3; x++) a.push([x, 1, 4, "red"]); return a; })() },
  };
  const doodles = [];
  function addDoodle(type, x, y, flagColor) {
    const md = MODELS[type], s = md.size;
    const tone = { trunk: P.doodle.trunk, green: P.colors[2], white: P.doodle.white, yellow: P.colors[3], red: P.colors[1], flag: flagColor || P.colors[0] };
    for (const [cx, cy, cz, k] of md.cells) doodles.push({ x: x + cx * s, y: y + cy * s, z: (cz + 1) * s, s, color: tone[k] });
  }

  // ───── Section layout: read the sections from the DOM and set their positions (px) on the floor
  function layout() {
    B = BASE();
    if (lite()) { document.querySelectorAll("[data-pixel]").forEach((el) => (el.style.height = "")); return; }
    sections.forEach((s) => (s.batch.count = 0));
    doodles.length = 0;
    let y = B.h + CONTENT_MARGIN * B.h;
    contentTop = y;
    document.querySelectorAll(".yn-sec").forEach((sec, i) => {
      let s = sections[i];
      if (!s) { s = { el: sec, batch: world.batch(1000), cellMap: new Map(), restore: [] }; sections.push(s); }
      s.top = y;
      sec.style.setProperty("--yn-top", y + "px");
      const squares = [];
      sec.querySelectorAll("[data-pixel]").forEach((el) => {
        const scale = +(SP() ? el.dataset.pixelSp || el.dataset.pixel / 2 : el.dataset.pixel);
        const cols = Math.floor((el.offsetWidth || B.w) / scale);
        const { on, rows } = pixelText(el.textContent.trim(), cols, +el.dataset.font || 13);
        const [ox, oy] = offsetIn(el, sec);
        el.style.height = rows * scale + "px";
        on.forEach(([cx, cy]) => squares.push([ox + cx * scale, oy + cy * scale, scale]));
      });
      sec.querySelectorAll("[data-board]").forEach((el) => { const [bx, by] = offsetIn(el, sec); squares.push([bx, by, 0, el.offsetWidth, el.offsetHeight, +el.dataset.board]); });
      sec.querySelectorAll("[data-doodle]").forEach((el) => {
        const [type, , color] = el.dataset.doodle.split("-");
        const c = { blue: P.colors[0], red: P.colors[1], green: P.colors[2], yellow: P.colors[3] }[color];
        const [dx, dy] = offsetIn(el, sec);
        addDoodle(type, dx + el.offsetWidth + 24, y + dy - 8, c);
      });
      const b = s.batch;
      b.grow(squares.length + 4);
      s.cellMap.clear();
      squares.forEach((q, k) => {
        if (q.length === 6) {
          // Section header bar: a long box rising from the bottom
          const [bx, by, , bw, bh, bz] = q;
          mat4.fromTranslation(m, [bx + bw / 2, -(y + by + bh / 2), bz / 2]); mat4.scale(m, m, [bw, bh, bz]);
          b.put(k, P.board, m, 1);
        } else {
          const [qx, qy, qs] = q;
          // In the original, the text rectangles are smaller than the cells, so gaps show between cells
          mat4.fromTranslation(m, [qx + qs / 2, -(y + qy + qs / 2), 0.5]); mat4.scale(m, m, [qs * 0.72, qs * 0.72, 1]);
          b.put(k, P.square, m, 0);
          const ck = key(Math.floor(qx / B.dot), Math.floor((y + qy) / B.dot));
          if (!s.cellMap.has(ck)) s.cellMap.set(ck, []);
          s.cellMap.get(ck).push(k);
        }
      });
      b.count = squares.length;
      b.dirty = true;
      s.height = sec.offsetHeight;
      y += s.height + CONTENT_MARGIN * B.h;
    });
    // Side decorations — a few per section scattered along the floor edge like the original
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let yy = contentTop - B.h * 2; yy < y; yy += 260) {
      const types = ["tree", "tree", "house", "lamp", "cloud", "tree"];
      addDoodle(types[Math.floor(rnd() * types.length)], -420 - rnd() * 520, yy + rnd() * 200);
      addDoodle(types[Math.floor(rnd() * types.length)], B.w + 160 + rnd() * 560, yy + rnd() * 200);
    }
    doodleBatch.grow(doodles.length);
    doodles.forEach((d, k) => { cubeAt(m, d.x, d.y, d.s, d.z); doodleBatch.put(k, d.color, m, 1); });
    doodleBatch.count = doodles.length;
    doodleBatch.dirty = true;
    document.querySelector(".yn-spacer").style.height = y + "px";
    return y;
  }

  // ───── Logo drawing: press (z) · lift-off (y, z, X-axis rotation per group)
  function drawLogo() {
    // The logo slot on the hero is a flat panel (the original shows no sides either) — a cube one slot thick from when it flies up
    const s = B.logo, depth = mode === "intro" || mode === "pushing" ? 1 : s;
    logo.cells.forEach((cell, i) => {
      const g = logo.groups[cell.g];
      const x = cell.c * s, y = cell.r * s;
      mat4.identity(t);
      if (mode !== "intro") {
        // Each group rotates on the X axis around its own center — the original turns around a position relative to the group, so both the border (half a turn more, in reverse) and the text stand upright.
        const px = B.w / 2, py = -(5.5 * s), pz = -s / 2;
        mat4.translate(t, t, [0, -g.y, g.z]);
        mat4.translate(t, t, [px, py, pz]);
        mat4.rotateX(t, t, -g.ang);
        mat4.translate(t, t, [-px, -py, -pz]);
      }
      cubeAt(m, x, y, s, logo.z, depth);
      mat4.multiply(m, t, m);
      logoBatch.put(i, logo.colors[i] || P.base, m, 1);
    });
    logoBatch.count = logo.cells.length;
    logoBatch.dirty = true;
    // When pressed, four well walls appear around the logo
    if (logo.z < 0 && mode === "intro") {
      const W = B.w, H = 11 * s, d = -logo.z;
      const walls = [[0, 0, W, 1], [0, H - 1, W, 1], [0, 0, 1, H], [W - 1, 0, 1, H]];
      walls.forEach(([x, y, w, h], k) => { mat4.fromTranslation(m, [x + w / 2, -(y + h / 2), -d / 2]); mat4.scale(m, m, [w, h, d]); wellBatch.put(k, P.base, m, 1); });
      wellBatch.count = 4;
    } else wellBatch.count = 0;
    wellBatch.dirty = true;
  }

  // Original: at the default color, each frame has a 1%×intensity chance of switching to one of four colors, and after (10+30r)/intensity frames it returns to default
  function flicker() {
    logo.cells.forEach((cell, i) => {
      if (!cell.glyph || --logo.colorWait[i] > 0) return;
      if (!logo.colors[i]) {
        if (Math.random() < 0.01 * logo.changer) { logo.colors[i] = P.colors[Math.floor(Math.random() * 4)]; logo.colorWait[i] = (10 + 30 * Math.random()) / logo.changer; }
      } else { logo.colors[i] = null; logo.colorWait[i] = (10 + 30 * Math.random()) / logo.changer; }
    });
    if (!logo.pressed && logo.changer > 1) logo.changer = Math.max(1, logo.changer - 0.2);
  }

  function stepFree() {
    if (free.count < 100) free.count++;
    const s = B.dot;
    for (let i = 0; i < free.count; i++) {
      const f = free.list[i];
      if (!f.rolling) {
        if (--f.wait < 0 && Math.random() < 0.1) {
          f.wait = --f.dirLeft > 0 ? 0 : (f.dirLeft === 0 ? ((f.dirs = DIRS_STABLE), 10 + Math.floor(90 * Math.random())) : 10 + Math.floor(90 * Math.random()));
          const [dx, dy] = f.dirs[Math.floor(Math.random() * f.dirs.length)];
          const k = key(f.cx + dx, f.cy + dy);
          if (!free.occ.has(k)) { free.occ.set(k, i); f.dx = dx; f.dy = dy; f.t = 0; f.rolling = true; }
        }
      } else {
        f.t += 0.1;
        if (1 - f.t < 0.04) {
          free.occ.delete(key(f.cx, f.cy));
          f.cx += f.dx; f.cy += f.dy; f.rolling = false;
          colorize(f.cx, f.cy, f.color);
        }
      }
      // When it strays far outside the screen (camera), it moves to the empty slot at the opposite end — the original’s wrap floor
      const camCell = (world.cam.y - B.h / 2) / s, rows = SP() ? 80 : 100;
      if (f.cy - camCell > rows || camCell - f.cy > rows) {
        free.occ.delete(key(f.cx, f.cy));
        f.cy = Math.round(camCell + (f.cy > camCell ? -rows + 2 : rows - 2));
        f.rolling = false;
        free.occ.set(key(f.cx, f.cy), i);
      }
    }
  }
  function drawFree() {
    const s = B.dot, flat = mode !== "world";
    for (let i = 0; i < free.count; i++) {
      const f = free.list[i];
      const x = f.cx * s, y = f.cy * s;
      if (flat) {
        // The hero is a flat grid seen from above — when rolling, it slides in that direction
        const e = f.rolling ? ROLL_EASE(f.t) : 0;
        mat4.fromTranslation(m, [x + s / 2 + f.dx * s * e, -(y + s / 2 + f.dy * s * e), 0.3]); mat4.scale(m, m, [s, s, 0.5]);
        freeBatch.put(i, f.color, m, 0);
      } else {
        cubeAt(m, x, y, s, s);
        if (f.rolling) {
          // Rotate 90° about the bottom corner on the rolling side — same curve as the original
          const a = ROLL_EASE(f.t) * Math.PI / 2;
          mat4.identity(t);
          const ex = x + s / 2 + (f.dx * s) / 2, ey = -(y + s / 2 + (f.dy * s) / 2);
          mat4.translate(t, t, [ex, ey, 0]);
          if (f.dx) mat4.rotateY(t, t, a * f.dx); else mat4.rotateX(t, t, a * f.dy);
          mat4.translate(t, t, [-ex, -ey, 0]);
          mat4.multiply(m, t, m);
        }
        freeBatch.put(i, f.color, m, 1);
      }
    }
    freeBatch.count = free.count;
    freeBatch.dirty = true;
  }
  // If the cell where it rolled and stopped has a text rectangle, it is tinted with that cube’s color for 300 frames
  function colorize(cx, cy, color) {
    if (mode !== "world") return;
    for (const s of sections) {
      const list = s.cellMap.get(key(cx, cy));
      if (!list) continue;
      list.forEach((k) => { s.batch.setColor(k, color); s.restore.push([k, 300]); });
    }
  }
  function restoreColors() {
    for (const s of sections) {
      if (!s.restore.length) continue;
      s.restore = s.restore.filter((r) => (--r[1] > 0 ? true : (s.batch.setColor(r[0], P.square), false)));
    }
  }

  // ───── CSS 3D: lays DOM text (name·English body·section name) on the floor with the same camera as WebGL
  const css = mat4.create(), flip = mat4.fromScaling(mat4.create(), [1, -1, 1]);
  function syncCss() {
    const c = world.cam;
    mat4.fromTranslation(css, [0, 0, c.focal]);
    mat4.multiply(css, css, flip);
    mat4.multiply(css, css, world.v);
    mat4.multiply(css, css, flip);
    stage.style.perspective = c.focal + "px";
    box.style.transform = `matrix3d(${Array.from(css).map((v) => +v.toFixed(6)).join(",")})`;
  }

  function placeCamera() {
    world.cam.x = B.w / 2; world.cam.y = B.h / 2;
    viewRot = SP() ? (90 * Math.atan2(3 * innerWidth, innerHeight)) / Math.PI : (90 * Math.atan2(2 * innerWidth, innerHeight)) / Math.PI;
  }

  // ───── Intro — after the logo pops forward (acceleration .2/frame) each group flies up, spins, then stands upright, and the camera tilts and pulls back over 2.4s
  const CAM_EASE = bezier(0.5, 0, 0.5, 1);
  let enterFrame = 0, enterPhase = 0, rise = 0, riseV = 0, pushV = 0, kickTimer = 0;
  function stepEnter() {
    const s = B.logo, n = 5 * s, d = 6 * s, gs = logo.groups;
    if (enterPhase === 0) {
      pushV += 0.2; logo.z += pushV;
      if (logo.z >= s) { enterPhase = 1; enterFrame = 0; gs.forEach((g) => (g.z = logo.z)); logo.z = 0; startCamera(); }
      return;
    }
    riseV = riseV < 0.1 * (n - rise) ? riseV + 0.1 : 0.1 * (n - rise);
    rise += riseV;
    enterFrame++;
    gs.forEach((g, k) => {
      g.y = rise;
      if (enterPhase === 1) {
        g.va += 2e-4; g.ang += g.va; g.vz += 0.2; g.z += g.vz;
      } else if (enterPhase === 2) {
        g.va += 2e-4; g.ang += g.va;
        g.vz = g.vz > 0 && g.vz > 0.1 * (d - g.z) ? g.vz - 4 : 0.1 * (d - g.z); g.z += g.vz;
      } else {
        g.va = g.va < 0.1 * (g.target - g.ang) ? g.va + 0.002 : 0.1 * (g.target - g.ang);
        if (Math.abs(g.va) < 1e-4) { g.va = 0; g.ang = g.target; }
        g.ang += g.va;
        g.vz = g.vz > 0 && g.vz < 0.1 * (d - g.z) ? g.vz - 4 : 0.1 * (d - g.z);
        if (Math.abs(g.vz) < 0.01) { g.vz = 0; g.z = d; }
        g.z += g.vz;
      }
    });
    if (enterPhase === 1 && enterFrame >= 9) { gs.forEach((g) => (g.va += 0.01 * Math.random())); enterPhase = 2; enterFrame = 0; }
    else if (enterPhase === 2 && enterFrame >= 31) { enterPhase = 3; enterFrame = 0; }
    else if (enterPhase === 3 && gs.every((g) => g.va === 0 && g.vz === 0)) logo.finished = true;
  }
  let camStart = 0, camPhase = 0;
  const LIGHT_INTRO = [-0.098, -0.195, 0.976], LIGHT_VIEW = [0.0953, -0.953, 0.286];
  function startCamera() { camStart = performance.now(); camPhase = 1; mode = "enter"; }
  function stepCamera(now) {
    const c = world.cam, ox = B.w / 2, oy = B.h / 2;
    let el = now - camStart, i = 1;
    if (camPhase === 1) {
      if (el > 1680) {
        // The original moves the time ahead by 960ms from 1680ms to jump to the second bar, and the second bar counts 720ms later than that
        camStart -= 960 - 720; camPhase = 2; el = now - camStart;
        root.classList.add("yn-entered");
        mode = "world";
        startContent();
      } else {
        i = CAM_EASE(el / 2400);
        c.dist = INTRO_FOCAL * (1 - i) + 0.3 * VIEW_FOCAL * i;
        c.rx = VIEW_XROT * i; c.ry = 10 * i; c.rz = viewRot * i;
        c.focal = INTRO_FOCAL * (1 - i) + VIEW_FOCAL * i;
      }
    }
    if (camPhase === 2) {
      i = el > 2400 ? 1 : CAM_EASE(el / 2400);
      c.dist = INTRO_FOCAL * (1 - i) + VIEW_FOCAL * i;
      c.rx = VIEW_XROT; c.ry = 0; c.rz = viewRot;
      c.focal = 5 * INTRO_FOCAL * (1 - i) + VIEW_FOCAL * i;
      if (el > 2400) camPhase = 3;
    }
    world.light = LIGHT_INTRO.map((v, k) => v * (1 - i) + LIGHT_VIEW[k] * i);
    // On the first measure the original only computes the center-shift value and never feeds it to the camera — from the second measure it shifts by +20 and +80
    const shift = camPhase === 1 ? 0 : i;
    c.x = ox + 20 * shift; c.y = oy + 80 * shift + (camPhase === 3 ? scrollY : 0);
  }
  function startContent() {
    free.list.forEach((f) => { f.wait = 10 + Math.floor(90 * Math.random()); });
    document.body.style.overflowY = "auto";
  }

  // ───── Scroll: the camera descends along the floor, and the rolling cubes roll toward the scroll
  let lastScroll = 0;
  addEventListener("scroll", () => {
    if (mode !== "world") return;
    scrollY = window.scrollY;
    const dir = Math.sign(scrollY - lastScroll);
    lastScroll = scrollY;
    if (dir) free.list.forEach((f) => { f.dirs = dir > 0 ? DIRS_DOWN : DIRS_UP; f.dirLeft = 10 + Math.floor(30 * Math.random()); });
    // Mark the menu of the section the camera is currently viewing — original is-current
    const cy = world.cam.y;
    const now = sections.find((s) => cy >= s.top - B.h && cy < s.top + s.height + CONTENT_MARGIN * B.h - B.h);
    navLinks.forEach((a) => a.classList.toggle("is-now", !!now && a.dataset.go === now.el.id));
  }, { passive: true });
  const navLinks = [...document.querySelectorAll(".yn-navi-main [data-go]")];

  // ───── Interaction: hovering the logo · Enter pushes the logo down one notch and makes the blinking 10x, on release it returns .2 per frame
  const cover = document.querySelector(".yn-cover"), enter = document.querySelector(".yn-enter");
  const press = (on) => {
    if (mode !== "intro") return;
    logo.pressed = on;
    if (on) { logo.changer = 10; logo.z = -B.logo * (SP() ? 2 : 1); window.ynSound?.over(); } else logo.z = 0;
    enter.classList.toggle("is-hover", on);
  };
  const go = () => {
    if (mode !== "intro") return;
    press(true);
    root.classList.add("yn-going");
    window.ynSound?.click();
    pushV = 0; enterPhase = 0; mode = "pushing";
  };
  // Like the original jQuery hover, moves between inner elements on over/out are filtered — even moving from the logo with Enter doesn’t release the press
  const inside = (n) => n && (cover.contains(n) || enter.contains(n));
  [cover, enter].forEach((el) => {
    el.addEventListener("pointerover", (e) => !inside(e.relatedTarget) && press(true));
    el.addEventListener("pointerout", (e) => !inside(e.relatedTarget) && logo.pressed && mode === "intro" && press(false));
    el.addEventListener("click", go);
  });

  // ───── Loop: counts steps at 60fps like the original (same speed on fast screens)
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (lite()) return;
    if (now - last < 1000 / 60 - 2) return;
    last = now;
    flicker();
    stepFree();
    if (mode === "pushing" || mode === "enter" || (mode === "world" && !logo.finished)) stepEnter();
    if (camPhase) stepCamera(now);
    else { world.cam.dist = world.cam.focal = INTRO_FOCAL; }
    restoreColors();
    drawLogo();
    drawFree();
    world.updateCamera();
    // Skip off-screen sections
    const cy = world.cam.y, reach = innerHeight * 3 + 2000;
    sections.forEach((s) => (s.batch.hidden = mode !== "world" || s.top > cy + reach || s.top + s.height < cy - reach));
    doodleBatch.hidden = mode !== "world";
    syncCss();
    world.render();
  }

  function resize() {
    B = BASE();
    world.resize(innerWidth, innerHeight, Math.min(2, devicePixelRatio || 1));
    placeCamera();
    if (camPhase === 3) { world.cam.rz = viewRot; }
    layout();
  }

  // Pixel text width is correct only once all fonts have loaded
  (document.fonts?.ready || Promise.resolve()).then(() => {
    P = pal();
    buildDots();
    resize();
    seedFree();
    addEventListener("resize", resize);
    requestAnimationFrame(frame);
  });

  window.ynWorld = {
    world, sections, free, logo, get mode() { return mode; },
    relayout: () => { layout(); },
    // So the section header bar sits at the upper third of the screen — camera center = Panel center + 80 + scroll
    scrollFor: (id) => { const s = sections.find((x) => x.el.id === id); return s ? Math.max(0, s.top - B.h / 2 - 80 + innerHeight * 0.15) : 0; },
  };
})();
