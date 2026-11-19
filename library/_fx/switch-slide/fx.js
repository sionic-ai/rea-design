// State lives in aria-checked alone — screen readers and CSS read the same value, and the consumer only needs to listen to the fx:switch event
(() => {
  kfFx.register("switch-slide", (el) => {
    const ac = new AbortController();
    if (!el.hasAttribute("role")) el.setAttribute("role", "switch");
    if (!el.hasAttribute("aria-checked")) el.setAttribute("aria-checked", "false");
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = el.getAttribute("aria-checked") !== "true";
      el.setAttribute("aria-checked", String(on));
      el.dispatchEvent(new CustomEvent("fx:switch", { bubbles: true, detail: { on } }));
    }, { signal: ac.signal });
    return () => ac.abort();
  });
})();
