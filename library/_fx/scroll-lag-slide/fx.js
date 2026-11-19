(() => {
  kfFx.register("scroll-lag-slide", (el, { options, reduce, scroller }) => {
    const text = el.querySelector("[data-fx-part=text]");
    if (!text) return;
    const from = +(options.from ?? 100);
    const dist = +(options.dist ?? 600);
    const lerp = +(options.lerp || 0.08);
    if (reduce) {
      gsap.set(text, { x: from });
      return () => gsap.set(text, { clearProps: "transform" });
    }
    let cur = from;
    const tick = () => {
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const top = el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      // 0 when the panel touches the bottom of the screen, 1 when it has fully left through the top — the target moves left by that share, and the current position follows each frame by a lerp of the remaining difference
      const p = Math.min(1, Math.max(0, (vh - top) / (vh + el.offsetHeight)));
      cur += (from - p * dist - cur) * lerp;
      text.style.transform = `translate3d(${cur}px, 0, 0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      gsap.set(text, { clearProps: "transform" });
    };
  });
})();
