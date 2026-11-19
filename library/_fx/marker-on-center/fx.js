(() => {
  // Fires once when a paragraph head reaches the screen center (default) — text floats up via CSS and highlighter words are painted from the left a little later
  kfFx.register("marker-on-center", (el, { options, reduce }) => {
    if (reduce || !window.ScrollTrigger) {
      el.classList.add("is-fx-on");
      return () => el.classList.remove("is-fx-on");
    }
    const st = ScrollTrigger.create({ trigger: el, start: options.start || "top center", once: true, onEnter: () => el.classList.add("is-fx-on") });
    return () => { st.kill(); el.classList.remove("is-fx-on"); };
  });
})();
