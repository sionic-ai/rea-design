(() => {
  kfFx.register("sticky-nudge-stack", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll("[data-fx-part=card]")];
    if (reduce || !cards.length) return;
    const end = el.querySelector("[data-fx-part=end]");
    const lift = +(options.lift ?? 20);
    const from = +(options.from ?? 1), to = +(options.to ?? 0.1);
    const dur = +(options.dur ?? 0.3), durNear = +(options["dur-near"] ?? 0.1);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const update = () => {
          const vh = scroller ? scroller.clientHeight : innerHeight;
          const top0 = scroller ? scroller.getBoundingClientRect().top : 0;
          const a = vh * from, b = vh * to;
          cards.forEach((card, i) => {
            const next = cards[i + 1] || end;
            if (!next) return;
            const nt = next.getBoundingClientRect().top - top0;
            // The share by which the next card rises from the bottom of the screen (from) to the to line, with cubic out — pushed fast at first, settling at the end
            const p = nt >= a ? 0 : nt <= b ? 1 : (a - nt) / (a - b);
            const y = -lift * (1 - Math.pow(1 - p, 3));
            const now = +gsap.getProperty(card, "y") || 0;
            // Follows for a long time when the gap is large (fast wheel · anchor jump), and briefly for the small steps of a scroll frame
            gsap.to(card, { y, duration: Math.abs(y - now) > lift / 2 ? dur : durNear, ease, overwrite: true });
          });
        };
        ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: update });
      });
    }, el);
    return () => fxCtx.revert();
  });
})();
