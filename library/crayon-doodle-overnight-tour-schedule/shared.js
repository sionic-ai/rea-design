// The Korean web fonts (Gothic A1, Jua) arrive late, so the hero text swaps once more from the fallback font. The original stands correctly on the first paint.
// Once fonts arrive (1.5s at the latest) the background shows all at once — painting only the background first also makes the hero change twice. A line in the header puts tw-fonts on html
(() => {
  const root = document.documentElement;
  const show = () => root.classList.remove("tw-fonts");
  if (!root.classList.contains("tw-fonts")) return;
  setTimeout(show, 1500);
  (document.fonts?.ready || Promise.resolve()).then(show, show);
})();
