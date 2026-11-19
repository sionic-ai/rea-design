(() => {
  // When it enters 15% above the bottom of the screen (after delay seconds) it gets is-in — the drawn-line shape is handled by the transition in fx.css.
  kfFx.register("arrow-link-draw", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    const delay = +(options.delay ?? 0);
    let t = 0;
    const st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 85%", once: true, onEnter: () => { t = setTimeout(() => el.classList.add("is-in"), delay * 1000); } });
    return () => { st.kill(); clearTimeout(t); el.classList.remove("is-in"); };
  });
})();
