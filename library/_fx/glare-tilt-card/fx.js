(() => {
  // Hooked up with the same vanilla-tilt as the original — the tilt curve, glare gradient and return speed live inside the library, so hand-coding changes the feel
  kfFx.register("glare-tilt-card", (el, { options, reduce, hover }) => {
    if (reduce || !hover || typeof VanillaTilt === "undefined") return;
    const glare = options.glare !== "false";
    VanillaTilt.init(el, {
      max: +(options.max ?? 25),
      speed: +(options.speed ?? 400),
      perspective: +(options.perspective ?? 1000),
      scale: +(options.scale ?? 1.05),
      reset: options.reset !== "false",
      glare,
      "max-glare": +(options["max-glare"] ?? 0.4),
      easing: options.easing || "cubic-bezier(.03,.98,.52,.99)",
    });
    return () => { el.vanillaTilt?.destroy(); el.style.removeProperty("transform"); el.style.removeProperty("will-change"); el.style.removeProperty("transition"); };
  });
})();
