(() => {
  // While scrolling down a long track, scrubs a pinned video by scroll position — uses ScrollyVideo 0.0.24 as is.
  // The hand-built currentTime chasing inertia (follows the target time at 8x playback speed) and WebCodecs frame drawing differ, so the feel changes
  kfFx.register("scroll-video-scrub", (el, { options, reduce, scroller }) => {
    const screen = el.querySelector(":scope > [data-fx-part=screen]");
    const wide = options.src;
    if (!window.ScrollyVideo || !screen || !wide) return;
    const narrowSrc = options["src-narrow"] || wide;
    const narrow = +(options.narrow || 1024);
    const speed = +(options.speed ?? 8);
    const threshold = +(options.threshold ?? 0.1);
    const onWindow = !scroller;
    let sv = null, cur = "", timer = 0;

    // For an inner scroll panel, instead of ScrollyVideo’s window scroll tracking, measure inside the panel with the same formula (-top / (height - visible height))
    const progress = () => {
      const r = el.getBoundingClientRect(), box = scroller.getBoundingClientRect();
      return Math.min(1, Math.max(0, -(r.top - box.top) / (r.height - scroller.clientHeight)));
    };
    const follow = () => sv?.setVideoPercentage(progress());

    const ready = (error) => el.dispatchEvent(new CustomEvent("fx:ready", { detail: { error } }));
    const toEnd = () => sv?.setVideoPercentage(1, { jump: true });
    const mount = () => {
      const src = innerWidth <= narrow ? narrowSrc : wide;
      if (src === cur) return;
      sv?.destroy();
      cur = src;
      sv = new ScrollyVideo({
        scrollyVideoContainer: screen,
        src,
        transitionSpeed: speed,
        frameThreshold: threshold,
        trackScroll: onWindow && !reduce,
        // file:// can’t be read by fetch so decoding ends in an error — then it falls back to the same library’s video seek path
        useWebCodecs: location.protocol !== "file:",
        onReady: () => (reduce ? toEnd() : !onWindow && follow()),
      });
      const v = sv.video;
      if (reduce) v.addEventListener("loadedmetadata", toEnd, { once: true });
      else if (!onWindow) v.addEventListener("loadedmetadata", follow, { once: true });
      // Signal the loader waits for: the original waited for video.readyState 3 or higher (canplay)
      v.addEventListener("canplay", () => ready(false), { once: true });
      v.addEventListener("error", () => ready(true), { once: true });
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(mount, 300);
    };

    mount();
    addEventListener("resize", onResize);
    if (!onWindow && !reduce) scroller.addEventListener("scroll", follow, { passive: true });
    return () => {
      clearTimeout(timer);
      removeEventListener("resize", onResize);
      scroller?.removeEventListener("scroll", follow);
      sv?.destroy();
      sv = null;
    };
  });
})();
