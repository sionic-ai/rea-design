(() => {
  // The original checks on every scroll whether a threshold was crossed and adds or removes a class, while widening is left to a CSS transition — change --fx-w and --fx-band in the same way
  kfFx.register("step-widen-frame", (el, { options, reduce, scroller }) => {
    const list = (v, d) => String(v ?? d).split(",").map((x) => +x);
    const steps = list(options.steps, "10,100,150");
    const widths = list(options.widths, "89,93,97,100");
    const bands = list(options.bands, "308,200,100,0");
    const shade = +(options.shade ?? 600);
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    let last = -1;
    const update = () => {
      const s = top();
      const k = reduce ? steps.length : steps.filter((t) => s > t).length;
      if (k !== last) {
        last = k;
        el.style.setProperty("--fx-w", `${widths[Math.min(k, widths.length - 1)]}%`);
        el.style.setProperty("--fx-band", `${bands[Math.min(k, bands.length - 1)]}px`);
      }
      el.classList.toggle("fx-swf-shade", shade > 0 && s > shade);
    };
    src.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      src.removeEventListener("scroll", update);
      el.classList.remove("fx-swf-shade");
      el.style.removeProperty("--fx-w");
      el.style.removeProperty("--fx-band");
    };
  });
})();
