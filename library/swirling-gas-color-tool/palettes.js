// Eight sample palettes — color sets read from photos, so the colors themselves are the content (not a skin). The consumer swaps in its own palette here
window.aPalettes = [
  ["#1b1210", "#5a1d14", "#a3261c", "#d9452f", "#f08a5d", "#f6d7c3"], // Not a skin: sample palette (pomegranate)
  ["#3b2a20", "#7a4a2c", "#b5753f", "#d9a874", "#e8d2b4", "#f2ebe0"], // Not a skin: sample palette (dry season)
  ["#2c2a24", "#6b5a3e", "#a8865a", "#d6b98d", "#ece0c8", "#f7f2e8"], // Not a skin: sample palette (tempered field)
  ["#3d3a2a", "#6e6a3f", "#a7a05c", "#cfd08a", "#e9ecc8", "#f6f7ee"], // not a skin: sample palette (sun-tanned clear morning)
  ["#2e3326", "#5b6b3a", "#93a85a", "#c7d98f", "#e6efcf", "#fafcf3"], // Not a skin: sample palette (high brightness)
  ["#16181b", "#2e3238", "#4d535b", "#7b828a", "#b4b9be", "#e3e5e7"], // not skin: swatch palette (hard steel gray)
  ["#1f2a33", "#34536b", "#5b85a6", "#93b3cc", "#c9dae6", "#eef3f7"], // Not Skin: sample palette (middle of a field)
  ["#0d1117", "#1f2a3a", "#3c5170", "#7d93b5", "#bfcbe0", "#eef1f6"], // Not Skin: sample palette (frozen slate slab)
];
// Painting — data-pal="n" Lay palette band n across the cell
document.querySelectorAll("[data-pal]").forEach((el) => {
  const p = window.aPalettes[+el.dataset.pal % window.aPalettes.length];
  el.style.setProperty("--a-pal", `linear-gradient(90deg, ${p.map((c, i) => `${c} ${(i * 100) / p.length}% ${((i + 1) * 100) / p.length}%`).join(", ")})`);
});
