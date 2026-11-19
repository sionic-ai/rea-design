(() => {
  // Original (a new .js-lottie-bird-hover beside a menu link on a recruiting site): when the pointer enters the link (host), play the Lottie once from frame 0 (no loop),
  // When the pointer leaves, it stops and returns to the first frame. The art is animationData in window.fxLottie[data] or a src address (http only)
  kfFx.register("lottie-hover-play", (el, { options, reduce, hover }) => {
    if (!window.lottie) return;
    const data = options.data && window.fxLottie ? window.fxLottie[options.data] : null;
    if (!data && !options.src) return;
    const host = (options.host && el.closest(options.host)) || el.parentElement;
    if (!host) return;
    // idle: loop — spins endlessly even normally, on hover it restarts from the start (from) and keeps going after the hover ends (Brand toy-cow button)
    const idle = options.idle === "loop";
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: idle || options.loop === "true", autoplay: idle && !reduce, ...(data ? { animationData: data } : { path: options.src }) });
    const speed = +(options.speed ?? 1);
    a.setSpeed(speed || 1);
    // from: when the pointer arrives, playback starts from this frame (earlier frames are a resting image) · min: if the window is narrower than this, pointer response is turned off (original innerWidth < if 1024, return)
    const from = +(options.from ?? 0), min = +(options.min ?? 0);
    // leave: pause — when the pointer leaves it stops on that frame, and resumes from there on return (the head-turning logo of Brand)
    const keep = options.leave === "pause";
    // leave: finish — even if the pointer leaves, it finishes one full turn and stops on the first frame. If it returns mid-turn it does not restart from the beginning (Brand footer logo: onHoverStart → play, onLoopComplete → stop)
    const finish = options.leave === "finish";
    if (finish) a.addEventListener("complete", () => a.goToAndStop(0, true));
    // leave: reverse — entering plays start→end, leaving plays end→start in reverse (brand button arrow: playSegments([0, total]) · ([total, 0]), both start by jumping straight to that frame)
    const back = options.leave === "reverse";
    // step: a graphic that chains same-length variations in one file — each time the hand arrives, it plays the next segment (step frames) once from the start and stops on that segment’s last frame (step−1).
    // A new call while spinning is ignored, and it keeps spinning to the end even if the hand leaves (Brand header logo: five variations × 30 frames, goToAndPlay(n·30) → pause at currentTime ≥ n·30+29)
    const step = +(options.step ?? 0);
    let seg = 0, segEnd = -1;
    const onFrame = (e) => { if (segEnd >= 0 && e.currentTime >= segEnd) { a.pause(); segEnd = -1; } };
    if (step > 0) a.addEventListener("enterFrame", onFrame);
    const play = () => {
      if (reduce || innerWidth < min) return;
      if (step > 0) {
        if (segEnd >= 0) return;
        const n = Math.max(1, Math.round(a.totalFrames / step));
        segEnd = seg * step + step - 1;
        a.goToAndPlay(seg * step, true);
        seg = (seg + 1) % n;
        return;
      }
      if (back) { a.playSegments([from, a.totalFrames], true); return; }
      if (finish) { if (a.isPaused) a.goToAndPlay(from, true); return; }
      keep ? a.play() : a.goToAndPlay(from, true);
    };
    const stop = () => {
      if (step > 0) return;
      if (back) { if (!reduce && innerWidth >= min) a.playSegments([a.totalFrames, from], true); return; }
      if (!idle && !finish && innerWidth >= min) keep ? a.pause() : a.goToAndStop(0, true);
    };
    const tap = () => play();
    if (hover) { host.addEventListener("mouseenter", play); host.addEventListener("mouseleave", stop); }
    else host.addEventListener("click", tap);
    // Focus only when it comes from the keyboard — so a button pressed with the mouse taking focus doesn’t replay an animation that already ran (brand floor guide label)
    const focusIn = (e) => { if (e.target.matches?.(":focus-visible")) play(); };
    const focusOut = () => { if (!host.matches(":hover")) stop(); };
    host.addEventListener("focusin", focusIn); host.addEventListener("focusout", focusOut);
    return () => {
      host.removeEventListener("mouseenter", play); host.removeEventListener("mouseleave", stop); host.removeEventListener("click", tap);
      host.removeEventListener("focusin", focusIn); host.removeEventListener("focusout", focusOut);
      a.destroy();
    };
  });
})();
