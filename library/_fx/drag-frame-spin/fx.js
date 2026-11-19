// Drag to spin — dragging sideways rotates the frame set (default 259 frames) by that amount. Dragging 80% of the screen width makes one turn, wrapping from the end back to the start.
// On receiving fx:reset it returns to the nearest wheel end (front) in .4s power2.out. The art is img[data-fx-part=frame] or the side that receives fx:frame draws it
(() => {
  kfFx.register("drag-frame-spin", (el, { options, reduce }) => {
    const canvas = el.querySelector('[data-fx-part="canvas"]');
    const imgs = [...el.querySelectorAll('img[data-fx-part="frame"]')];
    const frames = imgs.length || Math.max(2, +options.frames || 259);
    const span = +(options.span ?? 0.8) || 0.8, back = +(options.back ?? 0.4);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const st = { p: 0 };
    let last = -1, drag = null;
    const draw = () => {
      const i = Math.min(frames - 1, Math.max(0, Math.round(st.p * (frames - 1))));
      if (i === last) return;
      last = i;
      if (canvas && imgs[i]?.complete && imgs[i].naturalWidth) {
        const g = canvas.getContext("2d");
        if (canvas.width !== imgs[i].naturalWidth) { canvas.width = imgs[i].naturalWidth; canvas.height = imgs[i].naturalHeight; }
        g.clearRect(0, 0, canvas.width, canvas.height);
        g.drawImage(imgs[i], 0, 0);
      }
      el.dispatchEvent(new CustomEvent("fx:frame", { detail: { progress: st.p, index: i, frames } }));
    };
    const down = (e) => {
      if (e.button > 0) return;
      drag = { id: e.pointerId, x: e.clientX };
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("is-dragging");
      gsap.killTweensOf(st);
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      st.p = (((st.p + dx / (innerWidth * span)) % 1) + 1) % 1;
      draw();
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      el.releasePointerCapture?.(e.pointerId);
      drag = null;
      el.classList.remove("is-dragging");
    };
    const reset = () => {
      const to = Math.round(st.p);
      if (reduce) { st.p = to % 1; last = -1; draw(); return; }
      gsap.to(st, { p: to, duration: back, ease, onUpdate: draw, onComplete: () => { st.p %= 1; } });
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("fx:reset", reset);
    draw();
    return () => {
      gsap.killTweensOf(st);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("fx:reset", reset);
      el.classList.remove("is-dragging");
    };
  });
})();
