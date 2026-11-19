(() => {
  // The starting color is pushed by the whole page together — in the original, every time an interaction enters any button it advances one step, so even the same button starts from a different color on each hover
  let start = 0;
  kfFx.register("color-step-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const dur = +(options.dur ?? 2);
    if (dur > 0) el.style.setProperty("--fx-dur", `${dur}s`);
    const on = () => {
      for (let i = 0; i < 5; i++) el.style.setProperty(`--fx-s${i}`, `var(--fx-c${(start + i) % 5})`);
      start = (start + 1) % 5;
    };
    el.addEventListener("pointerenter", on);
    return () => {
      el.removeEventListener("pointerenter", on);
      ["--fx-dur", "--fx-s0", "--fx-s1", "--fx-s2", "--fx-s3", "--fx-s4"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
