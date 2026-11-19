(() => {
  // Original Brand Top plan: stack three plates and pin the stage at screen center for 5000px (scrub 1), the second and third plates open from bottom to top (clip-path inset 100% → 0).
  // Panel k (from 0) opens from k·step − open to k·step, and its photo scales 1 → 1.1 from when it starts opening until pinning ends (at most step + open later).
  // Original values: step 2000 · open 1000 → pinned 5000 (three panels), opening 1000~2000 · 3000~4000, zoom 0~2000 · 1000~4000 · 3000~5000.
  kfFx.register("pin-clip-rise-stack", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!stage || panels.length < 2 || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const step = +(options.step || 2000), open = +(options.open ?? 1000), zoom = +(options.zoom ?? 1.1), scrub = +(options.scrub ?? 1);
    const total = (panels.length - 1) * step + open;
    const mm = gsap.matchMedia();
    mm.add(options.when || "(min-width: 768px)", () => {
      const at = (px) => `center+=${px}px center`;
      const sc = scroller ? { scroller } : {};
      // The open reference is a marker with no fixed margin attached — placed at the very top of the wrapper at stage height (original .js-plan-target). The wrapper grows by the fixed margin, so the center is pushed.
      const mark = document.createElement("div");
      mark.setAttribute("aria-hidden", "true");
      mark.style.cssText = `position:absolute;inset-block-start:0;inset-inline:0;block-size:${stage.offsetHeight}px;pointer-events:none;visibility:hidden`;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.prepend(mark);
      ScrollTrigger.create({ trigger: stage, ...sc, pin: true, start: "center center", end: at(total), scrub });
      panels.forEach((p, k) => {
        const media = p.querySelector('[data-fx-part="media"]');
        const from = k === 0 ? 0 : k * step - open;
        if (k > 0) {
          gsap.set(p, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.to(p, { clipPath: "inset(0% 0% 0% 0%)", ease, scrollTrigger: { trigger: mark, ...sc, start: at(from), end: at(k * step), scrub } });
        }
        if (media) gsap.to(media, { scale: zoom, ease, scrollTrigger: { trigger: mark, ...sc, start: at(from), end: at(Math.min(total, k === 0 ? step : k * step + step)), scrub } });
      });
      return () => {
        mark.remove();
        el.style.removeProperty("position");
      };
    });
    return () => mm.revert();
  });
})();
