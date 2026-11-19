(() => {
  const BLINK = [
    { opacity: 1, filter: "blur(0px)", offset: 0, easing: "cubic-bezier(0.55, 0.085, 0.68, 0.53)" },
    { opacity: 0.6, filter: "blur(4px)", offset: 0.5625, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    { opacity: 1, filter: "blur(0px)", offset: 1 },
  ];
  kfFx.register("blink-nudge-hover", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const dur = +(options.dur ?? 0.32) * 1000, nudgeDur = +(options["nudge-dur"] ?? 0.7) * 1000;
    const dist = +(options.dist ?? 5), back = +(options.back ?? 3);
    const NUDGE = [
      { translate: "0px 0px", offset: 0, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      { translate: `${dist}px 0px`, offset: 0.114, easing: "cubic-bezier(0.37, 0, 0.63, 1)" },
      { translate: `${back}px 0px`, offset: 0.229, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      { translate: "0px 0px", offset: 1 },
    ];
    let nudging = null;
    const go = () => {
      const texts = el.querySelectorAll('[data-fx-part="text"]');
      const icon = el.querySelector('[data-fx-part="icon"]');
      (texts.length ? [...texts] : icon ? [] : [el]).forEach((t) => t.animate(BLINK, { duration: dur }));
      if (icon && (!nudging || nudging.playState !== "running")) nudging = icon.animate(NUDGE, { duration: nudgeDur });
    };
    if (hover) el.addEventListener("pointerenter", go);
    el.addEventListener("focusin", go);
    return () => { el.removeEventListener("pointerenter", go); el.removeEventListener("focusin", go); nudging?.cancel(); };
  });
})();
