(() => {
  // Photo stage — full-size photo layers (bg) behind the section stack as many as there are cards, stuck to the screen (layers move down by the scroll amount as the section passes), and the white cards (card) in front pass by.
  // From the second card, when its head touches the screen center its photo turns on in .2s and turns off when going back. The photo is pushed up 10lvh late while its own card passes.
  // The first card enters with its top cut by (.6 − progress) × 60lvh while opening, and the last card closes with its bottom folded by progress × 75lvh.
  // While the section head moves from screen bottom → center, the section that had shrunk by twice the margin unfolds and its top corner goes 6px → 0. While the section end moves from screen bottom → center it shrinks again and the bottom corners round.
  kfFx.register("photo-stage-cards", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    const bgs = [...el.querySelectorAll('[data-fx-part="bg"]')], cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!bgs.length || !cards.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const fade = +(options.fade ?? 0.2), margin = +(options.margin ?? 20), corner = +(options.corner ?? 6), drift = +(options.drift ?? 10);
    const openAt = +(options.open ?? 0.6), openH = +(options.openh ?? 60), foldH = +(options.fold ?? 75);
    const inner = (b) => b.firstElementChild || b;
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+(options.narrow || 1024) + 1}px) and (prefers-reduced-motion: no-preference)`, () => {
      if (reduce) return;
      const T = [], tr = (o) => T.push(ScrollTrigger.create({ ...(scroller && { scroller }), ...o }));
      const shrink = (p) => 1 - ((2 * margin) / innerWidth) * p;
      const lvh = innerHeight / 100;
      tr({ trigger: el, start: "top bottom", end: "top center", onUpdate: (s) => gsap.set(el, { scale: shrink(1 - s.progress), borderTopLeftRadius: corner * (1 - s.progress), borderTopRightRadius: corner * (1 - s.progress) }) });
      tr({ trigger: el, start: "top top", end: "bottom top", onUpdate: (s) => gsap.set(bgs, { y: s.progress * (s.end - s.start) }) });
      tr({ trigger: el, start: "bottom bottom", end: "bottom center", onUpdate: (s) => gsap.set(el, { scale: shrink(s.progress), borderBottomLeftRadius: corner * s.progress, borderBottomRightRadius: corner * s.progress }) });
      bgs.forEach((b, i) => gsap.set(b, { opacity: i ? 0 : 1 }));
      const last = cards.length - 1;
      cards.forEach((c, i) => {
        const bg = bgs[Math.min(i, bgs.length - 1)];
        const clip = (p) => {
          if (i === 0) gsap.set(c, { clipPath: `inset(${(openAt - p) * openH * lvh}px 0px 0px 0px)` });
          else if (i === last && last > 0) gsap.set(c, { clipPath: `inset(0px 0px ${p * foldH * lvh}px 0px)` });
        };
        clip(0);
        tr({
          trigger: c, start: i === 0 ? "top bottom" : "top center", end: i === 0 || i < last ? "bottom center" : "bottom top",
          onEnter: () => gsap.to(bg, { duration: fade, opacity: 1, overwrite: "auto" }),
          onLeaveBack: () => i > 0 && gsap.to(bg, { duration: fade, opacity: 0, overwrite: "auto" }),
          onUpdate: (s) => { clip(s.progress); gsap.set(inner(bg), { y: -s.progress * drift * lvh }); },
        });
      });
      return () => { T.forEach((t) => t.kill()); gsap.set([el, ...bgs, ...bgs.map(inner), ...cards], { clearProps: "transform,opacity,clipPath,borderRadius" }); };
    });
    return () => mm.revert();
  });
})();
