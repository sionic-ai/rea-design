(() => {
  // Original (Brand underline button · horizontal-line button): on hover the underline retracts to the right and the center line is drawn from the left,
  // On release the underline is redrawn from the left and the middle line exits to the right — all .4s power2.out, and the line is a wobbly hand-drawn stroke
  const L = "inset(0% 100% 0% 0%)", FULL = "inset(0% 0% 0% 0%)", R = "inset(0% 0% 0% 100%)";
  let path = "M0 1";
  { let s = 7; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); for (let x = 4; x <= 400; x += 4) path += ` L${x} ${(1 + (r() - 0.5) * 0.9).toFixed(2)}`; }
  kfFx.register("strike-swap-hover", (el, { options, reduce, hover }) => {
    const shaky = /shaky/.test(options.look || "");
    const made = [];
    const part = (name) => {
      let p = el.querySelector(`:scope > [data-fx-part="${name}"]`);
      if (!p) { p = document.createElement("span"); p.setAttribute("data-fx-part", name); p.setAttribute("aria-hidden", "true"); el.append(p); made.push(p); }
      if (shaky && !p.querySelector("svg")) p.innerHTML = `<svg viewBox="0 0 400 2" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg>`;
      return p;
    };
    const under = options.under === "off" ? null : part("under");
    const strike = part("strike");
    if (reduce || !hover) return () => made.forEach((p) => p.remove());
    const dur = +(options.dur ?? 0.4), ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const clip = (t, a, b) => t && gsap.fromTo(t, { clipPath: a }, { clipPath: b, duration: dur, ease, overwrite: true });
    const on = (e) => { if (e.pointerType !== "mouse") return; clip(under, FULL, R); clip(strike, L, FULL); };
    const off = (e) => { if (e.pointerType !== "mouse") return; clip(under, L, FULL); clip(strike, FULL, R); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      gsap.killTweensOf([under, strike].filter(Boolean));
      made.forEach((p) => p.remove());
      [under, strike].forEach((p) => p?.isConnected && gsap.set(p, { clearProps: "clipPath" }));
    };
  });
})();
