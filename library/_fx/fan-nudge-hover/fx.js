(() => {
  kfFx.register("fan-nudge-hover", (el, { options, reduce, hover, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 2 || reduce) return;
    const step = +(options.step ?? 22), lift = +(options.lift ?? 6), mid = (items.length - 1) / 2;
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const tl = gsap.timeline({ paused: true, defaults: { duration: hover ? +(options.dur ?? 0.55) : +(options["touch-dur"] ?? 0.7), ease } });
    items.forEach((it, i) => {
      // How many slots away from center — with five cards −2·−1·0·1·2, with four −1.5…1.5 rounded outward to −2·−1·1·2
      const d = i - mid, k = d === 0 ? 0 : Math.sign(d) * Math.ceil(Math.abs(d));
      tl.fromTo(it, k ? { x: 0 } : { y: 0 }, k ? { x: k * step } : { y: -lift }, 0);
    });
    if (hover) {
      const on = () => tl.play(), off = () => tl.reverse();
      el.addEventListener("mouseenter", on);
      el.addEventListener("mouseleave", off);
      return () => { el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); tl.revert(); };
    }
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top 70%", end: "bottom 20%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
    return () => { st.kill(); tl.revert(); };
  });
})();
