(() => {
  // Insert three boiling filters (same noise, different seeds) into the document just once — however many parts there are, they reuse the same filters
  const SEEDS = 3;
  function ensureFilters(o) {
    if (document.getElementById("fx-sketch-hover-0")) return;
    const freq = +(o.roughness ?? 0.045), scale = +(o.wobble ?? 3);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = `<defs>${Array.from({ length: SEEDS }, (_, i) => `<filter id="fx-sketch-hover-${i}" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${i * 7 + 3}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/><feComponentTransfer in="d"><feFuncA type="table" tableValues="0 1 1"/></feComponentTransfer></filter>`).join("")}</defs>`;
    document.body.append(svg);
    // Filters stall a frame or two compiling the first time they apply — warm them up by applying three once each to an invisible dot
    const warm = document.createElement("span");
    warm.setAttribute("aria-hidden", "true");
    warm.style.cssText = "position:fixed;left:-4px;top:-4px;width:2px;height:2px;pointer-events:none;opacity:.01";
    document.body.append(warm);
    let i = 0;
    const step = () => { if (i < SEEDS) { warm.style.filter = `url(#fx-sketch-hover-${i++})`; requestAnimationFrame(step); } else warm.remove(); };
    requestAnimationFrame(step);
  }
  kfFx.register("sketch-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    ensureFilters(options);
    if (options.scale !== undefined) el.style.setProperty("--fx-scale", options.scale);
    if (options.tilt !== undefined) el.style.setProperty("--fx-tilt", `${+options.tilt}deg`);
    if (options.rock !== undefined) el.style.setProperty("--fx-rock", `${+options.rock}deg`);
    if (options.cycle !== undefined) el.style.setProperty("--fx-cycle", `${+options.cycle}s`);
    return () => ["--fx-scale", "--fx-tilt", "--fx-rock", "--fx-cycle"].forEach((p) => el.style.removeProperty(p));
  });
})();
