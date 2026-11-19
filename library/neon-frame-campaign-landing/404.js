// In place of the original’s mascot figure photo strip, layers shaded egg mascots standing at the same position and size.
(() => {
  const row = document.querySelector(".nf-row");
  // [x center, height, slight tilt angle, front-back order] — as in the original, front and back rows stagger and one at the right end stands apart
  const figs = [[96, 236, -3, 0], [205, 250, 3, 1], [300, 244, -2, 0], [400, 252, 2, 1], [510, 262, -3, 2], [590, 254, 4, 1], [720, 248, -2, 0], [850, 244, 3, 1], [1085, 250, 2, 1]];
  const defs = `<defs>
    <radialGradient id="nf-body" cx=".36" cy=".3" r=".85"><stop offset="0" style="stop-color:var(--site-surface)"/><stop offset=".55" style="stop-color:var(--site-fill-2)"/><stop offset=".82" style="stop-color:var(--site-shade-1)"/><stop offset="1" style="stop-color:var(--site-shade-5)"/></radialGradient>
    <radialGradient id="nf-shadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-opacity=".18" style="stop-color:var(--site-black)"/><stop offset="1" stop-opacity="0" style="stop-color:var(--site-black)"/></radialGradient>
  </defs>`;
  const one = ([x, h, rot]) => {
    const w = h * 0.74, top = 300 - h;
    return `<g transform="rotate(${rot} ${x} 300)">
      <ellipse cx="${x}" cy="300" rx="${w * 0.55}" ry="10" fill="url(#nf-shadow)"/>
      <path d="M${x} ${top}c${w * .48} 0 ${w * .5} ${h * .42} ${w * .5} ${h * .56}s${-w * .2} ${h * .44} ${-w * .5} ${h * .44}${-w * .3} 0 ${-w * .5} ${-h * .2} ${-w * .5} ${-h * .44}S${x - w * .48} ${top} ${x} ${top}Z" fill="url(#nf-body)" style="stroke:var(--site-shade-2)"/>
      <ellipse cx="${x - w * .52}" cy="${top + h * .62}" rx="${w * .1}" ry="${h * .1}" fill="url(#nf-body)" transform="rotate(25 ${x - w * .52} ${top + h * .62})"/>
      <ellipse cx="${x + w * .52}" cy="${top + h * .62}" rx="${w * .1}" ry="${h * .1}" fill="url(#nf-body)" transform="rotate(-25 ${x + w * .52} ${top + h * .62})"/>
      <circle cx="${x - w * .14}" cy="${top + h * .3}" r="2.6" style="fill:var(--site-shade-8)"/><circle cx="${x + w * .14}" cy="${top + h * .3}" r="2.6" style="fill:var(--site-shade-8)"/>
      <path d="M${x - 7} ${top + h * .37}q7 5 14 0" fill="none" stroke-width="2" stroke-linecap="round" style="stroke:var(--site-shade-7)"/>
    </g>`;
  };
  // As in the original, repeats one cell (1200×314) endlessly sideways
  const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 314" width="1200" height="314">${defs}${figs.slice().sort((a, b) => a[3] - b[3]).map(one).join("")}</svg>`;
  row.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(tile)}"), linear-gradient(transparent 88%, var(--site-soft-line))`;
})();
