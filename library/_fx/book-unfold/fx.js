(() => {
  kfFx.register("book-unfold", (el, { options, reduce, scroller }) => {
    if (el.querySelectorAll(':scope > [data-fx-part="page"]').length < 2) return;
    if (reduce) {
      el.classList.add("fx-open");
      return () => el.classList.remove("fx-open");
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", once: true, onEnter: () => el.classList.add("fx-open") });
    return () => { st.kill(); el.classList.remove("fx-open"); };
  });
})();
