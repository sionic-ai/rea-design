// Pressing the floating pill button (toggle) expands the pill into a panel (corners, width, height .4s) — is-opening is set while opening and is-closing while closing, held for dur and then removed.
// Closes on an outside click and hides while scrolling (not hidden if hide: none).
(() => {
  kfFx.register("pill-expand-panel", (el, { options }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    if (!toggle) return;
    const panel = el.querySelector('[data-fx-part="panel"]');
    const dur = +(options.dur ?? 0.4) * 1000;
    el.style.setProperty("--fx-dur", `${dur / 1000}s`);
    let open = false, t = 0, st = 0;
    const set = (on) => {
      clearTimeout(t);
      open = on;
      el.classList.toggle("is-opening", on);
      el.classList.toggle("is-closing", !on);
      if (on) el.classList.add("is-open");
      toggle.setAttribute("aria-expanded", String(on));
      panel?.setAttribute("aria-hidden", String(!on));
      if (el.tagName === "DETAILS" && on) el.open = true;
      t = setTimeout(() => {
        el.classList.remove("is-opening", "is-closing");
        if (!on) { el.classList.remove("is-open"); if (el.tagName === "DETAILS") el.open = false; }
      }, dur);
    };
    const click = (e) => { e.preventDefault(); set(!open); };
    const outside = (e) => { if (open && !el.contains(e.target)) set(false); };
    const scroll = () => { el.classList.add("is-scrolling"); clearTimeout(st); st = setTimeout(() => el.classList.remove("is-scrolling"), +(options.rest ?? 0.15) * 1000); };
    toggle.addEventListener("click", click);
    document.addEventListener("pointerdown", outside, { capture: true });
    if (options.hide !== "none") addEventListener("scroll", scroll, { passive: true });
    panel?.setAttribute("aria-hidden", "true");
    return () => {
      clearTimeout(t); clearTimeout(st);
      toggle.removeEventListener("click", click);
      document.removeEventListener("pointerdown", outside, { capture: true });
      removeEventListener("scroll", scroll);
      el.classList.remove("is-open", "is-opening", "is-closing", "is-scrolling");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
