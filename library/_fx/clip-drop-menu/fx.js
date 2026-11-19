// Pressing the button unfolds the panel from top to bottom (clip-path, curve set in css transition), and pressing again, a link inside the panel, or Esc folds it back.
// Fires fx:open and fx:close on open and close — stopping smooth scroll (lenis) is left to the consumer via these events
(() => {
  kfFx.register("clip-drop-menu", (el, { options }) => {
    const toggle = el.querySelector(':scope > [data-fx-part="toggle"]');
    const panel = el.querySelector(':scope > [data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    if (options.dur != null && options.dur !== "") el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", /,/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    if (options.shift != null && options.shift !== "") el.style.setProperty("--fx-shift", `${+options.shift}px`);
    if (options.delay != null && options.delay !== "") el.style.setProperty("--fx-delay", `${+options.delay}s`);
    if (options["close-ease"]) el.style.setProperty("--fx-close-ease", /,/.test(options["close-ease"]) ? `cubic-bezier(${options["close-ease"]})` : options["close-ease"]);
    const lock = options.lock !== "none";
    toggle.setAttribute("aria-expanded", "false");
    const set = (open) => {
      if (el.classList.contains("is-open") === open) return;
      el.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (lock) document.documentElement.style.overflow = open ? "hidden" : "";
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close", { bubbles: true }));
    };
    toggle.addEventListener("click", () => set(!el.classList.contains("is-open")), on);
    panel.addEventListener("click", (e) => e.target.closest("a") && set(false), on);
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false), on);
    // Even when scrolling inside the panel, the outer smooth scroll must not hijack the wheel
    panel.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true, signal: ac.signal });
    return () => {
      ac.abort();
      set(false);
      toggle.removeAttribute("aria-expanded");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-ease");
      el.style.removeProperty("--fx-shift");
      el.style.removeProperty("--fx-delay");
      el.style.removeProperty("--fx-close-ease");
    };
  });
})();
