// For each card the pin goes on the card and the tilt on the inner board — hanging a pin and a scrub transform on one element makes the transform apply twice inside the pin-spacer
(() => {
  kfFx.register("tip-back-stack", (el, { options, scroller }) => {
    const cards = [...el.children].filter((c) => c.nodeType === 1);
    if (cards.length < 2) return;
    const top = +(options.top ?? 20), tilt = +(options.tilt ?? 2.67156), tip = +(options.tip ?? 40), scale = +(options.scale ?? 0.7);
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const viewH = () => (scroller ? scroller.clientHeight : innerHeight);
        const tall = (c) => c.offsetHeight > viewH();
        cards.forEach((card, r) => {
          card.style.zIndex = r + 1;
          if (r === cards.length - 1) return;
          const inner = card.querySelector("[data-fx-part=card]") || card.firstElementChild;
          const next = cards[r + 1];
          // A card taller than the screen sticks when its bottom edge touches, then lies down with the bottom as the axis
          const origin = () => inner && (inner.style.transformOrigin = tall(card) ? "50% 90%" : "50% 10%");
          origin();
          ScrollTrigger.create({
            scroller, trigger: card, start: () => (tall(card) ? "bottom bottom" : `top ${top}px`), endTrigger: next, end: `top ${top}px`,
            pin: true, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: origin,
            onLeave: () => inner && gsap.set(inner, { opacity: 0 }), onEnterBack: () => inner && gsap.set(inner, { opacity: 1 }),
          });
          if (inner) gsap.fromTo(inner, { rotation: 0, rotateX: 0, scale: 1 }, {
            rotation: r % 2 === 0 ? -tilt : tilt, rotateX: tip, scale, ease: "none",
            scrollTrigger: { scroller, trigger: next, start: () => `top ${Math.min(top + card.offsetHeight, viewH())}px`, end: `top ${top}px`, scrub: true, invalidateOnRefresh: true },
          });
        });
        // If fonts or photos arrive late and the card height changes, re-measure the stick position — only once per frame
        let queued = 0;
        const ro = new ResizeObserver(() => { cancelAnimationFrame(queued); queued = requestAnimationFrame(() => ScrollTrigger.refresh()); });
        cards.forEach((c) => ro.observe(c));
        return () => { cancelAnimationFrame(queued); ro.disconnect(); cards.forEach((c) => (c.style.zIndex = "")); };
      });
    }, el);
    return () => fxCtx.revert();
  });
})();
