// STUDIO modal drawer — when closed, the layer holding the veil · plate is detached from the document, on press it is attached as in the original, then turned on over .4s after .04s.
// The panel enters after .24s, transparent and 300px from the side, over .3s. When closed by the close button, curtain or Esc the panel slides out and the layer turns off in .4s, then is detached once fully off.
// Motion is the transition in fx.css
(() => {
  kfFx.register("fade-slide-drawer", (el, { options, reduce }) => {
    const layer = el.querySelector('[data-fx-part="layer"]');
    const panel = layer?.querySelector('[data-fx-part="panel"]');
    if (!layer || !panel) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const toggles = [...el.querySelectorAll('[data-fx-part="toggle"]')];
    const vars = { wait: 0.04, fade: 0.4, delay: 0.24, dur: 0.3 };
    const sec = {};
    for (const k in vars) {
      sec[k] = reduce ? 0 : +(options[k] ?? vars[k]);
      el.style.setProperty(`--fx-${k}`, `${sec[k]}s`);
    }
    // side: top means it comes down from above. narrow-side and narrow-shift are the side and distance used at screens narrow-at (px) or below (Brand: wide → from right 440 · phone → from top 480)
    const shiftFor = (side, dist) => {
      const d = +(dist ?? 300);
      el.style.setProperty("--fx-shift", side === "top" ? "0px" : `${(side === "right" ? 1 : -1) * d}px`);
      el.style.setProperty("--fx-shift-y", side === "top" ? `${-d}px` : "0px");
    };
    const narrow = options["narrow-side"] || options["narrow-shift"] != null ? matchMedia(`(max-width: ${+(options["narrow-at"] ?? 540)}px)`) : null;
    const place = () => (narrow?.matches ? shiftFor(options["narrow-side"] || options.side, options["narrow-shift"] ?? options.shift) : shiftFor(options.side, options.shift));
    place();
    narrow?.addEventListener("change", place);
    const mark = document.createComment("fade-slide-drawer");
    layer.replaceWith(mark);
    let back = null, timer = 0;
    const set = (open) => {
      if (open === el.classList.contains("is-open")) return;
      clearTimeout(timer);
      if (open) {
        // Draw the attached layer once, then is-open — if it is added right on attach, it jumps to the end value with no transition
        if (!layer.isConnected) mark.replaceWith(layer);
        void layer.offsetWidth;
      } else {
        timer = setTimeout(() => { if (!el.classList.contains("is-open") && layer.isConnected) layer.replaceWith(mark); }, (sec.fade + sec.wait) * 1000);
      }
      el.classList.toggle("is-open", open);
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close"));
      if (open) {
        back = document.activeElement;
        (layer.querySelector('[data-fx-part="close"]') || panel).focus({ preventScroll: true });
      } else if (back && back.isConnected) back.focus({ preventScroll: true });
    };
    toggles.forEach((t) => t.addEventListener("click", () => set(!el.classList.contains("is-open")), on));
    layer.querySelectorAll('[data-fx-part="close"], [data-fx-part="lay"]').forEach((c) => c.addEventListener("click", () => set(false), on));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); }, on);
    return () => {
      ac.abort();
      narrow?.removeEventListener("change", place);
      clearTimeout(timer);
      el.classList.remove("is-open");
      if (mark.parentNode) mark.replaceWith(layer);
      ["wait", "fade", "delay", "dur", "shift", "shift-y"].forEach((k) => el.style.removeProperty(`--fx-${k}`));
    };
  });
})();
