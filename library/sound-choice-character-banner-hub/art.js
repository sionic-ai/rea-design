// Our own art replaces the original character photos and logo art — a round-eared mascot (four standing poses) and an oval badge logo. Colors use only --kf-*
(() => {
  const S = 'stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';
  // Pose: arms (left·right) down (0), spread (1), raised (2) — the four dance frames are [0,0]·[2,0]·[2,2]·[0,2], the curtain’s two sides wave hands [1,2]·[2,1]
  const arm = (side, pose) => {
    const s = side < 0 ? -1 : 1, x = 60 + s * 30;
    const tip = pose === 2 ? [x + s * 18, 52] : pose === 1 ? [x + s * 24, 86] : [x + s * 8, 112];
    return `<path ${S} fill="var(--pk-body)" d="M${x} 84Q${(x + tip[0]) / 2 + s * 4} ${(84 + tip[1]) / 2 - 6} ${tip[0]} ${tip[1]}q${s * 6} -2 ${s * 4} 6Q${(x + tip[0]) / 2 + s * 8} ${(92 + tip[1]) / 2 + 4} ${x - s * 2} 96Z"/>`;
  };
  const mascot = (left = 0, right = 0, tilt = 0, face = "smile") => `
    <svg class="pk-mascot" viewBox="0 0 120 150" aria-hidden="true"><g transform="rotate(${tilt} 60 130)">
      <ellipse ${S} fill="var(--pk-body)" cx="34" cy="26" rx="13" ry="15"/><ellipse ${S} fill="var(--pk-body)" cx="86" cy="26" rx="13" ry="15"/>
      <ellipse fill="var(--pk-cheek)" cx="34" cy="27" rx="6" ry="7"/><ellipse fill="var(--pk-cheek)" cx="86" cy="27" rx="6" ry="7"/>
      ${arm(-1, left)}${arm(1, right)}
      <path ${S} fill="var(--pk-body)" d="M60 30c26 0 40 20 40 48 0 34-14 58-40 58S20 112 20 78c0-28 14-48 40-48Z"/>
      <ellipse fill="var(--pk-belly)" cx="60" cy="104" rx="20" ry="22"/>
      <path ${S} fill="var(--pk-body)" d="M40 132c-4 6-2 12 6 12h8c4 0 4-6 0-10M80 132c4 6 2 12-6 12h-8c-4 0-4-6 0-10"/>
      ${face === "wink" ? '<path stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" d="M42 62q5-5 10 0"/>' : '<circle fill="currentColor" cx="47" cy="62" r="5"/>'}
      <circle fill="currentColor" cx="73" cy="62" r="5"/><circle fill="var(--pk-belly)" cx="49" cy="60" r="1.6"/><circle fill="var(--pk-belly)" cx="75" cy="60" r="1.6"/>
      <path ${S} fill="var(--pk-mouth)" d="M54 74q6 9 12 0Z"/>
    </g></svg>`;
  const DANCE = [[0, 0, 0], [2, 0, -4], [2, 2, 0], [0, 2, 4]];
  // Hidden guest — same body with only a different face (in place of the original Easter egg). Eyes are thin lines instead of two dots
  const odd = (l, r, t) => mascot(l, r, t).replace(/<circle fill="currentColor" cx="47"[^>]*\/>/, '<path stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" d="M42 62h10"/>').replace(/<circle fill="currentColor" cx="73"[^>]*\/>/, '<path stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" d="M68 62h10"/>');

  // Oval badge logo (original 690×382 image slot): small top line · big center text (different fill per letter) · bottom line · small circle tag · five hearts
  const heart = (x, y, s, r) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="var(--kf-accent)" stroke="currentColor" stroke-width="2.4" d="M0 6C-6-2-16 0-14 8c2 7 14 14 14 14s12-7 14-14C16 0 6-2 0 6Z"/>`;
  const logo = ({ top, big, bottom, badge }) => `
    <svg class="pk-logo" viewBox="0 0 690 382" aria-hidden="true">
      <ellipse cx="345" cy="205" rx="200" ry="150" fill="var(--pk-badge)" stroke="currentColor" stroke-width="12"/>
      <ellipse cx="345" cy="205" rx="182" ry="132" fill="none" stroke="var(--kf-surface)" stroke-width="6"/>
      ${heart(200, 92, 1.5, -20)}${heart(238, 64, 1.2, -8)}${heart(452, 70, 1.3, 10)}${heart(492, 100, 1.5, 22)}${heart(170, 140, 1.1, -30)}
      <text class="pk-logo__top" x="345" y="128" text-anchor="middle">${top}</text>
      <text class="pk-logo__big" x="345" y="222" text-anchor="middle">${[...big].map((c, i) => `<tspan class="is-c${i % 4}">${c}</tspan>`).join("")}</text>
      <text class="pk-logo__bottom" x="330" y="292" text-anchor="middle">${bottom}</text>
      <circle cx="488" cy="282" r="34" fill="var(--kf-surface)" stroke="currentColor" stroke-width="7"/>
      <text class="pk-logo__badge" x="488" y="296" text-anchor="middle">${badge}</text>
    </svg>`;
  window.pkArt = { mascot, odd, DANCE, logo };
})();
