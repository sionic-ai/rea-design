(() => {
  let seq = 0;
  // Displacement map that pushes only vertically — the G channel starts at 128 at the top (.04) and shrinks downward by (1-t^curve), so lower areas pull in what is above. R and B stay 128 (no shift)
  const mapUri = (curve) => {
    let stops = "<stop stop-color='#808080'/>"; // Not a skin: neutral value (128) of the displacement map
    for (let i = 0; i < 13; i++) {
      const t = i / 12, v = Math.round(128 * (1 - Math.pow(t, curve)));
      stops += `<stop offset='${0.04 + 0.96 * t}' stop-color='#80${(v < 16 ? "0" : "") + v.toString(16)}80'/>`; // Not a skin: G channel carrying displacement strength
    }
    return "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' preserveAspectRatio='none'><linearGradient id='g' x2='0' y2='1'>${stops}</linearGradient><rect width='10' height='10' fill='url(#g)'/></svg>`);
  };
  const chromium = () => !!navigator.userAgentData?.brands?.some((b) => b.brand === "Chromium");

  kfFx.register("prism-floor-glass", (el, { options, reduce }) => {
    const h = +(options.height ?? 167);
    const blur = +(options.blur ?? 8);
    el.style.setProperty("--fx-height", `${h}px`);
    el.style.setProperty("--fx-blur", `${blur}px`);
    if (reduce || !chromium()) return () => { el.style.removeProperty("--fx-height"); el.style.removeProperty("--fx-blur"); };

    const scales = String(options.scales || "141,149,157").split(",").map((s) => +s.trim()).filter((n) => !Number.isNaN(n));
    while (scales.length < 3) scales.push(scales[scales.length - 1] ?? 149);
    const curve = +(options.curve ?? 2.3) || 2.3;
    const id = `fx-prism-floor-${++seq}`;
    const z = " 0 0 0 0 0";
    const pick = ["1 0 0 0 0" + z + z, z + " 0 1 0 0 0" + z, z + z + " 0 0 1 0 0"];
    const passes = scales.slice(0, 3).map((s, i) => `<feDisplacementMap in="SourceGraphic" in2="m" scale="${s}" xChannelSelector="R" yChannelSelector="G"/><feColorMatrix values="${pick[i]} 0 0 0 1 0" result="c${i}"/>`).join("");
    const holder = document.createElement("div");
    holder.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${mapUri(curve)}" preserveAspectRatio="none" result="m"/>${passes}<feBlend in="c0" in2="c1" mode="screen"/><feBlend in2="c2" mode="screen"/></filter></svg>`;
    const svg = holder.firstElementChild;
    document.body.appendChild(svg);
    const img = svg.querySelector("feImage");
    const fit = () => { img.setAttribute("width", el.offsetWidth || innerWidth); img.setAttribute("height", el.offsetHeight || h); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    el.classList.add("is-refract");
    el.style.backdropFilter = `url(#${id})`;
    el.style.webkitBackdropFilter = `url(#${id})`;
    return () => {
      ro.disconnect();
      svg.remove();
      el.classList.remove("is-refract");
      el.style.backdropFilter = "";
      el.style.webkitBackdropFilter = "";
      el.style.removeProperty("--fx-height");
      el.style.removeProperty("--fx-blur");
    };
  });
})();
