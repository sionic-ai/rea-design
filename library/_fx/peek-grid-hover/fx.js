// When interaction lands on one grid cell, only cells with the same key (data-key) keep their photos and the rest turn their photos off — where cells are emptied, the background behind the grid shows through.
// Meanwhile each cell lights its top and left lines, and the text cell (note) flips to an opposing color plate. After the hand leaves it releases 120ms later (so it doesn’t flicker when crossing between cells).
(() => {
  kfFx.register("peek-grid-hover", (el, { options, hover }) => {
    if (!hover) return;
    const linger = +(options.linger ?? 120);
    let timer = 0, key = null;
    const keyed = () => el.querySelectorAll("[data-key]");
    const set = (k) => {
      clearTimeout(timer);
      if (k === key) return;
      key = k;
      el.classList.toggle("is-peek", k != null);
      keyed().forEach((c) => c.classList.toggle("is-peek-on", k != null && c.dataset.key === k));
      el.dispatchEvent(new CustomEvent("fx:peek", { bubbles: true, detail: { key: k } }));
    };
    const over = (e) => { const c = e.target.closest("[data-key]"); if (c && el.contains(c)) set(c.dataset.key); };
    const out = (e) => {
      const c = e.target.closest("[data-key]");
      if (!c || c.contains(e.relatedTarget)) return;
      clearTimeout(timer);
      timer = setTimeout(() => set(null), linger);
    };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerout", out);
    el.addEventListener("focusin", over);
    el.addEventListener("focusout", out);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointerout", out);
      el.removeEventListener("focusin", over);
      el.removeEventListener("focusout", out);
      el.classList.remove("is-peek");
      keyed().forEach((c) => c.classList.remove("is-peek-on"));
    };
  });
})();
