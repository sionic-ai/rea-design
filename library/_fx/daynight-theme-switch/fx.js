// On first open it picks the day or night skin by the current time (default day from 4 to before 21) — once decided it is kept for the session, so it stays the same across pages.
// If the attached element is a checkbox (or contains one), clicking toggles night ↔ day, and other checkboxes with the same part are checked too. Fires fx:theme on document when it changes
(() => {
  const KEY = "kf-fx-daynight";
  const html = document.documentElement;
  const boxes = new Set();
  const apply = (t, attr) => {
    html.setAttribute(attr, t);
    boxes.forEach((b) => (b.checked = t === "dark"));
    document.dispatchEvent(new CustomEvent("fx:theme", { detail: { theme: t } }));
  };
  kfFx.register("daynight-theme-switch", (el, { options }) => {
    const attr = options.attr || "data-theme";
    const from = +(options.from ?? 4), to = +(options.to ?? 21);
    const box = el.matches("input[type=checkbox]") ? el : el.querySelector("input[type=checkbox]");
    let t = sessionStorage.getItem(KEY);
    if (!t) {
      const h = new Date().getHours();
      t = h >= from && h < to ? "light" : "dark";
      sessionStorage.setItem(KEY, t);
    }
    if (html.getAttribute(attr) !== t) apply(t, attr);
    if (!box) return;
    boxes.add(box);
    box.checked = t === "dark";
    const flip = () => {
      const next = box.checked ? "dark" : "light";
      sessionStorage.setItem(KEY, next);
      apply(next, attr);
    };
    box.addEventListener("change", flip);
    return () => { box.removeEventListener("change", flip); boxes.delete(box); };
  });
})();
