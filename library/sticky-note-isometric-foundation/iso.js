/* The original speaks through isometric illustrations (a school, houses, books, planes and people on round islands, a cherry-blossom school town) — redraw the same positions, sizes and feel with our own shapes.
   Colors are painted only with the .iso class (--kf-*·--site-*) in shared.css. [data-iso="Name"] Put that image in. */
(() => {
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const f = (n) => Math.round(n * 10) / 10;
  const C = Math.cos(Math.PI / 6), S = 0.5;
  // Floor (x,y) height z to screen — origin is the top center of the picture
  const pt = (ox, oy) => (x, y, z = 0) => [ox + (x - y) * C, oy + (x + y) * S - z];
  const poly = (pts, c) => `<polygon class="${c}" points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}"/>`;
  function box(P, x, y, z, w, d, h, c = ["wall-t", "wall-l", "wall-r"]) {
    const a = P(x, y, z + h), b = P(x + w, y, z + h), cc = P(x + w, y + d, z + h), dd = P(x, y + d, z + h);
    const e = P(x + w, y + d, z), g = P(x, y + d, z), k = P(x + w, y, z);
    return poly([dd, cc, e, g], c[1]) + poly([cc, b, k, e], c[2]) + poly([a, b, cc, dd], c[0]);
  }
  // Window row — small squares lined up on the left face (y+d face)
  function windows(P, x, y, z, w, d, h, rows, cols) {
    let s = "";
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const wx = x + (w / cols) * (q + 0.25), wz = z + (h / rows) * (r + 0.3), ww = (w / cols) * 0.5, wh = (h / rows) * 0.45;
      s += poly([P(wx, y + d, wz + wh), P(wx + ww, y + d, wz + wh), P(wx + ww, y + d, wz), P(wx, y + d, wz)], "glass");
    }
    return s;
  }
  const disc = (cx, cy, rx, ry, th, top = "ground-t", side = "ground-s") =>
    `<path class="${side}" d="M${f(cx - rx)} ${f(cy)}v${th}a${rx} ${ry} 0 0 0 ${2 * rx} 0v-${th}z"/><ellipse class="${top}" cx="${f(cx)}" cy="${f(cy)}" rx="${rx}" ry="${ry}"/>`;
  const tree = (x, y, s = 1, c = "leaf") => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><rect class="trunk" x="-3" y="-14" width="6" height="16"/><path class="${c}" d="M0 -64L18 -14H-18Z"/><path class="${c}-d" d="M0 -64L18 -14H0Z"/></g>`;
  const roundTree = (x, y, s = 1, c = "blossom") => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><rect class="trunk" x="-4" y="-30" width="8" height="32"/><circle class="${c}" cx="0" cy="-52" r="30"/><circle class="${c}" cx="-22" cy="-38" r="20"/><circle class="${c}" cx="22" cy="-40" r="22"/><circle class="${c}-d" cx="10" cy="-30" r="14"/></g>`;
  // Person: head, body, legs. look: uniform (navy), shirt, skirt
  function person(x, y, s = 1, o = {}) {
    const top = o.top || "navy", leg = o.leg || "navy", skirt = o.skirt;
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})"><rect class="${leg}" x="-5" y="-22" width="4" height="22" rx="2"/><rect class="${leg}" x="1" y="-22" width="4" height="22" rx="2"/>${skirt ? `<path class="${skirt}" d="M-8 -14L-6 -30H6L8 -14Z"/>` : ""}<rect class="${top}" x="-7" y="-44" width="14" height="22" rx="5"/><circle class="skin" cx="0" cy="-52" r="7"/><path class="hair" d="M-7 -53a7 7 0 0 1 14 0q-7 -4 -14 0z"/>${o.bag ? `<rect class="soil" x="7" y="-28" width="9" height="8" rx="1"/>` : ""}</g>`;
  }
  const svg = (w, h, body, extra = "") => `<svg viewBox="0 0 ${w} ${h}" ${extra} aria-hidden="true" focusable="false">${body}</svg>`;

  // Hero island — original mv_img_01: on a big round island, three schools · bike roof · yellow-roof house · book pile · airplane · blackboard, and about ten people
  function island() {
    seed = 11; const g = [], W = 1250, H = 720, P = pt(625, 200);
    g.push(disc(625, 560, 600, 210, 26, "ground-t", "ground-s"));
    g.push(disc(470, 600, 300, 110, 0, "path-t", "path-t"));
    g.push(disc(1080, 520, 160, 70, 18, "plate-t", "plate-s"));
    g.push(box(P, -330, -40, 0, 120, 110, 190) + windows(P, -330, -40, 0, 120, 110, 190, 5, 4));
    g.push(box(P, -330, -40, 190, 120, 110, 10, ["roof-t", "roof-l", "roof-r"]));
    g.push(box(P, -210, 20, 0, 90, 100, 140) + windows(P, -210, 20, 0, 90, 100, 140, 4, 3));
    g.push(box(P, -380, 120, 0, 100, 90, 120) + windows(P, -380, 120, 0, 100, 90, 120, 3, 3));
    g.push(`<circle class="white" cx="${f(P(-270, 70, 170)[0])}" cy="${f(P(-270, 70, 170)[1])}" r="14"/><path class="ln" d="M${f(P(-270, 70, 170)[0])} ${f(P(-270, 70, 170)[1])}v-8m0 8h6"/>`);
    g.push(box(P, -470, 230, 0, 90, 70, 6, ["roof-t", "roof-l", "roof-r"]) + box(P, -470, 230, 40, 90, 70, 6, ["roof-t", "roof-l", "roof-r"]));
    g.push(box(P, 30, 80, 0, 130, 110, 80, ["wall-t", "wall-l", "wall-r"]) + box(P, 30, 80, 80, 130, 110, 46, ["sun-t", "sun-l", "sun-r"]));
    g.push(box(P, 210, 60, 0, 60, 90, 14, ["book1", "book1-d", "book1-d"]) + box(P, 205, 62, 14, 66, 86, 14, ["book2", "book2-d", "book2-d"]) + box(P, 212, 60, 28, 58, 90, 14, ["book3", "book3-d", "book3-d"]));
    g.push(box(P, 260, -60, 0, 30, 90, 150, ["book2", "book2-d", "book2-d"]) + box(P, 300, -60, 0, 30, 90, 120, ["sun-t", "sun-l", "sun-r"]));
    g.push(box(P, 360, 200, 0, 10, 160, 110, ["dark", "dark", "dark"]));
    g.push(`<g transform="translate(1000 380) rotate(-18)"><ellipse class="white" cx="0" cy="0" rx="110" ry="20"/><path class="white" d="M-20 -6L40 -90L60 -86L20 0Z"/><path class="white" d="M-20 6L40 70L58 66L20 0Z"/><path class="white" d="M-100 -4L-120 -40L-104 -40L-86 -6Z"/><path class="glass" d="M-70 -6h120"/></g>`);
    for (let i = 0; i < 9; i++) g.push(tree(120 + rnd() * 1000, 470 + rnd() * 220, 0.8 + rnd() * 0.5));
    g.push(`<path class="hedge" d="M560 330q40 -30 80 -10q60 -20 120 10q60 -20 110 10v20h-310z"/>`);
    const ppl = [[600, 480, "navy", "skirt"], [700, 470, "white", null], [520, 560, "navy", null], [430, 690, "mint", "skirt"], [880, 440, "navy", null], [1170, 470, "navy", null], [960, 720, "white", null], [320, 560, "navy", "skirt"]];
    ppl.forEach(([x, y, t, sk], i) => g.push(person(x, y, 1.15, { top: t, leg: "navy", skirt: sk ? "navy" : null, bag: i % 3 === 0, flip: i % 2 })));
    return svg(W, H + 200, `<g transform="translate(0 200)">${g.join("")}</g>`);
  }
  // Three About cards — original about_img: picture cards of people studying·talking
  const card = (k) => {
    seed = 20 + k; const g = [], P = pt(156, 120);
    g.push(`<rect class="card" x="0" y="0" width="312" height="400" rx="16"/>`);
    g.push(disc(156, 300, 120, 50, 10, "plate-t", "plate-s"));
    g.push(box(P, -30, 50, 0, 60, 40, 30, ["wall-t", "wall-l", "wall-r"]));
    g.push(person(110, 300, 1.6, { top: k === 1 ? "sun" : "mint", leg: "navy" }) + person(200, 310, 1.6, { top: "navy", leg: "navy", skirt: k === 2 ? "navy" : null, flip: 1 }));
    if (k === 0) g.push(roundTree(250, 250, 0.7, "leaf"));
    if (k === 2) g.push(box(P, 40, -40, 0, 30, 30, 70, ["book1", "book1-d", "book1-d"]));
    return svg(312, 400, g.join(""));
  };
  // Info card art — original info_img_01 (isometric street block) · info_img_02 (big bookshelf and a person climbing a ladder)
  function blocks() {
    seed = 31; const g = [], P = pt(240, 60);
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
      const x = q * 90 - 120, y = r * 90 - 40, h = 20 + rnd() * 70;
      g.push(box(P, x, y, 0, 70, 70, 10, ["plate-t", "plate-s", "plate-s"]) + box(P, x + 10, y + 10, 10, 50, 50, h) + windows(P, x + 10, y + 10, 10, 50, 50, h, 2, 2));
      g.push(tree(...P(x + 64, y + 62, 10), 0.5));
    }
    return svg(480, 420, `<g transform="translate(0 120)">${g.join("")}</g>`);
  }
  function shelf() {
    seed = 37; const g = [], P = pt(240, 40);
    const cls = ["book1", "book2", "book3", "navy", "sun-t"];
    for (let i = 0; i < 8; i++) g.push(box(P, -60 + i * 24, -40, 0, 20, 90, 180 + rnd() * 40, [cls[i % 5], `${cls[i % 5]}-d`, `${cls[i % 5]}-d`]));
    g.push(`<path class="ln" d="M330 330L380 120M350 330L400 120M336 300h22M344 260h22M352 220h22M360 180h22"/>`);
    g.push(person(372, 190, 1.2, { top: "mint", leg: "navy" }) + person(120, 330, 1.2, { top: "navy", leg: "navy", skirt: "navy" }));
    return svg(480, 420, `<g transform="translate(70 165) scale(.6)">${g.join("")}</g>`);
  }
  // Footer end village — original footer_img: two cherry trees, a school and its gate, walking students, round hills
  function town() {
    seed = 51; const g = [], P = pt(1000, 280);
    g.push(`<path class="hill" d="M0 520Q500 300 1000 340Q1500 380 1440 330V800H0Z"/>`);
    g.push(`<path class="path-t" d="M0 640Q600 470 1440 520V800H0Z"/>`);
    g.push(box(P, 0, -160, 0, 170, 140, 220) + windows(P, 0, -160, 0, 170, 140, 220, 5, 5) + box(P, 0, -160, 220, 170, 140, 10, ["roof-t", "roof-l", "roof-r"]));
    g.push(box(P, 180, -100, 0, 120, 110, 150) + windows(P, 180, -100, 0, 120, 110, 150, 4, 4));
    g.push(roundTree(340, 470, 2.6) + roundTree(180, 520, 1.8) + roundTree(1300, 470, 1.7));
    for (let i = 0; i < 6; i++) g.push(tree(560 + i * 70, 520 - i * 6, 0.9));
    const ppl = [[520, 640, "navy", 1], [640, 600, "white", 0], [720, 660, "navy", 1], [860, 600, "navy", 0], [980, 640, "mint", 1], [1100, 610, "navy", 0], [440, 700, "navy", 0]];
    ppl.forEach(([x, y, t, sk], i) => g.push(person(x, y, 2, { top: t, leg: "navy", skirt: sk ? "navy" : null, bag: i % 2 === 0, flip: i % 3 === 0 })));
    g.push(`<path class="cone" d="M760 560l10 -26l10 26z"/><path class="cone" d="M800 575l10 -26l10 26z"/>`);
    return svg(1440, 767, g.join(""), 'preserveAspectRatio="xMidYMax slice"');
  }
  // Subpage header illustration — original page-header right side: people talking at a desk (isometric)
  function desk() {
    seed = 61; const g = [], P = pt(260, 80);
    g.push(disc(260, 230, 230, 90, 0, "plate-t", "plate-t"));
    g.push(box(P, -40, -20, 0, 140, 80, 40, ["white", "wall-l", "wall-r"]));
    g.push(person(160, 230, 1.5, { top: "mint", leg: "navy" }) + person(330, 260, 1.5, { top: "navy", leg: "navy", flip: 1 }) + person(420, 180, 1.4, { top: "white", leg: "navy", skirt: "navy" }));
    g.push(tree(470, 260, 0.8));
    return svg(520, 300, g.join(""));
  }
  // Floating ”Staff here” round button — original flowbtn: a person raising a hand on a pink disc
  const flow = () => svg(150, 150, `<circle class="pink" cx="75" cy="75" r="72"/>${person(96, 74, 1.5, { top: "mint", leg: "navy" })}`);
  // Small person at the corner of the Guardian Program panel — original parent_img_01·02
  const sitter = (k) => svg(50, 60, person(25, 58, 0.95, { top: k ? "sun-t" : "mint", leg: "navy", skirt: k ? "navy" : null }));

  const draw = { island, "card-1": () => card(0), "card-2": () => card(1), "card-3": () => card(2), blocks, shelf, town, desk, flow, "sitter-1": () => sitter(0), "sitter-2": () => sitter(1) };
  const paint = (root = document) => root.querySelectorAll("[data-iso]:not([data-iso-done])").forEach((el) => {
    const fn = draw[el.dataset.iso];
    if (!fn) return;
    el.insertAdjacentHTML("beforeend", fn());
    el.dataset.isoDone = "";
  });
  window.SG_ISO = { paint };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => paint());
  else paint();
})();
