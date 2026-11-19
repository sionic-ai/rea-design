(() => {
  // On touch devices only the pressed cell spins, so stop the one that was spinning before
  const playing = new Set();
  kfFx.register("hover-play-line", (el, { options, reduce, hover }) => {
    const video = el.querySelector('[data-fx-part="video"]');
    if (!video || reduce) return;
    const media = el.querySelector('[data-fx-part="media"]') || video.parentElement;
    if (media && getComputedStyle(media).position === "static") media.style.position = "relative";
    const delay = +(options.delay ?? 0.25);
    el.style.setProperty("--fx-delay", `${delay}s`);

    const line = document.createElement("span");
    line.dataset.fxPart = "line";
    line.setAttribute("aria-hidden", "true");
    line.innerHTML = '<span data-fx-part="track"><i data-fx-part="fill"></i></span>' + (options.time === "off" ? "" : '<span data-fx-part="time"><span><b>00:00</b><i>00:00</i></span></span>');
    el.prepend(line);
    const fill = line.querySelector('[data-fx-part="fill"]');
    const time = line.querySelector('[data-fx-part="time"]');
    const cur = time && time.querySelector("b");
    const max = time && time.querySelector("i");
    const fmt = (t) => { const s = Math.floor(t || 0); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

    let want = false, ready = false, on = false, raf = 0;
    const tick = () => {
      const f = video.duration || 0, h = video.currentTime;
      if (cur) cur.textContent = fmt(h);
      if (f > 0) { fill.style.height = `${(h / f) * 100}%`; if (time) time.style.height = `${(1 - h / f) * 100}%`; }
      if (on) raf = requestAnimationFrame(tick);
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      video.pause();
      if (video.getAttribute("src")) { video.removeAttribute("src"); video.load(); }
      el.classList.remove("is-fx-ready", "is-fx-loading", "is-fx-on");
      ready = on = false;
      fill.style.height = "0%";
      if (time) time.style.removeProperty("height");
      playing.delete(kill);
    };
    const play = () => {
      if (!ready || on || !want) return;
      video.currentTime = 0;
      video.play().then(() => {
        el.classList.add("is-fx-on");
        el.classList.remove("is-fx-loading");
        on = true;
        tick();
        if (!want) reset();
      }).catch(() => {});
    };
    // Play once and pause to read the length (prep), then rewind to the start and play again
    const load = () => {
      const src = video.dataset.src || video.getAttribute("src");
      if (!src) return;
      el.classList.add("is-fx-loading");
      video.muted = true;
      video.src = src;
      video.play().then(() => {
        if (!want) return reset();
        video.pause();
        el.classList.add("is-fx-ready");
        ready = true;
        if (max) max.textContent = fmt(video.duration);
        play();
      }).catch(reset);
    };
    const start = () => {
      want = true;
      if (!hover) { playing.forEach((f) => f !== kill && f()); playing.add(kill); }
      ready ? play() : load();
    };
    // If released while loading, it stops after loading finishes (load checks want and clears it)
    const stop = () => { want = false; if (ready) reset(); };
    const kill = () => { want = false; reset(); };
    const onClick = () => { if (!hover && on) stop(); };
    if (hover) { el.addEventListener("pointerenter", start); el.addEventListener("pointerleave", stop); }
    else { el.addEventListener("touchstart", start, { passive: true }); el.addEventListener("click", onClick); }
    return () => {
      kill();
      el.removeEventListener("pointerenter", start);
      el.removeEventListener("pointerleave", stop);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("click", onClick);
      line.remove();
      el.style.removeProperty("--fx-delay");
    };
  });
})();
