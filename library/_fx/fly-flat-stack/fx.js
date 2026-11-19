// On a pinned stage, cards fly in one at a time from deep below (y 1000 · z 750 · rotateX 90°) and lie flat, and each earlier card is pushed up 50px whenever another arrives.
// Original values (Brand ‹Good fit places›): cards 1.5 beats power2.out · 2-beat spacing · after all arrive, rest .3 beat, then cards leave at .15-beat intervals over 1.8 beats power2.inOut, sliding −50vh while the stage blurs
// · the title shrinks to .7x meanwhile and goes out with it · 1 beat = Scroll 30% of screen · scrub 1 · perspective 1000.
(() => {
  kfFx.register("fly-flat-stack", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const title = el.querySelector('[data-fx-part="title"]');
    if (!cards.length) return;
    if (reduce) return;
    const DUR = +(options.dur ?? 1.5), GAP = +(options.gap ?? 2), LIFT = +(options.lift ?? 50), PER = +(options.per || 30), SCRUB = +(options.scrub ?? 1);
    const TILT = +(options.tilt ?? 90), DEPTH = +(options.depth ?? 750), DROP = +(options.drop ?? 1000);
    const n = cards.length, EXIT_EACH = 0.15, EXIT = 1.2 * 1.5;
    const exitAt = (n - 1) * GAP + DUR + 0.3, total = exitAt + n * EXIT_EACH + 1.2;
    cards.forEach((c, i) => gsap.set(c, { transformPerspective: 1000, x: 0, y: DROP, z: DEPTH, rotateX: TILT, scale: 1, zIndex: i + 1 }));
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: `+=${Math.round(total * PER)}%`, pin: options.pin !== "off", scrub: SCRUB, anticipatePin: 1, invalidateOnRefresh: true } });
    if (title) tl.to(title, { scale: 0.7, duration: exitAt, ease: "none" }, 0);
    cards.forEach((c, i) => {
      tl.to(c, { x: 0, y: 0, z: 0, rotateX: 0, scale: 1, duration: DUR, ease: "power2.out" }, i * GAP);
      for (let k = 0; k < i; k++) tl.to(cards[k], { y: -LIFT * (i - k), duration: DUR, ease: "power2.out" }, i * GAP);
    });
    tl.to(cards, { y: "-50vh", duration: EXIT, ease: "power2.inOut", stagger: EXIT_EACH }, exitAt);
    tl.to(el, { opacity: 0, duration: EXIT, ease: "power2.inOut" }, exitAt);
    if (title) tl.to(title, { y: "-50vh", duration: EXIT, ease: "power2.inOut" }, exitAt);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([el, title, ...cards].filter(Boolean), { clearProps: "all" }); };
  });
})();
