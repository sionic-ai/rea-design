// Brand first page — only the video play tag (pause↔play) responds to interaction. The ‹ES-36› panel stays put with CSS sticky alone (the original has no script either)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  [[".hv", ".hv__badge"], [".fbv", ".fbv__play"]].forEach(([s, b]) => {
    const box = document.querySelector(s), btn = box && box.querySelector(b), v = box && box.querySelector("video");
    if (!btn || !v) return;
    const label = btn.querySelector("span:last-child") || btn;
    const paint = () => { const t = v.paused ? "Play" : "Pause"; if (label === btn) btn.lastChild.textContent = t; else label.textContent = t; };
    if (reduce) { v.pause(); v.removeAttribute("autoplay"); }
    btn.addEventListener("click", () => { v.paused ? v.play().catch(() => {}) : v.pause(); paint(); });
    v.addEventListener("play", paint); v.addEventListener("pause", paint);
    paint();
  });
})();
