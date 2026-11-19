// Right drawer + sub level — original (mock-jpn common.js): opening adds open to the panel, veil and button and locks document scroll. The sub-level button gets is-submenu-open,
// On the back button it detaches, on close, after 450ms it folds the sub-levels and scrolls the panel back to the top. Clicking the curtain or pressing Esc also closes.
(() => {
  kfFx.register("drilldown-drawer", (el, { options }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    const bg = el.querySelector('[data-fx-part="bg"]');
    if (!toggle || !panel) return;
    const wait = +(options.reset ?? 450);
    let open = false, timer = 0;
    const set = (v) => {
      open = v;
      el.classList.toggle("is-open", v);
      toggle.setAttribute("aria-expanded", String(v));
      document.documentElement.style.overflow = v ? "hidden" : "";
      clearTimeout(timer);
      if (!v) timer = setTimeout(() => { el.classList.remove("is-sub"); panel.scrollTop = 0; }, wait);
    };
    const onToggle = (e) => { e.preventDefault(); set(!open); };
    const onBg = () => set(false);
    const onClick = (e) => {
      if (e.target.closest('[data-fx-part="more"]')) { el.classList.add("is-sub"); panel.scrollTop = 0; }
      else if (e.target.closest('[data-fx-part="back"]')) el.classList.remove("is-sub");
    };
    const onKey = (e) => { if (e.key === "Escape" && open) set(false); };
    toggle.addEventListener("click", onToggle);
    bg?.addEventListener("click", onBg);
    panel.addEventListener("click", onClick);
    addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      toggle.removeEventListener("click", onToggle);
      bg?.removeEventListener("click", onBg);
      panel.removeEventListener("click", onClick);
      removeEventListener("keydown", onKey);
      if (open) document.documentElement.style.overflow = "";
      el.classList.remove("is-open", "is-sub");
    };
  });
})();
