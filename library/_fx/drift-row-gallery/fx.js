(() => {
  // Staggered flowing photo strip — the track sticks to the screen (sticky) while the section scrolls by strip width + 2 screens, during which the strip (list) flows left by its own width + one slot (--fx-p),
  // The large wordmark (mark) behind flows the opposite way by 80vw. Each card starts 600px to the right and moves to a spot at −100 to −180px on a 4s sine.out curve, overlapping (starting 85–95% before the previous card ends)
  // Binds the following timeline with scrub 1 over ‹section head 1.5 screens above → band width + 6 screens›, so each cell follows later and differently, and the lines scatter diagonally then gather.
  const num = (s, d) => String(s ?? d).split(",").map((v) => v.trim()).filter(Boolean).map(Number);
  kfFx.register("drift-row-gallery", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]'), list = el.querySelector('[data-fx-part="list"]');
    if (!track || !list || !window.ScrollTrigger) return;
    const mark = el.querySelector('[data-fx-part="mark"]');
    gsap.registerPlugin(ScrollTrigger);
    const from = +(options.from ?? 600), xs = num(options.xs, "-180,-140,-100,-120,-130,-140,-120,-120,-150"), laps = num(options.laps, "90,90,85,90,85,95,90,85");
    const dur = +(options.dur ?? 4), ease = kfFx.ease(options.ease || "sine.out", "sine.out"), scrub = +(options.scrub ?? 1), shift = +(options.shift ?? 80);
    let mm = null, ro = null, w0 = 0;
    const build = () => {
      mm?.revert();
      mm = gsap.matchMedia();
      mm.add(`(min-width: ${+(options.narrow || 1024) + 1}px) and (prefers-reduced-motion: no-preference)`, () => {
        if (reduce) return;
        const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
        const w = list.getBoundingClientRect().width, h = list.getBoundingClientRect().height;
        w0 = w;
        gsap.set(el, { height: w + 2.8 * innerHeight });
        gsap.set(track, { paddingTop: Math.max(0, (innerHeight - h) / 2) });
        const tl = gsap.timeline({ paused: true, defaults: { duration: dur, ease } });
        if (cards.length) gsap.set(cards, { x: from });
        cards.forEach((c, i) => tl.to(c, { x: xs[i % xs.length] ?? -120 }, i ? `-=${laps[(i - 1) % laps.length] ?? 90}%` : 0));
        const t1 = ScrollTrigger.create({
          trigger: el, ...(scroller && { scroller }), start: "top top", end: () => "+=" + (w + 2 * innerHeight),
          onUpdate: (s) => {
            gsap.set(el, { "--fx-p": s.progress });
            gsap.set(list, { x: -s.progress * (w + (+(options.tail ?? 0) || innerWidth * 0.075)) });
            mark && gsap.set(mark, { x: (-s.progress * shift * innerWidth) / 100 });
          },
        });
        const t2 = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: "top " + 1.5 * innerHeight, end: () => "+=" + (w + 6 * innerHeight), scrub, animation: tl });
        return () => { t1.kill(); t2.kill(); tl.kill(); gsap.set([el, track, list, mark, ...cards].filter(Boolean), { clearProps: "all" }); };
      });
    };
    build();
    // If the strip width changes because photos or fonts arrive late, measure again
    ro = new ResizeObserver(() => { const w = list.getBoundingClientRect().width; if (Math.abs(w - w0) > 2) build(); });
    ro.observe(list);
    return () => { ro.disconnect(); mm?.revert(); };
  });
})();
