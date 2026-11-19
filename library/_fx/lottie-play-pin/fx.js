// Brand hero text Lottie — plays the intro frames once (locking scroll meanwhile), then pins the panel to the top edge of the screen and ties the remaining frames to scroll.
// Fixed length is remaining frames × speed px (at least min px). The original sets ScrollTrigger progress directly to that frame (scrub is set but no tween is bound, so progress is plainly proportional)
(() => {
  kfFx.register("lottie-play-pin", (el, { options, reduce, scroller }) => {
    if (!window.lottie || !window.gsap || !window.ScrollTrigger) return;
    const src = options.src;
    if (!src) return;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const intro = Math.max(0, +(options.intro ?? 51)), speed = +(options.speed ?? 40), min = +(options.min ?? 1500);
    const html = document.documentElement, lock = options.lock === "on";
    const emit = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    let anim = null, st = null, finished = false, queued = false, gone = false, before = null;

    const unlock = () => {
      if (lock && before !== null) { html.style.overflow = before; before = null; }
      emit("fx:unlock");
    };
    // The original also doesn’t set up Lottie at 1024 and below, it only releases the lock
    if (!matchMedia(options.media || "all").matches) { unlock(); return; }
    if (lock) { before = html.style.overflow; html.style.overflow = "hidden"; }
    emit("fx:lock");

    // If it’s an #id, stays inside the document <script type="application/json"> Read it when using — the writing side can measure the font and fill in the data later
    const readData = () => {
      if (!src.startsWith("#")) return undefined;
      try { return JSON.parse(document.querySelector(src)?.textContent || "null"); } catch { return null; }
    };
    const finish = () => {
      if (finished || gone) return;
      finished = true;
      anim.goToAndStop(intro, true);
      unlock();
      ScrollTrigger.refresh(true);
      emit("fx:done");
    };
    const playIntro = () => {
      if (!anim || !anim.isLoaded) { queued = true; return; }
      queued = false;
      if (reduce || intro === 0) { finish(); return; }
      anim.goToAndStop(0, true);
      anim.playSegments([0, intro], true);
    };
    const ready = () => {
      if (gone) return;
      const rest = anim.totalFrames - 1 - intro;
      if (reduce) { anim.goToAndStop(Math.min(anim.totalFrames - 1, +(options.rest ?? intro)), true); finish(); return; }
      anim.goToAndStop(0, true);
      if (rest > 0) {
        // scroller only when present — if the key exists, even as undefined, it overrides the default scroller (wrapper) that ScrollSmoother set up, so the pin is held as fixed and the panel rises along with it
        st = ScrollTrigger.create({
          trigger: el, ...(scroller ? { scroller } : {}), pin: true, anticipatePin: 1, scrub: +(options.scrub ?? 1), invalidateOnRefresh: true,
          start: "top top", end: () => "+=" + Math.max(Math.round(rest * speed), min),
          onUpdate: (s) => { if (finished) anim.goToAndStop(intro + s.progress * rest, true); },
        });
      }
      if (queued || options.wait !== "play") playIntro();
    };
    const load = () => {
      if (anim || gone) return;
      const data = readData();
      if (data === null) return;
      anim = lottie.loadAnimation({
        container: stage, renderer: "svg", loop: false, autoplay: false, ...(data ? { animationData: data } : { path: src }),
        rendererSettings: { preserveAspectRatio: options.fit || "xMaxYMax meet" },
      });
      anim.addEventListener("complete", finish);
      anim.isLoaded ? ready() : anim.addEventListener("DOMLoaded", ready);
    };
    // wait: play — like a loader, plays carrying the payload when the side using it fires fx:play after the previous scene ends
    const onPlay = () => { load(); playIntro(); };
    if (options.wait === "play") el.addEventListener("fx:play", onPlay);
    else load();

    return () => {
      gone = true;
      el.removeEventListener("fx:play", onPlay);
      st?.kill(true);
      anim?.destroy();
      if (!finished) unlock();
    };
  });
})();
