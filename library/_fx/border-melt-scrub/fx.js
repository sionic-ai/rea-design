(() => {
  // The thick transparent border of the sticky panel melts to 0 tied to scroll, and the blur of the inner photo deepens from 0 to the css value.
  // The border area is transparent so the page background shows through — the panel expands from a framed card on the background into a full-screen background.
  kfFx.register("border-melt-scrub", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const photo = el.querySelector('[data-fx-part="photo"]');
    const narrow = matchMedia("(max-width: 768px)").matches;
    const border = narrow ? +(options["border-narrow"] ?? 50) : +(options.border ?? 100);
    const radius = options.radius ?? "0px";
    const scrub = options.scrub === undefined || options.scrub === "true" ? true : +options.scrub;
    const st = { trigger: el, start: options.start || "top center", end: options.end || "top top", scrub, scroller: scroller || undefined };
    const before = el.style.cssText;
    el.style.borderStyle = "solid";
    el.style.borderColor = "transparent";
    el.style.boxSizing = "border-box";
    if (reduce) { el.style.borderWidth = "0px"; return () => { el.style.cssText = before; }; }
    const open = gsap.fromTo(el, { borderWidth: border, borderRadius: radius }, { borderWidth: 0, borderRadius: 0, ease: "none", scrollTrigger: st });
    const blur = photo ? gsap.from(photo, { filter: "blur(0px)", ease: "none", scrollTrigger: { ...st } }) : null;
    return () => {
      open.scrollTrigger?.kill(); open.kill();
      blur?.scrollTrigger?.kill(); blur?.kill();
      if (photo) gsap.set(photo, { clearProps: "filter" });
      el.style.cssText = before;
    };
  });
})();
