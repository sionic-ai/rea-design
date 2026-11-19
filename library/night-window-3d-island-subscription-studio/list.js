// Whole Work section: the grid motion is a Motion part (infinite-card-grid). Here are the original’s two add-ons —
// Cursor pill (View over a card, Drag over empty space, quickTo .35 power3), edge blur turns on at a .12 share by the distance the panel has moved (1 per 22px)
(() => {
  const { reduced, fine } = window.SQ;
  const grid = document.querySelector(".sq-grid"), cursor = document.querySelector(".sq-grid__cursor"), fov = grid.querySelector(".sq-grid__fov");
  if (fine && !reduced) {
    const qx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" }), qy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    let placed = false;
    grid.addEventListener("pointermove", (e) => {
      if (!placed) { gsap.set(cursor, { x: e.clientX, y: e.clientY }); placed = true; }
      qx(e.clientX); qy(e.clientY);
      cursor.dataset.mode = e.target.closest(".sq-grid__card") ? "view" : "drag";
      cursor.dataset.visible = "true";
    });
    grid.addEventListener("pointerleave", () => { cursor.dataset.visible = "false"; placed = false; });
  }
  if (reduced) return;
  // Measure the first card position every frame and turn on blur based on distance moved
  let last = null, blur = 0;
  gsap.ticker.add(() => {
    const it = grid.querySelector('[data-fx-part="item"]');
    if (!it) return;
    const x = gsap.getProperty(it, "x"), y = gsap.getProperty(it, "y");
    const raw = last ? Math.hypot(x - last.x, y - last.y) : 0;
    last = { x, y };
    // The jump of one cell width when wrapping the cells around is not motion
    const v = raw > 200 ? 0 : Math.min(1, raw / 22);
    blur += (v - blur) * 0.12;
    fov.style.opacity = blur < 0.01 ? "0" : blur.toFixed(3);
  });
})();
