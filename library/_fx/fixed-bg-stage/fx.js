// Pin the backdrop video or photo panel behind a section to the screen while the section’s top edge is at the screen top — text and photos inside the section pass over it.
// The original uses one rAF per scroll, when the section top ≤ 0 and the section bottom > Checks whether it is 0 and only swaps the class (swaps in fixed instead of sticky)
(() => {
  kfFx.register("fixed-bg-stage", (el, { scroller }) => {
    const back = el.querySelector('[data-fx-part="backdrop"]');
    if (!back) return;
    const box = el.querySelector('[data-fx-part="lift"]') || el;
    const src = scroller || window;
    let ticking = false;
    const check = () => {
      ticking = false;
      const top0 = scroller ? scroller.getBoundingClientRect().top : 0;
      const a = el.getBoundingClientRect(), b = box.getBoundingClientRect();
      el.classList.toggle("fx-fixed", a.top <= top0 && b.bottom > top0);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    src.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => { src.removeEventListener("scroll", onScroll); el.classList.remove("fx-fixed"); };
  });
})();
