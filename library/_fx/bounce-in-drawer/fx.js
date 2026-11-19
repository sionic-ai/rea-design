// The menu panel covering the screen bounces in from off-screen right, overshoots 25px, then settles back 10px·5px (1s),
// On close it pulls back 20px, then flies off to the right and turns transparent. The panel stays visible only .5s after closing, then hides — original animate.css bounceInRight/OutRight.
// The motion is keyframes in fx.css, and here we only handle the open flag, length variables, scroll lock and focus
(() => {
  kfFx.register("bounce-in-drawer", (el, { options, reduce }) => {
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!panel) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const toggles = [...el.querySelectorAll('[data-fx-part="toggle"]')];
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const hide = reduce ? 0 : +(options.hide ?? 0.5);
    const lock = options.lock !== "0";
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-hide", `${hide}s`);
    if (options.from != null) el.style.setProperty("--fx-from", `${+options.from}px`);
    if (options.to != null) el.style.setProperty("--fx-to", `${+options.to}px`);
    let back = null;
    const root = document.documentElement;
    const set = (open) => {
      if (open === el.classList.contains("is-open")) return;
      // Don’t apply the closing motion before the first open — otherwise the board flies off once as soon as the document opens
      el.classList.add("is-ready");
      el.classList.toggle("is-open", open);
      if (lock) root.classList.toggle("fx-drawer-lock", open);
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close"));
      if (open) {
        back = document.activeElement;
        (panel.querySelector('[data-fx-part="close"]') || panel).focus({ preventScroll: true });
      } else if (back && back.isConnected) back.focus({ preventScroll: true });
    };
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
    toggles.forEach((t) => { t.setAttribute("aria-expanded", "false"); t.addEventListener("click", () => set(!el.classList.contains("is-open")), on); });
    panel.querySelectorAll('[data-fx-part="close"]').forEach((c) => c.addEventListener("click", () => set(false), on));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); }, on);
    return () => {
      ac.abort();
      el.classList.remove("is-open", "is-ready");
      root.classList.remove("fx-drawer-lock");
      ["dur", "hide", "from", "to"].forEach((k) => el.style.removeProperty(`--fx-${k}`));
    };
  });
})();
