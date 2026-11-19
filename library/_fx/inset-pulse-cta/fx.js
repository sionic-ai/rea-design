(() => {
  // Lays three thin borders inside the big CTA panel, each lighting up half a beat later from the panel edge, then shrinking inward and vanishing (css keyframes).
  // On hover, raises the playback speed of the three borders to 2x over .45s (cubic ease-out), and returns to normal speed on release
  kfFx.register("inset-pulse-cta", (el, { options, reduce, hover }) => {
    const n = Math.max(1, Math.round(+(options.rings || 3)));
    const dur = +(options.dur || 3);
    const fast = +(options.fast ?? 2);
    const ramp = +(options.ramp ?? 0.45);
    if (options.in != null) el.style.setProperty("--fx-in", `${+options.in}px`);
    el.style.setProperty("--fx-dur", `${dur}s`);
    const made = [];
    let rings = [...el.querySelectorAll(':scope > [data-fx-part="ring"]')];
    if (!rings.length) {
      for (let i = 0; i < n; i++) {
        const s = document.createElement("span");
        s.setAttribute("data-fx-part", "ring");
        s.setAttribute("aria-hidden", "true");
        el.prepend(s);
        made.push(s);
      }
      rings = made.slice().reverse();
    }
    rings.forEach((r, i) => r.style.setProperty("--fx-i", i));
    if (reduce || !hover) return () => { made.forEach((s) => s.remove()); rings.forEach((r) => r.style.removeProperty("--fx-i")); el.style.removeProperty("--fx-in"); el.style.removeProperty("--fx-dur"); };

    let rate = 1, raf = 0;
    const setRate = (v) => rings.forEach((r) => r.getAnimations().forEach((a) => a.animationName === "fx-inset-pulse" && a.updatePlaybackRate(v)));
    const go = (to) => {
      cancelAnimationFrame(raf);
      const from = rate, t0 = performance.now();
      const step = (now) => {
        const p = ramp > 0 ? Math.min(1, (now - t0) / (ramp * 1000)) : 1;
        rate = from + (to - from) * (1 - (1 - p) ** 3);
        setRate(rate);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const on = () => go(fast), off = () => go(1);
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      setRate(1);
      made.forEach((s) => s.remove());
      rings.forEach((r) => r.style.removeProperty("--fx-i"));
      el.style.removeProperty("--fx-in");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
