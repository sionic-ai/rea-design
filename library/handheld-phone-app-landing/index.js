// The first card’s glow veil fades 1 → 0 (straight line) from 100px → 85% of the screen (phone 50px → 60%),
// The black backdrop curtain for feature 3 lifts once the white card is fully open (card top + 140px) — from the original index heroGradient and shopCardBg
(() => {
  const glow = document.querySelector(".hm-hero__glow");
  const shopBg = document.querySelector(".hm-shop__bg"), shopCard = document.querySelector(".hm-shop__content");
  const narrow = matchMedia("(max-width: 750px)");
  let gStart = 100, gEnd = 0, shopOpen = 0;
  const measure = () => {
    gStart = narrow.matches ? 50 : 100;
    gEnd = (narrow.matches ? 0.6 : 0.85) * innerHeight;
    if (shopCard) shopOpen = shopCard.getBoundingClientRect().top + scrollY + (narrow.matches ? 95.2 : 140);
  };
  const paint = () => {
    const s = scrollY;
    if (glow) glow.style.opacity = s <= gStart ? 1 : s >= gEnd ? 0 : (1 - (s - gStart) / (gEnd - gStart)).toFixed(6);
    if (shopBg) shopBg.style.opacity = s > shopOpen ? 0 : 1;
  };
  let raf = 0;
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }, { passive: true });
  addEventListener("resize", () => { measure(); paint(); });
  addEventListener("load", () => { measure(); paint(); });
  measure();
  paint();
})();
