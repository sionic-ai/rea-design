// Stack the cards in one spot on a sticky stage inside a section (a long panel such as 300vh tall), and for each interval made by dividing the section height by the card count,
// The next card rises straight up from below the screen (100vh, z 50) and covers (power1.out, scrub 1). From 35% of the covering span the previous card goes to z −100 and the one before it to −200
// Recedes into perspective (100vw) while the rising card’s large background text floats up from 150 below and the photo grows from .8 to 1
(() => {
  kfFx.register("depth-rise-stack", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (cards.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const zIn = +(options["z-in"] ?? 50), zBack = +(options["z-back"] ?? -100), at = +(options.at ?? 0.35), scrub = +(options.scrub ?? 1);
    const rise = options.rise || "100vh", min = +(options.from ?? 480);
    const part = (card, name) => card.querySelector(`[data-fx-part="${name}"]`);
    const n = cards.length;
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
      el.classList.add("fx-drs-on");
      cards.forEach((c, i) => gsap.set(c, i ? { y: rise, z: 0 } : { y: 0, z: 0 }));
      cards.forEach((card, i) => {
        if (!i) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            scroller, trigger: el, scrub, invalidateOnRefresh: true,
            start: () => `top+=${(i - 1) * (el.offsetHeight / n)} top`,
            end: () => `top+=${i * (el.offsetHeight / n)} top`,
          },
        });
        const o = { duration: 1, ease: "power1.out", immediateRender: false };
        tl.fromTo(card, { y: rise, z: zIn }, { y: 0, z: 0, ...o }, 0);
        const media = part(card, "media"), bg = part(card, "bg");
        media && tl.fromTo(media, { scale: 0.8 }, { scale: 1, ...o }, 0);
        bg && tl.fromTo(bg, { y: 150, opacity: 0 }, { y: 0, opacity: 1, ...o }, 0);
        tl.fromTo(cards[i - 1], { z: 0 }, { z: zBack, duration: 1 - at, ease: "power1.out", immediateRender: false }, at);
        if (i >= 2) tl.fromTo(cards[i - 2], { z: zBack }, { z: zBack * 2, duration: 1 - at, ease: "power1.out", immediateRender: false }, at);
      });
      return () => { el.classList.remove("fx-drs-on"); gsap.set(cards, { clearProps: "transform" }); };
    });
    if (reduce) gsap.set(cards, { clearProps: "transform" });
    return () => mm.revert();
  });
})();
