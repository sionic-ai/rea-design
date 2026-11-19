// Work detail header — original framer: section height P = Screen + 400, E = P − Screen.
// Color panel y = Scroll [0, P] → [0, −E], video panel width and height = Spring (stiffness 600, damping 66) through rough scroll [0, E] → [N, screen width]·[N/1.77, screen height]
// (N = clamp(670, screen width × .5, 1200)), video panel y = Scroll [0, E] → [−clamp(60, screen height × .08, 180), −(screen height/2 − E)]. No motion below 1025px
(() => {
  const hero = document.querySelector("[data-dt-hero]");
  const content = document.querySelector("[data-dt-content]");
  const media = document.querySelector("[data-dt-media]");
  if (!hero || !content || !media) return;
  const narrow = matchMedia("(max-width: 1025px)");
  const lerp = (v, a, b, c, d) => c + (d - c) * Math.min(1, Math.max(0, (v - a) / (b - a)));
  let P = 0, E = 0, N = 0, y0 = 0;
  const fit = () => {
    P = hero.offsetHeight; E = P - innerHeight;
    N = Math.min(Math.max(670, 0.5 * innerWidth), 1200);
    y0 = -Math.min(Math.max(60, 0.08 * innerHeight), 180);
  };
  const size = mkSpring(600, 66, (s) => {
    if (narrow.matches) return;
    media.style.maxWidth = `${lerp(s, 0, E, N, innerWidth)}px`;
    media.style.maxHeight = `${lerp(s, 0, E, N / 1.77, innerHeight)}px`;
  });
  const read = () => {
    if (narrow.matches) { content.style.transform = media.style.transform = media.style.maxWidth = media.style.maxHeight = ""; return; }
    const s = scrollY;
    content.style.transform = `translateY(${lerp(s, 0, P, 0, -E)}px)`;
    media.style.transform = `translateY(${lerp(s, 0, E, y0, -(innerHeight / 2 - E))}px)`;
    size(s);
  };
  fit(); read();
  addEventListener("scroll", read, { passive: true });
  addEventListener("resize", () => { fit(); read(); });
})();
