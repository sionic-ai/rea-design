// Petal-mask photo reveal — fires once when 75% of the panel touches the bottom of the screen, the mask grows from 0 to panel size while panel and photo rotate 90° in opposite directions and settle (2s expo-out) — Brand site
(() => {
  kfFx.register("petal-spin-reveal", (el, { options, reduce, scroller }) => {
    const on = () => el.classList.add("fx-in");
    if (reduce) { on(); return () => el.classList.remove("fx-in"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "75% bottom", once: true, onEnter: on });
    return () => { st.kill(); el.classList.remove("fx-in"); };
  });
})();
