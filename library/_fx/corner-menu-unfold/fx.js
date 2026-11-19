// Menu panel that unfolds from the corner — the shape is drawn by the transition in fx.css, here only open/close, row index and option variables are attached
(() => {
  kfFx.register("corner-menu-unfold", (el, { options }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const vars = { dur: "--fx-dur", each: "--fx-each", delay: "--fx-delay", item: "--fx-item" };
    Object.entries(vars).forEach(([k, v]) => options[k] != null && el.style.setProperty(v, `${+options[k]}s`));
    if (options.shift != null) el.style.setProperty("--fx-shift", options.shift);
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    items.forEach((n, i) => n.style.setProperty("--fx-i", i));
    const set = (open) => {
      el.toggleAttribute("data-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    const click = () => set(!el.hasAttribute("data-open"));
    const key = (e) => e.key === "Escape" && set(false);
    const outside = (e) => { if (el.hasAttribute("data-open") && !panel.contains(e.target) && !toggle.contains(e.target)) set(false); };
    toggle.addEventListener("click", click);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      toggle.removeEventListener("click", click);
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
      el.removeAttribute("data-open");
      items.forEach((n) => n.style.removeProperty("--fx-i"));
      Object.values(vars).concat("--fx-shift").forEach((v) => el.style.removeProperty(v));
    };
  });
})();
