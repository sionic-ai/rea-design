// A new set redrawn in the same bold-outline flat illustration style for the spots where the original speaks in pictures (school building, strawberry, flowers, rainbow, people).
// The page <svg><use href="#i-Name"></svg> Pulled out and used as is — people are made many by changing only outfit color, pose and held item with figure().
(() => {
  const L = "var(--site-ill-line)";
  const sw = 'stroke="' + L + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';

  // Thick limbs: stroked once in the outline color, then once in the skin color on top, so they look like tubes with a border
  const limb = (d, color, w) =>
    `<path d="${d}" fill="none" stroke="${L}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

  const held = {
    mug: (x, y) => `<use href="#i-mug" x="${x - 26}" y="${y - 58}" width="52" height="64"/>`,
    cup: (x, y) => `<use href="#i-cup" x="${x - 22}" y="${y - 30}" width="46" height="34"/>`,
    cone: (x, y) => `<use href="#i-cone" x="${x - 14}" y="${y - 62}" width="28" height="66"/>`,
    berry: (x, y) => `<use href="#i-basket" x="${x - 30}" y="${y - 40}" width="60" height="48"/>`,
    flag: (x, y) => `<use href="#i-pennant" x="${x - 4}" y="${y - 70}" width="50" height="74"/>`,
    none: () => "",
  };

  // A person standing in a 200×300 cell. arms are two lines of [shoulder→elbow→hand], legs are two lines of [hip→knee→foot]
  function figure(o) {
    const c = Object.assign({ top: "var(--site-purple)", bottom: "var(--site-yellow)", hair: "var(--kf-accent)", shoe: "var(--kf-accent)", skates: true, cap: null }, o);
    const arms = c.arms || [[78, 112, 52, 92, 44, 60], [122, 112, 150, 96, 156, 64]];
    const legs = c.legs || [[90, 176, 70, 226, 60, 268], [112, 176, 134, 222, 150, 262]];
    const a = (p) => `M${p[0]} ${p[1]} Q${p[2]} ${p[3]} ${p[4]} ${p[5]}`;
    const foot = (x, y) =>
      `<path d="M${x - 20} ${y - 6} q0 -16 18 -16 l10 0 q16 2 16 16 z" fill="${c.shoe}" ${sw}/>` +
      (c.skates ? `<circle cx="${x - 12}" cy="${y + 4}" r="6" fill="var(--site-white)" ${sw}/><circle cx="${x + 12}" cy="${y + 4}" r="6" fill="var(--site-white)" ${sw}/>` : "");
    const capSvg = c.cap
      ? `<path d="M74 58 q26 -34 54 -4 q8 8 20 10 q-6 8 -22 4 z" fill="${c.cap}" ${sw}/>`
      : `<path d="M74 66 q-4 -34 28 -36 q30 0 26 30 q-10 -14 -28 -12 q-16 2 -26 18z" fill="${c.hair}" ${sw}/>`;
    return (
      `<g>` +
      limb(a(legs[0]), c.bottom, 24) + limb(a(legs[1]), c.bottom, 24) +
      foot(legs[0][4], legs[0][5]) + foot(legs[1][4], legs[1][5]) +
      `<path d="M74 104 q26 -12 52 0 l6 76 q-32 10 -64 0 z" fill="${c.top}" ${sw}/>` +
      `<path d="M92 104 q8 10 16 0" fill="none" ${sw}/>` +
      limb(a(arms[0]), c.top, 15) + limb(a(arms[1]), c.top, 15) +
      `<circle cx="${arms[0][4]}" cy="${arms[0][5]}" r="9" style="fill:var(--site-ill-skin)" ${sw}/>` +
      `<circle cx="${arms[1][4]}" cy="${arms[1][5]}" r="9" style="fill:var(--site-ill-skin)" ${sw}/>` +
      (held[c.left] || held.none)(arms[0][4], arms[0][5]) +
      (held[c.right] || held.none)(arms[1][4], arms[1][5]) +
      `<rect x="92" y="86" width="16" height="16" style="fill:var(--site-ill-skin)" ${sw}/>` +
      `<circle cx="100" cy="66" r="25" style="fill:var(--site-ill-skin)" ${sw}/>` +
      capSvg +
      `<path d="M89 68 q4 -4 8 0 M104 68 q4 -4 8 0 M94 80 q6 5 12 0" fill="none" ${sw}/>` +
      `<circle cx="75" cy="70" r="5" style="fill:var(--site-ill-skin)" ${sw}/>` +
      `</g>`
    );
  }

  const petals = (cx, cy, r, n, fill) =>
    Array.from({ length: n }, (_, i) =>
      `<ellipse cx="${cx}" cy="${cy - r}" rx="${r * 0.62}" ry="${r}" transform="rotate(${(360 / n) * i} ${cx} ${cy})" fill="${fill}" ${sw}/>`
    ).join("");

  const symbols = {
    cloud: ["0 0 170 84", `<path d="M22 74c-14 0-20-16-8-24 0-16 18-24 30-14 6-20 34-24 44-6 12-16 38-10 40 8 16-2 26 14 18 26 8 8 2 20-10 20z" fill="var(--site-white)" ${sw}/><path d="M48 52q6-8 14-2M96 46q8-6 14 2M120 60q6 0 8 6" fill="none" ${sw}/>`],
    sun: ["0 0 120 120", `<path d="M60 4l9 18 19-8-2 21 21 3-14 15 14 15-21 3 2 21-19-8-9 18-9-18-19 8 2-21-21-3 14-15-14-15 21-3-2-21 19 8z" fill="var(--site-ill-sun)" ${sw}/><circle cx="60" cy="60" r="30" fill="var(--site-yellow)" ${sw}/><path d="M36 54h48M38 54q0 12 10 12t10-12M62 54q0 12 10 12t10-12" fill="var(--site-ill-line)" ${sw}/><path d="M50 76q10 7 20 0" fill="none" ${sw}/>`],
    star: ["0 0 100 100", `<path d="M50 6l12 30 32 2-25 20 9 32-28-18-28 18 9-32-25-20 32-2z" fill="var(--site-yellow)" ${sw}/><circle cx="42" cy="48" r="4" fill="var(--site-ill-line)"/><circle cx="58" cy="48" r="4" fill="var(--site-ill-line)"/><path d="M44 60q6 5 12 0" fill="none" ${sw}/>`],
    sparkle: ["0 0 40 40", `<path d="M20 2c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="var(--site-yellow)" ${sw}/>`],
    flower: ["0 0 80 80", petals(40, 40, 17, 5, "var(--site-white)") + `<circle cx="40" cy="40" r="10" fill="var(--site-yellow)" ${sw}/>`],
    "flower-face": ["0 0 80 80", petals(40, 40, 18, 6, "var(--site-white)") + `<circle cx="40" cy="40" r="12" fill="var(--site-yellow)" ${sw}/><path d="M34 39q2-3 4 0M42 39q2-3 4 0M36 45q4 3 8 0" fill="none" ${sw}/>`],
    berry: ["0 0 60 72", `<path d="M30 70C8 60 2 36 8 26c6-8 38-8 44 0 6 10 0 34-22 44z" fill="var(--kf-accent)" ${sw}/><path d="M14 22l8 4 8-10 8 10 8-4-4 10-12-2-12 2z" fill="var(--site-ill-leaf)" ${sw}/><g fill="var(--site-yellow)">${[[20, 38], [32, 36], [42, 40], [24, 50], [36, 50], [30, 60]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.6"/>`).join("")}</g>`],
    leaf: ["0 0 200 170", `<g ${sw}><path d="M100 168C60 140 20 120 8 70c40 0 74 30 92 98z" fill="var(--site-ill-leaf-2)"/><path d="M100 168c40-28 80-48 92-98-40 0-74 30-92 98z" fill="var(--site-ill-leaf-2)"/><path d="M100 168C70 120 52 70 72 10c30 40 40 100 28 158z" fill="var(--site-ill-leaf)"/><path d="M100 168c30-48 48-98 28-158-30 40-40 100-28 158z" fill="var(--site-ill-leaf-3)"/></g><path d="M100 168C80 120 76 70 72 14M100 168c20-48 24-98 28-154M100 168C64 140 34 110 12 74M100 168c36-28 66-58 88-94" fill="none" ${sw}/>`],
    vine: ["0 0 180 260", `<path d="M90 0c-40 40 30 70-10 110s40 70 0 110" fill="none" stroke="var(--site-ill-line)" stroke-width="3"/><g ${sw}><path d="M84 40c-30-10-44 6-40 24 20 4 34-6 40-24z" fill="var(--site-ill-leaf)"/><path d="M96 92c30-12 46 4 42 22-22 4-36-6-42-22z" fill="var(--site-ill-leaf-3)"/><path d="M84 160c-30-10-44 6-40 24 20 4 34-6 40-24z" fill="var(--site-ill-leaf)"/></g><use href="#i-flower" x="96" y="20" width="56" height="56"/><use href="#i-flower" x="20" y="96" width="48" height="48"/><use href="#i-berry" x="110" y="150" width="40" height="48"/><use href="#i-berry" x="40" y="200" width="36" height="44"/><use href="#i-berry" x="70" y="118" width="30" height="36"/>`],
    clock: ["0 0 70 70", `<circle cx="35" cy="35" r="31" fill="var(--site-yellow)" ${sw}/><circle cx="35" cy="35" r="24" fill="var(--site-white)" ${sw}/><path d="M35 35V18M35 35l10 6" fill="none" ${sw}/>`],
    flag: ["0 0 120 110", `<path d="M10 108V6" stroke="var(--site-ill-line)" stroke-width="4"/><path d="M12 10c30-8 50 10 100 0-8 18-8 30 0 46-50 10-70-8-100 0z" fill="var(--kf-accent)" ${sw}/><circle cx="46" cy="26" r="6" fill="var(--site-white)" ${sw}/><circle cx="62" cy="26" r="6" fill="var(--site-white)" ${sw}/><circle cx="47" cy="27" r="2.6" fill="var(--site-ill-line)"/><circle cx="63" cy="27" r="2.6" fill="var(--site-ill-line)"/>`],
    pennant: ["0 0 50 74", `<path d="M4 72V4" stroke="var(--site-ill-line)" stroke-width="3"/><path d="M6 6l40 12-40 14z" fill="var(--site-green)" ${sw}/>`],
    rainbow: ["0 0 260 220", ["var(--site-yellow)", "var(--kf-accent-soft)", "var(--site-blue)", "var(--site-green)"].map((col, i) => `<path d="M${20 + i * 18} 220V150a${110 - i * 18} ${110 - i * 18} 0 0 1 ${220 - i * 36} 0v70" fill="none" stroke="var(--site-ill-line)" stroke-width="22"/><path d="M${20 + i * 18} 220V150a${110 - i * 18} ${110 - i * 18} 0 0 1 ${220 - i * 36} 0v70" fill="none" stroke="${col}" stroke-width="16"/>`).join("")],
    bird: ["0 0 130 80", `<path d="M10 52c20-10 40-6 60 0 20-2 40-10 54-22-4 22-22 34-44 38-30 6-56 0-70-16z" fill="var(--site-white)" ${sw}/><path d="M58 50C50 30 60 10 84 2c-4 20 0 34-10 50z" fill="var(--site-white)" ${sw}/><path d="M4 46l10 2-8 8z" fill="var(--site-yellow)" ${sw}/><circle cx="24" cy="46" r="2.6" fill="var(--site-ill-line)"/><path d="M14 38q8-8 18-2" fill="var(--site-ill-leaf)" ${sw}/>`],
    "bird-up": ["0 0 130 80", `<path d="M10 52c20-10 40-6 60 0 20-2 40-10 54-22-4 22-22 34-44 38-30 6-56 0-70-16z" fill="var(--site-white)" ${sw}/><path d="M58 52C40 50 30 40 26 20c22 2 34 14 44 30z" fill="var(--site-white)" ${sw}/><path d="M4 46l10 2-8 8z" fill="var(--site-yellow)" ${sw}/><circle cx="24" cy="46" r="2.6" fill="var(--site-ill-line)"/><path d="M14 38q8-8 18-2" fill="var(--site-ill-leaf)" ${sw}/>`],
    mug: ["0 0 52 64", `<path d="M44 24q10 0 8 12t-10 12" fill="none" stroke="var(--site-ill-line)" stroke-width="6"/><path d="M44 24q10 0 8 12t-10 12" fill="none" stroke="var(--site-white)" stroke-width="2"/><rect x="6" y="18" width="38" height="44" rx="5" fill="var(--site-yellow)" ${sw}/><path d="M4 22c-4-12 8-18 14-12 4-10 18-10 22 0 10-4 16 8 8 14z" fill="var(--site-white)" ${sw}/><circle cx="18" cy="40" r="3" fill="var(--site-white)"/><circle cx="28" cy="50" r="2" fill="var(--site-white)"/>`],
    cup: ["0 0 46 34", `<path d="M36 10q10 0 8 8t-10 8" fill="none" ${sw}/><path d="M2 6h36l-4 22q-14 6-28 0z" fill="var(--site-white)" ${sw}/><ellipse cx="20" cy="7" rx="17" ry="4" fill="var(--site-ill-brown)" ${sw}/>`],
    cone: ["0 0 28 66", `<path d="M4 30l10 34 10-34z" fill="var(--site-ill-cone)" ${sw}/><path d="M2 30c-2-10 6-14 8-12 0-12 10-16 14-6 6-2 6 10 2 18z" fill="var(--kf-accent-soft)" ${sw}/>`],
    basket: ["0 0 60 48", `<use href="#i-berry" x="8" y="0" width="22" height="26"/><use href="#i-berry" x="28" y="2" width="22" height="26"/><path d="M4 20h52l-6 26H10z" fill="var(--site-ill-cone)" ${sw}/><path d="M12 28h36M14 36h32" fill="none" ${sw}/>`],
    bottle: ["0 0 44 120", `<path d="M14 4h16v30q12 8 12 24v54q0 6-6 6H8q-6 0-6-6V58q0-16 12-24z" fill="var(--kf-accent-soft)" ${sw}/><rect x="14" y="4" width="16" height="12" fill="var(--site-blue)" ${sw}/><rect x="6" y="66" width="32" height="26" rx="3" fill="var(--site-white)" ${sw}/>`],
    splash: ["0 0 200 120", `<path d="M10 20c40 0 40 40 80 36s60-36 100-20c-10 30-40 30-50 60-20 30-70 10-80-10-10-16-40-10-50-66z" fill="var(--site-yellow)" ${sw}/><circle cx="60" cy="100" r="7" fill="var(--site-white)" ${sw}/><circle cx="150" cy="104" r="5" fill="var(--site-white)" ${sw}/><circle cx="100" cy="40" r="4" fill="var(--site-white)" ${sw}/>`],
    bus: ["0 0 260 170", `<rect x="10" y="40" width="240" height="96" rx="22" fill="var(--site-yellow)" ${sw}/><rect x="28" y="58" width="44" height="34" rx="6" style="fill:var(--site-ill-window)" ${sw}/><rect x="84" y="58" width="44" height="34" rx="6" style="fill:var(--site-ill-window)" ${sw}/><rect x="140" y="58" width="44" height="34" rx="6" style="fill:var(--site-ill-window)" ${sw}/><path d="M196 58h34q8 0 8 10v24h-42z" style="fill:var(--site-ill-window)" ${sw}/><path d="M10 108h240" fill="none" ${sw}/><circle cx="62" cy="140" r="22" fill="var(--site-ill-line)"/><circle cx="62" cy="140" r="9" fill="var(--site-white)"/><circle cx="196" cy="140" r="22" fill="var(--site-ill-line)"/><circle cx="196" cy="140" r="9" fill="var(--site-white)"/><rect x="40" y="16" width="70" height="26" rx="6" fill="var(--kf-accent)" ${sw}/><rect x="120" y="8" width="60" height="34" rx="6" fill="var(--site-blue)" ${sw}/>`],
    car: ["0 0 160 90", `<path d="M10 62q0-22 22-26l20-24h56l22 24q20 4 20 26v8H10z" fill="var(--kf-accent)" ${sw}/><path d="M58 18h22v20H44zM88 18h18l16 20H88z" style="fill:var(--site-ill-window)" ${sw}/><circle cx="44" cy="72" r="14" fill="var(--site-ill-line)"/><circle cx="44" cy="72" r="6" fill="var(--site-white)"/><circle cx="118" cy="72" r="14" fill="var(--site-ill-line)"/><circle cx="118" cy="72" r="6" fill="var(--site-white)"/>`],
    binoculars: ["0 0 90 50", `<rect x="4" y="10" width="34" height="36" rx="10" fill="var(--site-blue)" ${sw}/><rect x="52" y="10" width="34" height="36" rx="10" fill="var(--site-blue)" ${sw}/><rect x="36" y="18" width="18" height="12" fill="var(--site-ill-line)"/><circle cx="21" cy="40" r="9" style="fill:var(--site-ill-window)" ${sw}/><circle cx="69" cy="40" r="9" style="fill:var(--site-ill-window)" ${sw}/>`],
    // School building: low wing + clock tower + tall right wing. Windows are filled with a grid pattern
    school: ["0 0 1267 769", `<g stroke="var(--site-ill-window-line)" stroke-width="3"><rect x="0" y="500" width="380" height="269" fill="url(#i-win)"/><rect x="0" y="486" width="380" height="18" fill="var(--site-ill-window-2)"/><rect x="380" y="330" width="320" height="439" fill="url(#i-win)"/><rect x="380" y="316" width="320" height="18" fill="var(--site-ill-window-2)"/><rect x="560" y="80" width="250" height="689" fill="url(#i-win)"/><rect x="560" y="66" width="250" height="18" fill="var(--site-ill-window-2)"/><rect x="810" y="260" width="190" height="509" fill="url(#i-win)"/><rect x="810" y="246" width="190" height="18" fill="var(--site-ill-window-2)"/><path d="M0 640h1000M380 560h620" fill="none"/></g><use href="#i-clock" x="640" y="160" width="80" height="80"/>`],
    tower: ["0 0 260 700", `<g stroke="var(--site-ill-window-line)" stroke-width="3"><rect x="0" y="40" width="260" height="660" fill="url(#i-win)"/><rect x="0" y="26" width="260" height="18" fill="var(--site-ill-window-2)"/></g><use href="#i-flag" x="150" y="-70" width="80" height="74"/>`],
    // Original logo slot: three lines of round, thick letters
    logo: ["0 0 260 300", `<g style="font-family:var(--kf-font-logo)" font-size="96" style="fill:var(--kf-ink)" text-anchor="middle"><text x="130" y="84" textLength="240" lengthAdjust="spacingAndGlyphs">YOUR</text><text x="130" y="186" textLength="240" lengthAdjust="spacingAndGlyphs">000</text><text x="130" y="290" textLength="240" lengthAdjust="spacingAndGlyphs">LOGO</text></g>`],
    sticker: ["0 0 240 110", `<rect x="6" y="10" width="228" height="90" rx="44" fill="var(--site-white)" stroke="var(--site-ill-teal-deep)" stroke-width="8"/><text x="120" y="74" text-anchor="middle" style="font-family:var(--kf-font-logo)" font-size="48" fill="var(--kf-accent)" stroke="var(--site-ill-line)" stroke-width="2">LOGO</text>`],
    // Spinning circle text (corner of the group card)
    ring: ["0 0 120 120", `<defs><path id="i-ring-path" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs><circle cx="60" cy="60" r="58" fill="var(--site-yellow)" ${sw}/><text style="font-family:var(--kf-font-display)" font-size="13" font-weight="600" letter-spacing="2" style="fill:var(--kf-ink)"><textPath href="#i-ring-path">FOR GROUPS · FOR GROUPS · FOR GROUPS ·</textPath></text>`],
    arrow: ["0 0 24 16", `<path d="M2 8h18M14 2l6 6-6 6" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`],
    swash: ["0 0 64 54", `<path d="M4 40c10-30 30-34 30-16S18 46 30 46s20-28 30-40" fill="none" stroke-width="6" stroke-linecap="round"/>`],
    "map-art": ["0 0 726 700", `<rect width="726" height="700" fill="var(--site-ill-pale-green)"/><path d="M0 520c160-40 300 40 460 0s200-20 266 0v180H0z" fill="var(--site-ill-mint)"/><g ${sw}><rect x="80" y="120" width="300" height="140" rx="10" style="fill:var(--site-ill-window)"/><rect x="420" y="90" width="220" height="200" rx="10" fill="var(--site-ill-peach)"/><rect x="120" y="330" width="200" height="120" rx="10" fill="var(--site-ill-cream)"/><rect x="380" y="340" width="260" height="110" rx="10" fill="var(--site-ill-lilac)"/><path d="M60 300h620M360 60v560" fill="none" stroke-dasharray="8 8"/></g><g style="font-family:var(--kf-font-sans)" font-size="22" font-weight="700" style="fill:var(--kf-ink)" text-anchor="middle"><text x="230" y="198">Zone 1</text><text x="530" y="198">Zone 2</text><text x="220" y="398">Zone 3</text><text x="510" y="402">Zone 4</text></g><use href="#i-berry" x="560" y="520" width="50" height="60"/><use href="#i-berry" x="610" y="540" width="44" height="52"/><use href="#i-flower" x="60" y="560" width="60" height="60"/><use href="#i-leaf" x="140" y="560" width="120" height="100"/>`],
  };

  // People — one per character spot in the original
  const people = {
    walker1: { top: "var(--site-purple)", bottom: "var(--site-yellow)", hair: "var(--kf-accent)", right: "mug", arms: [[78, 112, 56, 140, 64, 170], [122, 112, 150, 96, 150, 60]] },
    walker2: { top: "var(--kf-accent)", bottom: "var(--site-blue)", hair: "var(--site-ill-line)", right: "berry", cap: "var(--site-white)", arms: [[78, 112, 56, 140, 66, 170], [122, 112, 152, 120, 156, 92]] },
    walker3: { top: "var(--site-green)", bottom: "var(--kf-accent-soft)", hair: "var(--site-ill-brown)", right: "cup", arms: [[78, 112, 56, 140, 66, 170], [122, 112, 152, 120, 156, 88]] },
    walker4: { top: "var(--site-blue)", bottom: "var(--site-yellow)", hair: "var(--kf-accent)", right: "flag", cap: "var(--kf-accent-soft)", arms: [[78, 112, 56, 140, 66, 170], [122, 112, 150, 90, 150, 56]] },
    icecream: { top: "var(--site-purple)", bottom: "var(--site-yellow)", hair: "var(--kf-accent)", left: "cone", right: "cup", skates: true, arms: [[78, 112, 44, 104, 40, 70], [122, 112, 156, 104, 160, 72]] },
    sitter: { top: "var(--site-white)", bottom: "var(--site-ill-teal)", hair: "var(--site-blue)", left: "cup", skates: false, shoe: "var(--site-white)", arms: [[78, 112, 50, 100, 40, 76], [122, 112, 146, 132, 166, 150]], legs: [[90, 176, 130, 186, 132, 240], [112, 176, 160, 184, 170, 236]] },
    cheers: { top: "var(--site-ill-navy)", bottom: "var(--site-ill-navy)", hair: "var(--kf-accent-soft)", right: "mug", skates: false, shoe: "var(--site-white)", arms: [[78, 112, 40, 80, 30, 30], [122, 112, 160, 80, 172, 30]] },
    drinker: { top: "var(--kf-accent-soft)", bottom: "var(--site-blue)", hair: "var(--site-ill-line)", cap: "var(--site-white)", right: "mug", skates: false, shoe: "var(--site-white)", arms: [[78, 112, 56, 150, 70, 176], [122, 112, 150, 100, 128, 80]] },
    jumper: { top: "var(--site-yellow)", bottom: "var(--site-blue)", hair: "var(--kf-accent)", left: "berry", right: "none", skates: true, arms: [[78, 112, 40, 90, 30, 50], [122, 112, 160, 86, 176, 50]], legs: [[90, 176, 56, 200, 36, 240], [112, 176, 150, 196, 170, 236]] },
    looker: { top: "var(--kf-accent)", bottom: "var(--site-ill-line)", hair: "var(--site-blue)", cap: "var(--site-blue)", skates: false, shoe: "var(--site-white)", arms: [[78, 112, 70, 90, 84, 72], [122, 112, 132, 90, 116, 72]] },
    farmer: { top: "var(--site-green)", bottom: "var(--site-ill-line)", hair: "var(--site-ill-line)", cap: "var(--site-yellow)", right: "berry", skates: false, shoe: "var(--kf-accent)", arms: [[78, 112, 56, 140, 66, 170], [122, 112, 152, 120, 156, 92]] },
    brewer: { top: "var(--site-blue)", bottom: "var(--site-yellow)", hair: "var(--site-ill-brown)", right: "mug", left: "mug", skates: false, shoe: "var(--site-white)", arms: [[78, 112, 50, 96, 44, 74], [122, 112, 150, 96, 156, 74]] },
    barista: { top: "var(--site-purple)", bottom: "var(--site-ill-line)", hair: "var(--kf-accent)", right: "cup", left: "cup", skates: false, shoe: "var(--site-white)", arms: [[78, 112, 50, 96, 44, 74], [122, 112, 150, 96, 156, 74]] },
  };
  for (const [name, o] of Object.entries(people)) symbols["p-" + name] = ["0 0 200 300", figure(o)];
  // Person holding binoculars
  symbols["p-looker"][1] += `<use href="#i-binoculars" x="58" y="44" width="84" height="46"/>`;

  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.setAttribute("class", "i-sprite");
  // The window grid is shared by several building images
  sprite.innerHTML = `<defs><pattern id="i-win" width="56" height="48" patternUnits="userSpaceOnUse"><rect width="56" height="48" style="fill:var(--site-ill-window)"/><rect x="5" y="5" width="46" height="34" style="fill:var(--site-ill-window-2)" stroke="var(--site-ill-window-line)" stroke-width="2"/><path d="M5 22h46M28 5v34" stroke="var(--site-ill-window-line)" stroke-width="1.5"/></pattern></defs>` + Object.entries(symbols)
    .map(([id, [vb, body]]) => `<symbol id="${id.startsWith("p-") ? id : "i-" + id}" viewBox="${vb}">${body}</symbol>`)
    .join("");
  document.body.prepend(sprite);

  // <div class="il" data-i="bird|bird-up"> Like with |, passing two images makes them flash alternately once every 20s, as in the original
  const svgOf = (name) => {
    const id = name.startsWith("p-") ? name : "i-" + name;
    const vb = symbols[name] ? symbols[name][0] : "0 0 100 100";
    return `<svg viewBox="${vb}" aria-hidden="true"><use href="#${id}"/></svg>`;
  };
  document.querySelectorAll("[data-i]").forEach((el) => {
    const names = el.dataset.i.split("|");
    const inner =
      names.length > 1
        ? `<div class="il__in il__in--change"><div class="il__before">${svgOf(names[0])}</div><div class="il__after">${svgOf(names[1])}</div></div>`
        : `<div class="il__in">${svgOf(names[0])}</div>`;
    el.insertAdjacentHTML("afterbegin", inner);
  });
})();
