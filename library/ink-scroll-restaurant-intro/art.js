// Ink-line drawings of the first page. Redraws the original illustrations (chopsticks, rice bowl, chef, tempura bowl, hand, scroll) as SVG of the same size and brush feel.
(() => {
  // Ink, paper and light ink are skin variables — TNM.paint moves them into style
  const K = "var(--site-brush)";
  const P = "var(--kf-bg)";
  const G = "var(--site-gray-ink)";
  const svg = (vb, body, sw = 2.4) =>
    TNM.paint(`<svg viewBox="${vb}" fill="none" stroke="${K}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`);
  const R = TNM.rng(7);

  // Batter lump: small bumps around a round body give a crispy texture
  const batter = (cx, cy, rx, ry, n = 14, fill = P) => {
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + (i % 2 ? 0.09 : -0.04) + (R() - 0.5) * 0.06;
      d += (i ? "L" : "M") + (cx + Math.cos(a) * rx * k).toFixed(1) + " " + (cy + Math.sin(a) * ry * k).toFixed(1);
    }
    let dots = "";
    for (let i = 0; i < n; i++) dots += `<circle cx="${(cx + (R() - 0.5) * rx * 1.2).toFixed(1)}" cy="${(cy + (R() - 0.5) * ry * 1.1).toFixed(1)}" r="${(1 + R() * 2).toFixed(1)}"/>`;
    return `<path d="${d}Z" fill="${fill}"/><g fill="${K}" stroke="none" opacity=".55">${dots}</g>`;
  };
  const steam = (x, y, s = 1) =>
    `<path d="M${x} ${y}c${-10 * s} ${-12 * s} ${10 * s} ${-20 * s} 0 ${-34 * s}s${8 * s} ${-18 * s} ${2 * s} ${-28 * s}"/>`;

  const ART = {
    chopsticks: () => svg("0 0 170 430",
      `<path d="M44 0 92 356M78 0 104 352" stroke-width="3"/>` +
      `<path d="M30 0c4 26 26 44 58 40 10-1 14 10 4 16-18 10-46 6-62-6" fill="${P}"/>` +
      `<path d="M58 30c6 4 14 6 22 4" stroke-width="1.6"/>` +
      `<g>${batter(98, 382, 38, 34, 16, "var(--site-ink-70)")}</g>` +
      `<path d="M86 360c-6 10-4 22 4 30" stroke="${P}" stroke-width="1.6"/>`),

    ikura: () => svg("0 0 210 150",
      batter(105, 104, 78, 34, 18) +
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI;
        const r = 18 + (i % 3) * 14;
        const x = 105 + Math.cos(a + 0.2) * r * 1.3, y = 70 - Math.sin(a) * r * 0.55;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="var(--site-ink-64)"/><circle cx="${(x - 3).toFixed(1)}" cy="${(y - 3).toFixed(1)}" r="2" fill="${P}" stroke="none"/>`;
      }).join("")),

    shell: () => svg("0 0 200 150",
      `<path d="M100 140 20 70C30 24 70 6 100 6s70 18 80 64Z" fill="${P}"/>` +
      Array.from({ length: 7 }, (_, i) => {
        const a = Math.PI * (1.12 + i * 0.128);
        return `<path d="M100 140L${(100 + Math.cos(a) * 128).toFixed(1)} ${(140 + Math.sin(a) * 128).toFixed(1)}" stroke-width="1.6"/>`;
      }).join("") +
      `<path d="M82 140h36l-6 8H88Z" fill="${K}"/>`),

    riceBowl: () => svg("0 0 300 250",
      steam(110, 60, 1.1) + steam(180, 56, 0.9) +
      `<path d="M40 128c10-50 60-74 110-74s100 24 110 74" fill="var(--site-paper-hi)"/>` +
      Array.from({ length: 70 }, () => {
        const a = Math.PI * (1 + R()), r = R() * 100;
        const x = 150 + Math.cos(a) * r, y = 126 + Math.sin(a) * Math.min(r * 0.62, 66);
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6" ry="3.4" transform="rotate(${(R() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" stroke-width="1.3" fill="var(--site-paper-hi)"/>`;
      }).join("") +
      `<path d="M22 128h256c-6 56-56 92-128 92S28 184 22 128Z" fill="${K}"/>` +
      `<path d="M40 150c40 22 180 22 220 0" stroke="${P}" stroke-width="1.4" opacity=".6"/>` +
      `<path d="M112 218h76l-6 18h-64Z" fill="${K}"/>`),

    oldMan: () => svg("0 0 240 300",
      `<path d="M30 300c0-60 30-92 90-100 60 8 90 40 90 100" fill="${P}"/>` +
      `<path d="M80 204l40 70 40-70M96 210l24 44 24-44" />` +
      `<ellipse cx="120" cy="116" rx="56" ry="66" fill="${P}"/>` +
      `<path d="M66 100c-6-30 4-48 20-58M174 100c6-30-4-48-20-58" stroke-width="5" stroke="${G}"/>` +
      `<path d="M62 112c-10 0-12 22 2 26M178 112c10 0 12 22-2 26" fill="${P}"/>` +
      `<path d="M88 112q10-8 20 0M132 112q10-8 20 0"/>` +
      `<path d="M96 150q24 18 48 0" />` +
      `<path d="M92 84c10-6 20-6 30 0M98 70c14-6 30-6 44 0M114 132l6 8" stroke-width="1.6"/>` +
      `<path d="M78 136c4 10 8 14 14 16M162 136c-4 10-8 14-14 16" stroke-width="1.4"/>`),

    lidHand: () => svg("0 0 220 200",
      `<ellipse cx="110" cy="80" rx="96" ry="58" fill="var(--site-paper-dk)"/>` +
      `<ellipse cx="110" cy="80" rx="70" ry="40" stroke-width="1.4"/><ellipse cx="110" cy="80" rx="42" ry="24" stroke-width="1.4"/>` +
      `<path d="M96 68h28v14H96Z" fill="${K}"/>` +
      `<path d="M70 196c-4-30 2-60 18-82 8-10 18-8 20 2l-4 24c8-14 26-16 28-2 12-8 24-2 22 10 10-2 18 6 12 18-10 22-30 30-50 30" fill="${P}"/>` +
      `<path d="M104 140c4 8 4 16 0 22M130 140c4 8 4 16 0 22" stroke-width="1.4"/>`),

    chef: () => svg("0 0 340 420",
      `<path d="M40 420c4-90 40-140 120-150 80 10 116 60 120 150" fill="var(--site-paper-hi)"/>` +
      `<path d="M120 276l40 60 40-60" fill="var(--site-paper-hi)"/><path d="M160 336v84" stroke-width="1.6"/>` +
      `<ellipse cx="166" cy="170" rx="66" ry="80" fill="${P}"/>` +
      `<path d="M100 150c-6-60 30-92 70-92s76 30 64 92c-10-30-30-42-60-40-34 2-56 14-74 40Z" fill="${K}"/>` +
      `<path d="M98 168c-12 0-14 26 2 30" fill="${P}"/>` +
      `<path d="M132 168q12-10 24 0M184 168q12-10 24 0" stroke-width="2.8"/>` +
      `<path d="M136 210q30 24 60 0q-30 10-60 0Z" fill="var(--site-paper-hi)"/>` +
      `<path d="M166 176l-4 20h8" stroke-width="1.6"/>` +
      `<path d="M14 120h110v40H14Z" fill="var(--site-paper-hi)" transform="rotate(-14 70 140)"/>` +
      `<g transform="rotate(-14 70 140)">${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 26}" y="126" width="20" height="28" rx="4" fill="var(--site-paper-dd)"/><path d="M${22 + i * 26} 132h16" stroke-width="1.2"/>`).join("")}</g>` +
      `<path d="M60 190c-14-10-18-30-6-40l40-6c14 2 18 22 6 32-14 12-28 20-40 14Z" fill="${K}"/>` +
      `<path d="M300 260c12-40 6-70-10-78-20-8-34 10-30 36 4 30 18 52 40 42Z" fill="${K}"/>` +
      `<path d="M286 210c-20-30-46-40-60-32" stroke-width="2"/>`),

    tendon: () => svg("0 0 340 370",
      steam(120, 70, 1) + steam(220, 64, 0.9) + steam(170, 52, 1.2) +
      `<path d="M150 170 128 70l18-6 22 104Z" fill="var(--site-ink-70)"/><path d="M128 70c-10-14-4-32 12-34 4 12 8 22 6 28" fill="${K}"/>` +
      `<path d="M196 168l32-90 16 6-26 92Z" fill="var(--site-ink-70)"/><path d="M228 78c2-18 18-26 30-18-4 12-10 20-14 24" fill="${K}"/>` +
      batter(120, 176, 58, 34, 16) + batter(214, 172, 62, 36, 16) + batter(168, 196, 64, 30, 16) +
      `<path d="M50 196h240c-8 64-58 98-120 98S58 260 50 196Z" fill="var(--site-paper-hi)"/>` +
      `<path d="M70 222c50 18 150 18 200 0" stroke-width="1.4"/>` +
      `<path d="M134 290h72l-4 14h-64Z" fill="${K}"/>` +
      `<path d="M20 370c0-40 14-74 40-90 18-10 38-6 46 8l-10 22c-10 0-22 8-30 22" fill="${P}"/>` +
      `<path d="M320 370c0-40-14-74-40-90-18-10-38-6-46 8l10 22c10 0 22 8 30 22" fill="${P}"/>`),

    hands: () => svg("0 0 200 260",
      `<path d="M40 260c0-50 8-96 30-130 14-22 34-24 40-10l-6 30c12-20 34-24 38-8 14-8 30 0 26 16 12 0 20 12 12 26-22 40-60 56-92 76" fill="${P}"/>` +
      `<path d="M30 260c4-30 10-50 22-66" stroke-width="1.6"/>` +
      `<path d="M106 150c6 10 6 22 0 30M140 150c6 10 6 22 0 30" stroke-width="1.4"/>`),

    plate: () => svg("0 0 185 200",
      steam(70, 60, 0.7) + steam(116, 56, 0.6) +
      batter(70, 132, 34, 22, 14) + batter(118, 126, 30, 24, 14) +
      `<path d="M8 168c10-14 158-14 170 0-8 18-158 18-170 0Z" fill="var(--site-paper-hi)"/>` +
      `<path d="M10 172c40 10 126 10 166 0" stroke-width="1.4"/>`),

    chopsticksLong: () => svg("0 0 334 160",
      `<path d="M0 30 330 120M0 54 326 132" stroke-width="3"/>` +
      `<path d="M0 10c40 4 70 18 82 40 4 10-6 16-16 10C46 44 22 40 0 42" fill="${P}"/>` +
      `<path d="M30 20c12 2 22 8 30 16" stroke-width="1.4"/>`),
  };

  // Scroll-roll axis: frame 0 is the rolled shape with a label, frames 1–7 are the axis rolling (the bright grain shifts one frame at a time) — stepped with steps(7) like the original.
  const roller = () => {
    const frames = Array.from({ length: 8 }, (_, i) => {
      const x = i * 107;
      const cap = `<rect x="${x + 20}" y="0" width="67" height="22" rx="8" fill="${K}"/><rect x="${x + 20}" y="382" width="67" height="22" rx="8" fill="${K}"/>`;
      const body = `<rect x="${x + 12}" y="18" width="83" height="368" rx="10" fill="${K}"/>`;
      if (i === 0) {
        return cap + body +
          `<rect x="${x + 30}" y="70" width="47" height="264" fill="${P}"/>` +
          `<rect x="${x + 34}" y="74" width="39" height="256" fill="none" stroke="${K}" stroke-width="1.5"/>` +
          ["Prize", "Call"].map((c, k) => `<text x="${x + 53.5}" y="${128 + k * 44}" fill="${K}" font-family="var(--kf-font-display)" font-size="34" font-weight="700" text-anchor="middle">${c}</text>`).join("") +
          `<text x="${x + 53.5}" y="304" fill="${K}" font-family="var(--kf-font-sans)" font-size="7" text-anchor="middle">LOGO</text>`;
      }
      const hl = 22 + ((i - 1) / 6) * 54;
      return cap + body + `<rect x="${x + 12 + hl}" y="20" width="7" height="364" fill="var(--site-ink-53)"/><rect x="${x + 12 + ((hl + 30) % 76)}" y="20" width="3" height="364" fill="var(--site-ink-60)"/>`;
    }).join("");
    return TNM.paint(`<svg viewBox="0 0 856 404" preserveAspectRatio="none" aria-hidden="true">${frames}</svg>`);
  };

  // Unrolled scroll frame: a window (460×292) where the picture shows through inside a thick ink-colored border, with a thin rod at the right end
  const frame = () =>
    TNM.paint(`<svg viewBox="0 0 518 340" aria-hidden="true"><path fill-rule="evenodd" fill="${K}" d="M0 6h506v328H0ZM29 24v292h460V24Z"/>` +
    `<rect x="506" y="0" width="8" height="340" rx="3" fill="${K}"/><rect x="514" y="20" width="4" height="300" fill="${K}"/></svg>`);

  window.ART = { ...ART, roller, frame };
})();
