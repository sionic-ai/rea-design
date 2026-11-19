(() => {
  // Set the section height to just enough for the strip to overflow, keep the inner panel pinned to the screen, and push the strip sideways by the amount scrolled down.
  // As in the original, pushing starts the moment the section’s top edge touches the bottom of the screen (before pinning), and moving down by the band overflow length reaches the last section — tied directly to scroll position, so there is no curve.
  kfFx.register("sticky-hscroll", (el, { options, reduce }) => {
    const sticky = el.querySelector("[data-fx-part=sticky]"), track = el.querySelector("[data-fx-part=track]");
    if (!sticky || !track) return;
    if (reduce) { el.classList.add("is-static"); return () => el.classList.remove("is-static"); }
    // min — narrower than this width (px), cells stack vertically instead of pushing (Brand phone below 769)
    const narrow = options.min ? matchMedia(`(max-width: ${+options.min - 1}px)`) : null;
    // rate: screen — pushes one horizontal screen while one vertical screen is scrolled (Brand: section height = Overflow / screen width × screen height + screen height)
    const screenRate = options.rate === "screen";
    const from = options.start === "pin" ? 0 : 1;
    // To push on to the last cell while pinned, extend the section by one screen height (brand: height = 100vh + band width − 100vw)
    const extra = +(options.extra ?? 0);
    let length = 0, top = 0, raf = 0;
    const measure = () => {
      const stacked = !!narrow?.matches;
      el.classList.toggle("is-stack", stacked);
      if (stacked) { length = 0; el.style.removeProperty("--fx-hscroll-h"); gsap.set(track, { x: 0 }); return; }
      length = Math.max(0, track.scrollWidth - sticky.clientWidth);
      const run = screenRate ? (length / Math.max(1, sticky.clientWidth)) * innerHeight : length;
      el.style.setProperty("--fx-hscroll-h", `${Math.max(run + innerHeight * (screenRate ? 1 + extra : extra), innerHeight)}px`);
      top = el.getBoundingClientRect().top + scrollY;
      update();
    };
    const update = () => {
      raf = 0;
      if (!length) return gsap.set(track, { x: 0 });
      const start = top - sticky.clientHeight * from;
      // until: leave — pushes over the span until the section’s bottom edge leaves the top of the screen (overflow + screen height) (Brand usage flow: ScrollTrigger 0% 100% → 100% 0%)
      const dist = options.until === "leave" ? el.offsetHeight + sticky.clientHeight * from : length;
      const p = screenRate
        ? Math.min(1, Math.max(0, ((scrollY - start) / innerHeight) * sticky.clientWidth / length))
        : Math.min(1, Math.max(0, (scrollY - start) / dist));
      gsap.set(track, { x: -length * p });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const ro = new ResizeObserver(measure);
    ro.observe(track); ro.observe(sticky); ro.observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    narrow?.addEventListener("change", measure);
    measure();
    return () => { ro.disconnect(); removeEventListener("scroll", onScroll); narrow?.removeEventListener("change", measure); el.classList.remove("is-stack"); cancelAnimationFrame(raf); el.style.removeProperty("--fx-hscroll-h"); gsap.set(track, { clearProps: "transform" }); };
  });
})();
