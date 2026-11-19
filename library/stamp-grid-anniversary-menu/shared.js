// Shared by the pages — skin color reading, seal (red ring + vertical name letters) drawing
(() => {
  const root = document.documentElement;
  const kfVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  // Instead of the original seal image (PNG·SVG), the same shape is redrawn — size and line positions change with the number of characters
  const sealSVG = (text) => {
    const chars = [...String(text)];
    const n = chars.length;
    const size = n === 1 ? 52 : n === 2 ? 36 : 26;
    const step = n === 1 ? 0 : n === 2 ? 36 : 26;
    const top = 50 - (step * (n - 1)) / 2;
    const glyphs = chars.map((c, i) => `<text x="50" y="${top + i * step}" font-size="${size}">${c}</text>`).join("");
    return `<svg class="sh-seal" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" stroke-width="2.6"/>${glyphs}</svg>`;
  };

  window.shSite = { kfVar, sealSVG };
})();
