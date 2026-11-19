(() => {
  // When the plate’s top edge reaches 70% of the screen (once), the thin grid lines inside the plate are drawn all at once — vertical lines from the top, horizontal lines from the left. The draw length is the transition in fx.css
  kfFx.register("frame-grid-lines", (el, { options, reduce, scroller }) => {
    const on = () => el.classList.add("fx-lines-on");
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (reduce || !window.gsap || !window.ScrollTrigger) { on(); return () => el.classList.remove("fx-lines-on"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, start: options.start || "top 70%", once: true, onEnter: on, ...(scroller && { scroller }) });
    return () => { st.kill(); el.classList.remove("fx-lines-on"); el.style.removeProperty("--fx-dur"); };
  });
})();
