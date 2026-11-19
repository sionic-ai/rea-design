// Duplicates one icon and stacks two copies in the same place, each shown half-cut in a crack shape — callers only need to supply a single icon
(() => {
  kfFx.register("crack-split", (el) => {
    const icon = el.firstElementChild;
    if (!icon) return;
    const ac = new AbortController();
    const half = (side, node) => { const i = document.createElement("i"); i.className = `fx-half fx-half-${side}`; i.setAttribute("aria-hidden", "true"); i.append(node); return i; };
    const l = half("l", icon.cloneNode(true)), r = half("r", icon);
    el.append(l, r);
    if (!el.hasAttribute("aria-expanded")) el.setAttribute("aria-expanded", "false");
    el.addEventListener("click", () => {
      const on = el.getAttribute("aria-expanded") !== "true";
      el.setAttribute("aria-expanded", String(on));
      el.dispatchEvent(new CustomEvent("fx:toggle", { bubbles: true, detail: { on } }));
    }, { signal: ac.signal });
    return () => { ac.abort(); el.prepend(icon); l.remove(); r.remove(); };
  });
})();
