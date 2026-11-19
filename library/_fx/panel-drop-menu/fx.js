// Opens and closes with a button — other panels in the same group (same data-group or sibling list under the same parent) close, and it closes via the backdrop, links inside the panel, or Esc
(() => {
  kfFx.register("panel-drop-menu", (el) => {
    const trigger = el.querySelector('[data-fx-part="trigger"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!trigger || !panel) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const set = (open) => {
      el.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      el.dispatchEvent(new CustomEvent("fx:menu", { bubbles: true, detail: { open } }));
    };
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !el.classList.contains("is-open");
      if (open) {
        const scope = el.parentElement?.closest("ul, ol, nav, header") || document;
        scope.querySelectorAll('[data-fx~="panel-drop-menu"].is-open').forEach((o) => o !== el && o.querySelector('[data-fx-part="trigger"]')?.click());
      }
      set(open);
    }, on);
    panel.addEventListener("click", (e) => {
      if (e.target.closest('[data-fx-part="veil"], a[href]')) set(false);
    }, on);
    document.addEventListener("keydown", (e) => e.key === "Escape" && el.classList.contains("is-open") && set(false), on);
    return () => { ac.abort(); el.classList.remove("is-open"); trigger.removeAttribute("aria-expanded"); };
  });
})();
