// Common to all pages: city clock (every second), and showing work cell labels in time with the cell opening delay.
// Cell open is clip-wipe-in, group selection frame is group-select-frame, tag is cursor-tag-follow, eyes are the eye-follow motion part (data-fx in html).
(() => {
  const clock = document.querySelector(".gf-clock [data-time]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: clock.dataset.time || "Europe/Madrid", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  // When the cell opens (fx:in) the label settles down from −6px with the same delay. With the reduced-motion setting, css shows it from the start
  document.addEventListener("fx:in", (e) => {
    const tile = e.target.closest?.(".gf-tile");
    if (!tile) return;
    tile.style.setProperty("--gf-delay", `${(e.detail && e.detail.delay) || 0}s`);
    tile.classList.add("is-in");
  });

  // When returning from cache via Back, reopen from the initial state like the original
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
})();
