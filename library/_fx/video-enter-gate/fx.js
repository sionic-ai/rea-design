// Entrance gate covering the screen — a video (one picked at random from a list, silent, looping) plays behind it, a wordmark in the center, Enter below.
// Clicking anywhere on the door lifts it in .5s (power1.out), and once lifted it does not show again for days days. ?opening in the address=If true, always shown.
(() => {
  kfFx.register("video-enter-gate", (el, { options, reduce }) => {
    const key = options.key || "fx-video-enter-gate";
    const days = +(options.days ?? 1), dur = reduce ? 0 : +(options.dur ?? 0.5);
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    const forced = new URLSearchParams(location.search).get("opening") === "true";
    let seen = 0;
    try { seen = Number(localStorage.getItem(key) || 0); } catch {}
    if (!forced && days > 0 && Date.now() - seen < days * 864e5) {
      el.classList.add("is-gone");
      return () => el.classList.remove("is-gone");
    }
    const video = el.querySelector('video[data-fx-part="video"]') || el.querySelector("video");
    if (video) {
      const narrow = matchMedia(`(max-width: ${+(options.narrow ?? 767)}px)`).matches;
      const list = ((narrow && video.dataset.srcNarrow) || video.dataset.srcs || "").split(",").map((s) => s.trim()).filter(Boolean);
      if (list.length) video.src = list[Math.floor(Math.random() * list.length)];
      Object.assign(video, { muted: true, loop: true, playsInline: true, autoplay: true });
      video.play?.().catch(() => {});
    }
    const root = document.documentElement;
    const lock = options.lock !== "false";
    if (lock) root.classList.add("fx-gate-lock");
    el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      try { localStorage.setItem(key, String(Date.now())); } catch {}
      root.classList.remove("fx-gate-lock");
      el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true }));
      gsap.to(el, { opacity: 0, duration: dur, ease, onComplete: () => { el.classList.add("is-gone"); video?.pause?.(); } });
    };
    el.addEventListener("click", close);
    const onKey = (e) => { if ((e.key === "Enter" || e.key === "Escape") && el.isConnected) close(); };
    addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("click", close);
      removeEventListener("keydown", onKey);
      root.classList.remove("fx-gate-lock");
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "opacity" });
      el.classList.remove("is-gone");
    };
  });
})();
