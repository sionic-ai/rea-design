// Splits a label button’s text into two layers (front and back panel) — fx.css handles the motion, here only the layers are made.
// Already [data-fx-part="a"]·[data-fx-part="b"] If this has already been hand-built, leave it untouched.
(() => {
  kfFx.register("under-slide-hover", (el) => {
    if (el.querySelector(':scope > [data-fx-part="a"]')) return;
    const label = el.innerHTML;
    if (!label.trim()) return;
    const layer = (part, hidden) => {
      const box = document.createElement("span");
      box.dataset.fxPart = part;
      if (hidden) box.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "fx-usl__text";
      text.innerHTML = label;
      box.append(text);
      return box;
    };
    el.replaceChildren(layer("a"), layer("b", true));
    return () => { el.innerHTML = label; };
  });
})();
