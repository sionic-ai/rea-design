// A cutout figure rises from the bottom of the cell, and a little later a speech bubble pops out from 0 — once when it enters the area excluding the bottom 20% of the screen, or immediately on open.
// Motion is handled by keyframes in fx.css, and here only the trigger timing is set (is-in)
(() => {
  kfFx.register("mascot-balloon-pop", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    if (options.on === "load") {
      const id = requestAnimationFrame(() => el.classList.add("is-in"));
      return () => { cancelAnimationFrame(id); el.classList.remove("is-in"); };
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { rootMargin: `0px 0px ${options.margin || "-20%"} 0px` });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-in"); };
  });
})();
