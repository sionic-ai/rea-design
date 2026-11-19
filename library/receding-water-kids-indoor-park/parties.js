// Birthday and group events: as the cake rises .9 screen from the bottom (--p 0→1), a slice slides out to the right and a yellow panel unfolds
(() => {
  const wrap = document.querySelector(".hl-cake-wrap");
  if (!wrap) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { wrap.style.setProperty("--p", "1"); return; }
  let raf = 0;
  const paint = () => { raf = 0; const h = innerHeight, p = (h - wrap.getBoundingClientRect().top) / (0.9 * h); wrap.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3)); };
  const kick = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);
  paint();
})();
