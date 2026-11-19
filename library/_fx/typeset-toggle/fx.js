// Font panel button — pressing sets html data-<attr> Switches between two values to swap the site-wide font variable, and remembers it until the next visit.
// Even with several identical buttons (menu · footer) they share one state — on change they sync with each other through the fx:typeset event
(() => {
  kfFx.register("typeset-toggle", (el, { options }) => {
    const [a, b] = String(options.values || "serif, sans-serif").split(",").map((s) => s.trim());
    const attr = options.attr || "typesetting";
    const key = options.key || `kf-${attr}`;
    const root = document.documentElement;
    const read = () => root.dataset[attr] || (() => { try { return localStorage.getItem(key); } catch { return null; } })() || a;
    const paint = () => {
      const alt = read() === b;
      el.classList.toggle("is-alt", alt);
      el.setAttribute("aria-pressed", String(alt));
    };
    const set = (v) => {
      root.dataset[attr] = v;
      try { localStorage.setItem(key, v); } catch {}
      document.dispatchEvent(new CustomEvent("fx:typeset", { detail: { attr, value: v } }));
    };
    if (!root.dataset[attr]) root.dataset[attr] = read();
    paint();
    const click = () => set(read() === b ? a : b);
    const sync = (e) => { if (e.detail.attr === attr) paint(); };
    el.addEventListener("click", click);
    document.addEventListener("fx:typeset", sync);
    return () => {
      el.removeEventListener("click", click);
      document.removeEventListener("fx:typeset", sync);
      el.classList.remove("is-alt");
      el.removeAttribute("aria-pressed");
    };
  });
})();
