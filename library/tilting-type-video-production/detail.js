// Work detail: video height = Screen − first title line (the title hangs at the bottom of the hero) · player (shared.js SD.player) · standing up the title letters
(() => {
  const { reduced } = SD;
  const t = document.querySelector("[data-first-title]");
  const h1 = t.querySelector("h1");
  const firstLine = () => document.documentElement.style.setProperty("--t1", `${parseFloat(getComputedStyle(t).lineHeight)}px`);
  firstLine();
  addEventListener("resize", firstLine);
  document.fonts.ready.then(() => { firstLine(); ScrollTrigger.refresh(); });

  // The original detail player loads and plays immediately on entry (muted)
  const player = SD.player(document.querySelector("[data-player]"));
  if (!reduced) SD.ready(() => player.open());

  if (!reduced) {
    const chars = SD.splitChars(h1);
    SD.riseSet(chars);
    SD.ready(() => SD.riseIn(chars));
  }
})();
