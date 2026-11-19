// Hidden while scroll is coming in, and restored once wait seconds pass after the last scroll — direction is ignored
(() => {
  kfFx.register("idle-return-bar", (el, { options, scroller }) => {
    const wait = +(options.wait ?? 1) * 1000, after = +(options.after ?? 0);
    // step — must move this much from the last stopped spot to hide (Brand: 80px). At 0 it hides after even a little movement
    const step = +(options.step ?? 0);
    const max = options.max ? matchMedia(`(max-width: ${+options.max}px)`) : null;
    const src = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    let timer = null, rest = pos();
    const onScroll = () => {
      clearTimeout(timer);
      if ((max && !max.matches) || pos() < after) { el.classList.remove("is-hide"); return; }
      if (Math.abs(pos() - rest) >= step) el.classList.add("is-hide");
      timer = setTimeout(() => { rest = pos(); el.classList.remove("is-hide"); }, wait);
    };
    src.addEventListener("scroll", onScroll, { passive: true });
    return () => { src.removeEventListener("scroll", onScroll); clearTimeout(timer); el.classList.remove("is-hide"); };
  });
})();
