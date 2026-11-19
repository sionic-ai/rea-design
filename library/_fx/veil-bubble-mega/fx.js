(() => {
  kfFx.register("veil-bubble-mega", (el, { options, hover }) => {
    const trigger = el.querySelector(':scope > [data-fx-part="trigger"]');
    const panel = el.querySelector(':scope > [data-fx-part="panel"]');
    if (!trigger || !panel) return;
    const wait = +(options.delay ?? 0) * 1000;
    let shut = 0;
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    const set = (open) => {
      clearTimeout(shut);
      el.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };
    const enter = (e) => e.pointerType === "mouse" && set(true);
    const leave = (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(shut);
      shut = setTimeout(() => set(false), wait);
    };
    const focusIn = () => set(true);
    const focusOut = (e) => el.contains(e.relatedTarget) || set(false);
    // Devices that can’t hover: the first tap opens the panel
    const tap = (e) => { if (!hover && !el.classList.contains("is-open")) { e.preventDefault(); set(true); } };
    const key = (e) => { if (e.key === "Escape") { set(false); trigger.focus(); } };
    const away = (e) => { if (!el.contains(e.target) && el.classList.contains("is-open")) set(false); };
    for (const t of [trigger, panel]) {
      t.addEventListener("pointerenter", enter);
      t.addEventListener("pointerleave", leave);
    }
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    el.addEventListener("keydown", key);
    trigger.addEventListener("click", tap);
    document.addEventListener("pointerdown", away);
    return () => {
      clearTimeout(shut);
      for (const t of [trigger, panel]) {
        t.removeEventListener("pointerenter", enter);
        t.removeEventListener("pointerleave", leave);
      }
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
      el.removeEventListener("keydown", key);
      trigger.removeEventListener("click", tap);
      document.removeEventListener("pointerdown", away);
      el.classList.remove("is-open");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
    };
  });
})();
