// Drag-to-scroll horizontal strip — while dragging, scrollLeft follows the hand, and on release it glides at a speed of −gain×drag distance, shrinking by a factor of decay each frame.
// The DRAG pill turns on at the cursor only when the mouse is over the strip and the strip overflows (off over links and buttons)
(() => {
  kfFx.register("drag-strip-cursor", (el, { options, reduce, hover }) => {
    const gain = +(options.gain ?? 0.2), decay = +(options.decay ?? 0.9), threshold = +(options.threshold ?? 3);
    const over = () => el.scrollWidth > el.clientWidth + 1;
    let down = false, sx = 0, sl = 0, v = 0, glideRaf = 0, moved = false;
    const glide = () => {
      el.scrollLeft += v;
      v *= decay;
      glideRaf = Math.abs(v) > 0.5 ? requestAnimationFrame(glide) : 0;
    };
    const onDown = (e) => {
      if (e.button !== 0 || !over()) return;
      down = true; moved = false; sx = e.pageX; sl = el.scrollLeft;
      cancelAnimationFrame(glideRaf);
      pill?.classList.add("is-press");
    };
    const onMove = (e) => {
      if (!down) return;
      e.preventDefault();
      const dx = e.pageX - sx;
      if (Math.abs(dx) > threshold) moved = true;
      el.scrollLeft = sl - dx;
      v = -gain * dx;
    };
    const onUp = () => {
      pill?.classList.remove("is-press");
      if (!down) return;
      down = false;
      if (!reduce) glideRaf = requestAnimationFrame(glide);
    };
    const onClick = (e) => { if (moved && e.target.closest("a, button")) { e.preventDefault(); e.stopPropagation(); moved = false; } };

    let pill = null, made = false, mx = -999, my = -999, tickRaf = 0;
    const onPointer = (e) => { mx = e.clientX; my = e.clientY; };
    if (hover) {
      pill = el.querySelector(':scope > [data-fx-part="pill"]');
      if (!pill) {
        pill = document.createElement("span");
        pill.dataset.fxPart = "pill";
        pill.setAttribute("aria-hidden", "true");
        pill.textContent = options.text || "DRAG";
        el.appendChild(pill);
        made = true;
      }
      const tick = () => {
        pill.style.left = `${mx}px`;
        pill.style.top = `${my}px`;
        const r = el.getBoundingClientRect();
        const inside = mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
        let on = inside && over();
        if (on) {
          const hit = document.elementFromPoint(mx, my);
          if (hit && hit.closest("a, button, .no-cursor") && !hit.closest(".force-cursor")) on = false;
        }
        pill.classList.toggle("is-on", on);
        el.classList.toggle("is-fx-pill", on);
        tickRaf = requestAnimationFrame(tick);
      };
      tickRaf = requestAnimationFrame(tick);
      addEventListener("mousemove", onPointer, { passive: true });
      el.addEventListener("mousedown", onDown);
      el.addEventListener("mousemove", onMove);
      el.addEventListener("click", onClick, true);
      addEventListener("mouseup", onUp);
      el.addEventListener("mouseleave", onUp);
    }
    return () => {
      cancelAnimationFrame(glideRaf);
      cancelAnimationFrame(tickRaf);
      removeEventListener("mousemove", onPointer);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClick, true);
      removeEventListener("mouseup", onUp);
      el.removeEventListener("mouseleave", onUp);
      el.classList.remove("is-fx-pill");
      if (made) pill?.remove(); else pill?.classList.remove("is-on", "is-press");
    };
  });
})();
