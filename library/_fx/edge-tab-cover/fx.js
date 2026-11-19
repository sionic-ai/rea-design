// Panel i enters from section top + screen × (per + gap) × i, lasting per (the first panel starts at lead). Tab position is tab width × (remaining panel count) from the right edge
(() => {
  kfFx.register("edge-tab-cover", (el, { options, reduce }) => {
    const stage = el.querySelector("[data-fx-part=stage]");
    const panels = [...el.querySelectorAll("[data-fx-part=panel]")];
    if (!stage || !panels.length) return;
    const per = +(options.per ?? 1.5), gap = +(options.gap ?? 0.5), tail = +(options.tail ?? 1), dim = +(options.dim ?? 0.6);
    const lead = options.lead || "40%";
    const n = panels.length;
    el.style.height = `${(n * (per + gap) + tail) * 100}vh`;
    if (reduce) {
      panels.forEach((p) => p.classList.add("is-on"));
      return () => { el.style.height = ""; panels.forEach((p) => p.classList.remove("is-on")); };
    }
    gsap.registerPlugin(ScrollTrigger);
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;visibility:hidden;width:var(--fx-tab, 60px)";
    const tab = () => { el.append(probe); const w = probe.offsetWidth; probe.remove(); return w; };
    const vh = () => innerHeight;
    const start = (i) => (i === 0 ? `top ${lead}` : `top+=${vh() * (per + gap) * i} top`);
    const end = (i) => `top+=${vh() * (per * (i + 1) + gap * i)} top`;
    const ctx = gsap.context(() => {
      panels.forEach((p, i) => {
        gsap.fromTo(p, { xPercent: 100, x: () => -tab() * (n - i) }, { xPercent: 0, x: 0, ease: "none",
          scrollTrigger: { trigger: el, start: () => start(i), end: () => end(i), scrub: true, invalidateOnRefresh: true,
            onEnter: () => p.classList.add("is-on"), onLeaveBack: () => p.classList.remove("is-on") } });
        if (i > 0) gsap.fromTo(panels[i - 1], { "--fx-dim": 0 }, { "--fx-dim": dim, ease: "none",
          scrollTrigger: { trigger: el, start: () => start(i), end: () => end(i), scrub: true, invalidateOnRefresh: true } });
        if (p.querySelector("[data-fx-part=bar]")) gsap.fromTo(p, { "--fx-bar": 0 }, { "--fx-bar": 1, ease: "none",
          scrollTrigger: { trigger: el, start: () => start(i), end: () => `top+=${vh() * (per + gap) * (i + 1)} top`, scrub: true, invalidateOnRefresh: true } });
      });
    }, el);
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(stage);
    return () => { ro.disconnect(); ctx.revert(); el.style.height = ""; panels.forEach((p) => p.classList.remove("is-on")); };
  });
})();
