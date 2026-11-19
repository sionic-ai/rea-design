// The original lays down books, figures and notes as image files and GIFs. Here we redraw them as SVG with the same position, size and color.
// The original GIF draws the same picture three times with different lines and cycles 0.5s each — shared.js applies a line wobble filter at the same tempo to the whole picture.
(() => {
  const C = {
    m: "var(--kf-accent)", md: "var(--site-mustard-d)", mdd: "var(--site-mustard-dd)",
    cr: "var(--site-cream)", cr2: "var(--site-cream-2)", w: "var(--kf-surface)", ink: "var(--kf-ink)", sk: "var(--site-skin)", ol: "var(--site-ochre)", edge: "var(--site-edge)",
    note: "var(--site-note)", ink1: "var(--site-ink-1)", ink2: "var(--site-ink-2)", wood: "var(--site-wood)", wood2: "var(--site-wood-2)",
  };
  const at = (x, y, s = 1, r = 0, inner = "", attrs = "") =>
    `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" ${attrs}>${inner}</g>`;

  // ── Figure: foot center is the origin, up is negative. As in the original, no facial features — only head, clothes and shoe blobs ──
  const HAIR = {
    short: (hy) => `<path d="M-25 ${hy + 4}C-30 ${hy - 30} 30 ${hy - 30} 25 ${hy + 4}C18 ${hy - 8} 4 ${hy - 12} -6 ${hy - 6}C-14 ${hy - 2} -20 ${hy} -25 ${hy + 4}Z" fill="${C.ink}"/>`,
    bob: (hy) => `<path d="M-27 ${hy + 20}C-34 ${hy - 30} 34 ${hy - 30} 27 ${hy + 20}C24 ${hy + 6} 20 ${hy - 6} 10 ${hy - 10}C0 ${hy - 4} -14 ${hy - 4} -20 ${hy - 4}C-22 ${hy + 4} -22 ${hy + 14} -27 ${hy + 20}Z" fill="${C.ink}"/>`,
    bun: (hy) => `<circle cx="6" cy="${hy - 26}" r="10" fill="${C.ink}"/><path d="M-25 ${hy + 4}C-30 ${hy - 30} 30 ${hy - 30} 25 ${hy + 4}C16 ${hy - 10} -16 ${hy - 10} -25 ${hy + 4}Z" fill="${C.ink}"/>`,
  };
  const limb = (d, color, w) =>
    `<path d="${d}" fill="none" stroke="${C.ol}" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const shoe = (x, y, r = 0) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="8.5" transform="rotate(${r} ${x} ${y})" fill="${C.ink}"/>`;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${C.sk}" stroke="${C.ol}" stroke-width="1.5"/>`;

  const POSE = {
    stand: { hip: -70, sh: -132, hy: -160, legs: [["M-10 -72L-13 -10", -15, -5, 0], ["M10 -72L13 -10", 15, -5, 0]], arms: [[-26, -122, -36, -92, -32, -66], [26, -122, 36, -92, 32, -66]] },
    sit: { hip: -38, sh: -96, hy: -122, legs: [["M-12 -40L-44 -22L-12 -10", -8, -8, -10], ["M12 -40L44 -22L12 -10", 8, -8, 10]], arms: [[-26, -88, -40, -62, -24, -44], [26, -88, 40, -62, 24, -44]] },
    kneel: { hip: -44, sh: -104, hy: -130, legs: [["M-12 -46L-20 -14", -24, -10, -30], ["M12 -46L20 -14", 24, -10, 30]], arms: [[-26, -96, -44, -72, -40, -50], [26, -96, 44, -72, 40, -50]] },
    walk: { hip: -70, sh: -132, hy: -160, legs: [["M-8 -72L-30 -36L-36 -8", -40, -4, -20], ["M8 -72L22 -38L34 -10", 38, -6, 20]], arms: [[-26, -122, -44, -98, -52, -76], [26, -122, 40, -100, 46, -80]] },
  };

  function fig(o = {}) {
    const p = POSE[o.pose || "stand"];
    const shirt = o.shirt || C.m, pants = o.pants || C.cr, sleeve = o.sleeve || shirt;
    const arms = o.arms || p.arms;
    const legs = p.legs.map(([d, sx, sy, sr]) => limb(d, pants, 22) + shoe(sx, sy, sr)).join("");
    const torso = `<path d="M-30 ${p.hip}C-34 ${p.sh + 20} -30 ${p.sh - 4} 0 ${p.sh - 6}C30 ${p.sh - 4} 34 ${p.sh + 20} 30 ${p.hip}Q0 ${p.hip + 10} -30 ${p.hip}Z" fill="${shirt}" stroke="${C.ol}" stroke-width="1.5"/>`;
    const scarf = o.scarf ? `<path d="M-24 ${p.sh + 2}Q0 ${p.sh + 16} 24 ${p.sh + 2}L18 ${p.sh + 30}Q0 ${p.sh + 22} -18 ${p.sh + 30}Z" fill="${o.scarf}" stroke="${C.ol}" stroke-width="1.2"/>` : "";
    const armSvg = arms.map(([sx, sy, ex, ey, hx, hy], i) =>
      `<g data-loop="${o.loop && o.loop[i] ? o.loop[i] : ""}" data-ox="${sx}" data-oy="${sy}">${limb(`M${sx} ${sy}Q${ex} ${ey} ${hx} ${hy}`, sleeve, 15)}${hand(hx, hy)}${o.hold && o.hold[i] ? at(hx, hy, 1, 0, o.hold[i]) : ""}</g>`).join("");
    const head = `<g data-loop="${o.headLoop || ""}" data-ox="0" data-oy="${p.sh}"><circle cx="0" cy="${p.hy}" r="24" fill="${C.sk}" stroke="${C.ol}" stroke-width="1.5"/>${HAIR[o.hair || "short"](p.hy)}${o.phones ? `<path d="M-27 ${p.hy}C-28 ${p.hy - 36} 28 ${p.hy - 36} 27 ${p.hy}" fill="none" stroke="${C.m}" stroke-width="6"/><ellipse cx="-26" cy="${p.hy + 2}" rx="8" ry="12" fill="${C.m}" stroke="${C.ol}" stroke-width="1.5"/><ellipse cx="26" cy="${p.hy + 2}" rx="8" ry="12" fill="${C.m}" stroke="${C.ol}" stroke-width="1.5"/>` : ""}</g>`;
    const shadow = o.shadow === false ? "" : `<ellipse cx="0" cy="-4" rx="${o.pose === "sit" ? 58 : 44}" ry="${o.pose === "sit" ? 22 : 15}" fill="${o.shadowColor || C.cr2}"/>`;
    return shadow + legs + torso + scarf + armSvg + head;
  }

  // ── Props
  const cd = (r = 18, fill = C.m) => `<circle r="${r}" fill="${fill}" stroke="${C.ol}" stroke-width="1.5"/><circle r="${r * 0.62}" fill="none" stroke="${C.w}" stroke-opacity=".55" stroke-width="2"/><circle r="${r * 0.3}" fill="${C.cr}" stroke="${C.ol}" stroke-width="1.2"/>`;
  const note8 = (fill = C.ink) => `<ellipse cx="0" cy="0" rx="13" ry="9" transform="rotate(-25)" fill="${fill}"/><path d="M9 -4L13 -66L17 -66L14 -2Z" fill="${fill}"/><path d="M13 -66C34 -54 40 -36 30 -18C34 -36 26 -46 14 -50Z" fill="${fill}"/>`;
  const beam = (fill = C.ink) => `<ellipse cx="0" cy="0" rx="13" ry="9" transform="rotate(-25)" fill="${fill}"/><ellipse cx="54" cy="-14" rx="13" ry="9" transform="rotate(-25 54 -14)" fill="${fill}"/><path d="M9 -4L12 -64L16 -64L14 -2Z M63 -18L66 -78L70 -78L68 -16Z" fill="${fill}"/><path d="M12 -64L70 -80L70 -66L12 -50Z" fill="${fill}"/>`;
  // Large brush notes at the hero top left and bottom right of the original — tails that flow and spread
  const bigNote = (fill = C.ink) => `<g opacity=".92"><ellipse cx="0" cy="0" rx="26" ry="19" transform="rotate(-25)" fill="${fill}"/><path d="M20 -8L120 -150L130 -144L30 -2Z" fill="${fill}" opacity=".85"/><path d="M118 -152C150 -150 190 -150 200 -170L214 -150C196 -126 160 -120 130 -126Z" fill="${fill}"/></g>`;
  const headphones = () => `<path d="M-24 2C-26 -32 26 -32 24 2" fill="none" stroke="${C.cr2}" stroke-width="6" stroke-linecap="round"/><path d="M-24 2C-26 -32 26 -32 24 2" fill="none" stroke="${C.ol}" stroke-width="1"/><ellipse cx="-24" cy="6" rx="11" ry="15" fill="${C.m}" stroke="${C.ol}" stroke-width="1.5"/><ellipse cx="24" cy="6" rx="11" ry="15" fill="${C.m}" stroke="${C.ol}" stroke-width="1.5"/>`;
  const cassette = () => `<rect x="-22" y="-14" width="44" height="28" rx="3" fill="${C.cr}" stroke="${C.ol}" stroke-width="1.5"/><rect x="-14" y="-7" width="28" height="12" rx="2" fill="${C.w}" stroke="${C.ol}" stroke-width="1"/><circle cx="-7" cy="-1" r="3.5" fill="${C.ink}"/><circle cx="7" cy="-1" r="3.5" fill="${C.ink}"/>`;
  const card = (fill = C.cr2) => `<rect x="-24" y="-24" width="48" height="48" fill="${fill}" stroke="${C.w}" stroke-width="3"/>${at(-2, 10, 0.38, 0, note8(C.note))}`;
  const speaker = () => `<path d="M-26 -36L-10 -48L30 -48L14 -36Z" fill="${C.w}" stroke="${C.ol}" stroke-width="1.2"/><path d="M14 -36L30 -48L30 20L14 32Z" fill="${C.cr2}" stroke="${C.ol}" stroke-width="1.2"/><rect x="-26" y="-36" width="40" height="68" fill="${C.cr}" stroke="${C.ol}" stroke-width="1.2"/><circle cx="-6" cy="-14" r="6" fill="none" stroke="${C.ink}" stroke-width="3"/><circle cx="-6" cy="12" r="11" fill="none" stroke="${C.ink}" stroke-width="4"/><circle cx="-6" cy="12" r="3" fill="${C.ink}"/>`;
  const laptop = () => `<path d="M-30 10L10 -20L46 0L6 30Z" fill="${C.ink}"/><path d="M-30 10L-40 -40L0 -66L10 -20Z" fill="${C.ink1}"/><path d="M-26 2L-34 -36L-2 -56L6 -22Z" fill="${C.cr2}" opacity=".35"/>`;
  const phone = () => `<path d="M-30 14L-24 -10Q0 -20 24 -10L30 14Z" fill="${C.ink}"/><circle cx="0" cy="0" r="9" fill="${C.ink2}" stroke="${C.cr2}" stroke-width="1"/><path d="M-30 -14Q0 -34 30 -14L26 -8Q0 -24 -26 -8Z" fill="${C.ink}"/>`;
  const piano = () => {
    // Isometric keyboard — u direction 230, v direction 60
    const keys = Array.from({ length: 7 }, (_, i) => {
      const t = 0.14 + i * 0.12;
      if (i === 3) return "";
      const x = 18 + 214 * t, y = 8 - 79 * t;
      return `<path d="M${x} ${y}L${x + 8} ${y - 3}L${x + 20} ${y + 22}L${x + 12} ${y + 25}Z" fill="${C.ink}"/>`;
    }).join("");
    const lines = Array.from({ length: 13 }, (_, i) => {
      const t = 0.08 + i * 0.07, x = 14 + 214 * t, y = 12 - 79 * t;
      return `<path d="M${x} ${y}L${x + 22} ${y + 42}" stroke="${C.cr2}" stroke-width="1.2"/>`;
    }).join("");
    return `<path d="M0 0L230 -85L250 -45L20 40Z" fill="${C.m}" stroke="${C.ol}" stroke-width="1.5"/><path d="M20 40L250 -45L250 -28L20 58Z" fill="${C.md}"/><path d="M0 0L20 40L20 58L0 18Z" fill="${C.mdd}"/><path d="M14 10L222 -67L238 -37L30 40Z" fill="${C.w}" stroke="${C.ol}" stroke-width="1"/>${lines}${keys}`;
  };
  const bars = (hs) => hs.map(([x, y, h], i) => `<rect data-loop="bar" data-i="${i}" x="${x - 7}" y="${y - h}" width="14" height="${h}" rx="7" fill="${C.cr2}"/>`).join("");
  const staff = (lines) => lines.map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>`).join("");
  const stool = () => `<ellipse cx="0" cy="0" rx="260" ry="120" fill="${C.wood}"/><ellipse cx="0" cy="-14" rx="260" ry="120" fill="${C.wood2}"/><path d="M-200 60L-230 520L-180 520L-140 80Z M200 60L230 520L180 520L140 80Z M-30 110L-20 560L30 560L30 110Z" fill="${C.wood}"/><path d="M-210 300L210 300L208 330L-208 330Z" fill="${C.wood}"/>`;

  // ── Book: the open book from the original Hero. Composed looking down at an angle from above, the center spine tilts toward the lower right
  const bookHero = () => `
    <path d="M0 520L0 900L250 900Z" fill="${C.md}"/>
    <path d="M0 540C200 640 600 735 955 795L965 900L0 900Z" fill="${C.edge}"/>
    <path d="M0 560C220 660 600 752 955 812M0 590C220 690 600 772 958 832M0 620C220 720 600 792 960 852" fill="none" stroke="${C.ol}" stroke-width="1.4" stroke-opacity=".55"/>
    <path d="M955 795C1100 735 1300 700 1440 688L1440 760C1300 768 1100 800 965 870Z" fill="${C.edge}"/>
    <path d="M960 815C1100 760 1300 728 1440 716M962 840C1100 785 1300 752 1440 742" fill="none" stroke="${C.ol}" stroke-width="1.4" stroke-opacity=".55"/>
    <path d="M0 215C200 140 450 108 640 118L700 330C600 262 420 240 230 262C130 274 60 300 0 330Z" fill="${C.cr}"/>
    <path d="M0 330C120 270 320 238 520 250C610 256 660 290 700 330L955 790C700 750 420 690 150 580C80 552 30 540 0 528Z" fill="${C.w}"/>
    <path d="M0 528C40 552 120 600 150 616C70 600 30 590 0 600Z" fill="${C.cr}"/>
    <path d="M640 118C640 62 690 34 770 40C870 46 925 96 935 172L905 332C830 300 760 302 700 330Z" fill="${C.cr}"/>
    <path d="M935 172C1060 165 1200 160 1292 170C1360 228 1420 296 1440 326L1440 688C1300 700 1100 732 955 790L700 330C770 300 860 300 905 332Z" fill="${C.w}"/>
    <path d="M935 172C1060 165 1200 160 1292 170L1440 322L1440 340C1400 296 1340 222 1290 192C1200 184 1050 188 930 196Z" fill="${C.cr}"/>
    <path d="M700 330C780 470 870 640 955 792" fill="none" stroke="${C.ol}" stroke-width="2"/>
    <path d="M640 118C650 200 680 280 700 330" fill="none" stroke="${C.ol}" stroke-width="1.2" stroke-opacity=".6"/>`;

  // “Page corner” used for other section borders: a curve where white paper curls up over a mustard background, and paper grain beneath
  const pageEdge = (d, under, lines) =>
    `<path d="${under}" fill="${C.edge}"/>${lines.map((l) => `<path d="${l}" fill="none" stroke="${C.ol}" stroke-width="1.3" stroke-opacity=".5"/>`).join("")}<path d="${d}" fill="${C.w}"/>`;

  const S = {};

  S.hero = () => ({
    vb: "0 0 1440 920",
    body: `<g data-intro="book">${bookHero()}</g>
      <g data-intro="fig" data-d="0">${at(140, 180, 1.05, -8, bigNote(), 'data-loop="float"')}</g>
      <g data-intro="fig" data-d="0.1">${staff([[484, 236, 760, 240], [560, 300, 820, 290], [650, 268, 930, 280], [740, 344, 990, 354], [690, 320, 830, 270]])}
        ${at(640, 238, 0.7, 0, note8(), 'data-loop="float"')}${at(850, 278, 0.7, 0, note8(), 'data-loop="float" data-i="2"')}${at(900, 246, 0.6, 0, note8())}${at(700, 296, 0.6, 10, beam())}</g>
      <g data-intro="fig" data-d="0.2">${at(850, 262, 1.3, 18, fig({ pose: "kneel", shirt: C.m, pants: C.cr, scarf: C.cr2, hair: "short", arms: [[-26, -96, -70, -110, -110, -72], [26, -96, 10, -60, -20, -40]], loop: ["wave", ""], hold: [`<path d="M0 0L-60 40" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`] }))}</g>
      <g data-intro="fig" data-d="0.3">${at(320, 440, 1.3, -6, fig({ pose: "sit", shirt: C.cr, sleeve: C.cr, pants: C.m, hair: "short", phones: true, headLoop: "bob", arms: [[-26, -88, -60, -90, -90, -70], [26, -88, 40, -60, 20, -44]], loop: ["wave", ""] }))}
        ${at(170, 330, 1, -20, `<path d="M-30 -14Q0 -30 30 -14L24 16Q0 4 -24 16Z" fill="${C.ink}"/>`)}${at(220, 294, 1, 18, `<rect x="-26" y="-14" width="52" height="28" fill="${C.cr2}" stroke="${C.w}" stroke-width="2"/>`)}
        ${at(460, 280, 1, 0, cd(22))}${at(230, 425, 1, 0, cd(20, C.cr2))}${at(286, 470, 1, 0, cd(20))}${at(330, 458, 1, 0, cd(18, C.cr2))}</g>
      <g data-intro="fig" data-d="0.4">${at(300, 600, 1, 0, piano())}</g>
      <g data-intro="fig" data-d="0.5">${at(720, 660, 1.35, 0, fig({ pose: "sit", shirt: C.m, pants: C.w, hair: "short", arms: [[-26, -88, -50, -60, -40, -46], [26, -88, 20, -60, -6, -54]], loop: ["", "wave"] }))}
        ${at(590, 452, 0.95, -8, card(), 'data-loop="float"')}${at(580, 548, 1, 6, card())}${at(630, 550, 1, -4, card())}${at(705, 552, 1, 4, card())}${at(510, 622, 0.9, 12, card(), 'data-loop="float" data-i="3"')}${at(840, 522, 0.95, -18, card(), 'data-loop="float" data-i="1"')}${at(860, 580, 1, 8, card())}</g>
      <g data-intro="fig" data-d="0.6">${at(1070, 222, 1, 0, speaker())}${at(1112, 232, 0.9, 0, speaker())}${at(985, 462, 1, -10, headphones())}
        ${bars([[1045, 470, 90], [1092, 500, 120], [1150, 450, 150], [1200, 480, 130], [1252, 470, 140], [1310, 400, 110], [1356, 420, 60]])}
        ${at(1190, 535, 1.4, 0, fig({ pose: "stand", shirt: C.w, pants: C.m, hair: "bob", arms: [[-26, -122, -70, -116, -110, -126], [26, -122, 70, -116, 110, -126]], loop: ["wave", "wave2"] }))}</g>
      <g data-intro="fig" data-d="0.7">${at(1120, 900, 1.15, -6, bigNote(), 'data-loop="float" data-i="2"')}</g>`,
  });

  // Both sides of the About section: on the left, a person sitting on the book’s bottom corner holding a big disc, on the right, a person stacking boxes on a bookshelf
  const aboutBody = () => `<path d="M0 0L300 0C260 120 200 220 120 300L0 380Z" fill="${C.edge}"/><path d="M0 0L270 0C230 110 170 200 90 270L0 330Z" fill="${C.w}"/>
      <path d="M1440 220C1320 300 1180 420 1080 560L1140 600C1240 470 1360 360 1440 300Z" fill="${C.edge}"/><path d="M1440 220C1330 300 1200 410 1100 540L1440 760Z" fill="${C.w}"/>
      ${at(130, 400, 1.05, -10, fig({ pose: "sit", shirt: C.m, pants: C.w, hair: "bun", arms: [[-26, -88, -40, -70, -10, -60], [26, -88, 30, -64, 10, -58]], hold: [`<circle cx="10" cy="-6" r="44" fill="none" stroke="${C.ink}" stroke-width="12"/><circle cx="10" cy="-6" r="30" fill="${C.cr}" stroke="${C.ol}"/>`], loop: ["wave", ""] }))}
      ${at(150, 100, 0.9, 0, beam(), 'data-loop="float"')}
      ${at(1260, 470, 1.05, 0, fig({ pose: "kneel", shirt: C.m, pants: C.w, hair: "short", arms: [[-26, -96, -50, -80, -70, -64], [26, -96, 30, -70, 0, -60]], loop: ["wave", ""] }))}
      ${at(1160, 430, 1, -10, cassette())}${at(1170, 404, 1, -6, cassette())}${at(1150, 470, 1, -14, cassette())}${at(1196, 456, 1, -8, cassette())}
      ${at(1300, 250, 0.9, 0, beam(), 'data-loop="float" data-i="2"')}`;
  S.aboutL = () => ({ vb: "0 0 480 836", body: aboutBody() });
  S.aboutR = () => ({ vb: "960 0 480 836", body: aboutBody() });

  // Border above results: on a mustard background a white page curves upward, with a laptop · disc · person perched on it.
  S.worksTop = () => ({
    vb: "0 0 1440 365",
    body: pageEdge("M0 365L0 250C200 200 520 120 760 90C960 66 1180 40 1440 70L1440 365Z", "M0 365L0 235C200 186 520 106 760 76C960 52 1180 26 1440 56L1440 365Z", ["M0 242C200 194 520 114 760 84C960 60 1180 34 1440 64"]) +
      `<path d="M560 140C700 100 900 70 1100 64L1100 90C900 100 700 130 560 170Z" fill="${C.cr}" opacity=".7"/>
      ${at(700, 150, 1, -6, laptop())}${at(1140, 200, 1, 0, cd(18))}${at(1185, 196, 1, 0, cd(16, C.cr2))}${at(1222, 186, 1, 0, cd(17))}
      ${at(1240, 140, 1, 0, fig({ pose: "sit", shirt: C.w, pants: C.w, hair: "bun", arms: [[-26, -88, -60, -80, -90, -60], [26, -88, 40, -60, 20, -44]], loop: ["wave", ""] }))}
      ${at(1060, -20, 0.9, 0, beam(), 'data-loop="float"')}`,
  });

  // Boundary below the results: the white bookshelf ends and the book thickness shows, with a person in yellow sitting leaning on the book’s edge
  S.worksBottom = () => ({
    vb: "0 0 1440 460",
    body: `<path d="M0 0L1440 0L1440 120C1200 160 900 210 700 250C500 290 260 330 0 360Z" fill="${C.w}"/>
      <path d="M0 360C260 330 500 290 700 250C900 210 1200 160 1440 120L1440 160C1200 200 900 250 700 290C500 330 260 372 0 400Z" fill="${C.edge}"/>
      <path d="M0 376C260 346 500 306 700 266C900 226 1200 176 1440 136M0 390C260 360 500 320 700 280C900 240 1200 190 1440 150" fill="none" stroke="${C.ol}" stroke-width="1.3" stroke-opacity=".5"/>
      <path d="M1000 30C1100 -10 1300 0 1440 30L1440 120C1300 90 1150 90 1000 120Z" fill="${C.cr}"/>
      <path d="M60 140L100 340" stroke="${C.ol}" stroke-width="1.2" stroke-opacity=".5"/>
      ${at(330, 260, 1.05, -20, fig({ pose: "sit", shirt: C.m, pants: C.cr, hair: "short", arms: [[-26, -88, -46, -60, -30, -40], [26, -88, 46, -60, 30, -40]], headLoop: "bob" }))}
      ${at(240, 130, 1, -18, `<rect x="-26" y="-20" width="52" height="40" fill="${C.cr2}" stroke="${C.w}" stroke-width="2"/>`)}${at(220, 150, 1, 0, headphones())}
      ${at(420, 120, 1, 0, cd(17, C.cr2))}${at(460, 118, 1, 0, cd(18))}
      ${at(1100, 360, 0.75, 0, bigNote(), 'data-loop="float"')}`,
  });

  // Service section: several white papers fan out and a person holding a big musical note walks out from the upper right
  S.mna = () => ({
    vb: "0 0 1440 1060",
    body: `<path d="M0 70C400 10 900 -10 1440 30L1440 1060L0 1060Z" fill="${C.w}"/>
      <path d="M0 0L620 0C430 70 220 170 0 290Z" fill="${C.m}"/><path d="M0 290C220 170 430 70 620 0L680 0C470 80 250 190 0 316Z" fill="${C.cr}"/>
      <path d="M0 316C250 190 470 80 680 0L700 0C480 90 260 200 0 330Z" fill="${C.md}" opacity=".35"/>
      <path d="M0 300C180 340 330 420 420 520L0 470Z" fill="${C.cr}"/><path d="M0 330C160 370 280 430 360 510L0 480Z" fill="${C.w}"/>
      <path d="M0 470L0 520C140 500 300 520 420 520Z" fill="${C.m}" opacity=".9"/>
      <path d="M0 700L560 872L0 1004Z" fill="${C.m}"/><path d="M60 700L100 700L1300 1014L1250 1026Z" fill="${C.cr}"/>
      <path d="M0 704L560 874L520 880L0 760Z" fill="${C.md}" opacity=".5"/>
      <path d="M1290 1060L1440 860L1440 1060Z" fill="${C.m}"/><path d="M1240 1030L1310 1010L1440 852L1440 870L1300 1040Z" fill="${C.cr}"/>
      ${at(1330, 300, 1.05, 0, fig({ pose: "walk", shirt: C.cr, pants: C.w, hair: "short", arms: [[-26, -122, -50, -150, -40, -180], [26, -122, 40, -100, 30, -80]], loop: ["wave", ""] }))}
      ${at(1250, 160, 1.2, -20, note8(), 'data-loop="float"')}${at(1330, 420, 1, 0, beam(), 'data-loop="float" data-i="1"')}
      ${at(1240, 470, 1, 0, headphones())}${at(1290, 520, 1, 0, `<path d="M-14 -20L14 -20L18 20L-18 20Z" fill="${C.ink}"/><circle cy="-24" r="10" fill="${C.ink}"/>`)}`,
  });

  // News section top left: the edge of an unfolded paper and a big musical note crossing the screen
  // A narrow paper strip that appears only on phones between Services and News — white paper rises diagonally over a mustard background with one headphone set placed on it (original 107px)
  // A narrow paper strip that sits between Services and News on phones only — over a white background, the cream edge of a sheet of paper runs diagonally to the upper right, with headphones on the left (original 107px)
  S.band = () => ({
    vb: "0 0 390 107",
    body: `<rect width="390" height="107" fill="${C.w}"/><path d="M0 22L390 0V12L0 40Z" fill="${C.edge}"/><path d="M0 40L390 12V20L0 50Z" fill="${C.cr}"/>
      ${at(56, 74, 0.62, -14, headphones())}${at(22, 66, 0.4, -20, note8())}`,
  });
  S.news = () => ({
    vb: "0 0 1440 620",
    body: `<path d="M0 0L1440 0L1440 620L0 620Z" fill="${C.w}"/>
      <path d="M0 145C120 260 260 420 370 620L0 620Z" fill="${C.m}"/>
      <path d="M800 620C1000 520 1250 400 1440 295L1440 620Z" fill="${C.m}"/>
      ${at(110, 600, 0.85, 0, bigNote(), 'data-loop="float"')}`,
  });

  // Border into Contact: lower thickness of the book, a big musical note, a person walking with a phone, and a brown floor starting at a slant
  S.toContact = () => ({
    vb: "0 0 1440 365",
    body: `<path d="M370 0L800 0C720 40 650 80 590 110C520 70 450 30 370 0Z" fill="${C.w}"/>
      <path d="M370 0C450 30 520 70 590 110C650 80 720 40 800 0L860 0C770 50 680 100 590 140C500 90 420 40 340 0Z" fill="${C.edge}"/>
      <path d="M352 0C430 36 510 80 590 124C680 82 760 34 830 0" fill="none" stroke="${C.ol}" stroke-width="1.3" stroke-opacity=".5"/>
      <path d="M0 0L340 0C420 40 500 90 590 140C680 100 770 50 860 0L1440 0L1440 244L0 344Z" fill="${C.md}" opacity=".28"/>
      <path d="M0 344L1440 244L1440 365L0 365Z" fill="${C.ink}"/>
      ${at(150, 230, 0.9, 10, bigNote(), 'data-loop="float"')}
      ${at(730, 296, 1.45, -4, fig({ pose: "walk", shirt: C.w, pants: C.cr, hair: "short", shadow: false, arms: [[-26, -122, -40, -150, -12, -168], [26, -122, 50, -100, 70, -80]], hold: ["", phone()], loop: ["", "wave"] }), 'data-loop="walk"')}`,
  });

  // End of subpage: the white book page ends revealing its thickness and a large musical note rests over the bottom left (shared by the original About, Results and News)
  S.pageEnd = () => ({
    vb: "0 0 1440 460",
    body: `<path d="M0 0L1440 0L1440 90C1150 150 850 230 620 300C420 360 200 400 0 420Z" fill="${C.w}"/>
      <path d="M0 420C200 400 420 360 620 300C850 230 1150 150 1440 90L1440 132C1150 192 850 272 620 342C420 402 200 442 0 460Z" fill="${C.edge}"/>
      <path d="M0 436C200 416 420 376 620 316C850 246 1150 166 1440 106M0 448C200 428 420 388 620 328C850 258 1150 178 1440 118" fill="none" stroke="${C.ol}" stroke-width="1.3" stroke-opacity=".5"/>
      <path d="M1100 0C1220 30 1340 40 1440 30L1440 90C1340 110 1220 100 1100 70Z" fill="${C.cr}"/>
      ${at(220, 470, 0.95, 4, bigNote(), 'data-loop="float"')}`,
  });

  S.stool = () => ({ vb: "-300 -140 600 720", body: stool() });

  // Subpage header: bookshelf curve flowing down over a mustard background, with one figure on the right
  const headBase = `<path d="M0 300C300 250 650 150 1000 80C1200 45 1350 30 1440 25L1440 570L0 570Z" fill="${C.cr}"/>
    <path d="M0 340C300 290 650 190 1000 120C1200 85 1350 70 1440 65L1440 570L0 570Z" fill="${C.w}"/>
    <path d="M0 340C120 330 220 360 300 420C200 380 100 370 0 380Z" fill="${C.cr}"/>`;
  S.headAbout = () => ({
    vb: "0 0 1440 570",
    body: headBase + `${at(1010, 410, 1.35, 0, fig({ pose: "stand", shirt: C.m, pants: C.w, hair: "short", arms: [[-26, -122, -40, -92, -36, -66], [26, -122, 60, -160, 70, -200]], loop: ["", "wave"] }))}
      ${at(880, 470, 1, 0, cd(20))}${at(940, 500, 1, 0, cd(18, C.cr2))}${at(1060, 470, 1, 0, cd(17))}${at(1180, 230, 0.8, 0, note8(), 'data-loop="float"')}`,
  });
  S.headWorks = () => ({
    vb: "0 0 1440 570",
    body: headBase + `${at(1040, 420, 1.35, 0, fig({ pose: "sit", shirt: C.m, pants: C.cr, hair: "short", arms: [[-26, -88, -50, -60, -40, -46], [26, -88, 30, -60, 6, -54]], loop: ["", "wave"] }))}
      ${at(900, 470, 0.95, -12, card(), 'data-loop="float"')}${at(1180, 500, 1, 14, card())}${at(1210, 420, 0.9, -8, card(), 'data-loop="float" data-i="2"')}`,
  });
  S.headNews = () => ({
    vb: "0 0 1440 570",
    body: headBase + `${at(1030, 400, 1.35, 0, fig({ pose: "sit", shirt: C.m, pants: C.cr, hair: "bob", arms: [[-26, -88, -50, -70, -30, -64], [26, -88, 50, -70, 30, -64]], hold: [`<path d="M-20 -30L50 -40L56 10L-14 20Z" fill="${C.w}" stroke="${C.ol}"/><path d="M-6 -20L40 -26M-4 -10L42 -16M-2 0L36 -5" stroke="${C.cr2}" stroke-width="2"/>`], headLoop: "bob" }))}
      ${at(1190, 380, 1, 0, `<rect x="-30" y="-24" width="60" height="44" rx="6" fill="${C.ink}"/><circle cx="-10" cy="-2" r="10" fill="${C.cr2}"/><rect x="6" y="-12" width="16" height="4" fill="${C.cr2}"/>`)}
      ${at(1160, 450, 1, 0, cd(16))}`,
  });

  // Placeholder logo for the Contact section service box and header bar (newly drawn sound bars instead of the original logo)
  S.mark = (fill = C.ink, on = C.w) => `<svg class="nsl-mark" viewBox="0 0 92 52" aria-hidden="true"><rect width="92" height="52" fill="${fill}"/>${[10, 22, 14, 34, 26, 40, 18, 30, 12, 24, 8].map((h, i) => `<rect x="${10 + i * 7}" y="${26 - h / 2}" width="3" height="${h}" fill="${on}"/>`).join("")}</svg>`;

  window.BrandArt = {
    C,
    render(root = document) {
      root.querySelectorAll("[data-art]").forEach((host) => {
        const fn = S[host.dataset.art];
        if (!fn) return;
        const { vb, body } = fn();
        host.innerHTML = `<svg viewBox="${vb}" preserveAspectRatio="${host.dataset.fit || "xMidYMid slice"}" aria-hidden="true">${body}</svg>`;
      });
    },
    mark: S.mark,
  };
})();
