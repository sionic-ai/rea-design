(() => {
  kfFx.register("wave-morph-scrub", (el, { options, reduce, scroller }) => {
    const path = el.querySelector('[data-fx-part="path"]');
    const to = path?.dataset.to;
    if (!path || !to || !window.MorphSVGPlugin) return;
    gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger);
    const from = path.getAttribute("d"), lerp = +(options.lerp ?? 0.08), half = options.from === "half";
    const tw = gsap.to(path, { morphSVG: to, duration: 1, ease: "none", paused: true });
    if (reduce) { tw.progress(1); return () => { tw.kill(); path.setAttribute("d", from); }; }
    let target = 0, now = 0;
    // Progress = Ratio of how far the element’s top edge has travelled from the bottom to the top of the screen. If half, only the latter half (.5→1) is used
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "top top", onUpdate: (s) => { target = half ? Math.max(0, (s.progress - 0.5) * 2) : s.progress; } });
    // The original isn’t tied directly to the scroll value but approaches 8% of the remaining distance each frame, so the wave follows late
    const tick = () => { if (Math.abs(target - now) < 1e-4) return; now += (target - now) * lerp; tw.progress(now); };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); st.kill(); tw.kill(); path.setAttribute("d", from); };
  });
})();
