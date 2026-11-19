// The rounded photo plate shrinks inward on scroll — the plate (mask) goes from a size inset by from at the element edge to a size inset by to, corners radius → radiusTo (over the first 8/10, sine.out),
// The image inside a plate drifts upward by shift over the full length. It is tied to scroll from when the element’s top reaches screen height (or its spot if already on screen) until the element’s bottom reaches the top of the screen
(() => {
  kfFx.register("inset-shrink-card", (el, { options, reduce, scroller }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    if (!mask) return;
    const image = el.querySelector('[data-fx-part="image"]');
    const from = +(options.from ?? 8), to = +(options.to ?? 72);
    const r0 = +(options.radius ?? 24), r1 = +(options.radiusTo ?? 16), shift = +(options.shift ?? -150);
    const ease = kfFx.ease(options.ease || "sine.out", "sine.out");
    const size = (inset) => ({ width: Math.max(0, el.clientWidth - inset * 2), height: Math.max(0, el.clientHeight - inset * 2) });
    gsap.set(mask, { ...size(from), borderRadius: r0 });
    if (reduce) return () => gsap.set([mask, image].filter(Boolean), { clearProps: "width,height,borderRadius,transform" });
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el, scroller, scrub: options.scrub != null ? +options.scrub : true, invalidateOnRefresh: true,
        start: () => { const top = el.getBoundingClientRect().top + (scroller ? scroller.scrollTop : scrollY); const vh = scroller ? scroller.clientHeight : innerHeight; return `top ${top < vh ? top : vh}`; },
        end: "bottom top",
      },
    });
    tl.fromTo(mask, { width: () => size(from).width, height: () => size(from).height, borderRadius: r0 }, { width: () => size(to).width, height: () => size(to).height, borderRadius: r1, duration: 8, ease }, "start");
    if (image) tl.to(image, { y: shift, duration: 10, ease: "none" }, "start");
    else tl.to({}, { duration: 10 }, "start");
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set([mask, image].filter(Boolean), { clearProps: "width,height,borderRadius,transform" }); };
  });
})();
