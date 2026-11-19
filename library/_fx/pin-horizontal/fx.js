(() => {
  kfFx.register("pin-horizontal", (el, { options, reduce, scroller }) => {
    const view = el.querySelector('[data-fx-part="view"]'), track = el.querySelector('[data-fx-part="track"]');
    if (!view || !track) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const from = options.from != null ? +options.from : 751;
    // If sm is given, at that width and below use sm-end · sm-scrub — for cases where the original sets a fixed distance and follow separately on phones (Brand: phone 10w · .1, PC 1.5w · .65)
    const sm = options.sm != null ? +options.sm : 0;
    const pin = (end, scrub) => {
      // shift: inset — the band is based on screen width and stops leaving the window’s left margin on the right too (Brand). The default is the width overflowing the window
      // shift: step — first step width × (number of steps − 1) (when the original pushed by blocks[0].offsetWidth × (n − 1) — Brand home 1146 × 5)
      const stepEls = () => track.querySelectorAll('[data-fx-part="step"]');
      const dist = () => options.shift === "inset"
        ? Math.max(0, track.scrollWidth - innerWidth + 2 * view.getBoundingClientRect().left)
        : options.shift === "step" && stepEls().length > 1
          ? stepEls()[0].offsetWidth * (stepEls().length - 1)
          : Math.max(0, track.scrollWidth - view.clientWidth);
      // end: track — the fixed distance becomes band width − window height (when the original stretches the section height to the band width and pins it with sticky). end: width keeps the band width as is.
      // end: <n>If w, n times the window width (when the original fixes the distance at offsetWidth × n). The default is 1:1 with the pushed distance
      const times = /^[\d.]+w$/.test(end || "") ? parseFloat(end) : 0;
      const span = () => (end === "track" ? Math.max(1, track.scrollWidth - innerHeight)
        : end === "width" ? Math.max(1, track.scrollWidth)
        : times ? Math.max(1, view.offsetWidth * times) : dist());
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          scroller, trigger: el, start: () => options.start || "100% bottom", end: () => "+=" + span(), scrub: scrub != null ? +scrub : true, pin: true, invalidateOnRefresh: true,
          onUpdate: (self) => el.style.setProperty("--fx-pin-shift", dist() * self.progress + "px"),
        },
      });
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(track);
      return () => { ro.disconnect(); el.style.removeProperty("--fx-pin-shift"); };
    };
    if (sm > 0) {
      mm.add(`(max-width: ${sm}px) and (min-width: ${from}px) and (prefers-reduced-motion: no-preference)`, () => pin(options["sm-end"] || options.end, options["sm-scrub"] ?? options.scrub));
      mm.add(`(min-width: ${Math.max(from, sm + 1)}px) and (prefers-reduced-motion: no-preference)`, () => pin(options.end, options.scrub));
    } else {
      mm.add(`(min-width: ${from || 0}px) and (prefers-reduced-motion: no-preference)`, () => pin(options.end, options.scrub));
    }
    // narrow: fade — in windows narrower than from, don’t push the section, pin it and swap the stacked step children in turn (Brand site phone: for screen height × number of sections, scrub .3,
    // When progress reaches the next section’s share, only that section is turned on with .5s power2.out and the rest are turned off. Overlap positioning is the consuming CSS’s job
    const steps = options.narrow === "fade" ? [...el.querySelectorAll('[data-fx-part="step"]')] : [];
    if (from > 0 && steps.length > 1) {
      mm.add(`(max-width: ${from - 1}px) and (prefers-reduced-motion: no-preference)`, () => {
        const dur = +(options["fade-dur"] ?? 0.5), ease = kfFx.ease(options["fade-ease"] || "power2.out", "power2.out");
        let now = 0;
        gsap.set(steps, { opacity: 0, pointerEvents: "none" });
        gsap.set(steps[0], { opacity: 1, pointerEvents: "auto" });
        const st = ScrollTrigger.create({
          scroller, trigger: el, start: options["fade-start"] || "top top", end: () => "+=" + innerHeight * steps.length, pin: true, scrub: +(options["fade-scrub"] ?? 0.3), invalidateOnRefresh: true,
          onUpdate: (self) => {
            const at = Math.round(self.progress * (steps.length - 1));
            if (at === now) return;
            now = at;
            steps.forEach((s, i) => gsap.to(s, { opacity: i === at ? 1 : 0, pointerEvents: i === at ? "auto" : "none", duration: dur, ease, overwrite: true }));
          },
        });
        return () => { st.kill(); gsap.set(steps, { clearProps: "opacity,pointerEvents" }); };
      });
    }
    return () => mm.revert();
  });
})();
