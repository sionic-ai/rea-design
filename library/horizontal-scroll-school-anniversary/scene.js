// The original art (hand-drawn web illustration) is not used, a village of the same position, size and feel is redrawn in SVG.
// Colors are painted only through the --site-* classes (p-*) of index.css so changing the skin changes the town too.
// Walking person, tuna, rainbow, and paper-ball ornament run on lottie-web like the original, but the animation data is newly made here.
(() => {
  const R = (n) => Math.round(n * 10) / 10;
  const rect = (x, y, w, h, c, rx = 0) => `<rect x="${R(x)}" y="${R(y)}" width="${R(w)}" height="${R(h)}" rx="${rx}" class="${c}"/>`;
  const poly = (pts, c) => `<polygon points="${pts.map((p) => R(p[0]) + "," + R(p[1])).join(" ")}" class="${c}"/>`;
  const circ = (x, y, r, c) => `<circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" class="${c}"/>`;
  const ell = (x, y, rx, ry, c) => `<ellipse cx="${R(x)}" cy="${R(y)}" rx="${R(rx)}" ry="${R(ry)}" class="${c}"/>`;
  const path = (d, c) => `<path d="${d}" class="${c}"/>`;
  const text = (x, y, s, size, c, extra = "") => `<text x="${R(x)}" y="${R(y)}" font-size="${R(size)}" class="${c}" ${extra}>${s}</text>`;

  // Window grid — takes rows, columns and gaps and lays out same-shaped windows
  function windows(x, y, w, h, rows, cols, o = {}) {
    let s = "";
    const gx = w / cols, gy = h / rows, pw = gx * (o.fill ?? .62), ph = gy * (o.fillY ?? .62);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = x + c * gx + (gx - pw) / 2, wy = y + r * gy + (gy - ph) / 2;
      if (o.arch) s += path(`M${R(wx)} ${R(wy + ph)}V${R(wy + pw / 2)}a${R(pw / 2)} ${R(pw / 2)} 0 0 1 ${R(pw)} 0V${R(wy + ph)}z`, "p-win o");
      else s += rect(wx, wy, pw, ph, "p-win o");
      if (o.bars !== false && !o.arch) s += `<path d="M${R(wx + pw / 2)} ${R(wy)}V${R(wy + ph)}M${R(wx)} ${R(wy + ph / 2)}H${R(wx + pw)}" class="p-bar"/>`;
    }
    return s;
  }
  function roof(type, x, y, w, h, c, over = .04) {
    const ox = w * over;
    if (type === "hip") return poly([[x - ox, y + h], [x + w * .12, y], [x + w * .88, y], [x + w + ox, y + h]], c + " o");
    if (type === "gable") return poly([[x - ox, y + h], [x + w / 2, y], [x + w + ox, y + h]], c + " o");
    if (type === "flat") return rect(x - ox / 2, y + h * .6, w + ox, h * .4, c + " o");
    if (type === "saw") { let d = `M${R(x)} ${R(y + h)}`; const n = 5; for (let i = 0; i < n; i++) d += `L${R(x + (i + .8) * w / n)} ${R(y)}L${R(x + (i + 1) * w / n)} ${R(y + h)}`; return path(d + "z", c + " o"); }
    return "";
  }
  // One building = Multiple blocks. Coordinates are taken as 0–1 ratios and spread across the picture box (W×H)
  function building(W, H, blocks) {
    let s = "";
    for (const b of blocks) {
      const x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H;
      if (b.roof) s += roof(b.roof, x, y - b.rh * H, w, b.rh * H, b.rc || "p-roof", b.over);
      s += rect(x, y, w, h, (b.wall || "p-wall") + " o");
      if (b.band) s += rect(x, y + h * b.band, w, h * .04, "p-band");
      if (b.win) s += windows(x + w * .04, y + h * (b.wy ?? .12), w * .92, h * (b.wh ?? .62), b.win[0], b.win[1], b.wo || {});
      if (b.door) s += rect(x + w * b.door - w * .05, y + h * .55, w * .1, h * .45, "p-door o");
      if (b.sign) s += rect(x + w * .2, y + h * .06, w * .6, h * .14, "p-sign o") + text(x + w / 2, y + h * .17, b.sign, h * .09, "p-signtxt", 'text-anchor="middle"');
      if (b.cupola) s += rect(x + w * .47, y - b.rh * H - h * .28, w * .06, h * .28, "p-wall2 o") + poly([[x + w * .45, y - b.rh * H - h * .28], [x + w * .5, y - b.rh * H - h * .48], [x + w * .55, y - b.rh * H - h * .28]], "p-roof o");
    }
    return s;
  }
  function tree(x, y, r, kind = "round", c = "p-tree") {
    if (kind === "cone") return rect(x - r * .08, y - r * .4, r * .16, r * .5, "p-trunk") + ell(x, y - r * 1.4, r * .55, r * 1.25, c + " o");
    if (kind === "pine") return rect(x - r * .1, y - r * 1.2, r * .2, r * 1.3, "p-trunk") + ell(x - r * .5, y - r * 1.1, r * .8, r * .3, c + " o") + ell(x + r * .4, y - r * 1.5, r * .7, r * .28, c + " o") + ell(x, y - r * 1.9, r * .6, r * .26, c + " o");
    if (kind === "palm") return path(`M${R(x)} ${R(y)}Q${R(x + r * .2)} ${R(y - r)} ${R(x)} ${R(y - r * 1.8)}`, "p-trunkline") + ell(x - r * .55, y - r * 1.85, r * .7, r * .2, c + " o") + ell(x + r * .55, y - r * 1.85, r * .7, r * .2, c + " o") + ell(x, y - r * 2.05, r * .25, r * .55, c + " o");
    return rect(x - r * .1, y - r * .7, r * .2, r * .7, "p-trunk") + circ(x - r * .45, y - r * .9, r * .6, c + " o") + circ(x + r * .45, y - r * .95, r * .6, c + " o") + circ(x, y - r * 1.35, r * .7, c + " o");
  }
  function trees(W, H, list) { return list.map((t) => tree(t[0] * W, t[1] * H, t[2] * H, t[3], t[4])).join(""); }
  function hills(W, H, n, c, amp = .35, seed = 1) {
    let d = `M0 ${H}`;
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * W, y = H * (amp + .25 * Math.abs(Math.sin(i * 1.7 + seed)) + .1 * Math.sin(i * 3.1 + seed));
      d += i === 0 ? `L0 ${R(y)}` : `Q${R(x - W / n / 2)} ${R(y - H * .25)} ${R(x)} ${R(y)}`;
    }
    return path(d + `L${W} ${H}z`, c + " o");
  }
  function cloud(x, y, r) { return [[0, 0, 1], [r * .9, -r * .35, .8], [r * 1.8, 0, .9], [r * .9, r * .2, .9]].map((p) => circ(x + p[0], y + p[1], r * p[2], "p-cloud o")).join(""); }
  function fence(x, y, w, h, c = "p-fence") {
    let s = rect(x, y, w, h, c + " o");
    for (let i = 0; i < w / (h * .14); i++) s += `<path d="M${R(x + i * h * .14)} ${R(y)}V${R(y + h)}" class="p-bar"/>`;
    return s;
  }
  // Standing person (static) — head, body, legs only
  function person(x, y, h, cloth = "p-cloth1", long = false) {
    const hw = h * .13;
    return (long ? poly([[x - hw * 1.1, y - h * .72], [x + hw * 1.1, y - h * .72], [x + hw * 1.5, y - h * .04], [x - hw * 1.5, y - h * .04]], cloth + " o")
      : rect(x - hw * .7, y - h * .38, hw * .55, h * .36, "p-cloth2 o") + rect(x + hw * .15, y - h * .38, hw * .55, h * .36, "p-cloth2 o") + poly([[x - hw * 1.1, y - h * .74], [x + hw * 1.1, y - h * .74], [x + hw * 1.2, y - h * .36], [x - hw * 1.2, y - h * .36]], cloth + " o"))
      + circ(x, y - h * .84, h * .1, "p-skin o") + path(`M${R(x - h * .1)} ${R(y - h * .86)}a${R(h * .1)} ${R(h * .1)} 0 0 1 ${R(h * .2)} 0z`, "p-hair");
  }
  function dog(x, y, s) { return ell(x, y - s * .5, s * .8, s * .35, "p-dog o") + circ(x + s * .75, y - s * .85, s * .3, "p-dog o") + rect(x - s * .6, y - s * .35, s * .15, s * .35, "p-dog") + rect(x + s * .4, y - s * .35, s * .15, s * .35, "p-dog"); }

  const svg = (W, H, body) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${body}</svg>`;

  // ───── Image list: keep the original positions (vh) and parallax as they are, only the images are ours ─────
  // [name, draw function(W,H)] — W·H are cell size (vh) × 10
  const ART = {
    clouds: (W, H) => cloud(W * .08, H * .5, H * .22) + cloud(W * .45, H * .35, H * .18) + cloud(W * .78, H * .55, H * .2),
    mountain: (W, H) => hills(W, H, 9, "p-hill2", .35, 2) + hills(W, H, 13, "p-hill", .55, 5) + trees(W, H, [[.32, .92, .18, "cone"], [.35, .92, .2, "cone"], [.38, .93, .17, "cone"], [.66, .95, .17, "cone"], [.7, .95, .19, "cone"], [.73, .95, .17, "cone"]]),
    hall: (W, H) => building(W, H, [
      { x: .02, y: .38, w: .96, h: .56, wall: "p-brick", roof: "hip", rh: .3, rc: "p-roof-slate", win: [1, 9], wy: .2, wh: .55, band: .1 },
      { x: .38, y: .55, w: .24, h: .39, wall: "p-brick", roof: "gable", rh: .22, rc: "p-roof-slate", door: .5 },
      { x: .7, y: .3, w: .22, h: .2, wall: "p-wall2", roof: "gable", rh: .18, rc: "p-roof-slate", win: [1, 2] }]),
    school: (W, H) => building(W, H, [
      { x: .22, y: .5, w: .74, h: .44, wall: "p-wall", roof: "hip", rh: .32, rc: "p-roof", win: [1, 12], wy: .25, wh: .5, cupola: true },
      { x: .5, y: .45, w: .14, h: .49, wall: "p-brick", roof: "gable", rh: .26, rc: "p-roof", door: .5 }])
      + trees(W, H, [[.6, .99, .2, "palm"]]),
    lab: (W, H) => rect(W * .05, H * .02, W * .1, H * .62, "p-wall2 o") + text(W * .1, H * .12, "Year", W * .06, "p-signtxt", 'text-anchor="middle"') + text(W * .1, H * .22, "Nine", W * .06, "p-signtxt", 'text-anchor="middle"') + text(W * .1, H * .32, "Cow", W * .06, "p-signtxt", 'text-anchor="middle"')
      + building(W, H, [
        { x: .25, y: .28, w: .72, h: .3, wall: "p-wall2", roof: "hip", rh: .14, rc: "p-roof-slate", win: [1, 5] },
        { x: .22, y: .58, w: .78, h: .22, wall: "p-brick", roof: "flat", rh: .05, rc: "p-roof-slate", win: [1, 6], door: .45 }])
      + rect(W * .2, H * .8, W * .8, H * .12, "p-stone o"),
    tower: (W, H) => path(`M${W * .5} 0L${W * .3} ${H}M${W * .5} 0L${W * .7} ${H}M${W * .38} ${H * .5}H${W * .62}M${W * .34} ${H * .75}H${W * .66}`, "p-trunkline") + rect(W * .35, H * .45, W * .3, H * .12, "p-wall2 o"),
    pinerow: (W, H) => trees(W, H, [[.15, 1, .5, "cone"], [.38, 1, .55, "cone"], [.6, 1, .5, "cone"], [.84, 1, .52, "cone"]]),
    front1925: (W, H) => fence(0, H * .32, W * .19, H * .18) + trees(W, H, [[.205, .62, .2, "pine"]])
      + building(W, H, [
        { x: .47, y: .3, w: .14, h: .3, wall: "p-wall2", roof: "hip", rh: .1, rc: "p-roof-slate", win: [1, 2], sign: "Shop" },
        { x: .62, y: .26, w: .17, h: .34, wall: "p-brick", roof: "hip", rh: .1, rc: "p-roof-slate", win: [2, 3] },
        { x: .8, y: .26, w: .2, h: .34, wall: "p-brick", roof: "hip", rh: .1, rc: "p-roof-slate", win: [2, 4] }])
      + trees(W, H, [[.6, .62, .17]]),
    front1925b: (W, H) => fence(0, H * .45, W * .45, H * .2) + rect(W * .7, H * .4, W * .04, H * .3, "p-post o") + dog(W * .9, H * .7, H * .08),
    farm: (W, H) => building(W, H, [{ x: .45, y: .4, w: .4, h: .3, wall: "p-wall2", roof: "flat", rh: .05, rc: "p-roof-slate", win: [1, 4] }])
      + trees(W, H, [[.1, .7, .18], [.24, .66, .2], [.35, .72, .16]]) + ell(W * .5, H * .9, W * .32, H * .08, "p-water o"),
    portrait: (W, H) => ell(W / 2, H / 2, W * .46, H * .46, "p-frame-gold o") + ell(W / 2, H / 2, W * .38, H * .4, "p-sky-pale") + person(W / 2, H * .95, H * .9, "p-cloth3"),
    kiosk: (W, H) => building(W, H, [{ x: .1, y: .35, w: .5, h: .5, wall: "p-wall", roof: "gable", rh: .2, rc: "p-roof", win: [1, 2] }]) + trees(W, H, [[.8, .9, .3]]),
    gate1950: (W, H) => building(W, H, [
      { x: .35, y: .1, w: .6, h: .55, wall: "p-white", roof: "flat", rh: .05, rc: "p-roof-slate", win: [3, 8], band: .3 }])
      + rect(W * .05, H * .45, W * .06, H * .5, "p-stone o") + rect(W * .2, H * .45, W * .06, H * .5, "p-stone o") + rect(W * .05, H * .6, W * .21, H * .18, "p-wall2 o") + fence(W * .27, H * .7, W * .7, H * .2, "p-stone"),
    girls: (W, H) => building(W, H, [{ x: .02, y: .3, w: .96, h: .5, wall: "p-white", roof: "hip", rh: .14, rc: "p-roof", win: [2, 14], wy: .12, wh: .76 }]) + trees(W, H, [[.92, .95, .2, "cone"]]),
    eng: (W, H) => building(W, H, [{ x: .02, y: .35, w: .7, h: .45, wall: "p-white", roof: "hip", rh: .18, rc: "p-roof", win: [2, 10] }, { x: .74, y: .45, w: .24, h: .35, wall: "p-wall2", roof: "flat", rh: .04, rc: "p-roof-slate", win: [2, 3] }]),
    reactor: (W, H) => rect(W * .2, H * .35, W * .6, H * .55, "p-yellow o") + ell(W * .5, H * .35, W * .3, H * .07, "p-yellow o") + rect(W * .45, H * .05, W * .1, H * .3, "p-wall2 o") + fence(W * .1, H * .85, W * .8, H * .12, "p-stone"),
    mainhall: (W, H) => building(W, H, [{ x: .05, y: .2, w: .62, h: .78, wall: "p-white", roof: "flat", rh: .04, rc: "p-roof-slate", win: [7, 7], wy: .05, wh: .9, wo: { fill: .82, fillY: .6, bars: false } }, { x: .68, y: .4, w: .3, h: .58, wall: "p-glass", roof: "flat", rh: .03, rc: "p-roof-slate" }]),
    second: (W, H) => building(W, H, [{ x: .05, y: .3, w: .9, h: .55, wall: "p-white", roof: "flat", rh: .05, rc: "p-roof-slate", win: [2, 8] }]) + trees(W, H, [[.15, 1, .16], [.85, 1, .18]]),
    hospital: (W, H) => building(W, H, [{ x: .1, y: .2, w: .8, h: .6, wall: "p-brick-2", roof: "flat", rh: .04, rc: "p-roof-slate", win: [5, 9], wy: .08, wh: .84 }])
      + rect(W * .18, H * .55, W * .64, H * .1, "p-sign o") + text(W * .5, H * .62, "Hospital Name 1975", H * .05, "p-signtxt", 'text-anchor="middle"')
      + rect(W * .16, H * .55, W * .025, H * .4, "p-white o") + rect(W * .82, H * .55, W * .025, H * .4, "p-white o"),
    agri: (W, H) => building(W, H, [{ x: .05, y: .45, w: .7, h: .35, wall: "p-brick-2", roof: "flat", rh: .04, rc: "p-roof-slate", win: [2, 9] }]) + trees(W, H, [[.82, .95, .2], [.92, .95, .16]]),
    bio: (W, H) => building(W, H, [{ x: .05, y: .35, w: .9, h: .5, wall: "p-brick-2", roof: "flat", rh: .04, rc: "p-roof-slate", win: [3, 14] }]),
    festival: (W, H) => path(`M${W * .35} ${H}L${W * .55} ${H * .3}`, "p-trunkline") + poly([[W * .55, H * .3], [W * .95, H * .45], [W * .85, H * .85], [W * .5, H * .7]], "p-flag o")
      + ell(W * .33, H * .32, W * .12, H * .12, "p-yellow o") + text(W * .33, H * .35, "Festival", H * .05, "p-signtxt", 'text-anchor="middle"')
      + building(W, H, [{ x: .02, y: .38, w: .28, h: .14, wall: "p-white", roof: "gable", rh: .06, rc: "p-roof" }]) + person(W * .62, H * .98, H * .3, "p-cloth4") + person(W * .48, H * .98, H * .27, "p-cloth1") + person(W * .72, H * .98, H * .26, "p-cloth2"),
    street: (W, H) => rect(W * .05, H * .2, W * .05, H * .8, "p-steel o") + rect(W * .9, H * .2, W * .05, H * .8, "p-steel o") + rect(W * .02, H * .2, W * .96, H * .12, "p-white o") + text(W * .5, H * .29, "Street Name", H * .07, "p-signtxt-red", 'text-anchor="middle"')
      + building(W, H, [{ x: .2, y: .55, w: .3, h: .45, wall: "p-white", roof: "flat", rh: .03, rc: "p-roof-slate", sign: "Shop", win: [1, 3], wy: .45, wh: .4 }, { x: .55, y: .6, w: .3, h: .4, wall: "p-brick-2", roof: "flat", rh: .03, rc: "p-roof-slate", win: [1, 3] }]),
    fish: (W, H) => building(W, H, [{ x: .05, y: .38, w: .5, h: .32, wall: "p-brick", roof: "gable", rh: .14, rc: "p-roof-slate", win: [2, 6] }]) + rect(W * .25, H * .05, W * .015, H * .2, "p-steel") + poly([[W * .265, H * .06], [W * .33, H * .09], [W * .265, H * .12]], "p-flag")
      + path(`M${W * .45} ${H * .82}Q${W * .75} ${H * .6} ${W} ${H * .7}V${H}H${W * .45}z`, "p-water o") + ell(W * .8, H * .82, W * .1, H * .03, "p-steel-ring"),
    incuba: (W, H) => building(W, H, [{ x: .05, y: .3, w: .9, h: .6, wall: "p-white", roof: "flat", rh: .03, rc: "p-roof-slate", win: [2, 6], wo: { bars: false, fill: .9 } }]),
    arch: (W, H) => path(`M${W * .1} ${H}V${H * .25}Q${W * .5} ${H * .02} ${W * .9} ${H * .25}V${H}`, "p-arch") + rect(W * .12, H * .17, W * .76, H * .14, "p-ink o") + text(W * .5, H * .27, "STREET NAME", H * .08, "p-signtxt-light", 'text-anchor="middle"'),
    westgate: (W, H) => building(W, H, [{ x: .05, y: .3, w: .9, h: .7, wall: "p-brick", roof: "gable", rh: .14, rc: "p-roof-slate", win: [2, 6], wo: { arch: true } }]) + path(`M${W * .38} ${H}V${H * .7}a${W * .12} ${W * .12} 0 0 1 ${W * .24} 0V${H}z`, "p-door o"),
    kinder: (W, H) => building(W, H, [{ x: .05, y: .35, w: .7, h: .55, wall: "p-wall2", roof: "gable", rh: .2, rc: "p-roof", win: [1, 5] }]) + trees(W, H, [[.85, .95, .3]]),
    campus: (W, H) => building(W, H, [
      { x: .02, y: .38, w: .45, h: .6, wall: "p-brick", roof: "gable", rh: .14, rc: "p-roof-slate", win: [3, 7], wo: { arch: true } },
      { x: .5, y: .1, w: .2, h: .88, wall: "p-glass", roof: "flat", rh: .02, rc: "p-roof-slate", win: [10, 3], wy: .03, wh: .94, wo: { bars: false, fill: .9, fillY: .5 } },
      { x: .73, y: .3, w: .25, h: .68, wall: "p-white", roof: "flat", rh: .02, rc: "p-roof-slate", win: [6, 4] }]) + trees(W, H, [[.1, 1, .12, "cone"], [.25, 1, .13, "cone"], [.4, 1, .12, "cone"]]),
    statue: (W, H) => rect(W * .3, H * .7, W * .4, H * .3, "p-stone o") + person(W * .5, H * .72, H * .55, "p-bronze", true),
    next: () => ""
  };

  // Draw one slot — data is read from data-art·data-w·data-h in index.html
  window.kdArt = (el) => {
    const fn = ART[el.dataset.art];
    if (!fn) return;
    const W = Math.round(+el.dataset.w * 10), H = Math.round(+el.dataset.h * 10);
    el.insertAdjacentHTML("afterbegin", svg(W, H, fn(W, H)));
  };
  window.kdPerson = (el) => {
    const W = 40, H = 160;
    el.insertAdjacentHTML("afterbegin", svg(W, H, person(W / 2, H - 2, H - 4, el.dataset.cloth || "p-cloth1", el.dataset.long === "1")));
  };

  // ───── Lottie data — match the original form (30fps, one walk cycle is 30 frames) and draw it with a few shapes ─────
  const paint = (() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    const probe = document.createElement("i");
    probe.style.display = "none";
    return (name) => {
      document.body.append(probe);
      probe.style.color = `var(${name})`;
      const c = getComputedStyle(probe).color;
      probe.remove();
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
    };
  })();
  const st = (v) => ({ a: 0, k: v });
  const anim = (times, vals, ease = [.5, .5]) => ({
    a: 1, k: times.map((t, i) => i < times.length - 1
      ? { t, s: [vals[i]], e: [vals[i + 1]], i: { x: [ease[1]], y: [1] }, o: { x: [ease[0]], y: [0] } }
      : { t, s: [vals[i]] })
  });
  const fl = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1, nm: "f" });
  const sk = (c, w) => ({ ty: "st", c: st(c), o: st(100), w: st(w), lc: 2, lj: 2, nm: "s" });
  const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0), nm: "t" });
  const grp = (items) => ({ ty: "gr", it: [...items, tr()], nm: "g" });
  const rc = (x, y, w, h, r = 0) => ({ ty: "rc", d: 1, s: st([w, h]), p: st([x, y]), r: st(r), nm: "r" });
  const el = (x, y, w, h) => ({ ty: "el", d: 1, s: st([w, h]), p: st([x, y]), nm: "e" });
  const sh = (pts, closed = true) => ({ ty: "sh", d: 1, ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: closed }), nm: "p" });
  let ind = 0;
  const layer = (shapes, o = {}) => ({
    ddd: 0, ind: ++ind, ty: 4, nm: "l" + ind, sr: 1, ao: 0, ip: 0, op: o.op || 30, st: 0, bm: 0,
    ks: {
      o: o.opacity || st(100), r: o.r || st(0),
      p: o.py || o.px ? { s: true, x: o.px || st(o.at[0]), y: o.py || st(o.at[1]) } : st([...(o.at || [0, 0]), 0]),
      a: st([...(o.at || [0, 0]), 0]), s: o.s || st([100, 100, 100])
    },
    shapes
  });
  const comp = (w, h, op, layers) => ({ v: "5.5.9", fr: 30, ip: 0, op, w, h, nm: "kd", ddd: 0, assets: [], layers });

  // Walking person — legs and arms swing back and forth once per 30 frames, body bobs 3px with each step
  window.kdWalker = (look = {}) => {
    const skin = paint("--site-skin"), c1 = paint(look.c1 || "--site-cloth1"), c2 = paint(look.c2 || "--site-cloth2"), hair = paint("--site-hair");
    const bobT = [0, 7.5, 15, 22.5, 30], bob = (y) => anim(bobT, [y, y - 3, y, y - 3, y]);
    const swing = (a, ph) => anim([0, 15, 30], ph ? [a, -a, a] : [-a, a, -a]);
    const long = look.long, legLen = long ? 50 : 72;
    const leg = (ph) => layer([grp([rc(50, 160 + legLen / 2, 15, legLen, 6), fl(c2)]), grp([el(55, 160 + legLen, 20, 10), fl(hair)])], { at: [50, 160], r: swing(24, ph) });
    const arm = (ph, c) => layer([grp([rc(50, 122, 11, 56, 5), fl(c)]), grp([el(50, 150, 11, 11), fl(skin)])], { at: [50, 96], r: swing(28, ph), py: bob(96), px: st(50) });
    const body = long
      ? layer([grp([sh([[30, 88], [70, 88], [80, 212], [20, 212]]), fl(c1)])], { at: [50, 150], py: bob(150), px: st(50) })
      : layer([grp([sh([[31, 88], [69, 88], [72, 168], [28, 168]]), fl(c1)])], { at: [50, 128], py: bob(128), px: st(50) });
    const head = layer([grp([el(50, 64, 34, 38), fl(skin)]), grp([sh([[33, 60], [36, 46], [50, 41], [64, 46], [67, 60], [60, 52], [40, 52]]), fl(hair)]), ...(look.hat ? [grp([rc(50, 44, 50, 6, 3), fl(c2)]), grp([rc(50, 36, 30, 16, 4), fl(c2)])] : [])], { at: [50, 64], py: bob(64), px: st(50) });
    if (!look.cart) return comp(100, 260, 30, [arm(1, c1), head, body, leg(1), leg(0), arm(0, c1)]);
    // Rickshaw — behind the puller: handle, seat, passenger, and a big wheel that turns once in 30 frames
    const wood = paint("--site-trunk"), seatC = paint("--site-red");
    const wheel = layer([grp([el(0, 0, 110, 110), sk(hair, 6)]), grp([rc(0, 0, 104, 3), fl(hair)]), grp([rc(0, 0, 3, 104), fl(hair)]), grp([el(0, 0, 14, 14), fl(hair)])], { at: [0, 0], px: st(70), py: st(205), r: anim([0, 30], [0, 360], [0, 1]) });
    const cart = layer([grp([sh([[95, 150], [182, 132]], false), sk(wood, 6)]), grp([rc(72, 140, 70, 60, 8), fl(seatC)]), grp([el(78, 92, 30, 34), fl(skin)]), grp([rc(78, 125, 38, 30, 6), fl(c2)])], { at: [0, 0] });
    const shift = (lr) => { lr.ks.p = lr.ks.p.s ? { s: true, x: { a: 0, k: lr.ks.p.x.k + 140 }, y: lr.ks.p.y } : st([lr.ks.p.k[0] + 140, lr.ks.p.k[1], 0]); return lr; };
    return comp(240, 260, 30, [cart, wheel, ...[arm(1, c1), head, body, leg(1), leg(0), arm(0, c1)].map(shift)]);
  };
  // Tuna — leaps once from the sea in a parabola (original goToAndPlay(1) once)
  window.kdTuna = () => {
    const b = paint("--site-steel"), w = paint("--kf-bg"), s = paint("--site-water");
    const fish = layer([grp([sh([[-70, 0], [-110, -26], [-104, 0], [-110, 26]]), fl(b)]), grp([el(0, 0, 150, 52), fl(b)]), grp([el(10, 8, 120, 22), fl(w)]), grp([el(50, -6, 8, 8), fl(w)])],
      { op: 46, at: [0, 0], px: anim([0, 45], [60, 340], [.33, .67]), py: anim([0, 22, 45], [240, 50, 240], [.3, .7]), r: anim([0, 45], [-40, 40]) });
    const splash = layer([grp([el(330, 236, 60, 14), fl(s)])], { op: 46, at: [330, 236], s: anim([0, 40, 45], [0, 0, 100].map((v) => v), [.5, .5]) });
    splash.ks.s = { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [0, 0, 100], i: { x: [.5, .5, .5], y: [1, 1, 1] }, o: { x: [.5, .5, .5], y: [0, 0, 0] } }, { t: 40, s: [0, 0, 100], e: [100, 100, 100], i: { x: [.5, .5, .5], y: [1, 1, 1] }, o: { x: [.5, .5, .5], y: [0, 0, 0] } }, { t: 45, s: [100, 100, 100] }] };
    return comp(400, 260, 46, [fish, splash]);
  };
  // Rainbow — five bands drawn from left to right
  window.kdRainbow = () => {
    const cs = ["--site-red", "--site-yellow", "--site-tree", "--site-glass", "--site-ink-soft"].map(paint);
    const arcs = cs.map((c, i) => {
      const r = 180 - i * 14;
      const g = grp([el(200, 210, r * 2, r * 2), sk(c, 13), { ty: "tm", s: st(0), e: anim([i * 3, 30 + i * 3], [0, 50], [.33, .67]), o: st(-90), m: 1, nm: "tm" }]);
      return layer([g], { op: 50 });
    });
    return comp(400, 220, 50, arcs);
  };
  // Paper-ball ornament — the original is playSegments([0,10]), so within 10 frames the two hemispheres split and the banner drops
  window.kdKusudama = () => {
    const gold = paint("--site-yellow"), red = paint("--site-red"), w = paint("--kf-bg");
    const half = (dir) => layer([grp([sh([[-60, 0], [-52, -30], [-30, -52], [0, -60], [0, 0]].map((p) => [p[0] * dir, p[1] + 60])), fl(gold)])], { op: 30, at: [200, 120], r: anim([0, 10], [0, dir * -55], [.2, .4]) });
    const banner = layer([grp([rc(200, 190, 40, 140), fl(w)]), grp([rc(200, 130, 40, 18), fl(red)])], { op: 30, at: [200, 120] });
    banner.ks.s = { a: 1, k: [{ t: 0, s: [100, 0, 100], e: [100, 100, 100], i: { x: [.3, .3, .3], y: [1, 1, 1] }, o: { x: [.4, .4, .4], y: [0, 0, 0] } }, { t: 10, s: [100, 100, 100] }] };
    return comp(400, 340, 30, [half(1), half(-1), banner]);
  };
  // NEXT 100 YEARS — three balloons rise over 30 frames (original playSegments([0,30]))
  window.kdBalloons = () => {
    const cs = ["--site-red", "--site-yellow", "--site-glass"].map(paint);
    const ls = cs.map((c, i) => layer([grp([el(0, 0, 44, 54), fl(c)]), grp([sh([[0, 27], [-4, 60], [3, 90]], false), sk(c, 2)])],
      { op: 60, at: [0, 0], px: st(80 + i * 110), py: anim([i * 4, 30], [300, 70 + (i % 2) * 40], [.2, .4]) }));
    return comp(400, 300, 60, ls);
  };
})();
