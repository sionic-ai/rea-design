// Home — fit the wordmark to screen width, open with a pen-tool loader, then while passing the reel run the line-split reveal, rail ticks, signal dot, scroll-speed weight and blur plate.
(() => {
  const GS = window.GS, root = document.documentElement, { wide, reduce, lenis, track, clone } = GS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const V = (v, a, b) => Math.max(a, Math.min(b, v));
  const L = (a, b, t) => a + (b - a) * t;
  const hero = $(".gs-hero"), heroWm = $(".gs-wm--hero"), cloneWm = $(".gs-wm--clone");
  const dotHero = $(".gs-wm--hero .gs-wm__dot"), dotClone = $(".gs-wm--clone .gs-wm__dot");
  const period = $(".gs-period"), railLine = $(".gs-rail__line"), ticks = $$(".gs-rail__tick");
  const panels = $$(".gs-panel");
  const wms = [heroWm, cloneWm];
  const base = () => parseFloat(getComputedStyle(root).getPropertyValue("--kf-weight-display")) || 700;

  // ── Wordmark fills the width inside the margins, without exceeding the height between title row and rail ──
  const fit = () => {
    const m = (wide ? 2.5 : 5) * innerWidth / 100;
    wms.forEach((w) => w.closest(".gs-panel").style.setProperty("--wm", "100px"));
    // Pull left by the first letter’s left side bearing (the empty space before the stroke) so the stroke touches the margin line — the original measures with canvas too
    const pen = document.createElement("canvas").getContext("2d");
    pen.font = `${base()} 100px ${getComputedStyle(heroWm).fontFamily}`;
    const first = Math.max(0, -pen.measureText(heroWm.querySelector(".ch").textContent).actualBoundingBoxLeft);
    const word = heroWm.getBoundingClientRect().width;
    let k = (innerWidth - 2 * m) / Math.max(1, word - first) * 100;
    const topEdge = wide ? $(".gs-top__role").getBoundingClientRect().bottom + m : $(".gs-top").offsetHeight + m;
    const bottomEdge = wide ? railLine.getBoundingClientRect().top - m : $(".gs-hero__role", hero).offsetTop - m * 0.8;
    k = Math.min(k, (bottomEdge - topEdge) / 0.96);
    for (const p of [hero, clone]) { p.style.setProperty("--wm", `${k.toFixed(2)}px`); p.style.setProperty("--ob", `${(first * k / 100).toFixed(2)}px`); }
  };

  // ── Line split (masked lines rise from below) and section-enter indicator ──
  const splits = () => $$(".gs-split").forEach((el) => SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line", autoSplit: true, aria: "none", onSplit(s) { s.lines.forEach((l, i) => l.style.setProperty("--i", String(i))); } }));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-in"); }), wide ? { root: GS.reel, rootMargin: "0px -12% 0px -12%" } : { rootMargin: "0px 0px -12% 0px" });
  const watch = () => $$(".gs-panel, .gs-set__head, .gs-disc li").forEach((el) => io.observe(el));

  // ── Rail ticks: one per set, lit while that set passes ──
  const sets = $$(".gs-set");
  let marks = [];
  const placeTicks = () => {
    // The original hides the rail on narrow screens and doesn’t build ticks either
    if (!wide) { ticks.forEach((t) => t.remove()); marks = []; return; }
    const lim = Math.max(1, GS.limit());
    marks = sets.slice(0, ticks.length).map((s, i) => {
      const at = V((wide ? s.offsetLeft : s.offsetTop) / lim, 0, 1), end = V((wide ? s.offsetLeft + s.offsetWidth : s.offsetTop + s.offsetHeight) / lim, 0, 1);
      ticks[i].style.left = `${at * 100}%`;
      return { el: ticks[i], at, end };
    });
  };

  // ── Spread plate: at 16:9 of a different plate height it grows until it covers the screen, stays one screen’s length, then passes ──
  const bleed = $(".gs-bleed"), film = $(".gs-plate.is-bleed"), stage = $(".gs-bleed__stage");
  const bl = {};
  const sizeBleed = () => {
    if (!bleed) return;
    const W = innerWidth, H = innerHeight;
    film.style.transform = "";
    bl.w0 = film.offsetWidth; bl.h0 = film.offsetHeight;
    bl.cover = Math.max(W / bl.w0, H / bl.h0);
    if (wide) {
      bl.uA = -(W - bl.w0) / 2; bl.G = 1.5 * (W * bl.cover - bl.w0) / bl.cover; bl.hold = reduce ? 0 : W; bl.uE = bl.uA + bl.G + bl.hold;
      bleed.style.setProperty("--bleed-len", `${Math.round(reduce ? W : W + bl.uE)}px`);
    } else {
      bl.G = 0.55 * H; bl.hold = reduce ? 0 : H; bl.uE = bl.G + bl.hold;
      bleed.style.setProperty("--bleed-len", `${Math.round(stage.offsetHeight + (reduce ? 0 : bl.uE))}px`);
    }
  };
  const runBleed = () => {
    if (!bleed || reduce) return 0;
    const r = bleed.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    let t = 0;
    if (wide) {
      const c = -r.left;
      if (c < bl.uA) t = 0; else t = 1 - (1 - V((c - bl.uA) / bl.G, 0, 1)) ** 3;
      const k = L(1, bl.cover, t), stageLeft = Math.max(r.left, Math.min(0, r.right - W));
      const cx = c < bl.uA ? r.left + bl.w0 / 2 : c < bl.uE ? W / 2 : W / 2 - (c - bl.uE);
      const sx = cx - (bl.w0 * k) / 2 - stageLeft, sy = H / 2 - (bl.h0 * k) / 2 - film.offsetTop;
      film.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
    } else {
      const c = -r.top;
      t = 1 - (1 - V(c / bl.G, 0, 1)) ** 3;
      const k = L(1, bl.cover, t);
      const cy = H / 2, sx = innerWidth / 2 - (bl.w0 * k) / 2 - film.offsetLeft, sy = L(film.offsetTop, cy - (bl.h0 * k) / 2, t) - film.offsetTop;
      film.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) scale(${k.toFixed(4)})`;
      stage.style.setProperty("--k", t.toFixed(3));
    }
    const fr = film.getBoundingClientRect();
    const cover = (Math.max(0, Math.min(fr.right, W) - Math.max(fr.left, 0)) * Math.max(0, Math.min(fr.bottom, H) - Math.max(fr.top, 0))) / (W * H);
    // On narrow screens the header row is pulled up while the video covers the screen (original is-cinema condition)
    if (!wide) root.classList.toggle("is-cinema", -r.top >= 0 && cover > 0.1 && r.bottom > H * 0.5);
    return cover;
  };
  // When the header line, rail and dots sit fully on the video, they turn to light text
  const filmParts = () => [$(".gs-top__role"), ...$$(".gs-top__nav > *"), $(".gs-rail"), period];
  const onFilm = () => {
    // The narrow-screen header sits on a paper background, so the original doesn’t switch to light text either
    if (!wide) return;
    const fr = film?.getBoundingClientRect();
    const inside = (b) => fr && GS.filmCover > 0.3 && b.left >= fr.left + 2 && b.right <= fr.right - 2 && b.top >= fr.top + 2 && b.bottom <= fr.bottom - 2;
    filmParts().forEach((el) => el.classList.toggle("on-film", inside(el.getBoundingClientRect())));
  };

  // ── Every frame: progress → ticks · signal dots · weight · blur ──
  const dot = { x: 0, y: 0, s: 0 }, pull = { x: 0, y: 0, s: 0, w: 0 };
  let vel = 0, weight = base(), shown = Math.round(weight), skip = 0, lastPos = 0;
  const tick = () => {
    const lim = Math.max(1, GS.limit()), pos = GS.pos(), n = V(pos / lim, 0, 1);
    if (Math.abs(pos - lastPos) > lim / 2) { skip = 4; vel = 0; }
    lastPos = pos;
    const ratio = gsap.ticker.deltaRatio(), k = (b) => 1 - (1 - b) ** ratio;
    // On narrow screens, touching the hero copy resets to the start (wide screens use Lenis infinite)
    if (!wide && !root.classList.contains("is-loading") && scrollY >= Math.min(clone.offsetTop, root.scrollHeight - innerHeight) - 1) scrollTo(0, Math.max(0, scrollY - clone.offsetTop));
    const raw = skip > 0 ? (skip--, 0) : Math.abs(lenis.velocity || 0) / Math.max(0.25, ratio);
    vel = L(vel, raw, k(0.12));
    const b = base(), goal = reduce ? b : V(b - vel * 9, Math.max(300, b - 420), b);
    weight = L(weight, goal, k(0.14));
    if (Math.round(weight) !== shown) { shown = Math.round(weight); wms.forEach((w) => w.style.setProperty("--vw8", String(shown))); }
    GS.filmCover = runBleed();
    marks.forEach((m) => m.el.classList.toggle("is-on", n >= m.at - 0.002 && n < m.end - 0.002));
    // Signal dot: progress spot on the rail ↔ wordmark dot of the nearest Hero (or its copy)
    const rl = railLine.getBoundingClientRect();
    const railPt = { x: rl.left + n * rl.width, y: rl.top + 0.5, s: 9 };
    const hr = hero.getBoundingClientRect(), cr = clone.getBoundingClientRect();
    const useClone = wide ? Math.abs(cr.left) < Math.abs(hr.left) : Math.abs(cr.top) < Math.abs(hr.top);
    const near = useClone ? cr : hr, wd = (useClone ? dotClone : dotHero).getBoundingClientRect();
    const away = wide ? Math.abs(near.left) / innerWidth : Math.abs(near.top) / innerHeight;
    let f = 1 - V(away / 0.35, 0, 1); f = f * f * (3 - 2 * f);
    dot.x = L(railPt.x, wd.left + wd.width / 2, f); dot.y = L(railPt.y, wd.top + wd.height / 2, f); dot.s = L(railPt.s, wd.width, f);
    if (pull.w > 0) { dot.x = L(dot.x, pull.x, pull.w); dot.y = L(dot.y, pull.y, pull.w); dot.s = L(dot.s, pull.s, pull.w); }
    period.style.transform = `translate3d(${dot.x.toFixed(2)}px, ${dot.y.toFixed(2)}px, 0)`;
    period.style.setProperty("--ps", `${dot.s.toFixed(2)}px`);
    onFilm();
    const role = (() => { const a = Math.min(Math.abs(hr[wide ? "left" : "top"]), Math.abs(cr[wide ? "left" : "top"])) / (wide ? innerWidth : innerHeight); return Math.max(0, 1 - a / 0.35); })();
    $(".gs-top").style.setProperty("--role", role.toFixed(3));
    GS.at = panels.findIndex((p) => { const r = p.getBoundingClientRect(); return wide ? r.left <= innerWidth / 2 && r.right > innerWidth / 2 : r.top <= innerHeight / 2 && r.bottom > innerHeight / 2; });
  };
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => { lenis.raf(t * 1000); tick(); });

  const layout = () => { fit(); sizeBleed(); placeTicks(); };
  let rt = 0, lastW = innerWidth;
  addEventListener("resize", () => { if (!wide && innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(layout, 120); });

  // ── Pen tool loader: anchor → line → second anchor and handles → text from below → line and anchors cleared → photo develop strength 0→1 ──
  const intro = async () => {
    const t0 = performance.now();
    await document.fonts.load(`${base()} 100px Geist`).catch(() => {});
    layout();
    splits();
    root.classList.add("is-ready");
    document.dispatchEvent(new CustomEvent("fx:develop-strength", { detail: 0 }));
    const chars = $$(".gs-wm--hero .ch");
    gsap.set(chars, { yPercent: 104 });
    const line = $(".gs-loader__line"), [a0, a1] = $$(".gs-loader__anchor"), handle = $(".gs-loader__handle");
    const wr = heroWm.getBoundingClientRect(), dr = dotHero.getBoundingClientRect();
    // The dot flies from the line end (wordmark left + dot radius) to the center of the dot slot — height is also the dot center so it does not jump back when clearing
    const baseY = dr.bottom - 1, left = wr.left, mid = dr.left + dr.width / 2, from = left + dr.width / 2, midY = dr.top + dr.height / 2;
    Object.assign(line.style, { left: `${left}px`, top: `${baseY}px`, width: `${mid - left}px` });
    Object.assign(a0.style, { left: `${left}px`, top: `${baseY + 0.5}px` });
    Object.assign(a1.style, { left: `${mid}px`, top: `${baseY + 0.5}px` });
    Object.assign(handle.style, { left: `${mid}px`, top: `${baseY + 0.5}px` });
    gsap.to(a0, { scale: 1, duration: 0.35, ease: "back.out(3)" });
    gsap.set(line, { scaleX: 0 });
    const g = { p: 0 };
    const draw = () => { gsap.set(line, { scaleX: g.p }); pull.x = L(from, mid, g.p); };
    Object.assign(pull, { x: from, y: midY, s: 0, w: 1 });
    gsap.to(pull, { s: dr.width, duration: 0.5, ease: "back.out(2.2)" });
    let first = true;
    try { first = !sessionStorage.getItem("gs.seen"); sessionStorage.setItem("gs.seen", "1"); } catch {}
    // In the original the counter for loading steps [0,.22,.58,.84,1] is already at the last step on the first call, so while waiting the line is drawn to .9 (and the signal dot flies that far),
    // Once the first video can play or 1.8s is reached, it waits only until the minimum of 1.1s on a first visit and .4s on a return visit — the copy has no video to wait for, so it goes straight to that minimum time
    gsap.to(g, { p: 0.9, duration: 0.9, ease: "power3.inOut", overwrite: true, onUpdate: draw });
    await new Promise((r) => setTimeout(r, Math.max(0, (first ? 1100 : 400) - (performance.now() - t0))));
    root.classList.add("reveal");
    watch();
    const strength = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { root.classList.remove("is-loading"); root.classList.add("is-settled"); lenis.start(); GS.ready = true; off(); } });
    tl.to(g, { p: 1, duration: 0.5, ease: "power3.out", overwrite: true, onUpdate: draw })
      .to(a1, { scale: 1, duration: 0.3, ease: "back.out(3)" }, "-=0.12")
      .to(handle, { scaleX: 1, duration: 0.38, ease: "expo.out" }, "<0.06")
      .to({}, { duration: 0.18 })
      .to(chars, { yPercent: 0, duration: 1.05, stagger: 0.06, ease: "expo.out" })
      .fromTo($$(".gs-wm--hero .ch-m"), { clipPath: "inset(-0.2em -0.1em 0.26em -0.1em)" }, { clipPath: "inset(-0.2em -0.1em 0em -0.1em)", duration: 0.22, stagger: 0.06, ease: "power2.out" }, "<0.39")
      .to(handle, { scaleX: 0, duration: 0.4, ease: "expo.in" }, "<0.01")
      .to(line, { scaleX: 0, transformOrigin: "right center", duration: 0.7, ease: "expo.inOut" }, "-=0.55")
      .to([a0, a1], { scale: 0, duration: 0.3, ease: "power2.in", stagger: 0.12 }, "<")
      .add(() => { root.classList.add("is-arrived"); hero.classList.add("is-in"); }, "-=0.3")
      .to(pull, { w: 0, duration: 0.01 })
      .add(() => gsap.to(strength, { v: 1, duration: 1.2, ease: "power2.out", onUpdate: () => document.dispatchEvent(new CustomEvent("fx:develop-strength", { detail: strength.v })) }))
      .set(".gs-loader", { display: "none" });
    tl.timeScale(first ? 1.2 : 1.8);
    const fast = () => tl.timeScale(5);
    const off = () => ["wheel", "pointerdown", "keydown", "touchstart"].forEach((ev) => removeEventListener(ev, fast));
    ["wheel", "pointerdown", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, fast, { passive: true }));
    if (reduce) tl.progress(1);
    let at = null;
    try { at = sessionStorage.getItem("gs.at"); sessionStorage.removeItem("gs.at"); } catch {}
    if (at && +at > 0 && panels[+at]) { tl.progress(1); GS.scrollToEl(panels[+at], { immediate: true, force: true }); }
  };
  intro();
})();
