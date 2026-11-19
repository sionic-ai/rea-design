// Each card fixes one tilt when it attaches — 50/50 either -2.5~-.5° or .5~2.5° (skipping near 0). On hover, css tilts it to that angle while scaling it up.
(() => {
  kfFx.register("random-tilt-hover", (el, { options }) => {
    const min = +(options.min ?? 0.5), max = +(options.max ?? 2.5);
    const e = (max - min) * Math.random();
    const deg = Math.random() < 0.5 ? -(min + e) : min + e;
    el.style.setProperty("--fx-rotate", deg.toFixed(2) + "deg");
    return () => el.style.removeProperty("--fx-rotate");
  });
})();
