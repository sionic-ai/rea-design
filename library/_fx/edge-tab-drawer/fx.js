(() => {
  // Opens and closes by tap — closes by pressing again, back veil, close child, a link inside the panel, or Esc. Fires fx:open and fx:close on open and close
  kfFx.register("edge-tab-drawer", (el) => {
    const tab = el.querySelector(':scope > [data-fx-part="tab"]');
    const panel = el.querySelector(':scope > [data-fx-part="panel"]');
    if (!tab || !panel) return;
    const veil = document.createElement("div");
    veil.className = "fx-edge-veil";
    el.before(veil);
    tab.setAttribute("aria-expanded", "false");
    const set = (open) => {
      el.classList.toggle("is-fx-open", open);
      veil.classList.toggle("is-fx-open", open);
      tab.setAttribute("aria-expanded", String(open));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close"));
    };
    const onTab = () => set(!el.classList.contains("is-fx-open"));
    const onClose = (e) => { if (e.target.closest('[data-fx-part="close"], a')) set(false); };
    const onVeil = () => set(false);
    const onKey = (e) => { if (e.key === "Escape" && el.classList.contains("is-fx-open")) set(false); };
    tab.addEventListener("click", onTab);
    panel.addEventListener("click", onClose);
    veil.addEventListener("click", onVeil);
    addEventListener("keydown", onKey);
    return () => { tab.removeEventListener("click", onTab); panel.removeEventListener("click", onClose); veil.removeEventListener("click", onVeil); removeEventListener("keydown", onKey); veil.remove(); el.classList.remove("is-fx-open"); };
  });
})();
