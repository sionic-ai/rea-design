// Home — hovering a work cell keeps only that work and fades the other cells to .2 (.2s cubic-bezier(.23,1,.32,1)).
// Delay the leave by one beat (delayedCall 0) so it doesn’t release while moving from cell to cell.
// Like the original, no blur is applied until the cursor moves more than 30px from where the page opened (so the cell under the cursor is not blurred on open)
(() => {
  const grid = document.querySelector("[data-grid]");
  const items = [...grid.querySelectorAll(".g-item")];
  if (!G.fine) return;
  // The original locks to the last cursor position when hooking a page (0,0 if it hasn’t moved yet)
  let pending = null, waiting = null;
  const lockAt = { x: 0, y: 0, on: true };
  addEventListener("pointermove", (e) => {
    if (lockAt.on && Math.hypot(e.clientX - lockAt.x, e.clientY - lockAt.y) > 30) { lockAt.on = false; if (waiting) { const s = waiting; waiting = null; focus(s); } }
  }, { passive: true });
  const focus = (slug) => {
    pending?.kill(); pending = null;
    if (lockAt.on) { waiting = slug; return; }
    items.forEach((it) => it.classList.toggle("is-dim", it.dataset.project !== slug));
  };
  const release = () => {
    waiting = null;
    pending?.kill();
    pending = gsap.delayedCall(0, () => { pending = null; items.forEach((it) => it.classList.remove("is-dim")); });
  };
  items.forEach((it) => {
    it.addEventListener("mouseenter", () => focus(it.dataset.project));
    it.addEventListener("mouseleave", release);
  });
  grid.addEventListener("mouseleave", release);
})();
