// The original uses the empty cell before the section (data-sticky-trigger) as the trigger and scrubs width · height · --val · --roud on the photo cell — end size is re-measured from the screen size on every refresh
(() => {
  kfFx.register("collage-center-grow", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]'), grow = el.querySelector('[data-fx-part="grow"]');
    if (!stage || !grow || reduce || !window.ScrollTrigger) return;
    // min — below that width it isn’t attached (the original attaches only at 1025px and up — on phone the two photo rows just flow)
    if (+(options.min || 0) > innerWidth) return;
    gsap.registerPlugin(ScrollTrigger);
    const len = +(options.length || 3), from = +(options.from ?? 0.33), to = +(options.to ?? 0.55), fade = +(options.fade ?? 0.75);
    const drop = +(options.drop ?? 60), scrub = +(options.scrub ?? 1);
    el.style.setProperty("--fx-length", len);
    const pct = (p) => `${Math.round(p * 100)}%`;
    const tl = [];
    tl.push(gsap.fromTo(grow, { width: () => grow.parentElement.offsetWidth, height: () => grow.parentElement.offsetHeight, "--fx-round": 1, "--fx-drop-now": "0px" }, {
      width: () => stage.clientWidth, height: () => stage.clientHeight, "--fx-round": 0, "--fx-drop-now": drop + "px", ease: "none",
      scrollTrigger: { trigger: el, scroller, start: `${pct(from)} center`, end: `${pct(to)} top`, scrub, invalidateOnRefresh: true },
    }));
    tl.push(gsap.to(stage, { opacity: 0, ease: "none", scrollTrigger: { trigger: el, scroller, start: `${pct(fade)} top`, end: "bottom 60%", scrub, invalidateOnRefresh: true } }));
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); tl.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); gsap.set([grow, stage], { clearProps: "all" }); el.style.removeProperty("--fx-length"); };
  });
})();
