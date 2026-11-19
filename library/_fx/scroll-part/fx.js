(() => {
  kfFx.register("scroll-part", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const cross = options.mode === "cross";
      const raw = options.dist || (cross ? "50vw" : "75");
      const dist = () => (raw.endsWith("vw") ? (parseFloat(raw) / 100) * innerWidth : +raw * (innerWidth >= 1024 ? 1 : 0.34));
      const gather = options.mode === "gather";
      const scrub = options.scrub ? +options.scrub : true;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        if (cross) {
          // Staggered pass-by: starts from the outer dist, and once the panel head is past the bottom of the screen they approach each other at rate px per 1px of scroll and cross — tied directly to scroll with no end
          const rate = () => (innerWidth > +(options.narrow || 1024) ? +(options.rate ?? 0.8) : +(options["rate-narrow"] ?? 0.2));
          const parts = [...el.querySelectorAll("[data-fx-part=left], [data-fx-part=right]")];
          const place = (st) => {
            const moved = rate() * st.progress * (st.end - st.start);
            parts.forEach((s) => gsap.set(s, { x: (s.dataset.fxPart === "left" ? -1 : 1) * (dist() - moved) }));
          };
          ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: options.end || "bottom top", onUpdate: place, onRefresh: place });
          return;
        }
        const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: el, start: "top bottom", end: options.end || "bottom top", scrub, invalidateOnRefresh: true } });
        el.querySelectorAll("[data-fx-part=left], [data-fx-part=right]").forEach((s) => {
          const sign = s.dataset.fxPart === "left" ? -1 : 1;
          if (gather) tl.from(s, { x: () => -sign * dist(), ease: "power2.out" }, 0);
          else tl.to(s, { x: () => sign * dist(), ease: "none" }, 0);
        });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
