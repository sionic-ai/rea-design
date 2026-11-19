(() => {
  // Each sticker piece sticks on from 1.4x and transparent in .6s — full size and opaque at 20%, bounces once to 1.1x at 50%, ends at 1x (same curve per segment, CSS keyframes as is).
  // Pieces are sequenced by data-delay, and with wobble the whole panel settles in with three nods at 1000px perspective (X·Y axes −8·−3 → −6 → 8·−3°)
  kfFx.register("sticker-slap-in", (el, { options, reduce }) => {
    const parts = [...el.querySelectorAll("[data-fx-part=piece]")];
    const pieces = parts.length ? parts : [el];
    const from = +(options.from ?? 1.4), over = +(options.over ?? 1.1), dur = +(options.dur ?? 0.6), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power2.out");
    const wobble = options.wobble != null ? +options.wobble : null;
    const clear = () => gsap.set([...pieces, el], { clearProps: "opacity,scale,transform" });
    if (reduce) return clear;
    const tl = gsap.timeline({ delay });
    pieces.forEach((p) => {
      const at = +(p.dataset.delay ?? 0), up = +(p.dataset.over ?? over);
      if (p.dataset.origin) gsap.set(p, { transformOrigin: p.dataset.origin });
      tl.fromTo(p, { scale: from, opacity: 0 }, {
        keyframes: [
          { scale: 1, opacity: 1, duration: dur * 0.2, ease },
          { scale: up, duration: dur * 0.3, ease },
          { scale: 1, duration: dur * 0.5, ease },
        ],
      }, at);
    });
    if (wobble != null) {
      gsap.set(el, { transformPerspective: +(options.perspective ?? 1000) });
      tl.to(el, { rotationX: -8, rotationY: -3, duration: 0.1 }, wobble)
        .to(el, { rotationX: 0, rotationY: 0, duration: 0.2 })
        .to(el, { rotationY: -6, duration: 0.1 })
        .to(el, { rotationX: 0, rotationY: 0, duration: 0.2 })
        .to(el, { rotationX: 8, rotationY: -3, duration: 0.1 })
        .to(el, { rotationX: 0, rotationY: 0, duration: 0.4 });
    }
    return () => { tl.kill(); clear(); };
  });
})();
