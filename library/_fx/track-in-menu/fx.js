(() => {
  // Handles only opening and closing — panel and link motion lives in fx.css. Each link gets an order (--fx-i) delayed by .05s each. Pressing a link or Esc closes it.
  kfFx.register("track-in-menu", (el) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    items.forEach((it, i) => it.style.setProperty("--fx-i", i));
    const set = (open) => {
      el.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    const onToggle = () => set(!el.classList.contains("is-open"));
    const onPanel = (e) => e.target.closest("a") && set(false);
    const onKey = (e) => e.key === "Escape" && el.classList.contains("is-open") && set(false);
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", onToggle);
    panel.addEventListener("click", onPanel);
    document.addEventListener("keydown", onKey);
    return () => {
      toggle.removeEventListener("click", onToggle);
      panel.removeEventListener("click", onPanel);
      document.removeEventListener("keydown", onKey);
      items.forEach((it) => it.style.removeProperty("--fx-i"));
      set(false);
    };
  });
})();
