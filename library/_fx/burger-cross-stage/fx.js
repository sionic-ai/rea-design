(() => {
  // Each press toggles open (X) and closed (burger) and fires fx:open · fx:close — the drawer and menu panel are opened by the consumer on that event.
  // To close from outside (link inside the panel·Esc), send fx:close to the element
  kfFx.register("burger-cross-stage", (el, { options }) => {
    if (!el.querySelector('[data-fx-part="line"]')) return;
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    let open = false;
    const set = (v) => {
      if (v === open) return;
      open = v;
      el.classList.toggle("is-open", v);
      el.classList.toggle("is-closing", !v);
      el.setAttribute("aria-expanded", String(v));
      el.dispatchEvent(new CustomEvent(v ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const click = () => set(!open);
    const close = (e) => { if (e.target === el && open) set(false); };
    const openIt = (e) => { if (e.target === el && !open) set(true); };
    el.setAttribute("aria-expanded", "false");
    el.addEventListener("click", click);
    el.addEventListener("fx:close", close);
    el.addEventListener("fx:open", openIt);
    return () => {
      el.removeEventListener("click", click);
      el.removeEventListener("fx:close", close);
      el.removeEventListener("fx:open", openIt);
      el.classList.remove("is-open", "is-closing");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
