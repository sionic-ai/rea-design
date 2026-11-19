// When a cell of the sideways-flowing row (character lineup) enters the central 70% of the screen, its speech bubble pops out from 10px below at 0x scale in .4s back.out(1.7).
// At most max (default 2) at once. When one more opens, the earliest folds in .25s. Adjacent cells don’t open together, and each cell opens only once.
(() => {
  kfFx.register("pass-tip-pop", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const tips = items.map((it) => it.querySelector('[data-fx-part="tip"]'));
    if (!tips.some(Boolean)) return;
    const live = tips.filter(Boolean);
    if (reduce) { gsap.set(live, { autoAlpha: 1, scale: 1, y: 0, xPercent: -50 }); return () => gsap.set(live, { clearProps: "all" }); }
    const max = +options.max || 2, dur = +(options.dur ?? 0.4), ease = kfFx.ease(options.ease || "back.out(1.7)", "back.out(1.7)");
    const side = options.side ?? "15%";
    gsap.set(live, { autoAlpha: 0, scale: 0, y: 10, xPercent: -50 });
    let shown = [];
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = items.indexOf(en.target), tip = tips[i];
      if (!tip || shown.some((s) => s.el === tip || Math.abs(s.i - i) === 1)) return;
      if (shown.length >= max) gsap.to(shown.shift().el, { autoAlpha: 0, scale: 0, y: 10, duration: 0.25, overwrite: "auto" });
      shown.push({ el: tip, i });
      gsap.fromTo(tip, { autoAlpha: 0, scale: 0, y: 10, xPercent: -50 }, { autoAlpha: 1, scale: 1, y: 0, xPercent: -50, duration: dur, ease, overwrite: "auto", onComplete: () => io.unobserve(en.target) });
    }), { rootMargin: `0px -${side} 0px -${side}`, threshold: 0 });
    items.forEach((it) => io.observe(it));
    return () => { io.disconnect(); gsap.killTweensOf(live); gsap.set(live, { clearProps: "all" }); };
  });
})();
