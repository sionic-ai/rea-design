(() => {
  // When the panel fully covers the screen, play the video from the start and pause scroll until it ends, loops once, or Skip is pressed (once only).
  // Skip slides down to the panel’s bottom edge over dur seconds. Progress is exposed as --fx-progress (0~1), which the progress circle reads.
  kfFx.register("lock-play-video", (el, { options, reduce, scroller }) => {
    const video = el.querySelector('[data-fx-part="video"]');
    if (!video) return;
    const dock = el.querySelector('[data-fx-part="dock"]');
    if (reduce) { video.controls = true; return; }
    const dur = +(options.dur ?? 2);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const lockOn = options.lock !== "false";
    const root = document.documentElement;
    const lenis = window.lenis && typeof window.lenis.stop === "function" ? window.lenis : null;
    let locked = false, consumed = false, last = 0, raf = 0, scrollTween = null;
    if (dock) dock.inert = true;

    const tick = () => {
      if (video.paused || video.ended) return void (raf = 0);
      if (video.duration) el.style.setProperty("--fx-progress", String(video.currentTime / video.duration));
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      if (!raf) raf = requestAnimationFrame(tick);
      if (!lockOn || consumed || locked) return;
      locked = true;
      last = video.currentTime;
      if (dock) dock.inert = false;
      el.classList.add("is-locked");
      lenis ? lenis.stop() : (root.style.overflow = "hidden");
      el.dispatchEvent(new CustomEvent("fx:lock", { bubbles: true }));
    };
    const unlock = () => {
      if (!locked) return;
      locked = false;
      consumed = true;
      if (dock) { dock.inert = true; dock.classList.add("is-done"); }
      el.classList.remove("is-locked");
      lenis ? lenis.start() : (root.style.overflow = "");
      el.dispatchEvent(new CustomEvent("fx:unlock", { bubbles: true }));
    };
    const onTime = () => {
      if (locked && video.duration && video.currentTime + video.duration * 0.5 < last) unlock();
      last = video.currentTime;
    };
    const skip = () => {
      if (!locked) return;
      unlock();
      const box = scroller || null;
      const now = box ? box.scrollTop : scrollY;
      const to = now + el.getBoundingClientRect().bottom - (box ? box.getBoundingClientRect().top : 0);
      if (lenis && !box) return void lenis.scrollTo(to, { duration: dur, easing: gsap.parseEase(ease) });
      const o = { y: now };
      scrollTween = gsap.to(o, { y: to, duration: dur, ease, onUpdate: () => (box ? (box.scrollTop = o.y) : window.scrollTo(0, o.y)) });
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", unlock);
    video.addEventListener("error", unlock);
    dock?.addEventListener("click", skip);

    // When the panel’s top edge touches the screen top it plays from the start, going back above it stops and returns to the start — original play(0)·pause(0)
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top top", end: "bottom top",
      onEnter: () => { video.currentTime = 0; video.play().catch(() => {}); },
      onLeaveBack: () => { video.pause(); video.currentTime = 0; },
      onLeave: () => video.pause(),
      onEnterBack: () => video.play().catch(() => {}),
    });

    return () => {
      st.kill();
      scrollTween?.kill();
      cancelAnimationFrame(raf);
      if (locked) { lenis ? lenis.start() : (root.style.overflow = ""); }
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", unlock);
      video.removeEventListener("error", unlock);
      dock?.removeEventListener("click", skip);
      if (dock) { dock.inert = false; dock.classList.remove("is-done"); }
      el.classList.remove("is-locked");
      el.style.removeProperty("--fx-progress");
    };
  });
})();
