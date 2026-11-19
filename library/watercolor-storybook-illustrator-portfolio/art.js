// The original builds a scene per section from watercolor images (PNG, animated WebP). Image files can’t be carried over, so SVGs of the same spot, size and texture are redrawn from a seed random number.
// All colors are classes (a-*) painted with variables shared.css builds from --kf-* — change the skin and the drawing changes too.
(() => {
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const f = (n) => Math.round(n * 10) / 10;
  const svg = (w, h, body, attrs = "") => `<svg viewBox="0 0 ${w} ${h}" ${attrs} aria-hidden="true" focusable="false">${body}</svg>`;
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  const LEAVES = ["a-l1", "a-l2", "a-l2", "a-l3", "a-l3", "a-l4", "a-l4", "a-l5"];
  const dab = (x, y, rx, ry, rot, cls) => `<ellipse class="${cls}" cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rot)} ${f(x)} ${f(y)})"/>`;

  // Watercolor leaf clump — scatter several horizontal brush strokes around a point
  function cluster(r, cx, cy, rad, n, size = 1, list = LEAVES) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad;
      out += dab(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, (9 + r() * 18) * size, (4 + r() * 7) * size, -25 + r() * 50, pick(r, list));
    }
    return out;
  }
  function trunk(x0, y0, x1, y1, w, bend) {
    const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2;
    return `<path class="a-trunk" d="M${f(x0 - w / 2)},${f(y0)} Q${f(mx - w / 3)},${f(my)} ${f(x1 - w / 5)},${f(y1)} L${f(x1 + w / 5)},${f(y1)} Q${f(mx + w / 3)},${f(my)} ${f(x0 + w / 2)},${f(y0)}Z"/>` +
      `<path class="a-trunk-hi" d="M${f(x0 + w / 8)},${f(y0)} Q${f(mx + w / 10)},${f(my)} ${f(x1 + w / 12)},${f(y1 + 40)} L${f(x1 + w / 6)},${f(y1 + 40)} Q${f(mx + w / 4)},${f(my)} ${f(x0 + w / 3)},${f(y0)}Z"/>`;
  }
  function branch(x0, y0, x1, y1, w) {
    return `<path class="a-branch" stroke-width="${w}" d="M${f(x0)},${f(y0)} Q${f((x0 + x1) / 2)},${f(Math.min(y0, y1) - 20)} ${f(x1)},${f(y1)}"/>`;
  }

  // Forests on both sides of the hero (original 629×1001 · 625×1032) — center sky left empty, denser toward the outside
  function forest(seed, w, h) {
    const r = rng(seed);
    let back = "", body = "", front = "";
    const trunks = [[w * 0.12, w * 0.2, 46], [w * 0.36, w * 0.28, 34], [w * 0.62, w * 0.55, 24]];
    for (const [bx, tx, tw] of trunks) {
      body += trunk(bx, h + 10, tx, -20, tw, (r() - 0.5) * 80);
      for (let k = 0; k < 4; k++) {
        const y = h * (0.15 + k * 0.2 + r() * 0.08), x = bx + (tx - bx) * (1 - y / h);
        body += branch(x, y, x + (r() < 0.5 ? -1 : 1) * (60 + r() * 90), y - 30 - r() * 60, 6 + r() * 5);
      }
    }
    for (let i = 0; i < 46; i++) {
      const x = w * 0.78 * Math.pow(r(), 1.25), y = r() * h * 0.95;
      const c = cluster(r, x, y, 40 + r() * 50, 16 + Math.floor(r() * 12), 0.9 + r() * 0.5);
      if (i % 3 === 0) back += c; else front += c;
    }
    return svg(w, h, `<g opacity=".92">${back}</g>${body}${front}`, 'preserveAspectRatio="xMinYMin slice"');
  }

  // Cloud — overlapping round lumps. Edges bleed into sky blue like the original
  function cloud(seed, w, h) {
    const r = rng(seed);
    let edge = "", core = "";
    const n = 6 + Math.floor(w / 60), band = Math.min(h, w * 0.22);
    for (let i = 0; i < n; i++) {
      const x = w * (0.08 + 0.84 * (i / (n - 1))) + (r() - 0.5) * 20, y = h * 0.55 + (r() - 0.5) * band * 0.3;
      const rx = w / n * (0.9 + r() * 0.7), ry = band * (0.28 + r() * 0.22);
      edge += `<ellipse class="a-cloud-edge" cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}"/>`;
      core += `<ellipse class="a-cloud" cx="${f(x - 3)}" cy="${f(y - 3)}" rx="${f(rx * 0.86)}" ry="${f(ry * 0.8)}"/>`;
    }
    return svg(w, h, edge + core, 'preserveAspectRatio="none"');
  }

  // A tuft of grass — from the root point outward (ang)
  function tuft(r, x, y, ang, len, n, list = ["a-l2", "a-l3", "a-l4", "a-l5", "a-l1"]) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = ang + (r() - 0.5) * 1.3, l = len * (0.5 + r() * 0.7), bw = 2 + r() * 2.5;
      const tx = x + Math.cos(a) * l, ty = y + Math.sin(a) * l;
      const nx = -Math.sin(a) * bw, ny = Math.cos(a) * bw;
      const mx = x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 6, my = y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 6;
      out += `<path class="${pick(r, list)}" d="M${f(x + nx)},${f(y + ny)} Q${f(mx + nx)},${f(my + ny)} ${f(tx)},${f(ty)} Q${f(mx - nx)},${f(my - ny)} ${f(x - nx)},${f(y - ny)}Z"/>`;
      if (r() < 0.08) out += dab(tx, ty, 4, 2.4, (a * 180) / Math.PI, "a-flower");
    }
    return out;
  }

  // Rotating grass hill (original 2701×2681 disc) — grass, bushes and flowers are set around it and pass by as it turns
  function disc() {
    const r = rng(11), R = 500;
    let rim = "", bush = "";
    for (let d = 0; d < 360; d += 1.2) {
      const a = (d * Math.PI) / 180, x = Math.cos(a) * (R - 4), y = Math.sin(a) * (R - 4);
      rim += tuft(r, x, y, a, 14 + r() * 22, 4);
    }
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2, x = Math.cos(a) * (R + 14), y = Math.sin(a) * (R + 14);
      bush += cluster(r, x, y, 18 + r() * 16, 18, 0.55);
      if (i % 4 === 0) bush += tuft(r, x, y, a, 60, 9, ["a-l4", "a-l5", "a-l3"]);
    }
    return svg(1100, 1100, `<g transform="translate(550 550)"><circle class="a-ground" r="${R}"/>${rim}${bush}</g>`);
  }

  // Person — silhouette proportions of the original hand-drawn figure (big head, short legs). Hip spot (x,y), size s, leg angle leg, arm angle arm
  function kid(x, y, s, { leg = 0, arm = 0, armUp = false, bob = 0, flip = false, shirt = "a-shirt", pants = "a-pants" } = {}) {
    const k = (n) => f(n * s);
    const limb = (cls, ang, len, wid, ox, oy) => `<g transform="translate(${k(ox)} ${k(oy)}) rotate(${f(ang)})"><rect class="${cls}" x="${k(-wid / 2)}" y="0" width="${k(wid)}" height="${k(len)}" rx="${k(wid / 2)}"/></g>`;
    const foot = (ang, ox, oy, len) => `<g transform="translate(${k(ox)} ${k(oy)}) rotate(${f(ang)})"><ellipse class="a-shoe" cx="${k(6)}" cy="${k(len)}" rx="${k(12)}" ry="${k(6)}"/></g>`;
    const body =
      limb(pants, -leg, 70, 22, -4, 0) + foot(-leg, -4, 0, 70) +
      limb("a-sleeve", arm, 52, 15, 4, -78) +
      `<rect class="${shirt}" x="${k(-22)}" y="${k(-96)}" width="${k(46)}" height="${k(100)}" rx="${k(16)}"/>` +
      `<path class="a-bag" stroke-width="${k(5)}" d="M${k(-16)},${k(-90)} L${k(16)},${k(-20)}"/><rect class="a-bag-fill" x="${k(4)}" y="${k(-28)}" width="${k(30)}" height="${k(24)}" rx="${k(5)}"/>` +
      limb(pants, leg, 70, 22, 4, 0) + foot(leg, 4, 0, 70) +
      (armUp ? limb("a-sleeve", 160, 56, 15, -6, -82) : limb("a-sleeve", -arm, 52, 15, -6, -80)) +
      `<circle class="a-skin" cx="${k(2)}" cy="${k(-124)}" r="${k(28)}"/>` +
      `<path class="a-hair" d="M${k(-28)},${k(-118)} C${k(-34)},${k(-160)} ${k(14)},${k(-170)} ${k(30)},${k(-140)} C${k(20)},${k(-142)} ${k(8)},${k(-136)} ${k(-2)},${k(-128)} C${k(-10)},${k(-120)} ${k(-14)},${k(-104)} ${k(-28)},${k(-118)}Z"/>` +
      `<circle class="a-ink" cx="${k(18)}" cy="${k(-122)}" r="${k(2.6)}"/>`;
    return `<g transform="translate(${f(x)} ${f(y - bob)})${flip ? " scale(-1 1)" : ""}">${body}</g>`;
  }

  // Walking child (original 320×386, 8 frames per 1s) — the fern bush behind is fixed, only the child changes per frame
  function walker() {
    const r = rng(5);
    let fern = "";
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2;
      fern += tuft(r, 150 + (r() - 0.5) * 120, 372, a, 120 + r() * 120, 3, ["a-l4", "a-l5", "a-l3", "a-l2"]);
    }
    let frames = "";
    for (let i = 0; i < 8; i++) {
      const p = (i / 8) * Math.PI * 2;
      frames += `<g data-fx-part="frame">${kid(176, 268, 1.25, { leg: Math.sin(p) * 26, arm: Math.sin(p) * 22, bob: Math.abs(Math.cos(p)) * 5 })}</g>`;
    }
    return svg(320, 386, `<g>${fern}</g>${frames}`);
  }

  function squiggle() {
    return svg(88, 24, `<path class="a-stroke-dark" stroke-width="3" d="M3,20 C14,4 22,4 18,16 C24,4 34,4 30,16 C36,4 46,4 42,16 C52,10 70,8 86,14"/>`);
  }

  // About section grass pattern (original 1214×1226) — scattered grass doodles and yellow grass clumps
  function introGround() {
    const r = rng(23);
    let out = "";
    for (let i = 0; i < 9; i++) {
      const x = 80 + r() * 1060, y = 60 + r() * 1100;
      out += `<path class="a-stroke-dark" stroke-width="5" d="M${f(x)},${f(y)} c12,-18 22,-18 16,0 c12,-18 22,-18 16,0 c12,-18 22,-18 16,0 c14,-4 26,-4 34,0"/>`;
    }
    for (let i = 0; i < 7; i++) {
      const x = 100 + r() * 1000, y = 60 + r() * 1100;
      out += `<ellipse class="a-l2" cx="${f(x)}" cy="${f(y)}" rx="40" ry="26"/>` + cluster(r, x, y, 14, 8, 0.7, ["a-l5", "a-l5", "a-l4"]);
    }
    return svg(1214, 1226, out);
  }

  // Forest shadows (original 780×859 and 783×1279) — blurry dark green masses
  function shadow(seed, w, h) {
    const r = rng(seed);
    let out = "";
    for (let i = 0; i < 14; i++) out += `<ellipse cx="${f(w * (0.2 + r() * 0.6))}" cy="${f(h * (0.1 + r() * 0.8))}" rx="${f(w * (0.12 + r() * 0.2))}" ry="${f(h * (0.1 + r() * 0.12))}"/>`;
    return svg(w, h, `<defs><filter id="ts-blur-${seed}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="28"/></filter></defs><g class="a-shade" filter="url(#ts-blur-${seed})">${out}</g>`);
  }

  // Letter envelope (original 375×348) — open envelope, glue along the edges
  function envelope(seed = 31, w = 375, h = 348) {
    const r = rng(seed);
    let grass = "";
    const pts = [[40, 120], [188, 18], [336, 120], [336, 330], [40, 330]];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
      for (let t = 0; t < 1; t += 0.06) grass += tuft(r, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2 + Math.PI, 18, 3);
    }
    return svg(w, h,
      `<path class="a-paper-blue" d="M40,120 L188,18 L336,120 L336,330 L40,330Z"/>` +
      `<path class="a-env-inner" d="M58,130 L188,40 L318,130 L188,214Z"/>` +
      `<path class="a-paper" d="M40,330 L188,214 L336,330Z"/><path class="a-paper-2" d="M40,124 L188,226 L40,330Z"/><path class="a-paper-2" d="M336,124 L188,226 L336,330Z"/>` +
      `<path class="a-stroke-sky" stroke-width="5" d="M58,130 L188,214 L318,130"/>` + grass);
  }

  // Rounded meadow edge below the About section (original 1623×350) — a downward-convex half moon with grass hanging from the edge
  function introBottom() {
    const r = rng(41);
    let fringe = "";
    for (let t = 0.02; t < 0.98; t += 0.008) {
      const x = 1623 * t, y = 30 + Math.sin(Math.PI * t) * 300;
      const a = Math.atan2(Math.cos(Math.PI * t) * 300 * Math.PI, 1623) + Math.PI / 2;
      fringe += tuft(r, x, y - 4, a, 18 + r() * 26, 3);
    }
    for (let i = 0; i < 4; i++) {
      const t = 0.1 + r() * 0.8;
      fringe += cluster(r, 1623 * t, 40 + Math.sin(Math.PI * t) * 300, 26, 16, 0.6);
    }
    return svg(1623, 350, `<path class="a-ground-deep" d="M0,0 L1623,0 L1623,30 Q811,630 0,30Z"/>${fringe}`, 'preserveAspectRatio="none"');
  }

  // Window (original 1200×465, 28 frames at 1.18s — nine curtain poses at 3 frames each) — sea and forest inside a wooden window frame, curtains billowing in the wind on both sides
  function windowCurtain() {
    const r = rng(53);
    let land = "";
    for (let i = 0; i < 70; i++) land += dab(480 + r() * 240, 330 + r() * 135, 12 + r() * 14, 6 + r() * 6, -20 + r() * 40, pick(r, LEAVES));
    let frames = "";
    for (let i = 0; i < 9; i++) {
      const p = (i / 9) * Math.PI * 2, s = Math.sin(p), c = Math.cos(p);
      // The original curtain bulges close to 400px to each side from the window’s top corners and drops down to 2/3 of the window height
      const L = `M478,4 C${f(380 + s * 20)},${f(10 + c * 8)} ${f(160 + s * 30)},${f(40 + c * 20)} ${f(60 + s * 26)},${f(170 + c * 16)} C${f(80 + s * 18)},${f(250 + c * 14)} ${f(200 - s * 12)},${f(300 + s * 16)} ${f(300 + c * 12)},${f(270 + s * 10)} C${f(380 + s * 8)},${f(330 + c * 8)} ${f(440)},${f(320)} 466,300 C${f(470)},${f(200)} ${f(474)},${f(100)} 478,4Z`;
      const R = `M722,4 C${f(820 - s * 20)},${f(10 - c * 8)} ${f(1040 - s * 30)},${f(40 - c * 20)} ${f(1140 - s * 26)},${f(170 - c * 16)} C${f(1120 - s * 18)},${f(250 - c * 14)} ${f(1000 + s * 12)},${f(300 - s * 16)} ${f(900 - c * 12)},${f(270 - s * 10)} C${f(820 - s * 8)},${f(330 - c * 8)} 760,320 734,300 C730,200 726,100 722,4Z`;
      frames += `<g data-fx-part="frame"><path class="a-curtain" d="${L}"/><path class="a-curtain" d="${R}"/><path class="a-curtain-fold" stroke-width="4" d="M470,40 C${f(380 + s * 20)},${f(120 + c * 10)} ${f(260 + s * 20)},${f(170)} ${f(190 + s * 20)},${f(170 + c * 10)}"/><path class="a-curtain-fold" stroke-width="4" d="M730,40 C${f(820 - s * 20)},${f(120 - c * 10)} ${f(940 - s * 20)},170 ${f(1010 - s * 20)},${f(170 - c * 10)}"/></g>`;
    }
    return svg(1200, 465,
      `<rect class="a-wood" x="430" y="0" width="340" height="465"/><rect class="a-wood-hi" x="430" y="0" width="340" height="40"/><rect class="a-wood-yellow" x="470" y="40" width="260" height="12"/>` +
      `<rect class="a-window-sky" x="482" y="52" width="236" height="250"/><rect class="a-sea" x="482" y="292" width="236" height="38"/><rect class="a-l3" x="482" y="330" width="236" height="135"/>${land}` +
      `<rect class="a-wood-yellow" x="470" y="40" width="12" height="425"/><rect class="a-wood-yellow" x="718" y="40" width="12" height="425"/>` + frames);
  }

  // Windowsill strip (original 1810×177 repeated at 60px height) — yellow top line, red wood grain, dark bottom edge
  function sill() {
    return svg(1440, 60,
      `<defs><pattern id="ts-sill" width="181" height="60" patternUnits="userSpaceOnUse"><rect class="a-wood-yellow" width="181" height="60"/><rect class="a-wood" y="6" width="181" height="44"/>` +
      `<path class="a-wood-hi" d="M0,18 C30,10 60,26 90,16 C120,8 150,24 181,18 L181,26 C150,32 120,16 90,24 C60,34 30,18 0,26Z"/><path class="a-wood-hi" d="M0,36 C40,30 70,44 110,36 C140,30 160,40 181,36 L181,42 C160,46 140,36 110,42 C70,50 40,36 0,42Z"/><rect class="a-wood-dark" y="48" width="181" height="12"/></pattern></defs>` +
      `<rect fill="url(#ts-sill)" width="1440" height="60"/>`, 'preserveAspectRatio="none"');
  }

  // Desk scene — a face peeking out (original 636×512, blinks every 4 seconds), the left arm (757×209), the right arm holding a brush (1106×472), four stones
  function face(w = 636, h = 512, blink = true) {
    const eyes = blink
      ? `<g class="ts-blink-open"><ellipse class="a-white" cx="412" cy="372" rx="34" ry="20"/><circle class="a-ink" cx="420" cy="374" r="12"/></g><path class="ts-blink-shut a-stroke-ink" stroke-width="6" d="M380,372 Q412,388 446,370"/>`
      : `<ellipse class="a-white" cx="412" cy="372" rx="34" ry="20"/><circle class="a-ink" cx="420" cy="374" r="12"/>`;
    return svg(w, h,
      `<ellipse class="a-skin" cx="330" cy="330" rx="210" ry="170"/><ellipse class="a-skin-dark" cx="190" cy="340" rx="56" ry="74"/><ellipse class="a-cheek" cx="300" cy="420" rx="60" ry="34"/>` +
      `<path class="a-hair" d="M100,300 C80,150 220,40 360,60 C470,70 560,140 580,250 C520,200 470,220 430,180 C420,240 360,250 320,210 C300,260 230,250 200,300 C170,280 140,300 100,300Z"/>` +
      `<path class="a-hair-hi" stroke-width="10" d="M200,150 C260,120 300,130 340,110 M380,140 C430,130 470,150 500,170"/>` +
      `<path class="a-stroke-ink" stroke-width="7" d="M370,330 Q410,316 450,330"/>` + eyes);
  }
  function arm(w, h, { hand, brush = false } = {}) {
    return svg(w, h,
      `<path class="a-sleeve" d="${hand.sleeve}"/><path class="a-sleeve-hi" d="${hand.sleeveHi}"/><path class="a-skin-hand" d="${hand.palm}"/>` +
      (brush ? `<path class="a-stroke-ink" stroke-width="16" d="${hand.brush}"/><path class="a-stroke-wood" stroke-width="8" d="${hand.tip}"/>` : ""));
  }
  const ARM_LEFT = { sleeve: "M0,60 C200,40 420,40 560,70 L590,190 C420,170 200,180 0,200Z", sleeveHi: "M40,70 C200,58 380,58 520,80 L524,96 C380,80 200,80 40,92Z", palm: "M560,66 C620,40 700,60 750,120 C730,140 700,130 690,120 C700,160 680,190 640,200 L590,192Z" };
  const ARM_RIGHT = {
    sleeve: "M0,180 C120,170 200,290 300,380 C420,430 560,420 660,400 L700,460 C520,480 320,480 180,420 C80,370 30,280 0,260Z",
    sleeveHi: "M20,200 C120,200 200,300 300,390 C360,410 420,414 480,412 L480,424 C400,430 320,420 280,400 C200,330 120,230 20,220Z",
    palm: "M660,300 C720,270 800,280 840,320 C860,370 840,440 760,470 L680,462 C660,420 650,350 660,300Z",
    brush: "M600,330 L1080,120", tip: "M540,356 L610,326",
  };
  function stone(seed, w, h) {
    const r = rng(seed);
    let bands = "";
    for (let i = 1; i < 5; i++) bands += `<path class="${i % 2 ? "a-stone-band" : "a-stone-band-2"}" stroke-width="${f(3 + r() * 4)}" d="M${f(w * 0.12)},${f(h * (0.2 + i * 0.13))} Q${f(w * 0.5)},${f(h * (0.1 + i * 0.13) + (r() - 0.5) * 20)} ${f(w * 0.9)},${f(h * (0.24 + i * 0.13))}"/>`;
    return svg(w, h, `<ellipse class="a-stone" cx="${w / 2}" cy="${h / 2}" rx="${f(w * 0.46)}" ry="${f(h * 0.42)}"/>${bands}`);
  }

  // Work section characters, three (original 238×156 flying kid and blue blob · 86×141 waving kid · 224×64 two running on grass)
  const flyer = () => svg(238, 156, `<g transform="rotate(-24 70 80)">${kid(70, 104, 0.42, { leg: 22, armUp: true })}</g><ellipse class="a-blob-blue" cx="176" cy="96" rx="58" ry="38" transform="rotate(-24 176 96)"/>`);
  const waver = () => svg(86, 141, kid(46, 104, 0.4, { armUp: true, leg: 6 }));
  const runners = () => svg(224, 64, kid(70, 44, 0.2, { leg: 38, arm: 40 }) + kid(150, 44, 0.2, { leg: 40, arm: 44, shirt: "a-sleeve" }));
  const lyingKids = () => svg(384, 115, `<g transform="rotate(90 120 70)">${kid(120, 70, 0.3, { leg: 10 })}</g><g transform="rotate(-90 270 60)">${kid(270, 60, 0.3, { leg: 14, shirt: "a-sleeve" })}</g>`);

  // Pigeon (original 96×144) · clamp (196×210) · shop basket (190×217) · logo face (214×182)
  const pigeon = () => svg(96, 144, `<ellipse class="a-stone" cx="48" cy="84" rx="30" ry="46" transform="rotate(14 48 84)"/><path class="a-flower" d="M30,70 C44,60 62,70 66,96 C54,104 38,96 30,70Z"/><circle class="a-stone" cx="50" cy="28" r="16"/><path class="a-bag" stroke-width="5" d="M40,128 L30,142 M56,128 L60,142"/>`);
  const clip = () => svg(196, 210, `<path class="a-stroke-accent" stroke-width="10" d="M40,200 L40,90 C40,60 80,60 80,90 L80,200 M116,200 L116,90 C116,60 156,60 156,90 L156,200"/><path class="a-clip" d="M20,120 L176,120 L160,200 L36,200Z"/>`);
  function basket() {
    const r = rng(71);
    let weave = "";
    for (let y = 120; y < 196; y += 12) weave += `<path class="a-stroke-wood" stroke-width="5" d="M28,${y} Q95,${y + 10} 162,${y}"/>`;
    return svg(190, 217, `<ellipse class="a-blob-blue" cx="95" cy="200" rx="80" ry="14"/><path class="a-wood" d="M20,112 L170,112 L150,196 L40,196Z"/>${weave}` + kid(118, 108, 0.32, { armUp: true, leg: 0 }) + cluster(r, 60, 110, 20, 10, 0.5) +
      `<path class="a-stroke-white" stroke-width="3" d="M20,212 C40,196 60,214 80,200 C100,214 120,198 150,210"/>`);
  }
  const logoFace = () => svg(214, 182, `<g transform="translate(-30 -20) scale(.42)">${face(636, 512, false).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`);

  // Footer — cloud band (original 1454×209), round hill head (1589×257), three yellow grass tufts
  function footerClouds() {
    const inner = (s, x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}">${cloud(s, w, h).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`;
    return svg(1454, 209, inner(81, 40, 30, 440, 90) + inner(82, 1100, 70, 170, 46) + inner(83, 1240, 10, 210, 56) + inner(84, 0, 150, 220, 50), 'preserveAspectRatio="xMidYMin meet"');
  }
  function footerHill() {
    const r = rng(91);
    let rim = "";
    for (let t = 0.03; t < 0.97; t += 0.006) {
      const x = 1589 * t, y = 257 - Math.sin(Math.PI * t) * 210;
      rim += tuft(r, x, y + 6, -Math.PI / 2 + (t - 0.5) * 1.6, 16 + r() * 22, 3);
    }
    for (let i = 0; i < 6; i++) {
      const t = i < 3 ? 0.05 + r() * 0.2 : 0.75 + r() * 0.2;
      rim += cluster(r, 1589 * t, 257 - Math.sin(Math.PI * t) * 210 - 10, 30, 22, 0.7);
    }
    rim += cluster(r, 1589 * 0.48, 257 - 210 - 10, 50, 40, 0.8);
    return svg(1589, 257, `<path class="a-ground" d="M0,257 Q794,-163 1589,257Z"/>${rim}`);
  }
  const land = (seed) => {
    const r = rng(seed);
    return svg(132, 50, `<ellipse class="a-l1" cx="66" cy="26" rx="62" ry="22"/><ellipse class="a-l4" cx="66" cy="25" rx="56" ry="18"/>` + cluster(r, 66, 26, 20, 10, 0.5, ["a-l5", "a-l5", "a-l3"]));
  };
  const insta = () => svg(38, 38, `<rect class="a-stroke-white" stroke-width="3.4" x="2" y="2" width="34" height="34" rx="10"/><circle class="a-stroke-white" stroke-width="3.4" cx="19" cy="19" r="8"/><circle class="a-white" cx="29" cy="9" r="2.4"/>`);

  // Subpage header: tree on the right (original 221×347) and cloud band (1473×306)
  function headTree() {
    const r = rng(101);
    let leaves = "";
    for (let i = 0; i < 10; i++) leaves += cluster(r, 30 + r() * 180, 20 + r() * 280, 40, 16, 0.8);
    return svg(221, 347, trunk(150, 360, 130, -10, 26, 20) + leaves, 'preserveAspectRatio="xMaxYMin slice"');
  }
  function headClouds() {
    const inner = (s, x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}">${cloud(s, w, h).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`;
    return svg(1473, 306, inner(111, 60, 70, 330, 80) + inner(112, 640, 150, 300, 60) + inner(113, 330, 230, 220, 50), 'preserveAspectRatio="xMidYMid meet"');
  }

  // About page arch window (original 1150×1864) — sea and forest inside a yellow arch frame, a person seen from behind looking out the window
  function archWindow() {
    const r = rng(121);
    let land = "";
    for (let i = 0; i < 120; i++) land += dab(260 + r() * 640, 1000 + r() * 560, 20 + r() * 26, 10 + r() * 10, -20 + r() * 40, pick(r, LEAVES));
    return svg(1150, 1864,
      `<path class="a-wood" d="M180,1864 L180,520 A395,395 0 0 1 970,520 L970,1864Z"/>` +
      `<path class="a-window-sky" d="M240,1860 L240,540 A335,335 0 0 1 910,540 L910,1860Z"/><rect class="a-sea" x="240" y="900" width="670" height="110"/>${land}` +
      `<path class="a-wood-yellow" d="M210,1864 L210,530 A365,365 0 0 1 940,530 L940,1864 L910,1864 L910,540 A335,335 0 0 0 240,540 L240,1864Z"/><rect class="a-wood-yellow" x="560" y="200" width="30" height="1664"/><rect class="a-wood-yellow" x="240" y="700" width="670" height="26"/>` +
      `<rect class="a-wood-dark" x="120" y="1780" width="910" height="84"/>` +
      `<ellipse class="a-sleeve" cx="760" cy="1720" rx="190" ry="150"/><circle class="a-skin" cx="770" cy="1500" r="110"/><path class="a-hair" d="M650,1500 C640,1380 760,1330 860,1380 C900,1420 890,1490 880,1520 C840,1470 780,1480 730,1460 C700,1500 680,1520 650,1500Z"/>`);
  }
  const aboutCloud = () => cloud(131, 1343, 602);

  const ART = {
    "forest-left": () => forest(1, 629, 1001), "forest-right": () => forest(2, 625, 1032),
    "kv-cloud-1": () => cloud(3, 243, 70), "kv-cloud-2": () => cloud(4, 646, 469), "kv-cloud-3": () => cloud(6, 642, 133), "kv-cloud-4": () => cloud(7, 421, 97), "kv-cloud-5": () => cloud(8, 208, 55),
    disc, walker, squiggle, "intro-ground": introGround, "shadow-left": () => shadow(21, 780, 859), "shadow-right": () => shadow(22, 783, 1279),
    envelope: () => envelope(), "intro-bottom": introBottom, "sky-cloud-1": () => cloud(61, 900, 200), "sky-cloud-2": () => cloud(62, 700, 240), "sky-cloud-3": () => cloud(63, 560, 120),
    "window-curtain": windowCurtain, sill, face: () => face(), "arm-left": () => arm(757, 209, { hand: ARM_LEFT }), "arm-right": () => arm(1106, 472, { hand: ARM_RIGHT, brush: true }),
    "stone-1": () => stone(141, 270, 239), "stone-2": () => stone(142, 129, 98), "stone-3": () => stone(143, 67, 69), "stone-4": () => stone(144, 163, 134),
    flyer, waver, runners, "lying-kids": lyingKids, pigeon, clip, basket, "logo-face": logoFace,
    "footer-clouds": footerClouds, "footer-hill": footerHill, "land-1": () => land(151), "land-2": () => land(152), "land-3": () => land(153), insta,
    "head-tree": headTree, "head-clouds": headClouds, "arch-window": archWindow, "about-cloud": aboutCloud,
  };
  window.tsArt = (root = document, pick) => {
    root.querySelectorAll("[data-art]:not([data-art-done])").forEach((el) => {
      const make = ART[el.dataset.art];
      if (!make || (pick && !pick(el))) return;
      el.insertAdjacentHTML("afterbegin", make());
      el.setAttribute("data-art-done", "");
    });
  };
})();
