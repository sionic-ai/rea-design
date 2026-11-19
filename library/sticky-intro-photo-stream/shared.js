// The original preloads the font file so the first paint already has the right font — no flicker from the web font arriving late and swapping the text.
// The copy uses the skin’s (theme.css) web font, and Korean fonts are split into pieces by character range, so the needed pieces are all fetched only after layout is done
// So after one layout it doesn’t draw until document.fonts.ready (up to 1.5 seconds), giving the same hero every time.
(() => {
  const root = document.documentElement;
  if (!document.fonts) return;
  root.classList.add("g-wait");
  const laidOut = new Promise((r) => {
    const go = () => requestAnimationFrame(() => r());
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, { once: true });
    else go();
  });
  const fonts = laidOut.then(() => document.fonts.ready);
  Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))])
    .catch(() => {})
    .then(() => root.classList.remove("g-wait"));
})();
