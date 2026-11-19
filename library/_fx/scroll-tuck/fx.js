(() => {
  // The original reads scrollTop from the scroll event >= 100 sets the marker — it only changes state without being tied to scroll amount, and the motion is left to a CSS transition
  kfFx.register("scroll-tuck", (el, { options, scroller }) => {
    const at = +(options.at ?? 100);
    const src = scroller || window;
    const now = () => (scroller ? scroller.scrollTop : window.scrollY);
    const on = () => el.classList.toggle("is-tucked", now() >= at);
    src.addEventListener("scroll", on, { passive: true });
    on();
    return () => { src.removeEventListener("scroll", on); el.classList.remove("is-tucked"); };
  });
})();
