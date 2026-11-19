// Interaction shared by all pages: expanded menu curtain (burger), right drawers (cart, search, login, contact, newsletter signup), closing with Esc or the backdrop.
// The original leaves motion mostly to CSS transitions — here only a state class is put on html, and length and delay are held by shared.css.
// Header hiding and the photo strip use motion parts (hide-on-scroll·attract-carousel).
(() => {
  const root = document.documentElement;
  const ready = () => root.classList.remove("r-wait");
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready);
  setTimeout(ready, 1500);
  const burger = document.querySelector("[data-menu-open]");
  let openPanel = null;

  const setMenu = (on) => {
    root.classList.toggle("is-menu", on);
    document.querySelector(".r-menu").setAttribute("aria-hidden", String(!on));
    if (burger) burger.setAttribute("aria-expanded", String(on));
  };
  const closePanel = () => {
    if (!openPanel) return;
    openPanel.classList.remove("is-open");
    openPanel = null;
    root.classList.remove("is-panel");
  };
  const showPanel = (name) => {
    const p = document.querySelector(`[data-panel-box="${name}"]`);
    if (!p) return;
    setMenu(false);
    if (openPanel && openPanel !== p) openPanel.classList.remove("is-open");
    openPanel = p;
    p.classList.add("is-open");
    root.classList.add("is-panel");
    const f = p.querySelector("input");
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 500);
  };

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-panel], [data-panel-close], [data-menu-open], [data-menu-close]");
    if (!t) return;
    if (t.matches("[data-panel]")) { e.preventDefault(); showPanel(t.dataset.panel); }
    else if (t.matches("[data-panel-close]")) closePanel();
    else if (t.matches("[data-menu-open]")) setMenu(!root.classList.contains("is-menu"));
    else setMenu(false);
  });
  addEventListener("keyup", (e) => {
    if (e.key !== "Escape") return;
    closePanel();
    setMenu(false);
  });

  // Video cell: clicking removes the dark curtain (35%) and play button over .3s, and clicking again brings them back
  document.querySelectorAll("[data-video]").forEach((v) => v.addEventListener("click", () => v.classList.toggle("is-playing")));
})();
