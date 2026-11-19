// Hovering the whole plate stretches the corner circle into a pill holding the title — attaching it only to the circle hides the title when passing over a card
(() => {
  kfFx.register("corner-chip-expand", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const chip = el.getAttribute("data-fx-part") === "chip" ? el : el.querySelector('[data-fx-part="chip"]');
    if (!chip) return;
    const label = chip.querySelector('[data-fx-part="label"]');
    const closed = +(options.size ?? 36);
    const dur = +(options.dur ?? 0.5);
    const shift = +(options.shift ?? -12);
    const lag = +(options.delay ?? 0.3);
    const ease = kfFx.ease(options.ease || "0.85,0,0.3,1", "power4.inOut");
    gsap.set(chip, { width: closed });
    if (label) gsap.set(label, { opacity: 0, x: shift });

    const open = () => {
      gsap.to(chip, { width: "auto", duration: reduce ? 0 : dur, ease, overwrite: "auto" });
      if (label) gsap.to(label, { opacity: 1, x: 0, duration: reduce ? 0 : 0.3, delay: reduce ? 0 : lag, ease: "power1.out", overwrite: "auto" });
    };
    const close = () => {
      gsap.to(chip, { width: closed, duration: reduce ? 0 : dur, ease, overwrite: "auto" });
      if (label) gsap.to(label, { opacity: 0, x: shift, duration: reduce ? 0 : 0.3, ease: "power1.out", overwrite: "auto" });
    };
    const ac = new AbortController();
    el.addEventListener("pointerenter", open, { signal: ac.signal });
    el.addEventListener("pointerleave", close, { signal: ac.signal });
    chip.addEventListener("focus", open, { signal: ac.signal });
    chip.addEventListener("blur", close, { signal: ac.signal });
    return () => {
      ac.abort();
      gsap.killTweensOf(label ? [chip, label] : chip);
      gsap.set(chip, { clearProps: "width" });
      if (label) gsap.set(label, { clearProps: "opacity,transform" });
    };
  });
})();
