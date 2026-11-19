(() => {
  // A pill-shaped photo window stays pinned to the panel and, with scroll, widens enough to overflow the screen as its corners go to 0 — the window lags with scrub 1, the inner image stays at plain scrub going 1.3 → 1
  kfFx.register("pill-widen-pin", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame || !window.ScrollTrigger) return;
    const image = el.querySelector('[data-fx-part="image"]');
    // ratio: css — Reads the initial window ratio from the window’s CSS aspect-ratio (a site with a different ratio per width: Brand phone 9:16)
    const cssRatio = () => { const [w, h] = getComputedStyle(frame).aspectRatio.split("/").map(parseFloat); return w && h ? w / h : 16 / 9; };
    const ratio = () => (options.ratio === "css" ? cssRatio() : +(options.ratio || 16 / 9)), scrub = +(options.scrub ?? 1);
    const wide = { width: options.to || "110%", height: options.height || "110vh" };
    const narrow = { width: options["to-sp"] || "100%", height: options["height-sp"] || "100svh" };
    const zoom = +(options.zoom ?? 1.3);
    // end — length it stays pinned (ScrollTrigger style). If omitted, the section height. image-scrub — delay of the inner image (seconds), if omitted it follows scroll exactly
    const pinEnd = options.end ? { end: options.end } : {};
    const imgScrub = options["image-scrub"] != null ? +options["image-scrub"] : true;
    if (reduce) return;
    const mm = gsap.matchMedia();
    const build = (end) => {
      gsap.fromTo(frame, { height: () => `${frame.clientWidth / ratio()}px` }, { ease: "none", ...end, borderRadius: "0vw", scrollTrigger: { trigger: el, scroller, start: "top top", ...pinEnd, pin: true, scrub, invalidateOnRefresh: true } });
      if (image) gsap.fromTo(image, { scale: zoom }, { ease: "none", scale: 1, scrollTrigger: { trigger: el, scroller, start: "top top", ...pinEnd, scrub: imgScrub, invalidateOnRefresh: true } });
    };
    mm.add("(min-width: 1025px)", () => build(wide));
    mm.add("(max-width: 1024px)", () => build(narrow));
    return () => mm.revert();
  });
})();
