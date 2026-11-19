(() => {
  // Original (Brand wholesale section image-scroll): keeps the large phrase pinned on screen until the section end (section bottom edge at screen top + phrase height),
  // While each photo passes from the bottom of the screen to the top, it grows and shrinks .8 → 1 (power1.out) → .8 (power1.in). The last photo stands at 1 in the center of the screen.
  kfFx.register("pass-scale-pin", (el, { options, reduce, scroller }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const from = +(options.from ?? 0.8);
    const inEase = kfFx.ease(options["in-ease"] || "power1.out", "power1.out"), outEase = kfFx.ease(options["out-ease"] || "power1.in", "power1.in");
    if (reduce) { gsap.set(items, { scale: 1 }); return () => gsap.set(items, { clearProps: "transform" }); }
    gsap.set(items, { scale: from });
    const made = [];
    if (text) made.push(ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: "top top", end: () => `bottom top+=${text.offsetHeight}`, pin: text }));
    items.forEach((it, i) => {
      const last = i === items.length - 1;
      const tl = gsap.timeline({ scrollTrigger: { trigger: it, scroller: scroller || undefined, start: "top bottom", end: last ? "center center" : "bottom top", scrub: true } })
        .to(it, { ease: inEase, scale: 1 });
      if (!last) tl.to(it, { ease: outEase, scale: from });
      made.push(tl);
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => {
      ro.disconnect();
      made.forEach((m) => { if (m.scrollTrigger) { m.scrollTrigger.kill(true); m.kill(); } else m.kill(true); });
      gsap.set(items, { clearProps: "transform" });
    };
  });
})();
