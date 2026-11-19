(() => {
  // Original (Brand .js-zigzag): for each element randomly fixes up/down −100~100px · bend ±80·±60px · initial tilt ±20°, and
  // When it reaches the 90% line of the screen, play the css animation (1.5s, steps(2, end) per cell). Once only
  kfFx.register("zigzag-step-in", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const R = (n) => (Math.random() * 2 - 1) * n;
    const y = +(options.y ?? 100), z1 = +(options.z1 ?? 80), z2 = +(options.z2 ?? 60), z3 = +(options.z3 ?? 0), rot = +(options.rot ?? 20);
    const vars = { "--fx-zy": `${R(y)}px`, "--fx-z1": `${R(z1)}px`, "--fx-z2": `${R(z2)}px`, "--fx-zr": `${R(rot)}deg` };
    // The original does not set the third-bend and side-push variables, so that cell is drawn in place — filled only when an option is given, so it flies in from the side
    if (options.z3 != null) vars["--fx-z3"] = `${R(z3)}px`;
    if (options.x != null) vars["--fx-zx"] = `${+options.x}px`;
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const st = options.start === "none" ? null : ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 90%", once: true, onEnter: () => el.classList.add("is-fx-run") });
    if (!st) el.classList.add("is-fx-run");
    return () => { st?.kill(); el.classList.remove("is-fx-run"); ["--fx-zy", "--fx-z1", "--fx-z2", "--fx-z3", "--fx-zx", "--fx-zr", "--fx-dur"].forEach((k) => el.style.removeProperty(k)); };
  });
})();
