(() => {
  // In the original this runs only when both the mark added by a ScrollMagic scene (triggerHook .9, doesn’t reverse) and the image being loaded are present — once, when it crosses the hook-ratio line from the top of the screen
  kfFx.register("zoom-settle-in", (el, { options, reduce, scroller }) => {
    const media = el.querySelector(':scope > [data-fx-part="media"]') || el.firstElementChild;
    if (!media) return;
    const marked = !media.hasAttribute("data-fx-part");
    if (marked) media.setAttribute("data-fx-part", "media");
    const hook = Math.min(1, Math.max(0, +(options.hook ?? 0.9)));
    let io = null;
    const ready = () => {
      if (media.tagName === "IMG" && !media.complete) return new Promise((r) => media.addEventListener("load", r, { once: true }));
      return Promise.resolve();
    };
    const show = () => ready().then(() => el.isConnected && el.classList.add("is-fx-in"));
    if (reduce) el.classList.add("is-fx-in");
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(); io.disconnect(); } }), { root: scroller || null, rootMargin: `0px 0px -${((1 - hook) * 100).toFixed(2)}% 0px` });
      io.observe(el);
    }
    return () => { io?.disconnect(); el.classList.remove("is-fx-in"); if (marked) media.removeAttribute("data-fx-part"); };
  });
})();
