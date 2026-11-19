// Arrow cell picture in two sets — the first exits right and the second enters from the left (the picture is cloned from the consumer’s)
(() => {
  kfFx.register("seam-split-btn", (el) => {
    const icon = el.querySelector('[data-fx-part="icon"]');
    if (!icon || icon.querySelector(".fx-seam-swap")) return;
    const was = icon.innerHTML;
    if (!was.trim()) return;
    const swap = document.createElement("span");
    swap.className = "fx-seam-swap";
    swap.setAttribute("aria-hidden", "true");
    const a = document.createElement("span"), b = document.createElement("span");
    a.innerHTML = was; b.innerHTML = was;
    swap.append(a, b);
    icon.replaceChildren(swap);
    return () => { icon.innerHTML = was; };
  });
})();
