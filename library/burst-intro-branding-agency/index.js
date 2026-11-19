// First page — sketch logo spins only when 15% is in view, showreel circular progress, Work strip paging
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  const pmd = document.querySelector(".pmd");
  if (pmd) {
    let inView = false;
    const sync = () => pmd.classList.toggle("is-playing", !reduce.matches && inView && !document.hidden);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(pmd.querySelector(".pmd-scene"));
    document.addEventListener("visibilitychange", sync);
  }

  // Showreel — it is a video slot, so playback time is imitated with a clock (the original uses the timeupdate of a muted autoplay video, 100 − current/duration × 100)
  const video = document.querySelector(".video");
  if (video) {
    const ring = video.querySelector(".video__control-progress");
    const LENGTH = 40600;
    let playing = !reduce.matches, t = 0, last = 0;
    const paint = () => { video.classList.toggle("__paused", !playing); ring.style.strokeDashoffset = String(100 - (t / LENGTH) * 100); };
    // The original ring updates only on video timeupdate (about every 250ms), so paint it at the same tempo
    let painted = 0;
    const tick = (now) => {
      if (playing && !document.hidden) {
        t = (t + Math.min(100, now - (last || now))) % LENGTH;
        if (now - painted >= 250) { painted = now; ring.style.strokeDashoffset = String(100 - (t / LENGTH) * 100); }
      }
      last = now;
      requestAnimationFrame(tick);
    };
    // On replay the video starts playing and the ring stays still until the first timeupdate arrives (original jam ~.39s)
    const resume = () => { playing = true; painted = performance.now() + 140; paint(); };
    video.querySelector(".video__control").addEventListener("click", () => { if (playing) { playing = false; paint(); } else resume(); });
    const sound = video.querySelector(".video__sound");
    sound?.addEventListener("click", () => {
      const on = sound.getAttribute("aria-pressed") !== "true";
      sound.setAttribute("aria-pressed", String(on));
      sound.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
      // The original replays even a paused video when turning sound on
      if (on && !playing) resume();
    });
    paint();
    requestAnimationFrame(tick);
  }

  // Work strip — smooth one-slot steps with arrows (end wraps to start), shows the current slot number
  const pw = document.querySelector(".pw");
  if (pw) {
    const track = pw.querySelector(".pw-track"), now = pw.querySelector(".pw-now");
    const cards = [...track.children];
    const w = () => cards[0].getBoundingClientRect().width;
    const go = (dir) => {
      const max = track.scrollWidth - track.clientWidth - 2;
      let left = track.scrollLeft + dir * w();
      if (left > max + w() / 2) left = 0;
      if (left < -w() / 2) left = max;
      track.scrollTo({ left, behavior: reduce.matches ? "instant" : "smooth" });
    };
    pw.querySelector(".pw-arrow--prev").addEventListener("click", () => go(-1));
    pw.querySelector(".pw-arrow--next").addEventListener("click", () => go(1));
    track.addEventListener("scroll", () => { now.textContent = String(Math.round(track.scrollLeft / w()) + 1).padStart(2, "0"); }, { passive: true });
  }
})();
