// Home page: hero video scrubbed by scroll (media/hero-*.mp4 placeholder · ScrollyVideo), cover word and phrase fade, staggered wordmark, photo card stacking, loader.
// Original values: video progress = .top as -top/(height - screen) (measured by ScrollyVideo) · video 6.97 seconds at 30fps, PC 16:9 · phone vertical version
//   Cover progress p(0~100) = (screen-top)/(height+screen) · y until 50 = -screen·p·0.002, and toward the back an additional -screen·(p-50)·0.025 (phone ×0.8)
//   Words 15→20 · 20→25, phrases 45→50 · 50→55 (phone 15→25 · 25→30) ranges: opacity 0→1 · y 40→0
//   Wordmark: starts from half a screen width outside, below the screen distance traveled × 0.8 (phone 0.2) · Cards: while the next section goes from below the screen → 10%, the previous section y 0→-20 (cubic out), 0.3s/0.1s power2.out
(() => {
  const { reduced } = window.FD;
  const mobile = () => innerWidth <= 1024;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // ---------- Hero: scrubs an upright video by scroll — same ScrollyVideo 0.0.24 as the original, same defaults (chasing the target time at 8x playback speed) ----------
  const box = document.querySelector(".top__video");
  const bg = document.querySelector(".top__bg");
  let sv = null, src = "", lastDrawn = false;
  const initVideo = () => {
    const next = mobile() ? box.dataset.srcSp : box.dataset.srcPc;
    if (next === src) return;
    sv?.destroy();
    sv = new ScrollyVideo({
      scrollyVideoContainer: box,
      src: next,
      trackScroll: !reduced,
      // Opened via file://, fetch can’t read it and decoding ends in an error — then it falls back to the same library’s video seek path
      useWebCodecs: location.protocol !== "file:",
      onReady: () => reduced && sv.setVideoPercentage(1, { jump: true }),
    });
    if (reduced) sv.video.addEventListener("loadedmetadata", () => sv.setVideoPercentage(1, { jump: true }), { once: true });
    setTimeout(() => {
      sv?.resize();
      box.style.width = "100vw";
      box.style.height = "100vh";
    }, 100);
    src = next;
    lastDrawn = false;
  };
  // Upon entering the cover section, immediately draws the last decoded frame (so the final scene remains even if it stops while chasing the target time)
  const showLastFrame = () => {
    const f = sv?.frames?.[sv.frames.length - 1];
    if (lastDrawn || !f || !sv.canvas) return;
    sv.canvas.width = f.width;
    sv.canvas.height = f.height;
    sv.context.drawImage(f, 0, 0, sv.canvas.width, sv.canvas.height);
    lastDrawn = true;
  };

  // ---------- Cover ----------
  const ov = document.querySelector(".ov");
  const obj = document.querySelector(".ov__obj");
  const fadeIn = (sel, p, a, b) => {
    const el = document.querySelector(sel);
    const o = reduced ? 1 : p < a ? 0 : p > b ? 1 : (p - a) / (b - a);
    gsap.set(el, { opacity: o, y: 40 - 40 * o });
  };
  const updateOverlay = () => {
    const r = ov.getBoundingClientRect();
    const wh = innerHeight;
    const p = ((wh - r.top) / (r.height + wh)) * 100;
    if (p > 0) showLastFrame();
    else lastDrawn = false;
    const speed = 0.025 * (mobile() ? 0.8 : 1);
    const extra = p < 50 ? 0 : wh * Math.max(0, p - 50) * speed;
    const y = -wh * p * 0.002 - extra;
    gsap.set(obj, { y });
    const vy = Math.min(0, -wh * Math.max(0, p) * 0.002 - extra);
    gsap.set([box, bg], { y: vy });
    fadeIn(".ov__w--1", p, 15, 20);
    fadeIn(".ov__w--2", p, 20, 25);
    if (mobile()) { fadeIn(".ov__c1", p, 15, 25); fadeIn(".ov__c2", p, 25, 30); }
    else { fadeIn(".ov__c1", p, 45, 50); fadeIn(".ov__c2", p, 50, 55); }
  };

  // ---------- Wordmark stagger ----------
  const logo1 = document.querySelector(".movie__logo--1");
  const logo2 = document.querySelector(".movie__logo--2");
  const updateLogos = () => {
    const off = innerWidth * 0.5;
    const t = logo1.getBoundingClientRect().top;
    const over = t <= innerHeight ? (innerHeight - t) * (mobile() ? 0.2 : 0.8) : 0;
    gsap.set(logo1, { x: -off + over });
    gsap.set(logo2, { x: off - over });
  };

  // ---------- Photo card stacking ----------
  const items = [...document.querySelectorAll(".gallery__item")];
  const spacer = document.querySelector(".gallery__spacer");
  const updateGallery = () => {
    const wh = innerHeight, start = wh, end = wh * 0.1;
    items.forEach((el, i) => {
      const next = items[i + 1] || spacer;
      const nt = next.getBoundingClientRect().top;
      let ty = 0;
      if (nt <= start && nt >= end) ty = -20 * (1 - Math.pow(1 - (start - nt) / (start - end), 3));
      else if (nt < end) ty = -20;
      const now = gsap.getProperty(el, "y") || 0;
      if (reduced) return gsap.set(el, { y: ty });
      gsap.to(el, { y: ty, duration: Math.abs(ty - now) > 10 ? 0.3 : 0.1, ease: "power2.out", overwrite: true });
    });
  };

  window.FD.onScroll.push(updateOverlay, updateLogos, updateGallery);

  // ---------- Product feature slider: same Swiper values as the original ----------
  // The original bundle loaded only Resize and Observer with the Swiper core, so freeMode and mousewheel values had no effect (stops per section, 0.6s).
  // In the bundle build that holds all modules, passing those two turns on inertial scrolling, so drop them to keep the same feel
  document.querySelectorAll(".product__carousel").forEach(
    (el) =>
      new Swiper(el, {
        loop: false,
        centeredSlides: false,
        slidesPerView: "auto",
        spaceBetween: 0,
        speed: 600,
        touchStartPreventDefault: true,
        touchMoveStopPropagation: true,
        preventClicks: true,
        preventClicksPropagation: true,
        passiveListeners: false,
        touchStartForcePreventDefault: true,
      })
  );

  // ---------- Loader: once the video can play (checked every 0.1 seconds from 0.5 seconds) it lifts in 0.8s · entering by anchor skips it ----------
  const loader = document.querySelector(".fd-loader");
  const hideLoader = () => {
    loader.classList.add("fadeOut");
    setTimeout(() => loader.classList.add("hidden"), 800);
  };
  const waitVideo = () =>
    new Promise((resolve) => {
      const check = () => {
        const v = box.querySelector("video");
        // Even if used with the video file missing, treat load errors as the end so the loader never stays covering forever
        if (v && (v.readyState >= 3 || v.error)) resolve();
        else setTimeout(check, 100);
      };
      setTimeout(check, 500);
    });

  // Like the original, attaches the video 0.2s after load, and swaps the PC·phone video when the width crosses 1024
  addEventListener("load", () => setTimeout(initVideo, 200));
  let resizeT;
  addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(initVideo, 300);
  });
  if (reduced) loader.classList.add("hidden");
  else
    addEventListener("load", () => {
      waitVideo().then(hideLoader);
      if (/^#(about|products|stores)$/.test(location.hash)) hideLoader();
    });
  window.FD.update();
})();
