(() => {
  // Until the cell reaches the 75% line of the screen and sticks, the cards are scrubbed with power1.in in sequential tilt, and the moment it sticks they stretch horizontally and then bounce with elastic
  kfFx.register("sticky-tilt-bounce", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    const items = [...el.children].filter((c) => c.getAttribute("data-fx-part") === "item");
    if (!items.length) return;
    const rot = String(options.rotate ?? "0,4,-4").split(",").map(Number).filter((n) => !Number.isNaN(n));
    const stretch = +(options.stretch ?? 1.5), dur = +(options.dur ?? 1), squash = +(options.squash ?? 0.33);
    const ease = kfFx.ease(options.ease || "", "power1.in");
    const kill = [];
    items.forEach((item, i) => {
      const card = item.querySelector('[data-fx-part="card"]');
      if (!card) return;
      const top = () => parseFloat(getComputedStyle(item).top) || 0;
      const tw = gsap.fromTo(card, { rotate: 0 }, { rotate: rot.length ? rot[i % rot.length] : 0, ease, scrollTrigger: { trigger: item, scroller, start: "top 75%", end: () => `top-=${top()} top`, scrub: true, invalidateOnRefresh: true } });
      const st = ScrollTrigger.create({ trigger: item, scroller, start: () => `top-=${top()} top`, invalidateOnRefresh: true, onEnter: () => {
        const px = parseFloat(getComputedStyle(card).fontSize) * stretch;
        const w = card.offsetWidth || 1, h = card.offsetHeight || 1;
        gsap.timeline().to(card, { scaleX: (w + px) / w, scaleY: Math.max(0.5, (h - px * squash) / h), duration: 0.1, ease: "power1.out" })
          .to(card, { scaleX: 1, scaleY: 1, duration: dur, ease: "elastic.out(1, 0.3)" });
      } });
      kill.push(() => { tw.scrollTrigger?.kill(); tw.kill(); st.kill(); gsap.set(card, { clearProps: "transform" }); });
    });
    return () => kill.forEach((k) => k());
  });
})();
