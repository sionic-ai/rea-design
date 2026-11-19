// Hero — six halftone hands on a table drawn as 9 SVG frames and handed to frame-step-loop (the original is a 9-frame 2fps animated GIF photo cutout).
// Each hand reaches from outside the table to center, and every section changes reach length, angle, finger spread and held card, becoming a stop-motion of passing cards back and forth
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const host = document.querySelector(".kk-hands");
  if (host) {
    // 0 = Right side, clockwise. Hand positions in the original GIF (two top left · one top right · right · two bottom left)
    const SEATS = [-128, -96, -38, 22, 138, 168];
    const rnd = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
    const hand = (reach, tilt, spread, card) => {
      // One hand — arm·palm·four fingers·thumb facing +x. The outer side (-x) goes off the table.
      const f = [-1.5, -0.5, 0.5, 1.5].map((k, n) => {
        const a = k * spread, L = 54 + (n === 1 || n === 2 ? 12 : 0) - Math.abs(k) * 4;
        return `<rect x="70" y="${-8 + k * 16}" width="${L}" height="17" rx="8.5" transform="rotate(${a} 70 ${k * 16})"/>`;
      }).join("");
      const thumb = `<rect x="30" y="-58" width="52" height="19" rx="9.5" transform="rotate(${-34 - spread * 1.5} 34 -40)"/>`;
      const arm = `<path d="M-420 -40 L6 -30 Q24 -30 24 -14 L24 14 Q24 30 6 30 L-420 40 Z"/>`;
      const palm = `<rect x="0" y="-42" width="92" height="84" rx="34"/>`;
      const c = card ? `<rect class="kk-hands__card" x="${96 + card * 8}" y="-46" width="58" height="84" rx="4" transform="rotate(${card * 9} 120 0)"/>` : "";
      const shapes = arm + palm + f + thumb;
      return `<g transform="rotate(${tilt}) translate(${reach} 0)"><g class="kk-hands__cut">${shapes}${c}</g><g class="kk-hands__skin">${shapes}</g>${c ? `<g class="kk-hands__paper">${c}</g>` : ""}</g>`;
    };
    // Keep the halftone pattern in an always-visible svg outside the frame — inside a hidden frame the pattern cells inherit visibility and get painted empty
    host.insertAdjacentHTML("beforebegin", `<svg class="kk-hands__defs" width="0" height="0" aria-hidden="true"><defs><pattern id="kk-dots" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="kk-hands__base" width="7" height="7"/><circle class="kk-hands__dot" cx="3.5" cy="3.5" r="2.1"/></pattern></defs></svg>`);
    for (let n = 0; n < 9; n++) {
      const r = rnd(97 + n * 131);
      const g = SEATS.map((deg, k) => {
        const reach = 210 + r() * 120;
        const seat = deg + (r() - 0.5) * 14;
        const spread = 4 + r() * 12;
        const card = (k + n) % 3 === 0 ? (r() > 0.5 ? 1 : -1) : 0;
        // Place it outside the table (radius 560), turn it to face the center, then extend
        return `<g transform="translate(500 500) rotate(${seat}) translate(560 0) rotate(180)">${hand(reach, (r() - 0.5) * 30, spread, card)}</g>`;
      }).join("");
      host.insertAdjacentHTML("beforeend", `<svg data-fx-part="frame" viewBox="0 0 1000 1000" aria-hidden="true">${g}</svg>`);
    }
  }

  // Like Studio, release the entrance state one frame after the first paint (original IntersectionObserver → two rAFs)
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("kk-in")));

  // Phone recommended games row — a row swiped sideways, side arrows go one card at a time
  const row = document.querySelector(".kk-pick__row");
  document.querySelectorAll(".kk-pick__arrow").forEach((b) => b.addEventListener("click", () => {
    if (!row) return;
    const step = (row.firstElementChild?.getBoundingClientRect().width || 346) + 40;
    row.scrollBy({ left: b.dataset.dir === "prev" ? -step : step, behavior: "smooth" });
  }));
})();
