// SVG generators that redraw the spots the original conveys with images (tuna illustration, golden city, harbor map, seasonal calendar) at the same spots and ratios.
(() => {
  const NM = window.NM;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // The gold art takes brightness, saturation and hue from the sentence’s gold (--site-gold), and the red building from the accent color — they change together when the skin is swapped
  const g = (l, c, h = 0) => `oklch(from var(--site-gold) calc(l * ${l}) calc(c * ${c}) calc(h + ${h}))`;
  const red = (l, c, h = 0) => `oklch(from var(--kf-accent) calc(l * ${l}) calc(c * ${c}) calc(h + ${h}))`;
  const SERIF = "font-family:var(--kf-font-display)";
  const TUNA = { back: "#1c2a44", mid: "#40577a", belly: "#b8c3cf", white: "#eef1f3", fin: "#2a3550", tail: "#c9b04a", finlet: "#e2c13c", pec: "#1e2b43", eye: "#e8edf0", pupil: "#111", gill: "#1a2438" }; // Not skin: the tuna side view’s own body color — it is drawn content instead of a photo, so it doesn’t change with the skin

  // Tuna side view: navy back, silver belly, yellow finlets. Only body length and fins change per type
  NM.fish = (kind = 1) => {
    const long = kind === 4 ? 1.08 : kind === 1 ? 1 : 0.96;
    const fin = kind === 3 ? 34 : kind === 4 ? 10 : 18;
    const pec = kind === 4 ? 70 : 34;
    return `<svg viewBox="0 0 420 170" aria-hidden="true"><defs>
      <linearGradient id="fb${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TUNA.back}"/><stop offset=".42" stop-color="${TUNA.mid}"/><stop offset=".55" stop-color="${TUNA.belly}"/><stop offset="1" stop-color="${TUNA.white}"/></linearGradient></defs>
      <g transform="scale(${long} 1)">
      <path d="M18 92 Q60 46 170 44 Q270 42 330 74 L372 54 L392 30 L382 84 L396 138 L370 112 L330 104 Q262 136 170 136 Q66 134 18 92Z" fill="url(#fb${kind})"/>
      <path d="M150 46 L176 ${46 - fin} L200 44Z M240 50 L262 ${30 - fin / 2} L272 56Z" fill="${TUNA.fin}"/>
      <path d="M232 128 L256 ${150 + fin / 2} L270 124Z" fill="${TUNA.tail}"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${282 + i * 9} 58 l4 -6 l4 6Z M${282 + i * 9} 122 l4 6 l4 -6Z" fill="${TUNA.finlet}"/>`).join("")}
      <path d="M118 96 Q${118 + pec} 102 ${150 + pec} 92 Q140 92 118 96Z" fill="${TUNA.pec}"/>
      <circle cx="56" cy="80" r="7" fill="${TUNA.eye}"/><circle cx="56" cy="80" r="4" fill="${TUNA.pupil}"/>
      <path d="M90 66 Q102 94 92 120" fill="none" stroke="${TUNA.gill}" stroke-width="2"/>
      </g></svg>`;
  };

  // Golden hill city: rows of small house boxes stacked up. Height and density differ per layer
  NM.city = (layer) => {
    seed = layer === "back" ? 11 : layer === "mid" ? 23 : 37;
    // Original city art heights (at 1440 width) — back 1280 · middle 2000 · front 877. They must be this tall to rise up and cover the sun and text.
    const H = layer === "back" ? 1280 : layer === "mid" ? 2000 : 877;
    const tone = layer === "back" ? [g(1.187, 0.504, 4.6), g(1.126, 0.652, 3), g(1.234, 0.37, 4.4)] : layer === "mid" ? [g(1.071, 0.816, 1.9), g(1.001, 0.867), g(1.158, 0.656, 3.9)] : [g(0.959, 0.891, -3), g(0.881, 0.857, -6), g(1.063, 0.846, 0.3)];
    const hill = layer === "back" ? `M0 ${H} L0 260 Q240 120 520 150 Q760 60 980 90 Q1200 130 1440 70 L1440 ${H}Z` : layer === "mid" ? `M0 ${H} L0 150 Q300 90 640 130 Q980 170 1440 110 L1440 ${H}Z` : `M0 ${H} L0 120 Q420 60 820 90 Q1160 116 1440 80 L1440 ${H}Z`;
    let houses = "";
    const edge = g(0.839, 0.758, -4);
    // The nearer (lower) to the front, the bigger the houses and the wider the row gaps — fill all the way to the edge of the picture with houses
    for (let r = 0, y0 = layer === "back" ? 150 : 110; y0 < H; r++) {
      const k = 1 + r * 0.06;
      for (let x = -20; x < 1460; x += (14 + rnd() * 22) * k) {
        const w = (10 + rnd() * 20) * k, h = (6 + rnd() * 14) * k;
        houses += `<rect x="${x.toFixed(0)}" y="${(y0 + rnd() * 18 * k).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" style="fill:${tone[(rnd() * 3) | 0]};stroke:${edge}" stroke-opacity=".25" stroke-width=".6"/>`;
      }
      y0 += (layer === "back" ? 26 : 30) * k;
    }
    const road = layer === "mid" ? `<path d="M-20 300 Q520 200 1460 250" fill="none" style="stroke:${g(1.265, 0.249, -0.5)}" stroke-width="22"/><path d="M-20 300 Q520 200 1460 250" fill="none" style="stroke:${g(0.959, 0.891, -3)}" stroke-width="1.5" stroke-dasharray="6 8"/>` : "";
    const front = layer === "front" ? `<path d="M0 300 L0 210 Q600 150 1440 200 L1440 300Z" style="fill:var(--kf-bg)" opacity=".85"/>` : "";
    return `<svg viewBox="0 0 1440 ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><path d="${hill}" style="fill:${tone[2]}"/>${houses}${road}${front}</svg>`;
  };

  // Golden harbor map (viewed from an angle): land, pier, waves, three red buildings and name tags
  NM.harbor = () => {
    seed = 51;
    let waves = "";
    for (let i = 0; i < 40; i++) waves += `<path d="M${(rnd() * 760).toFixed(0)} ${(330 + rnd() * 240).toFixed(0)} q8 -4 16 0 q8 4 16 0" fill="none" style="stroke:${g(0.992, 0.794, 0.9)}" stroke-width="1.2" opacity=".6"/>`;
    let boats = "";
    for (let i = 0; i < 9; i++) boats += `<path d="M${(150 + rnd() * 380).toFixed(0)} ${(420 + rnd() * 120).toFixed(0)} l26 -8 l6 6 l-26 8z" style="fill:${g(0.906, 0.832, -2.2)}"/>`;
    const pin = (x, y, t) => `<g><rect x="${x}" y="${y}" width="${t.length * 14 + 20}" height="26" rx="3" style="fill:var(--site-crimson)"/><text x="${x + 10}" y="${y + 18}" font-weight="900" font-size="14" style="fill:var(--kf-on-accent);${SERIF}">${t}</text></g>`;
    return `<svg viewBox="0 0 800 600" aria-hidden="true">
      <rect width="800" height="600" style="fill:${g(1.173, 0.509, 2.9)}"/>
      <path d="M0 0 H800 V230 L560 330 L420 280 L300 360 L0 300Z" style="fill:${g(1.099, 0.642, 1.8)}"/>
      <path d="M300 360 L420 280 L560 330 L620 600 H360Z" style="fill:${g(1.208, 0.479, 3.7)}"/>
      <path d="M0 300 L300 360 L360 600 H0Z" style="fill:${g(1.06, 0.727, 1.7)}"/>
      ${waves}${boats}
      <path d="M430 120 L520 90 L600 130 L510 170Z" style="fill:${g(1.231, 0.423, 4.5)};stroke:${g(0.906, 0.832, -2.2)}"/>
      <path d="M470 150 l40 -14 l30 16 l-40 14z M470 150 v-40 l40 -14 v40 M510 96 l30 16 v40" style="fill:var(--site-crimson);stroke:${red(0.795, 0.78, -0.5)}"/>
      <path d="M600 210 l50 -18 l34 18 l-50 18z M600 210 v-26 l50 -18 v26 M650 166 l34 18 v26" style="fill:${red(1.184, 0.94, 4.9)};stroke:${red(0.795, 0.78, -0.5)}"/>
      <path d="M560 300 l30 -10 l22 12 l-30 10z M560 300 v-16 l30 -10 v16" style="fill:${red(1.184, 0.94, 4.9)};stroke:${red(0.795, 0.78, -0.5)}"/>
      <path d="M380 250 L760 420" style="stroke:${g(1.265, 0.249, -0.5)}" stroke-width="14"/><path d="M380 250 L760 420" style="stroke:${g(0.906, 0.832, -2.2)}" stroke-width="1" stroke-dasharray="5 6"/>
      ${pin(420, 58, "Your market 1 here")}${pin(640, 150, "Market 2")}${pin(600, 262, "Auction house")}${pin(170, 380, "Harbor")}
    </svg>`;
  };

  // Seasonal calendar: Jan–Dec ticks, a pill for each type=Seasonal · Beads=Good snap · dotted line=The ‹Caught› line, this month’s navy pillar
  NM.calendar = (now = new Date().getMonth() + 1) => {
    const rows = [
      { name: "Type 1", c: "var(--site-black)", y: 0, spans: [["dot", 1, 4.6], ["pill", 4.6, 5.5], ["bead", 5.5, 7.4], ["dot", 7.4, 8.4]], tagAt: 4.6 },
      { name: "Type 3", c: "var(--site-gold)", y: 1, spans: [["pill", 1, 1.8], ["bead", 1.8, 4], ["dot", 4, 5], ["bead", 5, 6.6], ["dot", 6.6, 7.6], ["bead", 7.6, 12], ["pill", 12, 13]], tagAt: 1 },
      { name: "Type 2", c: "var(--site-crimson)", y: 2, spans: [["pill", 1, 1.8], ["bead", 1.8, 4], ["dot", 4, 7.6], ["bead", 7.6, 12], ["pill", 12, 13]], tagAt: 1 },
      { name: "Type 4", c: "var(--site-navy)", y: 3, spans: [["bead", 1, 1.6], ["pill", 1.6, 3.2], ["bead", 3.2, 4.6], ["dot", 4.6, 7.6], ["bead", 7.6, 13]], tagAt: 1.6 },
    ];
    const W = 1100, x0 = 40, step = (W - 80) / 12, X = (m) => x0 + (m - 1) * step + step / 2;
    const top = 70, rowH = 50, r0 = 250;
    let s = `<svg viewBox="0 0 ${W} 460" aria-hidden="true">`;
    s += `<defs><linearGradient id="calnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--site-navy)"/><stop offset="1" style="stop-color:var(--site-navy)" stop-opacity="0"/></linearGradient></defs>`;
    s += `<rect x="${X(now) - 16}" y="${top - 6}" width="32" height="${r0 + rowH * 4 - top + 30}" rx="16" fill="url(#calnow)"/>`;
    for (let m = 1; m <= 12; m++) {
      s += `<text x="${X(m)}" y="${top + 14}" text-anchor="middle" font-weight="900" font-size="17" style="fill:${m === now ? "var(--kf-on-accent)" : "var(--kf-ink)"};${SERIF}">${m}</text><text x="${X(m)}" y="${top + 34}" text-anchor="middle" font-weight="700" font-size="12" style="fill:${m === now ? "var(--kf-on-accent)" : "var(--kf-ink)"};${SERIF}">Month</text>`;
      s += `<line x1="${X(m)}" y1="${top + 42}" x2="${X(m)}" y2="${r0 + rowH * 4}" style="stroke:var(--kf-ink)" stroke-width="1"/>`;
    }
    s += `<rect x="${X(now) - 13}" y="${top + 46}" width="26" height="48" rx="13" style="fill:var(--kf-on-accent);stroke:var(--site-navy)"/><text x="${X(now)}" y="${top + 66}" text-anchor="middle" font-weight="900" font-size="11" style="fill:var(--site-navy);${SERIF}">This time</text><text x="${X(now)}" y="${top + 82}" text-anchor="middle" font-weight="900" font-size="11" style="fill:var(--site-navy);${SERIF}">Moon</text>`;
    rows.forEach((r) => {
      const y = r0 + r.y * rowH + (r.y === 0 ? -70 : 0);
      r.spans.forEach(([t, a, b]) => {
        const xa = X(a) - step / 2, xb = X(Math.min(b, 13)) - step / 2;
        if (t === "pill") s += `<rect x="${xa}" y="${y - 8}" width="${xb - xa}" height="16" rx="8" style="fill:${r.c}"/>`;
        else if (t === "dot") s += `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" style="stroke:${r.c}" stroke-width="2.5" stroke-dasharray="2 5"/>`;
        else {
          s += `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" style="stroke:${r.c}" stroke-width="3"/>`;
          for (let x = xa + 7; x < xb - 4; x += 15) s += `<circle cx="${x}" cy="${y}" r="6" style="fill:${r.c}"/>`;
        }
      });
      const tx = X(r.tagAt) - step / 2;
      s += `<rect x="${tx}" y="${y - 11}" width="74" height="22" rx="11" style="fill:${r.c};stroke:var(--kf-on-accent)" stroke-width="2"/><text x="${tx + 37}" y="${y + 5}" text-anchor="middle" font-weight="900" font-size="12" style="fill:var(--kf-on-accent);${SERIF}">${r.name}</text>`;
    });
    return s + "</svg>";
  };
})();
