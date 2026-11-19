(() => {
  kfFx.register("steps-jitter", (el, { options, reduce }) => {
    if (reduce) return;
    const deg = +(options.deg ?? 3), dur = +(options.dur ?? 0.3) || 0.3, R = gsap.utils.random;
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (pieces.length) {
      const sets = [[], [], []];
      pieces.forEach((p, i) => sets[i % 3].push(p));
      const tls = sets.filter((s) => s.length).map((s, n) => gsap.timeline({ repeat: -1, delay: (dur / 3) * n }).call(() => s.forEach((p) => gsap.set(p, { rotation: R(-deg, deg, deg || 1) }))).to({}, { duration: dur }));
      return () => { tls.forEach((t) => t.kill()); gsap.set(pieces, { clearProps: "transform" }); };
    }
    const target = el.querySelector(":scope > svg") || el;
    const tw = gsap.to(target, { rotation: () => R(-deg, deg, deg || 1), duration: dur, delay: R(0, 0.5), ease: "steps(1)", transformOrigin: "50% 50%", repeat: -1, repeatRefresh: true });
    return () => { tw.kill(); gsap.set(target, { clearProps: "transform" }); };
  });
})();
