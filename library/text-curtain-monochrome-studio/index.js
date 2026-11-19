(() => {
  const GV = window.GV;
  if (!GV) return;
  const reduce = GV.reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const playIn = (root) => root.querySelectorAll('[data-fx~="word-pop-shuffle"]').forEach((n) => n.dispatchEvent(new CustomEvent(reduce ? "fx:show" : "fx:play")));
  const hideIn = (root) => root.querySelectorAll('[data-fx~="word-pop-shuffle"]').forEach((n) => n.dispatchEvent(new CustomEvent("fx:reset")));

  // ── 1. First section: loader → wait on the first scene → (wheel) video → title ──
  const hero = $("[data-hero]");
  const loader = $("[data-loader]"), loaderCurtain = $("[data-loader-curtain]");
  const first = $("[data-hero-first]"), videoLayer = $("[data-hero-video]"), video = videoLayer?.querySelector("video");
  const last = $("[data-hero-last]"), titles = $("[data-hero-titles]");
  const btnScroll = $("[data-hero-scroll]"), btnSkip = $("[data-hero-skip]");
  const head = $(".gv-head");
  let heroState = "loading";
  const fade = (el, on, d = 0.4) => el && gsap.to(el, { autoAlpha: on ? 1 : 0, duration: reduce ? 0 : d, ease: "power2.inOut", overwrite: true });
  const startOnFirst = !location.hash || location.hash === "#studio";

  if (video && matchMedia("(max-width: 767px)").matches && video.dataset.mobileSrc) video.src = video.dataset.mobileSrc;

  function revealTitles() {
    hero.removeAttribute("data-own-reveal");
    const tl = gsap.timeline();
    tl.to(first, { autoAlpha: 0, duration: reduce ? 0 : 0.8, ease: "power2.inOut" }, 0);
    tl.fromTo(last, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 2.3, ease: "power2.inOut" }, 0);
    tl.call(() => { gsap.set(titles, { autoAlpha: 1 }); playIn(titles); GV.lock(false); }, null, reduce ? 0 : 0.4);
    return tl;
  }
  function finish() {
    if (heroState === "done") return;
    heroState = "done";
    fade(btnScroll, false, 0.3); fade(btnSkip, false, 0.3);
    video && video.pause();
    gsap.set(videoLayer, { autoAlpha: 0 });
    revealTitles();
  }
  function playVideo() {
    if (heroState !== "holding") return;
    heroState = "playing";
    fade(btnScroll, false, 0.35);
    fade(btnSkip, true, 0.5);
    gsap.set(videoLayer, { autoAlpha: 1 });
    gsap.to(first, { autoAlpha: 0, duration: reduce ? 0 : 0.3, ease: "none" });
    if (!video) return finish();
    video.currentTime = 0;
    const p = video.play();
    p && p.catch(() => finish());
    video.addEventListener("ended", finish, { once: true });
    // If the video is blocked, wait for its length (4.87s) and then move on
    setTimeout(() => heroState === "playing" && finish(), 5600);
  }
  function hold() {
    heroState = "holding";
    // Since the intercept takes over the wheel while waiting or playing, the panel lock is released here
    GV.lock(false);
    const tl = gsap.timeline();
    gsap.set(last, { autoAlpha: 0 });
    gsap.set(loaderCurtain, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(loader, { clipPath: "inset(0% 0% 0% 0%)" });
    tl.to(first, { autoAlpha: 1, duration: reduce ? 0 : 0.7, ease: "power2.out" }, 0.1);
    tl.to(loader, { clipPath: "inset(0% 0% 100% 0%)", duration: reduce ? 0 : 0.85, ease: "power2.inOut" }, 0);
    tl.to(loaderCurtain, { clipPath: "inset(0% 0% 100% 0%)", duration: reduce ? 0 : 0.85, ease: "power2.inOut" }, 0.14);
    tl.set(loader, { autoAlpha: 0 }, 0.85);
    tl.set(loaderCurtain, { autoAlpha: 0 }, 0.99);
    fade(btnScroll, true, 0.5);
    gsap.to(head, { autoAlpha: 1, duration: reduce ? 0 : 0.5 });
  }
  function runLoader() {
    const bar = $("[data-loader-bar]", loader), pct = $("[data-loader-pct]", loader), track = $("[data-loader-track]", loader);
    const phase = $("[data-loader-phase]", loader), mats = [...loader.querySelectorAll("[data-mat]")];
    const st = { p: 0 };
    let mat = -1, step = -1;
    gsap.set(head, { autoAlpha: 0 });
    GV.lock(true);
    gsap.to(st, {
      p: 1, duration: reduce ? 0.2 : 1.2, ease: "power1.inOut",
      onUpdate: () => {
        bar.style.transform = `scaleX(${st.p})`;
        pct.textContent = `${Math.round(st.p * 100)}%`;
        track.setAttribute("aria-valuenow", Math.round(st.p * 100));
        const m = Math.min(5, Math.floor(st.p * 6)) - 1;
        if (m !== mat) { mats.forEach((g, k) => gsap.to(g, { opacity: k === m ? 1 : 0, duration: 0.25 })); mat = m; }
        const s = st.p < 0.4 ? 0 : st.p < 0.95 ? 1 : 2;
        if (s !== step) { step = s; gsap.to(phase, { yPercent: -100 / 3 * s, duration: reduce ? 0 : 0.45, ease: "power2.out" }); }
      },
      onComplete: () => gsap.delayedCall(reduce ? 0 : 0.35, hold),
    });
  }
  if (hero) {
    gsap.set([first, videoLayer, titles, btnScroll, btnSkip], { autoAlpha: 0 });
    if (startOnFirst) runLoader();
    else { heroState = "done"; hero.removeAttribute("data-own-reveal"); gsap.set([loader, loaderCurtain], { autoAlpha: 0 }); gsap.set([last, titles], { autoAlpha: 1 }); }
    GV.intercept("studio", (d) => {
      if (heroState === "holding" && d > 0) { playVideo(); return true; }
      return heroState === "playing" || heroState === "loading";
    });
    btnScroll.addEventListener("click", playVideo);
    btnSkip.addEventListener("click", finish);
    GV.on((type, key) => { if (key === "studio" && type === "shown" && heroState === "done") gsap.set(titles, { autoAlpha: 1 }); });
  }

  // ── 2. What it is: two titles cross the screen in opposite directions and sit back in · folder text word magnets ──
  const tA = $("[data-what-a]"), tB = $("[data-what-b]"), folder = $("[data-folder]"), copy = $("[data-folder-copy]");
  let magnetReady = false;
  GV.on((type, key) => {
    if (key !== "what") return;
    if (type === "enter") {
      magnetReady = false;
      gsap.killTweensOf([tA, tB]);
      if (reduce) { gsap.set([tA, tB], { x: 0 }); return; }
      const w = innerWidth, a = tA.getBoundingClientRect(), b = tB.getBoundingClientRect();
      const tl = gsap.timeline();
      tl.fromTo(tA, { x: -a.right }, { x: w - a.left, duration: 1.8, ease: "expo.in" }, 0);
      tl.fromTo(tB, { x: w - b.left }, { x: -b.right, duration: 1.8, ease: "expo.in" }, 0);
      tl.fromTo(tA, { x: -a.right }, { x: 0, duration: 0.6, ease: "power3.out" });
      tl.fromTo(tB, { x: w - b.left }, { x: 0, duration: 0.6, ease: "power3.out" }, "<");
    }
    if (type === "shown") {
      const groups = [...copy.querySelectorAll('[data-fx~="word-pop-shuffle"]')];
      const lastGroup = groups[groups.length - 1];
      lastGroup?.addEventListener("fx:played", () => { magnetReady = true; }, { once: true });
      if (reduce) magnetReady = true;
    }
    if (type === "leave") { magnetReady = false; copy.querySelectorAll('[data-fx-part="word"]').forEach((n) => gsap.set(n, { x: 0, y: 0 })); }
  });
  if (folder && matchMedia("(hover: hover) and (min-width: 768px)").matches && !reduce) {
    let words = [];
    const measure = () => {
      words = [...copy.querySelectorAll('[data-fx-part="word"]')].map((n) => {
        gsap.set(n, { x: 0, y: 0 });
        const r = n.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, xTo: gsap.quickTo(n, "x", { duration: 0.55, ease: "power3.out" }), yTo: gsap.quickTo(n, "y", { duration: 0.55, ease: "power3.out" }) };
      });
    };
    folder.addEventListener("pointerenter", () => { if (magnetReady) measure(); });
    folder.addEventListener("pointermove", (e) => {
      if (!magnetReady) return;
      if (!words.length) measure();
      for (const w of words) {
        const dx = e.clientX - w.cx, dy = e.clientY - w.cy;
        const f = Math.max(0, 1 - Math.hypot(dx, dy) / 320);
        let x = dx * f * 0.55, y = dy * f * 0.55;
        const m = Math.hypot(x, y);
        if (m > 40) { x *= 40 / m; y *= 40 / m; }
        w.xTo(x); w.yTo(y);
      }
    });
    folder.addEventListener("pointerleave", () => { words.forEach((w) => { w.xTo(0); w.yTo(0); }); words = []; });
  }

  // ── 3·4. Two steps within a section: one wheel turn goes to the next panel, wheeling up goes back ──
  function twoStep(key, a, b, enterB, leaveB) {
    let on = false, until = 0;
    const set = (v) => {
      on = v;
      until = performance.now() + (v ? 1300 : 1500);
      const tl = gsap.timeline();
      if (v) {
        tl.to(a, { autoAlpha: 0, duration: reduce ? 0 : 0.5, ease: "power2.in" }, 0);
        tl.call(() => enterB && enterB(), null, reduce ? 0 : 0.3);
        tl.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "power2.out" }, reduce ? 0 : 0.3);
      } else {
        tl.to(b, { autoAlpha: 0, duration: reduce ? 0 : 0.5, ease: "power2.out" }, 0);
        tl.call(() => leaveB && leaveB(), null, 0);
        tl.fromTo(a, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 1, ease: "none" }, reduce ? 0 : 0.35);
      }
    };
    GV.intercept(key, (d) => {
      if (performance.now() < until) return true;
      if (!on && d > 0) { set(true); return true; }
      if (on && d < 0) { set(false); return true; }
      return false;
    });
    GV.on((type, k) => {
      if (k !== key || type !== "enter") return;
      on = false; gsap.set(a, { autoAlpha: 1 }); gsap.set(b, { autoAlpha: 0 });
      leaveB && leaveB();
    });
  }
  const orgCards = $("[data-org-cards]");
  twoStep("org", $("[data-org-dish]"), orgCards, () => playIn(orgCards), () => hideIn(orgCards));
  orgCards && orgCards.setAttribute("data-own-reveal", "");

  // ── 4. People: 1.5s after the section turns on, a glass panel (ink 45%) stands straight in .72s, while records and joints stand in the same .72s as 24 frames of cell mottling.
  // Fog settles on the four glass pieces at the same time (fog-wipe-drops). Wiping the text piece redraws the text as fourteen-line strips, and the four diamond pieces switch off and on in turn
  const memPeople = $("[data-mem-people]"), memBlur = $("[data-mem-blur]"), memVeil = $("[data-mem-veil]"), memMask = $("[data-mem-mask]");
  const shards = [...document.querySelectorAll(".mem__shard")];
  // 24 mask frames in one sheet, where each of the 267×117 cells turns on for .12 using a blotch delay (0 to .88) — the same bleed as the text curtain
  let cellSheet = null;
  function cells() {
    if (cellSheet) return cellSheet;
    const cols = 267, rows = 117, seed = Array.from({ length: 35 }, Math.random), d = new Float32Array(cols * rows);
    let lo = Infinity, hi = -Infinity;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const gx = (x / cols) * 6, gy = (y / rows) * 4, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), k = 7 * iy + ix;
      const a = seed[k] + (seed[k + 1] - seed[k]) * sx, b = seed[k + 7] + (seed[k + 8] - seed[k + 7]) * sx;
      const v = a + (b - a) * sy + (Math.random() - 0.5) * 0.08;
      d[y * cols + x] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
    }
    const c = document.createElement("canvas"); c.width = cols; c.height = rows * 24;
    const g = c.getContext("2d"), img = g.createImageData(cols, rows), px = img.data, span = hi - lo || 1;
    for (let i = 0; i < d.length; i++) { d[i] = ((d[i] - lo) / span) * 0.88; px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = 255; }
    for (let f = 0; f < 24; f++) {
      for (let i = 0; i < d.length; i++) px[i * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, (f / 23 - d[i]) / 0.12)));
      g.putImageData(img, 0, rows * f);
    }
    return (cellSheet = c.toDataURL());
  }
  // Build the mask panel ahead of time while idle — building it at the moment the section changes delays the curtain lift by that much
  setTimeout(cells, 900);
  const memLayers = [memMask, memPeople].filter(Boolean);
  const frameAt = (f) => memLayers.forEach((el) => { el.style.maskPosition = el.style.webkitMaskPosition = `0% ${(f / 23) * 100}%`; });
  const unmask = () => memLayers.forEach((el) => { el.style.maskImage = el.style.webkitMaskImage = ""; });
  let memTl = null;
  function memReset() {
    memTl && memTl.kill();
    unmask();
    gsap.set([memVeil, memBlur, ...memLayers].filter(Boolean), { autoAlpha: 0 });
    shards.forEach((s) => s.dispatchEvent(new CustomEvent("fx:reset")));
  }
  function memReveal() {
    memReset();
    shards.forEach((s) => s.dispatchEvent(new CustomEvent("fx:play")));
    if (reduce) { gsap.set([memVeil, memBlur, ...memLayers].filter(Boolean), { autoAlpha: 1 }); return; }
    const url = `url(${cells()})`, f = { v: 0 };
    memTl = gsap.timeline({ delay: 1.5 });
    memTl.call(() => {
      memLayers.forEach((el) => { el.style.maskImage = el.style.webkitMaskImage = url; el.style.maskSize = el.style.webkitMaskSize = "100% 2400%"; });
      frameAt(0);
      gsap.set(memLayers, { autoAlpha: 1 });
    });
    memTl.to([memVeil, memBlur].filter(Boolean), { autoAlpha: 1, duration: 0.72, ease: "none" }, 0);
    memTl.to(f, { v: 23, duration: 0.72, ease: "none", onUpdate: () => frameAt(Math.round(f.v)), onComplete: unmask }, 0);
  }
  GV.on((type, key) => {
    if (key !== "members") return;
    if (type === "enter") memReveal();
    if (type === "leave") memReset();
  });
  if (GV.key === "members") memReveal();
  // Redraws the marks of the wiped pieces — text: fourteen bands light up .12s each, staggered by .07 / diamond: turns off in turn over .32s then on over .42s (.12 stagger)
  const word = $("[data-mem-word]"), marks = [...document.querySelectorAll("[data-mem-marks] i")];
  const STRIPES = ["0 0,28% 0,28% 32%,0 32%", "0 20%,11% 20%,11% 82%,0 82%", "0 68%,28% 68%,28% 100%,0 100%", "13% 48%,28% 48%,28% 88%,13% 88%", "31% 26%,38% 26%,38% 100%,31% 100%", "35% 26%,45% 26%,45% 64%,35% 64%", "45% 26%,57% 26%,57% 58%,45% 58%", "45% 52%,63% 52%,63% 100%,45% 100%", "56% 26%,64% 26%,64% 100%,56% 100%", "63% 26%,72% 26%,79% 100%,72% 100%", "75% 72%,84% 26%,75% 26%,70% 72%", "83% 26%,94% 26%,94% 58%,83% 58%", "83% 52%,100% 52%,100% 100%,83% 100%", "94% 26%,100% 26%,100% 100%,94% 100%"];
  let wordBase = null, wordStripes = [];
  if (word) {
    const text = word.textContent;
    word.textContent = "";
    wordBase = document.createElement("span"); wordBase.textContent = text; wordBase.style.opacity = "1";
    word.append(wordBase);
    wordStripes = STRIPES.map((pts) => { const s = document.createElement("span"); s.textContent = text; s.style.clipPath = `polygon(${pts})`; word.append(s); return s; });
  }
  shards.find((s) => s.dataset.shard === "logo")?.addEventListener("fx:wiped", () => {
    if (!wordBase) return;
    gsap.killTweensOf([wordBase, ...wordStripes]);
    gsap.timeline().set(wordBase, { opacity: 0 }).fromTo(wordStripes, { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.07, ease: "none" }).set(wordBase, { opacity: 1 }).set(wordStripes, { opacity: 0 });
  });
  shards.find((s) => s.dataset.shard === "mark")?.addEventListener("fx:wiped", () => {
    gsap.killTweensOf(marks);
    gsap.timeline().to(marks, { opacity: 0, duration: 0.32, stagger: 0.12, ease: "power2.inOut" }).to(marks, { opacity: 1, duration: 0.42, stagger: 0.12, ease: "power2.inOut" }, "-=0.12");
  });

  // ── 6. Contact: clicking mail or phone shows ”Copied” for 2s ──
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch {}
    const inner = b.querySelector("[data-fx]");
    if (!inner) return;
    const was = inner.dataset.text || inner.textContent.trim();
    inner.dataset.text = was;
    inner.removeAttribute("data-fx"); inner.textContent = "Copied";
    setTimeout(() => { inner.textContent = was; inner.setAttribute("data-fx", "letter-pop-flip"); }, 2000);
  }));
})();
