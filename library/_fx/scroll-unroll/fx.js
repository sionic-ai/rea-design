// The landing is carried over from CSS keyframes using WAAPI — the Curve is applied per step like CSS (overall curve linear), and the unfold is tied to scroll so it uses ScrollTrigger scrub.
// The expanded width is in px so the panel size is not measured — only fixed lengths (multiples of screen height) are re-read on refresh.
(() => {
  const DROP = [
    { offset: 0, transform: "scale(0.9, 1.2) translate(0, -50vh)", opacity: 0 },
    { offset: 0.1, transform: "scale(0.9, 1.2) translate(0, -15vh)" },
    { offset: 0.2, transform: "scale(1.2, 0.9) translate(0, 3vh)", opacity: 1 },
    { offset: 0.3, transform: "scale(1, 1) translate(0, -1vh)" },
    { offset: 0.4, transform: "scale(1, 1) translate(0, -3vh)" },
    { offset: 0.5, transform: "scale(1, 1) translate(0, -1vh)" },
    { offset: 0.6, transform: "scale(1, 1) translate(0, 0)", opacity: 1 },
    { offset: 1, transform: "scale(1, 1) translate(0, 0)", opacity: 1 },
  ];
  const PUFF = (dir) => [
    { offset: 0, transform: "scale(0.9, 0.9) translate(0, 0)", opacity: 0 },
    { offset: 0.3, transform: `scale(1, 1) translate(${dir * 15}px, -20px)`, opacity: 1 },
    { offset: 1, transform: `scale(1, 1) translate(${dir * 15}px, -20px)`, opacity: 0 },
  ];
  const each = (frames, easing) => frames.map((k) => ({ ...k, easing }));
  kfFx.register("scroll-unroll", (el, { options, reduce, scroller }) => {
    const paper = el.querySelector('[data-fx-part="paper"]');
    const roller = el.querySelector('[data-fx-part="roller"]');
    if (!paper || !roller) return;
    const strip = el.querySelector('[data-fx-part="strip"]');
    const puffs = [...el.querySelectorAll('[data-fx-part="puff"]')];
    const width = options.width ?? "518px";
    const frames = +(options.frames || 8);
    const fin = () => { gsap.set(paper, { width }); if (strip) gsap.set(strip, { xPercent: -100 * (frames - 1) / frames }); };
    if (reduce) { fin(); return () => gsap.set([paper, roller, strip].filter(Boolean), { clearProps: "all" }); }

    gsap.registerPlugin(ScrollTrigger);
    const anims = [];
    // Landing — stretched from above, falls and flattens, bounces small twice and stands (1.2s, cubic-bezier(.12,0,.39,0)) · smoke after .24s for .8s
    if ((options.drop || "on") !== "off") {
      const ease = `cubic-bezier(${options.ease || "0.12,0,0.39,0"})`;
      const dur = +(options.dur ?? 1.2) * 1000, delay = +(options.delay ?? 0) * 1000;
      anims.push(roller.animate(each(DROP, ease), { duration: dur, delay, fill: "both" }));
      puffs.forEach((p, i) => anims.push(p.animate(each(PUFF(i % 2 ? 1 : -1), "ease"), { duration: 800, delay: delay + 240, fill: "both" })));
    }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const open = +(options.open ?? 1);
      const len = () => innerHeight * open;
      const st = { trigger: el, ...(scroller && { scroller }), start: options.start || "top top", end: () => `+=${len()}`, scrub: options.scrub == null ? true : +options.scrub, invalidateOnRefresh: true };
      gsap.set(paper, { width: 0 });
      const tl = gsap.timeline({ scrollTrigger: { ...st, pin: (options.pin || "on") !== "off" } });
      tl.to(paper, { width, ease: "none", duration: 1 }, 0)
        .to(roller, { xPercent: +(options.shift ?? -5), ease: "none", duration: 1 }, 0);
      // The axis drawing advances one cell at a time — with 8 cells, steps(7) from 0 → −7 cells
      if (strip) tl.fromTo(strip, { xPercent: 0 }, { xPercent: -100 * (frames - 1) / frames, ease: `steps(${frames - 1})`, duration: 1 }, 0);
      return () => tl.scrollTrigger?.kill();
    });
    return () => {
      anims.forEach((a) => a.cancel());
      mm.revert();
      gsap.set([paper, roller, strip].filter(Boolean), { clearProps: "all" });
    };
  });
})();
