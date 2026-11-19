// Pins the photo frame for photo count - 1 screens, and at each step the next photo covers from below with clip-path inset(100%→0%) rising while that photo moves 0→-10%, and the previous photo is pushed a further -10%.
// If a side column (side — title row) exists, it pins together for the same span. With enter, the first photo lights 0→1 and shifts -10% while the column comes in (formula from the original collection site)
(() => {
  kfFx.register("pin-rise-cover", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const media = frame ? [...frame.querySelectorAll('[data-fx-part="media"]')] : [];
    if (!frame || media.length < 2) return;
    const side = el.querySelector('[data-fx-part="side"]');
    const push = +(options.push ?? 10);
    const dur = +(options.dur ?? 0);
    const enter = options.enter === "true";
    if (enter) el.classList.add("is-fx-enter");
    if (reduce) return () => el.classList.remove("is-fx-enter");
    const scr = scroller && scroller !== window ? scroller : undefined;
    const to = (t, v, d) => gsap.to(t, { ...v, duration: d, ease: "none", overwrite: "auto" });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const n = media.length - 1;
      const base = enter ? -push : 0;
      if (enter)
        ScrollTrigger.create({
          trigger: frame,
          scroller: scr,
          start: "top bottom",
          end: "top top",
          onUpdate: (s) => to(media[0], { yPercent: -push * s.progress, opacity: s.progress }, 0.1),
        });
      const end = () => `+=${n * frame.offsetHeight}`;
      if (side) ScrollTrigger.create({ trigger: side, scroller: scr, start: "top top", end, pin: side, pinSpacing: false, invalidateOnRefresh: true });
      ScrollTrigger.create({
        trigger: frame,
        scroller: scr,
        start: "top top",
        end,
        pin: frame,
        invalidateOnRefresh: true,
        onUpdate: (s) => {
          // Each photo’s value comes straight from the single progress value, so nothing piles up on rewind
          const at = s.progress * n;
          const clamp = (v) => Math.min(1, Math.max(0, v));
          media.forEach((m, j) => {
            const cur = j === 0 ? 1 : clamp(at - (j - 1));
            const next = j < n ? clamp(at - j) : 0;
            const v = { yPercent: (j === 0 ? base : -push * cur) - push * next };
            if (j > 0) v.clipPath = `inset(${(1 - cur) * 100}% 0 0 0)`;
            to(m, v, dur);
          });
        },
      });
      return () => gsap.set(media, { clearProps: "transform,clipPath,opacity" });
    });
    return () => {
      mm.revert();
      el.classList.remove("is-fx-enter");
    };
  });
})();
