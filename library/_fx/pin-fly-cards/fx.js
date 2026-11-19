(() => {
  kfFx.register("pin-fly-cards", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const wall = el.querySelector('[data-fx-part="wall"]'), cards = [...el.querySelectorAll('[data-fx-part="card"]')], mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: `+=${+(options.length || 2400)}`, pin: true, scrub: true, anticipatePin: 1 } });
      if (wall) tl.to(wall, { opacity: 0.32, duration: 0.12 }, 0);
      cards.forEach((c, i) => tl.fromTo(c, { y: 0, rotation: i % 2 ? 6 : -6 }, { y: () => -((scroller?.clientHeight || innerHeight) + c.offsetHeight * 1.25), rotation: i % 2 ? -2 : 2, duration: 0.45 }, 0.05 + i * 0.14));
      if (wall) tl.to(wall, { opacity: 1, duration: 0.1 }, 0.92);
    });
    // When a pinned element is pulled from the document only the pin-spacer remains, and putting it back makes ScrollTrigger re-insert the removed element in place — so clear the empty spacer first
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); };
  });
})();
