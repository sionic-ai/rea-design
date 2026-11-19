// Process page: reveal the road drawing only by (screen center − road box top) ÷ road box height. With reduced motion it is fully visible from the start.
(() => {
  const inner = document.querySelector(".dt-inner");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const update = () => {
      const r = inner.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height));
      inner.style.setProperty("--road-progress", `${p * 100}%`);
    };
    TK.onScroll(update);
    addEventListener("resize", update);
    update();
    return () => removeEventListener("resize", update);
  });
  mm.add("(prefers-reduced-motion: reduce)", () => inner.style.setProperty("--road-progress", "100%"));
  TK.parallax();
})();
