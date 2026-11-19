(() => {
  // Toggles is-shrunk on and off by scroll distance only. Not shrunk on the phone panel (window narrower than min-width) — the original’s logo is already small at 835 and below.
  kfFx.register("scroll-shrink-logo", (el, { options, scroller }) => {
    const at = +(options.at ?? 150);
    const min = +(options["min-width"] ?? 0);
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const check = () => el.classList.toggle("is-shrunk", top() > at && innerWidth > min);
    src.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
    return () => {
      src.removeEventListener("scroll", check);
      removeEventListener("resize", check);
      el.classList.remove("is-shrunk");
    };
  });
})();
