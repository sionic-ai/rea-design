(() => {
  // Original common.js bnrTrigger: on every scroll opacity 0, and 350ms after stopping opacity 1 — the change itself is a CSS transition of .3s
  kfFx.register("scroll-hide-idle", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const wait = +(options.wait ?? 0.35) * 1000;
    const target = scroller || window;
    let t;
    const on = () => {
      el.classList.add("is-scrolling");
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove("is-scrolling"), wait);
    };
    target.addEventListener("scroll", on, { passive: true });
    return () => { target.removeEventListener("scroll", on); clearTimeout(t); el.classList.remove("is-scrolling"); };
  });
})();
