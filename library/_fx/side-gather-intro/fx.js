// Hero gathering — values of Brand MainVisual as is: the center ball rises from the exact middle of the panel in .5s power1.inOut, at 1.6s a person comes in from the bottom right (58vw · 58vh) in .8s power1.out,
// At 2.4s the center group returns to place in .8s power2.out · side crowds from ∓50vw · 50vh in 1.2s power2.out (stagger .15), at 3s the background-on signal. When done it scatters with scroll scrub 1
(() => {
  kfFx.register("side-gather-intro", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const center = el.querySelector('[data-fx-part="center"]');
    if (!center) return;
    const lead = center.querySelector('[data-fx-part="lead"]');
    const figure = center.querySelector('[data-fx-part="figure"]');
    const lefts = [...el.querySelectorAll('[data-fx-part="left"]')], rights = [...el.querySelectorAll('[data-fx-part="right"]')];
    const k = +(options.pace || 1);
    const fire = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    let st = null;
    const scatter = () => {
      if (options.scatter === "false" || options.scatter === false || !window.ScrollTrigger) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom top", scrub: 1 } })
        .to(center, { x: "100vw", y: "50vh", scale: 1.1 }, 0);
      if (lefts.length) tl.to(lefts, { x: "-100vw", y: "50vh", scale: 1.2 }, 0);
      if (rights.length) tl.to(rights, { x: "100vw", y: "50vh", scale: 1.2 }, 0);
      st = tl.scrollTrigger;
      return tl;
    };
    let scat = null;
    if (reduce) { fire("fx:gather-end"); return () => {}; }
    const box = el.getBoundingClientRect(), c = center.getBoundingClientRect(), l = (lead || center).getBoundingClientRect();
    const t = gsap.timeline();
    t.set(center, { x: box.width / 2 - l.width / 2 - (c.left - box.left) - (l.left - c.left), y: box.height / 2 - l.height / 2 - (c.top - box.top) - (l.top - c.top) });
    if (lead) t.set(lead, { opacity: 0, y: "100%" });
    if (figure) t.set(figure, { x: "58vw", y: "58vh" });
    if (lefts.length) t.set(lefts, { x: "-50vw", y: "50vh" });
    if (rights.length) t.set(rights, { x: "50vw", y: "50vh" });
    t.add(gsap.delayedCall(1 * k, () => fire("fx:gather-play")));
    if (lead) t.to(lead, { opacity: 1, y: 0, ease: "power1.inOut", duration: 0.5 * k }, 0);
    // Leave empty time so the next step arrives at the same moment even without a character
    t.to(figure || {}, figure ? { x: 0, y: 0, ease: "power1.out", duration: 0.8 * k } : { duration: 0.8 * k }, 1.6 * k)
      .call(() => fire("fx:gather-header"))
      .to(center, { x: 0, y: 0, ease: "power2.out", duration: 0.8 * k }, "<");
    if (lefts.length) t.to(lefts, { x: 0, y: 0, ease: "power2.out", duration: 1.2 * k, stagger: 0.15 * k }, "<0");
    if (rights.length) t.to(rights, { x: 0, y: 0, ease: "power2.out", duration: 1.2 * k, stagger: 0.15 * k }, "<0");
    t.add(gsap.delayedCall(0, () => fire("fx:gather-bg")), `<${0.6 * k}`)
      .call(() => { fire("fx:gather-end"); scat = scatter(); });
    return () => {
      t.kill(); scat?.kill(); st?.kill();
      gsap.set([center, lead, figure, ...lefts, ...rights].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
