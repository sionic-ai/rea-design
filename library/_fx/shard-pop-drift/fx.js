(() => {
  kfFx.register("shard-pop-drift", (el, { options, reduce, scroller }) => {
    const shards = [...el.querySelectorAll('[data-fx-part="shard"]')], words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!shards.length && !words.length) return;
    if (reduce) { gsap.set([...shards, ...words], { opacity: 1 }); return () => gsap.set([...shards, ...words], { clearProps: "opacity" }); }
    gsap.registerPlugin(ScrollTrigger);
    const rate = +(options.rate ?? 1);
    const ctx = gsap.context(() => {
      shards.forEach((s, i) => {
        gsap.timeline({ scrollTrigger: { scroller, trigger: s, start: "top bottom-=30%", once: true } })
          .to(s, { alpha: 1, duration: 0.4, ease: "power3.out" })
          .fromTo(s, { scale: 0.5 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, .6)" }, "<");
        const even = i % 2 === 0;
        gsap.fromTo(s, { y: (even ? -50 : -80) * rate }, { y: (even ? 250 : 100) * (i + 1) * 0.05 * rate, ease: "none", scrollTrigger: { scroller, trigger: s, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
      words.forEach((w) => {
        gsap.to(w, { alpha: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { scroller, trigger: w, start: "top bottom-=20%", once: true } });
        gsap.fromTo(w, { y: 10 * rate }, { y: -30 * rate, ease: "none", scrollTrigger: { scroller, trigger: w, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    }, el);
    return () => ctx.revert();
  });
})();
