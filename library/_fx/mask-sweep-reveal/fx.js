// Once a cell’s top edge passes 71% of screen height (1 − 1/3.5), a vertical gradient veil appears, dark at the top and fading transparent downward,
// Hangs at 5.6x the cell size, then over 2.5s moves up (toward the darker side) as the photo seeps out from the top
(() => {
  kfFx.register("mask-sweep-reveal", (el, { options, reduce, scroller }) => {
    const at = +(options.start ?? 0.714);
    if (options.dur != null) el.style.setProperty("--fx-msr-dur", options.dur + "s");
    if (reduce) { el.classList.add("fx-msr-in", "fx-msr-done"); return () => el.classList.remove("fx-msr-in", "fx-msr-done"); }
    const st = ScrollTrigger.create({ trigger: el, scroller, start: `top ${at * 100}%`, once: true, onEnter: () => el.classList.add("fx-msr-in") });
    return () => { st.kill(); el.classList.remove("fx-msr-in"); el.style.removeProperty("--fx-msr-dur"); };
  });
})();
