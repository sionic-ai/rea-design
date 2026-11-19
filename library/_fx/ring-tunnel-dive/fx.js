// Scrolling digs 22x toward one point in the image (inside the head · window · hole), and 11 concentric rings inheriting that point appear flat and then
// It passes off the screen and the next scene turns on. The background color also changes midway. Progress is tied directly to scroll (scrub).
(() => {
  kfFx.register("ring-tunnel-dive", (el, { options, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]'), world = el.querySelector('[data-fx-part="world"]');
    if (!stage || !world || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const target = el.querySelector('[data-fx-part="target"]'), next = el.querySelector('[data-fx-part="next"]');
    const zoom = +(options.zoom ?? 22), count = Math.max(1, +(options.rings || 11)), step = +(options.step ?? 0.8);
    const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const rings = document.createElement("div");
    rings.className = "fx-rtd__rings";
    rings.setAttribute("aria-hidden", "true");
    stage.appendChild(rings);
    const build = () => {
      const w = stage.clientWidth, h = stage.clientHeight, d = Math.hypot(w, h);
      rings.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const r = document.createElement("i"), s = d * Math.pow(step, i);
        r.style.cssText = `width:${s}px;height:${s}px;left:${(w - s) / 2}px;top:${(h - s) / 2}px`;
        rings.appendChild(r);
      }
    };
    // Burrowing dot: the center of the marker if present, otherwise the panel center at 60% height (original default)
    const origin = () => {
      if (!target) return "50% 60%";
      const a = world.getBoundingClientRect(), b = target.getBoundingClientRect(), s = world.offsetWidth ? a.width / world.offsetWidth || 1 : 1;
      return `${(b.left - a.left + b.width / 2) / s}px ${(b.top - a.top + b.height / 2) / s}px`;
    };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      build();
      let o = origin();
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true, onRefreshInit: () => { gsap.set(world, { scale: 1 }); o = origin(); build(); } },
      });
      tl.to(world, { scale: zoom, transformOrigin: () => o, duration: 1.1, ease: "power3.in" }, 0)
        .to(world, { autoAlpha: 0, duration: 0.25 }, 0.85)
        .fromTo(rings, { scaleX: 0.3, scaleY: 0.08, autoAlpha: 0 }, { scaleX: 1.4, scaleY: 1.4, autoAlpha: 1, duration: 0.6, ease: "power1.in" }, 0.6)
        .to(rings, { scale: 9, duration: 0.7, ease: "power2.in" }, 1.1)
        .to(rings, { autoAlpha: 0, duration: 0.25 }, 1.6);
      if (options.to) tl.fromTo(stage, { "--fx-bg": css(options.from || "--kf-bg") || "transparent" }, { "--fx-bg": css(options.to) || "transparent", duration: 1.2 }, 0.5);
      if (next) tl.fromTo(next, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" }, 1.75);
      return () => { gsap.set([world, rings, next, stage].filter(Boolean), { clearProps: "all" }); };
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (next) gsap.set(next, { autoAlpha: 1 });
      return () => next && gsap.set(next, { clearProps: "all" });
    });
    return () => { mm.revert(); rings.remove(); };
  });
})();
