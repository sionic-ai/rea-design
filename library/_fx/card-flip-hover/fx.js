(() => {
  kfFx.register("card-flip-hover", (el, { options, hover }) => {
    if (!el.querySelector('[data-fx-part="front"]') || !el.querySelector('[data-fx-part="back"]')) return;
    if (options.open != null) el.style.setProperty("--fx-open", `${+options.open}s`);
    if (options.close != null) el.style.setProperty("--fx-close", `${+options.close}s`);
    // Use the same curve for both opening and closing (cheer card transform 1s ease) — if they differ, use ease-open · ease-close
    const curve = (v) => (/^[\d.\s,-]+$/.test(v) ? `cubic-bezier(${v})` : v);
    for (const [k, v] of [["--fx-ease-open", options["ease-open"] ?? options.ease], ["--fx-ease-close", options["ease-close"] ?? options.ease]]) if (v) el.style.setProperty(k, curve(v));
    const can = () => el.getAttribute("aria-disabled") !== "true";
    const set = (on) => el.classList.toggle("is-flipped", on && can());
    const enter = () => set(true), leave = () => set(false);
    const tap = () => set(!el.classList.contains("is-flipped"));
    const key = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } };
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    el.addEventListener("keydown", key);
    if (hover) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); }
    else el.addEventListener("click", tap);
    return () => {
      el.removeEventListener("keydown", key);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", tap);
      el.classList.remove("is-flipped");
      el.style.removeProperty("--fx-open");
      el.style.removeProperty("--fx-close");
      el.style.removeProperty("--fx-ease-open");
      el.style.removeProperty("--fx-ease-close");
    };
  });
})();
