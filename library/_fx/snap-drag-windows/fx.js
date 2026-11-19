// Grid cell dragging — grabbing the window (win) handle makes a clone follow the hand at .16s power4.out and a dotted cell shows where it will land (cell px grid, give cols to set the cell width).
// On drop, the original window moves into that slot, sliding in from the clone position over dur(1s) on the original curve. Windows are placed inside the board with left and top.
(() => {
  kfFx.register("snap-drag-windows", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const cell = +options.cell || 20, cols = +options.cols || 0, gap = +(options.gap ?? 20);
    const follow = +(options.follow ?? 0.16), dur = +(options.dur ?? 1), ease = kfFx.ease(options.ease || "0.33,0,0,1", "expo.out");
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const ghost = document.createElement("div");
    ghost.className = "fx-sdw-ghost";
    ghost.setAttribute("aria-hidden", "true");
    el.append(ghost);
    const clamp = (lo, hi, v) => Math.min(Math.max(v, lo), Math.max(lo, hi));
    const snapX = (x, w) => {
      if (!cols) return clamp(0, el.clientWidth - w, Math.round(x / cell) * cell);
      const step = (el.clientWidth - (cols - 1) * gap) / cols + gap;
      return clamp(0, el.clientWidth - w, Math.round(x / step) * step);
    };
    const snapY = (y, h) => clamp(0, el.clientHeight - h, Math.round(y / cell) * cell);
    let drag = null;
    const down = (e) => {
      if (e.button) return;
      const handle = e.target.closest?.('[data-fx-part="handle"]');
      const win = handle?.closest('[data-fx-part="win"]');
      if (!win || !el.contains(win) || win.classList.contains("fx-sdw-float")) return;
      e.preventDefault();
      const er = el.getBoundingClientRect(), r = win.getBoundingClientRect();
      const float = win.cloneNode(true);
      float.classList.add("fx-sdw-float");
      float.removeAttribute("data-fx-part");
      float.setAttribute("aria-hidden", "true");
      float.querySelectorAll("[data-fx-part]").forEach((n) => n.removeAttribute("data-fx-part"));
      gsap.set(float, { position: "absolute", left: r.left - er.left, top: r.top - er.top, width: r.width, height: r.height, margin: 0, x: 0, y: 0 });
      el.append(float);
      win.classList.add("is-fx-dragging");
      drag = {
        win, float, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, h: r.height, tx: r.left - er.left, ty: r.top - er.top,
        qx: gsap.quickTo(float, "left", { duration: reduce ? 0 : follow, ease: "power4.out" }),
        qy: gsap.quickTo(float, "top", { duration: reduce ? 0 : follow, ease: "power4.out" }),
      };
      gsap.set(ghost, { left: drag.tx, top: drag.ty, width: r.width, height: r.height, opacity: 1 });
    };
    const move = (e) => {
      if (!drag) return;
      const er = el.getBoundingClientRect(), x = e.clientX - er.left - drag.ox, y = e.clientY - er.top - drag.oy;
      drag.qx(x); drag.qy(y);
      const tx = snapX(x, drag.w), ty = snapY(y, drag.h);
      if (tx !== drag.tx || ty !== drag.ty) {
        drag.tx = tx; drag.ty = ty;
        gsap.to(ghost, { left: tx, top: ty, duration: reduce ? 0 : follow, ease: "power4.out", overwrite: true });
        el.dispatchEvent(new CustomEvent("fx:snap", { detail: { x: tx, y: ty } }));
      }
    };
    const up = () => {
      if (!drag) return;
      const { win, float, tx, ty } = drag;
      drag = null;
      const fr = float.getBoundingClientRect();
      float.remove();
      win.classList.remove("is-fx-dragging");
      win.style.left = tx + "px";
      win.style.top = ty + "px";
      const nr = win.getBoundingClientRect();
      gsap.fromTo(win, { x: fr.left - nr.left, y: fr.top - nr.top }, { x: 0, y: 0, duration: reduce ? 0 : dur, ease, clearProps: "transform" });
      gsap.to(ghost, { opacity: 0, duration: 0.3 });
      el.dispatchEvent(new CustomEvent("fx:drop", { detail: { win, x: tx, y: ty } }));
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      drag?.float.remove();
      drag?.win.classList.remove("is-fx-dragging");
      drag = null;
      ghost.remove();
    };
  });
})();
