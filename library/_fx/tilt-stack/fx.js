// The card itself handles the incoming tilt and the inner panel the outgoing tilt — put both on one element and the two scrubs overwrite each other
(() => {
  kfFx.register("tilt-stack", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.matchMedia().add({ desk: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)", mob: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
        const k = ctx.conditions.desk ? 1 : 0.5;
        const r = +(options.tilt ?? 8) * k, t = +(options.shift ?? 10) * k;
        [...el.children].forEach((card, d) => {
          const even = d % 2 === 0, inner = card.querySelector("[data-fx-part=inner]") || card.firstElementChild;
          gsap.from(card, { rotate: even ? r : -r, xPercent: even ? -t : t, ease: "power1.out", scrollTrigger: { scroller, trigger: card, start: "top bottom", end: "top 20%", scrub: true } });
          if (inner) gsap.to(inner, { rotate: even ? -r : r, xPercent: even ? -t : t, ease: "power1.in", scrollTrigger: { scroller, trigger: card, start: "top 20%", end: "bottom top", scrub: true } });
        });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
