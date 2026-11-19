// A blob (10px) with a wobbling shape follows the cursor late — each frame covers .1 of the remaining distance (at 60fps, corrected by frame length).
// Hovering a link or button grows it to 30px in 1s and tints it in .5s with that link’s color (data-blob-color). On receiving fx:flood the blob grows large enough to cover the screen (250vmax) and returns when released — blocks the page change.
(() => {
  kfFx.register("morph-blob-cursor", (el, { options, hover, reduce }) => {
    const k = +(options.follow ?? 0.1);
    const pick = options.links || "a, button, [data-blob-color]";
    const wrap = document.createElement("div");
    wrap.className = "fx-blob-follow";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<span class="fx-blob"></span>';
    el.append(wrap);
    const dot = wrap.firstElementChild;
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0, last = 0;
    const stack = [];
    const paint = () => { const c = stack[stack.length - 1]; c ? dot.style.setProperty("--fx-blob-now", c) : dot.style.removeProperty("--fx-blob-now"); };
    const place = () => { wrap.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`; };
    const tick = (now) => {
      const ratio = last ? Math.max(1, now - last) / (1000 / 60) : 1;
      last = now;
      const t = reduce ? 1 : 1 - (1 - k) ** ratio;
      cx += (x - cx) * t; cy += (y - cy) * t;
      place();
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.05 ? requestAnimationFrame(tick) : ((last = 0), 0);
    };
    const move = (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); };
    // Growth uses a variable instead of a class — keep the blob’s shape (class) always the same
    const grow = (on) => (on ? dot.style.setProperty("--fx-blob-on", "1") : dot.style.removeProperty("--fx-blob-on"));
    const over = (e) => {
      const a = e.target.closest?.(pick);
      if (!a || a.contains(e.relatedTarget)) return;
      grow(true);
      stack.push(a.getAttribute("data-blob-color") || options.tint || "");
      paint();
    };
    const out = (e) => {
      const a = e.target.closest?.(pick);
      if (!a || a.contains(e.relatedTarget)) return;
      stack.pop();
      if (!stack.length) grow(false);
      paint();
    };
    const flood = (e) => {
      const on = e.detail?.on !== false;
      wrap.classList.toggle("is-flood", on);
      // When covering, the color is the current tint as is (the pressed link’s color) — if given separately, that color
      if (on && e.detail?.color) { stack.push(e.detail.color); paint(); }
      if (!on) { stack.length = 0; grow(false); paint(); }
    };
    place();
    if (hover) {
      addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over);
      document.addEventListener("pointerout", out);
    } else wrap.classList.add("is-touch");
    document.addEventListener("fx:flood", flood);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("fx:flood", flood);
      wrap.remove();
    };
  });
})();
