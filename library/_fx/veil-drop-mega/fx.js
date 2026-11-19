// The original (Brand header row) changes transform · opacity · height inline per plate and leaves it to transition-all .7s. Here it is reduced to a single is-fx-open.
// Clicking anywhere on the panel (backdrop or cards inside) closes it — the original also attached close to the whole outer frame of the panel.
(() => {
  kfFx.register("veil-drop-mega", (el, { options }) => {
    const ac = new AbortController();
    const on = { signal: ac.signal };
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.drop != null) el.style.setProperty("--fx-drop", `${+options.drop}px`);
    if (options.blur != null) el.style.setProperty("--fx-blur", `${+options.blur}px`);
    let open = "";
    const triggers = () => [...el.querySelectorAll('[data-fx-part="trigger"]')];
    const panels = () => [...el.querySelectorAll('[data-fx-part="panel"]')];
    const set = (key) => {
      open = key;
      for (const t of triggers()) t.setAttribute("aria-expanded", String(!!key && t.dataset.key === key));
      for (const p of panels()) {
        const shown = !!key && p.dataset.key === key;
        p.classList.toggle("is-fx-open", shown);
        p.toggleAttribute("inert", !shown);
      }
      el.classList.toggle("is-fx-mega-open", !!key);
    };
    set("");
    el.addEventListener("click", (e) => {
      const t = e.target.closest('[data-fx-part="trigger"]');
      if (t && el.contains(t)) {
        e.preventDefault();
        set(open === t.dataset.key ? "" : t.dataset.key || "");
        return;
      }
      if (open && e.target.closest('[data-fx-part="panel"]')) set("");
    }, on);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(""); }, on);
    return () => {
      ac.abort();
      for (const t of triggers()) t.removeAttribute("aria-expanded");
      for (const p of panels()) { p.classList.remove("is-fx-open"); p.removeAttribute("inert"); }
      el.classList.remove("is-fx-mega-open");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-drop");
      el.style.removeProperty("--fx-blur");
    };
  });
})();
