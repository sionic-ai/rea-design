// Pressing the two-line burger, a background-colored panel covers the screen and shows through in place (.6s), and the two burger lines converge from ±5px to the center and bend ±45° into an X (.3s).
// Pressing again or Esc collapses it over the same duration. Panel and line motion is CSS transition, so here only the open state (is-fx-open) and aria are toggled
(() => {
  kfFx.register("fade-cover-menu", (el, { options }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.line != null) el.style.setProperty("--fx-line-dur", `${+options.line}s`);
    const set = (open) => {
      el.classList.toggle("is-fx-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      panel.inert = !open;
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const click = () => set(!el.classList.contains("is-fx-open"));
    const key = (e) => { if (e.key === "Escape" && el.classList.contains("is-fx-open")) { set(false); toggle.focus(); } };
    // Clicking a link inside the panel closes it (so the panel doesn’t remain after a same-page # jump)
    const pick = (e) => { if (e.target.closest("a")) set(false); };
    set(false);
    toggle.addEventListener("click", click);
    panel.addEventListener("click", pick);
    addEventListener("keydown", key);
    return () => {
      toggle.removeEventListener("click", click);
      panel.removeEventListener("click", pick);
      removeEventListener("keydown", key);
      el.classList.remove("is-fx-open");
      panel.inert = false;
      panel.removeAttribute("aria-hidden");
      toggle.removeAttribute("aria-expanded");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-line-dur");
    };
  });
})();
