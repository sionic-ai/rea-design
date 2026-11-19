(() => {
  // If the dot slot is empty, insert two circles (an expanding ring + a center dot) as SVG — the ring expands through radius and fill opacity, so the element’s size and opacity stay unchanged
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("pulse-dot-btn", (el) => {
    const dot = el.querySelector('[data-fx-part="dot"]');
    if (!dot || dot.querySelector("svg")) return;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    [["ring", 3], ["core", 2.86]].forEach(([cls, r]) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("class", cls);
      c.setAttribute("cx", "8");
      c.setAttribute("cy", "8");
      c.setAttribute("r", String(r));
      svg.append(c);
    });
    dot.append(svg);
    return () => svg.remove();
  });
})();
