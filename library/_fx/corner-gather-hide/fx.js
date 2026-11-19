(() => {
  // Corner photos in the Hero fly toward the center and vanish after only a little scroll (20px), and return in place when back at the top — positions and angles come from look values in fx.css (Brand hero-home-bis)
  kfFx.register("corner-gather-hide", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const past = +(options.past ?? 20);
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const run = () => el.classList.toggle("is-gathered", top() > past);
    run();
    src.addEventListener("scroll", run, { passive: true });
    return () => {
      src.removeEventListener("scroll", run);
      el.classList.remove("is-gathered");
    };
  });
})();
