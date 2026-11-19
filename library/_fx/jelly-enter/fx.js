// When the section is visible, the inner block enters from one of three lower sides, tips slightly the opposite way, squashes, then stands up — a jelly-like single wobble entrance.
(() => {
  const dss = (t) => Math.sin((Math.PI / 2) * Math.sin((Math.PI / 2) * t));
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("fx-jelly-ready");
  kfFx.register("jelly-enter", (el, { options, reduce, scroller }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="target"]')];
    const targets = parts.length ? parts : [el];
    if (reduce || !window.ScrollTrigger) { el.classList.add("is-fx-in"); return; }
    const small = matchMedia("(max-width: 959px)").matches;
    const d = small ? +(options["dist-sm"] ?? 40) : +(options.dist ?? 100);
    const over = +(options.over ?? 40), dur = +(options.dur ?? 0.8);
    let side = options.side || "random";
    if (side === "random") side = ["left", "center", "right"][Math.floor(Math.random() * 3)];
    const sx = side === "left" ? -1 : side === "right" ? 1 : 0;
    const origin = side === "left" ? "100% 0%" : side === "right" ? "0% 0%" : "50% 0%";
    const squeeze = sx ? { scaleX: 0.95, scaleY: 0.9 } : { scaleX: 1.1, scaleY: 0.8 };
    // Set the starting position (x · y offset) on entry — as in the original, it stays transparent in place while waiting (so the side measuring the layout does not see the offset position)
    gsap.set(targets, { opacity: 0 });
    el.classList.add("is-fx-in");
    let tw;
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top 70%", once: true,
      onEnter: () => {
        gsap.set(targets, { x: sx * d, y: d, opacity: 0, transformOrigin: origin });
        tw = gsap.to(targets, {
          keyframes: {
            0: { x: sx * d, y: d, scaleX: 1, scaleY: 1, opacity: 0 },
            20: { opacity: 1 },
            30: { scaleX: 1, scaleY: 1 },
            70: { x: -sx * over, y: -over, ...squeeze },
            100: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
          },
          duration: dur, ease: dss,
        });
      },
    });
    return () => { st.kill(); tw?.kill(); el.classList.remove("is-fx-in"); gsap.set(targets, { clearProps: "transform,opacity,transformOrigin" }); };
  });
})();
