(() => {
  // Original (recruit site .cScrollStack): the row sticks 100px from the top of the screen, while the top edge of the next row rises to the same spot
  // The previous row sinks at .9x · transparent (linear), and from .3 into that segment, an 8px blur turns on for .6 (scrub .75). Pinning is wide screens only, blurring applies at all widths
  kfFx.register("sticky-fade-stack", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 2 || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const min = +(options.min ?? 897), scale = +(options.scale ?? 0.9), blur = +(options.blur ?? 8);
    // span: with parent, it measures its own cell (the parent) instead of the next row — shrinks while the cell’s top edge passes −top above the screen top and rises one more screen (original course panel of the reference site)
    const span = options.span || "next", origin = options.origin || "center top";
    const blurAt = +(options["blur-at"] ?? 0.3), blurDur = +(options["blur-dur"] ?? 0.6);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 0.75);
    // top: center — each line pins to screen center at its own height (Brand reason cards — original pin start "center center") · ease — settling curve, default none
    const center = options.top === "center", ease = options.ease || "none";
    if (options.top != null && !center) el.style.setProperty("--fx-top", /[a-z%]$/.test(options.top) ? options.top : options.top + "px");
    const place = () => { if (center) items.forEach((it) => { it.style.top = `${Math.max(0, (innerHeight - it.offsetHeight) / 2)}px`; }); };
    place();
    ScrollTrigger.addEventListener("refreshInit", place);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px)`, () => { el.classList.add("fx-stack-on"); ScrollTrigger.refresh(); return () => el.classList.remove("fx-stack-on"); });
    if (!reduce) mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The sticking position reads css top as is — on narrow screens where it doesn’t stick, uses the default 100px line
      const top = (it = items[0]) => { const v = parseFloat(getComputedStyle(it).top); return Number.isFinite(v) ? v : 100; };
      items.forEach((it, i) => { it.style.zIndex = String(2 + i * 10); gsap.set(it, { transformOrigin: origin, ...(blur > 0 && { filter: "blur(0px)" }) }); });
      if (span === "parent") {
        items.forEach((it) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: it.parentElement, start: () => `top ${-top()}px`, end: () => `+=${innerHeight}`, scrub, invalidateOnRefresh: true, ...(scroller && { scroller }) } })
            .to(it, { scale, autoAlpha: 0, ease: "none", duration: 1 }, 0);
          if (blur > 0) tl.to(it, { filter: `blur(${blur}px)`, ease: "none", duration: blurDur }, blurAt);
        });
        return () => items.forEach((it) => { it.style.zIndex = ""; if (it.isConnected) gsap.set(it, { clearProps: "transform,opacity,visibility,filter" }); });
      }
      items.forEach((it, i) => {
        const next = items[i + 1];
        if (!next) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: it, start: () => `top ${top(it)}px`, endTrigger: next, end: () => `top ${top(next)}px`, scrub, invalidateOnRefresh: true, ...(scroller && { scroller }) } })
          .to(it, { scale, autoAlpha: 0, ease, duration: 1 }, 0);
        if (blur > 0) tl.to(it, { filter: `blur(${blur}px)`, ease: "none", duration: blurDur }, blurAt);
      });
      return () => items.forEach((it) => { it.style.zIndex = ""; if (it.isConnected) gsap.set(it, { clearProps: "transform,opacity,visibility,filter" }); });
    });
    return () => { mm.revert(); ScrollTrigger.removeEventListener("refreshInit", place); if (center) items.forEach((it) => { it.style.top = ""; }); };
  });
})();
