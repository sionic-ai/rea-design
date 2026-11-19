(() => {
  kfFx.register("video-end-loader", (el, { options, reduce }) => {
    // Picks one video that fits the window width — data-key="narrow" Items marked with it apply in windows narrower than narrow(px)
    const narrow = innerWidth < (+options.narrow || 601);
    const videos = [...el.querySelectorAll('[data-fx-part="video"]')];
    const video = videos.find((v) => (v.dataset.key === "narrow") === narrow) || videos[0];
    videos.forEach((v) => (v.hidden = v !== video));
    const skip = el.querySelector('[data-fx-part="skip"]');
    let tween, timer, closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      video?.pause();
      // The swing of jQuery fadeOut is the same as sine.inOut
      tween = gsap.to(el, {
        opacity: 0, duration: reduce ? 0 : +(options.out ?? 1.5), ease: kfFx.ease(options.ease || "sine.inOut", "sine.inOut"),
        onComplete: () => { el.style.display = "none"; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); },
      });
    };
    skip?.addEventListener("click", close);
    video?.addEventListener("ended", close);
    // If there is no video or it is blocked, lift after max seconds
    if (reduce) close();
    else if (video?.ended) close();
    else timer = setTimeout(close, +(options.max ?? 10) * 1000);
    if (video && !reduce) video.play?.().catch(() => {});
    return () => {
      clearTimeout(timer);
      tween?.kill();
      skip?.removeEventListener("click", close);
      video?.removeEventListener("ended", close);
      videos.forEach((v) => (v.hidden = false));
      gsap.set(el, { clearProps: "opacity,display" });
    };
  });
})();
