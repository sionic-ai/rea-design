// Home: on open, rewinds to the top and locks scroll while playing a big Lottie title (60fps, 145 frames) — a photo cut enters at each of frames 19·70·92·106,
// Once drawn, two frames later the wedge is handed to the svg in the same spot (is-build) to release the lock (released after 6 seconds even if not received). After that the wedge is grown by the wedge-flood-scroll part.
// The header logo hides once progress passes .14. The people slider uses the original values (cell 270px · .4s cubic-bezier(.22,.61,.36,1) · drag 10px · edge resistance .35 · advance .15 cell · fast flick .4px/ms).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".kk-hero");
  const box = document.querySelector(".js-hero-lottie");
  const title = document.querySelector(".kk-header__title");

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  // Lock: block scrolling down with wheel, touch or keys, and if it still moves, snap it back to the top
  const keys = new Set([" ", "PageDown", "PageUp", "End", "Home", "ArrowDown", "ArrowUp"]);
  const stop = (e) => e.preventDefault();
  const key = (e) => { if (keys.has(e.key) && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) e.preventDefault(); };
  const back = () => { if (scrollY !== 0) scrollTo(0, 0); };
  let locked = false;
  const lock = () => { locked = true; addEventListener("wheel", stop, { passive: false }); addEventListener("touchmove", stop, { passive: false }); addEventListener("keydown", key); addEventListener("scroll", back); };
  const unlock = () => { if (!locked) return; locked = false; removeEventListener("wheel", stop); removeEventListener("touchmove", stop); removeEventListener("keydown", key); removeEventListener("scroll", back); };

  const photos = [...document.querySelectorAll(".kk-hero__photo")].map((el) => ({ el, at: +el.dataset.showFrame, shown: false }));
  const build = () => { hero.classList.add("is-build"); unlock(); ScrollTrigger.refresh(); };

  if (window.lottie && window.kkLottie && box) {
    const anim = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: window.kkLottie.hero, rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
    if (reduce) {
      anim.addEventListener("DOMLoaded", () => { anim.goToAndStop(anim.totalFrames - 1, true); photos.forEach((p) => p.el.classList.add("is-shown")); build(); });
    } else {
      lock();
      const timer = setTimeout(build, 6000);
      anim.addEventListener("enterFrame", () => {
        for (const p of photos) if (!p.shown && anim.currentFrame >= p.at) { p.shown = true; p.el.classList.add("is-shown"); }
      });
      anim.addEventListener("complete", () => requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(timer); build(); })));
      // Plays after the body is revealed (font) — the original also leaves the screen empty until the typeface loads
      const play = () => anim.play();
      document.documentElement.classList.contains("is-ready") ? play() : document.addEventListener("kk:ready", play, { once: true });
    }
  }

  hero.addEventListener("fx:progress", (e) => title.classList.toggle("is-hide", e.detail > 0.14));

  // People slider
  const slider = document.querySelector(".js-slider");
  const list = slider.querySelector(".js-slider-list"), prev = slider.querySelector(".js-slider-prev"), next = slider.querySelector(".js-slider-next");
  [...list.children].forEach((li, i) => li.style.setProperty("--i", i));
  let index = 0, max = 0, step = 0, x = 0, from = 0, sx = 0, sy = 0, t0 = 0, dragging = false, moved = false, axis = null;
  const slideW = () => parseFloat(getComputedStyle(list).getPropertyValue("--slide-w")) || 0;
  const paint = (anim) => { list.style.transition = anim && !reduce ? "transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)" : "none"; list.style.transform = `translate3d(${x}px, 0, 0)`; };
  const marks = () => { [[prev, index <= 0], [next, index >= max]].forEach(([b, off]) => { b.classList.toggle("is-disabled", off); b.setAttribute("aria-disabled", String(off)); }); };
  const update = () => { step = slideW(); const over = list.scrollWidth - slider.clientWidth; max = step <= 0 || over <= 1 ? 0 : Math.ceil(over / step); index = Math.min(index, max); if (!dragging) { x = -step * index; paint(false); } marks(); };
  const to = (n, anim = true) => { index = Math.max(0, Math.min(max, n)); x = -step * index; paint(anim); marks(); };
  const per = () => (step <= 0 ? 1 : Math.max(1, Math.floor(slider.clientWidth / step)));
  prev.addEventListener("click", (e) => { e.preventDefault(); if (!prev.classList.contains("is-disabled")) to(index - per()); });
  next.addEventListener("click", (e) => { e.preventDefault(); if (!next.classList.contains("is-disabled")) to(index + per()); });
  const resist = (v) => { const lo = -step * max; return v > 0 ? v * 0.35 : v < lo ? lo + (v - lo) * 0.35 : v; };
  const begin = (cx, cy, k) => { if (!max) return; dragging = true; moved = false; sx = cx; sy = cy; t0 = performance.now(); from = x; axis = k === "mouse" ? "x" : null; };
  const move = (cx) => { const d = cx - sx; if (!moved) { if (Math.abs(d) < 10) return false; moved = true; } x = resist(from + d); paint(false); return true; };
  const end = (cx) => {
    if (!dragging) return; dragging = false; if (!moved) return;
    const d = cx - sx, dt = performance.now() - t0, fast = Math.abs(dt > 0 ? d / dt : 0) >= 0.4;
    const pos = -x / step - index, whole = Math.trunc(pos), frac = pos - whole;
    let n = whole; if (Math.abs(frac) >= 0.15) n += Math.sign(frac); if (n === 0 && fast) n = d > 0 ? -1 : 1;
    to(index + n);
  };
  list.addEventListener("mousedown", (e) => { if (e.button !== 0) return; begin(e.clientX, e.clientY, "mouse"); const mm = (ev) => { if (move(ev.clientX)) ev.preventDefault(); }; const mu = (ev) => { removeEventListener("mousemove", mm); removeEventListener("mouseup", mu); end(ev.clientX); }; addEventListener("mousemove", mm); addEventListener("mouseup", mu); });
  list.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return; begin(e.touches[0].clientX, e.touches[0].clientY, "touch");
    const tm = (ev) => {
      const t = ev.touches[0];
      if (axis === null) { const ax = Math.abs(t.clientX - sx), ay = Math.abs(t.clientY - sy); if (ax < 10 && ay < 10) return; axis = (Math.atan2(ay, ax) * 180) / Math.PI <= 45 ? "x" : "y"; }
      if (axis === "y") { done(); dragging = false; if (moved) to(index); return; }
      ev.preventDefault(); move(t.clientX);
    };
    const te = (ev) => { done(); end(ev.changedTouches[0] ? ev.changedTouches[0].clientX : sx); };
    const done = () => { removeEventListener("touchmove", tm); removeEventListener("touchend", te); removeEventListener("touchcancel", te); };
    addEventListener("touchmove", tm, { passive: false }); addEventListener("touchend", te); addEventListener("touchcancel", te);
  }, { passive: true });
  list.addEventListener("dragstart", (e) => e.preventDefault());
  list.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  let w = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; update(); } });
  update();
})();
