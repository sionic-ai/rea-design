(() => {
  // While visible, rotates the disc by speed degrees (default .08 — 80° per 1000px) per 1px of window scroll. No curve, it just follows the scroll position, so scrolling up spins it backward.
  // The direct children rotate the same amount in reverse so they keep their own shape while orbiting around the panel center (the original c-anime-circle ::before · ::after)
  kfFx.register("scroll-turn", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const speed = +(options.speed ?? 0.08);
    const src = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : window.scrollY || 0);
    let seen = false, ticking = false;
    const paint = () => { ticking = false; if (seen) el.style.setProperty("--fx-angle", `${pos() * speed}deg`); };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    const io = new IntersectionObserver((list) => list.forEach((en) => { seen = en.isIntersecting; if (seen) onScroll(); }), { threshold: 0.1, ...(scroller && { root: scroller }) });
    io.observe(el);
    src.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); src.removeEventListener("scroll", onScroll); el.style.removeProperty("--fx-angle"); };
  });
})();
