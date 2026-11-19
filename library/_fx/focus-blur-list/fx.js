// Pin length is exactly the original usePinnedStrip calculation: from the list head starting at .8 screen height until the tail leaves the top of the screen
(() => {
  kfFx.register("focus-blur-list", (fold, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const list = fold.querySelector('[data-fx-part="list"]');
    if (!list) return;
    const rows = [...list.children], sc = scroller ? { scroller } : {}, mm = gsap.matchMedia();
    mm.add(`(prefers-reduced-motion: no-preference) and (min-width: ${+(options.min || 810)}px)`, () => {
      const start = () => fold.clientHeight * 0.8 - list.offsetTop, end = () => list.offsetTop + list.offsetHeight;
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: fold, ...sc, start: "top top", end: () => `+=${Math.round(start() + end())}`, pin: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true } })
        .fromTo(list, { y: () => start() }, { y: () => -end(), duration: 1 });
      const blur = () => {
        const H = fold.clientHeight, top = fold.getBoundingClientRect().top;
        rows.forEach((r) => {
          const p = Math.min(1, Math.max(0, (H * 0.8 - (r.getBoundingClientRect().top - top)) / (H * 0.42)));
          r.style.opacity = p;
          r.style.setProperty("--b", p > 0.85 ? 0 : 3);
        });
      };
      const st = ScrollTrigger.create({ trigger: fold, ...sc, start: "top bottom", end: () => `+=${Math.round(start() + end() + innerHeight)}`, onUpdate: blur, onRefresh: blur });
      return () => { st.kill(); rows.forEach((r) => { r.style.opacity = ""; r.style.removeProperty("--b"); }); };
    });
    // When a pinned element is pulled from the document only the pin-spacer remains, and putting it back makes ScrollTrigger re-insert the removed element in place — so clear the empty spacer first
    return () => { if (!fold.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === fold && t.spacer?.remove()); mm.revert(); };
  });
})();
