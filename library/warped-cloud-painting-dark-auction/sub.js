// Sub-page — blog tile row: on press or sideways drag (beyond 36px), that tile widens (21.1vw → 37.4vw, .55s) and moves to the row center.
(() => {
  document.querySelectorAll("[data-journal-carousel]").forEach((row) => {
    const track = row.querySelector(".e-jr__track"), tiles = [...row.querySelectorAll(".e-jr__tile")];
    let cur = tiles.findIndex((t) => t.classList.contains("is-active"));
    const size = () => (innerWidth <= 1023 ? { small: 0.56 * innerWidth, big: 0.76 * innerWidth } : { small: 0.211 * innerWidth, big: 0.374 * innerWidth });
    const place = () => { const { small, big } = size(); track.style.transform = `translate3d(${(row.clientWidth / 2 - (cur * (small + 12) + big / 2)).toFixed(1)}px, 0, 0)`; };
    const go = (i) => { cur = Math.max(0, Math.min(tiles.length - 1, i)); tiles.forEach((t, k) => t.classList.toggle("is-active", k === cur)); place(); };
    tiles.forEach((t, i) => t.addEventListener("click", () => go(i)));
    let down = false, sx = 0, sy = 0, used = false;
    row.addEventListener("pointerdown", (e) => { down = true; used = false; sx = e.clientX; sy = e.clientY; });
    row.addEventListener("pointermove", (e) => {
      if (!down || used) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dy) > Math.abs(dx)) { down = false; return; }
      if (Math.abs(dx) < 36) return;
      used = true; go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    addEventListener("pointerup", () => (down = false));
    addEventListener("resize", place);
    go(cur < 0 ? 0 : cur);
  });
})();
