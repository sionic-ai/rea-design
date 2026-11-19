(() => {
  // Original: width on every scroll > Position at 768 > At 500 the menu row hides and the burger shows, text does fadeOut(400). At 768 and below there is no menu row and the burger is shown from the start
  kfFx.register("nav-to-burger", (el, { options, scroller }) => {
    const at = +(options.at ?? 500);
    const narrow = +(options.narrow ?? 769);
    const shrink = [...el.querySelectorAll('[data-fx-part="shrink"]')];
    const box = scroller || null;
    const pos = () => (box ? box.scrollTop : scrollY);
    const on = () => {
      const past = pos() > at;
      el.classList.toggle("is-fx-narrow", innerWidth < narrow);
      el.classList.toggle("is-fx-past", past);
      shrink.forEach((s) => s.classList.toggle("is-fx-small", past));
    };
    const target = box || window;
    target.addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    on();
    return () => {
      target.removeEventListener("scroll", on);
      removeEventListener("resize", on);
      el.classList.remove("is-fx-past", "is-fx-narrow");
      shrink.forEach((s) => s.classList.remove("is-fx-small"));
    };
  });
})();
