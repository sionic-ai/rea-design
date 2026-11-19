// Scroll position → 96 frames, infinite scroll, loader·header·footer. stage.js·index.js only read AV.frame.
(() => {
  const FRAMES = 96;
  const mobile = innerWidth <= 640;
  // Height (vh) per section and the animation range each handles — the original table as is. On phone only the video section is long
  const PAGES = [
    { id: "intro", vh: 200, vhM: 100, a: 0, b: 0.167 },
    { id: "landing", vh: 200, vhM: 100, a: 0.167, b: 0.333 },
    { id: "music", vh: 200, vhM: 100, a: 0.333, b: 0.5 },
    { id: "bio", vh: 300, vhM: 100, a: 0.5, b: 0.667 },
    { id: "videos", vh: 400, vhM: 400, a: 0.667, b: 0.833 },
    { id: "contact", vh: 400, vhM: 100, a: 0.833, b: 1 },
  ].map((p) => ({ ...p, vh: mobile ? p.vhM : p.vh }));
  // On desktop, ease with an S curve to pass slowly around the 30 frames (±14) entering the car
  const SLOW = mobile ? [] : [{ center: 30, half: 14, slow: 0.08 }];
  const slowCurve = (r, e) => { const t = 2 * r - 1; return (t * t * t / 6 + e * r + 1 / 6) / (1 / 3 + e); };
  const warp = (r) => {
    for (const z of SLOW) {
      const c = z.center / FRAMES, h = z.half / FRAMES, lo = c - h;
      if (r > lo && r < c + h) return lo + 2 * h * slowCurve((r - lo) / (2 * h), z.slow);
    }
    return r;
  };
  // Like the original, section height is fixed from the first measured window height — so the scene position doesn’t wobble when the phone address bar moves up and down
  const VH = innerHeight;
  const total = PAGES.reduce((s, p) => s + (p.vh / 100) * VH, 0);
  const starts = []; PAGES.reduce((s, p) => (starts.push(s), s + (p.vh / 100) * VH), 0);
  const progressAt = (y) => {
    let top = 0;
    for (const p of PAGES) {
      const h = (p.vh / 100) * VH;
      if (y < top + h) return warp(p.a + ((y - top) / h) * (p.b - p.a));
      top += h;
    }
    return 1;
  };
  const frameAt = (y) => progressAt(total > 0 ? ((y % total) + total) % total : 0) * FRAMES;
  const frameOf = (id, t) => { const p = PAGES.find((q) => q.id === id); return (p.a + (p.b - p.a) * t) * FRAMES; };

  const AV = (window.AV = { FRAMES, mobile, PAGES, VH, total, starts, frame: 0, scroll: 0, frameAt, frameOf, started: false, music: true, song: 0 });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Section height + second endlessly looping set
  const main = document.querySelector(".av-pages");
  const first = [...main.children];
  first.forEach((el, i) => { el.style.height = `${(PAGES[i].vh / 100) * VH}px`; });
  first.forEach((el) => {
    const c = el.cloneNode(true);
    c.removeAttribute("data-slot");
    c.setAttribute("aria-hidden", "true");
    c.querySelectorAll("a, button").forEach((a) => a.setAttribute("tabindex", "-1"));
    main.append(c);
  });

  // Smooth scroll — Lenis 1.3.25 with the original settings as-is (1.7 seconds, 1-(1-t)^5, wheel 0.7x, clamped to ±50px at a time)
  const lenis = (AV.lenis = new Lenis({
    duration: 1.7,
    easing: (t) => 1 - Math.pow(1 - t, 5),
    wheelMultiplier: 0.7,
    touchMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    syncTouchLerp: 0.075,
    autoRaf: false,
    virtualScroll: (d) => {
      const e = d.event;
      if (e?.type !== "wheel") return true;
      const big = e.deltaMode !== 0 || Math.abs(e.deltaY) >= 100;
      const cap = big ? 140 : 50;
      d.deltaY = Math.max(-cap, Math.min(cap, d.deltaY * (big ? 2.2 : 1)));
      return true;
    },
  }));
  lenis.stop();
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Past one set plus 1.5 screens, it rewinds by one set — the second set is the same scene as the first, so the seam is invisible
  let wrapping = false;
  const wrap = () => {
    if (wrapping) return;
    const y = scrollY;
    if (y >= total + VH * 1.5) {
      wrapping = true;
      lenis.scrollTo(y - total, { immediate: true, force: true });
      requestAnimationFrame(() => { wrapping = false; });
    }
  };
  addEventListener("scroll", () => requestAnimationFrame(wrap), { passive: true });

  const listeners = [];
  AV.onFrame = (fn) => listeners.push(fn);
  const tick = () => {
    AV.scroll = scrollY;
    AV.frame = frameAt(scrollY);
    for (const fn of listeners) fn(AV.frame);
  };
  gsap.ticker.add(tick);

  // When the width crosses 640, section height and camera table differ, so reopen like the original
  let bp = null;
  addEventListener("resize", () => {
    clearTimeout(bp);
    bp = setTimeout(() => { if ((innerWidth <= 640) !== mobile) location.reload(); }, 500);
  }, { passive: true });

  // ── Header: dot row ──
  const MARKS = mobile
    ? [0, frameOf("music", 0.5), frameOf("bio", 0.5), frameOf("videos", 0.5), frameOf("contact", 0.5)]
    : [0, 30, 41, 60, 80];
  const dots = [...document.querySelectorAll(".av-selector__dot")];
  dots.forEach((d) => d.insertAdjacentHTML("beforeend", '<svg class="av-selector__sparkle" viewBox="0 0 100 100" aria-hidden="true"><use href="#av-sparkle"/></svg>'));
  const prog = document.querySelector(".av-selector__progress");
  const rail = document.querySelector(".av-rail__fill");
  const mlinks = [...document.querySelectorAll(".av-mmenu__link")];
  let active = -2;
  AV.onFrame((f) => {
    let idx = -1;
    for (let i = 0; i < MARKS.length && f >= MARKS[i]; i++) idx = i;
    let u;
    if (f <= MARKS[0]) u = 0;
    else if (f >= MARKS[MARKS.length - 1]) u = 1;
    else for (let i = 0; i < MARKS.length - 1; i++) if (f >= MARKS[i] && f < MARKS[i + 1]) { u = (i + (f - MARKS[i]) / (MARKS[i + 1] - MARKS[i])) / (MARKS.length - 1); break; }
    prog.style.width = `${u * 100}%`;
    rail.style.height = `${u * 100}%`;
    if (idx !== active) {
      active = idx;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      mlinks.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    }
  });
  // Scan scroll positions in 10px steps to find the one closest to the pressed point’s frame (same method as the original)
  const goFrame = (f) => {
    if (f <= 0) return lenis.scrollTo(0, { duration: 1.1 });
    let best = 0, gap = Infinity;
    for (let y = 0; y <= total; y += 10) { const g = Math.abs(frameAt(y) - f); if (g < gap) { gap = g; best = y; } }
    lenis.scrollTo(best, { duration: 1.1 });
  };
  AV.goFrame = goFrame;
  const label = document.querySelector(".av-header__label");
  let hideT = null;
  dots.forEach((d, i) => {
    d.addEventListener("click", () => goFrame(MARKS[i]));
    d.addEventListener("mouseenter", () => { clearTimeout(hideT); label.textContent = d.dataset.label; label.classList.add("is-visible"); });
    d.addEventListener("mouseleave", () => { label.classList.remove("is-visible"); hideT = setTimeout(() => { label.textContent = ""; }, 450); });
  });
  document.querySelector(".av-header__logo").addEventListener("click", (e) => { e.preventDefault(); lenis.scrollTo(0, { duration: 1.1 }); });

  // Phone menu
  const burger = document.querySelector(".av-burger");
  const mm = document.querySelector(".av-mmenu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("av-no-scroll", open);
    if (open) { mm.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => mm.classList.add("is-open"))); }
    else { mm.classList.remove("is-open"); setTimeout(() => { if (!mm.classList.contains("is-open")) mm.hidden = true; }, 250); }
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  mm.addEventListener("click", (e) => { if (e.target === mm) setMenu(false); });
  mlinks.forEach((b, i) => b.addEventListener("click", () => { setMenu(false); setTimeout(() => goFrame(MARKS[i]), 150); }));

  // ── Floor: one period of wave flows in 0.1 steps, and when turned off the amplitude shrinks by 0.1 until flat ──
  const wave = document.querySelector(".av-wave");
  const wsvg = wave.querySelector("svg"), wpath = wave.querySelector("path"), tip = wave.querySelector(".av-wave__tip");
  let phase = 0, amp = 1;
  const drawWave = () => {
    const { width: w, height: h } = wsvg.getBoundingClientRect();
    if (!w) return;
    wsvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    if (AV.music && !reduce) phase += 0.1;
    amp += ((AV.music ? 1 : 0) - amp) * 0.1;
    let d = "";
    for (let x = 0; x <= w; x += 2) d += `${x ? "L" : "M"}${x},${(h / 2 + h * 0.25 * amp * Math.sin((x / w) * Math.PI * 2 - phase)).toFixed(2)}`;
    wpath.setAttribute("d", d);
  };
  gsap.ticker.add(drawWave);
  const setMusic = (on) => {
    AV.music = on;
    tip.textContent = on ? "Turn music off" : "Turn music on";
    wave.setAttribute("aria-label", tip.textContent);
    const lm = document.querySelector(".av-loader__music");
    lm.classList.toggle("is-off", !on);
    lm.querySelector("span").textContent = on ? "Music on" : "Music off";
  };
  AV.setMusic = setMusic;
  wave.addEventListener("click", () => setMusic(!AV.music));
  wave.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMusic(!AV.music); } });
  wave.addEventListener("mouseenter", () => tip.classList.add("is-visible"));
  wave.addEventListener("mouseleave", () => tip.classList.remove("is-visible"));
  wave.addEventListener("mousemove", (e) => { const r = wave.getBoundingClientRect(); tip.style.left = `${e.clientX - r.left}px`; tip.style.top = `${e.clientY - r.top}px`; });

  // ── Loader: waves grow with progress (calming at both ends at 0.33), start button when done ──
  const loader = document.querySelector(".av-loader");
  const lpath = loader.querySelector(".av-loader__wave-line");
  const start = loader.querySelector(".av-loader__start");
  const loading = loader.querySelector(".av-loader__loading");
  const LW = 600, LH = 50;
  let lprog = 0, lphase = 0, lraf = 0;
  const drawLoader = () => {
    const mid = LH / 2, a = LH * 0.45, end = Math.round(lprog * LW);
    let d = "";
    for (let x = 0; x <= LW; x++) {
      let y = mid;
      if (x <= end && end > 0) {
        const p = x / end, g = Math.min(p / 0.33, 1), m = Math.min((1 - p) / 0.33, 1);
        y = mid + a * lprog * g * m * m * Math.sin((x / LW) * Math.PI * 4 * 2 - lphase);
      }
      d += `${x ? "L" : "M"}${x},${y.toFixed(2)}`;
    }
    lpath.setAttribute("d", d);
    lphase += 0.1;
    lraf = requestAnimationFrame(drawLoader);
  };
  drawLoader();
  const block = (e) => e.preventDefault();
  addEventListener("wheel", block, { passive: false });
  scrollTo(0, 0);
  // In the original, progress fills while real assets download (measured: nearly full in the first 0.12s, done around 1.6s) — with nothing to download, it is filled in the same shape
  gsap.to({ v: 0 }, {
    v: 1, duration: reduce ? 0.01 : 1.35, ease: "power3.out",
    onUpdate() { lprog = this.targets()[0].v; },
    onComplete: () => {
      loader.classList.add("is-ready");
      loading.hidden = true;
      start.hidden = false;
      AV.ready = true;
      // Spots with nobody to click, like previews and thumbnails, open the door automatically via #start at the end of the URL
      if (location.hash === "#start") go();
    },
  });
  const go = () => {
    loader.classList.add("is-loaded");
    AV.started = true;
    document.dispatchEvent(new CustomEvent("av:start"));
    setTimeout(() => {
      cancelAnimationFrame(lraf);
      removeEventListener("wheel", block, { passive: false });
      document.body.classList.remove("av-locked");
      scrollTo(0, 0);
      lenis.start();
    }, 700);
    // Remove the logo after it fades out over 1 second
    setTimeout(() => loader.classList.add("is-gone"), 1100);
  };
  start.addEventListener("click", go);
  loader.querySelector(".av-loader__music").addEventListener("click", () => setMusic(!AV.music));
})();
