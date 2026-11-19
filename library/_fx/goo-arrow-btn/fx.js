(() => {
  // Put the pill and the neighboring circle into one gooey filter layer (blur 5 · alpha ×19 −9) so where the two touch they look joined like a droplet.
  // Motion is css (on hover the circle · arrow shift 12px and rotate 45°) — here the filter definition is inserted into the document once.
  const ID = "fx-goo-arrow-filter";
  const ensure = () => {
    if (document.getElementById(ID)) return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.innerHTML = `<defs><filter id="${ID}" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"/><feComposite in="SourceGraphic" in2="goo" operator="atop"/><feBlend in="SourceGraphic" in2="goo"/></filter></defs>`;
    document.body.append(svg);
  };
  kfFx.register("goo-arrow-btn", (el) => {
    if (!el.querySelector('[data-fx-part="disc"]')) return;
    ensure();
    el.classList.add("fx-goo-ready");
    return () => el.classList.remove("fx-goo-ready");
  });
})();
