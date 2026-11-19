(() => {
  // Original Brand cursor: each frame it follows .2 of the remaining distance, stretches toward the movement direction by remaining distance/120 (max .38) (horizontal 1+c, vertical 1−.6c) and rotates to that direction.
  // Over interaction spots (data-cursor, a, button, label, select) the state changes — links get a ring, and with a label it becomes a dark circle plus text.
  kfFx.register("stretch-invert-cursor", (el, { options, reduce, hover }) => {
    const ball = el.querySelector('[data-fx-part="ball"]');
    if (!ball) return;
    if (reduce || !hover) {
      el.hidden = true;
      return () => { el.hidden = false; };
    }
    const label = el.querySelector('[data-fx-part="label"]');
    const lerp = +(options.lerp ?? 0.2);
    const reach = +(options.reach || 120);
    const most = +(options.max ?? 0.38);
    const pick = options.pick || "[data-cursor], a, button, label, select";
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = 0;

    const setState = (target) => {
      const hit = target instanceof Element ? target.closest(pick) : null;
      const state = hit ? hit.dataset.cursor ?? "link" : "";
      const text = hit?.dataset.cursorLabel ?? "";
      el.dataset.state = state;
      el.dataset.mode = state === "" ? "" : state === "link" ? "ring" : text ? "label" : "";
      if (label && label.textContent !== text) label.textContent = text;
    };
    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("is-on");
    };
    const over = (e) => setState(e.target);
    const leave = () => el.classList.remove("is-on");
    const reset = () => setState(null);

    const tick = () => {
      const dx = tx - x, dy = ty - y;
      x += dx * lerp;
      y += dy * lerp;
      const c = Math.min(Math.hypot(dx, dy) / reach, most);
      const turn = (Math.atan2(dy, dx) * 180) / Math.PI;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      ball.style.transform = `rotate(${turn.toFixed(1)}deg) scale(${(1 + c).toFixed(3)}, ${(1 - c * 0.6).toFixed(3)})`;
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("fx:cursor-reset", reset);
    reset();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("fx:cursor-reset", reset);
      el.classList.remove("is-on");
      el.style.transform = "";
      ball.style.transform = "";
      delete el.dataset.state;
      delete el.dataset.mode;
    };
  });
})();
