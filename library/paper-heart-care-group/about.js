// Group intro: redraws the policy illustration (three hearts on the center white panel · regional hill on the left · globe on the right · connecting arrows) and the people row under the message
(() => {
  const heart = (x, y, s, fill, label, r = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><use href="#nh-heart-rough" width="200" height="176" x="-100" y="-88" style="fill:${fill}"/><text y="6" text-anchor="middle" font-size="${15 / s}" style="fill:var(--kf-ink)">${label}</text></g>`;
  const person = (x, y, c) => `<g><circle cx="${x}" cy="${y}" r="7" style="fill:var(--site-hair)"/><rect x="${x - 7}" y="${y + 8}" width="14" height="20" rx="4" style="fill:${c}"/><path d="M${x - 4} ${y + 28}v12M${x + 4} ${y + 28}v12" style="stroke:var(--kf-ink)" stroke-width="3"/></g>`;
  const d = document.getElementById("policy-diagram");
  if (d) {
    d.innerHTML = `
      <rect width="1135" height="604" rx="90" style="fill:var(--site-beige-deep)"/>
      <rect x="340" y="80" width="430" height="380" style="fill:var(--site-paper)"/>
      <text x="555" y="130" text-anchor="middle" font-size="16" style="fill:var(--kf-ink)">Your group name here</text>
      <path d="M470 145h170" style="stroke:var(--kf-ink)" stroke-width="2"/>
      ${heart(470, 270, 0.62, "var(--site-yellow)", "Field 1", -8)}
      ${heart(640, 260, 0.62, "var(--site-green)", "Field 2", 8)}
      ${heart(555, 350, 0.5, "var(--site-pink)", "Field 3", 0)}
      ${person(430, 380, "var(--site-blue-ink)")}${person(660, 370, "var(--site-red)")}${person(560, 420, "var(--site-yellow)")}
      <path d="M140 470c40-90 160-120 230-60 30-40 70-30 70 10v80H130z" style="fill:var(--site-green)"/>
      <ellipse cx="210" cy="430" rx="70" ry="40" style="fill:var(--site-green-mid)"/>
      <rect x="170" y="460" width="80" height="30" style="fill:var(--site-paper)"/><text x="210" y="481" text-anchor="middle" font-size="14" style="fill:var(--kf-ink)">Area</text>
      ${person(150, 500, "var(--site-pink-shirt)")}${person(290, 505, "var(--site-blue-mid)")}
      <circle cx="930" cy="400" r="95" style="fill:var(--site-blue-mid)"/>
      <path d="M880 360c26-26 64-16 70 10-24 14-56 16-70-10zM930 430c26-12 50 0 46 26-26 4-40-8-46-26z" style="fill:var(--site-green)"/>
      <rect x="890" y="410" width="80" height="30" style="fill:var(--site-paper)"/><text x="930" y="431" text-anchor="middle" font-size="14" style="fill:var(--kf-ink)">World</text>
      <path style="fill:var(--site-paper);stroke:var(--kf-ink)" d="M930 236l40-12-8 10 22 4-18 8 8 10-44-20z" stroke-width="1.5"/>
      <path d="M330 300c-80-20-140 20-150 90" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/><path d="M168 372l12 22 14-20" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/>
      <path d="M250 540c60 30 180 30 260-10" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/>
      <path d="M790 200c80-10 140 40 150 100" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/><path d="M926 290l14 18 12-22" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/>
      <path d="M840 500c-30 30-60 40-80 40" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/><path d="M776 526l-16 14 20 8" fill="none" style="stroke:var(--kf-ink)" stroke-width="5" stroke-linecap="round"/>
      <use href="#nh-chan" x="1000" y="500" width="50" height="45"/>`;
  }
  const row = document.querySelector(".policy__people");
  if (row) {
    const cols = ["var(--site-red)", "var(--site-blue-ink)", "var(--site-yellow)", "var(--site-green)", "var(--site-pink-shirt)", "var(--site-blue-mid)", "var(--kf-ink)"];
    let s = "";
    for (let i = 0; i < 8; i++) s += person(30 + i * 62, 20, cols[i % cols.length]);
    s += `<use href="#nh-nkun" x="250" y="10" width="62" height="58"/><use href="#nh-chan" x="300" y="34" width="34" height="30"/><use href="#nh-chan" x="330" y="36" width="30" height="27"/>`;
    row.innerHTML = `<svg viewBox="0 0 507 81" aria-hidden="true">${s}</svg>`;
  }
})();
