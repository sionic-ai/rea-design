// Home: draws a character alpha video on a canvas over the room video — loops the input clip for over 17 seconds, plays one of rhythm·stretch, then goes back to input.
// Over the character image (that point’s alpha > /  10) only shows the circle cursor, on press, as the look-back clip passes 50%, the right drawer pops in with elastic.out(1,.62) 1.25s, and
// The room slides over by half the drawer width over 1s (on phones it rises from below). Night (21:00~4:00 or ?mode=night) has a sleeping still image + a night look-back clip.
// Loader: only on the first home entry of the session — waits for load and canvas size (max 8s), after .5s the orange curtain goes 1→.5 (.8s) · text from .4s .15 apart · stays 3.5s then vanishes in .8s.
(() => {
  const reduced = MS.reduced;
  const TYPING = "media/typing", IDLES = ["media/rhythm", "media/stretching"], CLICK = "media/click-pose";
  const SLEEP = "media/character-sleep.png", NIGHT_CLICK = "media/night-click-pose";
  const IDLE_AFTER = 17000, PLAY_CHECK = 500, MOVE_GAP = 100, READY = 2, ALPHA = 10, DRAWER_AT = 0.5;
  const E = "elastic.out(1, 0.62)", DRAWER = 1.25;
  let loaderShown = false;

  const isNight = () => {
    const mode = new URLSearchParams(location.search).get("mode");
    if (mode === "night") return true;
    if (mode === "afternoon") return false;
    const h = new Date().getHours();
    return h >= 21 || h < 4;
  };
  // Remove the elements for the inactive day or night side, then set the address on what remains and play
  const pickTime = (root) => {
    const now = isNight() ? "night" : "afternoon";
    root.querySelectorAll("[data-time]").forEach((el) => el.dataset.time !== now && el.remove());
    const videos = new Set();
    root.querySelectorAll("[data-time-src]").forEach((el) => {
      el.src = el.dataset.timeSrc;
      const v = el.tagName === "VIDEO" ? el : el.closest("video");
      if (v) videos.add(v);
    });
    videos.forEach((v) => { v.load(); v.play().catch(() => {}); });
  };

  const isVideo = (el) => el.tagName === "VIDEO";
  const clip = (src, preload) => {
    const v = document.createElement("video");
    Object.assign(v, { src: `${src}.webm`, muted: true, defaultMuted: true, playsInline: true, preload });
    v.load();
    return v;
  };
  const warm = (v) => { if (v.preload !== "auto") { v.preload = "auto"; v.load(); } };
  const ready = (el) => (isVideo(el) ? el.readyState >= READY : el.complete && el.naturalWidth > 0);
  const sizeOf = (el) => (isVideo(el) ? { width: el.videoWidth, height: el.videoHeight } : { width: el.naturalWidth, height: el.naturalHeight });

  const character = (canvas) => {
    const g2d = canvas.getContext("2d", { willReadFrequently: true });
    const night = isNight();
    const typing = night ? null : clip(TYPING, "auto");
    const idles = night ? [] : IDLES.map((s) => clip(s, "metadata"));
    const loops = typing ? [typing, ...idles] : [];
    const still = night ? Object.assign(new Image(), { src: SLEEP }) : null;
    const click = clip(night ? NIGHT_CLICK : CLICK, "metadata");
    const home = canvas.closest(".home__contents");
    const stage = canvas.closest(".home__video");
    const side = home && home.querySelector(".side");
    const sleepIcon = home && home.querySelector(".sleep");
    const room = home && home.querySelector(".room video");
    const sticker = home && home.querySelector(".side__sticker-ink");
    const cursor = home && MS.stalker(home.querySelector("[data-stalker]"));
    const mobile = MS.isMobile();
    let cur = night ? still : loops[0];
    let raf = 0, lastPlay = 0, since = performance.now(), lastMove = 0, drawer = null, pending = false;

    const unlock = () => document.body.classList.remove("is-scroll-locked");
    const swap = (next) => {
      if (isVideo(cur)) { cur.pause(); cur.currentTime = 0; }
      cur = next;
      if (isVideo(next)) { if (next.currentTime !== 0) next.currentTime = 0; next.play().catch(() => {}); }
    };
    const typingReady = () => (typing && typing.readyState >= READY ? typing : null);
    // If it was not input, make it input. If it was turned to input within 17 seconds, input again. If that was exceeded, pick one of the stored idle clips.
    const nextClip = () => {
      if (cur !== typing) { since = performance.now(); return typingReady(); }
      if (performance.now() - since < IDLE_AFTER) return typingReady();
      const ok = idles.filter((v) => v.readyState >= READY);
      return ok.length ? ok[Math.floor(Math.random() * ok.length)] : typingReady();
    };
    // Map a screen point to a canvas point (cover scale) and check whether that point is on the image
    const onFigure = (e) => {
      if (!canvas.width) return false;
      const r = canvas.getBoundingClientRect();
      const k = Math.max(r.width / canvas.width, r.height / canvas.height);
      const x = Math.round((e.clientX - r.left - (r.width - canvas.width * k) / 2) / k);
      const y = Math.round((e.clientY - r.top - (r.height - canvas.height * k) / 2) / k);
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return false;
      // A video opened via file:// taints the canvas so the points can’t be read — in that case, inside a panel, it is shown as an image (opened over http it is masked with alpha like the original)
      try { return g2d.getImageData(x, y, 1, 1).data[3] > ALPHA; } catch { return true; }
    };
    const greet = () => {
      swap(click);
      if (sleepIcon) gsap.set(sleepIcon, { autoAlpha: 0 });
      if (room) room.pause();
      canvas.style.cursor = "";
      if (cursor) cursor.hide();
      canvas.removeAttribute("role");
      canvas.removeAttribute("aria-label");
      canvas.tabIndex = -1;
      canvas.blur();
    };
    const tryGreet = () => {
      if (cur === click || pending) return;
      if (click.readyState < READY) { warm(click); pending = true; return; }
      greet();
    };
    const onClick = (e) => { if (onFigure(e)) tryGreet(); };
    const onKey = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tryGreet(); } };
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastMove < MOVE_GAP) return;
      lastMove = now;
      const on = onFigure(e) && cur !== click && !pending;
      canvas.style.cursor = on ? "pointer" : "";
      if (cursor) on ? cursor.show(e) : cursor.hide();
    };
    const onLeave = () => { canvas.style.cursor = ""; if (cursor) cursor.hide(); };
    const openDrawer = () => {
      if (drawer || !side) return;
      side.removeAttribute("inert");
      // The original ”be mild today” moving text starts over each time it opens — our text is revealed from the left over 1.2s
      if (sticker) gsap.fromTo(sticker, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: reduced ? 0 : 1.2, ease: "power2.out", delay: 0.4 });
      drawer = gsap.timeline();
      drawer.set(side, { opacity: 1, pointerEvents: "auto" }, 0);
      if (mobile) {
        drawer.fromTo(side, { y: innerHeight - side.getBoundingClientRect().top }, { y: 0, duration: reduced ? 0 : DRAWER, ease: E }, 0);
        drawer.call(unlock);
        return;
      }
      if (stage) drawer.to(stage, { x: -side.offsetWidth / 2, duration: reduced ? 0 : 1, ease: "power3.out" }, 0);
      drawer.fromTo(side, { xPercent: 100 }, { xPercent: 0, duration: reduced ? 0 : DRAWER, ease: E }, 0);
    };
    const watchClick = () => {
      if (cur !== click || drawer) return;
      const { currentTime: t, duration: d } = click;
      if (Number.isFinite(d) && d > 0 && t / d >= DRAWER_AT) openDrawer();
    };
    // When the tab returns from hidden, replay the clips that are paused
    const keepPlaying = (now) => {
      if (now - lastPlay < PLAY_CHECK) return;
      lastPlay = now;
      if (isVideo(cur) && cur.paused && !cur.ended) cur.play().catch(() => {});
    };
    const frame = (now) => {
      if (ready(cur)) {
        const { width, height } = sizeOf(cur);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        g2d.clearRect(0, 0, canvas.width, canvas.height);
        g2d.drawImage(cur, 0, 0, canvas.width, canvas.height);
      }
      if (cur.ended && cur !== click) swap(nextClip() || cur);
      if (pending && click.readyState >= READY) { pending = false; greet(); }
      watchClick();
      keepPlaying(now);
      raf = requestAnimationFrame(frame);
    };
    const warmRest = () => { loops.slice(1).forEach(warm); warm(click); };
    loops.length ? loops[0].addEventListener("playing", warmRest, { once: true }) : warmRest();

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("keydown", onKey);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    if (mobile) document.body.classList.add("is-scroll-locked");
    if (isVideo(cur)) cur.play().catch(() => {});
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (drawer) drawer.kill();
      unlock();
      if (cursor) cursor.destroy();
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      [...loops, click].forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); });
    };
  };

  const runLoader = (root) => {
    const loader = root.querySelector(".loader");
    if (!loader) return;
    if (loaderShown || MS.entered || reduced) return loader.remove();
    loaderShown = true;
    const filter = loader.querySelector(".loader__filter");
    const lines = [...loader.querySelectorAll(".loader__cover p")];
    const canvas = root.querySelector("[data-character-canvas]");
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
    const sized = new Promise((r) => { const t = () => (!canvas || canvas.width ? r() : requestAnimationFrame(t)); t(); });
    Promise.race([Promise.all([loaded, sized]), new Promise((r) => setTimeout(r, 8000))]).then(() => {
      if (!loader.isConnected) return;
      const tl = gsap.timeline({ delay: 0.5 });
      if (filter) tl.to(filter, { opacity: 0.5, duration: 0.8, ease: "power2.out" }, 0);
      if (lines.length) tl.fromTo(lines, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.15 }, 0.4);
      tl.to(loader, { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, "+=3.5").add(() => loader.remove());
    });
  };

  MS.view("home", (container) => {
    pickTime(container);
    const canvas = container.querySelector("[data-character-canvas]");
    const off = canvas ? character(canvas) : null;
    runLoader(container);
    return off;
  });
})();
