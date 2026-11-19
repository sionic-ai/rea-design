(() => {
  // Stack the text in two lines (same text) and attach the arrow graphic behind the button — attach it to a and button elements that contain only text, and the wrapper around the button should be the button’s width.
  kfFx.register("ring-sweep-pill", (el) => {
    if (el.querySelector('[data-fx-part="inner"]')) return;
    const text = el.textContent.trim();
    if (!text) return;
    const original = el.innerHTML;
    const inner = document.createElement("span");
    inner.setAttribute("data-fx-part", "inner");
    const label = document.createElement("span");
    label.setAttribute("data-fx-part", "label");
    label.innerHTML = "<span></span><span aria-hidden=\"true\"></span>";
    label.children[0].textContent = text; label.children[1].textContent = text;
    inner.append(label);
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.setAttribute("data-fx-part", "arrow");
    arrow.setAttribute("viewBox", "0 0 67 6");
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML = '<rect class="is-line" x="0" y="2.5" width="62" height="1"/><path class="is-head" d="M58 0 67 3 58 6Z"/><circle class="is-dot" cx="44" cy="3" r="1.5"/><circle class="is-dot" cx="52" cy="3" r="1.5"/><circle class="is-dot" cx="60" cy="3" r="1.5"/>';
    el.replaceChildren(inner);
    // The arrow sits outside the button (right behind it) — straddling half off the button cell, so it doesn’t mix into the press area or text measurement
    const parent = el.parentElement;
    if (parent && getComputedStyle(parent).position === "static") parent.style.position = "relative";
    el.after(arrow);
    return () => { arrow.remove(); el.innerHTML = original; };
  });
})();
