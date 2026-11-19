(() => {
  // Icons and characters standing in a row rise from 30px below with back.out starting at the center, once all are up, each from the left hops 35px and lands back one by one
  kfFx.register("hop-row-in", (el, { options, reduce, scroller }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="lead"]')];
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    if (reduce || !window.ScrollTrigger) { gsap.set([...parts, ...items], { opacity: 1, y: 0 }); return; }
    gsap.registerPlugin(ScrollTrigger);
    const rise = +(options.rise ?? 30), hop = +(options.hop ?? 35), dur = +(options.dur ?? 0.2), each = +(options.each ?? 0.1);
    const up = +(options.up ?? 0.15), gap = +(options.gap ?? 0.05), ease = kfFx.ease(options.ease || "back.out", "back.out");
    const all = [...parts, ...items];
    gsap.set(all, { opacity: 0, y: rise });
    let tl;
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top 70%", once: true,
      onEnter: () => {
        tl = gsap.timeline();
        if (parts.length) tl.to(parts, { opacity: 1, y: 0, duration: dur, stagger: each, ease });
        tl.to(items, { opacity: 1, y: 0, duration: dur, delay: parts.length ? 0.2 : 0, stagger: { each, from: options.from || "center" }, ease })
          .call(() => items.forEach((it, i) => gsap.timeline().to(it, { y: -hop, duration: up, delay: gap * i + 0.2, ease: "power2.out" }).to(it, { y: 0, duration: up, ease: "power2.in" })));
      },
    });
    return () => { st.kill(); tl && tl.kill(); gsap.killTweensOf(all); gsap.set(all, { clearProps: "transform,opacity" }); };
  });
})();
