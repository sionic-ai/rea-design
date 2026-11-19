(() => {
  // Original euphoria: while the empty span (180lvh) that follows the stage pinned to the screen scrolls down, the central 40%×40% window expands to fill the screen,
  // The photo inside the window shrinks from 1.5× to its own size (scrub 1, no curve). On the recruit band, a 57% dark overlay settles together with the 83%×81% window.
  kfFx.register("window-grow-zoom", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame) return;
    const media = frame.querySelector('[data-fx-part="media"]');
    const shade = el.querySelector('[data-fx-part="shade"]');
    const zoom = +(options.zoom ?? 1.5);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    if (media) gsap.set(media, { scale: zoom });
    if (shade) gsap.set(shade, { autoAlpha: 0 });
    // clip type: measures the window’s initial size (--fx-w · --fx-h) inside the stage and turns it into a px inset — resolves the same way whether given in lvh · rem · %
    const clip = options.look === "clip";
    const inset = () => {
      const stage = frame.parentElement, probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;width:var(--fx-w, 40%);height:var(--fx-h, 40%)";
      stage.append(probe);
      const W = stage.clientWidth, H = stage.clientHeight, w = probe.offsetWidth, h = probe.offsetHeight;
      probe.remove();
      const v = Math.max(0, (H - h) / 2), s = Math.max(0, (W - w) / 2);
      return `inset(${v}px ${s}px ${v}px ${s}px)`;
    };
    const done = () => {
      if (clip) gsap.set(frame, { clipPath: "inset(0px 0px 0px 0px)" });
      else gsap.set(frame, { width: "100%", height: "100%" });
      if (media) gsap.set(media, { scale: 1 });
      if (shade) gsap.set(shade, { autoAlpha: 1 });
    };
    const clear = () => [frame, media, shade].filter(Boolean).forEach((x) => gsap.set(x, { clearProps: "all" }));
    if (reduce) { done(); return clear; }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // From the moment the stage sticks to the top of the screen until the plate’s end touches the bottom of the screen — the original is the following empty cell’s top bottom → bottom bottom
      const st = { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub, invalidateOnRefresh: true };
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: st });
      if (clip) tl.fromTo(frame, { clipPath: inset }, { clipPath: "inset(0px 0px 0px 0px)" }, 0);
      else tl.to(frame, { width: "100%", height: "100%" }, 0);
      if (media) tl.to(media, { scale: 1 }, 0);
      if (shade) tl.to(shade, { autoAlpha: 1 }, 0);
    });
    return () => { mm.revert(); clear(); };
  });
})();
