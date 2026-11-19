// Like the original (Webflow ix2 ”Regular Link – Hover”), the curtain is a real element switched on and off — visible right on entry, from −100% to 100%,
// On leaving, it returns to −100% from its current position and then hides. Runs with Web Animations so it starts on the very frame the event fires,
// The expo.inOut curve (inOutExpo) is sampled densely with linear() and output as is
(() => {
  const expo = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? 2 ** (20 * p - 10) / 2 : 1 - 2 ** (-20 * p + 10) / 2);
  const curve = (fn) => `linear(${Array.from({ length: 61 }, (_, i) => +fn(i / 60).toFixed(4)).join(", ")})`;
  const EXPO = curve(expo);
  kfFx.register("gap-pass-underline", (el, { options, reduce }) => {
    let line = el.querySelector(':scope > [data-fx-part="line"]'), made = false;
    if (!line) { line = document.createElement("span"); line.setAttribute("data-fx-part", "line"); line.setAttribute("aria-hidden", "true"); el.append(line); made = true; }
    let gap = line.querySelector('[data-fx-part="gap"]');
    if (!gap) { gap = document.createElement("span"); gap.setAttribute("data-fx-part", "gap"); line.append(gap); }
    // With reduced motion or no Web Animations, leave only the line
    if (reduce || !gap.animate) return () => { if (made) line.remove(); };
    const dur = +(options.dur ?? 1.4) * 1000;
    const easing = options.ease ? (String(options.ease).includes(",") ? `cubic-bezier(${options.ease})` : options.ease) : EXPO;
    let anim = null;
    const run = (from, to, done) => {
      anim?.cancel();
      anim = gap.animate([{ transform: from }, { transform: to }], { duration: dur, easing, fill: "forwards" });
      if (done) anim.onfinish = done;
    };
    const enter = () => {
      gap.style.display = "block";
      run("translateX(-100%)", "translateX(100%)");
    };
    const leave = () => {
      const now = getComputedStyle(gap).transform;
      run(now === "none" ? "translateX(100%)" : now, "translateX(-100%)", () => { gap.style.display = ""; });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", enter);
    el.addEventListener("blur", leave);
    return () => {
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", enter); el.removeEventListener("blur", leave);
      anim?.cancel();
      if (made) line.remove(); else gap.style.display = "";
    };
  });
})();
