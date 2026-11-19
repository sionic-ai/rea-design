(() => {
  const SKIP = "a, button, input, textarea, select, label, [contenteditable], [role='button'], [role='link']";
  kfFx.register("throw-card-stack", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll(':scope > [data-fx-part="card"]')];
    if (cards.length < 2) return;
    const SP = +(options.spacing ?? 10), TILT = +(options.tilt ?? 3), ST = reduce ? 0 : +(options.scroll ?? 2), DUR = Math.max(0, +(options.dur ?? 0.16)) * 1000;
    const hadTab = el.hasAttribute("tabindex");
    if (!hadTab) el.tabIndex = 0;
    let drag = null, busy = false, suppress = false, lastType = "mouse", frame = null, alive = true;
    const tilt = () => {
      frame = null;
      if (!alive || drag || busy) return;
      const b = el.getBoundingClientRect(), vh = innerHeight;
      const p = Math.max(-1, Math.min(1, (vh / 2 - (b.top + b.height / 2)) / Math.max(1, (vh + b.height) / 2)));
      cards.forEach((c, i) => (c.style.rotate = `${(p * ST * (i === 1 ? -0.75 : i === 2 ? 0.5 : 1)).toFixed(3)}deg`));
    };
    const soon = () => { if (frame === null) frame = requestAnimationFrame(tilt); };
    const render = () => cards.forEach((c, i) => {
      const d = Math.min(i, 2), a = d === 1 ? -TILT : d === 2 ? TILT : 0;
      c.classList.toggle("fx-front", i === 0);
      c.classList.remove("fx-dragging");
      c.style.zIndex = cards.length - i;
      c.style.visibility = i > 2 ? "hidden" : "visible";
      c.style.transform = `translateY(${d * SP}px) scale(${1 - d * 0.04}) rotate(${a}deg)`;
      c.inert = i !== 0;
    });
    const next = async (dir = 1, axis = "x", vec = null, touch = false) => {
      if (busy) return;
      busy = true;
      const card = cards[0];
      let anim;
      if (card.contains(document.activeElement)) el.focus({ preventScroll: true });
      try {
        if (!reduce && DUR && card.animate) {
          const tf = getComputedStyle(card).transform, start = tf === "none" ? new DOMMatrix() : new DOMMatrix(tf), end = new DOMMatrix(start.toString()), b = card.getBoundingClientRect();
          if (touch) end.m41 += (vec ? Math.sign(vec.x) || dir : dir) * Math.min(100, b.width * 0.25);
          else if (vec) { const l = Math.hypot(vec.x, vec.y) || 1, d = Math.hypot(b.width, b.height) + 40; end.m41 += (vec.x / l) * d; end.m42 += (vec.y / l) * d; }
          else if (axis === "y") end.m42 += dir * (b.height + 40);
          else end.m41 += dir * (b.width + 40);
          anim = card.animate([{ transform: start.toString(), opacity: 1 }, { transform: end.toString(), opacity: 0 }], { duration: touch ? 380 : DUR, easing: touch ? "cubic-bezier(0.25, 0.1, 0.25, 1)" : "ease-out", fill: "forwards" });
          await anim.finished;
        }
      } catch (e) { /* Advances even if interrupted */ }
      if (!alive) return;
      cards.push(cards.shift());
      const prev = card.style.transition;
      card.style.transition = "none";
      render();
      anim?.cancel();
      void card.offsetWidth;
      card.style.transition = prev;
      busy = false;
      soon();
    };
    const down = (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      suppress = false;
      lastType = e.pointerType;
      if (busy || drag || e.target.closest(SKIP)) return;
      const card = e.target.closest('[data-fx-part="card"]');
      if (card !== cards[0]) return;
      drag = { card, id: e.pointerId, x: e.clientX, y: e.clientY, axis: null, moved: false, dir: 1, vec: { x: 1, y: 0 }, free: e.pointerType === "mouse" };
      card.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.axis && (dx || dy)) drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (!drag.axis) return;
      suppress = true;
      if (drag.axis === "y" && !drag.free) return;
      const x = dx, y = drag.free ? dy : 0;
      if (x || y) { drag.moved = true; drag.vec = { x, y }; drag.dir = Math.sign(x || y); }
      if (!drag.moved) return;
      drag.card.classList.add("fx-dragging");
      drag.card.style.transform = drag.free ? `translate(${x}px, ${y}px) rotate(${Math.max(-10, Math.min(10, x * 0.04))}deg)` : `translate3d(${x}px, 0, 0)`;
    };
    const finish = (e, cancelled) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!cancelled) move(e);
      const r = drag;
      drag = null;
      suppress = cancelled || r.moved || r.axis !== null;
      if (r.card.hasPointerCapture?.(r.id)) r.card.releasePointerCapture(r.id);
      if (r.moved) next(r.dir, r.axis, r.vec, !r.free);
      else soon();
    };
    const up = (e) => finish(e, false), cancel = (e) => finish(e, true);
    const click = (e) => {
      if (e.target.closest(SKIP) || busy || drag || suppress) return;
      if (e.target.closest('[data-fx-part="card"]') === cards[0]) next(1, "x", null, lastType !== "mouse");
    };
    const key = (e) => {
      if (e.target !== el || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      if (!drag) next(e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1, e.key === "ArrowUp" || e.key === "ArrowDown" ? "y" : "x");
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("lostpointercapture", cancel);
    el.addEventListener("click", click);
    el.addEventListener("keydown", key);
    addEventListener("scroll", soon, { passive: true, capture: true });
    addEventListener("resize", soon, { passive: true });
    render();
    soon();
    return () => {
      alive = false;
      if (frame !== null) cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel); el.removeEventListener("lostpointercapture", cancel); el.removeEventListener("click", click); el.removeEventListener("keydown", key);
      removeEventListener("scroll", soon, { capture: true }); removeEventListener("resize", soon);
      if (!hadTab) el.removeAttribute("tabindex");
      cards.forEach((c) => { c.classList.remove("fx-front", "fx-dragging"); c.inert = false; ["zIndex", "visibility", "transform", "rotate"].forEach((p) => (c.style[p] = "")); });
    };
  });
})();
