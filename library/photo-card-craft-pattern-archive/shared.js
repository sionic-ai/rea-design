// Shared by all sections — hand-drawn icon set (SVGs of the same size and shape stand in for the original black hand-drawn PNGs), phone menu open/close
(() => {
  // Define the icon only once <svg><use href="#am-i-name"></svg> Used as — color is currentColor (the skin’s text color)
  const I = {
    knit: '<rect x="13" y="9" width="3.4" height="33" rx="1.2"/><rect x="31" y="9" width="3.4" height="33" rx="1.2"/><circle cx="14.7" cy="7.5" r="3.6"/><circle cx="32.7" cy="7.5" r="3.6"/><path d="M14 40l-1 4h4l-1-4zM32 40l-1 4h4l-1-4z"/>',
    crochet: '<path d="M22.5 44V12.5c0-4 2-6.5 4.6-6.5 2.4 0 3.9 1.8 3.9 4.2 0 1.9-1.1 3-2.6 3.4v-2.2c.4-.3.6-.7.6-1.2 0-.9-.6-1.5-1.5-1.5-1 0-1.6.9-1.6 2.6V44z"/><rect x="21" y="22" width="7.6" height="11" rx="2"/>',
    leaf: '<path d="M24 46V18" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M24 20c-9-2-12-9-10-15 7 1 11 7 10 15zM24 30c8-1 13-7 12-14-7 1-12 6-12 14zM24 38c-8 0-13-5-13-11 7 0 12 4 13 11z"/>',
    tawashi: '<circle cx="15" cy="27" r="10"/><circle cx="33" cy="22" r="9"/><path d="M8 27h14M28 22h10M15 20v14M33 15v14" stroke="var(--kf-bg)" stroke-width="1.4"/>',
    beanie: '<path d="M8 36a16 16 0 0 1 32 0z"/><rect x="6.5" y="34" width="35" height="8" rx="2"/><circle cx="24" cy="10" r="5"/>',
    mitten: '<path d="M17 44V22c0-8 3-14 10-14s9 6 9 13v6l4-5c2-2 5 0 4 3l-7 10v9z"/><rect x="16" y="38" width="21" height="7" rx="1.5"/>',
    scarf: '<path d="M10 8h28v10H22v26h-9V18h-3z"/><path d="M13 44h2v3h-2zM17 44h2v3h-2zM21 44h1v3h-1z"/>',
    socks: '<path d="M18 4h12v22c0 3 1 4 4 5l5 2c3 1 4 4 3 7-1 4-4 5-8 4l-13-4c-3-1-4-3-4-6V4z"/>',
    bag: '<path d="M17 18v-5a7 7 0 0 1 14 0v5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M9 18h30l-3 26H12z"/>',
    shorts: '<path d="M8 10h32l3 30H27l-3-14-3 14H5z"/>',
    belly: '<rect x="9" y="12" width="30" height="26" rx="3"/><path d="M14 14v22M20 14v22M26 14v22M32 14v22" stroke="var(--kf-bg)" stroke-width="1.2"/>',
    sweater: '<path d="M17 7l-11 6 3 15 6-2v18h18V26l6 2 3-15-11-6c-1 4-4 6-7 6s-6-2-7-6z"/>',
    others: '<circle cx="12" cy="24" r="3.5"/><circle cx="24" cy="24" r="3.5"/><circle cx="36" cy="24" r="3.5"/>',
    patterns: '<path d="M6 8h36v32H6z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M6 18h36M6 28h36M18 8v32M30 8v32" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="13" r="2.6"/><circle cx="24" cy="23" r="2.6"/><circle cx="36" cy="33" r="2.6"/>',
    arrow: '<path d="M17 10l14 14-14 14" fill="none" stroke="currentColor" stroke-width="4"/>',
  };
  // Walking ant strip — 60 steps + end cell (same as the first) = Stack 61 frames vertically. Two steps in 1.3s, three pairs of legs alternating front and back
  const antFrames = [];
  for (let f = 0; f < 61; f++) {
    const ph = ((2 * Math.PI * (f % 60)) / 60) * 2, oy = f * 100, a = Math.sin(ph * 0.5) * 3;
    let g = `<circle cx="24" cy="${oy + 52}" r="8"/><ellipse cx="42" cy="${oy + 54}" rx="10" ry="6.5"/><ellipse cx="67" cy="${(oy + 50 + Math.sin(ph) * 0.8).toFixed(1)}" rx="16" ry="11.5"/>`;
    g += `<path d="M20 ${oy + 46}Q14 ${(oy + 34 + a).toFixed(1)} 8 ${(oy + 33 + a).toFixed(1)}M24 ${oy + 45}Q22 ${(oy + 32 - a).toFixed(1)} 15 ${(oy + 27 - a).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    [[36, 28], [42, 44], [48, 62]].forEach(([hx, fx], i) => [0, 1].forEach((side) => {
      const q = ph + i * 2.1 + side * Math.PI, s = Math.sin(q) * 7, lift = Math.max(0, Math.cos(q)) * 3;
      g += `<path d="M${hx} ${oy + 57}L${(hx + (fx - hx) * 0.5 + s * 0.4).toFixed(1)} ${oy + 48 + (side ? 8 : 10)}L${(fx + s).toFixed(1)} ${(oy + 76 - lift - (side ? 3 : 0)).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    }));
    antFrames.push(g);
  }
  const sprite = document.createElement("div");
  sprite.className = "am-defs";
  sprite.setAttribute("aria-hidden", "true");
  sprite.innerHTML = `<svg width="0" height="0"><defs>${Object.entries(I).map(([k, v]) => `<symbol id="am-i-${k}" viewBox="0 0 48 48">${v}</symbol>`).join("")}<symbol id="am-ant" viewBox="0 0 100 6100">${antFrames.join("")}</symbol></defs></svg>`;
  document.body.prepend(sprite);

  // Phone menu — the button folds into an X and a white panel comes down (original .3s ease-out)
  const btn = document.querySelector(".am-burger");
  const menu = document.querySelector(".am-spmenu");
  if (btn && menu) {
    const set = (open) => {
      document.documentElement.classList.toggle("is-menu-open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    menu.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", () => set(false)));
  }
})();
