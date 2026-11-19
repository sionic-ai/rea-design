(() => {
  // Handles only open and close — the motion comes from the transition in fx.css, duration, curve and header-line height are passed as variables via options
  kfFx.register("header-unfold-drawer", (el, { options }) => {
    const drawer = el.querySelector('[data-fx-part="drawer"]');
    if (!drawer) return;
    const toggles = [...el.querySelectorAll('[data-fx-part="toggle"]')];
    const closers = [...el.querySelectorAll('[data-fx-part="close"], [data-fx-part="veil"]')];
    const vars = { dur: "--fx-dur", fade: "--fx-fade" };
    for (const [k, v] of Object.entries(vars)) if (options[k] != null) el.style.setProperty(v, `${+options[k]}s`);
    if (options.bar != null) el.style.setProperty("--fx-bar", /^[\d.]+$/.test(options.bar) ? `${options.bar}px` : options.bar);
    if (options.ease) el.style.setProperty("--fx-ease", /^[\d.\-\s]+,/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    const set = (open) => {
      el.classList.toggle("is-open", open);
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const open = () => set(true), close = () => el.classList.contains("is-open") && set(false);
    const onKey = (e) => { if (e.key === "Escape") close(); };
    toggles.forEach((t) => t.addEventListener("click", open));
    closers.forEach((c) => c.addEventListener("click", close));
    addEventListener("keyup", onKey);
    return () => {
      toggles.forEach((t) => t.removeEventListener("click", open));
      closers.forEach((c) => c.removeEventListener("click", close));
      removeEventListener("keyup", onKey);
      el.classList.remove("is-open");
      ["--fx-dur", "--fx-fade", "--fx-bar", "--fx-ease"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
