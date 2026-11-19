// Measure start and end boxes against the parent section and grow by width and height — scaling would enlarge the text inside too
(() => {
  kfFx.register("scroll-expand", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const host = el.offsetParent || el.parentElement;
      const to = (options.to && document.querySelector(options.to)) || host.closest("section")?.nextElementSibling;
      if (!to) return;
      const tilt = () => (innerWidth >= 1024 ? +(options.tilt ?? 14) : +(options.tilt ?? 14) * 0.57);
      const r0 = getComputedStyle(el).borderRadius;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(el, { left: el.offsetLeft, right: "auto" });
        const s = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
        const top = () => to.getBoundingClientRect().top - host.getBoundingClientRect().top;
        gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { scroller, trigger: host, start: "top top", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } })
          .fromTo(el, { x: 0, y: 0, width: s.w, height: s.h, rotate: tilt, borderRadius: r0 },
            { x: () => -s.x, y: () => top() - s.y, width: () => to.offsetWidth, height: () => to.offsetHeight, rotate: 0, borderRadius: 0, duration: 0.5 });
      });
      if (reduce) gsap.set(el, { rotate: 0 });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
