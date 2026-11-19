// Hovering over a photo attaches a round magnifier at the cursor that shows what is beneath at 2.2x (accent dot in the center).
(() => {
  kfFx.register("hover-zoom-lens", (el, { options, hover }) => {
    if (!hover) return;
    const src = el.querySelector('[data-fx-part="image"]') || el.firstElementChild;
    if (!src) return;
    const r = +(options.r ?? 84) || 84, zoom = +(options.zoom ?? 2.2) || 2.2;
    const glass = document.createElement("div");
    glass.className = "fx-zoom-glass";
    glass.setAttribute("aria-hidden", "true");
    glass.style.width = glass.style.height = `${2 * r}px`;
    const inner = document.createElement("div");
    inner.className = "fx-zoom-inner";
    const copy = src.cloneNode(true);
    copy.removeAttribute("data-fx-part");
    inner.appendChild(copy);
    const dot = document.createElement("span");
    dot.className = "fx-zoom-dot";
    glass.append(inner, dot);
    el.appendChild(glass);
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const b = el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      glass.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
      inner.style.width = `${b.width}px`; inner.style.height = `${b.height}px`;
      inner.style.transform = `translate3d(${r - x * zoom}px, ${r - y * zoom}px, 0) scale(${zoom})`;
      el.classList.add("is-zooming");
    };
    const leave = () => el.classList.remove("is-zooming");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); glass.remove(); el.classList.remove("is-zooming"); };
  });
})();
