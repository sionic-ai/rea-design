(() => {
  // When hands are off for 5 seconds the page scrolls down slowly by itself at 30px per second — it stops on any wheel · touch · press · key and counts 5 seconds again. Stops on reaching the end or when the tab is hidden.
  // Scroll with ScrollSmoother if present, else the inner panel (data-fx-scroller) if inside one, else the window
  kfFx.register("idle-auto-scroll", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const min = +(options.min ?? 769);
    if (innerWidth < min) return;
    const idle = +(options.idle ?? 5) * 1000, speed = +(options.speed ?? 30);
    // With per: frame, speed is px moved per frame (if grow is given and window width/grow is larger, that is used), resume is the time before flowing again after interaction,
    // follow: with wheel, flows in the last wheel direction (up if scrolled up), stop: with wheel, only the wheel counts as a stop (Brand site)
    const perFrame = options.per === "frame", grow = +options.grow || 0;
    const resume = options.resume != null ? +options.resume * 1000 : idle;
    const follow = options.follow === "wheel";
    let dir = 1, first = true;
    const sm = () => window.ScrollSmoother?.get?.();
    // Even with ScrollSmoother, position is read from the window scroll value — smoother.scrollTop() is the trailing position, so using it would pull other scrolls back.
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    const max = () => (window.ScrollTrigger ? ScrollTrigger.maxScroll(sm() ? sm().wrapper() : scroller || window) : (scroller ? scroller.scrollHeight - scroller.clientHeight : document.documentElement.scrollHeight - innerHeight));
    const go = (y) => (sm() ? sm().scrollTo(y, false) : scroller ? (scroller.scrollTop = y) : scrollTo(0, y));
    let raf = 0, wait = 0, last = 0, y = 0;
    const step = (now) => {
      if (document.hidden) return stop();
      const m = max();
      if (dir > 0 ? pos() >= m - 1 : pos() <= 0) return stop();
      const dt = Math.min(0.05, Math.max(0, (now - (last || now)) / 1000));
      last = now;
      // Positions moved by the scrollbar, keys or other scripts are accepted as is and continued from there (the original also adds from the current position each frame) — decimal places are accumulated separately
      if (Math.abs(pos() - y) > 3) y = pos();
      const step1 = perFrame ? Math.max(speed, grow ? innerWidth / grow : 0) : speed * dt;
      y = Math.max(0, Math.min(m, y + step1 * dir));
      go(y);
      raf = requestAnimationFrame(step);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
    const arm = (e) => {
      if (follow && e?.type === "wheel") dir = e.deltaY < 0 ? -1 : 1;
      stop(); clearTimeout(wait);
      wait = setTimeout(() => { y = pos(); el.dispatchEvent(new CustomEvent("fx:auto", { bubbles: true })); raf = requestAnimationFrame(step); }, first ? idle : resume);
      first = false;
    };
    const ev = options.stop === "wheel" ? ["wheel"] : ["wheel", "touchstart", "touchmove", "pointerdown", "mousedown", "keydown"];
    ev.forEach((e) => addEventListener(e, arm, { passive: true }));
    document.addEventListener("visibilitychange", arm);
    arm();
    return () => { stop(); clearTimeout(wait); ev.forEach((e) => removeEventListener(e, arm)); document.removeEventListener("visibilitychange", arm); };
  });
})();
