// First page: pickup slide (one center card sits at the screen center, sides are cropped, and it loops endlessly — .6s cubic-bezier(.4,.4,0,1)).
// Clone one set before and after, and when leaving the middle set, return to the same spot without a jump.
// Like the original slider, it advances on its own every 5s (hovering doesn’t pause it), a swipe over 50px goes back or forward, and the left/right arrow keys also work.
(() => {
  const view = document.querySelector(".ix-pick__view");
  const track = view?.querySelector("[data-carousel]");
  if (!track) return;
  const originals = [...track.children];
  const n = originals.length;
  const clone = (el) => { const c = el.cloneNode(true); c.setAttribute("aria-hidden", "true"); return c; };
  track.prepend(...originals.map(clone));
  track.append(...originals.map(clone));

  let index = n;
  const place = (animate) => {
    const card = track.children[index];
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const w = card.offsetWidth;
    track.style.transition = animate ? "" : "none";
    track.style.translate = `${view.clientWidth / 2 - (index * (w + gap) + w / 2)}px 0`;
    view.style.setProperty("--h", `${card.querySelector(".wf-img, .ix-pick__emblems").offsetHeight}px`);
    if (!animate) { track.offsetWidth; track.style.transition = ""; }
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = 0;
  const auto = () => { clearTimeout(timer); if (!reduce) timer = setTimeout(() => go(1), 5000); };
  const go = (step) => { index += step; place(true); auto(); };
  track.addEventListener("transitionend", () => {
    if (index < n || index >= n * 2) { index = ((index - n) % n + n) % n + n; place(false); }
  });
  view.querySelector(".ix-pick__nav--prev").addEventListener("click", () => go(-1));
  view.querySelector(".ix-pick__nav--next").addEventListener("click", () => go(1));
  let touchX = 0;
  view.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  view.addEventListener("touchend", (e) => { const d = touchX - e.changedTouches[0].clientX; if (Math.abs(d) > 50) go(d > 0 ? 1 : -1); }, { passive: true });
  view.querySelectorAll(".ix-pick__nav").forEach((b) => b.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    go(e.key === "ArrowRight" ? 1 : -1);
  }));
  addEventListener("resize", () => place(false));
  place(false);
  auto();
})();
