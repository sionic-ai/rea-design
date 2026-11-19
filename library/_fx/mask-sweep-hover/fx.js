(() => {
  kfFx.register("mask-sweep-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const dur = +(options.dur ?? 1.5), from = +(options.from ?? -200), to = +(options.to ?? 200);
    // Restarts from the beginning each time a hand enters — the strip runs to the end even if released
    const sweep = gsap.fromTo(el, { "--fx-sweep": `${from}%` }, { "--fx-sweep": `${to}%`, duration: dur, ease: kfFx.ease(options.ease || "power1.out", "power1.out"), paused: true });
    const on = () => sweep.restart();
    el.addEventListener("mouseenter", on);
    return () => {
      el.removeEventListener("mouseenter", on);
      sweep.kill();
      el.style.removeProperty("--fx-sweep");
    };
  });
})();
