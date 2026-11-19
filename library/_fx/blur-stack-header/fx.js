(() => {
  // The blur layer goes at the very front inside the header row — it sits behind the header text (z -1) so it doesn’t cover the menu
  kfFx.register("blur-stack-header", (el, { options, scroller }) => {
    const stack = document.createElement("div");
    stack.className = "fx-blur-stack";
    stack.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 6; i++) stack.append(document.createElement("div"));
    el.prepend(stack);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.height) el.style.setProperty("--fx-height", options.height);
    // While the hero is visible by the threshold, the blur is lifted up — so the hero photo isn’t blurred
    const hero = options.hero ? document.querySelector(options.hero) : null;
    let io = null;
    if (hero) {
      io = new IntersectionObserver(([e]) => el.classList.toggle("is-fx-hero", e.isIntersecting), {
        root: scroller && scroller !== window ? scroller : null,
        threshold: +(options.threshold ?? 0.15),
      });
      io.observe(hero);
    }
    return () => {
      io?.disconnect();
      stack.remove();
      el.classList.remove("is-fx-hero");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-height");
    };
  });
})();
