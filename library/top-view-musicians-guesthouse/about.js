// Hand-drawn neighborhood music map on the About page — draws our own illustration in place of the original big illustrated map (1440×1226).
// Title and distant mountains on the top band, a big road, railway and river running straight to the center, with houses, trees, a concert hall and flowering trees scattered between. Fixed seed so the picture is always the same
(() => {
  const svg = document.querySelector(".tp-town");
  if (!svg || svg.childElementCount) return;
  let a = 91;
  const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = (x, y) => x + (y - x) * rnd();
  const paints = ["coral", "yellow", "sky", "orange", "pink", "sand", "blue", "green"];
  const paint = (k) => `var(--site-paint-${k})`;
  let s = "";
  s += '<rect class="tp-town__land" x="0" y="0" width="1440" height="1226"/>';
  // Distant mountains · hills
  s += '<path class="tp-town__far" d="M0 250C120 150 220 120 330 170 420 90 520 70 640 140 760 60 900 70 1000 150 1110 90 1250 100 1440 190V320H0Z"/>';
  s += '<path class="tp-town__hill" d="M0 330C160 270 300 300 460 280 620 260 760 310 940 290 1110 270 1270 300 1440 280V380H0Z"/>';
  // River, railway, straight avenue, alley
  s += '<path class="tp-town__river" d="M-20 1100C200 1040 300 980 420 900 560 810 700 860 860 800 1020 740 1200 760 1460 690"/>';
  s += '<path class="tp-town__road" d="M760 320 700 1240"/>';
  s += '<path class="tp-town__rail" d="M560 320 380 1240"/>';
  const streets = [];
  for (let y = 420; y < 1200; y += R(110, 150)) streets.push(`M0 ${y.toFixed(0)}C400 ${(y + R(-20, 20)).toFixed(0)} 1000 ${(y + R(-30, 30)).toFixed(0)} 1440 ${(y + R(-20, 20)).toFixed(0)}`);
  for (let x = 120; x < 1440; x += R(220, 300)) if (Math.abs(x - 740) > 80) streets.push(`M${x.toFixed(0)} 360L${(x + R(-60, 60)).toFixed(0)} 1226`);
  s += `<path class="tp-town__street" d="${streets.join("")}"/>`;
  // House — wall rectangle + roof triangle, left empty over rivers and main roads
  const house = (x, y, w, h, k) => {
    const roof = paints[(k + 3) % paints.length];
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><rect class="tp-town__wall" x="0" y="${(h * 0.4).toFixed(1)}" width="${w.toFixed(1)}" height="${(h * 0.6).toFixed(1)}" fill="${paint(paints[k % paints.length])}" rx="2"/><path class="tp-town__roof" d="M-3 ${(h * 0.42).toFixed(1)}L${(w / 2).toFixed(1)} 0 ${(w + 3).toFixed(1)} ${(h * 0.42).toFixed(1)}Z" fill="${paint(roof)}"/><rect x="${(w * 0.4).toFixed(1)}" y="${(h * 0.72).toFixed(1)}" width="${(w * 0.2).toFixed(1)}" height="${(h * 0.28).toFixed(1)}" fill="var(--kf-ink)"/></g>`;
  };
  for (let i = 0; i < 150; i++) {
    const x = R(30, 1380), y = R(400, 1150);
    if (Math.abs(x - (760 - (y - 320) * 0.065)) < 50) continue;
    if (Math.abs(x - (560 - (y - 320) * 0.2)) < 30) continue;
    s += house(x, y, R(34, 60), R(36, 58), i);
  }
  // Trees · flowering trees
  for (let i = 0; i < 130; i++) {
    const x = R(10, 1430), y = R(340, 1210), r = R(10, 20);
    s += `<circle class="${i % 7 === 0 ? "tp-town__bloom" : "tp-town__tree"}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"/>`;
  }
  // Neighborhood music scene — people sitting around inside a white circle (head dots) and one instrument
  for (let i = 0; i < 14; i++) {
    const cx = R(90, 1350), cy = R(430, 1150), r = R(48, 72);
    let g = `<circle class="tp-town__tag" cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}"/>`;
    const n = 3 + Math.floor(rnd() * 4);
    for (let k = 0; k < n; k++) {
      const t = (k / n) * Math.PI * 2 + R(0, 0.5), d = r * 0.55;
      g += `<circle cx="${(cx + Math.cos(t) * d).toFixed(1)}" cy="${(cy + Math.sin(t) * d).toFixed(1)}" r="7" fill="${paint(paints[(i + k) % paints.length])}"/><circle cx="${(cx + Math.cos(t) * d).toFixed(1)}" cy="${(cy + Math.sin(t) * d).toFixed(1)}" r="3.6" fill="var(--site-paint-navy)"/>`;
    }
    g += `<rect x="${(cx - 12).toFixed(0)}" y="${(cy - 7).toFixed(0)}" width="24" height="14" rx="3" fill="${paint(i % 2 ? "brass" : "wood")}"/>`;
    s += g;
  }
  // Music hall — one big building
  s += `<g transform="translate(980 560)"><rect class="tp-town__wall" x="0" y="40" width="220" height="110" fill="${paint("sand")}" rx="6"/><path class="tp-town__roof" d="M-10 44C60 -10 160 -10 230 44Z" fill="${paint("coral")}"/><rect x="90" y="96" width="40" height="54" fill="var(--kf-ink)"/></g>`;
  // Title band · name tag
  s += '<rect class="tp-town__band" x="40" y="30" width="560" height="84" rx="42"/><text class="tp-town__title" x="80" y="88">Our neighborhood music map</text>';
  const tags = [["Concert hall", 1010, 520], ["Station", 470, 700], ["School", 220, 560], ["Park", 1180, 960], ["Guesthouse", 760, 980]];
  for (const [t, x, y] of tags) {
    const w = 26 + t.length * 16;
    s += `<rect class="tp-town__tag" x="${x}" y="${y}" width="${w}" height="34" rx="17"/><text class="tp-town__tagtext" x="${x + 13}" y="${y + 23}">${t}</text>`;
  }
  svg.innerHTML = s;
})();
