// Each time the interaction enters, the mark is removed and re-added one frame (1/60s) later, restarting the one-shot animation in which a band of light passes (original js-hover)
(() => {
  kfFx.register("shine-pass-hover", (el, { reduce, hover }) => {
    if (reduce || !hover) return;
    let raf = 0;
    const on = () => {
      el.classList.remove("is-shine");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.classList.add("is-shine"));
    };
    el.addEventListener("pointerenter", on);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointerenter", on); el.classList.remove("is-shine"); };
  });
})();
