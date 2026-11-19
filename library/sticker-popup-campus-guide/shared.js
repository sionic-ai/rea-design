// One set shared across the site — hand-drawn shape set (data-d), menu · header · phone button bar · menu window · footer fill, back to top (motion animate), anchor scroll, hide the phone button bar when the footer is visible.
(() => {
  /* ── Hand-drawn shapes: original illustrations redrawn in the same spot · size · texture (1.6px ink line + pastel fills) ── */
  const f = (n) => +n.toFixed(1);
  const path = (c, d) => `<path class="${c}" d="${d}"/>`;
  const circ = (c, x, y, r) => `<circle class="${c}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
  const ell = (c, x, y, rx, ry) => `<ellipse class="${c}" cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}"/>`;
  const rect = (c, x, y, w, h, r = 0) => `<rect class="${c}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${r}"/>`;
  const line = (x1, y1, x2, y2, c = "o n") => path(c, `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  // Closed petal outline joining n round buds (flower · star flower · cloud lump)
  const scallop = (cx, cy, r, n, bulge = 0.55, rot = -90) => {
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = ((rot + (360 / n) * i) * Math.PI) / 180;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      if (i === 0) { d += `M${f(x)} ${f(y)}`; continue; }
      d += `A${f(r * bulge)} ${f(r * bulge)} 0 0 1 ${f(x)} ${f(y)}`;
    }
    return d + "Z";
  };
  const spikes = (cx, cy, r1, r2, n, rot = -90) => {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const a = ((rot + (180 / n) * i) * Math.PI) / 180, r = i % 2 ? r2 : r1;
      d += `${i ? "L" : "M"}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
    }
    return d + "Z";
  };
  // Face — two eyes, pink cheeks, smiling mouth
  const face = (x, y, s, smile = 1) =>
    circ("i", x - 6 * s, y, 1.6 * s) + circ("i", x + 6 * s, y, 1.6 * s) + circ("p", x - 10 * s, y + 5 * s, 2.6 * s) + circ("p", x + 10 * s, y + 5 * s, 2.6 * s) +
    path("o n", smile ? `M${f(x - 3 * s)} ${f(y + 5 * s)}Q${f(x)} ${f(y + 8.5 * s)} ${f(x + 3 * s)} ${f(y + 5 * s)}` : `M${f(x - 2 * s)} ${f(y + 6 * s)}L${f(x + 2 * s)} ${f(y + 6 * s)}`);
  // Head (face, hair): hair: short·long·bun·cap
  const head = (x, y, s, hair = "short", hc = "h") => {
    const r = 17 * s;
    let back = "", front = "";
    if (hair === "long") back = path(`${hc} o`, `M${f(x - r - 3 * s)} ${f(y + 22 * s)}Q${f(x - r - 6 * s)} ${f(y - r - 4 * s)} ${f(x)} ${f(y - r - 3 * s)}Q${f(x + r + 6 * s)} ${f(y - r - 4 * s)} ${f(x + r + 3 * s)} ${f(y + 22 * s)}Z`);
    if (hair === "bun") back = circ(`${hc} o`, x + r * 0.7, y - r * 0.9, 7 * s);
    front = path(`${hc} o`, `M${f(x - r)} ${f(y - 2 * s)}Q${f(x - r)} ${f(y - r - 3 * s)} ${f(x)} ${f(y - r - 2 * s)}Q${f(x + r)} ${f(y - r - 3 * s)} ${f(x + r)} ${f(y - 2 * s)}Q${f(x + 4 * s)} ${f(y - 9 * s)} ${f(x - r)} ${f(y - 2 * s)}Z`);
    if (hair === "cap") front = path("i o", `M${f(x - r - 2 * s)} ${f(y - 10 * s)}L${f(x)} ${f(y - r - 10 * s)}L${f(x + r + 2 * s)} ${f(y - 10 * s)}L${f(x)} ${f(y - 4 * s)}Z`) + path("i o", `M${f(x - 10 * s)} ${f(y - 8 * s)}L${f(x + 10 * s)} ${f(y - 8 * s)}L${f(x + 8 * s)} ${f(y - 14 * s)}L${f(x - 8 * s)} ${f(y - 14 * s)}Z`) + line(x + r + 2 * s, y - 10 * s, x + r + 3 * s, y + 4 * s);
    return back + circ("sk o", x, y, r) + front + face(x, y + 3 * s, s);
  };
  // Upper body — torso with rounded shoulders
  const torso = (x, y, w, h, c) => path(`${c} o`, `M${f(x - w / 2)} ${f(y + h)}Q${f(x - w / 2)} ${f(y)} ${f(x)} ${f(y)}Q${f(x + w / 2)} ${f(y)} ${f(x + w / 2)} ${f(y + h)}Z`);
  const bust = (x, y, s, hair, shirt, hc) => torso(x, y + 22 * s, 64 * s, 60 * s, shirt) + head(x, y, s, hair, hc);
  const hand = (x, y, s = 1) => circ("sk o", x, y, 6 * s);
  // Standing child (arm poses: up·wave·hold·walk)
  const kid = (x, y, s, o = {}) => {
    const { hair = "short", top = "w", bottom = "s", arms = "wave", shoe = "p" } = o;
    let g = "";
    const legL = arms === "walk" ? `M${f(x - 6 * s)} ${f(y + 78 * s)}L${f(x - 18 * s)} ${f(y + 122 * s)}` : `M${f(x - 7 * s)} ${f(y + 78 * s)}L${f(x - 9 * s)} ${f(y + 124 * s)}`;
    const legR = arms === "walk" ? `M${f(x + 6 * s)} ${f(y + 78 * s)}L${f(x + 20 * s)} ${f(y + 120 * s)}` : `M${f(x + 7 * s)} ${f(y + 78 * s)}L${f(x + 9 * s)} ${f(y + 124 * s)}`;
    g += path("o n", legL).replace('class="o n"', 'class="o n" style="stroke-width:' + f(11 * s) + '"');
    g += path("o n", legR).replace('class="o n"', 'class="o n" style="stroke-width:' + f(11 * s) + '"');
    g += ell(`${shoe} o`, x - (arms === "walk" ? 20 : 10) * s, y + 126 * s, 9 * s, 5 * s) + ell(`${shoe} o`, x + (arms === "walk" ? 23 : 11) * s, y + 123 * s, 9 * s, 5 * s);
    g += path(`${bottom} o`, `M${f(x - 16 * s)} ${f(y + 62 * s)}L${f(x + 16 * s)} ${f(y + 62 * s)}L${f(x + 19 * s)} ${f(y + 88 * s)}L${f(x - 19 * s)} ${f(y + 88 * s)}Z`);
    g += path(`${top} o`, `M${f(x - 17 * s)} ${f(y + 66 * s)}L${f(x - 15 * s)} ${f(y + 30 * s)}Q${f(x)} ${f(y + 24 * s)} ${f(x + 15 * s)} ${f(y + 30 * s)}L${f(x + 17 * s)} ${f(y + 66 * s)}Z`);
    const arm = (x1, y1, x2, y2) => path("o n", `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`).replace('class="o n"', `class="o n" style="stroke-width:${f(8 * s)}"`) + hand(x2, y2, s * 0.9);
    if (arms === "up") g += arm(x - 13 * s, y + 34 * s, x - 30 * s, y - 2 * s) + arm(x + 13 * s, y + 34 * s, x + 30 * s, y - 2 * s);
    else if (arms === "wave") g += arm(x - 13 * s, y + 34 * s, x - 22 * s, y + 62 * s) + arm(x + 13 * s, y + 34 * s, x + 32 * s, y + 8 * s);
    else if (arms === "hold") g += arm(x - 13 * s, y + 34 * s, x - 4 * s, y + 52 * s) + arm(x + 13 * s, y + 34 * s, x + 6 * s, y + 52 * s);
    else g += arm(x - 13 * s, y + 34 * s, x - 26 * s, y + 56 * s) + arm(x + 13 * s, y + 34 * s, x + 24 * s, y + 58 * s);
    return g + head(x, y + 8 * s, s, hair);
  };
  // Seated child (legs forward)
  const sitter = (x, y, s, o = {}) => {
    const { hair = "long", top = "p", bottom = "s" } = o;
    return path(`${bottom} o`, `M${f(x - 14 * s)} ${f(y + 66 * s)}L${f(x + 52 * s)} ${f(y + 66 * s)}L${f(x + 54 * s)} ${f(y + 84 * s)}L${f(x - 16 * s)} ${f(y + 84 * s)}Z`) +
      ell("y o", x + 60 * s, y + 80 * s, 10 * s, 6 * s) +
      path(`${top} o`, `M${f(x - 18 * s)} ${f(y + 72 * s)}L${f(x - 15 * s)} ${f(y + 30 * s)}Q${f(x)} ${f(y + 24 * s)} ${f(x + 15 * s)} ${f(y + 30 * s)}L${f(x + 18 * s)} ${f(y + 72 * s)}Z`) +
      path("o n", `M${f(x + 13 * s)} ${f(y + 36 * s)}L${f(x + 34 * s)} ${f(y + 22 * s)}`).replace('class="o n"', `class="o n" style="stroke-width:${f(8 * s)}"`) + hand(x + 36 * s, y + 20 * s, s * 0.9) +
      head(x, y + 8 * s, s, hair);
  };
  const book = (x, y, w, h, c = "s") => rect(`${c} o`, x, y, w, h, 2) + line(x + w * 0.2, y + h * 0.3, x + w * 0.8, y + h * 0.3);
  const flag = (x, y, c1, c2) => rect(`${c1} o`, x, y, 28, 18, 1) + rect(c2, x + 1, y + 7, 26, 4);
  const sparkle = (x, y, r, c = "y o") => path(c, `M${f(x)} ${f(y - r)}Q${f(x + r * 0.15)} ${f(y - r * 0.15)} ${f(x + r)} ${f(y)}Q${f(x + r * 0.15)} ${f(y + r * 0.15)} ${f(x)} ${f(y + r)}Q${f(x - r * 0.15)} ${f(y + r * 0.15)} ${f(x - r)} ${f(y)}Q${f(x - r * 0.15)} ${f(y - r * 0.15)} ${f(x)} ${f(y - r)}Z`);
  const plus = (x, y, r, c = "ls") => path(`o n ${c}`, `M${f(x - r)} ${f(y)}L${f(x + r)} ${f(y)}M${f(x)} ${f(y - r)}L${f(x)} ${f(y + r)}`);

  const D = {
    cloud: ["0 0 120 80", path("w o", "M16 72Q2 71 4 57Q6 44 20 46Q19 24 41 24Q48 8 67 13Q86 4 94 25Q113 25 112 46Q121 53 115 64Q110 72 100 72Z")],
    "cloud-blue": ["0 0 140 60", path("s o", "M18 54Q4 53 6 40Q8 28 22 30Q26 14 44 18Q52 4 70 10Q86 2 96 16Q114 12 120 28Q136 30 134 44Q132 54 118 54Z")],
    flower: ["0 0 60 60", path("p o", scallop(30, 30, 24, 5, 0.6)) + circ("y", 26, 28, 2.4) + circ("y", 33, 27, 2.4) + circ("y", 30, 34, 2.4)],
    "flower-w": ["0 0 60 60", path("w o", scallop(30, 30, 24, 5, 0.6)) + circ("y", 26, 28, 2.4) + circ("y", 33, 27, 2.4) + circ("y", 30, 34, 2.4)],
    "flower-y": ["0 0 60 60", path("ys o", scallop(30, 30, 24, 5, 0.6)) + circ("w", 26, 28, 2.4) + circ("w", 33, 27, 2.4) + circ("w", 30, 34, 2.4)],
    clover: ["0 0 40 70", path("o n", "M20 36Q22 52 18 68").replace('class="o n"', 'class="o n" style="stroke-width:2.4"') + [0, 90, 180, 270].map((r) => `<g transform="rotate(${r} 20 22)">${path("g o", "M20 22Q12 8 20 6Q28 8 20 22Z")}</g>`).join("")],
    daisy: ["0 0 44 78", path("o n", "M22 40Q20 58 24 76").replace('class="o n"', 'class="o n" style="stroke-width:2.4"') + path("g o", "M22 62Q10 54 8 60Q14 66 22 62Z") + path("w o", scallop(22, 22, 18, 9, 0.5)) + circ("y o", 22, 22, 6)],
    diamond: ["0 0 30 46", path("p o", "M15 2L28 23L15 44L2 23Z")],
    "diamond-o": ["0 0 30 46", path("w o", "M15 2L28 23L15 44L2 23Z")],
    star4: ["0 0 40 40", sparkle(20, 20, 18)],
    "star4-p": ["0 0 40 40", sparkle(20, 20, 18, "p o")],
    burst: ["0 0 50 50", path("y o", spikes(25, 25, 23, 14, 12))],
    heart: ["0 0 50 46", path("p o", "M25 42Q4 28 4 15Q4 4 15 4Q22 4 25 12Q28 4 35 4Q46 4 46 15Q46 28 25 42Z")],
    curl: ["0 0 50 40", path("o n ls", "M6 30Q2 14 16 10Q30 8 28 22Q26 32 18 26Q10 20 22 12Q34 4 44 16").replace('class="o n ls"', 'class="o n ls" style="stroke-width:4"')],
    bush: ["0 0 90 40", path("g o", "M4 38Q2 16 18 14Q24 2 38 8Q48 0 58 10Q72 4 78 18Q90 20 86 38Z")],
    squiggle: ["0 0 300 160", path("n ly", "M-20 150Q20 40 70 70Q110 95 80 130Q50 160 60 100Q72 30 140 40Q210 52 190 110Q176 150 150 120Q120 80 200 40Q250 16 310 60").replace('class="n ly"', 'class="n ly" style="stroke-width:24;stroke-linecap:round;opacity:.45"')],
    envelope: ["0 0 90 40", rect("w o", 4, 6, 40, 28, 2) + path("o n", "M4 8L24 22L44 8") + path("o n", "M52 18L58 18M64 16L70 16M76 18L84 22").replace('class="o n"', 'class="o n" style="stroke-dasharray:4 4"')],
    magnifier: ["0 0 130 140", path("o n", "M88 92L116 122").replace('class="o n"', 'class="o n" style="stroke-width:12"') + circ("w o", 56, 58, 44) + circ("n o ly", 56, 58, 38).replace('class="n o ly"', 'class="n o ly" style="stroke-width:9"') + rect("c o", 38, 48, 36, 28, 1) + path("ys o", "M34 50L56 34L78 50Z") + rect("g o", 52, 60, 8, 16, 4) + circ("y o", 108, 22, 10) + line(108, 4, 108, 0) + line(122, 12, 126, 9) + line(94, 12, 90, 9)],
    crest: ["0 0 40 40", path("ys o", scallop(20, 20, 17, 8, 0.45)) + circ("c o", 20, 20, 8) + circ("ys", 20, 20, 3)],
    chev: ["0 0 8 12", path("o n", "M2 2L6 6L2 10").replace('class="o n"', 'class="o n" style="stroke-width:2"')],
    "chev-l": ["0 0 8 12", path("o n", "M6 2L2 6L6 10").replace('class="o n"', 'class="o n" style="stroke-width:2"')],
    "chev-d": ["0 0 12 8", path("o n", "M2 2L6 6L10 2").replace('class="o n"', 'class="o n" style="stroke-width:1.6"')],
    ext: ["0 0 16 16", path("o n lp", "M12 9V13H3V4H7M9 3H13V7M13 3L7 9").replace('class="o n lp"', 'class="o n lp" style="stroke-width:1.4"')],
    "ext-w": ["0 0 16 16", path("n", "M12 9V13H3V4H7M9 3H13V7M13 3L7 9").replace('class="n"', 'class="n" style="stroke:var(--kf-surface);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"')],
    "i-doc": ["0 0 34 31", rect("w o", 8, 3, 18, 24, 2) + rect("w o", 4, 6, 18, 24, 2) + line(8, 12, 18, 12) + line(8, 17, 18, 17) + line(8, 22, 14, 22)],
    "i-oc": ["0 0 34 31", rect("w o", 5, 12, 24, 17, 1) + path("w o", "M3 13L17 4L31 13Z") + rect("w o", 13, 7, 8, 6, 1) + circ("g o", 17, 21, 3) + line(17, 24, 17, 29)],
    "i-pass": ["0 0 34 31", rect("ys o", 12, 3, 16, 22, 2) + rect("w o", 6, 7, 16, 22, 2) + line(10, 14, 18, 14) + line(10, 19, 18, 19)],
    "i-web": ["0 0 34 31", rect("w o", 6, 6, 22, 15, 2) + path("w o", "M3 25L31 25L28 21L6 21Z") + rect("ss", 9, 9, 16, 9, 1) + circ("p", 24, 12, 2)],
    "sns-ig": ["0 0 30 30", rect("p", 2, 2, 26, 26, 8) + rect("n", 7, 7, 16, 16, 5).replace('class="n"', 'class="n" style="stroke:var(--kf-surface);stroke-width:2.2"') + circ("n", 15, 15, 4).replace('class="n"', 'class="n" style="stroke:var(--kf-surface);stroke-width:2.2"') + circ("w", 20.5, 9.5, 1.3)],
    "sns-yt": ["0 0 30 30", rect("p", 1, 6, 28, 19, 6).replace('class="p"', 'style="fill:var(--kf-accent-text)"') + path("w", "M12 10.5L20 15.5L12 20.5Z")],
    "sns-x": ["0 0 30 30", path("o n", "M5 4L25 26M25 4L5 26").replace('class="o n"', 'class="o n" style="stroke-width:2.6"')],
    "sns-line": ["0 0 30 30", rect("g", 1, 1, 28, 28, 8) + path("w", "M15 7C9 7 5 10.5 5 14.6C5 18.3 8 21.3 12.4 22L12 25L17 21.8C21.6 21 25 18.2 25 14.6C25 10.5 21 7 15 7Z")],
    "sns-fb": ["0 0 30 30", circ("s", 15, 15, 14) + path("w", "M16.5 29V18H20L20.6 14H16.5V11.6C16.5 10.4 17 9.6 18.6 9.6H20.8V6.2C20.3 6.1 19 6 17.6 6C14.6 6 12.6 7.8 12.6 11.1V14H9.2V18H12.6V29Z")],
    "arrow-up": ["0 0 12 8", path("o n", "M2 6L6 2L10 6").replace('class="o n"', 'class="o n" style="stroke-width:2"')],
    // People — the kids in the original Hero, recommended section and footer (same spot, size, pose)
    "kid-tablet": ["0 0 120 190", kid(50, 30, 1, { arms: "wave", top: "g", bottom: "y", shoe: "p" }) + rect("ss o", 60, 34, 46, 30, 3)],
    "kid-camera": ["0 0 140 230", kid(70, 40, 1.1, { arms: "walk", top: "p", bottom: "s", shoe: "w", hair: "short" }) + rect("i o", 30, 74, 26, 18, 3) + circ("w o", 36, 83, 5)],
    "kid-walk": ["0 0 110 200", kid(55, 26, 1, { arms: "walk", top: "y", bottom: "ss", shoe: "w", hair: "long" }) + rect("ps o", 66, 70, 18, 22, 3)],
    "kid-cheer": ["0 0 110 150", kid(55, 26, 0.95, { arms: "up", top: "s", bottom: "ys", hair: "bun" })],
    "kid-cheer-2": ["0 0 110 150", kid(55, 26, 0.95, { arms: "up", top: "p", bottom: "w", hair: "short" })],
    "kid-sit": ["0 0 120 100", sitter(30, 6, 0.95, { top: "p", bottom: "s" }) + rect("y o", 6, 62, 22, 26, 6)],
    "kid-read": ["0 0 110 100", sitter(36, 6, 0.95, { top: "s", bottom: "ss", hair: "short" }) + book(70, 66, 26, 12, "y")],
    "kid-globe": ["0 0 150 130", circ("ss", 60, 70, 56).replace('class="ss"', 'class="ss" style="opacity:.6"') + bust(62, 36, 1.05, "short", "y") + circ("s o", 100, 84, 22) + path("g o", "M90 74Q100 70 106 80Q100 92 92 88Z") + book(24, 84, 26, 30, "p") + sparkle(18, 50, 6) + sparkle(120, 40, 5)],
    "boy-body": ["0 0 62 180", path("y o", "M8 104L10 40Q31 30 52 40L54 104Z") + path("ss o", "M12 104L50 104L48 168L34 168L31 120L28 168L14 168Z") + ell("w o", 20, 172, 11, 6) + ell("w o", 44, 172, 11, 6) + path("o n", "M12 46L4 92").replace('class="o n"', 'class="o n" style="stroke-width:8"') + path("o n", "M50 46L58 92").replace('class="o n"', 'class="o n" style="stroke-width:8"') + rect("ys o", 18, 50, 26, 30, 4)],
    "boy-face": ["0 0 26 28", circ("sk o", 13, 15, 12) + path("h o", "M1 13Q1 1 13 2Q25 1 25 13Q20 7 1 13Z") + circ("i", 9, 16, 1.2) + circ("i", 17, 16, 1.2) + path("o n", "M11 21L15 21")],
    "boy-face-smile": ["0 0 26 28", circ("sk o", 13, 15, 12) + path("h o", "M1 13Q1 1 13 2Q25 1 25 13Q20 7 1 13Z") + path("o n", "M7 16Q9 14 11 16M15 16Q17 14 19 16") + circ("p", 6, 19, 2) + circ("p", 20, 19, 2) + path("o n", "M10 21Q13 24 16 21")],
    // Number section graphic (scene on the sky panel)
    "sc-pie": ["0 0 300 225", path("y o", "M110 40A70 70 0 1 0 128 42L110 110Z") + path("s o", "M110 40L110 110L128 42A70 70 0 0 0 110 40Z") + path("o n", "M140 120L180 170").replace('class="o n"', 'class="o n" style="stroke-width:4"') + bust(210, 150, 1.2, "short", "w") + rect("w o", 190, 190, 40, 30, 2) + plus(256, 70, 6) + circ("ys o", 232, 104, 5) + path("g o", "M60 166L66 156L72 166Z") + plus(40, 110, 5)],
    "sc-city": ["0 0 300 225", rect("s o", 90, 40, 40, 120, 2) + rect("w o", 130, 70, 40, 90, 2) + rect("s o", 200, 30, 30, 130, 2) + rect("w o", 230, 60, 40, 100, 2) + [0, 1, 2, 3].map((i) => rect("w", 98, 52 + i * 22, 10, 8) + rect("w", 112, 52 + i * 22, 10, 8)).join("") + circ("p o", 50, 50, 12) + line(50, 62, 54, 90) + circ("p o", 270, 30, 10) + line(270, 40, 266, 66) + bust(60, 160, 1.1, "short", "g") + bust(240, 160, 1.1, "bun", "ys")],
    "sc-globe": ["0 0 300 225", flag(20, 20, "w", "ps") + flag(66, 14, "w", "p") + flag(112, 22, "ss", "p") + flag(158, 14, "w", "s") + flag(204, 22, "s", "w") + circ("s o", 90, 130, 44) + path("g o", "M66 112Q86 98 102 116Q96 140 74 136Z") + path("g o", "M106 146Q118 140 124 150Q116 162 106 156Z") + circ("w o", 150, 140, 26) + circ("n ly o", 150, 140, 22).replace('class="n ly o"', 'class="n ly o" style="stroke-width:6"') + line(168, 158, 184, 176) + bust(220, 140, 1.3, "long", "g") + sparkle(40, 90, 7) + plus(170, 70, 5)],
    "sc-teach": ["0 0 300 225", [0, 1, 2, 3, 4].map((i) => circ("s o", 60 + i * 44, 34, 9) + path("s o", `M${46 + i * 44} 64Q${46 + i * 44} 46 ${60 + i * 44} 46Q${74 + i * 44} 46 ${74 + i * 44} 64Z`)).join("") + rect("g o", 30, 90, 120, 80, 3) + rect("y o", 46, 150, 12, 10) + rect("y o", 62, 150, 12, 10) + line(150, 130, 120, 100) + bust(200, 150, 1.3, "long", "s", "y")],
    "sc-selfie": ["0 0 300 225", rect("w o", 50, 30, 46, 30, 4) + line(96, 50, 120, 90) + bust(140, 130, 1.4, "long", "ss", "y") + bust(220, 140, 1.2, "short", "s") + path("s o", "M230 30L262 46L254 54L226 40Z") + plus(270, 90, 5) + sparkle(40, 120, 7, "g o")],
    "sc-bed": ["0 0 300 225", rect("w o", 40, 140, 90, 50, 6) + path("s o", "M30 150Q40 112 90 118Q132 124 140 168L40 190Z") + rect("w o", 50, 120, 46, 18, 8) + kid(200, 70, 1.05, { arms: "hold", top: "ys", bottom: "ys", hair: "short" }) + circ("w o", 230, 46, 18) + path("o n", "M230 34L230 46L240 50") + sparkle(120, 50, 8, "p o") + sparkle(270, 110, 6, "g o")],
    "sc-tea": ["0 0 300 225", rect("s o", 80, 10, 140, 120, 3) + rect("ys o", 80, 10, 22, 120) + rect("ys o", 198, 10, 22, 120) + bust(150, 120, 1.5, "long", "ps") + rect("w o", 136, 170, 30, 24, 8) + path("o n", "M100 200L250 200") + ell("w o", 230, 186, 20, 14) + sparkle(60, 120, 7, "p o") + sparkle(260, 60, 7, "g o")],
    "sc-grads": ["0 0 300 225", bust(80, 130, 1.2, "cap", "i") + bust(150, 110, 1.35, "cap", "i") + bust(222, 130, 1.2, "cap", "i") + rect("s o", 120, 170, 40, 54, 2) + rect("s o", 210, 180, 34, 30, 2) + rect("s o", 40, 190, 36, 24, 2) + path("y o", spikes(130, 30, 10, 5, 8)) + path("ps o", spikes(190, 36, 9, 5, 8)) + sparkle(260, 40, 8, "s o") + sparkle(40, 50, 8, "g o")],
    "sc-books": ["0 0 300 225", bust(150, 120, 1.4, "short", "s") + rect("p o", 168, 30, 46, 14, 2) + rect("ys o", 160, 44, 56, 14, 2) + rect("g o", 166, 58, 50, 14, 2) + rect("y o", 158, 72, 58, 14, 2) + rect("s o", 164, 86, 50, 14, 2) + rect("ps o", 156, 100, 60, 14, 2) + circ("y o", 110, 40, 10) + rect("ys o", 60, 140, 26, 34, 2) + rect("ps o", 238, 160, 30, 22, 2)],
    "sc-school": ["0 0 380 270", rect("y o", 120, 70, 140, 120, 2) + path("y o", "M150 70L190 30L230 70Z") + circ("w o", 190, 56, 12) + path("o n", "M190 48L190 56L196 60") + [0, 1].map((r) => [0, 1, 2, 3].map((c) => rect("w o", 132 + c * 32, 90 + r * 36, 18, 14, 1)).join("")).join("") + rect("w o", 180, 160, 20, 30, 1) + bust(70, 160, 1.6, "short", "s") + bust(310, 160, 1.6, "short", "s") + path("g o", "M120 190Q130 176 146 186Q140 196 120 190Z") + path("g o", "M260 190Q248 176 234 186Q240 196 260 190Z") + sparkle(110, 40, 8) + sparkle(280, 40, 8) + path("w o", scallop(150, 50, 12, 6, 0.6)) + path("w o", scallop(240, 54, 12, 6, 0.6))],
    "sc-book-open": ["0 0 420 210", path("ps o", "M10 30Q110 6 210 30Q310 6 410 30L410 190Q310 168 210 192Q110 168 10 190Z") + path("w o", "M30 40Q120 22 200 42L200 176Q120 156 30 176Z") + path("w o", "M220 42Q300 22 390 40L390 176Q300 156 220 176Z") + line(210, 30, 210, 192)],
    "bust-read": ["0 0 200 170", bust(90, 60, 1.5, "long", "w") + path("ps o", "M50 120L92 110L92 160L50 168Z") + path("p o", "M92 110L134 120L134 168L92 160Z") + hand(54, 132) + hand(130, 132)],
    "bust-pencil": ["0 0 200 170", bust(110, 60, 1.5, "short", "g") + path("w o", "M40 30L64 18L120 130L96 142Z") + path("y o", "M96 142L120 130L112 152Z") + hand(100, 120) + rect("ss o", 92, 50, 14, 10, 4) + rect("ss o", 116, 50, 14, 10, 4) + path("y o", "M20 50L34 44L30 58Z") + path("y o", "M28 26L40 34L26 38Z")],
    "bust-draw": ["0 0 170 170", bust(85, 50, 1.4, "bun", "p", "y") + rect("w o", 40, 96, 90, 64, 3) + path("g o", "M48 150L76 120L96 140L108 128L124 150Z") + circ("y o", 108, 112, 8) + hand(44, 118) + hand(126, 118) + path("o n", "M24 120L36 70").replace('class="o n"', 'class="o n" style="stroke-width:4"') + sparkle(150, 40, 7) + sparkle(20, 40, 5)],
    "bust-mic": ["0 0 170 150", bust(90, 50, 1.4, "short", "s") + rect("ss o", 74, 40, 12, 9, 4) + rect("ss o", 92, 40, 12, 9, 4) + rect("i o", 54, 84, 12, 30, 5) + hand(60, 112) + path("w o", scallop(26, 22, 14, 6, 0.6))],
    "girl-peace": ["0 0 130 190", kid(65, 40, 1.05, { arms: "wave", top: "ps", bottom: "y", hair: "long", shoe: "w" }) + path("p o", "M40 66L52 60L58 110L36 112Z")],
    "badge-new": ["0 0 90 90", path("p o", spikes(45, 45, 42, 34, 14))],
    "pin": ["0 0 18 22", circ("y o", 9, 7, 6) + line(9, 13, 9, 21)]
  };
  const draw = (el) => {
    const d = D[el.dataset.d];
    if (!d || el.firstElementChild) return;
    el.innerHTML = `<svg viewBox="${d[0]}" aria-hidden="true" focusable="false">${d[1]}</svg>`;
  };
  window.mcDraw = (root = document) => root.querySelectorAll(".mc-d[data-d]").forEach(draw);
  const dd = (name, cls = "") => `<i class="mc-d ${cls}" data-d="${name}"></i>`;
  window.mcDoodle = dd;

  /* ── Shared frame fill ── */
  const page = document.body.dataset.page || "home";
  // If there is a fourth cell, it’s collapsible (original button + sub links, on press the chevron turns straight from 45° to −135°)
  const NAV = [
    ["TOP", "Hero", "index.html", "home"],
    ["OPEN DAY", "Open Campus", "event.html", "event", [["Open Campus Guide", "event.html"], ["Schedule", "event.html#schedule"], ["How to join", "event.html#howto"]]],
    ["CALENDAR", "Annual events", "#calendar", ""],
    ["MAGAZINE", "Magazine", "news.html", "news"],
    ["ABROAD", "Study abroad program", "#abroad", ""],
    ["ENTRY", "Admissions Info", "#", "", [["Application guide · Admissions schedule", "#"], ["Tuition Guide", "#"], ["Scholarship", "#"]]],
    ["NEWS", "Notice", "index.html#news", ""],
    ["ABOUT", "Faculties, Departments, Courses", "#faculty", "", "ext"],
    ["CONTACT", "Inquiry", "#contact", "", "ext"]
  ];
  const cur = (key) => (key === page || (page === "article" && key === "news") ? ' aria-current="page"' : "");
  const navList = () => `<ul class="mc-nav__list">${NAV.map(([en, ko, href, key, more], n) => Array.isArray(more)
    ? `<li class="mc-nav__fold"><button class="mc-nav__item is-n${n}" type="button" aria-expanded="false"${cur(key)}><b data-label="Menu English">${en}</b><span>${ko}</span></button><ul class="mc-nav__sub" hidden>${more.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></li>`
    : `<li><a class="mc-nav__item is-n${n}" href="${href}"${cur(key)}><b data-label="Menu English">${en}</b><span>${ko}</span>${more ? dd(more, "mc-nav__ext") : ""}</a></li>`).join("")}</ul>`;
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".mc-nav__fold > .mc-nav__item");
    if (!b) return;
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(open));
    b.nextElementSibling.hidden = !open;
  });
  const sns = () => `<div class="mc-sns">${["sns-ig", "sns-yt", "sns-x", "sns-line", "sns-fb"].map((n) => `<a href="#" aria-label="SNS">${dd(n)}</a>`).join("")}</div>`;
  const logo = () => `<a class="mc-logo" href="index.html" data-label="School logo — a sentence plus the School name (thin sans, wide letter spacing)">${dd("crest")}<span>Your school name here</span></a>`;
  const CTA = [["i-doc", "Request Materials"], ["i-oc", "Open Campus<br>Reservation"], ["i-pass", "Results announcement"], ["i-web", "Web filing"]];
  const cta = () => CTA.map(([i, t]) => `<a href="#"><span class="mc-cta__in">${dd(i)}<span>${t}</span></span></a>`).join("");
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { if (!el.children.length) el.innerHTML = html; });

  fill(".mc-navlist", navList());
  fill(".mc-snsrow", sns());
  fill(".mc-logoslot", logo());
    fill(".mc-nav", `${dd("cloud", "mc-nav__cl1")}${dd("cloud", "mc-nav__cl2")}<div class="mc-nav__card"><div class="mc-nav__brand"><span class="mc-wordmark" data-label="Site English wordmark (rounded bold letters · yellow outline)">SITE NAME</span><span class="mc-nav__sub">Info site for exam takers</span></div>${navList()}${sns()}</div>`);
  fill(".mc-head", `${logo()}<div class="mc-cta">${cta()}</div><button class="mc-ribbon mc-head__menu" type="button" data-menu-open aria-label="Menu"><i></i><b>menu</b></button>`);
  fill(".mc-sphead", `${logo()}<button class="mc-ribbon" type="button" data-menu-open aria-label="Menu"><i></i><b>menu</b></button>`);
  fill(".mc-splinks", cta());
  fill(".mc-menu", `<div class="mc-menu__veil" data-menu-close></div><div class="mc-menu__panel"><div class="mc-menu__top">${logo()}<button class="mc-menu__close mc-ribbon" type="button" data-menu-close aria-label="Close"><i></i><b>close</b></button></div>${navList()}<div class="mc-menu__cta"><a href="#">${dd("i-doc")}Request Materials</a><a href="#">${dd("i-oc")}Open Campus<br>Reservation</a></div>${dd("kid-read", "mc-menu__illust")}${sns()}</div>`);
  // Social feed section (first page·magazine) — the original also puts the same section at the end of both pages with the footer inside it
  fill(".mc-insta", `${dd("squiggle", "mc-insta__squig")}${dd("squiggle", "mc-insta__squig2")}
    <div class="mc-title"><span class="mc-tag" data-label="English tag">#sns</span><h2 class="mc-h2" data-label="SNS English name">Instagram</h2><p class="mc-lead">Get the latest news from the School!</p></div>
    <div class="mc-insta__grid">${["Talk photo · Instructor in a gray suit pointing at the screen · Indoor light", "Portrait photo · coach holding a rugby ball on a field · overcast day", "Lecture photo · speaker with hands together at the podium and the backs of audience heads · indoor light", "Classroom photo · students in tiered seats · fluorescent light", "Agreement ceremony photo · navy event sign and two people shaking hands", "Auditorium photo · speaker at the podium and many students from behind"].map((t) => `<span class="mc-ph" data-label="${t} · Square"></span>`).join("")}</div>
    <div class="mc-insta__more"><a class="mc-btn is-big is-ext" href="#">See more on social<span class="mc-btn__arrow"><i class="mc-d" data-d="ext-w"></i></span></a></div>
    <a class="mc-insta__banner" href="#"><span class="mc-ph" data-label="Event calendar banner · handwritten title over a cloud illustration on a sky-blue background, four circular event photos below · 345:130 wide"></span></a>
    <footer class="mc-foot" data-slot="footer"></footer>`);
  fill(".mc-foot", `${dd("kid-sit", "mc-foot__kid mc-foot__k1")}${dd("kid-read", "mc-foot__kid mc-foot__k2")}
    <div class="mc-totop fx-studio-appear-wait" data-slot="back-to-top" data-fx="studio-appear" data-fx-studio-appear="look: pop" style="--fx-lead: 0s; --fx-dur: .6s; --fx-ease: cubic-bezier(.19,1,.22,1); --fx-delay: .3s">${dd("boy-body", "mc-totop__boy")}${dd("boy-face", "mc-totop__face is-calm")}${dd("boy-face-smile", "mc-totop__face is-smile")}${dd("star4-p", "mc-totop__star is-1")}${dd("star4", "mc-totop__star is-2")}<button class="mc-totop__btn" type="button" data-totop>Back to TOP ${dd("arrow-up")}</button></div>
    <div class="mc-foot__ground">${dd("flower", "mc-foot__kid mc-foot__f1")}${dd("flower-w", "mc-foot__kid mc-foot__f2")}${dd("flower", "mc-foot__kid mc-foot__f3")}${dd("flower-w", "mc-foot__kid mc-foot__f4")}<a href="#">Privacy policy</a><small data-label="Copyright English single line">© 2026 University Name</small></div>`);
  window.mcDraw();

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = window.Motion;

  /* Original he(): scrolls with motion animate — default .5s easeInOut, stopping short by the header height */
  const headH = () => {
    const h = [...document.querySelectorAll(".mc-head, .mc-sphead")].find((x) => x.offsetParent !== null || getComputedStyle(x).position === "fixed" && getComputedStyle(x).display !== "none");
    return h ? h.getBoundingClientRect().height : 0;
  };
  window.mcScrollTo = (target, { duration = 0.5, offsetHeader = true } = {}) => {
    const to = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY - (offsetHeader ? headH() : 0);
    if (reduce || !M || !duration) { scrollTo(0, to); return; }
    M.animate(scrollY, to, { duration, ease: "easeInOut", onUpdate: (v) => scrollTo(0, v) });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!a) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    window.mcScrollTo(t);
  });

  /* Back to top — original footer Back to TOP: on hover face 1→0 (.1s) · smiling face 0→1 (.1s) · star1 0→1 (.3s) · star2 0→1 (.3s, .2s later), on release the three go to 0 in .3s and the face goes to 1 in .1s */
  document.querySelectorAll(".mc-totop").forEach((box) => {
    const btn = box.querySelector("[data-totop]");
    const calm = box.querySelector(".is-calm"), smile = box.querySelector(".is-smile"), s1 = box.querySelector(".is-1"), s2 = box.querySelector(".is-2");
    btn.addEventListener("click", () => window.mcScrollTo(0));
    if (!M) return;
    btn.addEventListener("mouseenter", () => M.animate([[calm, { opacity: [1, 0] }, { duration: 0.1 }], [smile, { opacity: [0, 1] }, { duration: 0.1, at: 0 }], [s1, { opacity: [0, 1] }, { duration: 0.3, at: 0 }], [s2, { opacity: [0, 1] }, { duration: 0.3, at: 0.2 }]]));
    btn.addEventListener("mouseleave", () => M.animate([[[smile, s1, s2], { opacity: 0 }, { duration: 0.3 }], [calm, { opacity: [0, 1] }, { duration: 0.1, at: 0 }]]));
  });

  /* When the footer is visible, hide the phone bottom button strip (original IntersectionObserver) */
  const bar = document.querySelector(".mc-splinks");
  if (bar) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { bar.style.opacity = en.isIntersecting ? "0" : ""; bar.style.visibility = en.isIntersecting ? "hidden" : ""; }));
    document.querySelectorAll(".mc-foot").forEach((ft) => io.observe(ft));
  }

  /* Menu modal, original showModal: on open, modal-ready on the next frame (400ms). On close, close after modal-closing 400ms */
  const dlg = document.querySelector(".mc-menu");
  if (dlg) {
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", () => {
      dlg.classList.remove("is-closing", "is-ready");
      dlg.showModal();
      requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add("is-ready")));
    }));
    const close = () => {
      if (!dlg.open) return;
      dlg.classList.remove("is-ready");
      dlg.classList.add("is-closing");
      setTimeout(() => { dlg.close(); dlg.classList.remove("is-closing"); }, reduce ? 0 : 400);
    };
    dlg.addEventListener("click", (e) => { if (e.target.closest("[data-menu-close]")) close(); });
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  }

  /* Embla prev/next buttons — original pn()/bc(): disabled when it can go no further */
  window.mcEmblaButtons = (api, prev, next) => {
    if (!api || !prev || !next) return;
    const sync = () => {
      api.canScrollPrev() ? prev.removeAttribute("disabled") : prev.setAttribute("disabled", "disabled");
      api.canScrollNext() ? next.removeAttribute("disabled") : next.setAttribute("disabled", "disabled");
    };
    prev.addEventListener("click", () => api.scrollPrev());
    next.addEventListener("click", () => api.scrollNext());
    api.on("select", sync).on("init", sync).on("reInit", sync);
    sync();
  };
})();
