// Home page — stack of thrown review cards (same numbers as the original site’s code block): back cards go 10px lower·.04x smaller·−3°/+3° per depth, when the front card is pressed
// Flies right by card width+40px in .16s ease-out while fading (with a finger only 25% (max 100px) in .38s), and when dragged it is thrown in the dragged direction (mouse tilts ±10°).
// The stack tilts up to 2° with scroll position (1·−.75·.5 times per card), and arrow keys flip through it too.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const SKIP = "a, button, input, textarea, select, label, [contenteditable], [role='button'], [role='link']";
  document.querySelectorAll("[data-review-stack]").forEach((stack) => {
    const cards = [...stack.children].filter((c) => c.classList.contains("rv__card"));
    if (cards.length < 2) return;
    stack.classList.add("is-active");
    if (!stack.hasAttribute("tabindex")) stack.tabIndex = 0;
    stack.setAttribute("aria-label", "Reviews. Use the arrow keys to see the next review.");
    const TIME = 160, SPACING = 10, TILT = 2;
    let drag = null, busy = false, suppress = false, lastType = "mouse", frame = null;

    const tilt = () => {
      frame = null;
      if (drag || busy) return;
      const b = stack.getBoundingClientRect(), vh = innerHeight;
      const p = Math.max(-1, Math.min(1, (vh / 2 - (b.top + b.height / 2)) / Math.max(1, (vh + b.height) / 2)));
      const t = reduce.matches ? 0 : p * TILT;
      cards.forEach((c, i) => (c.style.rotate = `${(t * (i === 1 ? -0.75 : i === 2 ? 0.5 : 1)).toFixed(3)}deg`));
    };
    const soon = () => { if (frame === null) frame = requestAnimationFrame(tilt); };
    addEventListener("scroll", soon, { passive: true, capture: true });
    addEventListener("resize", soon, { passive: true });

    const render = () => cards.forEach((c, i) => {
      const d = Math.min(i, 2), a = d === 1 ? -3 : d === 2 ? 3 : 0;
      c.classList.toggle("is-front", i === 0);
      c.classList.remove("is-dragging");
      c.style.zIndex = cards.length - i;
      c.style.visibility = i > 2 ? "hidden" : "visible";
      c.style.transform = `translateY(${d * SPACING}px) scale(${1 - d * 0.04}) rotate(${a}deg)`;
      c.inert = i !== 0;
      c.setAttribute("aria-hidden", String(i !== 0));
    });

    const next = async (dir = 1, axis = "x", vec = null, touch = false) => {
      if (busy) return;
      busy = true;
      const card = cards[0];
      let anim;
      if (card.contains(document.activeElement)) stack.focus({ preventScroll: true });
      try {
        if (!reduce.matches && card.animate) {
          const tf = getComputedStyle(card).transform;
          const start = tf === "none" ? new DOMMatrix() : new DOMMatrix(tf), end = new DOMMatrix(start.toString());
          const b = card.getBoundingClientRect();
          if (touch) end.m41 += (vec ? Math.sign(vec.x) || dir : dir) * Math.min(100, b.width * 0.25);
          else if (vec) { const l = Math.hypot(vec.x, vec.y), dist = Math.hypot(b.width, b.height) + 40; end.m41 += (vec.x / l) * dist; end.m42 += (vec.y / l) * dist; }
          else if (axis === "y") end.m42 += dir * (b.height + 40);
          else end.m41 += dir * (b.width + 40);
          anim = card.animate([{ transform: start.toString(), opacity: 1 }, { transform: end.toString(), opacity: 0 }], { duration: touch ? 380 : TIME, easing: touch ? "cubic-bezier(0.25, 0.1, 0.25, 1)" : "ease-out", fill: "forwards" });
          await anim.finished;
        }
      } catch (e) { /* Advances even if interrupted */ }
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

    stack.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      suppress = false;
      lastType = e.pointerType;
      if (busy || drag || e.target.closest(SKIP)) return;
      const card = e.target.closest(".rv__card");
      if (card !== cards[0]) return;
      drag = { card, id: e.pointerId, x: e.clientX, y: e.clientY, axis: null, moved: false, dir: 1, vec: { x: 1, y: 0 }, free: e.pointerType === "mouse" };
      card.setPointerCapture(e.pointerId);
    });
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.axis && (dx || dy)) drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (!drag.axis) return;
      suppress = true;
      if (drag.axis === "y" && !drag.free) return;
      const x = dx, y = drag.free ? dy : 0;
      if (x || y) { drag.moved = true; drag.vec = { x, y }; drag.dir = Math.sign(x || y); }
      if (!drag.moved) return;
      drag.card.classList.add("is-dragging");
      drag.card.style.transform = drag.free ? `translate(${x}px, ${y}px) rotate(${Math.max(-10, Math.min(10, x * 0.04))}deg)` : `translate3d(${x}px, 0, 0)`;
    };
    const finish = (e, cancelled) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!cancelled) move(e);
      const r = drag;
      drag = null;
      suppress = cancelled || r.moved || r.axis !== null;
      if (r.card.hasPointerCapture(r.id)) r.card.releasePointerCapture(r.id);
      if (r.moved) next(r.dir, r.axis, r.vec, !r.free);
      else soon();
    };
    stack.addEventListener("pointermove", (e) => drag && e.pointerId === drag.id && move(e));
    stack.addEventListener("pointerup", (e) => finish(e, false));
    stack.addEventListener("pointercancel", (e) => finish(e, true));
    stack.addEventListener("lostpointercapture", (e) => drag && e.pointerId === drag.id && finish(e, true));
    stack.addEventListener("click", (e) => {
      if (e.target.closest(SKIP) || busy || drag || suppress) return;
      if (e.target.closest(".rv__card") === cards[0]) next(1, "x", null, lastType !== "mouse");
    });
    stack.addEventListener("keydown", (e) => {
      if (e.target !== stack || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      if (!drag) next(e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1, e.key === "ArrowUp" || e.key === "ArrowDown" ? "y" : "x");
    });
    render();
    soon();
  });

  // Video sound button — a placeholder, so there is no video, only the button look changes
  document.querySelectorAll(".st__mute").forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-label") === "Sound On";
    b.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
    b.querySelector("path").setAttribute("d", on ? "M3 8h3l4-3v10l-4-3H3zM13 7a4 4 0 0 1 0 6M15 5a7 7 0 0 1 0 10" : "M3 8h3l4-3v10l-4-3H3zM13 8l4 4M17 8l-4 4");
  }));
})();
