// A header that slides out of view by exactly how far you scroll — tied to scroll amount, not time, so scrolling slowly hides it slowly.
// Original (Brand globalnav): c = min(max, max(0, c + scrolled amount) − footer overflow) · footer overflow = max(−max, min(0, footer top edge))
(() => {
  kfFx.register("scroll-push-nav", (el, { options, reduce, scroller }) => {
    if (reduce) return () => {};
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    const footSel = options.foot ?? "footer";
    let last = null, off = 0;
    const update = () => {
      const y = Math.max(0, read());
      const max = options.max !== undefined ? +options.max : el.offsetHeight;
      if (last === null) last = y;
      const foot = footSel && footSel !== "none" ? document.querySelector(footSel) : null;
      const top0 = scroller ? scroller.getBoundingClientRect().top : 0;
      const catchUp = foot ? Math.max(-max, Math.min(0, foot.getBoundingClientRect().top - top0)) : 0;
      off = Math.min(max, Math.max(0, off + (y - last)) - catchUp);
      last = y;
      el.style.transform = `translate3d(0, ${-off}px, 0)`;
      el.style.setProperty("--fx-pushed", `${off}px`);
      el.classList.toggle("is-tucked", off >= max);
    };
    const target = scroller || window;
    target.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      target.removeEventListener("scroll", update);
      el.style.transform = "";
      el.style.removeProperty("--fx-pushed");
      el.classList.remove("is-tucked");
    };
  });
})();
