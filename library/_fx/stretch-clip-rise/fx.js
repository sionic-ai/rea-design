// Stretch-rise title: inside a frame closed at the bottom, the text rises from below stretched 1.5× vertically and then settles flat — once when it reaches 85% of the screen.
// The motion itself is done by the transition in fx.css, here is-in is added on contact and the length and curve options are passed as variables.
(() => {
  kfFx.register("stretch-clip-rise", (el, { options, reduce, scroller }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text) return;
    const on = () => el.classList.add("is-in");
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", options.ease.includes(",") ? `cubic-bezier(${options.ease})` : options.ease);
    if (options.delay != null) el.style.setProperty("--fx-delay", `${+options.delay}s`);
    if (reduce || !window.ScrollTrigger) { on(); return () => el.classList.remove("is-in"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: on });
    return () => { st.kill(); el.classList.remove("is-in"); };
  });
})();
