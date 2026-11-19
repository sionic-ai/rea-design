(() => {
  // Original studio work row (project-feed): of the video rows stacked overlapping at .56 scale, only the one that passes the 60% line of the screen gets is-active and scales to 1x (1.5s cubic-bezier(.16,1,.3,1)),
  // Passed items shrink back again with is-above, using the top as the axis. Title cell ([data-fx-part=titles] rows) roll upward by the current step over 1.25s expo.inOut and swap.
  kfFx.register("center-grow-feed", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const titles = [...el.querySelectorAll('[data-fx-part="titles"] > *')];
    const line = options.line || "60%", roll = +(options.roll ?? 1.25);
    const sts = items.map((it, i) => {
      const next = items[i + 1];
      return ScrollTrigger.create({
        trigger: it, endTrigger: next || el, scroller,
        start: i === 0 ? "top bottom" : `top ${line}`, end: next ? `top ${line}` : "bottom -100%",
        toggleClass: { targets: it, className: "is-active" },
        onLeave: () => it.classList.add("is-above"), onEnterBack: () => it.classList.remove("is-above"),
        onToggle: (s) => { if (s.isActive && titles.length) gsap.to(titles, { yPercent: -100 * i, ease: "expo.inOut", duration: reduce ? 0 : roll, overwrite: true }); },
      });
    });
    return () => { sts.forEach((s) => s.kill()); items.forEach((it) => it.classList.remove("is-active", "is-above")); if (titles.length) gsap.set(titles, { clearProps: "transform" }); };
  });
})();
