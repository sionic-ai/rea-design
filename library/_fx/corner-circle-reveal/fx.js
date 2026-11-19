// A photo cell opens as a circle from one corner. If already scrolling down fast it opens one screen earlier and spins faster by that speed — so no empty cells show even on a quick flick
(() => {
  kfFx.register("corner-circle-reveal", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const at = options.at || "100% 0%";
    const img = el.querySelector(':scope > [data-fx-part="img"]') || el.firstElementChild;
    const tl = gsap.timeline({ paused: true }).fromTo(el, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(${+(options.size ?? 150)}% at ${at})`, duration: +(options.dur ?? 1.6), ease: kfFx.ease(options.ease || "expo.inOut", "expo.inOut") }, 0);
    const zoom = +(options.zoom ?? 1.15);
    if (img && zoom !== 1) tl.from(img, { scale: zoom, duration: +(options["zoom-dur"] ?? 1.8), ease: kfFx.ease(options["zoom-ease"] || "expo.out", "expo.out") }, 0);
    const per = +(options.boost ?? 600), max = +(options.max ?? 4), fast = +(options.fast ?? 900);
    const go = (st) => tl.progress() === 0 && !tl.isActive() && tl.timeScale(gsap.utils.clamp(1, max, Math.abs(st.getVelocity()) / per)).play();
    const early = ScrollTrigger.create({ scroller, trigger: el, start: options.early || "top 125%", once: true, onEnter: (st) => Math.abs(st.getVelocity()) >= fast && go(st) });
    const on = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top bottom", once: true, onEnter: go });
    return () => { early.kill(); on.kill(); tl.revert(); };
  });
})();
