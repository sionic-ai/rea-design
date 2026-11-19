// When the element’s top edge reaches the screen center, it enters from off-screen left (or right) into place, and leaves again when scrolled back up — the arm handing over a letter in the closing contact
(() => {
  kfFx.register("reach-in", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    el.style.setProperty("--fx-dur", `${+(options.dur ?? 1)}s`);
    if (options.from === "right") el.classList.add("fx-reach-right");
    if (reduce) { el.classList.add("is-active"); return () => el.classList.remove("is-active", "fx-reach-right"); }
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top center", toggleClass: "is-active" });
    return () => { st.kill(); el.classList.remove("is-active", "fx-reach-right"); el.style.removeProperty("--fx-dur"); };
  });
})();
