(() => {
  // Original Brand footer links (data-directional-hover): the tile is instantly placed at the edge the pointer entered from (the nearest of top, bottom, left, right), and
  // Covers over .5s cubic-bezier(.16,1,.3,1). On exit it slips out toward the side it left. axis: y means up/down only, x means left/right only.
  // gap — extra gap (px, default 2 — so fractional-pixel seams don’t show through) pushing hidden tiles further beyond the edge. 0 if the original enters at exactly 100%
  const away = (g) => ({ top: `translateY(calc(-100% - ${g}px))`, bottom: `translateY(calc(100% + ${g}px))`, left: `translateX(calc(-100% - ${g}px))`, right: `translateX(calc(100% + ${g}px))` });
  kfFx.register("direction-tile-hover", (el, { options, hover }) => {
    const tile = el.querySelector('[data-fx-part="tile"]');
    if (!tile || !hover) return;
    const T = away(+(options.gap ?? 2));
    const axis = options.axis || "all";
    const side = (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (axis === "y") return y < r.height / 2 ? "top" : "bottom";
      if (axis === "x") return x < r.width / 2 ? "left" : "right";
      const d = { top: y, right: r.width - x, bottom: r.height - y, left: x };
      return Object.entries(d).reduce((a, b) => (a[1] < b[1] ? a : b))[0];
    };
    // Given a duration·curve, sets entering and leaving separately instead of the CSS default (.5s cubic-bezier(.16,1,.3,1)). With fade, it fades out while leaving (Name)
    const bez = (c) => (String(c).includes(",") ? `cubic-bezier(${c})` : c);
    const inT = options.dur || options.ease ? `transform ${+(options.dur ?? 0.5)}s ${bez(options.ease || "0.16,1,0.3,1")}` : "";
    const outT = options.out || options.outEase ? `transform ${+(options.out ?? options.dur ?? 0.5)}s ${bez(options.outEase || options.ease || "0.16,1,0.3,1")}` : inT;
    const fade = options.fade === "true";
    const enter = (e) => { const s = side(e); tile.style.transition = "none"; tile.style.transform = T[s]; if (fade) tile.style.opacity = "1"; void tile.offsetHeight; tile.style.transition = inT; tile.style.transform = "translate(0%, 0%)"; el.dataset.fxStatus = `enter-${s}`; };
    const leave = (e) => { const s = side(e); tile.style.transition = fade ? `${outT || "transform .5s cubic-bezier(.16,1,.3,1)"}, opacity ${+(options.out ?? options.dur ?? 0.5)}s ${bez(options.outEase || options.ease || "0.16,1,0.3,1")}` : outT; tile.style.transform = T[s]; if (fade) tile.style.opacity = "0"; el.dataset.fxStatus = `leave-${s}`; };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); tile.style.transform = ""; tile.style.transition = ""; tile.style.opacity = ""; delete el.dataset.fxStatus; };
  });
})();
