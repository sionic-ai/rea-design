// Home: first appearance (logo letters 1.05s power2.out stagger .09 → at .6s the sentence lines from 110% · 3° over .7s expo.out, showreel y150 1.6s expo.out,
// Menu letters 1.6s expo.out stagger .045), showreel shrink (top 20% → bottom 50%, scrub .8), showreel window player.
(() => {
  const { mm } = window.MN;
  const title = document.querySelector('[data-hero="title"]');
  const video = document.querySelector('[data-hero="video"]');
  const reel = document.querySelector(".reel__layout");

  document.fonts.ready.then(() => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = SplitText.create(title, { type: "lines", linesClass: "mn-hline" });
      const inners = split.lines.map((line) => {
        const inner = document.createElement("span");
        inner.innerHTML = line.innerHTML;
        line.innerHTML = "";
        line.appendChild(inner);
        return inner;
      });
      const logoLs = document.querySelectorAll(".mn-logo__l");
      const navTs = document.querySelectorAll(".mn-roll__text");
      gsap.set(inners, { yPercent: 110, rotate: 3, transformOrigin: "0% 100%", opacity: 0 });
      gsap.set(video, { y: 150, autoAlpha: 0 });
      gsap.set(navTs, { yPercent: 110, autoAlpha: 0 });
      gsap.fromTo(logoLs, { autoAlpha: 0, yPercent: 22 }, { autoAlpha: 1, yPercent: 0, duration: 1.05, stagger: 0.09, ease: "power2.out" });
      gsap.timeline()
        .set(title, { autoAlpha: 1 }, 0.6)
        .to(inners, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: { amount: 0.32 } }, 0.6)
        .to(video, { y: 0, autoAlpha: 1, duration: 1.6, ease: "expo.out" }, 0.6)
        .to(navTs, { yPercent: 0, autoAlpha: 1, duration: 1.6, ease: "expo.out", stagger: 0.045 }, 0.6);

      gsap.to(reel, {
        width: () => document.querySelector(".mn-wrap").offsetWidth,
        borderRadius: "1rem",
        ease: "none",
        scrollTrigger: { trigger: ".reel", start: "top 20%", end: "bottom 50%", scrub: 0.8, invalidateOnRefresh: true },
      });
      return () => split.revert();
    });
    ScrollTrigger.refresh();
  });

  // ── Showreel window: exactly the state rules of the original bunny player — attaches the URL on open (no autoplay), play · pause · seek (moves every 180ms) · sound · fullscreen,
  //    If the hand rests 3s the control bar hides, and when the video ends it rewinds to the start and closes the window. Window size fits inside the overlay at the video’s aspect ratio ──
  const box = document.querySelector(".lightbox");
  const player = box.querySelector("[data-player]");
  const vid = player.querySelector("video");
  const calc = box.querySelector("[data-lightbox-calc]");
  const before = player.querySelector("[data-player-before]");
  const timeline = player.querySelector("[data-player-timeline]");
  const progress = player.querySelector("[data-player-progress]");
  const buffered = player.querySelector("[data-player-buffered]");
  const handle = player.querySelector("[data-player-timeline-handle]");
  const tNow = player.querySelectorAll("[data-player-time-progress]");
  const tAll = player.querySelectorAll("[data-player-time-duration]");
  const set = (k, v) => player.setAttribute(`data-player-${k}`, String(v));
  const fmt = (sec) => { if (!isFinite(sec) || sec < 0) return "00:00"; const t = Math.floor(sec), m = Math.floor((t % 3600) / 60), r = t % 60; return `${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`; };
  const text = (nodes, v) => nodes.forEach((n) => (n.textContent = v));
  let attached = false, raf;

  const clamp = () => {
    if (box.dataset.lightboxStatus !== "active") return;
    const cs = getComputedStyle(box);
    const cw = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ch = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const ratio = vid.videoWidth ? vid.videoWidth / vid.videoHeight : 100 / parseFloat(before.style.paddingTop || 62.5);
    if (cw / ratio <= ch) { calc.style.maxWidth = "100%"; calc.style.maxHeight = `${((cw / ratio) / ch) * 100}%`; }
    else { calc.style.maxHeight = "100%"; calc.style.maxWidth = `${((ch * ratio) / cw) * 100}%`; }
  };
  new ResizeObserver(() => requestAnimationFrame(clamp)).observe(box);
  const ratio = () => { if (vid.videoWidth) { before.style.paddingTop = `${(vid.videoHeight / vid.videoWidth) * 100}%`; clamp(); } };

  const visuals = () => {
    if (!vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    progress.style.transform = `translateX(${pct - 100}%)`;
    handle.style.left = `${Math.min(100, Math.max(0, pct))}%`;
  };
  const loop = () => { visuals(); if (!vid.paused && !vid.ended) raf = requestAnimationFrame(loop); };
  const times = () => { text(tAll, fmt(vid.duration)); text(tNow, fmt(vid.currentTime)); };
  const safePlay = () => { const p = vid.play(); p && p.catch(() => {}); };

  vid.loop = false;
  vid.addEventListener("loadedmetadata", () => { times(); ratio(); if (player.dataset.playerActivated !== "true" && player.dataset.playerStatus === "idle") set("status", "ready"); });
  vid.addEventListener("timeupdate", times);
  vid.addEventListener("durationchange", times);
  vid.addEventListener("progress", () => { if (vid.duration && vid.buffered.length) buffered.style.transform = `translateX(${(vid.buffered.end(vid.buffered.length - 1) / vid.duration) * 100 - 100}%)`; });
  vid.addEventListener("play", () => { set("activated", true); cancelAnimationFrame(raf); loop(); set("status", "playing"); });
  vid.addEventListener("playing", () => set("status", "playing"));
  vid.addEventListener("pause", () => { cancelAnimationFrame(raf); visuals(); set("status", "paused"); });
  vid.addEventListener("waiting", () => set("status", "loading"));
  vid.addEventListener("ended", () => {
    cancelAnimationFrame(raf); visuals(); set("activated", false); vid.currentTime = 0;
    if (document.fullscreenElement) document.exitFullscreen();
    close();
  });

  const toggle = () => { if (vid.paused || vid.ended) { set("status", "loading"); safePlay(); } else vid.pause(); };
  const fs = () => (document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen && player.requestFullscreen());
  document.addEventListener("fullscreenchange", () => { set("fullscreen", !!document.fullscreenElement); wake(); });
  player.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-player-control]");
    if (!btn) return;
    const type = btn.dataset.playerControl;
    if (type === "playpause") toggle();
    else if (type === "mute") { vid.muted = !vid.muted; set("muted", vid.muted); }
    else if (type === "fullscreen") fs();
  });

  // Seek: while dragging, only the bar·time move first, and the actual jump happens once per 180ms
  let dragging = false, wasPlaying = false, target = 0, lastSeek = 0, rect = null;
  const frac = (x) => Math.min(1, Math.max(0, (x - rect.left) / rect.width));
  const preview = (f) => { progress.style.transform = `translateX(${f * 100 - 100}%)`; handle.style.left = `${f * 100}%`; text(tNow, fmt(f * vid.duration)); };
  const seek = (now) => { if (now - lastSeek >= 180) { lastSeek = now; vid.currentTime = target; } };
  const onMove = (e) => { if (!dragging) return; const f = frac(e.clientX); target = f * vid.duration; preview(f); seek(performance.now()); e.preventDefault(); };
  const onUp = () => {
    if (!dragging) return;
    dragging = false; player.setAttribute("data-timeline-drag", "false"); rect = null; vid.currentTime = target;
    wasPlaying ? safePlay() : (visuals(), times());
    removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp);
  };
  timeline.addEventListener("pointerdown", (e) => {
    if (!vid.duration) return;
    dragging = true; wasPlaying = !vid.paused && !vid.ended; if (wasPlaying) vid.pause();
    player.setAttribute("data-timeline-drag", "true"); rect = timeline.getBoundingClientRect();
    const f = frac(e.clientX); target = f * vid.duration; preview(f); seek(performance.now());
    addEventListener("pointermove", onMove, { passive: false }); addEventListener("pointerup", onUp, { passive: true });
    e.preventDefault();
  });

  // Hide the control bar when the hand rests for 3s
  let idle;
  const wake = () => { set("hover", "active"); clearTimeout(idle); idle = setTimeout(() => set("hover", "idle"), 3000); };
  const inside = (e) => { const r = player.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) wake(); };
  player.addEventListener("pointerdown", wake);
  player.addEventListener("pointerenter", () => { wake(); addEventListener("pointermove", inside, { passive: true }); });
  player.addEventListener("pointerleave", () => { set("hover", "idle"); clearTimeout(idle); removeEventListener("pointermove", inside); });

  const open = () => {
    box.dataset.lightboxStatus = "active";
    clamp();
    if (!attached) { set("activated", false); set("status", "idle"); vid.preload = "auto"; vid.src = vid.dataset.playerSrc; attached = true; }
    else { if (!vid.paused) vid.pause(); set("activated", false); set("status", "paused"); }
  };
  function close() {
    box.dataset.lightboxStatus = "not-active";
    const played = vid.played && vid.played.length && vid.played.end(0) > 0;
    if (!vid.paused && !vid.ended) vid.pause();
    set("activated", false);
    set("status", played ? "paused" : "idle");
  }
  const opener = document.querySelector("[data-lightbox-open]");
  opener.addEventListener("click", open);
  opener.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open()));
  box.querySelectorAll("[data-lightbox-close]").forEach((el) => el.addEventListener("click", close));
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
