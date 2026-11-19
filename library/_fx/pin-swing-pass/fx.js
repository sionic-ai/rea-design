(() => {
  kfFx.register("pin-swing-pass", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const gap = +(options.gap ?? 0.4), lead = +(options.lead ?? 0.6), tail = +(options.tail ?? 0.6);
    const xs = +(options.x ?? 1.2), ys = +(options.y ?? 120), rot = +(options.rot ?? 10), per = +(options.per ?? 100);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+options.from || 992}px)`, () => {
      const tl = gsap.timeline({
        scrollTrigger: { scroller, trigger: el, start: options.start || "center center", end: () => `+=${cards.length * per}%`, pin: true, pinSpacing: true, scrub: +(options.scrub ?? 1), invalidateOnRefresh: true },
      });
      cards.forEach((card, i) => {
        const last = i === cards.length - 1;
        // Cards further ahead are already there — if the start is ahead of 0, it only comes to center by the remaining distance, and the initial position is close by the same ratio
        const ahead = lead - i * gap;
        const inLen = ahead > 0 ? 1 - ahead : 1, at = ahead > 0 ? 0 : -ahead, near = ahead > 0 ? 1 - ahead : 1;
        const outLen = last ? 1 - tail : 1;
        gsap.set(card, {
          position: "absolute", left: "50%", top: "50%", xPercent: -50, yPercent: -50,
          x: () => innerWidth * xs * near, y: ys * near, rotation: rot * near, transformOrigin: "center bottom",
        });
        tl.to(card, {
          keyframes: [
            { x: 0, y: 0, rotation: 0, duration: inLen, ease: "none" },
            { x: () => -innerWidth * xs * outLen, y: ys * outLen, rotation: -rot * outLen, duration: outLen, ease: "none" },
          ],
          ease: "none",
        }, at);
      });
    });
    return () => mm.revert();
  });
})();
