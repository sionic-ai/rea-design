// Panel background swap — original (Brand .l_wrap.bk): when the top edge of the second section (marker) inside the panel comes within 250px of the screen top, is-swapped is set on the panel,
// Background color changes to another color via CSS transition (.5s ease). Reverses when scrolled back up. Curve and length via css variables.
(() => {
  kfFx.register("scroll-tint-swap", (el, { options, scroller }) => {
    const marker = el.querySelector('[data-fx-part="marker"]');
    if (!marker) return;
    const offset = +(options.offset ?? 250);
    const box = scroller || window;
    // Like the original, check directly inside the scroll event — delaying by one frame shifts the switch point by one slot when scrolling fast
    const check = () => {
      const top = marker.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      el.classList.toggle("is-swapped", top < offset);
    };
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
    return () => { box.removeEventListener("scroll", check); removeEventListener("resize", check); el.classList.remove("is-swapped"); };
  });
})();
