(() => {
  // Push straight in the opposite direction of the mouse position inside the cell (−1~1), up to the amount the enlarged panel overflows the cell. Returns in place on leave.
  kfFx.register("cursor-pan-scene", (el, { reduce, hover }) => {
    const scene = el.querySelector('[data-fx-part="scene"]');
    if (!scene) return;
    const off = [];
    const scale = () => new DOMMatrix(getComputedStyle(scene).transform).a || 1;
    if (hover && !reduce) {
      const move = (e) => {
        const r = el.getBoundingClientRect(), s = scale();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        const mx = Math.max(0, (scene.offsetWidth * s - r.width) / 2), my = Math.max(0, (scene.offsetHeight * s - r.height) / 2);
        scene.style.transform = `translate(${-nx * mx}px, ${-ny * my}px) scale(${s})`;
      };
      const leave = () => (scene.style.transform = "");
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      off.push(() => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); scene.style.transform = ""; });
    }
    // With a finger only the pressed character lifts briefly (.45s) — it does not drag the panel, so page scroll is not blocked
    const press = (e) => {
      const a = e.target.closest?.('[data-fx-part="actor"]');
      if (!a || !el.contains(a)) return;
      a.classList.add("is-press");
      setTimeout(() => a.classList.remove("is-press"), 450);
    };
    el.addEventListener("touchstart", press, { passive: true });
    off.push(() => el.removeEventListener("touchstart", press));
    return () => off.forEach((f) => f());
  });
})();
