(() => {
  // When over a marker (data-cursor) in the panel, an accent-color circle (96px) grows from 0 at the cursor position (.9s cubic-bezier(.135,.9,.15,1)) and hides the system cursor.
  // The circle follows the cursor with no lag (the original sets top·left on every pointermove), and inside it holds the arrow chosen by that indicator (↗ · left-right drag). Turned off below 1280 and on touch.
  const ICONS = {
    "arrow-up-right": '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1h8v8H9.5V3.6L2 11.1.9 10l7.5-7.5H3z"/></svg>',
    drag: '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M5 1 0 6l5 5V7h14v4l5-5-5-5v4H5z"/></svg>',
    play: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z"/></svg>',
  };
  kfFx.register("drag-disc-cursor", (el, { options, reduce, hover }) => {
    const from = +(options.from ?? 1280);
    if (!hover || reduce) return;
    const disc = document.createElement("div");
    disc.className = "fx-drag-disc";
    disc.setAttribute("aria-hidden", "true");
    disc.innerHTML = '<span class="fx-drag-disc__in"></span>';
    el.append(disc);
    const inner = disc.firstChild;
    let on = null;
    // Like a flowing strip, when content is large and moves underneath, pointerover may not arrive, so recheck the mark on each movement too
    const move = (e) => {
      disc.style.left = e.clientX + "px"; disc.style.top = e.clientY + "px";
      const t = e.target.closest?.("[data-cursor]");
      if (t && t !== on && el.contains(t)) over(e);
      else if (!t && on) { on = null; disc.classList.remove("is-on"); el.classList.remove("fx-no-cursor"); }
    };
    const over = (e) => {
      if (innerWidth < from) return;
      const t = e.target.closest?.("[data-cursor]");
      if (!t || !el.contains(t) || t === on) return;
      on = t;
      inner.innerHTML = ICONS[t.dataset.cursor] || ICONS["arrow-up-right"];
      disc.classList.add("is-on");
      el.classList.add("fx-no-cursor");
    };
    const out = (e) => {
      if (!on) return;
      const to = e.relatedTarget;
      if (to && on.contains(to)) return;
      on = null;
      disc.classList.remove("is-on");
      el.classList.remove("fx-no-cursor");
    };
    addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerout", out);
    return () => {
      removeEventListener("pointermove", move);
      el.removeEventListener("pointerover", over); el.removeEventListener("pointerout", out);
      el.classList.remove("fx-no-cursor"); disc.remove();
    };
  });
})();
