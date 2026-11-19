// Institution overview: rebuilds the history horizontal cards (same Swiper as the original — drag, arrows), the shuttle bus route map, and the institution song score.
(() => {
  // ── History: the same Swiper 11.2 as the original (slidesPerView auto · arrows) — drag inertia and end stop feel just like the original ──
  const [prev, next] = document.querySelectorAll(".history__btn");
  new Swiper(".history__swiper", { loop: false, slidesPerView: "auto", initialSlide: 0, touchRatio: 1, grabCursor: true, navigation: { nextEl: next, prevEl: prev } });

  // ── Bus route map: redraws the original’s green map (color zones per course · railway · station boxes · park) in the same layout ──
  const map = document.querySelector("[data-busmap]");
  if (map) {
    // Paint comes from .bm-* in about.css via skin variables — only the course color passes that course’s --site-*
    const zone = (pts, k) => `<path class="bm-zone bm-zone--${k}" d="M${pts}Z"/>`;
    const pill = (x, y, t, c) => `<g transform="translate(${x} ${y})"><rect x="-58" y="-17" width="116" height="34" rx="17" style="fill: var(--site-${c})"/><text class="bm-label" y="6" text-anchor="middle" font-size="15">${t}</text></g>`;
    const stn = (x, y, t, v) => v
      ? `<g transform="translate(${x} ${y})"><rect class="bm-stn" x="-11" y="-36" width="22" height="72"/><text class="bm-stn__t" font-size="10" writing-mode="tb" text-anchor="middle" y="0">${t}</text></g>`
      : `<g transform="translate(${x} ${y})"><rect class="bm-stn" x="-38" y="-11" width="76" height="22"/><text class="bm-stn__t" y="4" text-anchor="middle" font-size="10">${t}</text></g>`;
    const park = (x, y, rx, ry, t) => `<ellipse class="bm-park" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/><text class="bm-park__t" x="${x}" y="${y + 4}" text-anchor="middle" font-size="10">${t}</text>`;
    const rail = (d) => `<path class="bm-rail" d="${d}" fill="none" stroke-width="5"/><path class="bm-rail__dash" d="${d}" fill="none" stroke-width="3" stroke-dasharray="8 8"/>`;
    map.innerHTML = `<svg viewBox="0 0 900 640" aria-label="Outpatient bus course map slot">
      ${zone("20,90 300,60 330,330 120,360 30,300", "a")}
      ${zone("330,70 760,80 790,330 520,350 360,250", "b")}
      ${zone("250,380 470,360 650,430 640,560 330,600 230,520", "c")}
      ${park(720, 420, 70, 40, "Your park here")}${park(560, 520, 60, 30, "Your park here")}${park(120, 470, 60, 32, "Your park here")}
      <g class="bm-road" stroke-width="4" fill="none" stroke-linecap="round"><path d="M0 250 900 220M300 0 380 640M560 0 520 640M0 420 900 470M150 0 120 640M700 0 880 640"/></g>
      ${rail("M0 180C200 175 500 170 900 160")}${rail("M260 640C280 450 330 300 350 0")}${rail("M0 560C300 480 600 470 900 520")}
      ${stn(110, 178, "Your station here")}${stn(250, 176, "Your station here")}${stn(470, 171, "Your station here")}${stn(690, 166, "Your station here")}
      ${stn(318, 360, "Your station here", 1)}${stn(380, 505, "Your station here")}${stn(560, 478, "Your station here")}${stn(200, 520, "Your station here")}
      ${pill(150, 300, "Course A", "violet")}${pill(560, 240, "Course B", "azure")}${pill(420, 430, "Course C", "pink")}
      <g transform="translate(350 380)"><circle class="bm-home" r="36"/><g class="bm-home__mark" transform="translate(-13 -24) scale(.72)">${'<ellipse cx="18" cy="31" rx="10" ry="7.5" fill="currentColor"/><path d="M18 24V13" stroke="currentColor" stroke-width="2.6"/><path d="M18 15C14 6 6 6 3 9c2 5 9 8 15 6zM18 13c3-8 11-10 15-7-1 6-8 9-15 7z" fill="currentColor"/>'}</g><text class="bm-label" y="22" text-anchor="middle" font-size="9">Your price in KRW here</text></g>
    </svg>`;
  }

  // ── Cost score: three staves with notes and lyric slots ──
  const score = document.querySelector("[data-score]");
  if (score) {
    const r = (i) => [3, 1, 4, 2, 5, 0, 3, 2, 4, 1, 3, 5, 2, 4][i % 14];
    let staves = "";
    for (let s = 0; s < 3; s++) {
      const y0 = 20 + s * 78;
      let lines = "", notes = "";
      for (let l = 0; l < 5; l++) lines += `<path class="sc-line" d="M10 ${y0 + l * 7}H390" stroke-width=".8"/>`;
      for (let n = 0; n < 12; n++) {
        const x = 42 + n * 29, y = y0 + 28 - r(n + s * 3) * 3.5;
        notes += `<ellipse class="sc-note" cx="${x}" cy="${y}" rx="4" ry="3" transform="rotate(-20 ${x} ${y})"/><path class="sc-stem" d="M${x + 3.6} ${y}v-20" stroke-width="1"/>`;
      }
      staves += `${lines}<path class="sc-line" d="M10 ${y0}v28M390 ${y0}v28"/><text class="sc-note" x="14" y="${y0 + 22}" font-size="22">𝄞</text>${notes}<text class="sc-lyric" x="42" y="${y0 + 52}" font-size="10">Y o u r   l y r i c   l i n e   h e r e</text>`;
    }
    score.innerHTML = `<svg viewBox="0 0 400 250" aria-label="Original price sheet music slot">${staves}</svg>`;
  }
})();
