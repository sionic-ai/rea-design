(() => {
  // Day card strip: cards joined in two sets flow endlessly at .6px per frame, stop on hover or touch, and flow again 2s after release.
  // Dragging with the mouse follows the hand exactly (no inertia) and it flows again 2 seconds after release — same rule as the original TopDayFlow
  const box = document.querySelector(".su-df__scroller");
  const track = box?.querySelector(".su-df__track");
  if (!box || !track) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  [...track.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); });
  let paused = false, dragging = false, startX = 0, startLeft = 0, raf = 0, wait = 0;
  const wrap = () => {
    const half = box.scrollWidth / 2;
    if (half > 0 && box.scrollLeft >= half) box.scrollLeft -= half;
    if (half > 0 && box.scrollLeft <= 0) box.scrollLeft += half;
  };
  const tick = () => {
    if (!paused && !reduce) { box.scrollLeft += 0.6; wrap(); }
    raf = requestAnimationFrame(tick);
  };
  const stop = () => { paused = true; clearTimeout(wait); };
  const resume = () => { clearTimeout(wait); wait = setTimeout(() => { paused = false; }, 2000); };
  box.addEventListener("mouseenter", stop);
  box.addEventListener("mouseleave", () => { if (!dragging) resume(); });
  box.addEventListener("touchstart", stop, { passive: true });
  box.addEventListener("touchend", resume);
  box.addEventListener("scroll", () => { if (paused) wrap(); }, { passive: true });
  box.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    dragging = true; startX = e.clientX; startLeft = box.scrollLeft; stop();
    box.classList.add("is-dragging");
  });
  addEventListener("pointermove", (e) => { if (dragging) box.scrollLeft = startLeft - (e.clientX - startX); });
  addEventListener("pointerup", () => { if (!dragging) return; dragging = false; box.classList.remove("is-dragging"); resume(); });
  box.scrollLeft = 1;
  raf = requestAnimationFrame(tick);
})();

(() => {
  // Member discount popup — closes with ×
  const promo = document.querySelector(".su-promo");
  promo?.querySelector(".su-promo__close")?.addEventListener("click", () => { promo.hidden = true; });
})();
