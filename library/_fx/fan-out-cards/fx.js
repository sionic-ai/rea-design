(() => {
  kfFx.register("fan-out-cards", (el, { options, reduce, scroller }) => {
    if (el.querySelectorAll('[data-fx-part="card"]').length < 3) return;
    if (reduce) { el.classList.add("is-fx-open"); return () => el.classList.remove("is-fx-open"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 50%", end: "max", toggleClass: { targets: el, className: "is-fx-open" } });
    return () => { st.kill(); el.classList.remove("is-fx-open"); };
  });
})();
