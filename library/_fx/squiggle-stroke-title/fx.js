(() => {
  // The strokes of the SVG text are drawn with a hand-drawn tremor (five turbulence displacement frames swapped every 10%), and the inside is filled as the strokes finish
  const defs = () => {
    if (document.getElementById("fx-sq-0")) return;
    const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML = [0, 1, 2, 3, 4].map((i) => `<filter id="fx-sq-${i}"><feTurbulence baseFrequency="0.02" numOctaves="3" result="n" seed="${i}"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${i ? 6 : 0}"/></filter>`).join("");
    document.body.append(svg);
  };
  kfFx.register("squiggle-stroke-title", (el, { options, reduce }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="text"]')];
    if (!parts.length) return;
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    defs();
    const each = +(options.each ?? 0.3);
    parts.forEach((p, i) => {
      const len = Math.ceil((p.getComputedTextLength?.() || 300) * 1.6);
      p.style.setProperty("--fx-len", len);
      p.style.setProperty("--fx-delay", `${(+(options.delay ?? 0) + i * each).toFixed(2)}s`);
    });
    let io;
    if (options.on === "view") {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.2 });
      io.observe(el);
    } else if (options.on !== "state") requestAnimationFrame(() => el.classList.add("is-in"));
    return () => { io?.disconnect(); el.classList.remove("is-in"); parts.forEach((p) => { p.style.removeProperty("--fx-len"); p.style.removeProperty("--fx-delay"); }); };
  });
})();
