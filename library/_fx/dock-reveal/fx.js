(() => {
  // Pill nav floating at the bottom of the screen — appears in .3s when the head (after) leaves the screen, and hides again when the tail (until) enters.
  // Header and tail are taken by selector, and if not found that condition is treated as always true (with no header it shows from the start)
  kfFx.register("dock-reveal", (el, { options, scroller }) => {
    const head = options.after === "none" ? null : document.querySelector(options.after || "header");
    const foot = options.until === "none" ? null : document.querySelector(options.until || "footer");
    let headIn = !!head, footIn = false;
    const sync = () => el.classList.toggle("is-shown", !headIn && !footIn);
    const root = scroller || null;
    const watch = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === head) headIn = e.isIntersecting;
        if (e.target === foot) footIn = e.isIntersecting;
      }
      sync();
    }, { root });
    if (head) watch.observe(head);
    if (foot) watch.observe(foot);
    // If at is given, it is driven by scroll amount instead of the header — it appears after scrolling this many px (booking guide panel 10 of Brand)
    const at = options.at != null ? +options.at : null;
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const onScroll = () => { headIn = top() < at; sync(); };
    if (at != null) { src.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
    sync();
    return () => { watch.disconnect(); if (at != null) src.removeEventListener("scroll", onScroll); el.classList.remove("is-shown"); };
  });
})();
