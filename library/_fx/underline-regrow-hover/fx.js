// The empty underline is drawn from 0 starting at the left when hovered (.4s power2.in), and retracts to the left end when released (.4s power2.out).
// Exactly the original Webflow IX3 — entering always redraws from 0 with fromTo, leaving retracts from the current width with to, so releasing mid-draw retracts from there
(() => {
  kfFx.register("underline-regrow-hover", (el, { options, reduce, hover }) => {
    const line = el.querySelector('[data-fx-part="line"]');
    if (!line || reduce || !hover) return;
    const dur = +(options.dur ?? 0.4);
    const inEase = kfFx.ease(options["in-ease"] || "power2.in", "power2.in");
    const outEase = kfFx.ease(options["out-ease"] || "power2.out", "power2.out");
    const on = () => gsap.fromTo(line, { width: "0%" }, { width: "100%", duration: dur, ease: inEase, overwrite: true });
    const off = () => gsap.to(line, { width: "0%", duration: dur, ease: outEase, overwrite: true });
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focus", on);
      el.removeEventListener("blur", off);
      gsap.killTweensOf(line);
      gsap.set(line, { clearProps: "width" });
    };
  });
})();
