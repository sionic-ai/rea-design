(() => {
  // Opening video curtain — once playback starts, after reveal seconds is-fx-start (video·Skip on), and when it ends or on Skip, is-fx-end (css opens a circular hole)
  kfFx.register("video-hole-loader", (el, { options, reduce }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    const video = media?.querySelector("video") || (media?.tagName === "VIDEO" ? media : null);
    const skip = el.querySelector('[data-fx-part="skip"]');
    const dur = +(options.dur ?? 0.6), reveal = +(options.reveal ?? 0.2), max = +(options.max ?? 0);
    el.style.setProperty("--fx-dur", `${dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    const timers = [];
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      el.classList.add("is-fx-end");
      video?.pause();
      timers.push(setTimeout(() => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })), reduce ? 0 : dur * 1000));
    };
    skip?.addEventListener("click", end);
    if (reduce || !media) end();
    else if (!video) {
      // If it is an image or animation plate instead of video, keep it on and wait for Skip or max (if there is no max, open right away)
      timers.push(setTimeout(() => el.classList.add("is-fx-start"), reveal * 1000));
      if (max > 0) timers.push(setTimeout(end, max * 1000));
      else end();
    } else {
      video.muted = true;
      video.addEventListener("ended", end);
      if (max > 0) timers.push(setTimeout(end, max * 1000));
      const p = video.play();
      if (p && p.then) p.then(() => timers.push(setTimeout(() => el.classList.add("is-fx-start"), reveal * 1000))).catch(end);
    }
    return () => {
      timers.forEach(clearTimeout);
      skip?.removeEventListener("click", end);
      video?.removeEventListener("ended", end);
      el.classList.remove("is-fx-start", "is-fx-end");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-ease");
    };
  });
})();
