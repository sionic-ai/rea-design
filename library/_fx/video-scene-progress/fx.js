// While the video plays, tie the progress line to video time, raise the scene number every scene seconds, and bring that turn’s photo to the top — requestVideoFrameCallback is used to measure every frame
(() => {
  kfFx.register("video-scene-progress", (el, { options, reduce }) => {
    const video = el.querySelector('[data-fx-part="video"]') || el.querySelector("video");
    if (!video) return;
    const bar = el.querySelector('[data-fx-part="bar"]');
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    const scene = +options.scene || 5;
    const tail = +(options.tail ?? 0.6);
    const FRAME = 1 / (+options.fps || 24);
    el.style.setProperty("--fx-zoom", +(options.zoom ?? 1.5));
    el.style.setProperty("--fx-dur", +(options.dur ?? scene) + "s");
    let current = -1, last = 0, off = false;
    const show = (n) => {
      if (n === current) return;
      current = n;
      if (slides.length) slides.forEach((s, i) => s.classList.toggle("fx-on", i === n % slides.length));
      el.dataset.fxScene = n;
      el.dispatchEvent(new CustomEvent("fx:scene", { bubbles: true, detail: { scene: n } }));
    };
    const next = (fn) => (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(fn) : requestAnimationFrame(fn));
    const tick = () => {
      if (off) return;
      const t = video.currentTime, d = video.duration;
      if (d) {
        show(t + FRAME > d ? 0 : Math.floor((t + FRAME) / scene));
        const p = t / Math.max(0.001, d - tail);
        if (bar) {
          bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
          if (p >= 1) bar.classList.add("fx-rewind");
          if (last > t) bar.classList.remove("fx-rewind");
        }
      }
      last = t;
      next(tick);
    };
    show(0);
    if (!reduce) next(tick);
    else video.pause?.();
    return () => {
      off = true;
      slides.forEach((s) => s.classList.remove("fx-on"));
      if (bar) { bar.style.transform = ""; bar.classList.remove("fx-rewind"); }
      delete el.dataset.fxScene;
      el.style.removeProperty("--fx-zoom");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
