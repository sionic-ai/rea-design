// Vertical scroll → horizontal journey scene controller (rewritten fresh with the same numbers as the original SceneController).
//  · Scene width ratio desktop [1,1,1.38×6,1] · phone [1,1,2.25×6,1] — total vertical scroll is set by the scene-height ratio and the horizontal row is pushed by that ratio
//  · Horizontal lines follow each frame by 25% of the gap to the target (100% on phone)
//  · Hero, About and Contact scenes (0·1·8) go to the next scene on one wheel tick / one swipe, .4s power4.inOut, steps (2~7) scroll freely
//  · on entering the scene, remove its .ef-scroll and run the CSS entrance (.9s)
(() => {
  const SIZES_PC = [1, 1, 1.38, 1.38, 1.38, 1.38, 1.38, 1.38, 1];
  const SIZES_SP = [1, 1, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 1];
  const FIXED = [0, 1, 8], START_FREE = 2, END_FREE = 7;
  const mqPC = matchMedia("(min-width: 769px)");
  let reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  history.scrollRestoration = "manual";

  const main = document.querySelector(".js-main");
  const splash = document.querySelector(".js-splash");
  const track = document.querySelector(".js-track");
  const scroller = document.querySelector(".js-scroller");
  const header = document.querySelector(".tf-header");
  const clouds = [...document.querySelectorAll(".js-cloud")];
  const scenes = [...document.querySelectorAll("[data-scene]")];
  const indicator = document.querySelector(".js-indicator");
  const N = scenes.length;
  if (window.gsap && window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  const S = {
    sizes: mqPC.matches ? SIZES_PC : SIZES_SP, isSP: !mqPC.matches,
    sH: innerHeight, sW: document.body.clientWidth, totalScroll: 0, containerWidth: 0, startFree: 0, endFree: 0,
    scroll: 0, h: 0, toH: 0, spd: innerWidth < 768 ? 1 : 0.25, cur: 0, prev: 0,
    disable: true, lock: false, cancel: false, prevTouchY: null,
    touch: "ontouchstart" in window && "orientation" in window && navigator.maxTouchPoints > 0,
  };
  mqPC.addEventListener("change", (e) => { S.sizes = e.matches ? SIZES_PC : SIZES_SP; S.isSP = !e.matches; });

  /* 01~09 indicator */
  const dots = [];
  for (let i = 0; i < N; i++) {
    const li = document.createElement("li");
    li.textContent = "0" + (i + 1);
    li.addEventListener("click", () => { S.cur = i; prog(i); });
    indicator.append(li);
    dots.push(li);
  }
  dots[0].classList.add("is-current");

  const resize = () => {
    S.sH = S.touch ? outerHeight : innerHeight;
    S.sW = S.touch ? innerWidth : document.body.clientWidth;
    S.totalScroll = S.sizes.slice(0, N - 1).reduce((a, s) => a + s * S.sH, 0);
    scroller.style.height = S.totalScroll + S.sizes[N - 1] * S.sH + "px";
    S.containerWidth = S.sizes.reduce((a, s) => a + s * S.sW, 0);
    S.startFree = S.sizes.slice(0, START_FREE).reduce((a, s) => a + s * S.sH, 0);
    S.endFree = S.startFree;
    for (let i = START_FREE; i < END_FREE; i++) {
      S.endFree += S.sizes[i] * S.sH;
      if (i === END_FREE - 1) S.endFree += (S.sizes[END_FREE] - 1) * S.sH;
    }
    // After resize ends, PC restores the progress ratio from before the resize
    const ratio = S.totalScroll ? S.scroll / S.totalScroll : 0;
    setTimeout(() => { if (S.sW > 768) scrollTo(0, S.totalScroll * ratio); }, 300);
  };

  const detectType = () => { S.disable = FIXED.includes(S.cur); };

  const detectId = () => {
    let p = 0, p2 = 0;
    for (let i = 0; i < N; i++) {
      p = i === 0 ? 0 : p + S.sizes[i - 1] * S.sH;
      p2 = p + S.sizes[i] * S.sH;
      // Judging right at a scene boundary jitters, so measure with 15% of the screen offset before and after
      const a = p - S.sH * 0.15, b = p2 - S.sH * 0.15;
      if (S.scroll >= a && S.scroll < b) {
        if (S.prev !== i) {
          S.prev = S.cur;
          S.cur = i;
          dots.forEach((d, k) => d.classList.toggle("is-current", k === i));
          header.classList.toggle("is-hidden", i === 0);
          clouds.forEach((c) => c.classList.toggle("is-hidden", i === 8));
          scenes[i].querySelectorAll(".ef-scroll").forEach((e) => e.classList.remove("ef-scroll"));
        }
        break;
      }
    }
  };

  function prog(id, noAnime = false) {
    S.lock = true;
    if (id === 0) S.disable = true;
    let to = S.sizes.slice(0, id).reduce((a, s) => a + s * S.sH, 0);
    if (S.isSP && id >= 2 && id <= 7) to += S.sH / 2;
    const dur = noAnime || reduce ? 0 : 0.4;
    gsap.to(window, { scrollTo: { y: to }, duration: dur, ease: "power4.inOut", onComplete: () => requestAnimationFrame(() => scrollTo(0, to)) });
    setTimeout(() => { detectType(); S.lock = false; }, dur * 1100);
  }

  const onScroll = () => {
    S.scroll = scrollY;
    S.h = (S.containerWidth - S.sW) * -1 * (S.scroll / S.totalScroll);
    if (!S.disable) {
      if (S.scroll < S.startFree) { S.disable = true; S.cur = START_FREE - 1; prog(S.cur); }
      else if (S.scroll > S.endFree) { S.disable = true; S.cur = END_FREE + 1; prog(S.cur); }
    }
  };

  const onAction = (e) => {
    if (S.lock) e.preventDefault();
    if (S.lock || S.cancel) return;
    if (!S.disable) return;
    let dy;
    if (!S.touch) dy = e.deltaY;
    else {
      const t = e.touches[0];
      if (S.prevTouchY == null) S.prevTouchY = t.pageY;
      dy = -1 * (t.pageY - S.prevTouchY);
      S.prevTouchY = t.pageY;
    }
    if (Math.abs(dy) > 10) {
      if (dy >= 0) { if (S.cur < N - 1) { S.cur += 1; prog(S.cur); } }
      else if (S.cur > 0) { S.cur -= 1; prog(S.cur); }
    }
    e.preventDefault();
  };

  const update = () => {
    S.toH += (S.h - S.toH) * (reduce ? 1 : S.spd);
    detectId();
    track.style.transform = `translate3d(${S.toH}px,0,0)`;
    requestAnimationFrame(update);
  };

  const init = () => {
    addEventListener("wheel", onAction, { passive: false });
    addEventListener("touchmove", onAction, { passive: false });
    addEventListener("touchend", () => { S.prevTouchY = null; S.cancel = false; }, { passive: false });
    // Inside a text box, hand wheel and swipe over to that box’s own scroll
    document.querySelectorAll(".js-text-area").forEach((a) => {
      a.addEventListener("touchstart", () => { S.cancel = true; a.classList.add("is-touched"); }, { passive: true });
      a.addEventListener("mouseover", () => { S.cancel = true; });
      a.addEventListener("mouseout", () => { S.cancel = false; });
    });
    resize();
    onScroll();
    addEventListener("resize", resize);
    addEventListener("scroll", onScroll, { passive: true });
    detectType();
    setInterval(detectId, 500);
    update();
    setTimeout(() => scrollTo(0, 0), 300);
  };

  /* Loading — once images arrive, the curtain lifts in .7s after .5s and is removed after 1s. Then the scene controller starts */
  const ready = () => setTimeout(() => {
    main.classList.remove("is-hidden");
    splash.classList.add("is-fadeout");
    setTimeout(() => splash.remove(), 1000);
    init();
  }, 500);
  if (document.readyState === "complete") ready(); else addEventListener("load", ready);

  /* Two sky cloud masses — 1° per frame, 20px up and down · 5px left and right (half on phone), in opposite phase to each other */
  if (window.gsap) {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      reduce = false;
      const fix = innerWidth <= 768 ? 0.5 : 1;
      let n = 0;
      const id = setInterval(() => {
        const v = 20 * Math.sin((n * Math.PI) / 180) * fix, h = 5 * Math.cos((n * Math.PI) / 240) * fix;
        const v2 = 20 * Math.sin(((n + 180) * Math.PI) / 180) * fix, h2 = 5 * Math.cos(((n + 180) * Math.PI) / 240) * fix;
        if (clouds[0]) clouds[0].style.transform = `translate3d(${h}px,${v}px,0)`;
        if (clouds[1]) clouds[1].style.transform = `translate3d(${h2}px,${v2}px,0)`;
        n += 1;
      }, 1000 / 60);
      return () => clearInterval(id);
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { reduce = true; });
  }

  /* Device preview — same slick fade as the original (.7s · every 2s · doesn’t pause on hover) */
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".js-slides").slick({ fade: true, pauseOnHover: false, speed: 700, autoplay: !reduce, autoplaySpeed: 2000 });
  }
  /* Movie frame — opens the video window with the original modal-video (the video is a placeholder document) */
  if (window.ModalVideo) new ModalVideo(".js-movie", { channel: "custom" });
})();
