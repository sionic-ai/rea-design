/* The original speaks in picture-book hand drawing (thick ink lines + flat color areas) — redraw the same position, size and feel with our own shapes.
   Colors are painted only with the .ill class (--kf-*·--site-*) in shared.css. [data-ill="Name"] Put that image in. */
(() => {
  let seed = 1;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const f = (n) => Math.round(n * 10) / 10;
  const P = (d, c) => `<path class="${c}" d="${d}"/>`;

  // Lumpy masses (tree crowns, bushes, clouds) — split the perimeter into n bumps and join them with quadratic curves bulging outward
  function blob(cx, cy, rx, ry, n, amp, c, s0) {
    if (s0) seed = s0;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      if (!i) { d = `M${f(x)} ${f(y)}`; continue; }
      const m = a - Math.PI / n, k = 1 + amp * (0.7 + rnd() * 0.6);
      d += `Q${f(cx + Math.cos(m) * rx * k)} ${f(cy + Math.sin(m) * ry * k)} ${f(x)} ${f(y)}`;
    }
    return P(d + "Z", c + " o");
  }
  // Bush with a flat bottom — only the semicircle’s rim is inflated
  function bush(x, y, w, h, c, n = 6) {
    let d = `M${f(x)} ${f(y)}`;
    for (let i = 1; i <= n; i++) {
      const a0 = Math.PI + ((i - 1) / n) * Math.PI, a1 = Math.PI + (i / n) * Math.PI, m = (a0 + a1) / 2;
      const ex = x + w / 2 + Math.cos(a1) * w / 2, ey = y + Math.sin(a1) * h;
      const k = 1.25 + rnd() * 0.2;
      d += `Q${f(x + w / 2 + Math.cos(m) * w / 2 * k)} ${f(y + Math.sin(m) * h * k)} ${f(ex)} ${f(ey)}`;
    }
    return P(d + "Z", c + " o");
  }
  const tree = (x, y, r, c = "forest") => P(`M${f(x - r * 0.12)} ${f(y)}V${f(y - r * 1.2)}H${f(x + r * 0.12)}V${f(y)}Z`, "soil o") + blob(x, y - r * 1.55, r * 0.9, r, 9, 0.18, c);
  const pine = (x, y, h, c = "forest") => P(`M${f(x - 5)} ${f(y)}V${f(y - h * 0.3)}H${f(x + 5)}V${f(y)}Z`, "soil o") + blob(x, y - h * 0.62, h * 0.2, h * 0.42, 12, 0.12, c);
  const trunk = (x, y, h, w = 14) => P(`M${f(x - w / 2)} ${f(y)}L${f(x - w / 2 + 3)} ${f(y - h)}H${f(x + w / 2 - 3)}L${f(x + w / 2)} ${f(y)}Z`, "orange o");
  const grass = (x, y, w, n = 5) => {
    let d = "";
    for (let i = 0; i < n; i++) { const gx = x + (w / n) * i; d += `M${f(gx)} ${f(y)}q${f(w / n * 0.3)} -${f(18 + rnd() * 10)} ${f(w / n * 0.8)} -${f(26 + rnd() * 8)}`; }
    return P(d, "ln");
  };
  const ripples = (x, y, w, n = 3, cls = "ln-w") => {
    let d = "";
    for (let i = 0; i < n; i++) { const rx = x + rnd() * w, ry = y + rnd() * 30; d += `M${f(rx)} ${f(ry)}q12 -7 24 0t24 0`; }
    return P(d, cls);
  };
  // Person — head, torso, legs. Held item (prop): rod fishing rod · net net · axe axe · sign house signboard · sapling sapling · wave hand wave
  function person(x, y, s = 1, o = {}) {
    const sh = o.shirt || "water", pa = o.pants || "deep", sk = o.skin || "white";
    const g = [];
    g.push(P(`M${-9} 0V-34M9 0V-34`, "ln"));
    g.push(P(`M-14 -30Q-15 -70 0 -72Q15 -70 14 -30Z`, `${pa} o`));
    g.push(P(`M-15 -48Q-16 -84 0 -86Q16 -84 15 -48Z`, `${sh} o`));
    g.push(`<circle class="${sk} o" cx="0" cy="-100" r="13"/>`);
    g.push(`<circle class="ink" cx="4" cy="-101" r="1.8"/>`);
    if (o.hat) g.push(P(`M-17 -104Q0 -128 17 -104Z`, `${o.hat} o`));
    if (o.prop === "rod") g.push(P(`M10 -70L70 -150`, "ln") + P(`M70 -150Q80 -90 74 -40`, "ln"));
    if (o.prop === "net") g.push(P(`M12 -66L52 -40`, "ln") + blob(62, -32, 16, 12, 7, 0.1, "white"));
    if (o.prop === "axe") g.push(P(`M10 -70L40 -110`, "ln") + P(`M36 -116l12 -6l6 12l-12 6Z`, "dim o"));
    if (o.prop === "sign") g.push(`<rect class="white o" x="12" y="-92" width="44" height="34" rx="3"/>` + P(`M20 -66l14 -14l14 14Z`, "hat o"));
    if (o.prop === "sapling") g.push(P(`M18 -40V-80`, "ln") + blob(18, -88, 10, 8, 6, 0.2, "leaf") + blob(30, -74, 8, 6, 6, 0.2, "leaf"));
    if (o.prop === "wave") g.push(P(`M12 -78L28 -104`, "ln"));
    else g.push(P(`M-12 -76L-20 -54M12 -76L20 -56`, "ln"));
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})">${g.join("")}</g>`;
  }
  const swimmer = (x, y, s = 1, sh = "orange", flip) =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${flip ? -s : s} ${s})">${P("M-30 -6Q-10 -24 14 -14L40 -30", "ln")}${P("M-14 -12Q0 -28 18 -18Q10 -2 -14 -12Z", `${sh} o`)}<circle class="white o" cx="26" cy="-26" r="11"/>${P("M-46 0q10 -6 20 0t20 0t20 0", "ln-w")}</g>`;
  function cow(x, y, s = 1) {
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-40 0V22M-22 0V24M18 0V22M34 0V22", "ln")}${blob(0, -6, 46, 26, 10, 0.06, "soil")}${P("M38 -26Q66 -34 66 -8Q62 12 42 6Z", "soil o")}<circle class="white o" cx="56" cy="-2" r="8"/>${P("M42 -30l-6 -12M58 -32l6 -12", "ln")}<circle class="ink" cx="52" cy="-18" r="2.4"/></g>`;
  }
  const hen = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-14 0Q-20 -24 0 -24Q4 -40 14 -34Q22 -20 12 -4Q4 4 -14 0Z", "white o")}${P("M8 -38l4 -8l4 8", "hat o")}${P("M-4 0v8M4 0v8", "ln")}</g>`;
  function fish(x, y, s = 1, flip, rot = 0) {
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${flip ? -s : s} ${s})">${P("M-70 0Q-30 -40 30 -22Q60 -12 70 2Q56 20 20 22Q-36 30 -70 0Z", "meadow o")}${P("M-70 0L-96 -22Q-90 2 -96 24Z", "meadow o")}${P("M-20 -24Q-6 -42 14 -26", "leaf o")}<circle class="hat" cx="-26" cy="-4" r="4"/><circle class="hat" cx="-6" cy="4" r="3.5"/><circle class="hat" cx="14" cy="-6" r="3.5"/><circle class="leaf o" cx="-40" cy="6" r="6"/><circle class="leaf o" cx="-12" cy="-12" r="6"/><circle class="leaf o" cx="8" cy="10" r="5"/><circle class="white o" cx="46" cy="-4" r="7"/><circle class="ink" cx="48" cy="-4" r="3"/>${P("M58 10q6 2 10 -4", "ln")}</g>`;
  }
  // Our mascot — a white bean-shaped body with an orange acorn cap. pose: sit sitting · stand standing · up arms raised stretching · climb climbing
  function mascot(x, y, s = 1, pose = "stand", rot = 0) {
    const sit = pose === "sit", h = sit ? 46 : pose === "up" ? 74 : 64;
    const body = P(`M-20 0Q-24 -${h} 0 -${h + 4}Q24 -${h} 20 0Q0 6 -20 0Z`, "white o");
    const cap = P(`M-30 -${h - 4}Q-28 -${h + 34} 2 -${h + 36}Q32 -${h + 32} 32 -${h - 6}Q4 -${h - 14} -30 -${h - 4}Z`, "hat o") + P(`M-6 -${h + 30}l-4 -10`, "ln");
    const eyes = `<circle class="ink" cx="8" cy="-${h - 18}" r="2.6"/><circle class="ink" cx="17" cy="-${h - 19}" r="2.2"/>`;
    const arms = pose === "up" ? P(`M-14 -${h - 26}L-22 -${h + 14}M14 -${h - 26}L22 -${h + 14}`, "ln") : pose === "climb" ? P(`M14 -${h - 30}L34 -${h - 46}M-12 -${h - 30}L-4 -${h - 50}`, "ln") : P(`M-16 -${h - 30}L-26 -${h - 46}M16 -${h - 30}L26 -${h - 46}`, "ln");
    const legs = sit ? P("M-10 0q-4 8 4 10M10 0q4 8 -4 10", "ln") : P("M-8 0v8M8 0v8", "ln");
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})">${legs}${body}${arms}${eyes}${cap}</g>`;
  }
  const boat = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-90 -20H90L70 10H-70Z", "orange o")}${P("M-90 -20H90", "ln")}${P("M-60 -6h120", "ln")}</g>`;
  function house(x, y, s = 1, roof = "hat") {
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-70 0V-70H70V0Z", "sun o")}${P("M-86 -64L0 -130L86 -64Z", `${roof} o`)}<rect class="white o" x="-46" y="-50" width="26" height="26"/><rect class="white o" x="20" y="-50" width="26" height="26"/><rect class="soil o" x="-12" y="-40" width="24" height="40"/></g>`;
  }
  const car = (x, y, s = 1, c = "water") => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-40 -10V-26H-20L-10 -42H20L30 -26H40V-10Z", `${c} o`)}<circle class="ink" cx="-22" cy="-8" r="7"/><circle class="ink" cx="22" cy="-8" r="7"/></g>`;
  const truck = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-80 -14V-54H30V-14Z", "orange o")}${P("M30 -14V-44H56L70 -26V-14Z", "water o")}${P("M-70 -54L-50 -76H20L30 -54", "soil o")}<circle class="ink" cx="-50" cy="-10" r="9"/><circle class="ink" cx="46" cy="-10" r="9"/></g>`;
  const castle = (x, y, s = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${P("M-50 0V-50H50V0Z", "white o")}${P("M-66 -48L0 -80L66 -48Z", "deep o")}${P("M-34 -80V-110H34V-80Z", "white o")}${P("M-48 -108L0 -136L48 -108Z", "deep o")}${P("M-20 -136V-150H20V-136Z", "white o")}${P("M-30 -148L0 -168L30 -148Z", "deep o")}</g>`;
  const mountain = (x, y, w, h, c = "orange") => P(`M${f(x)} ${f(y)}L${f(x + w * 0.42)} ${f(y - h)}Q${f(x + w / 2)} ${f(y - h - 8)} ${f(x + w * 0.58)} ${f(y - h)}L${f(x + w)} ${f(y)}Z`, `${c} o`);
  const waveBand = (W, y, amp, per, c) => {
    let d = `M0 ${y}`, x = 0, sg = 1;
    while (x < W) { d += `Q${f(x + per / 2)} ${f(y + amp * sg * 2)} ${f(Math.min(W, x + per))} ${y}`; x += per; sg = -sg; }
    return P(d + `V${y + 2000}H0Z`, c + " o");
  };
  const svg = (w, h, body, extra = "") => `<svg viewBox="0 0 ${w} ${h}" ${extra} aria-hidden="true" focusable="false">${body}</svg>`;

  // Four hero scenes — like the original fv01~04, hills and fields on top, a river on the bottom half. People and animals are placed differently per scene
  function landscape(kind) {
    seed = { farm: 7, wheel: 19, sand: 31, boat: 43 }[kind];
    const W = 1440, H = 627, g = [];
    g.push(`<rect class="meadow" x="0" y="0" width="${W}" height="${H}"/>`);
    g.push(P("M0 120Q240 30 520 70Q820 110 1040 40Q1260 -10 1440 60V0H0Z", "white"));
    g.push(P("M0 120Q240 30 520 70Q820 110 1040 40Q1260 -10 1440 60", "ln"));
    if (kind === "farm") {
      g.push(P("M430 300Q480 120 700 110Q860 110 900 300Z", "sun o"));
      g.push(P("M990 300Q1000 150 1140 130Q1330 110 1440 140V300Z", "soil o"));
      for (let i = 0; i < 4; i++) g.push(P(`M${1020 + i * 30} ${270 - i * 30}Q${1200} ${240 - i * 34} ${1400} ${250 - i * 30}`, "leaf o"));
      g.push(P("M20 290Q40 180 220 170Q380 170 400 290Z", "sun o"));
      g.push(cow(560, 190, 1) + cow(820, 170, 0.9) + cow(720, 240, 1));
      g.push(hen(650, 200, 1) + hen(740, 190, 0.9) + hen(620, 250, 1) + hen(820, 240, 1));
      g.push(person(160, 270, 1.05, { shirt: "soil", pants: "deep" }) + person(205, 265, 1.15, { shirt: "water", pants: "water" }) + person(260, 262, 1.05, { shirt: "orange", pants: "orange", prop: "sign" }));
      g.push(person(1070, 220, 0.6, { shirt: "dim", pants: "dim" }) + person(1290, 300, 0.75, { shirt: "orange", pants: "orange", prop: "wave" }));
    }
    if (kind === "wheel") {
      g.push(P("M300 290Q360 150 560 140Q760 150 800 290Z", "sun o"));
      g.push(`<circle class="soil o" cx="700" cy="210" r="86"/><circle class="sun o" cx="700" cy="210" r="56"/>`);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.push(P(`M700 210L${f(700 + Math.cos(a) * 86)} ${f(210 + Math.sin(a) * 86)}`, "ln")); }
      g.push(house(860, 290, 0.9, "deep"));
      g.push(person(240, 300, 1.1, { shirt: "leaf", pants: "deep", prop: "rod", hat: "sun" }) + person(1020, 410, 1.2, { shirt: "orange", pants: "deep", prop: "net", hat: "white" }) + person(1180, 300, 1.1, { shirt: "water", pants: "soil", prop: "rod" }));
    }
    if (kind === "sand") {
      g.push(P("M0 330Q300 250 640 300Q900 340 1100 280Q1300 230 1440 260V360H0Z", "sun o"));
      g.push(P("M120 300l40 -40l40 40Z", "orange o") + P("M1180 300l50 -60l50 60Z", "hat o"));
      g.push(person(160, 330, 0.8, { shirt: "hat", pants: "deep", prop: "wave" }) + person(260, 340, 0.8, { shirt: "leaf", pants: "deep" }) + person(1120, 320, 0.85, { shirt: "water", pants: "orange", prop: "wave" }) + person(1260, 320, 0.8, { shirt: "blossom", pants: "deep" }));
    }
    if (kind === "boat") {
      g.push(P("M0 220Q300 160 700 200Q1100 240 1440 180V330H0Z", "leaf o"));
      g.push(castle(240, 220, 0.6));
    }
    // Forest band and trees
    for (let i = 0; i < 10; i++) g.push(tree(40 + i * 150 + rnd() * 60, 300 + rnd() * 20, 38 + rnd() * 22, i % 3 ? "forest" : "leaf"));
    if (kind === "farm") g.push(trunk(415, 310, 260, 22));
    g.push(bush(-40, 360, 520, 70, "leaf", 9) + bush(420, 362, 420, 60, "leaf", 8) + bush(820, 360, 680, 70, "leaf", 10));
    for (let i = 0; i < 12; i++) g.push(grass(60 + i * 120, 356, 60, 4));
    // River
    g.push(P("M0 380Q360 350 720 372Q1080 394 1440 366V627H0Z", "water"));
    if (kind !== "boat") g.push(P("M760 372Q1080 394 1440 366V352Q1100 380 760 360Z", "sun o"));
    for (let i = 0; i < 14; i++) g.push(ripples(rnd() * 1400, 400 + rnd() * 200, 40, 1));
    if (kind === "farm") g.push(swimmer(1030, 420, 1, "white") + swimmer(1170, 410, 1, "hat", true) + swimmer(1330, 420, 0.8, "orange"));
    if (kind === "sand") g.push(swimmer(560, 440, 1, "sun") + swimmer(900, 470, 1.1, "orange", true) + fish(340, 520, 0.6, true));
    if (kind === "boat") g.push(`<g transform="translate(1180 470)">${boat(0, 0, 1.6)}${person(-60, -30, 0.8, { shirt: "white", pants: "deep", hat: "sun" })}${person(10, -30, 0.8, { shirt: "orange", pants: "deep" })}${person(80, -30, 0.8, { shirt: "leaf", pants: "deep", prop: "wave" })}</g>` + fish(300, 500, 0.7));
    if (kind === "wheel") g.push(fish(620, 520, 0.6, true) + fish(980, 560, 0.5));
    return svg(W, H, g.join(""), 'preserveAspectRatio="xMidYMid slice"');
  }

  // Mascot sequence of 15 frames (793×293 each) — like the original sprite, it sits riding the fish, sways, then dives in
  function sprite() {
    const FW = 793, FH = 293, out = [];
    const frames = [
      { fy: 248, fr: 0, m: [330, 232, 0.95, "climb", -40] },
      { fy: 240, fr: 0, m: [350, 212, 1, "climb", -18] },
      { fy: 236, fr: -4, m: [372, 200, 1, "up", 0] },
      { fy: 234, fr: -2, m: [380, 200, 1, "stand", 0] },
      { fy: 236, fr: 0, m: [384, 206, 1, "sit", 0], ring: 1 },
      { fy: 240, fr: 0, m: [384, 210, 1, "sit", 0], ring: 1 },
      { fy: 236, fr: -8, m: [384, 196, 1, "stand", 0] },
      { fy: 234, fr: -4, m: [384, 194, 1, "stand", 4] },
      { fy: 236, fr: -6, m: [386, 192, 1, "up", 0] },
      { fy: 222, fr: -28, m: [520, 110, 1, "up", 60], splash: 1 },
      { fy: 224, fr: -24, m: [560, 150, 1, "up", 110], splash: 1 },
      { fy: 236, fr: -6, m: [600, 210, 1, "up", 140] },
      { fy: 244, fr: 0, m: [632, 262, 0.95, "up", 160] },
      { fy: 246, fr: 0, m: [660, 276, 0.9, "sit", 170] },
      { fy: 246, fr: 0, m: null },
    ];
    frames.forEach((fr, i) => {
      seed = 101 + i;
      const g = [];
      g.push(fish(390, fr.fy, 1.25, false, fr.fr));
      if (fr.m) g.push(mascot(...fr.m));
      g.push(P(`M250 ${fr.fy + 18}q20 -10 40 0t40 0t40 0t40 0t40 0t40 0t40 0`, "ln"));
      if (fr.ring) g.push(P(`M230 ${fr.fy + 32}q20 -8 40 0t40 0M480 ${fr.fy + 30}q20 -8 40 0t40 0`, "ln"));
      if (fr.splash) g.push(P(`M260 ${fr.fy - 10}q-10 -30 6 -40M540 ${fr.fy - 20}q14 -20 30 -14M600 ${fr.fy + 16}q20 -10 40 0t40 0`, "ln"));
      out.push(`<g transform="translate(${i * FW} 0)">${g.join("")}</g>`);
    });
    return svg(FW * 15, FH, out.join(""), 'preserveAspectRatio="xMinYMid meet"');
  }

  const draw = {
    "scene-farm": () => landscape("farm"),
    "scene-wheel": () => landscape("wheel"),
    "scene-sand": () => landscape("sand"),
    "scene-boat": () => landscape("boat"),
    "mascot-sprite": sprite,
    // Round picture-book button at the Hero bottom right — yellow disc, two faces, blue ”Read more” band
    "book-badge": () => svg(226, 226, `<circle class="ink" cx="115" cy="115" r="106" style="opacity:.25"/><circle class="sun o" cx="111" cy="111" r="104" style="stroke-width:5"/>${mascot(30, 132, 0.6, "stand", 18)}${fish(204, 116, 0.34, true, -20)}`),
    "mascot-rock": () => { seed = 5; return svg(380, 248, `${P("M0 176Q120 150 260 166Q380 182 380 248H0Z", "water")}${blob(110, 168, 100, 40, 10, 0.1, "orange")}${blob(255, 180, 70, 30, 8, 0.1, "orange")}${blob(40, 140, 46, 24, 7, 0.1, "sun")}${mascot(122, 140, 1.15, "stand")}${ripples(20, 205, 300, 4, "ln")}`); },
    "farmer-plant": () => { seed = 9; return svg(188, 200, `${person(80, 190, 1.4, { shirt: "leaf", pants: "soil", prop: "sapling", hat: "sun" })}${bush(20, 196, 160, 30, "leaf", 5)}`); },
    "fisher-boat": () => { seed = 11; return svg(342, 220, `${P("M0 170q30 -14 60 0t60 0t60 0t60 0t60 0t60 0", "ln")}${boat(170, 160, 1.3)}${person(150, 140, 0.95, { shirt: "white", pants: "deep", prop: "net", hat: "sun" })}${P("M240 150Q300 210 330 200", "ln")}`); },
    "fish-jump": () => { seed = 13; return svg(421, 750, `${bush(-60, 330, 520, 300, "orange", 7)}${bush(60, 200, 420, 170, "sun", 6)}${blob(300, 560, 190, 150, 12, 0.05, "water")}${fish(250, 520, 1.25, false, -22)}${ripples(150, 600, 220, 4)}`); },
    "bush-orange": () => { seed = 17; return svg(300, 260, `${bush(0, 260, 300, 140, "orange", 7)}${bush(80, 160, 220, 90, "sun", 6)}`); },
    "woodcutter": () => { seed = 21; return svg(116, 150, `${person(60, 146, 1.05, { shirt: "orange", pants: "deep", prop: "axe", hat: "sun" })}`); },
    "kids-two": () => { seed = 23; return svg(172, 160, `${person(50, 156, 1.1, { shirt: "hat", pants: "deep", prop: "wave" })}${person(120, 156, 1, { shirt: "leaf", pants: "water" })}`); },
    "people-two": () => { seed = 25; return svg(200, 190, `${person(60, 186, 1.25, { shirt: "water", pants: "deep" })}${person(140, 186, 1.2, { shirt: "orange", pants: "soil", prop: "wave", flip: 1 })}`); },
    "angler": () => { seed = 27; return svg(240, 240, `${person(70, 236, 1.3, { shirt: "sun", pants: "water", prop: "rod", hat: "hat" })}${P("M160 60Q200 140 190 236", "ln")}`); },
    // Village band at the bottom of the home page / end of About — original service_band: pink hill, red-roof house, castle, truck, gray cityscape
    "town-band": () => {
      seed = 61; const g = [];
      g.push(`<rect class="meadow" x="0" y="0" width="1440" height="320"/>`);
      g.push(P("M0 90Q200 40 420 80Q600 110 720 60V0H0Z", "blossom o"));
      g.push(P("M720 60Q900 20 1100 70Q1300 110 1440 70V0H720Z", "line o"));
      g.push(P("M720 120H1440V320H720Z", "line o"));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) g.push(`<rect class="white o" x="${760 + c * 110}" y="${140 + r * 56}" width="80" height="36" rx="4"/>`);
      g.push(house(320, 220, 1.4, "hat") + castle(720, 140, 0.9) + truck(980, 300, 1.1) + car(1240, 300, 1, "water") + car(1360, 300, 1, "orange"));
      for (let i = 0; i < 8; i++) g.push(tree(30 + i * 90, 310, 34 + rnd() * 14, i % 2 ? "leaf" : "forest"));
      g.push(bush(-20, 320, 400, 60, "leaf", 8) + bush(380, 320, 360, 50, "blossom", 7));
      g.push(person(560, 300, 0.9, { shirt: "orange", pants: "deep", prop: "wave" }) + person(620, 300, 0.85, { shirt: "water", pants: "deep" }));
      return svg(1440, 320, g.join(""), 'preserveAspectRatio="xMidYMid slice"');
    },
    // Footer band — original f_bg: blue water below an orange mountain ridge, two fish jump up
    "footer-band": () => {
      seed = 71; const g = [];
      for (let i = 0; i < 9; i++) g.push(mountain(-80 + i * 175 + rnd() * 30, 154, 230 + rnd() * 60, 50 + rnd() * 40, i % 3 ? "orange" : "hat"));
      g.push(waveBand(1300, 110, 6, 90, "water"));
      g.push(fish(470, 108, 0.7, false, -12) + fish(820, 96, 0.5, true, 10));
      g.push(ripples(300, 120, 700, 5));
      return svg(1300, 154, g.join(""), 'preserveAspectRatio="none"');
    },
    // About first section map — original about_map: watercolor map, small location map at top left. Our shape map goes in the same spot
    "basin-map": () => {
      seed = 81; const g = [];
      g.push(`<rect class="sky" x="0" y="0" width="1100" height="580" rx="20"/>`);
      g.push(blob(620, 260, 420, 230, 16, 0.08, "meadow"));
      g.push(blob(860, 160, 140, 120, 10, 0.1, "leaf"));
      g.push(blob(470, 330, 170, 120, 10, 0.08, "sun"));
      g.push(blob(720, 380, 150, 100, 10, 0.08, "meadow"));
      g.push(P("M780 90Q700 200 640 260Q560 340 520 470Q500 520 480 580", "ln") + P("M780 90Q700 200 640 260Q560 340 520 470Q500 520 480 580", "ln-w"));
      for (let i = 0; i < 9; i++) g.push(mountain(700 + rnd() * 320, 120 + rnd() * 260, 50, 46, "forest"));
      g.push(`<circle class="hat o" cx="790" cy="96" r="18"/>`);
      g.push(P("M0 470Q200 440 420 500Q700 560 1100 480V580H0Z", "water"));
      g.push(`<rect class="white o" x="24" y="24" width="250" height="400" rx="10"/>`);
      g.push(blob(150, 230, 80, 170, 12, 0.08, "meadow"));
      g.push(`<circle class="hat" cx="110" cy="370" r="10"/>`);
      return svg(1100, 580, g.join(""));
    },
    "mountain-deco": () => { seed = 91; return svg(600, 200, `${bush(-40, 200, 300, 120, "forest", 7)}${bush(160, 200, 280, 90, "leaf", 7)}${bush(380, 200, 260, 70, "blossom", 6)}${tree(120, 190, 40, "leaf")}${tree(300, 196, 34, "forest")}`); },
    "trees-deco": () => { seed = 93; return svg(618, 235, `${bush(0, 235, 618, 110, "leaf", 10)}${tree(90, 220, 52, "forest")}${tree(230, 214, 60, "leaf")}${tree(360, 226, 46, "forest")}${house(500, 200, 0.75, "hat")}${person(420, 226, 0.7, { shirt: "orange", pants: "deep", hat: "sun", prop: "wave" })}`); },
    "hill-house": () => { seed = 33; return svg(722, 457, `${P("M0 457V250Q180 120 360 170Q560 220 722 120V457Z", "leaf o")}${P("M0 457V330Q220 260 420 300Q600 340 722 280V457Z", "meadow o")}${house(360, 230, 1.1, "hat")}${tree(120, 300, 50, "forest")}${tree(220, 260, 44, "leaf")}${tree(560, 230, 56, "forest")}${tree(660, 200, 40, "leaf")}${bush(40, 457, 260, 80, "forest", 6)}${bush(420, 457, 280, 70, "blossom", 6)}`); },
    "swimmers": () => { seed = 37; return svg(277, 120, `${P("M0 80q20 -10 40 0t40 0t40 0t40 0t40 0t40 0t40 0", "ln")}${swimmer(60, 80, 0.9, "orange")}${swimmer(150, 76, 0.9, "hat", true)}${swimmer(230, 82, 0.8, "sun")}`); },
    "town-house": () => { seed = 95; return svg(500, 240, `${bush(0, 240, 500, 80, "leaf", 8)}${house(250, 220, 1.2, "hat")}${tree(70, 230, 40, "forest")}${tree(430, 230, 44, "leaf")}`); },
    "truck": () => { seed = 97; return svg(220, 100, truck(110, 92, 1.1)); },
    "speech": () => svg(260, 150, `${P("M20 20Q130 0 240 20Q260 70 240 110Q140 130 70 112L30 140L44 106Q8 80 20 20Z", "sun o")}`),
    "builder": () => { seed = 99; return svg(330, 240, `${house(170, 230, 1.1, "deep")}${person(40, 236, 0.9, { shirt: "orange", pants: "deep", prop: "wave" })}${person(300, 236, 0.9, { shirt: "leaf", pants: "deep", hat: "sun", flip: 1 })}`); },
  };

  const paint = (root = document) => {
    root.querySelectorAll("[data-ill]:not([data-ill-done])").forEach((el) => {
      const fn = draw[el.dataset.ill];
      if (!fn) return;
      el.insertAdjacentHTML("beforeend", fn());
      el.dataset.illDone = "";
    });
  };
  window.NB_ILL = { paint };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => paint());
  else paint();
})();
