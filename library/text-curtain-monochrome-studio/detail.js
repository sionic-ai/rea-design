// Entering directly on a work detail address, the ring unfolds behind and the drawer starts open (original /<Work address> Same order as entry).
// The word part attaches on DOMContentLoaded, so open right after it — if opened earlier, the words stay hidden
(() => {
  const GV = window.GV;
  if (!GV?.drawer) return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => GV.drawer.open(), { once: true });
  else GV.drawer.open();
})();
